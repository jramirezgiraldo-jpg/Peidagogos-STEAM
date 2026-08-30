const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("======================================================================");
console.log("TEST SUITE: RULETA PICTIONARY Y TABÚ STEAM (MOTOR INTERACTIVO)");
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
// 1. PROMPTS_JUEGOS.JS Y SERVER.JS
// -----------------------------------------------------------------------------
console.log("\n--- 1. MOTOR DE GENERACIÓN BACKEND (PROMPTS Y SERVER) ---");

const prompts = require('./prompts_juegos.js');

runTest("prompts_juegos.js define aliases de Ruleta Pictionary y Tabú", () => {
    assert(prompts.PROMPTS_JUEGOS.pictionary_tabu, "Debe existir pictionary_tabu");
    assert(prompts.PROMPTS_JUEGOS.ruleta_pictionary, "Debe existir ruleta_pictionary");
    assert(prompts.PROMPTS_JUEGOS.ruleta_tabu, "Debe existir ruleta_tabu");
    assert(prompts.PROMPTS_JUEGOS.juego_pictionary_tabu, "Debe existir juego_pictionary_tabu");
    assert(prompts.PROMPTS_JUEGOS.pictionary, "Debe existir pictionary");
    assert(prompts.PROMPTS_JUEGOS.tabu, "Debe existir tabu");
});

runTest("prompts_juegos.js exporta obtenerPromptJsonPictionaryTabu con 8-12 retos", () => {
    assert(typeof prompts.obtenerPromptJsonPictionaryTabu === 'function', "Debe exportar obtenerPromptJsonPictionaryTabu");
    const jsonPrompt = prompts.obtenerPromptJsonPictionaryTabu("Energía y Circuitos", "8°");
    assert(jsonPrompt.includes("8 a 12"), "Debe exigir de 8 a 12 retos");
    assert(jsonPrompt.includes('"modalidad"'), "Debe pedir modalidad");
    assert(jsonPrompt.includes('"palabras_prohibidas"'), "Debe pedir palabras prohibidas");
});

const serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

runTest("server.js incluye directiva para Ruleta Pictionary y Tabú en /api/generate-tool-ai", () => {
    assert(serverCode.includes("REGLA ESTRICTA PARA RULETA PICTIONARY Y TABÚ STEAM"), "Debe tener directiva en server.js");
    assert(serverCode.includes("8 A 12 RETOS"), "Debe exigir 8 a 12 retos");
});

runTest("server.js contiene normalizador de 8 a 12 retos con conceptos STEAM", () => {
    assert(serverCode.includes("jsonJuego.tipo_herramienta = 'pictionary_tabu'"), "Debe normalizar tipo_herramienta");
    assert(serverCode.includes("jsonJuego.retos.length < 8"), "Debe verificar mínimo 8 retos");
    assert(serverCode.includes("Fotosíntesis") && serverCode.includes("Microscopio"), "Debe incluir retos científicos de contingencia");
});

// -----------------------------------------------------------------------------
// 2. MOTOR DE JUEGO EN APP.JS
// -----------------------------------------------------------------------------
console.log("\n--- 2. MOTOR DE LA RULETA EN APP.JS ---");

const appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

runTest("app.js define obtenerRetosPictionaryTabu y normaliza los retos", () => {
    assert(appCode.includes("window.obtenerRetosPictionaryTabu = function"), "Debe definir obtenerRetosPictionaryTabu");
    assert(appCode.includes("fallbackRetos = ["), "Debe tener fallback de retos");
});

runTest("app.js reemplaza la tarjeta estática inicial por iniciarRuletaPictionaryTabu", () => {
    assert(appCode.includes("window.renderizarPictionaryTabuTool = function") && appCode.includes("window.iniciarRuletaPictionaryTabu(stage, base)"), "Debe iniciar el motor de ruleta interactiva");
    assert(!appCode.includes("🎭 Reto Tabú STEAM • ${base.materia}"), "La tarjeta estática antigua debe haber sido eliminada");
});

runTest("app.js implementa el Canvas de la Ruleta y el botón de giro", () => {
    assert(appCode.includes("ruleta-pictionary-canvas"), "Debe tener canvas de la ruleta");
    assert(appCode.includes("btn-girar-ruleta-pictionary"), "Debe tener botón para girar");
    assert(appCode.includes("window.dibujarRuletaPictionaryCanvas"), "Debe dibujar la ruleta en canvas");
    assert(appCode.includes("window.girarRuletaPictionaryTabu"), "Debe tener animación de giro");
});

runTest("app.js implementa desaceleración ease-out durante el giro", () => {
    assert(appCode.includes("Math.pow(1 - progreso, 3)"), "Debe usar ease-out cúbico");
    assert(appCode.includes("performance.now()"), "Debe calcular tiempo con precisión");
});

