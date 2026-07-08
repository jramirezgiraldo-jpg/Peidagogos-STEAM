import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Buscamos el bloque de lógica de pestañas
# Se reemplazará con una versión más "estricta" según el requerimiento.
old_tabs_logic_regex = re.compile(r'// Lgica de Pestaas \(Tabs\) para Mallas y Estudiantes.*?\}\);?$', re.DOTALL | re.MULTILINE)

new_tabs_logic = '''// Lógica de Pestañas (Tabs) estricta para mallas de grados
const tabBtns = document.querySelectorAll('.tab-grado-btn, .tab-btn');
if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Estilos de la pestaña
            tabBtns.forEach(b => {
                b.classList.remove('activa', 'active');
                b.style.borderBottom = '3px solid transparent';
                b.style.color = '#6B7280';
            });
            this.classList.add('activa', 'active');
            this.style.borderBottom = '3px solid #3B82F6';
            this.style.color = '#3B82F6';
            
            // Obtener el grado objetivo
            const rawTarget = this.getAttribute('data-target') || this.getAttribute('data-grado') || '';
            const gradoTarget = normalizar(rawTarget);
            
            // Ocultar todos los divs de grados
            document.querySelectorAll('.vista-grado, .malla-view').forEach(vista => {
                vista.style.display = 'none';
            });
            
            // Mostrar solo el div correspondiente
            const mallaActiva = document.getElementById('contenido-grado-' + gradoTarget) || document.getElementById('admin-malla-' + gradoTarget);
            if (mallaActiva) {
                mallaActiva.style.display = 'block';
            }
            
            // Filtrar los estudiantes en la tabla (se mantiene funcional)
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

# Actually we will just replace the exact block.
old_str = '''// Lgica de Pestaas (Tabs) para Mallas y Estudiantes
const tabBtns = document.querySelectorAll('.tab-grado-btn, .tab-btn');
if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 1. Manejo de Estilos visuales de la pestaa
            tabBtns.forEach(b => {
                b.classList.remove('activa', 'active');
                b.style.borderBottom = '3px solid transparent';
                b.style.color = '#6B7280';
            });
            this.classList.add('activa', 'active');
            this.style.borderBottom = '3px solid #3B82F6';
            this.style.color = '#3B82F6';
            
            // 2. Obtener el grado seleccionado
            const rawTarget = this.getAttribute('data-target') || this.getAttribute('data-grado') || '';
            const gradoTarget = normalizar(rawTarget);
            
            // 3. Mostrar la malla curricular correspondiente
            document.querySelectorAll('.vista-grado, .malla-view').forEach(vista => {
                vista.style.display = 'none';
            });
            const mallaActiva = document.getElementById('contenido-grado-' + gradoTarget) || document.getElementById('admin-malla-' + gradoTarget);
            if (mallaActiva) {
                mallaActiva.style.display = 'block';
            }
            
            // 4. Filtrar los estudiantes en la tabla
            document.querySelectorAll('.fila-estudiante').forEach(fila => {
                const filaGrado = normalizar(fila.getAttribute('data-grado'));
                
                console.log([Filtro UI] Comparando Fila: '' vs Pestaa: '');
                
                if (filaGrado === gradoTarget) {
                    fila.style.display = 'table-row'; // Mostrar como fila normal
                } else {
                    fila.style.display = 'none'; // Ocultar
                }
            });
        });
    });
}
});'''

new_js = js.replace(old_str, new_tabs_logic)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(new_js)
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(new_js)
print("Logica de pestanas reemplazada")
