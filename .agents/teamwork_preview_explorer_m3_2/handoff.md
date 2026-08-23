# Handoff Report: Investigation of Caja 2 Dynamic Games & Modal Interception (Milestone M3)

## 1. Observation

### 1.1 Direct Observation of Caja 2 Tools in `app.js`
In `d:\Peidagogos_Oficial\app.js` (lines 11353–11444), within `window.LISTA_HERRAMIENTAS_PEDAGOGICAS`, the 10 tools belonging to "Caja 2: Juegos Dinámicos y Activación" (`categoria: 'juegos'`) are defined as follows:

| # | Tool ID (`id`) | Tool Title (`titulo`) | Icon (`icono`) | Description (`desc`) | Registered Renderer (`app.js` line) |
|---|---|---|---|---|---|
| 1 | `sopa_letras` | Sopa de Letras Temática | 🔤 | Matriz interactiva con pistas deductivas y generador de hoja con solucionario en PDF. | `window.renderizarSopaLetrasTool` (line 12233) |
| 2 | `crucigrama` | Crucigrama Conceptual | 🧩 | Cuadrícula con definiciones horizontales y verticales autovalidadas con hoja de respuestas. | `window.renderizarCrucigramaTool` (line 12234) |
| 3 | `memory_cards` | Duelo de Emparejamiento (Memory) | 🃏 | Juego de cartas volteables para asociar Conceptos y Definiciones, y fichas recortables. | `window.renderizarMemoryCardsTool` (line 12236) |
| 4 | `bingo_steam` | Bingo Pedagógico STEAM | 🎯 | Balotera digital proyectable que canta conceptos y generador de 30 cartones únicos en PDF. | `window.renderizarBingoSteamTool` (line 12237) |
| 5 | `jeopardy` | Tablero Concurso Jeopardy ($100-$500) | 🎪 | Tablero gigante de 5 categorías con 25 preguntas y pulsadores de equipo para pantalla grande. | `window.renderizarJeopardyTool` (line 12235) |
| 6 | `criptograma` | Criptogramas y Anagramas Secretos | 🔠 | Mensajes científicos cifrados con tablas de sustitución y retos de decodificación. | `window.renderizarCriptogramaTool` (line 12238) |
| 7 | `domino_conceptual` | Dominó Conceptual de Saberes | 🧱 | Fichas de dominó con conceptos en un extremo y definiciones en el otro para encadenar en mesa. | `window.renderizarDominoConceptualTool` (line 12239) |
| 8 | `sudoku_steam` | Sudoku y Kakuro Lógico STEAM | 🔢 | Cuadrículas de lógica matemática con números o símbolos STEAM de 4x4 y 6x6. | `window.renderizarSudokuSteamTool` (line 12240) |
| 9 | `laberinto_logico` | Laberinto Lógico de Decisiones | 🗺️ | Laberinto interactivo donde avanzar requiere responder preguntas conceptuales correctas. | `window.renderizarLaberintoLogicoTool` (line 12241) |
| 10 | `pictionary_tabu` | Ruleta Pictionary y Tabú STEAM | 🎭 | Tarjetas de reto: explica un concepto mediante mímica o dibujo sin decir palabras prohibidas. | `window.renderizarPictionaryTabuTool` (line 12242) |

### 1.2 Current Tool Card Rendering & Invocation Chain in `app.js`
1. When viewing the toolbox, `window.abrirDetalleCajaTematica(categoria)` (`app.js`, lines 11891–11910) hides `#vista-cajas-hub`, shows `#vista-categoria-detalle`, and calls `window.renderizarTarjetasCajaHerramientas(categoria)`.
2. In `window.renderizarTarjetasCajaHerramientas` (`app.js`, lines 11912–11938):
   ```javascript
   grid.innerHTML = filtradas.map(tool => `
       ...
       <button onclick="window.abrirVisorHerramienta('${tool.id}')" ...>
           <span>⚡</span> Generar y Abrir
       </button>
   `).join('');
   ```
3. Direct execution occurs immediately inside `window.abrirVisorHerramienta(herramientaId)` (`app.js`, lines 11941–11995), calling `window.prepararHerramientaIA(base, stage)` and `window.ejecutarRenderizadorHerramienta(tool.id, stage, base)` without presenting an intermediate configuration dialogue for keywords vs. document upload or target group assignment.

