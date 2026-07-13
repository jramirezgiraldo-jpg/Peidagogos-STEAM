require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test() {
    try {
        const ai = new GoogleGenAI({});
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Hola',
        });
        console.log("Response:", response.text);
    } catch (e) {
        console.error("ERROR CAUGHT:", e);
    }
}
test();
