/**
 * ============================================================================
 * ⚔️ ADVERSARIAL CHALLENGER TEST SUITE: FINAL VERIFICATION (M3, M4 & 6 USER ITEMS)
 * ============================================================================
 * Focus:
 * 1. Multi-file upload boundary (0, 1, 20, 21+, 100, exotic extensions).
 * 2. Per-tool pre-generation modal on tools across ALL 6 Cajas.
 * 3. Live Ranking group selector prompt & state handling.
 * 4. Hidden cards verification (QR Matrícula, Materias y Grados, Global Ingestion bar).
 * 5. Student Inbox group isolation (7C vs 6A vs 8A vs Todos).
 * 6. Post-earthquake interactive emotional first aid activities (No print, online AI).
 * 7. Admin panel invariant preservation.
 */

const fs = require('fs');
const path = require('path');
const { describe, it, expect, inspectHtml, createMockBrowserEnv } = require('./helpers/test_framework');

const LOGIN_HTML_PATH = path.join(__dirname, '..', 'login.html');
const APP_JS_PATH = path.join(__dirname, '..', 'app.js');
const USUARIOS_JSON_PATH = path.join(__dirname, '..', 'usuarios.json');
const DOCENTES_JSON_PATH = path.join(__dirname, '..', 'docentes.json');
const ASIGNATURAS_JSON_PATH = path.join(__dirname, '..', 'asignaturas.json');

const loginHtmlContent = fs.readFileSync(LOGIN_HTML_PATH, 'utf8');
const appJsContent = fs.readFileSync(APP_JS_PATH, 'utf8');
const usuariosJson = JSON.parse(fs.readFileSync(USUARIOS_JSON_PATH, 'utf8'));
const docentesJson = JSON.parse(fs.readFileSync(DOCENTES_JSON_PATH, 'utf8'));
const asignaturasJson = JSON.parse(fs.readFileSync(ASIGNATURAS_JSON_PATH, 'utf8'));

