const fs = require('fs');
let file = fs.readFileSync('d:/Peidagogos_Local/proyector_cron.js', 'utf8');

file = file.replace(/model: "gemini-2\.5-pro"/g, 'model: "gemini-2.5-flash"');

fs.writeFileSync('d:/Peidagogos_Local/proyector_cron.js', file, 'utf8');
console.log('Model switched to gemini-2.5-flash');
