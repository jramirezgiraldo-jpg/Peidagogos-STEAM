# TEST_INFRA.md — Peidagogos STEAM Testing Infrastructure & 4-Tier Strategy

## 1. Test Philosophy
The testing infrastructure for Peidagogos STEAM follows an **opaque-box, requirement-driven, contract-based verification** philosophy:
- **Requirement-Driven**: Tests are derived directly from `ORIGINAL_REQUEST.md`, `PROJECT.md`, and institutional pedagogical workflows.
- **Contract & Observable Verification**: Tests validate DOM structure contracts, event dispatching, API schemas, state transitions in `localStorage`/JSON persistence, and rendered visual badges rather than internal transient variables.
- **Non-Destructive Compliance**: Tests assert that existing DOM nodes, configuration objects, and global handlers (`window.*`) remain intact without breaking existing features.
- **Deterministic & Isolated**: Each test suite initializes its own mock environment or isolated test state, resets fixtures before/after execution, and provides clear diagnostic assertions.

---

## 2. Feature Inventory Mapping

| ID | Feature | Specification Reference | Primary Contract / Interface |
|---|---|---|---|
| **R1-F1** | Toolbox Layout Hub | R1 (Teacher Dashboard) | `#vista-cajas-hub` wraps Level 1 cards; toggling category displays `#vista-categoria-detalle` and hides `#vista-cajas-hub` without clutter |
| **R1-F2** | Subject Modal Icons | R1 (Teacher Dashboard) | `#modal-asig-icono` includes icons for all fundamental subjects (Sciences, Math, Language, Social Studies, English, Physics, Chemistry, etc.) |
| **R1-F3** | Fundamental Subjects Presets | R1 (Teacher Dashboard) | Preset quick-selection for official curriculum subjects in `asignaturas.json` |
| **R1-F4** | Director de Grupo Restriction | R1 (Teacher Dashboard) | `authSes.es_director === true` check; non-directors can create subjects but cannot select/bind groups (`#modal-asig-grados-container` disabled/hidden) |
| **R2-F5** | Multi-file Document Ingestion | R2 (Curriculum Ingestion) | `#modal-asig-archivo` has `multiple` attribute, accepts `.pdf,.doc,.docx,.ppt,.pptx,.txt`, limits to 20 files, aggregates multi-file content |
| **R3-F6** | Caja 2 Pre-Generation Modal | R3 (Dynamic AI Games) | Pre-generation modal `#modal-configuracion-juego-ia` opens for all 10 dynamic games in Caja 2 before generation |
| **R3-F7** | Dual Mode Input (Keywords vs Upload) | R3 (Dynamic AI Games) | Supports Mode 1 (Keywords text) OR Mode 2 (Document upload: PDF, Word, PPT, JPG) |
| **R3-F8** | Teacher Assigned Groups Dropdown | R3 (Dynamic AI Games) | Group dropdown in pre-gen modal is populated dynamically with teacher's assigned groups |
| **R3-F9** | Activity Assignment Dispatch | R3/R4 (Assignment Bridge) | Generates game payload, persists to `actividades_asignadas_db` and backend `POST /api/asignar-actividad` |
| **R4-F10** | Student Inbox UI & Containers | R4 (Student Dashboard) | `#student-actividades-container` contains `#student-actividades-list` and `#badge-actividades-pendientes-count` |
| **R4-F11** | Group-Based Activity Filtering | R4 (Student Dashboard) | Filters activities where `grupo_destino === student.grupo` or `grupo_destino === 'Todos'` |
| **R4-F12** | Notification Card Rendering | R4 (Student Dashboard) | Displays Subject badge (`materia`), Teacher name (`profesor_nombre`), XP reward (`xp_recompensa`), Title, and Status |
| **R4-F13** | Activity Launch & Completion | R4 (Student Dashboard) | Clicking action button opens `#modal-visor-herramienta` with `actividad_data`, records completion and awards XP |

---

## 3. 4-Tier Test Methodology

### Tier 1: Feature Coverage (>=5 Tests per Feature Area)
Direct contract validation for each feature under nominal (happy path) conditions:
- **Suite R1 (UI & Roles)**:
  1. `T1_R1_01`: Verify `#vista-cajas-hub` container wraps Level 1 toolbox cards in `login.html`.
  2. `T1_R1_02`: Verify `abrirDetalleCajaTematica` switches display between Hub and Detail view cleanly.
  3. `T1_R1_03`: Verify `volverACajasHub` restores Hub view and hides Category Detail.
  4. `T1_R1_04`: Verify `#modal-asig-icono` contains comprehensive icons for all fundamental subjects.
  5. `T1_R1_05`: Verify Director de Grupo (`es_director: true`) has group selection enabled in subject modal.
  6. `T1_R1_06`: Verify Non-Director (`es_director: false`) has group selection locked/hidden with warning.

