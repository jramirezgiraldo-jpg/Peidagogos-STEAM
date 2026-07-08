import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Landing Page logo replacement
# Currently it is:
# <div class="logo-container">
#     <span class="logo-text">PEIDAGOGOS</span><span class="logo-steam">STEAM</span>
# </div>
old_landing_logo = '<span class="logo-text">PEIDAGOGOS</span><span class="logo-steam">STEAM</span>'
new_landing_logo = '<img src="logo-peidagogos.png" alt="Logo Peidagogos STEAM" style="max-width: 280px; height: auto; margin-bottom: 15px;">'
html = html.replace(old_landing_logo, new_landing_logo)


# 2. Admin Hub logo replacement
# Currently it is:
# <div style="font-weight: 900; font-size: 1.4rem; color: #111827;">
#     Peidagogos <span style="color: #3B82F6; font-weight: 300;">Local Science Lab</span>
# </div>
# I'll replace the inner text.
old_admin_logo = 'Peidagogos <span style="color: #3B82F6; font-weight: 300;">Local Science Lab</span>'
new_hub_logo = '<img src="logo-peidagogos.png" alt="Peidagogos STEAM" style="height: 55px; width: auto; object-fit: contain;">'
html = html.replace(old_admin_logo, new_hub_logo)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
