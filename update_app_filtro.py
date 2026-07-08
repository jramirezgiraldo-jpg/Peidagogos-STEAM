with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

new_js = '''
// ==========================================
// FILTRO DE ESTRUCTURA CURRICULAR (MALLA)
// ==========================================
function filtrarContenido() {
    // Asumimos que existen selects globales o por grado con estos IDs o clases
    const selectPeriodo = document.getElementById('select-periodo');
    const selectSemana = document.getElementById('select-semana');
    
    if (!selectPeriodo || !selectSemana) return;
    
    const periodo = selectPeriodo.value.toLowerCase().trim();
    const semana = selectSemana.value.toLowerCase().trim();
    
    // Buscar la malla que actualmente esté visible
    const mallaActiva = document.querySelector('.malla-view[style*="display: block"]');
    if (!mallaActiva) return;
    
    // Obtener las filas de la tabla de la malla activa
    const filas = mallaActiva.querySelectorAll('table tbody tr');
    
    filas.forEach(fila => {
        // Obtenemos los valores de periodo y semana desde los data-attributes o clases
        const filaPeriodo = fila.getAttribute('data-periodo') ? fila.getAttribute('data-periodo').toLowerCase().trim() : '';
        const filaSemana = fila.getAttribute('data-semana') ? fila.getAttribute('data-semana').toLowerCase().trim() : '';
        
        // También soportamos si el usuario usa las clases .w-exp, .w-ind, etc. que representan semanas
        const claseSemanaMatch = Array.from(fila.classList).find(c => c.startsWith('w-'));
        const semanaPorClase = claseSemanaMatch ? claseSemanaMatch.replace('w-', 'semana ') : '';
        
        const targetSemana = filaSemana || semanaPorClase;
        
        // Si coinciden los filtros (o si el filtro está vacío/\"todos\"), se muestra
        const coincidePeriodo = (periodo === '' || periodo === 'todos' || filaPeriodo === periodo);
        const coincideSemana = (semana === '' || semana === 'todas' || targetSemana === semana || targetSemana.includes(semana));
        
        if (coincidePeriodo && coincideSemana) {
            fila.style.display = 'table-row';
        } else {
            fila.style.display = 'none';
        }
    });
}

// Escuchar cambios en los selects
document.addEventListener('DOMContentLoaded', () => {
    const pSel = document.getElementById('select-periodo');
    const sSel = document.getElementById('select-semana');
    if(pSel) pSel.addEventListener('change', filtrarContenido);
    if(sSel) sSel.addEventListener('change', filtrarContenido);
});
'''

if "function filtrarContenido" not in js:
    with open('app.js', 'a', encoding='utf-8') as f:
        f.write("\n" + new_js)
    with open('js/app.js', 'a', encoding='utf-8') as f:
        f.write("\n" + new_js)
    print("Filtro curricular inyectado en app.js")
