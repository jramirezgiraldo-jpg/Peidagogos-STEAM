const fs = require('fs');
let jsContent = fs.readFileSync('app.js', 'utf8');

// Update URL generation in generarInvitacionDocenteIntransferible
const appJsFindUrl = "const urlFinal = `${baseUrl}?token_docente=${token}&ie=${encodeURIComponent(ie)}&nombre_doc=${encodeURIComponent(nombre)}&doc=${encodeURIComponent(documento)}&materia=${encodeURIComponent(materia)}&rol=docente`;";
const appJsReplaceUrl = "const urlFinal = `${baseUrl}?reg=docente`;";
jsContent = jsContent.replace(appJsFindUrl, appJsReplaceUrl);

// Update link logic to catch ?reg=docente
const paramCheck = `const params = new URLSearchParams(window.location.search);`;
const appendLogic = `const params = new URLSearchParams(window.location.search);
    if (params.get('reg') === 'docente') {
        setTimeout(() => {
            const el = document.getElementById('perfil-ingreso-select');
            if (el) {
                el.value = 'docente';
                el.disabled = true;
                if (typeof abrirModalRegistroDocente === 'function') {
                    abrirModalRegistroDocente();
                }
            }
        }, 500);
    }
`;
jsContent = jsContent.replace(paramCheck, appendLogic);

fs.writeFileSync('app.js', jsContent, 'utf8');
