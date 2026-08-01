const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://peidagogos-steam.onrender.com/api/descargar-guias'; // Use standard render url or custom
const altUrl = 'https://www.peidagogosteam.com/api/descargar-guias';

console.log("Conectando al servidor Render para descargar el reporte de guías...");

https.get(altUrl, (response) => {
    if (response.statusCode !== 200) {
        console.error("Error al descargar:", response.statusCode);
        process.exit(1);
    }
    
    console.log("Descargando archivo ZIP...");
    const file = fs.createWriteStream(dest);
    response.pipe(file);
    
    file.on('finish', () => {
        file.close();
        console.log("Descarga completada.");
        const stats = fs.statSync(dest);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`Tamaño del ZIP: ${sizeMB} MB`);
        process.exit(0);
    });
}).on('error', (err) => {
    console.error("Error de red:", err.message);
    process.exit(1);
});
