const { GoogleGenAI } = require('@google/genai');

/**
 * Genera un post educativo corto usando Gemini.
 * @param {string} apiKey - Clave de API de Gemini.
 * @returns {Promise<string>} - El texto del post generado.
 */
async function generateEducationalPost(apiKey) {
    if (!apiKey) {
        throw new Error('No Gemini API Key provided for social media generator.');
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const prompt = `Eres el Community Manager de "Peidagogos STEAM", una plataforma educativa innovadora de Colombia.
Tu tarea es escribir un post corto, súper atractivo y educativo para Facebook e Instagram.
Tema: Un dato curioso fascinante sobre Ciencia, Tecnología, Ingeniería, Arte o Matemáticas (STEAM).
Estructura obligatoria:
- Un gancho interesante (pregunta o dato sorprendente).
- Una breve explicación muy fácil de entender.
- Una invitación a conocer más en nuestra plataforma (https://peidagogosteam.com).
- 3 a 5 hashtags relevantes (ej. #EducacionSTEAM #CienciaDivertida).
Tono: Entusiasta, profesional pero cercano, inspirador.
NO uses saludos largos ni texto extra. Dame SOLO el texto que se va a publicar directamente en las redes sociales.`;

    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log('[SOCIAL] Intentando generar post con modelo:', modelName);
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
            console.error(`[SOCIAL] Fallo con ${modelName}:`, error.message);
            lastError = error;
            // Si el error no es 404 (modelo no encontrado), lanzarlo inmediatamente
            if (error.status !== 'NOT_FOUND' && error.status !== 404 && !error.message.includes('not found')) {
                throw error;
            }
        }
    }

    throw new Error('No se pudo generar el post con ningún modelo disponible. Último error: ' + (lastError ? lastError.message : 'Desconocido'));
}

module.exports = {
    generateEducationalPost
};
