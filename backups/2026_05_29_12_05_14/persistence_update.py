import re

# 1. Update iniciar_clase.py
with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

target_str = "            # TODO: Lógica futura para guardar en base de datos o JSON"
replacement_str = '''            import os
            usuarios_file = "usuarios.json"
            if not os.path.exists(usuarios_file):
                with open(usuarios_file, "w", encoding="utf-8") as f:
                    json.dump([], f)
            with open(usuarios_file, "r", encoding="utf-8") as f:
                usuarios = json.load(f)
            nuevo_estudiante = {
                "documento": data.get("documento"),
                "apellidos": data.get("apellidos"),
                "nombre": data.get("nombre"),
                "edad": data.get("edad"),
                "genero": data.get("genero"),
                "grado": data.get("grado"),
                "rol": "estudiante"
            }
            usuarios.append(nuevo_estudiante)
            with open(usuarios_file, "w", encoding="utf-8") as f:
                json.dump(usuarios, f, indent=4)'''

pycode = pycode.replace(target_str, replacement_str)

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(pycode)

# 2. Update js/app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

new_js_block = '''    const btnSubmitReg = document.getElementById('btn-submit-register');
    const feedbackMsg = document.getElementById('reg-feedback-msg'); // Mensaje en pantalla
    
    if (btnSubmitReg) {
        btnSubmitReg.addEventListener('click', async function(e) {
            e.preventDefault();
            const doc = document.getElementById('reg-documento') ? document.getElementById('reg-documento').value.trim() : '';
            const ap = document.getElementById('reg-apellidos') ? document.getElementById('reg-apellidos').value.trim() : '';
            const nom = document.getElementById('reg-nombre') ? document.getElementById('reg-nombre').value.trim() : '';
            const ed = document.getElementById('reg-edad') ? document.getElementById('reg-edad').value.trim() : '';
            const gen = document.getElementById('reg-genero') ? document.getElementById('reg-genero').value : '';
            const gra = document.getElementById('reg-grado') ? document.getElementById('reg-grado').value : '';

            if (!doc || !ap || !nom || !ed || !gen || !gra) {
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '⚠️ Completa todos los campos, incluyendo el documento.'; }
                return;
            }

            btnSubmitReg.innerText = 'Guardando...';
            btnSubmitReg.disabled = true;

            try {
                const response = await fetch('/api/registro-estudiante', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
                });
                
                if (response.ok) {
                    if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#10B981'; feedbackMsg.innerText = '✅ Estudiante guardado con éxito.'; }
                    setTimeout(() => {
                        document.getElementById('register-screen-container').style.display = 'none';
                        document.getElementById('login-screen-container').style.display = 'grid';
                        btnSubmitReg.innerText = 'Crear Estudiante';
                        btnSubmitReg.disabled = false;
                        if(feedbackMsg) feedbackMsg.style.display = 'none';
                        document.querySelectorAll('#register-screen-container input, #register-screen-container select').forEach(el => el.value = '');
                    }, 2000);
                } else {
                    throw new Error('Fallo en el servidor');
                }
            } catch (error) {
                console.error(error);
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '❌ Error de conexión con el motor Python.'; }
                btnSubmitReg.innerText = 'Crear Estudiante';
                btnSubmitReg.disabled = false;
            }
        });
    }'''

# Replace the old if (btnSubmitReg) { ... } with the new block.
# Since we injected it at the end of the file just before "});"
old_block_pattern = r'if \(btnSubmitReg\) \{[\s\S]*\}\s*\}\s*$'

# Actually, the file ends with:
#         });
#     }
# });
# We can just do a regex sub or since we appended it last time, we can chop it off and append.
import re
js_without_old_block = re.sub(r'if\s*\(btnSubmitReg\)\s*\{[\s\S]*?\}\s*\}\s*\}\);\s*$', '});', js)

js_final = js_without_old_block.replace('});', new_js_block + '\\n});')
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js_final)

# 3. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the existing feedback div with the precise one requested
html = re.sub(r'<div id="reg-feedback-msg".*?</div>', '<div id="reg-feedback-msg" style="margin-top:15px; font-weight:bold; text-align:center; display:none;"></div>', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
