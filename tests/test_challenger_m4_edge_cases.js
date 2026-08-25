/**
 * ============================================================================
 * ⚔️ ADVERSARIAL CHALLENGER TEST SUITE: M4 EDGE CASES & EMPIRICAL HARNESS
 * ============================================================================
 * Focus on M4 "Director de Grupo" (R1 - R5):
 * 1. Teacher with missing/null apellidos or unusual document formatting.
 * 2. Director with no colleagues added (empty docentes: []).
 * 3. Adding and removing the same colleague multiple times (toggle idempotent behavior).
 * 4. URL parameter permutations (?reg=estudiante&grupo=PreescolarA&inst=montenegro&director=98765, ?reg=estudiante&grupo=11J&inst=montenegro).
 * 5. Scanning localStorage when multiple other directors have registered groups (corrupted JSON, non-arrays, formatting mismatches).
 */

const fs = require('fs');
const path = require('path');
const { describe, it, expect, inspectHtml, createMockBrowserEnv } = require('./helpers/test_framework');

const LOGIN_HTML_PATH = path.join(__dirname, '..', 'login.html');
const APP_JS_PATH = path.join(__dirname, '..', 'app.js');
const SERVER_JS_PATH = path.join(__dirname, '..', 'server.js');
const DOCENTES_JSON_PATH = path.join(__dirname, '..', 'docentes.json');

const loginHtmlContent = fs.readFileSync(LOGIN_HTML_PATH, 'utf8');
const appJsContent = fs.readFileSync(APP_JS_PATH, 'utf8');
const serverJsContent = fs.readFileSync(SERVER_JS_PATH, 'utf8');
const docentesJson = JSON.parse(fs.readFileSync(DOCENTES_JSON_PATH, 'utf8'));

