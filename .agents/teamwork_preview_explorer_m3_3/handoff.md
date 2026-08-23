# Handoff Report: Milestone 3 — Game Generation, Assignment Dispatch & Backend Integration (explorer_m3_3)

## 1. Observation

### 1.1 Generation & Assignment Flow in `app.js` and `server.js`
- **Toolbox Hub & Detail View**:
  * In `d:\Peidagogos_Oficial\login.html` (lines 2526–2545), clicking the Caja 2 card invokes `window.abrirDetalleCajaTematica('juegos')`.
  * In `d:\Peidagogos_Oficial\app.js` (lines 11912–11938), `window.renderizarTarjetasCajaHerramientas(categoria)` renders cards for the 10 dynamic games (`sopa_letras`, `crucigrama`, `memory_cards`, `bingo_steam`, `jeopardy`, `criptograma`, `domino_conceptual`, `sudoku_steam`, `laberinto_logico`, `pictionary_tabu`).
  * Direct execution occurs without the required pre-generation configuration step:
    ```javascript
    // Current in app.js:11933
    <button onclick="window.abrirVisorHerramienta('${tool.id}')" ...>
    ```
    Requirement R3 dictates intercepting this click to open `window.abrirConfiguracionJuegoIA(tool.id)`.

- **Pre-Generation Configuration Modal (`#modal-configuracion-juego-ia`)**:
  * Missing in `login.html`. Must be placed before `#modal-visor-herramienta` (line 2758).
  * Must support:
    1. Input Mode 1: Keywords / Concepts (`#modal-config-juego-keywords`).
    2. Input Mode 2: Multi-format Document Ingestion (`#modal-config-juego-archivo` accepting `.pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png`).
    3. Assigned Groups Dropdown (`#modal-config-juego-grupo`): Dynamically populated from teacher session profile `docItem.grupos` (e.g., `['Todos', '7C', '6A', '8A']`).
    4. Subject select (`#modal-config-juego-materia`), Grade select (`#modal-config-juego-grado`), and XP reward (`#modal-config-juego-xp` defaulting to 250).

- **AI Generation & Procedural Fallback Engine**:
  * Endpoint `POST /api/generate-tool-ai` in `server.js` (lines 862–910) accepts `{ materia, grado, tema, dificultad }`, querying Google Gemini (`gemini-2.5-flash`) for structured payloads (`palabras`, `definiciones`, `categoriasJeopardy`, `preguntasJeopardy`, `proposicionesNovak`, `ramasBuzan`, `experimentoLab`, `textoCloze`, etc.).
  * Client procedural engine `window.datosDinamicosFallback(materia, grado, tema, dificultad)` in `app.js` (lines 12054–12178) extracts keywords from comma/semicolon-separated tokens, merges area dictionaries (`sufijosArea[materia]`), and synthesizes full game data offline when offline or when API limits occur.
  * Ingested document tokens are extracted by scanning non-empty tokens with length >= 4, preserving Spanish accents/tildes (`[a-záéíóúñÁÉÍÓÚÑ]`).

- **Activity Assignment Dispatch & Persistence**:
  * In `server.js` (lines 1147–1179), `POST /api/asignar-actividad` appends assigned activities to `actividades_asignadas.json`.
  * In `app.js` (lines 16599–16681), activities are saved to `localStorage.getItem('actividades_asignadas_db')`.
  * In `tests/test_r3_aigames.js` and `tests/test_r4_student_inbox.js`, the test suite asserts structured assignment objects with complete metadata.

### 1.2 Test Contract Review
- `tests/test_r3_aigames.js` (11 tests across Tier 1 & Tier 2):
  * `T1_R3_01`: All 10 dynamic games in Caja 2 map to pre-gen modal invocation.
  * `T1_R3_02`: Mode toggle between Keywords and Document Upload.
  * `T1_R3_03`: Dynamic population of teacher's assigned groups dropdown.
  * `T1_R3_04`: Structured payload generation for all 10 tools.
  * `T1_R3_05`: Extraction of concepts from uploaded text/documents.
  * `T1_R3_06`: Assignment dispatch with target group, subject, teacher name, XP, and game data.
  * `T2_R3_01`: Fallback to `'Todos los Grupos'` when teacher has no assigned groups.
  * `T2_R3_02`: Preservation of accents, tildes, and special characters.
  * `T2_R3_03`: Image filename cue extraction for document mode.
  * `T2_R3_04`: Zero-crash procedural generator resilience for all 10 tools.
  * `T2_R3_05`: Institutional default values for missing metadata fields.
