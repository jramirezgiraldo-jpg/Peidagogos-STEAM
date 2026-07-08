with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# FASE 2: SaaS White-labeling
html = html.replace('PEIDAGOGOS STEAM - GLOBAL SAAS', 'Peidagogos STEAM - Hub de Administración Global')
html = html.replace('Institución Educativa Ramón Messa Londoño', 'Peidagogos STEAM - Hub de Administración Global')

# FASE 4: Estructuración del DOM
# Update tabs
tabs = [
    ('tab-grado-btn active" data-grado="6"', 'tab-btn active" data-target="6"'),
    ('tab-grado-btn" data-grado="6"', 'tab-btn" data-target="6"'),
    ('tab-grado-btn" data-grado="7"', 'tab-btn" data-target="7"'),
    ('tab-grado-btn" data-grado="8"', 'tab-btn" data-target="8"'),
    ('tab-grado-btn" data-grado="9"', 'tab-btn" data-target="9"'),
    ('tab-grado-btn" data-grado="10"', 'tab-btn" data-target="10"'),
    ('tab-grado-btn" data-grado="11"', 'tab-btn" data-target="11"')
]
for old, new in tabs:
    html = html.replace(old, new)

# Update containers
conts = [
    ('id="admin-malla-6" class="malla-view"', 'id="contenido-grado-6" class="vista-grado"'),
    ('id="admin-malla-7" class="malla-view"', 'id="contenido-grado-7" class="vista-grado"'),
    ('id="admin-malla-8" class="malla-view"', 'id="contenido-grado-8" class="vista-grado"'),
    ('id="admin-malla-9" class="malla-view"', 'id="contenido-grado-9" class="vista-grado"'),
    ('id="admin-malla-10" class="malla-view"', 'id="contenido-grado-10" class="vista-grado"'),
    ('id="admin-malla-11" class="malla-view"', 'id="contenido-grado-11" class="vista-grado"')
]
for old, new in conts:
    html = html.replace(old, new)

# Add an id to the tbody of the student table to inject easily
html = html.replace('<tbody>', '<tbody id="tabla-estudiantes-body">')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("index.html estructurado.")
