import re

with open(r'd:\Peidagogos_Oficial\server.js', 'r', encoding='utf-8') as f:
    server = f.read()

idx_prompt = server.find('const prompt = `Act')

if idx_prompt != -1:
    diapos_logic = """
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
                            { role: 'system', content: 'Devuelve EXCLUSIVAMENTE HTML. SIN MARKDOWN. Empieza directamente con <!DOCTYPE html>' },
                            { role: 'user', content: promptDiapositivas }
                        ]
                    })
                });
                
                if (ds_response.ok) {
                    const ds_data = await ds_response.json();
                    let htmlRes = ds_data.choices[0].message.content;
                    htmlRes = htmlRes.replace(/^```html/i, '').replace(/```$/i, '').trim();
                    return res.json({ html: htmlRes });
                } else {
                    return res.status(500).json({error: 'Fallo al generar HTML'});
                }
            } catch (err) {
                return res.status(500).json({error: 'Fallo IA'});
            }
        }
        
"""
    new_server = server[:idx_prompt] + diapos_logic + server[idx_prompt:]
    
    with open(r'd:\Peidagogos_Oficial\server.js', 'w', encoding='utf-8') as f:
        f.write(new_server)
    print("Patched server.js with Diapositivas logic")
else:
    print("Could not find prompt injection point")
