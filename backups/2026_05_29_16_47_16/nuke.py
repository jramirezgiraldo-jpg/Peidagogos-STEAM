import json
import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. NUKE THE HEADER
clean_header = '''
    <!-- SAAS HEADER PURE -->
    <header class="nuke-header">
        <nav class="nuke-nav container d-flex justify-content-between align-items-center py-3">
            <div class="nuke-logo d-flex align-items-center cursor-pointer" onclick="app.navigate('view-landing')">
                <span class="fs-4 fw-black text-dark">PEIDAGOGOS</span><span class="fs-4 fw-light text-primary ms-1">STEAM</span>
            </div>
            <div class="nuke-links d-none d-md-flex gap-4">
                <a href="#" class="nuke-link" onclick="app.navigate('view-landing')">Inicio</a>
                <a href="#bento-section" class="nuke-link">Metodolog&iacute;a</a>
                <a href="#creator-section" class="nuke-link">Misi&oacute;n</a>
            </div>
            <div class="nuke-cta">
                <button class="btn nuke-btn-primary" onclick="app.navigate('view-auth')">Ingresar</button>
            </div>
        </nav>
    </header>
'''
html = re.sub(r'(?s)<header.*?</header>', clean_header, html)

# 2. ADD BENTO GRID SECTION
bento_grid = '''
        <!-- BENTO GRID SECTION -->
        <section id="bento-section" class="bento-container py-5 mt-5">
            <div class="container">
                <div class="text-center mb-5">
                    <h2 class="fw-bold text-dark fs-1">Arquitectura del Aprendizaje</h2>
                    <p class="text-muted">Dise&ntilde;ado para la era digital.</p>
                </div>
                <div class="bento-grid">
                    <div class="bento-card bento-hero bg-primary text-white">
                        <div class="fs-1 mb-3">🎮</div>
                        <h3 class="fw-bold text-white">Gamificaci&oacute;n Absoluta</h3>
                        <p class="text-white">Cada respuesta correcta es recompensada con un sistema de botines y huevos coleccionables, manteniendo el cerebro comprometido.</p>
                    </div>
                    <div class="bento-card bg-white">
                        <div class="fs-1 mb-3">🔬</div>
                        <h3 class="fw-bold text-dark">Rigor Cient&iacute;fico</h3>
                        <p class="text-muted">Desarrollado bajo los est&aacute;ndares del ICFES para asegurar excelencia m&eacute;trica.</p>
                    </div>
                    <div class="bento-card bg-white">
                        <div class="fs-1 mb-3">⚡</div>
                        <h3 class="fw-bold text-dark">Motor Offline</h3>
                        <p class="text-muted">Funciona 100% sin internet, asegurando el acceso en aulas rurales y desconectadas.</p>
                    </div>
                    <div class="bento-card bento-wide bg-dark text-white">
                        <div class="fs-1 mb-3">🏆</div>
                        <h3 class="fw-bold text-white">Leaderboard Multijugador</h3>
                        <p class="text-white-50">Compite en tiempo real. Roba puntos, defiende tu posici&oacute;n y escala en la tabla de posiciones local.</p>
                    </div>
                </div>
            </div>
        </section>
'''
html = re.sub(r'(?s)<!-- Secci.*?n Creador -->', bento_grid + '\n\n        <!-- Secci&oacute;n Creador -->', html)

# 3. HTML ENTITIES REPLACEMENT
replacements = {
    'á': '&aacute;', 'é': '&eacute;', 'í': '&iacute;', 'ó': '&oacute;', 'ú': '&uacute;',
    'Á': '&Aacute;', 'É': '&Eacute;', 'Í': '&Iacute;', 'Ó': '&Oacute;', 'Ú': '&Uacute;',
    'ñ': '&ntilde;', 'Ñ': '&Ntilde;', '¿': '&iquest;', '¡': '&iexcl;'
}

for char, entity in replacements.items():
    html = html.replace(char, entity)

# Fix missing Meta
if '<meta charset="UTF-8">' not in html:
    html = html.replace('<head>', '<head>\n    <meta charset="UTF-8">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
