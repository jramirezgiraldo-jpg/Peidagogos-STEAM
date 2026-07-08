import os

# 1. READ OLD HTML JUST TO PRESERVE VIEWS 3, 4, 5 AND MODALS
old_html = ""
if os.path.exists("index.html"):
    with open("index.html", "r", encoding="utf-8") as f:
        old_html = f.read()

# 2. DELETE FILES AS REQUESTED
if os.path.exists("index.html"):
    os.remove("index.html")
if os.path.exists("css/styles.css"):
    os.remove("css/styles.css")

# 3. EXTRACT THE PRESERVED PARTS
import re
# Find anything from view-student onwards to keep the app working
preserved_views_match = re.search(r'(?s)<!-- 3\. ESTUDIANTE DASHBOARD -->.*</body>', old_html)
preserved_views = preserved_views_match.group(0) if preserved_views_match else "</body>"

# 4. BUILD NEW INDEX.HTML (100vh overflow hidden, Bento Grid, HTML Entities)
new_html = f'''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Peidagogos STEAM</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css">
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
</head>
<body>
    <div id="app-container">
        <!-- 1. LANDING & AUTH (SPLIT GRID 100vh) -->
        <div id="view-landing" class="view active">
            <div class="split-layout">
                
                <!-- LADO IZQUIERDO: SHOWCASE -->
                <div class="split-left">
                    <div class="logo-container">
                        <span class="logo-text">PEIDAGOGOS</span><span class="logo-steam">STEAM</span>
                    </div>
                    
                    <div class="showcase-content">
                        <h1 class="hero-title">Arquitectura<br>del Aprendizaje</h1>
                        <p class="hero-subtitle">Plataforma dise&ntilde;ada para la era digital.</p>
                        
                        <div class="bento-grid">
                            <div class="bento-card bento-hero">
                                <i class="ph-fill ph-game-controller bento-icon text-neon"></i>
                                <h3>Gamificaci&oacute;n</h3>
                                <p>Sistema de recompensas y huevos coleccionables.</p>
                            </div>
                            <div class="bento-card">
                                <i class="ph-fill ph-flask bento-icon text-electric"></i>
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
                
                <!-- LADO DERECHO: AUTH PANEL -->
                <div class="split-right">
                    <div class="auth-panel">
                        <h2 class="auth-title">Portal de Acceso</h2>
                        <p class="auth-subtitle">Selecciona tu v&iacute;a de ingreso a la plataforma.</p>
                        
                        <div class="auth-actions">
                            <!-- Auth form mock integration -->
                            <form id="form-login" onsubmit="app.handleLogin(event)" style="margin-bottom: 20px;">
                                <input type="text" id="login-user" class="form-control mb-3" placeholder="Documento o Usuario" required>
                                <input type="password" id="login-pass" class="form-control mb-3" placeholder="Contrase&ntilde;a" required>
                                <button type="submit" class="auth-btn btn-primary-split">
                                    <i class="ph ph-user"></i>
                                    <span>Ingresar (Usuario/Admin)</span>
                                </button>
                            </form>
                            
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
        
        <!-- DUMMY AUTH PARA EVITAR ERRORES JS -->
        <div id="view-auth" class="view d-none"></div>

        {preserved_views}
'''

# We write UTF-8 without BOM
with open("index.html", "w", encoding="utf-8") as f:
    f.write(new_html)

# 5. BUILD NEW STYLES.CSS
css_content = '''
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');

:root {
    --primary: #3B82F6;
    --primary-hover: #2563EB;
    --neon: #10B981;
    --dark: #1F2937;
    --text-muted: #6B7280;
    --bg-main: #FFFFFF;
    --bg-left: #F8FAFC;
}

body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', system-ui, sans-serif !important;
    background-color: var(--bg-main);
    color: var(--dark);
    /* 100vh Ocultando scroll */
    height: 100vh;
    overflow: hidden;
}

.view { display: none; }
.view.active { display: block; height: 100%; }

/* === SPLIT LAYOUT 100vh === */
.split-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 100vh;
    overflow: hidden;
}

/* LEFT COLUMN */
.split-left {
    background-color: var(--bg-left);
    padding: 4rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
}

.logo-container {
    position: absolute;
    top: 2rem;
    left: 4rem;
    font-size: 1.5rem;
    font-weight: 900;
}
.logo-steam { color: var(--primary); font-weight: 300; margin-left: 0.5rem; }

.showcase-content {
    max-width: 600px;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 900;
    line-height: 1.1;
    margin-bottom: 1rem;
    color: var(--dark);
}

.hero-subtitle {
    font-size: 1.25rem;
    color: var(--text-muted);
    margin-bottom: 3rem;
}

/* BENTO GRID */
.bento-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.bento-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid rgba(0,0,0,0.02);
    transition: transform 0.3s ease;
}

.bento-hero {
    grid-column: span 2;
}

.bento-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.text-neon { color: var(--neon); }
.text-electric { color: var(--primary); }

.bento-card h3 {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.bento-card p {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin: 0;
}

/* RIGHT COLUMN */
.split-right {
    background-color: var(--bg-main);
    padding: 4rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow-y: auto;
}

.auth-panel {
    width: 100%;
    max-width: 400px;
}

.auth-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 0.5rem;
    color: var(--dark);
}

.auth-subtitle {
    font-size: 1.1rem;
    color: var(--text-muted);
    margin-bottom: 3rem;
}

.auth-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.auth-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1.25rem 1.5rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    border: 1px solid rgba(0,0,0,0.1);
    background: white;
    color: var(--dark);
    cursor: pointer;
    transition: all 0.2s ease;
}

.auth-btn i { font-size: 1.5rem; }

.btn-primary-split {
    background-color: var(--primary);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-primary-split:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
}

.btn-secondary-split:hover {
    background-color: #F8FAFC;
    transform: translateY(-2px);
}

.d-none { display: none !important; }

/* OVERRIDES FOR PRESERVED APP VIEWS SO THEY SCROLL PROPERLY */
#view-student, #view-ova, #view-admin {
    height: 100vh;
    overflow-y: auto;
}

/* MOCK CSS FOR HUD, ETC (Keeping the system stable) */
#global-hud { position: fixed; top: 10px; right: 10px; background: white; padding: 10px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); z-index: 2000; }
.hidden { display: none !important; }
'''

with open("css/styles.css", "w", encoding="utf-8") as f:
    f.write(css_content)

print("ARCHIVOS_BORRADOS_Y_RECREADOS")
