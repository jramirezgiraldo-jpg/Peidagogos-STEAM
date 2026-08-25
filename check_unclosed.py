html_path = r'd:\Peidagogos_Oficial\login.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

idx = html.find('id="dashboard-screen-container"')
before = html[:idx]
import re
div_tags = re.finditer(r'<div[^>]*>|</div>', before)
stack = []
for tag in div_tags:
    if tag.group(0).startswith('<div'):
        stack.append(tag.group(0))
    else:
        if len(stack) > 0:
            stack.pop()

print("Unclosed divs BEFORE admin panel:")
for t in stack:
    print(t)
