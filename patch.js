const fs = require('fs');
let html = fs.readFileSync('login.html', 'utf8');
const search = '<button onclick=\"window.compartirInvitacionDocenteWhatsApp()\"';
const endSearch = '<span>📽️</span> Proyectar QR en Pantalla Completa\n                                    </button>\n                                </div>';
const startIdx = html.indexOf(search);
if (startIdx > -1) {
    const parentIdx = html.lastIndexOf('<div', startIdx);
    const endIdx = html.indexOf(endSearch) + endSearch.length;
    html = html.substring(0, parentIdx) + html.substring(endIdx);
    fs.writeFileSync('login.html', html, 'utf8');
    console.log('Replaced successfully.');
} else {
    console.log('Not found.');
}
