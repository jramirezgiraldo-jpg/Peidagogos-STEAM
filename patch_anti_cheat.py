import io

with io.open('app.js', 'a', encoding='utf-8') as f:
    f.write('''

// --- FASE 2: ANTI-CHEAT Y VALIDACIONES ---

window.verificarEscrituraIA = function(textarea) {
    const val = textarea.value;
    const lastLen = textarea.dataset.lastLen || 0;
    
    // Si la longitud crece en más de 8 caracteres de golpe, es casi imposible escribiendo letra por letra
    if (val.length - lastLen > 8) {
        textarea.dataset.aiFlag = "true";
        textarea.parentElement.querySelector('.ai-warning').style.display = 'block';
        // Bloquear al usuario un par de segundos
        textarea.disabled = true;
        setTimeout(() => {
            textarea.value = "";
            textarea.disabled = false;
            textarea.dataset.lastLen = 0;
            textarea.focus();
        }, 1500);
    } else {
        textarea.dataset.lastLen = val.length;
    }
};

window.validarPreguntasInductivas = function() {
    const textareas = document.querySelectorAll('.anti-cheat-textarea');
    let allFilled = true;
    let anyAI = false;
    
    textareas.forEach(t => {
        if (t.value.trim().length < 10) allFilled = false;
        if (t.dataset.aiFlag === "true") anyAI = true;
    });
    
    if (anyAI) {
        alert("⚠️ No puedes enviar las respuestas. El sistema ha detectado copiado/pegado o IA. Debes reescribir con tus propias palabras.");
        return;
    }
    
    if (!allFilled) {
        alert("Por favor responde a todas las preguntas de análisis con al menos una frase completa.");
        return;
    }
    
    alert("¡Excelente análisis! Tus respuestas han sido enviadas y procesadas.");
    
    textareas.forEach(t => t.disabled = true);
    // TODO: Lanzar el huevo de recompensa aquí (Fase 4)
};

window.validarCuaderno = function() {
    const btn = document.getElementById('btn-cuaderno');
    btn.innerHTML = "✅ Validado correctamente";
    btn.style.background = "#10B981";
    btn.disabled = true;
    alert("¡Fantástico! Trabajar en el cuaderno fortalece tu memoria motriz. Continúa tu aventura.");
    // TODO: Lanzar huevo de recompensa (Fase 4)
};
''')
