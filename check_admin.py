html_path = r'd:\Peidagogos_Oficial\login.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

idx_start = html.find('id="dashboard-screen-container"')
idx_end = html.find('fin dashboard-screen-container')
admin_html = html[idx_start:idx_end]

open_divs = admin_html.count('<div')
close_divs = admin_html.count('</div')
print('Admin panel open divs:', open_divs)
print('Admin panel close divs:', close_divs)

# Count script tags or syntax errors?
import re
print("Has invalid closing tags?", re.search(r'</[a-zA-Z]+>', admin_html) is None)

# Show what's in the main content wrapper
print(admin_html[:500])
