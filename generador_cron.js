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
    fs.appendFileSync(path.join(__dirname, 'cron_registro.txt'), str + "\n", 'utf-8');
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Opciones del Menú (TODAS las opciones disponibles)
const allRoles = ["Detective de Misterios", "Explorador Espacial", "Científico Loco", "Hacker Tecnológico"];
const allAmbientes = ["Mundo Post-Apocalíptico", "Estación Espacial Internacional", "Expedición en la Selva", "Laboratorio Secreto Subterráneo"];
const allNiveles = ["Modo Novato (Fácil)", "Modo Supervivencia (Intermedio)", "Modo Héroe (Avanzado)", "Modo Dios (Experto)"];
const allEnfoques = ["Resolver un misterio (Indagación)", "Explicar un fenómeno extraño", "Aplicar la ciencia para sobrevivir", "Desmentir un mito popular (Análisis Crítico)"];

const mallasCurriculares = {
    "Física": {
        "6": [
            { semana: 1, topico: "Cinemática básica (Movimiento vs Reposo)", meta: "Diferenciar estados de movimiento." },
            { semana: 2, topico: "Posición y Trayectoria", meta: "Identificar variables cinemáticas." },
            { semana: 3, topico: "Velocidad y Rapidez", meta: "Calcular rapidez en escenarios reales." },
            { semana: 4, topico: "Aceleración y Frenado", meta: "Comprender la aceleración." },
            { semana: 5, topico: "Fuerzas del entorno", meta: "Identificar fuerzas cotidianas." },
            { semana: 6, topico: "Gravedad y Sistema Planetario", meta: "Explicar la gravedad." },
            { semana: 7, topico: "Energía mecánica introductoria", meta: "Distinguir tipos de energía." },
            { semana: 8, topico: "Proyecto Integrador de Física 6", meta: "Aplicar conceptos en un reto." }
        ],
        "7": [
            { semana: 1, topico: "Análisis Vectorial del Movimiento", meta: "Manejar vectores en 2D." },
            { semana: 2, topico: "Gráficas de Posición vs Tiempo (x-t)", meta: "Interpretar gráficas x-t." },
            { semana: 3, topico: "Gráficas de Velocidad vs Tiempo (v-t)", meta: "Interpretar gráficas v-t." },
            { semana: 4, topico: "Caída Libre y Aceleración Gravitacional", meta: "Aplicar principios de caída libre." },
            { semana: 5, topico: "Energía Cinética vs Potencial", meta: "Diferenciar tipos de energía." },
            { semana: 6, topico: "Ley de Conservación de Energía", meta: "Aplicar conservación de energía." },
            { semana: 7, topico: "Trabajo Físico y Potencia", meta: "Calcular trabajo y potencia." },
            { semana: 8, topico: "Proyecto Integrador de Física 7", meta: "Resolver retos energéticos." }
        ]
    },
    "Turismo": {
        "7": [
            { semana: 1, topico: "Conceptos Básicos: Turismo y Patrimonio", meta: "Definir turismo y patrimonio." },
            { semana: 2, topico: "Geografía Turística de Montenegro y Quindío", meta: "Reconocer atractivos locales." },
            { semana: 3, topico: "Patrimonio Cultural vs Patrimonio Natural", meta: "Clasificar patrimonios." },
            { semana: 4, topico: "Turismo Sostenible y Medio Ambiente", meta: "Evaluar impacto ambiental." },
            { semana: 5, topico: "Diseño de Paquetes Turísticos Básicos", meta: "Crear una oferta turística." },
            { semana: 6, topico: "Atención al Cliente en Turismo", meta: "Aplicar protocolos de servicio." },
            { semana: 7, topico: "Marketing Turístico Básico", meta: "Promocionar destinos." },
            { semana: 8, topico: "Ruta Turística Guiada (Proyecto Final)", meta: "Diseñar y exponer una ruta." }
        ]
    }
};

function getDynamicDelay() {
    return { ms: 3000, desc: "3s (Velocidad rǭpida Flash)" };
}

