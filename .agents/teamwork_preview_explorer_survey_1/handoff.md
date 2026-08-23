# Handoff Report: Peidagogos STEAM Dashboard Architecture & Refactor Survey

## 1. Observation

### 1.1 Project Structure & Tech Stack
- **Architecture**: Single Page Application (SPA) with Vanilla JavaScript, HTML5, CSS3, Google Fonts (Outfit, Inter), and Phosphor Icons.
- **Frontend Entry Point**: `d:\Peidagogos_Oficial\login.html` (4,352 lines, 395 KB). Contains all view containers (`#docente-dashboard-container`, `#student-dashboard-container`, `#dashboard-screen-container`, `#tutor-dashboard-container`, `#login-screen-container`, `#register-screen-container`) and all modal dialogs.
- **Core Frontend Logic**: `d:\Peidagogos_Oficial\app.js` (16,383 lines, 1,023 KB). Manages authentication, SPA view toggling, subject creation, curriculum DBA generation, toolbox modal workflows, 42 tool sandbox renderers, group creation, student inbox, and offline/local storage state.
- **Backend**: `d:\Peidagogos_Oficial\server.js` (1,434 lines, Node.js + Express 5.x) providing endpoints:
  - `/api/login` (lines 1006-1146)
  - `/api/generate-tool-ai` (lines 862-910)
  - `/api/generate-guide` (lines 96-489)
  - `/api/asignar-actividad` (lines 1147-1180)
  - `/api/completar-actividad` (lines 1181-1215)
  - `/api/registro-estudiante`, `/api/registro-docente`, `/api/registro-tutor`
- **Data Persistence**: Local files (`usuarios.json`, `docentes.json`, `asignaturas.json`, `actividades_asignadas.json`) synchronized with `localStorage` keys (`usuarios_db`, `docentes_db`, `docentes_por_grupo_db`, `asignaturas_personalizadas_db`, `mallas_personalizadas_db`, `actividades_asignadas_db`, `usuario_sesion`) and `sessionStorage` (`peidagogos_auth`).

---

### 1.2 Teacher Dashboard Architecture
- **DOM Container**: `<div id="docente-dashboard-container">` (`login.html`: lines 591–874).
- **Header**: Contains official logo (`logo-peidagogos.png`, 85px), teacher name (`#docente-nombre-header`), institution name (`#docente-institucion-subhead`), and logout button (`location.reload()`).
- **Main Sections**:
  1. **Centro de Servicios y Herramientas Pedagógicas (10 Modules)** (`login.html`: lines 616–800):
     - Module 1: *Crear Asignatura (IA)* (`window.abrirModalCrearAsignaturaDocente('docente')`)
     - Module 2: *Mis Materias y Grados* (`window.abrirModalGestionMateriasGradosDocente()`)
     - Module 3: *Caja STEAM (42 Apps)* (`window.abrirCajaHerramientas('todas', 'docente')`)
     - Module 4: *10 Diapositivas Semanales* (`window.abrirConfiguradorDiapositivas('docente')`)
     - Module 5: *Modo Proyector (Sin PC)* (`proyector.html`)
     - Module 6: *Proyectar QR Matrícula* (`proyector-qr.html`)
     - Module 7: *Ránking en Vivo* (`window.abrirRankingDocenteNuevaPestana()`)
     - Module 8: *Auxilios Emocionales* (`window.abrirClasePrimerosAuxiliosEmocionales('docente')`)
     - Module 9: *Agente Auditor QA* (`window.abrirModalAuditorQA()`)
     - Module 10: *Invita y Gana* (`mostrarReferidos()`)
  2. **Mis Grupos Asignados y Aulas** (`login.html`: lines 802–826):
     - Header with "Crear Nuevo Grupo / Aula" button (`window.abrirModalCrearGrupoDocente()`) and total students badge (`#docente-total-estudiantes-badge`).
     - Dynamic grid container: `<div id="docente-grid-cajones-grupos">` rendered by `window.renderizarCajonesGrandesGruposDocente` (`app.js`: lines 14877–15016).
  3. **Planilla de Estudiantes Matriculados** (`login.html`: lines 829–872):
     - Container: `<div id="docente-vista-detalle-grupo">`.
     - Student search: `<input id="buscador-estudiante-grupo">`.
     - Table body: `<tbody id="tbody-docente-estudiantes">`.

