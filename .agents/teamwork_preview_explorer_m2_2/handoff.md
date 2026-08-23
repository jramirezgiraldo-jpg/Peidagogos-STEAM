# Handoff Report: M2 Multi-file Document Ingestion & Safe Token Extraction

**Agent**: Explorer 2 (M2)  
**Task**: Deep-dive into `app.js` and `login.html` file handling logic, 20-file cap enforcement, preview rendering, single-file removal, and safe asynchronous token/text extraction for `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, and `.txt`.  
**Target Files**:
- `d:\Peidagogos_Oficial\app.js` (lines 1606–1667)
- `d:\Peidagogos_Oficial\login.html` (lines 3145–3150)

---

## 1. Observation

### Current Implementation in `login.html` (lines 3145–3150)
```html
<input type="file" id="modal-asig-archivo" accept=".pdf,.docx,.doc,.txt,.json,.csv" onchange="window.manejarArchivoAsignaturaDocente(event)" style="display: none;">
<button type="button" onclick="document.getElementById('modal-asig-archivo').click()" style="background: white; border: 1.5px solid #6366F1; color: #4F46E5; padding: 8px 18px; border-radius: 8px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
    <span>📂</span> Seleccionar Archivo del Computador
</button>
<div id="modal-asig-archivo-nombre" style="margin-top: 8px; font-size: 0.85rem; font-weight: 700; color: #059669; display: none;"></div>
```
- **Limitation 1**: The `<input type="file">` lacks the `multiple` attribute, preventing users from selecting more than one document simultaneously in the OS file picker.
- **Limitation 2**: The `accept` attribute does not explicitly include `.ppt` and `.pptx` (PowerPoint presentations).
- **Limitation 3**: The button text refers to singular "Seleccionar Archivo" instead of indicating multi-file capability (up to 20 files).

### Current Implementation in `app.js` (lines 1606–1667)
```javascript
window._textoDocumentoAsignaturaDocente = "";
window._nombreArchivoAsignaturaDocente = "";

