import io

# PATCH LOGIN.HTML
with io.open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the selects to add onchange
html = html.replace(
    '''<select id="student-select-periodo" style="padding: 10px; border-radius: 8px; border: 1px solid #D1D5DB; font-weight: bold;">''',
    '''<select id="student-select-periodo" style="padding: 10px; border-radius: 8px; border: 1px solid #D1D5DB; font-weight: bold;" onchange="actualizarPlaneacionEstudiante()">'''
)

html = html.replace(
    '''<select id="student-select-semana" style="padding: 10px; border-radius: 8px; border: 1px solid #D1D5DB; font-weight: bold;">''',
    '''<select id="student-select-semana" style="padding: 10px; border-radius: 8px; border: 1px solid #D1D5DB; font-weight: bold;" onchange="actualizarPlaneacionEstudiante()">'''
)

# Insert the display container right after the dropdowns div
target_div_end = '''                        </div>
                    </div>'''
replacement = '''                        </div>
                    </div>
                    
                    <div id="student-planeacion-contenido" style="background: #F9FAFB; padding: 15px; border-radius: 8px; border-left: 4px solid #3B82F6; margin-bottom: 30px; display: none;">
                        <!-- Contenido inyectado por JS -->
                    </div>'''

html = html.replace(target_div_end, replacement, 1)

with io.open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)

# PATCH APP.JS
with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Add logic to JS
new_js = """
window.gradoActualEstudiante = null; // Guardar el grado del estudiante

window.actualizarPlaneacionEstudiante = function() {
    const contenido = document.getElementById('student-planeacion-contenido');
    if (!contenido || !window.gradoActualEstudiante) return;

    const gradoNum = window.gradoActualEstudiante.replace(/[^0-9]/g, '');
    const dataGrado = window.mallaFisica ? window.mallaFisica[gradoNum] : null;

    if (!dataGrado) {
        contenido.innerHTML = '<p style="color: #6B7280; font-style: italic; margin: 0;">Planeación en construcción para esta área. (Solo Física disponible por el momento).</p>';
        contenido.style.display = 'block';
        return;
    }

    const periodo = document.getElementById('student-select-periodo').value;
    const semanaStr = document.getElementById('student-select-semana').value;
    const semanaNum = parseInt(semanaStr, 10);
    
    // Mapear semana 1-8 al bloque de temas '1', '3', '5', '7'
    let indexTema = '1';
    if (semanaNum >= 3 && semanaNum <= 4) indexTema = '3';
    else if (semanaNum >= 5 && semanaNum <= 6) indexTema = '5';
    else if (semanaNum >= 7 && semanaNum <= 8) indexTema = '7';

    const objetivo = dataGrado.objetivo;
    const tema = dataGrado.periodos[periodo] ? dataGrado.periodos[periodo][indexTema] : 'Sin tema definido';

    contenido.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Meta de Comprensión del Año:</strong>
            <p style="margin: 4px 0 0 0; color: #374151; font-size: 0.9rem;">${objetivo}</p>
        </div>
        <div>
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Tópico Generativo (Periodo ${periodo}, Semana ${semanaNum}):</strong>
            <p style="margin: 4px 0 0 0; color: #111827; font-weight: bold; font-size: 1rem;">${tema}</p>
        </div>
    `;
    contenido.style.display = 'block';
};
"""

# Modify abrirAsignaturaEstudiante to call this and store grade
js = js.replace(
    '''window.abrirAsignaturaEstudiante = function(asig) {''',
    '''window.abrirAsignaturaEstudiante = function(asig, grado) {
    window.gradoActualEstudiante = grado;'''
)

js = js.replace(
    '''// Show questionnaire, hide guide
    if (questContainer) questContainer.style.display = "block";
    if (guideContent) guideContent.style.display = "none";''',
    '''// Show questionnaire, hide guide
    if (questContainer) questContainer.style.display = "block";
    if (guideContent) guideContent.style.display = "none";
    
    actualizarPlaneacionEstudiante();'''
)

# And in the render loop, pass data.grado
js = js.replace(
    '''onclick="abrirAsignaturaEstudiante('${asig}')"''',
    '''onclick="abrirAsignaturaEstudiante('${asig}', '${data.grado || ''}')"'''
)

with io.open('app.js', 'a', encoding='utf-8') as f:
    f.write(new_js)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
