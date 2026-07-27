const fs = require('fs');
let lines = fs.readFileSync('server.js', 'utf8').split('\\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON')) {
        lines[i] = "DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO (sin bloques de código markdown como \\`\\`\\`json) CON LA SIGUIENTE ESTRUCTURA EXACTA:";
    }
}
fs.writeFileSync('server.js', lines.join('\\n'), 'utf8');
