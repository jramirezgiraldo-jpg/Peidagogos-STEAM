import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Wrap the login grid in <div id="login-screen-container">
html = html.replace('<div id="view-landing" class="view active">', '<div id="login-screen-container">')
# Actually, let's just rename view-landing to login-screen-container
html = html.replace('id="view-landing"', 'id="login-screen-container"')

# 2. Re-create the Admin View if it was lost. We'll inject it right after login-screen-container.
admin_view_html = '''
        <!-- DASHBOARD ADMIN RECREADO -->
        <div id="dashboard-view" style="display: none; padding: 40px; font-family: Inter, sans-serif; background-color: #F8FAFC; height: 100vh; overflow-y: auto;">
            <h1 style="font-weight: 900; color: #1F2937;">Panel de Control Administrativo</h1>
            <p style="color: #6B7280; margin-bottom: 30px;">Bienvenido al centro de mando de Peidagogos STEAM.</p>
            
            <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); max-width: 600px;">
                <h2 style="font-weight: 800; font-size: 1.5rem; margin-bottom: 15px;">Centro de Producci&oacute;n Semanal</h2>
                <p style="color: #6B7280; margin-bottom: 20px;">Generador por lotes (Batch Processor) de Gu&iacute;as Pedag&oacute;gicas.</p>
                
                <label style="font-weight: bold; display: block; margin-bottom: 10px;">Selecciona la Semana:</label>
                <select id="select-semana-batch" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #ccc; margin-bottom: 20px;">
                    <option value="1">Semana 1</option>
                    <option value="2">Semana 2</option>
                    <option value="3">Semana 3</option>
                    <option value="4">Semana 4</option>
                    <option value="5">Semana 5</option>
                </select>
                
                <button id="btn-generar-batch" onclick="app && app.generarSemanaBatch ? app.generarSemanaBatch() : alert('El generador batch aÃºn requiere restaurar app.js')" style="width: 100%; background: #3B82F6; color: white; border: none; padding: 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s; font-size: 1.1rem;">
                    &#128640; Generar Lote de 216 Gu&iacute;as
                </button>
                
                <div id="batch-progress-container" class="d-none" style="margin-top: 20px;">
                    <p id="batch-status-text" style="font-weight: bold;">Inicializando generador...</p>
                    <div style="background: #e2e8f0; border-radius: 8px; height: 20px; overflow: hidden; margin-top: 10px;">
                        <div id="batch-progress-bar" style="background: #10B981; height: 100%; width: 0%; transition: width 0.3s;"></div>
                    </div>
                    <p id="batch-percentage" style="text-align: right; font-size: 0.9rem; margin-top: 5px;">0%</p>
                </div>
            </div>
        </div>
'''

# We need to insert this right after the closing div of login-screen-container.
# To be safe, we'll replace the DUMMY AUTH view with our new dashboard view.
html = re.sub(r'(?s)<!-- DUMMY AUTH PARA EVITAR ERRORES JS -->.*?<div id="view-auth" class="view d-none"></div>', admin_view_html.strip(), html)


# 3. Replace app.navigate() with Pure JS
pure_js_transition = '''
                // Transici&oacute;n Pure JS (Bypass sin framework)
                document.getElementById('login-screen-container').style.display = 'none';
                const dashboard = document.getElementById('dashboard-view');
                if(dashboard) dashboard.style.display = 'block';
                return;
'''
html = html.replace("app.navigate('view-admin');", pure_js_transition.strip())

# We also should make sure we didn't miss importing app.js so that the button actually works when clicked.
# Let's see if app.js is included. If not, add it right before our custom script.
if '<script src="js/app.js"></script>' not in html:
    html = html.replace('<script>', '<script src="js/app.js"></script>\n        <script>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