### 1.3 Teacher Assigned Groups Retrieval Flow
In `app.js` (lines 1355–1381 and lines 16615–16625):
- Auth session is retrieved from `sessionStorage.getItem('peidagogos_auth')` or `localStorage.getItem('usuario_actual')`.
- Teacher profile is looked up in `localStorage.getItem('docentes_db')` using document/username key (`docKey`).
- Groups extraction sources in existing code:
  1. `docItem.grupos` (array of group objects `{ nombre: '7C', grado: '7' }` or string names `['7C', '6A']`).
  2. `docItem.grupos_direccion` / `authSes.grupos_direccion` (e.g. `['7C']`).
  3. `authSes.grados` / `docItem.grados` (e.g. `['6', '7', '8']`).
  4. Fallback defaults: `['7C', '6A', '8A']`.
  5. The target selector must always offer `'Todos'` / `'Todos los Grupos'` as the default option index.

### 1.4 Test Contracts in `tests/test_r3_aigames.js`
The test file `tests/test_r3_aigames.js` enforces 11 automated test contracts across two tiers:
- **Tier 1 (Feature Coverage / Happy Path)**:
  * `T1_R3_01`: All 10 dynamic tools from Caja 2 must be defined with `id`, `titulo`, `icono`.
  * `T1_R3_02`: Pre-generation modal supports Mode 1 (`keywords`) and Mode 2 (`upload`) toggle.
  * `T1_R3_03`: Group dropdown dynamically populates with teacher's assigned groups and includes "Todos los Grupos".
  * `T1_R3_04`: Keywords generation creates valid payloads for all 10 tools.
  * `T1_R3_05`: Document upload mode extracts key tokens from uploaded text.
  * `T1_R3_06`: Assignment dispatch dispatches activity with complete metadata (`id`, `tipo_actividad`, `grupo_destino`, `materia`, `profesor_nombre`, `xp_recompensa: 250`, `actividad_data`).
- **Tier 2 (Boundary & Corner Cases)**:
  * `T2_R3_01`: Missing or empty teacher groups safely fallback to `['Todos los Grupos']`.
  * `T2_R3_02`: Special characters, accents (tildes), and punctuation in keywords are preserved.
  * `T2_R3_03`: Image upload filenames (e.g., `.jpg`, `.png`) are tokenized for cue concepts.
  * `T2_R3_04`: Offline procedural generator never throws and produces valid payloads.
  * `T2_R3_05`: Missing metadata applies institutional defaults (`Ciencias Naturales`, `Grado 7`, `250 XP`).

---

## 2. Logic Chain

1. **Requirement R3 Intent**: The teacher should have complete pedagogical control before generating any game in Caja 2. Rather than generating generic content directly, the teacher must be able to:
   - Provide custom keywords OR upload a class guide/document (PDF, Word, PPT, JPG, TXT).
   - Select the target group/grade from their assigned teaching load.
   - Adjust grade and difficulty level.
2. **Interception Strategy**:
   - **Card Level**: In `window.renderizarTarjetasCajaHerramientas`, if `tool.categoria === 'juegos'`, set the button click action to `window.abrirConfiguracionJuegoIA('${tool.id}')`.
   - **Visor Guard**: In `window.abrirVisorHerramienta(herramientaId, omitirIntercepcion = false)`, if the tool is in Caja 2 (`tool.categoria === 'juegos'`) and `!omitirIntercepcion`, intercept execution and call `window.abrirConfiguracionJuegoIA(herramientaId)`.
3. **Execution & Dispatch Pipeline**:
   - When the teacher clicks `🚀 Generar Juego con IA y Asignar`:
     a. Extract text tokens from keywords or uploaded document.
     b. Close configuration modal `#modal-configuracion-juego-ia`.
     c. Open `#modal-visor-herramienta` and run `window.prepararHerramientaIA(base, stage)` + `window.ejecutarRenderizadorHerramienta(tool.id, stage, base)`.
     d. Construct activity object with `grupo_destino`, `materia`, `grado`, `profesor_nombre`, `actividad_data`, `xp_recompensa: 250`.
     e. Persist in `localStorage.getItem('actividades_asignadas_db')` and asynchronously POST to `/api/asignar-actividad`.
     f. Send optional Telegram notification if available.

---

## 3. Caveats

1. **Non-Destructive UI Preservation**:
   - Do NOT modify or remove existing tools in `window.LISTA_HERRAMIENTAS_PEDAGOGICAS`.
   - Do NOT alter existing renderers (`renderizarSopaLetrasTool`, `renderizarCrucigramaTool`, etc.).
   - Ensure other categories (`'imprimibles'`, `'aula'`, `'visual'`, `'evaluacion'`, `'homeschool'`) continue to use `window.abrirVisorHerramienta` as before unless configured otherwise.