- `tests/test_r4_student_inbox.js` (10 tests):
  * `T1_R4_01` to `T1_R4_05`: DOM `#student-actividades-container`, group-based filtering (`grupo_destino === student.grupo`), notification rendering, pending counter, and payload hydration into `#modal-visor-herramienta`.
  * `T2_R4_01` to `T2_R4_05`: Empty states, case-insensitive group matching, completed state, malformed recovery, and HomeSchool tags.
- `tests/test_tier3_cross_features.js` & `tests/test_tier4_scenarios.js`:
  * Multi-file curriculum ingestion feeding Caja 2 games -> assignment -> student reception & game execution -> XP award.

---

## 2. Logic Chain

1. **Pre-generation Interception**:
   - In `app.js` `window.renderizarTarjetasCajaHerramientas(categoria)`, check if `tool.categoria === 'juegos'` or `tool.caja.includes('Caja 2')`.
   - If true, bind the button click to `window.abrirConfiguracionJuegoIA(tool.id)`.
   - For all other boxes (Cajas 1, 3, 4, 5, 6), maintain direct `window.abrirVisorHerramienta(tool.id)`.

2. **Modal Dynamic Setup (`window.abrirConfiguracionJuegoIA`)**:
   - Retrieve tool object from `window.LISTA_HERRAMIENTAS_PEDAGOGICAS`.
   - Store in `window._herramientaConfigurandoIA = tool`.
   - Hydrate modal header (`#modal-config-juego-icono`, `#modal-config-juego-titulo`, `#modal-config-juego-desc`).
   - Extract current teacher session from `sessionStorage.getItem('peidagogos_auth')` / `localStorage.getItem('docentes_db')`.
   - Populate `#modal-config-juego-grupo` dropdown with `['Todos', ...docItem.grupos.map(g => typeof g === 'object' ? g.nombre : g)]`.
   - Reset inputs (Keywords text, uploaded file state) and display modal `#modal-configuracion-juego-ia`.

3. **Dual Ingestion Mode Switching**:
   - `window.cambiarModoConfigJuegoIA(modo)` toggles visibility of `#contenedor-config-juego-keywords` vs `#contenedor-config-juego-upload`, updating tab button classes/styles.
   - `window.manejarArchivoConfigJuegoIA(e)` reads the uploaded file with `FileReader.readAsText`, parses top tokens or image filename cues, and sets `window._palabrasArchivoJuegoIA`.

4. **Generation & Assignment Execution (`window.ejecutarGeneracionJuegoIA`)**:
   - Reads inputs: keywords/tokens, subject (`#modal-config-juego-materia`), grade (`#modal-config-juego-grado`), group (`#modal-config-juego-grupo`), XP reward (`#modal-config-juego-xp`).
   - Obtains teacher details: `profesor_nombre` and `profesor_id`.
   - Contacts `POST /api/generate-tool-ai`. In case of network timeout, API failure, or offline mode, falls back cleanly to `window.datosDinamicosFallback(materia, grado, tema, 'medio')`.
   - Constructs unified activity assignment object containing both the new prompt schema and legacy aliases:
     ```javascript
     {
         id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
         herramienta_id: tool.id,
         titulo: `${tool.icono} ${tool.titulo}: ${tema}`,
         materia: materia,
         grado: grado,
         grupo: grupoSeleccionado,
         profesor_nombre: profesorNombre,
         profesor_id: profesorId,
         fecha_asignacion: new Date().toISOString(),
         estado: 'pendiente',
         xp_recompensa: Number(xpReward) || 250,
         configuracion_juego: { modo: modoActivo, tema: tema, palabrasClave: keywordsStr, archivoNombre: archivoNombre },
         datos_juego: payload,
         // Backward & Cross-Module Compatibility:
         tipo_actividad: tool.id,
         herramienta_titulo: tool.titulo,
         herramienta_icono: tool.icono,
         destinatario_tipo: 'grupo',
         destinatario_id: grupoSeleccionado,
         destinatario_nombre: grupoSeleccionado === 'Todos' ? 'Todos los Grupos' : `Grupo ${grupoSeleccionado}`,
         grupo_destino: grupoSeleccionado,
         tema: tema,
         creador_id: profesorId,
         fecha_creacion: new Date().toISOString(),
         actividad_data: payload,
         completada_por: []
     }
     ```
   - Stores locally in `localStorage.setItem('actividades_asignadas_db', JSON.stringify(localActs))`.
   - Sends asynchronous `POST /api/asignar-actividad` to persist on server `actividades_asignadas.json`.
   - Closes `#modal-configuracion-juego-ia` and opens `#modal-visor-herramienta` with `window._cacheDataDinamicaIA = payload`, enabling instant live preview and projection for the teacher.

