const fs = require('fs');
let file = fs.readFileSync('d:/Peidagogos_Local/generador_cron.js', 'utf8');

file = file.replace(/model:\s*"gemini-1\.5-pro"/g, 'model: "gemini-2.5-flash"');
file = file.replace(/model:\s*"gemini-2\.5-pro"/g, 'model: "gemini-2.5-flash"');

fs.writeFileSync('d:/Peidagogos_Local/generador_cron.js', file, 'utf8');
console.log('Model switched in generador_cron.js to gemini-2.5-flash');
