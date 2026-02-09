from fastapi import FastAPI, Form, Request
from fastapi.responses import FileResponse
from fastapi.templating import Jinja2Templates
from quiz_generator import generar_quiz
from fastapi.staticfiles import StaticFiles

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
    archivo = generar_quiz(tema, grado, cantidad, tipo, formato)

    if archivo:
        return FileResponse(
            archivo,
            filename=archivo,
            media_type="application/octet-stream"
        )

    return {"error": "No se pudo generar el quiz"}
