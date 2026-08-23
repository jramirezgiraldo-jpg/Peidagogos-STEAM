# Handoff Report — Survey 3: Student Dashboard & Inbox (R4) and Testing Infrastructure

## 1. Observation

### 1.1 Architecture & Single Page Application (SPA) Routing
- **Primary SPA Container**: `d:\Peidagogos_Oficial\login.html` contains all platform dashboards and views. The router function is `mostrarVista(id, pushState)` defined at `login.html:3421-3460`.
- **Student Dashboard Container**: `<div id="student-dashboard-container" style="display: none; height: 100vh; overflow-y: auto; background-color: #F8FAFC;">` located at `login.html:1706-2056`.
- **Sub-Views and Elements inside `#student-dashboard-container`**:
  1. **Sticky Top Header (`login.html:1708-1740`)**:
     - `#header-student-avatar` (line 1711), `#header-student-name` (line 1712), `#header-student-grade` (line 1715).
     - `#indicador-tiempo-clase-box` / `#txt-tiempo-clase-transcurrido` (line 1722).
     - `#student-score-display` (line 1732).
     - `#btn-guardar-progreso-finalizar-clase` (line 1736).
  2. **Hero Banner (`login.html:1742-1773`)**:
     - `#student-avatar-hero` (line 1747), `#student-welcome-name` (line 1751), `#student-welcome-subtitle` (line 1752), `#student-grade-badge` (line 1754).
     - Level & XP progress bar: `#student-xp-level-name` (line 1765), `#student-xp-progress-text` (line 1766), `#student-xp-progress-bar` (line 1769).
  3. **Main Content Navigation (`login.html:1776-1786`)**:
     - `#student-nav-tabs` (line 1779) containing `#btn-tab-estudiante-materias` (line 1780) and `#btn-tab-estudiante-malla` (line 1783).
  4. **View 1: Asignaturas & Inbox (`login.html:1789-1865`)**:
     - `#banner-bonificacion-alerta` (line 1791), `#banner-penalizacion-alerta` (line 1795), `#banner-pago-estado` (line 1801), `#banner-clase-terremoto-emocional` (line 1806).
     - **Student Inbox Container**: `<div id="student-actividades-container">` (`login.html:1831-1858`), featuring `#badge-actividades-pendientes-count` (`login.html:1840`) and `#student-actividades-list` (`login.html:1855`).
     - **Enrolled Subjects Grid**: `<div id="student-subjects-grid">` (`login.html:1862`).
  5. **View 2: DBA Curriculum Explorer (`login.html:1868-1934`)**:
     - `#vista-estudiante-malla` containing `#select-estudiante-malla-grado` (`login.html:1888`), `#estudiante-malla-pills-container` (`login.html:1919`), and `#estudiante-malla-detalle-container` (`login.html:1930`).
  6. **View 3: Subject Exploration & Guide Generator (`login.html:1937-2054`)**:
     - `#student-subject-view-container` containing `#student-select-periodo` (`login.html:1947`), `#student-select-semana` (`login.html:1956`), `#student-planeacion-contenido` (`login.html:1963`), `#student-quest-container` (`login.html:1967-2012`), and `#student-guide-content` (`login.html:2024-2053`).
  7. **Related Modals in `login.html`**:
     - `#modal-perfil-estudiante` (`login.html:2076-2180`): Profile customization.
     - `#modal-juego-actividad` (`login.html:2262-2293`): Modal runner for student game activities.
     - `#modal-visor-herramienta` (`login.html:2757-2850`): Tool/game runner with stage `#herramienta-stage`.

### 1.2 Student State & Data Persistence Model
- **Student Data Representation**:
  - Found in `d:\Peidagogos_Oficial\usuarios.json` and via API `GET /api/usuarios` / `GET /api/estudiantes` (`server.js:483-484`).
  - Example schema from `usuarios.json:2-18`:
    ```json
    {
        "documento": "18460767",
        "apellidos": "Giraldo",
        "nombre": "Clara",
        "edad": "13",
        "genero": "F",
        "institucion": "InstitutoMontenegro",
        "codigo_institucional": "ieinstituto2026",
        "grado": "7",
        "grupo": "7C",
        "asignatura": "Física, Ética, Turismo",
        "materias": ["Física", "Ética", "Turismo"],
        "pago_activo": true,
        "pago_realizado": true,
        "suscrito": true,
        "tipo_acceso": "institucional_ilimitado"
    }
    ```
