import os
from openai import OpenAI
import pandas as pd
import json
from docx import Document

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generar_quiz(tema, grado, cantidad, tipo, formato):
    if formato == "kahoot":
        return generar_excel(tema, grado, cantidad)
    else:
        return generar_word(tema, grado, cantidad, tipo)


def generar_excel(tema, grado, cantidad):
    prompt = f"""
Crea {cantidad} preguntas de opción múltiple para estudiantes de {grado}.
Tema: {tema}

Devuelve SOLO JSON:
[
  {{
    "pregunta": "",
    "A": "",
    "B": "",
    "C": "",
    "D": "",
    "correcta": "A"
  }}
]
"""

    response = client.responses.create(
        model="gpt-4.1",
        input=prompt
    )

    texto = response.output_text.strip()
    texto = texto.replace("```json", "").replace("```", "")
    preguntas = json.loads(texto)

    letra = {"A": 1, "B": 2, "C": 3, "D": 4}

    df = pd.DataFrame({
        "Question": [p["pregunta"] for p in preguntas],
        "Answer 1": [p["A"] for p in preguntas],
        "Answer 2": [p["B"] for p in preguntas],
        "Answer 3": [p["C"] for p in preguntas],
        "Answer 4": [p["D"] for p in preguntas],
        "Time Limit": [0 for _ in preguntas],
        "Correct answer": [letra[p["correcta"]] for p in preguntas]
    })

    archivo = "quiz_kahoot.xlsx"
    df.to_excel(archivo, index=False)
    return archivo


def generar_word(tema, grado, cantidad, tipo):
    prompt = f"""
Crea una prueba escrita para estudiantes de {grado}.
Tema: {tema}
Cantidad de preguntas: {cantidad}
Tipo de preguntas: {tipo}

Incluye:
- Título
- Instrucciones, incluye en ellas que debe poner sus respuestas y procedimiento en papel aparte.(solo si aplica)
- Preguntas numeradas
"""

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    texto = response.output_text

    doc = Document()
    for linea in texto.split("\n"):
        doc.add_paragraph(linea)

    archivo = "prueba.docx"
    doc.save(archivo)
    return archivo
