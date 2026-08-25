# Handoff Report: Director de Grupo Module (R1–R5) Frontend Logic & State Investigation

## 1. Observation

### 1.1 URL Parameter Parsing & Role State in `app.js` and `login.html`
- **Existing Parameter Parsing Points**:
  - `app.js:16328–16482`: `window.verificarParametrosMatriculaDirecta()` runs on `DOMContentLoaded` (+200ms delay). Parses `params.get('reg')`, `params.get('docente')`, `params.get('nombre_doc')`, `params.get('ie')`, `params.get('grupo')`, `params.get('grado')`, `params.get('materia')`, `params.get('token')`, `params.get('rol')`.
  - `app.js:16369–16377`: Extracts `rolParam = params.get('rol')` and sets `#reg-rol-docente-select.value = rolParam`.
  - `app.js:16619–16711`: `window.procesarTokenDocenteDesdeUrl()` runs on `DOMContentLoaded` (+250ms delay). Parses `params.get('token_docente')`, `params.get('nombre_doc')`, `params.get('doc')`, `params.get('ie')`, `params.get('materia')`.
  - `login.html:3772–3802`: `DOMContentLoaded` listener parses `registro`, `codigo`, `grupo`.
- **Target URL Contracts**:
  - Director teacher entry: `login.html?reg=docente&e=<token>&rol=director` (also `?reg=docente&ie=montenegro&rol=director` or `?token_docente=<token>&rol=director`).
  - Student registration entry: `login.html?reg=estudiante&grupo=<GRADO><GRUPO>&inst=montenegro&director=<documento_director>`.
- **Teacher Session & Identity Storage**:
  - `sessionStorage.getItem('peidagogos_auth')`
  - `localStorage.getItem('usuario_sesion')`
  - `localStorage.getItem('usuario_actual')`
  - `localStorage.getItem('docentes_db')`
  - Global variables: `window.usuario_actual` (contains document/ID), `window.rol_actual` (contains role 'docente', 'admin', 'homeschool_tutor', 'estudiante'), and `window.rolDocente` (contains `'director'` or `'regular'`).
  - Header element: `document.getElementById('docente-nombre-header')` (teacher display name).

### 1.2 Teacher Dashboard Initialization & View Routing
- **Dashboard Container**: `login.html:608`: `<div id="docente-dashboard-container" style="display: none; height: 100vh; overflow-y: auto; background-color: #F8FAFC;">`.
- **Login Handlers**:
  - `app.js:1011–1164`: `window.ejecutarLogin()` validates against `/api/login` and local storage `docentes_db` / `usuarios_db`. For teachers (`rol === 'docente'`), calls `mostrarVista('docente-dashboard-container')`, sets `#docente-nombre-header`, and invokes `cargarEstudiantesDocente(data.usuario)`.
  - `app.js:2558–2675`: Teacher registration branch in `window.ejecutarRegistroEstudiante()` saves to `docentes_db` & `usuarios_db`, sets session `usuario_sesion`, and opens `docente-dashboard-container`.
  - `app.js:16697–16708`: `procesarTokenDocenteDesdeUrl()` opens `docente-dashboard-container` and calls `cargarEstudiantesDocente(docFinal)`.

### 1.3 `/api/docentes` and `/api/estudiantes` Data Handling
- **API Fetching Pattern in `app.js`**:
  - `app.js:3253–3270`: `cargarDatosAdmin()` demonstrates the standard synchronization pattern:
    1. `fetch('/api/docentes')` with try-catch fallback.
    2. Merge with `localStorage.getItem('docentes_db') || '[]'` by normalized document/ID.
  - `app.js:15567–15582`: `window.cargarEstudiantesDocente()` demonstrates student synchronization:
    1. `fetch('/api/estudiantes')` with try-catch fallback.
    2. Merge with `localStorage.getItem('usuarios_db') || '[]'` by normalized document/ID.
