# Handoff Report — explorer_m3_1: UI & DOM Requirements for Milestone 3 (R3: Dynamic AI Game Generation)

## 1. Observation
- **Workspace File Locations**:
  - `d:\Peidagogos_Oficial\login.html` (Lines 2470–2765): Defines modals including `#modal-caja-herramientas` (lines 2473–2753) and `#modal-visor-herramienta` (lines 2758–2890).
  - `#modal-configuracion-juego-ia` is referenced in `PROJECT.md` (lines 9, 54-57, 60), `TEST_INFRA.md` (lines 21, 52), and survey handoffs, but is currently absent from `login.html`.
- **Existing Toolbox Card Invocation in `app.js`**:
  - In `app.js` line 11933:
    ```html
    <button onclick="window.abrirVisorHerramienta('${tool.id}')" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); ...">
        <span>⚡</span> Generar y Abrir
    </button>
    ```
    Currently, all cards in `window.renderizarTarjetasCajaHerramientas` call `abrirVisorHerramienta` directly.
- **10 Dynamic Tools in Caja 2 (`categoria: 'juegos'`)**:
  - `sopa_letras` (🔤 Sopa de Letras Temática)
  - `crucigrama` (🧩 Crucigrama Conceptual)
  - `memory_cards` (🃏 Duelo de Emparejamiento (Memory))
  - `bingo_steam` (🎯 Bingo Pedagógico STEAM)
  - `jeopardy` (🎪 Tablero Concurso Jeopardy ($100-$500))
  - `criptograma` (🔠 Criptogramas y Anagramas Secretos)
  - `domino_conceptual` (🧱 Dominó Conceptual de Saberes)
  - `sudoku_steam` (🔢 Sudoku y Kakuro Lógico STEAM)
  - `laberinto_logico` (🗺️ Laberinto Lógico de Decisiones)
  - `pictionary_tabu` (🎭 Ruleta Pictionary y Tabú STEAM)
- **DOM & Contract Requirements Verified in `tests/test_r3_aigames.js`**:
  - Feature 6: Pre-generation modal `#modal-configuracion-juego-ia` must be opened before generating any of the 10 dynamic games.
  - Feature 7: Input modes must support Mode 1 (`'keywords'`) and Mode 2 (`'upload'`).
  - Feature 8: Assigned Grades/Groups dropdown must dynamically populate with the teacher's groups, with fallback to `'Todos los Grupos'`.
  - Feature 9: Action button dispatches activity assignment to `actividades_asignadas_db` and backend `/api/asignar-actividad`, or allows live classroom projection in `#modal-visor-herramienta`.
- **Non-Destructive Editing Guidelines** (`.agents/rules/non_destructive_editing.md`):
  - Zero complete file overwrites.
  - Preserve all existing DOM containers, forms, and scripts.
  - Additive injection with consistent design styling.

---

## 2. Logic Chain

1. **Mounting Position in `login.html`**:
   - `#modal-caja-herramientas` ends at line 2753 (`</div>\n    </div>`).
   - `#modal-visor-herramienta` begins at line 2758.
   - Inserting `#modal-configuracion-juego-ia` between line 2753 and 2758 creates a clean, logical DOM hierarchy: Toolbox Hub -> Pre-Gen Config Modal -> Interactive Tool Visor.

