import os
import re

app_js_path = r"d:\Peidagogos_Local\app.js"

with open(app_js_path, "r", encoding="utf-8") as f:
    content = f.read()

mallas_to_inject = """window.mallaMatematicas = {
    '6': { objetivo: 'Desarrollar el pensamiento numérico y espacial.', periodos: { '1': { '1': 'Sistemas Numéricos (Números Enteros).', '2': 'Operaciones Básicas con Enteros.' } } }
};
window.mallaNaturales = {
    '6': { objetivo: 'Comprender la estructura celular y el entorno vivo.', periodos: { '1': { '1': 'La Célula y sus partes.', '2': 'Funciones Celulares y organelos.' } } }
};
window.mallaSociales = {
    '6': { objetivo: 'Identificar el espacio geográfico y el universo.', periodos: { '1': { '1': 'Geografía Física.', '2': 'El Sistema Solar.' } } }
};
window.mallaCastellano = {
    '6': { objetivo: 'Fortalecer la comprensión lectora.', periodos: { '1': { '1': 'Tipos de Textos.', '2': 'Estructura del Cuento.' } } }
};

window.mallaFisica = {"""

content = content.replace("window.mallaFisica = {", mallas_to_inject)

# Update if-else blocks
if_else_injection = """
    if (asignatura.toLowerCase().includes('física')) {
        malla = window.mallaFisica;
    } else if (asignatura.toLowerCase().includes('matemática') || asignatura.toLowerCase().includes('matematica')) {
        malla = window.mallaMatematicas;
    } else if (asignatura.toLowerCase().includes('naturales')) {
        malla = window.mallaNaturales;
    } else if (asignatura.toLowerCase().includes('sociales')) {
        malla = window.mallaSociales;
    } else if (asignatura.toLowerCase().includes('castellano') || asignatura.toLowerCase().includes('humanidades')) {
        malla = window.mallaCastellano;
"""

# Replace the specific if blocks
content = content.replace("""    if (asignatura.toLowerCase().includes('física')) {""", if_else_injection)

# Replace the single line one at 1497
single_line_injection = """    if (asignatura.toLowerCase().includes('física')) malla = window.mallaFisica;
    else if (asignatura.toLowerCase().includes('matemática') || asignatura.toLowerCase().includes('matematica')) malla = window.mallaMatematicas;
    else if (asignatura.toLowerCase().includes('naturales')) malla = window.mallaNaturales;
    else if (asignatura.toLowerCase().includes('sociales')) malla = window.mallaSociales;
    else if (asignatura.toLowerCase().includes('castellano') || asignatura.toLowerCase().includes('humanidades')) malla = window.mallaCastellano;
"""
content = content.replace("""    if (asignatura.toLowerCase().includes('física')) malla = window.mallaFisica;""", single_line_injection)

with open(app_js_path, "w", encoding="utf-8") as f:
    f.write(content)

print("app.js patched successfully.")