- **Persistence Fallbacks**:
  - All read/write operations first attempt network requests to backend endpoints, immediately persisting to `localStorage` (`docentes_db`, `usuarios_db`, `grupo_director_<documento>`) as resilient offline fallbacks.

### 1.4 Student Registration Pre-Fill (`register-screen-container`)
- **Container Structure in `login.html:271–605`**:
  - `#reg-tipo-doc` (select CC, TI, RC, CE)
  - `#reg-documento`, `#reg-apellidos`, `#reg-nombre`, `#reg-edad`, `#reg-genero`
  - `#reg-ie` (`InstitutoMontenegro`, `DocenteRegular`, `HomeSchool`, `Validacion`)
  - `#reg-grado` (select 1..11, Ciclo I..VI)
  - `#registro-grupo` (select 6A..10D, Ciclos)
  - `#reg-check-tratamiento-datos` (checkbox for Ley 1581)
  - `#btn-submit-register` -> triggers `window.ejecutarRegistroEstudiante(event)`
- **Pre-Fill Needs for `?reg=estudiante&grupo=7C&inst=montenegro&director=12345678`**:
  - Automatically show `register-screen-container`.
  - Set `#reg-ie.value = 'InstitutoMontenegro'`.
  - Parse Grade (`7`) and Group (`7C`) from `params.get('grupo')`.
  - Set `#reg-grado.value = '7'`, `#registro-grupo.value = '7C'`.
  - Call `actualizarMaterias()` to refresh schedule & subjects.
  - Retain `director` parameter in `window.directorMatriculaActual = params.get('director')` so student registration payload includes `docente_id: window.directorMatriculaActual`.

---

## 2. Logic Chain

### 2.1 State & Role Resolution Logic (`window.rolDocente`)
1. **URL Injection**: When `login.html` loads with `?rol=director` (or `rol=regular`), `window.rolDocente` is assigned immediately.
2. **Session / Database Fallback**: If URL lacks `rol`, read from active session:
   - Check `sessionStorage.getItem('peidagogos_auth')` -> `rolDocente` or `tipo === 'director'`.
   - Check `localStorage.getItem('usuario_sesion')` -> `rolDocente` or `usuarioObj.rolDocente`.
   - Check `localStorage.getItem('docentes_db')` -> match teacher by document -> `d.rolDocente === 'director' || d.tipo === 'director'`.
3. **Default**: If none of the above match, default to `window.rolDocente = 'regular'`.

### 2.2 Requirement R1: Role-Based Tab/Section Visibility
- When `docente-dashboard-container` initializes or renders:
  - Element `#docente-seccion-mi-grupo` is queried.
  - If `window.obtenerRolDocenteActual() === 'director'`, set `#docente-seccion-mi-grupo.style.display = 'block'`.
  - If `window.obtenerRolDocenteActual() !== 'director'`, set `#docente-seccion-mi-grupo.style.display = 'none !important'`.

### 2.3 Requirement R2: "Crear Mi Grupo" Form & Group State
- Target key in localStorage: `grupo_director_<documento_docente>`.
- **State Switch**:
  - Check `const grupoGuardado = localStorage.getItem('grupo_director_' + doc)`.
  - If `!grupoGuardado`: render Creation Form with:
    * Dropdown Grado: `Preescolar`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`.
    * Dropdown Grupo: `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`.
    * Button "✅ Crear Grupo".
  - On Submit:
    * Create object: `{ grado: gradoVal, grupo: grupoVal, docentes: [], creadoEn: Date.now(), directorDoc: doc, directorNombre: nom }`.
    * Save to `localStorage.setItem('grupo_director_' + doc, JSON.stringify(grupoData))`.
    * Send `POST /api/guardar-grupo-director` with `{ documento: doc, grupo: grupoData }` wrapped in try-catch.
    * Re-render `#docente-seccion-mi-grupo` showing the Group Management Panel (R3, R4).

