with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

start_marker = "// =========================================="
start_idx = js.find(start_marker)

new_block = '''// ==========================================
// MÓDULO DE PANEL DOCENTE Y MALLAS (CORREGIDO)
// ==========================================

async function cargarEstudiantesAdmin() {
    try {
        const res = await fetch('/api/estudiantes');
        const estudiantes = await res.json();
        
        // Busca el cuerpo de la tabla en el panel del administrador
        const tbody = document.querySelector('.table tbody') || document.getElementById('tbody-estudiantes'); 
        
        if (tbody) {
            tbody.innerHTML = ''; // Limpiar tabla
            estudiantes.forEach(est => {
                // Limpiar el símbolo de grado por seguridad (ej. "6°" -> "6")
                const gradoLimpio = est.grado ? est.grado.replace('°', '').trim() : '';
                
                // INYECCIÓN SEGURA CON BACKTICKS (PROHIBIDO CAMBIAR)
                tbody.innerHTML += 
                <tr class="fila-estudiante" data-grado="" style="display: none;">
                    <td></td>
                    <td> </td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                </tr>;
            });
        }
    } catch (error) {
        console.error("Error cargando estudiantes:", error);
    }
}

// Lógica de Pestañas (Tabs) para Mallas y Estudiantes
const tabBtns = document.querySelectorAll('.tab-grado-btn, .tab-btn');
if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 1. Manejo de Estilos visuales de la pestaña
            tabBtns.forEach(b => b.classList.remove('activa', 'active'));
            this.classList.add('activa', 'active');
            
            // 2. Obtener el grado seleccionado
            const gradoTarget = (this.getAttribute('data-target') || this.getAttribute('data-grado') || '').replace('°', '').trim();
            
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
                if (fila.getAttribute('data-grado') === gradoTarget) {
                    fila.style.display = ''; // Mostrar como fila normal
                } else {
                    fila.style.display = 'none'; // Ocultar
                }
            });
        });
    });
}
});
'''

if start_idx != -1:
    js = js[:start_idx] + new_block
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(js)
    with open('js/app.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("app.js actualizado en raiz y en js/")
