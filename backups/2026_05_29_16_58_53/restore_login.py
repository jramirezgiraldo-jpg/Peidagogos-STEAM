import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_login_screen = '''<div id="login-screen-container" style="display: grid; grid-template-columns: 1fr 1fr; height: 100vh; overflow: hidden; background-color: #f8f9fa;">
    
    <!-- LADO IZQUIERDO -->
    <div style="padding: 5% 10%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        
        <img src="logo-peidagogos.png" alt="Logo Peidagogos STEAM" style="max-width: 200px; height: auto; object-fit: contain; margin-bottom: 20px;">
        <h2 style="font-size: 2.2rem; font-weight: 800; color: #111827; margin: 0; line-height: 1.2;">Arquitectura del Aprendizaje</h2>
        <p style="font-size: 1rem; color: #6B7280; margin: 10px 0 30px 0;">Plataforma dise&ntilde;ada para la era digital.</p>
        
        <!-- BENTO GRID -->
        <div style="display: grid; grid-template-columns: 1fr; gap: 15px; width: 100%; max-width: 400px; text-align: left;">
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 24px;">🎮</span>
                <div><strong style="color: #111827; display:block;">Gamificaci&oacute;n</strong><span style="font-size: 0.85rem; color: #6B7280;">Sistema de recompensas y progreso.</span></div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <span style="font-size: 20px; display:block; margin-bottom:5px;">🧬</span>
                    <strong style="color: #111827; font-size: 0.9rem; display:block;">Adaptativo</strong><span style="font-size: 0.75rem; color: #6B7280;">Est&aacute;ndares ICFES.</span>
                </div>
                <div style="background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <span style="font-size: 20px; display:block; margin-bottom:5px;">🧠</span>
                    <strong style="color: #111827; font-size: 0.9rem; display:block;">Aut&oacute;nomo</strong><span style="font-size: 0.75rem; color: #6B7280;">Motor 100% offline.</span>
                </div>
            </div>
        </div>
    </div>

    <!-- LADO DERECHO -->
    <div style="padding: 5% 15%; display: flex; flex-direction: column; justify-content: center; background-color: #ffffff; border-left: 1px solid #e5e7eb;">
        <h2 style="font-size: 2rem; font-weight: 800; color: #111827; margin: 0;">Portal de Acceso</h2>
        <p style="font-size: 1rem; color: #6B7280; margin: 10px 0 30px 0;">Selecciona tu v&iacute;a de ingreso a la plataforma.</p>
        
        <!-- LOGIN CORE -->
        <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 30px;">
            <input type="text" id="admin-user" placeholder="Usuario" style="padding: 12px 15px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; font-family: inherit;">
            <input type="password" id="admin-pass" placeholder="Contrase&ntilde;a" style="padding: 12px 15px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; font-family: inherit;">
            <button id="btn-login-core" style="background-color: #2C3E50; color: white; padding: 14px; border: none; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: background-color 0.3s;">Iniciar Sesi&oacute;n</button>
            <div id="login-error-msg" style="color: #e74c3c; font-size: 0.85rem; display: none;">Credenciales incorrectas.</div>
        </div>

        <!-- AUTH ACTIONS -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <button style="background: transparent; color: #374151; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-weight: 500; cursor: pointer; text-align: left;">👤 Nuevo Usuario</button>
            <button style="background: transparent; color: #374151; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-weight: 500; cursor: pointer; text-align: left;">🏠 HomeSchool</button>
            <button style="background: transparent; color: #374151; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-weight: 500; cursor: pointer; text-align: left;">🎓 Validar Bachillerato</button>
        </div>
    </div>
</div>'''

pattern = r'(?s)<div id="login-screen-container">.*?<!-- DASHBOARD ADMIN RECREADO -->'
replacement = new_login_screen + '\n        \n        <!-- DASHBOARD ADMIN RECREADO -->'

html = re.sub(pattern, replacement, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
