// Script de prueba limpio
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',')[0].trim() : process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.log("No API key configured in environment.");
} else {
    const ai = new GoogleGenAI({ apiKey });
    ai.models.list().then(res => console.log("Conexión exitosa!")).catch(console.error);
}
