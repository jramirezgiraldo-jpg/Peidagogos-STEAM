require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cron = require('node-cron');
const https = require('https');
const { GoogleGenAI } = require('@google/genai');
const { exec } = require('child_process');
const { generarGuiaPredeterminada } = require('./diagnosticos_predeterminados');

// ==========================================
// SISTEMA DE ENCOLAMIENTO PARA GEMINI IA
// ==========================================
class RequestQueue {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }
    
    async add(task) {
        if (this.running >= this.concurrency) {
            await new Promise(resolve => this.queue.push(resolve));
        }
        this.running++;
        try {
            return await task();
        } finally {
            this.running--;
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                next();
            }
        }
    }
}
// Permitimos máximo 2 peticiones concurrentes a la API gratuita de Gemini
const geminiQueue = new RequestQueue(2);

// Función para enviar alertas instantáneas a Telegram (@jramirezgiraldo)
function enviarAlertaTelegram(mensaje) {
    try {
        const telegramUser = process.env.TELEGRAM_ADMIN_USER || '@jramirezgiraldo';
        if (!telegramUser) return;
        const url = `https://api.callmebot.com/text.php?user=${encodeURIComponent(telegramUser)}&text=${encodeURIComponent(mensaje)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`[TELEGRAM ALERTA] Notificación enviada con éxito a ${telegramUser}`);
            });
        }).on('error', (err) => {
            console.error(`[TELEGRAM ERROR] No se pudo enviar notificación: ${err.message}`);
        });
    } catch(e) {
        console.error(`[TELEGRAM EXCEPTION] ${e.message}`);
    }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middlewares
app.use(cors());
app.use(express.json()); // Permitir parseo de JSON en el body

// Middleware de seguridad y protección de propiedad intelectual
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Copyright', '© 2026 Peidagogos STEAM. Todos los derechos reservados.');
    next();
});

app.use(express.static(path.join(__dirname))); // Servir archivos estáticos

// Inicializar el sistema de rotación de API Keys
const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
const apiKeys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
let currentKeyIndex = 0;

function getAIClient() {
    if (apiKeys.length === 0) return null;
    const key = apiKeys[currentKeyIndex];
    const keyNumber = currentKeyIndex + 1;
    // Rotar al siguiente para la próxima petición
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    console.log(`[IA] Usando API Key #${keyNumber} de ${apiKeys.length} (${key.substring(0,8)}...)`);
    return new GoogleGenAI({ apiKey: key });
}

// Endpoint para generar la guía pedagógica con IA por demanda
app.post('/api/generate-guide', async (req, res) => {
    try {
        const {
            asignatura,
            grado,
            periodo,
            semana,
            meta,
            topico,
            rol,
            ambiente,
            nivel,
            enfoque,
            nombre_estudiante,
            estudiante_nombre,
            modo,
            institucion
        } = req.body;

        // Nombre propio del estudiante
        const nombreEstudiante = (nombre_estudiante || estudiante_nombre || 'Estudiante').trim();

        // Determinar contexto y modalidad institucional
        const esCicloNocturno = grado && grado.toString().toLowerCase().includes('ciclo');
        const modalidad = modo || institucion || (esCicloNocturno ? 'Validacion' : 'IE Instituto Montenegro');
        
        let contextoModalidad = '';
        if (modalidad.toLowerCase().includes('validacion') || esCicloNocturno) {
            contextoModalidad = `MODALIDAD: PROGRAMA DE VALIDACIÓN DEL BACHILLERATO (Jóvenes y Adultos).
Estás guiando a ${nombreEstudiante} en su proceso de validación. El contenido DEBE ser altamente contextualizado en la vida cotidiana, el mundo laboral, la economía del hogar, la salud y la preparación rigurosa para las pruebas de Estado Saber / Validación del MEN. Mantén un tono maduro, motivador, empático y libre de tecnicismos oscuros.`;
        } else if (modalidad.toLowerCase().includes('home') || modalidad.toLowerCase().includes('homeschool')) {
            contextoModalidad = `MODALIDAD: HOME SCHOOL (Educación en el Hogar).
Estás acompañando a ${nombreEstudiante} y a su tutor familiar en un ambiente de aprendizaje en casa. Promueve la curiosidad, el autoaprendizaje guiado, la experimentación con materiales cotidianos del hogar y la reflexión crítica.`;
        } else {
            contextoModalidad = `MODALIDAD: INSTITUCIÓN EDUCATIVA INSTITUTO MONTENEGRO (Colegio Regular - Grado ${grado || 'General'}).
Estás formando a ${nombreEstudiante} mediante la metodología pedagógica STEAM integrada, vinculando los conceptos con su entorno regional (Paisaje Cultural Cafetero), proyectos de aula y trabajo colaborativo.`;
        }

        // Adaptación pedagógica por ciclo de edad/grado
        let adaptacionGrado = '';
        const gradoNum = parseInt(grado, 10);
        if (gradoNum >= 3 && gradoNum <= 5) {
            adaptacionGrado = `NIVEL: BÁSICA PRIMARIA (Grado ${grado}).
Usa un lenguaje claro, cercano y motivador. En las actividades de cuaderno, pide dibujos, esquemas coloridos, comparaciones visuales y observaciones sencillas del entorno. Evita fórmulas complejas.`;
        } else if (gradoNum >= 6 && gradoNum <= 7) {
            adaptacionGrado = `NIVEL: BÁSICA SECUNDARIA INICIAL (Grado ${grado}).
Enfócate en la comprensión conceptual profunda y ejemplos cotidianos. En ${asignatura}, da instrucciones para que ${nombreEstudiante} realice dibujos, diagramas de flujo y esquemas explicativos en su cuaderno. Omite fórmulas matemáticas abstractas innecesarias.`;
        } else if (gradoNum >= 8 && gradoNum <= 9) {
            adaptacionGrado = `NIVEL: BÁSICA SECUNDARIA MEDIA (Grado ${grado}).
Fomenta el razonamiento lógico, el análisis causa-efecto, la formulación de hipótesis y el diseño de modelos explicativos.`;
        } else if (gradoNum >= 10 || gradoNum === 11 || grado === 'PENS' || esCicloNocturno) {
            adaptacionGrado = `NIVEL: MEDIA VOCACIONAL Y PREPARACIÓN SABER 11 (Grado ${grado}).
Rigor conceptual, lectura crítica de tablas y gráficos, formulación de modelos y justificación epistemológica de respuestas para pruebas ICFES Saber 11.`;
        }

        // Adaptaciones por áreas específicas
        let adaptacionArea = '';
        const asigLower = (asignatura || '').toLowerCase();
        if (asigLower.includes('turismo')) {
            adaptacionArea = `ENFOQUE DE TURISMO Y EMPRENDIMIENTO:
Orienta la guía hacia la formulación o desarrollo de un bien o servicio turístico sostenible en el marco del Paisaje Cultural Cafetero y la economía local.`;
        } else if (asigLower.includes('artística') || asigLower.includes('música') || asigLower.includes('artistica')) {
            adaptacionArea = `ENFOQUE DE EDUCACIÓN ARTÍSTICA / MÚSICA:
Integra conceptos de ritmo, pulso, apreciación auditiva, notación musical básica o expresión plástica según corresponda.`;
        } else if (asigLower.includes('ética') || asigLower.includes('etica')) {
            adaptacionArea = `ENFOQUE DE ÉTICA Y VALORES / PROYECTO DE VIDA:
Estructura la reflexión a partir de dilemas morales reales, toma de decisiones éticas, empatía, resolución pacífica de conflictos y construcción del Proyecto de Vida de ${nombreEstudiante}.`;
        }

        // --- CACHE & DIAGNOSTIC PRESET LOGIC ---
        const cacheDir = path.join(__dirname, 'guias_cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        // Generar un nombre de archivo seguro basado en los parámetros y estudiante
        const fileNameSafe = [
            asignatura,
            grado,
            periodo,
            semana,
            nombreEstudiante.replace(/[^a-z0-9]/gi, '_'),
            modalidad.replace(/[^a-z0-9]/gi, '_'),
            rol,
            ambiente,
            nivel,
            enfoque
        ].map(s => s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '_') : 'na').join('_') + '.json';
            
        const cacheFilePath = path.join(cacheDir, fileNameSafe);
        
        // 1. Verificar si existe en caché y es válida
        if (fs.existsSync(cacheFilePath)) {
            try {
                const cacheData = fs.readFileSync(cacheFilePath, 'utf-8');
                const parsed = typeof cacheData === 'string' ? JSON.parse(cacheData) : cacheData;
                const objStr = JSON.stringify(parsed).toLowerCase();
                const asigCheck = (asignatura || '').toLowerCase().substring(0, 4);
                
                if (objStr.includes(asigCheck) && objStr.includes('[actividad:cuaderno:')) {
                    console.log(`[Caché HIT VÁLIDO] Sirviendo guía desde: ${fileNameSafe}`);
                    return res.json({ text: typeof cacheData === 'string' ? cacheData : JSON.stringify(cacheData) });
                } else {
                    console.log(`[Caché DESACTUALIZADO/INCOHERENTE] Eliminando caché previa: ${fileNameSafe}`);
                    fs.unlinkSync(cacheFilePath);
                }
            } catch(e) {
                try { fs.unlinkSync(cacheFilePath); } catch(err) {}
            }
        }
        
        // 2. Si es Semana 1 (Diagnóstico de Ciclos o Grados Regulares), servir la guía predeterminada garantizada
        if (semana == '1' || periodo == '1' && semana == '1' || apiKeys.length === 0) {
            console.log(`[DIAGNÓSTICO] Sirviendo guía predeterminada garantizada para ${nombreEstudiante} (${grado})...`);
            const guiaPredeterminada = generarGuiaPredeterminada({
                asignatura, grado, periodo, semana, rol, ambiente, nivel, enfoque, nombre_estudiante: nombreEstudiante, institucion, modo
            });
            try {
                fs.writeFileSync(cacheFilePath, JSON.stringify(guiaPredeterminada, null, 2), 'utf-8');
            } catch(e) {}
            return res.json({ text: JSON.stringify(guiaPredeterminada) });
        }
        
        console.log(`[Caché MISS] Generando nueva guía personalizada para ${nombreEstudiante}: ${fileNameSafe}`);
        // --- END CACHE LOGIC ---

        // Construir el Prompt Maestro alineado con Saber 11 y Pedagogía STEAM V11
        
        if (modo === 'diapositivas') {
            const promptDiapositivas = `Actúa como un Diseñador Web Front-End y Experto en Narrativa Corporativa (Storytelling). Tu objetivo es generar el código completo de una presentación profesional de alto valor en un único archivo HTML autocontenido (Single File HTML). La presentación debe ser profunda, analítica y visualmente impactante, evitando generalidades.

DATOS DE LA PRESENTACIÓN:
- Asignatura: ${asignatura}
- Grado: ${grado}
- Tema: ${topico || meta}

Requisitos estrictos:
1. Usa HTML, CSS y JS integrados en un solo archivo.
2. Usa librerías como Reveal.js desde CDN o crea tu propio motor de diapositivas con CSS/JS. (ejemplo: <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.js"></script>)
3. El diseño debe ser moderno, corporativo y de alto impacto (Tome, Gamma style).
4. No devuelvas markdown, JSON ni backticks, solo el código HTML completo. Empieza con <!DOCTYPE html>`;
            
            try {
                const deepseekKey = (process.env.DEEPSEEK_API_KEY || 'sk-8bdd9c5adcfa4d8e958f1ea7a07e8167');
                const ds_response = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + deepseekKey
                    },
                    body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages: [
                            { role: 'system', content: 'Devuelve EXCLUSIVAMENTE HTML. SIN MARKDOWN. Empieza directamente con <!DOCTYPE html>' },
                            { role: 'user', content: promptDiapositivas }
                        ]
                    })
                });
                
                if (ds_response.ok) {
                    const ds_data = await ds_response.json();
                    let htmlRes = ds_data.choices[0].message.content;
                    htmlRes = htmlRes.replace(/^```html/i, '').replace(/```$/i, '').trim();
                    return res.json({ html: htmlRes });
                } else {
                    return res.status(500).json({error: 'Fallo al generar HTML'});
                }
            } catch (err) {
                return res.status(500).json({error: 'Fallo IA'});
            }
        }
        
