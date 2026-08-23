# Handoff Report: Milestone 1 - Feature 4 (Director de Grupo Restriction in Subject Creation Modal)

## 1. Observation

### 1.1 Current Subject Creation Modal Grade Selection in `login.html`
- **Location**: `d:\Peidagogos_Oficial\login.html` (lines 3086–3092).
- **Verbatim Code**:
```html
<div>
    <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.9rem; margin-bottom: 6px;">Grados o Ciclos en los que se Dictará:</label>
    <div id="modal-asig-grados-container" style="display: flex; gap: 6px; flex-wrap: wrap;">
        <!-- Inyectado por JS con pills seleccionables -->
    </div>
</div>
```
- **Deficiency**: There is no distinction between a "Director de Grupo" (who manages cohorts and assigns teaching teams) and a standard "Docente de Área" (who authors curricular subjects and pedagogical content). Grade/cohort assignment checkboxes are rendered unconditionally for all users without role checking or pedagogical guidance.

---

### 1.2 Modal Opening & Grade Rendering Controller in `app.js`
- **Location**: `d:\Peidagogos_Oficial\app.js` (lines 1400–1418).
- **Verbatim Code**:
```javascript
window.abrirModalCrearAsignaturaDocente = function(origen = 'docente') {
    window._origenModalAsig = origen;
    const modal = document.getElementById("modal-crear-asignatura-docente");
    if (modal) {
        modal.style.display = "flex";
        
        // Renderizar pills de grados en modal
        const gCont = document.getElementById("modal-asig-grados-container");
        if (gCont) {
            const gradosList = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "Ciclo I", "Ciclo II", "Ciclo III", "Ciclo IV", "Ciclo V", "Ciclo VI"];
            gCont.innerHTML = gradosList.map(g => `
                <label style="display: inline-flex; align-items: center; gap: 4px; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 4px 8px; border-radius: 16px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
                    <input type="checkbox" name="modal_asig_grado_check" value="${g}" ${['6','7','8','9','10','11'].includes(g) ? 'checked' : ''}>
                    <span>${g.includes('Ciclo') ? g : g + '°'}</span>
                </label>
            `).join('');
        }
    }
};
```
- **Deficiency**: Does not query `sessionStorage.getItem('peidagogos_auth')`, `localStorage.getItem('usuario_sesion')`, or `localStorage.getItem('docentes_db')` to verify if the teacher holds the `es_director` role or admin privileges.

---

### 1.3 Teacher Auth & Data Architecture
- **Locations**:
  - `d:\Peidagogos_Oficial\docentes.json` (lines 1–21)
  - `d:\Peidagogos_Oficial\server.js` (lines 1033–1050, 1090–1105)
  - `d:\Peidagogos_Oficial\app.js` (lines 1078–1090, 2102–2116, 14720–14730)
- **Active Session Objects**:
  - `sessionStorage.getItem('peidagogos_auth')` / `localStorage.getItem('usuario_sesion')` / `localStorage.getItem('usuario_actual')`:
    ```json
    {
      "status": "success",
      "usuario": "123456",
      "nombre": "Juan Pérez",
      "rol": "docente",
      "institucion": "IE Instituto Montenegro",
      "asignatura": "Ciencias Naturales y Física",
      "es_director": true,
      "grupos_direccion": ["7C"],
      "usuarioObj": { ... }
    }
    ```
  - `localStorage.getItem('docentes_db')`: Array of teacher objects containing optional `es_director: true/false` and `grupos_direccion: ["7C", ...]`.
  - Admin Role: `authSes.rol === 'admin'` or `window.rol_actual === 'admin'`.

---

## 2. Logic Chain

1. **Role Contract & Invariants**:
   - Administrators (`rol === 'admin'`) and Group Directors (`es_director === true` or teachers with non-empty `grupos_direccion`) possess administrative authorization to bind cohorts and select specific grades/cycles during subject creation.
   - Standard Area Teachers (`es_director !== true` and `rol !== 'admin'`) are authorized to create subject definitions (name, area, icon, pedagogical description, upload syllabus/DBA documents, paste curricular text, and run AI malla generation), but cohort group assignment must be restricted to prevent unauthorized cohort binding.

