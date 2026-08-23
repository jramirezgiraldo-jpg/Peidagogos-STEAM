const fs = require('fs');
let text = fs.readFileSync('login.html', 'utf8');
let fixed = Buffer.from(text, 'latin1').toString('utf8');
if (fixed.includes('Iniciar Sesión')) {
    fs.writeFileSync('login.html', fixed, 'utf8');
    console.log('Fixed double encoding!');
} else {
    console.log('Not fixed.');
}
