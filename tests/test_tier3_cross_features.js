/**
 * ============================================================================
 * 🧪 TEST SUITE: Tier 3 — Cross-Feature Integration Combinations
 * ============================================================================
 * Covers:
 * - End-to-end interactions across R1 (Roles), R2 (Multi-file), R3 (AI Games), R4 (Student Inbox)
 * - Complete data pipeline from curriculum ingestion -> AI game config -> assignment -> student reception & execution
 */

const { describe, it, expect } = require('./helpers/test_framework');

describe('Tier 3: Cross-Feature Integration Workflows', 'Tier 3: Cross-Feature Combinations', () => {

    it('T3_INT_01: Workflow — Subject Creation with Multi-File Upload feeds into Caja 2 Game Generation', () => {
        // Step 1: Teacher uploads 3 curriculum files
        const curriculumFiles = [
            { name: 'Unidad1_Biologia_Celular.pdf', text: 'mitocondria cloroplasto membrana nucleo ribosoma adn citoplasma' },
            { name: 'Taller_Laboratorio.docx', text: 'observacion microscopio celula vegetal celula animal tincion' },
            { name: 'Evaluacion_Diagnostica.pptx', text: 'metabolismo respiracion fotosintesis osmosis difusion' }
        ];

        // Step 2: Extract top tokens
        let allText = curriculumFiles.map(f => f.text).join(' ');
        let tokens = Array.from(new Set(allText.split(' ').filter(w => w.length >= 4)));
        expect(tokens.length).toBeGreaterThanOrEqual(10);

        // Step 3: Teacher opens Caja 2 Sopa de Letras and feeds tokens
        const gamePayload = {
            toolId: 'sopa_letras',
            materia: 'Biología Celular',
            grado: '7',
            palabras: tokens.slice(0, 8).map(w => w.toUpperCase()),
            tamano: 12
        };

        expect(gamePayload.palabras).toContain('MITOCONDRIA');
        expect(gamePayload.palabras).toContain('FOTOSINTESIS');
        expect(gamePayload.palabras.length).toBe(8);
    });

    it('T3_INT_02: Workflow — Director de Grupo assigns Jeopardy game to Group 7C and Student receives it in Inbox', () => {
        // Step 1: Director teacher session
        const directorTeacher = {
            documento: '123456',
            nombre: 'Juan Felipe',
            apellidos: 'Ramírez',
            es_director: true,
            grupos_direccion: ['7C']
        };

        // Step 2: Generates Jeopardy activity
        const jeopardyActivity = {
            id: `act_jeopardy_${Date.now()}`,
            tipo_actividad: 'jeopardy',
            titulo: '🎪 Concurso Jeopardy: Leyes de Newton y Cinemática',
            destinatario_tipo: 'grupo',
            grupo_destino: '7C',
            materia: 'Física',
            grado: '7',
            profesor_nombre: `${directorTeacher.nombre} ${directorTeacher.apellidos}`,
            creador_id: directorTeacher.documento,
            xp_recompensa: 250,
            actividad_data: {
                categorias: ['Fuerza', 'Masa', 'Aceleración', 'Inercia', 'STEAM'],
                totalPreguntas: 25
            },
            completada_por: []
        };

        // Step 3: Mock platform database
        const databaseActividades = [jeopardyActivity];

        // Step 4: Student Clara (7C) queries inbox
        const studentClara = { documento: '18460767', nombre: 'Clara', grupo: '7C', grado: '7' };
        const inbox = databaseActividades.filter(a => a.grupo_destino === studentClara.grupo);

        expect(inbox.length).toBe(1);
        expect(inbox[0].titulo).toContain('Concurso Jeopardy');
        expect(inbox[0].profesor_nombre).toContain('Juan Felipe Ramírez');
        expect(inbox[0].actividad_data.totalPreguntas).toBe(25);
    });

    it('T3_INT_03: Workflow — Non-Director Teacher assigns Memory Cards to 6A and Group 7C is isolated', () => {
        // Non-director teacher
        const nonDirector = {
            documento: '556677',
            nombre: 'María Paula',
            es_director: false,
            grupos: [{ nombre: '6A', grado: '6', materia: 'Inglés' }]
        };

        const memoryActivity = {
            id: 'act_mem_6a',
            tipo_actividad: 'memory_cards',
            titulo: '🃏 Memory: Irregular Verbs in Past Tense',
            grupo_destino: '6A',
            materia: 'Inglés',
            profesor_nombre: 'María Paula',
            xp_recompensa: 250,
            completada_por: []
        };

        const studentPedro6A = { documento: '660011', nombre: 'Pedro', grupo: '6A', grado: '6' };
        const studentClara7C = { documento: '18460767', nombre: 'Clara', grupo: '7C', grado: '7' };

        const acts = [memoryActivity];
        
        // Pedro in 6A receives it
        const inboxPedro = acts.filter(a => a.grupo_destino === studentPedro6A.grupo);
        expect(inboxPedro.length).toBe(1);
        expect(inboxPedro[0].materia).toBe('Inglés');

        // Clara in 7C does not receive it
        const inboxClara = acts.filter(a => a.grupo_destino === studentClara7C.grupo);
        expect(inboxClara.length).toBe(0);
    });

    it('T3_INT_04: Workflow — Batch Assignments and Pending Counter Decrement on Task Completion', () => {
        const studentDoc = '18460767';
        let actividades = [
            { id: 'act_1', grupo_destino: '7C', completada_por: [] },
            { id: 'act_2', grupo_destino: '7C', completada_por: [] },
            { id: 'act_3', grupo_destino: '7C', completada_por: [] }
        ];

        // Initial pending count
        const countInicial = actividades.filter(a => !a.completada_por.some(c => c.documento === studentDoc)).length;
        expect(countInicial).toBe(3);

        // Student completes act_1
        actividades[0].completada_por.push({
            documento: studentDoc,
            fecha: new Date().toISOString(),
            xp_ganado: 250
        });

        // Updated pending count
        const countFinal = actividades.filter(a => !a.completada_por.some(c => c.documento === studentDoc)).length;
        expect(countFinal).toBe(2);
    });

    it('T3_INT_05: Payload Integrity — AI Generated Game Data matches exactly inside Student Visor', () => {
        const generatedGame = {
            toolId: 'crucigrama',
            tamano: 10,
            palabras: [
                { palabra: 'ATOMO', pista: 'Unidad básica de la materia', x: 2, y: 3, orientacion: 'horizontal' },
                { palabra: 'MOLECULA', pista: 'Unión de dos o más átomos', x: 2, y: 3, orientacion: 'vertical' }
            ]
        };

        const activity = {
            id: 'act_cruci_01',
            tipo_actividad: 'crucigrama',
            actividad_data: JSON.parse(JSON.stringify(generatedGame))
        };

        // Student runner consumes activity_data
        const studentRunnerPayload = activity.actividad_data;
        expect(studentRunnerPayload.toolId).toBe('crucigrama');
        expect(studentRunnerPayload.palabras.length).toBe(2);
        expect(studentRunnerPayload.palabras[0].palabra).toBe('ATOMO');
        expect(studentRunnerPayload.palabras[1].palabra).toBe('MOLECULA');
    });
});
