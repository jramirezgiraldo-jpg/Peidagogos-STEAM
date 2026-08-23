const fs = require('fs');
let jsContent = fs.readFileSync('app.js', 'utf8');

const appJsFind = `    const inNom = document.getElementById('admin-inv-nombre-input');
    const inDoc = document.getElementById('admin-inv-doc-input');
    const inMat = document.getElementById('admin-inv-materia-input');

    const ie = selIE ? selIE.value : 'IE Instituto Montenegro';
    const nombre = inNom ? inNom.value.trim() : '';
    const documento = inDoc ? inDoc.value.trim() : '';
    const materia = inMat ? inMat.value.trim() : 'Ciencias Naturales y Educación Ambiental';

    if (!nombre) {
        alert("⚠️ Por favor ingresa el nombre del docente a invitar.");
        if (inNom) inNom.focus();
        return;
    }`;

const appJsReplace = `    const ie = selIE ? selIE.value : 'IE Instituto Montenegro';
    const nombre = "Enlace General Docentes";
    const documento = "";
    const materia = "Todas";`;

jsContent = jsContent.replace(appJsFind, appJsReplace);

const oldUrl = 'const urlDirecta = `${window.location.origin}/login.html?token_docente=${tokenUnico}`;';
const newUrl = 'const urlDirecta = `${window.location.origin}/login.html?reg=docente`;';
jsContent = jsContent.replace(oldUrl, newUrl);

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

jsContent = jsContent.replace(checkStr, replaceCheckStr);

fs.writeFileSync('app.js', jsContent, 'utf8');
