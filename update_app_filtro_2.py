with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Reemplazar la lógica del filtro para que coincida exactamente con lo pedido
old_logic = '''        // Mostrar (table-row) u ocultar según el veredicto
        if (coincidePeriodo && coincideSemana) {
            fila.style.display = 'table-row';
        } else {
            fila.style.display = 'none';
        }'''

new_logic = '''        // Lógica estricta de ocultamiento/mostrado según mandato
        const valorFila = targetSemana;
        const valorSeleccionado = semana;
        
        // Aplica el filtro (si no hay filtro activo, muestra todo)
        if (valorSeleccionado === '' || valorSeleccionado === 'todas') {
            fila.style.display = '';
        } else {
            fila.style.display = (valorFila === valorSeleccionado || valorFila.includes(valorSeleccionado)) ? '' : 'none';
        }'''

js = js.replace(old_logic, new_logic)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Logica de filtro actualizada")