2. **Modal Component Hierarchy**:
   The `#modal-configuracion-juego-ia` requires the following DOM elements:
   - **Root Container**:
     `<div id="modal-configuracion-juego-ia" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(10px); align-items: center; justify-content: center; z-index: 100001; padding: 20px; overflow-y: auto;">`
   - **Header**:
     - Tool Icon: `<span id="modal-juego-ia-icono">🔤</span>`
     - Tool Title: `<h3 id="modal-juego-ia-titulo">Configurar Juego Dinámico con IA</h3>`
     - Tool Subtitle/Description: `<p id="modal-juego-ia-desc">Personaliza los parámetros pedagógicos...</p>`
     - Close Button: `<button onclick="window.cerrarConfiguracionJuegoIA()">✕</button>`
   - **Hidden State Fields**:
     - `<input type="hidden" id="modal-juego-ia-herramienta-id" value="">`
     - `<input type="hidden" id="modal-juego-ia-modo-activo" value="keywords">`
   - **Mode Selector Tabs**:
     - Mode 1 Button: `<button type="button" id="tab-juego-modo-keywords" onclick="window.cambiarModoConfigJuegoIA('keywords')">🏷️ Palabras Clave / Tema</button>`
     - Mode 2 Button: `<button type="button" id="tab-juego-modo-upload" onclick="window.cambiarModoConfigJuegoIA('upload')">📄 Subir un Documento</button>`
   - **Mode 1 Panel (Keywords / Concept)**:
     - Container: `<div id="panel-juego-modo-keywords">`
     - Text Input / Textarea: `<textarea id="modal-juego-ia-keywords" placeholder="Ej: Fotosíntesis, Cloroplasto, Célula Vegetal..."></textarea>`
   - **Mode 2 Panel (Document / Image Upload)**:
     - Container: `<div id="panel-juego-modo-upload" style="display: none;">`
     - File Input: `<input type="file" id="modal-juego-ia-archivo" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.txt" onchange="window.manejarArchivoJuegoIA(event)">`
     - File Info Badge: `<div id="modal-juego-ia-archivo-info" style="display: none;"><span id="modal-juego-ia-archivo-nombre"></span></div>`
   - **Academic & Context Fields**:
     - Teacher Groups Dropdown: `<select id="modal-juego-ia-grupo-select" onchange="window.alCambiarGrupoJuegoIA(this.value)"><option value="Todos los Grupos">🏫 Todos los Grupos</option></select>`
     - Subject Selector: `<select id="modal-juego-ia-materia-select">` with 22 fundamental areas (`Ciencias Naturales`, `Biología`, `Física`, `Química`, `Matemáticas`, etc.).
     - Grade Selector: `<select id="modal-juego-ia-grado-select">` (1° to 11° and Ciclos I-VI).
     - Custom Topic Input: `<input type="text" id="modal-juego-ia-tema" placeholder="Ej: Ecosistemas y Cadenas Tróficas">`
     - XP Reward Dropdown: `<select id="modal-juego-ia-xp-select"><option value="150">⭐ 150 XP</option><option value="250" selected>🌟 250 XP</option><option value="350">🏆 350 XP</option><option value="500">👑 500 XP</option></select>`
   - **Action Footer**:
     - Cancel Button: `<button type="button" onclick="window.cerrarConfiguracionJuegoIA()">✕ Cancelar</button>`
     - Classroom Projector Button: `<button type="button" id="btn-modal-juego-ia-proyectar" onclick="window.ejecutarGeneracionJuegoIA({ soloProyectar: true })">📺 Solo Proyectar en Aula</button>`
     - Assign Button: `<button type="button" id="btn-modal-juego-ia-asignar" onclick="window.ejecutarGeneracionJuegoIA({ soloProyectar: false })">🚀 Generar y Asignar a Estudiantes ➔</button>`

3. **Card Invocation Bridge in `app.js`**:
   - In `window.renderizarTarjetasCajaHerramientas(categoria)`:
     ```javascript
     const botonAccion = (tool.categoria === 'juegos')
         ? `<button onclick="window.abrirConfiguracionJuegoIA('${tool.id}')" style="..."><span>⚡</span> Configurar y Generar IA</button>`
         : `<button onclick="window.abrirVisorHerramienta('${tool.id}')" style="..."><span>⚡</span> Generar y Abrir</button>`;
     ```

---

## 3. Caveats
- **Non-Destructive Requirement**: Existing modals (`#modal-caja-herramientas`, `#modal-visor-herramienta`, `#modal-asignar-actividad`) must NOT be modified or replaced.
- **Group Population Fallback**: If `authSes.grupos` is empty or undefined, the group dropdown must default gracefully to `<option value="Todos los Grupos">🏫 Todos los Grupos</option>` without throwing JavaScript exceptions.
- **Image File Ingestion**: In Mode 2, image files (`.jpg, .jpeg, .png`) should have their file names sanitized to provide semantic cues when optical OCR is not available offline.

