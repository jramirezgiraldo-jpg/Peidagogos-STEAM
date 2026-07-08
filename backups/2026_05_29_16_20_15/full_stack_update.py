import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_input = '''<input type="number" id="reg-documento" placeholder="Documento de Identidad (Usuario y Clave)" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-family: inherit; margin-bottom: 15px;">
        <input type="text" id="reg-apellidos"'''

html = html.replace('<input type="text" id="reg-apellidos"', new_input)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)


# 2. Update js/app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Since we completely replaced app.js in the previous step, there's no code to parse, just pure append or we can rebuild the whole file.
# The user asked to UPDATE the event of btnSubmitReg, but wait! The previous "Tierra Arrasada" prompt did NOT include the btnSubmitReg block!
# Oh!! The previous prompt:
# "BORRA COMPLETAMENTE todo el código JavaScript existente allí. No dejes ni una sola línea anterior."
# And the new code provided did NOT have the btnSubmitReg logic! It only had the "1. Mostrar Formulario" and "2. Cancelar", and "3. Motor de Autenticacion".
# Oh wow! So the tnSubmitReg code is GONE from pp.js right now!
# So I should APPEND the btnSubmitReg block.

new_js_block = '''
    if (btnSubmitReg) {
        btnSubmitReg.addEventListener('click', function(e) {
            e.preventDefault();
            const doc = document.getElementById('reg-documento') ? document.getElementById('reg-documento').value.trim() : '';
            const ap = document.getElementById('reg-apellidos').value.trim();
            const nom = document.getElementById('reg-nombre').value.trim();
            const ed = document.getElementById('reg-edad').value.trim();
            const gen = document.getElementById('reg-genero').value;
            const gra = document.getElementById('reg-grado').value;

            if (!doc || !ap || !nom || !ed || !gen || !gra) {
                alert('⚠️ Por favor, completa todos los campos, incluyendo el Documento.');
                return;
            }

            // Petición al servidor Python
            fetch('/api/registro-estudiante', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
            })
            .then(res => {
                if (res.ok) {
                    alert('✅ ¡Estudiante ' + nom + ' ' + ap + ' registrado exitosamente!');
                    // Limpiar campos
                    document.querySelectorAll('#register-screen-container input, #register-screen-container select').forEach(el => el.value = '');
                    regView.style.display = 'none';
                    loginView.style.display = 'grid';
                } else {
                    alert('❌ Error del servidor al registrar.');
                }
            })
            .catch(err => {
                console.error(err);
                alert('❌ El servidor Python no responde o está apagado.');
            });
        });
    }
'''

# Let's insert it before the last "});" in app.js
js = js.rstrip()
if js.endswith("});"):
    js = js[:-3] + new_js_block + "\n});\n"
else:
    js = js + new_js_block

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)


# 3. Update iniciar_clase.py
with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

python_handler = '''
        if parsed_path.path == '/api/registro-estudiante':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            print(f"[*] NUEVO ESTUDIANTE RECIBIDO: {data.get('nombre')} {data.get('apellidos')} - Doc: {data.get('documento')}")
            
            # TODO: Lógica futura para guardar en base de datos o JSON
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "Estudiante registrado"}).encode('utf-8'))
            return

        parsed_path = urlparse(self.path)
        if parsed_path.path == '/api/puntos':
'''

pycode = pycode.replace("parsed_path = urlparse(self.path)\\n        if parsed_path.path == '/api/puntos':", python_handler)

# The replace above will fail because of regex/escape issues, let's just do a direct string replace
target = "        parsed_path = urlparse(self.path)\n        if parsed_path.path == '/api/puntos':"
if target in pycode:
    pycode = pycode.replace(target, python_handler.replace("parsed_path = urlparse(self.path)\\n        if parsed_path.path == '/api/puntos':", target).strip())
    # Actually simpler:
    pass

with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    pycode = f.read()

parts = pycode.split("parsed_path = urlparse(self.path)\\n        if parsed_path.path == '/api/puntos':")
# Wait, let's use exact string split
target_str = "        parsed_path = urlparse(self.path)\n        if parsed_path.path == '/api/puntos':"
replacement_str = '''
        if parsed_path.path == '/api/registro-estudiante':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            print(f"[*] NUEVO ESTUDIANTE RECIBIDO: {data.get('nombre')} {data.get('apellidos')} - Doc: {data.get('documento')}")
            
            # TODO: Lógica futura para guardar en base de datos o JSON
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "Estudiante registrado"}).encode('utf-8'))
            return

''' + target_str

pycode = pycode.replace(target_str, replacement_str)

with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
    f.write(pycode)

