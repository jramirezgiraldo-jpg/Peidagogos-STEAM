import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# The user wants to replace from <div id="login-screen-container" ... to the end of <div id="register-screen-container" ... </div>
# I'll use regex to find and replace both blocks.

# Pattern to capture everything from <div id="login-screen-container" until the end of <div id="register-screen-container" ... </div> 
# Since they are siblings or close, we can just replace the whole chunk.

pattern = re.compile(r'<div id="login-screen-container".*?</div>\s*</div>\s*<div id="register-screen-container".*?</div>\s*</div>', re.DOTALL)

replacement = '''<div id="login-screen-container" style="display: grid; grid-template-columns: 1fr 1fr; height: 100vh; overflow: hidden; background-color: #f8f9fa;">
    <div style="padding: 5% 10%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <img src="logo-peidagogos.png" alt="Logo Peidagogos STEAM" style="max-width: 200px; height: auto; object-fit: contain; margin-bottom: 20px;">
        <h2 style="font-size: 2.2rem; font-weight: 800; color: #111827; margin: 0; line-height: 1.2;">Arquitectura del Aprendizaje</h2>
        <p style="font-size: 1rem; color: #6B7280; margin: 10px 0 30px 0;">Plataforma dise&ntilde;ada para la era digital.</p>
    </div>
    <div style="padding: 5% 15%; display: flex; flex-direction: column; justify-content: center; background-color: #ffffff; border-left: 1px solid #e5e7eb;">
        <h2 style="font-size: 2rem; font-weight: 800; color: #111827; margin: 0;">Portal de Acceso</h2>
        <p style="font-size: 1rem; color: #6B7280; margin: 10px 0 30px 0;">Selecciona tu v&iacute;a de ingreso.</p>
        
        <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
            <input type="text" id="admin-user" placeholder="Usuario" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
            <input type="password" id="admin-pass" placeholder="Contrase&ntilde;a" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
            <button id="btn-login-core" style="background-color: #2C3E50; color: white; padding: 14px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Iniciar Sesi&oacute;n</button>
            <div id="login-error-msg" style="color: #e74c3c; font-size: 0.85rem; display: none;">Credenciales incorrectas.</div>
        </div>
        <button id="btn-show-register" style="background: transparent; color: #374151; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-weight: 500; cursor: pointer; text-align: left;">👤 Nuevo Usuario</button>
    </div>
</div>

<div id="register-screen-container" style="display: none; height: 100vh; background-color: #f3f4f6; justify-content: center; align-items: center; padding: 20px;">
    <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 15px;">
        <div style="text-align: center; margin-bottom: 10px;">
            <h2 style="font-size: 1.8rem; font-weight: 800; color: #111827; margin: 0;">Registro de Estudiante</h2>
        </div>
        <input type="number" id="reg-documento" placeholder="Documento de Identidad" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
        <input type="text" id="reg-apellidos" placeholder="Apellidos" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
        <input type="text" id="reg-nombre" placeholder="Nombres" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <input type="number" id="reg-edad" placeholder="Edad" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
            <select id="reg-genero" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
                <option value="">G&eacute;nero...</option><option value="F">Femenino</option><option value="M">Masculino</option>
            </select>
        </div>
        <select id="reg-grado" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
            <option value="">Grado a cursar...</option><option value="6">6&deg;</option><option value="7">7&deg;</option><option value="8">8&deg;</option><option value="9">9&deg;</option><option value="10">10&deg;</option><option value="11">11&deg;</option>
        </select>
        <button id="btn-submit-register" style="background-color: #10B981; color: white; padding: 14px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Crear Estudiante</button>
        <button id="btn-cancel-register" style="background-color: transparent; color: #6B7280; padding: 10px; border: none; cursor: pointer; text-decoration: underline;">Volver al Acceso Principal</button>
        <div id="reg-feedback-msg" style="text-align: center; font-size: 0.9rem; display: none; font-weight: bold;"></div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const loginView = document.getElementById('login-screen-container');
    const regView = document.getElementById('register-screen-container');
    const dashboardView = document.getElementById('dashboard-screen-container');

    // Transiciones de vistas
    document.body.addEventListener('click', function(e) {
        if (e.target.id === 'btn-show-register') {
            e.preventDefault();
            if (loginView) loginView.style.display = 'none';
            if (regView) regView.style.display = 'flex';
        }
        if (e.target.id === 'btn-cancel-register') {
            e.preventDefault();
            if (regView) regView.style.display = 'none';
            if (loginView) loginView.style.display = 'grid';
        }
        
        // Login de Administrador
        if (e.target.id === 'btn-login-core') {
            e.preventDefault();
            const user = document.getElementById('admin-user').value.trim();
            const pass = document.getElementById('admin-pass').value.trim();
            if (user === 'jramirezgiraldo' && pass === 'Biol2008%') {
                if (loginView) loginView.style.display = 'none';
                if (dashboardView) dashboardView.style.display = 'block';
            } else {
                const err = document.getElementById('login-error-msg');
                if (err) err.style.display = 'block';
            }
        }
    });
});
</script>'''

# Because my regex might be fragile if the user added spaces, I will manually slice the file.
# Find start of login-screen-container
start_idx = html.find('<div id="login-screen-container"')
# Find where the dashboard-screen-container starts, we delete up to there.
end_idx = html.find('<!-- DASHBOARD ADMIN RECREADO -->')
if end_idx == -1:
    end_idx = html.find('<div id="dashboard-screen-container"')

if start_idx != -1 and end_idx != -1:
    new_html = html[:start_idx] + replacement + "\n\n" + html[end_idx:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("Replaced successfully via slice.")
else:
    print("Error finding boundaries.")