- **Client-Side State Storage**:
  - `sessionStorage.getItem('peidagogos_auth')` / `localStorage.getItem('usuario_actual')`: Active session credentials.
  - `window.usuarioEstudianteActual`, `window.usuario_actual`, `window.rol_actual` set in `inicializarPanelEstudiante(data)` (`app.js:529-534`).
  - XP state: `localStorage.getItem('xp_${doc}')`, `bonus_total_${doc}`, `penalty_total_${doc}` (`app.js:560-570`).
  - Student modality distinction:
    - `esHomeSchool`: `data.institucion === 'HomeSchool' || data.rol === 'homeschool' || String(data.grupo || '').startsWith('HS-')` (`app.js:598`).
    - `esValidacionVirtual`: `data.rol === 'validacion' || String(data.grado || data.grupo || '').toLowerCase().includes('ciclo')` (`app.js:599`).
    - `Regular`: Enrolled subjects dynamically retrieved from `data.materias` or `data.asignatura` (`app.js:818-826`).

### 1.3 Student Inbox (Bandeja de Entrada) & Activity Notifications
- **Existing Inbox Rendering Code**:
  - Two implementations of `window.cargarActividadesEstudiante` exist in `app.js`:
    1. `app.js:9163-9271`: Queries `GET /api/actividades-estudiante?documento=${doc}&grupo=${grupo}&grado=${grado}`, falls back to `localStorage.getItem('actividades_asignadas_db')`, renders cards with `window.iniciarJuegoActividad(act.id)` launching `#modal-juego-actividad`.
    2. `app.js:16160-16289`: Reads `localStorage.getItem('actividades_asignadas_db')`, injects demo tasks if empty, filters by `grupo_destino`, renders cards showing subject (`materia`), teacher (`profesor_nombre`), reward (`xp_recompensa`), and button `window.abrirActividadParaEstudiante(act.id)` launching `#modal-visor-herramienta`.
- **Backend Endpoints for Activities** (`server.js:1114-1209`):
  - `GET /api/actividades-asignadas`: Returns entire `actividades_asignadas.json`.
  - `GET /api/actividades-estudiante?documento=...&grupo=...&grado=...`: Filters `actividades_asignadas.json` by student document or group match (`todos`, `homeschool`, matching group, matching grade).
  - `POST /api/asignar-actividad`: Appends a new activity to `actividades_asignadas.json` and alerts Telegram.
  - `POST /api/completar-actividad`: Records `{ documento, fecha, puntaje, xp_ganado, respuestas }` in `act.completada_por`.
- **Notification Schema**:
  ```json
  {
      "id": "act_1724429999999_xyz12",
      "tipo_actividad": "sopa_letras",
      "titulo": "🔤 Sopa de Letras Temática: Ecosistemas y Biodiversidad",
      "destinatario_tipo": "grupo",
      "destinatario_id": "7C",
      "destinatario_nombre": "Grupo 7C",
      "grupo_destino": "7C",
      "materia": "Ciencias Naturales",
      "grado": "7",
      "periodo": "3",
      "tema": "Ecosistemas y Biodiversidad",
      "profesor_nombre": "Lic. Juan Felipe Ramírez Giraldo",
      "creador_id": "123456",
      "xp_recompensa": 250,
      "actividad_data": { ... },
      "fecha_creacion": "2026-08-23T15:15:00.000Z",
      "completada_por": []
  }
  ```

