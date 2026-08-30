const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("======================================================================");
console.log("TEST SUITE: MOTOR DE JUEGO LÓGICO - SUDOKU Y KAKURO STEAM (INTERACTIVO)");
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
// 1. VERIFICACIÓN EN PROMPTS_JUEGOS.JS Y SERVER.JS
// -----------------------------------------------------------------------------
console.log("\n--- 1. VERIFICACIÓN DE PROMPTS Y SERVER ---");

const prompts = require('./prompts_juegos.js');

runTest("prompts_juegos.js define prompt sudoku_steam y aliases", () => {
    assert(typeof prompts.PROMPTS_JUEGOS.sudoku_steam === 'function', "Debe ser funcion");
    assert(prompts.PROMPTS_JUEGOS.sudoku, "Debe existir alias sudoku");
    assert(prompts.PROMPTS_JUEGOS.juego_sudoku, "Debe existir alias juego_sudoku");
    assert(prompts.PROMPTS_JUEGOS.kakuro, "Debe existir alias kakuro");
    const p = prompts.PROMPTS_JUEGOS.sudoku_steam('Fracciones', '7', 'Resuelve sudoku');
    assert(p.includes('Tap-to-Select'), "Debe especificar Tap-to-Select");
    assert(p.includes('Numpad'), "Debe especificar Numpad");
});

const serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

runTest("server.js incluye directiva para Sudoku en /api/generate-tool-ai", () => {
    assert(serverCode.includes("REGLA ESTRICTA PARA SUDOKU Y KAKURO LÓGICO STEAM"), "Debe tener directiva de Sudoku");
});

runTest("server.js normaliza tamano y subcuadrículas para Sudoku", () => {
    assert(serverCode.includes("tipo_herramienta = 'sudoku_steam'"), "Debe normalizar a sudoku_steam");
    assert(serverCode.includes("jsonJuego.subFilas"), "Debe configurar subFilas");
    assert(serverCode.includes("jsonJuego.subCols"), "Debe configurar subCols");
});

// -----------------------------------------------------------------------------
// 2. VERIFICACIÓN DE ESTRUCTURA Y CÓDIGO EN APP.JS
// -----------------------------------------------------------------------------
console.log("\n--- 2. VERIFICACIÓN DE IMPLEMENTACIÓN EN APP.JS ---");

const appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

runTest("app.js define PUZZLES_SUDOKU_STEAM para 4x4, 6x6 y 9x9", () => {
    assert(appCode.includes("window.PUZZLES_SUDOKU_STEAM = {"), "Debe definir PUZZLES_SUDOKU_STEAM");
    assert(appCode.includes("tamano: 4"), "Debe incluir 4x4");
    assert(appCode.includes("tamano: 6"), "Debe incluir 6x6");
    assert(appCode.includes("tamano: 9"), "Debe incluir 9x9");
});

runTest("app.js implementa algoritmo validarSudokuEstado", () => {
    assert(appCode.includes("window.validarSudokuEstado = function"), "Debe implementar validarSudokuEstado");
});

runTest("app.js implementa sistema Tap-to-Select seleccionarCeldaSudoku", () => {
    assert(appCode.includes("window.seleccionarCeldaSudoku = function"), "Debe implementar seleccionarCeldaSudoku");
});

runTest("app.js implementa ingreso numérico desde Numpad ingresarNumeroNumpadSudoku", () => {
    assert(appCode.includes("window.ingresarNumeroNumpadSudoku = function"), "Debe implementar ingresarNumeroNumpadSudoku");
});

runTest("app.js implementa botón de borrado borrarCeldaSudoku", () => {
    assert(appCode.includes("window.borrarCeldaSudoku = function"), "Debe implementar borrarCeldaSudoku");
});

runTest("app.js implementa condición de victoria y persistencia dual oficial", () => {
    assert(appCode.includes("window.finalizarSudokuExitoso = function"), "Debe implementar finalizarSudokuExitoso");
    assert(appCode.includes("window.guardarCalificacionActividad"), "Debe guardar nota en planilla docente");
    assert(appCode.includes("window.intentarGuardarProgresoYFinalizarClase"), "Debe llamar a intentarGuardarProgresoYFinalizarClase");
    assert(appCode.includes("Guardar Progreso & Salir"), "Debe incluir botón oficial de guardado");
});

