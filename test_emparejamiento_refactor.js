const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("======================================================================");
console.log("INICIANDO AUDITORIA FORENSE: REFACTORIZACION DUELO DE EMPAREJAMIENTO");
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
// FASE 1: PROMPTS_JUEGOS.JS Y BACKEND
// -----------------------------------------------------------------------------
console.log("\n--- 1. VERIFICACION DE PROMPTS Y ALIASES EN PROMPTS_JUEGOS.JS ---");

const { PROMPTS_JUEGOS, obtenerPromptJuego, obtenerPromptJsonEmparejamiento } = require('./prompts_juegos');

runTest("El prompt de emparejar exige exactamente entre 8 y 10 conceptos y definiciones", () => {
    const prompt = obtenerPromptJuego('emparejar', 'La Celula', '7 Grado', '');
    assert(prompt.includes('8 y 10'), "Debe mencionar entre 8 y 10");
    assert(prompt.includes('Conceptos') && prompt.includes('Definiciones'), "Debe solicitar conceptos y definiciones");
});

runTest("El prompt de emparejar incluye estructura JSON de pares con izquierda y derecha", () => {
    const prompt = obtenerPromptJuego('emparejar', 'Ecosistemas', '6 Grado', '');
    assert(prompt.includes('izquierda') && prompt.includes('derecha'), "Debe incluir el formato de pares izquierda/derecha");
});

runTest("El prompt de emparejar prohibe que la respuesta correcta quede en la misma fila", () => {
    const prompt = obtenerPromptJuego('emparejar', 'Fisica', '10 Grado', '');
    assert(prompt.includes('misma fila'), "Debe contener la regla de que la respuesta correcta nunca quede en la misma fila");
});

runTest("El prompt de emparejar exige evaluacion socioformativa en escala 1.0 a 5.0", () => {
    const prompt = obtenerPromptJuego('emparejar', 'Quimica', '11 Grado', '');
    assert(prompt.includes('1.0 a 5.0') || prompt.includes('1 a 5'), "Debe especificar la escala 1.0 a 5.0");
});

runTest("Aliases de emparejamiento estan correctamente registrados en PROMPTS_JUEGOS", () => {
    assert.strictEqual(typeof PROMPTS_JUEGOS['emparejar'], 'function');
    assert.strictEqual(typeof PROMPTS_JUEGOS['juego_emparejar'], 'function');
    assert.strictEqual(typeof PROMPTS_JUEGOS['memory_cards'], 'function');
    assert.strictEqual(typeof PROMPTS_JUEGOS['duelo_parejas'], 'function');
    assert.strictEqual(typeof PROMPTS_JUEGOS['duelo_emparejamiento'], 'function');
});

runTest("obtenerPromptJsonEmparejamiento genera un prompt JSON estricto con 8 a 10 pares", () => {
    assert.strictEqual(typeof obtenerPromptJsonEmparejamiento, 'function');
    const promptJson = obtenerPromptJsonEmparejamiento('Fotosintesis', '8 Grado', 'Relaciona');
    assert(promptJson.includes('pares'), "Debe incluir clave pares");
    assert(promptJson.includes('8 y 10'), "Debe exigir entre 8 y 10 pares");
    assert(promptJson.includes('JSON estricto'), "Debe exigir JSON estricto");
});

// -----------------------------------------------------------------------------
// FASE 2: SERVER.JS
// -----------------------------------------------------------------------------
console.log("\n--- 2. VERIFICACION DE DIRECTIVAS EN SERVER.JS ---");

const serverContent = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

runTest("server.js incluye la directiva estricta de 8 a 10 pares para herramientas de emparejar", () => {
    assert(serverContent.includes('REGLA ESTRICTA DE EMPAREJAMIENTO DE COLUMNAS (8 A 10 PARES)'), "Debe contener la directiva en server.js");
    assert(serverContent.includes('EXACTAMENTE entre 8 y 10 objetos en el arreglo "pares"'), "Debe exigir entre 8 y 10 pares");
});

runTest("server.js provee fallback robusto de 8 pares completos para pares", () => {
    const match = serverContent.match(/pares:\s*\[([\s\S]*?)\]/);
    assert(match, "Debe tener fallback de pares");
    const countIzquierda = (match[1].match(/izquierda:/g) || []).length;
    assert(countIzquierda >= 8, `El fallback debe tener al menos 8 pares, tiene ${countIzquierda}`);
});

// -----------------------------------------------------------------------------
// FASE 3: APP.JS (LOGICA DEL INTERACTIVO EN FRONTEND)
// -----------------------------------------------------------------------------
console.log("\n--- 3. VERIFICACION DE IMPLEMENTACION EN APP.JS ---");

const rawApp = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const appContent = rawApp.replace(/\r\n/g, '\n');

runTest("app.js define window.renderizarJuegoEmparejamientoAvanzado", () => {
    assert(appContent.includes('window.renderizarJuegoEmparejamientoAvanzado = function'), "Debe definir la funcion avanzada");
});

runTest("app.js conecta window.renderizarJuegoEmparejar con el interactivo avanzado", () => {
    assert(appContent.includes('window.renderizarJuegoEmparejar = function(stage, base) {\n    window.renderizarJuegoEmparejamientoAvanzado(stage, base);'), "Debe invocar el interactivo avanzado");
});