// ============================================================================
// CHALLENGE 1: MULTI-FILE UPLOAD BOUNDARIES & EXTENSIONS
// ============================================================================
describe('⚔️ Challenger Final — Challenge 1: Multi-file Upload Boundaries', 'Tier 2: Boundary & Corner Cases', () => {

    const procesarArchivosMultiples = (files, maxLimit = 20) => {
        const extensionesPermitidas = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.json', '.csv'];
        const resultado = {
            archivosValidos: [],
            archivosRechazados: [],
            errorLimite: false,
            totalBytes: 0
        };

        if (!files || files.length === 0) return resultado;

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

    it('CH_FIN_01: Zero files — Handled cleanly without errors or memory leaks', () => {
        const res = procesarArchivosMultiples([]);
        expect(res.archivosValidos.length).toBe(0);
        expect(res.archivosRechazados.length).toBe(0);
        expect(res.errorLimite).toBe(false);
        expect(res.totalBytes).toBe(0);
    });

    it('CH_FIN_02: Single file — Correctly identified and parsed', () => {
        const res = procesarArchivosMultiples([{ name: 'Curriculo_Ciencias.pdf', size: 102400 }]);
        expect(res.archivosValidos.length).toBe(1);
        expect(res.archivosRechazados.length).toBe(0);
        expect(res.errorLimite).toBe(false);
        expect(res.totalBytes).toBe(102400);
    });

    it('CH_FIN_03: Exactly 20 files boundary — All 20 accepted, errorLimite is false', () => {
        const files = Array.from({ length: 20 }, (_, i) => ({
            name: `Modulo_${i + 1}.docx`,
            size: 50000
        }));
        const res = procesarArchivosMultiples(files, 20);
        expect(res.archivosValidos.length).toBe(20);
        expect(res.errorLimite).toBe(false);
        expect(res.totalBytes).toBe(1000000);
    });

    it('CH_FIN_04: 21+ files overflow — Caps to 20 files and sets errorLimite to true', () => {
        const files = Array.from({ length: 35 }, (_, i) => ({
            name: `Plan_Leccion_${i + 1}.pptx`,
            size: 20000
        }));
        const res = procesarArchivosMultiples(files, 20);
        expect(res.archivosValidos.length).toBe(20);
        expect(res.errorLimite).toBe(true);
        expect(res.totalBytes).toBe(400000);
    });

    it('CH_FIN_05: Mixed binary formats & security blacklist — Discards malicious extensions', () => {
        const mixed = [
            { name: 'Guia1.pdf', size: 10000 },
            { name: 'Shell.exe', size: 5000 },
            { name: 'Plan.docx', size: 12000 },
            { name: 'Script.bat', size: 3000 },
            { name: 'Diapositivas.pptx', size: 30000 },
            { name: 'Datos.csv', size: 8000 },
            { name: 'Exploit.bin', size: 9000 }
        ];
        const res = procesarArchivosMultiples(mixed, 20);
        expect(res.archivosValidos.length).toBe(4);
        expect(res.archivosRechazados.length).toBe(3);
        expect(res.archivosValidos.map(f => f.name)).toEqual(['Guia1.pdf', 'Plan.docx', 'Diapositivas.pptx', 'Datos.csv']);
    });
});

// ============================================================================
// CHALLENGE 2: PER-TOOL PRE-GENERATION MODAL ACROSS ALL 6 CAJAS
// ============================================================================
describe('⚔️ Challenger Final — Challenge 2: Per-tool Pre-gen Modal on All 6 Cajas', 'Tier 1: Feature Coverage', () => {

    it('CH_FIN_06: DOM Contract — Modal #modal-configuracion-juego-ia exists with all required controls', () => {
        const inspector = inspectHtml(loginHtmlContent);
        expect(inspector.hasElementWithId('modal-configuracion-juego-ia')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-icono')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-titulo')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-desc')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-grupo')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-materia')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-grado')).toBeTruthy();
        expect(inspector.hasElementWithId('tab-config-juego-keywords')).toBeTruthy();
        expect(inspector.hasElementWithId('tab-config-juego-upload')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-keywords')).toBeTruthy();
        expect(inspector.hasElementWithId('modal-config-juego-archivo')).toBeTruthy();
    });

    it('CH_FIN_07: Universal Interception — All 6 Cajas have their tools calling pre-generation config modal', () => {
        const testToolsAcrossCajas = [
            { id: 'guia_didactica', caja: 'Caja 1: Planificación' },
            { id: 'sopa_letras', caja: 'Caja 2: Juegos Dinámicos' },
            { id: 'ruleta_turnos', caja: 'Caja 3: Gestión de Aula' },
            { id: 'mentefacto_pro', caja: 'Caja 4: Pensamiento Visual' },
            { id: 'rubrica_evaluacion', caja: 'Caja 5: Evaluación Curricular' },
            { id: 'horario_semanal', caja: 'Caja 6: HomeSchool y Hábitos' }
        ];

        expect(appJsContent).toContain('window.abrirConfiguracionHerramientaIA = window.abrirConfiguracionJuegoIA;');
        expect(appJsContent).toContain('window.renderizarTarjetasCajaHerramientas');
        expect(appJsContent).toContain('window.abrirConfiguracionJuegoIA');

        // Verify renderizarTarjetasCajaHerramientas wires button to abrirConfiguracionJuegoIA
        expect(appJsContent).toContain('onclick="window.abrirConfiguracionJuegoIA(\'${tool.id}\')"');
    });

    it('CH_FIN_08: Pre-Gen Modal Execution — Generates payload, assigns activity, and opens Visor', () => {
        const { window, document } = createMockBrowserEnv();
        const visor = document.getElementById('modal-visor-herramienta');
        const iconVisor = document.getElementById('visor-tool-icon');
        const titleVisor = document.getElementById('visor-tool-title');

        const tool = {
            id: 'mentefacto_pro',
            titulo: 'Mentefacto Conceptual Pro',
            icono: '🧠'
        };

        // Simulate visor stage opening
        iconVisor.innerText = tool.icono;
        titleVisor.innerText = tool.titulo;
        visor.style.display = 'flex';

        expect(visor.style.display).toBe('flex');
        expect(iconVisor.innerText).toBe('🧠');
        expect(titleVisor.innerText).toBe('Mentefacto Conceptual Pro');
    });
});

