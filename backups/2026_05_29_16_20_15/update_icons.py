import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Left Column Replacements (Bento Cards)
# Gamificacion
html = html.replace(
    '<div class="bento-card bento-hero">\n                                <i class="ph-fill ph-game-controller bento-icon text-neon"></i>\n                                <h3>Gamificaci&oacute;n</h3>\n                                <p>Sistema de recompensas y huevos coleccionables.</p>',
    '<div class="bento-card bento-hero">\n                                <i class="ph ph-game-controller bento-icon text-neon"></i>\n                                <div class="bento-text">\n                                    <h3>Gamificaci&oacute;n</h3>\n                                    <p>Sistema de recompensas y huevos coleccionables.</p>\n                                </div>'
)

# Base Practica -> Adaptativo
html = html.replace(
    '<div class="bento-card">\n                                <i class="ph-fill ph-flask bento-icon text-electric"></i>\n                                <h3>Base Pr&aacute;ctica</h3>\n                                <p>Est&aacute;ndares ICFES integrados.</p>',
    '<div class="bento-card">\n                                <i class="ph ph-dna bento-icon text-electric"></i>\n                                <div class="bento-text">\n                                    <h3>Adaptativo</h3>\n                                    <p>Est&aacute;ndares ICFES integrados.</p>\n                                </div>'
)

# Aprendizaje Autonomo
html = html.replace(
    '<div class="bento-card">\n                                <i class="ph-fill ph-brain bento-icon text-electric"></i>\n                                <h3>Aprendizaje Aut&oacute;nomo</h3>\n                                <p>Motor 100% offline.</p>',
    '<div class="bento-card">\n                                <i class="ph ph-brain bento-icon text-electric"></i>\n                                <div class="bento-text">\n                                    <h3>Aprendizaje Aut&oacute;nomo</h3>\n                                    <p>Motor 100% offline.</p>\n                                </div>'
)

# Need to close the divs we opened for bento-text. The original ends with </div>
html = html.replace('</p>\n                            </div>', '</p>\n                                </div>\n                            </div>')


# Right Column Replacements (Auth Panel)
html = html.replace(
    '<i class="ph ph-user"></i>',
    '<i class="ph ph-identification-badge"></i>'
)
# The others are already correct: ph-user-plus, ph-house (it was ph-house-line, I'll change to ph-house), ph-student (it was ph-student, user asks for ph-graduation-cap)
html = html.replace(
    '<i class="ph ph-house-line"></i>',
    '<i class="ph ph-house"></i>'
)
html = html.replace(
    '<i class="ph ph-student"></i>',
    '<i class="ph ph-graduation-cap"></i>'
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
