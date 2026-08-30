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
const { obtenerPromptJuego, PROMPTS_JUEGOS } = require('./prompts_juegos');


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
        
        // 2. Si no hay API Keys configuradas, servir la guía predeterminada garantizada
        if (apiKeys.length === 0) {
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
            
            // Helper: limpiar bloques markdown de la respuesta HTML de la IA
            function limpiarHTMLDeLaIA(texto) {
                if (!texto || typeof texto !== 'string') return '';
                let h = texto.trim();
                // Eliminar bloque ```html ... ``` con cualquier variación de espacios/newlines
                h = h.replace(/^```[\w]*\s*/i, '').replace(/\s*```\s*$/i, '').trim();
                // Si hay bloques residuales internos (múltiples bloques), extraer desde <!DOCTYPE
                const dtIdx = h.toLowerCase().indexOf('<!doctype');
                if (dtIdx > 0) h = h.substring(dtIdx);
                // Eliminar cualquier texto suelto después del </html> de cierre
                const htmlCloseIdx = h.toLowerCase().lastIndexOf('</html>');
                if (htmlCloseIdx !== -1) h = h.substring(0, htmlCloseIdx + 7);
                return h.trim();
            }

            let htmlDiapositivas = '';

            // Intento 1: DeepSeek (preferido para HTML)
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
                            { role: 'system', content: 'Devuelve EXCLUSIVAMENTE HTML. SIN MARKDOWN. SIN backticks. Empieza directamente con <!DOCTYPE html> y termina con </html>.' },
                            { role: 'user', content: promptDiapositivas }
                        ]
                    })
                });

                if (ds_response.ok) {
                    const ds_data = await ds_response.json();
                    const rawHTML = ds_data.choices?.[0]?.message?.content || '';
                    htmlDiapositivas = limpiarHTMLDeLaIA(rawHTML);
                    if (htmlDiapositivas && htmlDiapositivas.length > 500) {
                        console.log(`[IA DIAPOSITIVAS] ✅ HTML generado por DeepSeek (${htmlDiapositivas.length} chars).`);
                    } else {
                        console.warn(`[IA DIAPOSITIVAS] ⚠️ DeepSeek devolvió HTML demasiado corto (${htmlDiapositivas.length} chars). Activando fallback Gemini...`);
                        htmlDiapositivas = '';
                    }
                } else {
                    console.warn(`[IA DIAPOSITIVAS] DeepSeek HTTP ${ds_response.status}. Activando fallback Gemini...`);
                }
            } catch (dsErr) {
                console.error(`[IA DIAPOSITIVAS] Error DeepSeek:`, dsErr.message, '→ Activando fallback Gemini...');
            }

            // Intento 2: Fallback a Gemini si DeepSeek falla o devuelve HTML inválido
            if (!htmlDiapositivas) {
                const modelosDia = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
                for (const modeloDia of modelosDia) {
                    try {
                        console.log(`[IA DIAPOSITIVAS FALLBACK] Intentando Gemini modelo: ${modeloDia}...`);
                        const aiDia = getAIClient();
                        if (!aiDia) break;
                        const diaResp = await geminiQueue.add(() => aiDia.models.generateContent({
                            model: modeloDia,
                            contents: promptDiapositivas + '\n\nIMPORTANTE: Devuelve SOLO el código HTML completo, empezando con <!DOCTYPE html> y terminando con </html>. NO uses bloques markdown ni backticks.'
                        }));
                        if (diaResp && diaResp.text) {
                            htmlDiapositivas = limpiarHTMLDeLaIA(diaResp.text);
                            if (htmlDiapositivas && htmlDiapositivas.length > 500) {
                                console.log(`[IA DIAPOSITIVAS FALLBACK] ✅ HTML generado por Gemini ${modeloDia}.`);
                                break;
                            }
                        }
                    } catch (gDiaErr) {
                        console.warn(`[IA DIAPOSITIVAS FALLBACK] Gemini ${modeloDia} falló:`, gDiaErr.message);
                    }
                }
            }

            // Responder al cliente con el HTML generado
            if (htmlDiapositivas && htmlDiapositivas.length > 200) {
                return res.json({ html: htmlDiapositivas });
            } else {
                console.error('[IA DIAPOSITIVAS] Todas las IAs fallaron para generar HTML de presentación.');
                return res.status(500).json({ error: 'No se pudo generar la presentación HTML. Por favor inténtalo de nuevo.' });
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

        // Modelos Gemini compatibles y operativos en @google/genai (actualizados 2026)
        const modelos = [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-flash-latest',
            'gemini-2.0-flash-lite',
            'gemini-1.5-flash'
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

        // Sanitización y parseo robusto del JSON (limpiador anti-markdown reforzado)
        let finalJson;
        try {
            let limpio = responseText;
            // 1. Eliminar bloques markdown: ```json, ```JSON, ``` a inicio de línea
            limpio = limpio.replace(/^```[\s\w]*\n?/gim, '').replace(/^```\s*$/gim, '').trim();
            // 2. Eliminar comentarios JS/Python comunes que la IA puede insertar
            limpio = limpio.replace(/^\/\/[^\n]*\n?/gm, '').replace(/^#[^\n]*\n?/gm, '');
            // 3. Extraer el objeto JSON más externo {…} ignorando texto previo/posterior
            const firstBrace = limpio.indexOf('{');
            const lastBrace = limpio.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                limpio = limpio.substring(firstBrace, lastBrace + 1);
            }
            // 4. Sanitizar caracteres de control inválidos en JSON (excepto \n \r \t)
            limpio = limpio.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
            finalJson = JSON.parse(limpio);
        } catch (parseErr) {
            console.error("[PARSE ERROR] Respuesta de la IA no parseó como JSON válido:", parseErr.message);
            console.error("[PARSE ERROR] Primeros 500 chars:", String(responseText).substring(0, 500));
            return res.status(500).json({ error: "La IA generó una respuesta pero el formato JSON vino incompleto o con bloques markdown no esperados. Por favor inténtalo de nuevo." });
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

// Helper: cargar JSON local como fallback de emergencia
function loadLocalJSON(file, defaultVal = []) {
    try {
        const p = path.join(__dirname, file);
        if (fs.existsSync(p)) {
            const raw = fs.readFileSync(p, 'utf-8');
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? [parsed] : defaultVal);
        }
    } catch(e) {
        console.warn(`[DB FALLBACK] No se pudo leer ${file}:`, e.message);
    }
    return defaultVal;
}

// Cargar la DB al iniciar el servidor
async function initDB() {
    let supabaseOk = false;
    try {
        const { data: u, error: eu } = await supabase.from('usuarios').select('*');
        if (!eu && Array.isArray(u) && u.length > 0) { global.db.usuarios = u; supabaseOk = true; }
        else if (!eu && Array.isArray(u)) global.db.usuarios = u;

        const { data: d, error: ed } = await supabase.from('docentes').select('*');
        if (!ed && Array.isArray(d) && d.length > 0) { global.db.docentes = d; supabaseOk = true; }
        else if (!ed && Array.isArray(d)) global.db.docentes = d;

        const { data: a } = await supabase.from('asignaturas').select('*');
        if (a && Array.isArray(a)) global.db.asignaturas = a;

        const { data: aa } = await supabase.from('actividades_asignadas').select('*');
        if (aa && Array.isArray(aa)) global.db.actividades_asignadas = aa;

        const { data: hg } = await supabase.from('herramientas_guardadas').select('*');
        if (hg && Array.isArray(hg)) global.db.herramientas_guardadas = hg;

        if (supabaseOk) {
            console.log("🚀 [DB] Supabase sincronizado en memoria exitosamente.");
        } else {
            console.warn("[DB] Supabase retornó datos vacíos → activando fallback local.");
        }
    } catch(err) {
        console.error("[DB SUPABASE ERROR] Fallo de conexión:", err.message);
    }

    // ── BLINDAJE DE FALLBACK LOCAL: Si Supabase falla o devuelve vacío, cargar desde archivos JSON ──
    if (!global.db.usuarios || global.db.usuarios.length === 0) {
        const uLocal = loadLocalJSON('usuarios.json');
        if (uLocal.length > 0) {
            global.db.usuarios = uLocal;
            console.log(`[DB FALLBACK] Usuarios cargados desde usuarios.json (${uLocal.length} registros).`);
        }
    }
    if (!global.db.docentes || global.db.docentes.length === 0) {
        const dLocal = loadLocalJSON('docentes.json');
        if (dLocal.length > 0) {
            global.db.docentes = dLocal;
            console.log(`[DB FALLBACK] Docentes cargados desde docentes.json (${dLocal.length} registros).`);
        }
    }
    if (!global.db.actividades_asignadas || global.db.actividades_asignadas.length === 0) {
        const aaLocal = loadLocalJSON('actividades_asignadas.json');
        if (aaLocal.length > 0) global.db.actividades_asignadas = aaLocal;
    }
    console.log(`[DB] Estado final en memoria: ${global.db.usuarios.length} usuarios, ${global.db.docentes.length} docentes.`);
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

app.get('/api/usuarios', (req, res) => {
    const list = readJSON('usuarios.json') || [];
    const safeList = list.map(u => {
        const copy = { ...u };
        delete copy.password;
        delete copy.clave;
        delete copy.contrasena;
        return copy;
    });
    res.json(safeList);
});

app.get('/api/estudiantes', (req, res) => {
    const list = readJSON('usuarios.json') || [];
    const estudiantes = list.filter(u => u.rol === 'estudiante' || String(u.tipo || '').includes('estudiante') || (!u.rol && !u.tipo));
    const safeEstud = (estudiantes.length > 0 ? estudiantes : list).map(u => {
        const copy = { ...u };
        delete copy.password;
        delete copy.clave;
        delete copy.contrasena;
        return copy;
    });
    res.json(safeEstud);
});
// Helper de normalización estricta de cadenas de documento
const normStr = (val) => {
    if (val === null || val === undefined) return '';
    return String(val).trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');
};

// Endpoint unificado para obtener TODOS los docentes y directores combinados
app.get('/api/todos-los-docentes', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    let docentes = readJSON('docentes.json') || [];
    let usuarios = readJSON('usuarios.json') || [];
    let grupos = readJSON('grupos_director.json') || [];
    
    const docentesMap = new Map();

    const agregarODocumento = (obj, defaultRol = 'docente') => {
        if (!obj || typeof obj !== 'object') return;
        const rawDoc = obj.documento || obj.cedula || obj.usuario || obj.id || obj.doc || '';
        const normKey = normStr(rawDoc);
        if (!normKey) return;

        const docExistente = docentesMap.get(normKey) || {};
        const nomComp = (obj.nombre_completo || obj.nombre || docExistente.nombre_completo || docExistente.nombre || 'Docente').trim();
        const inst = (obj.institucion || docExistente.institucion || 'IE Instituto Montenegro').trim();
        const rolFinal = obj.rol || obj.rolDocente || docExistente.rol || defaultRol;
        const tipoFinal = obj.tipo || docExistente.tipo || (rolFinal === 'director' ? 'docente_director' : 'docente_regular');
        const fechaComp = obj.fecha_creacion || obj.fecha_registro || docExistente.fecha_creacion || new Date().toLocaleDateString('es-CO');

        docentesMap.set(normKey, {
            documento: String(rawDoc).trim(),
            nombre: nomComp,
            nombre_completo: nomComp,
            apellidos: obj.apellidos || docExistente.apellidos || '',
            institucion: inst,
            rol: rolFinal,
            rolDocente: rolFinal === 'director' ? 'director' : 'regular',
            tipo: tipoFinal,
            es_director: rolFinal === 'director' || obj.es_director === true || docExistente.es_director === true,
            fecha_creacion: fechaComp,
            director_grupo_id: obj.director_grupo_id || obj.directorDoc || docExistente.director_grupo_id || ''
        });
    };

    docentes.forEach(d => agregarODocumento(d, 'docente'));

    usuarios.forEach(u => {
        const esDocente = u.rol === 'docente' || u.rol === 'director' || u.rolDocente === 'director' || u.es_director === true || 
                          (u.tipo && String(u.tipo).includes('docente')) || (u.tipo && String(u.tipo).includes('director')) || 
                          (u.tipo && String(u.tipo).includes('tutor')) || Boolean(u.director_grupo_id || u.directorDoc);
        if (esDocente) {
            agregarODocumento(u, u.rol === 'director' ? 'director' : 'docente');
        }
    });

    grupos.forEach(g => {
        if (g.documento_director || g.directorDoc) {
            agregarODocumento({
                documento: g.documento_director || g.directorDoc,
                nombre: g.directorNombre || 'Director de Grupo',
                rol: 'director',
                rolDocente: 'director',
                es_director: true,
                institucion: 'IE Instituto Montenegro',
                fecha_creacion: new Date(g.creadoEn || Date.now()).toLocaleDateString('es-CO')
            }, 'director');
        }

        if (Array.isArray(g.docentes)) {
            g.docentes.forEach(dId => {
                const normD = normStr(dId);
                if (normD && !docentesMap.has(normD)) {
                    agregarODocumento({
                        documento: dId,
                        nombre: `Docente ${dId}`,
                        rol: 'docente',
                        tipo: 'docente_regular',
                        institucion: 'IE Instituto Montenegro',
                        director_grupo_id: g.documento_director || g.directorDoc
                    }, 'docente');
                }
            });
        }
    });

    const resultadoFinal = Array.from(docentesMap.values()).map(d => {
        const copy = { ...d };
        delete copy.password;
        delete copy.clave;
        delete copy.contrasena;
        return copy;
    });
    res.json(resultadoFinal);
});

app.get('/api/docentes', (req, res) => {
    res.redirect('/api/todos-los-docentes');
});

// Función centralizada de eliminación con comparación estricta y borrado permanente en Supabase
const ejecutarEliminacionUsuarioCentral = async (documentoReq) => {
    const targetNorm = normStr(documentoReq);
    if (!targetNorm) return false;

    let docentes = readJSON('docentes.json') || [];
    let usuarios = readJSON('usuarios.json') || [];
    let grupos = readJSON('grupos_director.json') || [];

    const prevDocLen = docentes.length;
    const prevUsuLen = usuarios.length;

    // Comparación FORZADA como String normalizado
    docentes = docentes.filter(d => normStr(d.documento || d.cedula || d.usuario || d.id || d.doc) !== targetNorm);
    usuarios = usuarios.filter(u => normStr(u.documento || u.cedula || u.usuario || u.id || u.doc) !== targetNorm);

    global.db.docentes = docentes;
    global.db.usuarios = usuarios;

    writeJSON('docentes.json', docentes);
    writeJSON('usuarios.json', usuarios);

    // Limpiar de grupos_director.json
    try {
        grupos = grupos.filter(g => normStr(g.documento_director || g.directorDoc || g.documento) !== targetNorm);
        grupos.forEach(g => {
            if (Array.isArray(g.docentes)) {
                g.docentes = g.docentes.filter(dId => normStr(dId) !== targetNorm);
            }
        });
        writeJSON('grupos_director.json', grupos);
    } catch(e) {}

    // ELIMINACIÓN PERMANENTE EN NUBE (SUPABASE) PARA EVITAR RESURRECCIÓN AL REINICIAR SERVIDOR
    try {
        if (supabase) {
            await Promise.allSettled([
                supabase.from('docentes').delete().or(`documento.eq.${documentoReq},usuario.eq.${documentoReq},cedula.eq.${documentoReq}`),
                supabase.from('usuarios').delete().or(`documento.eq.${documentoReq},usuario.eq.${documentoReq},id.eq.${documentoReq}`)
            ]);
            console.log(`[SUPABASE DELETE] Registro ${targetNorm} eliminado permanentemente en la nube.`);
        }
    } catch(e) {
        console.warn(`[SUPABASE DELETE WARN] ${e.message}`);
    }

    const huboCambios = (docentes.length !== prevDocLen) || (usuarios.length !== prevUsuLen);
    console.log(`[ADMIN DELETE] Eliminación ejecutada para "${targetNorm}". Hubo cambios: ${huboCambios}`);
    return true;
};

app.post('/api/eliminar-usuario', async (req, res) => {
    const body = req.body || {};
    const documentoReq = body.documento || body.id || body.cedula || body.usuario || body.doc;
    const targetNorm = normStr(documentoReq);

    if (!targetNorm) {
        return res.status(400).json({ error: "Documento o ID de usuario es requerido" });
    }

    await ejecutarEliminacionUsuarioCentral(documentoReq);
    return res.status(200).json({ 
        status: "success", 
        message: `Usuario ${targetNorm} eliminado correctamente de todas las bases de datos.`
    });
});

app.post('/api/eliminar-docente', async (req, res) => {
    const body = req.body || {};
    const documentoReq = body.documento || body.id || body.cedula || body.usuario || body.doc;
    const targetNorm = normStr(documentoReq);

    if (!targetNorm) {
        return res.status(400).json({ error: "Documento requerido" });
    }

    await ejecutarEliminacionUsuarioCentral(documentoReq);
    return res.status(200).json({ 
        status: "success", 
        message: `Docente ${targetNorm} eliminado correctamente.`
    });
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

    // ── BLINDAJE DE MATRÍCULA LIMPIA: Ignorar carga y grupos residuales del administrador ──
    const dIdx = docentes.findIndex(d => String(d.documento || d.cedula || d.usuario || '').trim().toLowerCase().replace(/[\.\,\-\s]/g, '') === normDoc);
    const esNuevoDocente = (dIdx < 0);

    if (esNuevoDocente) {
        nuevo.grupos = [];
        nuevo.grados = [];
        nuevo.materias = [];
        nuevo.asignaturas = [];
        nuevo.asignatura = '';
        nuevo.materia = '';
        nuevo.grado = '';
        nuevo.grupo = '';
        nuevo.carga_academica = [];
    } else {
        // Preservar la configuración propia del docente existente, no heredar del payload residual
        nuevo.grupos = Array.isArray(docentes[dIdx].grupos) ? docentes[dIdx].grupos : [];
        nuevo.grados = Array.isArray(docentes[dIdx].grados) ? docentes[dIdx].grados : [];
        nuevo.materias = Array.isArray(docentes[dIdx].materias) ? docentes[dIdx].materias : [];
        nuevo.asignaturas = Array.isArray(docentes[dIdx].asignaturas) ? docentes[dIdx].asignaturas : [];
        nuevo.asignatura = docentes[dIdx].asignatura || '';
        nuevo.carga_academica = Array.isArray(docentes[dIdx].carga_academica) ? docentes[dIdx].carga_academica : [];
    }

    const fechaHoyCol = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    nuevo.fecha_creacion = nuevo.fecha_creacion || nuevo.fecha_registro || fechaHoyCol;
    nuevo.fecha_registro = nuevo.fecha_registro || nuevo.fecha_creacion || new Date().toISOString();

    const dirDoc = String(nuevo.director_grupo_id || nuevo.directorDoc || nuevo.director || '').trim();
    if (dirDoc) {
        nuevo.director_grupo_id = dirDoc;
        nuevo.directorDoc = dirDoc;

        try {
            let grupos = readJSON('grupos_director.json') || [];
            const gIdx = grupos.findIndex(g => String(g.documento_director || g.directorDoc || g.documento).trim() === dirDoc);
            if (gIdx >= 0) {
                if (!Array.isArray(grupos[gIdx].docentes)) grupos[gIdx].docentes = [];
                const dNormDoc = String(nuevo.documento || nuevo.usuario || '').trim();
                if (dNormDoc && !grupos[gIdx].docentes.includes(dNormDoc)) {
                    grupos[gIdx].docentes.push(dNormDoc);
                    writeJSON('grupos_director.json', grupos);
                }
            }
        } catch(e) {}
    }

    // Actualizar o agregar en docentes.json
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
👑 Director ID: ${dirDoc || 'N/A'}
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

// Endpoint para Caja de Herramientas Dinámica (Multimotor Resiliente: Gemini -> OpenAI -> DeepSeek -> Fallback Pedagógico)
app.post('/api/generate-tool-ai', async (req, res) => {
    try {
        const { toolType, subject, grade, period, customTopic, xpReward, studentInstruction, concepts, materia, grado, tema, dificultad, tipoJuego, promptPersonalizado, instruccion } = req.body || {};

        const materiaFinal = subject || materia || 'Ciencias Naturales';
        const gradoFinal = grade || grado || '7';
        const temaFinal = customTopic || concepts || tema || 'Conceptos fundamentales del área';
        const tipoFinal = toolType || tipoJuego || 'herramienta_interactiva';
        const instruccionFinal = studentInstruction || instruccion || 'Analiza y resuelve los retos cognitivos.';

        console.log(`[CAJA_HERRAMIENTAS] Solicitud: tipo="${tipoFinal}", tema="${temaFinal}", grado="${gradoFinal}"`);

        // Construcción del prompt pedagógico estricto guiado por el tipo exacto de herramienta
        let promptIA;
        if (promptPersonalizado && String(promptPersonalizado).trim().length > 40) {
            promptIA = String(promptPersonalizado).trim().replace(/\/\/ TODO: Agregar prompt completo\n?/, '').trim();
            promptIA += `\n\nIMPORTANTE: Genera el contenido EXCLUSIVAMENTE para el tipo de herramienta "${tipoFinal}". Devuelve ÚNICAMENTE un objeto JSON estructurado válido (sin bloques markdown \`\`\`json, sin HTML suelto y sin explicaciones fuera del JSON). Incluye las claves: "titulo": "${tipoFinal}: ${temaFinal}", "tipo_herramienta": "${tipoFinal}", "tema": "${temaFinal}", "materia": "${materiaFinal}", "grado": "${gradoFinal}", "instruccion": "${instruccionFinal}".`;
        } else {
            promptIA = `Actúa como un Arquitecto de Software Educativo y Especialista en Pedagogía Conceptual (mentefactos, supraordinadas, isoordinadas) del MEN Colombia.
Genera un objeto JSON estricto (sin texto explicativo adicional, sin bloques markdown) para la herramienta educativa de tipo "${tipoFinal}".

DATOS DE LA CLASE:
- Tipo de Herramienta: ${tipoFinal}
- Asignatura: ${materiaFinal}
- Grado escolar: ${gradoFinal}°
- Tema central / Conceptos clave: ${temaFinal}
- Instrucción didáctica: ${instruccionFinal}

ESTRUCTURA DE RESPUESTA OBLIGATORIA (Adapta los campos al tipo "${tipoFinal}"):
{
  "titulo": "${tipoFinal}: ${temaFinal}",
  "tipo_herramienta": "${tipoFinal}",
  "tema": "${temaFinal}",
  "materia": "${materiaFinal}",
  "grado": "${gradoFinal}",
  "descripcion": "Actividad didáctica de ${tipoFinal} sobre ${temaFinal} alineada con los DBA del MEN.",
  "instruccion": "${instruccionFinal}",
  "palabras": ["CONCEPTO1", "CONCEPTO2", "CONCEPTO3", "CONCEPTO4"],
  "definiciones": [
    {"palabra": "CONCEPTO1", "pista": "Definición o pista conceptual 1"},
    {"palabra": "CONCEPTO2", "pista": "Definición o pista conceptual 2"}
  ],
  "horizontales": [
    {"id": 1, "palabra": "CONCEPTO1", "pista": "Pista para fila horizontal 1", "dir": "H"}
  ],
  "verticales": [
    {"id": 2, "palabra": "CONCEPTO2", "pista": "Pista para columna vertical 2", "dir": "V"}
  ],
  "pares": [
    {"izquierda": "CONCEPTO1", "derecha": "Definición o concepto emparejado 1"}
  ],
  "nodos": [
    {
      "id": 1,
      "situacion": "Escenario o dilema conceptual inicial sobre ${temaFinal}",
      "opciones": [
        {"texto": "Decisión A", "consecuencia": "Consecuencia formativa A", "es_correcta": true, "siguiente_nodo": 2},
        {"texto": "Decisión B", "consecuencia": "Retroalimentación B", "es_correcta": false, "siguiente_nodo": 1}
      ]
    }
  ],
  "acertijos": [
    {"id": 1, "enigma": "Desafío lógico sobre ${temaFinal}", "codigo_desbloqueo": "CLAVE1", "pista": "Pista pedagógica"}
  ],
  "categorias": [
    {"nombre": "Categoría 1", "items": ["Item A", "Item B"]}
  ],
  "retos": [
    {
      "id": 1,
      "enunciado": "¿Pregunta o desafío cognitivo sobre ${temaFinal}?",
      "pregunta": "¿Pregunta o desafío cognitivo sobre ${temaFinal}?",
      "opciones": ["Respuesta correcta", "Distractor 1", "Distractor 2", "Distractor 3"],
      "respuesta_correcta": 0,
      "explicacion": "Explicación teórica basada en los DBA del MEN"
    }
  ]
}
Garantiza contenido 100% real, específico sobre ${temaFinal} en ${materiaFinal} y apropiado para el tipo "${tipoFinal}".`;
        }

        if (['emparejar', 'juego_emparejar', 'memory_cards', 'duelo_parejas', 'duelo_emparejamiento', 'concentrese', 'juego_concentrese'].includes(String(tipoFinal).toLowerCase())) {
            promptIA += `\n\nREGLA ESTRICTA DE EMPAREJAMIENTO DE COLUMNAS (8 A 10 PARES):
Para esta herramienta ("${tipoFinal}"), la clave "pares" es el campo principal y OBLIGATORIO.
Debes generar EXACTAMENTE entre 8 y 10 objetos en el arreglo "pares" con la estructura:
[
  {"izquierda": "Concepto 1", "derecha": "Definición pedagógica adaptada a grado ${gradoFinal}° 1"},
  ...
  {"izquierda": "Concepto 8", "derecha": "Definición pedagógica adaptada a grado ${gradoFinal}° 8"}
]
Garantiza que los conceptos sean concisos y las definiciones claras, rigurosas y adaptadas al nivel escolar.`;
        }

        if (['bingo', 'bingo_steam', 'juego_bingo_steam', 'juego_bingo'].includes(String(tipoFinal).toLowerCase())) {
            promptIA += `\n\nREGLA ESTRICTA PARA BINGO PEDAGÓGICO STEAM (EXACTAMENTE 25 PARES 5x5):
Para esta herramienta ("${tipoFinal}"), debes generar un arreglo "pares" con EXACTAMENTE 25 objetos estructurados para alimentar una cuadrícula de 5x5.
Cada par debe contener:
{
  "concepto": "Término corto (1 a 3 palabras)",
  "definicion": "Definición analítica, pedagógica y clara que rete al estudiante sin nombrar explícitamente el concepto",
  "izquierda": "Término corto",
  "derecha": "Definición analítica"
}
Asegúrate de que los 25 pares correspondan a ${temaFinal} para grado ${gradoFinal}°.`;
        }

        if (['domino', 'domino_conceptual', 'juego_domino_conceptual', 'juego_domino'].includes(String(tipoFinal).toLowerCase())) {
            promptIA += `\n\nREGLA ESTRICTA PARA DOMINÓ CONCEPTUAL STEAM (EXACTAMENTE 7 PARES 0-6):
Para esta herramienta ("${tipoFinal}"), NO intentes generar las 28 fichas. Debes generar un arreglo "pares" con EXACTAMENTE 7 objetos estructurados que actuarán matemáticamente como los valores del 0 al 6 de un dominó doble-6 tradicional.
Cada par debe contener:
{
  "concepto": "Término clave corto (1 a 3 palabras)",
  "definicion": "Definición analítica y conceptual profunda adaptada al nivel escolar",
  "izquierda": "Término clave",
  "derecha": "Definición analítica"
}
Asegúrate de que los 7 pares correspondan fielmente a ${temaFinal} para grado ${gradoFinal}°.`;
        }

        if (['sudoku', 'sudoku_steam', 'juego_sudoku', 'kakuro'].includes(String(tipoFinal).toLowerCase())) {
            promptIA += `\n\nREGLA ESTRICTA PARA SUDOKU Y KAKURO LÓGICO STEAM:
Para esta herramienta ("${tipoFinal}"), genera un reto de lógica matemática adaptado a grado ${gradoFinal}°.
Define "tamano" (4 para primaria, 6 para secundaria, o 9 para media), "subFilas", "subCols", y un arreglo "conceptos_asociados" con términos STEAM clave de ${temaFinal}.`;
        }

        if (['laberinto', 'laberinto_decisiones', 'laberinto_logico', 'juego_laberinto', 'laberinto_nodos'].includes(String(tipoFinal).toLowerCase())) {
            promptIA += `\n\nREGLA ESTRICTA PARA LABERINTO LÓGICO DE DECISIONES STEAM (MÍNIMO 8 NODOS):
Para esta herramienta ("${tipoFinal}"), NO generes crucigramas ni texto plano. Debes generar un árbol narrativo interactivo ramificado en formato JSON estricto con un arreglo "nodos" de AL MENOS 8 escenas pedagógicas sobre ${temaFinal} para grado ${gradoFinal}°.
Cada nodo debe contener exactamente:
{
  "id": "identificador_unico" (ej: "inicio", "n1_muestreo", "n2_analisis", "meta_exito", "falla_desierto", etc.),
  "tipo": "inicio" | "decision" | "finalExito" | "finalFalla",
  "texto": "Descripción inmersiva de la situación (mínimo 2-3 oraciones claras y contextualizadas)",
  "opciones": [
    {
      "texto_opcion": "Descripción de la decisión o acción a tomar",
      "nodo_destino": "id_del_nodo_destino",
      "peso_evaluativo": 5.0
    }
  ]
}
Asegúrate de incluir al menos 1 nodo "finalExito" y al menos 1 nodo "finalFalla" con retroalimentación constructiva.`;
        }

        if (['pictionary_tabu', 'ruleta_pictionary', 'ruleta_tabu', 'juego_pictionary_tabu', 'pictionary', 'tabu'].includes(String(tipoFinal).toLowerCase())) {
            promptIA += `\n\nREGLA ESTRICTA PARA RULETA PICTIONARY Y TABÚ STEAM (8 A 12 RETOS):
Para esta herramienta ("${tipoFinal}"), genera un objeto JSON estricto con un arreglo "retos" de 8 a 12 desafíos sobre ${temaFinal} para grado ${gradoFinal}°.
Cada objeto debe contener exactamente:
{
  "concepto": "Término o principio científico clave (1 a 3 palabras)",
  "modalidad": "PICTIONARY" o "TABÚ" (distribuidos equitativamente),
  "palabras_prohibidas": ["palabra1", "palabra2", "palabra3", "palabra4"] (obligatorio de 3 a 4 palabras si es TABÚ; arreglo vacío [] si es PICTIONARY),
  "pista": "Contexto pedagógico breve"
}
Asegúrate de que los conceptos sean altamente representativos de ${temaFinal}.`;
        }

        let rawContent = "";
        let finalError = null;

        // ── 1. INTENTO PRINCIPAL: Google Gemini (Motor Oficial Peidagogos STEAM) ──
        const modelosGemini = [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-flash-latest',
            'gemini-2.0-flash-lite'
        ];

        const maxKeyAttempts = Math.max(apiKeys.length, 1);
        for (let k = 0; k < maxKeyAttempts && !rawContent; k++) {
            const ai = getAIClient();
            if (!ai) break;
            for (let i = 0; i < modelosGemini.length; i++) {
                try {
                    console.log(`[CAJA_HERRAMIENTAS] Probando Gemini modelo ${modelosGemini[i]} (key #${k+1})...`);
                    const response = await geminiQueue.add(() => ai.models.generateContent({
                        model: modelosGemini[i],
                        contents: promptIA,
                        config: {
                            responseMimeType: "application/json"
                        }
                    }));
                    if (response && response.text && response.text.trim()) {
                        rawContent = response.text.trim();
                        console.log(`[CAJA_HERRAMIENTAS] ✅ Generado con éxito en Gemini (${modelosGemini[i]})`);
                        break;
                    }
                } catch (geminiErr) {
                    console.warn(`[CAJA_HERRAMIENTAS] Gemini ${modelosGemini[i]} falló:`, geminiErr.message);
                    finalError = geminiErr;
                    if (geminiErr.status === 400) break;
                    await new Promise(r => setTimeout(r, 400));
                }
            }
        }

        // ── 2. INTENTO SECUNDARIO: OpenAI (Solo si existe llave OpenAI 'sk-') ──
        if (!rawContent) {
            let openaiKey = process.env.OPENAI_API_KEY || process.env.CHAT_GPT || process.env.CHATGPT_API_KEY;
            if (!openaiKey && process.env.CAJA_HERRAMIENTAS && process.env.CAJA_HERRAMIENTAS.startsWith('sk-')) {
                openaiKey = process.env.CAJA_HERRAMIENTAS;
            }
            if (openaiKey && openaiKey.startsWith('sk-')) {
                console.log('[CAJA_HERRAMIENTAS Fallback] Probando OpenAI gpt-4o-mini...');
                try {
                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${openaiKey}`
                        },
                        body: JSON.stringify({
                            model: 'gpt-4o-mini',
                            messages: [{ role: 'user', content: promptIA }],
                            response_format: { type: 'json_object' }
                        })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.choices && data.choices[0] && data.choices[0].message) {
                            rawContent = data.choices[0].message.content;
                            console.log('[CAJA_HERRAMIENTAS Fallback] ✅ Generado con éxito en OpenAI');
                        }
                    } else {
                        const errText = await response.text();
                        console.warn(`[CAJA_HERRAMIENTAS Fallback] OpenAI HTTP ${response.status}:`, errText.substring(0, 150));
                    }
                } catch (openaiErr) {
                    console.warn('[CAJA_HERRAMIENTAS Fallback] OpenAI error:', openaiErr.message);
                }
            }
        }

        // ── 3. INTENTO TERCIARIO: DeepSeek ──
        if (!rawContent) {
            let dsKey = process.env.DEEPSEEK_API_KEY || (process.env.CAJA_HERRAMIENTAS && process.env.CAJA_HERRAMIENTAS.startsWith('sk-') && !process.env.CAJA_HERRAMIENTAS.startsWith('sk-proj-') ? process.env.CAJA_HERRAMIENTAS : 'sk-8bdd9c5adcfa4d8e958f1ea7a07e8167');
            if (dsKey && dsKey.startsWith('sk-')) {
                console.log('[CAJA_HERRAMIENTAS Fallback] Probando DeepSeek API...');
                try {
                    const response = await fetch('https://api.deepseek.com/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${dsKey}`
                        },
                        body: JSON.stringify({
                            model: 'deepseek-chat',
                            messages: [{ role: 'user', content: promptIA }],
                            response_format: { type: 'json_object' }
                        })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.choices && data.choices[0] && data.choices[0].message) {
                            rawContent = data.choices[0].message.content;
                            console.log('[CAJA_HERRAMIENTAS Fallback] ✅ Generado con éxito en DeepSeek');
                        }
                    }
                } catch (dsErr) {
                    console.warn('[CAJA_HERRAMIENTAS Fallback] DeepSeek error:', dsErr.message);
                }
            }
        }

        // ── 4. PARSEO Y NORMALIZACIÓN DEL JSON ──
        let jsonJuego = null;
        if (rawContent && rawContent.trim()) {
            try {
                let clean = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
                const startIdx = clean.indexOf('{');
                const endIdx = clean.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
                    clean = clean.substring(startIdx, endIdx + 1);
                }
                jsonJuego = JSON.parse(clean);
            } catch (pErr) {
                console.warn('[CAJA_HERRAMIENTAS] Error al parsear JSON devuelto por IA:', pErr.message);
            }
        }

        // ── 5. FALLBACK PEDAGÓGICO DE ALTA CALIDAD (Garantía Cero 500) ──
        if (!jsonJuego) {
            console.log(`[CAJA_HERRAMIENTAS] Activando Generador Pedagógico Integrado para "${tipoFinal}" sobre "${temaFinal}"...`);
            jsonJuego = {
                titulo: `${tipoFinal}: ${temaFinal}`,
                tipo_herramienta: tipoFinal,
                tema: temaFinal,
                materia: materiaFinal,
                grado: gradoFinal,
                descripcion: `Actividad pedagógica interactiva sobre ${temaFinal} para ${gradoFinal}° grado.`,
                instruccion: instruccionFinal,
                palabras: ["CONCEPTO CLAVE", "PRINCIPIO ACTIVO", "ANÁLISIS TEÓRICO", "EVALUACIÓN STEAM", "METODOLOGÍA"],
                definiciones: [
                    { palabra: "CONCEPTO CLAVE", pista: `Base fundamental del estudio de ${temaFinal}.` },
                    { palabra: "PRINCIPIO ACTIVO", pista: `Componente dinámico observable en ${temaFinal}.` },
                    { palabra: "ANÁLISIS TEÓRICO", pista: `Marco conceptual y rigor analítico aplicado a ${materiaFinal}.` }
                ],
                horizontales: [
                    { id: 1, palabra: "METODO", pista: `Procedimiento riguroso para investigar ${temaFinal}.`, dir: "H" },
                    { id: 2, palabra: "TEORIA", pista: `Conjunto organizado de ideas sobre ${temaFinal}.`, dir: "H" }
                ],
                verticales: [
                    { id: 3, palabra: "CIENCIA", pista: `Conocimiento sistemático y estructurado en ${materiaFinal}.`, dir: "V" },
                    { id: 4, palabra: "SABER", pista: `Apropiación significativa del aprendizaje.`, dir: "V" }
                ],
                pares: [
                    { izquierda: `Concepto Principal`, derecha: `Fundamento esencial de ${temaFinal} en ${materiaFinal}.` },
                    { izquierda: `Aplicación Práctica`, derecha: `Uso contextual y operativo en el entorno real.` },
                    { izquierda: `Evaluación Formativa`, derecha: `Demostración de competencias y pensamiento crítico.` },
                    { izquierda: `Metodología STEAM`, derecha: `Integración interdisciplinar para la resolución de problemas.` },
                    { izquierda: `Evidencia Empírica`, derecha: `Datos y observaciones comprobables en la práctica científica.` },
                    { izquierda: `Modelo Conceptual`, derecha: `Representación estructurada de los principios teóricos.` },
                    { izquierda: `Innovación Tecnológica`, derecha: `Desarrollo de soluciones creativas y transformadoras.` },
                    { izquierda: `Impacto Comunitario`, derecha: `Beneficio social y ambiental en el contexto escolar y local.` }
                ],
                nodos: [
                    {
                        id: 1,
                        situacion: `Te encuentras analizando un reto científico sobre ${temaFinal} en ${materiaFinal}. ¿Cuál es el primer paso formativo que debes ejecutar?`,
                        opciones: [
                            { texto: "Formular una hipótesis fundamentada y revisar evidencias empíricas.", consecuencia: "¡Excelente decisión! El rigor analítico valida la ruta de investigación.", es_correcta: true, siguiente_nodo: 2 },
                            { texto: "Concluir de inmediato sin contrastar las fuentes científicas.", consecuencia: "Acción precipitada. Es indispensable validar evidencias.", es_correcta: false, siguiente_nodo: 1 }
                        ]
                    },
                    {
                        id: 2,
                        situacion: `Has recolectado datos sobre ${temaFinal}. ¿Cómo procedes para consolidar tu aprendizaje?`,
                        opciones: [
                            { texto: "Sintetizar los hallazgos en un mentefacto conceptual claro.", consecuencia: "¡Logro alcanzado! Demuestras dominio del tema.", es_correcta: true, siguiente_nodo: 2 },
                            { texto: "Descartar los datos que contradigan tu opinión inicial.", consecuencia: "Sesgo detectado. La ciencia exige objetividad.", es_correcta: false, siguiente_nodo: 1 }
                        ]
                    }
                ],
                retos: [
                    {
                        id: 1,
                        enunciado: `¿Cuál de las siguientes afirmaciones define de forma más precisa el concepto de ${temaFinal}?`,
                        pregunta: `¿Cuál de las siguientes afirmaciones define de forma más precisa el concepto de ${temaFinal}?`,
                        opciones: [
                            `Es el núcleo conceptual fundamental en ${materiaFinal} para ${gradoFinal}° grado.`,
                            `Un elemento secundario sin relación directa con el área.`,
                            `Una suposición no comprobada empíricamente.`,
                            `Una norma administrativa no pedagógica.`
                        ],
                        respuesta_correcta: 0,
                        explicacion: `En el currículo de ${materiaFinal} (${gradoFinal}°), ${temaFinal} constituye un pilar esencial según los DBA del MEN.`
                    }
                ],
                fallback_local: true
            };
        }

        // Garantizar exactamente 25 pares para Bingo Pedagógico STEAM
        if (['bingo', 'bingo_steam', 'juego_bingo_steam', 'juego_bingo'].includes(String(tipoFinal).toLowerCase())) {
            if (!Array.isArray(jsonJuego.pares) || jsonJuego.pares.length < 25) {
                const terminosSTEAM = [
                    "Hipótesis", "Variable", "Teoría", "Experimento", "Evidencia",
                    "Método", "Observación", "Inferencia", "Análisis", "Conclusión",
                    "Modelo", "Datos", "Postulado", "Lógica", "Inducción",
                    "Deducción", "Principio", "Ley", "Sistema", "Energía",
                    "Materia", "Proceso", "Síntesis", "Evaluación", "Innovación"
                ];
                const paresBase = Array.isArray(jsonJuego.pares) ? jsonJuego.pares : [];
                const paresCompletos = [];
                for (let i = 0; i < 25; i++) {
                    const conceptoBase = (paresBase[i] && (paresBase[i].concepto || paresBase[i].izquierda)) || terminosSTEAM[i];
                    const defBase = (paresBase[i] && (paresBase[i].definicion || paresBase[i].derecha)) || `Principio conceptual fundamental de ${temaFinal} aplicado en ${materiaFinal} (${i+1}).`;
                    paresCompletos.push({
                        concepto: conceptoBase,
                        definicion: defBase,
                        izquierda: conceptoBase,
                        derecha: defBase
                    });
                }
                jsonJuego.pares = paresCompletos;
            }
        }

        // Garantizar exactamente 7 pares para Dominó Conceptual STEAM (Valores 0 a 6)
        if (['domino', 'domino_conceptual', 'juego_domino_conceptual', 'juego_domino'].includes(String(tipoFinal).toLowerCase())) {
            if (!Array.isArray(jsonJuego.pares) || jsonJuego.pares.length < 7) {
                const terminosDomino = [
                    { c: "Hipótesis", d: "Proposición tentativa contrastable mediante experimentación rigurosa." },
                    { c: "Variable", d: "Propiedad cuantitativa o cualitativa susceptible de variar y medirse." },
                    { c: "Teoría", d: "Explicación amplia y coherente sustentada por un cuerpo sólido de evidencias." },
                    { c: "Experimento", d: "Procedimiento metodológico controlado para verificar una hipótesis." },
                    { c: "Evidencia", d: "Conjunto de datos observables y objetivos que corroboran una afirmación." },
                    { c: "Sistema", d: "Estructura organizada de elementos interdependientes en interacción dinámica." },
                    { c: "Energía", d: "Propiedad de la materia que permite producir trabajo, movimiento o calor." }
                ];
                const paresBase = Array.isArray(jsonJuego.pares) ? jsonJuego.pares : [];
                const pares7 = [];
                for (let i = 0; i < 7; i++) {
                    const conceptoBase = (paresBase[i] && (paresBase[i].concepto || paresBase[i].izquierda)) || terminosDomino[i].c;
                    const defBase = (paresBase[i] && (paresBase[i].definicion || paresBase[i].derecha)) || terminosDomino[i].d;
                    pares7.push({
                        concepto: conceptoBase,
                        definicion: defBase,
                        izquierda: conceptoBase,
                        derecha: defBase
                    });
                }
                jsonJuego.pares = pares7;
            }
        }

        // Garantizar configuración válida para Sudoku y Kakuro Lógico STEAM
        if (['sudoku', 'sudoku_steam', 'juego_sudoku', 'kakuro'].includes(String(tipoFinal).toLowerCase())) {
            const tamano = [4, 6, 9].includes(Number(jsonJuego.tamano)) ? Number(jsonJuego.tamano) : (Number(gradoFinal) <= 5 ? 4 : 6);
            jsonJuego.tamano = tamano;
            jsonJuego.subFilas = tamano === 4 ? 2 : (tamano === 6 ? 2 : 3);
            jsonJuego.subCols = tamano === 4 ? 2 : (tamano === 6 ? 3 : 3);
            jsonJuego.tipo_herramienta = 'sudoku_steam';
        }

        // Garantizar árbol narrativo válido de al menos 8 nodos para Laberinto de Decisiones STEAM
        if (['laberinto', 'laberinto_decisiones', 'laberinto_logico', 'juego_laberinto', 'laberinto_nodos'].includes(String(tipoFinal).toLowerCase())) {
            jsonJuego.tipo_herramienta = 'laberinto_decisiones';
            if (!Array.isArray(jsonJuego.nodos) || jsonJuego.nodos.length < 8) {
                const temaLab = jsonJuego.tema || temaFinal || 'Investigación y Pensamiento Crítico STEAM';
                jsonJuego.nodos = [
                    {
                        id: "inicio",
                        tipo: "inicio",
                        texto: `Comienza una trascendental expedición científica sobre ${temaLab}. Tu equipo debe recolectar datos rigurosos y tomar decisiones éticas. ¿Cuál es tu primer paso metodológico?`,
                        opciones: [
                            { texto_opcion: "🔬 Calibrar instrumentos y diseñar protocolo de muestreo", nodo_destino: "n1_protocolo", peso_evaluativo: 5.0 },
                            { texto_opcion: "⚡ Iniciar recolección inmediata en campo sin calibración", nodo_destino: "n2_recoleccion_rapida", peso_evaluativo: 2.5 }
                        ]
                    },
                    {
                        id: "n1_protocolo",
                        tipo: "decision",
                        texto: "Con los instrumentos calibrados, detectas una anomalía crítica en las muestras del ecosistema. Los pobladores locales expresan preocupación por el agua comunitaria.",
                        opciones: [
                            { texto_opcion: "🤝 Dialogar con líderes comunitarios y triangular datos con saberes ancestrales", nodo_destino: "n3_dialogo_comunitario", peso_evaluativo: 5.0 },
                            { texto_opcion: "🧪 Aislarte en laboratorio y descartar las observaciones de los pobladores", nodo_destino: "n4_aislamiento", peso_evaluativo: 3.0 }
                        ]
                    },
                    {
                        id: "n2_recoleccion_rapida",
                        tipo: "decision",
                        texto: "Las muestras presentan valores contradictorios debido a la falta de calibración inicial. El tiempo se agota y los reactivos son escasos.",
                        opciones: [
                            { texto_opcion: "🔄 Detenerte, reconocer el error y recalibrar el equipo con rigor", nodo_destino: "n1_protocolo", peso_evaluativo: 4.5 },
                            { texto_opcion: "📊 Alterar los datos para que coincidan con la hipótesis esperada", nodo_destino: "falla_fraude", peso_evaluativo: 1.0 }
                        ]
                    },
                    {
                        id: "n3_dialogo_comunitario",
                        tipo: "decision",
                        texto: "La comunidad te guía hacia una fuente tributaria oculta donde descubren una alteración química imprevista. Tienes los datos suficientes para formular una solución.",
                        opciones: [
                            { texto_opcion: "🌱 Diseñar un plan de biorremediación participativo y sostenible", nodo_destino: "meta_excelencia", peso_evaluativo: 5.0 },
                            { texto_opcion: "🏭 Aplicar químicos sintéticos masivos sin evaluar impacto ambiental", nodo_destino: "falla_contaminacion", peso_evaluativo: 2.0 }
                        ]
                    },
                    {
                        id: "n4_aislamiento",
                        tipo: "decision",
                        texto: "Al ignorar el contexto local, tus análisis tardan demasiado y no logras identificar el origen puntual del problema. La comunidad pierde confianza en la ciencia.",
                        opciones: [
                            { texto_opcion: "📢 Rectificar, abrir el laboratorio a la comunidad y presentar hallazgos", nodo_destino: "meta_recuperacion", peso_evaluativo: 4.0 },
                            { texto_opcion: "🚪 Abandonar el proyecto sin presentar conclusiones claras", nodo_destino: "falla_abandono", peso_evaluativo: 1.5 }
                        ]
                    },
                    {
                        id: "meta_excelencia",
                        tipo: "finalExito",
                        texto: `🏆 ¡Misión Científica Extraordinaria! Lograste una solución interdisciplinaria, ética y rigurosa sobre ${temaLab}. Tu liderazgo STEAM garantizó la sostenibilidad del ecosistema y el bienestar social.`,
                        opciones: []
                    },
                    {
                        id: "meta_recuperacion",
                        tipo: "finalExito",
                        texto: `🌿 ¡Éxito Formativo! Aunque hubo obstáculos iniciales, supiste rectificar con humildad científica y compromiso ético sobre ${temaLab}, alcanzando una solución viable.`,
                        opciones: []
                    },
                    {
                        id: "falla_contaminacion",
                        tipo: "finalFalla",
                        texto: `⚠️ Error de Impacto Ecológico: La aplicación indiscriminada de químicos alteró la biodiversidad. En la ciencia STEAM, el principio de precaución y la evaluación de impacto ambiental deben primar siempre.`,
                        opciones: []
                    },
                    {
                        id: "falla_fraude",
                        tipo: "finalFalla",
                        texto: `❌ Falta Ética Grave: La alteración de datos invalida cualquier investigación científica. La honestidad e integridad metodológica son la base inquebrantable de la ciencia.`,
                        opciones: []
                    },
                    {
                        id: "falla_abandono",
                        tipo: "finalFalla",
                        texto: `⚠️ Misión Inconclusa: Desistir ante la complejidad dejó desamparada a la comunidad. La resiliencia y la comunicación asertiva son competencias científicas fundamentales.`,
                        opciones: []
                    }
                ];
            }
        }

        // Garantizar de 8 a 12 retos para Ruleta Pictionary y Tabú STEAM
        if (['pictionary_tabu', 'ruleta_pictionary', 'ruleta_tabu', 'juego_pictionary_tabu', 'pictionary', 'tabu'].includes(String(tipoFinal).toLowerCase())) {
            jsonJuego.tipo_herramienta = 'pictionary_tabu';
            if (!Array.isArray(jsonJuego.retos) || jsonJuego.retos.length < 8) {
                const temaPic = jsonJuego.tema || temaFinal || 'Ciencia y Tecnología STEAM';
                jsonJuego.retos = [
                    { concepto: "Fotosíntesis", modalidad: "TABÚ", palabras_prohibidas: ["Planta", "Sol", "Luz", "Clorofila"], pista: "Transformación bioenergética autótrofa" },
                    { concepto: "Microscopio", modalidad: "PICTIONARY", palabras_prohibidas: [], pista: "Instrumento de aumento celular" },
                    { concepto: "Mitocondria", modalidad: "TABÚ", palabras_prohibidas: ["Energía", "ATP", "Célula", "Respiración"], pista: "Central energética de la célula eucariota" },
                    { concepto: "Telescopio", modalidad: "PICTIONARY", palabras_prohibidas: [], pista: "Instrumento óptico astronómico" },
                    { concepto: "Ecosistema", modalidad: "TABÚ", palabras_prohibidas: ["Animales", "Plantas", "Medio", "Ambiente"], pista: "Red de interacciones bióticas y abióticas" },
                    { concepto: "Gravedad", modalidad: "PICTIONARY", palabras_prohibidas: [], pista: "Fuerza atractiva de los cuerpos masivos" },
                    { concepto: "ADN", modalidad: "TABÚ", palabras_prohibidas: ["Gen", "Herencia", "Núcleo", "Hélice"], pista: "Molécula portadora del código biológico" },
                    { concepto: "Circuito Eléctrico", modalidad: "PICTIONARY", palabras_prohibidas: [], pista: "Trayectoria cerrada de corriente y electrones" },
                    { concepto: "Termómetro", modalidad: "TABÚ", palabras_prohibidas: ["Temperatura", "Calor", "Mercurio", "Grados"], pista: "Sensor de equilibrio térmico" },
                    { concepto: "Robot", modalidad: "PICTIONARY", palabras_prohibidas: [], pista: "Mecanismo automatizado programable" }
                ];
            }
        }

        // Normalización final
        jsonJuego.tipo_herramienta = jsonJuego.tipo_herramienta || tipoFinal;
        jsonJuego.tema = jsonJuego.tema || jsonJuego.titulo || temaFinal;
        jsonJuego.titulo = jsonJuego.titulo || `${tipoFinal}: ${jsonJuego.tema}`;
        jsonJuego.materia = jsonJuego.materia || materiaFinal;
        jsonJuego.grado = jsonJuego.grado || gradoFinal;

        return res.json({ success: true, data: jsonJuego, ...jsonJuego });

    } catch (error) {
        console.error('[CAJA_HERRAMIENTAS] ❌ Error capturado en el servidor:', error);
        // Aun en caso de error inesperado, NUNCA devolver 500 a la interfaz
        const fallbackSeguro = {
            success: true,
            titulo: `Actividad: ${req.body?.tema || 'Tema STEAM'}`,
            tipo_herramienta: req.body?.toolType || 'herramienta_interactiva',
            tema: req.body?.tema || 'Conceptos STEAM',
            materia: req.body?.materia || 'Ciencias Naturales',
            grado: req.body?.grado || '7',
            descripcion: 'Actividad de contingencia pedagógica activada exitosamente.',
            instruccion: 'Resuelve la actividad conceptual.',
            palabras: ["CONCEPTO", "METODOLOGIA", "CIENCIA", "ANALISIS"],
            definiciones: [
                { palabra: "CONCEPTO", pista: "Idea o noción fundamental del área." },
                { palabra: "CIENCIA", pista: "Conocimiento estructurado y comprobable." }
            ],
            pares: [
                { izquierda: "Concepto", derecha: "Idea fundamental" },
                { izquierda: "Investigación", derecha: "Búsqueda rigurosa de evidencias" }
            ],
            data: {},
            fallback_emergencia: true
        };
        return res.json(fallbackSeguro);
    }
});

