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
5. Write your detailed handoff report to d:\Peidagogos_Oficial\.agents\worker_m4\handoff.md with passing build/test results, and send_message when complete.
