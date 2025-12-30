from fastapi import FastAPI
from typing import Dict
from database import engine, Base
import models

# --- INFRAESTRUCTURA ---
# Esto crea las tablas en la base de datos automáticamente al iniciar
# si no existen previamente.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart-Expense API")

@app.get("/")
def read_root() -> Dict[str, str]:
    return {"message": "Smart-Expense API is running"}

@app.get("/health")
def health_check() -> Dict[str, str]:
    return {"status": "ok"}