### 1.4 Teacher Assignment Bridge (R3 -> R4)
- **Teacher Assignment Functions in `app.js`**:
  - `asignarHerramientaActualAGrupo()` (`app.js:16075-16157`):
    - Retrieves active tool from `window.herramientaActualActiva`.
    - Reads values from `#visor-select-materia`, `#visor-select-grado`, `#visor-input-tema-personalizado`.
    - Retrieves teacher's assigned groups from `localStorage['docentes_db']` or session.
    - Prompts teacher for group (`grupoElegido`).
    - Captures AI generated payload from `window._cacheDataDinamicaIA`.
    - Sends `POST /api/asignar-actividad` and prepends to `localStorage['actividades_asignadas_db']`.
    - Fires Telegram alert and notifies success.
  - `ejecutarAsignacionActividad()` (`app.js:9071-9150`):
    - Modal-based assignment capturing fields `#asignar-tipo-actividad-seleccionada`, `#asignar-materia-select`, `#asignar-grado-select`, `#asignar-periodo-select`, `#asignar-tema-input`.

### 1.5 Testing Infrastructure
- **Package Configuration (`package.json`)**:
  - Contains dependencies: `@google/genai`, `@supabase/supabase-js`, `archiver`, `cors`, `dotenv`, `express`, `node-cron`, `openai`.
  - Script: `"start": "node server.js"`.
  - No test runners (`jest`, `mocha`, `cypress`, `playwright`, `pytest`) are declared in `package.json`.
- **Existing Custom Test & QA Scripts**:
  - `d:\Peidagogos_Oficial\agente_auditor_qa.js` (362 lines): Custom Node-based QA test engine validating JSON structures (`usuarios.json`, `docentes.json`, `asignaturas.json`), tool rendering, curriculum generation, and network endpoints. Executable directly with `node agente_auditor_qa.js` or via `GET /api/auditor/ejecutar` (`server.js:1385`).
  - `d:\Peidagogos_Oficial\simulacion_e2e.py` (68 lines): Python script launching server subprocess and executing HTTP requests to simulate user registration (`POST /api/registro-estudiante`) and login (`POST /api/login`).
  - `d:\Peidagogos_Oficial\test_logic.py`, `d:\Peidagogos_Oficial\test_login.py`, `d:\Peidagogos_Oficial\test_global.py`: Ad-hoc Python verification scripts.

---

## 2. Logic Chain

1. **SPA Structure**: `login.html` is the central view container where role-based dashboards (`#docente-dashboard-container`, `#student-dashboard-container`, `#tutor-dashboard-container`, `#dashboard-screen-container`) are displayed or hidden via `mostrarVista()`.
2. **Student Lifecycle**:
   - When a student logs in via `POST /api/login` or client-side authentication, `window.inicializarPanelEstudiante(data)` (`app.js:529`) is called.
   - `inicializarPanelEstudiante` sets `window.usuarioEstudianteActual = data`, updates header/hero information, checks student modality (`esHomeSchool`, `esValidacionVirtual`, or regular student), populates `#student-subjects-grid`, and triggers `window.cargarActividadesEstudiante()`.
3. **Inbox Rendering Collision**:
   - `app.js` currently contains two versions of `window.cargarActividadesEstudiante` (lines 9163 and 16160).
   - Line 16160 overrides line 9163 at script evaluation time.
   - Line 16160 expects keys `grupo_destino`, `profesor_nombre`, `xp_recompensa`, `herramienta_id`, while line 9163 expects `destinatario_id`, `destinatario_tipo`, `tipo_actividad`.
   - The backend `server.js:1119-1179` uses `destinatario_id`, `destinatario_tipo`, `tipo_actividad`, `creador_id`.
   - Harmonizing these field names across `server.js` and `app.js` ensures that every assigned activity correctly populates the student's Inbox regardless of whether it was assigned from the Toolbox or the Game modal.
4. **Teacher-to-Student Activity Dispatch Flow**:
   - Teacher opens "Caja 2" (or Toolbox) in teacher dashboard.
   - Teacher selects an activity (e.g., Sopa de Letras), enters keywords/document (R3 menu), and selects an assigned group from a dropdown.
   - Teacher triggers assignment -> calls backend `POST /api/asignar-actividad` and updates `localStorage['actividades_asignadas_db']`.
   - When a student belonging to that group opens their dashboard, `cargarActividadesEstudiante()` filters activities where `destinatario_id == student.grupo` or `destinatario_id == 'Todos'`, displaying the notification card in `#student-actividades-list` with subject, teacher name, XP badge, and status.
   - Clicking "Desarrollar Tarea Ahora" opens the configured game/tool in `#modal-visor-herramienta` or `#modal-juego-actividad`.
   - Completing the task sends `POST /api/completar-actividad`, awards +XP to the student, and updates the task status to "Completada" in the Inbox.
