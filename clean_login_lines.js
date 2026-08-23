const fs = require('fs');
let lines = fs.readFileSync('login.html', 'utf8').split('\n');

// the lines we want to replace are 1215 to 1231 (1-indexed)
// which means index 1214 to 1230.
// Let's replace the whole block by empty strings, and put our input at 1214.
for (let i = 1214; i <= 1230; i++) {
    lines[i] = "";
}

lines[1214] = `                            <input type="text" id="admin-inv-ie-select" placeholder="Escribe el nombre de la institución..." value="" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.9rem; box-sizing: border-box; background: white;">`;

fs.writeFileSync('login.html', lines.join('\n'), 'utf8');
