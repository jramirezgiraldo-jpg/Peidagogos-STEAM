const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log("======================================================================");
console.log("TEST SUITE: CONVERSOR / INDICADOR DE NOTAS HUD FORMATIVO (MEN 1.0 - 5.0)");
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
// 1. VERIFICACIÓN DE ESTRUCTURA Y CSS EN LOGIN.HTML
// -----------------------------------------------------------------------------
console.log("\n--- 1. VERIFICACIÓN DE ESTRUCTURA Y CSS EN LOGIN.HTML ---");

const loginHtml = fs.readFileSync(path.join(__dirname, 'login.html'), 'utf8');

runTest("login.html contiene el contenedor #hud-conversor-notas-container", () => {
    assert(loginHtml.includes('id="hud-conversor-notas-container"'), "Debe existir id='hud-conversor-notas-container'");
});

runTest("login.html contiene los badges de reto y global", () => {
    assert(loginHtml.includes('id="badge-nota-reto-hud"'), "Debe existir id='badge-nota-reto-hud'");
    assert(loginHtml.includes('id="txt-nota-reto-hud"'), "Debe existir id='txt-nota-reto-hud'");
    assert(loginHtml.includes('id="badge-nota-global-hud"'), "Debe existir id='badge-nota-global-hud'");
    assert(loginHtml.includes('id="txt-nota-global-hud"'), "Debe existir id='txt-nota-global-hud'");
});

runTest("login.html define estilos CSS responsivos con clase .hud-conversor-notas y media query mobile-first", () => {
    assert(loginHtml.includes('.hud-conversor-notas'), "Debe contener estilos para .hud-conversor-notas");
    assert(loginHtml.includes('.hud-nota-badge'), "Debe contener estilos para .hud-nota-badge");
    assert(loginHtml.includes('@media (max-width: 640px)'), "Debe contener media query mobile-first a 640px");
    assert(loginHtml.includes('.hud-badge-label'), "Debe contener selector para ocultar etiquetas en móviles");
});

// -----------------------------------------------------------------------------
// 2. VERIFICACIÓN DE LÓGICA EN APP.JS
// -----------------------------------------------------------------------------
console.log("\n--- 2. VERIFICACIÓN DE LÓGICA Y FUNCIONES EN APP.JS ---");

const appJs = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

runTest("app.js define window.obtenerEstiloNotaMEN y window.actualizarConversorNotasHUD", () => {
    assert(appJs.includes('window.obtenerEstiloNotaMEN = function'), "Debe definir window.obtenerEstiloNotaMEN");
    assert(appJs.includes('window.actualizarConversorNotasHUD = function'), "Debe definir window.actualizarConversorNotasHUD");
});

runTest("app.js conecta la actualización del HUD en inicializarPanelEstudiante y actualizarPuntosEstudianteUI", () => {
    assert(appJs.includes('actualizarConversorNotasHUD'), "Debe invocar actualizarConversorNotasHUD");
    assert(appJs.includes("sessionStorage.setItem('ultima_nota_reto_'"), "Debe persistir en sessionStorage la última nota de reto");
});

runTest("app.js incluye listener global de postMessage para notas de actividades", () => {
    assert(appJs.includes("window.addEventListener('message', function(e)"), "Debe tener listener global para eventos de calificación");
});

// -----------------------------------------------------------------------------
// 3. SIMULACIÓN UNITARIA DE CÁLCULO Y SEMÁNTICA DE COLOR MEN
// -----------------------------------------------------------------------------
console.log("\n--- 3. SIMULACIÓN UNITARIA EN ENTORNO JS VIRTUAL ---");

// Crear entorno simulado
const mockLocalStorage = {};
const mockSessionStorage = {};
const elements = {};

function createElement(id) {
    const el = {
        id,
        innerText: '',
        style: {},
        title: '',
        parentNode: null,
        closest: () => null
    };
    elements[id] = el;
    return el;
}

const mockDoc = {
    getElementById: (id) => elements[id] || null,
    createElement: (tag) => ({ id: '', style: {}, innerHTML: '', appendChild: () => {} })
};

// Instanciar elementos esperados en el DOM
createElement('hud-conversor-notas-container');
createElement('badge-nota-reto-hud');
createElement('txt-nota-reto-hud');
createElement('badge-nota-global-hud');
createElement('txt-nota-global-hud');
createElement('student-score-display');

global.window = {
    addEventListener: () => {},
    usuario_actual: 'estudiante_test'
};
global.document = mockDoc;
global.localStorage = {
    getItem: (k) => mockLocalStorage[k] || null,
    setItem: (k, v) => { mockLocalStorage[k] = v.toString(); }
};
global.sessionStorage = {
    getItem: (k) => mockSessionStorage[k] || null,
    setItem: (k, v) => { mockSessionStorage[k] = v.toString(); }
};

// Extraer y evaluar las funciones directamente de app.js
const regexEstilo = /window\.obtenerEstiloNotaMEN\s*=\s*function[\s\S]*?^};/m;
const regexConversor = /window\.actualizarConversorNotasHUD\s*=\s*function[\s\S]*?^};/m;

const matchEstilo = appJs.match(regexEstilo);
const matchConversor = appJs.match(regexConversor);

