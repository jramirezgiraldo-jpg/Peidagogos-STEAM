import re

html_path = r'd:\Peidagogos_Oficial\login.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

target = '<div id="student-main-content" style="padding: 40px 30px; max-width: 1200px; margin: 0 auto;">'
replacement = '<div id="student-main-content" style="display: none; padding: 40px 30px; max-width: 1200px; margin: 0 auto;">'

if target in html:
    html = html.replace(target, replacement, 1) # Replace only the first occurrence (which is the admin one)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Added display:none to Admin panel")
else:
    print("Target not found")
