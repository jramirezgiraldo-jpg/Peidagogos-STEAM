import io

with io.open('app.js', 'a', encoding='utf-8') as f:
    f.write('''

// --- FUNCIONES INTERACTIVAS MEGA GUIA ---

window.evaluarSaberesPrevios = function() {
    let allAnswered = true;
    let puntaje = 0;
    const numPreguntas = window.guideDataCache.saberes_previos.length;

    for (let i = 0; i < numPreguntas; i++) {
        const radios = document.getElementsByName('saber_' + i);
        let answered = false;
        radios.forEach(r => {
            if (r.checked) {
                answered = true;
                if (r.value === r.getAttribute('data-correct')) puntaje++;
            }
        });
        if (!answered) allAnswered = false;
    }

    if (!allAnswered) {
        alert("Por favor responde todas las preguntas para desbloquear el resto de la misión.");
        return;
    }

    alert(`¡Has respondido los saberes previos! Acertaste ${puntaje} de ${numPreguntas}.`);
    
    // Desbloquear el resto de la guía
    document.getElementById('saberes-previos-container').style.opacity = '0.5';
    document.getElementById('saberes-previos-container').style.pointerEvents = 'none';
    const rest = document.getElementById('rest-of-guide-container');
    rest.style.display = 'block';
    setTimeout(() => { rest.style.opacity = '1'; }, 100);

    // TODO: Lanzar el HUEVO DE RECOMPENSA aquí (Fase 4)
};
''')