- **Suite R2 (Multi-file Upload)**:
  1. `T1_R2_01`: Verify `#modal-asig-archivo` DOM input has `multiple` attribute.
  2. `T1_R2_02`: Verify `#modal-asig-archivo` accepts `.pdf,.doc,.docx,.ppt,.pptx,.txt`.
  3. `T1_R2_03`: Verify uploading multiple files (e.g. 3 files) populates file queue array `window._archivosAsignaturaDocente`.
  4. `T1_R2_04`: Verify file list rendering displays name and size for all selected files.
  5. `T1_R2_05`: Verify multi-file content aggregation merges text from all uploaded documents into AI context.

- **Suite R3 (AI Games & Pre-Gen Modal)**:
  1. `T1_R3_01`: Verify all 10 tools in Caja 2 trigger pre-generation modal `#modal-configuracion-juego-ia`.
  2. `T1_R3_02`: Verify pre-gen modal toggles between Keywords mode and Document Upload mode.
  3. `T1_R3_03`: Verify group selector in pre-gen modal dynamically lists teacher's assigned groups.
  4. `T1_R3_04`: Verify generation with Keywords produces valid payload structure for target tool.
  5. `T1_R3_05`: Verify generation with Document Upload extracts key concepts and generates game payload.
  6. `T1_R3_06`: Verify activity dispatch writes to `actividades_asignadas_db` and sends `POST /api/asignar-actividad`.

- **Suite R4 (Student Inbox)**:
  1. `T1_R4_01`: Verify `#student-actividades-container` and `#student-actividades-list` exist in Student Dashboard.
  2. `T1_R4_02`: Verify `cargarActividadesEstudiante` retrieves activities and updates pending badge count.
  3. `T1_R4_03`: Verify student in group `7C` receives activities assigned to `7C`.
  4. `T1_R4_04`: Verify activity card renders `materia`, `profesor_nombre`, `xp_recompensa`, and `titulo`.
  5. `T1_R4_05`: Verify clicking "Desarrollar Tarea Ahora" launches `#modal-visor-herramienta` with stored `actividad_data`.

---

### Tier 2: Boundary, Corner Cases & Adversarial Inputs (>=5 Tests per Feature Area)
Edge cases, extreme bounds, malformed inputs, and permission boundaries:
- **Suite R1 (UI & Roles Boundaries)**:
  1. `T2_R1_01`: Teacher with `es_director: undefined` or `null` defaults to restricted mode (fail-safe).
  2. `T2_R1_02`: Admin role bypasses group restriction regardless of `es_director` flag.
  3. `T2_R1_03`: Rapid consecutive category switching does not create lingering duplicate DOM nodes.
  4. `T2_R1_04`: Modal close and re-open preserves Hub view initial state.
  5. `T2_R1_05`: Icon selector handles empty or invalid selection gracefully with default fallback icon.

- **Suite R2 (Multi-file Upload Boundaries)**:
  1. `T2_R2_01`: Exact boundary: Uploading exactly 20 files is accepted without error.
  2. `T2_R2_02`: Overflow boundary: Uploading 21 or more files triggers warning and truncates/rejects excess.
  3. `T2_R2_03`: Zero files: Submitting subject creation without files proceeds using manual inputs.
  4. `T2_R2_04`: Unsupported extension (e.g. `.exe`, `.bin`) is filtered out or rejected with validation message.
  5. `T2_R2_05`: 0-byte (empty) files in multi-upload are handled gracefully without breaking token aggregation.

- **Suite R3 (AI Games Boundaries)**:
  1. `T2_R3_01`: Teacher with empty `grupos` array gets "Todos los Grupos" or default grade fallback.
  2. `T2_R3_02`: Keywords with special characters, accents (`ñ`, `á`, `é`), and punctuation parse cleanly.
  3. `T2_R3_03`: Document upload in pre-gen modal accepts `.jpg, .jpeg, .png` image files and extracts tokens.
  4. `T2_R3_04`: Offline/Fallback generation (`datosDinamicosFallback`) handles all 10 tools without network.
  5. `T2_R3_05`: Dispatching activity with empty title or missing subject generates standardized fallback metadata.