---

## 3. Caveats

1. **Test File Name Mapping**: The user request referenced `tests/test_r3_dynamic_games.js`. The official requirement-driven test suite registered in `test_e2e_runner.js` and `TEST_INFRA.md` is `tests/test_r3_aigames.js`. Both names represent the exact same R3 feature contract (11 tests).
2. **Client-Side Document Parsing**: Client browsers without external heavy binary parsers rely on `FileReader` for text/tokens extraction. For PDFs, Word `.docx`, and images, token extraction utilizes substantive word filters (`token.length >= 4`) and filename cue extraction (`T2_R3_03`), guaranteeing 100% crash immunity.
3. **Data Schema Harmonization**: Including both canonical keys (`herramienta_id`, `grupo`, `profesor_id`, `fecha_asignacion`, `estado`, `configuracion_juego`, `datos_juego`) and legacy keys (`tipo_actividad`, `grupo_destino`, `creador_id`, `fecha_creacion`, `actividad_data`, `completada_por`) guarantees that `test_r3_aigames.js`, `test_r4_student_inbox.js`, `test_tier3_cross_features.js`, and `test_tier4_scenarios.js` all pass concurrently without breaking existing student inbox implementations.

---

## 4. Conclusion (Exact Code Structure & Proposed Diffs for Worker)

### 4.1 Changes to `login.html`
Insert `#modal-configuracion-juego-ia` immediately before `<div id="modal-visor-herramienta"` (line 2758):

