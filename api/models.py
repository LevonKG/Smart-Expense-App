from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class Expense(Base):
    """
    Modelo de Base de Datos para la tabla 'expenses'.
    Hereda de Base (definido en database.py) para que SQLAlchemy sepa gestionarlo.
    """
    __tablename__ = "expenses"

    # Identificador único del gasto (autoincremental)
    id = Column(Integer, primary_key=True, index=True)
    
    # ID del usuario (vendrá de Firebase/Supabase Auth más adelante)
    user_id = Column(String, index=True, nullable=False)
    
    # Datos financieros
    amount = Column(Float, nullable=False)  # Total del ticket
    category = Column(String, nullable=False) # Ej: "Comida", "Transporte"
    description = Column(String, nullable=True) # Nombre del comercio o notas
    
    # URL de la foto del ticket 
    receipt_url = Column(String, nullable=True)
    
    # Fecha de creación (se pone automática si no se especifica)
    date = Column(DateTime(timezone=True), server_default=func.now())