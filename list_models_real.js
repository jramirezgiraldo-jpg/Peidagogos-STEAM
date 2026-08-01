const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: 'AIzaSyDTC-pbk9GRw4pAfNw4aVc1y-Kkk6yJgQM' });

async function listModels() {
    try {
        const response = await ai.models.list();
        for (const model of response) {
            console.log(model.name);
        }
    } catch (e) {
        console.error(e);
    }
}
listModels();
