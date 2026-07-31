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
    "Química": {
        "PENS": [
            { semana: 1, topico: "Estructura de la Materia", meta: "Comprender los átomos." },
            { semana: 2, topico: "Tabla Periódica Básica", meta: "Identificar elementos comunes." },
            { semana: 3, topico: "Enlaces Químicos", meta: "Diferenciar iónico y covalente." },
            { semana: 4, topico: "Reacciones Cotidianas", meta: "Observar química en casa." },
            { semana: 5, topico: "Estados de la Materia", meta: "Analizar cambios de fase." },
            { semana: 6, topico: "Mezclas y Soluciones", meta: "Separar mezclas." },
            { semana: 7, topico: "Ácidos y Bases", meta: "Identificar pH en alimentos." },
            { semana: 8, topico: "Proyecto Químico PENS", meta: "Experimento casero seguro." }
        ]
    },
    "Tutoría": {
        "7": [
            { semana: 1, topico: "Autoconocimiento", meta: "Reconocer fortalezas." },
            { semana: 2, topico: "Manejo del Estrés", meta: "Técnicas de relajación." },
            { semana: 3, topico: "Resolución de Conflictos", meta: "Mediación escolar." },
            { semana: 4, topico: "Trabajo en Equipo", meta: "Colaboración." },
            { semana: 5, topico: "Metas Personales", meta: "Proyecto de vida a corto plazo." },
            { semana: 6, topico: "Empatía y Respeto", meta: "Convivencia pacífica." },
            { semana: 7, topico: "Uso Seguro de Redes", meta: "Ciudadanía digital." },
            { semana: 8, topico: "Cierre de Bimestre", meta: "Reflexión del periodo." }
        ],
        "PENS": [
            { semana: 1, topico: "Proyecto de Vida Adulto", meta: "Proyección laboral." },
            { semana: 2, topico: "Inteligencia Emocional", meta: "Autocontrol." },
            { semana: 3, topico: "Comunicación Asertiva", meta: "Expresar sin herir." },
            { semana: 4, topico: "Toma de Decisiones", meta: "Pensamiento crítico." },
            { semana: 5, topico: "Manejo Financiero Básico", meta: "Presupuesto personal." },
            { semana: 6, topico: "Derechos y Deberes", meta: "Ciudadanía." },
            { semana: 7, topico: "Prevención de Adicciones", meta: "Cuidado personal." },
            { semana: 8, topico: "Evaluación Personal", meta: "Balance del módulo." }
        ]
    },
    "Artes": {
        "Universal": [
            { semana: 1, topico: "Teoría del Color", meta: "Colores primarios y secundarios." },
            { semana: 2, topico: "Línea y Perspectiva", meta: "Dibujo 3D básico." },
            { semana: 3, topico: "Historia del Arte Antiguo", meta: "Apreciación estética." },
            { semana: 4, topico: "Técnicas Mixtas", meta: "Collage y texturas." },
            { semana: 5, topico: "El Cuerpo Humano en el Arte", meta: "Proporciones." },
            { semana: 6, topico: "Música y Sonido", meta: "Ritmo y melodía." },
            { semana: 7, topico: "Expresión Corporal", meta: "Teatro básico." },
            { semana: 8, topico: "Exposición de Talentos", meta: "Muestra artística final." }
        ]
    },
    "Ética": {
        "Universal": [
            { semana: 1, topico: "Valores Institucionales", meta: "Identidad del colegio." },
            { semana: 2, topico: "El Respeto a la Diferencia", meta: "Inclusión." },
            { semana: 3, topico: "Honestidad y Plagio", meta: "Ética académica." },
            { semana: 4, topico: "Cuidado del Entorno", meta: "Ética ambiental." },
            { semana: 5, topico: "Solidaridad", meta: "Ayuda mutua." },
            { semana: 6, topico: "Responsabilidad", meta: "Cumplimiento de deberes." },
            { semana: 7, topico: "Libertad y Límites", meta: "Autonomía moral." },
            { semana: 8, topico: "Dilemas Éticos", meta: "Análisis de casos." }
        ]
    }
};

