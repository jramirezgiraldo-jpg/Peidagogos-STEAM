from bs4 import BeautifulSoup
import re

file_path = r'D:\Users\Juan Felipe\Desktop\Escrotorio mayo 2026\combinado trasnversal .html'

with open(file_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

grades = [6, 7, 8, 9, 10, 11]
tables_html = {g: [] for g in grades}

# Extraer tablas igual que la vez pasada
titles = soup.find_all('div', class_='grade-title')
for title in titles:
    text = title.get_text()
    m = re.search(r'Grado (\d+)', text) or re.search(r'Grado [A-Za-z]+ \((\d+)', text)
    if not m:
        if 'Sexto' in text: g = 6
        elif 'Séptimo' in text: g = 7
        elif 'Octavo' in text: g = 8
        elif 'Noveno' in text: g = 9
        elif 'Décimo' in text: g = 10
        elif 'Undécimo' in text: g = 11
        else: continue
    else:
        g = int(m.group(1))
        
    if g in grades:
        nxt = title.find_next_sibling()
        while nxt and nxt.name != 'table' and nxt.name != 'div':
            nxt = nxt.find_next_sibling()
        
        if nxt and nxt.name == 'table':
            tables_html[g].append(str(title) + str(nxt))

# Generar el bloque completo para inyectar
final_injection = ""
for g in grades:
    content = '\n'.join(tables_html[g])
    div = f'<div id="malla-grado-{g}" class="contenedor-malla" style="display:none;">\n{content}\n</div>\n'
    final_injection += div

# Inyectar en index.html
with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# Buscar el final de la Fila de Gamificación
target = '<!-- Mallas Admin (NUEVO) -->'
if target in index_html:
    # Eliminar todos los contenido-grado-X antiguos si existen
    index_html = re.sub(r'<div id="contenido-grado-\d+".*?</div>\s*<script', '<script', index_html, flags=re.DOTALL)
    
    # Inyectar el final_injection debajo del marker
    index_html = index_html.replace(target, target + '\n' + final_injection)
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(index_html)
    print("Inyeccion exitosa.")
else:
    print("No se encontro marker.")