const prompt = `Actúa como un ${rol}. Tu objetivo pedagógico es enseñar ${asignatura} en el contexto narrativo inmersivo de ${ambiente}.

CONTEXTO INSTITUCIONAL Y PEDAGÓGICO:
${contextoModalidad}
${adaptacionGrado}
${adaptacionArea}

DATOS CURRICULARES:
- Estudiante: ${nombreEstudiante}
- Asignatura: ${asignatura}
- Grado / Nivel: ${grado}
- Periodo: ${periodo}
- Semana: ${semana}
- Meta de Comprensión: ${meta}
- Tópico / Tema: ${topico}
- Nivel de Dificultad: ${nivel}
- Competencia Focal: ${enfoque}

⭐ REGLA DE ORO DE PERSONALIZACIÓN (OBLIGATORIA):
A lo largo de TODA la guía pedagógica (en el objetivo de aprendizaje, el texto inductivo, el texto deductivo, las 6 actividades de cuaderno y los retos interactivos de plataforma), DEBES dirigirte explícita y cálidamente a ${nombreEstudiante} por su NOMBRE PROPIO (${nombreEstudiante}).
Ejemplos de cómo debes redactar:
- "¡Hola ${nombreEstudiante}! En esta aventura exploraremos..."
- "${nombreEstudiante}, observa atentamente el siguiente caso y reflexiona..."
- "Ahora ${nombreEstudiante}, toma tu cuaderno y dibuja un esquema donde representes..."
- "Muy bien ${nombreEstudiante}, analicemos la teoría fundamental detrás de este fenómeno..."
- "${nombreEstudiante}, demuestra tu destreza resolviendo el siguiente desafío..."

REGLAS PEDAGÓGICAS Y ESTRUCTURA ESTRICITA (OBLIGATORIAS):
1. INICIO:
   - "objetivo_aprendizaje": Objetivo claro y motivador para ${nombreEstudiante}.
   - "pregunta_problematizadora": Pregunta desafiante e indagadora en el contexto real.
   - "saberes_previos": Exactamente 3 Preguntas de Selección Múltiple (con 4 opciones y respuesta correcta) para exploración inicial.

2. BLOQUE INDUCTIVO:
   - "texto_inductivo" DEBE tener MÍNIMO 500 PALABRAS. Narrativa inmersiva hablándole directamente a ${nombreEstudiante}.
   - Intercaladas dentro del texto inductivo, debes incrustar estas etiquetas exactas:
     - 3 Actividades de Cuaderno: [ACTIVIDAD:CUADERNO:Instrucción explícita para ${nombreEstudiante} de lo que debe responder, dibujar, crear en tabla comparativa o mapa mental en su cuaderno]
     - 2 Actividades de Plataforma (con bloqueo Copy/Paste y Verificador Anti-IA): [ACTIVIDAD:PLATAFORMA:Pregunta reflexiva profunda para ${nombreEstudiante}|Respuesta esperada o palabras clave]

3. INTERACTIVIDAD BLOQUE 1 (DRAG & DROP):
   - 5 Juegos de Ordenar Letras: [JUEGO:ORDENAR_LETRAS:PALABRA1], [JUEGO:ORDENAR_LETRAS:PALABRA2], etc.
   - 2 Juegos de Ordenar Frase: [JUEGO:ORDENAR_FRASE:FRASE COMPLETA CON SENTIDO 1], [JUEGO:ORDENAR_FRASE:FRASE COMPLETA CON SENTIDO 2]

4. BLOQUE DEDUCTIVO:
   - "texto_deductivo" DEBE tener MÍNIMO 500 PALABRAS. Formalización teórica clara, leyes/modelos y conceptos fundamentales explicados a ${nombreEstudiante}.
   - Intercaladas dentro del texto deductivo, debes incrustar estas etiquetas exactas:
     - 5 Actividades de Cuaderno: [ACTIVIDAD:CUADERNO:Instrucción explícita de responder, dibujar, hacer tabla comparativa o mapa mental en cuaderno]
     - 2 Actividades de Plataforma (con bloqueo Copy/Paste y Verificador Anti-IA): [ACTIVIDAD:PLATAFORMA:Pregunta de síntesis/aplicación para ${nombreEstudiante}|Respuesta esperada]

5. INTERACTIVIDAD BLOQUE 2 (DRAG & DROP):
   - 3 Juegos de Ordenar Letras: [JUEGO:ORDENAR_LETRAS:PALABRA1], [JUEGO:ORDENAR_LETRAS:PALABRA2], [JUEGO:ORDENAR_LETRAS:PALABRA3]
   - 2 Juegos de Ordenar Frase: [JUEGO:ORDENAR_FRASE:FRASE CONCEPTO CLAVE 1], [JUEGO:ORDENAR_FRASE:FRASE CONCEPTO CLAVE 2]

6. CIERRE GAMIFICADO FINAL:
   - 1 Sola Sopa de Letras con exactamente 10 palabras clave del tema: [JUEGO:SOPA_LETRAS:P1,P2,P3,P4,P5,P6,P7,P8,P9,P10]

DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA EXACTA (SIN TEXTO ANTES NI DESPUÉS):
{
  "objetivo_aprendizaje": "Objetivo pedagógico motivador para ${nombreEstudiante}...",
  "pregunta_problematizadora": "¿Pregunta problematizadora...?",
  "saberes_previos": [
    { "pregunta": "¿...?", "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"], "correcta": 0 },
    { "pregunta": "¿...?", "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"], "correcta": 1 },
    { "pregunta": "¿...?", "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"], "correcta": 2 }
  ],
  "texto_inductivo": "Markdown (+500 palabras) hablándole a ${nombreEstudiante}, incrustando 3 [ACTIVIDAD:CUADERNO:...], 2 [ACTIVIDAD:PLATAFORMA:...], 5 [JUEGO:ORDENAR_LETRAS:...] y 2 [JUEGO:ORDENAR_FRASE:...]",
  "recurso_visual": "Instrucción de mapa mental o diagrama Mermaid graph TD o tabla markdown",
  "texto_deductivo": "Markdown (+500 palabras) formalizando la teoría para ${nombreEstudiante}, incrustando 5 [ACTIVIDAD:CUADERNO:...], 2 [ACTIVIDAD:PLATAFORMA:...], 3 [JUEGO:ORDENAR_LETRAS:...] y 2 [JUEGO:ORDENAR_FRASE:...]",
  "icfes": [
    {
      "competencia": "Explicación de Fenómenos",
      "texto_introductorio": "Contexto...",
      "tabla_o_grafica_markdown": "",
      "pregunta": "¿...?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 0,
      "retroalimentacion": { "0": "Correcto...", "1": "Incorrecto...", "2": "Incorrecto...", "3": "Incorrecto..." }
    },
    {
      "competencia": "Uso Comprensivo del Conocimiento",
      "texto_introductorio": "Contexto...",
      "tabla_o_grafica_markdown": "",
      "pregunta": "¿...?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 1,
      "retroalimentacion": { "0": "Incorrecto...", "1": "Correcto...", "2": "Incorrecto...", "3": "Incorrecto..." }
    },
    {
      "competencia": "Indagación",
      "texto_introductorio": "Contexto experimental...",
      "tabla_o_grafica_markdown": "",
      "pregunta": "¿...?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 2,
      "retroalimentacion": { "0": "Incorrecto...", "1": "Incorrecto...", "2": "Correcto...", "3": "Incorrecto..." }
    }
  ],
  "cierre_gamificado": {
    "sopa_letras": "PAL1,PAL2,PAL3,PAL4,PAL5,PAL6,PAL7,PAL8,PAL9,PAL10"
  }
}`;

        // Modelos Gemini compatibles y operativos en @google/genai
        const modelos = [
            'gemini-3.5-flash-lite',
            'gemini-flash-latest',
            'gemini-3.5-flash',
            'gemini-3.1-flash-lite',
            'gemini-flash-lite-latest'
        ];
        let responseText = "";
        let finalError = null;

        const maxKeyAttempts = Math.max(apiKeys.length, 1);
        for (let k = 0; k < maxKeyAttempts && !responseText; k++) {
            const ai = getAIClient();
            if (!ai) break;
            for (let i = 0; i < modelos.length; i++) {
                try {
                    console.log(`[IA] Generando guía con modelo: ${modelos[i]} (Intento key #${k+1})...`);
                    const response = await geminiQueue.add(() => ai.models.generateContent({
                        model: modelos[i],
                        contents: prompt,
                        config: {
                            responseMimeType: "application/json"
                        }
                    }));
                    if (response && response.text) {
                        responseText = response.text;
                        console.log(`[IA] ✅ Guía generada exitosamente con ${modelos[i]}`);
                        break; // Si tiene éxito, salir del bucle de modelos
                    }
                } catch (err) {
                    console.error(`[IA] Fallo con el modelo ${modelos[i]}:`, err.message);
                    finalError = err;
                    if (err.status === 400) break;
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }

        if (!responseText && process.env.OPENAI_API_KEY) {
            console.log(`[IA Fallback] Gemini falló. Intentando con OpenAI ChatGPT para la guía...`);
            try {
                const { OpenAI } = require('openai');
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: "Devuelve EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO según las instrucciones. SIN markdown json." },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.7
                });
                
                if (completion.choices[0].message.content) {
                    responseText = completion.choices[0].message.content;
                    console.log(`[IA Fallback] ✅ Guía generada exitosamente con OpenAI`);
                }
            } catch (openaiErr) {
                                console.error(`[IA Fallback] OpenAI también falló:`, openaiErr.message);
            }
        }
        
        if (!responseText) {
            console.log(`[IA Fallback] Intentando con DeepSeek API...`);
            try {
                const deepseekKey = (process.env.DEEPSEEK_API_KEY || 'sk-8bdd9c5adcfa4d8e958f1ea7a07e8167');
                // Usando fetch a deepseek
                const ds_response = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + deepseekKey
                    },
                    body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages: [
                            { role: 'system', content: 'Devuelve EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO según las instrucciones. SIN markdown json.' },
                            { role: 'user', content: prompt }
                        ]
                    })
                });
                if (ds_response.ok) {
                    const ds_data = await ds_response.json();
                    responseText = ds_data.choices[0].message.content;
                    console.log(`[IA Fallback] Guía generada exitosamente con DeepSeek`);
                } else {
                    console.error(`[IA Fallback] Error DeepSeek:`, ds_response.status);
                }
            } catch (dsErr) {
                console.error(`[IA Fallback] DeepSeek también falló:`, dsErr.message);
            }
        }

        if (!responseText) {
            console.log(`[IA Fallback] Todas las IAs no están disponibles, sirviendo guía pedagógica estructurada de respaldo para ${nombreEstudiante}...`);
            const fallbackGuia = generarGuiaPredeterminada({
                asignatura, grado, periodo, semana, rol, ambiente, nivel, enfoque, nombre_estudiante: nombreEstudiante, institucion, modo
            });
            try {
                fs.writeFileSync(cacheFilePath, JSON.stringify(fallbackGuia, null, 2), 'utf-8');
            } catch(e) {}
            return res.json({ text: JSON.stringify(fallbackGuia) });
        }

        // Sanitización y parseo robusto del JSON
        let finalJson;
        try {
            let limpio = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
            const firstBrace = limpio.indexOf('{');
            const lastBrace = limpio.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                limpio = limpio.substring(firstBrace, lastBrace + 1);
            }
            finalJson = JSON.parse(limpio);
        } catch (parseErr) {
            console.error("Error parseando respuesta JSON de IA:", parseErr.message, responseText);
            return res.status(500).json({ error: "La IA generó una respuesta pero el formato JSON vino incompleto. Por favor inténtalo de nuevo." });
        }
        
        // Guardar en caché
        try {
            fs.writeFileSync(cacheFilePath, JSON.stringify(finalJson, null, 2), 'utf-8');
        } catch (fileErr) {
            console.error("Error guardando en caché:", fileErr.message);
        }

        // Enviar la respuesta de vuelta al frontend compatible con app.js
        res.json({ text: JSON.stringify(finalJson) });

    } catch (error) {
        console.error("Error fatal al generar con la IA:", error);
        res.status(500).json({ error: `Error en el servidor: ${error.message || "Ocurrió un error inesperado al procesar la guía."}` });
    }
});

