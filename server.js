require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middlewares
app.use(cors());
app.use(express.json()); // Permitir parseo de JSON en el body
app.use(express.static(path.join(__dirname))); // Servir archivos estáticos

// Inicializar el SDK de Gemini. Si la key está en process.env.GEMINI_API_KEY, la tomará automáticamente.
// Si no hay key, igual inicializamos pero mostrará error al intentar generar.
let ai;
try {
    ai = new GoogleGenAI({}); // Toma process.env.GEMINI_API_KEY por defecto
} catch (error) {
    console.warn("Advertencia: No se pudo inicializar GoogleGenAI. Probablemente falta la GEMINI_API_KEY en el archivo .env");
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
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: "El motor de IA no está configurado todavía. Falta añadir la API Key al servidor." 
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
- Tópico Generativo de la Semana: ${topico}

DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO (sin bloques de código markdown como \`\`\`json) CON LA SIGUIENTE ESTRUCTURA EXACTA:
{
  "saberes_previos": [
    { "pregunta": "¿...?", "opciones": ["A", "B", "C", "D"], "correcta": 0 }
  ],
  "texto_inductivo": "Texto de al menos 500 palabras, formato markdown o HTML simple permitido para negritas...",
  "recurso_visual": "Genera una tabla en formato Markdown o un código de diagrama Mermaid (graph TD...) que resuma o ejemplifique el contenido del texto inductivo.",
  "preguntas_inductivas_pagina": [ "¿P1?", "¿P2?", "¿P3?", "¿P4?", "¿P5?" ],
  "preguntas_inductivas_cuaderno": [
      "Pregunta que exija dibujar un esquema o mapa conceptual",
      "Pregunta que exija realizar un cuadro comparativo",
      "Pregunta reflexiva extensa sobre el texto",
      "Pregunta que exija representar gráficamente una idea"
  ],
  "juegos_ordenar_letras_1": ["PALABRA1", "PALABRA2", "PALABRA3"],
  "juego_ordenar_frase_1": "FRASE LARGA CON SENTIDO",
  "texto_deductivo": "Texto deductivo de al menos 500 palabras...",
  "preguntas_deductivas_pagina": [ "¿P1?", "¿P2?", "¿P3?", "¿P4?", "¿P5?" ],
  "preguntas_deductivas_cuaderno": [
      "Pregunta que exija realizar un diagrama detallado",
      "Pregunta que exija elaborar un mapa mental",
      "Pregunta que exija un dibujo explicativo del tema",
      "Pregunta que exija una infografía artesanal"
  ],
  "juegos_ordenar_letras_2": ["TERMINO1", "TERMINO2", "TERMINO3"],
  "juego_ordenar_frase_2": "OTRA FRASE A ORDENAR",
  "sopa_letras": ["PALABRA1", "PALABRA2", "PALABRA3", "PALABRA4", "PALABRA5", "PALABRA6", "PALABRA7", "PALABRA8", "PALABRA9", "PALABRA10"],
  "crucigrama": [
    { "palabra": "RESPUESTA1", "pista": "Definición o pista 1" }, // hasta 10 palabras
    { "palabra": "RESPUESTA2", "pista": "Definición o pista 2" }
  ],
  "icfes": [
    {
      "competencia": "Explicación de Fenómenos",
      "texto_introductorio": "Contexto de la pregunta...",
      "tabla_o_grafica_markdown": "| Dato | Valor |\n|---|---|",
      "pregunta": "¿Qué ocurre si...?",
      "opciones": ["Opcion 1", "Opcion 2", "Opcion 3", "Opcion 4"],
      "correcta": 0,
      "retroalimentacion": {
        "0": "Correcto porque...",
        "1": "Incorrecto porque...",
        "2": "Incorrecto porque...",
        "3": "Incorrecto porque..."
      }
    } // Añade 2 preguntas más para las otras 2 competencias (uso comprensivo, indagación)
  ]
}`;
        // Modelos de respaldo en caso de saturación
        const modelos = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3-flash-preview'];
        let responseText = "";
        let finalError = null;

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

// Ruta principal para servir el index.html en cualquier otra ruta
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`Backend de IA listo (Esperando API Key en .env)`);
});