---

### 1.3 R1: Caja de Herramientas Layout & Clutter Mechanics
- **Modal Container**: `<div id="modal-caja-herramientas">` (`login.html`: lines 2473–2752).
- **Navigation Structure in `app.js`**:
  - `window.METADATOS_CAJAS_TEMATICAS` (`app.js`: lines 11337–11344):
    - `imprimibles`: Caja 1 - Planificación Curricular (7 Herramientas)
    - `juegos`: Caja 2 - Juegos Dinámicos y Activación (10 Herramientas)
    - `aula`: Caja 3 - Gestión de Aula y Pantalla Gigante (6 Herramientas)
    - `visual`: Caja 4 - Pensamiento Visual & Mentefactos (8 Herramientas)
    - `evaluacion`: Caja 5 - Evaluación y Diseño Curricular (5 Herramientas)
    - `homeschool`: Caja 6 - Organización y Home School (6 Herramientas)
  - Navigation functions:
    - `window.abrirCajaHerramientas(categoria, rol)` (`app.js`: lines 11346–11357)
    - `window.volverACajasHub()` (`app.js`: lines 11364–11369): Sets `document.getElementById('vista-cajas-hub').style.display = 'flex'` and `document.getElementById('vista-categoria-detalle').style.display = 'none'`.
    - `window.abrirDetalleCajaTematica(categoria)` (`app.js`: lines 11371–11386): Sets `document.getElementById('vista-cajas-hub').style.display = 'none'` and `document.getElementById('vista-categoria-detalle').style.display = 'flex'`.
- **Root Cause of Clutter**:
  - In `login.html` (lines 2493–2632), the Level 1 DOM elements (Hero card + 5 secondary cards) are NOT wrapped inside `<div id="vista-cajas-hub">`.
  - When `window.abrirDetalleCajaTematica()` executes `const hub = document.getElementById('vista-cajas-hub')`, `hub` is `null`. The Level 1 cards are never hidden.
  - Consequently, both Level 1 (the 6 boxes) and Level 2 (`#vista-categoria-detalle` with its ingestion controls and the 10 tool cards) render simultaneously in the same scrollable container, producing massive vertical and visual clutter.
  - Furthermore, clicking "Generar y Abrir" opens `#modal-visor-herramienta` (`login.html`: lines 2757–2900) as a 3rd overlapping fullscreen modal layer.

---

### 1.4 R1: Subject Creation Modal, Icons, Fundamental Subjects & Role Restrictions
- **Modal Container**: `<div id="modal-crear-asignatura-docente">` (`login.html`: lines 3052–3123).
- **Current Icon Selector**: `<select id="modal-asig-icono">` (`login.html`: lines 3072–3082) contains only 9 specialty icons:
  `🤖 Robótica`, `💡 Emprendimiento`, `🕊️ Paz`, `📊 Estadística`, `🎨 Diseño y Artes`, `🌱 Agroecología`, `🎼 Música`, `🔬 Investigación`, `💻 Programación`.
  - *Missing fundamental subject icons*: `🌿 Ciencias Naturales`, `🧬 Biología`, `⚛️ Física`, `🧪 Química`, `📐 Matemáticas`, `📖 Lengua Castellana`, `🌍 Ciencias Sociales`, `🇬🇧 Inglés / Idiomas`, `🖥️ Tecnología e Informática`, `⚽ Educación Física`, `🏛️ Filosofía`, `🤝 Ética y Valores`, `🧭 Turismo y Patrimonio`.