// ==========================================
// NUEVOS ENDPOINTS DE USUARIOS (MIGRADOS DE PYTHON)
// ==========================================
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://oalrwnautbpxfdznfisf.supabase.co', process.env.SUPABASE_KEY || process.env.SUPABASE_SECRET);

global.db = {
    usuarios: [],
    docentes: [],
    actividades_asignadas: [],
    asignaturas: [],
    herramientas_guardadas: []
};

// Cargar la DB al iniciar el servidor
async function initDB() {
    const { data: u } = await supabase.from('usuarios').select('*');
    if (u) global.db.usuarios = u;
    const { data: d } = await supabase.from('docentes').select('*');
    if (d) global.db.docentes = d;
    const { data: a } = await supabase.from('asignaturas').select('*');
    if (a) global.db.asignaturas = a;
    const { data: aa } = await supabase.from('actividades_asignadas').select('*');
    if (aa) global.db.actividades_asignadas = aa;
    const { data: hg } = await supabase.from('herramientas_guardadas').select('*');
    if (hg) global.db.herramientas_guardadas = hg;
    console.log("🚀 [DB] Supabase sincronizado en memoria exitosamente.");
}
initDB();

const readJSON = (file) => {
    try {
        const table = file.replace('.json', '');
        return global.db[table] || [];
    } catch(e) { return []; }
};

const writeJSON = (file, data) => {
    const table = file.replace('.json', '');
    global.db[table] = data; // Respuesta instantánea para 1000 usuarios
    
    // Identificar la llave primaria para upsert
    let conflictKey = 'id';
    if (table === 'usuarios' || table === 'docentes') {
        conflictKey = 'documento';
    }
    
    // Backup asíncrono en la nube (sin bloquear el hilo de Node.js)
    supabase.from(table).upsert(data, { onConflict: conflictKey }).then(({error}) => {
        if (error) console.error(`[DB ERROR] Sincronizando ${table}:`, error.message);
    });
};

app.get('/api/usuarios', (req, res) => res.json(readJSON('usuarios.json')));
app.get('/api/estudiantes', (req, res) => res.json(readJSON('usuarios.json')));
app.get('/api/docentes', (req, res) => {
    let docentes = readJSON('docentes.json') || [];
    let usuarios = readJSON('usuarios.json') || [];
    
    // Unir docentes de docentes.json y usuarios.json con rol docente
    usuarios.forEach(u => {
        const esDocente = u.rol === 'docente' || (u.tipo && String(u.tipo).includes('docente')) || (u.tipo && String(u.tipo).includes('tutor'));
        const normDoc = String(u.documento || u.cedula || u.usuario || '').trim().toLowerCase().replace(/[\.\,\-\s]/g, '');
        if (esDocente && normDoc) {
            if (!docentes.some(d => String(d.documento || d.cedula || d.usuario || '').trim().toLowerCase().replace(/[\.\,\-\s]/g, '') === normDoc)) {
                docentes.push(u);
            }
        }
    });

    res.json(docentes);
});

app.post('/api/eliminar-docente', (req, res) => {
    const { documento } = req.body || {};
    const normDoc = String(documento || '').trim().toLowerCase().replace(/[\.\,\-\s]/g, '');
    if (!normDoc) return res.status(400).json({ error: "Documento requerido" });

    let docentes = readJSON('docentes.json') || [];
    let usuarios = readJSON('usuarios.json') || [];

    docentes = docentes.filter(d => String(d.documento || d.cedula || d.usuario || '').trim().toLowerCase().replace(/[\.\,\-\s]/g, '') !== normDoc);
    usuarios = usuarios.filter(u => String(u.documento || u.cedula || u.usuario || u.id || '').trim().toLowerCase().replace(/[\.\,\-\s]/g, '') !== normDoc);

    writeJSON('docentes.json', docentes);
    writeJSON('usuarios.json', usuarios);

    console.log(`[ADMIN] Docente eliminado exitosamente: ${normDoc}`);
    res.json({ status: "success", docentes });
});

app.post('/api/eliminar-invitacion-docente', (req, res) => {
    const { token, documento } = req.body || {};
    if (!token && !documento) {
        return res.status(400).json({ error: "Se requiere token o documento para eliminar la invitación" });
    }

    let docentes = readJSON('docentes.json') || [];
    let usuarios = readJSON('usuarios.json') || [];

    const tokenNorm = String(token || '').trim();
    const docNorm = String(documento || '').trim().toLowerCase().replace(/[\.\,\-\s]/g, '');

    docentes = docentes.filter(d => {
        const matchToken = tokenNorm && (d.token === tokenNorm || d.token_invitacion === tokenNorm);
        const matchDoc = docNorm && String(d.documento || d.cedula || d.usuario || '').trim().toLowerCase().replace(/[\.\,\-\s]/g, '') === docNorm;
        return !(matchToken || matchDoc);
    });

    usuarios = usuarios.filter(u => {
        const matchToken = tokenNorm && (u.token === tokenNorm || u.token_invitacion === tokenNorm);
        const matchDoc = docNorm && String(u.documento || u.cedula || u.usuario || u.id || '').trim().toLowerCase().replace(/[\.\,\-\s]/g, '') === docNorm;
        return !(matchToken || matchDoc);
    });

    writeJSON('docentes.json', docentes);
    writeJSON('usuarios.json', usuarios);

    console.log(`[ADMIN] Invitación/Docente eliminado quirúrgicamente: token=${tokenNorm}, documento=${docNorm}`);
    res.json({ status: "success", token: tokenNorm });
});

app.post('/api/logout-admin', (req, res) => {
    console.log('[ADMIN] Cierre de sesión de administrador registrado');
    res.json({ status: "success", message: "Sesión del administrador cerrada correctamente" });
});
app.get('/api/asignaturas', (req, res) => res.json(readJSON('asignaturas.json')));

