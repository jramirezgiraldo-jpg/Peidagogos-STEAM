const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot = null;
let adminChatId = null;

if (token) {
    bot = new TelegramBot(token, {polling: true});
    console.log('🤖 [Telegram] Bot de Marketing iniciado. Esperando /start de administrador...');

    bot.on('message', (msg) => {
        adminChatId = msg.chat.id;
        console.log('👑 [Telegram] ID de Administrador registrado:', adminChatId);
        
        if (msg.text.toLowerCase() === 'generar_todas') {
            bot.sendMessage(adminChatId, '⚙️ Generando lote completo de infografías (esto tomará unos 20 segundos)...');
            const { generarInfografia } = require('./image_generator');
            const herramientas = ['Sopa de Letras', 'Simulacro ICFES', 'Rubrica de Evaluacion', 'Planeador de Clases'];
            
            (async () => {
                for(let h of herramientas) {
                    try {
                        const res = await generarInfografia(h);
                        await enviarAprobacionTelegram(res.filepath, res.caption, 'imagen');
                    } catch(e) {
                        bot.sendMessage(adminChatId, 'Error con ' + h);
                    }
                }
                bot.sendMessage(adminChatId, '✅ Lote generado.');
            })();
            return;
        }

        if (msg.text.toLowerCase().startsWith('video ')) {
            const h = msg.text.substring(6);
            bot.sendMessage(adminChatId, '🎥 Renderizando video para: ' + h + ' (Tomará unos segundos)...');
            const { generarVideoPromocional } = require('./video_generator');
            const path = require('path');
            
            // Usamos la imagen ya generada en assets como base del video
            const imgName = h.toLowerCase().replace(/ /g, '_') + '.jpg';
            const imgPath = path.join(__dirname, 'assets', imgName);
            
            generarVideoPromocional(h, imgPath).then(res => {
                enviarAprobacionTelegram(res.filepath, res.caption, 'video');
            }).catch(e => {
                bot.sendMessage(adminChatId, 'Error renderizando video: ' + e.message);
            });
            return;
        }
if (msg.text.toLowerCase() === 'prueba') {
            bot.sendMessage(adminChatId, '⚙️ Generando infografía de prueba con node-canvas...');
            const { generarInfografia } = require('./image_generator');
            generarInfografia('Mentefacto Interactivo').then(res => {
                enviarAprobacionTelegram(res.filepath, res.caption, 'imagen');
            }).catch(e => {
                bot.sendMessage(adminChatId, 'Error: ' + e.message);
            });
            return;
        }

        bot.sendMessage(adminChatId, '👋 ¡Hola Juan Felipe! Soy tu Agente de Marketing Automatizado.\n\nA partir de ahora, te enviaré por aquí las infografías y videos generados por IA para que los apruebes antes de publicarlos en redes sociales.\n\nTodo está listo.');
    });

    bot.on('callback_query', (callbackQuery) => {
        const action = callbackQuery.data;
        const msg = callbackQuery.message;
        
        if (action === 'aprobar') {
            bot.sendMessage(msg.chat.id, '✅ ¡Aprobado! Publicando en redes sociales... (Módulo Meta pendiente)');
        } else if (action === 'rechazar') {
            bot.sendMessage(msg.chat.id, '❌ Descartado. Generaremos otra idea luego.');
        }
    });
}

async function enviarAprobacionTelegram(filepath, caption, tipo) {
    if (!bot) {
        console.warn('⚠️ [Telegram] Token no configurado.');
        return;
    }
    if (!adminChatId) {
        console.warn('⚠️ [Telegram] No hay admin registrado. Escribe /start al bot primero.');
        return;
    }
    
    const opts = {
        caption: caption,
        reply_markup: {
            inline_keyboard: [
                [{ text: '✅ Aprobar y Publicar', callback_data: 'aprobar' }],
                [{ text: '❌ Descartar', callback_data: 'rechazar' }]
            ]
        }
    };

    try {
        if (tipo === 'imagen') {
            await bot.sendPhoto(adminChatId, filepath, opts);
        } else {
            await bot.sendVideo(adminChatId, filepath, opts);
        }
        console.log('✅ Enviado a Telegram para aprobación.');
    } catch (e) {
        console.error('Error enviando a Telegram:', e);
    }
}

module.exports = { enviarAprobacionTelegram };
