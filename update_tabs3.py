import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_pattern = re.compile(r'// L.gica de Pesta.as \(Tabs\) estricta.*?(?=\s+// ==========================================)', re.DOTALL)

new_tabs_logic = '''// Lógica de Pestañas (Tabs) estricta para mallas de grados
const tabBtns = document.querySelectorAll('.tab-btn');
if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 1. Capturar el clic y obtener el data-target
            const id_capturado = this.getAttribute('data-target') ? this.getAttribute('data-target').trim().toLowerCase() : '';
            console.log("Pestaña clickeada:", id_capturado);
            
            if (!id_capturado) {
                console.log("Error: La pestaña no tiene atributo data-target.");
                return;
            }
            
            // 2. Manejo de Estilos visuales de la pestaña
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
            console.log("Ocultando " + todasLasVistas.length + " contenedores de grado.");
            todasLasVistas.forEach(vista => {
                vista.style.display = 'none';
            });
            
            // 4. Mostrar solo el div con el ID correspondiente
            const mallaActiva = document.getElementById('contenido-grado-' + id_capturado);
            if (mallaActiva) {
                console.log("Mostrando contenedor: contenido-grado-" + id_capturado);
                mallaActiva.style.display = 'block';
            } else {
                console.log("Atención: No se encontró el contenedor contenido-grado-" + id_capturado);
            }
            
            // 5. Filtrar la tabla de estudiantes
            const filasEstudiantes = document.querySelectorAll('.fila-estudiante');
            console.log("Filtrando " + filasEstudiantes.length + " estudiantes para el grado " + id_capturado);
            filasEstudiantes.forEach(fila => {
                const filaGrado = fila.getAttribute('data-grado') ? fila.getAttribute('data-grado').replace('°', '').trim().toLowerCase() : '';
                if (filaGrado === id_capturado) {
                    fila.style.display = 'table-row';
                } else {
                    fila.style.display = 'none';
                }
            });
        });
    });
}'''

new_js = old_pattern.sub(new_tabs_logic, js)

if new_js == js:
    print("NO SE REEMPLAZO")
else:
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(new_js)
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(new_js)
    print("REEMPLAZO OK")
