import re

# 1. Overwrite js/app.js completely with the provided code
new_js = '''document.addEventListener('DOMContentLoaded', function() {
    // Referencias al DOM (Registro)
    const btnShowReg = document.getElementById('btn-show-register');
    const btnCancelReg = document.getElementById('btn-cancel-register');
    const loginView = document.getElementById('login-screen-container');
    const regView = document.getElementById('register-screen-container');
    const feedback = document.getElementById('reg-feedback-msg');

    // Referencias al DOM (Login)
    const loginBtn = document.getElementById('btn-login-core');
    const userField = document.getElementById('admin-user');
    const passField = document.getElementById('admin-pass');
    const errorMsg = document.getElementById('login-error-msg');

    // 1. Mostrar el Formulario de Registro SPA
    if (btnShowReg && loginView && regView) {
        btnShowReg.addEventListener('click', function(e) {
            e.preventDefault();
            loginView.style.display = 'none';
            regView.style.display = 'flex';
        });
    }

    // 2. Cancelar y Volver al Login SPA
    if (btnCancelReg && loginView && regView) {
        btnCancelReg.addEventListener('click', function(e) {
            e.preventDefault();
            regView.style.display = 'none';
            loginView.style.display = 'grid';
            if (feedback) feedback.style.display = 'none';
        });
    }

    // 3. Motor de Autenticaci\u00f3n (Bypass Administrador)
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const username = userField ? userField.value.trim() : '';
            const password = passField ? passField.value.trim() : '';
            
            if (username === 'jramirezgiraldo' && password === 'Biol2008%') {
                // Si el login es correcto, oculta la pantalla de login 
                // Nota: Aqu\u00ed debes asegurarte de que tu contenedor del tablero se muestre
                if (loginView) loginView.style.display = 'none';
                console.log('Ingreso exitoso al Hub de Administraci\u00f3n');
            } else {
                if (errorMsg) {
                    errorMsg.style.display = 'block';
                    errorMsg.innerText = 'Usuario o clave incorrecta.';
                }
            }
        });
    }
});
'''

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(new_js)

# 2. Clean up index.html to remove the old broken inline <script> block
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the inline script that handles the old logic (from document.addEventListener to its closing tag)
# The <script src="js/app.js"></script> will remain
pattern = r'<script>\s*document\.addEventListener\(\'DOMContentLoaded\'.*?</script>'
html = re.sub(pattern, '', html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
