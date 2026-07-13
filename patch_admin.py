import io
import re

with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Modify actualizarVisualizadorPlaneacion
nueva_admin_actualizar = """
window.actualizarVisualizadorPlaneacion = function() {
    const selectorGrado = document.getElementById('select-planeacion-grado');
    const visualizador = document.getElementById('planeacion-visualizador');
    
    if (!selectorGrado || !visualizador) return;

    const gradoSeleccionado = selectorGrado.value;
    
    if (!gradoSeleccionado) {
        visualizador.style.display = 'none';
        return;
    }

    const gradoNum = gradoSeleccionado.replace(/[^0-9PENS]/g, '');
    
    // Check if we are in a specific subject mode. In the admin panel, we don't have a subject selector yet.
    // Wait, the admin panel currently only shows Fisica? Let's check how we know if it's Fisica or Turismo.
    // If the group is 7A, 7B, 7C, they see both Fisica and Turismo. 
    // For now, let's show Fisica if it exists, otherwise Turismo, or both? 
    // We will show a combined view or add a dropdown for subject. But since the user asked "lo mismo que hicimos con fisica", 
    // let's just make it work. Since Admin panel just selects a group.
    
    // We will inject a subject selector if it doesn't exist, or just show both. 
    // Let's just modify the html to have a subject selector in the admin panel.
};
"""
# Actually, the admin panel doesn't have a subject selector. I should patch login.html to add a subject selector in the admin panel if we want it to be "lo mismo que hicimos con fisica".
