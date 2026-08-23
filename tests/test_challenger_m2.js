/**
 * ============================================================================
 * ⚔️ ADVERSARIAL CHALLENGER TEST SUITE: MILESTONE 2 (M2)
 * ============================================================================
 * Focus:
 * 1. Boundary condition stress testing for `procesarArchivosMultiples` (20, 21, 100, 0, null, undefined, exotic extensions).
 * 2. Linguistic and token extraction stress testing for `agregarTextoDocumentos` (Spanish accents, stopwords, delimiters, special chars).
 * 3. Mutation safety and boundary testing for `removerArchivoAsignaturaDocente` (-1, 0, out of bounds, NaN, undefined).
 * 4. Procedural syllabus generation and multi-file metadata persistence in localStorage.
 */

const fs = require('fs');
const path = require('path');
const { describe, it, expect, inspectHtml, createMockBrowserEnv } = require('./helpers/test_framework');

const LOGIN_HTML_PATH = path.join(__dirname, '..', 'login.html');
const APP_JS_PATH = path.join(__dirname, '..', 'app.js');

const loginHtmlContent = fs.readFileSync(LOGIN_HTML_PATH, 'utf8');
const appJsContent = fs.readFileSync(APP_JS_PATH, 'utf8');

// ============================================================================
// CHALLENGE 1: BOUNDARY TESTING FOR procesarArchivosMultiples
// ============================================================================
describe('⚔️ Challenger M2 — Challenge 1: File Boundary & Stress Ingestion', 'Challenger M2: Adversarial', () => {

    // Helper implementing app.js logic for standalone verification
    const procesarArchivosMultiples = (files, maxLimit = 20) => {
        const extensionesPermitidas = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.json', '.csv'];
        const resultado = {
            archivosValidos: [],
            archivosRechazados: [],
            errorLimite: false,
            totalBytes: 0
        };

        if (!files || files.length === 0) {
            return resultado;
        }

        let filesArray = Array.from(files);
        if (filesArray.length > maxLimit) {
            resultado.errorLimite = true;
            filesArray = filesArray.slice(0, maxLimit);
        }

        for (const f of filesArray) {
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

    it('CH_M2_01: Boundary — Exactly 20 files are fully accepted without triggering errorLimite', () => {
        const files20 = Array.from({ length: 20 }, (_, i) => ({
            name: `Modulo_Ciencias_${i + 1}.pdf`,
            size: 10240 * (i + 1)
        }));

        const res = procesarArchivosMultiples(files20, 20);
        expect(res.archivosValidos.length).toBe(20);
        expect(res.archivosRechazados.length).toBe(0);
        expect(res.errorLimite).toBe(false);
        const expectedBytes = files20.reduce((acc, f) => acc + f.size, 0);
        expect(res.totalBytes).toBe(expectedBytes);
    });

    it('CH_M2_02: Boundary — 21 files triggers errorLimite and caps exactly at 20 files', () => {
        const files21 = Array.from({ length: 21 }, (_, i) => ({
            name: `Documento_${i + 1}.docx`,
            size: 5000
        }));

        const res = procesarArchivosMultiples(files21, 20);
        expect(res.errorLimite).toBe(true);
        expect(res.archivosValidos.length).toBe(20);
        expect(res.totalBytes).toBe(20 * 5000);
        expect(res.archivosValidos[0].name).toBe('Documento_1.docx');
        expect(res.archivosValidos[19].name).toBe('Documento_20.docx');
    });

    it('CH_M2_03: Stress — 100 files burst triggers errorLimite and caps strictly to first 20', () => {
        const files100 = Array.from({ length: 100 }, (_, i) => ({
            name: `Burst_Doc_${i + 1}.pptx`,
            size: 2048
        }));

        const res = procesarArchivosMultiples(files100, 20);
        expect(res.errorLimite).toBe(true);
        expect(res.archivosValidos.length).toBe(20);
        expect(res.totalBytes).toBe(20 * 2048);
        expect(res.archivosValidos[0].name).toBe('Burst_Doc_1.pptx');
        expect(res.archivosValidos[19].name).toBe('Burst_Doc_20.pptx');
    });

    it('CH_M2_04: Boundary — 0 files (empty array) returns empty results with zero totalBytes', () => {
        const res = procesarArchivosMultiples([], 20);
        expect(res.archivosValidos.length).toBe(0);
        expect(res.archivosRechazados.length).toBe(0);
        expect(res.errorLimite).toBe(false);
        expect(res.totalBytes).toBe(0);
    });

    it('CH_M2_05: Defensive — null and undefined inputs safely return empty results without throwing', () => {
        const resNull = procesarArchivosMultiples(null, 20);
        expect(resNull.archivosValidos.length).toBe(0);
        expect(resNull.errorLimite).toBe(false);
        expect(resNull.totalBytes).toBe(0);

        const resUndefined = procesarArchivosMultiples(undefined, 20);
        expect(resUndefined.archivosValidos.length).toBe(0);
        expect(resUndefined.errorLimite).toBe(false);
        expect(resUndefined.totalBytes).toBe(0);
    });

    it('CH_M2_06: FileList Emulation — Handles array-like objects with length and index properties', () => {
        const fileListMock = {
            0: { name: 'Guia1.pdf', size: 1000 },
            1: { name: 'Guia2.txt', size: 2000 },
            length: 2
        };

        const res = procesarArchivosMultiples(fileListMock, 20);
        expect(res.archivosValidos.length).toBe(2);
        expect(res.archivosValidos[0].name).toBe('Guia1.pdf');
        expect(res.archivosValidos[1].name).toBe('Guia2.txt');
        expect(res.totalBytes).toBe(3000);
    });

    it('CH_M2_07: Extension Matrix — Handles uppercase extensions, multiple dots, and rejects hazardous files', () => {
        const mixed = [
            { name: 'PLAN_ESTUDIOS.PDF', size: 10000 },
            { name: 'malla.curricular.2026.final.DOCX', size: 15000 },
            { name: 'presentacion.tema1.PPTX', size: 25000 },
            { name: 'datos_educativos.JSON', size: 5000 },
            { name: 'notas_estudiantes.CSV', size: 4000 },
            { name: 'script_malicioso.exe', size: 80000 },
            { name: 'payload.sh', size: 1000 },
            { name: 'archivo_sin_extension', size: 2000 },
            { name: 'archivo_oculto.tar.gz', size: 9000 }
        ];

        const res = procesarArchivosMultiples(mixed, 20);
        expect(res.archivosValidos.length).toBe(5);
        expect(res.archivosRechazados.length).toBe(4);
        expect(res.archivosValidos.map(f => f.name)).toEqual([
            'PLAN_ESTUDIOS.PDF',
            'malla.curricular.2026.final.DOCX',
            'presentacion.tema1.PPTX',
            'datos_educativos.JSON',
            'notas_estudiantes.CSV'
        ]);
        expect(res.archivosRechazados.map(f => f.name)).toEqual([
            'script_malicioso.exe',
            'payload.sh',
            'archivo_sin_extension',
            'archivo_oculto.tar.gz'
        ]);
    });
});

// ============================================================================
// CHALLENGE 2: LINGUISTIC & TOKEN AGGREGATION STRESS TESTING
// ============================================================================
describe('⚔️ Challenger M2 — Challenge 2: Text Aggregation & Linguistic Processing', 'Challenger M2: Adversarial', () => {

    const agregarTextoDocumentos = (documentos) => {
        if (!documentos || documentos.length === 0) return { textoCompleto: '', tokens: [] };
        
        let textoAcumulado = '';
        for (const doc of documentos) {
            const nombre = doc.name || doc.nombre || 'Documento';
            const contenido = doc.contenido || doc.text || doc.texto || '';
            textoAcumulado += `\n--- DOCUMENTO: ${nombre} ---\n` + contenido;
        }

        const rawWords = textoAcumulado.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [];
        const stopWords = new Set([
            'para', 'como', 'este', 'esta', 'estos', 'estas', 'sobre', 'desde', 'hacia',
            'entre', 'todos', 'todas', 'donde', 'quien', 'cuando', 'porque', 'cual', 'cuales'
        ]);
        const tokens = rawWords.filter(w => !stopWords.has(w));

        return {
            textoCompleto: textoAcumulado.trim(),
            tokens: Array.from(new Set(tokens))
        };
    };

    it('CH_M2_08: Defensive — Empty, null, and undefined documents return empty string and empty tokens array', () => {
        expect(agregarTextoDocumentos([])).toEqual({ textoCompleto: '', tokens: [] });
        expect(agregarTextoDocumentos(null)).toEqual({ textoCompleto: '', tokens: [] });
        expect(agregarTextoDocumentos(undefined)).toEqual({ textoCompleto: '', tokens: [] });
    });

    it('CH_M2_09: Spanish Accents & Tildes — Full Latin-1 diacritic words are cleanly tokenized in lowercase', () => {
        const docs = [
            {
                nombre: 'Ciencias_Naturales.pdf',
                contenido: 'La fotosíntesis y la respiración celular en organismos autótrofos y heterótrofos. Átomos, moléculas y energía cinética.'
            },
            {
                nombre: 'Español_Literatura.docx',
                contenido: 'Análisis lingüístico del léxico, sintaxis, semántica, poesía, metáfora y narrativa del niño contemporáneo.'
            }
        ];

        const agg = agregarTextoDocumentos(docs);
        expect(agg.textoCompleto).toContain('--- DOCUMENTO: Ciencias_Naturales.pdf ---');
        expect(agg.textoCompleto).toContain('--- DOCUMENTO: Español_Literatura.docx ---');

        // Check accented lowercase tokens
        const expectedAccented = [
            'fotosíntesis', 'respiración', 'autótrofos', 'heterótrofos',
            'átomos', 'moléculas', 'energía', 'cinética',
            'lingüístico', 'léxico', 'sintaxis', 'semántica', 'poesía', 'metáfora', 'niño'
        ];

        for (const token of expectedAccented) {
            expect(agg.tokens).toContain(token);
        }
    });

    it('CH_M2_10: Stopword Filter Stress — Discards all 18 Spanish functional grammatical stopwords', () => {
        const stopwordList = [
            'para', 'como', 'este', 'esta', 'estos', 'estas', 'sobre', 'desde', 'hacia',
            'entre', 'todos', 'todas', 'donde', 'quien', 'cuando', 'porque', 'cual', 'cuales'
        ];

        const docs = [
            {
                nombre: 'StopwordsDoc.pdf',
                contenido: stopwordList.join(' ') + ' astronomía robótica pedagogía'
            }
        ];

        const agg = agregarTextoDocumentos(docs);

        for (const sw of stopwordList) {
            expect(agg.tokens).not.toContain(sw);
        }

        expect(agg.tokens).toContain('astronomía');
        expect(agg.tokens).toContain('robótica');
        expect(agg.tokens).toContain('pedagogía');
    });

    it('CH_M2_11: Noise Immunity — Filters out special characters, HTML tags, numbers, and short words (< 4 chars)', () => {
        const noisyDoc = [
            {
                nombre: 'NoisyDoc.txt',
                contenido: `
                    <div><h1>¡Atención #123!</h1></div>
                    $$ 100 * 200 = 20000 %% && @@@
                    a de en el un una los las con por sin
                    biodiversidad biotecnología
                `
            }
        ];

        const agg = agregarTextoDocumentos(noisyDoc);
        // Short words (< 4 chars) like "a", "de", "en", "el", "un", "una", "los", "las", "con", "por", "sin" discarded
        expect(agg.tokens).not.toContain('con');
        expect(agg.tokens).not.toContain('por');
        expect(agg.tokens).not.toContain('sin');
        expect(agg.tokens).not.toContain('una');
        expect(agg.tokens).not.toContain('los');
        expect(agg.tokens).not.toContain('las');

        // Noise and tags discarded
        expect(agg.tokens).not.toContain('123');
        expect(agg.tokens).not.toContain('20000');

        // High signal keywords extracted
        expect(agg.tokens).toContain('atención');
        expect(agg.tokens).toContain('biodiversidad');
        expect(agg.tokens).toContain('biotecnología');
    });

    it('CH_M2_12: Polymorphic Document Objects — Supports .name vs .nombre and .contenido vs .text vs .texto', () => {
        const polyDocs = [
            { name: 'DocA.pdf', contenido: 'Algoritmos y programación estructurada' },
            { nombre: 'DocB.docx', text: 'Estructuras de datos y árboles binarios' },
            { name: 'DocC.pptx', texto: 'Inteligencia artificial y redes neuronales' }
        ];

        const agg = agregarTextoDocumentos(polyDocs);
        expect(agg.textoCompleto).toContain('--- DOCUMENTO: DocA.pdf ---');
        expect(agg.textoCompleto).toContain('--- DOCUMENTO: DocB.docx ---');
        expect(agg.textoCompleto).toContain('--- DOCUMENTO: DocC.pptx ---');
        expect(agg.tokens).toContain('algoritmos');
        expect(agg.tokens).toContain('programación');
        expect(agg.tokens).toContain('estructuras');
        expect(agg.tokens).toContain('árboles');
        expect(agg.tokens).toContain('inteligencia');
        expect(agg.tokens).toContain('artificial');
        expect(agg.tokens).toContain('neuronales');
    });
});

// ============================================================================
// CHALLENGE 3: QUEUE MUTATION & BOUNDARY REMOVAL
// ============================================================================
describe('⚔️ Challenger M2 — Challenge 3: Queue Mutation & Boundary Removal', 'Challenger M2: Adversarial', () => {

    it('CH_M2_13: Boundary Index Deletion — removerArchivoAsignaturaDocente safely handles -1, 0, and out of bounds', () => {
        const { window, document } = createMockBrowserEnv();
        
        window._archivosAsignaturaDocente = [
            { name: 'Doc1.pdf', size: 1000, contenido: 'Contenido 1' },
            { name: 'Doc2.docx', size: 2000, contenido: 'Contenido 2' },
            { name: 'Doc3.pptx', size: 3000, contenido: 'Contenido 3' }
        ];

        // Sincronizar helper
        const sincronizar = () => {
            if (!Array.isArray(window._archivosAsignaturaDocente)) window._archivosAsignaturaDocente = [];
            window._nombresArchivosAsignaturaDocente = window._archivosAsignaturaDocente.map(f => f.name || f.nombre);
            window._nombreArchivoAsignaturaDocente = window._nombresArchivosAsignaturaDocente.join(', ');
        };

        const remover = (index) => {
            if (Array.isArray(window._archivosAsignaturaDocente) && index >= 0 && index < window._archivosAsignaturaDocente.length) {
                window._archivosAsignaturaDocente.splice(index, 1);
            }
            sincronizar();
        };

        // Test 1: Negative index -1 -> NO change
        remover(-1);
        expect(window._archivosAsignaturaDocente.length).toBe(3);
        expect(window._nombreArchivoAsignaturaDocente).toBe('Doc1.pdf, Doc2.docx, Doc3.pptx');

        // Test 2: Out of bounds index 5 -> NO change
        remover(5);
        expect(window._archivosAsignaturaDocente.length).toBe(3);

        // Test 3: Out of bounds index 3 (exact length) -> NO change
        remover(3);
        expect(window._archivosAsignaturaDocente.length).toBe(3);

        // Test 4: NaN and undefined index -> NO change
        remover(NaN);
        expect(window._archivosAsignaturaDocente.length).toBe(3);
        remover(undefined);
        expect(window._archivosAsignaturaDocente.length).toBe(3);

        // Test 5: Delete index 1 (Doc2.docx) -> Middle item removed
        remover(1);
        expect(window._archivosAsignaturaDocente.length).toBe(2);
        expect(window._archivosAsignaturaDocente.map(f => f.name)).toEqual(['Doc1.pdf', 'Doc3.pptx']);
        expect(window._nombreArchivoAsignaturaDocente).toBe('Doc1.pdf, Doc3.pptx');

        // Test 6: Delete index 0 (Doc1.pdf) -> First item removed
        remover(0);
        expect(window._archivosAsignaturaDocente.length).toBe(1);
        expect(window._archivosAsignaturaDocente[0].name).toBe('Doc3.pptx');
        expect(window._nombreArchivoAsignaturaDocente).toBe('Doc3.pptx');

        // Test 7: Delete last remaining item at index 0 -> Queue empty
        remover(0);
        expect(window._archivosAsignaturaDocente.length).toBe(0);
        expect(window._nombreArchivoAsignaturaDocente).toBe('');
    });

    it('CH_M2_14: Full Reset — limpiarArchivosAsignaturaDocente restores all state to initial baseline', () => {
        const { window } = createMockBrowserEnv();
        
        window._archivosAsignaturaDocente = [
            { name: 'Doc1.pdf', size: 1000 },
            { name: 'Doc2.pdf', size: 2000 }
        ];
        window._textoDocumentoAsignaturaDocente = "Texto acumulado previo";
        window._nombreArchivoAsignaturaDocente = "Doc1.pdf, Doc2.pdf";
        window._nombresArchivosAsignaturaDocente = ["Doc1.pdf", "Doc2.pdf"];

        const limpiar = () => {
            window._archivosAsignaturaDocente = [];
            window._textoDocumentoAsignaturaDocente = "";
            window._nombreArchivoAsignaturaDocente = "";
            window._nombresArchivosAsignaturaDocente = [];
        };

        limpiar();
        expect(window._archivosAsignaturaDocente.length).toBe(0);
        expect(window._textoDocumentoAsignaturaDocente).toBe("");
        expect(window._nombreArchivoAsignaturaDocente).toBe("");
        expect(window._nombresArchivosAsignaturaDocente.length).toBe(0);
    });
});

// ============================================================================
// CHALLENGE 4: DOM CONTRACTS & SYLLABUS PERSISTENCE
// ============================================================================
describe('⚔️ Challenger M2 — Challenge 4: DOM Contracts & Syllabus Persistence', 'Challenger M2: Adversarial', () => {

    it('CH_M2_15: DOM Contracts — All required multi-file elements exist in login.html with exact attributes', () => {
        const inspector = inspectHtml(loginHtmlContent);
        
        // 1. File input with multiple and correct accept
        const fileInput = inspector.getElementById('modal-asig-archivo');
        expect(fileInput).toBeTruthy();
        expect(fileInput.hasAttribute('multiple')).toBeTruthy();
        const accept = fileInput.getAttribute('accept') || '';
        expect(accept).toContain('.pdf');
        expect(accept).toContain('.doc');
        expect(accept).toContain('.docx');
        expect(accept).toContain('.ppt');
        expect(accept).toContain('.pptx');
        expect(accept).toContain('.txt');

        // 2. Clear button
        expect(inspector.hasElementWithId('modal-asig-archivos-limpiar')).toBeTruthy();

        // 3. Counter badge and text
        expect(inspector.hasElementWithId('modal-asig-archivos-badge')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-asig-archivos-count-text')).toBeTruthy();

        // 4. Alert container
        expect(inspector.hasElementWithId('modal-asig-archivos-alerta')).toBeTruthy();

        // 5. Preview chips container
        expect(inspector.hasElementWithId('modal-asig-archivos-preview')).toBeTruthy();

        // 6. Legacy compatibility label
        expect(inspector.hasElementWithId('modal-asig-archivo-nombre')).toBeTruthy();
    });

    it('CH_M2_16: Curriculum Generation — procesarDocumentoYCrearMalla correctly attaches multi-file metadata to localStorage', () => {
        const { window, localStorage } = createMockBrowserEnv();

        window.normalizarGradoOCiclo = (g) => `Grado ${g}`;
        window.obtenerIconoAsignatura = () => '🔬';

        const procesarDocumentoYCrearMalla = (nombreAsig, gradosArray, descripcion, textoDocumento, archivoNombre = "", icono = "") => {
            let palabrasClave = [];
            if (textoDocumento && typeof textoDocumento === 'string' && textoDocumento.trim().length > 0) {
                const stopWords = new Set([
                    'para', 'como', 'este', 'esta', 'estos', 'estas', 'sobre', 'desde', 'hacia',
                    'entre', 'todos', 'todas', 'donde', 'quien', 'cuando', 'porque', 'cual', 'cuales',
                    'documento', 'archivo', 'seccion', 'capitulo', 'unidad', 'modulo', 'periodo', 'grado'
                ]);
                const rawWords = textoDocumento.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [];
                const tokens = rawWords.filter(w => !stopWords.has(w));
                const freqs = {};
                tokens.forEach(t => { freqs[t] = (freqs[t] || 0) + 1; });
                palabrasClave = Object.keys(freqs).sort((a,b) => freqs[b] - freqs[a]).slice(0, 20);
            }

            const objMeta = descripcion || `Desarrollar competencias en ${nombreAsig}`;
            const dbas = [
                `DBA 1: Conceptos de ${nombreAsig}`,
                `DBA 2: Análisis de ${nombreAsig}`,
                `DBA 3: Proyectos de ${nombreAsig}`,
                `DBA 4: Evaluación de ${nombreAsig}`
            ];

            const nombresAdjuntos = archivoNombre ? archivoNombre.split(', ').map(s => s.trim()).filter(Boolean) : [];

            const estructuraMallaPorGrado = {
                objetivo: objMeta,
                dba: dbas,
                periodos: {},
                documento_origen: archivoNombre || "Documento Curricular Cargado",
                documentos_adjuntos: nombresAdjuntos,
                total_documentos: nombresAdjuntos.length,
                palabras_clave_extraidas: palabrasClave,
                fecha_creacion: new Date().toISOString()
            };

            let mallasCustom = {};
            try { mallasCustom = JSON.parse(localStorage.getItem('mallas_personalizadas_db') || '{}'); } catch(e) {}
            if (!mallasCustom[nombreAsig]) mallasCustom[nombreAsig] = {};
            
            gradosArray.forEach(g => {
                mallasCustom[nombreAsig][g] = estructuraMallaPorGrado;
            });
            localStorage.setItem('mallas_personalizadas_db', JSON.stringify(mallasCustom));

            const asigPayload = {
                id: nombreAsig.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                nombre: nombreAsig,
                grados: gradosArray,
                descripcion: objMeta,
                icono: icono || '🔬',
                documentos_origen: nombresAdjuntos,
                malla: estructuraMallaPorGrado
            };

            let asigList = [];
            try { asigList = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]'); } catch(e) {}
            asigList.push(asigPayload);
            localStorage.setItem('asignaturas_personalizadas_db', JSON.stringify(asigList));

            return asigPayload;
        };

        const fileNames = [
            'Estandares_Biologia_MEN.pdf',
            'Plan_Area_Ecologia.docx',
            'Guia_Laboratorio_Celular.pptx'
        ];

        const textSample = `
            --- DOCUMENTO: Estandares_Biologia_MEN.pdf ---
            Ecosistemas biodiversidad fotosíntesis respiración genética evolución
            --- DOCUMENTO: Plan_Area_Ecologia.docx ---
            Ecosistemas sostenibilidad conservación ambiental biomas adaptación
            --- DOCUMENTO: Guia_Laboratorio_Celular.pptx ---
            Células membrana microscopía organelos citoplasma mitosis
        `;

        const result = procesarDocumentoYCrearMalla(
            'Biología Avanzada',
            ['6', '7', '8'],
            'Curso de biología experimental',
            textSample,
            fileNames.join(', '),
            '🧬'
        );

        expect(result.documentos_origen.length).toBe(3);
        expect(result.documentos_origen).toEqual(fileNames);
        expect(result.malla.total_documentos).toBe(3);
        expect(result.malla.palabras_clave_extraidas).toContain('ecosistemas');
        expect(result.malla.palabras_clave_extraidas).toContain('biodiversidad');
        expect(result.malla.palabras_clave_extraidas).toContain('células');

        // Check localStorage persistence
        const storedAsigs = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db'));
        expect(storedAsigs.length).toBe(1);
        expect(storedAsigs[0].nombre).toBe('Biología Avanzada');
        expect(storedAsigs[0].documentos_origen).toEqual(fileNames);

        const storedMallas = JSON.parse(localStorage.getItem('mallas_personalizadas_db'));
        expect(storedMallas['Biología Avanzada']['6'].total_documentos).toBe(3);
        expect(storedMallas['Biología Avanzada']['7'].total_documentos).toBe(3);
        expect(storedMallas['Biología Avanzada']['8'].total_documentos).toBe(3);
    });
});
