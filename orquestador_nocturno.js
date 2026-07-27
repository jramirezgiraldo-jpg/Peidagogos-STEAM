const fs = require('fs');
const { exec } = require('child_process');
const cron = require('node-cron');
const path = require('path');

console.log("==========================================");
console.log("🌙 ORQUESTADOR NOCTURNO INICIADO");
console.log("El celador está despierto y esperando a las 2:00 AM.");
console.log("==========================================");

// Lista de semanas del Periodo 1 (Bloques quincenales)
const semanasAProcesar = ["1", "3", "5", "7"];
let diaActualIndex = 0; // Día 0 = Semana 1, Día 1 = Semana 3, etc.

// Tarea programada para correr a las 2:00 AM todos los días
cron.schedule('0 2 * * *', () => {
    console.log(`\n[${new Date().toISOString()}] ⏰ ¡Son las 2:00 AM! Iniciando turno de generación...`);
    
    if (diaActualIndex >= semanasAProcesar.length) {
        console.log("🎉 ¡Todos los bloques del Periodo 1 han sido generados!");
        return;
    }

    const semanaObjetivo = semanasAProcesar[diaActualIndex];
    console.log(`🚀 Iniciando generación para la SEMANA ${semanaObjetivo}...`);

    // Ejecutar generador_masivo.js pasándole la semana como argumento
    const child = exec(`node generador_masivo.js ${semanaObjetivo}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error al ejecutar el generador: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`⚠️ Advertencia del generador: ${stderr}`);
        }
        console.log(`✅ Generación de la Semana ${semanaObjetivo} finalizada exitosamente.`);
        console.log(stdout);

        // Subir a GitHub
        console.log("📦 Subiendo guías a GitHub...");
        exec('git add . && git commit -m "Auto-generación nocturna: Semana ' + semanaObjetivo + '" && git push', (errGit, stdOutGit, stdErrGit) => {
            if (errGit) {
                console.error(`❌ Error subiendo a GitHub: ${errGit.message}`);
                return;
            }
            console.log("✅ Guías subidas exitosamente a GitHub. Render se actualizará pronto.");
            console.log("💤 El celador vuelve a dormir hasta mañana.");
            
            // Avanzar al siguiente bloque para la próxima noche
            diaActualIndex++;
        });
    });

    child.stdout.on('data', (data) => {
        process.stdout.write(data);
    });

});
