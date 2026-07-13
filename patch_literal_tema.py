import io
import re

with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update actualizarVisualizadorPlaneacion
old_visualizador = '''    visualizador.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Meta de Comprensión del Año (${asignatura}):</strong>
            <p style="margin: 4px 0 0 0; color: #374151; font-size: 0.9rem;">${objetivo}</p>
        </div>
        <div>
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Tópico Generativo (Periodo ${periodo}, Semana ${semanaNum}):</strong>
            <p style="margin: 4px 0 0 0; color: #111827; font-weight: bold; font-size: 1rem;">${tema}</p>
        </div>
    `;'''

new_visualizador = '''    const subTema = (semanaNum % 2 !== 0) 
        ? "Conceptos básicos e introducción a: " + tema.toLowerCase()
        : "Profundización, práctica y aplicación de: " + tema.toLowerCase();

    visualizador.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Meta de Comprensión del Año (${asignatura}):</strong>
            <p style="margin: 4px 0 0 0; color: #374151; font-size: 0.9rem;">${objetivo}</p>
        </div>
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Tópico Generativo (Bloque Quincenal):</strong>
            <p style="margin: 4px 0 0 0; color: #4B5563; font-size: 0.95rem;">${tema}</p>
        </div>
        <div>
            <strong style="color: #10B981; font-size: 0.95rem;">Tema Específico (Semana ${semanaNum}):</strong>
            <p style="margin: 4px 0 0 0; color: #111827; font-weight: bold; font-size: 1rem;">${subTema}</p>
        </div>
    `;'''

if old_visualizador in js:
    js = js.replace(old_visualizador, new_visualizador)


# 2. Update actualizarPlaneacionEstudiante
old_estudiante = '''    contenido.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Meta de Comprensión del Año:</strong>
            <p style="margin: 4px 0 0 0; color: #374151; font-size: 0.9rem;">${objetivo}</p>
        </div>
        <div>
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Tópico Generativo (Periodo ${periodo}, Semana ${semanaNum}):</strong>
            <p style="margin: 4px 0 0 0; color: #111827; font-weight: bold; font-size: 1rem;">${tema}</p>
        </div>
    `;'''

new_estudiante = '''    const subTema = (semanaNum % 2 !== 0) 
        ? "Conceptos básicos e introducción a: " + tema.toLowerCase()
        : "Profundización, práctica y aplicación de: " + tema.toLowerCase();

    contenido.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Meta de Comprensión del Año:</strong>
            <p style="margin: 4px 0 0 0; color: #374151; font-size: 0.9rem;">${objetivo}</p>
        </div>
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Tópico Generativo (Bloque Quincenal):</strong>
            <p style="margin: 4px 0 0 0; color: #4B5563; font-size: 0.95rem;">${tema}</p>
        </div>
        <div>
            <strong style="color: #10B981; font-size: 0.95rem;">Tema Específico (Semana ${semanaNum}):</strong>
            <p style="margin: 4px 0 0 0; color: #111827; font-weight: bold; font-size: 1rem;">${subTema}</p>
        </div>
    `;'''

if old_estudiante in js:
    js = js.replace(old_estudiante, new_estudiante)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
