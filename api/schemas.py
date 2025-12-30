from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ExpenseBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    receipt_url: Optional[str] = None

# Lo que esperamos recibir al CREAR (Input)
class ExpenseCreate(ExpenseBase):
    # Por ahora pedimos el user_id manualmente para probar.
    # En la Fase 2, esto lo extraeremos automáticamente del token de seguridad.
    user_id: str 

# Lo que devolvemos al usuario (Output) -> Incluye el ID y la Fecha
class ExpenseResponse(ExpenseBase):
    id: int
    user_id: str
    date: datetime

    class Config:
        # Esto permite a Pydantic leer datos directamente del modelo de SQLAlchemy
        from_attributes = True