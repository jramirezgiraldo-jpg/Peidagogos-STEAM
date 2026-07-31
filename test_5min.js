const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const cacheDir = path.join(__dirname, 'guias_cache');
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

// Contar archivos iniciales
const initialFiles = fs.readdirSync(cacheDir).filter(f => f.endsWith('.json')).length;

console.log("=========================================");
console.log("🚀 INICIANDO PRUEBA DE 5 MINUTOS (API DE PAGO)");
console.log(`Intervalo configurado: 6 segundos por guía (10 RPM)`);
console.log("=========================================\n");

// Arrancar el generador en un proceso hijo
const child = spawn('node', ['generador_cron.js'], { stdio: 'inherit', cwd: __dirname });

// Temporizador exacto de 5 minutos (300,000 ms)
setTimeout(() => {
    console.log("\n⏳ TIEMPO DE PRUEBA TERMINADO (5 Minutos). Deteniendo motor...");
    
    // Matar el proceso hijo
    child.kill('SIGINT');
    
    // Darle 2 segundos al FileSystem para asentarse y contar
    setTimeout(() => {
        const finalFiles = fs.readdirSync(cacheDir).filter(f => f.endsWith('.json')).length;
        const generated = finalFiles - initialFiles;
        
        console.log(`\n✅ === RESULTADO FINAL ===`);
        console.log(`Guías generadas exitosamente en 5 minutos: ${generated}`);
        console.log(`Tasa efectiva: ${generated / 5} guías por minuto`);
        console.log(`=========================\n`);
        
        process.exit(0);
    }, 2000);

}, 5 * 60 * 1000);
