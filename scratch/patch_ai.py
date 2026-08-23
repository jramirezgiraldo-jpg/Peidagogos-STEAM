import re

with open(r'd:\Peidagogos_Oficial\server.js', 'r', encoding='utf-8') as f:
    srv = f.read()

target = """        // Try Gemini first
        try {
            const ai = getAIClient();
            if (ai) {
                const response = await geminiQueue.add(() => ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json"
                    }
                }));
                if (response && response.text) responseText = response.text;
            }
        } catch(e) {
            console.error("Gemini falló en tool:", e.message);
        }

        // DeepSeek Fallback
        if (!responseText && (process.env.DEEPSEEK_API_KEY || 'sk-8bdd9c5adcfa4d8e958f1ea7a07e8167')) {"""

replacement = """        // Usar EXCLUSIVAMENTE DeepSeek como fue requerido
        if (!responseText && (process.env.DEEPSEEK_API_KEY || 'sk-8bdd9c5adcfa4d8e958f1ea7a07e8167')) {"""

srv = srv.replace(target, replacement)

with open(r'd:\Peidagogos_Oficial\server.js', 'w', encoding='utf-8') as f:
    f.write(srv)

print("server.js patched")