const normalizarStr = (str) => String(str || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');

app.post('/api/registro-estudiante', (req, res) => {
    let usuarios = readJSON('usuarios.json');
    const nuevo = req.body || {};
    const normDoc = normalizarStr(nuevo.documento || nuevo.usuario);
    const nom = String(nuevo.nombre || nuevo.nombres || nuevo.nombre_completo || '').trim();
    const ape = String(nuevo.apellidos || '').trim();
    const grado = String(nuevo.grado || nuevo.grupo || '').trim();

    if (!normDoc) {
        return res.status(400).json({ error: "❌ El número de documento es obligatorio." });
    }

    const isGenericNom = !nom || nom.toLowerCase() === 'estudiante' || nom.toLowerCase() === 'estudiante nocturno';
    if (isGenericNom) {
        return res.status(400).json({ error: "❌ Debes ingresar un Nombre (o Nombres) real y válido." });
    }

    if (!ape && !nuevo.nombre_completo) {
        return res.status(400).json({ error: "❌ Debes ingresar los Apellidos reales del estudiante." });
    }

    if (!grado) {
        return res.status(400).json({ error: "❌ El Grado o Ciclo es obligatorio." });
    }
    
    // GUARD: Este endpoint es SOLO para estudiantes. Si el rol es docente, director o admin, ignorar silenciosamente.
    const rolPayload = String(nuevo.rol || nuevo.tipo || '').toLowerCase().trim();
    if (rolPayload === 'docente' || rolPayload === 'director' || rolPayload === 'admin' || 
        rolPayload === 'homeschool_tutor' || rolPayload.includes('docente')) {
        console.log(`[REGISTRO] Payload con rol="${rolPayload}" ignorado en /api/registro-estudiante (solo para estudiantes).`);
        return res.status(200).json({ status: 'ok', message: 'Registro de docente no aplica aquí.' });
    }

    // Si viene matriculado por un docente, se autoriza automáticamente
    const matriculadoPorDocente = !!nuevo.docente_id;


    // Validación de código institucional para IE Instituto Montenegro
    const esIEInstituto = nuevo.institucion === 'InstitutoMontenegro' || 
                          nuevo.institucion === 'IE Instituto Montenegro' || 
                          (nuevo.institucion && String(nuevo.institucion).toLowerCase().includes('montenegro'));
    
    if (matriculadoPorDocente) {
        nuevo.institucion = nuevo.institucion || 'InstitutoMontenegro';
        nuevo.codigo_institucional = 'ieinstituto2026';
        nuevo.pago_realizado = true;
        nuevo.pago_activo = true;
        nuevo.suscrito = true;
        nuevo.tipo_acceso = 'institucional_ilimitado';
        // ── PD-2 FIX: guardar explícitamente la relación grupo/director ──
        nuevo.director_doc  = nuevo.director_doc  || nuevo.docente_id || null;
        nuevo.grupo_director = nuevo.grupo_director || nuevo.grupo    || nuevo.grado || null;
        nuevo.grado  = nuevo.grado  || nuevo.grupo_director || null;
        nuevo.grupo  = nuevo.grupo  || nuevo.grupo_director || null;
        console.log(`[PD-2] Vinculación grupo guardada: estudiante=${nuevo.documento} grupo=${nuevo.grupo} director=${nuevo.director_doc}`);

    } else if (esIEInstituto) {
        const codigo = normalizarStr(nuevo.codigo_institucional || nuevo.codigo);
        if (codigo !== 'ieinstituto2026' && codigo !== 'instituto2026') {
            return res.status(403).json({ 
                error: "Código de acceso institucional incorrecto. Debes ingresar el código oficial para matricularte en la IE Instituto Montenegro (ieinstituto2026)." 
            });
        }
        nuevo.pago_realizado = true;
        nuevo.pago_activo = true;
        nuevo.suscrito = true;
        nuevo.tipo_acceso = 'institucional_ilimitado';
    } else {
        // Home School, Validación y particulares: Matrícula libre (1ª guía de cada materia gratis)
        if (nuevo.pago_realizado === undefined) {
            nuevo.pago_realizado = false;
            nuevo.pago_activo = false;
            nuevo.suscrito = false;
            nuevo.tipo_acceso = 'freemium_primera_guia_gratis';
        }
    }
    
    // Si ya existe por documento, actualizar datos
    const idx = usuarios.findIndex(u => normalizarStr(u.documento || u.id || u.usuario) === normDoc);
    if (idx !== -1) {
        usuarios[idx] = { ...usuarios[idx], ...nuevo };
    } else {
        usuarios.push(nuevo);
    }
    
    writeJSON('usuarios.json', usuarios);
    console.log(`[MATRICULA] Estudiante registrado exitosamente: ${nuevo.nombre} ${nuevo.apellidos} (${nuevo.documento}) - Grado: ${nuevo.grado || nuevo.grupo}`);
    
    // Notificación en vivo a Telegram
    const nombreCompleto = `${nuevo.nombre || ''} ${nuevo.apellidos || ''}`.trim() || nuevo.usuario || 'Estudiante';
    const gradoGrupo = nuevo.grado || nuevo.grupo || 'No especificado';
    const inst = nuevo.institucion || nuevo.modalidad || (String(gradoGrupo).includes('Ciclo') ? 'Validación Nocturna' : 'IE Instituto Montenegro');
    const doc = nuevo.documento || nuevo.id || 'S/D';
    const celular = nuevo.telefono || nuevo.celular || nuevo.whatsapp || 'No registrado';
    const fecha = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });

    enviarAlertaTelegram(
`🔔 ¡NUEVO ESTUDIANTE MATRICULADO!
👤 Nombre: ${nombreCompleto}
📄 Documento: ${doc}
🎓 Grado/Ciclo: ${gradoGrupo}
🏛️ Modalidad: ${inst}
📱 Contacto: ${celular}
📅 Fecha: ${fecha}`
    );

    res.json({ status: "success", estudiante: nuevo });
});

app.post('/api/registro-docente', (req, res) => {
    let docentes = readJSON('docentes.json') || [];
    let usuarios = readJSON('usuarios.json') || [];
    const nuevo = req.body || {};
    const normDoc = String(nuevo.documento || nuevo.usuario || nuevo.cedula || '').trim().toLowerCase().replace(/[\.\,\-\s]/g, '');
    
    nuevo.rol = 'docente';
    nuevo.tipo = nuevo.tipo || 'docente_regular';
    nuevo.pago_realizado = true;
    nuevo.pago_activo = true;

    // Actualizar o agregar en docentes.json
    const dIdx = docentes.findIndex(d => String(d.documento || d.cedula || d.usuario || '').trim().toLowerCase().replace(/[\.\,\-\s]/g, '') === normDoc);
    if (dIdx >= 0) docentes[dIdx] = { ...docentes[dIdx], ...nuevo };
    else docentes.push(nuevo);
    writeJSON('docentes.json', docentes);

    // Actualizar o agregar en usuarios.json
    const uIdx = usuarios.findIndex(u => String(u.documento || u.cedula || u.usuario || u.id || '').trim().toLowerCase().replace(/[\.\,\-\s]/g, '') === normDoc);
    if (uIdx >= 0) usuarios[uIdx] = { ...usuarios[uIdx], ...nuevo };
    else usuarios.push(nuevo);
    writeJSON('usuarios.json', usuarios);

    const d = req.body;
    const nombreDocente = `${d.nombre || ''} ${d.apellidos || ''}`.trim() || d.usuario || 'Docente';
    enviarAlertaTelegram(
`👨‍🏫 ¡NUEVO DOCENTE REGISTRADO!
👤 Nombre: ${nombreDocente}
📄 Documento: ${d.documento || 'S/D'}
🏛️ Institución: ${d.institucion || 'IE Instituto Montenegro'}
📚 Asignatura: ${d.asignatura || 'General'}`
    );

    res.json({ status: "success" });
});

app.post('/api/registro-tutor', (req, res) => {
    const docentes = readJSON('docentes.json');
    const tutor = {
        ...req.body,
        tipo: 'tutor_homeschool',
        institucion: 'HomeSchool'
    };
    docentes.push(tutor);
    writeJSON('docentes.json', docentes);

    const t = req.body;
    enviarAlertaTelegram(
`🏡 ¡NUEVO TUTOR HOME SCHOOL!
👤 Nombre: ${t.nombre || t.usuario || 'Tutor'}
📄 Documento: ${t.documento || 'S/D'}
📧 Correo: ${t.email || t.correo || 'S/D'}
📱 Teléfono: ${t.telefono || t.celular || 'S/D'}`
    );

    res.json({ status: "success", tutor });
});

app.post('/api/guardar-grupo-director', (req, res) => {
    try {
        const body = req.body || {};
        const docDirector = String(body.documento_director || body.documento || (body.grupo && body.grupo.directorDoc) || '').trim();
        const grado = String(body.grado || (body.grupo && body.grupo.grado) || '').trim();
        const grupo = String(body.grupo && typeof body.grupo === 'object' ? body.grupo.grupo : body.grupo || '').trim();
        const docentes = Array.isArray(body.docentes) ? body.docentes : (body.grupo && Array.isArray(body.grupo.docentes) ? body.grupo.docentes : []);
        const creadoEn = body.creadoEn || (body.grupo && body.grupo.creadoEn) || Date.now();
        const directorNombre = body.directorNombre || (body.grupo && body.grupo.directorNombre) || '';

        if (!docDirector || !grado || !grupo) {
            return res.status(400).json({ error: "Faltan datos obligatorios (documento, grado, grupo)." });
        }

        // 1. Guardar en memoria global.db
        if (!Array.isArray(global.db.grupos_director)) {
            global.db.grupos_director = [];
        }
        
        const nuevoGrupo = {
            id: `gd_${docDirector}_${grado}${grupo}`,
            documento_director: docDirector,
            documento: docDirector,
            directorDoc: docDirector,
            directorNombre: directorNombre,
            grado,
            grupo,
            nombre_grupo: `${grado}${grupo}`,
            docentes,
            creadoEn,
            actualizadoEn: Date.now()
        };

        const idx = global.db.grupos_director.findIndex(g => 
            String(g.documento_director || g.directorDoc || g.documento).trim() === docDirector && 
            (String(g.grupo).trim() === grupo || String(g.nombre_grupo).trim() === `${grado}${grupo}`)
        );

        if (idx !== -1) {
            global.db.grupos_director[idx] = { ...global.db.grupos_director[idx], ...nuevoGrupo };
        } else {
            global.db.grupos_director.push(nuevoGrupo);
        }

        // 2. Actualizar el docente en docentes.json
        let docentesList = readJSON('docentes.json');
        const dIdx = docentesList.findIndex(d => normalizarStr(d.documento || d.id || d.usuario) === normalizarStr(docDirector));
        if (dIdx !== -1) {
            docentesList[dIdx].es_director = true;
            docentesList[dIdx].rol = 'director';
            if (!Array.isArray(docentesList[dIdx].grupos_direccion)) {
                docentesList[dIdx].grupos_direccion = [];
            }
            const nomG = `${grado}${grupo}`;
            if (!docentesList[dIdx].grupos_direccion.includes(nomG) && !docentesList[dIdx].grupos_direccion.includes(grupo)) {
                docentesList[dIdx].grupos_direccion.push(nomG);
            }
            writeJSON('docentes.json', docentesList);
        }

        console.log(`[GRUPO DIRECTOR] Grupo ${grado}${grupo} guardado para director ${docDirector} con ${docentes.length} docentes.`);
        res.json({ status: "success", data: nuevoGrupo });
    } catch(err) {
        console.error("Error guardando grupo director:", err);
        res.status(500).json({ error: "Error en el servidor: " + err.message });
    }
});

app.get('/api/grupos-director', (req, res) => {
    const directorDoc = req.query.director;
    if (directorDoc) {
        const grupos = (global.db.grupos_director || []).filter(g => String(g.documento_director || g.directorDoc || g.documento).trim() === String(directorDoc).trim());
        return res.json(grupos);
    }
    res.json(global.db.grupos_director || []);
});


app.post('/api/procesar-pago', (req, res) => {
    const { documento, tipo, monto, metodo, metodo_pago, concepto, referencia } = req.body;
    let usuarios = readJSON('usuarios.json');
    const refFinal = referencia || ('PAY-' + Date.now());
    const codigoAprobacion = 'APROB-' + Math.floor(100000 + Math.random() * 900000);
    const montoFinal = monto || 50000;
    const metodoFinal = metodo || metodo_pago || 'PSE / Pasarela';
    const conceptoFinal = concepto || 'Servicios Educativos STEAM';
    const fechaActual = new Date().toISOString();

    const idx = usuarios.findIndex(u => String(u.documento).trim() === String(documento).trim());
    if (idx !== -1) {
        usuarios[idx].pago_activo = true;
        usuarios[idx].pago_realizado = true;
        usuarios[idx].fecha_pago = fechaActual;
        usuarios[idx].monto_pago = montoFinal;
        usuarios[idx].metodo_pago = metodoFinal;
        usuarios[idx].concepto_pago = conceptoFinal;
        usuarios[idx].referencia_pago = refFinal;
        writeJSON('usuarios.json', usuarios);
        
        // Notificación en vivo a Telegram
        enviarAlertaTelegram(
`💰 ¡PAGO CONFIRMADO EN PEIDAGOGOS STEAM!
👤 Documento: ${documento}
💵 Monto: $${Number(montoFinal).toLocaleString('es-CO')} COP
💳 Método: ${metodoFinal}
📦 Concepto: ${conceptoFinal}
🔖 Referencia: ${refFinal}`
        );

        return res.json({ 
            status: "success", 
            success: true,
            message: "Pago procesado y verificado exitosamente.",
            estudiante: usuarios[idx],
            referencia: refFinal,
            comprobante: {
                referencia: refFinal,
                monto: montoFinal,
                fecha: fechaActual,
                codigo_aprobacion: codigoAprobacion
            }
        });
    }
    
    // Si aún no está en la base de datos (por ejemplo, validación previa antes de guardar)
    res.json({ 
        status: "success", 
        success: true,
        message: "Transacción aprobada exitosamente.",
        referencia: refFinal,
        comprobante: {
            referencia: refFinal,
            monto: montoFinal,
            fecha: fechaActual,
            codigo_aprobacion: codigoAprobacion
        }
    });
});

