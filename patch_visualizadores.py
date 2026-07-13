import io
import re

# PATCH LOGIN.HTML
with io.open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Extraer student-planeacion-contenido
block_to_extract = '''                    <div id="student-planeacion-contenido" style="background: #F9FAFB; padding: 15px; border-radius: 8px; border-left: 4px solid #3B82F6; margin-bottom: 30px; display: none;">
                        <!-- Contenido inyectado por JS -->
                    </div>'''

if block_to_extract in html:
    html = html.replace(block_to_extract, "")
    
    # 2. Insertarlo despues de los selectores en student-subject-view-container
    target_insert = '''                            <select id="student-select-semana" style="padding: 10px; border-radius: 8px; border: 1px solid #D1D5DB; font-weight: bold;" onchange="actualizarPlaneacionEstudiante()">
                                <option value="1">Semana 1</option>
                                <option value="2">Semana 2</option>
                                <option value="3">Semana 3</option>
                                <option value="4">Semana 4</option>
                                <option value="5">Semana 5</option>
                                <option value="6">Semana 6</option>
                                <option value="7">Semana 7</option>
                                <option value="8">Semana 8</option>
                            </select>
                        </div>
                    </div>'''
    
    if target_insert in html:
        html = html.replace(target_insert, target_insert + '\n\n' + block_to_extract)

with io.open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)


# PATCH APP.JS
with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 3. Arreglar actualizarVisualizadorPlaneacion
old_actualizar = '''window.actualizarVisualizadorPlaneacion = function() {
    const selectorGrado = document.getElementById('select-planeacion-grado');
    const selectorAsignatura = document.getElementById('select-planeacion-asignatura');
    const visualizador = document.getElementById('planeacion-contenido-actual');
    
    if (!selectorGrado || !visualizador) return;

    const gradoSeleccionado = selectorGrado.value;
    
    if (!gradoSeleccionado) {
        visualizador.style.display = 'none';
        return;
    }'''

new_actualizar = '''window.actualizarVisualizadorPlaneacion = function() {
    const selectorAsignatura = document.getElementById('select-planeacion-asignatura');
    const visualizador = document.getElementById('planeacion-contenido-actual');
    
    if (!visualizador || !window.gradoActualPlaneacion) return;

    const gradoSeleccionado = window.gradoActualPlaneacion;'''

if old_actualizar in js:
    js = js.replace(old_actualizar, new_actualizar)

# 4. Arreglar abrirGrupo
old_abrir = '''    // Mostrar materias del grupo de inmediato
    const materiasDiv = document.getElementById('admin-materias-grupo-actual');
    if (materiasDiv) {
        const mat = obtenerMateriasPorGrupo(grupoName);
        let tagsHTML = mat.map(m => `
            <div style="background: #E0E7FF; color: #4338CA; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 0.9rem; display: inline-block; margin-right: 10px; margin-bottom: 10px;">
                📚 ${m.nombre} (${m.horas})
            </div>
        `).join('');
        materiasDiv.innerHTML = `
            <div style="background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <h5 style="margin: 0 0 10px 0; font-size: 1rem; color: #374151;">Asignaturas del Grado:</h5>
                ${tagsHTML}
            </div>
        `;
    }'''

new_abrir = '''    // Mostrar materias del grupo de inmediato
    const materiasDiv = document.getElementById('admin-materias-grupo-actual');
    const selectAsig = document.getElementById('select-planeacion-asignatura');
    let mat = [];
    if (materiasDiv) {
        mat = obtenerMateriasPorGrupo(grupoName);
        let tagsHTML = mat.map(m => `
            <div style="background: #E0E7FF; color: #4338CA; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 0.9rem; display: inline-block; margin-right: 10px; margin-bottom: 10px;">
                📚 ${m.nombre} (${m.horas})
            </div>
        `).join('');
        materiasDiv.innerHTML = `
            <div style="background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <h5 style="margin: 0 0 10px 0; font-size: 1rem; color: #374151;">Asignaturas del Grado:</h5>
                ${tagsHTML}
            </div>
        `;
    }
    
    if (selectAsig) {
        selectAsig.innerHTML = '';
        mat.forEach(m => {
            selectAsig.innerHTML += `<option value="${m.nombre}">${m.nombre}</option>`;
        });
        if (mat.length > 0) {
            selectAsig.style.display = 'inline-block';
        } else {
            selectAsig.style.display = 'none';
        }
    }'''

if old_abrir in js:
    js = js.replace(old_abrir, new_abrir)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
