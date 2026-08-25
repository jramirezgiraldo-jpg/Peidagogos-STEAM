with open(r'd:\Peidagogos_Oficial\server.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Target: the DeepSeek block in generate-tool-ai
# After DeepSeek fails (responseText is still ''), add Gemini fallback
old_block = """        if (responseText) {
            // Eliminar posibles backticks de markdown que Deepseek pueda devolver aunque se pida json_object
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();"""

new_block = """        // FALLBACK: Si DeepSeek no respondió, intentar con Gemini
        if (!responseText) {
            console.log('[IA] DeepSeek sin respuesta, usando Gemini como fallback...');
            const geminiClient = getAIClient();
            if (geminiClient) {
                try {
                    const gemResult = await geminiQueue.add(() =>
                        geminiClient.models.generateContent({
                            model: 'gemini-2.0-flash',
                            contents: [{ role: 'user', parts: [{ text: prompt }] }]
                        })
                    );
                    const gemText = gemResult?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    if (gemText && gemText.trim()) {
                        responseText = gemText;
                        console.log('[IA] Gemini fallback exitoso, longitud:', responseText.length);
                    }
                } catch(gemErr) {
                    console.error('[IA] Gemini fallback falló:', gemErr.message);
                }
            }
        }

        if (responseText) {
            // Eliminar posibles backticks de markdown que Deepseek pueda devolver aunque se pida json_object
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();"""

if old_block in code:
    code = code.replace(old_block, new_block, 1)
    with open(r'd:\Peidagogos_Oficial\server.js', 'w', encoding='utf-8') as f:
        f.write(code)
    print('OK: Gemini fallback added to generate-tool-ai')
else:
    print('ERROR: Target block not found in server.js')
    # Show context to debug
    idx = code.find('if (responseText) {')
    if idx >= 0:
        print('Found "if (responseText) {" at index', idx)
        print(code[idx:idx+200])
