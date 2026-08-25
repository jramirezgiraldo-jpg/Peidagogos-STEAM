import re
with open(r'd:\Peidagogos_Oficial\login.html', 'r', encoding='utf-8') as f:
    html = f.read()

match = re.search(r'<div id=\"dashboard-screen-container\".*?(fin dashboard-screen-container)', html, re.DOTALL)
if match:
    with open(r'C:\Users\USUARIO\.gemini\antigravity\brain\5d7d19ed-b992-48de-af85-b9c56772b4d9\scratch\admin_dump.html', 'w', encoding='utf-8') as out:
        out.write(match.group(0))
