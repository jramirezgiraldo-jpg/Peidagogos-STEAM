# Task Assignment: Milestone 3 Implementation Worker (Replacement)

## Objective
Implement Milestone 3 (R3: Dynamic AI Tool & Game Generation across ALL Cajas Temáticas) and Dashboard Enhancements in `login.html` and `app.js`.

## Complete Requirements Breakdown
1. **Pre-Generation Configuration Modal (`#modal-configuracion-juego-ia`)**:
   - Surgically insert `#modal-configuracion-juego-ia` in `login.html` before `#modal-visor-herramienta` (line 2758).
   - Support both Mode 1 (Keywords / Concepts) and Mode 2 (Upload Document: PDF, Word, PPT, JPG, TXT).
   - Support dynamic teacher group dropdown (`#modal-config-juego-grupo` / `#modal-juego-grupo-select`) populated from teacher session profile (`docItem.grupos`, `authSes.grupos_direccion`, `authSes.grados`, default `['Todos', '7C', '6A', '8A']`).
   - Support subject select, grade select, XP reward picker (default 250 XP).
   - Support action buttons: Cancel, and Generate & Assign (`window.ejecutarGeneracionJuegoIA()`).

2. **Cajas Temáticas Interception**:
   - In `window.renderizarTarjetasCajaHerramientas` and `window.abrirVisorHerramienta`, EVERY tool click across ALL Cajas (all 42 tools across Cajas 1–6) must route to `window.abrirConfiguracionJuegoIA(tool.id)`.
   - Remove/hide the global top ingestion panel ("INGESTA DE CONTENIDO PARA ESTA CAJA:") in `#vista-categoria-detalle` using non-destructive CSS (`display: none !important;`).

3. **6 Specific User Fixes**:
   - **Ránking en Vivo**: In "Ránking en Vivo", ask teacher WHICH GROUP they want to project before opening the leaderboard (prompt or group selector).
   - **Proyectar QR Matrícula**: Hide this option entirely (`display: none !important;`).
   - **Materias y Grados**: Hide the old redundant "Configuración de Materias y Grados" button/card (`display: none !important;`), keeping only unified "Inscribir Materia".
   - **Diapositivas Semanales**: In the "Generador de Diapositivas Semanales" modal, add the option to upload reference documents (PDF/Word/PPT).
   - **Auxilios Emocionales**: In "Primeros Auxilios Emocionales", remove the "imprimir taller" button and add dynamic AI interactive online activity generation specifically tuned for post-earthquake psychological first aid.
   - **Admin Panel Invariant**: DO NOT modify the groups assigned in the admin panel.

4. **Activity Assignment Dispatch & Server Sync**:
   - `window.ejecutarGeneracionJuegoIA()` extracts keywords/tokens, constructs base data, calls `/api/generate-tool-ai` (with `window.datosDinamicosFallback` offline resilience), constructs activity object with full compatibility schema (`id`, `herramienta_id`, `titulo`, `materia`, `grado`, `grupo`, `profesor_nombre`, `profesor_id`, `fecha_asignacion`, `estado`, `xp_recompensa`, `configuracion_juego`, `datos_juego`, `tipo_actividad`, `grupo_destino`, `actividad_data`, etc.).
   - Saves to `localStorage['actividades_asignadas_db']` and `POST /api/asignar-actividad`.
   - Opens live game / activity in `#modal-visor-herramienta`.

## Reference Inputs & Explorer Findings
- `d:\Peidagogos_Oficial\.agents\ORIGINAL_REQUEST.md`
- `d:\Peidagogos_Oficial\PROJECT.md`
- `d:\Peidagogos_Oficial\.agents\rules\non_destructive_editing.md`
- `d:\Peidagogos_Oficial\.agents\teamwork_preview_explorer_m3_1\handoff.md`
- `d:\Peidagogos_Oficial\.agents\teamwork_preview_explorer_m3_2\handoff.md`
- `d:\Peidagogos_Oficial\.agents\teamwork_preview_explorer_m3_3\handoff.md`

## Verification Requirements
Run:
- `node tests/test_r3_aigames.js`
- `node test_e2e_runner.js`

## Output Requirements
Write `handoff.md` in `d:\Peidagogos_Oficial\.agents\teamwork_preview_worker_m3\handoff.md`.

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work.