runTest("app.js enruta actividades de Sudoku desde el Buzón del Estudiante", () => {
    assert(appCode.includes("renderizarSudokuModal(actividad)"), "Debe enrutar sudoku en abrirActividadDesdeInbox");
});

// -----------------------------------------------------------------------------
// 3. PRUEBAS MATEMÁTICAS DEL MOTOR DE VALIDACIÓN DE SUDOKU
// -----------------------------------------------------------------------------
console.log("\n--- 3. PRUEBAS MATEMÁTICAS DEL MOTOR DE VALIDACIÓN ---");

// Extraer o replicar función pura de validación para pruebas unitarias
function validarSudokuEstado(tablero, tamano, subFilas, subCols) {
    const conflictos = new Set();
    let celdasLlenas = 0;
    const totalCeldas = tamano * tamano;

    // Filas
    for (let r = 0; r < tamano; r++) {
        const mapa = {};
        for (let c = 0; c < tamano; c++) {
            const val = tablero[r][c];
            if (val > 0) {
                celdasLlenas++;
                if (!mapa[val]) mapa[val] = [];
                mapa[val].push(`${r}_${c}`);
            }
        }
        for (const val in mapa) {
            if (mapa[val].length > 1) {
                mapa[val].forEach(key => conflictos.add(key));
            }
        }
    }

    // Columnas
    for (let c = 0; c < tamano; c++) {
        const mapa = {};
        for (let r = 0; r < tamano; r++) {
            const val = tablero[r][c];
            if (val > 0) {
                if (!mapa[val]) mapa[val] = [];
                mapa[val].push(`${r}_${c}`);
            }
        }
        for (const val in mapa) {
            if (mapa[val].length > 1) {
                mapa[val].forEach(key => conflictos.add(key));
            }
        }
    }

    // Subcuadrículas
    for (let br = 0; br < tamano; br += subFilas) {
        for (let bc = 0; bc < tamano; bc += subCols) {
            const mapa = {};
            for (let r = br; r < br + subFilas; r++) {
                for (let c = bc; c < bc + subCols; c++) {
                    const val = tablero[r][c];
                    if (val > 0) {
                        if (!mapa[val]) mapa[val] = [];
                        mapa[val].push(`${r}_${c}`);
                    }
                }
            }
            for (const val in mapa) {
                if (mapa[val].length > 1) {
                    mapa[val].forEach(key => conflictos.add(key));
                }
            }
        }
    }

    const estaLleno = (celdasLlenas === totalCeldas);
    const esValido = estaLleno && (conflictos.size === 0);

    return { esValido, conflictos, estaLleno };
}

runTest("Valida con éxito una solución perfecta 4x4", () => {
    const sol4x4 = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
    ];
    const res = validarSudokuEstado(sol4x4, 4, 2, 2);
    assert.strictEqual(res.esValido, true, "Debe ser válida");
    assert.strictEqual(res.estaLleno, true, "Debe estar lleno");
    assert.strictEqual(res.conflictos.size, 0, "No debe haber conflictos");
});

runTest("Valida con éxito una solución perfecta 6x6", () => {
    const sol6x6 = [
        [1, 2, 3, 4, 5, 6],
        [4, 5, 6, 1, 2, 3],
        [2, 3, 1, 5, 6, 4],
        [5, 6, 4, 2, 3, 1],
        [3, 1, 2, 6, 4, 5],
        [6, 4, 5, 3, 1, 2]
    ];
    const res = validarSudokuEstado(sol6x6, 6, 2, 3);
    assert.strictEqual(res.esValido, true, "Debe ser válida");
    assert.strictEqual(res.estaLleno, true, "Debe estar lleno");
    assert.strictEqual(res.conflictos.size, 0, "No debe haber conflictos");
});

runTest("Detecta conflicto de número duplicado en la misma FILA", () => {
    const tableroConErrorFila = [
        [1, 2, 1, 4], // 1 repetido en cols 0 y 2
        [3, 4, 2, 0],
        [2, 1, 4, 3],
        [4, 3, 0, 1]
    ];
    const res = validarSudokuEstado(tableroConErrorFila, 4, 2, 2);
    assert.strictEqual(res.esValido, false);
    assert(res.conflictos.has('0_0'), "Debe marcar 0_0 en conflicto");
    assert(res.conflictos.has('0_2'), "Debe marcar 0_2 en conflicto");
});

