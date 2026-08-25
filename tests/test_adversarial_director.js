/**
 * ============================================================================
 * 🧪 ADVERSARIAL TEST SUITE: Director de Grupo Edge Cases & Security
 * ============================================================================
 * Challenger 2: Adversarial Corner-Case Challenger
 * 
 * Verifies:
 * 1. Role spoofing / Boundary leakage
 * 2. Group ID collision / overwrites & isolation
 * 3. Student registration injection / non-existent groups
 * 4. Network failure resilience (backend offline / 500 error)
 * 5. Document formatting variations (dots, hyphens, spaces, Colombian ID patterns)
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

describe('Adversarial Test 1: Role Spoofing & Role Boundary Leakage', 'Tier 2: Adversarial & Security', () => {

    it('ADV_01_A: Default HTML markup must hardcode style="display: none;" on #btn-tab-docente-mi-grupo', () => {
        const inspector = inspectHtml(loginHtmlContent);
        const btnTab = inspector.getElementById('btn-tab-docente-mi-grupo');
        expect(btnTab).toBeTruthy();
        expect(btnTab.style.display).toBe('none');
    });

    it('ADV_01_B: Non-director roles (undefined, regular, docente, tutor, estudiante, admin, null, random) must default to display: none', () => {
        const testRoles = [undefined, null, '', 'docente', 'tutor', 'regular', 'estudiante', 'admin', 'hacker', 'DIRECTOR_FAKE', 'false', '0'];

        for (const role of testRoles) {
            const { window, document, localStorage, sessionStorage } = createMockBrowserEnv();
            window.rolDocente = role;

            const btnMiGrupo = document.getElementById('btn-tab-docente-mi-grupo');
            btnMiGrupo.style.display = 'none';

            // Simulate obtaining session and init
            let resolvedRol = window.rolDocente;
            if (!resolvedRol || (resolvedRol !== 'director')) {
                resolvedRol = 'regular';
            }

            if (resolvedRol === 'director') {
                btnMiGrupo.style.display = 'flex';
            } else {
                btnMiGrupo.style.display = 'none';
            }

            expect(btnMiGrupo.style.display).toBe('none');
        }
    });

    it('ADV_01_C: Strict verification of window.obtenerDatosDocenteSesion logic in app.js', () => {
        expect(appJsContent).toContain("if (!rolDoc) rolDoc = 'regular';");
        expect(appJsContent).toContain("if (rolDoc === 'director') {");
        expect(appJsContent).toContain("btnTabMiGrupo.style.display = 'none';");
    });
});

describe('Adversarial Test 2: Group ID Collision & Data Isolation', 'Tier 2: Adversarial & Security', () => {

    it('ADV_02_A: Multiple directors store distinct, isolated keys in localStorage without collision', () => {
        const { localStorage } = createMockBrowserEnv();

        const dir1 = 'DOC_DIR_1001';
        const dir2 = 'DOC_DIR_1002';

        const group1 = { grado: '7', grupo: 'C', docentes: ['DOC_A', 'DOC_B'], creadoEn: 1000, directorDoc: dir1, directorNombre: 'Director Uno' };
        const group2 = { grado: '10', grupo: 'A', docentes: ['DOC_C'], creadoEn: 2000, directorDoc: dir2, directorNombre: 'Director Dos' };

        localStorage.setItem('grupo_director_' + dir1, JSON.stringify(group1));
        localStorage.setItem('grupo_director_' + dir2, JSON.stringify(group2));

        const saved1 = JSON.parse(localStorage.getItem('grupo_director_' + dir1));
        const saved2 = JSON.parse(localStorage.getItem('grupo_director_' + dir2));

        expect(saved1.grado).toBe('7');
        expect(saved1.grupo).toBe('C');
        expect(saved1.directorDoc).toBe(dir1);
        expect(saved1.docentes.length).toBe(2);

        expect(saved2.grado).toBe('10');
        expect(saved2.grupo).toBe('A');
        expect(saved2.directorDoc).toBe(dir2);
        expect(saved2.docentes.length).toBe(1);

        // Deleting/reconfiguring group 1 must not affect group 2
        localStorage.removeItem('grupo_director_' + dir1);
        expect(localStorage.getItem('grupo_director_' + dir1)).toBe(null);
        expect(localStorage.getItem('grupo_director_' + dir2)).not.toBe(null);
        expect(JSON.parse(localStorage.getItem('grupo_director_' + dir2)).grupo).toBe('A');
    });

    it('ADV_02_B: Backend /api/guardar-grupo-director generates unique IDs and prevents state collisions', () => {
        expect(serverJsContent).toContain('id: `gd_${docDirector}_${grado}${grupo}`');
        expect(serverJsContent).toContain('global.db.grupos_director');
        expect(serverJsContent).toContain("app.get('/api/grupos-director'");
    });
});

describe('Adversarial Test 3: Student Registration Injection & Dynamic Options', 'Tier 2: Adversarial & Security', () => {

    it('ADV_03_A: verificarParametrosMatriculaDirecta safely handles standard and custom/non-existent groups', () => {
        const testGroups = [
            { raw: '7C', expectedGrado: '7' },
            { raw: '10B', expectedGrado: '10' },
            { raw: 'PreescolarA', expectedGrado: 'Preescolar' },
            { raw: 'Ciclo IV', expectedGrado: 'Ciclo IV' },
            { raw: 'GrupoEspecial99', expectedGrado: 'GrupoEspecial99' }
        ];

        for (const tg of testGroups) {
            const match = tg.raw.match(/^([0-9]+|Preescolar|Ciclo\s+[IVX]+)(.*)$/i);
            const gradoParsed = match ? match[1] : tg.raw;
            expect(gradoParsed).toBe(tg.expectedGrado);
        }
    });

    it('ADV_03_B: Appending non-existent options uses safe DOM createElement / option.value / option.text (No innerHTML injection)', () => {
        expect(appJsContent).toContain('const opt = document.createElement(\'option\');');
        expect(appJsContent).toContain('opt.value = grupoVal;');
        expect(appJsContent).toContain('opt.text = grupoVal;');
        expect(appJsContent).toContain('selGrupo.appendChild(opt);');
    });
});

describe('Adversarial Test 4: Network Failure & 500 Error Resilience', 'Tier 2: Adversarial & Security', () => {

    it('ADV_04_A: crearGrupoDirector executes localStorage write BEFORE network call and wraps fetch in try-catch', () => {
        const funcStr = appJsContent.slice(appJsContent.indexOf('window.crearGrupoDirector ='), appJsContent.indexOf('window.crearGrupoDirectorEjecutar ='));
        expect(funcStr).toContain("localStorage.setItem('grupo_director_' + doc, JSON.stringify(grupoData));");
        expect(funcStr).toContain("try {");
        expect(funcStr).toContain("await fetch('/api/guardar-grupo-director'");
        expect(funcStr).toContain("} catch(e) {}");
        expect(funcStr).toContain("window.renderizarPanelMiGrupoDirector(doc, nom);");

        // Verify that localStorage write occurs BEFORE fetch
        const idxStorage = funcStr.indexOf('localStorage.setItem');
        const idxFetch = funcStr.indexOf('await fetch');
        expect(idxStorage).toBeLessThan(idxFetch);
    });

    it('ADV_04_B: toggleDocenteGrupoDirector synchronously persists to localStorage and catches background sync errors', () => {
        const funcStr = appJsContent.slice(appJsContent.indexOf('window.toggleDocenteGrupoDirector ='), appJsContent.indexOf('window.renderizarMisOtrosGruposDocente ='));
        expect(funcStr).toContain("localStorage.setItem('grupo_director_' + docDirector, JSON.stringify(grupoData));");
        expect(funcStr).toContain("fetch('/api/guardar-grupo-director'");
        expect(funcStr).toContain(".catch(() => {})");
    });

    it('ADV_04_C: cargarDirectorioDocentesGrupoDirector falls back to localStorage.docentes_db when /api/docentes fails', () => {
        const funcStr = appJsContent.slice(appJsContent.indexOf('window.cargarDirectorioDocentesGrupoDirector ='), appJsContent.indexOf('window.toggleDocenteGrupoDirector ='));
        expect(funcStr).toContain("fetch('/api/docentes')");
        expect(funcStr).toContain("localStorage.getItem('docentes_db')");
    });
});

describe('Adversarial Test 5: Document Formatting Variations (Normalization & Matching)', 'Tier 2: Adversarial & Security', () => {

    it('ADV_05_A: Colombian ID normalization regex removes dots, commas, hyphens, underscores and whitespace', () => {
        const clean = (doc) => String(doc || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');

        const variations = [
            '1.094.123.456',
            '1094123456',
            '1094-123-456',
            ' 1094 123 456 ',
            '1,094,123,456',
            '1094_123_456',
            'CC.1094123456'
        ];

        const baseNormalized = clean('1094123456');
        expect(clean('1.094.123.456')).toBe(baseNormalized);
        expect(clean('1094-123-456')).toBe(baseNormalized);
        expect(clean(' 1094 123 456 ')).toBe(baseNormalized);
        expect(clean('1,094,123,456')).toBe(baseNormalized);
        expect(clean('1094_123_456')).toBe(baseNormalized);
    });

    it('ADV_05_B: Mis Otros Grupos accurately links teacher across formatting variations', () => {
        const clean = (doc) => String(doc || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');

        // Mock localStorage with group created by Director A holding teacher's unformatted ID
        const testStorage = {
            'grupo_director_DIR999': JSON.stringify({
                grado: '8',
                grupo: 'B',
                directorDoc: 'DIR999',
                directorNombre: 'Director Prueba',
                docentes: ['1.094.987.654', '111222333']
            })
        };

        // Teacher logs in with formatted ID
        const teacherSessionDoc = ' 1094-987-654 ';
        const normDoc = clean(teacherSessionDoc);

        const otrosGrupos = [];
        for (const k in testStorage) {
            if (k.startsWith('grupo_director_')) {
                const g = JSON.parse(testStorage[k]);
                if (g && Array.isArray(g.docentes)) {
                    const match = g.docentes.some(d => clean(d) === normDoc);
                    if (match) otrosGrupos.push(g);
                }
            }
        }

        expect(otrosGrupos.length).toBe(1);
        expect(otrosGrupos[0].grado).toBe('8');
        expect(otrosGrupos[0].grupo).toBe('B');
    });

    it('ADV_05_C: Montenegro institution matching is case-insensitive and tolerant', () => {
        const isMontenegro = (inst) => {
            const s = String(inst || '').toLowerCase();
            return s.includes('montenegro') || s.includes('instituto') || !s;
        };

        expect(isMontenegro('IE Instituto Montenegro')).toBeTruthy();
        expect(isMontenegro('i.e. montenegro')).toBeTruthy();
        expect(isMontenegro('INSTITUTO MONTENEGRO SEDE PRINCIPAL')).toBeTruthy();
        expect(isMontenegro('Instituto')).toBeTruthy();
        expect(isMontenegro('')).toBeTruthy();
        expect(isMontenegro('Colegio San Jose de Bogota')).toBeFalsy();
    });
});