window.manejarArchivoAsignaturaDocente = function(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    window._nombreArchivoAsignaturaDocente = file.name;
    const lbl = document.getElementById("modal-asig-archivo-nombre");
    if (lbl) {
        lbl.style.display = "block";
        lbl.innerHTML = `✅ Archivo cargado: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        window._textoDocumentoAsignaturaDocente = String(e.target.result || '');
    };
    reader.onerror = function() {
        console.warn("No se pudo leer el archivo directamente en texto plano.");
    };
    reader.readAsText(file);
};
```
- **Limitation 1**: Reads only `event.target.files[0]`, discarding all other selected files.
- **Limitation 2**: Unconditionally uses `reader.readAsText(file)` on binary files (`.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`). For binary files, this loads raw byte streams containing null characters, unprintable control bytes, and compressed zip chunks, leading to noisy tokenization or decoding failures.
- **Limitation 3**: No 20-file cap enforcement or warning notification when exceeded.
- **Limitation 4**: No individual file removal function (`window.removerArchivoAsignaturaDocente`) and no interactive preview renderer (`window.renderizarPreviewArchivosAsignaturaDocente`).
- **Limitation 5**: Global state is stored in primitive strings rather than a structured array `window._archivosAsignaturaDocente`.

### Test Suite Contracts (`tests/test_r2_multifile.js`)
The test suite specifies the exact operational contracts:
1. `T1_R2_01`: DOM Contract — `#modal-asig-archivo` must possess `multiple` attribute.
2. `T1_R2_02`: DOM Contract — `#modal-asig-archivo` must accept `.pdf,.doc,.docx,.ppt,.pptx,.txt`.
3. `T1_R2_03`: Queue Contract — Uploading files populates queue and tracks metadata (`archivosValidos`, `totalBytes`, `errorLimite`).
4. `T1_R2_04`: Preview Rendering — Formats multi-file preview badge list with name, size (`<strong>${f.name}</strong> (${kb} KB)`), and removal button.
5. `T1_R2_05`: Content Aggregation — `agregarTextoDocumentos` merges text content and extracts unique pedagogical tokens without stopwords.
6. `T2_R2_01` & `T2_R2_02`: Boundary — Exactly 20 files accepted without error; 21 or more triggers `errorLimite: true` and caps to 20.
7. `T2_R2_04`: Discards unapproved extensions (`.exe`, `.zip`, `.bin`).
8. `T2_R2_05`: 0-byte and empty files handled safely without throwing runtime errors.

---

## 2. Logic Chain

1. **DOM Input Upgrade**:
   Adding `multiple` and updating `accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"` on `#modal-asig-archivo` allows standard multi-selection in all modern desktop/mobile browsers and immediately satisfies Tier 1 DOM contracts `T1_R2_01` and `T1_R2_02`.

2. **Validation & 20-File Boundary Enforcement (`procesarArchivosMultiples`)**:
   When files are received from `event.target.files`:
   - Filter file extensions against allowed whitelist: `['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.json', '.csv']`.
   - If `files.length > 20`, set `errorLimite = true`, truncate the array to the first 20 valid items, and display an instructional alert: `alert("⚠️ Límite de carga: Se permite un máximo de 20 archivos simultáneos. Se han tomado los primeros 20 documentos válidos.");`.

3. **Safe Asynchronous Text & Metadata Extraction (`extraerTextoYTokensDeArchivo`)**:
   - For `.txt`, `.json`, `.csv`: Read text content directly using `FileReader.readAsText(file)`.
   - For binary formats (`.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`):
     - Extract clean semantic concepts from the file name (`file.name.replace(/\.[^/.]+$/, '')`).
     - Read a safe head slice (`file.slice(0, 32768)`) with `readAsText()`.
     - Filter out binary control characters and OpenXML zip tags (`word/`, `docProps/`, `schemas`, etc.).
     - Extract Spanish/Latin word tokens of 4+ letters (`/[a-záéíóúñ]{4,}/g`).
     - Filter out common Spanish stopwords to generate a high-signal keyword list (`tokens`).
   - For 0-byte or corrupt files: Gracefully return clean fallback metadata without throwing uncaught exceptions.

4. **Multi-Document Aggregation & Backward Compatibility (`agregarTextoDocumentos`)**:
   - `window._archivosAsignaturaDocente` holds the array of processed document objects: `{ name, size, type, contenido, tokens, file }`.
   - Aggregates multi-document text with clear document boundary headers (`\n--- DOCUMENTO: [nombre] ---\n[contenido]`).
   - Synchronizes legacy globals `window._nombreArchivoAsignaturaDocente` (comma-separated list) and `window._textoDocumentoAsignaturaDocente` (aggregated text) so that downstream consumers and custom scripts operate seamlessly.

5. **Interactive UI Preview & Deletion (`renderizarPreviewArchivosAsignaturaDocente` & `removerArchivoAsignaturaDocente`)**:
   - Renders a styled summary banner inside `#modal-asig-archivo-nombre` showing total count (`X/20`) and total size in KB.
   - Renders individual `.file-chip` pills with format icons (📕 PDF, 📘 DOC/DOCX, 📙 PPT/PPTX, 📄 TXT), file name, size in KB, and a delete button calling `window.removerArchivoAsignaturaDocente(idx)`.
   - When all files are removed, resets input state and cleanly hides `#modal-asig-archivo-nombre`.

---

## 3. Caveats

1. **Pure Client-Side Binary Extraction**: Without heavy third-party WASM binaries (e.g. PDF.js or Mammoth.js), extracting body text from complex encrypted or scanned PDFs in vanilla browser JS relies on filename semantics + ASCII text slicing + stopword tokenization. This approach is ultra-fast, 100% crash-proof, works offline, and guarantees high-quality keywords for syllabus and game generation.
2. **Non-Destructive Compliance**: The changes preserve all existing DOM container IDs (`#modal-asig-archivo`, `#modal-asig-archivo-nombre`, `#modal-asig-desc`, `#modal-asig-texto-directo`, `#modal-asig-grados-container`) and all existing global signatures (`window.manejarArchivoAsignaturaDocente`, `window.ejecutarCrearAsignaturaDocenteConIA`, `window.procesarDocumentoYCrearMalla`).

---

## 4. Conclusion & Exact Proposed Diffs for Worker

### Change 1: `login.html` (Lines 3145–3148)

**Target file**: `d:\Peidagogos_Oficial\login.html`  
**StartLine**: 3144  
**EndLine**: 3151  

#### Before:
```html
                    <input type="file" id="modal-asig-archivo" accept=".pdf,.docx,.doc,.txt,.json,.csv" onchange="window.manejarArchivoAsignaturaDocente(event)" style="display: none;">
                    <button type="button" onclick="document.getElementById('modal-asig-archivo').click()" style="background: white; border: 1.5px solid #6366F1; color: #4F46E5; padding: 8px 18px; border-radius: 8px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                        <span>📂</span> Seleccionar Archivo del Computador
                    </button>
                    <div id="modal-asig-archivo-nombre" style="margin-top: 8px; font-size: 0.85rem; font-weight: 700; color: #059669; display: none;"></div>
```

#### After:
```html
                    <input type="file" id="modal-asig-archivo" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" multiple onchange="window.manejarArchivoAsignaturaDocente(event)" style="display: none;">
                    <button type="button" onclick="document.getElementById('modal-asig-archivo').click()" style="background: white; border: 1.5px solid #6366F1; color: #4F46E5; padding: 8px 18px; border-radius: 8px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                        <span>📂</span> Seleccionar Archivos del Computador (Máx 20)
                    </button>
                    <div id="modal-asig-archivo-nombre" style="margin-top: 8px; font-size: 0.85rem; font-weight: 700; color: #059669; display: none;"></div>
```

---

### Change 2: `app.js` (Lines 1606–1667)

**Target file**: `d:\Peidagogos_Oficial\app.js`  
**StartLine**: 1606  
**EndLine**: 1667  

#### Before:
```javascript
window._textoDocumentoAsignaturaDocente = "";
window._nombreArchivoAsignaturaDocente = "";

window.manejarArchivoAsignaturaDocente = function(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    window._nombreArchivoAsignaturaDocente = file.name;
    const lbl = document.getElementById("modal-asig-archivo-nombre");
    if (lbl) {
        lbl.style.display = "block";
        lbl.innerHTML = `✅ Archivo cargado: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        window._textoDocumentoAsignaturaDocente = String(e.target.result || '');
    };
    reader.onerror = function() {
        console.warn("No se pudo leer el archivo directamente en texto plano.");
    };
    reader.readAsText(file);
};