2. **Pedagogy & UX Notice**:
   - Rather than disabling the entire creation flow, the grade checklist (`#modal-asig-grados-container`) is hidden (`display: none;`) for non-directors.
   - An informative pedagogical alert container (`#modal-asig-director-notice`) is shown (`display: flex;`) containing the exact required notice:
     > *"Como docente de área, puedes crear la estructura de la asignatura. La vinculación de cohortes de grupo está reservada para Directores de Grupo."*
   - For directors/admins, a visual badge (`#modal-asig-director-badge`) is displayed (`👑 Director de Grupo`), `#modal-asig-director-notice` is hidden, and `#modal-asig-grados-container` is displayed (`display: flex;`) with all grade/cycle check pills.

3. **Fallback Handling in AI Malla Generation**:
   - In `window.ejecutarCrearAsignaturaDocenteConIA`, when an area teacher submits a new subject without grade checkboxes selected (because the UI was hidden), `gradosArr` defaults to `["6", "7", "8", "9", "10", "11"]` (or full grade taxonomy).
   - This ensures `window.procesarDocumentoYCrearMalla` and `localStorage.setItem('asignaturas_personalizadas_db')` generate complete DBA structures across periods 1–4 without errors.

4. **Multi-Source Authentication Resolver**:
   - Create helper `window.verificarEsDirectorOAdmin()` that performs robust cross-checking:
     ```javascript
     window.verificarEsDirectorOAdmin = function() {
         let authSes = {};
         try {
             authSes = JSON.parse(sessionStorage.getItem('peidagogos_auth') || localStorage.getItem('usuario_sesion') || localStorage.getItem('usuario_actual') || '{}');
         } catch(e) {}

         let docentePerfil = null;
         try {
             const dList = JSON.parse(localStorage.getItem('docentes_db') || '[]');
             const docKey = String(window.usuario_actual || authSes.usuario || authSes.documento || (authSes.usuarioObj && (authSes.usuarioObj.documento || authSes.usuarioObj.usuario)) || '').trim().toLowerCase();
             docentePerfil = dList.find(d => {
                 const dDoc = String(d.documento || d.cedula || d.usuario || '').trim().toLowerCase();
                 return dDoc === docKey;
             });
         } catch(e) {}

         const esAdmin = (authSes.rol === 'admin' || window.rol_actual === 'admin' || (authSes.usuarioObj && authSes.usuarioObj.rol === 'admin'));
         const esDirectorDocente = Boolean(
             authSes.es_director === true ||
             (authSes.usuarioObj && authSes.usuarioObj.es_director === true) ||
             (docentePerfil && docentePerfil.es_director === true) ||
             (authSes.grupos_direccion && Array.isArray(authSes.grupos_direccion) && authSes.grupos_direccion.length > 0) ||
             (docentePerfil && Array.isArray(docentePerfil.grupos_direccion) && docentePerfil.grupos_direccion.length > 0)
         );

         return esAdmin || esDirectorDocente;
     };
     ```

---

## 3. Caveats

- **Non-Destructive Rules Compliance**:
  - No HTML elements are removed from `login.html`. `#modal-asig-grados-container` is retained as a permanent DOM node and toggled via CSS (`display: flex` vs `display: none`).
  - Existing functions (`window.ejecutarCrearAsignaturaDocenteConIA`, `window.procesarDocumentoYCrearMalla`, `window.cerrarModalCrearAsignaturaDocente`) retain their full signature and global accessibility.
- **Session Initialization**:
  - `docentes.json` is updated to include `"es_director": true, "grupos_direccion": ["7C"]` for the primary demo teacher (`documento: "123456"`) and `"es_director": false, "grupos_direccion": []` for standard area teachers, ensuring immediate out-of-the-box demo functionality.

---

## 4. Conclusion & Exact Code Instructions for the Worker

### 4.1 Changes in `login.html`

**Location**: `login.html` (lines 3086–3092)

#### Replace Code Block:
```html
                <div>
                    <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.9rem; margin-bottom: 6px;">Grados o Ciclos en los que se Dictará:</label>
                    <div id="modal-asig-grados-container" style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <!-- Inyectado por JS con pills seleccionables -->
                    </div>
                </div>
```

#### With:
```html
                <div id="modal-asig-grados-wrapper">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.9rem; margin: 0;">Grados o Ciclos en los que se Dictará:</label>
                        <span id="modal-asig-director-badge" style="display: none; background: #FEF3C7; color: #92400E; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 12px; border: 1px solid #FDE68A;">👑 Director de Grupo</span>
                    </div>
                    <div id="modal-asig-grados-container" style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <!-- Inyectado por JS con pills seleccionables -->
                    </div>
                    <!-- Aviso Pedagógico para Docentes de Área (No Directores) -->
                    <div id="modal-asig-director-notice" style="display: none; background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 12px 14px; margin-top: 6px; font-size: 0.85rem; color: #1E40AF; line-height: 1.45; align-items: flex-start; gap: 10px;">
                        <span style="font-size: 1.3rem; line-height: 1;">ℹ️</span>
                        <div>
                            <strong style="color: #1E3A8A; display: block; margin-bottom: 2px;">Vinculación de Cohortes Reservada</strong>
                            <span>Como docente de área, puedes crear la estructura de la asignatura. La vinculación de cohortes de grupo está reservada para Directores de Grupo.</span>
                        </div>
                    </div>
                </div>
```

