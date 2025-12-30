from google import genai
import os
from dotenv import load_dotenv

# Cargar entorno
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Error: No se encontró la GEMINI_API_KEY en el .env")
else:
    print(f"🔑 Usando API Key: {api_key[:5]}...*****")
    try:
        client = genai.Client(api_key=api_key)
        print("\n📡 Consultando a Google qué modelos tienes disponibles...")
        
        # Listamos los modelos
        for model in client.models.list():
            # Filtramos solo los que sirven para generar texto (generateContent)
            if "generateContent" in model.supported_actions:
                print(f"✅ Disponible: {model.name}")
                
    except Exception as e:
        print(f"\n❌ Error fatal conectando: {e}")