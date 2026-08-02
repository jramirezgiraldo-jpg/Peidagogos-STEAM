require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const { exec } = require('child_process');

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

// Endpoint para generar la guía
app.post('/api/generate-guide', async (req, res) => {
    try {
        const {
            asignatura,
            periodo,
            semana,
            meta,
            topico,
            rol,
            ambiente,
            nivel,
            enfoque
        } = req.body;

        // Validar si la IA está lista
        if (apiKeys.length === 0) {
            return res.status(500).json({ 
                error: "El motor de IA no está configurado todavía. Faltan las llaves en GEMINI_API_KEYS." 
            });
        }

        // --- CACHE LOGIC ---
        const cacheDir = path.join(__dirname, 'guias_cache');
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        // Generar un nombre de archivo seguro basado en los parámetros
        const fileNameSafe = [asignatura, periodo, semana, rol, ambiente, nivel, enfoque]
            .map(s => s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '_') : 'na')
            .join('_') + '.json';
            
        const cacheFilePath = path.join(cacheDir, fileNameSafe);
        
        // Verificar si existe en caché
        if (fs.existsSync(cacheFilePath)) {
            console.log(`[Caché HIT] Sirviendo guía desde: ${fileNameSafe}`);
            const cacheData = fs.readFileSync(cacheFilePath, 'utf-8');
            return res.json({ text: cacheData });
        }
        
        console.log(`[Caché MISS] Generando nueva guía: ${fileNameSafe}`);
        // --- END CACHE LOGIC ---

        // Construir el Prompt Maestro alineado con Saber 11 y Pedagogía STEAM V11
        const prompt = `Actúa como un ${rol}. Tu objetivo pedagógico es enseñar ${asignatura} (Grado ${grado}) a estudiantes en el contexto narrativo inmersivo de ${ambiente}.
Nivel de dificultad: ${nivel}. Competencia focal: ${enfoque}.

Contexto Curricular:
- Periodo: ${periodo}
- Semana: ${semana}
- Meta de Comprensión Anual: ${meta}

REGLAS PEDAGÓGICAS ESTRICTAS:
1. EXTENSIÓN Y RIGOR:
   - "texto_inductivo" DEBE tener MÍNIMO 500 PALABRAS. Narrativa de exploración profunda y contextualizada.
   - "texto_deductivo" DEBE tener MÍNIMO 500 PALABRAS. Formalización teórica, leyes, modelos matemáticos/científicos y síntesis.
2. PREGUNTA PROBLEMATIZADORA:
   - El primer párrafo de "texto_inductivo" debe iniciar OBLIGATORIAMENTE con la Pregunta Problematizadora en negrita y cursiva (**_¿Pregunta...?_**).
3. INTERCALACIÓN EXACTA EN "texto_inductivo" (debes incrustar estos shortcodes dentro de los párrafos):
   - 3 Actividades de Cuaderno: [ACTIVIDAD:CUADERNO:Instrucción de lo que debe dibujar, hacer o tabular en el cuaderno]
   - 3 Actividades de Plataforma: [ACTIVIDAD:PLATAFORMA:Pregunta de análisis profundo|Respuesta esperada o palabra clave]
   - 3 Juegos de Ordenar Letras: [JUEGO:ORDENAR_LETRAS:PALABRA]
   - 3 Juegos de Ordenar Frase: [JUEGO:ORDENAR_FRASE:FRASE COMPLETA CON SENTIDO]
4. INTERCALACIÓN EXACTA EN "texto_deductivo" (debes incrustar estos shortcodes dentro de los párrafos):
   - 3 Actividades de Cuaderno: [ACTIVIDAD:CUADERNO:Instrucción de síntesis, esquema o mapa conceptual en el cuaderno]
   - 3 Actividades de Plataforma: [ACTIVIDAD:PLATAFORMA:Pregunta de síntesis o aplicación|Respuesta esperada]
   - 3 Juegos de Ordenar Letras: [JUEGO:ORDENAR_LETRAS:PALABRA]
   - 3 Juegos de Ordenar Frase: [JUEGO:ORDENAR_FRASE:FRASE DE PRINCIPIO O LEY CIENTIFICA]
5. DESAFÍO FINAL - 3 PREGUNTAS TIPO ICFES SABER 11 (Diseño Centrado en Evidencias):
   - Pregunta 1: Evalúa "Explicación de Fenómenos".
   - Pregunta 2: Evalúa "Uso Comprensivo del Conocimiento Científico".
   - Pregunta 3: Evalúa "Indagación" (análisis de datos, gráficas o diseño experimental).
   - Cada pregunta debe tener: competencia, texto_introductorio, tabla_o_grafica_markdown, pregunta, 4 opciones (0, 1, 2, 3) y retroalimentación detallada explicando la opción correcta y por qué cada uno de los 3 distractores es falso.
6. CIERRE GAMIFICADO AL FINAL:
   - 1 Sola Sopa de Letras con exactamente 10 términos clave de toda la guía: [JUEGO:SOPA_LETRAS:P1,P2,P3,P4,P5,P6,P7,P8,P9,P10]
   - 1 Solo Crucigrama con exactamente 10 pistas y respuestas: [JUEGO:CRUCIGRAMA:Pista 1|PAL1;Pista 2|PAL2;Pista 3|PAL3;Pista 4|PAL4;Pista 5|PAL5;Pista 6|PAL6;Pista 7|PAL7;Pista 8|PAL8;Pista 9|PAL9;Pista 10|PAL10]

DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA EXACTA:
{
  "objetivo_aprendizaje": "Objetivo de aprendizaje de la semana...",
  "pregunta_problematizadora": "¿Pregunta problematizadora...?",
  "saberes_previos": [
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 0 },
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 1 },
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 2 }
  ],
  "texto_inductivo": "Markdown (+500 palabras) con la pregunta problematizadora y conteniendo 3 [ACTIVIDAD:CUADERNO:...], 3 [ACTIVIDAD:PLATAFORMA:...], 3 [JUEGO:ORDENAR_LETRAS:...] y 3 [JUEGO:ORDENAR_FRASE:...]",
  "recurso_visual": "Instrucción de mapa mental o tabla con diagrama Mermaid graph TD o tabla markdown",
  "texto_deductivo": "Markdown (+500 palabras) con teoría formal y conteniendo 3 [ACTIVIDAD:CUADERNO:...], 3 [ACTIVIDAD:PLATAFORMA:...], 3 [JUEGO:ORDENAR_LETRAS:...] y 3 [JUEGO:ORDENAR_FRASE:...]",
  "icfes": [
    {
      "competencia": "Explicación de Fenómenos",
      "texto_introductorio": "Contexto de la pregunta...",
      "tabla_o_grafica_markdown": "| Variable | Valor |\\n|---|---|",
      "pregunta": "¿...?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 0,
      "retroalimentacion": {
        "0": "Correcto porque...",
        "1": "Incorrecto porque...",
        "2": "Incorrecto porque...",
        "3": "Incorrecto porque..."
      }
    },
    {
      "competencia": "Uso Comprensivo del Conocimiento Científico",
      "texto_introductorio": "Contexto...",
      "tabla_o_grafica_markdown": "",
      "pregunta": "¿...?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correcta": 1,
      "retroalimentacion": {
        "0": "Incorrecto porque...",
        "1": "Correcto porque...",
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
        "2": "Correcto porque...",
        "3": "Incorrecto porque..."
      }
    }
  ],
  "cierre_gamificado": {
    "sopa_letras": "PAL1,PAL2,PAL3,PAL4,PAL5,PAL6,PAL7,PAL8,PAL9,PAL10",
    "crucigrama": "Pista 1|PAL1;Pista 2|PAL2;Pista 3|PAL3;Pista 4|PAL4;Pista 5|PAL5;Pista 6|PAL6;Pista 7|PAL7;Pista 8|PAL8;Pista 9|PAL9;Pista 10|PAL10"
  }
}`;
        // Modelos Flash ultra-rápidos y económicos para Free Tier
        const modelos = ['gemini-flash-latest', 'gemini-2.0-flash', 'gemini-flash-lite-latest'];
        let responseText = "";
        let finalError = null;

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
                break; // Si tiene éxito, salir del bucle
            } catch (err) {
                console.error(`Fallo con el modelo ${modelos[i]}:`, err.message);
                finalError = err;
                // Si es un error 400, probablemente el prompt está mal
                if (err.status === 400) break;
                // Esperar 1 segundo antes de probar el siguiente modelo
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        if (!responseText) {
            let mensajeFront = "El motor de IA falló después de varios intentos.";
            if (finalError && (finalError.status === 403 || (finalError.message && finalError.message.includes("leaked")))) {
                mensajeFront = "Tu API Key de Gemini fue bloqueada por Google por seguridad (Leaked Key). Por favor crea una nueva API Key en Google AI Studio y pégala en las variables de entorno de Render.";
            } else if (finalError && finalError.status === 503) {
                mensajeFront = "El cerebro de IA está muy saturado en este momento (alta demanda global). Inténtalo en un par de minutos.";
            } else if (finalError && finalError.status === 429) {
                mensajeFront = "Te has quedado sin cuota de peticiones en tu API Key de Gemini (Límite alcanzado).";
            } else if (finalError && finalError.status === 404) {
                mensajeFront = "El modelo de IA solicitado no fue encontrado.";
            } else if (finalError && finalError.message) {
                mensajeFront = `Error de Google IA: ${finalError.message}`;
            }
            return res.status(500).json({ error: mensajeFront });
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
    const usuarios = readJSON('usuarios.json');
    usuarios.push(req.body);
    writeJSON('usuarios.json', usuarios);
    res.json({status: "success"});
});

app.post('/api/registro-docente', (req, res) => {
    const docentes = readJSON('docentes.json');
    docentes.push(req.body);
    writeJSON('docentes.json', docentes);
    res.json({status: "success"});
});

app.post('/api/eliminar-estudiante', (req, res) => {
    let usuarios = readJSON('usuarios.json');
    usuarios = usuarios.filter(u => u.documento !== req.body.documento);
    writeJSON('usuarios.json', usuarios);
    res.json({status: "success"});
});

app.post('/api/asignaturas', (req, res) => {
    const asignaturas = readJSON('asignaturas.json');
    asignaturas.push(req.body);
    writeJSON('asignaturas.json', asignaturas);
    res.json({status: "success"});
});

app.post('/api/login', (req, res) => {
    const { usuario, clave, rol } = req.body;
    let encontrado = false;
    let nombre = "", grado = "", grupo = "", asignatura = "", rol_asignado = "";

    if (rol === 'admin') {
        if ((usuario === 'jramirezgiraldo' && clave === 'Biol2008%') || (usuario === 'admin' && clave === 'admin')) {
            encontrado = true; nombre = "Administrador"; rol_asignado = "admin";
        }
    } else if (rol === 'docente') {
        const docentes = readJSON('docentes.json');
        const doc = docentes.find(d => String(d.documento).trim() === String(usuario).trim() && String(d.clave).trim() === String(clave).trim());
        if (doc) {
            encontrado = true; nombre = `${doc.nombre} ${doc.apellidos}`; rol_asignado = "docente";
        }
    } else {
        const usuarios = readJSON('usuarios.json');
        const est = usuarios.find(u => String(u.documento).trim() === String(usuario).trim() && String(u.documento).trim() === String(clave).trim());
        if (est) {
            encontrado = true; nombre = `${est.nombre} ${est.apellidos}`;
            grado = est.grado || ""; grupo = est.grupo || ""; asignatura = est.asignatura || "";
            rol_asignado = "estudiante";
        }
    }

    if (encontrado) {
        res.json({ status: "success", usuario, nombre, rol: rol_asignado, grado, grupo, asignatura });
    } else {
        res.status(401).json({ status: "error", message: "Credenciales invalidas" });
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