function getDynamicDelay() {
    // Exactamente 10 Peticiones Por Minuto (6000 ms por petición) para seguridad extrema del presupuesto
    return { ms: 6000, desc: "6s (10 RPM - Modo Seguro)" };
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
OBLIGACIÓN PEDAGÓGICA V10: El contenido debe estar alineado con los DBA de Colombia.
Debes estructurar la guía de estudio siguiendo el nivel de dificultad: ${nivel}, enfocándote en: ${enfoque}.

Contexto Curricular:
- Periodo: ${periodo}
- Semana: ${semanaData.semana}
- Meta: ${semanaData.meta}
- Tópico: ${semanaData.topico}

REGLAS DE ORO V10 (ESTRICTAS):
1. LONGITUD DE TEXTO: El "texto_inductivo" y el "texto_deductivo" DEBEN tener MÍNIMO 500 PALABRAS CADA UNO. Deben ser explicaciones narrativas profundas y densas en contenido.
2. ZERO-SEARCH: Toda la información necesaria para responder los cuestionarios, actividades y Pruebas Saber DEBE estar explícita y literalmente en el texto de la guía. El estudiante no debe buscar nada en internet.
3. PREGUNTA PROBLEMATIZADORA: El primer párrafo absoluto del "texto_inductivo" debe ser una gran pregunta problematizadora (en negrita y cursiva) que conecte el tema con la vida real en Montenegro, Quindío.
4. RETROALIMENTACIÓN EXHAUSTIVA ICFES: En las "Pruebas Saber" (icfes), la retroalimentación DEBE explicar por qué la opción correcta es correcta, y OBLIGATORIAMENTE debe explicar por qué cada uno de los 3 distractores (opciones falsas) es incorrecto.

JUEGOS OBLIGATORIOS (incrustar estos shortcodes dentro del texto inductivo y deductivo donde tenga sentido):
- 3 juegos de ordenar letras: [JUEGO:ORDENAR_LETRAS:PALABRA]
- 2 juegos de ordenar frase: [JUEGO:ORDENAR_FRASE:LA FRASE COMPLETA]
- 1 sopa de letras con 10 palabras: [JUEGO:SOPA_LETRAS:P1,P2,P3,P4,P5,P6,P7,P8,P9,P10]
- 2 juegos de Plataforma (Anti-IA): [ACTIVIDAD:PLATAFORMA:Pregunta|Respuesta Correcta|Distractor1|Distractor2|Distractor3]

DEBES DEVOLVER EXCLUSIVAMENTE UN JSON VÁLIDO CON ESTA ESTRUCTURA EXACTA:
{
  "saberes_previos": [
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 0 },
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 1 },
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 2 }
  ],
  "texto_inductivo": "Markdown (+500 palabras) con la PREGUNTA PROBLEMATIZADORA al inicio y los minijuegos/actividades intercalados...",
  "recurso_visual": "Indicaciones textuales claras de lo que debe dibujar el estudiante en su cuaderno.",
  "preguntas_inductivas_pagina": [], 
  "preguntas_inductivas_cuaderno": ["Actividad 1", "Actividad 2", "Actividad 3"],
  "texto_deductivo": "Markdown (+500 palabras) con teoría, narrativa y minijuegos...",
  "preguntas_deductivas_pagina": [], 
  "preguntas_deductivas_cuaderno": ["Actividad 4", "Actividad 5"],
  "icfes": [
    {
      "competencia": "Uso Comprensivo / Indagación / Explicación",
      "texto_introductorio": "Contexto detallado...",
      "tabla_o_grafica_markdown": "| Dato | Valor |\\n|---|---|",
      "pregunta": "¿...?",
      "opciones": ["1", "2", "3", "4"],
      "correcta": 0,
      "retroalimentacion": {
        "0": "Correcto porque... Además, la opción 1 es falsa porque..., la 2 es falsa porque..., la 3 es falsa porque..."
      }
    },
    // Repetir para 3 preguntas ICFES en total (índices 0, 1, 2)
  ]
}`;

    const modelos = ['gemini-3.5-flash', 'gemini-3.6-flash'];
    let responseText = "";
    let maxRetries = 15;
    let baseDelay = 30000;

    while (maxRetries > 0) {
        const ai = getAIClient();
        for (let i = 0; i < modelos.length; i++) {
            try {
                const response = await ai.models.generateContent({ 
                    model: modelos[i], 
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json"
                    }
                });
                responseText = response.text;
                break; // Éxito!
            } catch (err) {
                console.error(`[ERROR API ${modelos[i]}]`, err.message || err);
                await sleep(1500); // Pequeña pausa antes de intentar otro modelo
            }
        }
        if (responseText) break;
        
        logMsg(`[REINTENTO] Fallo en la petición. Esperando ${baseDelay/1000}s...`);
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
    
    let tareas = [];

    for (const asignatura of Object.keys(mallasCurriculares)) {
        const grados = Object.keys(mallasCurriculares[asignatura]);
        
        for (const grado of grados) {
            const semanaData = mallasCurriculares[asignatura][grado].find(s => s.semana === semanaObjetivo);
            if (!semanaData) continue;

            for (const r of actRoles) {
                for (const a of actAmbientes) {
                    for (const n of actNiveles) {
                        for (const e of actEnfoques) {
                            tareas.push({asignatura, grado, periodo, semanaData, r, a, n, e});
                        }
                    }
                }
            }
        }
    }
    
    logMsg(`Se encolaron ${tareas.length} guías para la Semana ${semanaObjetivo}. Procesando en lotes de 10...`);
    
    const CONCURRENCIA = 10;
    for (let i = 0; i < tareas.length; i += CONCURRENCIA) {
        const lote = tareas.slice(i, i + CONCURRENCIA);
        const promesas = lote.map(t => generarGuia(t.asignatura, t.grado, t.periodo, t.semanaData, t.r, t.a, t.n, t.e));
        await Promise.all(promesas);
    }
}

function pushGuiasToGit() {
    return new Promise((resolve) => {
        // Deshabilitado para la nube. 
        // En Render, usaremos Persistent Disks o enviaremos directamente a MongoDB/Firebase.
        // Por ahora, simplemente guardamos en el File System (que en Render apuntará a un disco persistente).
        logMsg("Sincronización Git desactivada para ejecución en servidor Cloud (Render).");
        resolve(true);
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
