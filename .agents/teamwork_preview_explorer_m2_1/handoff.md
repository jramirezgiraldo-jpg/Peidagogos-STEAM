# Handoff Report: M2 Multi-File Document Ingestion UI (login.html)

## 1. Observation
- **File**: `d:\Peidagogos_Oficial\login.html` (lines 3140–3150).
- **Verbatim Code**:
  ```html
  <!-- Zona de Carga de Documentos de Referencia -->
  <div style="background: #F8FAFC; border: 2px dashed #6366F1; border-radius: 12px; padding: 20px; text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 6px;">📄</div>
      <div style="font-weight: 800; color: #3730A3; font-size: 1rem; margin-bottom: 4px;">Adjuntar Documentos de Referencia Curricular</div>
      <p style="margin: 0 0 12px 0; color: #64748B; font-size: 0.85rem;">Sube tu plan de área, estándares MEN, guías base o sílabo (PDF, Word, TXT, JSON, CSV).</p>
      <input type="file" id="modal-asig-archivo" accept=".pdf,.docx,.doc,.txt,.json,.csv" onchange="window.manejarArchivoAsignaturaDocente(event)" style="display: none;">
      <button type="button" onclick="document.getElementById('modal-asig-archivo').click()" style="background: white; border: 1.5px solid #6366F1; color: #4F46E5; padding: 8px 18px; border-radius: 8px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
          <span>📂</span> Seleccionar Archivo del Computador
      </button>
      <div id="modal-asig-archivo-nombre" style="margin-top: 8px; font-size: 0.85rem; font-weight: 700; color: #059669; display: none;"></div>
  </div>
  ```
- **Test Contracts in `tests\test_r2_multifile.js`**:
  - `T1_R2_01`: `inspector.getElementById('modal-asig-archivo').hasAttribute('multiple')` must be true.
  - `T1_R2_02`: `inspector.getElementById('modal-asig-archivo').getAttribute('accept')` must contain `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`.
- **Non-Destructive Rules**: `d:\Peidagogos_Oficial\.agents\rules\non_destructive_editing.md` mandates zero complete file overwrites, surgical edits via `replace_file_content`, and preserving DOM nodes (`#modal-asig-archivo-nombre`) so legacy JS references don't produce null pointer errors.

---

## 2. Logic Chain
1. **Observation 1 & Test Contracts**: `tests\test_r2_multifile.js` verifies that `#modal-asig-archivo` contains `multiple` and `accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"`.
2. **Observation 1**: The current `<input>` element on line 3145 lacks `multiple` and does not include `.ppt` or `.pptx` in its `accept` attribute.
3. **Inference 1**: Modifying the `<input>` element to `<input type="file" id="modal-asig-archivo" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onchange="window.manejarArchivoAsignaturaDocente(event)" style="display: none;">` directly satisfies contracts `T1_R2_01` and `T1_R2_02`.
4. **Observation 1 & Requirement R2**: Requirement R2 demands support for uploading up to 20 files with preview tags, file sizes, individual remove buttons, and a file counter badge (`N / 20 archivos`).
5. **Inference 2**: The drop zone container must include:
   - `#modal-asig-archivos-badge` containing `#modal-asig-archivos-count-text` for the counter.
   - `#modal-asig-archivos-preview` (`max-height: 160px; overflow-y: auto; flex-wrap: wrap; gap: 8px; justify-content: center;`) to house the dynamically rendered file chips with individual remove buttons.
   - `#modal-asig-archivos-limpiar` button to clear all selected files.
   - `#modal-asig-archivos-alerta` for boundary warning messages (e.g. 21+ files capped to 20).
   - `#modal-asig-archivo-nombre` kept in DOM (`style="display: none;"`) to adhere strictly to non-destructive editing rules.

---

## 3. Caveats
- This investigation covers only the markup and styling in `login.html` (lines 3140–3150).
- JavaScript file ingestion, queue storage in `window._archivosAsignaturaDocente`, and multi-file text extraction are analyzed in detail by Explorer 2 for implementation in `app.js`.

---

## 4. Conclusion & Proposed HTML Replacement

### Target File: `d:\Peidagogos_Oficial\login.html`
**Range**: lines 3140 to 3150

