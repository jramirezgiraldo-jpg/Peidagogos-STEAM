const fs = require('fs');
let html = fs.readFileSync('login.html', 'utf8');

// 1. Remove inputs
html = html.replace(/<div style="display: grid; grid-template-columns: repeat\(auto-fit, minmax\(240px, 1fr\)\); gap: 16px; margin-bottom: 24px;">[\s\S]*?Ej: Ciencias Naturales, Física"[\s\S]*?<\/div>\s*<\/div>/, '');

// 2. Remove buttons
html = html.replace(/<div style="display: flex; gap: 10px; flex-wrap: wrap;">\s*<button onclick="window\.compartirInvitacionDocenteWhatsApp\(\)"[\s\S]*?Proyectar QR en Pantalla Completa\s*<\/button>\s*<\/div>/, '');

fs.writeFileSync('login.html', html, 'utf8');
console.log('login.html patched');
