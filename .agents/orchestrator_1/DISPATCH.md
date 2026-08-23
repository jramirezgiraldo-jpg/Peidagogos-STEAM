## 2026-08-23T15:12:20Z

Refactor the Peidagogos STEAM teacher and student dashboards in `d:\Peidagogos_Oficial`:
- R1. UI & Role Restrictions (Teacher Dashboard):
  * Improve layout of "Caja de Herramientas" so selecting a box doesn't clutter screen (replaces main view instead of side panel).
  * Add representative icons to subject creation modal and allow creating fundamental subjects.
  * Restrict group selection in subject creation modal: if teacher is NOT "Director de Grupo", only allow creating subject without selecting groups.
- R2. Multi-file Document Ingestion:
  * Modify document upload input in subject creation modal to accept multiple files (up to 20 files: PDF, Word, PPT).
- R3. Dynamic AI Game Generation:
  * For all tools across all Cajas Temáticas (Cajas 1-6), add individual configuration menu before generation.
  * Menu allows "Keywords" OR "Upload a Document" (PDF, Word, PPT, JPG) for AI game generation.
  * Menu includes dropdown of teacher's assigned grades/groups to apply activity.
  * Remove/hide the global top ingestion panel ("INGESTA DE CONTENIDO PARA ESTA CAJA:") from the toolbox category view using non-destructive CSS (`display: none !important;`).
- R4. Student Inbox:
  * Implement "Inbox" (Bandeja de Entrada) in student dashboard for enrolled students.
  * Display notifications of activities assigned, indicating subject and teacher.

## 2026-08-23T16:02:10Z - URGENT User Course Correction on Milestone 3 (R3 Scope Expansion)

1. The dynamic AI generation menu applies to EVERY SINGLE TOOL across ALL Cajas Temáticas (all 42 tools across Cajas 1–6).
2. The global "INGESTA DE CONTENIDO PARA ESTA CAJA:" menu (which sits at the top of the side panels) must be REMOVED / HIDDEN completely (using non-destructive CSS/UI preservation e.g. `display: none !important;`).
3. When a teacher clicks on ANY tool/activity in ANY box, an individual configuration menu must pop up containing:
   - Keywords (for AI generation)
   - Upload Document (for AI generation)
   - A dropdown to select the Grade/Group to assign the activity to.

## 2026-08-23T16:13:04Z - 6 Specific User Fixes for Milestone 3 & Dashboard

1. **Ránking en Vivo**: In the "Ránking en Vivo" tool (where teachers project the leaderboard), ask teacher WHICH GROUP they want to project before opening.
2. **Proyectar QR Matrícula**: Hide this option entirely (`display: none !important;`).
3. **Materias y Grados**: Hide the old redundant "Configuración de Materias y Grados" button/card (`display: none !important;`), keeping only unified "Inscribir Materia".
4. **Diapositivas Semanales**: In the "Generador de Diapositivas Semanales" modal, add the option to upload reference documents (PDF/Word/PPT).
5. **Auxilios Emocionales**: In "Primeros Auxilios Emocionales", remove the "imprimir taller" button and add dynamic AI interactive online activity generation specifically tuned for post-earthquake psychological first aid.
6. **Admin Panel**: DO NOT modify the groups assigned in the admin panel.

## 2026-08-23T20:03:30Z - Orchestrator Generation 3 Resume Instructions
1. Milestone 4 (R4: Student Inbox):
   - In Student Dashboard (`#student-dashboard-container`), verify/render `#student-actividades-container` and `#student-actividades-list` displaying assigned activity cards for the student's enrolled group.
   - Each card displays: Subject name, Teacher name, XP reward (+250 XP), activity title with tool icon, and "Desarrollar Tarea Ahora" button.
   - Clicking "Desarrollar Tarea Ahora" launches `#modal-visor-herramienta` hydrated with the stored `actividad_data` payload.
   - Harmonize frontend `cargarActividadesEstudiante` and backend `/api/actividades-estudiante`.
   - Run Milestone 4 Gate: Spawn 2 Reviewers, 2 Challengers, and 1 Forensic Auditor. Verify tests (`node tests/test_r4_student_inbox.js`, `node test_e2e_runner.js`) and record PASS in GATE_STATUS.md.
2. Execute Final Milestone:
   - Phase 1: Run `node test_e2e_runner.js` and verify 100% of all 52 tests pass across Tiers 1-4.
   - Phase 2: Tier 5 Adversarial Coverage Hardening with Challengers and Worker.
3. When 100% verified and complete, report victory/completion to the parent/user.
