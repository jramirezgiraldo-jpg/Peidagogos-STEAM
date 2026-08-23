# Original User Request

## 2026-08-23T15:11:57Z

# Teamwork Project Prompt — Draft

> Status: Ready for launch — awaiting user approval.
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Refactor the Peidagogos STEAM teacher and student dashboards to improve UI layout, enhance curriculum ingestion (multi-file uploads), restrict group creation to "Group Directors", make the 10 dynamic games AI-generatable from keywords or documents, and add a student Inbox for assigned activities.

Working directory: `d:\Peidagogos_Oficial`

## Requirements

### R1. UI & Role Restrictions (Teacher Dashboard)
- Improve the layout of the "Caja de Herramientas" so that selecting a box doesn't clutter the screen (e.g., replace the main view instead of opening a side panel).
- Add more representative icons to the subject creation modal and allow creating fundamental subjects.
- Restrict group selection in the subject creation modal: if the teacher is NOT a "Director de Grupo", they can only create the subject but not select groups.

### R2. Multi-file Document Ingestion
- Modify the document upload input in the subject creation modal to accept multiple files at once (up to 20 files of type PDF, Word, PPT).

### R3. Dynamic AI Game Generation
- For all 10 tools in "Caja 2: Juegos Dinámicos y Activación" (e.g., Sopa de Letras), add a configuration menu before generation.
- The menu must allow the teacher to input "Keywords" OR "Upload a Document" (PDF, Word, PPT, JPG) for the AI to generate the game content.
- The menu must include a dropdown of the teacher's assigned grades/groups to apply the created activity.

### R4. Student Inbox
- Implement an "Inbox" (Bandeja de Entrada) in the student dashboard for the students enrolled in a group.
- The Inbox must display notifications of activities assigned to them, indicating the subject and the teacher who generated it.

## Acceptance Criteria

### UI & UX
- [ ] Uploading files allows multiple selections (up to 20).
- [ ] "Director de Grupo" constraint logic successfully limits dropdown visibility for other teachers.
- [ ] Sub-menus in the "Caja de Herramientas" take over the view without causing horizontal or vertical layout clutter.

### Student Inbox & AI Games
- [ ] Generating an activity (like a Sopa de Letras) displays the configuration menu (Keywords/Upload) before proceeding.
- [ ] Creating an activity pushes a notification object to the Student Inbox state.
- [ ] The Student Dashboard correctly renders the notification.

## Follow-up — 2026-08-23T16:01:39Z

URGENT COURSE CORRECTION FROM USER:

The user has modified the scope of Milestone 3 (R3). 
Instead of only applying the dynamic AI generation menu to the 10 games in "Caja 2", the user wants it to apply to **EVERY SINGLE TOOL across ALL Cajas Temáticas**.

Furthermore, the user wants the global "INGESTA DE CONTENIDO PARA ESTA CAJA:" menu (which currently sits at the top of the side panels) to be **REMOVED completely**.

Instead, when a teacher clicks on ANY tool/activity in ANY box, an individual configuration menu should pop up. This menu must contain:
1. Keywords (for AI generation)
2. Upload Document (for AI generation)
3. A dropdown to select the Grade/Group to assign the activity to.

Please update the `PROJECT.md` and instruct your Explorers for Milestone 3 to implement this per-tool modal instead of the global side-panel ingestion form.

## Follow-up — 2026-08-23T16:12:20Z

ADDITIONAL INSTRUCTIONS FROM USER:

Please integrate these additional fixes into your current and upcoming Milestones:

1. **Ránking en Vivo**: In the "Ránking en Vivo" tool (where teachers project the leaderboard), it currently opens directly. It must first ask the teacher WHICH GROUP they want to project.
2. **Proyectar QR Matrícula**: Hide this option entirely (e.g. `display: none !important`). The user said: "sobra porque ya al inicio hay la opcion de generar el link y QR de matricula".
3. **Materias y Grados**: The user noticed that "Configuración de Materias y Grados" and "Inscribir Materia Nueva" are redundant now that you allowed creating fundamental subjects in the latter. Hide the old "Configuración de Materias y Grados" button/modal, keeping only the unified "Inscribir Materia" modal you built.
4. **Diapositivas Semanales**: In the "Generador de Diapositivas Semanales" modal, make sure you add the option to upload PDF/Word/PPT documents (which aligns with your new global ingestion logic).
5. **Auxilios Emocionales**: In the "Primeros Auxilios Emocionales" modal, the user doesn't want something to "imprimir taller". They want online, interactive activities designed for post-earthquake psychological first aid. Please remove the print button and apply the dynamic AI generation logic here too, but specifically tuned for post-earthquake activities.
6. **Admin Panel**: "en mi panel de administrador, no modifiques los grupos que tengo asignados." DO NOT modify the groups assigned in the admin panel.


