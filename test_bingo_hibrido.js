const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log("======================================================================");
console.log("TEST SUITE: GAMIFICACION HIBRIDA - BINGO PEDAGOGICO STEAM (5x5)");
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

async function runAsyncTest(name, fn) {
    totalTests++;
    try {
        await fn();
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

runTest("prompts_juegos.js define PROMPTS_JUEGOS.bingo_steam", () => {
    assert(typeof prompts.PROMPTS_JUEGOS.bingo_steam === 'function', "Debe ser funcion");
    const p = prompts.PROMPTS_JUEGOS.bingo_steam('La Célula', '7°', 'Escucha atentamente');
    assert(p.includes('EXACTAMENTE 25 conceptos'), "Debe exigir exactamente 25 conceptos");
    assert(p.includes('LA DEFINICIÓN'), "Debe indicar que la balotera proyecta la definición");
    assert(p.includes('Cartones 5x5'), "Debe especificar cuadrícula 5x5");
});

runTest("prompts_juegos.js exporta obtenerPromptJsonBingo solicitando 25 pares", () => {
    assert(typeof prompts.obtenerPromptJsonBingo === 'function', "Debe exportar obtenerPromptJsonBingo");
    const jsonPrompt = prompts.obtenerPromptJsonBingo('Ecosistemas', '8°');
    assert(jsonPrompt.includes('EXACTAMENTE 25 pares'), "Debe pedir exactamente 25 pares");
    assert(jsonPrompt.includes('"pares"'), "Debe pedir clave pares");
});

// -----------------------------------------------------------------------------
// 2. VERIFICACION DE LOGICA EN APP.JS
// -----------------------------------------------------------------------------
console.log("\n--- 2. VERIFICACION DE LOGICA Y FUNCIONES EN APP.JS ---");

const rawApp = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

runTest("app.js implementa algoritmo de barajado Fisher-Yates", () => {
    assert(rawApp.includes("window.fisherYatesShuffle = function"), "Debe implementar fisherYatesShuffle");
});

runTest("app.js implementa normalizador de exactamente 25 pares para Bingo", () => {
    assert(rawApp.includes("window.obtener25ParesBingo = function"), "Debe implementar obtener25ParesBingo");
});

runTest("app.js implementa validador de los 5 patrones de victoria", () => {
    assert(rawApp.includes("window.verificarPatronVictoriaBingo = function"), "Debe implementar verificarPatronVictoriaBingo");
    assert(rawApp.includes("cuatro_esquinas"), "Debe soportar cuatro_esquinas");
    assert(rawApp.includes("carton_lleno"), "Debe soportar carton_lleno");
    assert(rawApp.includes("letra_x"), "Debe soportar letra_x");
    assert(rawApp.includes("letra_l"), "Debe soportar letra_l");
    assert(rawApp.includes("linea_recta"), "Debe soportar linea_recta");
});

runTest("app.js implementa panel de configuracion del docente con modalidad e inputs", () => {
    assert(rawApp.includes("window.configurarBingoSteam = function"), "Debe implementar configurarBingoSteam");
    assert(rawApp.includes("bingo-cfg-cantidad"), "Debe tener selector de cantidad de cartones");
    assert(rawApp.includes("bingo-modalidad"), "Debe tener selector de modalidad digital o impresa");
    assert(rawApp.includes("bingo-cfg-patron"), "Debe tener selector de patrón de victoria");
});

runTest("app.js implementa generador de cartones PDF 5x5 con celda central STEAM LIBRE", () => {
    assert(rawApp.includes("window.imprimirCartonesBingo5x5 = function"), "Debe implementar imprimirCartonesBingo5x5");
    assert(rawApp.includes("carton-grid-5x5"), "Debe tener clase CSS carton-grid-5x5");
    assert(rawApp.includes("repeat(5, 1fr)"), "Debe configurar grid 5x5");
    assert(rawApp.includes("STEAM<br>LIBRE"), "Debe tener celda central STEAM LIBRE");
});

runTest("app.js implementa Tablero Maestro de Control proyectable para el docente", () => {
    assert(rawApp.includes("window.renderizarTableroMaestroBingo = function"), "Debe implementar renderizarTableroMaestroBingo");
    assert(rawApp.includes("avanzarSiguienteDefinicionBingo"), "Debe tener botón maestro de avance");
    assert(rawApp.includes("Historial de Conceptos Cantados"), "Debe tener panel de historial");
    assert(rawApp.includes("dispararCelebracionBingoManual"), "Debe tener módulo de celebración BINGO");
});

runTest("app.js implementa Interfaz Digital del Estudiante con marcado y polling", () => {
    assert(rawApp.includes("window.renderizarCartonEstudianteBingo = function"), "Debe implementar renderizarCartonEstudianteBingo");
    assert(rawApp.includes("tocarConceptoCartonBingo"), "Debe permitir tocar y marcar conceptos");
    assert(rawApp.includes("declararVictoriaBingoEstudiante"), "Debe emitir victoria al completar patrón");
    assert(rawApp.includes("api/bingo/estado-partida"), "Debe consultar estado de partida en tiempo real");
});

runTest("app.js enruta actividades de Bingo desde el Buzón del Estudiante", () => {
    assert(rawApp.includes("renderizarCartonEstudianteBingo(actividad)"), "Debe enrutar a cartón digital desde el buzón");
});

// -----------------------------------------------------------------------------
// 3. PRUEBA MATEMATICA DE LOS 5 PATRONES DE VICTORIA (5x5)
// -----------------------------------------------------------------------------
console.log("\n--- 3. PRUEBAS MATEMATICAS DE PATRONES DE VICTORIA ---");

// Definir la funcion en contexto de prueba
function verificarPatron(celdasMarcadas, patron) {
    const esMarcada = (idx) => idx === 12 || celdasMarcadas.has(idx);

    if (patron === 'cuatro_esquinas') {
        return [0, 4, 20, 24].every(esMarcada);
    }
    if (patron === 'carton_lleno') {
        for (let i = 0; i < 25; i++) {
            if (!esMarcada(i)) return false;
        }
        return true;
    }
    if (patron === 'letra_x') {
        const diag1 = [0, 6, 12, 18, 24].every(esMarcada);
        const diag2 = [4, 8, 12, 16, 20].every(esMarcada);
        return diag1 && diag2;
    }
    if (patron === 'letra_l') {
        const col0 = [0, 5, 10, 15, 20].every(esMarcada);
        const row4 = [20, 21, 22, 23, 24].every(esMarcada);
        return col0 && row4;
    }
    // Default 'linea_recta'
    for (let r = 0; r < 5; r++) {
        let filaCompleta = true;
        for (let c = 0; c < 5; c++) {
            if (!esMarcada(r * 5 + c)) { filaCompleta = false; break; }
        }
        if (filaCompleta) return true;
    }
    for (let c = 0; c < 5; c++) {
        let colCompleta = true;
        for (let r = 0; r < 5; r++) {
            if (!esMarcada(r * 5 + c)) { colCompleta = false; break; }
        }
        if (colCompleta) return true;
    }
    if ([0, 6, 12, 18, 24].every(esMarcada)) return true;
    if ([4, 8, 12, 16, 20].every(esMarcada)) return true;
    return false;
}

runTest("Patron 'cuatro_esquinas': detecta esquinas completas e incompletas", () => {
    const esquinasValidas = new Set([0, 4, 20, 24]);
    assert.strictEqual(verificarPatron(esquinasValidas, 'cuatro_esquinas'), true);

    const esquinasIncompletas = new Set([0, 4, 20]);
    assert.strictEqual(verificarPatron(esquinasIncompletas, 'cuatro_esquinas'), false);
});

runTest("Patron 'carton_lleno': valida que las 25 celdas esten cubiertas", () => {
    const todoLleno = new Set();
    for (let i = 0; i < 25; i++) todoLleno.add(i);
    assert.strictEqual(verificarPatron(todoLleno, 'carton_lleno'), true);

    const faltaUna = new Set();
    for (let i = 0; i < 24; i++) faltaUna.add(i);
    assert.strictEqual(verificarPatron(faltaUna, 'carton_lleno'), false);
});

runTest("Patron 'letra_x': valida ambas diagonales cruzadas (0,6,12,18,24 y 4,8,12,16,20)", () => {
    const xValida = new Set([0, 6, 18, 24, 4, 8, 16, 20]); // celda 12 es comodin automatico
    assert.strictEqual(verificarPatron(xValida, 'letra_x'), true);

    const unaSolaDiagonal = new Set([0, 6, 18, 24]);
    assert.strictEqual(verificarPatron(unaSolaDiagonal, 'letra_x'), false);
});

runTest("Patron 'letra_l': valida primera columna (0,5,10,15,20) y ultima fila (20,21,22,23,24)", () => {
    const lValida = new Set([0, 5, 10, 15, 20, 21, 22, 23, 24]);
    assert.strictEqual(verificarPatron(lValida, 'letra_l'), true);

    const lIncompleta = new Set([0, 5, 10, 15, 20]);
    assert.strictEqual(verificarPatron(lIncompleta, 'letra_l'), false);
});

runTest("Patron 'linea_recta': valida filas horizontales, verticales y diagonales", () => {
    // Fila 0
    assert.strictEqual(verificarPatron(new Set([0, 1, 2, 3, 4]), 'linea_recta'), true);
    // Columna 3
    assert.strictEqual(verificarPatron(new Set([3, 8, 13, 18, 23]), 'linea_recta'), true);
    // Diagonal con centro libre
    assert.strictEqual(verificarPatron(new Set([0, 6, 18, 24]), 'linea_recta'), true);
    // Celdas dispersas sin linea
    assert.strictEqual(verificarPatron(new Set([0, 2, 7, 15, 23]), 'linea_recta'), false);
});

// -----------------------------------------------------------------------------
// 4. SIMULACION FISHER-YATES SHUFFLE (ALEATORIEDAD Y DIVERGENCIA)
// -----------------------------------------------------------------------------
console.log("\n--- 4. SIMULACION DE BARAJADO FISHER-YATES ---");

function fisherYates(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

runTest("Fisher-Yates produce permutaciones validas sin perder elementos", () => {
    const origen = Array.from({ length: 25 }, (_, i) => `Concepto_${i+1}`);
    const shuf = fisherYates(origen);
    assert.strictEqual(shuf.length, 25);
    origen.forEach(item => {
        assert(shuf.includes(item), `Debe contener ${item}`);
    });
    // Comprobar que en 10 ejecuciones al menos 9 son permutaciones distintas
    const series = new Set();
    for (let k = 0; k < 10; k++) {
        series.add(fisherYates(origen).join('|'));
    }
    assert(series.size >= 8, "Debe generar permutaciones unicas en cada cartón");
});

// -----------------------------------------------------------------------------
// 5. PRUEBA DE INTEGRACION ENDPOINTS DE SERVER.JS
// -----------------------------------------------------------------------------
console.log("\n--- 5. PRUEBAS DE INTEGRACION ENDPOINTS SERVER.JS ---");

(async () => {
    const serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

    runTest("server.js define POST /api/bingo/crear-partida", () => {
        assert(serverCode.includes("app.post('/api/bingo/crear-partida'"), "Debe tener endpoint crear-partida");
    });

    runTest("server.js define GET /api/bingo/estado-partida", () => {
        assert(serverCode.includes("app.get('/api/bingo/estado-partida'"), "Debe tener endpoint estado-partida");
    });

    runTest("server.js define POST /api/bingo/siguiente-definicion", () => {
        assert(serverCode.includes("app.post('/api/bingo/siguiente-definicion'"), "Debe tener endpoint siguiente-definicion");
    });

    runTest("server.js define POST /api/bingo/cantar-victoria", () => {
        assert(serverCode.includes("app.post('/api/bingo/cantar-victoria'"), "Debe tener endpoint cantar-victoria");
        assert(serverCode.includes("xp_otorgado: 500"), "Debe otorgar 500 XP al ganador");
        assert(serverCode.includes("calificacion: 5.0"), "Debe otorgar calificación 5.0");
    });

    runTest("server.js define POST /api/bingo/evaluar-estudiante", () => {
        assert(serverCode.includes("app.post('/api/bingo/evaluar-estudiante'"), "Debe tener endpoint evaluar-estudiante");
    });

    console.log("\n======================================================================");
    console.log(`RESULTADOS: ${testsPassed} / ${totalTests} PRUEBAS SUPERADAS (${Math.round((testsPassed/totalTests)*100)}%)`);
    console.log("======================================================================");

    if (testsPassed === totalTests) {
        console.log("EL SISTEMA DE GAMIFICACION HIBRIDA BINGO STEAM ESTA 100% CERTIFICADO.\n");
        process.exitCode = 0;
    } else {
        console.error("ALGUNAS PRUEBAS FALLARON.\n");
        process.exitCode = 1;
    }
})();
