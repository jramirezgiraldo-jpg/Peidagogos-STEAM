import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# We will just replace the exact block using regex
old_pattern = re.compile(r'// Lgica de Pestaas.*?\}\);\n    \}\);\n\}\n\}\);', re.DOTALL)
old_pattern2 = re.compile(r'// L.gica de Pesta.as.*?\}\);\n    \}\);\n\}\n\}\);', re.DOTALL)

new_tabs_logic = '''// Lógica de Pestañas (Tabs) estricta para mallas de grados
const tabBtns = document.querySelectorAll('.tab-grado-btn, .tab-btn');
if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Estilos visuales de la pestaña
            tabBtns.forEach(b => {
                b.classList.remove('activa', 'active');
                b.style.borderBottom = '3px solid transparent';
                b.style.color = '#6B7280';
            });
            this.classList.add('activa', 'active');
            this.style.borderBottom = '3px solid #3B82F6';
            this.style.color = '#3B82F6';
            
            // Obtener el grado seleccionado
            const rawTarget = this.getAttribute('data-target') || this.getAttribute('data-grado') || '';
            const gradoTarget = normalizar(rawTarget);
            
            // Lógica estricta: Ocultar todos los divs de grados y mostrar solo el clickeado
            document.querySelectorAll('.vista-grado, .malla-view').forEach(vista => {
                vista.style.display = 'none';
            });
            
            const mallaActiva = document.getElementById('contenido-grado-' + gradoTarget) || document.getElementById('admin-malla-' + gradoTarget);
            if (mallaActiva) {
                mallaActiva.style.display = 'block';
            }
            
            // Filtrar los estudiantes en la tabla
            document.querySelectorAll('.fila-estudiante').forEach(fila => {
                const filaGrado = normalizar(fila.getAttribute('data-grado'));
                if (filaGrado === gradoTarget) {
                    fila.style.display = 'table-row';
                } else {
                    fila.style.display = 'none';
                }
            });
        });
    });
}
});'''

new_js = old_pattern2.sub(new_tabs_logic, js)

if new_js == js:
    print("NO SE REEMPLAZO")
else:
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(new_js)
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(new_js)
    print("REEMPLAZO OK")
