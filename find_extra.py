html_path = r'd:\Peidagogos_Oficial\login.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

idx_start = html.find('id="dashboard-screen-container"')
idx_end = html.find('fin dashboard-screen-container')
admin_html = html[idx_start:idx_end]

import re
div_tags = re.finditer(r'<div[^>]*>|</div>', admin_html)
stack = []
for tag in div_tags:
    if tag.group(0).startswith('<div'):
        stack.append(tag.start())
    else:
        if len(stack) > 0:
            stack.pop()
        else:
            print("Extra closing div found at offset:", tag.start())
            print("Context around it:")
            print(admin_html[max(0, tag.start()-200):min(len(admin_html), tag.start()+200)])
            print("="*80)
