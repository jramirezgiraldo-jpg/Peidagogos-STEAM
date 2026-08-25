with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Find the insertion point - after cargarDirectorioDocentesGrupoDirector function
# and also find the renderizarPanelMiGrupoDirector to update it

# 1. Find the line where secCrear.style.display = 'block' is set (when no group exists)
OLD_RENDER_NO_GROUP = """    if (!grupoData) {
        // R2: Mostrar Formulario Crear Mi Grupo
        secCrear.style.display = 'block';
        secGestion.style.display = 'none';
    } else {"""

NEW_RENDER_NO_GROUP = """    if (!grupoData) {
        // R2: Mostrar Formulario Crear Mi Grupo
        secCrear.style.display = 'block';
        secGestion.style.display = 'none';
        // Cargar automáticamente la lista de docentes en el formulario
        setTimeout(() => {
            if (typeof window.cargarListaDocentesParaCrearGrupo === 'function') {
                window.cargarListaDocentesParaCrearGrupo();
            }
        }, 100);
    } else {"""

if OLD_RENDER_NO_GROUP in code:
    code = code.replace(OLD_RENDER_NO_GROUP, NEW_RENDER_NO_GROUP, 1)
    print('REPLACED: auto-load docentes on form show OK')
else:
    print('NOT FOUND: OLD_RENDER_NO_GROUP')

# 2. Add cargarListaDocentesParaCrearGrupo function after crearGrupoDirector
INJECTION_MARKER = '// Reconfigurar / Cambiar Grupo\nwindow.reconfigurarGrupoDirector'
NEW_FUNCTION = '''// Cargar lista de docentes para seleccionar ANTES de crear el grupo
window.cargarListaDocentesParaCrearGrupo = async function() {
    const listCont = document.getElementById('lista-docentes-para-crear-grupo');
    if (!listCont) return;
    
    listCont.innerHTML = '<p style="color: #94A3B8; font-style: italic; font-size: 0.9rem; grid-column: 1/-1; text-align: center; padding: 10px;">Cargando docentes...</p>';
    
    const { doc } = window.obtenerDatosDocenteSesion();
    // Obtener docentes ya seleccionados (del localStorage temporal)
    let selectedDocs = [];
    try {
        selectedDocs = JSON.parse(localStorage.getItem('docentes_seleccionados_nuevo_grupo_' + doc) || '[]');
    } catch(e) {}
    
    let docentes = [];
    // Intentar desde servidor
    try {
        const resp = await fetch('/api/docentes?institucion=IE+Instituto+Montenegro');
        if (resp.ok) {
            const json = await resp.json();
            docentes = Array.isArray(json) ? json : (json.docentes || []);
        }
    } catch(e) {}
    // Fallback localStorage
    if (!docentes.length) {
        try {
            const localDocs = JSON.parse(localStorage.getItem('docentes_db') || '[]');
            docentes = localDocs.filter(d => {
                const inst = String(d.institucion || '').toLowerCase();
                return inst.includes('montenegro') || inst.includes('instituto');
            });
        } catch(e) {}
    }
    
    if (!docentes.length) {
        listCont.innerHTML = '<p style="color: #94A3B8; font-style: italic; font-size: 0.9rem; grid-column: 1/-1; text-align: center; padding: 20px 0;">No hay docentes registrados en IE Instituto Montenegro todavía. Se agregarán a medida que los docentes se registren.</p>';
        return;
    }
    
    let html = '';
    docentes.forEach(d => {
        const docId = String(d.documento || d.cedula || d.usuario || '').trim();
        const nombre = String(d.nombre || d.nombre_completo || d.nombres || 'Docente').trim();
        const materia = String(d.asignatura || d.materia || (Array.isArray(d.materias) ? d.materias[0] : '') || '').trim();
        const esDir = d.rolDocente === 'director' || d.tipo === 'docente_director' || d.es_director === true;
        const rolLabel = esDir ? '👑 Director' : '📚 Regular';
        const rolColor = esDir ? '#7C3AED' : '#2563EB';
        const rolBg = esDir ? '#F5F3FF' : '#EFF6FF';
        const isSelected = selectedDocs.includes(docId);
        
        html += `<div style="background: ${isSelected ? '#EFF6FF' : 'white'}; border: ${isSelected ? '2px solid #2563EB' : '1.5px solid #E2E8F0'}; border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.2s;"
            onclick="window.toggleDocenteNuevoGrupo('${docId}', '${nombre.replace(/'/g, "\\'")}', '${materia.replace(/'/g, "\\'")}', this)">
            <div style="width: 38px; height: 38px; background: ${rolBg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;">${esDir ? '👑' : '👨‍🏫'}</div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 800; color: #1E293B; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${nombre}</div>
                <div style="font-size: 0.78rem; color: #64748B;">${materia || 'Sin materia asignada'}</div>
                <span style="background: ${rolBg}; color: ${rolColor}; font-size: 0.7rem; font-weight: 800; padding: 2px 6px; border-radius: 10px;">${rolLabel}</span>
            </div>
            <div id="check-doc-${docId.replace(/[^a-z0-9]/gi, '_')}" style="width: 22px; height: 22px; border-radius: 50%; background: ${isSelected ? '#2563EB' : '#F1F5F9'}; border: 2px solid ${isSelected ? '#2563EB' : '#CBD5E1'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.75rem; color: white;">
                ${isSelected ? '✓' : ''}
            </div>
        </div>`;
    });
    
    listCont.innerHTML = html;
};

// Toggle selección de docente para nuevo grupo
window.toggleDocenteNuevoGrupo = function(docId, nombre, materia, cardEl) {
    const { doc } = window.obtenerDatosDocenteSesion();
    let selectedDocs = [];
    try { selectedDocs = JSON.parse(localStorage.getItem('docentes_seleccionados_nuevo_grupo_' + doc) || '[]'); } catch(e) {}
    
    const checkEl = document.getElementById('check-doc-' + docId.replace(/[^a-z0-9]/gi, '_'));
    const isCurrentlySelected = selectedDocs.includes(docId);
    
    if (isCurrentlySelected) {
        selectedDocs = selectedDocs.filter(id => id !== docId);
        if (cardEl) { cardEl.style.background = 'white'; cardEl.style.border = '1.5px solid #E2E8F0'; }
        if (checkEl) { checkEl.style.background = '#F1F5F9'; checkEl.style.borderColor = '#CBD5E1'; checkEl.innerText = ''; }
    } else {
        selectedDocs.push(docId);
        if (cardEl) { cardEl.style.background = '#EFF6FF'; cardEl.style.border = '2px solid #2563EB'; }
        if (checkEl) { checkEl.style.background = '#2563EB'; checkEl.style.borderColor = '#2563EB'; checkEl.innerText = '\\u2713'; }
    }
    
    localStorage.setItem('docentes_seleccionados_nuevo_grupo_' + doc, JSON.stringify(selectedDocs));
};

// Reconfigurar / Cambiar Grupo
window.reconfigurarGrupoDirector'''

