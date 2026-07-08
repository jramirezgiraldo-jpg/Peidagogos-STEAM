import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_form_html = '''
                            <div id="login-container" style="margin-bottom: 20px; width: 100%;">
                                <input id="login-username" type="text" class="form-control mb-3" placeholder="Usuario" style="border-radius: 12px; padding: 1rem;">
                                <input id="login-password" type="password" class="form-control mb-3" placeholder="Contrase&ntilde;a" style="border-radius: 12px; padding: 1rem;">
                                <button id="btn-ingresar" class="auth-btn btn-primary-split" style="width: 100%; justify-content: center;">
                                    <i class="ph ph-identification-badge"></i>
                                    <span>Iniciar Sesi&oacute;n</span>
                                </button>
                            </div>
'''

# Replace the existing form-login block with the new container
html = re.sub(r'(?s)<form id="form-login".*?</form>', new_form_html.strip(), html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)


# 2. Update js/app.js
with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Update init to bind event
init_replacement = '''
    init() {
        this.checkAuthStatus();
        this.renderGruposAdmin();
        
        const btnIngresar = document.getElementById('btn-ingresar');
        if (btnIngresar) {
            btnIngresar.addEventListener('click', (e) => this.handleLogin(e));
        }
    },
'''
js = re.sub(r'(?s)    init\(\) \{.*?\},', init_replacement.strip() + ',', js, count=1)

# Update handleLogin
handle_login_replacement = '''
    handleLogin(e) {
        if(e) e.preventDefault();
        console.log("Intento de ingreso detectado");
        const user = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value.trim();
        console.log("Valores capturados:", user, pass);
'''
js = re.sub(r'(?s)    handleLogin\(e\) \{.*?console\.log\("Valores capturados:", user, pass\);', handle_login_replacement.strip(), js, count=1)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
