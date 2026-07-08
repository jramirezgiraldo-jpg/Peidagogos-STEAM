with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# FASE 1: Limpieza en JS (por si acaso)
js = js.replace('Institución Educativa Ramón Messa Londoño', 'Peidagogos STEAM - Global SaaS')
js = js.replace('IE Ramón Messa', 'Peidagogos STEAM')

# FASE 3 y 4: Lógica de Interfaz y Filtros
# Encontrar el final del DOMContentLoaded
end_idx = js.rfind("});")

if end_idx != -1:
    ui_logic = '''
    // ==========================================
    // LOGICA DE INTERFAZ Y FILTRADO (DOCENTE)
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-grado-btn');
    const periodoSelect = document.getElementById('periodo-select');
    const semanaSelect = document.getElementById('semana-select');
    
    // Función central de activación
    function activarVistaGrado(grado) {
        // 1. Estilos: Actualizar clases activas en los tabs
        tabBtns.forEach(btn => {
            if (btn.getAttribute('data-grado') === grado) {
                btn.style.borderBottom = '3px solid #3B82F6';
                btn.style.color = '#3B82F6';
            } else {
                btn.style.borderBottom = '3px solid transparent';
                btn.style.color = '#6B7280';
            }
        });
        
        // 2. Malla Curricular: Ocultar todas y mostrar la correcta
        document.querySelectorAll('.malla-view').forEach(m => m.style.display = 'none');
        const mallaActiva = document.getElementById('admin-malla-' + grado);
        if (mallaActiva) {
            mallaActiva.style.display = 'block';
            // 3. Título dinámico
            const h3 = mallaActiva.querySelector('h3');
            if (h3) h3.innerText = 'Malla Grado ' + grado + ' (Docente)';
        }

        // 4. Lista de Estudiantes: Filtrar por data-grado
        const filas = document.querySelectorAll('tbody tr');
        filas.forEach(fila => {
            const rowGrado = fila.getAttribute('data-grado');
            if (!rowGrado || rowGrado === grado) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
        
        aplicarFiltrosCruzados(); // Aplicar filtros de Periodo y Semana
    }
    
    // Función de Filtro Bidimensional
    function aplicarFiltrosCruzados() {
        const periodo = periodoSelect ? periodoSelect.value : '';
        const semana = semanaSelect ? semanaSelect.value : '';
        
        // Asumiendo que las filas de la malla curricular visible tienen data-periodo y data-semana
        const mallasVisibles = document.querySelectorAll('.malla-view[style*="display: block"] tr[data-periodo]');
        mallasVisibles.forEach(fila => {
            const filaPeriodo = fila.getAttribute('data-periodo');
            const filaSemana = fila.getAttribute('data-semana');
            
            const matchPeriodo = !periodo || filaPeriodo === periodo;
            const matchSemana = !semana || filaSemana === semana;
            
            if (matchPeriodo && matchSemana) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
    }

    // Bind events
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            activarVistaGrado(this.getAttribute('data-grado'));
        });
    });
    
    if (periodoSelect) periodoSelect.addEventListener('change', aplicarFiltrosCruzados);
    if (semanaSelect) semanaSelect.addEventListener('change', aplicarFiltrosCruzados);
'''
    # Quitar el listener antiguo de admin-grade-selector si existe
    old_listener = js.find('const adminSelector = document.getElementById("admin-grade-selector");')
    if old_listener != -1:
        old_listener_end = js.find('}', js.find('}', old_listener) + 1) + 1
        js = js[:old_listener] + js[old_listener_end:]
    
    # Recalcular end_idx
    end_idx = js.rfind("});")
    js = js[:end_idx] + ui_logic + js[end_idx:]

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("app.js actualizado con logica de tabs y filtros.")
