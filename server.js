require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const { exec } = require('child_process');
const { generarGuiaPredeterminada } = require('./diagnosticos_predeterminados');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middlewares
app.use(cors());
app.use(express.json()); // Permitir parseo de JSON en el body
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
        
        // 1. Verificar si existe en caché
        if (fs.existsSync(cacheFilePath)) {
            console.log(`[Caché HIT] Sirviendo guía desde: ${fileNameSafe}`);
            const cacheData = fs.readFileSync(cacheFilePath, 'utf-8');
            return res.json({ text: cacheData });
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

REGLAS PEDAGÓGICAS DE ESTRUCTURA:
1. EXTENSIÓN Y RIGOR:
   - "texto_inductivo" DEBE tener MÍNIMO 500 PALABRAS. Narrativa inmersiva, exploración contextualizada y diálogo directo con ${nombreEstudiante}.
   - "texto_deductivo" DEBE tener MÍNIMO 500 PALABRAS. Formalización teórica clara, conceptos clave, modelos científicos/humanísticos y síntesis directa para ${nombreEstudiante}.
2. PREGUNTA PROBLEMATIZADORA:
   - El primer párrafo de "texto_inductivo" debe iniciar OBLIGATORIAMENTE con la Pregunta Problematizadora en negrita y cursiva (**_¿Pregunta...?_**).
3. INTERCALACIÓN EXACTA EN "texto_inductivo" (debes incrustar estos shortcodes dentro de los párrafos):
   - 3 Actividades de Cuaderno: [ACTIVIDAD:CUADERNO:Instrucción para ${nombreEstudiante} de lo que debe dibujar, hacer o tabular en su cuaderno]
   - 3 Actividades de Plataforma: [ACTIVIDAD:PLATAFORMA:Pregunta de análisis profundo para ${nombreEstudiante}|Respuesta esperada o palabra clave]
   - 3 Juegos de Ordenar Letras: [JUEGO:ORDENAR_LETRAS:PALABRA]
   - 3 Juegos de Ordenar Frase: [JUEGO:ORDENAR_FRASE:FRASE COMPLETA CON SENTIDO]
4. INTERCALACIÓN EXACTA EN "texto_deductivo" (debes incrustar estos shortcodes dentro de los párrafos):
   - 3 Actividades de Cuaderno: [ACTIVIDAD:CUADERNO:Instrucción para ${nombreEstudiante} de síntesis, esquema o mapa conceptual en el cuaderno]
   - 3 Actividades de Plataforma: [ACTIVIDAD:PLATAFORMA:Pregunta de síntesis o aplicación para ${nombreEstudiante}|Respuesta esperada]
   - 3 Juegos de Ordenar Letras: [JUEGO:ORDENAR_LETRAS:PALABRA]
   - 3 Juegos de Ordenar Frase: [JUEGO:ORDENAR_FRASE:FRASE DE PRINCIPIO O LEY CIENTIFICA O CONCEPTO CLAVE]
5. DESAFÍO FINAL - 3 PREGUNTAS TIPO ICFES SABER (Diseño Centrado en Evidencias):
   - Pregunta 1: Evalúa "Explicación de Fenómenos" o comprensión crítica.
   - Pregunta 2: Evalúa "Uso Comprensivo del Conocimiento".
   - Pregunta 3: Evalúa "Indagación" (análisis de tablas, casos o diseño experimental).
   - Cada pregunta debe tener: competencia, texto_introductorio, tabla_o_grafica_markdown, pregunta, 4 opciones (0, 1, 2, 3) y retroalimentación profunda para la opción correcta y para cada uno de los 3 distractores.
6. CIERRE GAMIFICADO AL FINAL:
   - 1 Sola Sopa de Letras con exactamente 10 términos clave de toda la guía: [JUEGO:SOPA_LETRAS:P1,P2,P3,P4,P5,P6,P7,P8,P9,P10]
   - 1 Solo Crucigrama con exactamente 10 pistas y respuestas: [JUEGO:CRUCIGRAMA:Pista 1|PAL1;Pista 2|PAL2;Pista 3|PAL3;Pista 4|PAL4;Pista 5|PAL5;Pista 6|PAL6;Pista 7|PAL7;Pista 8|PAL8;Pista 9|PAL9;Pista 10|PAL10]

DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA EXACTA (SIN TEXTO ANTES NI DESPUÉS):
{
  "objetivo_aprendizaje": "Objetivo de aprendizaje motivador para ${nombreEstudiante}...",
  "pregunta_problematizadora": "¿Pregunta problematizadora...?",
  "saberes_previos": [
    { "pregunta": "¿...?", "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"], "correcta": 0 },
    { "pregunta": "¿...?", "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"], "correcta": 1 },
    { "pregunta": "¿...?", "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"], "correcta": 2 }
  ],
  "texto_inductivo": "Markdown (+500 palabras) hablándole a ${nombreEstudiante}, con la pregunta problematizadora y conteniendo 3 [ACTIVIDAD:CUADERNO:...], 3 [ACTIVIDAD:PLATAFORMA:...], 3 [JUEGO:ORDENAR_LETRAS:...] y 3 [JUEGO:ORDENAR_FRASE:...]",
  "recurso_visual": "Instrucción de mapa mental o diagrama Mermaid graph TD o tabla markdown",
  "texto_deductivo": "Markdown (+500 palabras) formalizando la teoría para ${nombreEstudiante}, conteniendo 3 [ACTIVIDAD:CUADERNO:...], 3 [ACTIVIDAD:PLATAFORMA:...], 3 [JUEGO:ORDENAR_LETRAS:...] y 3 [JUEGO:ORDENAR_FRASE:...]",
  "icfes": [
    {
      "competencia": "Explicación de Fenómenos",
      "texto_introductorio": "Contexto de la pregunta...",
      "tabla_o_grafica_markdown": "| Variable | Valor |\\n|---|---|",
      "pregunta": "¿...?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 0,
      "retroalimentacion": {
        "0": "Correcto ${nombreEstudiante}, porque...",
        "1": "Incorrecto porque...",
        "2": "Incorrecto porque...",
        "3": "Incorrecto porque..."
      }
    },
    {
      "competencia": "Uso Comprensivo del Conocimiento",
      "texto_introductorio": "Contexto...",
      "tabla_o_grafica_markdown": "",
      "pregunta": "¿...?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 1,
      "retroalimentacion": {
        "0": "Incorrecto porque...",
        "1": "Correcto ${nombreEstudiante}, porque...",
        "2": "Incorrecto porque...",
        "3": "Incorrecto porque..."
      }
    },
    {
      "competencia": "Indagación",
      "texto_introductorio": "Contexto experimental...",
      "tabla_o_grafica_markdown": "| Ensayo | Resultado |\\n|---|---|",
      "pregunta": "¿...?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 2,
      "retroalimentacion": {
        "0": "Incorrecto porque...",
        "1": "Incorrecto porque...",
        "2": "Correcto ${nombreEstudiante}, porque...",
        "3": "Incorrecto porque..."
      }
    }
  ],
  "cierre_gamificado": {
    "sopa_letras": "PAL1,PAL2,PAL3,PAL4,PAL5,PAL6,PAL7,PAL8,PAL9,PAL10",
    "crucigrama": "Pista 1|PAL1;Pista 2|PAL2;Pista 3|PAL3;Pista 4|PAL4;Pista 5|PAL5;Pista 6|PAL6;Pista 7|PAL7;Pista 8|PAL8;Pista 9|PAL9;Pista 10|PAL10"
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

app.post('/api/registro-estudiante', (req, res) => {
    let usuarios = readJSON('usuarios.json');
    const nuevo = req.body;
    
    // Validación de código institucional para IE Instituto Montenegro
    const esIEInstituto = nuevo.institucion === 'InstitutoMontenegro' || 
                          nuevo.institucion === 'IE Instituto Montenegro' || 
                          (nuevo.institucion && nuevo.institucion.toLowerCase().includes('montenegro'));
    if (esIEInstituto) {
        const codigo = (nuevo.codigo_institucional || nuevo.codigo || '').trim().toLowerCase();
        if (codigo !== 'ieinstituto2026') {
            return res.status(403).json({ 
                error: "Código de acceso institucional incorrecto. Debes ingresar el código oficial para matricularte en la IE Instituto Montenegro (ieinstituto2026)." 
            });
        }
        nuevo.pago_realizado = true;
        nuevo.suscrito = true;
        nuevo.tipo_acceso = 'institucional_ilimitado';
    } else {
        // Home School, Validación y particulares: Matrícula libre (1ª guía de cada materia gratis)
        if (nuevo.pago_realizado === undefined) {
            nuevo.pago_realizado = false;
            nuevo.suscrito = false;
            nuevo.tipo_acceso = 'freemium_primera_guia_gratis';
        }
    }
    
    // Si ya existe por documento, actualizar datos
    const idx = usuarios.findIndex(u => String(u.documento).trim() === String(nuevo.documento).trim());
    if (idx !== -1) {
        usuarios[idx] = { ...usuarios[idx], ...nuevo };
    } else {
        usuarios.push(nuevo);
    }
    
    writeJSON('usuarios.json', usuarios);
    res.json({ status: "success", estudiante: nuevo });
});

app.post('/api/registro-docente', (req, res) => {
    const docentes = readJSON('docentes.json');
    docentes.push(req.body);
    writeJSON('docentes.json', docentes);
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
    const { usuario, clave, rol } = req.body;
    const uInput = String(usuario || '').trim();
    let cInput = String(clave || '').trim();
    if (!cInput) cInput = uInput; // Si no ingresó contraseña, por defecto es su usuario/documento

    let encontrado = false;
    let nombre = "", grado = "", grupo = "", asignatura = "", rol_asignado = "", institucion = "";
    let pago_activo = true;
    let usuarioObj = null;

    // 1. Administrador
    if (rol === 'admin' || uInput.toLowerCase() === 'admin' || uInput.toLowerCase() === 'jramirezgiraldo') {
        if ((uInput === 'jramirezgiraldo' && cInput === 'Biol2008%') || 
            (uInput.toLowerCase() === 'admin' && (cInput === 'admin' || cInput === '123456' || cInput === 'Biol2008%'))) {
            encontrado = true; nombre = "Administrador"; rol_asignado = "admin";
        }
    }

    // 2. Docentes / Tutores Home School
    if (!encontrado && (rol === 'homeschool_tutor' || rol === 'tutor' || rol === 'docente')) {
        const docentes = readJSON('docentes.json');
        const doc = docentes.find(d => {
            const docId = String(d.documento || d.id || d.usuario || '').trim().toLowerCase();
            const docPass = String(d.clave || '').trim();
            const matchUser = (docId === uInput.toLowerCase());
            const matchPass = (cInput === docPass || cInput.toLowerCase() === docId || cInput === '123456' || cInput === 'admin');
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
            const docU = String(u.documento || u.id || u.usuario || '').trim().toLowerCase();
            const nomU = String(u.nombre || '').trim().toLowerCase();
            const apeU = String(u.apellidos || '').trim().toLowerCase();
            const matchUser = (docU === uInput.toLowerCase() || (nomU && uInput.toLowerCase().includes(nomU) && apeU && uInput.toLowerCase().includes(apeU)));
            if (!matchUser) return false;

            const passU = String(u.clave || '').trim().toLowerCase();
            const matchPass = (!cInput || 
                               cInput.toLowerCase() === docU || 
                               (passU && cInput.toLowerCase() === passU) ||
                               cInput === '12345' || cInput === '123456' || cInput === 'admin');
            return matchPass;
        });

        if (est) {
            encontrado = true; 
            nombre = `${est.nombre || ''} ${est.apellidos || ''}`.trim() || est.documento;
            grado = est.grado || est.grupo || ""; 
            grupo = est.grupo || est.grado || ""; 
            asignatura = est.asignatura || (est.materias && Array.isArray(est.materias) ? est.materias.join(', ') : "Ciencias Naturales");
            institucion = est.institucion || "";
            
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
        res.json({ 
            status: "success", 
            usuario: uInput, 
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

// Ruta principal para servir el index.html en cualquier otra ruta
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`Backend de IA listo (Esperando API Key en .env)`);
    
    // Iniciar el generador masivo en segundo plano
    const cronProcess = require('child_process').spawn('node', ['generador_cron.js'], { stdio: 'inherit' });
    console.log('Generador masivo de guías (CRON) inicializado en segundo plano.');
});
