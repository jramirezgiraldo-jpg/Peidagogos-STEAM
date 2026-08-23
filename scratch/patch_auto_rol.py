import re

with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    app = f.read()

target = """            const campoDocenteAsignatura = document.getElementById('campo-docente-asignatura');
            if (campoDocenteAsignatura) {
                campoDocenteAsignatura.style.display = 'none'; // Hide it as requested by user
            }"""

replacement = """            const campoDocenteAsignatura = document.getElementById('campo-docente-asignatura');
            if (campoDocenteAsignatura) {
                campoDocenteAsignatura.style.display = 'none'; // Hide it as requested by user
            }

            const rolParam = params.get('rol');
            const rolSelect = document.getElementById('reg-rol-docente-select');
            const campoRol = document.getElementById('campo-tipo-rol-docente');
            if (rolSelect && rolParam) {
                rolSelect.value = rolParam;
                if (campoRol) {
                    campoRol.style.display = 'none !important';
                }
            }"""

app = app.replace(target, replacement)

with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
    f.write(app)

print("app.js auto rol patched")
