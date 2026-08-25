html_path = r'd:\Peidagogos_Oficial\login.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

idx_start = html.find('id="dashboard-screen-container"')
idx_end = html.find('fin dashboard-screen-container')
admin_html = html[idx_start:idx_end]

# Use a stack to track divs
stack = []
import re

div_tags = re.finditer(r'<div[^>]*>|</div>', admin_html)
extra_closes = []
for tag in div_tags:
    if tag.group(0).startswith('<div'):
        stack.append(tag.start())
    else:
        if len(stack) > 0:
            stack.pop()
        else:
            extra_closes.append(tag.start())

print("Extra closing divs at positions in admin_html:", extra_closes)
for ec in extra_closes:
    print("Context around extra close:")
    print(admin_html[max(0, ec-100):min(len(admin_html), ec+100)])

print("Unclosed open divs:", len(stack))
for ec in stack:
    print("Context around unclosed div:")
    print(admin_html[max(0, ec-50):min(len(admin_html), ec+100)])
