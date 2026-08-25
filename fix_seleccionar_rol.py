with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    code = f.read()

OLD = """// Selector de Rol Docente: permite cambiar entre Director de Grupo y Docente Regular
window.seleccionarRolDocente = function(rol) {
    const { doc } = window.obtenerDatosDocenteSesion();
    window.rolDocente = rol;
    // Persistir en localStorage para futuros ingresos
    try {
        localStorage.setItem('rolDocente_' + doc, rol);
        // También actualizar en docentes_db
        let dList = JSON.parse(localStorage.getItem('docentes_db') || '[]');
        const normDoc = doc.toLowerCase().replace(/[\\\\.\\\\,\\\\-\\\\_\\\\s]/g, '');
        const idx = dList.findIndex(d => String(d.documento || d.cedula || d.usuario || '').toLowerCase().replace(/[\\\\.\\\\,\\\\-\\\\_\\\\s]/g, '') === normDoc);
        if (idx >= 0) {
            dList[idx].rolDocente = rol;
            dList[idx].tipo = rol === 'director' ? 'docente_director' : 'docente_regular';
            dList[idx].es_director = rol === 'director';
        }
        localStorage.setItem('docentes_db', JSON.stringify(dList));
    } catch(e) {}

    // Actualizar UI del banner
    const badge = document.getElementById('docente-rol-actual-badge');
    const btnDir = document.getElementById('btn-rol-director');
    const btnReg = document.getElementById('btn-rol-regular');
    if (badge) {
        badge.style.display = 'flex';
        badge.innerText = rol === 'director' ? '👑 Director de Grupo activo' : '📚 Docente Regular activo';
        badge.style.background = rol === 'director' ? '#2563EB' : '#6B7280';
    }
    if (btnDir) {
        btnDir.style.background = rol === 'director' ? '#2563EB' : 'white';
        btnDir.style.color = rol === 'director' ? 'white' : '#1E40AF';
        btnDir.style.borderColor = rol === 'director' ? '#2563EB' : '#3B82F6';
    }
    if (btnReg) {
        btnReg.style.background = rol === 'regular' ? '#374151' : 'white';
        btnReg.style.color = rol === 'regular' ? 'white' : '#374151';
        btnReg.style.borderColor = rol === 'regular' ? '#374151' : '#D1D5DB';
    }

    // Reiicializar el módulo con el nuevo rol
    if (typeof window.inicializarModuloDirectorGrupo === 'function') {
        window.inicializarModuloDirectorGrupo();
    }
    // Si eligió director, cambiar automáticamente a la tab Mi Grupo
    if (rol === 'director' && typeof window.cambiarTabDocente === 'function') {
        window.cambiarTabDocente('mi-grupo');
    }
};"""

NEW = """// Selector de Rol Docente: permite cambiar entre Director de Grupo y Docente Regular
window.seleccionarRolDocente = function(rol) {
    const { doc, nom } = window.obtenerDatosDocenteSesion();
    window.rolDocente = rol;
    // Persistir en localStorage para futuros ingresos
    try {
        localStorage.setItem('rolDocente_' + doc, rol);
        // También actualizar en docentes_db
        let dList = JSON.parse(localStorage.getItem('docentes_db') || '[]');
        const normDoc = doc.toLowerCase().replace(/[.,\\-_\\s]/g, '');
        const dIdx = dList.findIndex(d => String(d.documento || d.cedula || d.usuario || '').toLowerCase().replace(/[.,\\-_\\s]/g, '') === normDoc);
        if (dIdx >= 0) {
            dList[dIdx].rolDocente = rol;
            dList[dIdx].tipo = rol === 'director' ? 'docente_director' : 'docente_regular';
            dList[dIdx].es_director = rol === 'director';
        }
        localStorage.setItem('docentes_db', JSON.stringify(dList));
    } catch(e) {}

    // Actualizar UI del banner
    const badge = document.getElementById('docente-rol-actual-badge');
    const btnDir = document.getElementById('btn-rol-director');
    const btnReg = document.getElementById('btn-rol-regular');
    if (badge) {
        badge.style.display = 'flex';
        badge.innerText = rol === 'director' ? '\\u{1F451} Director de Grupo activo' : '\\u{1F4DA} Docente Regular activo';
        badge.style.background = rol === 'director' ? '#2563EB' : '#6B7280';
    }
    if (btnDir) {
        btnDir.style.background = rol === 'director' ? '#2563EB' : 'white';
        btnDir.style.color = rol === 'director' ? 'white' : '#1E40AF';
        btnDir.style.borderColor = rol === 'director' ? '#2563EB' : '#3B82F6';
    }
    if (btnReg) {
        btnReg.style.background = rol === 'regular' ? '#374151' : 'white';
        btnReg.style.color = rol === 'regular' ? 'white' : '#374151';
        btnReg.style.borderColor = rol === 'regular' ? '#374151' : '#D1D5DB';
    }

    // Mostrar/ocultar tab Mi Grupo
    const btnTabMiGrupo = document.getElementById('btn-tab-docente-mi-grupo');
    if (btnTabMiGrupo) {
        btnTabMiGrupo.style.display = rol === 'director' ? 'flex' : 'none';
    }

    if (rol === 'director') {
        // Cambiar a la tab Mi Grupo y renderizar directamente
        if (typeof window.cambiarTabDocente === 'function') {
            window.cambiarTabDocente('mi-grupo');
        } else {
            // Fallback manual
            const vistaHerramientas = document.getElementById('vista-docente-herramientas');
            const vistaMiGrupo = document.getElementById('vista-docente-mi-grupo');
            if (vistaHerramientas) vistaHerramientas.style.display = 'none';
            if (vistaMiGrupo) vistaMiGrupo.style.display = 'block';
        }
        // Renderizar el panel Mi Grupo directamente (sin depender de inicializarModuloDirectorGrupo)
        if (typeof window.renderizarPanelMiGrupoDirector === 'function') {
            window.renderizarPanelMiGrupoDirector(doc, nom);
        }
        // También cargar la sección Mis Otros Grupos
        if (typeof window.renderizarMisOtrosGruposDocente === 'function') {
            window.renderizarMisOtrosGruposDocente(doc);
        }
    } else {
        // Volver a herramientas
        if (typeof window.cambiarTabDocente === 'function') {
            window.cambiarTabDocente('herramientas');
        }
    }
};"""

if OLD in code:
    code = code.replace(OLD, NEW, 1)
    print('REPLACED: seleccionarRolDocente OK')
else:
    # Try to find approximate
    idx = code.find('window.seleccionarRolDocente = function(rol)')
    print(f'Not found exactly. seleccionarRolDocente at index: {idx}')
    if idx >= 0:
        print(repr(code[idx:idx+200]))

with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done')