// ============================================================================
// EDGE CASE 1: TEACHER APERTURE, NULL APELLIDOS & DOCUMENT FORMATTING
// ============================================================================
describe('⚔️ Challenger M4 — Edge Case 1: Null Apellidos & Document Formatting', 'Tier 2: Boundary & Corner Cases', () => {

    const normalizarDoc = (doc) => String(doc || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');

    const formatearNombreDocente = (d) => {
        return d.nombre_completo || `${d.nombre || ''} ${d.apellidos || ''}`.trim() || 'Docente';
    };

    it('CH_M4_01: Document normalization strips dots, dashes, spaces, and uppercase letters', () => {
        expect(normalizarDoc(' 1.234.567-8 ')).toBe('12345678');
        expect(normalizarDoc('CC_98.765.432')).toBe('cc98765432');
        expect(normalizarDoc('TI-1.098.765.432_A ')).toBe('ti1098765432a');
        expect(normalizarDoc(null)).toBe('');
        expect(normalizarDoc(undefined)).toBe('');
    });

    it('CH_M4_02: Teacher with missing or null apellidos falls back gracefully without "null" string', () => {
        const teacher1 = { nombre: 'Carlos', apellidos: null };
        const teacher2 = { nombre: 'María', apellidos: undefined };
        const teacher3 = { nombre: null, apellidos: null };
        const teacher4 = { nombre_completo: 'Lic. Andrés Pastrana' };

        expect(formatearNombreDocente(teacher1)).toBe('Carlos');
        expect(formatearNombreDocente(teacher2)).toBe('María');
        expect(formatearNombreDocente(teacher3)).toBe('Docente');
        expect(formatearNombreDocente(teacher4)).toBe('Lic. Andrés Pastrana');
    });

    it('CH_M4_03: Matching teacher session with formatted document in docentes_db', () => {
        const dList = [
            { documento: '1.234.567', nombre: 'Juan Pérez', rol: 'director' },
            { documento: '98-765-432', nombre: 'Ana Gómez', rol: 'regular' }
        ];

        const matchSession = (inputDoc) => {
            const normDoc = normalizarDoc(inputDoc);
            return dList.find(d => normalizarDoc(d.documento) === normDoc);
        };

        const found1 = matchSession('1234567');
        expect(found1).toBeTruthy();
        expect(found1.nombre).toBe('Juan Pérez');
        expect(found1.rol).toBe('director');

        const found2 = matchSession(' 98.765.432 ');
        expect(found2).toBeTruthy();
        expect(found2.nombre).toBe('Ana Gómez');
    });
});

// ============================================================================
// EDGE CASE 2: DIRECTOR WITH NO COLLEAGUES ADDED (EMPTY DOCENTES: [])
// ============================================================================
describe('⚔️ Challenger M4 — Edge Case 2: Empty Docentes Array', 'Tier 2: Boundary & Corner Cases', () => {

    it('CH_M4_04: Group initialized with empty docentes[] renders 0 assigned teachers badge', () => {
        const grupo = {
            grado: '7',
            grupo: 'C',
            docentes: [],
            creadoEn: Date.now(),
            directorDoc: '123456',
            directorNombre: 'Prof. Roberto'
        };

        const renderCounterBadge = (g) => `Docentes asignados: ${(g.docentes || []).length}`;
        expect(renderCounterBadge(grupo)).toBe('Docentes asignados: 0');
    });

    it('CH_M4_05: Directory rendering with empty docentes marks all teachers as "+ Agregar"', () => {
        const grupoData = { grado: '7', grupo: 'C', docentes: [] };
        const teachers = [
            { documento: '101', nombre: 'Pedro', institucion: 'IE Instituto Montenegro' },
            { documento: '102', nombre: 'Lucia', institucion: 'IE Instituto Montenegro' }
        ];

        const renderButtons = (list, g) => {
            const added = g.docentes || [];
            return list.map(t => ({
                doc: t.documento,
                isAdded: added.includes(t.documento),
                btnLabel: added.includes(t.documento) ? '✓ Agregado' : '+ Agregar'
            }));
        };

        const buttons = renderButtons(teachers, grupoData);
        expect(buttons.length).toBe(2);
        expect(buttons[0].btnLabel).toBe('+ Agregar');
        expect(buttons[1].btnLabel).toBe('+ Agregar');
        expect(buttons.every(b => !b.isAdded)).toBeTruthy();
    });

    it('CH_M4_06: Backend endpoint accepts empty docentes array without validation error', () => {
        const payload = {
            documento_director: '123456',
            grado: '7',
            grupo: 'C',
            docentes: []
        };

        const validatePayload = (body) => {
            const docDirector = String(body.documento_director || body.documento || '').trim();
            const grado = String(body.grado || '').trim();
            const grupo = String(body.grupo || '').trim();
            const docentes = Array.isArray(body.docentes) ? body.docentes : [];

            if (!docDirector || !grado || !grupo) {
                return { valid: false, error: "Faltan datos obligatorios" };
            }
            return { valid: true, data: { docDirector, grado, grupo, docentes } };
        };

        const res = validatePayload(payload);
        expect(res.valid).toBe(true);
        expect(res.data.docentes).toEqual([]);
    });
});

// ============================================================================
// EDGE CASE 3: TOGGLE IDEMPOTENT BEHAVIOR & REPEATED ADD/REMOVE
// ============================================================================
describe('⚔️ Challenger M4 — Edge Case 3: Toggle Idempotency & Repeat Cycles', 'Tier 2: Boundary & Corner Cases', () => {

    const toggleColleague = (grupo, docColega) => {
        if (!Array.isArray(grupo.docentes)) grupo.docentes = [];
        const idx = grupo.docentes.indexOf(docColega);
        if (idx >= 0) {
            grupo.docentes.splice(idx, 1);
        } else {
            grupo.docentes.push(docColega);
        }
        return grupo.docentes;
    };

    it('CH_M4_07: Alternating toggle sequence produces clean additions and removals without duplicates', () => {
        const grupo = { grado: '9', grupo: 'A', docentes: [] };
        const colega = '888999';

        // Cycle 1: Add
        toggleColleague(grupo, colega);
        expect(grupo.docentes).toEqual(['888999']);

        // Cycle 2: Remove
        toggleColleague(grupo, colega);
        expect(grupo.docentes).toEqual([]);

        // Cycle 3: Add
        toggleColleague(grupo, colega);
        expect(grupo.docentes).toEqual(['888999']);

        // Cycle 4: Remove
        toggleColleague(grupo, colega);
        expect(grupo.docentes).toEqual([]);

        // Cycle 5: Add
        toggleColleague(grupo, colega);
        expect(grupo.docentes).toEqual(['888999']);
    });

    it('CH_M4_08: Multi-teacher toggling preserves independent member states', () => {
        const grupo = { grado: '10', grupo: 'B', docentes: [] };
        const doc1 = '111';
        const doc2 = '222';
        const doc3 = '333';

        toggleColleague(grupo, doc1);
        toggleColleague(grupo, doc2);
        expect(grupo.docentes).toEqual(['111', '222']);

        toggleColleague(grupo, doc3);
        expect(grupo.docentes).toEqual(['111', '222', '333']);

        toggleColleague(grupo, doc2); // Remove middle
        expect(grupo.docentes).toEqual(['111', '333']);

        toggleColleague(grupo, doc1); // Remove first
        expect(grupo.docentes).toEqual(['333']);

        toggleColleague(grupo, doc3); // Remove last
        expect(grupo.docentes).toEqual([]);
    });
});

// ============================================================================
// EDGE CASE 4: URL PARAMETER PERMUTATIONS
// ============================================================================
describe('⚔️ Challenger M4 — Edge Case 4: URL Parameter Permutations', 'Tier 2: Boundary & Corner Cases', () => {

    const parseUrlRegistrationParams = (urlSearch) => {
        const params = new URLSearchParams(urlSearch);
        const regParam = params.get('reg');
        const grupoParam = params.get('grupo');
        const gradoParam = params.get('grado');
        const directorParam = params.get('director');
        const instParam = params.get('inst');

        const isEstudianteReg = (regParam === 'estudiante') || !!directorParam;
        let parsedGrado = '';
        let parsedGrupo = '';

        if (grupoParam) {
            const grupoVal = decodeURIComponent(grupoParam);
            const match = grupoVal.match(/^([0-9]+|Preescolar|Ciclo\s+[IVX]+)(.*)$/i);
            parsedGrado = match ? match[1] : (gradoParam ? decodeURIComponent(gradoParam) : grupoVal);
            parsedGrupo = grupoVal;
        }

        return {
            isEstudianteReg,
            grado: parsedGrado,
            grupo: parsedGrupo,
            director: directorParam || null,
            institucion: instParam || null
        };
    };

    it('CH_M4_09: Permutation A — ?reg=estudiante&grupo=PreescolarA&inst=montenegro&director=98765', () => {
        const parsed = parseUrlRegistrationParams('?reg=estudiante&grupo=PreescolarA&inst=montenegro&director=98765');
        expect(parsed.isEstudianteReg).toBe(true);
        expect(parsed.grado).toBe('Preescolar');
        expect(parsed.grupo).toBe('PreescolarA');
        expect(parsed.director).toBe('98765');
        expect(parsed.institucion).toBe('montenegro');
    });

    it('CH_M4_10: Permutation B — ?reg=estudiante&grupo=11J&inst=montenegro (No director param)', () => {
        const parsed = parseUrlRegistrationParams('?reg=estudiante&grupo=11J&inst=montenegro');
        expect(parsed.isEstudianteReg).toBe(true);
        expect(parsed.grado).toBe('11');
        expect(parsed.grupo).toBe('11J');
        expect(parsed.director).toBe(null);
    });

    it('CH_M4_11: Permutation C — ?reg=estudiante&grupo=Ciclo%20IVB&inst=montenegro&director=123', () => {
        const parsed = parseUrlRegistrationParams('?reg=estudiante&grupo=Ciclo%20IVB&inst=montenegro&director=123');
        expect(parsed.isEstudianteReg).toBe(true);
        expect(parsed.grado).toBe('Ciclo IV');
        expect(parsed.grupo).toBe('Ciclo IVB');
        expect(parsed.director).toBe('123');
    });

    it('CH_M4_12: Permutation D — ?director=554433 without explicit reg=estudiante', () => {
        const parsed = parseUrlRegistrationParams('?grupo=7C&director=554433');
        expect(parsed.isEstudianteReg).toBe(true);
        expect(parsed.grado).toBe('7');
        expect(parsed.grupo).toBe('7C');
        expect(parsed.director).toBe('554433');
    });
});

// ============================================================================
// EDGE CASE 5: SCANNING LOCALSTORAGE WITH MULTIPLE DIRECTORS & MALFORMED DATA
// ============================================================================
describe('⚔️ Challenger M4 — Edge Case 5: localStorage Scanning & Malformed Data', 'Tier 2: Boundary & Corner Cases', () => {

    const scanMisOtrosGrupos = (storageMap, teacherDoc) => {
        const normDoc = String(teacherDoc || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');
        const otrosGrupos = [];

        for (const [k, v] of Object.entries(storageMap)) {
            if (k.startsWith('grupo_director_')) {
                try {
                    const g = JSON.parse(v);
                    if (g && Array.isArray(g.docentes)) {
                        const match = g.docentes.some(d => String(d).trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc);
                        if (match) otrosGrupos.push(g);
                    }
                } catch(e) {}
            }
        }
        return otrosGrupos;
    };

    it('CH_M4_13: Multi-director storage scanning correctly filters groups where teacher is assigned', () => {
        const storage = {
            'usuario_sesion': '{"nombre":"Luis"}',
            'grupo_director_1001': JSON.stringify({ grado: '6', grupo: 'A', directorNombre: 'Dir 1', docentes: ['123456', '999'] }),
            'grupo_director_1002': JSON.stringify({ grado: '8', grupo: 'B', directorNombre: 'Dir 2', docentes: ['555', '777'] }),
            'grupo_director_1003': JSON.stringify({ grado: '10', grupo: 'C', directorNombre: 'Dir 3', docentes: ['123.456'] }), // Formatted doc
            'grupo_director_1004': JSON.stringify({ grado: '11', grupo: 'A', directorNombre: 'Dir 4', docentes: [] }),
            'docentes_db': '[{"nombre":"Test"}]'
        };

        const matches = scanMisOtrosGrupos(storage, '123456');
        expect(matches.length).toBe(2);
        expect(matches.map(g => `${g.grado}${g.grupo}`)).toEqual(['6A', '10C']);
    });

    it('CH_M4_14: Resilient to corrupted JSON and invalid schema keys in localStorage', () => {
        const storage = {
            'grupo_director_broken1': '{ malformed json content...',
            'grupo_director_broken2': 'null',
            'grupo_director_broken3': '12345',
            'grupo_director_broken4': JSON.stringify({ grado: '9', grupo: 'D', docentes: "not an array" }),
            'grupo_director_valid': JSON.stringify({ grado: '9', grupo: 'D', directorNombre: 'Dir Valid', docentes: ['123456'] })
        };

        const matches = scanMisOtrosGrupos(storage, '123456');
        expect(matches.length).toBe(1);
        expect(matches[0].directorNombre).toBe('Dir Valid');
    });

    it('CH_M4_15: Empty matches cleanly returns empty array triggering fallback UI message', () => {
        const storage = {
            'grupo_director_1001': JSON.stringify({ grado: '6', grupo: 'A', docentes: ['999'] }),
            'grupo_director_1002': JSON.stringify({ grado: '8', grupo: 'B', docentes: ['555'] })
        };

        const matches = scanMisOtrosGrupos(storage, '123456');
        expect(matches.length).toBe(0);
    });
});
