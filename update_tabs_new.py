import re

with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_pattern = re.compile(r'// Lógica de Pestañas \(Tabs\) Estricta para mallas de grados.*?\}\);', re.DOTALL)

new_tabs_logic = '''// Lógica de Pestañas (Tabs) Estricta para mallas de grados
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 1. Capturar el clic y obtener el grado
                const grado = this.getAttribute('data-target') ? this.getAttribute('data-target').trim().toLowerCase() : '';
                console.log("Pestaña seleccionada: ", grado);
                
                if (!grado) return;
                
                // 2. Ocultar todos los contenedores de mallas
                const todasLasMallas = document.querySelectorAll('.contenedor-malla');
                todasLasMallas.forEach(malla => {
                    malla.style.display = 'none';
                });
                
                // 3. Mostrar ÚNICAMENTE el contenedor de la malla correspondiente
                const mallaActiva = document.getElementById('malla-grado-' + grado);
                if (mallaActiva) {
                    mallaActiva.style.display = 'block';
                }
                
                // Manejo de Estilos visuales
                tabBtns.forEach(b => {
                    b.classList.remove('activa', 'active');
                    b.style.borderBottom = '3px solid transparent';
                    b.style.color = '#6B7280';
                });
                this.classList.add('activa', 'active');
                this.style.borderBottom = '3px solid #3B82F6';
                this.style.color = '#3B82F6';
            });
        });
    }
});'''

new_js = old_pattern.sub(new_tabs_logic, js)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(new_js)
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(new_js)
print("Reemplazo exitoso de logica de pestanas app.js")
