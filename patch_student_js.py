import io

with io.open('app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# Replace the alert in the button
js_code = js_code.replace(
    '''onclick="alert('Abriendo aula de ${asig}...')">Entrar al Aula</button>''',
    '''onclick="abrirAsignaturaEstudiante('${asig}')">Entrar al Aula</button>'''
)

# Append the new functions
new_functions = """
// ==========================================
// LÓGICA DEL PANEL ESTUDIANTE (GAMIFICACIÓN)
// ==========================================

window.abrirAsignaturaEstudiante = function(asig) {
    const mainContent = document.getElementById("student-main-content");
    const subjectView = document.getElementById("student-subject-view-container");
    const subjectTitle = document.getElementById("student-subject-title");
    const questContainer = document.getElementById("student-quest-container");
    const guideContent = document.getElementById("student-guide-content");
    
    if (mainContent && subjectView) {
        mainContent.style.display = "none";
        subjectView.style.display = "block";
    }
    
    if (subjectTitle) {
        subjectTitle.innerText = "Aula de " + asig;
    }
    
    // Reset questionnaire
    document.getElementById("student-select-periodo").value = "1";
    document.getElementById("student-select-semana").value = "1";
    document.getElementById("student-quest-rol").value = "";
    document.getElementById("student-quest-ambiente").value = "";
    document.getElementById("student-quest-nivel").value = "";
    document.getElementById("student-quest-enfoque").value = "";
    
    // Show questionnaire, hide guide
    if (questContainer) questContainer.style.display = "block";
    if (guideContent) guideContent.style.display = "none";
};

window.volverAlGridEstudiante = function() {
    const mainContent = document.getElementById("student-main-content");
    const subjectView = document.getElementById("student-subject-view-container");
    
    if (mainContent && subjectView) {
        mainContent.style.display = "block";
        subjectView.style.display = "none";
    }
};

window.ingresarAGuia = function() {
    const rol = document.getElementById("student-quest-rol").value;
    const ambiente = document.getElementById("student-quest-ambiente").value;
    const nivel = document.getElementById("student-quest-nivel").value;
    const enfoque = document.getElementById("student-quest-enfoque").value;
    
    if (!rol || !ambiente || !nivel || !enfoque) {
        alert("¡Por favor completa todos los menús para personalizar tu aventura!");
        return;
    }
    
    const periodo = document.getElementById("student-select-periodo").value;
    const semana = document.getElementById("student-select-semana").value;
    
    const questContainer = document.getElementById("student-quest-container");
    const guideContent = document.getElementById("student-guide-content");
    const innerContent = document.getElementById("student-guide-inner-content");
    
    if (questContainer) questContainer.style.display = "none";
    if (guideContent) guideContent.style.display = "block";
    
    if (innerContent) {
        innerContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #1D4ED8; font-weight: 800; font-size: 1.5rem;">🎮 Misión Inicializada</h3>
                <p style="color: #6B7280;">Periodo ${periodo} - Semana ${semana}</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px;">
                <h4 style="color: #111827; font-weight: bold; margin-bottom: 15px;">Parámetros de tu Aventura:</h4>
                <ul style="list-style-type: none; padding: 0; color: #374151; font-weight: 500;">
                    <li style="margin-bottom: 8px;">👤 <strong style="color: #1E3A8A;">Rol:</strong> ${document.getElementById("student-quest-rol").options[document.getElementById("student-quest-rol").selectedIndex].text}</li>
                    <li style="margin-bottom: 8px;">🌍 <strong style="color: #10B981;">Ambiente:</strong> ${document.getElementById("student-quest-ambiente").options[document.getElementById("student-quest-ambiente").selectedIndex].text}</li>
                    <li style="margin-bottom: 8px;">⚔️ <strong style="color: #F59E0B;">Nivel:</strong> ${document.getElementById("student-quest-nivel").options[document.getElementById("student-quest-nivel").selectedIndex].text}</li>
                    <li style="margin-bottom: 8px;">🎯 <strong style="color: #EC4899;">Enfoque:</strong> ${document.getElementById("student-quest-enfoque").options[document.getElementById("student-quest-enfoque").selectedIndex].text}</li>
                </ul>
            </div>
            <div style="padding: 20px; background: #FFFBEB; border: 1px dashed #F59E0B; border-radius: 8px; text-align: center; color: #92400E; font-weight: 600;">
                <p>Aquí se cargará el contenido gamificado de la guía de estudio según la configuración elegida.</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">(Desarrollo en progreso)</p>
            </div>
        `;
    }
};

window.cerrarGuia = function() {
    volverAlGridEstudiante();
};
"""

js_code += "\n" + new_functions

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)
