import re

with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    app = f.read()

app = app.replace("if (typeof window.abrirCajaTool === 'function') {", "if (typeof window.abrirVisorHerramienta === 'function') {")
app = app.replace("window.abrirCajaTool(tool.id, true);", "window.abrirVisorHerramienta(tool.id, true);")

with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
    f.write(app)

print('app.js patched for abrirVisorHerramienta')

with open(r'd:\Peidagogos_Oficial\server.js', 'r', encoding='utf-8') as f:
    server = f.read()

target = """        if (responseText) {
            // Eliminar posibles backticks de markdown que Deepseek pueda devolver aunque se pida json_object
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            res.json(JSON.parse(responseText));
        } else {
            res.status(500).json({ error: "No se pudo generar con IA." });
        }"""

replacement = """        if (responseText) {
            // Eliminar posibles backticks de markdown que Deepseek pueda devolver aunque se pida json_object
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                const startIdx = responseText.indexOf('{');
                const endIdx = responseText.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
                    responseText = responseText.substring(startIdx, endIdx + 1);
                }
                const parsed = JSON.parse(responseText);
                res.json(parsed);
            } catch(e) {
                console.error("JSON parse error from IA:", e, "Raw:", responseText);
                res.status(500).json({ error: "Respuesta IA no válida" });
            }
        } else {
            res.status(500).json({ error: "No se pudo generar con IA." });
        }"""

server = server.replace(target, replacement)
with open(r'd:\Peidagogos_Oficial\server.js', 'w', encoding='utf-8') as f:
    f.write(server)

print('server.js patched for JSON parse handling in generate-tool-ai')
