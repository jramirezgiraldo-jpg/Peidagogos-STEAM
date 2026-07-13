import io
import re

with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

js = js.replace('// TODO: Lanzar el HUEVO DE RECOMPENSA aquí (Fase 4)', 'mostrarHuevos();')
js = js.replace('// TODO: Lanzar el huevo de recompensa aquí (Fase 4)', 'mostrarHuevos();')
js = js.replace('// TODO: Lanzar huevo de recompensa (Fase 4)', 'mostrarHuevos();')

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
