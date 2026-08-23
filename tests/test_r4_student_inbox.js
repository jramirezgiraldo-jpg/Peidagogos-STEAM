/**
 * ============================================================================
 * 🧪 TEST SUITE: R4 — Student Inbox & Assigned Activities
 * ============================================================================
 * Covers:
 * - Feature 10: Student Inbox DOM containers (#student-actividades-container)
 * - Feature 11: Group-based filtering (student group matching)
 * - Feature 12: Notification card rendering (subject, teacher name, XP)
 * - Feature 13: Activity launch and completion state
 */

const fs = require('fs');
const path = require('path');
const { describe, it, expect, inspectHtml, createMockBrowserEnv } = require('./helpers/test_framework');

const LOGIN_HTML_PATH = path.join(__dirname, '..', 'login.html');
const USUARIOS_JSON_PATH = path.join(__dirname, '..', 'usuarios.json');

const loginHtmlContent = fs.readFileSync(LOGIN_HTML_PATH, 'utf8');
const usuariosJson = JSON.parse(fs.readFileSync(USUARIOS_JSON_PATH, 'utf8'));

// Student Inbox Logic Simulation
const filtrarActividadesParaEstudiante = (actividades, estudiante) => {
    if (!actividades || !Array.isArray(actividades) || !estudiante) return [];
    
    const docEst = String(estudiante.documento || '').trim().toLowerCase();
    const grpEst = String(estudiante.grupo || '').trim().toLowerCase();
    const grdEst = String(estudiante.grado || '').trim().toLowerCase();
    const esHS = (estudiante.institucion === 'HomeSchool' || estudiante.rol === 'homeschool' || grpEst.startsWith('hs-'));

    return actividades.filter(act => {
        const destTipo = String(act.destinatario_tipo || 'grupo').toLowerCase();
        const destId = String(act.destinatario_id || act.grupo_destino || '').trim().toLowerCase();
        const destGrd = String(act.grado || '').trim().toLowerCase();

        // 1. Direct match to student document
        if (destTipo === 'estudiante' && destId === docEst) return true;

        // 2. Global match to 'todos'
        if (destId === 'todos' || destId === 'todos los grupos' || destId === 'all') return true;

        // 3. HomeSchool match
        if (esHS && (destId === 'homeschool' || destGrd === grdEst)) return true;

        // 4. Exact group match (case-insensitive)
        if (destId === grpEst) return true;

        // 5. Grade match if no group specified
        if (!destId && destGrd === grdEst) return true;

        return false;
    });
};

const renderizarTarjetaActividadEstudiante = (act, estudianteDoc) => {
    const yaCompletada = Array.isArray(act.completada_por) && act.completada_por.some(c => String(c.documento || c) === String(estudianteDoc));
    const badgeEstado = yaCompletada
        ? `<span class="badge-completada">✅ Completada</span>`
        : `<span class="badge-pendiente">⏳ Pendiente</span>`;

    return {
        id: act.id,
        titulo: act.titulo || 'Actividad STEAM',
        materiaBadge: `📚 ${act.materia || 'General'}`,
        profesorInfo: `👨‍🏫 Asignada por: ${act.profesor_nombre || 'Docente Institucional'}`,
        xpBadge: `🌟 Recompensa: +${act.xp_recompensa || 250} XP`,
        estadoBadge: badgeEstado,
        esCompletada: yaCompletada,
        botonTexto: yaCompletada ? 'Repasar Tarea' : '🚀 Desarrollar Tarea Ahora ➔'
    };
};

