import io
import re

with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Add aplicarRestriccionesProgreso function
progreso_fn = '''window.aplicarRestriccionesProgreso = function() {
    const periodo = document.getElementById("student-select-periodo").value;
    const subjectTitle = document.getElementById('student-subject-title');
    if (!subjectTitle) return;
    const asignatura = subjectTitle.innerText.replace('Aula de ', '').trim();
    
    const key = `prog_${window.usuario_actual || 'default'}_${asignatura}_p${periodo}`;
    let maxSemanaUnlocked = parseInt(localStorage.getItem(key)) || 1;
    
    const selectSemana = document.getElementById("student-select-semana");
    if (!selectSemana) return;
    
    Array.from(selectSemana.options).forEach((opt) => {
        const num = parseInt(opt.value);
        if (num > maxSemanaUnlocked) {
            opt.disabled = true;
            opt.text = `Semana ${num} (Bloqueada 🔒)`;
        } else {
            opt.disabled = false;
            opt.text = `Semana ${num}`;
        }
    });
    
    // Si la seleccionada actualmente está bloqueada, volver a la maxima permitida
    if (parseInt(selectSemana.value) > maxSemanaUnlocked) {
        selectSemana.value = maxSemanaUnlocked;
    }
};

window.completarMisionActual = function() {
    const periodo = document.getElementById("student-select-periodo").value;
    const semanaStr = document.getElementById("student-select-semana").value;
    const subjectTitle = document.getElementById('student-subject-title');
    if (!subjectTitle) return;
    const asignatura = subjectTitle.innerText.replace('Aula de ', '').trim();
    
    const key = `prog_${window.usuario_actual || 'default'}_${asignatura}_p${periodo}`;
    let maxSemanaUnlocked = parseInt(localStorage.getItem(key)) || 1;
    let semanaActual = parseInt(semanaStr);
    
    if (semanaActual === maxSemanaUnlocked) {
        if (maxSemanaUnlocked < 8) {
            localStorage.setItem(key, maxSemanaUnlocked + 1);
            alert("¡Felicidades! Has completado esta misión y desbloqueado la siguiente semana.");
        } else {
            alert("¡Increíble! Has completado todas las misiones de este periodo.");
        }
    } else {
        alert("¡Misión repasada con éxito!");
    }
    
    cerrarGuia();
};
'''

if 'window.aplicarRestriccionesProgreso =' not in js:
    # Insert it before window.actualizarPlaneacionEstudiante
    js = js.replace('window.actualizarPlaneacionEstudiante = function() {', progreso_fn + '\nwindow.actualizarPlaneacionEstudiante = function() {\n    aplicarRestriccionesProgreso();')
else:
    # If already exists, just make sure actualizarPlaneacionEstudiante calls it
    pass

# 2. Add 'aplicarRestriccionesProgreso();' inside abrirAsignaturaEstudiante
old_abrir = '''    // Show questionnaire, hide guide
    if (questContainer) questContainer.style.display = "block";
    if (guideContent) guideContent.style.display = "none";
    
    actualizarPlaneacionEstudiante();
};'''

new_abrir = '''    // Show questionnaire, hide guide
    if (questContainer) questContainer.style.display = "block";
    if (guideContent) guideContent.style.display = "none";
    
    aplicarRestriccionesProgreso();
    actualizarPlaneacionEstudiante();
};'''

if old_abrir in js:
    js = js.replace(old_abrir, new_abrir)

# 3. Update HTML inside ingresarAGuia to add the "Completar Misión" button
old_guide_html = '''        innerContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #1D4ED8; font-weight: 800; font-size: 1.5rem;">🎮 Tu Misión</h3>
                <p style="color: #6B7280;">Periodo ${periodo} - Semana ${semanaStr} | ${asignatura}</p>
            </div>
            <div class="markdown-body" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #E5E7EB;">
                ${htmlGenerado}
            </div>
        `;'''

new_guide_html = '''        innerContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #1D4ED8; font-weight: 800; font-size: 1.5rem;">🎮 Tu Misión</h3>
                <p style="color: #6B7280;">Periodo ${periodo} - Semana ${semanaStr} | ${asignatura}</p>
            </div>
            <div class="markdown-body" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #E5E7EB;">
                ${htmlGenerado}
            </div>
            <div style="text-align: center; margin-top: 30px; padding-bottom: 20px;">
                <button onclick="completarMisionActual()" style="background: #10B981; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: transform 0.2s;">✅ Completar Misión</button>
            </div>
        `;'''

if old_guide_html in js:
    js = js.replace(old_guide_html, new_guide_html)


# 4. Modify cerrarGuia to go back to quest container and apply restrictions
old_cerrar = '''window.cerrarGuia = function() {
    volverAlGridEstudiante();
};'''

new_cerrar = '''window.cerrarGuia = function() {
    const questContainer = document.getElementById("student-quest-container");
    const guideContent = document.getElementById("student-guide-content");
    if (questContainer) questContainer.style.display = "block";
    if (guideContent) guideContent.style.display = "none";
    aplicarRestriccionesProgreso();
    actualizarPlaneacionEstudiante();
};'''

if old_cerrar in js:
    js = js.replace(old_cerrar, new_cerrar)


with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
