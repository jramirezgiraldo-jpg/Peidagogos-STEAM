with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re

# FASE 1: Limpieza Comercial
html = html.replace('INSTITUCI&Oacute;N EDUCATIVA RAM&Oacute;N MESSA LONDO&Ntilde;O', 'PEIDAGOGOS STEAM - GLOBAL SAAS')
html = html.replace('Institución Educativa Ramón Messa Londoño', 'Peidagogos STEAM - Global SaaS')
html = html.replace('IE Ramón Messa', 'Peidagogos STEAM')

# FASE 2: Limpieza Estructural
# Eliminar el admin-grade-selector que agregue antes
start_sel = html.find('<!-- Selector de Grado Admin (NUEVO) -->')
if start_sel != -1:
    end_sel = html.find('<!-- Mallas Admin (NUEVO) -->', start_sel)
    if end_sel != -1:
        html = html[:start_sel] + html[end_sel:]

# Asegurar botones tab-grado-btn
tab_replacements = [
    ('<button class="tab-grado active">Grado 6&deg;</button>', '<button class="tab-grado-btn active" data-grado="6" style="padding:15px 20px; border:none; background:transparent; border-bottom:3px solid #3B82F6; color:#3B82F6; font-weight:bold; cursor:pointer;">Grado 6&deg;</button>'),
    ('<button class="tab-grado">Grado 7&deg;</button>', '<button class="tab-grado-btn" data-grado="7" style="padding:15px 20px; border:none; background:transparent; border-bottom:3px solid transparent; color:#6B7280; font-weight:bold; cursor:pointer;">Grado 7&deg;</button>'),
    ('<button class="tab-grado">Grado 8&deg;</button>', '<button class="tab-grado-btn" data-grado="8" style="padding:15px 20px; border:none; background:transparent; border-bottom:3px solid transparent; color:#6B7280; font-weight:bold; cursor:pointer;">Grado 8&deg;</button>'),
    ('<button class="tab-grado">Grado 9&deg;</button>', '<button class="tab-grado-btn" data-grado="9" style="padding:15px 20px; border:none; background:transparent; border-bottom:3px solid transparent; color:#6B7280; font-weight:bold; cursor:pointer;">Grado 9&deg;</button>'),
    ('<button class="tab-grado">Grado 10&deg;</button>', '<button class="tab-grado-btn" data-grado="10" style="padding:15px 20px; border:none; background:transparent; border-bottom:3px solid transparent; color:#6B7280; font-weight:bold; cursor:pointer;">Grado 10&deg;</button>'),
    ('<button class="tab-grado">Grado 11&deg;</button>', '<button class="tab-grado-btn" data-grado="11" style="padding:15px 20px; border:none; background:transparent; border-bottom:3px solid transparent; color:#6B7280; font-weight:bold; cursor:pointer;">Grado 11&deg;</button>')
]

for old, new in tab_replacements:
    html = html.replace(old, new)

# Asegurar data-grado en tabla
if '<tr>' in html[html.find('<tbody>'):]:
    # Replace the empty row with a placeholder row that has data-grado
    html = html.replace('<tr>\\n                                    <td colspan="5"', '<tr data-grado="6">\\n                                    <td colspan="5"')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("index.html actualizado.")
