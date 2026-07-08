with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Admin Dashboard
admin_selector = '''
                    <!-- Selector de Grado Admin (NUEVO) -->
                    <div style="padding: 20px 30px; background: white; border-bottom: 1px solid #E5E7EB;">
                        <label for="admin-grade-selector" style="font-weight: bold; margin-right: 10px;">Selecciona un Grado:</label>
                        <select id="admin-grade-selector" style="padding: 10px; border-radius: 5px; border: 1px solid #ccc;">
                            <option value="">-- Elige un grado --</option>
                            <option value="6">Grado 6</option>
                            <option value="7">Grado 7</option>
                            <option value="8">Grado 8</option>
                            <option value="9">Grado 9</option>
                            <option value="10">Grado 10</option>
                            <option value="11">Grado 11</option>
                        </select>
                    </div>

                    <!-- Mallas Admin (NUEVO) -->
                    <div id="admin-malla-6" class="malla-view" style="display:none; padding:20px;"><h3>Malla Grado 6 (Docente)</h3><!-- Inyectar tabla de grado 6 aqui --></div>
                    <div id="admin-malla-7" class="malla-view" style="display:none; padding:20px;"><h3>Malla Grado 7 (Docente)</h3><!-- Inyectar tabla de grado 7 aqui --></div>
                    <div id="admin-malla-8" class="malla-view" style="display:none; padding:20px;"><h3>Malla Grado 8 (Docente)</h3><!-- Inyectar tabla de grado 8 aqui --></div>
                    <div id="admin-malla-9" class="malla-view" style="display:none; padding:20px;"><h3>Malla Grado 9 (Docente)</h3><!-- Inyectar tabla de grado 9 aqui --></div>
                    <div id="admin-malla-10" class="malla-view" style="display:none; padding:20px;"><h3>Malla Grado 10 (Docente)</h3><!-- Inyectar tabla de grado 10 aqui --></div>
                    <div id="admin-malla-11" class="malla-view" style="display:none; padding:20px;"><h3>Malla Grado 11 (Docente)</h3><!-- Inyectar tabla de grado 11 aqui --></div>
'''

if "<!-- PestaÃ±as de Grado -->" in html:
    html = html.replace("<!-- PestaÃ±as de Grado -->", admin_selector + "\n                    <!-- PestaÃ±as de Grado -->")
elif "<!-- Pestañas de Grado -->" in html:
    html = html.replace("<!-- Pestañas de Grado -->", admin_selector + "\n                    <!-- Pestañas de Grado -->")
else:
    # Fallback to before Fila Producción Pedagógica
    if "<!-- Fila Producci" in html:
        idx = html.find("<!-- Fila Producci")
        html = html[:idx] + admin_selector + "\n" + html[idx:]

# 2. Add Student Dashboard
student_dashboard = '''
<!-- DASHBOARD ESTUDIANTE RECREADO -->
<div id="student-dashboard-container" style="display: none; height: 100vh; overflow-y: auto; background-color: #F0FDF4;">
    <header style="background: white; border-bottom: 1px solid #E5E7EB; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-weight: 900; font-size: 1.4rem; color: #111827;">
            <img src="logo-peidagogos.png" alt="Peidagogos STEAM" style="height: 55px; width: auto; object-fit: contain;">
        </div>
        <div style="display: flex; align-items: center; gap: 15px;">
            <button onclick="location.reload()" style="background: #EF4444; color: white; border: none; padding: 8px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Cerrar Sesi&oacute;n</button>
        </div>
    </header>
    <div style="padding: 40px 30px; max-width: 1200px; margin: 0 auto;">
        <div style="background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); overflow: hidden; padding: 30px;">
            <h2 id="student-welcome-name" style="color: #065F46; font-size: 2rem; margin-bottom: 20px;"></h2>
            
            <!-- Mallas Estudiante -->
            <div id="student-malla-6" style="display:none; padding:20px; background:#F9FAFB; border-radius:8px;"><h3>Tus Actividades (Grado 6)</h3><!-- Inyectar tabla de grado 6 aqui --></div>
            <div id="student-malla-7" style="display:none; padding:20px; background:#F9FAFB; border-radius:8px;"><h3>Tus Actividades (Grado 7)</h3><!-- Inyectar tabla de grado 7 aqui --></div>
            <div id="student-malla-8" style="display:none; padding:20px; background:#F9FAFB; border-radius:8px;"><h3>Tus Actividades (Grado 8)</h3><!-- Inyectar tabla de grado 8 aqui --></div>
            <div id="student-malla-9" style="display:none; padding:20px; background:#F9FAFB; border-radius:8px;"><h3>Tus Actividades (Grado 9)</h3><!-- Inyectar tabla de grado 9 aqui --></div>
            <div id="student-malla-10" style="display:none; padding:20px; background:#F9FAFB; border-radius:8px;"><h3>Tus Actividades (Grado 10)</h3><!-- Inyectar tabla de grado 10 aqui --></div>
            <div id="student-malla-11" style="display:none; padding:20px; background:#F9FAFB; border-radius:8px;"><h3>Tus Actividades (Grado 11)</h3><!-- Inyectar tabla de grado 11 aqui --></div>
        </div>
    </div>
</div>
'''

# Insert student dashboard before <script src="js/app.js"></script>
script_tag = '<script src="js/app.js"></script>'
if script_tag in html:
    html = html.replace(script_tag, student_dashboard + "\n" + script_tag)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("index.html actualizado con placeholders de malla.")