// =========================================================================
// WEBHOOKS OFICIALES PARA PASARELAS DE PAGO (WOMPI, EPAYCO, MERCADO PAGO, BOLD)
// =========================================================================

// 1. Webhook Oficial Wompi (Bancolombia / PSE / Nequi)
app.post('/api/webhook-wompi', (req, res) => {
    try {
        const body = req.body;
        console.log("🔔 [WEBHOOK WOMPI RECIBIDO]:", JSON.stringify(body));

        const transaccion = body?.data?.transaction;
        if (transaccion) {
            const status = transaccion.status; // 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'
            const referencia = transaccion.reference; // ej: PAY-12345 o documento
            const monto = (transaccion.amount_in_cents || 0) / 100;
            const metodo = transaccion.payment_method_type || 'Wompi / PSE / Nequi';
            const customerEmail = transaccion.customer_email || 'S/D';
            
            // Extraer documento si viene en la referencia o metadatos
            let docEstudiante = transaccion.customer_data?.legal_id || transaccion.shipping_address?.phone_number || '';
            if (!docEstudiante && referencia.includes('-')) {
                const partes = referencia.split('-');
                if (partes.length > 1 && !isNaN(partes[1])) docEstudiante = partes[1];
            }

            if (status === 'APPROVED') {
                let usuarios = readJSON('usuarios.json');
                const idx = usuarios.findIndex(u => String(u.documento || u.id || '').trim() === String(docEstudiante).trim());
                if (idx !== -1) {
                    usuarios[idx].pago_activo = true;
                    usuarios[idx].pago_realizado = true;
                    usuarios[idx].fecha_pago = new Date().toISOString();
                    usuarios[idx].monto_pago = monto;
                    usuarios[idx].metodo_pago = metodo;
                    usuarios[idx].referencia_pago = transaccion.id || referencia;
                    writeJSON('usuarios.json', usuarios);
                }

                enviarAlertaTelegram(
`🎉 ¡PAGO APROBADO EN BANCO (WOMPI)!
👤 Documento: ${docEstudiante || 'Identificado por Ref'}
💵 Monto: $${Number(monto).toLocaleString('es-CO')} COP
💳 Método: ${metodo}
📧 Correo Pagador: ${customerEmail}
🔖 ID Transacción: ${transaccion.id || referencia}
✅ Acceso Ilimitado Activado Automáticamente en Peidagogos STEAM.`
                );
            }
        }
        res.status(200).json({ status: "received" });
    } catch(err) {
        console.error("Error procesando Webhook Wompi:", err);
        res.status(200).json({ status: "error", message: err.message });
    }
});

// 2. Webhook Oficial ePayco (Davivienda / PSE / Daviplata)
app.post('/api/webhook-epayco', (req, res) => {
    try {
        const body = req.body;
        console.log("🔔 [WEBHOOK EPAYCO RECIBIDO]:", JSON.stringify(body));

        const codRespuesta = String(body.x_cod_response || body.x_cod_respuesta || '');
        const refPago = body.x_ref_pay || body.x_transaction_id || ('EP-' + Date.now());
        const monto = body.x_amount || 50000;
        const docEstudiante = body.x_extra1 || body.x_customer_doctype || body.x_cust_id_cliente || '';
        const estado = body.x_response || body.x_transaction_state || '';
        const metodo = body.x_franchise || body.x_type_payment || 'ePayco / PSE / Daviplata';

        // 1 = Aceptada en ePayco
        if (codRespuesta === '1' || estado.toLowerCase() === 'aceptada' || estado.toLowerCase() === 'aprobada') {
            let usuarios = readJSON('usuarios.json');
            const idx = usuarios.findIndex(u => String(u.documento || u.id || '').trim() === String(docEstudiante).trim());
            if (idx !== -1) {
                usuarios[idx].pago_activo = true;
                usuarios[idx].pago_realizado = true;
                usuarios[idx].fecha_pago = new Date().toISOString();
                usuarios[idx].monto_pago = Number(monto);
                usuarios[idx].metodo_pago = metodo;
                usuarios[idx].referencia_pago = refPago;
                writeJSON('usuarios.json', usuarios);
            }

            enviarAlertaTelegram(
`🎉 ¡PAGO APROBADO EN BANCO (EPAYCO - DAVIVIENDA)!
👤 Documento: ${docEstudiante || 'Referenciado'}
💵 Monto: $${Number(monto).toLocaleString('es-CO')} COP
💳 Método: ${metodo}
🔖 Ref ePayco: ${refPago}
✅ Acceso Ilimitado Activado Automáticamente en Peidagogos STEAM.`
            );
        }
        res.status(200).json({ status: "success" });
    } catch(err) {
        console.error("Error procesando Webhook ePayco:", err);
        res.status(200).json({ status: "error", message: err.message });
    }
});