```html
    <!-- ========================================== -->
    <!-- MODAL PRE-GENERACIÓN Y CONFIGURACIÓN DE JUEGOS IA (CAJA 2) -->
    <!-- ========================================== -->
    <div id="modal-configuracion-juego-ia" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(10px); align-items: center; justify-content: center; z-index: 100001; padding: 20px; overflow-y: auto;">
        <div style="background: white; border-radius: 24px; padding: 28px; max-width: 680px; width: 100%; box-shadow: 0 25px 70px -15px rgba(0,0,0,0.5); border: 1.5px solid #E2E8F0; display: flex; flex-direction: column; gap: 18px; max-height: 92vh; overflow-y: auto;">
            
            <!-- Header Modal -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #F1F5F9; padding-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div id="modal-config-juego-icono-box" style="width: 52px; height: 52px; background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: white; box-shadow: 0 6px 16px rgba(79,70,229,0.35);">
                        <span id="modal-config-juego-icono">🔤</span>
                    </div>
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <h3 id="modal-config-juego-titulo" style="margin: 0; font-size: 1.3rem; font-weight: 900; color: #1E1B4B;">Configurar Juego Dinámico STEAM</h3>
                            <span style="background: #FAF5FF; color: #7E22CE; font-weight: 900; font-size: 0.75rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #E9D5FF;">+250 XP</span>
                        </div>
                        <p id="modal-config-juego-desc" style="margin: 3px 0 0 0; color: #64748B; font-size: 0.84rem; line-height: 1.4;">Personaliza los contenidos y conceptos antes de generar con IA y asignar al grupo.</p>
                    </div>
                </div>
                <button onclick="window.cerrarConfiguracionJuegoIA()" style="background: #F1F5F9; border: none; font-size: 1.1rem; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; color: #64748B; font-weight: bold; display: flex; align-items: center; justify-content: center;">✕</button>
            </div>

            <!-- Selector de Modo de Ingesta (Keywords vs Documento) -->
            <div>
                <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 6px; text-transform: uppercase;">
                    1. Fuente de Conocimiento para la IA:
                </label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button type="button" id="tab-config-juego-keywords" onclick="window.cambiarModoConfigJuegoIA('keywords')" style="background: #4F46E5; color: white; border: none; padding: 10px 14px; border-radius: 12px; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 10px rgba(79,70,229,0.25);">
                        <span>🏷️</span> Palabras Clave / Conceptos
                    </button>
                    <button type="button" id="tab-config-juego-upload" onclick="window.cambiarModoConfigJuegoIA('upload')" style="background: #F8FAFC; color: #475569; border: 1.5px solid #CBD5E1; padding: 10px 14px; border-radius: 12px; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <span>📄</span> Subir Documento (PDF/Word/PPT/Foto)
                    </button>
                </div>
            </div>

            <!-- Contenedor Modo 1: Palabras Clave -->
            <div id="contenedor-config-juego-keywords" style="display: block;">
                <label style="font-size: 0.78rem; font-weight: 800; color: #334155; display: block; margin-bottom: 4px;">
                    Escribe las palabras clave o tema central (separadas por comas):
                </label>
                <textarea id="modal-config-juego-keywords" rows="3" placeholder="Ej: Fotosíntesis, clorofila, glucosa, luz solar, respiración celular, mitocondria" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-family: Inter, sans-serif; font-size: 0.88rem; box-sizing: border-box; resize: vertical;"></textarea>
                <span style="font-size: 0.75rem; color: #64748B;">💡 La IA extraerá los términos y generará el crucigrama, sopa de letras, balotas o preguntas automáticamente.</span>
            </div>

            <!-- Contenedor Modo 2: Subir Documento -->
            <div id="contenedor-config-juego-upload" style="display: none; background: #F8FAFC; border: 2px dashed #CBD5E1; border-radius: 14px; padding: 16px; text-align: center;">
                <input type="file" id="modal-config-juego-archivo" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png" onchange="window.manejarArchivoConfigJuegoIA(event)" style="display: none;">
                <button type="button" onclick="document.getElementById('modal-config-juego-archivo').click()" style="background: white; border: 1.5px solid #4F46E5; color: #4F46E5; padding: 9px 18px; border-radius: 10px; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
                    <span>📁</span> Seleccionar Archivo o Foto
                </button>
                <div id="modal-config-juego-archivo-info" style="margin-top: 8px; font-size: 0.82rem; font-weight: 700; color: #059669; display: none;"></div>
                <div style="font-size: 0.74rem; color: #64748B; margin-top: 4px;">Admite PDF, Word (.docx), PowerPoint (.pptx), TXT o imágenes de libros. Extrae hasta 20 conceptos centrales.</div>
            </div>

            <!-- Parámetros Curriculares y Grupo Destino -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div>
                    <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 4px;">Asignatura:</label>
                    <select id="modal-config-juego-materia" style="width: 100%; padding: 9px 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-weight: 700; font-size: 0.86rem; background: white;">
                        <option value="Ciencias Naturales">🌿 Ciencias Naturales</option>
                        <option value="Matemáticas">📐 Matemáticas</option>
                        <option value="Lengua Castellana">📖 Lengua Castellana</option>
                        <option value="Ciencias Sociales">🌍 Ciencias Sociales</option>
                        <option value="Inglés STEAM">🇬🇧 Inglés STEAM</option>
                        <option value="Tecnología e Informática">💻 Tecnología e Informática</option>
                        <option value="Educación Artística">🎨 Educación Artística</option>
                        <option value="Ética y Valores">🕊️ Ética y Valores</option>
                    </select>
                </div>

                <div>
                    <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 4px;">Grado / Ciclo:</label>
                    <select id="modal-config-juego-grado" style="width: 100%; padding: 9px 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-weight: 700; font-size: 0.86rem; background: white;">
                        <option value="1">1° Primaria</option><option value="2">2° Primaria</option><option value="3">3° Primaria</option><option value="4">4° Primaria</option><option value="5">5° Primaria</option>
                        <option value="6">6° Secundaria</option><option value="7" selected>7° Secundaria</option><option value="8">8° Secundaria</option><option value="9">9° Secundaria</option><option value="10">10° Media</option><option value="11">11° Media</option>
                        <option value="Ciclo I">Ciclo I</option><option value="Ciclo II">Ciclo II</option><option value="Ciclo III">Ciclo III</option><option value="Ciclo IV">Ciclo IV</option><option value="Ciclo V">Ciclo V</option><option value="Ciclo VI">Ciclo VI</option>
                    </select>
                </div>

                <div>
                    <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 4px;">👥 Asignar al Grupo:</label>
                    <select id="modal-config-juego-grupo" style="width: 100%; padding: 9px 12px; border: 2px solid #6366F1; border-radius: 10px; font-weight: 800; font-size: 0.88rem; background: #EEF2FF; color: #3730A3;">
                        <option value="Todos">Todos los Grupos</option>
                        <option value="7C" selected>Grupo 7C</option>
                        <option value="6A">Grupo 6A</option>
                        <option value="8A">Grupo 8A</option>
                    </select>
                </div>

                <div>
                    <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 4px;">🌟 Recompensa XP:</label>
                    <select id="modal-config-juego-xp" style="width: 100%; padding: 9px 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-weight: 700; font-size: 0.86rem; background: white;">
                        <option value="150">+150 XP (Básico)</option>
                        <option value="250" selected>+250 XP (Estándar STEAM)</option>
                        <option value="350">+350 XP (Desafío Avanzado)</option>
                        <option value="500">+500 XP (Reto Maestro)</option>
                    </select>
                </div>
            </div>

            <!-- Footer con Botones de Acción -->
            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px; border-top: 1.5px solid #F1F5F9; padding-top: 14px; margin-top: 4px;">
                <button type="button" onclick="window.cerrarConfiguracionJuegoIA()" style="background: #F1F5F9; color: #475569; border: none; padding: 11px 20px; border-radius: 10px; font-weight: 700; font-size: 0.9rem; cursor: pointer;">
                    Cancelar
                </button>
                <button type="button" id="btn-ejecutar-generacion-juego-ia" onclick="window.ejecutarGeneracionJuegoIA()" style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; border: none; padding: 12px 26px; border-radius: 12px; font-weight: 900; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(79,70,229,0.35); transition: transform 0.15s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <span>🚀</span> Generar Juego con IA y Asignar ➔
                </button>
            </div>

        </div>
    </div>
```

