import codecs
import re

try:
    with codecs.open("app.js", "r", "utf-8") as f:
        content = f.read()
    enc = "utf-8"
except UnicodeDecodeError:
    with codecs.open("app.js", "r", "latin-1") as f:
        content = f.read()
    enc = "latin-1"

# Normalize line endings
content = content.replace("\r\n", "\n")

# 1. Update the student top bar JS
search_student_logic = """                            const badgeMsg = document.getElementById("student-grade-badge");
                            if (badgeMsg) {
                                let badgeText = [];
                                if (data.grado) badgeText.push("Grado " + data.grado);
                                if (data.grupo) badgeText.push("Grupo " + data.grupo);
                                badgeMsg.innerText = badgeText.length > 0 ? badgeText.join(" | ") : "Estudiante";
                            }"""

replace_student_logic = """                            const badgeMsg = document.getElementById("student-grade-badge");
                            if (badgeMsg) {
                                let badgeText = [];
                                if (data.grado) badgeText.push("Grado " + data.grado);
                                if (data.grupo) badgeText.push("Grupo " + data.grupo);
                                badgeMsg.innerText = badgeText.length > 0 ? badgeText.join(" | ") : "Estudiante";
                            }
                            
                            const headerName = document.getElementById("header-student-name");
                            if (headerName) headerName.innerText = data.nombre;
                            const headerGrade = document.getElementById("header-student-grade");
                            if (headerGrade) headerGrade.innerText = data.grado || "N/A";"""

content = content.replace(search_student_logic, replace_student_logic)

# 2. Update modal-huevos to add the close button
search_modal = """    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 500px;">"""

replace_modal = """    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 500px; position: relative;">
            <button onclick="document.getElementById('modal-huevos').style.display='none'" style="position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 2rem; cursor: pointer; color: #9CA3AF; transition: color 0.2s;" onmouseover="this.style.color='#EF4444'" onmouseout="this.style.color='#9CA3AF'">&times;</button>"""

content = content.replace(search_modal, replace_modal)

with codecs.open("app.js", "w", enc) as f:
    f.write(content)

print("Modificaciones aplicadas con éxito a app.js usando codificación " + enc)