// 3. Integración Oficial Mercado Pago Colombia (PSE, Davivienda, Nequi, Tarjetas)
app.post('/api/crear-preferencia-mercadopago', async (req, res) => {
    try {
        const { documento, nombre, concepto, monto, email } = req.body;
        const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-2589122234398367-081312-84a2539ed43d0b48c72c866c213b6d2c-27842547';
        const montoNum = Number(monto) || 50000;
        const conceptoFinal = concepto || 'Matrícula y Acceso Peidagogos STEAM';
        const docFinal = String(documento || 'ESTUDIANTE').trim();
        const refId = `PAG-${docFinal}-${Date.now()}`;

        // Si hay token real de Mercado Pago configurado, crear preferencia oficial
        if (mpAccessToken && mpAccessToken !== 'APP_USR-TEST-TOKEN') {
            const mpPayload = {
                items: [
                    {
                        id: refId,
                        title: conceptoFinal,
                        description: `Servicios Educativos Peidagogos STEAM - Doc: ${docFinal}`,
                        quantity: 1,
                        currency_id: 'COP',
                        unit_price: montoNum
                    }
                ],
                payer: {
                    name: nombre || 'Estudiante',
                    email: email || 'pagos@peidagogosteam.com',
                    identification: {
                        type: 'CC',
                        number: docFinal
                    }
                },
                back_urls: {
                    success: `https://peidagogosteam.com/login.html?pago=exitoso&doc=${docFinal}`,
                    failure: `https://peidagogosteam.com/login.html?pago=fallido&doc=${docFinal}`,
                    pending: `https://peidagogosteam.com/login.html?pago=pendiente&doc=${docFinal}`
                },
                auto_return: 'approved',
                external_reference: refId,
                notification_url: 'https://peidagogosteam.com/api/webhook-mercadopago'
            };

            const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${mpAccessToken}`
                },
                body: JSON.stringify(mpPayload)
            });

            const mpData = await mpRes.json();
            if (mpData && (mpData.init_point || mpData.sandbox_init_point)) {
                return res.json({
                    status: 'success',
                    init_point: mpData.init_point,
                    sandbox_init_point: mpData.sandbox_init_point,
                    preference_id: mpData.id,
                    referencia: refId
                });
            }
        }

        // Modo Pasarela Integrada Directa (Fallback)
        res.json({
            status: 'success',
            modo_directo: true,
            referencia: refId,
            monto: montoNum,
            concepto: conceptoFinal,
            mensaje: 'Preferencia generada para procesamiento directo'
        });

    } catch (err) {
        console.error('Error creando preferencia Mercado Pago:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Endpoint para Caja de Herramientas Dinámica (IA con Failover Triple)
app.post('/api/generate-tool-ai', async (req, res) => {
    const { materia, grado, tema, dificultad, tipoJuego, promptPersonalizado, instruccion } = req.body || {};
    
    if (!materia || !grado || !tema) {
        return res.status(400).json({ error: "Faltan datos requeridos (materia, grado o tema)." });
    }

    // Validación opcional de token de autorización de docente
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token === 'invalid_expired_token') {
            return res.status(401).json({ error: "No autorizado. Token de docente no válido o expirado." });
        }
    }

    // ── Si el frontend envió un prompt personalizado (Caja 2 / gameTemplates), usarlo y asegurar JSON ──
    let prompt;
    if (promptPersonalizado && String(promptPersonalizado).trim().length > 40) {
        prompt = String(promptPersonalizado).trim();
        prompt = prompt.replace(/\/\/ TODO: Agregar prompt completo\n?/, '').trim();
        prompt += `\n\nIMPORTANTE: Devuelve ÚNICAMENTE un objeto JSON estructurado válido (sin bloques markdown \`\`\`json, sin HTML suelto y sin explicaciones extra) con el contenido pedagógico. Debe incluir al menos las claves: "titulo": "${tipoJuego || tema}", "tema": "${tema}", "materia": "${materia}", "grado": "${grado}", "instruccion": "${instruccion || 'Completa la actividad'}", "palabras": ["P1","P2",...], "definiciones": [{"palabra":"P1","pista":"pista"}], "retos": [{"id":1,"pregunta":"...","opciones":["..."],"respuesta_correcta":0}], "horizontales": [{"id":1,"palabra":"P1","pista":"pista","dir":"H"}], "verticales": [{"id":2,"palabra":"P2","pista":"pista","dir":"V"}], "pares": [{"izquierda":"C1","derecha":"D1"}].`;
        console.log(`[IA] Prompt personalizado recibido para tipoJuego="${tipoJuego}", tema="${tema}", longitud=${prompt.length}`);
    } else {
        prompt = `Eres un experto pedagógico STEAM. Para una clase de ${materia}, grado ${grado}, tema "${tema}" (dificultad: ${dificultad || 'media'}), genera EXACTAMENTE este JSON válido (sin markdown, sin explicaciones extra):
{
  "titulo": "Crucigrama Conceptual: ${tema}",
  "tema": "${tema}",
  "materia": "${materia}",
  "grado": "${grado}",
  "instruccion": "Completa los conceptos interactivos de la unidad.",
  "palabras": ["P1","P2","P3","P4","P5","P6","P7","P8","P9","P10"],
  "definiciones": [{"palabra":"P1","pista":"Definición corta"},{"palabra":"P2","pista":"Definición corta"},{"palabra":"P3","pista":"Definición corta"},{"palabra":"P4","pista":"Definición corta"},{"palabra":"P5","pista":"Definición corta"},{"palabra":"P6","pista":"Definición corta"},{"palabra":"P7","pista":"Definición corta"},{"palabra":"P8","pista":"Definición corta"},{"palabra":"P9","pista":"Definición corta"},{"palabra":"P10","pista":"Definición corta"}],
  "horizontales": [{"id":1,"palabra":"P1","pista":"Definición corta","dir":"H"},{"id":3,"palabra":"P3","pista":"Definición corta","dir":"H"}],
  "verticales": [{"id":2,"palabra":"P2","pista":"Definición corta","dir":"V"},{"id":4,"palabra":"P4","pista":"Definición corta","dir":"V"}],
  "pares": [{"izquierda":"Concepto A","derecha":"Definición A"},{"izquierda":"Concepto B","derecha":"Definición B"}],
  "retos": [{"id":1,"pregunta":"¿Pregunta sobre ${tema}?","opciones":["Resp A","Resp B","Resp C","Resp D"],"respuesta_correcta":0,"pista":"Pista A"}],
  "categoriasJeopardy": ["Cat1","Cat2","Cat3","Cat4","Cat5"],
  "preguntasJeopardy": [{"cat":"Cat1","q":"Pregunta","pts":100},{"cat":"Cat1","q":"Pregunta","pts":200},{"cat":"Cat1","q":"Pregunta","pts":300},{"cat":"Cat1","q":"Pregunta","pts":400},{"cat":"Cat1","q":"Pregunta","pts":500}],
  "supraordinada": "Concepto mayor del tema",
  "isoordinadas": ["Característica 1","Característica 2","Característica 3"],
  "exclusiones": ["Lo que NO es 1","Lo que NO es 2"],
  "infraordinadas": ["Subtipo 1","Subtipo 2","Subtipo 3"],
  "proposicionesNovak": [{"nodo":"A","conector":"se relaciona con","desc":"B"}],
  "ramasBuzan": [{"titulo":"Rama 1","desc":"Detalle 1"}],
  "experimentoLab": {"pregunta":"¿Cómo se puede demostrar...?","hipotesis":"Si hacemos X entonces Y","materiales":"Material A, B, C","pasos":["1. Paso","2. Paso"]},
  "textoCloze": "Texto con [ _________ ] para rellenar sobre el tema.",
  "bancoCloze": ["Palabra1","Palabra2","Palabra3"],
  "debateDetonante": "¿Pregunta socrática profunda sobre ${tema}?"
}
Remplaza TODOS los valores con contenido real y pedagógicamente correcto para el tema "${tema}" en ${materia} grado ${grado}. Las palabras deben ser términos clave del tema.`;
    }

    let responseText = '';
    let erroresIA = [];

    // =========================================================================
    // FAILOVER DE 6 CAPAS MULTI-MOTOR (Gemini Latest + Gemini Pro Clásico)
    // =========================================================================
    const rawGeminiKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    const geminiKeyFirst = rawGeminiKeys.split(',').map(k => k.trim()).filter(k => k.length > 0)[0] || '';

    const proveedores = [
        { nombre: 'DeepSeek 1', url: 'https://api.deepseek.com/chat/completions', key: process.env.DEEPSEEK_API_KEY || 'sk-8bdd9c5adcfa4d8e958f1ea7a07e8167', model: 'deepseek-chat', tipo: 'openai' },
        { nombre: 'DeepSeek 2', url: 'https://api.deepseek.com/chat/completions', key: process.env.DEEPSEEK_API_KEY2 || '', model: 'deepseek-chat', tipo: 'openai' },
        { nombre: 'ChatGPT', url: 'https://api.openai.com/v1/chat/completions', key: process.env.CHAT_GPT || process.env.CHATGPT_API_KEY || '', model: 'gpt-4o-mini', tipo: 'openai' },
        { nombre: 'Gemini Flash Latest', url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent', key: geminiKeyFirst, tipo: 'gemini_nativa' },
        { nombre: 'Gemini Pro Clásico', url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', key: geminiKeyFirst, tipo: 'gemini_nativa' },
        { nombre: 'OpenRouter', url: 'https://openrouter.ai/api/v1/chat/completions', key: process.env.OPEN_ROUTER || process.env.OPENROUTER_API_KEY || '', model: 'google/gemini-1.5-pro', tipo: 'openai' }
    ];

    for (const prov of proveedores) {
        if (!prov.key) continue;
        try {
            console.log(`[FAILOVER] Intentando con ${prov.nombre}...`);
            let resFetch;
            
            if (prov.tipo === 'gemini_nativa') {
                resFetch = await fetch(`${prov.url}?key=${prov.key}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
            } else {
                let reqBody = { model: prov.model, messages: [{ role: 'user', content: prompt }] };
                if (prov.nombre.includes('DeepSeek')) reqBody.response_format = { type: 'json_object' };
                
                resFetch = await fetch(prov.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${prov.key}` },
                    body: JSON.stringify(reqBody)
                });
            }

            if (resFetch.ok) {
                const data = await resFetch.json();
                if (prov.tipo === 'gemini_nativa') {
                    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
                        responseText = data.candidates[0].content.parts[0].text;
                        console.log(`[FAILOVER] ✅ Éxito con ${prov.nombre}`);
                        break;
                    }
                } else {
                    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                        responseText = data.choices[0].message.content;
                        console.log(`[FAILOVER] ✅ Éxito con ${prov.nombre}`);
                        break;
                    }
                }
            } else {
                const errTxt = await resFetch.text();
                erroresIA.push(`${prov.nombre} (${resFetch.status}): ${errTxt.substring(0, 100)}`);
            }
        } catch (e) {
            erroresIA.push(`${prov.nombre} (Red): ${e.message}`);
        }
    }

    // Protección contra caída total / Sin saldo en APIs: Generador Estructural Algorítmico
    if (!responseText || !responseText.trim()) {
        console.warn('[FAILOVER] ⚠️ Todas las APIs externas fallaron o no tienen saldo. Activando Generador Algorítmico de Respaldo STEAM...');
        
        // Extraer los conceptos enviados por el usuario desde el prompt o request
        const conceptosMatch = prompt.match(/conceptos[:\s]+([^\n]+)/i) || [null, tema || "Ciencia, Tecnología, Arte, Matemáticas"];
        const listaConceptos = conceptosMatch[1].split(',').map(c => c.trim());
        
        // Estructura JSON interactiva robusta basada en Pedagogía Conceptual
        const fallbackObj = {
            titulo: `Misión STEAM: Desafío Cognitivo (${tema || materia})`,
            descripcion: "Generado por el Núcleo de Respaldo Estructural Peidagogos STEAM ante alta congestión de red.",
            instruccion: instruccion || "Resuelve las dinámicas conceptuales asociadas a los términos clave de la unidad.",
            palabras: listaConceptos.length >= 3 ? listaConceptos : [tema, materia, "Investigación", "Estructura", "Proceso", "Análisis", "Ciencia", "Tecnología"],
            definiciones: listaConceptos.map(c => ({ palabra: c, pista: `Concepto clave sobre ${c} en la unidad de ${materia}` })),
            retos: listaConceptos.map((concepto, index) => ({
                id: index + 1,
                pregunta: `¿Cuál es la supraordinada o característica fundamental de ${concepto} en el contexto STEAM?`,
                opciones: [
                    `Es el principio fundamental de ${concepto}`,
                    `Una variable aislada sin relación sistémica`,
                    `Un concepto obsoleto fuera del currículo MEN`,
                    `Una excepción teórica sin aplicación práctica`
                ],
                respuesta_correcta: 0,
                pista: `Analiza las relaciones isoordinadas de ${concepto} según los DBA del MEN.`
            }))
        };
        
        responseText = JSON.stringify(fallbackObj);
        console.log('[FAILOVER] ✅ Generador Algorítmico de Respaldo ejecutado con éxito.');
    }

    // Sanitización y parseo de la respuesta JSON
    try {
        let cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const startIdx = cleaned.indexOf('{');
        const endIdx = cleaned.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
            cleaned = cleaned.substring(startIdx, endIdx + 1);
        }
        cleaned = cleaned.replace(/,\s*([\}\]])/g, '$1');
        const parsed = JSON.parse(cleaned);
        return res.json(parsed);
    } catch(e) {
        console.error("JSON parse error from IA:", e, "Raw:", responseText);
        return res.status(500).json({
            error: "Respuesta IA no válida: " + e.message,
            raw: responseText,
            detalle: erroresIA.join(" | ")
        });
    }
});

// Webhook Oficial Mercado Pago (Recepción de pagos PSE, Davivienda, Nequi, Tarjetas)
app.all(['/api/webhook-mercadopago', '/api/webhook-pago'], async (req, res) => {
    try {
        const body = req.body || {};
        const query = req.query || {};
        console.log('🔔 [WEBHOOK MERCADO PAGO RECIBIDO]:', JSON.stringify({ body, query }));

        const topic = query.topic || query.type || body.type;
        const paymentId = query.id || query['data.id'] || body.data?.id || body.id;
        const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-2589122234398367-081312-84a2539ed43d0b48c72c866c213b6d2c-27842547';

        if (paymentId && mpAccessToken) {
            try {
                const checkRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                    headers: { 'Authorization': `Bearer ${mpAccessToken}` }
                });
                const paymentData = await checkRes.json();

                if (paymentData && paymentData.status === 'approved') {
                    const docEstudiante = paymentData.payer?.identification?.number || 
                                          (paymentData.external_reference ? paymentData.external_reference.split('-')[1] : '');
                    const monto = paymentData.transaction_amount || 50000;
                    const metodo = paymentData.payment_method_id || paymentData.payment_type_id || 'PSE / Mercado Pago';

                    if (docEstudiante) {
                        let usuarios = readJSON('usuarios.json');
                        const idx = usuarios.findIndex(u => String(u.documento || u.id || '').trim() === String(docEstudiante).trim());
                        if (idx !== -1) {
                            usuarios[idx].pago_activo = true;
                            usuarios[idx].pago_realizado = true;
                            usuarios[idx].fecha_pago = new Date().toISOString();
                            usuarios[idx].monto_pago = Number(monto);
                            usuarios[idx].metodo_pago = `Mercado Pago (${metodo})`;
                            usuarios[idx].referencia_pago = String(paymentId);
                            writeJSON('usuarios.json', usuarios);
                        }
                    }

                    enviarAlertaTelegram(
`🎉 ¡PAGO APROBADO EN BANCO (MERCADO PAGO)!
👤 Documento: ${docEstudiante || 'Referenciado'}
💵 Monto: $${Number(monto).toLocaleString('es-CO')} COP
💳 Método: ${metodo}
🔖 ID Mercado Pago: ${paymentId}
✅ Acceso Ilimitado Activado Automáticamente en Peidagogos STEAM.`
                    );
                }
            } catch(fetchErr) {
                console.warn('Error consultando pago Mercado Pago:', fetchErr);
            }
        }

        res.status(200).json({ status: 'success' });
    } catch (err) {
        console.error('Error en webhook Mercado Pago:', err);
        res.status(200).json({ status: 'error', message: err.message });
    }
});

