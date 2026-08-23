import re
with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    app = f.read()

target = """    window.renderizarDashboardEstudiante();
    
    // Disparador de Alerta Disciplinaria (Ejemplo Aleatorio 5%)"""

replacement = """    window.renderizarDashboardEstudiante();
    
    if (typeof window.renderizarInboxEstudiante === 'function') {
        window.renderizarInboxEstudiante(); // Update inbox badge initially
    }
    
    // Disparador de Alerta Disciplinaria (Ejemplo Aleatorio 5%)"""

if target in app:
    app = app.replace(target, replacement)
    with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
        f.write(app)
    print('patched init for inbox')
else:
    print('target not found')
