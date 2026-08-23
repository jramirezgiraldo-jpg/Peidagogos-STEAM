const fs = require('fs');
let lines = fs.readFileSync('login.html', 'utf8').split('\n');

lines[1216] = `                        </div>`;

fs.writeFileSync('login.html', lines.join('\n'), 'utf8');
