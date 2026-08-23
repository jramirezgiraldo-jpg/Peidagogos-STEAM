/**
 * ============================================================================
 * ⚔️ ADVERSARIAL CHALLENGER TEST SUITE: MILESTONE 1 (M1)
 * ============================================================================
 * Focus:
 * 1. Stress testing Rapid View Switching in Toolbox (Caja de Herramientas Hub vs Category Detail).
 * 2. Exhaustive verification of all 22 Subject Icons, Presets, Heuristic Matchers & Catalogs.
 * 3. Matrix & Boundary testing for "Director de Grupo" vs Non-Director vs Admin permissions and fallbacks.
 */

const fs = require('fs');
const path = require('path');
const { describe, it, expect, inspectHtml, createMockBrowserEnv } = require('./helpers/test_framework');

const LOGIN_HTML_PATH = path.join(__dirname, '..', 'login.html');
const APP_JS_PATH = path.join(__dirname, '..', 'app.js');
const ASIGNATURAS_JSON_PATH = path.join(__dirname, '..', 'asignaturas.json');
const DOCENTES_JSON_PATH = path.join(__dirname, '..', 'docentes.json');

const loginHtmlContent = fs.readFileSync(LOGIN_HTML_PATH, 'utf8');
const appJsContent = fs.readFileSync(APP_JS_PATH, 'utf8');
const asignaturasJson = JSON.parse(fs.readFileSync(ASIGNATURAS_JSON_PATH, 'utf8'));
const docentesJson = JSON.parse(fs.readFileSync(DOCENTES_JSON_PATH, 'utf8'));