---

### 4.2 Changes in `app.js`

#### Step 1: Add `window.verificarEsDirectorOAdmin` (around line 1330)
```javascript
window.verificarEsDirectorOAdmin = function() {
    let authSes = {};
    try {
        authSes = JSON.parse(sessionStorage.getItem('peidagogos_auth') || localStorage.getItem('usuario_sesion') || localStorage.getItem('usuario_actual') || '{}');
    } catch(e) {}

    let docentePerfil = null;
    try {
        const dList = JSON.parse(localStorage.getItem('docentes_db') || '[]');
        const docKey = String(window.usuario_actual || authSes.usuario || authSes.documento || (authSes.usuarioObj && (authSes.usuarioObj.documento || authSes.usuarioObj.usuario)) || '').trim().toLowerCase();
        docentePerfil = dList.find(d => {
            const dDoc = String(d.documento || d.cedula || d.usuario || '').trim().toLowerCase();
            return dDoc === docKey;
        });
    } catch(e) {}

    const esAdmin = (authSes.rol === 'admin' || window.rol_actual === 'admin' || (authSes.usuarioObj && authSes.usuarioObj.rol === 'admin'));
    const esDirectorDocente = Boolean(
        authSes.es_director === true ||
        (authSes.usuarioObj && authSes.usuarioObj.es_director === true) ||
        (docentePerfil && docentePerfil.es_director === true) ||
        (authSes.grupos_direccion && Array.isArray(authSes.grupos_direccion) && authSes.grupos_direccion.length > 0) ||
        (docentePerfil && Array.isArray(docentePerfil.grupos_direccion) && docentePerfil.grupos_direccion.length > 0)
    );

    return esAdmin || esDirectorDocente;
};
```

#### Step 2: Update `window.abrirModalCrearAsignaturaDocente` in `app.js` (lines 1400–1418)
```javascript
window.abrirModalCrearAsignaturaDocente = function(origen = 'docente') {
    window._origenModalAsig = origen;
    const modal = document.getElementById("modal-crear-asignatura-docente");
    if (!modal) return;

    modal.style.display = "flex";

    // 1. Renderizar pills de plantillas de áreas fundamentales si el contenedor existe
    const pCont = document.getElementById("modal-asig-presets-container");
    if (pCont && Array.isArray(window.CATALOGO_AREAS_FUNDAMENTALES)) {
        pCont.innerHTML = window.CATALOGO_AREAS_FUNDAMENTALES.map((cat, idx) => `
            <button type="button" onclick="window.seleccionarPlantillaAsignatura(${idx})" style="background: white; border: 1px solid #CBD5E1; color: #1E293B; padding: 4px 10px; border-radius: 16px; font-size: 0.78rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s;" onmouseover="this.style.borderColor='#6366F1'; this.style.background='#EEF2FF';" onmouseout="this.style.borderColor='#CBD5E1'; this.style.background='white';">
                <span>${cat.icono}</span>
                <span>${cat.nombre}</span>
            </button>
        `).join('');
    }

    // 2. Verificar permisos de Director de Grupo / Administrador
    const esDirectorOAdmin = (typeof window.verificarEsDirectorOAdmin === 'function') ? window.verificarEsDirectorOAdmin() : false;

    const gCont = document.getElementById("modal-asig-grados-container");
    const noticeCont = document.getElementById("modal-asig-director-notice");
    const badgeDirector = document.getElementById("modal-asig-director-badge");

    if (esDirectorOAdmin) {
        // DIRECTOR DE GRUPO / ADMIN: Selección completa de grados y cohortes habilitada
        if (badgeDirector) badgeDirector.style.display = "inline-block";
        if (noticeCont) noticeCont.style.display = "none";
        if (gCont) {
            gCont.style.display = "flex";
            const gradosList = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "Ciclo I", "Ciclo II", "Ciclo III", "Ciclo IV", "Ciclo V", "Ciclo VI"];
            gCont.innerHTML = gradosList.map(g => `
                <label style="display: inline-flex; align-items: center; gap: 4px; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 4px 8px; border-radius: 16px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
                    <input type="checkbox" name="modal_asig_grado_check" value="${g}" ${['6','7','8','9','10','11'].includes(g) ? 'checked' : ''}>
                    <span>${g.includes('Ciclo') ? g : g + '°'}</span>
                </label>
            `).join('');
        }
    } else {
        // DOCENTE DE ÁREA (NO DIRECTOR): Ocultar selector y desplegar aviso pedagógico
        if (badgeDirector) badgeDirector.style.display = "none";
        if (noticeCont) noticeCont.style.display = "flex";
        if (gCont) {
            gCont.style.display = "none";
            const gradosBase = ["6", "7", "8", "9", "10", "11"];
            gCont.innerHTML = gradosBase.map(g => `<input type="hidden" name="modal_asig_grado_check" value="${g}">`).join('');
        }
    }
};
```

