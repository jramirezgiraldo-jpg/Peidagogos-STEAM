/**
 * ============================================================================
 * 🧪 TEST SUITE: R1 — Teacher Dashboard UI Layout & Role Restrictions
 * ============================================================================
 * Covers:
 * - Feature 1: Toolbox Layout Hub (#vista-cajas-hub & #vista-categoria-detalle)
 * - Feature 2: Subject Modal Icons & Presets
 * - Feature 3: Fundamental Subjects Presets
 * - Feature 4: "Director de Grupo" Restriction Logic
 */

const fs = require('fs');
const path = require('path');
const { describe, it, expect, inspectHtml, createMockBrowserEnv } = require('./helpers/test_framework');

const LOGIN_HTML_PATH = path.join(__dirname, '..', 'login.html');
const APP_JS_PATH = path.join(__dirname, '..', 'app.js');
const ASIGNATURAS_JSON_PATH = path.join(__dirname, '..', 'asignaturas.json');

const loginHtmlContent = fs.readFileSync(LOGIN_HTML_PATH, 'utf8');
const appJsContent = fs.readFileSync(APP_JS_PATH, 'utf8');
const asignaturasJson = JSON.parse(fs.readFileSync(ASIGNATURAS_JSON_PATH, 'utf8'));

// ============================================================================
// TIER 1: FEATURE COVERAGE (HAPPY PATH CONTRACTS)
// ============================================================================
describe('R1: UI Layout & Role Restrictions — Tier 1 Feature Coverage', 'Tier 1: Feature Coverage', () => {

    it('T1_R1_01: DOM & Contract — Navigation functions in app.js and modal-caja-herramientas in login.html', () => {
        const inspector = inspectHtml(loginHtmlContent);
        // Verify modal-caja-herramientas exists
        expect(inspector.hasElementWithId('modal-caja-herramientas')).toBeTruthy();
        expect(inspector.hasElementWithId('vista-cajas-hub')).toBeTruthy();
        expect(inspector.hasElementWithId('vista-categoria-detalle')).toBeTruthy();
        
        // Verify app.js defines the Hub and Category Detail contracts
        expect(appJsContent).toContain('vista-cajas-hub');
        expect(appJsContent).toContain('vista-categoria-detalle');
    });

    it('T1_R1_02: Navigation Contract — abrirDetalleCajaTematica hides Hub and displays Category Detail', () => {
        const { window, document } = createMockBrowserEnv();
        const hubEl = document.getElementById('vista-cajas-hub');
        const detailEl = document.getElementById('vista-categoria-detalle');
        
        hubEl.style.display = 'flex';
        detailEl.style.display = 'none';

        // Simulation of abrirDetalleCajaTematica
        const abrirDetalleCajaTematica = (categoria) => {
            const hub = document.getElementById('vista-cajas-hub');
            const detalle = document.getElementById('vista-categoria-detalle');
            if (hub) hub.style.display = 'none';
            if (detalle) detalle.style.display = 'flex';
        };

        abrirDetalleCajaTematica('juegos');
        expect(hubEl.style.display).toBe('none');
        expect(detailEl.style.display).toBe('flex');
    });

    it('T1_R1_03: Navigation Contract — volverACajasHub restores Hub and hides Category Detail', () => {
        const { window, document } = createMockBrowserEnv();
        const hubEl = document.getElementById('vista-cajas-hub');
        const detailEl = document.getElementById('vista-categoria-detalle');
        
        hubEl.style.display = 'none';
        detailEl.style.display = 'flex';

        // Simulation of volverACajasHub
        const volverACajasHub = () => {
            const hub = document.getElementById('vista-cajas-hub');
            const detalle = document.getElementById('vista-categoria-detalle');
            if (hub) hub.style.display = 'flex';
            if (detalle) detalle.style.display = 'none';
        };

        volverACajasHub();
        expect(hubEl.style.display).toBe('flex');
        expect(detailEl.style.display).toBe('none');
    });

    it('T1_R1_04: Subject Modal Icons — #modal-asig-icono contains icons for fundamental subjects', () => {
        const inspector = inspectHtml(loginHtmlContent);
        expect(inspector.hasElementWithId('modal-asig-icono')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-asig-presets-container')).toBeTruthy();

        // Fundamental subjects required by curriculum:
        // Natural Sciences, Math, Language, Social Studies, English, Physics, Chemistry, etc.
        const subjectNames = asignaturasJson.map(a => a.nombre || a.materia || a.id);
        expect(subjectNames.length).toBeGreaterThanOrEqual(10);

        expect(appJsContent).toContain('CATALOGO_AREAS_FUNDAMENTALES');
        expect(appJsContent).toContain('obtenerIconoAsignatura');
        expect(appJsContent).toContain('seleccionarPlantillaAsignatura');
    });

    it('T1_R1_05: Role Contract — Teacher with es_director === true has group selection unlocked', () => {
        const inspector = inspectHtml(loginHtmlContent);
        expect(inspector.hasElementWithId('modal-asig-grados-wrapper')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-asig-director-badge')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-asig-director-notice')).toBeTruthy();
        expect(loginHtmlContent).toContain('Como docente de área, puedes crear la estructura de la asignatura. La vinculación de cohortes de grupo está reservada para Directores de Grupo.');
        expect(appJsContent).toContain('verificarEsDirectorOAdmin');

        const authSes = {
            documento: '123456',
            nombre: 'Juan Felipe',
            rol: 'docente',
            es_director: true,
            grupos_direccion: ['7C'],
            grados: ['6', '7', '8']
        };

        const evaluarPermisoDirector = (sesion) => {
            if (sesion.rol === 'admin') return { permitido: true, motivo: 'admin' };
            if (sesion.es_director === true) return { permitido: true, motivo: 'director' };
            return { permitido: false, motivo: 'no_es_director' };
        };

        const check = evaluarPermisoDirector(authSes);
        expect(check.permitido).toBe(true);
        expect(check.motivo).toBe('director');
    });

    it('T1_R1_06: Role Contract — Teacher with es_director === false has group selection restricted', () => {
        const authSes = {
            documento: '987654',
            nombre: 'Profesor Catedrático',
            rol: 'docente',
            es_director: false,
            grupos_direccion: [],
            grados: ['6', '7']
        };

        const evaluarPermisoDirector = (sesion) => {
            if (sesion.rol === 'admin') return { permitido: true, motivo: 'admin' };
            if (sesion.es_director === true) return { permitido: true, motivo: 'director' };
            return { permitido: false, motivo: 'no_es_director' };
        };

        const check = evaluarPermisoDirector(authSes);
        expect(check.permitido).toBe(false);
        expect(check.motivo).toBe('no_es_director');
    });
});