### 2.4 Requirement R3: Montenegro Teachers Management
- In Group Management Panel:
  - Header: `Grado ${grupoData.grado} - Grupo ${grupoData.grupo}` (e.g. `Grupo 7C`).
  - Fetch teachers via `obtenerListaDocentesGlobal()` (`/api/docentes` + `localStorage.docentes_db`).
  - Filter: `d.institucion` containing `montenegro` (case-insensitive) or `instituto` or missing/empty institution.
  - For each teacher:
    * Display Name: `d.nombre_completo || d.nombre + ' ' + (d.apellidos || '')`.
    * Role Badge: `Director de Grupo` if `(d.rol === 'director' || d.tipo === 'director' || d.rolDocente === 'director')`, else `Docente Regular`.
    * Inclusion check: `const isAgregado = (grupoData.docentes || []).includes(d.documento || d.cedula || d.usuario)`.
    * Button: `+ Agregar` (blue/green outline) if not included, `✓ Agregado` (green solid) if included.
    * Toggle action: updates `grupoData.docentes[]` array in `localStorage.setItem('grupo_director_' + doc, JSON.stringify(grupoData))` and re-renders button state immediately.

### 2.5 Requirement R4: Student Registration Link Generator
- URL Structure:
  `https://peidagogosteam.com/login.html?reg=estudiante&grupo=${grupoData.grado}${grupoData.grupo}&inst=montenegro&director=${doc}`
  *(e.g., `https://peidagogosteam.com/login.html?reg=estudiante&grupo=7C&inst=montenegro&director=12345678`)*
- UI Elements:
  - `<input type="text" readonly id="input-link-estudiantes-director" value="${url}">`
  - Button "📋 Copiar Link": calls `navigator.clipboard.writeText(url)` and provides instant visual feedback.
  - Button "📲 Compartir en WhatsApp": opens `https://api.whatsapp.com/send?text=...`.
- Student Consumption:
  - When `login.html` is opened with these params, `window.verificarParametrosMatriculaDirecta()` switches to `register-screen-container`, pre-selects `InstitutoMontenegro`, populates `#reg-grado` and `#registro-grupo`, and updates subjects via `actualizarMaterias()`.

### 2.6 Requirement R5: "Mis Otros Grupos" Section
- Accessible to all teachers (both Directors and Regular Teachers).
- Scans `localStorage` for all keys starting with `grupo_director_`.
- Filters records where `g.docentes && g.docentes.includes(currentTeacherDoc)`.
- If matches found: render cards displaying:
  * Director Name & Document
  * Grade and Group (`Grado ${g.grado} • Grupo ${g.grupo}`)
  * Creation date (`new Date(g.creadoEn).toLocaleDateString()`)
- If no matches: render message `"Aún no apareces en grupos de otros directores"`.

---

## 3. Caveats

1. **DOM Preservation & Non-Destructive Editing**: Existing dashboard elements, headers, and modals must remain intact. CSS `display: none !important` must be used for default states.
2. **Offline & API Resilience**: If `/api/docentes` fails or backend is unreachable, the system must seamlessly fall back to `localStorage.docentes_db`. If `/api/guardar-grupo-director` returns 404 or fails, `localStorage.getItem('grupo_director_' + doc)` must remain the source of truth.
3. **Case Sensitivity & Document Normalization**: Teacher documents can have dots, spaces, or hyphens (`12.345.678` vs `12345678`). Comparison in `docentes.includes()` must use normalized document strings (`replace(/[\.\,\-\_\s]/g, '')`).
4. **Group Code Formatting**: Combining Grado and Grupo (e.g. Grado `7` + Grupo `C` = `7C`; Grado `Preescolar` + Grupo `A` = `PreescolarA`). The student pre-fill logic must support both numeric (`7C`, `10A`) and named (`PreescolarA`, `Ciclo VI`) formats.
5. **No Regressions**: Student dashboard, Admin dashboard, and Regular teacher workflows must operate without breaking or throwing errors.

---

## 4. Conclusion & Concrete Implementation Hooks

### 4.1 Proposed Function Hooks for `app.js`