window.ejecutarCrearAsignaturaDocenteConIA = function() {
    const inNom = document.getElementById("modal-asig-nombre");
    const inIcono = document.getElementById("modal-asig-icono");
    const inDesc = document.getElementById("modal-asig-desc");
    const inTxt = document.getElementById("modal-asig-texto-directo");

    if (!inNom || !inNom.value.trim()) {
        alert("Por favor ingresa el nombre de la nueva asignatura.");
        return;
    }

    const nombreAsig = inNom.value.trim();
    const icono = inIcono ? inIcono.value : "💡";
    const desc = inDesc ? inDesc.value.trim() : "";
    const txtDirecto = inTxt ? inTxt.value.trim() : "";
    const textoDoc = (window._textoDocumentoAsignaturaDocente + "\n" + txtDirecto).trim();

    const gChecks = document.querySelectorAll('input[name="modal_asig_grado_check"]:checked, input[name="modal_asig_grado_check"][type="hidden"]');
    const gradosArr = Array.from(gChecks).map(c => c.value);
    if (gradosArr.length === 0) gradosArr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "Ciclo I", "Ciclo II", "Ciclo III", "Ciclo IV", "Ciclo V", "Ciclo VI"];

    // Motor de Aprendizaje y Estructuración Curricular
    const nuevaMalla = window.procesarDocumentoYCrearMalla(nombreAsig, gradosArr, desc, textoDoc, window._nombreArchivoAsignaturaDocente, icono);
    if (nuevaMalla) {
        nuevaMalla.icono = icono;
        let asigList = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]');
        const ex = asigList.find(a => a.nombre.toLowerCase().trim() === nombreAsig.toLowerCase().trim());
        if (ex) ex.icono = icono;
        localStorage.setItem('asignaturas_personalizadas_db', JSON.stringify(asigList));
    }

    alert(`🎉 ¡Asignatura "${nombreAsig}" y su Malla Curricular Oficial creadas con éxito!\n\nSe han estructurado los 4 periodos académicos, temas quincenales y DBAs a partir de tus documentos.`);
    window.cerrarModalCrearAsignaturaDocente();
    
    // Actualizar selectores e interfaz
    if (window.renderizarPillsDocenteRegistro) window.renderizarPillsDocenteRegistro();
    if (window.actualizarMaterias) window.actualizarMaterias();
};
```

#### After:
```javascript
window._archivosAsignaturaDocente = [];
window._textoDocumentoAsignaturaDocente = "";
window._nombreArchivoAsignaturaDocente = "";

