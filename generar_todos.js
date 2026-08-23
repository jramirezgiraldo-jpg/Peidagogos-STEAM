
require('dotenv').config();
const { generarInfografia } = require('./marketing_agency/image_generator');
const { enviarAprobacionTelegram } = require('./marketing_agency/telegram_bot');

// Necesitamos un delay entre peticiones a Gemini para evitar Rate Limits
const delay = ms => new Promise(res => setTimeout(res, ms));

async function main() {
    const herramientas = [
        'Sopa de Letras',
        'Simulacro ICFES',
        'Rubrica de Evaluacion',
        'Planeador de Clases'
    ];
    
    for(const h of herramientas) {
        console.log('Generando para:', h);
        try {
            const res = await generarInfografia(h);
            console.log('Enviando a Telegram...');
            await enviarAprobacionTelegram(res.filepath, res.caption, 'imagen');
            await delay(3000); // 3 sec delay
        } catch(e) {
            console.error('Error con', h, e);
        }
    }
    console.log('¡Listo!');
    process.exit(0);
}

main();
