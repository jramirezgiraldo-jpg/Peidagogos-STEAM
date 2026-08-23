const fs = require('fs');

// 1. Fix login.html generator to have a text input for Institution
let html = fs.readFileSync('login.html', 'utf8');
const oldSelectIE = `<select id="admin-inv-ie-select" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.9rem; background: white;">
                                <option value="IE Instituto Montenegro">IE Instituto Montenegro (Montenegro, Quindío)</option>
                                <option value="Colegio San José">Colegio San José</option>
                                <option value="Instituto Técnico Industrial">Instituto Técnico Industrial</option>
                            </select>`;
const newSelectIE = `<input type="text" id="admin-inv-ie-select" placeholder="Escribe el nombre de la institución..." value="IE Instituto Montenegro" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.9rem; box-sizing: border-box; background: white;">`;
html = html.replace(oldSelectIE, newSelectIE);

fs.writeFileSync('login.html', html, 'utf8');

// 2. Fix app.js URL generation to include IE and handle reg=docente cleanly
let appJs = fs.readFileSync('app.js', 'utf8');

const oldUrlFinal = "const urlFinal = `${baseUrl}?reg=docente`;";
const newUrlFinal = "const urlFinal = `${baseUrl}?reg=docente&ie=${encodeURIComponent(ie)}`;";
appJs = appJs.replace(oldUrlFinal, newUrlFinal);

const oldParamsLogic = `    if (params.get('reg') === 'docente') {
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
    }`;

const newParamsLogic = `    if (params.get('reg') === 'docente') {
        setTimeout(() => {
            if (typeof mostrarVista === 'function') {
                mostrarVista('register-screen-container');
            }
            
            const selIE = document.getElementById('reg-ie');
            if (selIE) {
                selIE.value = 'DocenteRegular';
                selIE.style.display = 'none'; // Hide it as requested by user
                if (typeof toggleIEOptions === 'function') toggleIEOptions();
            }

            const campoDocenteAsignatura = document.getElementById('campo-docente-asignatura');
            if (campoDocenteAsignatura) {
                campoDocenteAsignatura.style.display = 'none'; // Hide it as requested by user
            }
            
            const regDocenteIe = document.getElementById('reg-docente-ie-select');
            const ieParam = params.get('ie');
            if (regDocenteIe && ieParam) {
                // If it's a select and the value doesn't exist, we can't easily set it. 
                // But in this logic, we will force the value to be stored elsewhere or we inject an option.
                const option = document.createElement('option');
                option.value = ieParam;
                option.text = ieParam;
                regDocenteIe.appendChild(option);
                regDocenteIe.value = ieParam;
            }
        }, 500);
    }`;

appJs = appJs.replace(oldParamsLogic, newParamsLogic);

fs.writeFileSync('app.js', appJs, 'utf8');