- **Fundamental Subjects Definition**:
  - `asignaturas.json` defines official curricular subjects: *Ciencias Naturales*, *Matemáticas*, *Lengua Castellana*, *Ciencias Sociales*, *Inglés*, *Física*, *Química*, *Artística*, *Ética*, *Tecnología*, *Turismo*, *Filosofía*.
  - Subject creation currently relies on generic AI generation (`window.procesarDocumentoYCrearMalla`, `app.js`: line 1488) which does not offer quick presets for fundamental subjects.
- **"Director de Grupo" Role & Group Selection**:
  - Teachers data model in `docentes.json` & `docentes_db`:
    ```json
    {
      "documento": "123456",
      "nombre": "Juan",
      "apellidos": "Pérez",
      "institucion": "IE Instituto Montenegro",
      "tipo": "docente_colegio",
      "rol": "docente",
      "es_director": true,
      "grupos_direccion": ["7C"],
      "grados": ["6", "7", "8", "9"],
      "grupos": [{"nombre": "7C", "grado": "7", "materia": "Ciencias Naturales"}]
    }
    ```
  - In `app.js` (lines 1406–1416), `window.abrirModalCrearAsignaturaDocente` renders checkboxes for grades 1–11 and Ciclos I–VI unconditionally in `#modal-asig-grados-container`.
  - There is currently no restriction checking whether `authSes.es_director === true` or whether the teacher is assigned as director of the group. If the teacher is NOT a "Director de Grupo", they should be able to define the subject details without binding groups or assigning group cohorts.

---

### 1.5 R2: Document Upload Input in Subject Creation Modal
- **DOM Element**: `<input type="file" id="modal-asig-archivo" accept=".pdf,.docx,.doc,.txt,.json,.csv" onchange="window.manejarArchivoAsignaturaDocente(event)" style="display: none;">` (`login.html`: line 3103).
  - *Deficiencies*: Lacks `multiple` attribute. Accepts `.json` and `.csv` which are not primary document formats requested, while PPT (`.ppt`, `.pptx`) is missing.
- **Handling Function**: `window.manejarArchivoAsignaturaDocente` (`app.js`: lines 1428–1447):
  ```javascript
  window.manejarArchivoAsignaturaDocente = function(event) {
      const file = event.target.files ? event.target.files[0] : null;
      if (!file) return;
      window._nombreArchivoAsignaturaDocente = file.name;
      ...
      const reader = new FileReader();
      reader.onload = function(e) {
          window._textoDocumentoAsignaturaDocente = String(e.target.result || '');
      };
      reader.readAsText(file);
  };
  ```
  - *Deficiencies*:
    1. Handles only `files[0]` (single file).
    2. Overwrites `window._textoDocumentoAsignaturaDocente` on every upload instead of aggregating an array of up to 20 files.
    3. Uses `readAsText()`, which fails on binary files (`.pdf`, `.docx`, `.doc`, `.pptx`, `.ppt`), producing corrupted text strings.
    4. Lacks multi-file preview UI with file tags, size indicators, delete buttons, and 20-file cap validation.

---

### 1.6 R3 & R4: AI Game Generation & Student Inbox Architecture
- **Caja 2 (10 Dynamic Games)**:
  `sopa_letras`, `crucigrama`, `memory_cards`, `bingo_steam`, `jeopardy`, `criptograma`, `domino_conceptual`, `sudoku_steam`, `laberinto_logico`, `pictionary_tabu`.
- **Pre-Generation Configuration Flow**:
  - Currently, clicking any game in `#grid-caja-herramientas-cards` directly invokes `window.abrirVisorHerramienta(tool.id)` (`app.js`: line 11417).
  - A pre-generation modal must intercept game selection to allow the teacher to:
    1. Choose input source: Keywords/DBA vs Document Upload (PDF, Word, PPT, JPG).
    2. Select target grade/group from the teacher's assigned groups dropdown.
    3. Generate dynamic content via `/api/generate-tool-ai` and immediately create the assignment.
