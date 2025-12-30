from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict

from database import engine, SessionLocal, Base
import models
import schemas
import ai_service

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart-Expense API")

# --- CONFIGURACIÓN DE CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DEPENDENCIA DB ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ENDPOINTS ---

@app.get("/")
def read_root() -> Dict[str, str]:
    return {"message": "Smart-Expense API is running"}

@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok"}

@app.post("/analyze/")
def analyze_expense(raw_text: Dict[str, str]):
    """
    Recibe {"text": "..."} y devuelve los datos extraídos por Gemini.
    """
    text = raw_text.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Texto vacío")
    
    print(f"📩 Recibido para IA: {text}")
    
    try:
        # Llamamos al servicio de IA
        data = ai_service.analyze_expense_text(text)
        print(f"🤖 Respuesta IA: {data}")
        return data
    except Exception as e:
        print(f"❌ Error interno IA: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/expenses/", response_model=schemas.ExpenseResponse)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    db_expense = models.Expense(
        amount=expense.amount,
        category=expense.category,
        description=expense.description,
        user_id=expense.user_id,
        receipt_url=expense.receipt_url
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@app.get("/expenses/", response_model=List[schemas.ExpenseResponse])
def read_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    expenses = db.query(models.Expense).offset(skip).limit(limit).all()
    return expenses