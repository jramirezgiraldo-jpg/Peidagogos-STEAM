const fs = require('fs');
let db = JSON.parse(fs.readFileSync('d:/Peidagogos_Local/proyectorData.json', 'utf8'));
db.semanasGeneradas = 0;
fs.writeFileSync('d:/Peidagogos_Local/proyectorData.json', JSON.stringify(db, null, 4), 'utf8');
console.log('semanasGeneradas reset to 0');