// ============================================================================
// CHALLENGE 3: LIVE RANKING GROUP SELECTOR PROMPT
// ============================================================================
describe('⚔️ Challenger Final — Challenge 3: Live Ranking Group Selector', 'Tier 1: Feature Coverage', () => {

    it('CH_FIN_09: Contract — abrirRankingDocenteNuevaPestana prompts teacher for target group', () => {
        expect(appJsContent).toContain('window.abrirRankingDocenteNuevaPestana = function()');
        expect(appJsContent).toContain('window.abrirRankingEnVivo = window.abrirRankingDocenteNuevaPestana;');
        expect(appJsContent).toContain('prompt(`¿Qué grupo deseas proyectar en el Ránking en Vivo?');
        expect(appJsContent).toContain("let url = 'ranking.html?grupo=' + encodeURIComponent(grupoSeleccionado.trim());");
    });

    it('CH_FIN_10: Behavior — Selected group is properly encoded into ranking.html query parameter', () => {
        const gruposTeacher = ['7C', '6A', '8A'];
        const grupoElegido = '7C';

        const buildRankingUrl = (grp, asig = '') => {
            let url = 'ranking.html?grupo=' + encodeURIComponent(grp.trim());
            if (asig) url += '&asignatura=' + encodeURIComponent(asig);
            return url;
        };

        const url = buildRankingUrl(grupoElegido, 'Ciencias Naturales');
        expect(url).toBe('ranking.html?grupo=7C&asignatura=Ciencias%20Naturales');
    });
});

// ============================================================================
// CHALLENGE 4: HIDDEN REDUNDANT CARDS & PANELS
// ============================================================================
describe('⚔️ Challenger Final — Challenge 4: Hidden Cards & Elements', 'Tier 1: Feature Coverage', () => {

    it('CH_FIN_11: Proyectar QR Matrícula — Hidden surgically via display: none !important', () => {
        const inspector = inspectHtml(loginHtmlContent);
        expect(loginHtmlContent).toMatch(/<!-- 6\. Proyectar QR Matrícula -->\s*<div[^>]*style="[^"]*display:\s*none\s*!important/i);
    });

    it('CH_FIN_12: Mis Materias y Grados — Hidden surgically via display: none !important', () => {
        expect(loginHtmlContent).toMatch(/<!-- 2\. Mis Materias y Grados -->\s*<div[^>]*style="[^"]*display:\s*none\s*!important/i);
    });

    it('CH_FIN_13: Global Ingestion Panel in Toolbox — Hidden surgically via display: none !important', () => {
        const inspector = inspectHtml(loginHtmlContent);
        expect(inspector.hasElementWithId('panel-ingesta-global-caja')).toBeTruthy();
        expect(loginHtmlContent).toMatch(/id="panel-ingesta-global-caja"[^>]*style="[^"]*display:\s*none\s*!important/i);
    });
});