2. **Offline & Fallback Safety**:
   - If the backend `/api/generate-tool-ai` is unavailable, `window.prepararHerramientaIA` catches the error and `window.datosDinamicosFallback` handles generation offline seamlessly.
3. **FileReader Compatibility**:
   - Document upload in the browser reads text/ASCII stream via `FileReader.readAsText`. For binary formats (DOCX/PPTX/PDF), regex extraction of alphabetic tokens (`/[a-záéíóúñ]{4,}/g`) reliably extracts topic keywords.

---

## 4. Conclusion (Exact Implementation Specification for Worker)

### 4.1 HTML Component to Insert into `login.html`
Place `#modal-configuracion-juego-ia` right before `#modal-visor-herramienta` (around line 2755):

```html
    <!-- ========================================================================== -->
    <!-- MODAL: CONFIGURACIÓN PRE-GENERACIÓN DE JUEGOS DINÁMICOS CON IA (CAJA 2)    -->
    <!-- ========================================================================== -->
    <div id="modal-configuracion-juego-ia" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.88); z-index: 100003; justify-content: center; align-items: center; padding: 20px; overflow-y: auto; backdrop-filter: blur(8px);">
        <div style="background: white; border-radius: 22px; width: 100%; max-width: 760px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.35); border: 1px solid #E2E8F0;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4338CA, #6D28D9); color: white; padding: 22px 28px; display: flex; justify-content: space-between; align-items: center; border-top-left-radius: 20px; border-top-right-radius: 20px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <span id="modal-juego-icono" style="font-size: 2.2rem; background: rgba(255,255,255,0.15); padding: 8px 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.25);">🎮</span>
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <h3 id="modal-juego-titulo" style="margin: 0; font-size: 1.35rem; font-weight: 900;">Configurar Juego Dinámico con IA</h3>
                            <span style="background: #EEF2FF; color: #4338CA; font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 12px; text-transform: uppercase;">Caja 2 STEAM</span>
                        </div>
                        <p id="modal-juego-desc" style="margin: 3px 0 0 0; font-size: 0.84rem; color: #E0E7FF;">Personaliza las palabras clave o sube un documento para alimentar el motor pedagógico.</p>
                    </div>
                </div>
                <button onclick="window.cerrarConfiguracionJuegoIA()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 1.1rem; font-weight: bold; display: flex; align-items: center; justify-content: center; transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✕</button>
            </div>

            <div style="padding: 26px 28px; display: flex; flex-direction: column; gap: 18px;">
                <!-- Selector de Modo de Ingesta (Keywords vs Document Upload) -->
                <div>
                    <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.9rem; margin-bottom: 8px;">1. Fuente de Contenido para la IA:</label>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" id="modal-juego-tab-keywords" onclick="window.cambiarModoConfigJuegoIA('keywords')" style="flex: 1; padding: 11px 16px; border-radius: 12px; font-weight: 800; font-size: 0.88rem; cursor: pointer; border: 2px solid #4F46E5; background: #EEF2FF; color: #4338CA; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
                            <span>📝</span> Palabras Clave / Temas
                        </button>
                        <button type="button" id="modal-juego-tab-upload" onclick="window.cambiarModoConfigJuegoIA('upload')" style="flex: 1; padding: 11px 16px; border-radius: 12px; font-weight: 700; font-size: 0.88rem; cursor: pointer; border: 1.5px solid #CBD5E1; background: #F8FAFC; color: #64748B; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
                            <span>📁</span> Subir Documento / Guía (PDF, Word, PPT, JPG)
                        </button>
                    </div>
                </div>

                <!-- Panel 1: Palabras Clave -->
                <div id="modal-juego-panel-keywords" style="display: block; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 16px;">
                    <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.88rem; margin-bottom: 6px;">Palabras clave o conceptos a evaluar (separados por coma):</label>
                    <textarea id="modal-juego-input-keywords" rows="3" placeholder="Ej: Fotosíntesis, Cloroplastos, Glucosa, Luz solar, Dióxido de carbono, Membrana tilacoides, Estomas" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; box-sizing: border-box; font-family: Inter, sans-serif; font-size: 0.9rem;"></textarea>
                    <div style="font-size: 0.76rem; color: #64748B; margin-top: 4px;">La IA adaptará la dificultad y las pistas al nivel de comprensión seleccionado.</div>
                </div>

                <!-- Panel 2: Subir Documento -->
                <div id="modal-juego-panel-upload" style="display: none; background: #F8FAFC; border: 1.5px dashed #6366F1; border-radius: 14px; padding: 20px; text-align: center;">
                    <input type="file" id="modal-juego-archivo" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png" onchange="window.manejarArchivoConfigJuegoIA(event)" style="display: none;">
                    <span style="font-size: 2.2rem; display: block; margin-bottom: 6px;">📄</span>
                    <div style="font-weight: 800; color: #1E293B; font-size: 0.92rem; margin-bottom: 4px;">Arrastra o selecciona el documento de tu clase</div>
                    <div style="font-size: 0.78rem; color: #64748B; margin-bottom: 12px;">Formatos soportados: PDF, Word (.doc/.docx), PowerPoint (.ppt/.pptx), Imágenes (.jpg/.png), Texto (.txt)</div>
                    <button type="button" onclick="document.getElementById('modal-juego-archivo').click()" style="background: white; border: 1.5px solid #6366F1; color: #4F46E5; padding: 8px 18px; border-radius: 8px; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <span>📂</span> Seleccionar Archivo
                    </button>
                    <div id="modal-juego-archivo-badge" style="display: none; margin-top: 10px; font-size: 0.82rem; font-weight: 800; color: #059669; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 4px 12px; border-radius: 20px; width: fit-content; margin-left: auto; margin-right: auto; align-items: center; gap: 6px;">
                        <span>✓</span> <span id="modal-juego-archivo-nombre">archivo.pdf</span>
                    </div>
                </div>

                <!-- Fila de Metadatos Académicos: Asignatura, Grado, Dificultad -->
                <div style="display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 12px;">
                    <div>
                        <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.88rem; margin-bottom: 6px;">Asignatura / Área:</label>
                        <select id="modal-juego-materia-select" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; box-sizing: border-box; font-size: 0.88rem; font-weight: 600;">
                            <option value="Ciencias Naturales">🌿 Ciencias Naturales</option>
                            <option value="Física">⚛️ Física</option>
                            <option value="Química">🧪 Química</option>
                            <option value="Matemáticas">📐 Matemáticas</option>
                            <option value="Lengua Castellana">📖 Lengua Castellana</option>
                            <option value="Ciencias Sociales">🌍 Ciencias Sociales</option>
                            <option value="Inglés">🇬🇧 Inglés</option>
                            <option value="Tecnología">🖥️ Tecnología e Informática</option>
                            <option value="Artística">🎨 Educación Artística</option>
                            <option value="Ética">🤝 Ética y Valores</option>
                            <option value="Turismo">🧭 Turismo y Patrimonio</option>
                            <option value="Robótica STEAM">🤖 Robótica STEAM</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.88rem; margin-bottom: 6px;">Grado / Ciclo:</label>
                        <select id="modal-juego-grado-select" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; box-sizing: border-box; font-size: 0.88rem; font-weight: 600;">
                            <option value="3">3° Primaria</option>
                            <option value="4">4° Primaria</option>
                            <option value="5">5° Primaria</option>
                            <option value="6">6° Secundaria</option>
                            <option value="7" selected>7° Secundaria</option>
                            <option value="8">8° Secundaria</option>
                            <option value="9">9° Secundaria</option>
                            <option value="10">10° Media Técnica</option>
                            <option value="11">11° Media Técnica</option>
                            <option value="Ciclo III">Ciclo III (6°-7°)</option>
                            <option value="Ciclo IV">Ciclo IV (8°-9°)</option>
                            <option value="Ciclo V">Ciclo V (10°)</option>
                            <option value="Ciclo VI">Ciclo VI (11°)</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.88rem; margin-bottom: 6px;">Dificultad:</label>
                        <select id="modal-juego-dificultad-select" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; box-sizing: border-box; font-size: 0.88rem; font-weight: 600;">
                            <option value="facil">🟢 Fácil (Introducción)</option>
                            <option value="media" selected>🟡 Media (Estándar)</option>
                            <option value="avanzada">🔴 Avanzada (Desafío STEAM)</option>
                        </select>
                    </div>
                </div>

                <!-- Selector de Grupo Asignado del Docente -->
                <div style="background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 14px; padding: 16px;">
                    <label style="display: block; font-weight: 800; color: #1E40AF; font-size: 0.9rem; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
                        <span>👥</span> 2. Grupo Destinatario para Asignar la Tarea:
                    </label>
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; align-items: center;">
                        <select id="modal-juego-grupo-select" style="width: 100%; padding: 11px 14px; border: 2px solid #3B82F6; border-radius: 8px; box-sizing: border-box; font-size: 0.92rem; font-weight: 800; color: #1E3A8A; background: white;">
                            <!-- Inyectado dinámicamente según docente logueado -->
                            <option value="Todos">Todos los Grupos</option>
                        </select>
                        <div style="font-size: 0.78rem; color: #2563EB; line-height: 1.35;">
                            La actividad se publicará automáticamente en el <strong>Buzón del Estudiante</strong> del grupo seleccionado.
                        </div>
                    </div>
                </div>

                <!-- Botones de Acción -->
                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 6px; padding-top: 14px; border-top: 1px solid #E2E8F0;">
                    <button type="button" onclick="window.cerrarConfiguracionJuegoIA()" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #475569; padding: 11px 20px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; cursor: pointer;">
                        Cancelar
                    </button>
                    <button type="button" id="modal-juego-btn-generar" onclick="window.ejecutarGeneracionJuegoIA()" style="background: linear-gradient(135deg, #4F46E5, #7C3AED); border: none; color: white; padding: 11px 24px; border-radius: 10px; font-weight: 900; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(79,70,229,0.35);">
                        <span>🚀</span> Generar Juego con IA y Asignar
                    </button>
                </div>
            </div>
        </div>
    </div>
```

