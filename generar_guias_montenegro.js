require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');

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

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generarGuia(params) {
    const cacheDir = path.join(__dirname, 'guias_cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const { asignatura, periodo, semana, meta, topico, rol, ambiente, nivel, enfoque } = params;

    const fileNameSafe = [asignatura, periodo, semana, rol, ambiente, nivel, enfoque]
        .map(s => s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '_') : 'na')
        .join('_') + '.json';
    
    const cacheFilePath = path.join(cacheDir, fileNameSafe);
    
    if (fs.existsSync(cacheFilePath)) {
        console.log(`[CACHÉ] Guía ya existe: ${fileNameSafe}`);
        return;
    }

    console.log(`\n[INTENTANDO] ${asignatura} P${periodo} S${semana} - ${topico}`);

    let perfilEstudiante = "estudiantes de básica secundaria (aprox. 11-14 años)";
    let matchGrado = asignatura.toString().match(/\d+/);
    let numGrado = matchGrado ? parseInt(matchGrado[0]) : 0;
    
    if (asignatura.toString().toUpperCase().includes("PENSAR")) {
        perfilEstudiante = "jóvenes y adultos en modelo educativo flexible (CLEI/PENSAR), requiriendo un enfoque andragógico, maduro y muy contextualizado a la vida laboral/cotidiana";
    } else if (numGrado >= 10) {
        perfilEstudiante = "estudiantes de educación media (aprox. 15-17 años)";
    } else if (numGrado >= 6 && numGrado <= 9) {
        perfilEstudiante = "estudiantes de básica secundaria (aprox. 11-14 años)";
    }

    const prompt = `Actúa como un ${rol}. Tu objetivo es enseñar ${asignatura} a ${perfilEstudiante} en el contexto narrativo de ${ambiente}.
OBLIGACIÓN PEDAGÓGICA: El contenido, vocabulario y profundidad científica DEBEN estar estrictamente alineados con los Derechos Básicos de Aprendizaje (DBA) y los Estándares Básicos de Competencias de Colombia para esta asignatura y nivel.
Si es un grado inferior (6º a 9º), evita la matematización excesiva o fórmulas complejas; prioriza la comprensión cualitativa, la indagación y la fenomenología.
Debes estructurar la guía de estudio siguiendo el nivel evolutivo de ${nivel}.
La guía debe evaluar la competencia de ${enfoque}.

Contexto Curricular:
- Periodo: ${periodo}
- Semana: ${semana}
- Meta de Comprensión Anual: ${meta}
- Tópico Generativo de la Semana: ${topico}

INSTRUCCIÓN MUY IMPORTANTE SOBRE GRÁFICOS Y ESTÉTICA:
1. NO generes imágenes, diagramas Mermaid, SVG ni tablas HTML complejas. Cuando sea necesario ilustrar algo, proporciona INDICACIONES TEXTUALES CLARAS para que el estudiante dibuje o imagine el concepto en su cuaderno. No dejes texto plano sin indicaciones visuales.

INSTRUCCIÓN VITAL Y OBLIGATORIA: LA PREGUNTA PROBLEMATIZADORA
Es OBLIGATORIO que tu "texto_inductivo" EMPIECE SIEMPRE con una GRAN PREGUNTA PROBLEMATIZADORA (destacada en negrita y cursiva) como el PRIMER PÁRRAFO absoluto del texto. Esta pregunta debe conectar el Tópico Generativo con la vida real del estudiante en la IE Instituto Montenegro. Todo el desarrollo posterior de la guía, tanto inductivo como deductivo, debe girar en torno a resolver y darle respuesta a esta pregunta, manteniendo el rol y la narrativa gamificada.

INSTRUCCIÓN MUY IMPORTANTE SOBRE MINIJUEGOS:
Para dar descansos mentales y reforzar el conocimiento, debes incrustar OBLIGATORIAMENTE minijuegos DIRECTAMENTE dentro de los párrafos del "texto_inductivo" y del "texto_deductivo". En cada uno de estos dos textos debe haber intercalados exactamente:
- 5 juegos de ordenar letras. Etiqueta: [JUEGO:ORDENAR_LETRAS:PALABRA]
- 5 juegos de ordenar frases. Etiqueta: [JUEGO:ORDENAR_FRASE:LA FRASE COMPLETA SIN TILDES NI SIGNOS]
- 5 juegos de sopa de letras. Etiqueta: [JUEGO:SOPA_LETRAS:PALABRA1,PALABRA2,PALABRA3] (mínimo 3, máximo 6 palabras por sopa)
- 5 juegos de crucigrama. Etiqueta: [JUEGO:CRUCIGRAMA:Pista 1|RESPUESTA1;Pista 2|RESPUESTA2] (mínimo 2, máximo 4 pistas por crucigrama)

DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO (sin bloques de código markdown como \`\`\`json) CON LA SIGUIENTE ESTRUCTURA EXACTA:
{
  "saberes_previos": [
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 0 }
  ],
  "texto_inductivo": "Texto largo en formato Markdown. OBLIGATORIAMENTE debes incrustar aquí los 5 juegos de cada tipo, así como indicaciones para que el estudiante dibuje explicados en la instrucción visual...",
  "recurso_visual": "Texto descriptivo detallado dando indicaciones al estudiante de qué debe dibujar en su cuaderno que resuma el texto inductivo.",
  "preguntas_inductivas_pagina": [
    { "pregunta": "¿P1?", "respuesta_esperada": "Respuesta ideal a P1" },
    { "pregunta": "¿P2?", "respuesta_esperada": "Respuesta ideal a P2" },
    { "pregunta": "¿P3?", "respuesta_esperada": "Respuesta ideal a P3" },
    { "pregunta": "¿P4?", "respuesta_esperada": "Respuesta ideal a P4" },
    { "pregunta": "¿P5?", "respuesta_esperada": "Respuesta ideal a P5" }
  ],
  "preguntas_inductivas_cuaderno": [
      "Pregunta que exija dibujar un esquema o mapa conceptual",
      "Pregunta que exija realizar un cuadro comparativo",
      "Pregunta reflexiva extensa sobre el texto",
      "Pregunta que exija representar gráficamente una idea"
  ],
  "texto_deductivo": "Texto deductivo largo en formato Markdown. OBLIGATORIAMENTE debes incrustar aquí también los 5 juegos de cada tipo y nuevas indicaciones explicativas...",
  "preguntas_deductivas_pagina": [
    { "pregunta": "¿P1?", "respuesta_esperada": "Respuesta ideal a P1" },
    { "pregunta": "¿P2?", "respuesta_esperada": "Respuesta ideal a P2" },
    { "pregunta": "¿P3?", "respuesta_esperada": "Respuesta ideal a P3" },
    { "pregunta": "¿P4?", "respuesta_esperada": "Respuesta ideal a P4" },
    { "pregunta": "¿P5?", "respuesta_esperada": "Respuesta ideal a P5" }
  ],
  "preguntas_deductivas_cuaderno": [
      "Pregunta que exija realizar un diagrama detallado",
      "Pregunta que exija elaborar un mapa mental",
      "Pregunta que exija un dibujo explicativo del tema",
      "Pregunta que exija una infografía artesanal"
  ],
  "icfes": [
    {
      "competencia": "Explicación de Fenómenos",
      "texto_introductorio": "Contexto de la pregunta...",
      "tabla_o_grafica_markdown": "| Dato | Valor |\\n|---|---|",
      "pregunta": "¿Qué ocurre si...?",
      "opciones": ["Opcion 1", "Opcion 2", "Opcion 3", "Opcion 4"],
      "correcta": 0,
      "retroalimentacion": {
        "0": "Correcto porque...",
        "1": "Incorrecto porque...",
        "2": "Incorrecto porque...",
        "3": "Incorrecto porque..."
      }
    }
  ]
}`;

    const modelos = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
    let responseText = "";
    
    let maxRetries = 15;
    let baseDelay = 5000; // 5 segundos base

    while (maxRetries > 0) {
        const ai = getAIClient();
        for (let i = 0; i < modelos.length; i++) {
            try {
                const response = await ai.models.generateContent({
                    model: modelos[i],
                    contents: prompt,
                });
                responseText = response.text;
                break;
            } catch (err) {
                console.error(`  [!] Fallo con ${modelos[i]}: ${err.message}`);
                await sleep(1500); // 1.5s entre modelos del mismo intento
            }
        }

        if (responseText) {
            break; // Salimos del retry loop porque tuvimos éxito
        }

        // Si todos los modelos fallaron (ej: 503, 429), aplicamos backoff exponencial
        console.error(`  [Reintento] Todos los modelos fallaron. Esperando ${baseDelay/1000}s... (Quedan ${maxRetries-1} intentos)`);
        await sleep(baseDelay);
        baseDelay *= 1.5; // Backoff exponencial
        maxRetries--;
    }

    if (!responseText) {
        console.error(`\n[FATAL] No se pudo generar la guía de ${asignatura} P${periodo} S${semana} después de múltiples intentos.`);
        return;
    }

    let limpio = responseText;
    if (limpio.includes("```")) {
        limpio = limpio.replace(/```json/gi, "").replace(/```/g, "").trim();
    }

    try {
        const finalJson = JSON.parse(limpio);
        fs.writeFileSync(cacheFilePath, JSON.stringify(finalJson, null, 2), 'utf-8');
        console.log(`  [ÉXITO] Guía guardada: ${fileNameSafe}`);
    } catch (e) {
        console.error("  [ERROR] El JSON de la IA fue inválido:", e.message);
    }
    
    // Rate limit prevention para la siguiente guía (10 segundos seguros)
    console.log("  -> Pausa de seguridad de 10s para prevenir Rate Limit...");
    await sleep(10000); 
}

