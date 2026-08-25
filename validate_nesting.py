html_path = r'd:\Peidagogos_Oficial\login.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

import re
div_tags = re.finditer(r'<div[^>]*>|</div>', html)
stack = []
for tag in div_tags:
    if tag.group(0).startswith('<div'):
        stack.append(tag.group(0))
    else:
        if len(stack) > 0:
            stack.pop()
        else:
            print("Extra closing div found at offset:", tag.start())

print("Unclosed open divs at the end of the file:", len(stack))
for tag in stack:
    if 'id=' in tag:
        print("Unclosed div with ID:", tag)