```javascript
// =========================================================
// MÓDULO DIRECTOR DE GRUPO (R1 - R5)
// =========================================================

// Helper: Resolver Docente y Rol Actual
window.obtenerDatosDocenteSesion = function() {
    let authSes = {};
    try {
        authSes = JSON.parse(sessionStorage.getItem('peidagogos_auth') || localStorage.getItem('usuario_sesion') || localStorage.getItem('usuario_actual') || '{}');
    } catch(e) {}

    const doc = String(window.usuario_actual || authSes.documento || authSes.usuario || (authSes.usuarioObj && (authSes.usuarioObj.documento || authSes.usuarioObj.usuario)) || '').trim();
    const nom = (document.getElementById('docente-nombre-header') ? document.getElementById('docente-nombre-header').innerText : (authSes.nombre || 'Docente')).trim();
    const ie = (authSes.institucion || 'IE Instituto Montenegro').trim();
    
    // Resolver rol de director
    let rolDoc = window.rolDocente;
    if (!rolDoc) {
        const params = new URLSearchParams(window.location.search);
        if (params.get('rol')) rolDoc = params.get('rol').toLowerCase().trim();
    }
    if (!rolDoc) {
        if (authSes.rolDocente) rolDoc = authSes.rolDocente;
        else if (authSes.tipo === 'director' || (authSes.usuarioObj && (authSes.usuarioObj.rolDocente === 'director' || authSes.usuarioObj.tipo === 'director'))) rolDoc = 'director';
        else {
            try {
                const dList = JSON.parse(localStorage.getItem('docentes_db') || '[]');
                const match = dList.find(d => String(d.documento || d.cedula || d.usuario || '').replace(/[\.\,\-\_\s]/g, '') === doc.replace(/[\.\,\-\_\s]/g, ''));
                if (match && (match.rol === 'director' || match.tipo === 'director' || match.rolDocente === 'director')) rolDoc = 'director';
            } catch(e) {}
        }
    }
    if (!rolDoc) rolDoc = 'regular';
    window.rolDocente = rolDoc;

    return { doc, nom, ie, rolDoc };
};

// R1: Inicializar Módulo Director de Grupo en el Dashboard Docente
window.inicializarModuloDirectorGrupo = function() {
    const { doc, nom, ie, rolDoc } = window.obtenerDatosDocenteSesion();
    const secMiGrupo = document.getElementById('docente-seccion-mi-grupo');
    const secOtrosGrupos = document.getElementById('docente-seccion-mis-otros-grupos');

    // R1: Visibilidad estricta por rol
    if (secMiGrupo) {
        if (rolDoc === 'director') {
            secMiGrupo.style.display = 'block';
            window.renderizarPanelMiGrupoDirector(doc, nom);
        } else {
            secMiGrupo.style.display = 'none';
        }
    }

    // R5: Mis Otros Grupos (Visible para todos los docentes)
    if (secOtrosGrupos) {
        window.renderizarMisOtrosGruposDocente(doc);
    }
};

// R2 & R3 & R4: Renderizar Panel Mi Grupo
window.renderizarPanelMiGrupoDirector = function(doc, nom) {
    const container = document.getElementById('docente-mi-grupo-contenido');
    if (!container) return;

    const grupoDataRaw = localStorage.getItem('grupo_director_' + doc);
    let grupoData = null;
    try { grupoData = JSON.parse(grupoDataRaw); } catch(e) {}

    if (!grupoData) {
        // R2: Formulario Crear Mi Grupo
        container.innerHTML = `
            <div style="background: white; border: 2px dashed #CBD5E1; border-radius: 16px; padding: 30px; text-align: center; max-width: 600px; margin: 0 auto;">
                <span style="font-size: 3rem;">👥</span>
                <h3 style="font-size: 1.4rem; font-weight: 900; color: #1E293B; margin: 10px 0 6px 0;">Crea tu Grupo Oficial como Director</h3>
                <p style="color: #64748B; font-size: 0.95rem; margin-bottom: 22px;">
                    Configura el grado y grupo que tienes bajo tu dirección para vincular a tus colegas docentes y generar el enlace oficial de matrícula estudiantil.
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; text-align: left;">
                    <div>
                        <label style="font-weight: 800; font-size: 0.85rem; color: #334155; display: block; margin-bottom: 6px;">Grado:</label>
                        <select id="director-select-grado" style="width: 100%; padding: 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-weight: 700;">
                            <option value="Preescolar">Preescolar</option>
                            <option value="1">1°</option><option value="2">2°</option><option value="3">3°</option>
                            <option value="4">4°</option><option value="5">5°</option><option value="6">6°</option>
                            <option value="7" selected>7°</option><option value="8">8°</option><option value="9">9°</option>
                            <option value="10">10°</option><option value="11">11°</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-weight: 800; font-size: 0.85rem; color: #334155; display: block; margin-bottom: 6px;">Grupo:</label>
                        <select id="director-select-grupo" style="width: 100%; padding: 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-weight: 700;">
                            <option value="A">A</option><option value="B">B</option><option value="C" selected>C</option>
                            <option value="D">D</option><option value="E">E</option><option value="F">F</option>
                            <option value="G">G</option><option value="H">H</option><option value="I">I</option><option value="J">J</option>
                        </select>
                    </div>
                </div>
                <button onclick="window.crearGrupoDirectorEjecutar('${doc}', '${nom.replace(/'/g, "\\'")}')" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.3); width: 100%;">
                    ✅ Crear Grupo
                </button>
            </div>
        `;
    } else {
        // R3 & R4: Panel de Gestión del Grupo Activo
        const grupoCodigo = `${grupoData.grado}${grupoData.grupo}`;
        const urlMatricula = `https://peidagogosteam.com/login.html?reg=estudiante&grupo=${encodeURIComponent(grupoCodigo)}&inst=montenegro&director=${encodeURIComponent(doc)}`;

        container.innerHTML = `
            <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 18px; padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                
                <!-- Encabezado del Grupo -->
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; border-bottom: 1.5px solid #F1F5F9; padding-bottom: 20px; margin-bottom: 20px;">
                    <div>
                        <span style="background: #ECFDF5; color: #047857; font-size: 0.8rem; font-weight: 900; padding: 4px 12px; border-radius: 20px;">
                            🏛️ Dirección Oficial de Grupo
                        </span>
                        <h2 style="font-size: 1.7rem; font-weight: 900; color: #0F172A; margin: 8px 0 2px 0;">
                            Grupo ${grupoData.grado}° ${grupoData.grupo} (${grupoCodigo})
                        </h2>
                        <p style="color: #64748B; font-size: 0.9rem; margin: 0;">
                            Director(a): <strong>${nom}</strong> • Creado el ${new Date(grupoData.creadoEn || Date.now()).toLocaleDateString('es-CO')}
                        </p>
                    </div>
                    <div>
                        <button onclick="if(confirm('¿Deseas reiniciar la configuración de este grupo?')){ localStorage.removeItem('grupo_director_${doc}'); window.renderizarPanelMiGrupoDirector('${doc}', '${nom.replace(/'/g, "\\'")}'); }" style="background: #FEE2E2; color: #DC2626; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 800; font-size: 0.82rem; cursor: pointer;">
                            ⚙️ Cambiar Grado/Grupo
                        </button>
                    </div>
                </div>

                <!-- R4: Enlace Oficial de Matrícula para Estudiantes -->
                <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 14px; padding: 18px; margin-bottom: 25px;">
                    <div style="font-weight: 900; font-size: 1rem; color: #166534; display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span>🔗</span> Enlace Oficial de Matrícula para Estudiantes
                    </div>
                    <p style="color: #15803D; font-size: 0.88rem; margin: 0 0 12px 0;">
                        Comparte este enlace con los alumnos de <strong>${grupoCodigo}</strong>. Al abrirlo, el formulario de matrícula se completará automáticamente con su grado y grupo.
                    </p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <input id="input-link-estudiantes-director" type="text" readonly value="${urlMatricula}" style="flex: 1; min-width: 280px; padding: 10px 14px; border: 1.5px solid #86EFAC; border-radius: 8px; font-size: 0.88rem; font-family: monospace; background: white; color: #1E293B;">
                        <button onclick="navigator.clipboard.writeText('${urlMatricula}'); alert('✅ Enlace de matrícula para estudiantes copiado al portapapeles');" style="background: #16A34A; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 800; font-size: 0.88rem; cursor: pointer;">
                            📋 Copiar Link
                        </button>
                        <button onclick="const t = encodeURIComponent('¡Hola estudiantes del Grupo ${grupoCodigo}! 👋\\n\\nSoy el(la) Profesor(a) ${nom}. Les comparto el enlace oficial para matricularse en Peidagogos STEAM:\\n\\n👉 ${urlMatricula}\\n\\n(No requiere códigos de verificación)'); window.open('https://api.whatsapp.com/send?text='+t, '_blank');" style="background: #25D366; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 800; font-size: 0.88rem; cursor: pointer;">
                            📲 WhatsApp
                        </button>
                    </div>
                </div>

                <!-- R3: Lista de Docentes de IE Instituto Montenegro -->
                <div>
                    <h3 style="font-size: 1.2rem; font-weight: 900; color: #1E293B; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
                        <span>👨‍🏫</span> Docentes Vinculados a este Grupo (${(grupoData.docentes || []).length})
                    </h3>
                    <p style="color: #64748B; font-size: 0.88rem; margin: 0 0 15px 0;">
                        Agrega a los docentes de la institución que dictan clase en tu grupo para coordinar las actividades académicas.
                    </p>
                    <div id="contenedor-lista-docentes-grupo" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
                        <div style="text-align: center; color: #94A3B8; padding: 20px;">Cargando directorio docente...</div>
                    </div>
                </div>

            </div>
        `;

        window.cargarDirectorioDocentesGrupoDirector(doc, grupoData);
    }
};

