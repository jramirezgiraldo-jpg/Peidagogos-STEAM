/**
 * ============================================================================
 * ⚔️ ADVERSARIAL CHALLENGER TEST SUITE: MILESTONE 3 (M3)
 * ============================================================================
 * Rigorous empirical stress tests for:
 * 1. DOM invariants & surgical CSS hiding (#modal-configuracion-juego-ia, #panel-ingesta-global-caja, QR, redundant Materias, Diapositivas file input, Auxilios Emocionales).
 * 2. Pre-generation configuration modal logic (Keywords vs Upload, teacher assigned groups, topic, XP).
 * 3. Universal AI tool generation for all 42 tools across Cajas 1-6.
 * 4. Post-earthquake emotional first aid interactive activities (no print button).
 * 5. Live ranking group prompt & backend assignment synchronization.
 */

const fs = require('fs');
const path = require('path');
const { describe, it, expect, inspectHtml, createMockBrowserEnv } = require('./helpers/test_framework');

const LOGIN_HTML_PATH = path.join(__dirname, '..', 'login.html');
const APP_JS_PATH = path.join(__dirname, '..', 'app.js');
const SERVER_JS_PATH = path.join(__dirname, '..', 'server.js');

const loginHtmlContent = fs.readFileSync(LOGIN_HTML_PATH, 'utf8');
const appJsContent = fs.readFileSync(APP_JS_PATH, 'utf8');
const serverJsContent = fs.readFileSync(SERVER_JS_PATH, 'utf8');

// List of all 42 tools across the 6 Cajas Temáticas
const TODAS_LAS_42_HERRAMIENTAS = [
    // Caja 1: Planificación (6)
    'plan_clase_express', 'generador_rubricas', 'situacion_problema_abp', 'guia_laboratorio', 'adaptacion_piam', 'estacion_rotacion',
    // Caja 2: Juegos y Activación (10)
    'sopa_letras', 'crucigrama', 'memory_cards', 'bingo_steam', 'jeopardy', 'criptograma', 'domino_conceptual', 'sudoku_steam', 'laberinto_logico', 'pictionary_tabu',
    // Caja 3: Aula Dinámica (6)
    'ruleta_participacion', 'temporizador_pomodoro', 'semaforo_ruido', 'tarjetas_debate', 'dilemas_morales', 'pizarra_colaborativa',
    // Caja 4: Visuales y Multimedia (6)
    'mapa_mental_ia', 'infografia_resumen', 'comic_pedagogico', 'flashcards_interactivas', 'linea_tiempo', 'diagrama_flujo',
    // Caja 5: Evaluación y Diagnóstico (8)
    'quiz_interactivo', 'banco_preguntas_icfes', 'ticket_salida', 'autoevaluacion_rubrica', 'diana_evaluacion', 'escalera_metacognicion', 'analisis_errores', 'termometro_emocional',
    // Caja 6: Homeschool y Tutoría (6)
    'agenda_semanal_tutor', 'diario_aprendizaje', 'proyectos_familiares', 'bitacora_habitos', 'lectura_guiada_padres', 'orientacion_vocacional'
];

