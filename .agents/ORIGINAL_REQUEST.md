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

## Follow-up — 2026-08-24T01:26:19Z

Implementar el módulo completo de **"Director de Grupo"** en el dashboard de docente de Peidagogos STEAM (`login.html` + `app.js`). Cuando un docente ingresa con `rol=director`, debe poder **crear y gestionar su grupo**, ver los grupos donde sus colegas lo han registrado, y generar un link de matrícula para sus estudiantes.

Working directory: `d:\Peidagogos_Oficial`
Integrity mode: development

---

## Context

- SPA en `login.html` con lógica en `app.js` y backend en `server.js` (Node/Express).
- El teacher dashboard actual (`docente-dashboard-container`) ya existe y es funcional.
- El URL de acceso para directores es: `login.html?reg=docente&e=<token>&rol=director`
- La app ya parsea `rol=director` desde la URL y lo guarda en el objeto del usuario como `window.rolDocente`.
- Los docentes están en `/api/docentes` (array con `{ nombre, documento, institucion, rol }`).
- Los grupos/estudiantes están en `/api/estudiantes` y en `localStorage.usuarios_db`.
- La app ya usa `localStorage` como fallback cuando la API falla.
- **Regla crítica**: NO borrar ni sobrescribir elementos HTML existentes. Usar `replace_file_content` o scripts Python con `.replace()` para ediciones quirúrgicas. Nunca usar `write_to_file` con `Overwrite=true` en archivos existentes. Usar CSS `display:none !important` para ocultar, nunca borrar bloques.
- El `window.rolDocente` se puede leer desde cualquier función JS en `app.js`.
- Para commits: usar `git add`, `git commit`, `git push origin master` en PowerShell por separado (NO usar `&&`).

---

## Requirements

### R1. Tab "👥 Mi Grupo" visible solo para Directores de Grupo

En el dashboard de docente (`docente-dashboard-container`), agregar una nueva sección/tab llamada **"👥 Mi Grupo"** que solo sea visible cuando `window.rolDocente === 'director'`. Los docentes regulares NO deben ver esta sección. Implementar con CSS `display:none` por defecto y mostrarla solo cuando el rol sea director.

### R2. Formulario "Crear Mi Grupo"

Dentro de la tab "Mi Grupo", si el director aún no ha creado su grupo, mostrar un formulario con:
- **Grado**: dropdown de `Preescolar`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`
- **Grupo**: dropdown de `A`, `B`, `C`, `D`, `E`, `F`, `G`, `H`, `I`, `J`
- Botón **"✅ Crear Grupo"**

Al crear el grupo, guardar en `localStorage` bajo la clave `grupo_director_<documento_docente>` el objeto: `{ grado, grupo, docentes: [], creadoEn: Date.now() }`. Intentar también un `POST /api/guardar-grupo-director` con fallback a solo localStorage si el endpoint no existe.

### R3. Gestión de Docentes del Grupo

Una vez creado el grupo (el objeto existe en localStorage), mostrar:
- **Lista de todos los docentes** de IE Instituto Montenegro cargados desde `/api/docentes` (filtrar por institución que contenga 'montenegro' case-insensitive), mostrando nombre y si son `director` o `regular`.
- Cada docente tiene un botón **"+ Agregar"** / **"✓ Agregado"** para incluirlo/quitarlo del grupo.
- El array `docentes[]` del objeto en localStorage se actualiza en tiempo real.

### R4. Generador de Link de Matrícula para Estudiantes

Mostrar un botón **"🔗 Generar Link para Estudiantes"** que genere una URL:
```
https://peidagogosteam.com/login.html?reg=estudiante&grupo=<GRADO><GRUPO>&inst=montenegro&director=<documento_director>
```
- Mostrar la URL en un `<input readonly>` copiable con un botón de copiar al portapapeles.
- Cuando un estudiante acceda a ese link, el formulario de registro (en `register-screen-container`) debe pre-llenar automáticamente el campo de grado/grupo con el valor del parámetro `?grupo=` de la URL.

### R5. Sección "📚 Mis Otros Grupos"

Debajo del panel principal, mostrar todos los grupos donde este docente fue registrado por otros directores. Buscar en `localStorage` todas las claves `grupo_director_*` y filtrar aquellas donde el `documento` del docente actual aparezca en el array `docentes[]`. Mostrar cada uno como tarjeta con: Director, Grado, Grupo. Si no hay ninguno, mostrar "Aún no apareces en grupos de otros directores".

---

## Acceptance Criteria

### Visibilidad por rol
- [ ] La tab "👥 Mi Grupo" NO aparece para docentes con `rolDocente === 'regular'`
- [ ] La tab "👥 Mi Grupo" SÍ aparece para docentes con `rolDocente === 'director'`

### Crear grupo
- [ ] El formulario tiene dropdown de grado (Preescolar–11) y grupo (A–J)
- [ ] Al hacer click en "Crear Grupo", se guarda en localStorage y la UI cambia al panel de gestión

### Gestión de docentes
- [ ] Se listan los docentes de IE Instituto Montenegro obtenidos de `/api/docentes`
- [ ] Se puede agregar/quitar docentes del grupo con un click
- [ ] Los cambios persisten en localStorage

### Link de estudiantes
- [ ] El botón genera una URL válida con los parámetros correctos
- [ ] El botón de copiar copia la URL al portapapeles
- [ ] Al acceder al link como estudiante, el formulario de registro pre-llena el campo de grado/grupo

### Mis otros grupos
- [ ] Si fue registrado en otros grupos, aparecen listados
- [ ] Si no hay ninguno, aparece mensaje informativo

### No regresión
- [ ] El panel de estudiante (`student-dashboard-container`) sigue funcionando
- [ ] El panel de admin (`dashboard-screen-container`) sigue funcionando
- [ ] El panel de docente regular sigue funcionando sin cambios visibles
- [ ] No hay `SyntaxError` en la consola del navegador
- [ ] El código pasa a producción con `git push origin master`