if INJECTION_MARKER in code:
    code = code.replace(INJECTION_MARKER, NEW_FUNCTION, 1)
    print('INJECTED: cargarListaDocentesParaCrearGrupo OK')
else:
    print('NOT FOUND: INJECTION_MARKER')
    # Try alternate
    idx = code.find('window.reconfigurarGrupoDirector = function')
    print(f'reconfigurarGrupoDirector at: {idx}')

# 3. Also update crearGrupoDirector to include the selected docentes
OLD_CREAR = """    const grupoData = {
        grado: grado,
        grupo: grupo,
        docentes: [],
        creadoEn: Date.now(),
        directorDoc: doc,
        directorNombre: nom
    };"""

NEW_CREAR = """    // Get selected docentes for this new group
    let docentesSeleccionados = [];
    try {
        docentesSeleccionados = JSON.parse(localStorage.getItem('docentes_seleccionados_nuevo_grupo_' + doc) || '[]');
        localStorage.removeItem('docentes_seleccionados_nuevo_grupo_' + doc);
    } catch(e) {}

    const grupoData = {
        grado: grado,
        grupo: grupo,
        docentes: docentesSeleccionados,
        creadoEn: Date.now(),
        directorDoc: doc,
        directorNombre: nom
    };"""

if OLD_CREAR in code:
    code = code.replace(OLD_CREAR, NEW_CREAR, 1)
    print('REPLACED: crearGrupoDirector with selected docentes OK')
else:
    print('NOT FOUND: OLD_CREAR')

with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
    f.write(code)
print('All done')
