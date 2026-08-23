# Task Assignment: Milestone 2 Worker (M2: Multi-file Document Ingestion)

## Objective
Implement multi-file document ingestion (up to 20 files: PDF, Word, PPT, TXT) in `login.html` and `app.js` adhering strictly to non-destructive editing rules.

## Reference Inputs & Explorer Findings
- Original Request: `d:\Peidagogos_Oficial\.agents\ORIGINAL_REQUEST.md`
- Project Plan: `d:\Peidagogos_Oficial\PROJECT.md`
- Non-Destructive Editing Rules: `d:\Peidagogos_Oficial\.agents\rules\non_destructive_editing.md`
- Explorer 1 (HTML UI Specification): `d:\Peidagogos_Oficial\.agents\teamwork_preview_explorer_m2_1\handoff.md`
- Explorer 2 (JS File Reader & State Specification): `d:\Peidagogos_Oficial\.agents\teamwork_preview_explorer_m2_2\handoff.md`
- Explorer 3 (Curriculum Aggregation & Test Contracts): `d:\Peidagogos_Oficial\.agents\teamwork_preview_explorer_m2_3\handoff.md`
- Test Suite: `d:\Peidagogos_Oficial\tests\test_r2_multifile.js` & `d:\Peidagogos_Oficial\test_e2e_runner.js`

## Scope of Modifications
1. `d:\Peidagogos_Oficial\login.html`:
   - Replace `<input type="file" id="modal-asig-archivo">` to add `multiple` and `accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"`.
   - Add multi-file dropzone container elements: `#modal-asig-archivos-badge`, `#modal-asig-archivos-count-text`, `#modal-asig-archivos-limpiar`, `#modal-asig-archivos-alerta`, `#modal-asig-archivos-preview`.
   - Preserve `#modal-asig-archivo-nombre` in DOM.
2. `d:\Peidagogos_Oficial\app.js`:
   - Implement `window._archivosAsignaturaDocente = []`, `window._textoDocumentoAsignaturaDocente`, `window._nombreArchivoAsignaturaDocente`, `window._nombresArchivosAsignaturaDocente`.
   - Implement `window.procesarArchivosMultiples(files, maxLimit = 20)` enforcing 20-file cap and extension filtering.
   - Implement `window.agregarTextoDocumentos(documentos)` aggregating multi-file text with `--- DOCUMENTO: [nombre] ---` and extracting Spanish keywords without stopwords.
   - Implement `window.extraerTextoYTokensDeArchivo(file)` async reader with safe slicing for binary files (.pdf, .docx, .pptx) and plain text reader for text files.
   - Implement `window.manejarArchivoAsignaturaDocente(event)`.
   - Implement `window.removerArchivoAsignaturaDocente(index)` and `window.renderizarPreviewArchivosAsignaturaDocente()`.
   - Implement `window.sincronizarEstadoArchivosAsignaturaDocente()`.
   - Update `window.ejecutarCrearAsignaturaDocenteConIA()` and `window.procesarDocumentoYCrearMalla()` to aggregate up to 20 documents.

## Verification Requirements
Run:
- `node tests/test_r2_multifile.js` (Must pass all 10 tests across Tier 1 & Tier 2)
- `node test_e2e_runner.js`

## Output Requirements
Write `handoff.md` in your working directory `.agents/teamwork_preview_worker_m2/` with:
- Observation (files modified, lines changed)
- Logic Chain (implementation details)
- Verification Results (terminal output from node test_r2_multifile.js and test_e2e_runner.js)
- Conclusion (declaration of readiness for Gate)

## Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