- **Student Inbox**:
  - DOM: `#student-actividades-container` (`login.html`: lines 1831–1858) containing `#student-actividades-list` and `#badge-actividades-pendientes-count`.
  - State Sync: `window.cargarActividadesEstudiante()` (`app.js`: lines 16160–16289) reads from `actividades_asignadas_db` and `/api/asignar-actividad`, filtered by the student's `grupo` and `grado`.
  - Activity Object Structure:
    ```javascript
    {
      id: 'act_' + Date.now(),
      titulo: '🔤 Sopa de Letras: Fotosíntesis',
      herramienta_id: 'sopa_letras',
      herramienta_titulo: 'Sopa de Letras Temática',
      herramienta_icono: '🔤',
      materia: 'Ciencias Naturales',
      grado: '7',
      grupo_destino: '7C',
      profesor_nombre: 'Lic. Juan Felipe Ramírez Giraldo',
      profesor_doc: '109772671',
      tema: 'Fotosíntesis y Cloroplastos',
      xp_recompensa: 250,
      actividad_data: { ... },
      fecha_creacion: '2026-08-23',
      completada_por: []
    }
    ```

---

## 2. Logic Chain

```
[Observation: Missing <div id="vista-cajas-hub"> in login.html:2493]
      │
      ▼
[Inference: abrirDetalleCajaTematica() cannot hide Level 1 cards]
      │
      ▼
[Conclusion R1: Wrapping Level 1 in #vista-cajas-hub and cleaning modal CSS resolves vertical clutter]

--------------------------------------------------------------------------------

[Observation: modal-asig-icono has 9 niche options; no fundamental areas]
      │
      ▼
[Inference: Teachers creating math, science, language, social studies cannot select representative icons]
      │
      ▼
[Conclusion R1: Expand select with 15+ official subject icons and fundamental presets from asignaturas.json]

--------------------------------------------------------------------------------

[Observation: modal-asig-grados-container renders unconditionally for all teachers]
      │
      ▼
[Inference: Non-director teachers can bind groups without authorization]
      │
      ▼
[Conclusion R1: Inspect authSes.es_director; if false, display subject-only mode without group assignment]

--------------------------------------------------------------------------------

[Observation: modal-asig-archivo lacks 'multiple', accepts single file, uses readAsText]
      │
      ▼
[Inference: Multi-document ingestion fails; binary formats corrupted]
      │
      ▼
[Conclusion R2: Add multiple, accept=".pdf,.doc,.docx,.ppt,.pptx,.txt", enforce 20-file cap, multi-file UI]

--------------------------------------------------------------------------------

[Observation: abrirVisorHerramienta() runs immediately without group/document selector]
      │
      ▼
[Inference: Games cannot be configured or assigned directly per group]
      │
      ▼
[Conclusion R3 & R4: Introduce pre-generation modal for the 10 games with Keywords/Upload + Group dropdown, dispatching notifications to Student Inbox]
```

---

## 3. Caveats
1. **Monolithic `app.js` (16,383 lines)**: Edits to `app.js` must be surgical and verified to prevent unintentional syntax errors or variable collisions. Full overwrites are strictly prohibited per project rules.
2. **Binary Document Parsing on Client-Side**: Browser `FileReader` cannot extract text from binary `.docx` or `.pptx` or `.pdf` without library decoders (e.g. `pdfjs`, `mammoth`). For binary files, file metadata and filename/text extraction or backend forwarding must provide reliable concept fallback without crashing `FileReader`.
3. **Backward Compatibility with Existing Data**: Existing records in `localStorage` (`usuarios_db`, `docentes_db`, `mallas_personalizadas_db`) must be handled defensively with null checks and default fallbacks.

---

## 4. Conclusion & Actionable Blueprint

