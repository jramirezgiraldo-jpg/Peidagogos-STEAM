import re

html_path = r'd:\Peidagogos_Oficial\login.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Revert student-main-content display: none
target_admin = '<div id="student-main-content" style="display: none; padding: 40px 30px; max-width: 1200px; margin: 0 auto;">'
replacement_admin = '<div id="student-main-content" style="padding: 40px 30px; max-width: 1200px; margin: 0 auto;">'
html = html.replace(target_admin, replacement_admin)

# 2. Add the dashboard-screen-container wrapper
target_insert = '    <!-- Contenedor Central -->'
replacement_insert = '''<!-- DASHBOARD ADMIN / DIRECTIVO -->
<div id="dashboard-screen-container" style="display: none; height: 100vh; overflow-y: auto; background-color: #F8FAFC;">
    <!-- Contenedor Central -->'''

if target_insert in html:
    html = html.replace(target_insert, replacement_insert, 1) # Replace only the first occurrence (which is the admin one)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print("Added dashboard-screen-container wrapper!")
else:
    print("Target not found")