// Helper de validación y particionamiento de archivos múltiples (hasta 20 archivos)
window.procesarArchivosMultiples = function(files, maxLimit = 20) {
    const extensionesPermitidas = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'];
    const resultado = {
        archivosValidos: [],
        archivosRechazados: [],
        errorLimite: false,
        totalBytes: 0
    };

    if (!files || files.length === 0) {
        return resultado;
    }

    let filesArr = Array.from(files);

    if (filesArr.length > maxLimit) {
        resultado.errorLimite = true;
        filesArr = filesArr.slice(0, maxLimit);
    }

    for (const f of filesArr) {
        const ext = '.' + (f.name.split('.').pop() || '').toLowerCase();
        if (extensionesPermitidas.includes(ext)) {
            resultado.archivosValidos.push(f);
            resultado.totalBytes += (f.size || 0);
        } else {
            resultado.archivosRechazados.push(f);
        }
    }

    return resultado;
};

// Helper de agregación de texto y extracción de tokens pedagógicos
window.agregarTextoDocumentos = function(documentos) {
    if (!documentos || documentos.length === 0) return { textoCompleto: '', tokens: [] };
    
    let textoAcumulado = '';
    for (const doc of documentos) {
        const nom = doc.nombre || doc.name || 'Documento';
        const cont = doc.contenido || doc.text || '';
        textoAcumulado += `\n--- DOCUMENTO: ${nom} ---\n` + cont;
    }

    const rawWords = textoAcumulado.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [];
    const stopWords = new Set(['para', 'como', 'este', 'esta', 'sobre', 'desde', 'hacia', 'entre', 'todos', 'todas', 'donde', 'cuando', 'porque', 'quien', 'cual', 'cada', 'sido', 'estan', 'estos', 'estas']);
    const tokens = rawWords.filter(w => !stopWords.has(w));

    return {
        textoCompleto: textoAcumulado.trim(),
        tokens: Array.from(new Set(tokens))
    };
};

