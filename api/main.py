from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # <--- IMPORTANTE: Importar esto
from sqlalchemy.orm import Session
from typing import List, Dict

from database import engine, SessionLocal, Base
import models
import schemas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart-Expense API")

# Esto permite que tu App móvil (o web) hable con el servidor sin bloqueos de seguridad.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir a CUALQUIER origen conectarse (ok para desarrollo)
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los headers
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root() -> Dict[str, str]:
    return {"message": "Smart-Expense API is running"}

@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok"}

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