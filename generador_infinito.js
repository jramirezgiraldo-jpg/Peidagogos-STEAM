const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

console.log("==========================================");
console.log("🚀 INICIANDO GENERADOR INFINITO ANTI-BLOQUEOS");
console.log("Este motor no se detendrá hasta terminar TODAS las semanas.");
console.log("==========================================");

const roles = [
    "Detective de Misterios",
    "Explorador Espacial",
    "Científico Loco",
    "Youtuber Científico",
    "Hacker Tecnológico"
];

const ambientes = [
    "Mundo Post-Apocalíptico",
    "Estación Espacial Internacional",
    "Expedición en la Selva",
    "Laboratorio Secreto Subterráneo",
    "Metrópolis del Futuro"
];

const niveles = [
    "Modo Novato (Fácil)",
    "Modo Supervivencia (Intermedio)",
    "Modo Héroe (Difícil)",
    "Modo Dios (Reto Épico)"
];

const enfoques = [
    "Resolver un misterio (Indagación)",
    "Explicar un fenómeno extraño",
    "Usar la ciencia para sobrevivir",
    "Desmentir un mito popular"
];

const allMaterias = [
    { asignatura: "Física", grado: "6", periodo: "3", semana: "1", meta: "Interpretar fenómenos naturales, la gravitación y los conceptos básicos de cinemática (posición, velocidad y aceleración).", topico: "Revisión del movimiento planetario desde el punto de vista científico." },
    { asignatura: "Física", grado: "6", periodo: "3", semana: "3", meta: "Interpretar fenómenos naturales, la gravitación y los conceptos básicos de cinemática (posición, velocidad y aceleración).", topico: "Aplicación de la ley de la gravitación universal." },
    { asignatura: "Física", grado: "6", periodo: "3", semana: "5", meta: "Interpretar fenómenos naturales, la gravitación y los conceptos básicos de cinemática (posición, velocidad y aceleración).", topico: "Satélites naturales vs. satélites artificiales." },
    { asignatura: "Física", grado: "6", periodo: "3", semana: "7", meta: "Interpretar fenómenos naturales, la gravitación y los conceptos básicos de cinemática (posición, velocidad y aceleración).", topico: "Proyecto de aula: Modelando el sistema solar y sus fuerzas." },
    { asignatura: "Física", grado: "7", periodo: "3", semana: "1", meta: "Analizar gráficamente el movimiento bidimensional y aplicar el principio de conservación de la energía mecánica.", topico: "Características de un cuerpo que se mueve en dos dimensiones." },
    { asignatura: "Física", grado: "7", periodo: "3", semana: "3", meta: "Analizar gráficamente el movimiento bidimensional y aplicar el principio de conservación de la energía mecánica.", topico: "Movimiento semiparabólico y parabólico." },
    { asignatura: "Física", grado: "7", periodo: "3", semana: "5", meta: "Analizar gráficamente el movimiento bidimensional y aplicar el principio de conservación de la energía mecánica.", topico: "Movimiento circular uniforme." },
    { asignatura: "Física", grado: "7", periodo: "3", semana: "7", meta: "Analizar gráficamente el movimiento bidimensional y aplicar el principio de conservación de la energía mecánica.", topico: "Argumentación y resolución de problemas bidimensionales." },
    { asignatura: "Turismo", grado: "7", periodo: "3", semana: "1", meta: "Desarrollar una mentalidad emprendedora y de reconocimiento cultural, valorando la riqueza del Eje Cafetero y de Colombia, así como el Paisaje Cultural Cafetero (PCC).", topico: "Qué es el emprendimiento y su definición." },
    { asignatura: "Turismo", grado: "7", periodo: "3", semana: "3", meta: "Desarrollar una mentalidad emprendedora y de reconocimiento cultural, valorando la riqueza del Eje Cafetero y de Colombia, así como el Paisaje Cultural Cafetero (PCC).", topico: "Tipos de emprendimiento." },
    { asignatura: "Turismo", grado: "7", periodo: "3", semana: "5", meta: "Desarrollar una mentalidad emprendedora y de reconocimiento cultural, valorando la riqueza del Eje Cafetero y de Colombia, así como el Paisaje Cultural Cafetero (PCC).", topico: "Características y ejemplos de emprendimiento." },
    { asignatura: "Turismo", grado: "7", periodo: "3", semana: "7", meta: "Desarrollar una mentalidad emprendedora y de reconocimiento cultural, valorando la riqueza del Eje Cafetero y de Colombia, así como el Paisaje Cultural Cafetero (PCC).", topico: "Idea de productos perecederos (maíz y huevo) y realización de su propio emprendimiento." },
    { asignatura: "Artística", grado: "7", periodo: "3", semana: "1", meta: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.", topico: "Exploración de géneros musicales modernos y sus patrones." },
    { asignatura: "Artística", grado: "7", periodo: "3", semana: "3", meta: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.", topico: "Ensamblaje de percusión y melodía." },
    { asignatura: "Artística", grado: "7", periodo: "3", semana: "5", meta: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.", topico: "Uso de secuencias y loops en la música interactiva." },
    { asignatura: "Artística", grado: "7", periodo: "3", semana: "7", meta: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.", topico: "Composición de una breve pieza musical original." },
    { asignatura: "Artística", grado: "8", periodo: "3", semana: "1", meta: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.", topico: "Exploración de géneros musicales modernos y sus patrones." },
    { asignatura: "Artística", grado: "8", periodo: "3", semana: "3", meta: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.", topico: "Ensamblaje de percusión y melodía." },
    { asignatura: "Artística", grado: "8", periodo: "3", semana: "5", meta: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.", topico: "Uso de secuencias y loops en la música interactiva." },
    { asignatura: "Artística", grado: "8", periodo: "3", semana: "7", meta: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.", topico: "Composición de una breve pieza musical original." },
    { asignatura: "Artística", grado: "9", periodo: "3", semana: "1", meta: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.", topico: "Exploración de géneros musicales modernos y sus patrones." },
    { asignatura: "Artística", grado: "9", periodo: "3", semana: "3", meta: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.", topico: "Ensamblaje de percusión y melodía." },
    { asignatura: "Artística", grado: "9", periodo: "3", semana: "5", meta: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.", topico: "Uso de secuencias y loops en la música interactiva." },
    { asignatura: "Artística", grado: "9", periodo: "3", semana: "7", meta: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.", topico: "Composición de una breve pieza musical original." },
    { asignatura: "Ética", grado: "7", periodo: "3", semana: "1", meta: "Fomentar el reconocimiento de sí mismo y el desarrollo de la empatía a través de dilemas morales, contribuyendo a la construcción de su proyecto de vida.", topico: "El trabajo en equipo y la solidaridad grupal." },
    { asignatura: "Ética", grado: "7", periodo: "3", semana: "3", meta: "Fomentar el reconocimiento de sí mismo y el desarrollo de la empatía a través de dilemas morales, contribuyendo a la construcción de su proyecto de vida.", topico: "Cómo actuar frente a la injusticia: mi rol activo." },
    { asignatura: "Ética", grado: "7", periodo: "3", semana: "5", meta: "Fomentar el reconocimiento de sí mismo y el desarrollo de la empatía a través de dilemas morales, contribuyendo a la construcción de su proyecto de vida.", topico: "Mis derechos y mis deberes como estudiante y ciudadano." },
    { asignatura: "Ética", grado: "7", periodo: "3", semana: "7", meta: "Fomentar el reconocimiento de sí mismo y el desarrollo de la empatía a través de dilemas morales, contribuyendo a la construcción de su proyecto de vida.", topico: "La influencia de las redes sociales en mi identidad." },
    { asignatura: "Ética", grado: "10", periodo: "3", semana: "1", meta: "Estructurar el proyecto de vida con bases éticas sólidas, analizando dilemas morales complejos y asumiendo responsabilidad ciudadana y profesional.", topico: "Ciudadanía activa y participación democrática juvenil." },
    { asignatura: "Ética", grado: "10", periodo: "3", semana: "3", meta: "Estructurar el proyecto de vida con bases éticas sólidas, analizando dilemas morales complejos y asumiendo responsabilidad ciudadana y profesional.", topico: "Los Derechos Humanos y su defensa en el entorno cercano." },
    { asignatura: "Ética", grado: "10", periodo: "3", semana: "5", meta: "Estructurar el proyecto de vida con bases éticas sólidas, analizando dilemas morales complejos y asumiendo responsabilidad ciudadana y profesional.", topico: "Consumo responsable y ética ambiental." },
    { asignatura: "Ética", grado: "10", periodo: "3", semana: "7", meta: "Estructurar el proyecto de vida con bases éticas sólidas, analizando dilemas morales complejos y asumiendo responsabilidad ciudadana y profesional.", topico: "La influencia de los medios masivos en nuestra moralidad." },
];

// Generar absolutamente TODAS las combinaciones
let combinaciones = [];
allMaterias.forEach(mat => {
    roles.forEach(rol => {
        ambientes.forEach(ambiente => {
            niveles.forEach(nivel => {
                enfoques.forEach(enfoque => {
                    combinaciones.push({ ...mat, rol, ambiente, nivel, enfoque });
                });
            });
        });
    });
});

console.log(`\n📚 Total MÁXIMO de guías posibles en el sistema: ${combinaciones.length}`);
console.log(`⏳ Tasa esperada: 1 guía cada 3.5 segundos (~17 guías/minuto).`);

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generarTodas() {
    let guiasNuevasGeneradas = 0;
    
    for (let i = 0; i < combinaciones.length; i++) {
        const payload = combinaciones[i];
        
        const fileNameSafe = [payload.asignatura, payload.periodo, payload.semana, payload.rol, payload.ambiente, payload.nivel, payload.enfoque]
            .map(s => s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '_') : 'na')
            .join('_') + '.json';
            
        const cacheFilePath = `./guias_cache/${fileNameSafe}`;
        const oldCacheFilePath = `./guias_cache_old_2/${fileNameSafe}`;
        
        // Comprobar si ya existe en la caché principal o en el viejo directorio para NO gastar peticiones
        if (fs.existsSync(cacheFilePath) || fs.existsSync(oldCacheFilePath)) {
            // Avanzar en silencio sin imprimir para no ensuciar la consola si hay miles
            continue;
        }

        console.log(`\n[${i+1}/${combinaciones.length}] Generando: ${payload.asignatura} S${payload.semana} | ${payload.rol} | ${payload.ambiente}`);

        let success = false;
        while (!success) {
            try {
                // Hacer una ÚNICA petición al servidor, el cual rotará las 3 llaves automáticamente
                const res = await fetch('http://localhost:3000/api/generate-guide', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await res.json();
                if (data.error) {
                    console.error(`⚠️ Error del Servidor/API: ${data.error}`);
                    console.log(`⏳ Pausa de 60 SEGUNDOS por seguridad...`);
                    await sleep(60000);
                } else {
                    console.log(`✅ ¡Éxito! (Esperando 3.5s para la siguiente)`);
                    guiasNuevasGeneradas++;
                    success = true;
                    // Pausa estratégica de 3.5 segundos para no agotar cuotas
                    await sleep(3500);
                }
            } catch (error) {
                console.error(`❌ Fallo de red local (¿El servidor está caído?): ${error.message}`);
                console.log(`⏳ Reintentando en 10 segundos...`);
                await sleep(10000);
            }
        }
        
        // Cada 100 guías nuevas generadas, subimos a GitHub para no perder progreso en caso de corte de luz
        if (guiasNuevasGeneradas > 0 && guiasNuevasGeneradas % 100 === 0) {
            console.log("\n📦 Respaldando lote de 100 guías en GitHub...");
            exec('git add guias_cache/ && git commit -m "Auto: 100 guías generadas (Generador Infinito)" && git push origin master', (error) => {
                if(error) console.error("Error subiendo a GitHub:", error.message);
                else console.log("✅ Respaldo exitoso en GitHub.");
            });
        }
    }
    
    console.log("\n🎉 ¡TERMINADO! Se ha procesado el 100% del currículo.");
    
    // Respaldo final a GitHub
    console.log("📦 Subiendo últimas guías a GitHub...");
    exec('git add guias_cache/ && git commit -m "Auto: 100% de las guías generadas" && git push origin master', (error, stdout) => {
        if (!error) console.log(`✅ Git push finalizado con éxito.`);
    });
}

generarTodas();