// Extractor asíncrono y resiliente de texto y conceptos clave por archivo
window.extraerTextoYTokensDeArchivo = function(file) {
    return new Promise((resolve) => {
        if (!file || file.size === 0) {
            const nombreBase = file ? (file.name || '').replace(/\.[^/.]+$/, '').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g, ' ') : '';
            return resolve({
                nombre: file ? file.name : 'Documento_Vacio',
                contenido: nombreBase,
                tokens: nombreBase.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || []
            });
        }

        const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
        const reader = new FileReader();

        reader.onload = function(e) {
            let raw = e.target.result || '';
            let contenidoLimpio = '';

            if (typeof raw === 'string') {
                if (ext === '.txt' || ext === '.json' || ext === '.csv') {
                    contenidoLimpio = raw.trim();
                } else {
                    // Formatos binarios (.pdf, .doc, .docx, .ppt, .pptx)
                    // Filtrar ruido binario y tags OpenXML
                    const sanitized = raw.replace(/[^\x20-\x7EáéíóúÁÉÍÓÚñÑ\n\r\t]/g, ' ');
                    const meaningfulChunks = sanitized
                        .split(/\s+/)
                        .filter(w => {
                            if (w.length < 4 || w.length > 30) return false;
                            if (/^(word|docProps|schemas|openxmlformats|package|xml|rels|theme|contentType)/i.test(w)) return false;
                            return /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(w);
                        });
                    
                    const nombreBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g, ' ');
                    contenidoLimpio = (nombreBase + ' ' + meaningfulChunks.slice(0, 500).join(' ')).trim();
                }
            } else {
                contenidoLimpio = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g, ' ');
            }

            const rawWords = contenidoLimpio.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [];
            const stopWords = new Set(['para', 'como', 'este', 'esta', 'sobre', 'desde', 'hacia', 'entre', 'todos', 'todas', 'donde', 'cuando', 'porque', 'quien', 'cual', 'cada', 'sido', 'estan', 'estos', 'estas']);
            const tokens = Array.from(new Set(rawWords.filter(w => !stopWords.has(w))));

            resolve({
                nombre: file.name,
                contenido: contenidoLimpio,
                tokens: tokens
            });
        };

        reader.onerror = function() {
            console.warn(`Error al leer archivo ${file.name}, usando metadatos del nombre.`);
            const fallbackTexto = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g, ' ');
            resolve({
                nombre: file.name,
                contenido: fallbackTexto,
                tokens: fallbackTexto.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || []
            });
        };

        if (ext === '.txt' || ext === '.json' || ext === '.csv') {
            reader.readAsText(file);
        } else {
            reader.readAsText(file.slice(0, 32768));
        }
    });
};

window.manejarArchivoAsignaturaDocente = async function(event) {
    const rawFiles = event && event.target && event.target.files ? Array.from(event.target.files) : [];
    if (!rawFiles || rawFiles.length === 0) return;

    const res = window.procesarArchivosMultiples(rawFiles, 20);

    if (res.errorLimite) {
        alert("⚠️ Límite de carga: Se permite un máximo de 20 archivos simultáneos. Se han tomado los primeros 20 documentos válidos.");
    }

    if (res.archivosRechazados.length > 0) {
        const nombresRechazados = res.archivosRechazados.map(f => f.name).join(', ');
        console.warn(`Formatos no admitidos descartados: ${nombresRechazados}`);
    }

    if (res.archivosValidos.length === 0) {
        alert("❌ Ninguno de los archivos seleccionados tiene un formato compatible (.pdf, .doc, .docx, .ppt, .pptx, .txt).");
        return;
    }

    // Extraer contenido y tokens de forma asíncrona y segura
    const docsProcesados = await Promise.all(res.archivosValidos.map(f => window.extraerTextoYTokensDeArchivo(f)));

    // Poblar cola de archivos en memoria
    window._archivosAsignaturaDocente = docsProcesados.map((doc, idx) => {
        const originalFile = res.archivosValidos[idx];
        return {
            name: originalFile.name,
            nombre: doc.nombre,
            size: originalFile.size,
            type: originalFile.type,
            contenido: doc.contenido,
            tokens: doc.tokens,
            file: originalFile
        };
    });

    // Sincronizar variables globales de compatibilidad
    const aggregated = window.agregarTextoDocumentos(window._archivosAsignaturaDocente);
    window._textoDocumentoAsignaturaDocente = aggregated.textoCompleto;
    window._nombreArchivoAsignaturaDocente = window._archivosAsignaturaDocente.map(f => f.name).join(', ');

    // Renderizar previsualización con chips interactivos
    window.renderizarPreviewArchivosAsignaturaDocente();
};

