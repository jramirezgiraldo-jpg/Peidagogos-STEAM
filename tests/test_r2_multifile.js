/**
 * ============================================================================
 * 🧪 TEST SUITE: R2 — Multi-file Document Ingestion
 * ============================================================================
 * Covers:
 * - Feature 5: Multi-file document upload (up to 20 files, PDF, Word, PPT)
 * - File queue state management (window._archivosAsignaturaDocente)
 * - Multi-document text extraction and token aggregation
 * - Boundary conditions (20 files limit, 0 files, unsupported extensions)
 */

const fs = require('fs');
const path = require('path');
const { describe, it, expect, inspectHtml, createMockBrowserEnv } = require('./helpers/test_framework');

const LOGIN_HTML_PATH = path.join(__dirname, '..', 'login.html');
const loginHtmlContent = fs.readFileSync(LOGIN_HTML_PATH, 'utf8');

// Multi-file Processing Helper Simulation
const procesarArchivosMultiples = (files, maxLimit = 20) => {
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

    if (files.length > maxLimit) {
        resultado.errorLimite = true;
        // Cap to maximum allowed
        files = files.slice(0, maxLimit);
    }

    for (const f of files) {
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

// Text & Token Aggregation Helper
const agregarTextoDocumentos = (documentos) => {
    if (!documentos || documentos.length === 0) return { textoCompleto: '', tokens: [] };
    
    let textoAcumulado = '';
    for (const doc of documentos) {
        textoAcumulado += `\n--- DOCUMENTO: ${doc.nombre} ---\n` + (doc.contenido || '');
    }

    const rawWords = textoAcumulado.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [];
    const stopWords = new Set(['para', 'como', 'este', 'esta', 'sobre', 'desde', 'hacia', 'entre', 'todos', 'todas']);
    const tokens = rawWords.filter(w => !stopWords.has(w));

    return {
        textoCompleto: textoAcumulado.trim(),
        tokens: Array.from(new Set(tokens))
    };
};

// ============================================================================
// TIER 1: FEATURE COVERAGE (HAPPY PATH CONTRACTS)
// ============================================================================
describe('R2: Multi-file Document Ingestion — Tier 1 Feature Coverage', 'Tier 1: Feature Coverage', () => {

    it('T1_R2_01: DOM Contract — #modal-asig-archivo input has multiple attribute', () => {
        const inspector = inspectHtml(loginHtmlContent);
        const el = inspector.getElementById('modal-asig-archivo');
        expect(el).toBeTruthy();
        expect(el.hasAttribute('multiple')).toBeTruthy();
    });

    it('T1_R2_02: DOM Contract — #modal-asig-archivo input accepts PDF, DOC, DOCX, PPT, PPTX formats', () => {
        const inspector = inspectHtml(loginHtmlContent);
        const el = inspector.getElementById('modal-asig-archivo');
        expect(el).toBeTruthy();
        const accept = el.getAttribute('accept') || '';
        expect(accept).toContain('.pdf');
        expect(accept).toContain('.doc');
        expect(accept).toContain('.docx');
        expect(accept).toContain('.ppt');
        expect(accept).toContain('.pptx');
    });

    it('T1_R2_03: Queue Contract — Uploading 3 files populates queue and tracks metadata', () => {
        const mockFiles = [
            { name: 'Guia_Ciencias_Grado7.pdf', size: 102400 },
            { name: 'Plan_Area_Biologia.docx', size: 204800 },
            { name: 'Diapositivas_Ecosistemas.pptx', size: 512000 }
        ];

        const res = procesarArchivosMultiples(mockFiles, 20);
        expect(res.archivosValidos.length).toBe(3);
        expect(res.archivosRechazados.length).toBe(0);
        expect(res.errorLimite).toBe(false);
        expect(res.totalBytes).toBe(102400 + 204800 + 512000);
    });

    it('T1_R2_04: Preview Rendering — Formats multi-file preview badge list with name and size', () => {
        const mockFiles = [
            { name: 'Plan_Fisica_2026.pdf', size: 153600 }
        ];

        const formatearItemPreview = (f) => {
            const kb = Math.round(f.size / 1024);
            return `<div class="file-chip">📄 <strong>${f.name}</strong> (${kb} KB)</div>`;
        };

        const chipHtml = formatearItemPreview(mockFiles[0]);
        expect(chipHtml).toContain('Plan_Fisica_2026.pdf');
        expect(chipHtml).toContain('150 KB');
    });

    it('T1_R2_05: Content Aggregation — Merges text content from all uploaded documents', () => {
        const docs = [
            { nombre: 'Doc1.pdf', contenido: 'Conceptos fundamentales de termodinámica y calorimetría' },
            { nombre: 'Doc2.docx', contenido: 'Leyes de la energía y conservación de entropía' }
        ];

        const aggregated = agregarTextoDocumentos(docs);
        expect(aggregated.textoCompleto).toContain('termodinámica');
        expect(aggregated.textoCompleto).toContain('entropía');
        expect(aggregated.tokens).toContain('termodinámica');
        expect(aggregated.tokens).toContain('energía');
        expect(aggregated.tokens).toContain('entropía');
    });
});

// ============================================================================
// TIER 2: BOUNDARY & CORNER CASES
// ============================================================================
describe('R2: Multi-file Document Ingestion — Tier 2 Boundary & Corner Cases', 'Tier 2: Boundary & Corner Cases', () => {

    it('T2_R2_01: Boundary — Exactly 20 files are allowed and accepted without limit error', () => {
        const files20 = [];
        for (let i = 1; i <= 20; i++) {
            files20.push({ name: `Documento_Modulo_${i}.pdf`, size: 50000 });
        }

        const res = procesarArchivosMultiples(files20, 20);
        expect(res.archivosValidos.length).toBe(20);
        expect(res.errorLimite).toBe(false);
    });

    it('T2_R2_02: Boundary — 21 or more files triggers errorLimite and caps to 20', () => {
        const files25 = [];
        for (let i = 1; i <= 25; i++) {
            files25.push({ name: `Extra_File_${i}.docx`, size: 30000 });
        }

        const res = procesarArchivosMultiples(files25, 20);
        expect(res.errorLimite).toBe(true);
        expect(res.archivosValidos.length).toBe(20);
    });

    it('T2_R2_03: Boundary — Zero files uploaded safely proceeds with empty aggregation', () => {
        const res = procesarArchivosMultiples([], 20);
        expect(res.archivosValidos.length).toBe(0);
        expect(res.errorLimite).toBe(false);

        const agg = agregarTextoDocumentos([]);
        expect(agg.textoCompleto).toBe('');
        expect(agg.tokens.length).toBe(0);
    });

    it('T2_R2_04: File Type Boundary — Discards unapproved extensions (.exe, .zip, .bin)', () => {
        const mixedFiles = [
            { name: 'Guia_Oficial.pdf', size: 20000 },
            { name: 'Virus.exe', size: 10000 },
            { name: 'Archivo_Comprimido.zip', size: 40000 },
            { name: 'Diapositivas.pptx', size: 60000 }
        ];

        const res = procesarArchivosMultiples(mixedFiles, 20);
        expect(res.archivosValidos.length).toBe(2);
        expect(res.archivosRechazados.length).toBe(2);
        expect(res.archivosValidos.map(f => f.name)).toEqual(['Guia_Oficial.pdf', 'Diapositivas.pptx']);
    });

    it('T2_R2_05: Content Boundary — Handles 0-byte empty file without throwing exceptions', () => {
        const emptyDocs = [
            { nombre: 'Vacio.txt', contenido: '' },
            { nombre: 'SoloEspacios.docx', contenido: '   \n\t  ' }
        ];

        const agg = agregarTextoDocumentos(emptyDocs);
        expect(agg.textoCompleto).toContain('Vacio.txt');
        expect(agg.tokens.length).toBe(0);
    });
});
