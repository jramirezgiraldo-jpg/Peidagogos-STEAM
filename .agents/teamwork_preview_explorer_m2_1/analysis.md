# M2 Deep-Dive Analysis: Subject Creation Document Upload UI (login.html)

## Executive Summary
This document details the architectural analysis, DOM contract inspection, and exact HTML replacement diffs for **Milestone 2: Multi-file Document Ingestion** within `login.html` (`#modal-crear-asignatura-docente`).

---

## 1. Problem Statement & Context
- **Current State (`login.html`: lines 3140–3150)**:
  - Input `#modal-asig-archivo` is single-file only (lacks `multiple` attribute).
  - Input `accept` attribute is `.pdf,.docx,.doc,.txt,.json,.csv` (missing official PPT/PPTX formats and doesn't explicitly restrict to the required multi-file document set `.pdf,.doc,.docx,.ppt,.pptx,.txt`).
  - Single text label `#modal-asig-archivo-nombre` displays only one file name.
  - No container exists for multi-file chip preview, individual deletion, or file counter badge (`N / 20 archivos`).

- **Target State (Requirements R2 & Contracts T1_R2_01, T1_R2_02)**:
  - Input `#modal-asig-archivo` has `multiple` attribute.
  - Input `accept` is strictly updated to `.pdf,.doc,.docx,.ppt,.pptx,.txt`.
  - Addition of:
    1. `#modal-asig-archivos-badge` with `#modal-asig-archivos-count-text` showing `N / 20 archivos`.
    2. `#modal-asig-archivos-preview` container for dynamic tag/chip rendering with file icon, name, formatted size (KB/MB), and individual remove buttons (`✕`).
    3. `#modal-asig-archivos-limpiar` reset button to clear the staged file list.
    4. `#modal-asig-archivos-alerta` container for boundary warnings (e.g. capping at 20 files).
    5. Non-destructive preservation of `#modal-asig-archivo-nombre` for backward compatibility.

---

## 2. DOM Contract & Element Inventory

| Element ID | Tag | Attributes / Styles | Purpose | Contract Reference |
|---|---|---|---|---|
| `#modal-asig-archivo` | `<input>` | `type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" style="display: none;"` | Native file selector for up to 20 documents | T1_R2_01, T1_R2_02 |
| `#modal-asig-archivos-badge` | `<div>` | `style="display: none; ..."` | Counter badge wrapper | R2 Acceptance Criteria |
| `#modal-asig-archivos-count-text` | `<span>` | Text: `0 / 20 archivos` | Displays dynamic count | R2 Acceptance Criteria |
| `#modal-asig-archivos-preview` | `<div>` | `style="display: none; max-height: 160px; overflow-y: auto; ..."` | Container for file chips | T1_R2_04 |
| `#modal-asig-archivos-limpiar` | `<button>` | `style="display: none; ..."` | Clears all staged files | UX enhancement |
| `#modal-asig-archivos-alerta` | `<div>` | `style="display: none; ..."` | Boundary/Format alerts | T2_R2_02 |
| `#modal-asig-archivo-nombre` | `<div>` | `style="display: none; ..."` | Legacy element preserved | Non-destructive rule #2 |

---

## 3. UI / UX Design Specifications

### 3.1 Upload Drop Zone
- Border: `2px dashed #6366F1`
- Background: `#F8FAFC`
- Border Radius: `12px`
- Description text: `"Sube hasta 20 archivos: planes de área, estándares MEN, guías base o sílabos (PDF, Word, PPT, TXT)."`

### 3.2 Counter Badge (`#modal-asig-archivos-badge`)
- Pill container with soft indigo background (`#EEF2FF`), border `#C7D2FE`, bold text `#4338CA`.
- Format: `📁 N / 20 archivos`

### 3.3 Multi-File Preview Chips (`#modal-asig-archivos-preview`)
- Layout: Flexbox (`flex-wrap: wrap`, `gap: 8px`, `justify-content: center`).
- Scrollable container: `max-height: 160px; overflow-y: auto;` to prevent viewport overflow when 20 files are loaded.
- Individual Chip:
  - Background: `white`
  - Border: `1.5px solid #E0E7FF`
  - Radius: `8px`
  - File icon (`📄` PDF, `📝` Word, `📊` PPT, `📃` TXT)
  - Filename in bold (`max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`)
  - Size badge (`#F1F5F9`, e.g., `150 KB`)
  - Red remove button (`✕`) calling `window.removerArchivoAsignaturaDocente(index)`.

---

## 4. Exact HTML Replacement Diff for Worker

### Target File: `d:\Peidagogos_Oficial\login.html`
**Lines to Replace**: 3140–3150

#### Current HTML:
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

#### Replacement HTML:
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

## 5. Non-Destructive Verification
1. **Zero Complete Overwrite**: Modifies only lines 3140-3150 using `replace_file_content`.
2. **DOM Preservation**: All existing siblings (`#modal-asig-nombre`, `#modal-asig-icono`, `#modal-asig-grados-wrapper`, `#modal-asig-desc`, `#modal-asig-texto-directo`, `#modal-crear-asignatura-docente` buttons) remain untouched.
3. **Legacy Element Fallback**: `#modal-asig-archivo-nombre` is preserved in the DOM (`display: none;`) to prevent `TypeError: document.getElementById(...) is null` if any un-migrated code references it.
4. **State Variables**: Retains `window.manejarArchivoAsignaturaDocente(event)` onchange handler.
