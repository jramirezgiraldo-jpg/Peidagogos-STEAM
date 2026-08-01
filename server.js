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

        // Construir el Prompt Maestro
        const prompt = `Actúa como un ${rol}. Tu objetivo es enseñar ${asignatura} a estudiantes de educación media en el contexto narrativo de ${ambiente}.
Debes estructurar la guía de estudio siguiendo el nivel evolutivo de ${nivel}.
La guía debe evaluar la competencia de ${enfoque}.

Contexto Curricular:
- Periodo: ${periodo}
- Semana: ${semana}
- Meta de Comprensión Anual: ${meta}
- 5 juegos de sopa de letras. Etiqueta: [JUEGO:SOPA_LETRAS:PALABRA1,PALABRA2,PALABRA3] (mínimo 3, máximo 6 palabras por sopa)
- 5 juegos de crucigrama. Etiqueta: [JUEGO:CRUCIGRAMA:Pista 1|RESPUESTA1;Pista 2|RESPUESTA2] (mínimo 2, máximo 4 pistas por crucigrama)

- 4 actividades para el cuaderno (dibujos, mapas mentales, cuadros comparativos). Etiqueta: [ACTIVIDAD:CUADERNO:Instrucción de lo que debe hacer en el cuaderno]
  - REGLA ESTRICTA DE DIBUJO: Cada vez que pidas al estudiante que dibuje un esquema o mapa mental en su cuaderno, DEBES acompañar la instrucción de un bloque de código Markdown tipo 'mermaid' con un diagrama de bloques ('graph TD') o mapa que estructure las partes que deben dibujar.
  - REGLA ESTRICTA DE MÚSICA/ARTES: Si el tema involucra música (notas, escalas, partituras), DEBES usar notación ABC dentro de un bloque Markdown tipo 'abc' para que la plataforma dibuje el pentagrama automáticamente.

Ejemplo de cómo redactar un párrafo con juegos y actividades intercaladas:
"El sol es la estrella principal de nuestro sistema solar. [JUEGO:ORDENAR_LETRAS:ESTRELLA] Su gravedad mantiene a los planetas en órbita. [ACTIVIDAD:PLATAFORMA:¿Cuál es la función de la gravedad del sol?|Mantener los planetas en órbita] En tu cuaderno, [ACTIVIDAD:CUADERNO:Dibuja el sistema solar destacando el sol y la órbita de la tierra]..."

DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO (sin bloques de código markdown como \`\`\`json) CON LA SIGUIENTE ESTRUCTURA EXACTA:
{
  "saberes_previos": [
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 0 }
  ],
  "texto_inductivo": "Texto largo en formato Markdown. OBLIGATORIAMENTE debes incrustar aquí los 5 juegos de cada tipo, así como los GRÁFICOS (SVG, Tablas, CSS) o PENTAGRAMAS GIGANTES explicados en la instrucción visual...",
  "recurso_visual": "Genera una tabla en formato Markdown o un código de diagrama Mermaid (graph TD...) que resuma el texto inductivo.",
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
  "texto_deductivo": "Texto deductivo largo en formato Markdown. OBLIGATORIAMENTE debes incrustar aquí también los 5 juegos de cada tipo y nuevos GRÁFICOS/PENTAGRAMAS explicativos...",
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
        // Modelos de respaldo en caso de saturación
        const modelos = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3-flash-preview'];
        let responseText = "";
        let finalError = null;

        const ai = getAIClient();
        for (let i = 0; i < modelos.length; i++) {
            try {
                const response = await ai.models.generateContent({
                    model: modelos[i],
                    contents: prompt,
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
            if (finalError && finalError.status === 503) mensajeFront = "El cerebro de IA está muy saturado en este momento (alta demanda global). Inténtalo en un par de minutos.";
            if (finalError && finalError.status === 429) mensajeFront = "Te has quedado sin cuota de peticiones en tu API Key de Gemini.";
            if (finalError && finalError.status === 404) mensajeFront = "El modelo de IA solicitado ya no existe o fue deshabilitado por Google.";
            return res.status(500).json({ error: mensajeFront });
        }

        // Sanitización del JSON (Remover bloques markdown como ```json ... ```)
        let limpio = responseText;
        if (limpio.includes("```")) {
            limpio = limpio.replace(/```json/gi, "").replace(/```/g, "").trim();
        }

        const finalJson = JSON.parse(limpio);
        
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
        res.status(500).json({ error: "Ocurrió un error inesperado en el servidor al generar la aventura." });
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