### R1. UI & Role Restrictions (Teacher Dashboard)
1. **Caja de Herramientas**:
   - Wrap lines 2495–2632 in `login.html` inside `<div id="vista-cajas-hub" style="display: flex; flex-direction: column; gap: 18px;">`.
   - Ensure `abrirDetalleCajaTematica` and `volverACajasHub` toggle `#vista-cajas-hub` and `#vista-categoria-detalle` cleanly with smooth transitions.
2. **Subject Creation Icons & Fundamentals**:
   - Update `<select id="modal-asig-icono">` with comprehensive icons (🌿, 📐, 📖, 🌍, 🇬🇧, 🔬, 🧪, ⚛️, 💻, 🤖, 🎨, ⚽, 🏛️, 🤝, 🧭).
   - Add a "Tipo de Asignatura" selector (Fundamental MEN vs. Innovación STEAM/Electiva).
3. **Director de Grupo Role Check**:
   - Check `authSes.es_director || authSes.rol === 'admin'` in `window.abrirModalCrearAsignaturaDocente`.
   - If not director, hide group assignment controls and inform the teacher: *"Solo los Directores de Grupo pueden vincular cohortes de estudiantes. Puedes crear la estructura curricular de la asignatura."*

### R2. Multi-File Document Ingestion
1. Add `multiple` and update `accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"` on `#modal-asig-archivo`.
2. Implement `window._archivosAsignaturaDocente = []` holding up to 20 files.
3. Add a multi-file badge list UI showing loaded files with individual file sizes, remove buttons, and a clear-all button.
4. Update `window.ejecutarCrearAsignaturaDocenteConIA` to aggregate contents/names across all loaded files.

### R3 & R4. Dynamic AI Game Generation & Student Inbox
1. Add a dedicated Game Config Modal for the 10 games in Caja 2 before generation.
2. In the modal:
   - Tabs: 🏷️ Keywords / DBA vs 📄 Document Upload (PDF, Word, PPT, JPG).
   - Dropdown: Teacher's assigned groups (`docItem.grupos`).
3. On generation: Call `/api/generate-tool-ai`, build the activity object, push to `actividades_asignadas_db` and `/api/asignar-actividad`.
4. Student Inbox (`#student-actividades-container` and `cargarActividadesEstudiante`) renders the notification with subject, teacher name, XP badge, and direct solver button.

---

## 5. Verification Method

1. **DOM Structure Verification**:
   - Inspect `login.html` lines 2470–2760 in browser or IDE to verify `#vista-cajas-hub` cleanly encloses Level 1 cards and `#vista-categoria-detalle` encloses Level 2 cards.
2. **Toolbox Navigation Test**:
   - In Teacher Dashboard, click "🧰 Abrir Caja STEAM". Verify Level 1 shows 6 boxes.
   - Click "🕹️ Caja 2: Juegos Dinámicos". Verify Level 1 disappears completely and Level 2 appears without vertical stacking or duplicate scrollbars.
   - Click "◀ Volver a las 6 Cajas Temáticas". Verify return to Level 1.
3. **Subject Creation & Role Test**:
   - Login as standard teacher (`es_director: false`). Open "Crear Asignatura (IA)". Verify group selection is hidden/restricted.
   - Login as Director de Grupo (`es_director: true`). Verify group selection is accessible.
   - Verify all new icons (Naturales, Matemáticas, Castellano, Sociales, Inglés, etc.) are present in the dropdown.
4. **Multi-File Upload Test (up to 20 files)**:
   - In subject creation modal, select 5 to 20 files (`.pdf`, `.docx`, `.pptx`).
   - Verify UI displays all file names, total file count, and does not throw `FileReader` exceptions.
5. **AI Game Generation & Inbox Test**:
   - In Caja 2, choose Sopa de Letras, enter keywords, select group "7C", and click Generate.
   - Log in as student in group "7C". Open dashboard and verify new activity appears in "Buzón de Tareas y Misiones Asignadas" with subject, teacher name, and "Desarrollar Tarea Ahora" button.
