with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    code = f.read()

idx = code.find('window.cargarDirectorioDocentesGrupoDirector')
print('Found at:', idx)
if idx >= 0:
    snippet = code[idx:idx+4000]
    with open(r'd:\Peidagogos_Oficial\snippet_out.txt', 'w', encoding='utf-8') as out:
        out.write(snippet)
    print('Written to snippet_out.txt')
else:
    print('NOT FOUND')
