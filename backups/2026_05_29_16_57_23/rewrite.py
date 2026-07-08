import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Ensure Phosphor Icons
if 'phosphor-icons' not in html:
    html = html.replace('</head>', '    <script src="https://unpkg.com/@phosphor-icons/web"></script>\n</head>')

# Ensure Meta Charset UTF-8
if '<meta charset="UTF-8">' not in html:
    html = html.replace('<head>', '<head>\n    <meta charset="UTF-8">')

# Extract SVG Logo from old header to keep it
logo_match = re.search(r'(?s)<svg xmlns="http://www.w3.org/2000/svg".*?</svg>', html)
svg_logo = logo_match.group(0) if logo_match else ''
# Clean up logo classes if needed
svg_logo = svg_logo.replace('max-width:200px', 'max-width:180px').replace('max-width:180px', 'max-width:150px')

# Nuke old header, landing, and auth
html = re.sub(r'(?s)<!-- SAAS HEADER PURE -->.*?</header>', '', html)
html = re.sub(r'(?s)<!-- 1\. LANDING PAGE .*?</div>\s*</div>\s*</div>', '', html)
html = re.sub(r'(?s)<!-- 2\. AUTH/LOGIN .*?</div>\s*</div>\s*</div>', '', html)
# Clean up any leftover views if any, but since we regexed them out, we will inject the new one before Dashboard
html = re.sub(r'(?s)<!-- 3\. ESTUDIANTE DASHBOARD -->', '<!-- SPLIT GRID REPLACEMENT -->\n<!-- 3. ESTUDIANTE DASHBOARD -->', html)

split_grid_html = f'''
    <!-- 1. LANDING & AUTH (SPLIT GRID) -->
    <div id="view-landing" class="view active">
        <div class="split-layout">
            <!-- COLUMNA IZQUIERDA: SHOWCASE -->
            <div class="split-showcase">
                <div class="showcase-header">
                    {svg_logo}
                </div>
                
                <div class="showcase-content">
                    <h1 class="showcase-title">Aprender es una <br><span class="text-electric">Aventura Cient&iacute;fica</span></h1>
                    <p class="showcase-subtitle">Plataforma dise&ntilde;ada para la era digital.</p>
                    
                    <div class="bento-grid">
                        <div class="bento-card bento-hero">
                            <i class="ph-fill ph-game-controller bento-icon text-electric"></i>
                            <h3>Gamificaci&oacute;n</h3>
                            <p>Sistema de recompensas y huevos coleccionables.</p>
                        </div>
                        <div class="bento-card">
                            <i class="ph-fill ph-flask bento-icon text-neon"></i>
                            <h3>Base Pr&aacute;ctica</h3>
                            <p>Est&aacute;ndares ICFES integrados.</p>
                        </div>
                        <div class="bento-card">
                            <i class="ph-fill ph-brain bento-icon text-electric"></i>
                            <h3>Aprendizaje Aut&oacute;nomo</h3>
                            <p>Motor 100% offline.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- COLUMNA DERECHA: AUTH PANEL -->
            <div class="split-auth">
                <div class="auth-panel">
                    <h2 class="auth-title">Portal de Acceso</h2>
                    <p class="auth-subtitle">Selecciona tu v&iacute;a de ingreso a la plataforma.</p>
                    
                    <div class="auth-actions">
                        <button class="auth-btn btn-primary-split" onclick="app.navigate('view-dashboard')">
                            <i class="ph ph-user"></i>
                            <span>Ingresar (Usuario/Admin)</span>
                        </button>
                        <button class="auth-btn btn-secondary-split">
                            <i class="ph ph-user-plus"></i>
                            <span>Nuevo Usuario</span>
                        </button>
                        <button class="auth-btn btn-secondary-split">
                            <i class="ph ph-house-line"></i>
                            <span>HomeSchool</span>
                        </button>
                        <button class="auth-btn btn-secondary-split">
                            <i class="ph ph-student"></i>
                            <span>Validar Bachillerato</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
'''

html = html.replace('<!-- SPLIT GRID REPLACEMENT -->', split_grid_html)

# To ensure the logic of app.js works, view-landing is the active one, and auth is merged.
# Wait, if view-auth is called by app.js, it might break if view-auth is completely removed.
# I will just create a hidden view-auth so JS doesn't crash when app.navigate('view-auth') is called, 
# or I can make app.js navigate to view-landing instead, but creating a dummy view-auth is safer.
html = html.replace('<!-- 3. ESTUDIANTE DASHBOARD -->', '<div id="view-auth" class="view d-none"></div>\n    <!-- 3. ESTUDIANTE DASHBOARD -->')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
