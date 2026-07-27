require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({});
async function test() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: 'Hola',
        });
        console.log("QUOTA OK:", response.text);
    } catch(err) {
        console.error("QUOTA ERROR:", err.status, err.message);
    }
}
test();
