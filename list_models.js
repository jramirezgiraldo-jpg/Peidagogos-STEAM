require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test() {
    try {
        const apiKeys = (process.env.GEMINI_API_KEYS || "").split(',');
        const ai = new GoogleGenAI({apiKey: apiKeys[0]});
        const response = await ai.models.list();
        let list = [];
        for await (const model of response) {
            list.push(model.name);
        }
        console.log("Models:", list);
    } catch (e) {
        console.error("ERROR CAUGHT:", e);
    }
}
test();
