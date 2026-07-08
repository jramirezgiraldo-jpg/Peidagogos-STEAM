import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace dashboard-view with dashboard-screen-container
html = html.replace('id="dashboard-view"', 'id="dashboard-screen-container"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)


# 2. Overwrite js/app.js completely with the provided code
new_js = '''document.addEventListener('DOMContentLoaded', function() {
    const btnShowReg = document.getElementById('btn-show-register');
    const btnCancelReg = document.getElementById('btn-cancel-register');
    const loginView = document.getElementById('login-screen-container');
    const regView = document.getElementById('register-screen-container');
    const dashboardView = document.getElementById('dashboard-screen-container'); // NUEVO
    const feedback = document.getElementById('reg-feedback-msg');

    const loginBtn = document.getElementById('btn-login-core');
    const userField = document.getElementById('admin-user');
    const passField = document.getElementById('admin-pass');
    const errorMsg = document.getElementById('login-error-msg');

    if (btnShowReg && loginView && regView) {
        btnShowReg.addEventListener('click', function(e) {
            e.preventDefault();
            loginView.style.display = 'none';
            regView.style.display = 'flex';
        });
    }

    if (btnCancelReg && loginView && regView) {
        btnCancelReg.addEventListener('click', function(e) {
            e.preventDefault();
            regView.style.display = 'none';
            loginView.style.display = 'grid';
            if (feedback) feedback.style.display = 'none';
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const username = userField ? userField.value.trim() : '';
            const password = passField ? passField.value.trim() : '';
            
            if (username === 'jramirezgiraldo' && password === 'Biol2008%') {
                if (loginView) loginView.style.display = 'none';
                if (dashboardView) {
                    dashboardView.style.display = 'block'; // ENCIENDE EL DASHBOARD
                } else {
                    console.error("ERROR: No se encontró el id 'dashboard-screen-container' en el HTML.");
                }
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

