const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { GoogleGenAI } = require('@google/genai');

async function generarInfografia(herramienta) {
    console.log('[Agencia] Obteniendo textos de Gemini para la infografía de', herramienta);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Actúa como un experto en marketing educativo. Escribe el contenido para una infografía muy detallada sobre la herramienta '${herramienta}' de Peidagogos STEAM.
Devuelve un JSON estrictamente con esta estructura:
{
  "titulo": "El Poder Oculto de [Herramienta]",
  "subtitulo": "No es solo un juego. Es un motor de aprendizaje interactivo.",
  "puntos": [
    {"icono": "📖", "titulo": "Beneficio 1", "texto": "Explicación de 2-3 líneas muy persuasiva."},
    {"icono": "🧠", "titulo": "Beneficio 2", "texto": "Explicación de 2-3 líneas."},
    {"icono": "⚡", "titulo": "Beneficio 3", "texto": "Explicación de 2-3 líneas."},
    {"icono": "🎮", "titulo": "Beneficio 4", "texto": "Explicación de 2-3 líneas."}
  ]
}`;
    
    let info = null;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        info = JSON.parse(text);
    } catch (e) {
        console.error('Error con Gemini:', e);
        info = {
            titulo: 'El Poder de ' + herramienta,
            subtitulo: 'Aumenta el aprendizaje interactivo en tu plataforma.',
            puntos: [
                {icono: '📖', titulo: 'Vocabulario', texto: 'Fija términos científicos a través de búsqueda.'},
                {icono: '🧠', titulo: 'Foco Mental', texto: 'Entrena la atención sostenida de los niños.'},
                {icono: '⚡', titulo: 'Rapidez', texto: 'Corrección y validación en tiempo real.'},
                {icono: '🎮', titulo: 'Gamificación', texto: 'Reduce el estrés de las evaluaciones.'}
            ]
        };
    }

    let logoBase64 = '';
    try {
        const logoPath = path.join(__dirname, 'logo.jpg');
        const logoData = fs.readFileSync(logoPath);
        logoBase64 = 'data:image/jpeg;base64,' + logoData.toString('base64');
    } catch(e) {
        console.log('Logo no encontrado.');
    }

    // Buscar si tenemos una imagen de la herramienta
    let toolImageBase64 = '';
    try {
        // Normalizar nombre: "Mentefacto Interactivo" -> "mentefacto_interactivo.jpg"
        const imgName = herramienta.toLowerCase().replace(/ /g, '_') + '.jpg';
        const imgPath = path.join(__dirname, 'assets', imgName);
        if (fs.existsSync(imgPath)) {
            const imgData = fs.readFileSync(imgPath);
            toolImageBase64 = 'data:image/jpeg;base64,' + imgData.toString('base64');
        }
    } catch(e) {
        console.log('Imagen de herramienta no encontrada.');
    }

    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">
        <style>
            body {
                margin: 0; padding: 0;
                width: 1080px; height: 1600px; /* Mas alto para que quepa la imagen */
                font-family: 'Montserrat', sans-serif;
                background: radial-gradient(circle at top left, #e0f2fe, #ffffff 40%, #fdf4ff);
                position: relative;
                overflow: hidden;
            }
            .grid-bg {
                position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                background-image: radial-gradient(#cbd5e1 2px, transparent 2px);
                background-size: 40px 40px;
                opacity: 0.3;
                z-index: 0;
            }
            .content {
                position: relative;
                z-index: 1;
                padding: 60px;
                display: flex;
                flex-direction: column;
                align-items: center;
                height: 100%;
                box-sizing: border-box;
            }
            .logo {
                height: 140px;
                object-fit: contain;
                margin-bottom: 20px;
            }
            .badge {
                background: #f1f5f9;
                color: #0f172a;
                padding: 8px 24px;
                border-radius: 30px;
                font-weight: 800;
                font-size: 18px;
                letter-spacing: 2px;
                margin-bottom: 30px;
            }
            .title {
                font-size: 65px;
                font-weight: 900;
                color: #0f172a;
                text-align: center;
                line-height: 1.1;
                margin-bottom: 20px;
            }
            .title span { color: #0284c7; }
            .subtitle {
                font-size: 30px;
                color: #475569;
                text-align: center;
                margin-bottom: 40px;
                max-width: 800px;
            }
            .tool-preview {
                width: 900px;
                height: 450px;
                border-radius: 30px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                margin-bottom: 50px;
                background: white;
                overflow: hidden;
                display: ${toolImageBase64 ? 'flex' : 'none'};
                justify-content: center;
                align-items: center;
            }
            .tool-preview img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .cards-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                width: 100%;
                margin-bottom: 30px;
            }
            .card {
                background: rgba(255, 255, 255, 0.9);
                border-radius: 24px;
                padding: 40px 30px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0,0,0,0.03);
            }
            .card-icon {
                font-size: 50px;
                background: #f0fdf4;
                width: 90px; height: 90px;
                line-height: 90px;
                border-radius: 20px;
                margin: 0 auto 20px auto;
            }
            .card-title {
                font-size: 32px;
                font-weight: 900;
                color: #0f172a;
                margin-bottom: 15px;
            }
            .card-text {
                font-size: 22px;
                color: #64748b;
                line-height: 1.4;
            }
            
            .footer {
                background: #0f172a;
                color: white;
                position: absolute;
                bottom: 0; left: 0; right: 0;
                padding: 30px;
                text-align: center;
                font-size: 26px;
                font-weight: 700;
            }
            .footer span { color: #facc15; }
            .dots { margin-bottom: 10px; }
            .dots span {
                display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin: 0 4px;
            }
        </style>
    </head>
    <body>
        <div class="grid-bg"></div>
        <div class="content">
            <img class="logo" src="${logoBase64}" alt="Logo">
            
            <div class="badge">HERRAMIENTAS STEAM</div>
            
            <div class="title">${info.titulo.replace(herramienta, '<span>'+herramienta+'</span>')}</div>
            <div class="subtitle">${info.subtitulo}</div>

            <div class="tool-preview">
                <img src="${toolImageBase64}" alt="Preview de la herramienta">
            </div>

            <div class="cards-grid">
                ${info.puntos.slice(0,4).map((p, i) => `
                <div class="card">
                    <div class="card-icon" style="background: ${['#eff6ff', '#f0fdf4', '#fefce8', '#fdf4ff'][i]}">${p.icono}</div>
                    <div class="card-title">${p.titulo}</div>
                    <div class="card-text">${p.texto}</div>
                </div>
                `).join('')}
            </div>

        </div>
        <div class="footer">
            <div class="dots">
                <span style="background:#3b82f6"></span>
                <span style="background:#22c55e"></span>
                <span style="background:#facc15"></span>
                <span style="background:#f97316"></span>
                <span style="background:#a855f7"></span>
            </div>
            Crea tus propias herramientas en <span>peidagogosteam.com</span>
        </div>
    </body>
    </html>
    `;

    const fileName = 'infografia_' + Date.now() + '.jpg';
    const filePath = path.join(__dirname, fileName);

    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1600 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: filePath, type: 'jpeg', quality: 90 });
    await browser.close();

    return {
        filepath: filePath,
        caption: `🎓 ${info.titulo}\n\n${info.subtitulo}\n\nEsta herramienta cambia las reglas del juego en el aula.\n\n👇 Ingresa a peidagogosteam.com y compruébalo tú mismo.\n\n#EducacionSTEAM #Docentes #Pedagogia`
    };
}

module.exports = { generarInfografia };