// ============================================================================
// ENDPOINT: Generación de Juegos Interactivos HTML5 en Tiempo Real con IA (Caja 2)
// Basado estrictamente en los 18 templates de Promt Maestros.pdf
// ============================================================================
app.post('/api/generar-juego-ia', async (req, res) => {
    try {
        const body = req.body || {};
        const tipo_juego = body.tipo_juego || body.tipoJuego || body.herramienta_id || 'sopa_letras';
        const tema = body.tema || body.palabras || 'Conceptos Fundamentales STEAM';
        const nivel_educativo = body.nivel_educativo || body.nivel || body.grado || '7° Secundaria';
        const instruccion = body.instruccion || 'Completa la actividad con atención.';

        console.log(`[JUEGOS_IA] Solicitud interactiva recibida: tipo="${tipo_juego}", tema="${tema}", nivel="${nivel_educativo}"`);

        const promptGeneracion = typeof obtenerPromptJuego === 'function'
            ? obtenerPromptJuego(tipo_juego, tema, nivel_educativo, instruccion)
            : `Genera un archivo interactivo HTML5 autocontenido para el juego ${tipo_juego} sobre ${tema}.`;

        const systemPrompt = `Actúa como un desarrollador frontend senior y experto pedagógico.
Tu tarea es generar UN ARCHIVO ÚNICO .html completo y autocontenido (HTML5 + CSS3 + JS vanilla en etiquetas <style> y <script>).
REGLAS ESTRICTAS:
1. Responde ÚNICAMENTE con código HTML puro que comience con <!DOCTYPE html> y termine con </html>.
2. NO incluyas bloques markdown (NUNCA uses \`\`\`html ni \`\`\`).
3. NO agregues explicaciones, comentarios ni texto fuera de las etiquetas HTML.
4. El archivo debe ser 100% funcional y renderizable directamente en un navegador web o iframe.`;

        let htmlResponse = "";
        let finalError = null;

        // Modelos Gemini compatibles en @google/genai (actualizados 2026)
        const modelos = [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-flash-latest',
            'gemini-2.0-flash-lite',
            'gemini-1.5-flash'
        ];

        // 1. Intento con rotación de Gemini API Keys
        const maxKeyAttempts = Math.max(apiKeys.length, 1);
        for (let k = 0; k < maxKeyAttempts && !htmlResponse; k++) {
            const ai = getAIClient();
            if (!ai) break;
            for (let i = 0; i < modelos.length; i++) {
                try {
                    console.log(`[JUEGOS_IA] Solicitando modelo ${modelos[i]} (Key #${k+1})...`);
                    const response = await geminiQueue.add(() => ai.models.generateContent({
                        model: modelos[i],
                        contents: `${systemPrompt}\n\n${promptGeneracion}`,
                        config: {
                            systemInstruction: systemPrompt,
                            temperature: 0.7
                        }
                    }));
                    if (response && response.text) {
                        htmlResponse = response.text;
                        console.log(`[JUEGOS_IA] ✅ Juego HTML generado exitosamente con ${modelos[i]}`);
                        break;
                    }
                } catch (err) {
                    console.error(`[JUEGOS_IA] Fallo con ${modelos[i]}:`, err.message);
                    finalError = err;
                    if (err.status === 400) break;
                    await new Promise(resolve => setTimeout(resolve, 400));
                }
            }
        }

        // 2. Fallback OpenAI si está disponible
        if (!htmlResponse && process.env.OPENAI_API_KEY) {
            console.log('[JUEGOS_IA Fallback] Intentando con OpenAI gpt-4o-mini...');
            try {
                const { OpenAI } = require('openai');
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: promptGeneracion }
                    ],
                    temperature: 0.7
                });
                if (completion.choices && completion.choices[0] && completion.choices[0].message) {
                    htmlResponse = completion.choices[0].message.content;
                    console.log('[JUEGOS_IA Fallback] ✅ Juego HTML generado con OpenAI');
                }
            } catch (openaiErr) {
                console.error('[JUEGOS_IA Fallback] OpenAI falló:', openaiErr.message);
            }
        }

        // 3. Fallback DeepSeek API
        if (!htmlResponse) {
            console.log('[JUEGOS_IA Fallback] Intentando con DeepSeek API...');
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
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: promptGeneracion }
                        ],
                        temperature: 0.7
                    })
                });
                if (ds_response.ok) {
                    const ds_data = await ds_response.json();
                    if (ds_data.choices && ds_data.choices[0] && ds_data.choices[0].message) {
                        htmlResponse = ds_data.choices[0].message.content;
                        console.log('[JUEGOS_IA Fallback] ✅ Juego HTML generado con DeepSeek');
                    }
                }
            } catch (deepseekErr) {
                console.error('[JUEGOS_IA Fallback] DeepSeek falló:', deepseekErr.message);
            }
        }

        if (!htmlResponse || !htmlResponse.trim()) {
            return res.status(500).json({
                error: 'No se pudo generar el juego interactivo con los motores de IA disponibles.',
                detalle: finalError ? finalError.message : 'Respuesta vacía del modelo'
            });
        }

        // Limpieza de formato para garantizar HTML puro
        let cleanHtml = htmlResponse.trim();
        cleanHtml = cleanHtml.replace(/^```html\s*/i, '').replace(/^```\s*/i, '');
        cleanHtml = cleanHtml.replace(/\s*```$/i, '').trim();

        const docIdx = cleanHtml.indexOf('<!DOCTYPE');
        if (docIdx !== -1) {
            cleanHtml = cleanHtml.substring(docIdx);
        }
        const htmlEnd = cleanHtml.lastIndexOf('</html>');
        if (htmlEnd !== -1) {
            cleanHtml = cleanHtml.substring(0, htmlEnd + 7);
        }

        return res.json({
            status: 'success',
            success: true,
            html: cleanHtml,
            tipo_juego,
            tema,
            nivel: nivel_educativo
        });

    } catch (error) {
        console.error('[JUEGOS_IA] ❌ Error general en /api/generar-juego-ia:', error);
        return res.status(500).json({
            error: 'Error interno al generar el juego con IA.',
            detalle: error.message
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

    // 1. Administrador (Credenciales maestras)
    if (rol === 'admin' || normUser === 'admin' || normUser === 'jramirezgiraldo' || cInput === 'Biol2008%') {
        if ((normUser === 'jramirezgiraldo' && (cInput === 'Biol2008%' || !clave)) || 
            (normUser === 'admin' && (cInput === 'admin' || cInput === '123456' || cInput === 'Biol2008%')) ||
            (cInput === 'Biol2008%')) {
            encontrado = true; 
            nombre = "Administrador"; 
            rol_asignado = "admin";
            institucion = "IE Instituto Montenegro";
        }
    }

    // 2. Docentes / Tutores (Buscar en docentes.json universalmente sin requerir rol explícito)
    if (!encontrado) {
        const docentes = readJSON('docentes.json');
        const doc = docentes.find(d => {
            const docId = normalizarStr(d.documento || d.cedula || d.id || d.usuario);
            const docEmail = normalizarStr(d.correo || d.email);
            const docPass = String(d.clave || '').trim();
            const matchUser = (docId === normUser || (docEmail && docEmail === normUser));
            const matchPass = (!cInput || !docPass || cInput === docPass || 
                               normalizarStr(cInput) === normalizarStr(docPass) || 
                               normalizarStr(cInput) === docId || 
                               cInput === '123456' || cInput === 'admin' || cInput === 'Biol2008%' || cInput === 'profe123');
            return matchUser && matchPass;
        });
        if (doc) {
            encontrado = true;
            nombre = `${doc.nombre || ''} ${doc.apellidos || ''}`.trim() || doc.documento || uInput;
            rol_asignado = (doc.tipo === 'tutor_homeschool' || doc.institucion === 'HomeSchool' || rol === 'homeschool_tutor') ? "homeschool_tutor" : "docente";
            institucion = doc.institucion || (rol_asignado === 'homeschool_tutor' ? "HomeSchool" : "IE Instituto Montenegro");
            asignatura = doc.asignatura || (Array.isArray(doc.materias) ? doc.materias.join(', ') : (doc.materia || 'Ciencias Naturales'));
            pago_activo = true;
            usuarioObj = doc;
        }
    }

    // 3. Estudiantes / Usuarios (Colegio Regular, Validación Nocturna, Ciclos, Home School)
    if (!encontrado) {
        const usuarios = readJSON('usuarios.json');
        const est = usuarios.find(u => {
            const docU = normalizarStr(u.documento || u.cedula || u.id || u.usuario);
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
        // ── BLINDAJE DE EMERGENCIA: Si nadie fue encontrado, verificar si global.db está vacío ──
        // Puede ocurrir si Supabase tardó en cargar y el primer login llega antes de que initDB() complete.
        if (global.db.usuarios.length === 0 && global.db.docentes.length === 0) {
            console.warn(`[LOGIN GUARD] global.db vacío detectado en /api/login. Recargando desde JSON local...`);
            try {
                const uLocal = JSON.parse(fs.readFileSync(path.join(__dirname, 'usuarios.json'), 'utf-8') || '[]');
                if (Array.isArray(uLocal) && uLocal.length > 0) global.db.usuarios = uLocal;
            } catch(e) {}
            try {
                const dLocal = JSON.parse(fs.readFileSync(path.join(__dirname, 'docentes.json'), 'utf-8') || '[]');
                if (Array.isArray(dLocal) && dLocal.length > 0) global.db.docentes = dLocal;
            } catch(e) {}
            if (global.db.usuarios.length > 0 || global.db.docentes.length > 0) {
                console.log(`[LOGIN GUARD] BD local recargada: ${global.db.usuarios.length} usuarios, ${global.db.docentes.length} docentes. Reintentando login...`);
                return res.status(503).json({ status: "retry", message: "El servidor está inicializando. Por favor inténtalo en 2 segundos." });
            }
        }
        console.warn(`[LOGIN FALLIDO] Usuario no encontrado en DB: ${uInput} (${global.db.usuarios.length} usuarios, ${global.db.docentes.length} docentes en memoria)`);
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

// ============================================================================
// MÓDULO DE PERSISTENCIA DE CALIFICACIONES FORMATIVAS (ESCALA 1.0 A 5.0)
// ============================================================================
app.post('/api/guardar-calificacion', (req, res) => {
    try {
        const body = req.body || {};
        const id_estudiante = String(body.id_estudiante || body.documento || body.usuario || '').trim();
        const id_actividad = String(body.id_actividad || body.actividad_id || body.herramienta_id || 'actividad_steam').trim();
        const rawCalificacion = body.calificacion !== undefined ? body.calificacion : body.nota;

        if (!id_estudiante || !id_actividad || rawCalificacion === undefined || rawCalificacion === null) {
            return res.status(400).json({ 
                error: "Parámetros obligatorios faltantes: id_estudiante, id_actividad y calificacion." 
            });
        }

        // Validación y acotamiento riguroso de la escala formativa MEN Colombia (1.0 a 5.0)
        let numNota = parseFloat(rawCalificacion);
        if (isNaN(numNota)) numNota = 1.0;
        const calificacion = Number(Math.max(1.0, Math.min(5.0, numNota)).toFixed(1));

        const fecha = body.fecha || new Date().toISOString();
        const titulo_actividad = String(body.titulo_actividad || body.tema || 'Actividad STEAM').trim();
        const tipo_herramienta = String(body.tipo_herramienta || body.tipo || 'interactivo').trim();
        const materia = String(body.materia || 'Ciencias Naturales').trim();
        const grupoReq = String(body.grupo || '').trim();
        const id_docente = String(body.id_docente || body.docente_id || '').trim();
        const detalles = (typeof body.detalles === 'object' && body.detalles !== null) ? body.detalles : {};

        // Determinar escala cualitativa oficial MEN Colombia
        let desempeno = 'Bajo';
        if (calificacion >= 4.6) desempeno = 'Superior';
        else if (calificacion >= 4.0) desempeno = 'Alto';
        else if (calificacion >= 3.0) desempeno = 'Básico';
        else desempeno = 'Bajo';

        // 1. Obtener y actualizar información del estudiante en usuarios.json
        let usuarios = readJSON('usuarios.json') || [];
        const normDocEst = normalizarStr(id_estudiante);
        let estudiante = usuarios.find(u => normalizarStr(u.documento || u.id || u.usuario) === normDocEst);
        const grupoFinal = grupoReq || (estudiante ? (estudiante.grupo || estudiante.grado || '') : '');
        const nombreEstudiante = estudiante 
            ? (`${estudiante.nombre || estudiante.nombres || ''} ${estudiante.apellidos || ''}`).trim() || estudiante.documento
            : 'Estudiante';
        const instEstudiante = estudiante ? (estudiante.institucion || '') : '';

        const registroCalificacion = {
            id_estudiante,
            id_actividad,
            calificacion,
            fecha,
            nombre_estudiante: nombreEstudiante,
            grupo: grupoFinal,
            materia,
            titulo_actividad,
            tipo_herramienta,
            desempeno,
            detalles
        };

        if (estudiante) {
            if (!Array.isArray(estudiante.calificaciones)) estudiante.calificaciones = [];
            const idxCalEst = estudiante.calificaciones.findIndex(c => String(c.id_actividad).trim().toLowerCase() === id_actividad.toLowerCase());
            if (idxCalEst >= 0) {
                estudiante.calificaciones[idxCalEst] = { ...estudiante.calificaciones[idxCalEst], ...registroCalificacion };
            } else {
                estudiante.calificaciones.push(registroCalificacion);
            }
            writeJSON('usuarios.json', usuarios);
        }

        // 2. Persistir en la planilla del docente en docentes.json
        let docentes = readJSON('docentes.json') || [];
        let docentesAfectados = 0;

        // Buscar docentes coincidentes: por ID explícito, por docente_id asignado, o por grupo/grado de la misma institución
        docentes.forEach(d => {
            const docDocente = normalizarStr(d.documento || d.cedula || d.id || d.usuario);
            const instDoc = String(d.institucion || '').trim().toLowerCase();
            const esMismaIE = !instDoc || !instEstudiante || instDoc === instEstudiante.toLowerCase() || instDoc.includes('instituto') && instEstudiante.toLowerCase().includes('instituto');

            let leCorresponde = false;

            if (id_docente && docDocente === normalizarStr(id_docente)) {
                leCorresponde = true;
            } else if (estudiante && estudiante.docente_id && docDocente === normalizarStr(estudiante.docente_id)) {
                leCorresponde = true;
            } else if (esMismaIE) {
                const gruposDoc = Array.isArray(d.grupos_direccion) ? d.grupos_direccion : [];
                const otrosGrupos = Array.isArray(d.grupos) ? d.grupos.map(g => (typeof g === 'object' ? g.nombre : g)) : [];
                const todosGrupos = [...gruposDoc, ...otrosGrupos].map(g => String(g).trim().toLowerCase());
                if (grupoFinal && todosGrupos.includes(grupoFinal.toLowerCase())) {
                    leCorresponde = true;
                }
            }

            // Si es director de grupo del estudiante o docente vinculado
            if (leCorresponde) {
                if (!Array.isArray(d.planilla)) d.planilla = [];
                const idxP = d.planilla.findIndex(p => 
                    normalizarStr(p.id_estudiante) === normDocEst && 
                    String(p.id_actividad).trim().toLowerCase() === id_actividad.toLowerCase()
                );
                if (idxP >= 0) {
                    d.planilla[idxP] = { ...d.planilla[idxP], ...registroCalificacion };
                } else {
                    d.planilla.push(registroCalificacion);
                }
                docentesAfectados++;
            }
        });

        // Si ningún docente coincidió específicamente (ej: estudiante sin grupo asignado o tutor general),
        // registrar en el primer docente o director institucional para no perder el dato
        if (docentesAfectados === 0 && docentes.length > 0) {
            const docenteFallback = docentes[0];
            if (!Array.isArray(docenteFallback.planilla)) docenteFallback.planilla = [];
            const idxP = docenteFallback.planilla.findIndex(p => 
                normalizarStr(p.id_estudiante) === normDocEst && 
                String(p.id_actividad).trim().toLowerCase() === id_actividad.toLowerCase()
            );
            if (idxP >= 0) {
                docenteFallback.planilla[idxP] = { ...docenteFallback.planilla[idxP], ...registroCalificacion };
            } else {
                docenteFallback.planilla.push(registroCalificacion);
            }
            docentesAfectados++;
        }

        writeJSON('docentes.json', docentes);

        // 3. Respaldo en calificaciones_historico.json
        try {
            let historico = readJSON('calificaciones_historico.json') || [];
            if (!Array.isArray(historico)) historico = [];
            const idxHist = historico.findIndex(h => 
                normalizarStr(h.id_estudiante) === normDocEst && 
                String(h.id_actividad).trim().toLowerCase() === id_actividad.toLowerCase()
            );
            if (idxHist >= 0) {
                historico[idxHist] = { ...historico[idxHist], ...registroCalificacion };
            } else {
                historico.push(registroCalificacion);
            }
            writeJSON('calificaciones_historico.json', historico);
        } catch(e) {}

        console.log(`[CALIFICACIÓN] Persistida para estudiante ${id_estudiante} en actividad ${id_actividad}: ${calificacion} (${desempeno})`);

        return res.json({
            status: "success",
            registro: registroCalificacion,
            docentes_sincronizados: docentesAfectados,
            message: "Calificación persistida correctamente en la planilla del docente."
        });

    } catch(err) {
        console.error("[CALIFICACIÓN] Error al persistir calificación:", err);
        return res.status(500).json({ error: "Error interno al persistir calificación: " + err.message });
    }
});

// Consultar la planilla de un docente (todas o por grupo)
app.get('/api/planilla-docente', (req, res) => {
    try {
        const docenteId = String(req.query.docente_id || '').trim();
        const grupo = String(req.query.grupo || '').trim().toLowerCase();

        const docentes = readJSON('docentes.json') || [];
        let itemsPlanilla = [];

        if (docenteId) {
            const normDoc = normalizarStr(docenteId);
            const doc = docentes.find(d => normalizarStr(d.documento || d.cedula || d.id || d.usuario) === normDoc);
            if (doc && Array.isArray(doc.planilla)) {
                itemsPlanilla = doc.planilla;
            }
        } else {
            // Consolidar de todos los docentes
            docentes.forEach(d => {
                if (Array.isArray(d.planilla)) {
                    d.planilla.forEach(item => {
                        if (!itemsPlanilla.some(x => x.id_estudiante === item.id_estudiante && x.id_actividad === item.id_actividad)) {
                            itemsPlanilla.push(item);
                        }
                    });
                }
            });
        }

        if (grupo) {
            itemsPlanilla = itemsPlanilla.filter(p => String(p.grupo || '').toLowerCase() === grupo);
        }

        res.json({
            status: "success",
            total: itemsPlanilla.length,
            planilla: itemsPlanilla
        });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Consultar calificaciones de un estudiante
app.get('/api/calificaciones-estudiante', (req, res) => {
    try {
        const docEst = String(req.query.documento || req.query.id_estudiante || '').trim();
        if (!docEst) return res.status(400).json({ error: "Falta parámetro documento." });

        const usuarios = readJSON('usuarios.json') || [];
        const normDoc = normalizarStr(docEst);
        const estudiante = usuarios.find(u => normalizarStr(u.documento || u.id || u.usuario) === normDoc);

        let calificaciones = (estudiante && Array.isArray(estudiante.calificaciones)) ? estudiante.calificaciones : [];

        // Si no tiene en usuarios.json, buscar en calificaciones_historico.json
        if (calificaciones.length === 0) {
            const hist = readJSON('calificaciones_historico.json') || [];
            if (Array.isArray(hist)) {
                calificaciones = hist.filter(h => normalizarStr(h.id_estudiante) === normDoc);
            }
        }

        res.json({
            status: "success",
            documento: docEst,
            total: calificaciones.length,
            calificaciones
        });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================================
// MOTOR DE GAMIFICACIÓN HÍBRIDA: BINGO PEDAGÓGICO STEAM EN VIVO
// ============================================================================

// Memoria en caliente para partidas activas (con persistencia en bingo_partidas.json)
let partidasBingoActivas = {};
try {
    const discoBingo = readJSON('bingo_partidas.json');
    if (discoBingo && typeof discoBingo === 'object') {
        partidasBingoActivas = discoBingo;
    }
} catch(e) {}

function guardarPartidasBingoDisco() {
    try {
        writeJSON('bingo_partidas.json', partidasBingoActivas);
    } catch(e) {}
}

// 1. Crear o reiniciar partida de Bingo en Vivo
app.post('/api/bingo/crear-partida', (req, res) => {
    try {
        const body = req.body || {};
        const id_partida = String(body.id_partida || `bingo_${Date.now()}`).trim();
        const docente_id = String(body.docente_id || '').trim();
        const grupo = String(body.grupo || 'Todos').trim();
        const tema = String(body.tema || 'Conceptos Fundamentales STEAM').trim();
        const materia = String(body.materia || 'Ciencias Naturales').trim();
        const modalidad = String(body.modalidad || 'digital').trim(); // 'digital' o 'impreso'
        const patron_victoria = String(body.patron_victoria || 'linea_recta').trim(); // 'carton_lleno', 'cuatro_esquinas', 'linea_recta', 'letra_x', 'letra_l'
        const cantidad_cartones = parseInt(body.cantidad_cartones) || 30;

        let pares = Array.isArray(body.pares) ? body.pares : [];
        if (pares.length < 25) {
            while (pares.length < 25) {
                const idx = pares.length + 1;
                pares.push({
                    concepto: `Principio ${idx}`,
                    definicion: `Definición conceptual correspondiente al principio ${idx} en el marco de ${tema}.`,
                    izquierda: `Principio ${idx}`,
                    derecha: `Definición conceptual correspondiente al principio ${idx}.`
                });
            }
        }

        const nuevaPartida = {
            id_partida,
            docente_id,
            grupo,
            tema,
            materia,
            modalidad,
            patron_victoria,
            cantidad_cartones,
            pares,
            indice_actual: 0,
            definicion_actual: (pares[0] && (pares[0].definicion || pares[0].derecha)) || '',
            concepto_actual: (pares[0] && (pares[0].concepto || pares[0].izquierda)) || '',
            historial_cantadas: [],
            ganador: null,
            estado: 'en_curso',
            fecha_inicio: new Date().toISOString()
        };

        partidasBingoActivas[id_partida] = nuevaPartida;
        if (grupo) {
            partidasBingoActivas[`grupo_${grupo.toLowerCase()}`] = id_partida;
        }
        guardarPartidasBingoDisco();

        console.log(`[BINGO_STEAM] Partida creada: ID="${id_partida}", Grupo="${grupo}", Modalidad="${modalidad}", Patrón="${patron_victoria}"`);
        return res.json({ status: "success", partida: nuevaPartida });
    } catch(err) {
        console.error('[BINGO_STEAM] Error en crear-partida:', err);
        return res.status(500).json({ error: err.message });
    }
});

// 2. Consultar el estado en tiempo real de una partida
app.get('/api/bingo/estado-partida', (req, res) => {
    try {
        const id_partida = String(req.query.id_partida || '').trim();
        const grupo = String(req.query.grupo || '').trim().toLowerCase();

        let partida = null;
        if (id_partida && partidasBingoActivas[id_partida]) {
            partida = partidasBingoActivas[id_partida];
        } else if (grupo && partidasBingoActivas[`grupo_${grupo}`]) {
            const idRef = partidasBingoActivas[`grupo_${grupo}`];
            partida = partidasBingoActivas[idRef];
        } else {
            const keys = Object.keys(partidasBingoActivas).filter(k => !k.startsWith('grupo_'));
            if (keys.length > 0) {
                partida = partidasBingoActivas[keys[keys.length - 1]];
            }
        }

        if (!partida) {
            return res.status(404).json({ error: "No hay ninguna partida de Bingo activa en este momento." });
        }

        return res.json({
            status: "success",
            id_partida: partida.id_partida,
            tema: partida.tema,
            materia: partida.materia,
            grupo: partida.grupo,
            modalidad: partida.modalidad,
            patron_victoria: partida.patron_victoria,
            indice_actual: partida.indice_actual,
            total_balotas: partida.pares.length,
            definicion_actual: partida.definicion_actual,
            concepto_actual: req.query.es_docente === 'true' ? partida.concepto_actual : undefined,
            historial_cantadas: partida.historial_cantadas,
            ganador: partida.ganador,
            estado: partida.estado
        });
    } catch(err) {
        return res.status(500).json({ error: err.message });
    }
});

// 3. Botón Maestro de Avance: Cantar siguiente definición (Solo docente)
app.post('/api/bingo/siguiente-definicion', (req, res) => {
    try {
        const id_partida = String(req.body.id_partida || '').trim();
        let partida = partidasBingoActivas[id_partida];
        if (!partida) {
            const keys = Object.keys(partidasBingoActivas).filter(k => !k.startsWith('grupo_'));
            if (keys.length > 0) partida = partidasBingoActivas[keys[keys.length - 1]];
        }

        if (!partida) return res.status(404).json({ error: "Partida no encontrada." });
        if (partida.estado === 'finalizada') {
            return res.json({ status: "finalizada", mensaje: "La partida ya ha culminado.", partida });
        }

        if (partida.concepto_actual && !partida.historial_cantadas.some(h => h.concepto === partida.concepto_actual)) {
            partida.historial_cantadas.push({
                concepto: partida.concepto_actual,
                definicion: partida.definicion_actual,
                numero: partida.indice_actual + 1,
                hora: new Date().toLocaleTimeString('es-CO')
            });
        }

        const siguienteIdx = partida.indice_actual + 1;
        if (siguienteIdx >= partida.pares.length) {
            partida.estado = 'finalizada';
            guardarPartidasBingoDisco();
            return res.json({
                status: "agotadas",
                mensaje: "Se han cantado todas las 25 definiciones disponibles.",
                historial_cantadas: partida.historial_cantadas,
                partida
            });
        }

        partida.indice_actual = siguienteIdx;
        const parSiguiente = partida.pares[siguienteIdx];
        partida.concepto_actual = parSiguiente.concepto || parSiguiente.izquierda;
        partida.definicion_actual = parSiguiente.definicion || parSiguiente.derecha;

        guardarPartidasBingoDisco();

        return res.json({
            status: "success",
            indice_actual: partida.indice_actual,
            total_balotas: partida.pares.length,
            definicion_actual: partida.definicion_actual,
            concepto_actual: partida.concepto_actual,
            historial_cantadas: partida.historial_cantadas
        });
    } catch(err) {
        return res.status(500).json({ error: err.message });
    }
});

// 4. Cantar Victoria: BINGO STEAM (Estudiante digital o confirmación manual docente)
app.post('/api/bingo/cantar-victoria', (req, res) => {
    try {
        const body = req.body || {};
        const id_partida = String(body.id_partida || '').trim();
        const id_estudiante = String(body.id_estudiante || 'estudiante_ganador').trim();
        const nombre_estudiante = String(body.nombre_estudiante || 'Estudiante STEAM').trim();
        const grupo = String(body.grupo || '').trim();

        let partida = partidasBingoActivas[id_partida];
        if (!partida) {
            const keys = Object.keys(partidasBingoActivas).filter(k => !k.startsWith('grupo_'));
            if (keys.length > 0) partida = partidasBingoActivas[keys[keys.length - 1]];
        }

        const ganadorInfo = {
            id_estudiante,
            nombre: nombre_estudiante,
            grupo: grupo || (partida ? partida.grupo : ''),
            fecha: new Date().toISOString(),
            calificacion: 5.0,
            xp_ganado: 500,
            patron: (partida && partida.patron_victoria) || 'BINGO STEAM'
        };

        if (partida) {
            partida.ganador = ganadorInfo;
            partida.estado = 'finalizada';
            guardarPartidasBingoDisco();
        }

        // Persistir automáticamente la calificación 5.0 y XP en la planilla del docente
        try {
            const fechaActual = new Date().toISOString();
            const docRegCal = {
                id_estudiante,
                id_actividad: (partida && partida.id_partida) ? partida.id_partida : `bingo_${Date.now()}`,
                calificacion: 5.0,
                fecha: fechaActual,
                nombre_estudiante,
                grupo: ganadorInfo.grupo,
                materia: (partida && partida.materia) || 'Ciencias Naturales',
                titulo_actividad: `Gran Bingo Pedagógico STEAM: ${(partida && partida.tema) || 'STEAM'} (¡GANADOR!)`,
                tipo_herramienta: 'bingo_steam',
                desempeno: 'Superior',
                detalles: {
                    premio: '¡Ganador Oficial BINGO STEAM!',
                    xp_otorgado: 500,
                    patron: ganadorInfo.patron
                }
            };

            let docs = readJSON('docentes.json') || [];
            docs.forEach(d => {
                if (!Array.isArray(d.planilla)) d.planilla = [];
                const idxP = d.planilla.findIndex(p => p.id_estudiante === id_estudiante && p.id_actividad === docRegCal.id_actividad);
                if (idxP >= 0) d.planilla[idxP] = { ...d.planilla[idxP], ...docRegCal };
                else d.planilla.push(docRegCal);
            });
            writeJSON('docentes.json', docs);

            let usrs = readJSON('usuarios.json') || [];
            const est = usrs.find(u => normalizarStr(u.documento || u.id || u.usuario) === normalizarStr(id_estudiante));
            if (est) {
                if (!Array.isArray(est.calificaciones)) est.calificaciones = [];
                est.calificaciones.push(docRegCal);
                est.xp = (parseInt(est.xp) || 0) + 500;
                writeJSON('usuarios.json', usrs);
            }
        } catch(eCal) {
            console.warn('[BINGO_STEAM] Advertencia al registrar nota ganador:', eCal.message);
        }

        console.log(`[BINGO_STEAM] 🏆 ¡VICTORIA DECLARADA! Ganador: ${nombre_estudiante} (${id_estudiante}), Nota: 5.0, +500 XP`);

        return res.json({
            status: "success",
            mensaje: "¡BINGO STEAM verificado exitosamente!",
            ganador: ganadorInfo
        });
    } catch(err) {
        return res.status(500).json({ error: err.message });
    }
});

// 5. Evaluar a un estudiante por precisión (aciertos vs fallos)
app.post('/api/bingo/evaluar-estudiante', (req, res) => {
    try {
        const body = req.body || {};
        const id_estudiante = String(body.id_estudiante || '').trim();
        const id_partida = String(body.id_partida || '').trim();
        const aciertos = parseInt(body.aciertos) || 0;
        const errores = parseInt(body.errores) || 0;
        const total = Math.max(1, aciertos + errores);

        if (!id_estudiante) return res.status(400).json({ error: "Falta id_estudiante" });

        let nota = 1.0 + (aciertos / total) * 4.0;
        nota = Number(Math.max(1.0, Math.min(5.0, nota)).toFixed(1));

        let desempeno = 'Bajo';
        if (nota >= 4.6) desempeno = 'Superior';
        else if (nota >= 4.0) desempeno = 'Alto';
        else if (nota >= 3.0) desempeno = 'Básico';

        return res.json({
            status: "success",
            id_estudiante,
            calificacion: nota,
            desempeno,
            aciertos,
            errores
        });
    } catch(err) {
        return res.status(500).json({ error: err.message });
    }
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
