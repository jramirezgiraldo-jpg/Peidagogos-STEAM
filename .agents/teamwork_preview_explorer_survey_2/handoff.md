# Handoff Report: Survey 2 — R3 Dynamic AI Game Generation

## 1. Observation

### 1.1 Enumeration of All 10 Tools/Games in "Caja 2: Juegos Dinámicos y Activación"
In `d:\Peidagogos_Oficial\app.js` (lines 10836–10926) and `d:\Peidagogos_Oficial\login.html` (lines 2526–2545), all 10 tools are registered with `categoria: 'juegos'` within `window.LISTA_HERRAMIENTAS_PEDAGOGICAS`:

| # | Tool ID (`id`) | Tool Title (`titulo`) | Icon (`icono`) | Description (`desc`) | Registered Renderer Function (`app.js`) |
|---|---|---|---|---|---|
| 1 | `sopa_letras` | Sopa de Letras Temática | 🔤 | Matriz interactiva con pistas deductivas y generador de hoja con solucionario en PDF. | `window.renderizarSopaLetrasTool(stage, base)` (line 12221) |
| 2 | `crucigrama` | Crucigrama Conceptual | 🧩 | Cuadrícula con definiciones horizontales y verticales autovalidadas con hoja de respuestas. | `window.renderizarCrucigramaTool(stage, base)` (line 12263) |
| 3 | `memory_cards` | Duelo de Emparejamiento (Memory) | 🃏 | Juego de cartas volteables para asociar Conceptos y Definiciones, y fichas recortables. | `window.renderizarMemoryCardsTool(stage, base)` (line 12507) |
| 4 | `bingo_steam` | Bingo Pedagógico STEAM | 🎯 | Balotera digital proyectable que canta conceptos y generador de 30 cartones únicos en PDF. | `window.renderizarBingoSteamTool(stage, base)` (line 12040) |
| 5 | `jeopardy` | Tablero Concurso Jeopardy ($100-$500) | 🎪 | Tablero gigante de 5 categorías con 25 preguntas y pulsadores de equipo para pantalla grande. | `window.renderizarJeopardyTool(stage, base)` (line 11996) |
| 6 | `criptograma` | Criptogramas y Anagramas Secretos | 🔠 | Mensajes científicos cifrados con tablas de sustitución y retos de decodificación. | `window.renderizarCriptogramaTool(stage, base)` (line 12532) |
| 7 | `domino_conceptual` | Dominó Conceptual de Saberes | 🧱 | Fichas de dominó con conceptos en un extremo y definiciones en el otro para encadenar en mesa. | `window.renderizarDominoConceptualTool(stage, base)` (line 12560) |
| 8 | `sudoku_steam` | Sudoku y Kakuro Lógico STEAM | 🔢 | Cuadrículas de lógica matemática con números o símbolos STEAM de 4x4 y 6x6. | `window.renderizarSudokuSteamTool(stage, base)` (line 12582) |
| 9 | `laberinto_logico` | Laberinto Lógico de Decisiones | 🗺️ | Laberinto interactivo donde avanzar requiere responder preguntas conceptuales correctas. | `window.renderizarLaberintoLogicoTool(stage, base)` (line 12598) |
| 10 | `pictionary_tabu` | Ruleta Pictionary y Tabú STEAM | 🎭 | Tarjetas de reto: explica un concepto mediante mímica o dibujo sin decir palabras prohibidas. | `window.renderizarPictionaryTabuTool(stage, base)` (line 12600) |

### 1.2 Current Tool Launch and Generation Flow
- **Entry point in UI**: In `login.html` (lines 2526–2545), clicking on the Caja 2 card triggers `window.abrirDetalleCajaTematica('juegos')`.
- **Card Rendering**: `window.renderizarTarjetasCajaHerramientas('juegos')` (`app.js`, lines 11388–11414) generates 10 cards inside `#grid-caja-herramientas-cards`. Each card contains a button:
  ```html
  <button onclick="window.abrirVisorHerramienta('${tool.id}')"><span>⚡</span> Generar y Abrir</button>
  ```
- **Visor Invocation**: In `window.abrirVisorHerramienta(herramientaId)` (`app.js`, lines 11417–11471):
  1. Finds tool in `window.LISTA_HERRAMIENTAS_PEDAGOGICAS`.
  2. Syncs global inputs (`toolbox-materia-select`, `toolbox-grado-select`, `toolbox-periodo-select`, `toolbox-semana-select`, `toolbox-input-palabras`) to visor controls (`visor-select-materia`, etc.).
  3. Calls `window.obtenerContenidoBaseIngesta()`.
  4. Displays modal `#modal-visor-herramienta`.
  5. Immediately calls `window.prepararHerramientaIA(base, stage)` which triggers `POST /api/generate-tool-ai`.
  6. Dispatches to `window.ejecutarRenderizadorHerramienta(tool.id, stage, base)`.