async function main() {
    const rol = "Profesor Experto de la IE Instituto Montenegro";
    const ambiente = "Aulas Interactivas de la IE Instituto Montenegro";
    const nivel = "Grado 6 (Modo Gamificado)";
    const enfoque = "Resolución de problemas y pensamiento crítico";
    const periodo = "1";

    const materias = [
        {
            asignatura: "Matemáticas", meta: "Desarrollar el pensamiento numérico y espacial.",
            semanas: [
                { semana: "1", topico: "Sistemas Numéricos (Números Enteros)" },
                { semana: "2", topico: "Operaciones Básicas con Enteros" }
            ]
        },
        {
            asignatura: "Ciencias Naturales", meta: "Comprender la estructura celular y el entorno vivo.",
            semanas: [
                { semana: "1", topico: "La Célula y sus partes fundamentales" },
                { semana: "2", topico: "Funciones Celulares y organelos" }
            ]
        },
        {
            asignatura: "Ciencias Sociales", meta: "Identificar el espacio geográfico y el universo.",
            semanas: [
                { semana: "1", topico: "Geografía Física: Relieves y Climas" },
                { semana: "2", topico: "El Universo y el Sistema Solar" }
            ]
        },
        {
            asignatura: "Castellano", meta: "Fortalecer la comprensión lectora y la producción textual.",
            semanas: [
                { semana: "1", topico: "Tipos de Textos (Narrativo vs Informativo)" },
                { semana: "2", topico: "Comprensión Lectora y Estructura del Cuento" }
            ]
        }
    ];

    for (const mat of materias) {
        for (const sem of mat.semanas) {
            await generarGuia({
                asignatura: mat.asignatura,
                periodo: periodo,
                semana: sem.semana,
                meta: mat.meta,
                topico: sem.topico,
                rol: rol,
                ambiente: ambiente,
                nivel: nivel,
                enfoque: enfoque
            });
        }
    }
    console.log("\n¡FINALIZADO! Todas las guías de la IE Instituto Montenegro fueron generadas.");
}

main();
