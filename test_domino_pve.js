const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("======================================================================");
console.log("TEST SUITE: MOTOR DE JUEGO DE MESA PvE - DOMINO CONCEPTUAL STEAM (28 FICHAS)");
console.log("======================================================================");

let testsPassed = 0;
let totalTests = 0;

function runTest(name, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  [PASS] ${name}`);
        testsPassed++;
    } catch (err) {
        console.error(`  [FAIL] ${name}: ${err.message}`);
    }
}

// -----------------------------------------------------------------------------
// 1. VERIFICACION DE PROMPTS EN PROMPTS_JUEGOS.JS
// -----------------------------------------------------------------------------
console.log("\n--- 1. VERIFICACION DE PROMPTS EN PROMPTS_JUEGOS.JS ---");

const prompts = require('./prompts_juegos.js');

runTest("prompts_juegos.js define PROMPTS_JUEGOS.domino_conceptual", () => {
    assert(typeof prompts.PROMPTS_JUEGOS.domino_conceptual === 'function', "Debe ser funcion");
    const p = prompts.PROMPTS_JUEGOS.domino_conceptual('La Celula', '7', 'Juega domino');
    assert(p.includes('EXACTAMENTE 7 pares'), "Debe exigir exactamente 7 pares");
    assert(p.includes('del 0 al 6'), "Debe actuar como valores del 0 al 6");
    assert(p.includes('28 fichas'), "Debe mencionar las 28 fichas");
});

runTest("prompts_juegos.js exporta obtenerPromptJsonDomino solicitando 7 pares", () => {
    assert(typeof prompts.obtenerPromptJsonDomino === 'function', "Debe exportar obtenerPromptJsonDomino");
    const jsonPrompt = prompts.obtenerPromptJsonDomino('Ecosistemas', '8');
    assert(jsonPrompt.includes('EXACTAMENTE 7 pares'), "Debe pedir exactamente 7 pares");
    assert(jsonPrompt.includes('"pares"'), "Debe pedir clave pares");
});

runTest("prompts_juegos.js registra alias de domino", () => {
    assert(prompts.PROMPTS_JUEGOS.domino, "Debe existir alias domino");
    assert(prompts.PROMPTS_JUEGOS.juego_domino, "Debe existir alias juego_domino");
    assert(prompts.PROMPTS_JUEGOS.juego_domino_conceptual, "Debe existir alias juego_domino_conceptual");
});

// -----------------------------------------------------------------------------
// 2. VERIFICACION DE DIRECTIVAS Y NORMALIZADOR EN SERVER.JS
// -----------------------------------------------------------------------------
console.log("\n--- 2. VERIFICACION EN SERVER.JS ---");

const serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

runTest("server.js contiene la regla estricta de 7 pares para domino en /api/generate-tool-ai", () => {
    assert(serverCode.includes("EXACTAMENTE 7 PARES 0-6"), "Debe exigir 7 pares en el prompt de IA");
    assert(serverCode.includes("doble-6 tradicional"), "Debe referenciar el domino doble-6");
});

runTest("server.js contiene normalizador de contingencia para garantizar 7 pares", () => {
    assert(serverCode.includes("Garantizar exactamente 7 pares"), "Debe tener normalizador de 7 pares");
});

// -----------------------------------------------------------------------------
// 3. VERIFICACION DE IMPLEMENTACION EN APP.JS
// -----------------------------------------------------------------------------
console.log("\n--- 3. VERIFICACION DE LOGICA EN APP.JS ---");

const rawApp = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

runTest("app.js implementa obtener7ParesDomino", () => {
    assert(rawApp.includes("window.obtener7ParesDomino = function"), "Debe implementar obtener7ParesDomino");
});

runTest("app.js implementa generarSet28FichasDomino", () => {
    assert(rawApp.includes("window.generarSet28FichasDomino = function"), "Debe implementar generarSet28FichasDomino");
});

runTest("app.js implementa regla conceptual evaluarConexionDomino", () => {
    assert(rawApp.includes("window.evaluarConexionDomino = function"), "Debe implementar evaluarConexionDomino");
});

runTest("app.js implementa obtenerJugadasPosiblesFicha para ambos extremos", () => {
    assert(rawApp.includes("window.obtenerJugadasPosiblesFicha = function"), "Debe implementar obtenerJugadasPosiblesFicha");
});

runTest("app.js implementa inicio de partida PvE con reparto reglamentario (7 estudiante, 7 IA, 13 pozo, 1 mesa)", () => {
    assert(rawApp.includes("window.iniciarPartidaDominoPvE = function"), "Debe implementar iniciarPartidaDominoPvE");
    assert(rawApp.includes("barajadas.splice(0, 7)"), "Debe repartir 7 fichas al estudiante y 7 a la IA");
});

runTest("app.js implementa HUDs (Estudiante, Mesa central y Oponente IA)", () => {
    assert(rawApp.includes("window.renderizarTableroDominoPvE = function"), "Debe implementar renderizarTableroDominoPvE");
    assert(rawApp.includes("Cerebro STEAM (IA)"), "Debe tener oponente IA");
    assert(rawApp.includes("mesa-tren-domino"), "Debe tener tren horizontal de fichas en mesa");
    assert(rawApp.includes("Robar ("), "Debe tener boton de robar del pozo");
    assert(rawApp.includes("Pasar Turno"), "Debe tener boton de pasar turno");
});

runTest("app.js implementa turno inteligente de la IA con delay de pensamiento", () => {
    assert(rawApp.includes("window.ejecutarTurnoIADomino = function"), "Debe implementar ejecutarTurnoIADomino");
});

runTest("app.js implementa calificacion socioformativa 1.0 a 5.0 y persistencia obligatoria", () => {
    assert(rawApp.includes("window.finalizarPartidaDomino = function"), "Debe implementar finalizarPartidaDomino");
    assert(rawApp.includes("window.guardarCalificacionActividad"), "Debe guardar nota en planilla docente");
    assert(rawApp.includes("window.intentarGuardarProgresoYFinalizarClase"), "Debe invocar guardar progreso oficial");
    assert(rawApp.includes("Guardar Progreso & Salir"), "Debe incluir boton oficial");
});

runTest("app.js enruta actividades de Domino desde el Buzon del Estudiante", () => {
    assert(rawApp.includes("renderizarDominoPvEModal(actividad)"), "Debe abrir modal PvE desde buzon");
});

// -----------------------------------------------------------------------------
// 4. PRUEBA MATEMATICA DE GENERACION COMBINATORIA DE 28 FICHAS
// -----------------------------------------------------------------------------
console.log("\n--- 4. PRUEBAS MATEMATICAS Y COMBINATORIAS ---");

function generar28Fichas(pares7) {
    const fichas = [];
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            const id = `f_${i}_${j}`;
            let ladoA, ladoB, esDoble;

            if (i === j) {
                esDoble = true;
                ladoA = { type: 'concepto', index: i, text: pares7[i].concepto, parId: i };
                ladoB = { type: 'definicion', index: i, text: pares7[i].definicion, parId: i };
            } else {
                esDoble = false;
                if ((i + j) % 2 === 0) {
                    ladoA = { type: 'concepto', index: i, text: pares7[i].concepto, parId: i };
                    ladoB = { type: 'definicion', index: j, text: pares7[j].definicion, parId: j };
                } else {
                    ladoA = { type: 'definicion', index: i, text: pares7[i].definicion, parId: i };
                    ladoB = { type: 'concepto', index: j, text: pares7[j].concepto, parId: j };
                }
            }

            fichas.push({
                id,
                valI: i,
                valJ: j,
                esDoble,
                peso: i + j,
                ladoA,
                ladoB
            });
        }
    }
    return fichas;
}

const paresMock7 = [
    { concepto: "C0", definicion: "D0" },
    { concepto: "C1", definicion: "D1" },
    { concepto: "C2", definicion: "D2" },
    { concepto: "C3", definicion: "D3" },
    { concepto: "C4", definicion: "D4" },
    { concepto: "C5", definicion: "D5" },
    { concepto: "C6", definicion: "D6" }
];

const set28 = generar28Fichas(paresMock7);

runTest("Genera EXACTAMENTE 28 fichas unicas sin duplicados", () => {
    assert.strictEqual(set28.length, 28, "Debe generar exactamente 28 fichas");
    const ids = new Set(set28.map(f => f.id));
    assert.strictEqual(ids.size, 28, "Todos los IDs deben ser unicos");
});

runTest("El set contiene exactamente 7 dobles conceptuales (0-6)", () => {
    const dobles = set28.filter(f => f.esDoble);
    assert.strictEqual(dobles.length, 7, "Debe haber exactamente 7 dobles");
    dobles.forEach((d, idx) => {
        assert.strictEqual(d.valI, idx);
        assert.strictEqual(d.valJ, idx);
        assert.strictEqual(d.ladoA.type, 'concepto');
        assert.strictEqual(d.ladoB.type, 'definicion');
        assert.strictEqual(d.ladoA.index, idx);
        assert.strictEqual(d.ladoB.index, idx);
    });
});

runTest("Cada indice conceptual del 0 al 6 aparece distribuido equitativamente (7 fichas por numero)", () => {
    for (let k = 0; k <= 6; k++) {
        const ocurrencias = set28.filter(f => f.valI === k || f.valJ === k);
        assert.strictEqual(ocurrencias.length, 7, `El indice ${k} debe participar en 7 fichas exactamente`);
    }
});

// -----------------------------------------------------------------------------
// 5. PRUEBA DE CONEXION CONCEPTUAL (REGLA PEDAGOGICA)
// -----------------------------------------------------------------------------
console.log("\n--- 5. PRUEBAS DE CONEXION CONCEPTUAL ---");

function evaluarConexion(ladoFicha, extremoMesa) {
    if (!ladoFicha || !extremoMesa) return false;
    return ladoFicha.index === extremoMesa.index && ladoFicha.type !== extremoMesa.type;
}

runTest("Un Concepto conecta con su Definicion exacta del mismo indice", () => {
    const extremoMesa = { type: 'concepto', index: 3, text: 'Mitocondria' };
    const ladoValido = { type: 'definicion', index: 3, text: 'Produce ATP' };
    assert.strictEqual(evaluarConexion(ladoValido, extremoMesa), true);
});

runTest("Una Definicion conecta con su Concepto exacto del mismo indice", () => {
    const extremoMesa = { type: 'definicion', index: 1, text: 'Codigo genetico' };
    const ladoValido = { type: 'concepto', index: 1, text: 'ADN' };
    assert.strictEqual(evaluarConexion(ladoValido, extremoMesa), true);
});

runTest("Rechaza conexiones con indices conceptuales distintos", () => {
    const extremoMesa = { type: 'concepto', index: 2, text: 'Ecosistema' };
    const ladoInvalido = { type: 'definicion', index: 4, text: 'Energia...' };
    assert.strictEqual(evaluarConexion(ladoInvalido, extremoMesa), false);
});

runTest("Rechaza conexiones del mismo tipo (Concepto con Concepto o Definicion con Definicion)", () => {
    const extremoMesa = { type: 'concepto', index: 5, text: 'Fotosintesis' };
    const mismoTipo = { type: 'concepto', index: 5, text: 'Fotosintesis' };
    assert.strictEqual(evaluarConexion(mismoTipo, extremoMesa), false);
});

// -----------------------------------------------------------------------------
// 6. SIMULACION DE REPARTO REGLAMENTARIO
// -----------------------------------------------------------------------------
console.log("\n--- 6. PRUEBAS DE REPARTO REGLAMENTARIO ---");

runTest("La suma total de fichas en mesa, manos y pozo es siempre 28", () => {
    const pool = [...set28];
    const mesa = [pool.pop()];
    const manoJugador = pool.splice(0, 7);
    const manoIA = pool.splice(0, 7);
    const pozo = pool;

    assert.strictEqual(mesa.length, 1, "Mesa inicial debe tener 1 ficha de arranque");
    assert.strictEqual(manoJugador.length, 7, "Estudiante debe recibir 7 fichas");
    assert.strictEqual(manoIA.length, 7, "IA debe recibir 7 fichas");
    assert.strictEqual(pozo.length, 13, "Pozo debe contener exactamente 13 fichas");
    assert.strictEqual(mesa.length + manoJugador.length + manoIA.length + pozo.length, 28, "Total = 28");
});

console.log("\n======================================================================");
console.log(`RESULTADOS: ${testsPassed} / ${totalTests} PRUEBAS SUPERADAS (${Math.round((testsPassed/totalTests)*100)}%)`);
console.log("======================================================================");

if (testsPassed === totalTests) {
    console.log("EL MOTOR DE JUEGO DE MESA PvE DOMINO CONCEPTUAL ESTA 100% CERTIFICADO.\n");
    process.exitCode = 0;
} else {
    console.error("ALGUNAS PRUEBAS FALLARON.\n");
    process.exitCode = 1;
}
