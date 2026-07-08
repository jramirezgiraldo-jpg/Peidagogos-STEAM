import re

html_to_inject = '''
<div id="login-module" style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
    <input type="text" id="admin-user" placeholder="Usuario" style="padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-family: Inter, sans-serif;">
    <input type="password" id="admin-pass" placeholder="Contrase&ntilde;a" style="padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-family: Inter, sans-serif;">
    <button id="btn-login-core" style="background-color: #2C3E50; color: white; padding: 10px; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.3s;">Iniciar Sesi&oacute;n</button>
    <div id="login-error-msg" style="color: #e74c3c; font-size: 12px; display: none;">Credenciales incorrectas.</div>
</div>
'''

js_to_inject = '''
<script>
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('btn-login-core');
    const userField = document.getElementById('admin-user');
    const passField = document.getElementById('admin-pass');
    const errorMsg = document.getElementById('login-error-msg');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Detiene recargas fantasma
            
            const username = userField.value.trim();
            const password = passField.value.trim();
            
            // 1. Hardcode Bypass de Administrador (Prioridad Máxima)
            if (username === 'jramirezgiraldo' && password === 'Biol2008%') {
                console.log('Login Admin Exitoso - Bypass activado');
                // Cambia 'dashboard.html' por la ruta real de tu panel
                window.location.href = 'dashboard.html'; 
                return;
            }

            // 2. Fetch al Backend Python (Para otros usuarios)
            fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: username, pass: password })
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = 'dashboard.html';
                } else {
                    errorMsg.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error en el servidor:', error);
                errorMsg.innerHTML = 'Error de conexi&oacute;n con el servidor.';
                errorMsg.style.display = 'block';
            });
        });
    } else {
        console.error('ERROR DOM: No se encontró el botón btn-login-core');
    }
});
</script>
'''

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the previous login-container with the new login-module
# The previous block was <div id="login-container"...>...</div>
html = re.sub(r'(?s)<div id="login-container".*?</div>', html_to_inject.strip(), html)

# Inject JS right before </body>
html = html.replace('</body>', js_to_inject.strip() + '\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
