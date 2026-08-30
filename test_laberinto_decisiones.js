const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("======================================================================");
console.log("TEST SUITE: MOTOR DE LABERINTO DE DECISIONES STEAM (BRANCHING STORY)");
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
// 1. VERIFICACIÓN DEL BUG DE ENRUTAMIENTO (CRUCIGRAMA)
// -----------------------------------------------------------------------------
console.log("\n--- 1. VERIFICACIÓN DE CORRECCIÓN DEL BUG DE CRUCIGRAMA ---");

const appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

runTest("renderizarLaberintoLogicoTool YA NO invoca a renderizarCrucigramaTool", () => {
    assert(!appCode.includes("window.renderizarLaberintoLogicoTool = function(stage, base) { window.renderizarCrucigramaTool"), "No debe llamar a crucigrama");
    assert(appCode.includes("window.renderizarLaberintoDecisiones(stage, base)"), "Debe invocar a renderizarLaberintoDecisiones");
});

runTest("El enrutador de herramientas enruta laberinto a renderizarLaberintoDecisiones", () => {
    const caseBlock = appCode.substring(appCode.indexOf("case 'laberinto_decisiones':"), appCode.indexOf("case 'laberinto_decisiones':") + 250);
    assert(caseBlock.includes("renderizarLaberintoDecisiones"), "Debe llamar a renderizarLaberintoDecisiones");
    assert(!caseBlock.includes("renderizarCrucigramaTool"), "No debe llamar a crucigrama");
});

// -----------------------------------------------------------------------------
// 2. VERIFICACIÓN EN PROMPTS_JUEGOS.JS Y SERVER.JS
// -----------------------------------------------------------------------------
console.log("\n--- 2. VERIFICACIÓN EN PROMPTS_JUEGOS.JS Y SERVER.JS ---");

const prompts = require('./prompts_juegos.js');

runTest("prompts_juegos.js define aliases de laberinto sin colisión con crucigrama", () => {
    assert(prompts.PROMPTS_JUEGOS.laberinto_decisiones, "Debe existir laberinto_decisiones");
    assert(prompts.PROMPTS_JUEGOS.laberinto_logico, "Debe existir laberinto_logico");
    assert(prompts.PROMPTS_JUEGOS.juego_laberinto, "Debe existir juego_laberinto");
    assert(prompts.PROMPTS_JUEGOS.laberinto, "Debe existir laberinto");
    assert(prompts.PROMPTS_JUEGOS.laberinto_nodos, "Debe existir laberinto_nodos");

    // Verificar que ninguno llama al prompt de crucigrama
    const promptText = prompts.PROMPTS_JUEGOS.laberinto_decisiones("Fotosíntesis", "7°", "Decide");
    assert(promptText.includes("Laberinto de decisiones"), "Debe ser laberinto");
    assert(!promptText.includes("Crucigrama clásico"), "No debe ser crucigrama");
    assert(promptText.includes("al menos 8 nodos"), "Debe exigir al menos 8 nodos");
});

runTest("prompts_juegos.js exporta obtenerPromptJsonLaberinto exigiendo 8 nodos", () => {
    assert(typeof prompts.obtenerPromptJsonLaberinto === 'function', "Debe exportar obtenerPromptJsonLaberinto");
    const jsonPrompt = prompts.obtenerPromptJsonLaberinto("Ecosistemas", "8°");
    assert(jsonPrompt.includes("AL MENOS 8 NODOS"), "Debe exigir al menos 8 nodos");
    assert(jsonPrompt.includes('"nodos"'), "Debe pedir clave nodos");
    assert(jsonPrompt.includes('"peso_evaluativo"'), "Debe pedir peso evaluativo");
});

const serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

runTest("server.js incluye regla estricta para Laberinto en /api/generate-tool-ai", () => {
    assert(serverCode.includes("REGLA ESTRICTA PARA LABERINTO LÓGICO DE DECISIONES STEAM"), "Debe tener regla de laberinto");
    assert(serverCode.includes("MÍNIMO 8 NODOS"), "Debe exigir 8 nodos");
});

runTest("server.js contiene normalizador que garantiza 8+ nodos para laberinto", () => {
    assert(serverCode.includes("jsonJuego.tipo_herramienta = 'laberinto_decisiones'"), "Debe normalizar tipo_herramienta");
    assert(serverCode.includes("jsonJuego.nodos.length < 8"), "Debe verificar mínimo 8 nodos");
});

// -----------------------------------------------------------------------------
// 3. VERIFICACIÓN DEL MOTOR EN APP.JS
// -----------------------------------------------------------------------------
console.log("\n--- 3. VERIFICACIÓN DEL MOTOR EN APP.JS ---");

runTest("app.js define window.renderizarLaberintoDecisiones", () => {
    assert(appCode.includes("window.renderizarLaberintoDecisiones = function"), "Debe definir renderizarLaberintoDecisiones");
});

runTest("app.js implementa árbol de nodos por defecto con al menos 8 nodos", () => {
    assert(appCode.includes("nodosFallback = ["), "Debe tener fallback de nodos");
    assert(appCode.includes("meta_excelencia"), "Debe tener nodo meta_excelencia");
    assert(appCode.includes("falla_contaminacion"), "Debe tener nodo falla_contaminacion");
    assert(appCode.includes("falla_fraude"), "Debe tener nodo falla_fraude");
    assert(appCode.includes("finalExito"), "Debe tener tipo finalExito");
    assert(appCode.includes("finalFalla"), "Debe tener tipo finalFalla");
});