### 4.2 JavaScript Code to Integrate in `app.js`

1. **Add the R3 Functions**:
```javascript
// ==========================================================================
// R3: CONFIGURACIÓN PRE-GENERACIÓN DE JUEGOS DINÁMICOS CON IA (CAJA 2)
// ==========================================================================

window._toolJuegoIAActivo = null;
window._modoConfigJuegoIA = 'keywords';
window._archivoConfigJuegoIA = null;
window._textoArchivoConfigJuegoIA = '';

window.JUEGOS_CAJA_2_IDS = [
    'sopa_letras',
    'crucigrama',
    'memory_cards',
    'bingo_steam',
    'jeopardy',
    'criptograma',
    'domino_conceptual',
    'sudoku_steam',
    'laberinto_logico',
    'pictionary_tabu'
];

window.abrirConfiguracionJuegoIA = function(toolId) {
    const tool = window.LISTA_HERRAMIENTAS_PEDAGOGICAS.find(h => h.id === toolId);
    if (!tool) return;

    window._toolJuegoIAActivo = tool;
    window._modoConfigJuegoIA = 'keywords';
    window._archivoConfigJuegoIA = null;
    window._textoArchivoConfigJuegoIA = '';

    const modal = document.getElementById('modal-configuracion-juego-ia');
    const ico = document.getElementById('modal-juego-icono');
    const tit = document.getElementById('modal-juego-titulo');
    const desc = document.getElementById('modal-juego-desc');
    const inKw = document.getElementById('modal-juego-input-keywords');
    const selMat = document.getElementById('modal-juego-materia-select');
    const selGra = document.getElementById('modal-juego-grado-select');
    const selGrp = document.getElementById('modal-juego-grupo-select');
    const badgeArch = document.getElementById('modal-juego-archivo-badge');

    if (ico) ico.innerText = tool.icono;
    if (tit) tit.innerText = `${tool.icono} Configurar ${tool.titulo}`;
    if (desc) desc.innerText = tool.desc || 'Personaliza el contenido pedagógico para la generación con IA.';
    if (inKw) inKw.value = '';
    if (badgeArch) badgeArch.style.display = 'none';

    // Sincronizar materia y grado actuales del toolbox si existen
    const curMat = document.getElementById('toolbox-materia-select');
    const curGra = document.getElementById('toolbox-grado-select');
    const curPal = document.getElementById('toolbox-input-palabras');

    if (selMat && curMat && curMat.value) selMat.value = curMat.value;
    if (selGra && curGra && curGra.value) selGra.value = curGra.value;
    if (inKw && curPal && curPal.value.trim()) inKw.value = curPal.value.trim();

    // Poblar dropdown de grupos del docente con multi-source fallback
    if (selGrp) {
        let authSes = {};
        try {
            authSes = JSON.parse(sessionStorage.getItem('peidagogos_auth') || localStorage.getItem('usuario_sesion') || localStorage.getItem('usuario_actual') || '{}');
        } catch(e) {}

        const docKey = String(window.usuario_actual || authSes.usuario || authSes.documento || (authSes.usuarioObj && (authSes.usuarioObj.documento || authSes.usuarioObj.usuario)) || '').trim().toLowerCase();
        let dList = [];
        try { dList = JSON.parse(localStorage.getItem('docentes_db') || '[]'); } catch(e) {}
        const docItem = dList.find(d => String(d.documento || d.cedula || d.usuario || '').trim().toLowerCase() === docKey) || authSes;

        let grupos = [];
        if (docItem && Array.isArray(docItem.grupos) && docItem.grupos.length > 0) {
            grupos = docItem.grupos.map(g => (typeof g === 'object' ? g.nombre : g));
        } else if (docItem && Array.isArray(docItem.grupos_direccion) && docItem.grupos_direccion.length > 0) {
            grupos = [...docItem.grupos_direccion];
        } else if (authSes && Array.isArray(authSes.grupos_direccion) && authSes.grupos_direccion.length > 0) {
            grupos = [...authSes.grupos_direccion];
        } else if (authSes && Array.isArray(authSes.grados) && authSes.grados.length > 0) {
            grupos = [...authSes.grados];
        } else {
            grupos = ['7C', '6A', '8A'];
        }

        const gruposUnicos = Array.from(new Set(grupos.filter(Boolean)));
        selGrp.innerHTML = '<option value="Todos">Todos los Grupos</option>' +
            gruposUnicos.map(g => `<option value="${g}">Grupo ${g}</option>`).join('');
    }

    window.cambiarModoConfigJuegoIA('keywords');
    if (modal) modal.style.display = 'flex';
};

window.cerrarConfiguracionJuegoIA = function() {
    const modal = document.getElementById('modal-configuracion-juego-ia');
    if (modal) modal.style.display = 'none';
};

window.cambiarModoConfigJuegoIA = function(modo) {
    window._modoConfigJuegoIA = modo;
    const tabKw = document.getElementById('modal-juego-tab-keywords');
    const tabUp = document.getElementById('modal-juego-tab-upload');
    const panKw = document.getElementById('modal-juego-panel-keywords');
    const panUp = document.getElementById('modal-juego-panel-upload');

    if (modo === 'keywords') {
        if (tabKw) {
            tabKw.style.background = '#EEF2FF';
            tabKw.style.color = '#4338CA';
            tabKw.style.border = '2px solid #4F46E5';
            tabKw.style.fontWeight = '800';
        }
        if (tabUp) {
            tabUp.style.background = '#F8FAFC';
            tabUp.style.color = '#64748B';
            tabUp.style.border = '1.5px solid #CBD5E1';
            tabUp.style.fontWeight = '700';
        }
        if (panKw) panKw.style.display = 'block';
        if (panUp) panUp.style.display = 'none';
    } else {
        if (tabUp) {
            tabUp.style.background = '#EEF2FF';
            tabUp.style.color = '#4338CA';
            tabUp.style.border = '2px solid #4F46E5';
            tabUp.style.fontWeight = '800';
        }
        if (tabKw) {
            tabKw.style.background = '#F8FAFC';
            tabKw.style.color = '#64748B';
            tabKw.style.border = '1.5px solid #CBD5E1';
            tabKw.style.fontWeight = '700';
        }
        if (panKw) panKw.style.display = 'none';
        if (panUp) panUp.style.display = 'block';
    }
};

window.manejarArchivoConfigJuegoIA = function(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    window._archivoConfigJuegoIA = file;
    const badge = document.getElementById('modal-juego-archivo-badge');
    const nom = document.getElementById('modal-juego-archivo-nombre');
    if (nom) nom.innerText = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (badge) badge.style.display = 'inline-flex';

    const reader = new FileReader();
    reader.onload = function(e) {
        window._textoArchivoConfigJuegoIA = e.target.result || '';
    };
    reader.onerror = function() {
        window._textoArchivoConfigJuegoIA = file.name;
    };
    reader.readAsText(file);
};

window.ejecutarGeneracionJuegoIA = async function() {
    const tool = window._toolJuegoIAActivo;
    if (!tool) return;

    const selMat = document.getElementById('modal-juego-materia-select');
    const selGra = document.getElementById('modal-juego-grado-select');
    const selDif = document.getElementById('modal-juego-dificultad-select');
    const selGrp = document.getElementById('modal-juego-grupo-select');
    const inKw = document.getElementById('modal-juego-input-keywords');

    const materia = selMat ? selMat.value : 'Ciencias Naturales';
    const grado = selGra ? selGra.value : '7';
    const dificultad = selDif ? selDif.value : 'media';
    const grupoDestino = selGrp ? selGrp.value : 'Todos';

    let concepto = '';
    if (window._modoConfigJuegoIA === 'keywords') {
        concepto = inKw && inKw.value.trim() ? inKw.value.trim() : `${materia} Grado ${grado}`;
    } else {
        if (window._textoArchivoConfigJuegoIA) {
            const tokens = window._textoArchivoConfigJuegoIA.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [];
            const freq = {};
            tokens.forEach(t => freq[t] = (freq[t] || 0) + 1);
            const topTokens = Object.keys(freq).sort((a,b) => freq[b] - freq[a]).slice(0, 10);
            concepto = topTokens.join(', ') || (window._archivoConfigJuegoIA ? window._archivoConfigJuegoIA.name : `${materia} Grado ${grado}`);
        } else if (window._archivoConfigJuegoIA) {
            concepto = window._archivoConfigJuegoIA.name.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[_\\-]+/g, ' ');
        } else {
            concepto = `${materia} Grado ${grado}`;
        }
    }

    const base = {
        materia,
        grado,
        periodo: '3',
        semana: '1',
        concepto,
        dificultad
    };

    const vMat = document.getElementById('visor-select-materia');
    const vGra = document.getElementById('visor-select-grado');
    const vTem = document.getElementById('visor-input-tema-personalizado');
    if (vMat) vMat.value = materia;
    if (vGra) vGra.value = grado;
    if (vTem) vTem.value = concepto;

    let authSes = {};
    try { authSes = JSON.parse(sessionStorage.getItem('peidagogos_auth') || localStorage.getItem('usuario_actual') || '{}'); } catch(e) {}
    const docKey = String(window.usuario_actual || authSes.documento || authSes.usuario || '').trim().toLowerCase();
    let dList = JSON.parse(localStorage.getItem('docentes_db') || '[]');
    let docItem = dList.find(d => String(d.documento || d.usuario || '').trim().toLowerCase() === docKey) || authSes;
    const profesorNombre = (document.getElementById('docente-nombre-header') ? document.getElementById('docente-nombre-header').innerText : (docItem.nombre || 'Docente Orientador')).trim();

    window.cerrarConfiguracionJuegoIA();

    const modalVisor = document.getElementById('modal-visor-herramienta');
    const stage = document.getElementById('herramienta-stage');
    const icon = document.getElementById('visor-tool-icon');
    const title = document.getElementById('visor-tool-title');
    const subtitle = document.getElementById('visor-tool-subtitle');

    if (icon) icon.innerText = tool.icono;
    if (title) title.innerText = tool.titulo;
    if (subtitle) subtitle.innerText = `${base.materia} • Grado ${base.grado}° • Tema: ${base.concepto}`;
    if (modalVisor) modalVisor.style.display = 'flex';

    window.herramientaActualActiva = tool;

    try {
        await window.prepararHerramientaIA(base, stage);
    } catch(e) {
        console.warn("Usando fallback dinámico de IA...");
    }

    window.ejecutarRenderizadorHerramienta(tool.id, stage, base);

    const actividad_data = window._cacheDataDinamicaIA ? JSON.parse(JSON.stringify(window._cacheDataDinamicaIA)) : null;
    const nuevaActividad = {
        id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        titulo: `${tool.icono} ${tool.titulo}: ${concepto}`,
        herramienta_id: tool.id,
        herramienta_titulo: tool.titulo,
        herramienta_icono: tool.icono,
        tipo_actividad: tool.id,
        materia: materia,
        grado: grado,
        grupo_destino: grupoDestino,
        destinatario_tipo: 'grupo',
        destinatario_id: grupoDestino,
        destinatario_nombre: grupoDestino === 'Todos' ? 'Todos los Grupos' : `Grupo ${grupoDestino}`,
        profesor_nombre: profesorNombre,
        profesor_doc: docKey,
        creador_id: docKey,
        tema: concepto,
        xp_recompensa: 250,
        actividad_data: actividad_data,
        fecha_creacion: new Date().toLocaleDateString('es-CO'),
        completada_por: []
    };

    let localActs = JSON.parse(localStorage.getItem('actividades_asignadas_db') || '[]');
    localActs.unshift(nuevaActividad);
    localStorage.setItem('actividades_asignadas_db', JSON.stringify(localActs));

    try {
        await fetch('/api/asignar-actividad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaActividad)
        });
    } catch(err) {
        console.warn("Fallo guardando en backend:", err);
    }

    if (window.enviarAlertaTelegram) {
        window.enviarAlertaTelegram(`🎮 *ACTIVIDAD GENERADA CON IA Y ASIGNADA*\n\n📚 *Materia:* ${materia}\n👥 *Grupo:* ${grupoDestino}\n👨‍🏫 *Profesor:* ${profesorNombre}\n🎯 *Juego:* ${tool.icono} ${tool.titulo}\n📝 *Tema:* ${concepto}\n🌟 *Recompensa:* +250 XP`);
    }
};
```

