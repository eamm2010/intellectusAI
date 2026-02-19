from fastapi import FastAPI, Form, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from quiz_generator import generar_quiz
import os

app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/generar")
def generar(
    request: Request,
    grado: str = Form(...),
    tema: str = Form(...),
    cantidad: int = Form(...),
    tipo: str = Form(...),
    formato: str = Form(...)
):
    # Normaliza
    grado_norm = (grado or "").strip().lower()
    tipo_norm = (tipo or "").strip().lower()
    formato_norm = (formato or "").strip().lower()

    # Reglas server-side (Kahoot solo multiple)
    if formato_norm == "kahoot" and tipo_norm != "multiple":
        return JSONResponse(
            status_code=400,
            content={"error": "En Excel/Kahoot solo está disponible Opción múltiple."}
        )

    # Reglas server-side (College Board fuerza Word + tipo College Board)
    if grado_norm == "college board":
        formato_norm = "word"
        tipo_norm = "college board"

    # Validación cantidad
    if cantidad < 1 or cantidad > 30:
        return JSONResponse(
            status_code=400,
            content={"error": "Cantidad debe estar entre 1 y 30."}
        )

    try:
        archivo = generar_quiz(tema, grado, cantidad, tipo_norm, formato_norm)
    except Exception as e:
        # Log opcional
        return JSONResponse(
            status_code=500,
            content={"error": f"Error generando el quiz: {str(e)}"}
        )

    if not archivo or not os.path.exists(archivo):
        return JSONResponse(
            status_code=500,
            content={"error": "No se pudo generar el archivo."}
        )

    return FileResponse(
        path=archivo,
        filename=os.path.basename(archivo),
        media_type="application/octet-stream"
    )
