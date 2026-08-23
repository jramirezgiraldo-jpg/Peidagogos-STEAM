import re

with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    app = f.read()

target = """            if (!soloProyectar) {
                const selGrp = document.getElementById('modal-config-juego-grupo') || document.getElementById('modal-juego-grupo-select') || document.getElementById('modal-juego-ia-grupo-select');"""

replacement = """            if (!soloProyectar) {
                const selGrp = document.getElementById('modal-config-juego-grupo') || document.getElementById('modal-juego-grupo-select') || document.getElementById('modal-juego-ia-grupo-select');"""

# Wait, the failure is in the 'else' block
target2 = """            if (typeof window.abrirVisorHerramienta === 'function') {
                window.abrirVisorHerramienta(tool.id, true);
            }
        } else {
            alert('Error IA.');
        }"""

replacement2 = """            if (typeof window.abrirVisorHerramienta === 'function') {
                window.abrirVisorHerramienta(tool.id, true);
            }
        } else {
            try {
                const errData = await res.json();
                alert('Error IA: ' + (errData.error || res.statusText));
            } catch(ex) {
                alert('Error IA: Servidor no respondió correctamente (Status ' + res.status + ')');
            }
        }"""

app = app.replace(target2, replacement2)

with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
    f.write(app)
print("app.js error alert patched")
