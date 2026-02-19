document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quizForm");
  const loading = document.getElementById("loading");
  const resultado = document.getElementById("resultado");
  const link = document.getElementById("downloadLink");
  const errorDiv = document.getElementById("error");
  const warning = document.getElementById("warning");

  const gradoSelect = document.getElementById("grado");
  const temaInput = document.getElementById("tema");
  const cantidadInput = document.getElementById("cantidad");
  const tipoSelect = document.getElementById("tipo");
  const formatoSelect = document.getElementById("formato");

  // Guardar opciones originales de "tipo" para poder restaurarlas
  const originalTipoOptions = Array.from(tipoSelect.options).map((opt) => ({
    value: opt.value,
    text: opt.textContent
  }));

  function setTipoToCollegeBoard() {
    // Evita recrear si ya está bloqueado en modo CB
    if (tipoSelect.disabled && tipoSelect.value === "college board") return;

    tipoSelect.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "college board";
    opt.textContent = "College Board";
    tipoSelect.appendChild(opt);

    tipoSelect.value = "college board";
    tipoSelect.disabled = true;
  }

  function restoreTipoOptions() {
    tipoSelect.innerHTML = "";
    for (const o of originalTipoOptions) {
      const opt = document.createElement("option");
      opt.value = o.value;
      opt.textContent = o.text;
      tipoSelect.appendChild(opt);
    }
    tipoSelect.disabled = false;
  }

  function applyFormatoRules() {
    // Reset warning siempre que cambia algo
    warning.classList.add("hidden");

    // Si tipo está bloqueado (College Board), no tocar opciones
    if (tipoSelect.disabled) return;

    // Kahoot => solo opción múltiple
    if (formatoSelect.value === "kahoot") {
      tipoSelect.value = "multiple";
      Array.from(tipoSelect.options).forEach((opt) => {
        opt.disabled = opt.value !== "multiple";
      });
    } else {
      // Word => habilitar todo
      Array.from(tipoSelect.options).forEach((opt) => (opt.disabled = false));
    }
  }

  function applyGradoRules() {
    // Usa el TEXT visible del option para evitar líos de value/mayúsculas
    const selectedText = (
      gradoSelect.options[gradoSelect.selectedIndex]?.textContent || ""
    )
      .trim()
      .toLowerCase();

    if (selectedText === "college board") {
      // Forzar "tipo = college board" (única opción) y bloquear
      setTipoToCollegeBoard();

      // (Opcional) si quieres forzar Word en College Board, descomenta:
      // formatoSelect.value = "word";

      warning.classList.add("hidden");
    } else {
      // Si salimos de College Board, restaurar opciones normales
      if (tipoSelect.disabled) restoreTipoOptions();
    }

    // Luego aplicar reglas del formato (kahoot/word)
    applyFormatoRules();
  }

  // Listeners
  formatoSelect.addEventListener("change", applyFormatoRules);
  gradoSelect.addEventListener("change", applyGradoRules);

  // Ejecuta al cargar por si ya viene preseleccionado
  applyGradoRules();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tipo = tipoSelect.value;
    const formato = formatoSelect.value;

    // Reset warnings
    warning.classList.add("hidden");

    // Validación: Kahoot solo multiple (si NO está en modo College Board)
    if (formato === "kahoot" && !tipoSelect.disabled && tipo !== "multiple") {
      warning.classList.remove("hidden");
      return;
    }

    loading.classList.remove("hidden");
    resultado.classList.add("hidden");
    errorDiv.classList.add("hidden");

    const formData = new FormData();
    formData.append("grado", gradoSelect.value);
    formData.append("tema", temaInput.value);
    formData.append("cantidad", cantidadInput.value);
    formData.append("tipo", tipo);
    formData.append("formato", formato);

    try {
      const res = await fetch("/generar", {
        method: "POST",
        body: formData
      });

      // Si tu backend devuelve JSON en error, esto evita bajar “basura”
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Request failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      link.href = url;
      link.download = formato === "kahoot" ? "quiz.xlsx" : "prueba.docx";

      resultado.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      errorDiv.classList.remove("hidden");
    } finally {
      loading.classList.add("hidden");
    }
  });
});
