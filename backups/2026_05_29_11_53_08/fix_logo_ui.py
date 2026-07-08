import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the logo block
old_logo_block = r'(?s)<div class="logo-container">.*?<p class="hero-subtitle">Plataforma dise&ntilde;ada para la era digital.</p>'

new_logo_block = '''<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 25px;">
    <img src="logo-peidagogos.png" alt="Logo Peidagogos STEAM" style="max-width: 160px; height: auto; object-fit: contain;">
    <h2 style="font-size: 1.6rem; font-weight: 800; color: #111827; margin: 0; line-height: 1.2;">Arquitectura del Aprendizaje</h2>
    <p style="font-size: 0.95rem; color: #6B7280; margin: 0;">Plataforma dise&ntilde;ada para la era digital.</p>
</div>'''

html = re.sub(old_logo_block, new_logo_block, html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
