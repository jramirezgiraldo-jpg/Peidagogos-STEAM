with open('js/app.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

import re

# Find the block inside if (data.status === 'success') { ... } else {
start_str = "if (data.status === 'success') {"
end_str = "} else {"
start_idx = js_content.find(start_str)
end_idx = js_content.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    new_logic = '''if (data.status === 'success') {
                    loginView.style.display = "none";
                    if (errorMsg) errorMsg.style.display = "none";
                    
                    // Mostrar vista de estudiante
                    const studentView = document.getElementById("student-dashboard-container");
                    if (studentView) {
                        studentView.style.display = "block";
                        // Saludo
                        const welcomeMsg = document.getElementById("student-welcome-name");
                        if (welcomeMsg) welcomeMsg.innerText = "Bienvenido/a, " + data.nombre;
                        
                        // Mostrar solo la malla de su grado
                        const gradoLimpio = data.grado.replace('°', '').trim(); // Limpiar el string por si viene como "6°" o "6"
                        const mallaEstudiante = document.getElementById("student-malla-" + gradoLimpio);
                        if (mallaEstudiante) mallaEstudiante.style.display = "block";
                    }
                '''
    js_content = js_content[:start_idx] + new_logic + js_content[end_idx:]

# Also add the event listener for admin-grade-selector at the end of DOMContentLoaded
end_dom = js_content.rfind("});")
if end_dom != -1:
    listener_logic = '''
    const adminSelector = document.getElementById("admin-grade-selector");
    if (adminSelector) {
        adminSelector.addEventListener("change", function() {
            document.querySelectorAll(".malla-view").forEach(m => m.style.display = "none");
            const grado = this.value.replace('°', '').trim();
            const malla = document.getElementById("admin-malla-" + grado);
            if (malla) malla.style.display = "block";
        });
    }
'''
    js_content = js_content[:end_dom] + listener_logic + js_content[end_dom:]

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
print("app.js actualizado con exito.")