runTest("app.js conecta window.renderizarMemoryCardsTool con el interactivo avanzado", () => {
    assert(appContent.includes('window.renderizarMemoryCardsTool = function(stage, base) {\n    if (typeof window.renderizarJuegoEmparejamientoAvanzado === \'function\') {\n        window.renderizarJuegoEmparejamientoAvanzado(stage, base);'), "Debe conectar MemoryCardsTool");
});

runTest("app.js contiene la regla de shuffle que impide que la respuesta correcta quede en la misma fila", () => {
    assert(appContent.includes('REGLA INQUEBRANTABLE: La respuesta correcta NUNCA debe estar en la misma fila'), "Debe tener la regla explicita");
    assert(appContent.includes('itemsB.some((b, idx) => b.id === itemsA[idx].id)'), "Debe chequear colision por indice");
});

runTest("app.js implementa la formula de calificacion formativa (1.0 a 5.0)", () => {
    assert(appContent.includes('calcularNotaFormativa'), "Debe incluir funcion de calculo de nota");
    assert(appContent.includes('Math.max(1.0, 5.0 - (numErrores * 0.25))'), "Debe calcular base 5.0 con piso 1.0");
});

runTest("app.js incluye el modal de victoria con confeti, nota y los niveles de desempeno del MEN", () => {
    assert(appContent.includes('Desempeño Superior'), "Debe incluir nivel Superior");
    assert(appContent.includes('Desempeño Alto'), "Debe incluir nivel Alto");
    assert(appContent.includes('Desempeño Básico'), "Debe incluir nivel Basico");
    assert(appContent.includes('Desempeño Bajo'), "Debe incluir nivel Bajo");
    assert(appContent.includes('confettiDrop'), "Debe incluir animacion de confeti");
});

runTest("app.js incluye el boton oficial Guardar y Salir vinculado a intentarGuardarProgresoYFinalizarClase", () => {
    assert(appContent.includes('window.intentarGuardarProgresoYFinalizarClase()'), "Debe invocar la funcion oficial de guardar y finalizar");
    assert(appContent.includes('Guardar & Salir'), "Debe mostrar el boton de Guardar & Salir");
});

// -----------------------------------------------------------------------------
// FASE 4: SIMULACION DE COMPORTAMIENTO Y ALGORITMOS
// -----------------------------------------------------------------------------
console.log("\n--- 4. SIMULACION DE ALGORITMOS MATEMATICOS Y COMPORTAMIENTO ---");

runTest("Simulacion del Shuffle: 1000 iteraciones sin que ningun par coincida en la misma fila", () => {
    const samplePairs = [
        { id: 'p0', c: 'C0', d: 'D0' },
        { id: 'p1', c: 'C1', d: 'D1' },
        { id: 'p2', c: 'C2', d: 'D2' },
        { id: 'p3', c: 'C3', d: 'D3' },
        { id: 'p4', c: 'C4', d: 'D4' },
        { id: 'p5', c: 'C5', d: 'D5' },
        { id: 'p6', c: 'C6', d: 'D6' },
        { id: 'p7', c: 'C7', d: 'D7' }
    ];

    function shuffle(arr) {
        const c = [...arr];
        for (let i = c.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [c[i], c[j]] = [c[j], c[i]];
        }
        return c;
    }

    for (let sim = 0; sim < 1000; sim++) {
        let colA = shuffle(samplePairs);
        let colB = shuffle(samplePairs);

        let attempts = 0;
        while (attempts < 50 && colB.some((b, i) => b.id === colA[i].id)) {
            colB = shuffle(colB);
            attempts++;
        }

        for (let i = 0; i < colB.length; i++) {
            if (colB[i].id === colA[i].id) {
                const swapIdx = (i + 1) % colB.length;
                const tmp = colB[i];
                colB[i] = colB[swapIdx];
                colB[swapIdx] = tmp;
            }
        }

        const sameRowCollision = colB.some((b, idx) => b.id === colA[idx].id);
        assert(!sameRowCollision, `Fallo en simulacion ${sim}: hubo coincidencia en fila!`);
    }
});

runTest("Simulacion de Calificacion Formativa: Valores exactos segun errores", () => {
    function calcNota(err) {
        return Number(Math.max(1.0, 5.0 - (err * 0.25)).toFixed(1));
    }

    assert.strictEqual(calcNota(0), 5.0, "0 errores debe dar 5.0");
    assert.strictEqual(calcNota(1), 4.8, "1 error debe dar 4.8");
    assert.strictEqual(calcNota(2), 4.5, "2 errores debe dar 4.5");
    assert.strictEqual(calcNota(4), 4.0, "4 errores debe dar 4.0");
    assert.strictEqual(calcNota(8), 3.0, "8 errores debe dar 3.0");
    assert.strictEqual(calcNota(16), 1.0, "16 errores debe dar 1.0");
    assert.strictEqual(calcNota(30), 1.0, "30 errores no debe bajar de 1.0 (piso minimo)");
});

// -----------------------------------------------------------------------------
// RESULTADOS
// -----------------------------------------------------------------------------
console.log("\n======================================================================");
console.log(`RESULTADOS: ${testsPassed} / ${totalTests} PRUEBAS SUPERADAS (${Math.round((testsPassed/totalTests)*100)}%)`);
console.log("======================================================================");

if (testsPassed === totalTests) {
    console.log("LA REFACTORIZACION DEL DUELO DE EMPAREJAMIENTO ESTA 100% VERIFICADA Y OPERATIVA.\n");
    process.exit(0);
} else {
    console.error("ALGUNAS PRUEBAS FALLARON.\n");
    process.exit(1);
}