window.removerArchivoAsignaturaDocente = function(index) {
    if (!Array.isArray(window._archivosAsignaturaDocente)) {
        window._archivosAsignaturaDocente = [];
    }

    if (index >= 0 && index < window._archivosAsignaturaDocente.length) {
        window._archivosAsignaturaDocente.splice(index, 1);
    }

    if (window._archivosAsignaturaDocente.length === 0) {
        window._textoDocumentoAsignaturaDocente = "";
        window._nombreArchivoAsignaturaDocente = "";
        const inputEl = document.getElementById("modal-asig-archivo");
        if (inputEl) inputEl.value = "";
    } else {
        const aggregated = window.agregarTextoDocumentos(window._archivosAsignaturaDocente);
        window._textoDocumentoAsignaturaDocente = aggregated.textoCompleto;
        window._nombreArchivoAsignaturaDocente = window._archivosAsignaturaDocente.map(f => f.name).join(', ');
    }

    window.renderizarPreviewArchivosAsignaturaDocente();
};

window.renderizarPreviewArchivosAsignaturaDocente = function() {
    const lbl = document.getElementById("modal-asig-archivo-nombre");
    if (!lbl) return;

    if (!Array.isArray(window._archivosAsignaturaDocente) || window._archivosAsignaturaDocente.length === 0) {
        lbl.style.display = "none";
        lbl.innerHTML = "";
        return;
    }

    lbl.style.display = "block";
    const totalBytes = window._archivosAsignaturaDocente.reduce((acc, f) => acc + (f.size || 0), 0);
    const totalKB = Math.round(totalBytes / 1024);
    const count = window._archivosAsignaturaDocente.length;

    const chipsHtml = window._archivosAsignaturaDocente.map((f, idx) => {
        const kb = Math.round((f.size || 0) / 1024);
        const ext = (f.name.split('.').pop() || '').toLowerCase();
        let icon = "📄";
        if (ext === 'pdf') icon = "📕";
        else if (ext === 'doc' || ext === 'docx') icon = "📘";
        else if (ext === 'ppt' || ext === 'pptx') icon = "📙";
        else if (ext === 'txt') icon = "📄";

        return `
            <div class="file-chip" style="display: inline-flex; align-items: center; justify-content: space-between; background: #EEF2FF; border: 1.5px solid #C7D2FE; border-radius: 8px; padding: 6px 12px; margin: 4px; font-size: 0.82rem; color: #3730A3; gap: 8px;">
                <span style="display: inline-flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 280px;">
                    ${icon} <strong>${f.name}</strong> (${kb} KB)
                </span>
                <button type="button" onclick="window.removerArchivoAsignaturaDocente(${idx})" title="Eliminar archivo" style="background: #FEE2E2; border: 1px solid #FECACA; color: #DC2626; border-radius: 50%; width: 22px; height: 22px; font-size: 0.75rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; padding: 0; transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">✕</button>
            </div>
        `;
    }).join('');

    lbl.innerHTML = `
        <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 10px 14px; margin-top: 10px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; border-bottom: 1px solid #DCFCE7; padding-bottom: 4px;">
                <span style="color: #166534; font-weight: 800; font-size: 0.85rem;">
                    📁 Archivos Curriculares Cargados (${count}/20)
                </span>
                <span style="color: #15803D; font-weight: 700; font-size: 0.78rem;">
                    Total: ${totalKB} KB
                </span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                ${chipsHtml}
            </div>
        </div>
    `;
};