2. **Modify `renderizarTarjetasCajaHerramientas` in `app.js`**:
```javascript
window.renderizarTarjetasCajaHerramientas = function(categoria = 'juegos') {
    const grid = document.getElementById('grid-caja-herramientas-cards');
    if (!grid) return;

    const filtradas = window.LISTA_HERRAMIENTAS_PEDAGOGICAS.filter(h => h.categoria === categoria);

    grid.innerHTML = filtradas.map(tool => {
        const accionClick = (tool.categoria === 'juegos') 
            ? `window.abrirConfiguracionJuegoIA('${tool.id}')` 
            : `window.abrirVisorHerramienta('${tool.id}')`;

        return `
        <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 14px rgba(0,0,0,0.04); transition: transform 0.15s, box-shadow 0.15s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 10px 24px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 14px rgba(0,0,0,0.04)';">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <span style="font-size: 2.3rem; background: #F8FAFC; padding: 8px 12px; border-radius: 14px; border: 1px solid #E2E8F0;">${tool.icono}</span>
                    <span style="font-size: 0.75rem; font-weight: 800; color: #4338CA; background: #EEF2FF; padding: 4px 10px; border-radius: 8px; text-transform: uppercase;">${tool.caja.split(':')[0]}</span>
                </div>
                <h4 style="margin: 0 0 6px 0; font-size: 1.12rem; font-weight: 900; color: #1E293B; line-height: 1.3;">${tool.titulo}</h4>
                <p style="margin: 0 0 14px 0; color: #64748B; font-size: 0.86rem; line-height: 1.45;">${tool.desc}</p>
                
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                    ${tool.badges.map(b => `<span style="font-size: 0.75rem; font-weight: 800; background: #F1F5F9; color: #334155; padding: 3px 8px; border-radius: 6px; border: 1px solid #E2E8F0;">${b}</span>`).join('')}
                </div>
            </div>

            <button onclick="${accionClick}" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; border: none; padding: 11px 16px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                <span>⚡</span> Generar y Abrir
            </button>
        </div>
        `;
    }).join('');
};
```