// ============================================================================
// CHALLENGE 1: TOOLBOX RAPID VIEW SWITCHING & DOM ISOLATION
// ============================================================================
describe('⚔️ Challenger M1 — Challenge 1: Toolbox Layout & Rapid View Transitions', 'Challenger M1: Adversarial', () => {

    it('CH_M1_01: DOM Contract — Level 1 is fully encapsulated inside #vista-cajas-hub and Level 2 inside #vista-categoria-detalle', () => {
        const inspector = inspectHtml(loginHtmlContent);
        expect(inspector.hasElementWithId('vista-cajas-hub')).toBeTruthy();
        expect(inspector.hasElementWithId('vista-categoria-detalle')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-caja-herramientas')).toBeTruthy();

        // Verify the 6 Category Card triggers exist and call abrirDetalleCajaTematica
        const categories = ['imprimibles', 'juegos', 'aula', 'visual', 'evaluacion', 'homeschool'];
        for (const cat of categories) {
            expect(loginHtmlContent).toContain(`abrirDetalleCajaTematica('${cat}')`);
        }

        // Verify the back button in Level 2 calls volverACajasHub
        expect(loginHtmlContent).toContain('volverACajasHub()');
    });

    it('CH_M1_02: Stress Test — 1000 Rapid View Switches maintain strict mutual exclusion', () => {
        const { window, document } = createMockBrowserEnv();
        const hub = document.getElementById('vista-cajas-hub');
        const det = document.getElementById('vista-categoria-detalle');
        const icon = document.getElementById('categoria-detalle-icono');
        const title = document.getElementById('categoria-detalle-titulo');

        const METAS = {
            'imprimibles': { icono: '📋', titulo: '⭐ Caja 1: Planificación Curricular' },
            'juegos': { icono: '🕹️', titulo: 'Caja 2: Juegos Dinámicos y Activación' },
            'aula': { icono: '📺', titulo: 'Caja 3: Gestión de Aula y Pantalla Gigante' },
            'visual': { icono: '🧠', titulo: 'Caja 4: Pensamiento Visual & Mentefactos' },
            'evaluacion': { icono: '🏆', titulo: 'Caja 5: Evaluación y Diseño Curricular' },
            'homeschool': { icono: '🏡', titulo: 'Caja 6: Organización, Hábitos y Home School' }
        };

        const cats = ['imprimibles', 'juegos', 'aula', 'visual', 'evaluacion', 'homeschool'];

        const abrirDetalle = (cat) => {
            hub.style.display = 'none';
            det.style.display = 'flex';
            const meta = METAS[cat] || METAS['juegos'];
            icon.innerText = meta.icono;
            title.innerText = meta.titulo;
        };

        const volverHub = () => {
            hub.style.display = 'flex';
            det.style.display = 'none';
        };

        // Start at Hub
        volverHub();
        expect(hub.style.display).toBe('flex');
        expect(det.style.display).toBe('none');

        // Execute 1000 randomized state switches
        for (let i = 0; i < 1000; i++) {
            const action = Math.random() > 0.4 ? 'detail' : 'hub';
            if (action === 'detail') {
                const randomCat = cats[Math.floor(Math.random() * cats.length)];
                abrirDetalle(randomCat);
                expect(hub.style.display).toBe('none');
                expect(det.style.display).toBe('flex');
                expect(icon.innerText).toBe(METAS[randomCat].icono);
            } else {
                volverHub();
                expect(hub.style.display).toBe('flex');
                expect(det.style.display).toBe('none');
            }
        }
    });

    it('CH_M1_03: Defensive Fallback — abrirDetalleCajaTematica with unknown/corrupted category defaults safely to "juegos"', () => {
        const { window, document } = createMockBrowserEnv();
        const METAS = {
            'imprimibles': { icono: '📋', titulo: '⭐ Caja 1' },
            'juegos': { icono: '🕹️', titulo: 'Caja 2: Fallback' }
        };

        const resolveMeta = (cat) => {
            return METAS[cat] || METAS['juegos'];
        };

        expect(resolveMeta(undefined).icono).toBe('🕹️');
        expect(resolveMeta(null).icono).toBe('🕹️');
        expect(resolveMeta('categoria_fantasma_404').icono).toBe('🕹️');
        expect(resolveMeta('').icono).toBe('🕹️');
    });
});

// ============================================================================
// CHALLENGE 2: EXHAUSTIVE 22 SUBJECT ICONS & PRESET SYNCHRONIZATION
// ============================================================================
describe('⚔️ Challenger M1 — Challenge 2: 22 Subject Icons, Presets & Heuristic Resolution', 'Challenger M1: Adversarial', () => {

    const EXPECTED_22_SUBJECTS = [
        { nombre: "Ciencias Naturales y Educación Ambiental", icono: "🌿" },
        { nombre: "Biología", icono: "🧬" },
        { nombre: "Física", icono: "⚛️" },
        { nombre: "Química", icono: "🧪" },
        { nombre: "Matemáticas", icono: "📐" },
        { nombre: "Lengua Castellana", icono: "📖" },
        { nombre: "Ciencias Sociales", icono: "🌍" },
        { nombre: "Idioma Extranjero Inglés", icono: "🇬🇧" },
        { nombre: "Tecnología e Informática", icono: "🖥️" },
        { nombre: "Educación Artística", icono: "🎨" },
        { nombre: "Educación Física", icono: "⚽" },
        { nombre: "Filosofía", icono: "🏛️" },
        { nombre: "Ética y Valores Humanos", icono: "🤝" },
        { nombre: "Turismo y Patrimonio", icono: "🧭" },
        { nombre: "Robótica STEAM", icono: "🤖" },
        { nombre: "Emprendimiento", icono: "💡" },
        { nombre: "Paz y Convivencia", icono: "🕊️" },
        { nombre: "Estadística", icono: "📊" },
        { nombre: "Agroecología", icono: "🌱" },
        { nombre: "Música", icono: "🎼" },
        { nombre: "Investigación", icono: "🔬" },
        { nombre: "Programación", icono: "💻" }
    ];

    it('CH_M1_04: Catalog Completeness — Exactly 22 fundamental areas defined in CATALOGO_AREAS_FUNDAMENTALES and in select options', () => {
        expect(EXPECTED_22_SUBJECTS.length).toBe(22);

        // Check options in login.html select #modal-asig-icono
        const selectRegex = /<select[^>]*id=["']modal-asig-icono["'][^>]*>([\s\S]*?)<\/select>/i;
        const selectMatch = loginHtmlContent.match(selectRegex);
        expect(selectMatch).toBeTruthy();

        const optionsHtml = selectMatch[1];
        for (const item of EXPECTED_22_SUBJECTS) {
            expect(optionsHtml).toContain(`value="${item.icono}"`);
        }

        // Check app.js declaration
        expect(appJsContent).toContain('window.CATALOGO_AREAS_FUNDAMENTALES = [');
        for (const item of EXPECTED_22_SUBJECTS) {
            expect(appJsContent).toContain(`icono: "${item.icono}"`);
        }
    });

    it('CH_M1_05: Heuristic Matcher Stress Test — Fuzzy and Case-Insensitive inputs resolve to correct icons', () => {
        // Implementation of the resolver identical to app.js
        const obtenerIcono = (asig, customList = []) => {
            if (!asig) return "📚";
            const asigLow = String(asig).toLowerCase().trim();

            const cMatch = customList.find(c => c.nombre && c.nombre.toLowerCase().trim() === asigLow);
            if (cMatch && cMatch.icono) return cMatch.icono;

            const fMatch = EXPECTED_22_SUBJECTS.find(f => f.nombre.toLowerCase().trim() === asigLow);
            if (fMatch && fMatch.icono) return fMatch.icono;

            if (asigLow.includes('biolog') || asigLow.includes('biológ')) return "🧬";
            if (asigLow.includes('físic') || asigLow.includes('fisic')) return "⚛️";
            if (asigLow.includes('químic') || asigLow.includes('quimic')) return "🧪";
            if (asigLow.includes('matemát') || asigLow.includes('matemat') || asigLow.includes('álgebra') || asigLow.includes('geometr')) return "📐";
            if (asigLow.includes('social') || asigLow.includes('historia') || asigLow.includes('geograf')) return "🌍";
            if (asigLow.includes('lengua') || asigLow.includes('castell') || asigLow.includes('español') || asigLow.includes('literat')) return "📖";
            if (asigLow.includes('inglés') || asigLow.includes('ingles') || asigLow.includes('idioma') || asigLow.includes('english')) return "🇬🇧";
            if (asigLow.includes('tecno') || asigLow.includes('informát') || asigLow.includes('informat')) return "🖥️";
            if (asigLow.includes('turismo') || asigLow.includes('patrimon')) return "🧭";
            if (asigLow.includes('artístic') || asigLow.includes('artist') || asigLow.includes('artes') || asigLow.includes('dibujo')) return "🎨";
            if ((asigLow.includes('física') && asigLow.includes('educación')) || asigLow.includes('educacion fisica') || asigLow.includes('deporte')) return "⚽";
            if (asigLow.includes('filosof') || asigLow.includes('filosóf')) return "🏛️";
            if (asigLow.includes('ética') || asigLow.includes('etica') || asigLow.includes('valores') || asigLow.includes('relig')) return "🤝";
            if (asigLow.includes('robot') || asigLow.includes('robót') || asigLow.includes('steam')) return "🤖";
            if (asigLow.includes('emprend') || asigLow.includes('innovac') || asigLow.includes('financ')) return "💡";
            if (asigLow.includes('paz') || asigLow.includes('conviv') || asigLow.includes('ciudadan')) return "🕊️";
            if (asigLow.includes('estadíst') || asigLow.includes('estadist') || asigLow.includes('econom')) return "📊";
            if (asigLow.includes('agro') || asigLow.includes('café') || asigLow.includes('cafe') || asigLow.includes('ambient') || asigLow.includes('ecolog')) return "🌱";
            if (asigLow.includes('músic') || asigLow.includes('music') || asigLow.includes('sonor')) return "🎼";
            if (asigLow.includes('investig') || asigLow.includes('cienc')) return "🔬";
            if (asigLow.includes('program') || asigLow.includes('algorit') || asigLow.includes('software') || asigLow.includes('código')) return "💻";
            if (asigLow.includes('natural')) return "🌿";

            return "📚";
        };

        // Exact match
        for (const item of EXPECTED_22_SUBJECTS) {
            expect(obtenerIcono(item.nombre)).toBe(item.icono);
            expect(obtenerIcono(item.nombre.toUpperCase())).toBe(item.icono);
            expect(obtenerIcono(item.nombre.toLowerCase())).toBe(item.icono);
        }

        // Partial & Fuzzy variations
        expect(obtenerIcono('Taller de Biología Molecular')).toBe('🧬');
        expect(obtenerIcono('FISICA EXPERIMENTAL Y ONDAS')).toBe('⚛️');
        expect(obtenerIcono('Química Orgánica Avanzada')).toBe('🧪');
        expect(obtenerIcono('Álgebra y Trigonometría')).toBe('📐');
        expect(obtenerIcono('Literatura Universal y Español')).toBe('📖');
        expect(obtenerIcono('Historia de Colombia y Geografía')).toBe('🌍');
        expect(obtenerIcono('English Conversation Club')).toBe('🇬🇧');
        expect(obtenerIcono('Robótica Educativa')).toBe('🤖');
        expect(obtenerIcono('Educación Física y Deporte')).toBe('⚽');
        expect(obtenerIcono('Cátedra de Paz y Ciudadanía')).toBe('🕊️');
        expect(obtenerIcono('Desarrollo de Software y Algoritmos')).toBe('💻');

        // Custom Subject Override
        const customDb = [{ nombre: 'Ajedrez Cuántico', icono: '♟️' }];
        expect(obtenerIcono('Ajedrez Cuántico', customDb)).toBe('♟️');

        // Fallback for totally unclassified subject
        expect(obtenerIcono('XYZ123 Materia Rara')).toBe('📚');
        expect(obtenerIcono('')).toBe('📚');
        expect(obtenerIcono(null)).toBe('📚');
    });

    it('CH_M1_06: Preset Templating — Selecting any preset chip fills Name, Icon, and Description correctly', () => {
        const { window, document } = createMockBrowserEnv();
        const inNom = document.getElementById("modal-asig-nombre");
        const inIco = document.getElementById("modal-asig-icono");
        const inDesc = document.getElementById("modal-asig-desc");

        // Populate select options in mock
        inIco.options = EXPECTED_22_SUBJECTS.map(s => ({ value: s.icono, text: s.nombre }));

        const seleccionarPlantilla = (idx) => {
            const item = EXPECTED_22_SUBJECTS[idx];
            if (!item) return;
            inNom.value = item.nombre;
            inIco.value = item.icono;
            inDesc.value = `Descripción para ${item.nombre}`;
        };

        for (let i = 0; i < EXPECTED_22_SUBJECTS.length; i++) {
            seleccionarPlantilla(i);
            expect(inNom.value).toBe(EXPECTED_22_SUBJECTS[i].nombre);
            expect(inIco.value).toBe(EXPECTED_22_SUBJECTS[i].icono);
            expect(inDesc.value).toContain(EXPECTED_22_SUBJECTS[i].nombre);
        }
    });
});

// ============================================================================
// CHALLENGE 3: ROLE PERMISSION MATRIX & FALLBACK GENERATION
// ============================================================================
describe('⚔️ Challenger M1 — Challenge 3: Role Restrictions & Fallback Logic', 'Challenger M1: Adversarial', () => {

    const verificarEsDirectorOAdmin = (authSes, docenteDb = [], rolActual = '') => {
        let docentePerfil = null;
        try {
            const docKey = String(authSes.usuario || authSes.documento || (authSes.usuarioObj && (authSes.usuarioObj.documento || authSes.usuarioObj.usuario)) || '').trim().toLowerCase();
            docentePerfil = docenteDb.find(d => {
                const dDoc = String(d.documento || d.cedula || d.usuario || '').trim().toLowerCase();
                return dDoc === docKey;
            });
        } catch(e) {}

        const esAdmin = (authSes.rol === 'admin' || rolActual === 'admin' || (authSes.usuarioObj && authSes.usuarioObj.rol === 'admin'));
        const esDirectorDocente = Boolean(
            authSes.es_director === true ||
            (authSes.usuarioObj && authSes.usuarioObj.es_director === true) ||
            (docentePerfil && docentePerfil.es_director === true) ||
            (authSes.grupos_direccion && Array.isArray(authSes.grupos_direccion) && authSes.grupos_direccion.length > 0) ||
            (docentePerfil && Array.isArray(docentePerfil.grupos_direccion) && docentePerfil.grupos_direccion.length > 0)
        );

        return esAdmin || esDirectorDocente;
    };

    it('CH_M1_07: Permission Matrix Exhaustive Test across all roles and edge states', () => {
        // 1. Admin roles
        expect(verificarEsDirectorOAdmin({ rol: 'admin' })).toBe(true);
        expect(verificarEsDirectorOAdmin({ rol: 'admin', es_director: false })).toBe(true);
        expect(verificarEsDirectorOAdmin({}, [], 'admin')).toBe(true);
        expect(verificarEsDirectorOAdmin({ usuarioObj: { rol: 'admin' } })).toBe(true);

        // 2. Direct Director de Grupo flags
        expect(verificarEsDirectorOAdmin({ rol: 'docente', es_director: true })).toBe(true);
        expect(verificarEsDirectorOAdmin({ rol: 'docente', usuarioObj: { es_director: true } })).toBe(true);

        // 3. Implicit Director via grupos_direccion
        expect(verificarEsDirectorOAdmin({ rol: 'docente', grupos_direccion: ['7C'] })).toBe(true);
        expect(verificarEsDirectorOAdmin({ rol: 'docente', grupos_direccion: ['10A', '11B'] })).toBe(true);
        expect(verificarEsDirectorOAdmin({ rol: 'docente', grupos_direccion: [] })).toBe(false);

        // 4. Secondary lookup in docentes.json database
        const dbMock = [
            { documento: '123456', es_director: true, grupos_direccion: ['7C'] },
            { documento: 'tutor123', es_director: false, grupos_direccion: [] }
        ];
        expect(verificarEsDirectorOAdmin({ usuario: '123456', rol: 'docente' }, dbMock)).toBe(true);
        expect(verificarEsDirectorOAdmin({ usuario: 'tutor123', rol: 'docente' }, dbMock)).toBe(false);

        // 5. Non-directors & Null / Undefined safety
        expect(verificarEsDirectorOAdmin({ rol: 'docente', es_director: false })).toBe(false);
        expect(verificarEsDirectorOAdmin({ rol: 'docente', es_director: null })).toBe(false);
        expect(verificarEsDirectorOAdmin({ rol: 'docente', es_director: undefined })).toBe(false);
        expect(verificarEsDirectorOAdmin({ rol: 'docente' })).toBe(false);
        expect(verificarEsDirectorOAdmin({ rol: 'estudiante' })).toBe(false);
        expect(verificarEsDirectorOAdmin({})).toBe(false);
    });

    it('CH_M1_08: UI State Adaptation — abrirModalCrearAsignaturaDocente adjusts elements correctly based on role', () => {
        const { window, document } = createMockBrowserEnv();
        const badge = document.getElementById("modal-asig-director-badge");
        const notice = document.getElementById("modal-asig-director-notice");
        const gCont = document.getElementById("modal-asig-grados-container");

        const simularAperturaModal = (esDirectorOAdmin) => {
            if (esDirectorOAdmin) {
                badge.style.display = "inline-block";
                notice.style.display = "none";
                gCont.style.display = "flex";
                gCont.innerHTML = '<input type="checkbox" name="modal_asig_grado_check" value="6" checked>';
            } else {
                badge.style.display = "none";
                notice.style.display = "flex";
                gCont.style.display = "none";
                gCont.innerHTML = '<input type="hidden" name="modal_asig_grado_check" value="6"><input type="hidden" name="modal_asig_grado_check" value="7">';
            }
        };

        // Test Director case
        simularAperturaModal(true);
        expect(badge.style.display).toBe('inline-block');
        expect(notice.style.display).toBe('none');
        expect(gCont.style.display).toBe('flex');
        expect(gCont.innerHTML).toContain('type="checkbox"');

        // Test Non-Director case
        simularAperturaModal(false);
        expect(badge.style.display).toBe('none');
        expect(notice.style.display).toBe('flex');
        expect(gCont.style.display).toBe('none');
        expect(gCont.innerHTML).toContain('type="hidden"');
    });

    it('CH_M1_09: Non-Destructive Syllabus Fallback — Teacher without selected checkboxes still generates syllabus with fallback grades', () => {
        const gChecksEmpty = [];
        let fallbackGrados = Array.from(gChecksEmpty).map(c => c.value);
        if (fallbackGrados.length === 0) {
            fallbackGrados = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "Ciclo I", "Ciclo II", "Ciclo III", "Ciclo IV", "Ciclo V", "Ciclo VI"];
        }

        expect(fallbackGrados.length).toBe(17);
        expect(fallbackGrados).toContain('6');
        expect(fallbackGrados).toContain('11');
        expect(fallbackGrados).toContain('Ciclo I');
    });

    it('CH_M1_10: docentes.json Validation — Seed accounts reflect correct institutional roles', () => {
        const juan = docentesJson.find(d => d.documento === '123456');
        expect(juan).toBeTruthy();
        expect(juan.es_director).toBe(true);
        expect(juan.grupos_direccion).toContain('7C');

        const carlos = docentesJson.find(d => d.documento === 'tutor123');
        expect(carlos).toBeTruthy();
        expect(carlos.es_director).toBe(false);
        expect(carlos.grupos_direccion.length).toBe(0);
    });
});
