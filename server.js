const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, ".")));

// La clave se lee de forma segura desde las variables de entorno de Render
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY || "";

// Endpoint seguro para consultar si el servidor tiene la API Key configurada
app.get("/api/config", (req, res) => {
  res.json({
    hasServerKey: Boolean(OPENROUTER_API_KEY && OPENROUTER_API_KEY.trim() !== ""),
    defaultModel: "deepseek/deepseek-chat"
  });
});

// Endpoint seguro para sugerir palabras clave
app.post("/api/suggest-keywords", async (req, res) => {
  try {
    const { topic, grade, model = "deepseek/deepseek-chat" } = req.body;
    const clientKey = req.body.apiKey || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const apiKey = (clientKey && clientKey.trim()) || OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: "No hay clave API de OpenRouter configurada en el servidor (Render) ni ingresada en el cliente." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://peidagogos.org",
        "X-Title": "Peidagogos STEAM",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content: "Eres un asistente pedagógico. Lista exactamente 10 palabras o conceptos clave relacionados con el tema y grado. Devuelve únicamente las 10 palabras separadas por comas, sin numeración ni comentarios."
          },
          { role: "user", content: `Tema: ${topic}. Nivel: ${grade}.` }
        ]
      })
    });

    if (!response.ok) {
      let errText = await response.text();
      try {
        const errObj = JSON.parse(errText);
        if (errObj?.error?.message) errText = errObj.error.message;
      } catch (_) {}
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    res.json({ keywords: text.trim() });
  } catch (error) {
    console.error("Error en suggest-keywords:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint seguro para generar la actividad completa
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, model = "deepseek/deepseek-chat" } = req.body;
    const clientKey = req.body.apiKey || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    const apiKey = (clientKey && clientKey.trim()) || OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: "No hay clave API de OpenRouter configurada en el servidor (Render) ni ingresada en el cliente." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://peidagogos.org",
        "X-Title": "Peidagogos STEAM",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: "Eres un desarrollador Frontend Senior y Diseñador Instruccional experto. Devuelve ÚNICAMENTE un archivo HTML completo y 100% funcional dentro de un bloque ```html ... ``` que inicie con <!DOCTYPE html> y termine con </html>. Cero librerías externas ni CDNs. Cero explicaciones antes o después."
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      let errText = await response.text();
      try {
        const errObj = JSON.parse(errText);
        if (errObj?.error?.message) errText = errObj.error.message;
      } catch (_) {}
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";

    // Limpiar HTML
    let clean = rawText.trim();
    const codeBlockMatch = clean.match(/```(?:html)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      clean = codeBlockMatch[1].trim();
    }
    const doctypeIndex = clean.indexOf("<!DOCTYPE html>");
    if (doctypeIndex !== -1) clean = clean.substring(doctypeIndex);
    const closeHtmlIndex = clean.lastIndexOf("</html>");
    if (closeHtmlIndex !== -1) clean = clean.substring(0, closeHtmlIndex + 7);

    res.json({ html: clean });
  } catch (error) {
    console.error("Error en generate:", error);
    res.status(500).json({ error: error.message });
  }
});

// Servir la aplicación principal
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor Peidagogos STEAM corriendo en el puerto ${PORT}`);
});