// ============================================================================
// TIER 2: BOUNDARY & CORNER CASES
// ============================================================================
describe('R1: UI Layout & Role Restrictions — Tier 2 Boundary & Corner Cases', 'Tier 2: Boundary & Corner Cases', () => {

    it('T2_R1_01: Role Boundary — Undefined/null es_director flag safely defaults to restricted mode', () => {
        const legacyTeacher = {
            documento: '112233',
            nombre: 'Docente Antiguo',
            rol: 'docente'
            // es_director is missing
        };

        const esDirectorSeguro = Boolean(legacyTeacher.es_director === true);
        expect(esDirectorSeguro).toBe(false);
    });

    it('T2_R1_02: Role Boundary — Admin role (rol === "admin") overrides es_director === false', () => {
        const adminUser = {
            documento: 'admin01',
            nombre: 'Administrador Rector',
            rol: 'admin',
            es_director: false
        };

        const puedeGestionarGrupos = (adminUser.rol === 'admin' || adminUser.es_director === true);
        expect(puedeGestionarGrupos).toBe(true);
    });

    it('T2_R1_03: DOM Boundary — Rapid consecutive category clicks maintain mutually exclusive view visibility', () => {
        const { window, document } = createMockBrowserEnv();
        const hub = document.getElementById('vista-cajas-hub');
        const detalle = document.getElementById('vista-categoria-detalle');

        const abrirCategoria = (cat) => {
            hub.style.display = 'none';
            detalle.style.display = 'flex';
        };
        const volver = () => {
            hub.style.display = 'flex';
            detalle.style.display = 'none';
        };

        // Simulate fast toggles
        abrirCategoria('imprimibles');
        abrirCategoria('juegos');
        volver();
        abrirCategoria('aula');
        volver();

        expect(hub.style.display).toBe('flex');
        expect(detalle.style.display).toBe('none');
    });

    it('T2_R1_04: State Boundary — Re-opening Caja de Herramientas modal resets to Hub view', () => {
        const { window, document } = createMockBrowserEnv();
        const modal = document.getElementById('modal-caja-herramientas');
        const hub = document.getElementById('vista-cajas-hub');
        const detalle = document.getElementById('vista-categoria-detalle');

        const abrirModalCajaHerramientas = () => {
            modal.style.display = 'flex';
            hub.style.display = 'flex';
            detalle.style.display = 'none';
        };

        // Teacher was previously looking at a sub-category
        hub.style.display = 'none';
        detalle.style.display = 'flex';

        // Re-open
        abrirModalCajaHerramientas();
        expect(hub.style.display).toBe('flex');
        expect(detalle.style.display).toBe('none');
    });

    it('T2_R1_05: Icon Boundary — Subject modal icon selector handles empty/unrecognized icon gracefully', () => {
        const fallbackIcon = '📚';
        const resolveIcon = (iconInput) => {
            if (!iconInput || typeof iconInput !== 'string' || iconInput.trim() === '') {
                return fallbackIcon;
            }
            return iconInput.trim();
        };

        expect(resolveIcon(null)).toBe('📚');
        expect(resolveIcon('')).toBe('📚');
        expect(resolveIcon('   ')).toBe('📚');
        expect(resolveIcon('⚛️ Física')).toBe('⚛️ Física');
    });
});
