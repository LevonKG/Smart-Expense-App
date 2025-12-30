from fastapi import FastAPI
from typing import Dict

app = FastAPI(title="Smart-Expense API")

@app.get("/")
def read_root() -> Dict[str, str]:
    """Endpoint raíz para verificar conectividad."""
    return {"message": "Smart-Expense API is running"}

@app.get("/health")
def health_check() -> Dict[str, str]:
    """
    Health check esencial para orquestadores como Cloud Run.
    Devuelve estado 200 OK si el servicio está vivo.
    """
    return {"status": "ok"}