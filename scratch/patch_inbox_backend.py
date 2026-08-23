import re

with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    app = f.read()

target = """        if (res.ok) {
            window._aiGameData = await res.json();
            window.cerrarConfiguracionJuegoIA();
            if (typeof window.abrirVisorHerramienta === 'function') {
                window.abrirVisorHerramienta(tool.id, true);
            }
        } else {"""

replacement = """        if (res.ok) {
            window._aiGameData = await res.json();
            window.cerrarConfiguracionJuegoIA();
            
            if (!soloProyectar) {
                const selGrp = document.getElementById('modal-config-juego-grupo') || document.getElementById('modal-juego-grupo-select') || document.getElementById('modal-juego-ia-grupo-select');
                const grupoDestino = (selGrp && selGrp.value) ? selGrp.value : 'Todos';
                
                let inbox = [];
                try {
                    inbox = JSON.parse(localStorage.getItem('inbox_estudiantes') || '[]');
                } catch(e) {}
                
                inbox.push({
                    id: Date.now().toString(),
                    grupo: grupoDestino,
                    materia: materia,
                    grado: grado,
                    tema: keywords,
                    toolId: tool.id,
                    toolTitulo: tool.titulo,
                    toolIcono: tool.icono,
                    dataIA: window._aiGameData,
                    fecha: new Date().toISOString(),
                    docente: window.usuario_actual || 'Tu Docente'
                });
                localStorage.setItem('inbox_estudiantes', JSON.stringify(inbox));
                
                // Mensaje de éxito
                alert(`✅ ¡Actividad asignada exitosamente al grupo ${grupoDestino}!`);
            }
            
            if (typeof window.abrirVisorHerramienta === 'function') {
                window.abrirVisorHerramienta(tool.id, true);
            }
        } else {"""

app = app.replace(target, replacement)

# Patching group logic:
grp_target = """        } else if (authSes && Array.isArray(authSes.grados) && authSes.grados.length > 0) {
            grupos = [...authSes.grados];
        } else {
            grupos = ['7C', '6A', '8A'];
        }"""
grp_replacement = """        } else if (authSes && Array.isArray(authSes.grados) && authSes.grados.length > 0) {
            grupos = [...authSes.grados];
        } else if (window.grupos_db && window.grupos_db.length > 0) {
            grupos = window.grupos_db.map(g => g.id);
        } else {
            grupos = ['7C', '6A', '8A'];
        }"""
app = app.replace(grp_target, grp_replacement)

with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
    f.write(app)

print('app.js patched for inbox logic and group fallback.')