- **Finding**: There is currently NO intermediate pre-generation modal specifically for setting up keywords vs. document upload and selecting teacher assigned groups per game before launching the stage.

### 1.3 AI Generation Logic (Keywords vs. Files)
- **Server Endpoint**: `POST /api/generate-tool-ai` in `server.js` (lines 862–910):
  * Accepts `{ materia, grado, tema, dificultad }`.
  * Calls Google Gemini (`gemini-2.5-flash`) with structured JSON schema returning: `palabras`, `definiciones`, `categoriasJeopardy`, `preguntasJeopardy` (25 questions), `supraordinada`, `isoordinadas`, `exclusiones`, `infraordinadas`, `proposicionesNovak`, `ramasBuzan`, `experimentoLab`, `textoCloze`, `bancoCloze`, `debateDetonante`.
- **Client Fallback**: `window.datosDinamicosFallback(materia, grado, tema, dificultad)` in `app.js` (lines 11530–11654):
  * Parses custom words separated by commas/semicolons/dashes or extracts tokens from `tema`.
  * Merges with subject keyword dictionaries (`sufijosArea[materia]`).
  * Generates complete game payloads offline.
- **Document Text Ingestion**:
  * In `app.js` (lines 1428–1447, 11252–11263, 12833–12867, 1488–1496), `FileReader.readAsText` reads uploaded text/documents.
  * `window.procesarDocumentoYCrearMalla` extracts top-frequency substantive tokens (`tokens.filter(w => w.length > 4)`), computing frequencies and sorting to extract the top 10–20 key terms.
  * For images (`.jpg`, `.jpeg`, `.png`), filename and visual token cues are extracted.

### 1.4 Teacher Groups State Model
- **State Storage**:
  * Session: `sessionStorage.getItem('peidagogos_auth')` / `localStorage.getItem('usuario_actual')`.
  * Teacher profiles: `localStorage.getItem('docentes_db')`.
  * Group assignments: `localStorage.getItem('docentes_por_grupo_db')`.
- **Data Model**:
  ```javascript
  let docKey = String(window.usuario_actual || authSes.documento || authSes.usuario || '').trim().toLowerCase();
  let dList = JSON.parse(localStorage.getItem('docentes_db') || '[]');
  let docItem = dList.find(d => String(d.documento || d.usuario || '').trim().toLowerCase() === docKey) || authSes;
  let gruposDocente = (docItem && Array.isArray(docItem.grupos)) 
      ? docItem.grupos.map(g => (typeof g === 'object' ? g.nombre : g)) 
      : ['7C', '6A', '8A'];
  ```

### 1.5 Activity Persistence & Student Inbox Notification System
- **Activity Assignment API**:
  * Endpoint `POST /api/asignar-actividad` in `server.js` (lines 1147–1179) writes to `actividades_asignadas.json`.
  * Client persists in `localStorage.setItem('actividades_asignadas_db', JSON.stringify(localActs))`.
  * Client function `window.asignarHerramientaActualAGrupo()` in `app.js` (lines 16075–16157) creates the activity object storing `actividad_data` so students see identical AI-generated content.
- **Student Inbox UI & Hydration**:
  * Container in `login.html` (lines 1831–1858): `#student-actividades-container` containing `#student-actividades-list` and `#badge-actividades-pendientes-count`.
  * Render function in `app.js` (lines 16160–16289): `window.cargarActividadesEstudiante()`.
  * Resolves student group/grade, filters matching activities (`grupo_destino === grupoEstudiante || grupo_destino === 'Todos'`), renders cards showing:
    - Subject badge: `📚 ${act.materia}`
    - Status badge: `⏳ Pendiente` / `✅ Completada`
    - Title: `${act.titulo}`
    - Teacher: `👨‍🏫 Asignada por: ${act.profesor_nombre}`
    - Reward: `🌟 Recompensa: +250 XP`
    - Action button: `🚀 Desarrollar Tarea Ahora ➔`
  * Completion & XP: `window.abrirActividadParaEstudiante(actId)` and `window.finalizarTareaEstudiante(actId)` (lines 16292–16367).

---

## 2. Logic Chain

1. **User Requirement R3**: Requires a pre-generation configuration menu before generating any of the 10 tools in Caja 2.
2. **Current State Observation**: When the teacher clicks "⚡ Generar y Abrir" on a Caja 2 card, `window.abrirVisorHerramienta(herramientaId)` executes immediately without asking the teacher for input mode (Keywords vs Document) or target group.
3. **Configuration Menu Architecture**:
   - Instead of calling `abrirVisorHerramienta` directly from the card click, the card button will invoke `window.abrirConfiguracionJuegoIA(toolId)`.
   - `window.abrirConfiguracionJuegoIA(toolId)` displays a dedicated pre-generation modal (`#modal-configuracion-juego-ia`).
   - The modal renders:
     * **Tool Header**: Name, Icon, XP badge.
     * **Dual Ingestion Mode**:
       1. Mode 1 (Palabras Clave / Keywords): Text input for comma-separated key concepts.
       2. Mode 2 (Subir Documento): File input accepting `.pdf, .doc, .docx, .ppt, .pptx, .jpg, .jpeg, .png`, processing file text/metadata via `FileReader`.
     * **Teacher Assigned Groups Dropdown**: Populated dynamically from `docItem.grupos` (e.g. `7C`, `6A`, `8A`, `Todos los Grupos`).
     * **Academic Metadata**: Asignatura dropdown, Grade/Ciclo dropdown, Difficulty selector.
     * **Action Button**: `🚀 Generar Juego con IA y Asignar`.
