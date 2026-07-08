with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

start_marker = "// =========================================="
start_idx = js.find(start_marker)

new_block = '''// ==========================================
// MÓDULO DE PANEL DOCENTE Y MALLAS (CORREGIDO)
// ==========================================

function normalizar(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor).replace('°', '').trim().toLowerCase();
}

async function cargarEstudiantesAdmin() {
    try {
        const res = await fetch('/api/estudiantes');
        const estudiantes = await res.json();
        
        // Busca el cuerpo de la tabla en el panel del administrador
        const tbody = document.querySelector('.table tbody') || document.getElementById('tbody-estudiantes') || document.getElementById('tabla-estudiantes-body'); 
        
        if (tbody) {
            tbody.innerHTML = ''; // Limpiar tabla
            estudiantes.forEach(est => {
                const gradoLimpio = normalizar(est.grado);
                
                // INYECCIÓN SEGURA CON BACKTICKS (PROHIBIDO CAMBIAR)
                tbody.innerHTML += 
                <tr class="fila-estudiante" data-grado="" style="display: none;">
                    <td style="padding: 15px;"></td>
                    <td style="padding: 15px; font-weight: bold;"> </td>
                    <td style="padding: 15px; color: #10B981; font-weight: bold;">0 XP</td>
                    <td style="padding: 15px;"><button style="background:#10B981; color:white; border:none; padding:5px 10px; border-radius:5px;">+1</button></td>
                    <td style="padding: 15px;"><button style="background:#EF4444; color:white; border:none; padding:5px 10px; border-radius:5px;">-5</button></td>
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
                
                console.log([Filtro UI] Comparando Fila: '' vs Pestaña: '');
                
                if (filaGrado === gradoTarget) {
                    fila.style.display = 'table-row'; // Mostrar como fila normal
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
    print("app.js actualizado con normalizador universal.")
