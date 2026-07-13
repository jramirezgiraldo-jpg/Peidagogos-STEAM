import io

with io.open('app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

# 1. Add grupoName to the onclick call
js_code = js_code.replace(
    'verInformeEstudiante(\\', ${progreso})', # wait, this is not exactly what it is.
    # The actual line is:
    # <button onclick="verInformeEstudiante('${est.nombre || ''} ${est.apellidos || ''}', ${progreso})"
    # Let's do a simple replace
    'est.apellidos || \\'\\'}\\', ${progreso})"',
    'est.apellidos || \\'\\'}\\', ${progreso}, \\'${grupoName}\\')"'
)


# 2. Modify the verInformeEstudiante function
old_func_start = "window.verInformeEstudiante = function(nombre, progreso) {"
old_func_end = "    document.getElementById('modal-informe-estudiante').style.display = 'flex';\n};"

start_idx = js_code.find(old_func_start)
end_idx = js_code.find(old_func_end)

if start_idx != -1 and end_idx != -1:
    end_idx += len(old_func_end)
    new_func = """window.verInformeEstudiante = function(nombre, progreso, grupoName) {
    document.getElementById('informe-nombre-estudiante').textContent = 'Informe: ' + nombre + ' (' + (grupoName || 'Sin Grupo') + ')';
    
    // Mapping of group to subjects based on the provided schedule
    let materiasHTML = '';
    let materias = [];
    
    if (grupoName === '6A' || grupoName === '6B') {
        materias = [
            { nombre: 'Física', horas: '2h', estado: 'Completado', color: '#10B981' }
        ];
    } else if (grupoName === '7A') {
        materias = [
            { nombre: 'Turismo', horas: '1h', estado: 'Completado', color: '#10B981' },
            { nombre: 'Física', horas: '3h', estado: 'En Progreso', color: '#F59E0B' }
        ];
    } else if (grupoName === '7B') {
        materias = [
            { nombre: 'Turismo', horas: '1h', estado: 'Completado', color: '#10B981' },
            { nombre: 'Física', horas: '2h', estado: 'En Progreso', color: '#F59E0B' }
        ];
    } else if (grupoName === '7C') {
        materias = [
            { nombre: 'Turismo', horas: '1h', estado: 'Completado', color: '#10B981' },
            { nombre: 'Ética', horas: '1h', estado: 'Completado', color: '#10B981' },
            { nombre: 'Física', horas: '2h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName === '8A' || grupoName === '8B' || grupoName === '9A') {
        materias = [
            { nombre: 'Artística', horas: '1h', estado: 'En Progreso', color: '#F59E0B' }
        ];
    } else if (grupoName === '10A' || grupoName === '10D') {
        materias = [
            { nombre: 'Ética', horas: '1h', estado: 'Completado', color: '#10B981' }
        ];
    } else if (grupoName === 'PENS') {
        materias = [
            { nombre: 'Turismo', horas: '1h', estado: 'Completado', color: '#10B981' },
            { nombre: 'Química', horas: '2h', estado: 'En Progreso', color: '#F59E0B' }
        ];
    } else {
        // Fallback para Ramon Messa u otros
        materias = [
            { nombre: 'Asignaturas Básicas', horas: 'Varias', estado: 'Pendiente', color: '#6B7280' }
        ];
    }
    
    materias.forEach(m => {
        materiasHTML += `
            <li style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                <span style="font-weight: bold;">${m.nombre} (${m.horas})</span>
                <span style="color: ${m.color}; font-weight: bold;">${m.estado}</span>
            </li>
        `;
    });

    document.getElementById('informe-contenido').innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4 style="font-weight: 800; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-bottom: 15px;">Resumen de Actividad</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: #F3F4F6; padding: 15px; border-radius: 8px;">
                    <div style="color: #6B7280; font-size: 0.85rem; font-weight: bold; text-transform: uppercase;">Progreso Total</div>
                    <div style="font-size: 1.5rem; font-weight: 900; color: #10B981;">${progreso}%</div>
                </div>
                <div style="background: #F3F4F6; padding: 15px; border-radius: 8px;">
                    <div style="color: #6B7280; font-size: 0.85rem; font-weight: bold; text-transform: uppercase;">Materias Asignadas</div>
                    <div style="font-size: 1.5rem; font-weight: 900; color: #3B82F6;">${materias.length}</div>
                </div>
            </div>
        </div>
        <div>
            <h4 style="font-weight: 800; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-bottom: 15px;">Materias Matriculadas</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${materiasHTML}
            </ul>
        </div>
    `;
    
    document.getElementById('modal-informe-estudiante').style.display = 'flex';
};"""
    js_code = js_code[:start_idx] + new_func + js_code[end_idx:]
else:
    print("Could not find function bounds!")

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)