// R2: Ejecutar Creación de Grupo
window.crearGrupoDirectorEjecutar = async function(doc, nom) {
    const selGra = document.getElementById('director-select-grado');
    const selGrp = document.getElementById('director-select-grupo');
    const grado = selGra ? selGra.value : '7';
    const grupo = selGrp ? selGrp.value : 'C';

    const grupoData = {
        grado: grado,
        grupo: grupo,
        docentes: [],
        creadoEn: Date.now(),
        directorDoc: doc,
        directorNombre: nom
    };

    localStorage.setItem('grupo_director_' + doc, JSON.stringify(grupoData));

    // Fallback POST a backend
    try {
        await fetch('/api/guardar-grupo-director', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documento: doc, grupo: grupoData })
        });
    } catch(e) {}

    window.renderizarPanelMiGrupoDirector(doc, nom);
};

// R3: Cargar y Renderizar Docentes de Montenegro con Toggle
window.cargarDirectorioDocentesGrupoDirector = async function(docDirector, grupoData) {
    const listCont = document.getElementById('contenedor-lista-docentes-grupo');
    if (!listCont) return;

    let docentes = [];
    try {
        const res = await fetch('/api/docentes');
        if (res.ok) docentes = await res.json();
    } catch(e) {}

    const localDocentes = JSON.parse(localStorage.getItem('docentes_db') || '[]');
    localDocentes.forEach(ld => {
        const normDoc = String(ld.documento || ld.cedula || ld.usuario || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');
        if (normDoc && !docentes.some(d => String(d.documento || d.cedula || d.usuario || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc)) {
            docentes.push(ld);
        }
    });

    // Filtrar Montenegro
    const docentesMontenegro = docentes.filter(d => {
        const inst = String(d.institucion || '').toLowerCase();
        return inst.includes('montenegro') || inst.includes('instituto') || !inst;
    });

    if (docentesMontenegro.length === 0) {
        listCont.innerHTML = '<div style="color: #64748B; font-size: 0.9rem;">No se encontraron docentes en la sede.</div>';
        return;
    }

    const docentesAgregados = grupoData.docentes || [];

    listCont.innerHTML = docentesMontenegro.map(d => {
        const dDoc = String(d.documento || d.cedula || d.usuario || '').trim();
        const dNom = d.nombre_completo || `${d.nombre || ''} ${d.apellidos || ''}`.trim() || 'Docente';
        const esDirector = (d.rol === 'director' || d.tipo === 'director' || d.rolDocente === 'director');
        const rolBadge = esDirector 
            ? '<span style="background: #F3E8FF; color: #7C3AED; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 12px;">Director</span>'
            : '<span style="background: #F1F5F9; color: #475569; font-size: 0.72rem; font-weight: 800; padding: 2px 8px; border-radius: 12px;">Docente Regular</span>';
        
        const isAgregado = docentesAgregados.includes(dDoc);
        const btnStyle = isAgregado
            ? 'background: #10B981; color: white; border: none;'
            : 'background: white; color: #2563EB; border: 1.5px solid #3B82F6;';
        const btnText = isAgregado ? '✓ Agregado' : '+ Agregar';

        return `
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <div>
                    <div style="font-weight: 800; font-size: 0.88rem; color: #1E293B;">${dNom}</div>
                    <div style="margin-top: 3px;">${rolBadge}</div>
                </div>
                <button onclick="window.toggleDocenteGrupoDirector('${docDirector}', '${dDoc}')" style="${btnStyle} padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 0.78rem; cursor: pointer; transition: 0.2s;">
                    ${btnText}
                </button>
            </div>
        `;
    }).join('');
};

// R3: Toggle Docente en Grupo
window.toggleDocenteGrupoDirector = function(docDirector, docColega) {
    const raw = localStorage.getItem('grupo_director_' + docDirector);
    if (!raw) return;
    let grupoData = JSON.parse(raw);
    if (!Array.isArray(grupoData.docentes)) grupoData.docentes = [];

    const idx = grupoData.docentes.indexOf(docColega);
    if (idx >= 0) {
        grupoData.docentes.splice(idx, 1);
    } else {
        grupoData.docentes.push(docColega);
    }

    localStorage.setItem('grupo_director_' + docDirector, JSON.stringify(grupoData));
    
    // Sync backend fallback
    try {
        fetch('/api/guardar-grupo-director', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documento: docDirector, grupo: grupoData })
        }).catch(() => {});
    } catch(e) {}

    const authSes = window.obtenerDatosDocenteSesion();
    window.renderizarPanelMiGrupoDirector(docDirector, authSes.nom);
};