#### Step 3: Update `window.ejecutarCrearAsignaturaDocenteConIA` in `app.js` (lines 1466–1470)
```javascript
    const gChecks = document.querySelectorAll('input[name="modal_asig_grado_check"]:checked, input[name="modal_asig_grado_check"][type="hidden"]');
    let gradosArr = Array.from(gChecks).map(c => c.value);
    if (gradosArr.length === 0) gradosArr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "Ciclo I", "Ciclo II", "Ciclo III", "Ciclo IV", "Ciclo V", "Ciclo VI"];
```

---

### 4.3 Updates to `docentes.json`

```json
[
    {
        "documento": "123456",
        "clave": "profe123",
        "nombre": "Juan",
        "apellidos": "Pérez",
        "institucion": "IE Instituto Montenegro",
        "tipo": "docente_colegio",
        "es_director": true,
        "grupos_direccion": ["7C"]
    },
    {
        "documento": "tutor123",
        "clave": "tutor123",
        "nombre": "Carlos",
        "apellidos": "Gómez",
        "institucion": "HomeSchool",
        "tipo": "tutor_homeschool",
        "correo": "tutor.carlos@homeschool.edu.co",
        "telefono": "3101234567",
        "es_director": false,
        "grupos_direccion": []
    }
]
```

---

## 5. Verification Method

1. **Static DOM Inspection**:
   - Verify `#modal-asig-grados-wrapper`, `#modal-asig-director-badge`, `#modal-asig-grados-container`, and `#modal-asig-director-notice` exist in `login.html`.
   - Verify `#modal-asig-director-notice` contains text: *"Como docente de área, puedes crear la estructura de la asignatura. La vinculación de cohortes de grupo está reservada para Directores de Grupo."*

2. **Dynamic Behavior Test**:
   - **Case A: Standard Area Teacher (`es_director: false`)**:
     - Set `sessionStorage.setItem('peidagogos_auth', JSON.stringify({ rol: 'docente', es_director: false }))`.
     - Execute `window.abrirModalCrearAsignaturaDocente('docente')`.
     - Assert: `#modal-asig-grados-container` has `style.display === 'none'`.
     - Assert: `#modal-asig-director-notice` has `style.display === 'flex'`.
     - Assert: `#modal-asig-director-badge` has `style.display === 'none'`.
   - **Case B: Director de Grupo (`es_director: true`)**:
     - Set `sessionStorage.setItem('peidagogos_auth', JSON.stringify({ rol: 'docente', es_director: true, grupos_direccion: ['7C'] }))`.
     - Execute `window.abrirModalCrearAsignaturaDocente('docente')`.
     - Assert: `#modal-asig-grados-container` has `style.display === 'flex'`.
     - Assert: `#modal-asig-director-notice` has `style.display === 'none'`.
     - Assert: `#modal-asig-director-badge` has `style.display === 'inline-block'`.
   - **Case C: Admin User (`rol: 'admin'`)**:
     - Set `sessionStorage.setItem('peidagogos_auth', JSON.stringify({ rol: 'admin' }))`.
     - Execute `window.abrirModalCrearAsignaturaDocente('admin')`.
     - Assert: `#modal-asig-grados-container` has `style.display === 'flex'`.
     - Assert: `#modal-asig-director-notice` has `style.display === 'none'`.

3. **Curricular Generation Test**:
   - While logged in as standard area teacher, fill `#modal-asig-nombre` with "Robótica Experimental" and trigger `window.ejecutarCrearAsignaturaDocenteConIA()`.
   - Assert: Subject is created successfully in `asignaturas_personalizadas_db` and its curriculum is generated for default grades without cohort errors.