async function generarGuia(asignatura, grado, periodo, semanaData, rol, ambiente, nivel, enfoque) {

    const cacheDir = path.join(__dirname, 'guias_cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const fileNameSafe = [asignatura, periodo, semanaData.semana, rol, ambiente, nivel, enfoque]
        .map(s => s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '_') : 'na')
        .join('_') + '.json';
    
    const cacheFilePath = path.join(cacheDir, fileNameSafe);
    
    if (fs.existsSync(cacheFilePath)) {
        return; // Ya existe, omitimos silenciosamente para avanzar rápido
    }

    logMsg(`[GENERANDO] ${asignatura} G${grado} Sem${semanaData.semana} | Rol: ${rol.substring(0,10)}... | Amb: ${ambiente.substring(0,10)}...`);

    let perfilEstudiante = "estudiantes de básica secundaria (aprox. 11-14 años)";
    let matchGrado = grado.toString().match(/\d+/);
    let numGrado = matchGrado ? parseInt(matchGrado[0]) : 0;
    
    if (grado.toString().toUpperCase().includes("PENSAR")) {
        perfilEstudiante = "jóvenes y adultos en modelo educativo flexible (CLEI/PENSAR), requiriendo un enfoque andragógico, maduro y muy contextualizado a la vida laboral/cotidiana";
    } else if (numGrado >= 10) {
        perfilEstudiante = "estudiantes de educación media (aprox. 15-17 años)";
    } else if (numGrado >= 6 && numGrado <= 9) {
        perfilEstudiante = "estudiantes de básica secundaria (aprox. 11-14 años)";
    }

    const prompt = `Actúa como un ${rol}. Tu objetivo es enseñar ${asignatura} (Grado ${grado}) a ${perfilEstudiante} en el contexto narrativo de ${ambiente}.
OBLIGACIÓN PEDAGÓGICA: El contenido, vocabulario y profundidad científica DEBEN estar estrictamente alineados con los Derechos Básicos de Aprendizaje (DBA) y los Estándares Básicos de Competencias de Colombia para esta asignatura y grado.
Si es un grado inferior (6º a 9º), evita la matematización excesiva o fórmulas complejas; prioriza la comprensión cualitativa, la indagación y la fenomenología.
Debes estructurar la guía de estudio siguiendo el nivel de dificultad: ${nivel}.
La guía debe enfocarse en: ${enfoque}.

Contexto Curricular:
- Periodo: ${periodo}
- Semana: ${semanaData.semana}
- Meta de Comprensión: ${semanaData.meta}
- Tópico Generativo: ${semanaData.topico}

INSTRUCCIÓN MUY IMPORTANTE SOBRE GRÁFICOS Y ESTÉTICA:
1. NO generes imágenes, diagramas Mermaid, SVG ni tablas HTML complejas. Cuando sea necesario ilustrar algo, proporciona INDICACIONES TEXTUALES CLARAS para que el estudiante dibuje o imagine el concepto en su cuaderno.

INSTRUCCIÓN VITAL Y OBLIGATORIA: LA PREGUNTA PROBLEMATIZADORA
Es OBLIGATORIO que tu "texto_inductivo" EMPIECE SIEMPRE con una GRAN PREGUNTA PROBLEMATIZADORA (destacada en negrita y cursiva) como el PRIMER PÁRRAFO absoluto del texto. Esta pregunta debe conectar el Tópico Generativo con la vida real del estudiante en la IE Instituto Montenegro. Todo el desarrollo de la guía debe girar en torno a resolver esta pregunta, manteniendo el rol y narrativa.

INSTRUCCIÓN MINIJUEGOS:
Incrusta OBLIGATORIAMENTE en "texto_inductivo" y "texto_deductivo":
- 5 juegos de ordenar letras: [JUEGO:ORDENAR_LETRAS:PALABRA]
- 5 ordenar frases: [JUEGO:ORDENAR_FRASE:LA FRASE COMPLETA]
- 5 sopa de letras: [JUEGO:SOPA_LETRAS:PALABRA1,PALABRA2,PALABRA3]
- 5 crucigrama: [JUEGO:CRUCIGRAMA:Pista 1|RESPUESTA1;Pista 2|RESPUESTA2]

DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO CON ESTA ESTRUCTURA EXACTA:
{
  "saberes_previos": [{ "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 0 }],
  "texto_inductivo": "Markdown largo con PREGUNTA PROBLEMATIZADORA, MINIJUEGOS e indicaciones textuales para dibujar...",
  "recurso_visual": "Texto descriptivo detallado dando indicaciones al estudiante de qué debe dibujar en su cuaderno.",
  "preguntas_inductivas_pagina": [{ "pregunta": "¿P1?", "respuesta_esperada": "R1" }],
  "preguntas_inductivas_cuaderno": ["Reto 1", "Reto 2"],
  "texto_deductivo": "Markdown largo con teoría, MINIJUEGOS e indicaciones para dibujar...",
  "preguntas_deductivas_pagina": [{ "pregunta": "¿P1?", "respuesta_esperada": "R1" }],
  "preguntas_deductivas_cuaderno": ["Reto 1", "Reto 2"],
  "icfes": [{ "competencia": "Evaluación", "texto_introductorio": "...", "tabla_o_grafica_markdown": "...", "pregunta": "¿...?", "opciones": ["1", "2", "3", "4"], "correcta": 0, "retroalimentacion": { "0": "...", "1": "...", "2": "...", "3": "..." } }]
}`;

    const modelos = ['gemini-2.5-flash'];
    let responseText = "";
    let maxRetries = 15;
    let baseDelay = 5000;

    while (maxRetries > 0) {
        const ai = getAIClient();
        for (let i = 0; i < modelos.length; i++) {
            try {
                const response = await ai.models.generateContent({ model: modelos[i], contents: prompt });
                responseText = response.text;
                break; // Éxito!
            } catch (err) {
                await sleep(1500); // Pequeña pausa antes de intentar otro modelo
            }
        }
        if (responseText) break;
        
        logMsg(`[REINTENTO] Rate Limit alcanzado. Esperando ${baseDelay/1000}s...`);
        await sleep(baseDelay);
        baseDelay *= 1.5; // Backoff exponencial
        maxRetries--;
    }

    if (!responseText) {
        logMsg(`[FATAL] Error irrecuperable en la guía de ${asignatura} Sem${semanaData.semana}. Saltando.`);
        return;
    }

    let limpio = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
        const finalJson = JSON.parse(limpio);
        fs.writeFileSync(cacheFilePath, JSON.stringify(finalJson, null, 2), 'utf-8');
    } catch (e) {
        logMsg(`[ERROR JSON] Fallo sintáctico en la respuesta. Saltando guía.`);
    }
    
    const delayInfo = getDynamicDelay();
    logMsg(`[DESCANSO] Esperando ${delayInfo.desc} para proteger cuota API...`);
    await sleep(delayInfo.ms); 
}

