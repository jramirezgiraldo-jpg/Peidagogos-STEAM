with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
    if '<script>' in html or '<script type="text/javascript">' in html:
        print("Inline script found!")
        start = html.find('<script>') if '<script>' in html else html.find('<script type="text/javascript">')
        print(html[start:start+1000])
    else:
        print("No inline script.")
