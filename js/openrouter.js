// Cliente de conexión con OpenRouter API para Peidagogos
export const OPENROUTER_MODELS = [
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3 (Recomendado)",
    badge: "Ultra Económico y Rápido",
    cost: "~$0.001 USD / actividad",
    description: "Excelente generación de código frontend, JavaScript y lógica educativa sin truncamiento."
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Google Gemini 2.0 Flash",
    badge: "Máxima Velocidad",
    cost: "~$0.0014 USD / actividad",
    description: "Ultra rápido, contexto amplio y muy buena respuesta para estructuras HTML."
  },
  {
    id: "openai/gpt-4o-mini",
    name: "OpenAI GPT-4o Mini",
    badge: "Alta Precisión",
    cost: "~$0.002 USD / actividad",
    description: "Gran seguimiento de instrucciones pedagógicas complejas y diseño visual."
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Meta Llama 3.3 70B",
    badge: "Código Abierto",
    cost: "~$0.002 USD / actividad",
    description: "Gran capacidad didáctica y estructuración de contenido teórico."
  }
];

const STORAGE_KEY_API_KEY = "Peidagogos_openrouter_api_key";
const STORAGE_KEY_MODEL = "Peidagogos_openrouter_model";

export function getStoredApiKey() {
  return localStorage.getItem(STORAGE_KEY_API_KEY) || "";
}

export function setStoredApiKey(key) {
  if (key) {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  }
}

export function getStoredModel() {
  return localStorage.getItem(STORAGE_KEY_MODEL) || "deepseek/deepseek-chat";
}

export function setStoredModel(modelId) {
  localStorage.setItem(STORAGE_KEY_MODEL, modelId);
}

// Extrae y normaliza el HTML limpiando bloques de markdown tipo ```html ... ```
export function extractCleanHtml(rawText) {
  if (!rawText) return "";
  let clean = rawText.trim();
  
  // Si viene envuelto en markdown ```html ... ```
  const codeBlockMatch = clean.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    clean = codeBlockMatch[1].trim();
  }

  // Asegura que empiece en <!DOCTYPE html> si hay texto conversacional previo
  const doctypeIndex = clean.indexOf("<!DOCTYPE html>");
  if (doctypeIndex !== -1) {
    clean = clean.substring(doctypeIndex);
  } else {
    const htmlTagIndex = clean.indexOf("<html");
    if (htmlTagIndex !== -1) {
      clean = "<!DOCTYPE html>\n" + clean.substring(htmlTagIndex);
    }
  }

  // Corta cualquier texto conversacional posterior a </html>
  const closeHtmlIndex = clean.lastIndexOf("</html>");
  if (closeHtmlIndex !== -1) {
    clean = clean.substring(0, closeHtmlIndex + 7);
  }

  return clean;
}

// Genera la actividad completa conectando primero con el servidor seguro o con OpenRouter
export async function generateActivityWithOpenRouter({
  prompt,
  model = "deepseek/deepseek-chat",
  apiKey,
  onChunk,
  onStatus
}) {
  // 1. Intentar primero a través del backend seguro de Render (/api/generate)
  try {
    if (onStatus) onStatus("Conectando con el servidor Peidagogos...");
    const serverRes = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model })
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data.html) {
        if (onStatus) onStatus("¡Actividad lista!");
        return data.html;
      }
    }
  } catch (serverErr) {
    console.log("Servidor backend no disponible, intentando modo cliente directo...");
  }

  // 2. Modo Cliente Directo (si no hay servidor o para desarrollo local)
  const effectiveKey = apiKey || getStoredApiKey();
  if (!effectiveKey) {
    throw new Error("No hay conexión con el servidor ni clave configurada. Por favor recarga la página o ingresa tu clave en Configuración.");
  }

  if (onStatus) onStatus("Conectando con OpenRouter...");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${effectiveKey}`,
      "HTTP-Referer": "https://Peidagogos.app",
      "X-Title": "Peidagogos - Creador de Actividades para Maestros",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `Eres un desarrollador Frontend Senior y Diseñador Instruccional de clase mundial.
Tu trabajo es generar un archivo HTML único, completo y 100% funcional que integre HTML5, CSS3 y JavaScript vanilla embebidos.
REGLAS SUPREMAS:
1. No escribas NINGÚN texto conversacional de saludo ni despedida.
2. Devuelve EXCLUSIVAMENTE el código HTML dentro de un solo bloque \`\`\`html ... \`\`\` que comience con <!DOCTYPE html> y termine con </html>.
3. No uses CDNs externos ni librerías externas (cero Google Fonts, cero FontAwesome, cero frameworks externos). Todo debe funcionar 100% OFFLINE.
4. Programa todo el código JS completo, sin 'TODO' ni 'implementar más tarde'.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true
    })
  });

  if (!response.ok) {
    let errMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson && errJson.error && errJson.error.message) {
        errMessage = errJson.error.message;
      }
    } catch (e) {
      // Ignorar fallo de parseo JSON de error
    }
    throw new Error(errMessage);
  }

  if (onStatus) onStatus("Generando código del juego y taller pedagógico...");

  // Procesamiento por Streaming (SSE)
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let accumulatedText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ")) {
        const dataStr = trimmed.substring(6).trim();
        if (dataStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(dataStr);
          const deltaContent = parsed.choices?.[0]?.delta?.content;
          if (deltaContent) {
            accumulatedText += deltaContent;
            if (onChunk) onChunk(accumulatedText);
          }
        } catch (e) {
          // Ignorar chunks intermedios con formato no JSON
        }
      }
    }
  }

  const cleanHtml = extractCleanHtml(accumulatedText);
  if (!cleanHtml || !cleanHtml.includes("<html")) {
    throw new Error("La respuesta recibida no contiene una estructura HTML válida. Intenta nuevamente.");
  }

  return cleanHtml;
}

// Función asistida para que el maestro obtenga 10 palabras clave con 1 clic
export async function suggestKeywordsWithIA({ topic, grade, apiKey, model = "deepseek/deepseek-chat" }) {
  // 1. Intentar primero a través del backend seguro de Render
  try {
    const serverRes = await fetch("/api/suggest-keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, grade, model })
    });

    if (serverRes.ok) {
      const data = await serverRes.json();
      if (data.keywords) return data.keywords;
    }
  } catch (e) {
    console.log("Servidor backend no disponible para sugerir palabras, intentando modo cliente...");
  }

  // 2. Modo Cliente Directo
  const effectiveKey = apiKey || getStoredApiKey();
  if (!effectiveKey) {
    throw new Error("Se requiere conexión con el servidor o clave API de OpenRouter.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${effectiveKey}`,
      "HTTP-Referer": "https://Peidagogos.app",
      "X-Title": "Peidagogos",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content: "Eres un asistente pedagógico. Tu tarea es listar exactamente 10 palabras clave o conceptos cortos sobre el tema solicitado, adaptadas al grado indicado. Devuelve únicamente las 10 palabras separadas por comas, sin numeración ni comentarios."
        },
        {
          role: "user",
          content: `Tema: ${topic}. Grado: ${grade}. Dame exactamente 10 palabras o conceptos clave.`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("No se pudieron sugerir las palabras clave.");
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  return text.trim();
}
