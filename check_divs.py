html_path = r'd:\Peidagogos_Oficial\login.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()
idx_docente = html.find('id="docente-dashboard-container"')
idx_admin = html.find('id="dashboard-screen-container"')
print('Docente starts at:', idx_docente)
print('Admin starts at:', idx_admin)
between = html[idx_docente:idx_admin]
open_divs = between.count('<div')
close_divs = between.count('</div')
print('Open divs in between:', open_divs)
print('Close divs in between:', close_divs)