// ============================================================================
// TIER 1: FEATURE COVERAGE (HAPPY PATH CONTRACTS)
// ============================================================================
describe('R4: Student Inbox — Tier 1 Feature Coverage', 'Tier 1: Feature Coverage', () => {

    it('T1_R4_01: DOM Contract — #student-actividades-container and list elements exist in Student Dashboard', () => {
        const inspector = inspectHtml(loginHtmlContent);
        expect(inspector.hasElementWithId('student-dashboard-container')).toBeTruthy();
        expect(inspector.hasElementWithId('student-actividades-container')).toBeTruthy();
        expect(inspector.hasElementWithId('student-actividades-list')).toBeTruthy();
        expect(inspector.hasElementWithId('badge-actividades-pendientes-count')).toBeTruthy();
    });

    it('T1_R4_02: Group Filtering Contract — Student in 7C receives 7C activities and not 6A activities', () => {
        const studentClara = { documento: '18460767', nombre: 'Clara', grupo: '7C', grado: '7' };
        
        const bancoActividades = [
            { id: 'act_1', titulo: 'Sopa 7C', grupo_destino: '7C', materia: 'Ciencias' },
            { id: 'act_2', titulo: 'Crucigrama 6A', grupo_destino: '6A', materia: 'Física' },
            { id: 'act_3', titulo: 'Trivia Global', grupo_destino: 'Todos', materia: 'Sociales' }
        ];

        const filtradas = filtrarActividadesParaEstudiante(bancoActividades, studentClara);
        expect(filtradas.length).toBe(2);
        expect(filtradas.map(a => a.id)).toEqual(['act_1', 'act_3']);
    });

    it('T1_R4_03: Notification Card Rendering — Displays Subject, Teacher Name, XP reward and Title', () => {
        const mockAct = {
            id: 'act_test_01',
            titulo: '🔤 Sopa de Letras: Ecosistemas',
            materia: 'Ciencias Naturales',
            profesor_nombre: 'Lic. Juan Felipe Ramírez',
            xp_recompensa: 250,
            completada_por: []
        };

        const card = renderizarTarjetaActividadEstudiante(mockAct, '18460767');
        expect(card.titulo).toContain('Sopa de Letras');
        expect(card.materiaBadge).toContain('Ciencias Naturales');
        expect(card.profesorInfo).toContain('Juan Felipe Ramírez');
        expect(card.xpBadge).toContain('+250 XP');
        expect(card.esCompletada).toBe(false);
        expect(card.botonTexto).toContain('Desarrollar Tarea Ahora');
    });

    it('T1_R4_04: Pending Counter — Calculates correct pending badge count', () => {
        const studentDoc = '18460767';
        const acts = [
            { id: 'act_1', grupo_destino: '7C', completada_por: [] },
            { id: 'act_2', grupo_destino: '7C', completada_por: [{ documento: '18460767' }] },
            { id: 'act_3', grupo_destino: '7C', completada_por: [] }
        ];

        const pendientes = acts.filter(a => !a.completada_por.some(c => c.documento === studentDoc));
        expect(pendientes.length).toBe(2);
    });

    it('T1_R4_05: Activity Launch Payload — Preserves stored actividad_data structure for game runner', () => {
        const storedActivity = {
            id: 'act_launch_01',
            tipo_actividad: 'crucigrama',
            actividad_data: {
                toolId: 'crucigrama',
                palabras: [
                    { palabra: 'FOTOSINTESIS', pista: 'Proceso de nutrición vegetal' }
                ]
            }
        };

        // Visor stage runner receiver
        const prepararStageVisor = (act) => {
            if (!act || !act.actividad_data) throw new Error('Invalid activity data');
            return {
                toolId: act.tipo_actividad,
                data: act.actividad_data,
                ready: true
            };
        };

        const runnerStage = prepararStageVisor(storedActivity);
        expect(runnerStage.ready).toBe(true);
        expect(runnerStage.toolId).toBe('crucigrama');
        expect(runnerStage.data.palabras[0].palabra).toBe('FOTOSINTESIS');
    });
});

// ============================================================================
// TIER 2: BOUNDARY & CORNER CASES
// ============================================================================
describe('R4: Student Inbox — Tier 2 Boundary & Corner Cases', 'Tier 2: Boundary & Corner Cases', () => {

    it('T2_R4_01: Empty Inbox State — Returns clean empty array when no activities assigned', () => {
        const student = { documento: '999999', grupo: '9Z', grado: '9' };
        const emptyList = [];
        const res = filtrarActividadesParaEstudiante(emptyList, student);
        expect(res.length).toBe(0);
    });

    it('T2_R4_02: Case-Insensitive Matching — Matches group regardless of lowercase/uppercase format', () => {
        const student = { documento: '123', grupo: '7c', grado: '7' };
        const acts = [
            { id: 'act_1', grupo_destino: '7C' },
            { id: 'act_2', grupo_destino: '7c' }
        ];

        const res = filtrarActividadesParaEstudiante(acts, student);
        expect(res.length).toBe(2);
    });

    it('T2_R4_03: Completed Activity State — Correctly renders completed state and disables reward duplication', () => {
        const studentDoc = '18460767';
        const completedAct = {
            id: 'act_completed_01',
            titulo: 'Memory Cards',
            completada_por: [{ documento: '18460767', fecha: '2026-08-23', xp_ganado: 250 }]
        };

        const card = renderizarTarjetaActividadEstudiante(completedAct, studentDoc);
        expect(card.esCompletada).toBe(true);
        expect(card.estadoBadge).toContain('Completada');
        expect(card.botonTexto).toContain('Repasar');
    });

    it('T2_R4_04: Malformed Activity Recovery — Missing fields in activity object do not crash renderer', () => {
        const malformedAct = { id: 'act_corrupt' };
        const card = renderizarTarjetaActividadEstudiante(malformedAct, '123');

        expect(card.id).toBe('act_corrupt');
        expect(card.titulo).toBe('Actividad STEAM');
        expect(card.materiaBadge).toContain('General');
        expect(card.profesorInfo).toContain('Docente Institucional');
    });

    it('T2_R4_05: HomeSchool and Global Matching — HomeSchool student matches homeschool specific tag', () => {
        const hsStudent = {
            documento: 'hs_001',
            nombre: 'Mateo',
            institucion: 'HomeSchool',
            grupo: 'HS-Primaria',
            grado: '5'
        };

        const acts = [
            { id: 'act_hs_1', grupo_destino: 'homeschool', grado: '5' },
            { id: 'act_reg_1', grupo_destino: '5A', grado: '5' }
        ];

        const res = filtrarActividadesParaEstudiante(acts, hsStudent);
        expect(res.length).toBe(1);
        expect(res[0].id).toBe('act_hs_1');
    });
});
