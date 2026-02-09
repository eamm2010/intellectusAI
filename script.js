const form = document.getElementById("quizForm");
const loading = document.getElementById("loading");
const resultado = document.getElementById("resultado");
const link = document.getElementById("downloadLink");
const errorDiv = document.getElementById("error");
const warning = document.getElementById("warning");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tipo = document.getElementById("tipo").value;
    const formato = document.getElementById("formato").value;

    // Reset warnings
    warning.classList.add("hidden");

    // Validación clave
    if (formato === "kahoot" && tipo !== "multiple") {
        warning.classList.remove("hidden");
        return; // corta todo
    }

    loading.classList.remove("hidden");
    resultado.classList.add("hidden");
    errorDiv.classList.add("hidden");

    const formData = new FormData();
    formData.append("grado", grado.value);
    formData.append("tema", tema.value);
    formData.append("cantidad", cantidad.value);
    formData.append("tipo", tipo);
    formData.append("formato", formato);

    try {
        const res = await fetch("/generar", {
            method: "POST",
            body: formData
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        link.href = url;
        link.download = formato === "kahoot"
            ? "quiz.xlsx"
            : "prueba.docx";

        resultado.classList.remove("hidden");
    } catch {
        errorDiv.classList.remove("hidden");
    } finally {
        loading.classList.add("hidden");
    }
});

const tipoSelect = document.getElementById("tipo");
const formatoSelect = document.getElementById("formato");

formatoSelect.addEventListener("change", () => {
    if (formatoSelect.value === "kahoot") {
        // Forzar opción múltiple
        tipoSelect.value = "multiple";

        // Deshabilitar las otras
        tipoSelect.querySelector('option[value="vf"]').disabled = true;
        tipoSelect.querySelector('option[value="abiertas"]').disabled = true;
    } else {
        // Habilitar todo otra vez
        tipoSelect.querySelector('option[value="vf"]').disabled = false;
        tipoSelect.querySelector('option[value="abiertas"]').disabled = false;
    }
});