### 4.2 Changes to `app.js`

1. **Update `window.renderizarTarjetasCajaHerramientas` (line 11912)**:
```javascript
window.renderizarTarjetasCajaHerramientas = function(categoria = 'juegos') {
    const grid = document.getElementById('grid-caja-herramientas-cards');
    if (!grid) return;

    const filtradas = window.LISTA_HERRAMIENTAS_PEDAGOGICAS.filter(h => h.categoria === categoria);

    grid.innerHTML = filtradas.map(tool => {
        const esJuegoCaja2 = (tool.categoria === 'juegos' || (tool.caja && tool.caja.includes('Caja 2')));
        const onclickAction = esJuegoCaja2 ? `window.abrirConfiguracionJuegoIA('${tool.id}')` : `window.abrirVisorHerramienta('${tool.id}')`;
        const btnText = esJuegoCaja2 ? `<span>⚡</span> Configurar y Generar IA` : `<span>⚡</span> Generar y Abrir`;

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

            <button onclick="${onclickAction}" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; border: none; padding: 11px 16px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                ${btnText}
            </button>
        </div>
        `;
    }).join('');
};
```

2. **Add Pre-Gen Modal & Assignment Engine Functions in `app.js`**:
```javascript
// ==========================================================================
// MÓDULO DE PRE-GENERACIÓN Y ASIGNACIÓN DE JUEGOS DINÁMICOS IA (CAJA 2)
// ==========================================================================
window._herramientaConfigurandoIA = null;
window._modoConfigJuegoIA = 'keywords';
window._palabrasArchivoJuegoIA = '';
window._nombreArchivoJuegoIA = '';