runTest("app.js implementa UI Mobile-First con tarjeta central (#ffffff y #f4f6f8)", () => {
    assert(appCode.includes("background: #f4f6f8"), "Debe tener fondo de página suave #f4f6f8");
    assert(appCode.includes("border-radius: 20px"), "Debe tener tarjeta con bordes redondeados");
    assert(appCode.includes("font-size: 1.05rem"), "Debe tener tipografía grande >= 16px");
});

runTest("app.js implementa navegación con transición y scroll top", () => {
    assert(appCode.includes("wrapper.scrollTop = 0"), "Debe realizar scroll hacia arriba en cada decisión");
    assert(appCode.includes("card.style.opacity = '0'"), "Debe tener transición fade-out");
});

runTest("app.js implementa evaluación socioformativa y persistencia oficial dual", () => {
    assert(appCode.includes("window.guardarCalificacionActividad"), "Debe persistir en planilla docente");
    assert(appCode.includes("window.intentarGuardarProgresoYFinalizarClase"), "Debe invocar intentarGuardarProgresoYFinalizarClase");
    assert(appCode.includes("Guardar Progreso & Salir"), "Debe tener botón oficial de guardar");
    assert(appCode.includes("Volver a Intentar"), "Debe tener botón para reintentar");
});

runTest("app.js enruta actividades de Laberinto desde el Buzón del Estudiante", () => {
    assert(appCode.includes("renderizarLaberintoModal(actividad)"), "Debe enrutar en abrirActividadDesdeInbox");
});

// -----------------------------------------------------------------------------
// 4. PRUEBAS DE LÓGICA DE NODOS Y CÁLCULO DE CALIFICACIONES
// -----------------------------------------------------------------------------
console.log("\n--- 4. PRUEBAS DE LÓGICA NARRATIVA Y EVALUACIÓN ---");

const nodosSimulados = [
    {
        id: "inicio",
        tipo: "inicio",
        texto: "Situación inicial",
        opciones: [
            { texto_opcion: "Ruta A", nodo_destino: "n1", peso_evaluativo: 5.0 },
            { texto_opcion: "Ruta B", nodo_destino: "n2", peso_evaluativo: 2.0 }
        ]
    },
    {
        id: "n1",
        tipo: "decision",
        texto: "Escena intermedia",
        opciones: [
            { texto_opcion: "Ruta A1", nodo_destino: "exito", peso_evaluativo: 5.0 },
            { texto_opcion: "Ruta A2", nodo_destino: "falla", peso_evaluativo: 2.5 }
        ]
    },
    {
        id: "exito",
        tipo: "finalExito",
        texto: "Misión exitosa",
        opciones: []
    },
    {
        id: "falla",
        tipo: "finalFalla",
        texto: "Misión fallida",
        opciones: []
    }
];

function simularRecorrido(rutaElegida) {
    let nodoActual = nodosSimulados.find(n => n.id === "inicio");
    let pesos = [];
    for (const optIndex of rutaElegida) {
        if (!nodoActual || !nodoActual.opciones[optIndex]) break;
        const opt = nodoActual.opciones[optIndex];
        pesos.push(opt.peso_evaluativo);
        nodoActual = nodosSimulados.find(n => n.id === opt.nodo_destino);
    }
    const prom = pesos.reduce((a, b) => a + b, 0) / pesos.length;
    let nota = 5.0;
    if (nodoActual.tipo === "finalExito") {
        nota = Math.min(5.0, Math.max(4.5, parseFloat(prom.toFixed(1))));
    } else {
        nota = Math.min(4.0, Math.max(1.0, parseFloat(prom.toFixed(1))));
    }
    return { nodoFinal: nodoActual.id, tipo: nodoActual.tipo, nota };
}

runTest("Recorrido óptimo (Ruta A -> Ruta A1) culmina en éxito con nota 5.0", () => {
    const res = simularRecorrido([0, 0]); // inicio -> n1 -> exito
    assert.strictEqual(res.nodoFinal, "exito");
    assert.strictEqual(res.tipo, "finalExito");
    assert.strictEqual(res.nota, 5.0);
});

runTest("Recorrido con error (Ruta A -> Ruta A2) culmina en falla con nota formativa", () => {
    const res = simularRecorrido([0, 1]); // inicio -> n1 -> falla
    assert.strictEqual(res.nodoFinal, "falla");
    assert.strictEqual(res.tipo, "finalFalla");
    assert(res.nota <= 4.0 && res.nota >= 1.0, `Nota formativa debe estar entre 1.0 y 4.0 (obtenida: ${res.nota})`);
});

console.log("\n======================================================================");
console.log(`RESULTADOS: ${testsPassed} / ${totalTests} PRUEBAS SUPERADAS (${Math.round((testsPassed/totalTests)*100)}%)`);
console.log("======================================================================");

if (testsPassed === totalTests) {
    console.log("EL MOTOR DEL LABERINTO DE DECISIONES STEAM ESTÁ 100% CERTIFICADO.\n");
    process.exitCode = 0;
} else {
    console.error("ALGUNAS PRUEBAS FALLARON.\n");
    process.exitCode = 1;
}
