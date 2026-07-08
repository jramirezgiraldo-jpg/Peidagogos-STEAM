from bs4 import BeautifulSoup
import re

with open('combinado trasnversal .html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

with open('index.html', 'r', encoding='utf-8') as f:
    index_html = f.read()

# Buscamos todas las tablas y sus títulos
# Las tablas de Malla Curricular tienen un div anterior con class 'grade-title'
# Vamos a extraer TODO el contenido entre un grado y otro, o especificamente las tablas.

# La forma más segura de aislar el contenido de cada grado:
grades = [6, 7, 8, 9, 10, 11]

tables_html = {g: [] for g in grades}

# Encontrar los títulos de grado y agrupar las tablas
titles = soup.find_all('div', class_='grade-title')
for title in titles:
    text = title.get_text()
    # Buscar el número de grado en el texto
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
        # Encontrar la tabla que le sigue a este título
        nxt = title.find_next_sibling()
        while nxt and nxt.name != 'table' and nxt.name != 'div':
            nxt = nxt.find_next_sibling()
        
        if nxt and nxt.name == 'table':
            tables_html[g].append(str(title) + str(nxt))

# Inyectar en index.html
for g in grades:
    marker = f'<!-- Inyectar tabla de grado {g} aqui -->'
    if marker in index_html:
        combined_tables = '\n'.join(tables_html[g])
        index_html = index_html.replace(marker, combined_tables)
    else:
        print(f"Marker not found for grade {g}")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(index_html)

print("Inyeccion completada")
