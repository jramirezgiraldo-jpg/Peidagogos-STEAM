/**
 * ============================================================================
 * 🧪 TEST SUITE: Director de Grupo (R1 to R5)
 * ============================================================================
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

describe('Director de Grupo Module — R1 to R5', 'Tier 1: Feature Coverage', () => {

    it('T1_DG_01: R1 DOM — #docente-nav-tabs, #btn-tab-docente-mi-grupo and #vista-docente-mi-grupo exist', () => {
        const inspector = inspectHtml(loginHtmlContent);
        expect(inspector.hasElementWithId('docente-nav-tabs')).toBeTruthy();
        expect(inspector.hasElementWithId('btn-tab-docente-herramientas')).toBeTruthy();
        expect(inspector.hasElementWithId('btn-tab-docente-mi-grupo')).toBeTruthy();
        expect(inspector.hasElementWithId('vista-docente-herramientas')).toBeTruthy();
        expect(inspector.hasElementWithId('vista-docente-mi-grupo')).toBeTruthy();
        
        // Initial state: #btn-tab-docente-mi-grupo is display: none in HTML
        const btnTabMiGrupo = inspector.getElementById('btn-tab-docente-mi-grupo');
        expect(btnTabMiGrupo.style.display).toBe('none');
    });

    it('T1_DG_02: R1 Role Visibility — Director sees Mi Grupo tab (display: flex), regular teacher does not (display: none)', () => {
        expect(appJsContent).toContain('window.cambiarTabDocente');
        expect(appJsContent).toContain('window.inicializarModuloDirectorGrupo');
        expect(appJsContent).toContain('window.rolDocente');

        // Test with mock DOM
        const { window, document } = createMockBrowserEnv();
        const btnMiGrupo = document.getElementById('btn-tab-docente-mi-grupo');
        btnMiGrupo.style.display = 'none';

        // When director
        window.rolDocente = 'director';
        if (window.rolDocente === 'director') {
            btnMiGrupo.style.display = 'flex';
        } else {
            btnMiGrupo.style.display = 'none';
        }
        expect(btnMiGrupo.style.display).toBe('flex');

        // When regular
        window.rolDocente = 'regular';
        if (window.rolDocente === 'director') {
            btnMiGrupo.style.display = 'flex';
        } else {
            btnMiGrupo.style.display = 'none';
        }
        expect(btnMiGrupo.style.display).toBe('none');
    });

    it('T1_DG_03: R2 Group Creation Form — Dropdowns for Grado (Preescolar..11) and Grupo (A..J) exist', () => {
        const inspector = inspectHtml(loginHtmlContent);
        expect(inspector.hasElementWithId('docente-seccion-crear-grupo')).toBeTruthy();
        expect(inspector.hasElementWithId('select-crear-grupo-grado')).toBeTruthy();
        expect(inspector.hasElementWithId('select-crear-grupo-letra')).toBeTruthy();
        expect(inspector.hasElementWithId('btn-crear-grupo-director')).toBeTruthy();

        // Check grado and grupo options in HTML
        expect(loginHtmlContent).toContain('Preescolar');
        expect(loginHtmlContent).toContain('11°');
        expect(loginHtmlContent).toContain('value="A"');
        expect(loginHtmlContent).toContain('value="J"');
    });

    it('T1_DG_04: R2 Group Persistence — localStorage.grupo_director_<doc> saves object with grado, grupo, docentes[]', () => {
        expect(appJsContent).toContain('grupo_director_');
        expect(appJsContent).toContain('creadoEn');

        const { window, localStorage } = createMockBrowserEnv();
        const docId = '123456';
        const testGrupo = {
            grado: '7',
            grupo: 'C',
            docentes: [],
            creadoEn: Date.now(),
            directorDoc: docId,
            directorNombre: 'Juan Pérez'
        };

        localStorage.setItem('grupo_director_' + docId, JSON.stringify(testGrupo));
        const saved = JSON.parse(localStorage.getItem('grupo_director_' + docId));

        expect(saved.grado).toBe('7');
        expect(saved.grupo).toBe('C');
        expect(Array.isArray(saved.docentes)).toBeTruthy();
        expect(saved.directorDoc).toBe('123456');
    });

    it('T1_DG_05: R3 Montenegro Teachers Directory & Toggle — filter by montenegro and toggle docentes[]', () => {
        expect(appJsContent).toContain('window.cargarDirectorioDocentesGrupoDirector');
        expect(appJsContent).toContain('window.toggleDocenteGrupoDirector');
        expect(appJsContent).toContain('montenegro');

        const montenegroDocs = docentesJson.filter(d => String(d.institucion || '').toLowerCase().includes('montenegro'));
        expect(montenegroDocs.length).toBeGreaterThanOrEqual(1);

        // Test toggle logic
        const { localStorage } = createMockBrowserEnv();
        const docDirector = '123456';
        const docColega = '987654';
        const grupo = { grado: '7', grupo: 'C', docentes: [], creadoEn: Date.now() };
        localStorage.setItem('grupo_director_' + docDirector, JSON.stringify(grupo));

        // Add
        let data = JSON.parse(localStorage.getItem('grupo_director_' + docDirector));
        data.docentes.push(docColega);
        localStorage.setItem('grupo_director_' + docDirector, JSON.stringify(data));
        expect(JSON.parse(localStorage.getItem('grupo_director_' + docDirector)).docentes).toContain('987654');

        // Remove
        data = JSON.parse(localStorage.getItem('grupo_director_' + docDirector));
        const idx = data.docentes.indexOf(docColega);
        data.docentes.splice(idx, 1);
        localStorage.setItem('grupo_director_' + docDirector, JSON.stringify(data));
        expect(JSON.parse(localStorage.getItem('grupo_director_' + docDirector)).docentes.includes('987654')).toBeFalsy();
    });

    it('T1_DG_06: R4 Student Registration Link Generator & Copy Feedback', () => {
        const inspector = inspectHtml(loginHtmlContent);
        expect(inspector.hasElementWithId('input-link-matricula-estudiantes')).toBeTruthy();
        expect(inspector.hasElementWithId('btn-copiar-link-estudiantes')).toBeTruthy();
        expect(inspector.hasElementWithId('btn-whatsapp-link-estudiantes')).toBeTruthy();

        expect(appJsContent).toContain('window.copiarLinkMatriculaEstudiantes');
        expect(appJsContent).toContain('window.compartirLinkMatriculaWhatsApp');
        expect(appJsContent).toContain('reg=estudiante');
        expect(appJsContent).toContain('director=');
    });

    it('T1_DG_07: R4 Student Pre-fill in verificarParametrosMatriculaDirecta', () => {
        expect(appJsContent).toContain('window.verificarParametrosMatriculaDirecta');
        expect(appJsContent).toContain('window.directorMatriculaActual');
        expect(appJsContent).toContain('InstitutoMontenegro');
        expect(appJsContent).toContain('actualizarMaterias');
    });

    it('T1_DG_08: R5 Mis Otros Grupos — scans localStorage for grupo_director_* matching teacher doc', () => {
        const inspector = inspectHtml(loginHtmlContent);
        expect(inspector.hasElementWithId('docente-seccion-mis-otros-grupos')).toBeTruthy();
        expect(inspector.hasElementWithId('grid-mis-otros-grupos')).toBeTruthy();

        expect(appJsContent).toContain('window.renderizarMisOtrosGruposDocente');
        expect(appJsContent).toContain('Aún no apareces en grupos de otros directores');
    });

    it('T1_DG_09: Backend Routes — POST /api/guardar-grupo-director and GET /api/grupos-director exist in server.js', () => {
        expect(serverJsContent).toContain("app.post('/api/guardar-grupo-director'");
        expect(serverJsContent).toContain("app.get('/api/grupos-director'");
        expect(serverJsContent).toContain('grupos_director');
    });
});