5. **Testing Strategy**:
   - Automated testing can be executed reliably via:
     - Node.js test scripts calling backend endpoints with `fetch` / `http` to test CRUD operations on `actividades_asignadas.json` and student filtering.
     - Integration suite inside `agente_auditor_qa.js` extending `AgenteAuditorQA` with a dedicated `Suite: Student Inbox & Assignment Dispatch`.
     - Headless Python test script (extending `simulacion_e2e.py`) to verify end-to-end teacher assignment and student retrieval.

---

## 3. Caveats

- **No Caveats** on codebase structure: All files, DOM containers, API routes, and data schemas have been located, inspected, and verified.
- **Assumptions**: In the production deployment, students and teachers share the same backend server instance (`server.js`) or local environment, ensuring that `actividades_asignadas.json` and `localStorage['actividades_asignadas_db']` operate in tandem with graceful offline fallback.
- **Duplicate Function Warning**: The two competing definitions of `window.cargarActividadesEstudiante` in `app.js` (lines 9163 and 16160) must be unified during implementation to prevent regression.

---

## 4. Conclusion

The Peidagogos STEAM codebase has all foundational building blocks for R4 (Student Dashboard & Inbox):
1. **DOM Elements**: `#student-dashboard-container`, `#student-actividades-container`, `#badge-actividades-pendientes-count`, and `#student-actividades-list` are already present in `login.html:1706-2056`.
2. **Data Model**: `actividades_asignadas.json` and `usuarios.json` provide complete data models for groups, subjects, teachers, and activity notifications.
3. **Backend API**: `server.js:1114-1209` provides `/api/actividades-estudiante`, `/api/asignar-actividad`, and `/api/completar-actividad`.
4. **Key Refactoring Needed for R4**:
   - Harmonize the activity object fields (`tipo_actividad`/`herramienta_id`, `destinatario_id`/`grupo_destino`, `creador_id`/`profesor_nombre`, `actividad_data`) between backend and frontend.
   - Unify `window.cargarActividadesEstudiante` in `app.js` into a single robust, non-destructive function that supports both online API retrieval and localStorage offline fallback.
   - Connect Teacher Activity Generation (R3 configuration modal with group dropdown) directly into this unified assignment pipeline.
5. **Testing**: Expand `agente_auditor_qa.js` and add an automated Node/Python test script (`test_inbox_e2e.js` / `simulacion_inbox.py`) to validate teacher assignment -> student inbox rendering -> activity completion -> XP increment.

---

## 5. Verification Method

To independently verify these observations:

1. **Verify Student Dashboard DOM**:
   - Inspect `d:\Peidagogos_Oficial\login.html` lines 1706 to 1865 using `view_file` to verify `#student-dashboard-container`, `#student-actividades-container`, and `#student-actividades-list`.
2. **Verify Student Dashboard JS Functions**:
   - Inspect `d:\Peidagogos_Oficial\app.js` lines 529-890 for `inicializarPanelEstudiante()`.
   - Inspect `d:\Peidagogos_Oficial\app.js` lines 9163-9271 and 16160-16289 for `cargarActividadesEstudiante()`.
   - Inspect `d:\Peidagogos_Oficial\app.js` lines 16075-16157 for `asignarHerramientaActualAGrupo()`.
3. **Verify Activity Backend Endpoints**:
   - Inspect `d:\Peidagogos_Oficial\server.js` lines 1114-1209 for `/api/actividades-asignadas`, `/api/actividades-estudiante`, `/api/asignar-actividad`, `/api/completar-actividad`.
4. **Verify Existing QA / Test Runner**:
   - Inspect `d:\Peidagogos_Oficial\agente_auditor_qa.js` lines 1-150 and `simulacion_e2e.py` lines 1-68.
   - Invalidation condition: If any of these files or line numbers are moved or deleted, re-verify with `grep_search`.