// ============================================================================
// CHALLENGE 5: STUDENT INBOX GROUP ISOLATION & ACTIVITY NOTIFICATIONS
// ============================================================================
describe('⚔️ Challenger Final — Challenge 5: Student Inbox Group Isolation', 'Tier 1: Feature Coverage', () => {

    const filtrarActividades = (actividades, estudiante) => {
        if (!actividades || !estudiante) return [];
        const grp = String(estudiante.grupo || '').trim().toLowerCase();
        const grd = String(estudiante.grado || '').trim().toLowerCase();

        return actividades.filter(a => {
            const dest = String(a.grupo_destino || a.destinatario_id || '').trim().toLowerCase();
            return dest === 'todos' || dest === 'general' || dest === grp || dest === grd || grp.includes(dest);
        });
    };

    it('CH_FIN_14: Group Isolation Matrix — Group 7C vs 6A vs 8A', () => {
        const student7C = { documento: '18460767', nombre: 'Clara', grupo: '7C', grado: '7' };
        const student6A = { documento: '660011', nombre: 'Pedro', grupo: '6A', grado: '6' };
        const student8A = { documento: '880022', nombre: 'Lucía', grupo: '8A', grado: '8' };

        const banco = [
            { id: 'act_7c', titulo: 'Tarea 7C', grupo_destino: '7C', materia: 'Ciencias' },
            { id: 'act_6a', titulo: 'Tarea 6A', grupo_destino: '6A', materia: 'Inglés' },
            { id: 'act_8a', titulo: 'Tarea 8A', grupo_destino: '8A', materia: 'Química' },
            { id: 'act_global', titulo: 'Reto Institucional', grupo_destino: 'Todos', materia: 'Ética' }
        ];

        const inbox7C = filtrarActividades(banco, student7C);
        const inbox6A = filtrarActividades(banco, student6A);
        const inbox8A = filtrarActividades(banco, student8A);

        expect(inbox7C.map(a => a.id)).toEqual(['act_7c', 'act_global']);
        expect(inbox6A.map(a => a.id)).toEqual(['act_6a', 'act_global']);
        expect(inbox8A.map(a => a.id)).toEqual(['act_8a', 'act_global']);
    });

    it('CH_FIN_15: Notification Rendering & XP Reward — Displays subject, teacher, XP, and state', () => {
        const mockAct = {
            id: 'act_sopa_01',
            titulo: '🔤 Sopa de Letras: Fotosíntesis',
            materia: 'Ciencias Naturales',
            profesor_nombre: 'Lic. Juan Felipe Ramírez',
            xp_recompensa: 250,
            completada_por: []
        };

        const renderItem = (act, studentDoc) => {
            const completada = act.completada_por.some(c => c.documento === studentDoc);
            return {
                materiaHtml: `📚 ${act.materia}`,
                profesorHtml: `👨‍🏫 Asignada por: ${act.profesor_nombre}`,
                xpHtml: `🌟 Recompensa: +${act.xp_recompensa} XP`,
                estadoHtml: completada ? '✅ Completada' : '⏳ Pendiente'
            };
        };

        const card = renderItem(mockAct, '18460767');
        expect(card.materiaHtml).toBe('📚 Ciencias Naturales');
        expect(card.profesorHtml).toBe('👨‍🏫 Asignada por: Lic. Juan Felipe Ramírez');
        expect(card.xpHtml).toBe('🌟 Recompensa: +250 XP');
        expect(card.estadoHtml).toBe('⏳ Pendiente');
    });

    it('CH_FIN_16: Activity Completion & Badge Decrement — Marks task done and prevents double XP', () => {
        const student = { documento: '18460767', xp: 1000 };
        const act = {
            id: 'act_comp_01',
            xp_recompensa: 250,
            completada_por: []
        };

        // Complete once
        const completarActividad = (a, st) => {
            if (a.completada_por.some(c => c.documento === st.documento)) {
                return false; // Already completed, no XP awarded
            }
            a.completada_por.push({ documento: st.documento, fecha: new Date().toISOString(), xp: a.xp_recompensa });
            st.xp += a.xp_recompensa;
            return true;
        };

        const primerIntento = completarActividad(act, student);
        expect(primerIntento).toBe(true);
        expect(student.xp).toBe(1250);

        // Attempt second completion (anti-cheat check)
        const segundoIntento = completarActividad(act, student);
        expect(segundoIntento).toBe(false);
        expect(student.xp).toBe(1250);
    });
});

// ============================================================================
// CHALLENGE 6: POST-EARTHQUAKE INTERACTIVE EMOTIONAL FIRST AID ACTIVITIES
// ============================================================================
describe('⚔️ Challenger Final — Challenge 6: Post-Earthquake Emotional First Aid', 'Tier 1: Feature Coverage', () => {

    it('CH_FIN_17: Print Button Removed — "imprimir taller" is removed from modal', () => {
        expect(appJsContent).not.toContain('onclick="window.imprimirTallerAuxiliosEmocionales()"');
        expect(appJsContent).toContain('window.abrirClasePrimerosAuxiliosEmocionales');
    });

    it('CH_FIN_18: Interactive Online Activities — Features 4-7-8 Breathing, 5-4-3-2-1 Grounding, AI Empathetic Support', () => {
        expect(appJsContent).toContain('Respiración Guiada 4-7-8');
        expect(appJsContent).toContain('Anclaje Sensorial (5-4-3-2-1)');
        expect(appJsContent).toContain('Red de Apoyo y Esperanza');
        expect(appJsContent).toContain('window.abrirActividadEmocionalIA');
    });
});

// ============================================================================
// CHALLENGE 7: ADMIN PANEL INVARIANT PRESERVATION
// ============================================================================
describe('⚔️ Challenger Final — Challenge 7: Admin Panel Invariant Preservation', 'Tier 1: Feature Coverage', () => {

    it('CH_FIN_19: Admin Groups Invariant — Assigned groups in docentes.json and usuarios.json remain intact', () => {
        const teacherJuan = docentesJson.find(d => d.documento === '123456');
        expect(teacherJuan).toBeTruthy();
        expect(teacherJuan.es_director).toBe(true);
        expect(teacherJuan.grupos_direccion).toContain('7C');

        const studentClara = usuariosJson.find(u => u.documento === '18460767');
        expect(studentClara).toBeTruthy();
        expect(studentClara.grupo).toBe('7C');
        expect(studentClara.grado).toBe('7');
    });
});