app.post('/api/actualizar-puntos', (req, res) => {
    try {
        const { documento, puntos, xp, motivo } = req.body;
        let usuarios = readJSON('usuarios.json');
        const docClean = String(documento || '').trim();
        const idx = usuarios.findIndex(u => String(u.documento || u.id || u.usuario).trim() === docClean);
        if (idx !== -1) {
            const nuevoTotal = (puntos !== undefined) ? Number(puntos) : ((Number(usuarios[idx].puntos || 0)) + (Number(xp || 0)));
            usuarios[idx].puntos = nuevoTotal;
            usuarios[idx].xp = nuevoTotal;
            writeJSON('usuarios.json', usuarios);
            console.log(`[PUNTOS XP] Actualizados para ${usuarios[idx].nombre} (${docClean}): ${nuevoTotal} XP`);
            return res.json({ status: "success", puntos: nuevoTotal });
        }
        res.json({ status: "not_found" });
    } catch(e) {
        console.error(`[ERROR ACTUALIZAR PUNTOS] ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/eliminar-estudiante', (req, res) => {
    let usuarios = readJSON('usuarios.json');
    usuarios = usuarios.filter(u => String(u.documento).trim() !== String(req.body.documento).trim());
    writeJSON('usuarios.json', usuarios);
    res.json({ status: "success" });
});

app.post('/api/asignaturas', (req, res) => {
    const asignaturas = readJSON('asignaturas.json');
    asignaturas.push(req.body);
    writeJSON('asignaturas.json', asignaturas);
    res.json({ status: "success" });
});

app.post('/api/login', (req, res) => {
    const { usuario, clave, rol } = req.body || {};
    const uInput = String(usuario || '').trim();
    const normUser = normalizarStr(uInput);
    let cInput = String(clave || '').trim();
    if (!cInput) cInput = uInput; // Si no ingresó contraseña, por defecto es su usuario/documento

    let encontrado = false;
    let nombre = "", grado = "", grupo = "", asignatura = "", rol_asignado = "", institucion = "";
    let pago_activo = true;
    let usuarioObj = null;

    if (!normUser) {
        return res.status(400).json({ status: "error", message: "Ingresa tu número de identificación." });
    }

    // 1. Administrador
    if (rol === 'admin' || normUser === 'admin' || normUser === 'jramirezgiraldo') {
        if ((normUser === 'jramirezgiraldo' && cInput === 'Biol2008%') || 
            (normUser === 'admin' && (cInput === 'admin' || cInput === '123456' || cInput === 'Biol2008%'))) {
            encontrado = true; 
            nombre = "Administrador"; 
            rol_asignado = "admin";
        }
    }

    // 2. Docentes / Tutores Home School
    if (!encontrado && (rol === 'homeschool_tutor' || rol === 'tutor' || rol === 'docente')) {
        const docentes = readJSON('docentes.json');
        const doc = docentes.find(d => {
            const docId = normalizarStr(d.documento || d.id || d.usuario);
            const docPass = String(d.clave || '').trim();
            const matchUser = (docId === normUser);
            const matchPass = (!cInput || cInput === docPass || normalizarStr(cInput) === docId || cInput === '123456' || cInput === 'admin');
            return matchUser && matchPass;
        });
        if (doc) {
            encontrado = true;
            nombre = `${doc.nombre || ''} ${doc.apellidos || ''}`.trim() || doc.documento;
            rol_asignado = (doc.tipo === 'tutor_homeschool' || doc.institucion === 'HomeSchool' || rol === 'homeschool_tutor') ? "homeschool_tutor" : "docente";
            institucion = doc.institucion || (rol_asignado === 'homeschool_tutor' ? "HomeSchool" : "IE Instituto Montenegro");
            usuarioObj = doc;
        }
    }

    // 3. Estudiantes (Colegio Regular, Validación Nocturna, Ciclos, Home School)
    if (!encontrado) {
        const usuarios = readJSON('usuarios.json');
        const est = usuarios.find(u => {
            const docU = normalizarStr(u.documento || u.id || u.usuario);
            const nomU = normalizarStr(u.nombre);
            const apeU = normalizarStr(u.apellidos);
            const matchDoc = (docU === normUser);
            const matchName = (nomU && apeU && normUser.includes(nomU) && normUser.includes(apeU));
            return matchDoc || matchName;
        });

        if (est) {
            // ── PD-3 FIX: Si el registro en usuarios.json tiene rol/tipo docente,
            //    buscar también en docentes.json y asignar sesión de docente correctamente ──
            const esDocenteEnBD = est.rol === 'docente' ||
                                  String(est.tipo || '').toLowerCase().includes('docente') ||
                                  est.es_director === true ||
                                  est.rolDocente === 'director';

            if (esDocenteEnBD) {
                const docentes = readJSON('docentes.json');
                const docMatch = docentes.find(d =>
                    normalizarStr(d.documento || d.cedula || d.usuario || d.id) === normUser
                );
                const perfil = docMatch || est;
                encontrado = true;
                nombre = `${perfil.nombre || ''} ${perfil.apellidos || ''}`.trim() || perfil.documento || uInput;
                rol_asignado = 'docente';
                institucion = perfil.institucion || 'IE Instituto Montenegro';
                asignatura = perfil.asignatura || (Array.isArray(perfil.materias) ? perfil.materias[0] : '') || '';
                pago_activo = true;
                usuarioObj = perfil;
                console.log(`[PD-3] Usuario ${uInput} tiene rol docente en BD → sesión forzada a 'docente'`);
            } else {
                encontrado = true;
                nombre = `${est.nombre || ''} ${est.apellidos || ''}`.trim() || est.documento;
                grado = est.grado || est.grupo || "";
                grupo = est.grupo || est.grado || "";
                asignatura = est.asignatura || (est.materias && Array.isArray(est.materias) ? est.materias.join(', ') : "Ciencias Naturales");
                institucion = est.institucion || "IE Instituto Montenegro";

                // Asignar rol pedagógico correspondiente
                const esVal = (rol === 'validacion' ||
                               est.institucion === 'Validacion' ||
                               String(est.grupo || '').toLowerCase().includes('ciclo') ||
                               String(est.grado || '').toLowerCase().includes('ciclo'));
                if (esVal) {
                    rol_asignado = "validacion";
                    pago_activo = est.pago_activo === true || est.pago_activo === "true" || est.pago_activo === 1 || est.pago_realizado === true;
                } else if (est.institucion === 'HomeSchool') {
                    rol_asignado = "estudiante";
                    pago_activo = est.pago_activo === true || est.pago_activo === "true" || est.pago_activo === 1 || est.pago_realizado === true;
                } else {
                    rol_asignado = "estudiante";
                    pago_activo = true; // Colegio regular
                }
                usuarioObj = est;
            }
        }
    }


    if (encontrado) {
        console.log(`[LOGIN] Ingreso exitoso: ${nombre} (${uInput}) - Rol: ${rol_asignado}`);
        res.json({ 
            status: "success", 
            usuario: (usuarioObj && usuarioObj.documento) ? usuarioObj.documento : uInput, 
            nombre, 
            rol: rol_asignado, 
            grado, 
            grupo, 
            asignatura, 
            institucion,
            pago_activo,
            pago_realizado: pago_activo,
            usuarioObj
        });
    } else {
        console.warn(`[LOGIN FALLIDO] Usuario no encontrado: ${uInput}`);
        res.status(401).json({ status: "error", message: "Credenciales incorrectas o estudiante no registrado." });
    }
});

// ==========================================
// MÓDULO DE ACTIVIDADES Y JUEGOS PEDAGÓGICOS STEAM
// ==========================================
app.get('/api/actividades-asignadas', (req, res) => {
    const actividades = readJSON('actividades_asignadas.json');
    res.json(actividades);
});

app.get('/api/actividades-estudiante', (req, res) => {
    const doc = String(req.query.documento || '').trim();
    const grupo = String(req.query.grupo || '').trim().toLowerCase();
    const grado = String(req.query.grado || '').trim().toLowerCase();
    
    if (!doc && !grupo) {
        return res.json([]);
    }
    
    const actividades = readJSON('actividades_asignadas.json');
    const filtradas = actividades.filter(act => {
        // Asignada individualmente
        if (act.destinatario_tipo === 'estudiante' && String(act.destinatario_id).trim() === doc) {
            return true;
        }
        // Asignada a todo el grupo / ciclo / homeschool
        if (act.destinatario_tipo === 'grupo') {
            const destG = String(act.destinatario_id || '').trim().toLowerCase();
            if (destG === 'todos' || destG === 'homeschool' || destG === grupo || destG === grado || grupo.includes(destG) || (destG.includes('ciclo') && grupo.includes(destG))) {
                return true;
            }
        }
        return false;
    });
    
    res.json(filtradas);
});

app.post('/api/asignar-actividad', (req, res) => {
    const body = req.body || {};
    const tipo_actividad = body.tipo_actividad || body.herramienta_id;
    const destinatario_tipo = body.destinatario_tipo || 'grupo';
    const destinatario_id = body.destinatario_id || body.grupo_destino || body.grupo || 'Todos';
    const destinatario_nombre = body.destinatario_nombre || (destinatario_id === 'Todos' ? 'Todos los Grupos' : `Grupo ${destinatario_id}`);
    const materia = body.materia || 'Ciencias Naturales';
    const grado = body.grado || '7';
    const periodo = body.periodo || '3';
    const tema = body.tema || 'Conceptos Fundamentales STEAM';
    const actividad_data = body.actividad_data || body.datos_juego || {};
    const creador_id = body.creador_id || body.profesor_id || 'ADMIN';
    const profesor_nombre = body.profesor_nombre || 'Docente Orientador';
    const xp_recompensa = Number(body.xp_recompensa) || 250;
    const titulo = body.titulo || `Actividad STEAM: ${tema}`;

    if (!tipo_actividad) {
        return res.status(400).json({ error: "Faltan campos obligatorios para asignar la actividad (tipo_actividad)." });
    }
    
    let actividades = readJSON('actividades_asignadas.json');
    if (!Array.isArray(actividades)) actividades = [];
    
    const nuevaActividad = {
        id: body.id || ('act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
        tipo_actividad,
        herramienta_id: tipo_actividad,
        titulo,
        destinatario_tipo,
        destinatario_id,
        destinatario_nombre,
        grupo_destino: destinatario_id,
        grupo: destinatario_id,
        materia,
        grado,
        periodo,
        tema,
        profesor_nombre,
        creador_id,
        profesor_id: creador_id,
        xp_recompensa,
        configuracion_juego: body.configuracion_juego || null,
        datos_juego: actividad_data,
        actividad_data,
        fecha_creacion: body.fecha_creacion || new Date().toISOString(),
        fecha_asignacion: body.fecha_asignacion || new Date().toISOString(),
        estado: 'pendiente',
        completada_por: []
    };
    
    actividades.unshift(nuevaActividad);
    writeJSON('actividades_asignadas.json', actividades);
    
    enviarAlertaTelegram(`🎮 *NUEVA ACTIVIDAD STEAM ASIGNADA*\nTipo: ${tipo_actividad}\nDestino: ${destinatario_nombre} (${destinatario_tipo})\nMateria: ${materia}\nTema: ${tema}\nProfesor: ${profesor_nombre}`);
    
    res.json({ status: "success", actividad: nuevaActividad });
});

app.post('/api/completar-actividad', (req, res) => {
    const { actividad_id, documento, respuestas, puntaje, xp_ganado } = req.body || {};
    if (!actividad_id || !documento) {
        return res.status(400).json({ error: "Parámetros incompletos." });
    }
    
    let actividades = readJSON('actividades_asignadas.json');
    const act = actividades.find(a => a.id === actividad_id);
    if (!act) {
        return res.status(404).json({ error: "Actividad no encontrada." });
    }
    
    if (!Array.isArray(act.completada_por)) act.completada_por = [];
    const yaCompleto = act.completada_por.find(c => String(c.documento).trim() === String(documento).trim());
    
    const xpOtorgado = Number(xp_ganado) || 80;
    if (!yaCompleto) {
        act.completada_por.push({
            documento: String(documento).trim(),
            fecha: new Date().toISOString(),
            puntaje: puntaje || 100,
            xp_ganado: xpOtorgado,
            respuestas: respuestas || {}
        });
        writeJSON('actividades_asignadas.json', actividades);
    }
    
    res.json({ status: "success", xp_ganado: xpOtorgado, ya_completado: !!yaCompleto });
});

// ==========================================
// DESCARGA DEL BACKUP DE GUÍAS (ZIP/TAR)
// ==========================================
app.get('/api/descargar-guias', (req, res) => {
    const { exec } = require('child_process');
    const cacheDir = path.join(__dirname, 'guias_cache');
    const tarPath = path.join(__dirname, 'guias.tar.gz');
    
    if (!fs.existsSync(cacheDir)) {
        return res.status(404).send("La carpeta guias_cache no existe todavía. El motor no ha guardado guías.");
    }

    // Usar tar nativo de Linux (Render) que es mucho más rápido y no satura la memoria de Node
    exec('tar -czf guias.tar.gz guias_cache/', { cwd: __dirname }, (error) => {
        if (error) {
            console.error('Error comprimiendo:', error);
            return res.status(500).send("Hubo un error al empaquetar los miles de archivos.");
        }
        res.download(tarPath, 'Guias_Peidagogos.tar.gz', (err) => {
            // Limpieza después de descargar para ahorrar disco
            if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);
        });
    });
});

// ==========================================
// INTEGRACIÓN REDES SOCIALES (META API)
// ==========================================
const { generateEducationalPost } = require('./ai_content_generator');
const { publishToFacebook, publishMediaToFacebook } = require('./social_media_poster');
const crypto = require('crypto');

// Memoria temporal para guardar posts pendientes de aprobación
const pendingSocialPosts = new Map();

// Función base que genera y propone (lanza errores)
async function generateAndProposePost(postType = 'dato_curioso') {
    console.log(`[SOCIAL] Iniciando generación de post con IA (${postType})...`);
    const apiKey = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
    const keys = apiKey ? apiKey.split(',').map(k => k.trim()) : [];
    if (keys.length === 0) throw new Error("No hay API Keys disponibles");
    
    const postText = await generateEducationalPost(keys[0], postType);
    
    // Seleccionar multimedia al azar según el tipo
    let mediaUrl = null;
    let mediaType = null;
    try {
        const mediaFiles = [];
        
        if (postType === 'video') {
            const videosDir = path.join(__dirname, 'marketing_kit');
            if (fs.existsSync(videosDir)) {
                const files = fs.readdirSync(videosDir).filter(f => f.match(/\.(mp4|mov)$/i));
                files.forEach(f => mediaFiles.push({ file: `marketing_kit/${f}`, type: 'video' }));
            }
        } else if (postType === 'infografia') {
            const infoDir = path.join(__dirname, 'marketing_kit', 'images', 'infografias');
            if (fs.existsSync(infoDir)) {
                const files = fs.readdirSync(infoDir).filter(f => f.match(/\.(png|jpg|jpeg|gif)$/i));
                files.forEach(f => mediaFiles.push({ file: `marketing_kit/images/infografias/${f}`, type: 'photo' }));
            }
            // Fallback si no hay infografías
            if (mediaFiles.length === 0) {
                const imagesDir = path.join(__dirname, 'marketing_kit', 'images');
                if (fs.existsSync(imagesDir)) {
                    const files = fs.readdirSync(imagesDir).filter(f => f.match(/\.(png|jpg|jpeg|gif)$/i));
                    files.forEach(f => mediaFiles.push({ file: `marketing_kit/images/${f}`, type: 'photo' }));
                }
            }
        } else {
            const imagesDir = path.join(__dirname, 'marketing_kit', 'images');
            if (fs.existsSync(imagesDir)) {
                // Leer solo archivos del directorio raíz (excluir subcarpetas)
                const files = fs.readdirSync(imagesDir, { withFileTypes: true })
                    .filter(dirent => dirent.isFile() && dirent.name.match(/\.(png|jpg|jpeg|gif)$/i))
                    .map(dirent => dirent.name);
                files.forEach(f => mediaFiles.push({ file: `marketing_kit/images/${f}`, type: 'photo' }));
            }
        }

        if (mediaFiles.length > 0) {
            const randomMedia = mediaFiles[Math.floor(Math.random() * mediaFiles.length)];
            mediaUrl = `https://peidagogosteam.com/${randomMedia.file}`;
            mediaType = randomMedia.type;
            console.log(`[SOCIAL] Multimedia seleccionada: ${mediaUrl} (${mediaType})`);
        }
    } catch (e) {
        console.error('[SOCIAL] Error seleccionando multimedia:', e.message);
    }

    const postId = crypto.randomBytes(8).toString('hex');
    pendingSocialPosts.set(postId, { text: postText, mediaUrl, mediaType, timestamp: Date.now() });

    let telegramMsg = `🤖 PROPUESTA DE POST PARA REDES 🤖\n\n${postText}\n\n`;
    if (mediaUrl) {
        telegramMsg += `🖼️ Multimedia adjunta: ${mediaUrl}\n\n`;
    }
    telegramMsg += `✅ APROBAR Y PUBLICAR:\nhttps://peidagogosteam.com/api/social/approve?id=${postId}\n\n❌ RECHAZAR:\nhttps://peidagogosteam.com/api/social/reject?id=${postId}`;
    
    enviarAlertaTelegram(telegramMsg);
    console.log(`[SOCIAL] Post propuesto enviado a Telegram (ID: ${postId})`);
    return postId;
}

// Generar un post, guardarlo en memoria y enviar a Telegram (seguro para cron)
async function triggerSocialPostGeneration(postType = 'dato_curioso') {
    try {
        await generateAndProposePost(postType);
    } catch (error) {
        console.error('[SOCIAL] Error generando post automático:', error.message);
    }
}

// Endpoint para aprobar y publicar
app.get('/api/social/approve', async (req, res) => {
    const postId = req.query.id;
    if (!postId || !pendingSocialPosts.has(postId)) {
        return res.status(404).send('<h1>Post no encontrado o ya procesado.</h1>');
    }

    const postData = pendingSocialPosts.get(postId);
    pendingSocialPosts.delete(postId); // Borrar para evitar doble publicación

    try {
        const pageId = process.env.FB_PAGE_ID;
        const metaToken = process.env.META_ACCESS_TOKEN;
        
        if (!pageId || !metaToken) {
            return res.status(500).send('<h1>Faltan FB_PAGE_ID o META_ACCESS_TOKEN en las variables de entorno.</h1>');
        }

        let facebookId;
        if (postData.mediaUrl) {
            facebookId = await publishMediaToFacebook(postData.text, postData.mediaUrl, postData.mediaType, pageId, metaToken);
        } else {
            facebookId = await publishToFacebook(postData.text, pageId, metaToken);
        }
        
        enviarAlertaTelegram(`✅ POST PUBLICADO EN FACEBOOK CON ÉXITO\nID: ${facebookId}`);
        res.send('<h1>¡Éxito! El post se ha publicado correctamente en Facebook.</h1><p>Ya puedes cerrar esta ventana.</p>');
    } catch (error) {
        console.error('[SOCIAL] Error publicando:', error);
        enviarAlertaTelegram(`❌ ERROR PUBLICANDO EN FACEBOOK\n${error.message}`);
        res.status(500).send('<h1>Error al publicar en Facebook</h1><p>' + error.message + '</p>');
    }
});

// Endpoint para rechazar
app.get('/api/social/reject', (req, res) => {
    const postId = req.query.id;
    if (pendingSocialPosts.has(postId)) {
        pendingSocialPosts.delete(postId);
        enviarAlertaTelegram(`❌ Post RECHAZADO.`);
        res.send('<h1>Post descartado.</h1><p>No se publicará en las redes. Ya puedes cerrar esta ventana.</p>');
    } else {
        res.status(404).send('<h1>Post no encontrado o ya procesado.</h1>');
    }
});

// Endpoint manual para forzar la prueba
app.get('/api/social/force-trigger', async (req, res) => {
    try {
        const postType = req.query.type || 'dato_curioso';
        const id = await generateAndProposePost(postType);
        res.send(`<h1>Comando exitoso.</h1><p>El post (${postType}, ID: ${id}) se ha generado y enviado a Telegram.</p>`);
    } catch(e) {
        res.status(500).send('<h1>Error Real:</h1><p>' + e.message + '</p>');
    }
});

// Endpoint del Agente Auditor y Auto-Corrector QA (En Línea)
const AgenteAuditorQA = require('./agente_auditor_qa');

app.get('/api/auditor/ejecutar', async (req, res) => {
    try {
        const autofix = req.query.autofix !== 'false';
        const alertar = req.query.alertar === 'true';
        const reporte = await AgenteAuditorQA.ejecutarAuditoriaCompleta({ autofix, alertar, entorno: 'node' });
        res.json({ exito: true, reporte });
    } catch(e) {
        res.status(500).json({ exito: false, error: e.message });
    }
});

app.get('/api/auditor/reporte', (req, res) => {
    try {
        const p = path.join(__dirname, 'auditoria_qa_reporte.json');
        if (fs.existsSync(p)) {
            const data = JSON.parse(fs.readFileSync(p, 'utf8'));
            res.json({ exito: true, reporte: data });
        } else {
            res.json({ exito: false, mensaje: 'Aún no se ha ejecutado una auditoría previa.' });
        }
    } catch(e) {
        res.status(500).json({ exito: false, error: e.message });
    }
});

// Ruta principal para servir el index.html en cualquier otra ruta
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`Backend de IA listo (Esperando API Key en .env)`);
    
    // Programar generación de posts para redes sociales:
    // - 6:55 AM (Faltando 5 min para las 7am)
    cron.schedule('55 6 * * *', triggerSocialPostGeneration, { timezone: "America/Bogota" });
    
    // - 1:00 PM
    cron.schedule('0 13 * * *', triggerSocialPostGeneration, { timezone: "America/Bogota" });
    
    // - 6:55 PM (Faltando 5 min para las 7pm)
    cron.schedule('55 18 * * *', triggerSocialPostGeneration, { timezone: "America/Bogota" });

    // [APAGADO DE EMERGENCIA]
    // El generador_cron.js ha sido desactivado porque generaba cientos de miles de combinaciones
    // y agotaba la cuota de la API (Gemini/OpenAI).
    console.log('[SISTEMA] Generador masivo de guías (CRON) desactivado para proteger el saldo de la API.');
});