- **Suite R4 (Student Inbox Boundaries)**:
  1. `T2_R4_01`: Empty inbox: Student with 0 assigned activities sees friendly empty-state illustration/text.
  2. `T2_R4_02`: Group isolation: Student in `6A` does NOT see activities assigned exclusively to `7C`.
  3. `T2_R4_03`: Global activities: Student in any group receives activities assigned to `Todos`.
  4. `T2_R4_04`: Completed activity state: Completed tasks display `✅ Completada` and disable re-submission XP abuse.
  5. `T2_R4_05`: Malformed activity data: Activity missing `actividad_data` renders safe error state on launch.

---

### Tier 3: Cross-Feature Integration Workflows
Validates the interconnected flow between Teacher Dashboard, Document Processing, Game Config, and Student Inbox:
- `T3_INT_01`: **Teacher Subject Creation -> Caja 2 Game Generation**:
  Teacher creates "Ciencias Naturales" with 3 curriculum files -> Opens Caja 2 "Sopa de Letras" -> Pre-gen modal auto-suggests "Ciencias Naturales" -> Generates game.
- `T3_INT_02`: **Director Assignment Dispatch -> Student Inbox Consumption**:
  Teacher Juan (`es_director: true`) creates a Jeopardy game assigned to `7C` -> Activity stored in backend & `actividades_asignadas_db` -> Student Clara (`7C`) loads inbox -> Sees notification -> Launches Jeopardy with 25 questions.
- `T3_INT_03`: **Non-Director Teacher Subject & Activity Assignment**:
  Teacher María (`es_director: false`) creates "Inglés" (no group binding) -> Generates "Memory Cards" -> Selects assigned teaching group `6A` in pre-gen modal -> Student Pedro (`6A`) receives notification.
- `T3_INT_04`: **Multi-Game Batch Assignment & Inbox Counters**:
  Teacher assigns 3 different games (Sopa de Letras, Crucigrama, Bingo) to `7C` -> Student Clara's inbox badge updates to `3` -> Completing 1 task decrements badge count to `2`.

---

### Tier 4: Real-World End-to-End Scenarios
Simulates realistic school day sessions across diverse roles and network conditions:
- `T4_SCN_01`: **Full Institutional STEAM Cycle**:
  1. Teacher Juan logs in at Instituto Montenegro.
  2. Opens Caja de Herramientas -> Navigates to Caja 2 without layout clutter.
  3. Configures "Crucigrama Conceptual" using 5 custom keywords for group `7C`.
  4. Assigns activity with 250 XP reward.
  5. Student Clara logs in -> Views notification in Inbox -> Launches Crucigrama -> Completes crossword -> Earns +250 XP -> Dashboard XP bar updates.
- `T4_SCN_02`: **Curriculum Ingestion to Interactive Student Assignment**:
  1. Teacher logs in and uploads 5 curriculum lesson plans (PDF, Word, PPT).
  2. Creates subject "Robótica y Programación".
  3. Generates "Laberinto Lógico" from the uploaded document content.
  4. Assigns to group "8A".
  5. Student in 8A receives assignment with exact document-derived questions and completes it.
- `T4_SCN_03`: **Offline Resilience & Fallback Synchronization**:
  1. Pre-gen modal invoked while offline (AI endpoint unreachable).
  2. Platform falls back to deterministic procedural generator (`datosDinamicosFallback`).
  3. Activity is saved locally to `actividades_asignadas_db`.
  4. Student receives activity from local cache and executes it seamlessly.

---

## 4. Test Execution & Reporting
- **Test Runner**: Native Node.js test harness (`node test_e2e_runner.js`).
- **Modular Test Files**:
  - `tests/test_r1_ui_roles.js` (R1 UI Layout & Role Restrictions)
  - `tests/test_r2_multifile.js` (R2 Multi-file Ingestion)
  - `tests/test_r3_aigames.js` (R3 Dynamic AI Games & Pre-Gen Modal)
  - `tests/test_r4_student_inbox.js` (R4 Student Inbox & Notifications)
  - `tests/test_tier3_cross_features.js` (Tier 3 Integration Workflows)
  - `tests/test_tier4_scenarios.js` (Tier 4 Real-world Scenarios)
- **Output Artifacts**: Comprehensive console test summary with pass/fail statistics per tier, JSON test results report, and `TEST_READY.md`.
