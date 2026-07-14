const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const roles = [
    "Detective de Misterios",
    "Explorador Espacial",
    // "Científico Loco",
    // "Youtuber Científico",
    // "Hacker Tecnológico"
];

const ambientes = [
    "Mundo Post-Apocalíptico",
    "Estación Espacial Internacional",
    // "Expedición en la Selva",
    // "Laboratorio Secreto Subterráneo",
    // "Metrópolis del Futuro"
];

const niveles = [
    "Modo Novato (Fácil)",
    "Modo Supervivencia (Intermedio)",
    // "Modo Héroe (Difícil)",
    // "Modo Dios (Reto Épico)"
];

const enfoques = [
    "Resolver un misterio (Indagación)",
    "Explicar un fenómeno extraño",
    // "Usar la ciencia para sobrevivir",
    // "Desmentir un mito popular"
];

const materias = [
    {
        asignatura: "Física",
        grado: "6",
        periodo: "3",
        semana: "1",
        meta: "Revisión del movimiento planetario desde el punto de vista científico.",
        topico: "Revisión del movimiento planetario desde el punto de vista científico."
    },
    {
        asignatura: "Física",
        grado: "7",
        periodo: "3",
        semana: "1",
        meta: "Analizar gráficamente el movimiento bidimensional y aplicar el principio de conservación de la energía mecánica.",
        topico: "Características de un cuerpo que se mueve en dos dimensiones."
    },
    {
        asignatura: "Turismo",
        grado: "7",
        periodo: "3",
        semana: "1",
        meta: "Desarrollar una mentalidad emprendedora y de reconocimiento cultural, valorando la riqueza del Eje Cafetero y de Colombia, así como el Paisaje Cultural Cafetero (PCC).",
        topico: "El eje cafetero. Departamentos más importantes."
    }
];

// Generar combinaciones
let combinaciones = [];
materias.forEach(mat => {
    roles.forEach(rol => {
        ambientes.forEach(ambiente => {
            niveles.forEach(nivel => {
                enfoques.forEach(enfoque => {
                    combinaciones.push({
                        ...mat,
                        rol,
                        ambiente,
                        nivel,
                        enfoque
                    });
                });
            });
        });
    });
});

console.log(`Total de guías a generar: ${combinaciones.length}`);

// Función para pausar la ejecución
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generarTodas() {
    const BATCH_SIZE = 3; // 3 peticiones simultáneas para no activar la protección Anti-DDoS de Google
    for (let i = 0; i < combinaciones.length; i += BATCH_SIZE) {
        const batch = combinaciones.slice(i, i + BATCH_SIZE);
        console.log(`\nProcesando lote de guías [${i + 1} a ${Math.min(i + BATCH_SIZE, combinaciones.length)}] de ${combinaciones.length}...`);
        
        const promesas = batch.map(async (payload, idx) => {
            const indexGlobal = i + idx;
            const fileNameSafe = [payload.asignatura, payload.periodo, payload.semana, payload.rol, payload.ambiente, payload.nivel, payload.enfoque]
                .map(s => s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '_') : 'na')
                .join('_') + '.json';
                
            const cacheFilePath = `./guias_cache/${fileNameSafe}`;
            
            if (fs.existsSync(cacheFilePath)) {
                console.log(`[${indexGlobal+1}/${combinaciones.length}] YA EXISTE: ${fileNameSafe}`);
                return;
            }

            let success = false;
            while (!success) {
                try {
                    const res = await fetch('http://localhost:3000/api/generate-guide', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    
                    const data = await res.json();
                    if (data.error) {
                        console.error(`[${indexGlobal+1}] Error API: ${data.error}. Reintentando en 10s...`);
                        await sleep(10000);
                    } else {
                        console.log(`[${indexGlobal+1}] Éxito.`);
                        success = true;
                    }
                } catch (error) {
                    console.error(`[${indexGlobal+1}] Fallo de red:`, error.message, "- Reintentando en 10s...");
                    await sleep(10000);
                }
            }
        });

        // Esperamos a que todo el lote termine
        await Promise.all(promesas);
        // Pausa de 1 segundo entre lotes de 3 para fluidez
        await sleep(1000);
    }
    console.log("¡Terminado de generar todas las guías!");

    // Backup local
    const now = new Date();
    const backupFolderName = `guias_cache_backup_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`;
    const backupPath = path.join(__dirname, backupFolderName);
    console.log(`Creando backup local en: ${backupFolderName}...`);
    try {
        if (!fs.existsSync(backupPath)) fs.mkdirSync(backupPath);
        const cacheDir = path.join(__dirname, 'guias_cache');
        if (fs.existsSync(cacheDir)) {
            const files = fs.readdirSync(cacheDir);
            for (const file of files) {
                fs.copyFileSync(path.join(cacheDir, file), path.join(backupPath, file));
            }
        }
        console.log("Backup local completado exitosamente.");
    } catch(err) {
        console.error("Error al crear backup local:", err);
    }

    // Git push
    console.log("Subiendo archivos a la página web (GitHub)...");
    exec('git add guias_cache/ && git commit -m "Auto: guías generadas actualizadas" && git push origin master', (error, stdout, stderr) => {
        if (error && !stdout.includes("nothing to commit") && !stderr.includes("nothing to commit")) {
            console.error(`Error en git push: ${error.message}`);
            return;
        }
        console.log(`Git push completado: ${stdout}`);
    });
}

generarTodas();
