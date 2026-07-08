import re

# FASE 1: Parche en app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

new_block = '''    const btnSubmit = document.getElementById("btn-submit-register");
    if (btnSubmit) {
        btnSubmit.addEventListener("click", function(e) {
            e.preventDefault();
            
            const doc = document.getElementById("reg-documento") ? document.getElementById("reg-documento").value.trim() : "";
            const ap = document.getElementById("reg-apellidos") ? document.getElementById("reg-apellidos").value.trim() : "";
            const nom = document.getElementById("reg-nombre") ? document.getElementById("reg-nombre").value.trim() : "";
            const ed = document.getElementById("reg-edad") ? document.getElementById("reg-edad").value.trim() : "";
            const gen = document.getElementById("reg-genero") ? document.getElementById("reg-genero").value : "";
            const gra = document.getElementById("reg-grado") ? document.getElementById("reg-grado").value : "";

            if (!doc || !ap || !nom || !ed || !gen || !gra) {
                alert("⚠️ Por favor, completa todos los campos.");
                return;
            }

            btnSubmit.innerText = "Guardando...";
            btnSubmit.disabled = true;

            fetch("/api/registro-estudiante", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
            })
            .then(function(response) {
                if (response.ok) {
                    alert("✅ Estudiante registrado exitosamente.");
                    // Resetear formulario y volver
                    document.getElementById("register-screen-container").style.display = "none";
                    document.getElementById("login-screen-container").style.display = "grid";
                    document.getElementById("reg-documento").value = "";
                    document.getElementById("reg-apellidos").value = "";
                    document.getElementById("reg-nombre").value = "";
                    document.getElementById("reg-edad").value = "";
                    document.getElementById("reg-genero").value = "";
                    document.getElementById("reg-grado").value = "";
                } else {
                    alert("❌ Error interno del servidor al guardar.");
                }
                btnSubmit.innerText = "Crear Estudiante";
                btnSubmit.disabled = false;
            })
            .catch(function(error) {
                alert("❌ Error de red. ¿Está ejecutándose el servidor Python?");
                btnSubmit.innerText = "Crear Estudiante";
                btnSubmit.disabled = false;
            });
        });
    }'''

js_code = re.sub(r'\}\);\s*$', '\\n' + new_block + '\\n});', js_code)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js_code)

# FASE 2: Auditoría en iniciar_clase.py
with open('iniciar_clase.py', 'r', encoding='utf-8') as f:
    py_code = f.read()

# Check if route exists
if '/api/registro-estudiante' not in py_code:
    # We must insert the route.
    target = "        parsed_path = urlparse(self.path)\n        if parsed_path.path == '/api/puntos':"
    route_code = '''
        if parsed_path.path == '/api/registro-estudiante':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            import json, os
            data = json.loads(post_data.decode('utf-8'))
            print(f"[*] NUEVO ESTUDIANTE RECIBIDO: {data.get('nombre')} {data.get('apellidos')} - Doc: {data.get('documento')}")
            
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
                json.dump(usuarios, f, indent=4)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "Estudiante registrado"}).encode('utf-8'))
            return
            
''' + target
    py_code = py_code.replace(target, route_code)
    with open('iniciar_clase.py', 'w', encoding='utf-8') as f:
        f.write(py_code)
    print("Ruta inyectada.")
else:
    print("La ruta /api/registro-estudiante ya existe y está operativa.")

