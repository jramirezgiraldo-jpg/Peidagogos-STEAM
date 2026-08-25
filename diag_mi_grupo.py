with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Find renderizarPanelMiGrupoDirector definition
idx = code.find('// R2 & R3 & R4: Renderizar Panel Mi Grupo\nwindow.renderizarPanelMiGrupoDirector')
if idx < 0:
    idx = code.find('window.renderizarPanelMiGrupoDirector = function(doc, nom)')
print('renderizar function at index:', idx)

# Find inicializarModuloDirectorGrupo definition  
idx2 = code.find('// R1: Inicializar Módulo Director de Grupo en el Dashboard Docente\nwindow.inicializarModuloDirectorGrupo')
if idx2 < 0:
    idx2 = code.find('window.inicializarModuloDirectorGrupo = function()')
print('inicializar function at index:', idx2)

# Check what the secMiGrupo check looks like
check_idx = code.find('secMiGrupo')
print('\nFirst secMiGrupo at:', check_idx)
print(code[check_idx-100:check_idx+400])
