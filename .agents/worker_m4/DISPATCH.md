## 2026-08-23T20:07:54Z
You are the Worker for Milestone 4 (R4: Student Inbox).
Your Working Directory: d:\Peidagogos_Oficial\.agents\worker_m4

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY USER RULES (RULE[non_destructive_editing.md]):
1. Cero Sobreescrituras Completas: Nunca sobrescribir archivos completos (write_to_file con Overwrite=True). Usa replace_file_content o scripts quirúrgicos.
2. Preservación del DOM e Interfaz: Nunca elimines bloques HTML, botones, modales o scripts existentes, a menos que el usuario lo indique explícitamente.
3. Uso de CSS para Ocultar: Si una funcionalidad no debe verse, usa CSS (display: none !important;).
4. Preservación de Variables de Estado: Nunca borres propiedades de objetos de configuración ni funciones globales.

Reference Files:
- d:\Peidagogos_Oficial\.agents\ORIGINAL_REQUEST.md
- d:\Peidagogos_Oficial\PROJECT.md
- d:\Peidagogos_Oficial\.agents\rules\non_destructive_editing.md
- d:\Peidagogos_Oficial\tests\test_r4_student_inbox.js
- d:\Peidagogos_Oficial\test_e2e_runner.js
- Explorer Reports:
  * d:\Peidagogos_Oficial\.agents\explorer_m4_1\handoff.md
  * d:\Peidagogos_Oficial\.agents\explorer_m4_2\handoff.md
  * d:\Peidagogos_Oficial\.agents\explorer_m4_3\handoff.md

Tasks:
1. Review login.html: Ensure #student-actividades-container, #badge-actividades-pendientes-count, #student-actividades-list, #modal-visor-herramienta, and #student-score-display are preserved.
2. In app.js:
   - Unify and update window.cargarActividadesEstudiante (around lines 17193-17322) to query /api/actividades-estudiante and merge with localStorage.getItem('actividades_asignadas_db'). Render cards with Subject badge, Teacher name, +250 XP reward badge, Title with icon, Pending/Completed badge, and action buttons ('🚀 Desarrollar Tarea Ahora ➔' / '🔄 Repasar Actividad Resuelta').
   - In window.finalizarTareaEstudiante (around lines 17385-17415), push full completion object { documento: docEstudiante, fecha: new Date().toISOString(), puntaje: 100, xp_ganado: xpPremio } into completada_por, update +250 XP, update #student-score-display, and dispatch a non-blocking fetch('/api/completar-actividad', ...).
   - Ensure window.abrirActividadParaEstudiante hydrates window._cacheDataDinamicaIA with act.actividad_data and mounts into #modal-visor-herramienta.
3. In server.js (line 1251): Ensure default xp_ganado is 250.
4. Run tests:
   - node tests/test_r4_student_inbox.js
   - node test_e2e_runner.js
35: 5. Write your detailed handoff report to d:\Peidagogos_Oficial\.agents\worker_m4\handoff.md with passing build/test results, and send_message when complete.
36: 
37: ## 2026-08-24T01:38:00Z
38: You are Worker 1 for the "Director de Grupo" module implementation in Peidagogos STEAM.
39: 
40: SCOPE OF IMPLEMENTATION (Requirements R1 to R5):
41: - R1: Add `#docente-nav-tabs` (`#btn-tab-docente-herramientas` and `#btn-tab-docente-mi-grupo`) in `login.html`. Enclose existing tool cards in `#vista-docente-herramientas`. Add `#vista-docente-mi-grupo` (hidden by default). In `app.js`, show `#btn-tab-docente-mi-grupo` (`display: flex`) ONLY when `window.rolDocente === 'director'`; hide it (`display: none`) when `'regular'`. Implement smooth tab switching with `window.cambiarTabDocente(tab)`.
42: - R2: In `#vista-docente-mi-grupo`, if no group is created in `localStorage.getItem('grupo_director_' + doc)`, render creation form with:
43:   * Grado dropdown: `Preescolar`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`
44:   * Grupo dropdown: `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`
45:   * Button "✅ Crear Grupo"
46:   * On submit: save `{ grado, grupo, docentes: [], creadoEn: Date.now(), directorDoc: doc, directorNombre: nom }` to `localStorage.getItem('grupo_director_' + doc)`. Also trigger `POST /api/guardar-grupo-director` with try-catch fallback. Immediately re-render to the group management panel.
47: - R3: In group management panel, display group title (e.g. "Grupo 7° C"). Load teachers from `/api/docentes` (merged with `localStorage.docentes_db`), filter for Montenegro institution (`institucion.toLowerCase().includes('montenegro')`). Show name, role badge (`Director` vs `Docente Regular`), and button `+ Agregar` / `✓ Agregado`. Clicking button toggles the teacher in `grupoData.docentes[]` in `localStorage` in real-time.
48: - R4: Display student registration link generator with:
49:   * Input readonly containing: `https://peidagogosteam.com/login.html?reg=estudiante&grupo=<GRADO><GRUPO>&inst=montenegro&director=<doc>`
50:   * Button "📋 Copiar Link" (copies to clipboard with feedback)
51:   * Button "📲 WhatsApp"
52:   * In `window.verificarParametrosMatriculaDirecta` in `app.js`: when student opens URL with `?reg=estudiante&grupo=...&inst=montenegro&director=...`, auto-open `register-screen-container`, set `#reg-ie` to `InstitutoMontenegro`, set `#reg-grado` and `#registro-grupo` to the group value, set `window.directorMatriculaActual`, and run `actualizarMaterias()`.
53: - R5: Add "📚 Mis Otros Grupos" section at the bottom of the view. Scan `localStorage` for all keys starting with `grupo_director_` where `docentes[]` contains the current teacher's document. Render cards with Director name, Grado, Grupo, date, or display `"Aún no apareces en grupos de otros directores"` if none.
54: - Backend (`server.js`): Surgically add `POST /api/guardar-grupo-director` and `GET /api/grupos-director` without altering any existing routes or handlers.
55: 
56: VERIFICATION:
57: - Create an automated test suite `tests/test_director_grupo.js` covering R1-R5.
58: - Run `node tests/test_director_grupo.js` and all existing tests (`node test_e2e_runner.js`).
59: - Verify syntax with `node -c server.js` and `node -c app.js`.
60: - Deliver a comprehensive handoff report with exact changes and test execution logs.
