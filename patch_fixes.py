import io

with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Fix URL API
js = js.replace("fetch('/api/generate-guide'", "fetch('http://localhost:3000/api/generate-guide'")

# Fix "has already been declared" error changing const to var at the top level
js = js.replace("const mallaFisicaMontenegro =", "var mallaFisicaMontenegro =")
js = js.replace("const MallaNarrativaMaestra =", "var MallaNarrativaMaestra =")
js = js.replace("const mallaFisica =", "var mallaFisica =")
js = js.replace("const mallaTurismo =", "var mallaTurismo =")
js = js.replace("const guiaTemplate =", "var guiaTemplate =")

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