3. **Add Interception Guard in `abrirVisorHerramienta`**:
```javascript
window.abrirVisorHerramienta = function(herramientaId, omitirIntercepcionIA = false) {
    const tool = window.LISTA_HERRAMIENTAS_PEDAGOGICAS.find(h => h.id === herramientaId);
    if (!tool) return;

    // Interceptar si es una herramienta de juegos y no viene desde el modal de configuración IA
    if (tool.categoria === 'juegos' && !omitirIntercepcionIA && typeof window.abrirConfiguracionJuegoIA === 'function') {
        window.abrirConfiguracionJuegoIA(herramientaId);
        return;
    }
    // ... resto de abrirVisorHerramienta intacto
```

---

## 5. Verification Method

### 5.1 Verification Commands
The Worker can verify implementation correctness by running the test suite:
- `node tests/test_r3_aigames.js`
- `node test_e2e_runner.js`

### 5.2 Specific Assertions to Verify
1. **Tool Definition**: Ensure all 10 tools have `categoria === 'juegos'` in `app.js`.
2. **Click Interception**: Verify that clicking any of the 10 Caja 2 cards in `#grid-caja-herramientas-cards` calls `window.abrirConfiguracionJuegoIA(toolId)`.
3. **Modal UI Visibility**: Verify `#modal-configuracion-juego-ia` opens with `display: flex`, showcasing both "Palabras Clave" and "Subir Documento" tabs.
4. **Group Population**: Verify `#modal-juego-grupo-select` contains the teacher's assigned groups (`docItem.grupos` / `authSes.grupos_direccion`) plus the default option `"Todos"`.
5. **Assignment Pipeline**: Verify that generating a game creates a new activity object in `localStorage.getItem('actividades_asignadas_db')` and triggers `POST /api/asignar-actividad`.
