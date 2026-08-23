const fs = require('fs');
let html = fs.readFileSync('login.html', 'utf8');

const strToRemove = `                        <div>
                            <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.88rem; margin-bottom: 5px;">
                                👨‍🏫 Nombre del Docente Invitado:
                            </label>
                            <input type="text" id="admin-inv-nombre-input" placeholder="Ej: Lic. Jorge Eliécer" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.9rem; box-sizing: border-box;">
                        </div>

                        <div>
                            <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.88rem; margin-bottom: 5px;">
                                📚 Materias / Área:
                            </label>
                            <input type="text" id="admin-inv-materia-input" placeholder="Ej: Ciencias Naturales, Física" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.9rem; box-sizing: border-box;">
                        </div>`;

html = html.replace(strToRemove, '');
fs.writeFileSync('login.html', html, 'utf8');

let jsContent = fs.readFileSync('app.js', 'utf8');

// Replace the inputs reading
const appJsFind = `    const nombre = document.getElementById('admin-inv-nombre-input').value.trim();
    const doc = document.getElementById('admin-inv-doc-input').value.trim();
    const materia = document.getElementById('admin-inv-materia-input').value.trim();

    if (!nombre) {
        alert("Por favor ingresa el nombre del docente a invitar.");
        return;
    }`;

const appJsReplace = `    const nombre = "Enlace General Docentes";
    const doc = "";
    const materia = "Todas";`;

jsContent = jsContent.replace(appJsFind, appJsReplace);

const oldUrl = 'const urlDirecta = `${window.location.origin}/login.html?token_docente=${tokenUnico}`;';
const newUrl = 'const urlDirecta = `${window.location.origin}/login.html?reg=docente`;';
jsContent = jsContent.replace(oldUrl, newUrl);

fs.writeFileSync('app.js', jsContent, 'utf8');

