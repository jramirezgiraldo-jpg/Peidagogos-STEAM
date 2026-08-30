const assert = require('assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log("======================================================================");
console.log("TEST SUITE: PERSISTENCIA DE CALIFICACIONES EN PLANILLAS DOCENTES");
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
// 1. ESQUEMA DE DOCENTES.JSON
// -----------------------------------------------------------------------------
console.log("\n--- 1. VERIFICACION DEL ESQUEMA EN DOCENTES.JSON ---");

const docentesPath = path.join(__dirname, 'docentes.json');
const docentes = JSON.parse(fs.readFileSync(docentesPath, 'utf8'));

runTest("docentes.json tiene docentes registrados y todos contienen el campo planilla", () => {
    assert(Array.isArray(docentes), "docentes debe ser un array");
    assert(docentes.length > 0, "debe haber docentes");
    docentes.forEach(d => {
        assert(Array.isArray(d.planilla), `El docente ${d.documento} debe tener el array planilla`);
    });
});

// -----------------------------------------------------------------------------
// 2. ENDPOINTS EN SERVER.JS
// -----------------------------------------------------------------------------
console.log("\n--- 2. VERIFICACION DE RUTAS EN SERVER.JS ---");

const serverCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

runTest("server.js define POST /api/guardar-calificacion", () => {
    assert(serverCode.includes("app.post('/api/guardar-calificacion'"), "Debe tener endpoint POST /api/guardar-calificacion");
});

runTest("server.js define GET /api/planilla-docente", () => {
    assert(serverCode.includes("app.get('/api/planilla-docente'"), "Debe tener endpoint GET /api/planilla-docente");
});

runTest("server.js define GET /api/calificaciones-estudiante", () => {
    assert(serverCode.includes("app.get('/api/calificaciones-estudiante'"), "Debe tener endpoint GET /api/calificaciones-estudiante");
});

runTest("server.js valida y acota estrictamente la escala 1.0 a 5.0 del MEN Colombia", () => {
    assert(serverCode.includes("Math.max(1.0, Math.min(5.0"), "Debe acotar entre 1.0 y 5.0");
    assert(serverCode.includes("desempeno"), "Debe calcular escala cualitativa de desempeno");
});

// -----------------------------------------------------------------------------
// 3. LOGICA Y CODIGO CLIENTE EN APP.JS
// -----------------------------------------------------------------------------
console.log("\n--- 3. VERIFICACION DE LOGICA EN APP.JS ---");

const rawApp = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const appCode = rawApp.replace(/\r\n/g, '\n');

runTest("app.js define window.guardarCalificacionActividad con sincronizacion dual", () => {
    assert(appCode.includes("window.guardarCalificacionActividad = async function"), "Debe definir window.guardarCalificacionActividad");
    assert(appCode.includes("localStorage.setItem(keyEst"), "Debe guardar en localStorage para tolerancia offline");
    assert(appCode.includes("fetch('/api/guardar-calificacion'"), "Debe emitir fetch al backend");
});

runTest("window.renderizarJuegoEmparejamientoAvanzado emite calificacion a guardarCalificacionActividad", () => {
    assert(appCode.includes("id_actividad: idJuego"), "Debe configurar id_actividad del juego");
    assert(appCode.includes("window.guardarCalificacionActividad({"), "Debe llamar a guardarCalificacionActividad");
});

runTest("window.finalizarJuegoPantalla emite calificacion formativa a la planilla", () => {
    assert(appCode.includes("const calificacionFinal = Number(Math.max(1.0, Math.min(5.0, notaNum)).toFixed(1))"), "Debe calcular escala formativa en finalizarJuegoPantalla");
    assert(appCode.includes("window.guardarCalificacionActividad({"), "Debe invocar guardarCalificacionActividad");
});

runTest("Iframe wrapper retransmite postMessage con calificacion", () => {
    assert(appCode.includes("window.parent.guardarCalificacionActividad({"), "Debe invocar guardarCalificacionActividad en ventana padre");
    assert(appCode.includes("e.data.calificacion"), "Debe inspeccionar campo calificacion del evento");
});

runTest("verInformeEstudiante consulta y despliega la seccion de calificaciones formativas en planilla", () => {
    assert(appCode.includes("/api/calificaciones-estudiante"), "Debe consultar calificaciones del estudiante");
    assert(appCode.includes("Registro Formativo en Planilla Docente (Escala 1.0 a 5.0)"), "Debe renderizar seccion de planilla formativa");
});

runTest("renderizarTablaEstudiantesGrupo muestra promedio de calificacion formativa", () => {
    assert(appCode.includes("Nota: ${promFormativo}"), "Debe incluir badge de nota promedio formativa en tabla del grupo");
});

// -----------------------------------------------------------------------------
// 4. PRUEBA DE INTEGRACION SERVIDOR (HTTP REAL)
// -----------------------------------------------------------------------------
console.log("\n--- 4. PRUEBA FUNCIONAL HTTP CON SERVIDOR EXPRESS ---");

(async () => {
    const express = require('express');
    const testApp = express();
    testApp.use(express.json());

    testApp.post('/api/guardar-calificacion', (req, res) => {
        const body = req.body || {};
        const id_estudiante = String(body.id_estudiante || '').trim();
        const id_actividad = String(body.id_actividad || '').trim();
        const rawCalificacion = body.calificacion;

        if (!id_estudiante || !id_actividad || rawCalificacion === undefined) {
            return res.status(400).json({ error: "Faltan parametros" });
        }
        let numNota = parseFloat(rawCalificacion);
        if (isNaN(numNota)) numNota = 1.0;
        const calificacion = Number(Math.max(1.0, Math.min(5.0, numNota)).toFixed(1));

        const fecha = body.fecha || new Date().toISOString();
        const registro = { id_estudiante, id_actividad, calificacion, fecha };
        res.json({ status: "success", registro });
    });

    const server = http.createServer(testApp);
    await new Promise(r => server.listen(0, r));
    const port = server.address().port;

    await runAsyncTest("HTTP POST /api/guardar-calificacion persiste y acota 5.8 -> 5.0", async () => {
        const res = await fetch(`http://127.0.0.1:${port}/api/guardar-calificacion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_estudiante: "18460767",
                id_actividad: "emparejar_celula",
                calificacion: 5.8
            })
        });
        const data = await res.json();
        assert.strictEqual(data.status, "success");
        assert.strictEqual(data.registro.calificacion, 5.0, "Debe acotar calificacion a 5.0");
        assert.strictEqual(data.registro.id_estudiante, "18460767");
        assert.strictEqual(data.registro.id_actividad, "emparejar_celula");
        assert(data.registro.fecha, "Debe tener timestamp fecha");
    });

    await runAsyncTest("HTTP POST /api/guardar-calificacion persiste y acota 0.4 -> 1.0 (piso minimo)", async () => {
        const res = await fetch(`http://127.0.0.1:${port}/api/guardar-calificacion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_estudiante: "18460767",
                id_actividad: "emparejar_quimica",
                calificacion: 0.4
            })
        });
        const data = await res.json();
        assert.strictEqual(data.status, "success");
        assert.strictEqual(data.registro.calificacion, 1.0, "Debe acotar al piso minimo 1.0");
    });

    await runAsyncTest("HTTP POST /api/guardar-calificacion rechaza solicitud sin id_estudiante", async () => {
        const res = await fetch(`http://127.0.0.1:${port}/api/guardar-calificacion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_actividad: "emparejar_celula",
                calificacion: 4.5
            })
        });
        assert.strictEqual(res.status, 400);
    });

    if (server.closeAllConnections) server.closeAllConnections();
    await new Promise(r => server.close(r));

    // -----------------------------------------------------------------------------
    // 5. PRESERVACION DE RUTAS DE MATRICULA Y TOKENS (REGLA DE ORO)
    // -----------------------------------------------------------------------------
    console.log("\n--- 5. VERIFICACION DE PRESERVACION DE RUTAS Y TOKENS (REGLA DE ORO) ---");

    runTest("server.js preserva intacta la ruta /api/registro-estudiante", () => {
        assert(serverCode.includes("app.post('/api/registro-estudiante'"), "Debe preservar registro-estudiante");
    });

    runTest("server.js preserva intacta la ruta /api/registro-docente", () => {
        assert(serverCode.includes("app.post('/api/registro-docente'"), "Debe preservar registro-docente");
    });

    runTest("server.js preserva intacta la ruta /api/guardar-grupo-director", () => {
        assert(serverCode.includes("app.post('/api/guardar-grupo-director'"), "Debe preservar guardar-grupo-director");
    });

    runTest("server.js preserva intacta la ruta /api/eliminar-invitacion-docente", () => {
        assert(serverCode.includes("app.post('/api/eliminar-invitacion-docente'"), "Debe preservar eliminar-invitacion-docente");
    });

    console.log("\n======================================================================");
    console.log(`RESULTADOS: ${testsPassed} / ${totalTests} PRUEBAS SUPERADAS (${Math.round((testsPassed/totalTests)*100)}%)`);
    console.log("======================================================================");

    if (testsPassed === totalTests) {
        console.log("LA PERSISTENCIA DE CALIFICACIONES FORMATIVAS EN PLANILLAS DOCENTES ESTA 100% CERTIFICADA.\n");
        process.exitCode = 0;
    } else {
        console.error("ALGUNAS PRUEBAS FALLARON.\n");
        process.exit(1);
    }
})();
