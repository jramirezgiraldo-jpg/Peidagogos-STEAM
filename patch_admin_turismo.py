import io
import re

# PATCH LOGIN.HTML
with io.open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Insert the Asignatura select
target_html = '''                                    <select id="select-planeacion-periodo" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #D1D5DB; font-weight: bold; cursor: pointer;" onchange="actualizarVisualizadorPlaneacion()">'''
replacement_html = '''                                    <select id="select-planeacion-asignatura" style="display: none; padding: 8px 12px; border-radius: 6px; border: 1px solid #D1D5DB; font-weight: bold; cursor: pointer;" onchange="actualizarVisualizadorPlaneacion()">
                                    </select>
                                    <select id="select-planeacion-periodo" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #D1D5DB; font-weight: bold; cursor: pointer;" onchange="actualizarVisualizadorPlaneacion()">'''

if '<select id="select-planeacion-asignatura"' not in html:
    html = html.replace(target_html, replacement_html)

with io.open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)

# PATCH APP.JS
with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Modify mostrarEstudiantesGrupo to populate the select-planeacion-asignatura
# We will just inject it into the function
target_mostrar = '''    window.mostrarEstudiantesGrupo = function(grupo, evt) {
        if (evt) {
            evt.preventDefault();
        }
        document.getElementById("admin-grupos-container").style.display = "none";
        document.getElementById("admin-estudiantes-grupo-container").style.display = "block";
        document.getElementById("admin-titulo-grupo-actual").innerText = "Grupo " + grupo;
        
        // Guardar el grado seleccionado en un campo oculto o variable global para el visualizador de planeación
        let hiddenInput = document.getElementById("select-planeacion-grado");
        if (!hiddenInput) {
            hiddenInput = document.createElement("input");
            hiddenInput.type = "hidden";
            hiddenInput.id = "select-planeacion-grado";
            document.body.appendChild(hiddenInput);
        }
        hiddenInput.value = grupo;'''

replacement_mostrar = '''    window.mostrarEstudiantesGrupo = function(grupo, evt) {
        if (evt) {
            evt.preventDefault();
        }
        document.getElementById("admin-grupos-container").style.display = "none";
        document.getElementById("admin-estudiantes-grupo-container").style.display = "block";
        document.getElementById("admin-titulo-grupo-actual").innerText = "Grupo " + grupo;
        
        // Populate subject select for curriculum
        const asignaturasSelect = document.getElementById('select-planeacion-asignatura');
        if (asignaturasSelect && window.mapaMontenegro && window.mapaMontenegro[grupo]) {
            let materiasArray = window.mapaMontenegro[grupo].split(',').map(s => s.trim());
            asignaturasSelect.innerHTML = '';
            materiasArray.forEach(mat => {
                let opt = document.createElement('option');
                opt.value = mat;
                opt.innerText = mat;
                asignaturasSelect.appendChild(opt);
            });
            asignaturasSelect.style.display = 'inline-block';
        } else if (asignaturasSelect) {
            asignaturasSelect.style.display = 'none';
        }

        // Guardar el grado seleccionado en un campo oculto o variable global para el visualizador de planeación
        let hiddenInput = document.getElementById("select-planeacion-grado");
        if (!hiddenInput) {
            hiddenInput = document.createElement("input");
            hiddenInput.type = "hidden";
            hiddenInput.id = "select-planeacion-grado";
            document.body.appendChild(hiddenInput);
        }
        hiddenInput.value = grupo;'''

if '// Populate subject select for curriculum' not in js:
    js = js.replace(target_mostrar, replacement_mostrar)

# Modify actualizarVisualizadorPlaneacion to read from select-planeacion-asignatura
# we replace the function entirely
nueva_actualizar_admin = """
window.actualizarVisualizadorPlaneacion = function() {
    const selectorGrado = document.getElementById('select-planeacion-grado');
    const selectorAsignatura = document.getElementById('select-planeacion-asignatura');
    const visualizador = document.getElementById('planeacion-visualizador');
    
    if (!selectorGrado || !visualizador) return;

    const gradoSeleccionado = selectorGrado.value;
    
    if (!gradoSeleccionado) {
        visualizador.style.display = 'none';
        return;
    }

    const gradoNum = gradoSeleccionado.replace(/[^0-9PENS]/g, '');
    let asignatura = selectorAsignatura ? selectorAsignatura.value : 'Física';
    
    let malla = null;
    if (asignatura.toLowerCase().includes('física')) {
        malla = window.mallaFisica;
    } else if (asignatura.toLowerCase().includes('turismo')) {
        malla = window.mallaTurismo;
    }

    const dataGrado = malla ? malla[gradoNum] : null;

    if (!dataGrado) {
        visualizador.innerHTML = `<p style="color: #6B7280; font-style: italic; margin: 0;">Planeación en construcción para la materia de ${asignatura} en este grado.</p>`;
        visualizador.style.display = 'block';
        return;
    }

    const periodo = document.getElementById('select-planeacion-periodo').value;
    const semanaStr = document.getElementById('select-planeacion-semana').value;
    const semanaNum = parseInt(semanaStr, 10);
    
    let indexTema = '1';
    if (semanaNum >= 3 && semanaNum <= 4) indexTema = '3';
    else if (semanaNum >= 5 && semanaNum <= 6) indexTema = '5';
    else if (semanaNum >= 7 && semanaNum <= 8) indexTema = '7';

    const objetivo = dataGrado.objetivo;
    const tema = dataGrado.periodos[periodo] ? dataGrado.periodos[periodo][indexTema] : 'Sin tema definido';

    visualizador.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Meta de Comprensión del Año (${asignatura}):</strong>
            <p style="margin: 4px 0 0 0; color: #374151; font-size: 0.9rem;">${objetivo}</p>
        </div>
        <div>
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Tópico Generativo (Periodo ${periodo}, Semana ${semanaNum}):</strong>
            <p style="margin: 4px 0 0 0; color: #111827; font-weight: bold; font-size: 1rem;">${tema}</p>
        </div>
    `;
    visualizador.style.display = 'block';
};
"""

js = re.sub(r'window\.actualizarVisualizadorPlaneacion\s*=\s*function\(\)\s*\{.*?\};\n', nueva_actualizar_admin, js, flags=re.DOTALL)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
