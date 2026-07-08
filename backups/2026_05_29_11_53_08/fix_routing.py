import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Since this is an SPA, the real dashboard is not another HTML file but another view inside index.html.
# In the original app.js, the admin view was shown by: app.navigate('view-admin');
# I will change 'dashboard.html' to instead call: app.navigate('view-admin');

html = html.replace("window.location.href = 'dashboard.html';", "app.navigate('view-admin');")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
