import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No se encontró la variable DATABASE_URL en el archivo .env")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def test_connection():
    try:
        with engine.connect() as connection:
            print("✅ ¡Conexión exitosa a Supabase (PostgreSQL)!")
    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {e}")

if __name__ == "__main__":
    test_connection()