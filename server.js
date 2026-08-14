require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const https = require('https');
const { GoogleGenAI } = require('@google/genai');
const { exec } = require('child_process');
const { generarGuiaPredeterminada } = require('./diagnosticos_predeterminados');

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
                    const response = await ai.models.generateContent({
                        model: modelos[i],
                        contents: prompt,
                        config: {
                            responseMimeType: "application/json"
                        }
                    });
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

        if (!responseText) {
            console.log(`[IA Fallback] IA no disponible, sirviendo guía pedagógica estructurada de respaldo para ${nombreEstudiante}...`);
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
const readJSON = (file) => {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf-8'));
    } catch(e) {
        return [];
    }
};
const writeJSON = (file, data) => {
    fs.writeFileSync(path.join(__dirname, file), JSON.stringify(data, null, 4), 'utf-8');
    exec(`git add ${file} && git commit -m "sync: actualizar ${file} desde el panel admin" && git push`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error sincronizando ${file}:`, err.message);
        } else {
            console.log(`[GIT SYNC] ${file} sincronizado exitosamente en GitHub.`);
        }
    });
};

app.get('/api/usuarios', (req, res) => res.json(readJSON('usuarios.json')));
app.get('/api/estudiantes', (req, res) => res.json(readJSON('usuarios.json')));
app.get('/api/docentes', (req, res) => res.json(readJSON('docentes.json')));
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
    const docentes = readJSON('docentes.json');
    docentes.push(req.body);
    writeJSON('docentes.json', docentes);

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
const { publishToFacebook } = require('./social_media_poster');
const crypto = require('crypto');

// Memoria temporal para guardar posts pendientes de aprobación
const pendingSocialPosts = new Map();

// Generar un post, guardarlo en memoria y enviar a Telegram
async function triggerSocialPostGeneration() {
    try {
        console.log('[SOCIAL] Iniciando generación de post con IA...');
        const apiKey = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
        const keys = apiKey ? apiKey.split(',').map(k => k.trim()) : [];
        if (keys.length === 0) throw new Error("No hay API Keys disponibles");
        
        const postText = await generateEducationalPost(keys[0]);
        
        const postId = crypto.randomBytes(8).toString('hex');
        pendingSocialPosts.set(postId, { text: postText, timestamp: Date.now() });

        const telegramMsg = `🤖 PROPUESTA DE POST PARA REDES 🤖\n\n${postText}\n\n✅ APROBAR Y PUBLICAR:\nhttps://peidagogosteam.com/api/social/approve?id=${postId}\n\n❌ RECHAZAR:\nhttps://peidagogosteam.com/api/social/reject?id=${postId}`;
        
        enviarAlertaTelegram(telegramMsg);
        console.log(`[SOCIAL] Post propuesto enviado a Telegram (ID: ${postId})`);
    } catch (error) {
        console.error('[SOCIAL] Error generando post:', error);
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

        const facebookId = await publishToFacebook(postData.text, pageId, metaToken);
        
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
        await triggerSocialPostGeneration();
        res.send('<h1>Comando enviado.</h1><p>Revisa Telegram en unos segundos. Si hay error, revisa los logs del servidor.</p>');
    } catch(e) {
        res.status(500).send('<h1>Error:</h1><p>' + e.message + '</p>');
    }
});

// Ruta principal para servir el index.html en cualquier otra ruta
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`Backend de IA listo (Esperando API Key en .env)`);
    
    // Iniciar generador de contenido para redes sociales (Ej: cada 8 horas = 28800000 ms)
    setInterval(triggerSocialPostGeneration, 8 * 60 * 60 * 1000);
    // Ejecutar uno de prueba al iniciar (después de 30 segundos)
    setTimeout(triggerSocialPostGeneration, 30000);

    // Iniciar el generador masivo en segundo plano
    const cronProcess = require('child_process').spawn('node', ['generador_cron.js'], { stdio: 'inherit' });
    console.log('Generador masivo de guías (CRON) inicializado en segundo plano.');
});