// R5: Renderizar "Mis Otros Grupos"
window.renderizarMisOtrosGruposDocente = function(docDocente) {
    const container = document.getElementById('docente-mis-otros-grupos-lista');
    if (!container) return;

    const normDoc = String(docDocente || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');
    const otrosGrupos = [];

    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('grupo_director_')) {
            try {
                const g = JSON.parse(localStorage.getItem(k));
                if (g && Array.isArray(g.docentes)) {
                    const match = g.docentes.some(d => String(d).trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc);
                    if (match) otrosGrupos.push(g);
                }
            } catch(e) {}
        }
    }

    if (otrosGrupos.length === 0) {
        container.innerHTML = `
            <div style="background: white; border: 1.5px dashed #CBD5E1; border-radius: 14px; padding: 25px; text-align: center; color: #64748B; font-size: 0.95rem;">
                <span>📚</span> Aún no apareces en grupos de otros directores
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
            ${otrosGrupos.map(g => `
                <div style="background: white; border: 1.5px solid #DBEAFE; border-radius: 14px; padding: 18px; box-shadow: 0 4px 12px rgba(37,99,235,0.05);">
                    <div style="font-size: 0.78rem; font-weight: 800; color: #2563EB; text-transform: uppercase;">Grupo Asignado</div>
                    <h3 style="margin: 4px 0 6px 0; font-size: 1.3rem; font-weight: 900; color: #1E293B;">
                        Grado ${g.grado}° Grupo ${g.grupo}
                    </h3>
                    <p style="margin: 0; color: #475569; font-size: 0.88rem;">
                        👨‍🏫 Director(a): <strong>${g.directorNombre || g.directorDoc || 'Docente Director'}</strong>
                    </p>
                    <div style="margin-top: 10px; font-size: 0.78rem; color: #94A3B8;">
                        Vinculado el ${new Date(g.creadoEn || Date.now()).toLocaleDateString('es-CO')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};
```

### 4.2 Proposed Hook in `verificarParametrosMatriculaDirecta` for Student Pre-Fill (R4)
```javascript
// Inside window.verificarParametrosMatriculaDirecta in app.js:
const regParam = params.get('reg');
const grupoParam = params.get('grupo');
const directorParam = params.get('director');

if (regParam === 'estudiante' && grupoParam) {
    if (typeof mostrarVista === 'function') {
        mostrarVista('register-screen-container');
    }
    
    // Set Institution
    const selIE = document.getElementById('reg-ie');
    if (selIE) {
        selIE.value = 'InstitutoMontenegro';
        if (typeof toggleIEOptions === 'function') toggleIEOptions();
    }

    // Parse Grado and Grupo
    const match = grupoParam.match(/^([0-9]+|Preescolar|Ciclo\s+[IVX]+)(.*)$/i);
    const gradoParsed = match ? match[1] : grupoParam;
    
    const selGrado = document.getElementById('reg-grado');
    if (selGrado) {
        selGrado.value = gradoParsed;
    }

    const selGrupo = document.getElementById('registro-grupo');
    if (selGrupo) {
        // If option does not exist, add dynamically
        let exists = Array.from(selGrupo.options).some(o => o.value.toLowerCase() === grupoParam.toLowerCase());
        if (!exists) {
            const opt = document.createElement('option');
            opt.value = grupoParam;
            opt.text = grupoParam;
            selGrupo.appendChild(opt);
        }
        selGrupo.value = grupoParam;
    }

    if (directorParam) {
        window.directorMatriculaActual = directorParam;
    }

    if (typeof actualizarMaterias === 'function') {
        actualizarMaterias();
    }
}
```

---

## 5. Verification Method

To independently verify the implementation:

1. **Unit & Contract Tests via Node.js / Jest / Custom Runner**:
   - Create and run `tests/test_director_grupo.js` covering:
     * T1: Visibility of `#docente-seccion-mi-grupo` when `window.rolDocente === 'director'` vs hidden when `rolDocente === 'regular'`.
     * T2: Creation of group in `localStorage['grupo_director_<doc>']` with `{ grado, grupo, docentes: [], creadoEn }`.
     * T3: Fetching and filtering Montenegro teachers from `/api/docentes` and toggling `docentes[]`.
     * T4: Link generator producing URL `login.html?reg=estudiante&grupo=<GRADO><GRUPO>&inst=montenegro&director=<doc>`.
     * T5: Student registration pre-fill of `reg-grado` and `registro-grupo` from `?grupo=7C`.
     * T6: "Mis Otros Grupos" correctly detecting groups where teacher document is present in `docentes[]`.
   - Command: `node tests/test_director_grupo.js`
2. **Regression Testing**:
   - Run complete suite: `node tests/test_challenger_m3_m4_final.js`, `node tests/test_tier3_cross_features.js`, `node tests/test_tier4_scenarios.js`.
3. **Invalidation Conditions**:
   - If `#docente-seccion-mi-grupo` is visible for a regular teacher (`window.rolDocente === 'regular'`).
   - If student visiting `?reg=estudiante&grupo=7C` does not see `7C` pre-selected in the registration form.

