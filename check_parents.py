html_path = r'd:\Peidagogos_Oficial\login.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('id="dashboard-screen-container"')
before = html[:idx]
open_divs = before.count('<div')
close_divs = before.count('</div')
print('Net open divs BEFORE admin panel:', open_divs - close_divs)