#### TargetContent to Replace:
```html
                <!-- Zona de Carga de Documentos de Referencia -->
                <div style="background: #F8FAFC; border: 2px dashed #6366F1; border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 6px;">📄</div>
                    <div style="font-weight: 800; color: #3730A3; font-size: 1rem; margin-bottom: 4px;">Adjuntar Documentos de Referencia Curricular</div>
                    <p style="margin: 0 0 12px 0; color: #64748B; font-size: 0.85rem;">Sube tu plan de área, estándares MEN, guías base o sílabo (PDF, Word, TXT, JSON, CSV).</p>
                    <input type="file" id="modal-asig-archivo" accept=".pdf,.docx,.doc,.txt,.json,.csv" onchange="window.manejarArchivoAsignaturaDocente(event)" style="display: none;">
                    <button type="button" onclick="document.getElementById('modal-asig-archivo').click()" style="background: white; border: 1.5px solid #6366F1; color: #4F46E5; padding: 8px 18px; border-radius: 8px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                        <span>📂</span> Seleccionar Archivo del Computador
                    </button>
                    <div id="modal-asig-archivo-nombre" style="margin-top: 8px; font-size: 0.85rem; font-weight: 700; color: #059669; display: none;"></div>
                </div>
```

#### ReplacementContent:
```html
                <!-- Zona de Carga de Documentos de Referencia (Multi-archivo hasta 20 documentos) -->
                <div style="background: #F8FAFC; border: 2px dashed #6366F1; border-radius: 12px; padding: 20px; text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 6px;">📚</div>
                    <div style="font-weight: 800; color: #3730A3; font-size: 1rem; margin-bottom: 4px;">Adjuntar Documentos de Referencia Curricular</div>
                    <p style="margin: 0 0 12px 0; color: #64748B; font-size: 0.85rem;">Sube hasta 20 archivos: planes de área, estándares MEN, guías base o sílabos (PDF, Word, PPT, TXT).</p>
                    <input type="file" id="modal-asig-archivo" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onchange="window.manejarArchivoAsignaturaDocente(event)" style="display: none;">
                    <div style="display: flex; justify-content: center; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <button type="button" onclick="document.getElementById('modal-asig-archivo').click()" style="background: white; border: 1.5px solid #6366F1; color: #4F46E5; padding: 8px 18px; border-radius: 8px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                            <span>📂</span> Seleccionar Documentos (Hasta 20)
                        </button>
                        <button type="button" id="modal-asig-archivos-limpiar" onclick="if(window.limpiarArchivosAsignaturaDocente) window.limpiarArchivosAsignaturaDocente()" style="display: none; background: #FEF2F2; border: 1.5px solid #FECACA; color: #DC2626; padding: 8px 14px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer; align-items: center; gap: 6px;">
                            <span>🗑️</span> Limpiar Selección
                        </button>
                    </div>
                    
                    <!-- Contador y Badge de Archivos -->
                    <div id="modal-asig-archivos-badge" style="display: none; margin-top: 12px; font-size: 0.82rem; font-weight: 800; color: #4338CA; background: #EEF2FF; border: 1px solid #C7D2FE; padding: 4px 14px; border-radius: 20px; width: fit-content; margin-left: auto; margin-right: auto; align-items: center; gap: 6px;">
                        <span>📁</span> <span id="modal-asig-archivos-count-text">0 / 20 archivos</span>
                    </div>

                    <!-- Alerta de Límite o Formatos -->
                    <div id="modal-asig-archivos-alerta" style="display: none; margin-top: 8px; font-size: 0.82rem; color: #DC2626; background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 8px 12px; font-weight: 600;"></div>

                    <!-- Contenedor Preview Multi-Archivo (Chips / Tags con botón de eliminación) -->
                    <div id="modal-asig-archivos-preview" style="display: none; margin-top: 12px; max-height: 160px; overflow-y: auto; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 4px;">
                        <!-- Inyectado dinámicamente por app.js -->
                    </div>

                    <!-- Elemento Legacy preservado para compatibilidad y fallback -->
                    <div id="modal-asig-archivo-nombre" style="margin-top: 8px; font-size: 0.85rem; font-weight: 700; color: #059669; display: none;"></div>
                </div>
```

---

## 5. Verification Method
1. **DOM Inspection Verification**:
   - Inspect `d:\Peidagogos_Oficial\login.html` lines 3140-3160 to confirm:
     - `#modal-asig-archivo` has `multiple` attribute.
     - `accept` is `.pdf,.doc,.docx,.ppt,.pptx,.txt`.
     - `#modal-asig-archivos-badge`, `#modal-asig-archivos-count-text`, `#modal-asig-archivos-preview`, `#modal-asig-archivos-limpiar`, `#modal-asig-archivos-alerta`, and `#modal-asig-archivo-nombre` are all present.
2. **Automated Test Suite**:
   - Run `node d:\Peidagogos_Oficial\tests\test_r2_multifile.js` or `node d:\Peidagogos_Oficial\test_e2e_runner.js`.
   - Assert `T1_R2_01` (DOM Contract: multiple attribute) passes with status `PASSED`.
   - Assert `T1_R2_02` (DOM Contract: accept attribute formats) passes with status `PASSED`.
