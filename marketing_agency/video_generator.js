const { EdgeTTS } = require('node-edge-tts');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Asumimos que ffmpeg-static está instalado o ffmpeg está en el PATH
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);

async function generarVideoPromocional(herramienta, imagenPath) {
    console.log('[Agencia] Generando Video Promocional para:', herramienta);
    
    // 1. Crear el guion
    const guion = `Atención docentes. ¿Cansados de clases aburridas? Con el ${herramienta} de Peidagogos STEAM, tus estudiantes aprenderán jugando. Aumenta la participación y mide el progreso en tiempo real. Ingresa a peidagogosteam punto com y transforma tu aula hoy mismo.`;

    const audioName = 'audio_' + Date.now() + '.mp3';
    const audioPath = path.join(__dirname, audioName);
    
    // 2. Generar el Audio con IA
    const tts = new EdgeTTS({
        voice: 'es-CO-GonzaloNeural',
        pitch: '+0Hz',
        rate: '+0%',
        volume: '+0%'
    });
    
    await tts.ttsPromise(guion, audioPath);

    // 3. Unir la imagen y el audio con un efecto de Zoom (Ken Burns)
    const videoName = 'promo_' + Date.now() + '.mp4';
    const videoPath = path.join(__dirname, videoName);

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(imagenPath)
            .loop(1) 
            .input(audioPath)
            .complexFilter([
                "zoompan=z='min(zoom+0.001,1.5)':d=700:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'[v]"
            ])
            .outputOptions([
                '-map [v]',
                '-map 1:a',
                '-c:v libx264',
                '-preset ultrafast',
                '-pix_fmt yuv420p',
                '-c:a aac',
                '-shortest'
            ])
            .save(videoPath)
            .on('end', () => {
                fs.unlinkSync(audioPath);
                resolve({
                    filepath: videoPath,
                    caption: '🎬 Video Promocional para TikTok/Reels de ' + herramienta
                });
            })
            .on('error', (err) => {
                console.error("FFmpeg error:", err);
                reject(err);
            });
    });
}

module.exports = { generarVideoPromocional };
