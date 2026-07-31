require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
let currentKeyIndex = 0;

function getAIClient() {
    if (apiKeys.length === 0) {
        console.error("No hay API Keys configuradas.");
        process.exit(1);
    }
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return new GoogleGenAI({ apiKey: key });
}

function logMsg(msg) {
    const time = new Date().toLocaleTimeString();
    const str = `[${time}] ${msg}`;
    console.log(str);
    fs.appendFileSync(path.join(__dirname, 'cron_proyector_registro.txt'), str + "\n", 'utf-8');
}

// Malla curricular de donde sacar los tpicos
const mallasCurriculares = {
    "fisica6": [
        { semana: 1, topico: "Cinemtica bsica (Movimiento vs Reposo)", horas: 2 },
        { semana: 2, topico: "Posicin y Trayectoria", horas: 2 },
        { semana: 3, topico: "Velocidad y Rapidez", horas: 2 },
        { semana: 4, topico: "Aceleracin y Frenado", horas: 2 },
        { semana: 5, topico: "Fuerzas del entorno", horas: 2 },
        { semana: 6, topico: "Gravedad y Sistema Planetario", horas: 2 },
        { semana: 7, topico: "Energa mecnica introductoria", horas: 2 },
        { semana: 8, topico: "Proyecto Integrador de Fsica 6", horas: 2 }
    ],
    "fisica7": [
        { semana: 1, topico: "Anlisis Vectorial del Movimiento", horas: 2 },
        { semana: 2, topico: "Grficas de Posicin vs Tiempo (x-t)", horas: 2 },
        { semana: 3, topico: "Grficas de Velocidad vs Tiempo (v-t)", horas: 2 },
        { semana: 4, topico: "Cada Libre y Aceleracin Gravitacional", horas: 2 },
        { semana: 5, topico: "Energa Cintica vs Potencial", horas: 2 },
        { semana: 6, topico: "Ley de Conservacin de Energa", horas: 2 },
        { semana: 7, topico: "Trabajo Fsico y Potencia", horas: 2 },
        { semana: 8, topico: "Proyecto Integrador de Fsica 7", horas: 2 }
    ],
    "quimica": [
        { semana: 1, topico: "Materia y Mezclas Homogneas vs Heterogneas", horas: 2 },
        { semana: 2, topico: "Estados de la Materia", horas: 2 },
        { semana: 3, topico: "Mtodos de Separacin de Mezclas", horas: 2 },
        { semana: 4, topico: "Elementos vs Compuestos", horas: 2 },
        { semana: 5, topico: "Tabla Peridica Bsica", horas: 2 },
        { semana: 6, topico: "Reacciones Qumicas Cotidianas", horas: 2 },
        { semana: 7, topico: "Acidez y Basicidad (pH)", horas: 2 },
        { semana: 8, topico: "Proyecto: Laboratorio Casero", horas: 2 }
    ],
    "turismo": [
        { semana: 1, topico: "Conceptos Bsicos: Bienes vs Servicios en Turismo", horas: 1 },
        { semana: 2, topico: "Geografa Turstica Local", horas: 1 },
        { semana: 3, topico: "Patrimonio Cultural y Natural", horas: 1 },
        { semana: 4, topico: "Turismo Sostenible", horas: 1 },
        { semana: 5, topico: "Diseo de Experiencias Tursticas", horas: 1 },
        { semana: 6, topico: "Creacin de Producto Turstico", horas: 1 },
        { semana: 7, topico: "Marketing y Ventas", horas: 1 },
        { semana: 8, topico: "Proyecto: Feria de Emprendimiento Turstico", horas: 1 }
    ],
    "etica": [
        { semana: 1, topico: "Dilemas Morales y Toma de Decisiones", horas: 1 },
        { semana: 2, topico: "Empata y Respeto", horas: 1 },
        { semana: 3, topico: "Prevencin del Bullying", horas: 1 },
        { semana: 4, topico: "Responsabilidad Digital", horas: 1 },
        { semana: 5, topico: "Resolucin de Conflictos", horas: 1 },
        { semana: 6, topico: "Derechos Humanos", horas: 1 },
        { semana: 7, topico: "Liderazgo Positivo", horas: 1 },
        { semana: 8, topico: "Proyecto: Declogo de Convivencia", horas: 1 }
    ],
    "artistica": [
        { semana: 1, topico: "Simbologa y Percusin Corporal", horas: 1 },
        { semana: 2, topico: "El Silencio en la Msica", horas: 1 },
        { semana: 3, topico: "Polirritmia Bsica", horas: 1 },
        { semana: 4, topico: "Lectura de Patrones Rtmicos", horas: 1 },
        { semana: 5, topico: "Composicin Libre", horas: 1 },
        { semana: 6, topico: "Apreciacin Sonora", horas: 1 },
        { semana: 7, topico: "Msica Folclrica Colombiana", horas: 1 },
        { semana: 8, topico: "Proyecto: Ensamble Final", horas: 1 }
    ]
};