---

## 4. Conclusion & Proposed Diffs for Worker

### Target 1: `d:\Peidagogos_Oficial\login.html`
**Location**: Insert immediately after line 2753 (closing `</div>` of `#modal-caja-herramientas`) and before line 2758 (`<!-- MODAL VISOR INTERACTIVO -->`).

```html
    <!-- ========================================== -->
    <!-- MODAL DE PRE-GENERACIÓN Y CONFIGURACIÓN DE JUEGOS IA (R3) -->
    <!-- ========================================== -->
    <div id="modal-configuracion-juego-ia" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(10px); align-items: center; justify-content: center; z-index: 100001; padding: 20px; overflow-y: auto;">
        <div style="background: white; border-radius: 22px; padding: 28px 32px; max-width: 740px; width: 100%; box-shadow: 0 25px 65px -15px rgba(0,0,0,0.4); text-align: left; max-height: 92vh; overflow-y: auto; border: 1px solid #CBD5E1; font-family: Inter, sans-serif;">
            
            <!-- Header Modal -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #F1F5F9; padding-bottom: 16px; margin-bottom: 18px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div id="modal-juego-ia-icono-bg" style="width: 52px; height: 52px; background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: white; box-shadow: 0 6px 14px rgba(79,70,229,0.3);">
                        <span id="modal-juego-ia-icono">🔤</span>
                    </div>
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <h3 id="modal-juego-ia-titulo" style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #1E1B4B;">Configurar Juego Dinámico con IA</h3>
                            <span style="background: #EEF2FF; color: #4338CA; font-weight: 900; font-size: 0.75rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #C7D2FE;">Caja 2</span>
                        </div>
                        <p id="modal-juego-ia-desc" style="margin: 3px 0 0 0; color: #64748B; font-size: 0.88rem;">Personaliza los parámetros del juego pedagógico antes de generarlo y asignarlo.</p>
                    </div>
                </div>
                <button type="button" onclick="window.cerrarConfiguracionJuegoIA()" style="background: #F1F5F9; border: none; font-size: 1.2rem; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; color: #64748B; font-weight: bold; display: flex; align-items: center; justify-content: center;">✕</button>
            </div>

            <!-- Campos Ocultos de Estado -->
            <input type="hidden" id="modal-juego-ia-herramienta-id" value="">
            <input type="hidden" id="modal-juego-ia-modo-activo" value="keywords">

            <!-- Selector de Modos (Keywords vs Documento) -->
            <div style="margin-bottom: 18px;">
                <label style="font-size: 0.85rem; font-weight: 800; color: #1E293B; display: block; margin-bottom: 8px;">
                    1. Selecciona la Fuente de Contenido Pedagógico:
                </label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <button type="button" id="tab-juego-modo-keywords" onclick="window.cambiarModoConfigJuegoIA('keywords')" style="padding: 12px; border-radius: 12px; border: 2px solid #3B82F6; background: #EFF6FF; color: #1D4ED8; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
                        <span>🏷️</span> Palabras Clave / Tema
                    </button>
                    <button type="button" id="tab-juego-modo-upload" onclick="window.cambiarModoConfigJuegoIA('upload')" style="padding: 12px; border-radius: 12px; border: 2px solid #E2E8F0; background: #F8FAFC; color: #64748B; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s;">
                        <span>📄</span> Subir un Documento (PDF, Word, PPT, JPG)
                    </button>
                </div>
            </div>

            <!-- Panel Modo 1: Palabras Clave -->
            <div id="panel-juego-modo-keywords" style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 16px; margin-bottom: 18px;">
                <label style="font-size: 0.82rem; font-weight: 800; color: #334155; display: block; margin-bottom: 6px;">
                    Conceptos o Términos Clave (separados por coma o salto de línea):
                </label>
                <textarea id="modal-juego-ia-keywords" rows="3" placeholder="Ej: Fotosíntesis, Cloroplasto, Célula Vegetal, Glucosa, Oxígeno, Luz Solar..." style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 0.88rem; box-sizing: border-box; resize: vertical; font-family: Inter, sans-serif;"></textarea>
                <p style="margin: 6px 0 0 0; font-size: 0.76rem; color: #64748B;">La IA generará definiciones, pistas deductivas o preguntas basadas en estos conceptos.</p>
            </div>

            <!-- Panel Modo 2: Subida de Documento -->
            <div id="panel-juego-modo-upload" style="display: none; background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 14px; padding: 20px; margin-bottom: 18px; text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 6px;">📁</div>
                <label for="modal-juego-ia-archivo" style="cursor: pointer; background: #3B82F6; color: white; padding: 9px 20px; border-radius: 10px; font-size: 0.86rem; font-weight: 800; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 8px; box-shadow: 0 4px 10px rgba(59,130,246,0.3);">
                    <span>📄</span> Seleccionar Documento o Imagen
                </label>
                <input type="file" id="modal-juego-ia-archivo" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.txt" onchange="window.manejarArchivoJuegoIA(event)" style="display: none;">
                <div id="modal-juego-ia-archivo-info" style="display: none; margin-top: 10px; font-size: 0.85rem; font-weight: 700; color: #059669; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 6px 14px; border-radius: 8px; align-items: center; justify-content: center; gap: 6px; width: fit-content; margin-left: auto; margin-right: auto;">
                    <span>✅</span> <span id="modal-juego-ia-archivo-nombre"></span>
                </div>
                <div style="font-size: 0.76rem; color: #64748B; margin-top: 6px;">Formatos aceptados: PDF, DOCX, PPTX, TXT o imágenes JPG/PNG de guías y libros.</div>
            </div>

            <!-- Contexto Curricular y Destinatario -->
            <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 18px; margin-bottom: 20px;">
                <label style="font-size: 0.85rem; font-weight: 800; color: #1E293B; display: block; margin-bottom: 12px;">
                    2. Destinatario y Contexto Académico:
                </label>
                <div style="display: grid; grid-template-columns: 1.2fr 1fr 0.8fr; gap: 12px; margin-bottom: 12px;">
                    <div>
                        <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 4px;">Asignar a Grupo / Grado:</label>
                        <select id="modal-juego-ia-grupo-select" onchange="window.alCambiarGrupoJuegoIA(this.value)" style="width: 100%; padding: 9px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 800; font-size: 0.85rem; background: white;">
                            <option value="Todos los Grupos">🏫 Todos los Grupos</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 4px;">Asignatura / Área:</label>
                        <select id="modal-juego-ia-materia-select" style="width: 100%; padding: 9px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: bold; font-size: 0.85rem; background: white;">
                            <option value="Ciencias Naturales">🌿 Ciencias Naturales</option>
                            <option value="Biología">🧬 Biología</option>
                            <option value="Física">⚛️ Física</option>
                            <option value="Química">🧪 Química</option>
                            <option value="Matemáticas">📐 Matemáticas</option>
                            <option value="Lengua Castellana">📖 Lengua Castellana</option>
                            <option value="Ciencias Sociales">🌍 Ciencias Sociales</option>
                            <option value="Idioma Extranjero Inglés">🇬🇧 Idioma Extranjero Inglés</option>
                            <option value="Tecnología e Informática">🖥️ Tecnología e Informática</option>
                            <option value="Educación Artística">🎨 Educación Artística</option>
                            <option value="Educación Física">⚽ Educación Física</option>
                            <option value="Filosofía">🏛️ Filosofía</option>
                            <option value="Ética y Valores Humanos">🤝 Ética y Valores</option>
                            <option value="Turismo y Patrimonio">🧭 Turismo y Patrimonio</option>
                            <option value="Robótica STEAM">🤖 Robótica STEAM</option>
                            <option value="Emprendimiento">💡 Emprendimiento</option>
                            <option value="Paz y Convivencia">🕊️ Paz y Convivencia</option>
                            <option value="Estadística">📊 Estadística</option>
                            <option value="Agroecología">🌱 Agroecología</option>
                            <option value="Música">🎼 Música</option>
                            <option value="Investigación">🔬 Investigación</option>
                            <option value="Programación">💻 Programación</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 4px;">Grado Escolar:</label>
                        <select id="modal-juego-ia-grado-select" style="width: 100%; padding: 9px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: bold; font-size: 0.85rem; background: white;">
                            <option value="1">1° Primaria</option><option value="2">2° Primaria</option><option value="3">3° Primaria</option><option value="4">4° Primaria</option><option value="5">5° Primaria</option>
                            <option value="6">6° Secundaria</option><option value="7" selected>7° Secundaria</option><option value="8">8° Secundaria</option><option value="9">9° Secundaria</option><option value="10">10° Media</option><option value="11">11° Media</option>
                            <option value="Ciclo I">Ciclo I</option><option value="Ciclo II">Ciclo II</option><option value="Ciclo III">Ciclo III</option><option value="Ciclo IV">Ciclo IV</option><option value="Ciclo V">Ciclo V</option><option value="Ciclo VI">Ciclo VI</option>
                        </select>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 12px;">
                    <div>
                        <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 4px;">Tema o Título Personalizado:</label>
                        <input type="text" id="modal-juego-ia-tema" placeholder="Ej: Ecosistemas y Cadenas Tróficas" style="width: 100%; padding: 9px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-size: 0.85rem; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="font-size: 0.78rem; font-weight: 800; color: #475569; display: block; margin-bottom: 4px;">Recompensa Estudiante:</label>
                        <select id="modal-juego-ia-xp-select" style="width: 100%; padding: 9px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: bold; font-size: 0.85rem; background: white;">
                            <option value="150">⭐ +150 XP</option>
                            <option value="250" selected>🌟 +250 XP (Estándar)</option>
                            <option value="350">🏆 +350 XP (Avanzado)</option>
                            <option value="500">👑 +500 XP (Reto Pro)</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Footer de Acciones -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-top: 1.5px solid #F1F5F9; padding-top: 16px;">
                <button type="button" onclick="window.cerrarConfiguracionJuegoIA()" style="background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; padding: 11px 20px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer;">
                    ✕ Cancelar
                </button>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button type="button" id="btn-modal-juego-ia-proyectar" onclick="window.ejecutarGeneracionJuegoIA({ soloProyectar: true })" style="background: #475569; color: white; border: none; padding: 11px 18px; border-radius: 12px; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(71,85,105,0.25);">
                        <span>📺</span> Solo Proyectar en Aula
                    </button>
                    <button type="button" id="btn-modal-juego-ia-asignar" onclick="window.ejecutarGeneracionJuegoIA({ soloProyectar: false })" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; border: none; padding: 11px 22px; border-radius: 12px; font-weight: 800; font-size: 0.92rem; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(37,99,235,0.35);">
                        <span>🚀</span> Generar y Asignar a Estudiantes ➔
                    </button>
                </div>
            </div>

        </div>
    </div>
```

---

## 5. Verification Method
- **Direct HTML Inspection**: Check that `inspectHtml(loginHtmlContent)` finds `#modal-configuracion-juego-ia`, `#modal-juego-ia-keywords`, `#modal-juego-ia-archivo`, `#modal-juego-ia-grupo-select`, `#tab-juego-modo-keywords`, `#tab-juego-modo-upload`, and `#btn-modal-juego-ia-asignar`.
- **E2E Test Suite Run**: Run `node test_e2e_runner.js` to ensure 100% test pass on `tests/test_r3_aigames.js`, `tests/test_tier3_cross_features.js`, and `tests/test_tier4_scenarios.js`.
- **UI Inspection**: Verify no layout breakage in `#modal-caja-herramientas` or `#modal-visor-herramienta`.