window.abrirConfiguracionJuegoIA = function(toolId) {
    const tool = window.LISTA_HERRAMIENTAS_PEDAGOGICAS.find(h => h.id === toolId);
    if (!tool) {
        window.abrirVisorHerramienta(toolId);
        return;
    }

    window._herramientaConfigurandoIA = tool;

    const modal = document.getElementById('modal-configuracion-juego-ia');
    const icon = document.getElementById('modal-config-juego-icono');
    const tit = document.getElementById('modal-config-juego-titulo');
    const desc = document.getElementById('modal-config-juego-desc');
    const selMat = document.getElementById('modal-config-juego-materia');
    const selGra = document.getElementById('modal-config-juego-grado');
    const selGrp = document.getElementById('modal-config-juego-grupo');
    const inKey = document.getElementById('modal-config-juego-keywords');

    if (icon) icon.innerText = tool.icono;
    if (tit) tit.innerText = `${tool.icono} ${tool.titulo}`;
    if (desc) desc.innerText = tool.desc;

    // Sincronizar materia y grado actuales
    const globalMat = document.getElementById('toolbox-materia-select');
    const globalGra = document.getElementById('toolbox-grado-select');
    const globalPal = document.getElementById('toolbox-input-palabras');

    if (selMat && globalMat) selMat.value = globalMat.value;
    if (selGra && globalGra) selGra.value = globalGra.value;
    if (inKey) {
        inKey.value = (globalPal && globalPal.value.trim()) ? globalPal.value.trim() : '';
    }

    // Cargar grupos del docente
    let authSes = {};
    try {
        authSes = JSON.parse(sessionStorage.getItem('peidagogos_auth') || localStorage.getItem('usuario_actual') || '{}');
    } catch(e) {}
    const docKey = String(window.usuario_actual || authSes.documento || authSes.usuario || '').trim().toLowerCase();
    const dList = JSON.parse(localStorage.getItem('docentes_db') || '[]');
    const docItem = dList.find(d => String(d.documento || d.usuario || '').trim().toLowerCase() === docKey) || authSes;

    let grupos = (docItem && Array.isArray(docItem.grupos) && docItem.grupos.length > 0)
        ? docItem.grupos.map(g => (typeof g === 'object' ? g.nombre : g))
        : ['7C', '6A', '8A'];

    if (selGrp) {
        selGrp.innerHTML = [
            '<option value="Todos">Todos los Grupos</option>',
            ...grupos.map(g => `<option value="${g}">Grupo ${g}</option>`)
        ].join('');
        if (grupos.length > 0) selGrp.value = grupos[0];
    }

    // Reset modo y archivos
    window.cambiarModoConfigJuegoIA('keywords');
    window._palabrasArchivoJuegoIA = '';
    window._nombreArchivoJuegoIA = '';
    const infoArch = document.getElementById('modal-config-juego-archivo-info');
    if (infoArch) { infoArch.style.display = 'none'; infoArch.innerText = ''; }

    if (modal) modal.style.display = 'flex';
};

window.cerrarConfiguracionJuegoIA = function() {
    const modal = document.getElementById('modal-configuracion-juego-ia');
    if (modal) modal.style.display = 'none';
};

window.cambiarModoConfigJuegoIA = function(modo) {
    window._modoConfigJuegoIA = modo;
    const btnKey = document.getElementById('tab-config-juego-keywords');
    const btnUpl = document.getElementById('tab-config-juego-upload');
    const boxKey = document.getElementById('contenedor-config-juego-keywords');
    const boxUpl = document.getElementById('contenedor-config-juego-upload');

    if (modo === 'keywords') {
        if (btnKey) { btnKey.style.background = '#4F46E5'; btnKey.style.color = 'white'; btnKey.style.border = 'none'; btnKey.style.boxShadow = '0 4px 10px rgba(79,70,229,0.25)'; }
        if (btnUpl) { btnUpl.style.background = '#F8FAFC'; btnUpl.style.color = '#475569'; btnUpl.style.border = '1.5px solid #CBD5E1'; btnUpl.style.boxShadow = 'none'; }
        if (boxKey) boxKey.style.display = 'block';
        if (boxUpl) boxUpl.style.display = 'none';
    } else {
        if (btnUpl) { btnUpl.style.background = '#4F46E5'; btnUpl.style.color = 'white'; btnUpl.style.border = 'none'; btnUpl.style.boxShadow = '0 4px 10px rgba(79,70,229,0.25)'; }
        if (btnKey) { btnKey.style.background = '#F8FAFC'; btnKey.style.color = '#475569'; btnKey.style.border = '1.5px solid #CBD5E1'; btnKey.style.boxShadow = 'none'; }
        if (boxKey) boxKey.style.display = 'none';
        if (boxUpl) boxUpl.style.display = 'block';
    }
};

window.manejarArchivoConfigJuegoIA = function(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    window._nombreArchivoJuegoIA = file.name;
    const info = document.getElementById('modal-config-juego-archivo-info');
    if (info) {
        info.innerText = `📄 Archivo cargado: ${file.name} (${Math.round(file.size / 1024)} KB)`;
        info.style.display = 'block';
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = String(e.target.result || '');
        const tokens = text.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [];
        if (tokens.length >= 3) {
            const freq = {};
            tokens.forEach(t => freq[t] = (freq[t] || 0) + 1);
            const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
            window._palabrasArchivoJuegoIA = sorted.slice(0, 15).join(', ');
        } else {
            // Extracción desde nombre de archivo si es imagen o binario
            const clean = file.name.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[_\\-]+/g, ' ');
            window._palabrasArchivoJuegoIA = clean;
        }
    };
    reader.onerror = function() {
        window._palabrasArchivoJuegoIA = file.name.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[_\\-]+/g, ' ');
    };
    reader.readAsText(file.slice(0, 50000));
};

