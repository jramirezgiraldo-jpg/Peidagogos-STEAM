const { GoogleGenAI } = require('@google/genai');

/**
 * Genera un post educativo corto usando Gemini.
 * @param {string} apiKey - Clave de API de Gemini.
 * @param {string} postType - 'dato_curioso', 'infografia', o 'video'
 * @returns {Promise<string>} - El texto del post generado.
 */
async function generateEducationalPost(apiKey, postType = 'dato_curioso') {
    if (!apiKey) {
        throw new Error('No Gemini API Key provided for social media generator.');
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    let promptInstruction = '';

    switch (postType) {
        case 'infografia':
            promptInstruction = `Tema: Texto para acompañar una infografía educativa sobre un concepto STEAM.
Estructura obligatoria:
- Un título atractivo (Ej: "3 Datos sobre X").
- 3 a 5 puntos clave (bullet points con emojis) resumiendo el concepto de forma muy clara.
- Una invitación a conocer más en nuestra plataforma (https://peidagogosteam.com).
- 3 a 5 hashtags relevantes (ej. #EducacionSTEAM #AprendeConNosotros).`;
            break;
        case 'video':
            promptInstruction = `Tema: Texto súper enganchador (caption) para acompañar un video educativo de 15 segundos sobre STEAM.
Estructura obligatoria:
- Un gancho inicial potente ("¡Mira esto!" o "¡Te sorprenderá!").
- Un párrafo corto (1-2 oraciones) creando curiosidad sobre lo que se muestra en el video.
- Llamado a la acción (Call to Action): "Conoce más en https://peidagogosteam.com".
- 3 a 5 hashtags relevantes.`;
            break;
        case 'dato_curioso':
        default:
            promptInstruction = `Tema: Un dato curioso fascinante sobre Ciencia, Tecnología, Ingeniería, Arte o Matemáticas (STEAM).
Estructura obligatoria:
- Un gancho interesante (pregunta o dato sorprendente).
- Una breve explicación muy fácil de entender.
- Una invitación a conocer más en nuestra plataforma (https://peidagogosteam.com).
- 3 a 5 hashtags relevantes (ej. #EducacionSTEAM #CienciaDivertida).`;
            break;
    }

    const prompt = `Eres el Community Manager de "Peidagogos STEAM", una plataforma educativa innovadora de Colombia.
Tu tarea es escribir un post corto, súper atractivo y educativo para Facebook e Instagram.
${promptInstruction}
Enfoque Principal: Debes enfatizar siempre la educación STEAM, la gamificación, el aprendizaje basado en juegos y el aprendizaje personalizado. NO hagas énfasis en la educación mediada por Inteligencia Artificial, enfócate en el juego y la personalización.
Tono: Entusiasta, profesional pero cercano, inspirador.
NO uses saludos largos ni texto extra. Dame SOLO el texto que se va a publicar directamente en las redes sociales.`;

    const modelsToTry = [
        'gemini-3.5-flash-lite',
        'gemini-flash-latest',
        'gemini-3.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-flash-lite-latest'
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log('[SOCIAL] Intentando generar post con modelo Gemini:', modelName);
            const response = await ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                }
            });
            
            return response.text.trim();
        } catch (error) {
            console.error(`[SOCIAL] Fallo con Gemini ${modelName}:`, error.message);
            lastError = error;
            // Si el error no es 404/400 (modelo no encontrado/invalido), lanzarlo inmediatamente
            if (error.status !== 'NOT_FOUND' && error.status !== 404 && error.status !== 400 && !error.message.includes('not found')) {
                break; // Break loop to try OpenAI
            }
        }
    }

    // FALLBACK A OPENAI (CHATGPT) SI GEMINI FALLA
    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (openAIApiKey) {
        console.log('[SOCIAL] Gemini falló o no está disponible. Intentando con OpenAI ChatGPT...');
        try {
            const { OpenAI } = require('openai');
            const openai = new OpenAI({ apiKey: openAIApiKey });
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Modelo económico y potente
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 500
            });
            console.log('[SOCIAL] ✅ Post generado exitosamente con OpenAI');
            return completion.choices[0].message.content.trim();
        } catch (openaiErr) {
            console.error('[SOCIAL] OpenAI también falló:', openaiErr.message);
            throw new Error(`Ambas IAs fallaron. Gemini: ${lastError ? lastError.message : 'N/A'} | OpenAI: ${openaiErr.message}`);
        }
    }

    throw new Error('No se pudo generar el post con Gemini y no hay OPENAI_API_KEY configurada. Último error Gemini: ' + (lastError ? lastError.message : 'Desconocido'));
}

module.exports = {
    generateEducationalPost
};