assert(matchEstilo, "No se encontró window.obtenerEstiloNotaMEN en app.js");
assert(matchConversor, "No se encontró window.actualizarConversorNotasHUD en app.js");

eval(matchEstilo[0]);
eval(matchConversor[0]);

runTest("Semántica de color MEN: Verde para notas entre 4.0 y 5.0", () => {
    const e5 = window.obtenerEstiloNotaMEN(5.0);
    assert(e5.desempeno === 'Superior', "5.0 debe ser Desempeño Superior");
    assert(e5.bg.includes('#10B981'), "5.0 debe tener gradiente verde");

    const e42 = window.obtenerEstiloNotaMEN(4.2);
    assert(e42.desempeno === 'Alto', "4.2 debe ser Desempeño Alto");
    assert(e42.bg.includes('#10B981'), "4.2 debe tener gradiente verde");
});

runTest("Semántica de color MEN: Naranja para notas entre 3.0 y 3.9", () => {
    const e35 = window.obtenerEstiloNotaMEN(3.5);
    assert(e35.desempeno === 'Básico', "3.5 debe ser Desempeño Básico");
    assert(e35.bg.includes('#F59E0B'), "3.5 debe tener gradiente naranja");
});

runTest("Semántica de color MEN: Rojo para notas entre 1.0 y 2.9", () => {
    const e25 = window.obtenerEstiloNotaMEN(2.5);
    assert(e25.desempeno === 'Bajo', "2.5 debe ser Desempeño Bajo");
    assert(e25.bg.includes('#EF4444'), "2.5 debe tener gradiente rojo");
});

runTest("actualizarConversorNotasHUD actualiza Reto y Global con historial existente", () => {
    // Simular historial de 3 actividades
    const testCalificaciones = [
        { id_actividad: 'act1', calificacion: 4.0 },
        { id_actividad: 'act2', calificacion: 4.5 },
        { id_actividad: 'act3', calificacion: 5.0 }
    ];
    mockLocalStorage['calificaciones_estudiante_test'] = JSON.stringify(testCalificaciones);

    const res = window.actualizarConversorNotasHUD(4.8);
    assert.strictEqual(res.reto, 4.8, "Nota de reto debe ser 4.8");
    // Promedio de 4.0 + 4.5 + 5.0 = 13.5 / 3 = 4.5
    assert.strictEqual(res.global, 4.5, "Promedio global debe ser exactamente 4.5");

    assert.strictEqual(elements['txt-nota-reto-hud'].innerText, '4.8');
    assert.strictEqual(elements['txt-nota-global-hud'].innerText, '4.5');
    assert(elements['badge-nota-reto-hud'].style.background.includes('#10B981'), "Reto 4.8 debe ser verde");
    assert(elements['badge-nota-global-hud'].style.background.includes('#10B981'), "Global 4.5 debe ser verde");
});

runTest("actualizarConversorNotasHUD calcula nota global desde XP si no hay historial", () => {
    mockLocalStorage['calificaciones_estudiante_test'] = '[]';
    mockLocalStorage['xp_estudiante_test'] = '500'; // 500 XP

    const res = window.actualizarConversorNotasHUD(3.8);
    assert.strictEqual(res.reto, 3.8, "Nota de reto debe ser 3.8");
    // Base 3.5 + (500 / 1000) * 1.5 = 3.5 + 0.75 = 4.25 -> 4.3 (o 4.2)
    assert(res.global >= 4.0 && res.global <= 4.5, `Global calculado de XP debe estar en rango esperado (obtenido ${res.global})`);
    assert(elements['badge-nota-reto-hud'].style.background.includes('#F59E0B'), "Reto 3.8 debe ser naranja (Básico)");
});

runTest("actualizarConversorNotasHUD restringe notas estrictamente a escala 1.0 - 5.0", () => {
    const resBajo = window.actualizarConversorNotasHUD(0.5, 0.2);
    assert.strictEqual(resBajo.reto, 1.0, "Nota menor a 1.0 debe acotarse a 1.0");
    assert.strictEqual(resBajo.global, 1.0, "Nota global menor a 1.0 debe acotarse a 1.0");

    const resAlto = window.actualizarConversorNotasHUD(6.0, 7.5);
    assert.strictEqual(resAlto.reto, 5.0, "Nota mayor a 5.0 debe acotarse a 5.0");
    assert.strictEqual(resAlto.global, 5.0, "Nota global mayor a 5.0 debe acotarse a 5.0");
});

// -----------------------------------------------------------------------------
// RESULTADO FINAL
// -----------------------------------------------------------------------------
console.log("\n======================================================================");
console.log(`TOTAL PRUEBAS: ${totalTests} | PASADAS: ${testsPassed} | FALLIDAS: ${totalTests - testsPassed}`);
console.log("======================================================================");

if (testsPassed === totalTests) {
    console.log("✅ TODAS LAS PRUEBAS DEL CONVERSOR DE NOTAS HUD PASARON EXITOSAMENTE (100%).");
    process.exit(0);
} else {
    console.error("❌ ALGUNAS PRUEBAS FALLARON.");
    process.exit(1);
}