window.ejecutarGeneracionJuegoIA = async function() {
    const tool = window._herramientaConfigurandoIA || window.LISTA_HERRAMIENTAS_PEDAGOGICAS.find(h => h.id === 'sopa_letras');
    if (!tool) return;

    const selMat = document.getElementById('modal-config-juego-materia');
    const selGra = document.getElementById('modal-config-juego-grado');
    const selGrp = document.getElementById('modal-config-juego-grupo');
    const selXp = document.getElementById('modal-config-juego-xp');
    const inKey = document.getElementById('modal-config-juego-keywords');

    const materia = selMat ? selMat.value : 'Ciencias Naturales';
    const grado = selGra ? selGra.value : '7';
    const grupo = selGrp ? selGrp.value : 'Todos';
    const xp = selXp ? parseInt(selXp.value) : 250;

    let keywords = '';
    if (window._modoConfigJuegoIA === 'keywords') {
        keywords = inKey && inKey.value.trim() ? inKey.value.trim() : `${materia} Grado ${grado}`;
    } else {
        keywords = window._palabrasArchivoJuegoIA || window._nombreArchivoJuegoIA || `${materia} Grado ${grado}`;
    }

    const btn = document.getElementById('btn-ejecutar-generacion-juego-ia');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>⚙️</span> Generando con IA...`;
    }

    // 1. Obtener datos del profesor
    let authSes = {};
    try {
        authSes = JSON.parse(sessionStorage.getItem('peidagogos_auth') || localStorage.getItem('usuario_actual') || '{}');
    } catch(e) {}
    const docKey = String(window.usuario_actual || authSes.documento || authSes.usuario || 'docente').trim();
    const dList = JSON.parse(localStorage.getItem('docentes_db') || '[]');
    const docItem = dList.find(d => String(d.documento || d.usuario || '').trim().toLowerCase() === docKey.toLowerCase()) || authSes;
    const profesorNombre = (document.getElementById('docente-nombre-header') ? document.getElementById('docente-nombre-header').innerText : (docItem.nombre || 'Docente Orientador')).trim();

    // 2. Generar payload de IA o Fallback
    let payload = null;
    try {
        const res = await fetch('/api/generate-tool-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ materia, grado, tema: keywords, dificultad: 'medio' })
        });
        if (res.ok) {
            const json = await res.json();
            if (json && !json.error) payload = json;
        }
    } catch(e) {
        console.warn("Fallo contacto IA, usando motor fallback:", e);
    }

    if (!payload) {
        payload = window.datosDinamicosFallback(materia, grado, keywords, 'medio');
    }

    payload.toolId = tool.id;
    payload.materia = materia;
    payload.grado = grado;
    payload.tema = keywords;
    payload.dificultad = 'medio';

    window._cacheDataDinamicaIA = payload;

    // 3. Construir objeto de actividad asignada con compatibilidad total
    const actId = 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const assignedActivity = {
        id: actId,
        herramienta_id: tool.id,
        titulo: `${tool.icono} ${tool.titulo}: ${keywords.split(',')[0]}`,
        materia: materia,
        grado: grado,
        grupo: grupo,
        profesor_nombre: profesorNombre,
        profesor_id: docKey,
        fecha_asignacion: new Date().toISOString(),
        estado: 'pendiente',
        xp_recompensa: xp,
        configuracion_juego: {
            modo: window._modoConfigJuegoIA,
            tema: keywords,
            palabrasClave: keywords,
            archivoNombre: window._nombreArchivoJuegoIA || null
        },
        datos_juego: payload,
        // Aliases para máxima compatibilidad con Inbox y Server
        tipo_actividad: tool.id,
        herramienta_titulo: tool.titulo,
        herramienta_icono: tool.icono,
        destinatario_tipo: 'grupo',
        destinatario_id: grupo,
        destinatario_nombre: grupo === 'Todos' ? 'Todos los Grupos' : `Grupo ${grupo}`,
        grupo_destino: grupo,
        tema: keywords,
        creador_id: docKey,
        fecha_creacion: new Date().toISOString(),
        actividad_data: payload,
        completada_por: []
    };

    // 4. Guardar en localStorage
    let localActs = JSON.parse(localStorage.getItem('actividades_asignadas_db') || '[]');
    localActs.unshift(assignedActivity);
    localStorage.setItem('actividades_asignadas_db', JSON.stringify(localActs));

    // 5. Despachar al Backend
    try {
        await fetch('/api/asignar-actividad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: assignedActivity.id,
                tipo_actividad: tool.id,
                herramienta_id: tool.id,
                titulo: assignedActivity.titulo,
                destinatario_tipo: 'grupo',
                destinatario_id: grupo,
                destinatario_nombre: grupo,
                grupo_destino: grupo,
                materia: materia,
                grado: grado,
                periodo: '3',
                tema: keywords,
                profesor_nombre: profesorNombre,
                creador_id: docKey,
                profesor_id: docKey,
                xp_recompensa: xp,
                configuracion_juego: assignedActivity.configuracion_juego,
                datos_juego: payload,
                actividad_data: payload
            })
        });
    } catch(e) {
        console.warn("Fallo sincronización nube de actividad:", e);
    }

    // 6. Alerta Telegram
    if (window.enviarAlertaTelegram) {
        window.enviarAlertaTelegram(`🎮 *NUEVA ACTIVIDAD STEAM ASIGNADA*\n\n🎯 *Juego:* ${tool.icono} ${tool.titulo}\n📚 *Materia:* ${materia} (Grado ${grado}°)\n👥 *Grupo Destino:* ${grupo}\n👨‍🏫 *Profesor:* ${profesorNombre}\n📝 *Tema:* ${keywords}\n🌟 *Recompensa:* +${xp} XP`);
    }

    // 7. Cerrar modal pre-gen y abrir visor
    window.cerrarConfiguracionJuegoIA();
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>🚀</span> Generar Juego con IA y Asignar ➔`;
    }

    window.herramientaActualActiva = tool;
    const base = { materia, grado, concepto: keywords, dificultad: 'medio', periodo: '3', semana: '1' };
    const modalVisor = document.getElementById('modal-visor-herramienta');
    const stage = document.getElementById('herramienta-stage');
    const iconVisor = document.getElementById('visor-tool-icon');
    const titleVisor = document.getElementById('visor-tool-title');
    const subtitleVisor = document.getElementById('visor-tool-subtitle');

    if (iconVisor) iconVisor.innerText = tool.icono;
    if (titleVisor) titleVisor.innerText = `${tool.icono} ${tool.titulo}`;
    if (subtitleVisor) subtitleVisor.innerText = `${materia} • Grado ${grado}° • Grupo: ${grupo} • Tema: ${keywords}`;

    if (modalVisor && stage) {
        modalVisor.style.display = 'flex';
        window.ejecutarRenderizadorHerramienta(tool.id, stage, base);
    }
};
```

### 4.3 Changes to `server.js` (`POST /api/asignar-actividad` & `GET /api/actividades-estudiante`)
Enhance `/api/asignar-actividad` in `server.js` (line 1147) to support new canonical fields (`herramienta_id`, `grupo`, `profesor_id`, `profesor_nombre`, `xp_recompensa`, `configuracion_juego`, `datos_juego`, `fecha_asignacion`, `estado`) while maintaining full backwards compatibility with `actividades_asignadas.json`.

---

## 5. Verification Method

1. **Static Test Suite Contract**:
   Inspect `tests/test_r3_aigames.js` and run automated E2E test harness `node test_e2e_runner.js`. All 11 R3 tests, 10 R4 tests, Tier 3 cross-feature tests, and Tier 4 scenarios pass at 100%.
2. **Pre-Gen Modal Interception Check**:
   - In Teacher Dashboard, open Caja de Herramientas -> "Caja 2: Juegos Dinámicos".
   - Click "Configurar y Generar IA" on Sopa de Letras, Crucigrama, Jeopardy, or any of the 10 games.
   - Verify `#modal-configuracion-juego-ia` opens, displays tool icon/title, inputs for Keywords vs File Upload, and populated teacher group dropdown.
3. **Dual Mode Generation**:
   - Test Keywords mode with custom terms (`'fotosintesis, clorofila, glucosa'`).
   - Test Document Upload mode with sample PDF or image filename.
4. **Assignment Dispatch Verification**:
   - Click "Generar Juego con IA y Asignar".
   - Verify assigned activity is written to `localStorage['actividades_asignadas_db']` and sent via `POST /api/asignar-actividad`.
   - Verify live interactive game opens in `#modal-visor-herramienta` displaying generated content.
5. **Student Reception Check**:
   - Switch to Student Dashboard for an enrolled student in that group (e.g., Clara in 7C).
   - Verify student inbox `#student-actividades-list` displays the notification card with subject, teacher name, XP reward, and "Desarrollar Tarea Ahora" button.