async function generarClaseJSON(asignatura, semana, topico, claseNum) {
    const ai = getAIClient();
    const prompt = `Eres un experto diseador instruccional creando clases magistrales para ser proyectadas en un tablero interactivo.
Asignatura: ${asignatura}
Semana: ${semana}
Tema: ${topico} (Clase ${claseNum})

Debes generar un arreglo JSON con EXACTAMENTE 10 objetos. 
Reglas estrictas de tiempo: 
- El objeto 1 debe tener { timer: 120 } (2 minutos). Es preparacin de cuadernos.
- Los objetos 2 al 10 deben tener { timer: 300 } (5 minutos). Son actividades de copiar, dibujar, analizar.

Estructura de cada objeto:
{
  "title": "Ttulo corto (max 4 palabras)",
  "sub": "Subttulo orientador",
  "content": "Instrucciones de la actividad en HTML bsico (<br> permitidos).",
  "icon": "Nombre de icono Phosphor (ej: ph-planet, ph-pencil-line, ph-table, etc)",
  "customHtml": "OPCIONAL PERO MUY RECOMENDADO. Si la actividad pide dibujar esquemas, diseos o diagramas, DEBES usar notacin de bloques Mermaid encerrados en <div class='mermaid'>...</div>. Si es msica (pentagramas, notas), usa formato ABC encerrado en <div class='abc-music'>...</div>. Si no hay dibujo, djalo vaco.",
  "timer": (Nmero, 120 o 300)
}

REGLA DE ORO PARA EL OBJETO 10 (LA PREGUNTA ICFES):
El ltimo objeto (el dcimo) DEBE SER UNA PREGUNTA ICFES RIGUROSA.
- El "content" debe decir explcitamente al final: "Copia toda la pregunta, los distractores y la grfica en tu cuaderno y encierra la respuesta correcta."
- Debe tener OBLIGATORIAMENTE un "customHtml" con el contexto visual del caso (un dibujo CSS, una tabla de datos HTML, o un grfico SVG).
- El "content" debe presentar: El Enunciado del Caso, la Pregunta Problema, 4 distractores A, B, C, D, y revelar la respuesta correcta justificada.

Devuelve SOLO el array de 10 objetos JSON vlido, sin bloques \`\`\`json y sin explicaciones extra.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2
            }
        });
        
        let text = response.text;
        text = text.replace(/^```json/, '').replace(/```$/, '').trim();
        return JSON.parse(text);
    } catch (e) {
        logMsg(`Error generando clase ${asignatura} S${semana} C${claseNum}: ` + e.message);
        return null;
    }
}

async function generarSemana(semana) {
    logMsg(`Iniciando generacin masiva de Semana ${semana}...`);
    const dbPath = path.join(__dirname, 'proyectorData.json');
    let db = { semanasGeneradas: 0, clases: {} };
    if (fs.existsSync(dbPath)) {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }
    
    if (!db.clases) db.clases = {};

    for (const [asignatura, configArr] of Object.entries(mallasCurriculares)) {
        if (!db.clases[asignatura]) db.clases[asignatura] = {};
        
        const config = configArr.find(c => c.semana === semana);
        if (!config) continue;

        db.clases[asignatura][semana] = []; // Array of classes for this week
        
        logMsg(`Generando ${asignatura} - Semana ${semana} (${config.horas} clases)`);
        for (let i = 1; i <= config.horas; i++) {
            let data = null;
            let intentos = 0;
            while (!data && intentos < 3) {
                data = await generarClaseJSON(asignatura, semana, config.topico, i);
                if (!data) {
                    intentos++;
                    logMsg(`Reintentando... (${intentos}/3)`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
            if (data) {
                db.clases[asignatura][semana].push(data);
                logMsg(`  -> Clase ${i} generada con xito.`);
            } else {
                logMsg(`  -> FALLO FATAL generando Clase ${i}`);
            }
            // Delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 8000));
        }
    }
    
    db.semanasGeneradas = semana;
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 4), 'utf-8');
    logMsg(`Semana ${semana} guardada en proyectorData.json`);
}

function pushGit() {
    return new Promise((resolve) => {
        logMsg("Sincronizando a GitHub...");
        exec('git add proyectorData.json && git commit -m "Auto-sync: Generador Cron de Clases Proyector" && git push', { cwd: __dirname }, (err) => {
            if (err) logMsg("Error en Git (o no hay cambios): " + err.message);
            else logMsg("Subida exitosa a GitHub.");
            resolve();
        });
    });
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--force')) {
        logMsg("EJECUCIN FORZADA MANUAL.");
        const dbPath = path.join(__dirname, 'proyectorData.json');
        let db = { semanasGeneradas: 0, clases: {} };
        if (fs.existsSync(dbPath)) db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        
        let currentWeek = db.semanasGeneradas + 1;
        while (currentWeek <= 8) {
            logMsg(`Generando semana ${currentWeek} forzadamente...`);
            await generarSemana(currentWeek);
            currentWeek++;
        }
        await pushGit();
        logMsg("Se han generado todas las semanas hasta la 8.");
        process.exit(0);
    }
    
    logMsg("Servicio Cron de Proyector Inciado. Vigilar los Sbados a las 2:00 AM.");
    setInterval(async () => {
        const now = new Date();
        // Sbado = 6, 2 AM
        if (now.getDay() === 6 && now.getHours() === 2 && now.getMinutes() === 0) {
            const dbPath = path.join(__dirname, 'proyectorData.json');
            let db = { semanasGeneradas: 0, clases: {} };
            if (fs.existsSync(dbPath)) db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            
            const nextWeek = db.semanasGeneradas + 1;
            if (nextWeek <= 8) {
                logMsg(`CRON DISPARADO: Generando Semana ${nextWeek}`);
                await generarSemana(nextWeek);
                await pushGit();
            }
        }
    }, 60000); // Check every minute
}

main();
