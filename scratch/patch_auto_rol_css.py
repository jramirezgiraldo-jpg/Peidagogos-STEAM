import re

with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    app = f.read()

target = """    if (regParam || docIdInj) {
        const style = document.createElement('style');
        style.innerHTML = `
            #reg-ie, 
            #campo-docente-asignatura, 
            #reg-grado, 
            #registro-grupo, 
            #reg-docente-ie-select,
            #reg-codigo-institucional,
            #campo-codigo-institucional {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }"""

replacement = """    if (regParam || docIdInj) {
        const rolParamToHide = params.get('rol');
        const style = document.createElement('style');
        style.innerHTML = `
            #reg-ie, 
            #campo-docente-asignatura, 
            #reg-grado, 
            #registro-grupo, 
            #reg-docente-ie-select,
            #reg-codigo-institucional,
            #campo-codigo-institucional${rolParamToHide ? ', #campo-tipo-rol-docente' : ''} {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }"""

app = app.replace(target, replacement)

with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
    f.write(app)

print("app.js auto rol CSS patched")