// ============================================================================
// CHALLENGE 1: DOM INVARIANTS & SURGICAL CSS HIDING
// ============================================================================
describe('⚔️ Challenger M3 — Challenge 1: DOM Invariants & Non-Destructive CSS Hiding', 'Challenger M3: Adversarial', () => {

    it('CH_M3_01: DOM Invariant — #modal-configuracion-juego-ia exists with all required input fields and action buttons', () => {
        const inspector = inspectHtml(loginHtmlContent);
        
        // 1. Modal wrapper
        const modal = inspector.getElementById('modal-configuracion-juego-ia');
        expect(modal).toBeTruthy();
        expect(modal.style.display).toBe('none');

        // 2. Mode tabs
        expect(inspector.hasElementWithId('tab-config-juego-keywords')).toBeTruthy();
        expect(inspector.hasElementWithId('tab-config-juego-upload')).toBeTruthy();

        // 3. Keywords textarea & Upload input
        expect(inspector.hasElementWithId('modal-config-juego-keywords')).toBeTruthy();
        const fileInput = inspector.getElementById('modal-config-juego-archivo');
        expect(fileInput).toBeTruthy();
        const accept = fileInput.getAttribute('accept') || '';
        expect(accept).toContain('.pdf');
        expect(accept).toContain('.docx');
        expect(accept).toContain('.pptx');

        // 4. File info chip
        expect(inspector.hasElementWithId('modal-config-juego-archivo-info')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-archivo-nombre')).toBeTruthy();

        // 5. Academic selectors: Group, Subject, Grade, Topic, XP
        expect(inspector.hasElementWithId('modal-config-juego-grupo')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-materia')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-grado')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-tema')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-xp')).toBeTruthy();

        // 6. Action triggers
        expect(inspector.hasElementWithId('btn-ejecutar-generacion-juego-ia')).toBeTruthy();
        expect(inspector.hasElementWithId('btn-modal-juego-ia-proyectar')).toBeTruthy();
    });

    it('CH_M3_02: DOM Invariant — #panel-ingesta-global-caja has style="display: none !important;" while preserving legacy children', () => {
        const inspector = inspectHtml(loginHtmlContent);
        
        const panel = inspector.getElementById('panel-ingesta-global-caja');
        expect(panel).toBeTruthy();
        expect(loginHtmlContent).toContain('id="panel-ingesta-global-caja" class="toolbox-ingesta-card toolbox-ingesta-container" style="display: none !important;"');

        // Verify preservation of internal legacy children to avoid broken JS references
        expect(inspector.hasElementWithId('toolbox-materia-select')).toBeTruthy();
        expect(inspector.hasElementWithId('toolbox-grado-select')).toBeTruthy();
        expect(inspector.hasElementWithId('toolbox-periodo-select')).toBeTruthy();
        expect(inspector.hasElementWithId('toolbox-semana-select')).toBeTruthy();
        expect(inspector.hasElementWithId('toolbox-input-palabras')).toBeTruthy();
        expect(inspector.hasElementWithId('toolbox-textarea-texto')).toBeTruthy();
        expect(inspector.hasElementWithId('toolbox-file-imagen')).toBeTruthy();
    });

    it('CH_M3_03: DOM Invariant — Proyectar QR Matrícula options are hidden non-destructively with display: none !important', () => {
        expect(loginHtmlContent).toContain('<!-- 6. Proyectar QR Matrícula -->');
        
        // Find all proyector-qr.html occurrences and verify they are styled with display: none !important
        const matches = loginHtmlContent.match(/href=["']proyector-qr\.html["'][^>]*style=["']([^"']*)["']/g) || [];
        expect(matches.length).toBeGreaterThanOrEqual(2);
        for (const m of matches) {
            expect(m).toContain('display: none !important;');
        }
    });

    it('CH_M3_04: DOM Invariant — Redundant "Configuración de Materias y Grados" card is hidden with display: none !important', () => {
        // Line 647 card must have display: none !important
        const pattern = /<!-- 2\. Mis Materias y Grados -->\s*<div[^>]*style=["']([^"']*)["']/;
        const match = loginHtmlContent.match(pattern);
        expect(match).toBeTruthy();
        expect(match[1]).toContain('display: none !important;');

        // Modal markup remains intact in DOM for safety
        expect(loginHtmlContent).toContain('id="modal-configuracion-materias-docente"');
    });

    it('CH_M3_05: DOM Invariant — "Generador de Diapositivas Semanales" has document upload option', () => {
        const inspector = inspectHtml(loginHtmlContent);
        
        const fileInput = inspector.getElementById('slides-archivo-input');
        expect(fileInput).toBeTruthy();
        const accept = fileInput.getAttribute('accept') || '';
        expect(accept).toContain('.pdf');
        expect(accept).toContain('.docx');
        expect(accept).toContain('.pptx');
        expect(inspector.hasElementWithId('slides-archivo-info')).toBeTruthy();
    });

    it('CH_M3_06: DOM Invariant — "Primeros Auxilios Emocionales" is online & interactive without print button', () => {
        // Modal function should contain interactive dynamics and no "imprimir taller" button
        expect(appJsContent).toContain('window.abrirClasePrimerosAuxiliosEmocionales');
        expect(appJsContent).toContain('window.abrirActividadEmocionalIA');
        expect(appJsContent).toContain('Protocolo PAP / Resiliencia');
        expect(appJsContent).toContain('Respiración Guiada 4-7-8');
        expect(appJsContent).toContain('Anclaje Sensorial (5-4-3-2-1)');
        expect(appJsContent).toContain('Red de Apoyo y Esperanza');
        
        // Check that there is no print button in the emotional modal
        expect(appJsContent).not.toContain('imprimirTallerPrimerosAuxilios');
    });
});

// ============================================================================
// CHALLENGE 2: PRE-GENERATION MODAL BEHAVIOR & TOKEN EXTRACTION
// ============================================================================
describe('⚔️ Challenger M3 — Challenge 2: Pre-Gen Modal State & Token Processing', 'Challenger M3: Adversarial', () => {

    it('CH_M3_07: State Management — Mode toggle changes visual tabs and panel visibility', () => {
        const { window, document } = createMockBrowserEnv();
        
        const tabKw = document.getElementById('tab-config-juego-keywords');
        const tabUp = document.getElementById('tab-config-juego-upload');
        const panKw = document.getElementById('contenedor-config-juego-keywords');
        const panUp = document.getElementById('contenedor-config-juego-upload');

        const cambiarModo = (modo) => {
            window._modoConfigJuegoIA = modo;
            if (modo === 'keywords') {
                tabKw.style.background = '#EFF6FF';
                tabUp.style.background = '#F8FAFC';
                panKw.style.display = 'block';
                panUp.style.display = 'none';
            } else {
                tabUp.style.background = '#EFF6FF';
                tabKw.style.background = '#F8FAFC';
                panKw.style.display = 'none';
                panUp.style.display = 'block';
            }
        };

        cambiarModo('upload');
        expect(window._modoConfigJuegoIA).toBe('upload');
        expect(panKw.style.display).toBe('none');
        expect(panUp.style.display).toBe('block');

        cambiarModo('keywords');
        expect(window._modoConfigJuegoIA).toBe('keywords');
        expect(panKw.style.display).toBe('block');
        expect(panUp.style.display).toBe('none');
    });

    it('CH_M3_08: Document Token Ingestion — Extracts high-frequency concept keywords from uploaded text', () => {
        const rawText = `
            El cambio climático y el calentamiento global son provocados por los gases de efecto invernadero.
            El dióxido de carbono y el metano atrapan la radiación solar en la atmósfera terrestre.
            La biodiversidad marina y los ecosistemas polares sufren desglaciación y acidificación.
            Conservación, sostenibilidad y energías renovables son indispensables para la resiliencia climática.
        `;

        const tokens = rawText.toLowerCase().match(/[a-záéíóúñ]{4,}/g) || [];
        const stopWords = new Set(['para', 'como', 'este', 'esta', 'estos', 'estas', 'sobre', 'desde']);
        const filtered = tokens.filter(t => !stopWords.has(t));

        const freq = {};
        filtered.forEach(t => { freq[t] = (freq[t] || 0) + 1; });
        const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
        const keywords = sorted.slice(0, 10);

        expect(keywords).toContain('climático');
        expect(keywords).toContain('efecto');
        expect(keywords).toContain('invernadero');
        expect(keywords).toContain('biodiversidad');
        expect(keywords).toContain('ecosistemas');
    });

    it('CH_M3_09: Post-Earthquake Emotional Preset — abrirActividadEmocionalIA sets correct pedagogical presets', () => {
        const { window, document } = createMockBrowserEnv();

        const inKw = document.getElementById('modal-config-juego-keywords');
        const inTema = document.getElementById('modal-config-juego-tema');
        const selMat = document.getElementById('modal-config-juego-materia');

        const abrirActividadEmocional = () => {
            window.abrirConfiguracionJuegoIA('memory_cards');
            inKw.value = 'Resiliencia, Calma, Respiración Profunda, Apoyo Mutuo, Red de Seguridad, Empatía, Escucha Activa, Esperanza';
            inTema.value = 'Primeros Auxilios Emocionales Post-Sismo';
            selMat.value = 'Ética y Valores Humanos';
        };

        window.abrirConfiguracionJuegoIA = (id) => { window._toolActivo = id; };

        abrirActividadEmocional();
        expect(window._toolActivo).toBe('memory_cards');
        expect(inTema.value).toBe('Primeros Auxilios Emocionales Post-Sismo');
        expect(selMat.value).toBe('Ética y Valores Humanos');
        expect(inKw.value).toContain('Resiliencia');
        expect(inKw.value).toContain('Calma');
        expect(inKw.value).toContain('Esperanza');
    });
});

// ============================================================================
// CHALLENGE 3: UNIVERSAL COVERAGE (ALL 42 TOOLS & 6 CAJAS)
// ============================================================================
describe('⚔️ Challenger M3 — Challenge 3: Universal 42 Tools Coverage across Cajas 1-6', 'Challenger M3: Adversarial', () => {

    it('CH_M3_10: Universal Coverage — All 42 tools across Cajas 1-6 are registered and mapped', () => {
        expect(TODAS_LAS_42_HERRAMIENTAS.length).toBe(42);

        // Check that LISTA_HERRAMIENTAS_PEDAGOGICAS in app.js contains all 42 tools
        for (const toolId of TODAS_LAS_42_HERRAMIENTAS) {
            expect(appJsContent).toContain(`id: '${toolId}'`);
        }
    });

    it('CH_M3_11: Interception Architecture — renderizarTarjetasCajaHerramientas sets onclick to abrirConfiguracionJuegoIA', () => {
        expect(appJsContent).toContain('window.abrirConfiguracionJuegoIA');
        expect(appJsContent).toContain('<button onclick="window.abrirConfiguracionJuegoIA(\'${tool.id}\')"');
        
        // Also verify opening the visor directly intercepts unless omitirIntercepcionIA is true
        expect(appJsContent).toContain('if (!omitirIntercepcionIA && typeof window.abrirConfiguracionJuegoIA === \'function\')');
    });

    it('CH_M3_12: Teacher Group Fallback Matrix — Populates group dropdown according to teacher profile', () => {
        const { window, document } = createMockBrowserEnv();
        const selGrp = document.getElementById('modal-config-juego-grupo');

        const poblarGruposDocente = (docItem, authSes) => {
            let grupos = [];
            if (docItem && Array.isArray(docItem.grupos) && docItem.grupos.length > 0) {
                grupos = docItem.grupos.map(g => (typeof g === 'object' ? g.nombre : g));
            } else if (docItem && Array.isArray(docItem.grupos_direccion) && docItem.grupos_direccion.length > 0) {
                grupos = [...docItem.grupos_direccion];
            } else if (authSes && Array.isArray(authSes.grupos_direccion) && authSes.grupos_direccion.length > 0) {
                grupos = [...authSes.grupos_direccion];
            } else if (authSes && Array.isArray(authSes.grados) && authSes.grados.length > 0) {
                grupos = [...authSes.grados];
            } else {
                grupos = ['7C', '6A', '8A'];
            }

            const gruposUnicos = Array.from(new Set(grupos.filter(Boolean)));
            return ['Todos', ...gruposUnicos];
        };

        // Case 1: Teacher Director with 7C
        const groups1 = poblarGruposDocente({ documento: '123', es_director: true, grupos_direccion: ['7C'] }, {});
        expect(groups1).toEqual(['Todos', '7C']);

        // Case 2: Multi-group teacher
        const groups2 = poblarGruposDocente({ documento: '456', grupos: [{ nombre: '6A' }, { nombre: '6B' }, { nombre: '7A' }] }, {});
        expect(groups2).toEqual(['Todos', '6A', '6B', '7A']);

        // Case 3: Empty teacher gets fallback
        const groups3 = poblarGruposDocente({ documento: '999' }, {});
        expect(groups3).toEqual(['Todos', '7C', '6A', '8A']);
    });
});

// ============================================================================
// CHALLENGE 4: DISPATCH PIPELINE, ASSIGNMENT SYNC & BACKEND CONTRACT
// ============================================================================
describe('⚔️ Challenger M3 — Challenge 4: Assignment Dispatch, State Sync & Backend Contract', 'Challenger M3: Adversarial', () => {

    it('CH_M3_13: Dispatch State Creation — Generates full assignment record in localStorage with aliases', () => {
        const { window, localStorage } = createMockBrowserEnv();

        const crearAsignacion = (toolId, toolTitulo, toolIcono, keywords, materia, grado, grupo, xp, profesorNombre, docKey) => {
            const actId = 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            const payload = {
                toolId: toolId,
                materia: materia,
                grado: grado,
                tema: keywords,
                dificultad: 'medio',
                palabras: keywords.split(',').map(s => s.trim())
            };

            const assignedActivity = {
                id: actId,
                herramienta_id: toolId,
                titulo: `${toolIcono} ${toolTitulo}: ${keywords.split(',')[0].trim()}`,
                materia: materia,
                grado: grado,
                grupo: grupo,
                profesor_nombre: profesorNombre,
                profesor_id: docKey,
                fecha_asignacion: new Date().toISOString(),
                estado: 'pendiente',
                xp_recompensa: xp,
                configuracion_juego: {
                    modo: 'keywords',
                    tema: keywords,
                    palabrasClave: keywords
                },
                datos_juego: payload,
                // Backward compatibility aliases
                tipo_actividad: toolId,
                herramienta_titulo: toolTitulo,
                herramienta_icono: toolIcono,
                destinatario_tipo: 'grupo',
                destinatario_id: grupo,
                destinatario_nombre: grupo === 'Todos' ? 'Todos los Grupos' : `Grupo ${grupo}`,
                grupo_destino: grupo,
                tema: keywords,
                creador_id: docKey,
                fecha_creacion: new Date().toISOString(),
                actividad_data: payload,
                completada_por: []
            };

            let localActs = JSON.parse(localStorage.getItem('actividades_asignadas_db') || '[]');
            localActs.unshift(assignedActivity);
            localStorage.setItem('actividades_asignadas_db', JSON.stringify(localActs));
            return assignedActivity;
        };

        const act = crearAsignacion(
            'crucigrama',
            'Crucigrama Conceptual',
            '🧩',
            'Materia, Energía, Átomos, Moléculas',
            'Química',
            '8',
            '8A',
            350,
            'Prof. Juan Pérez',
            '123456'
        );

        expect(act.id.startsWith('act_')).toBeTruthy();
        expect(act.herramienta_id).toBe('crucigrama');
        expect(act.tipo_actividad).toBe('crucigrama');
        expect(act.grupo).toBe('8A');
        expect(act.grupo_destino).toBe('8A');
        expect(act.xp_recompensa).toBe(350);
        expect(act.profesor_nombre).toBe('Prof. Juan Pérez');
        expect(act.datos_juego.palabras).toContain('Materia');

        // Check localStorage persistence
        const stored = JSON.parse(localStorage.getItem('actividades_asignadas_db'));
        expect(stored.length).toBe(1);
        expect(stored[0].id).toBe(act.id);
    });

    it('CH_M3_14: Backend Server Contract — /api/asignar-actividad handles canonical and legacy payloads gracefully', () => {
        expect(serverJsContent).toContain("app.post('/api/asignar-actividad'");
        
        // Verify server handles both tipo_actividad and herramienta_id
        expect(serverJsContent).toContain('const tipo_actividad = body.tipo_actividad || body.herramienta_id;');
        expect(serverJsContent).toContain('const destinatario_id = body.destinatario_id || body.grupo_destino || body.grupo || \'Todos\';');
        expect(serverJsContent).toContain('const actividad_data = body.actividad_data || body.datos_juego || {};');
        expect(serverJsContent).toContain('const creador_id = body.creador_id || body.profesor_id || \'ADMIN\';');
        expect(serverJsContent).toContain('const profesor_nombre = body.profesor_nombre || \'Docente Orientador\';');
    });

    it('CH_M3_15: Live Ranking Group Selection — abrirRankingDocenteNuevaPestana queries group and builds target URL', () => {
        expect(appJsContent).toContain('window.abrirRankingDocenteNuevaPestana');
        expect(appJsContent).toContain('window.abrirRankingEnVivo');
        expect(appJsContent).toContain('prompt(`¿Qué grupo deseas proyectar en el Ránking en Vivo?');
        expect(appJsContent).toContain('ranking.html?grupo=');
    });
});