async function generarSemanaCompleta(semanaObjetivo) {
    const periodo = "1"; 
    
    // Si es la semana 1, limitamos a las 2 primeras opciones. Si es > 1, usamos todas.
    const actRoles = semanaObjetivo === 1 ? allRoles.slice(0, 2) : allRoles;
    const actAmbientes = semanaObjetivo === 1 ? allAmbientes.slice(0, 2) : allAmbientes;
    const actNiveles = semanaObjetivo === 1 ? allNiveles.slice(0, 2) : allNiveles;
    const actEnfoques = semanaObjetivo === 1 ? allEnfoques.slice(0, 2) : allEnfoques;
    
    for (const asignatura of Object.keys(mallasCurriculares)) {
        const grados = Object.keys(mallasCurriculares[asignatura]);
        
        for (const grado of grados) {
            const semanaData = mallasCurriculares[asignatura][grado].find(s => s.semana === semanaObjetivo);
            if (!semanaData) continue;

            for (const r of actRoles) {
                for (const a of actAmbientes) {
                    for (const n of actNiveles) {
                        for (const e of actEnfoques) {
                            await generarGuia(asignatura, grado, periodo, semanaData, r, a, n, e);
                        }
                    }
                }
            }
        }
    }
}

function pushGuiasToGit() {
    return new Promise((resolve) => {
        logMsg("Iniciando subida a GitHub de las guías...");
        exec('git add guias_cache/ && git commit -m "Auto-upload: Guias generadas por Cron" && git push', { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                // Es normal que de error si no hay archivos nuevos para hacer commit
                logMsg(`Resultado Git: Sin cambios nuevos o error (${error.message})`);
                return resolve(false);
            }
            logMsg("Subida a GitHub exitosa.");
            resolve(true);
        });
    });
}

async function main() {
    logMsg("=================================================");
    logMsg("  CRON GENERATOR - MODO 24/7 DINÁMICO ACTIVO");
    logMsg("=================================================");
    
    while (true) {
        // Generar consecutivamente de la semana 1 a la 8
        for (let semana = 1; semana <= 8; semana++) {
            logMsg(`+++ PUESTA EN COLA: SEMANA ${semana} +++`);
            await generarSemanaCompleta(semana);
            logMsg(`+++ COMPLETADA: SEMANA ${semana} +++`);
            await pushGuiasToGit();
        }

        logMsg("=================================================");
        logMsg("  🎉 REVISIÓN DE TODAS LAS SEMANAS COMPLETADA.");
        logMsg("  Iniciando un descanso de 5 minutos antes del próximo ciclo...");
        logMsg("=================================================");
        await sleep(300000); // 5 minutos de pausa general al final
    }
}

main();
