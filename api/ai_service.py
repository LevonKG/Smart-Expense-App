from google import genai
from google.genai import types
import os
import json
from dotenv import load_dotenv

load_dotenv()

def analyze_expense_text(text: str):
    """
    Usa el SDK moderno de Google (google-genai) para estructurar datos.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"amount": 0.0, "category": "Error", "description": "Falta API Key"}

    client = genai.Client(api_key=api_key)

    prompt = f"""
    Analiza este gasto: "{text}"
    
    Instrucciones:
    1. Extrae amount (número), category (string) y description (string).
    2. Categorías permitidas sugeridas: Comida, Transporte, Ocio, Hogar, Supermercado, Otros.
    3. Si la divisa no está clara, asume que es la moneda local.
    """

    try:
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema={
                    "type": "OBJECT",
                    "properties": {
                        "amount": {"type": "NUMBER"},
                        "category": {"type": "STRING"},
                        "description": {"type": "STRING"}
                    },
                    "required": ["amount", "category", "description"]
                }
            )
        )
        
        return json.loads(response.text)

    except Exception as e:
        print(f"❌ Error en IA: {e}")
        return {"amount": 0.0, "category": "Error", "description": "Fallo al procesar con IA"}

# Bloque de prueba
if __name__ == "__main__":
    prueba = "Me gasté 12.50 en el mcdonalds"
    print(f"Probando con: {prueba}")
    resultado = analyze_expense_text(prueba)
    print("Resultado IA:", resultado)