4. **Execution & Notification Flow**:
   - On clicking `🚀 Generar Juego con IA y Asignar`:
     * Extracts concept/keywords from text input or uploaded document.
     * Invokes `window.prepararHerramientaIA(base, stage)` with the extracted topic.
     * Saves the activity in `actividades_asignadas_db` and calls `POST /api/asignar-actividad` with `grupo_destino = grupoSeleccionado`, `actividad_data = cacheIA`, `profesor_nombre = nombreDocente`.
     * Closes the config modal and opens `modal-visor-herramienta` displaying the live interactive game with full preview, projection, and printing capabilities.
     * Pushes the activity to student inbox state (`actividades_asignadas_db`) and triggers Telegram alert if configured.
5. **Non-Destructive Rules Compliance**:
   - Preserves all existing IDs (`modal-caja-herramientas`, `modal-visor-herramienta`, `herramienta-stage`, `student-actividades-container`, `student-actividades-list`).
   - Preserves existing global functions (`window.renderizarSopaLetrasTool`, `window.renderizarCrucigramaTool`, `window.cargarActividadesEstudiante`, `window.abrirActividadParaEstudiante`, etc.).

---

## 3. Caveats

- **Network Availability for Gemini API**: If the backend is running offline or without active Gemini API keys, the fallback engine (`window.datosDinamicosFallback`) will synthesize high-quality game content directly from keyword tokens and area vocabularies.
- **Binary Document Parsing on Client**: Client-side JavaScript without external heavy libraries parses text slices and tokens via `FileReader`. For `.docx`, `.pptx`, and `.pdf`, text/binary tokens and filenames are extracted cleanly without crashing browser memory.

---

## 4. Conclusion

All 10 games in Caja 2 are clearly enumerated, their renderers identified, and their launch paths mapped. The pre-generation configuration menu can be injected smoothly with dual-mode input (Keywords or File upload: PDF, Word, PPT, JPG) and a dynamic dropdown of the teacher's assigned groups. The persistence and notification system connects directly into the existing Student Inbox (`#student-actividades-container` / `window.cargarActividadesEstudiante`) and backend persistence (`/api/asignar-actividad` / `actividades_asignadas.json`).

---

## 5. Verification Method

### 5.1 Local Verification of Existing Code
- Inspect `d:\Peidagogos_Oficial\app.js` at lines:
  * 10836–10926 (Definitions of 10 tools in Caja 2).
  * 11371–11414 (`abrirDetalleCajaTematica` & `renderizarTarjetasCajaHerramientas`).
  * 11417–11471 (`abrirVisorHerramienta` & `prepararHerramientaIA`).
  * 11657–11755 (AI tool preparation & dispatcher).
  * 11996–12615 (Renderers for Sopa de Letras, Crucigrama, Jeopardy, Memory Cards, Bingo, Criptograma, Domino, Sudoku, Laberinto, Pictionary).
  * 16075–16367 (`asignarHerramientaActualAGrupo`, `cargarActividadesEstudiante`, `abrirActividadParaEstudiante`, `finalizarTareaEstudiante`).
- Inspect `d:\Peidagogos_Oficial\server.js` at lines:
  * 862–910 (`/api/generate-tool-ai`).
  * 1114–1209 (`/api/actividades-asignadas`, `/api/actividades-estudiante`, `/api/asignar-actividad`, `/api/completar-actividad`).
- Inspect `d:\Peidagogos_Oficial\login.html` at lines:
  * 1831–1858 (`student-actividades-container` and `student-actividades-list`).
  * 2526–2545 (Caja 2 Card in Hub).
  * 2757–2889 (`modal-visor-herramienta`).

### 5.2 Implementation Validation Criteria
1. When navigating to Caja 2, clicking any of the 10 games opens the Pre-Generation Configuration Modal.
2. The modal allows toggling between "Palabras Clave" and "Subir Documento (PDF, Word, PPT, JPG)".
3. The group dropdown lists the teacher's assigned groups (`docItem.grupos`).
4. Clicking "Generar y Asignar" successfully dispatches the AI generation and persists the activity to `actividades_asignadas_db` and `/api/asignar-actividad`.
5. Logging in as a student in that group reveals the assigned game in `#student-actividades-list` with subject and teacher name.
