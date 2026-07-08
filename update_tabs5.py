import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Buscamos const tabBtns = ... hasta el siguiente });\n    });\n}\n});
pattern = re.compile(r'const tabBtns = document\.querySelectorAll\(\'.tab-grado-btn, \.tab-btn\'\);.*?\}\n  \}\);', re.DOTALL)

new_tabs_logic = '''const tabBtns = document.querySelectorAll('.tab-btn');
if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 1. Capturar el clic
            const id_capturado = this.getAttribute('data-target') ? this.getAttribute('data-target').trim().toLowerCase() : '';
            console.log("Pestaña clickeada:", id_capturado);
            
            if (!id_capturado) return;
            
            // 2. Manejo de Estilos visuales
            tabBtns.forEach(b => {
                b.classList.remove('activa', 'active');
                b.style.borderBottom = '3px solid transparent';
                b.style.color = '#6B7280';
            });
            this.classList.add('activa', 'active');
            this.style.borderBottom = '3px solid #3B82F6';
            this.style.color = '#3B82F6';
            
            // 3. Ocultar todos los .vista-grado
            const todasLasVistas = document.querySelectorAll('.vista-grado');
            console.log("Ocultando " + todasLasVistas.length + " contenedores.");
            todasLasVistas.forEach(vista => {
                vista.style.display = 'none';
            });
            
            // 4. Mostrar solo el div con el ID correspondiente
            const mallaActiva = document.getElementById('contenido-grado-' + id_capturado);
            if (mallaActiva) {
                mallaActiva.style.display = 'block';
                console.log("Mostrando div: contenido-grado-" + id_capturado);
            } else {
                console.log("Error: div contenido-grado-" + id_capturado + " no encontrado.");
            }
            
            // (Extra opcional: ocultar filas de estudiantes que no coincidan)
            document.querySelectorAll('.fila-estudiante').forEach(fila => {
                const filaGrado = fila.getAttribute('data-grado') ? fila.getAttribute('data-grado').replace('°', '').trim().toLowerCase() : '';
                if (filaGrado === id_capturado) {
                    fila.style.display = 'table-row';
                } else {
                    fila.style.display = 'none';
                }
            });
        });
    });
}
});'''

# Let's verify the replacement happened
if not pattern.search(js):
    # Try another pattern
    pattern = re.compile(r'const tabBtns = document\.querySelectorAll.*?\n  \}\);', re.DOTALL)

new_js = pattern.sub(new_tabs_logic, js)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(new_js)
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(new_js)
print("Regex aplicadO")