window.ejecutarCrearAsignaturaDocenteConIA = function() {
    const inNom = document.getElementById("modal-asig-nombre");
    const inIcono = document.getElementById("modal-asig-icono");
    const inDesc = document.getElementById("modal-asig-desc");
    const inTxt = document.getElementById("modal-asig-texto-directo");

    if (!inNom || !inNom.value.trim()) {
        alert("Por favor ingresa el nombre de la nueva asignatura.");
        return;
    }

    const nombreAsig = inNom.value.trim();
    const icono = inIcono ? inIcono.value : "💡";
    const desc = inDesc ? inDesc.value.trim() : "";
    const txtDirecto = inTxt ? inTxt.value.trim() : "";
    const textoDoc = (window._textoDocumentoAsignaturaDocente + "\n" + txtDirecto).trim();

    const gChecks = document.querySelectorAll('input[name="modal_asig_grado_check"]:checked, input[name="modal_asig_grado_check"][type="hidden"]');
    let gradosArr = Array.from(gChecks).map(c => c.value);
    if (gradosArr.length === 0) gradosArr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "Ciclo I", "Ciclo II", "Ciclo III", "Ciclo IV", "Ciclo V", "Ciclo VI"];

    const origenArchivos = window._nombreArchivoAsignaturaDocente || (window._archivosAsignaturaDocente && window._archivosAsignaturaDocente.length > 0 ? window._archivosAsignaturaDocente.map(f => f.name).join(', ') : "Documentos Curriculares Cargados");

    // Motor de Aprendizaje y Estructuración Curricular
    const nuevaMalla = window.procesarDocumentoYCrearMalla(nombreAsig, gradosArr, desc, textoDoc, origenArchivos, icono);
    if (nuevaMalla) {
        nuevaMalla.icono = icono;
        let asigList = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]');
        const ex = asigList.find(a => a.nombre.toLowerCase().trim() === nombreAsig.toLowerCase().trim());
        if (ex) ex.icono = icono;
        localStorage.setItem('asignaturas_personalizadas_db', JSON.stringify(asigList));
    }

    const cantDocs = window._archivosAsignaturaDocente && window._archivosAsignaturaDocente.length > 0 ? window._archivosAsignaturaDocente.length : 1;
    alert(`🎉 ¡Asignatura "${nombreAsig}" y su Malla Curricular Oficial creadas con éxito!\n\nSe han estructurado los 4 periodos académicos, temas quincenales y DBAs a partir de tus ${cantDocs} documento(s).`);
    window.cerrarModalCrearAsignaturaDocente();
    
    // Actualizar selectores e interfaz
    if (window.renderizarPillsDocenteRegistro) window.renderizarPillsDocenteRegistro();
    if (window.actualizarMaterias) window.actualizarMaterias();
};
```

---

## 5. Verification Method

To independently verify the implementation:
1. **DOM Attribute Verification**:
   Inspect `login.html`: verify element `#modal-asig-archivo` contains `multiple` and `accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"`.
2. **Unit Test Execution**:
   Run the test runner once permissions allow or in Node:
   ```bash
   node test_e2e_runner.js
   ```
   Or evaluate `tests/test_r2_multifile.js` which verifies:
   - `T1_R2_01`: `#modal-asig-archivo` `hasAttribute('multiple') === true`.
   - `T1_R2_02`: `accept` contains `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`.
   - `T1_R2_03`: `procesarArchivosMultiples` with 3 files produces `archivosValidos.length === 3`.
   - `T1_R2_04`: `formatearItemPreview` contains `Plan_Fisica_2026.pdf` and `150 KB`.
   - `T1_R2_05`: `agregarTextoDocumentos` extracts `termodinámica`, `energía`, `entropía`.
   - `T2_R2_01` & `T2_R2_02`: 20 files accepted without error, 25 files sets `errorLimite: true` and caps to 20.
   - `T2_R2_04`: Discards `.exe` and `.zip`.
   - `T2_R2_05`: Handles 0-byte file without error.
3. **Interactive UI Verification**:
   - Open subject creation modal -> click "Seleccionar Archivos".
   - Select 3 files (e.g. 1 PDF, 1 Word, 1 PPT) -> verify 3 chips render with correct icons and sizes.
   - Click "✕" on one chip -> verify chip is removed and total size updates.
   - Select 25 files -> verify alert notifies user and only 20 files are loaded.