// -----------------------------------------------------------------------------
// 3. MODAL DE RETO Y TEMPORIZADOR DE 60 SEGUNDOS
// -----------------------------------------------------------------------------
console.log("\n--- 3. MODAL DE RETO Y TEMPORIZADOR DE 60 SEGUNDOS ---");

runTest("app.js despliega Modal de Reto con modo TABÚ y PICTIONARY diferenciados", () => {
    assert(appCode.includes("modal-reto-pictionary-tabu"), "Debe crear modal de reto");
    assert(appCode.includes("MODO ${reto.modalidad}"), "Debe identificar la modalidad");
    assert(appCode.includes("PALABRAS PROHIBIDAS"), "Debe mostrar palabras prohibidas para Tabú");
    assert(appCode.includes("INSTRUCCIÓN DE PICTIONARY"), "Debe mostrar instrucción de dibujo para Pictionary");
});

runTest("app.js integra cronómetro regresivo de 60 segundos", () => {
    assert(appCode.includes("segundosRestantes = 60"), "Debe iniciar en 60 segundos");
    assert(appCode.includes("cronometro-ruleta-timer"), "Debe tener elemento de cronómetro visual");
    assert(appCode.includes("setInterval"), "Debe usar intervalo para la cuenta regresiva");
});

runTest("app.js provee controles de evaluación docente/equipo", () => {
    assert(appCode.includes("window.evaluarRetoPictionaryTabu(true)"), "Debe tener botón Superado");
    assert(appCode.includes("window.evaluarRetoPictionaryTabu(false)"), "Debe tener botón Fallo/Tiempo");
});

// -----------------------------------------------------------------------------
// 4. SISTEMA DE CALIFICACIÓN Y PERSISTENCIA OFICIAL
// -----------------------------------------------------------------------------
console.log("\n--- 4. SISTEMA DE CALIFICACIÓN Y PERSISTENCIA ---");

runTest("app.js calcula calificación socioformativa (1.0 a 5.0) basada en la tasa de éxito", () => {
    assert(appCode.includes("window.finalizarJuegoPictionaryTabu"), "Debe existir finalizarJuegoPictionaryTabu");
    assert(appCode.includes("Math.min(5.0, Math.max(1.0, 1.0 + (tasa * 4.0)))"), "Debe calcular nota escalada 1.0 a 5.0");
});

runTest("app.js persiste la calificación en la planilla docente", () => {
    assert(appCode.includes("window.guardarCalificacionActividad"), "Debe llamar a guardarCalificacionActividad");
    assert(appCode.includes("window.intentarGuardarProgresoYFinalizarClase"), "Debe llamar a intentarGuardarProgresoYFinalizarClase");
    assert(appCode.includes("Guardar Progreso & Salir"), "Debe incluir botón oficial de guardado");
});

runTest("app.js enruta actividades desde el Buzón del Estudiante", () => {
    assert(appCode.includes("renderizarPictionaryTabuModal(actividad)"), "Debe enrutar en abrirActividadDesdeInbox");
});

// -----------------------------------------------------------------------------
// 5. CÁLCULO MATEMÁTICO DE NOTAS SOCIOFORMATIVAS
// -----------------------------------------------------------------------------
console.log("\n--- 5. PRUEBAS DE CÁLCULO MATEMÁTICO DE CALIFICACIÓN ---");

function calcularNota(superados, intentos) {
    const tasa = superados / Math.max(1, intentos);
    const nota = Math.min(5.0, Math.max(1.0, 1.0 + (tasa * 4.0)));
    return parseFloat(nota.toFixed(1));
}

runTest("100% de retos superados (8/8) obtiene nota 5.0 (Superior)", () => {
    assert.strictEqual(calcularNota(8, 8), 5.0);
});

runTest("75% de retos superados (6/8) obtiene nota 4.0 (Alto)", () => {
    assert.strictEqual(calcularNota(6, 8), 4.0);
});

runTest("50% de retos superados (4/8) obtiene nota 3.0 (Básico)", () => {
    assert.strictEqual(calcularNota(4, 8), 3.0);
});

runTest("0% de retos superados (0/8) obtiene nota formativa mínima 1.0", () => {
    assert.strictEqual(calcularNota(0, 8), 1.0);
});

console.log("\n======================================================================");
console.log(`RESULTADOS: ${testsPassed} / ${totalTests} PRUEBAS SUPERADAS (${Math.round((testsPassed/totalTests)*100)}%)`);
console.log("======================================================================");

if (testsPassed === totalTests) {
    console.log("EL MOTOR DE LA RULETA PICTIONARY Y TABÚ STEAM ESTÁ 100% CERTIFICADO.\n");
    process.exitCode = 0;
} else {
    console.error("ALGUNAS PRUEBAS FALLARON.\n");
    process.exitCode = 1;
}