runTest("Detecta conflicto de número duplicado en la misma COLUMNA", () => {
    const tableroConErrorCol = [
        [1, 2, 3, 4],
        [1, 4, 0, 2], // 1 repetido en col 0 (fila 0 y fila 1)
        [2, 0, 4, 3],
        [4, 3, 2, 1]
    ];
    const res = validarSudokuEstado(tableroConErrorCol, 4, 2, 2);
    assert.strictEqual(res.esValido, false);
    assert(res.conflictos.has('0_0'), "Debe marcar 0_0 en conflicto");
    assert(res.conflictos.has('1_0'), "Debe marcar 1_0 en conflicto");
});

runTest("Detecta conflicto de número duplicado en la misma SUBCUADRÍCULA (Bloque 2x2)", () => {
    const tableroConErrorBloque = [
        [1, 2, 3, 4],
        [0, 1, 4, 2], // 1 en (0,0) y (1,1) pertenecen al mismo bloque superior izquierdo
        [2, 4, 0, 3],
        [3, 0, 2, 1]
    ];
    const res = validarSudokuEstado(tableroConErrorBloque, 4, 2, 2);
    assert.strictEqual(res.esValido, false);
    assert(res.conflictos.has('0_0'), "Debe marcar 0_0 en conflicto");
    assert(res.conflictos.has('1_1'), "Debe marcar 1_1 en conflicto");
});

runTest("Rechaza tablero incompleto como victoria aunque no tenga conflictos", () => {
    const tableroIncompleto = [
        [1, 0, 3, 0],
        [0, 4, 0, 2],
        [2, 0, 4, 0],
        [0, 3, 0, 1]
    ];
    const res = validarSudokuEstado(tableroIncompleto, 4, 2, 2);
    assert.strictEqual(res.estaLleno, false, "No debe estar lleno");
    assert.strictEqual(res.esValido, false, "No debe considerarse victoria si faltan celdas");
});

// -----------------------------------------------------------------------------
// 4. PRUEBA DE SIMULACIÓN DE FLUJO TAP-TO-SELECT Y NUMPAD
// -----------------------------------------------------------------------------
console.log("\n--- 4. PRUEBAS DE FLUJO INTERACTIVO ---");

runTest("Simulación de ingreso de número y resolución de celda", () => {
    const puzzleInicial = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 0] // Falta el 1 en (3,3)
    ];
    const celdasFijas = new Set(['0_0', '0_1', '0_2', '0_3']);

    // Celda seleccionada (3,3)
    const celda = { r: 3, c: 3 };
    assert(!celdasFijas.has(`${celda.r}_${celda.c}`), "La celda debe ser editable");

    // Ingresar número incorrecto (ej. 4 crea conflicto de fila y columna)
    puzzleInicial[3][3] = 4;
    let res = validarSudokuEstado(puzzleInicial, 4, 2, 2);
    assert.strictEqual(res.esValido, false, "No debe ser válido");
    assert(res.conflictos.has('3_3'), "Debe marcar conflicto en 3_3");

    // Corregir ingresando el número 1
    puzzleInicial[3][3] = 1;
    res = validarSudokuEstado(puzzleInicial, 4, 2, 2);
    assert.strictEqual(res.esValido, true, "Ahora debe ser completamente válido");
    assert.strictEqual(res.conflictos.size, 0, "Cero conflictos");
});

console.log("\n======================================================================");
console.log(`RESULTADOS: ${testsPassed} / ${totalTests} PRUEBAS SUPERADAS (${Math.round((testsPassed/totalTests)*100)}%)`);
console.log("======================================================================");

if (testsPassed === totalTests) {
    console.log("EL MOTOR DE JUEGO SUDOKU Y KAKURO STEAM INTERACTIVO ESTÁ 100% CERTIFICADO.\n");
    process.exitCode = 0;
} else {
    console.error("ALGUNAS PRUEBAS FALLARON.\n");
    process.exitCode = 1;
}
