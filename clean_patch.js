const fs = require('fs');
let html = fs.readFileSync('login.html', 'utf8');

const inputsStart = '<label style=\"display: block; font-weight: 800; color: #1E293B; font-size: 0.88rem; margin-bottom: 5px;\">\n                                  👤 Nombre del Docente Invitado:\n                              </label>';
let startIdx = html.indexOf(inputsStart);
if (startIdx > -1) {
    let parentStart = html.lastIndexOf('<div style=\"display: grid;', startIdx);
    let endIdx = html.indexOf('</div>', html.indexOf('Ej: Ciencias Naturales, Física')) + 6;
    html = html.substring(0, parentStart) + html.substring(endIdx);
}

const btnStart = '<div style=\"display: flex; gap: 10px; flex-wrap: wrap;\">\n                                      <button onclick=\"window.compartirInvitacionDocenteWhatsApp()\"';
startIdx = html.indexOf(btnStart);
if (startIdx > -1) {
    let endIdx = html.indexOf('</div>', startIdx) + 6;
    html = html.substring(0, startIdx) + html.substring(endIdx);
}

html = html.replace('function mostrarVista(id) {', 'function mostrarVista(id, pushState = true) {\n            if (pushState && id !== \'login-screen-container\') {\n                history.pushState({ vistaId: id }, \'\', \'?view=\' + id);\n            }');
const popStateCode = `
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.vistaId) {
                mostrarVista(e.state.vistaId, false);
            } else {
                mostrarVista('login-screen-container', false);
            }
        });
`;
html = html.replace('document.addEventListener(\'DOMContentLoaded\', () => {', 'document.addEventListener(\'DOMContentLoaded\', () => {' + popStateCode);

fs.writeFileSync('login.html', html, 'utf8');
console.log('login.html patched');

let js = fs.readFileSync('app.js', 'utf8');
js = js.replace(/const nombre = document\.getElementById\('admin-inv-nombre-input'\)\.value\.trim\(\);\s*const doc = document\.getElementById\('admin-inv-doc-input'\)\.value\.trim\(\);\s*const area = document\.getElementById\('admin-inv-area-input'\)\.value\.trim\(\);/, 'const nombre = "Enlace General Docentes";\nconst doc = "";\nconst area = "Todas";');

js = js.replace(/if \(!nombre\) \{\s*alert\("Por favor ingresa el nombre del docente a invitar\."\);\s*return;\s*\}/, '');

js = js.replace(/const urlDirecta = `\$\{window\.location\.origin\}\/login\.html\?token_docente=\$\{tokenUnico\}`;/, 'const urlDirecta = `${window.location.origin}/login.html?reg=docente`;');

let checkStr = `if (tokenDocente) {
        window.token_docente_magico = tokenDocente;
        document.getElementById('perfil-ingreso-select').value = 'docente';
        mostrarVista('login-screen-container');
        document.getElementById('docente-id-input').focus();
    }`;

let replaceCheckStr = `if (tokenDocente) {
        window.token_docente_magico = tokenDocente;
        document.getElementById('perfil-ingreso-select').value = 'docente';
        mostrarVista('login-screen-container');
        document.getElementById('docente-id-input').focus();
    }
    
    if (regDirecto === 'docente') {
        document.getElementById('perfil-ingreso-select').value = 'docente';
        document.getElementById('perfil-ingreso-select').disabled = true;
        abrirModalRegistroDocente();
    }`;

js = js.replace(checkStr, replaceCheckStr);
fs.writeFileSync('app.js', js, 'utf8');
console.log('app.js patched');
