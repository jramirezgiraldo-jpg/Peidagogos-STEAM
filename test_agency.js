
require('dotenv').config();
const { generarInfografia } = require('./marketing_agency/image_generator');
const { enviarAprobacionTelegram } = require('./marketing_agency/telegram_bot');

async function test() {
    const res = await generarInfografia('Mentefacto Interactivo');
    console.log('Generado:', res.filepath);
    // Necesitamos pasarle el chat_id temporal si no ha escrito nada
    // Pero asumiendo que ya escribio hola, el bot lo guardara.
}
test();
