import io
import re

with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

malla_turismo = """
// ==========================================
// MALLA CURRICULAR TURISMO
// ==========================================
window.mallaTurismo = {
    "7": {
        objetivo: "Desarrollar una mentalidad emprendedora y de reconocimiento cultural, valorando la riqueza del Eje Cafetero y de Colombia, así como el Paisaje Cultural Cafetero (PCC).",
        periodos: {
            "1": {
                "1": "El eje cafetero. Departamentos más importantes.",
                "3": "Municipios más importantes. Símbolos que identifican el eje cafetero.",
                "5": "Lugares turísticos más importantes del eje cafetero.",
                "7": "Mitos y leyendas del eje cafetero."
            },
            "2": {
                "1": "País de Colombia. Ubicación geográfica, mapa, himno, escudo, bandera.",
                "3": "Departamentos y capital de Colombia.",
                "5": "Costumbres, cultura y gentilicio de Colombia.",
                "7": "Sitios turísticos más importantes de Colombia. Mitos y leyendas."
            },
            "3": {
                "1": "Qué es el emprendimiento y su definición.",
                "3": "Tipos de emprendimiento.",
                "5": "Características y ejemplos de emprendimiento.",
                "7": "Idea de productos perecederos (maíz y huevo) y realización de su propio emprendimiento."
            },
            "4": {
                "1": "El reconocimiento de valor universal excepcional concedido al PCC.",
                "3": "Qué significa la inscripción de patrimonio mundial.",
                "5": "Qué significa el reconocimiento de valor universal excepcional concedido al PCC.",
                "7": "Colombianidad: qué es y por qué es importante. Todos los colombianos compartimos la misma colombianidad."
            }
        }
    },
    "PENS": {
        objetivo: "Fomentar el reconocimiento del Paisaje Cultural Cafetero, la cultura colombiana y el desarrollo de ideas emprendedoras en el contexto del turismo regional (Adaptación CLEI).",
        periodos: {
            "1": {
                "1": "El eje cafetero y sus departamentos más importantes.",
                "3": "Municipios y símbolos del eje cafetero.",
                "5": "Lugares turísticos más importantes.",
                "7": "Mitos y leyendas de la región."
            },
            "2": {
                "1": "Geografía, símbolos y departamentos de Colombia.",
                "3": "Costumbres y cultura nacional.",
                "5": "Sitios turísticos más importantes de Colombia.",
                "7": "Identidad cultural colombiana."
            },
            "3": {
                "1": "Introducción al emprendimiento.",
                "3": "Tipos y características del emprendimiento.",
                "5": "Desarrollo de ideas de negocio turísticas.",
                "7": "Formulación de proyectos productivos locales."
            },
            "4": {
                "1": "Patrimonio mundial y el PCC.",
                "3": "Importancia del Paisaje Cultural Cafetero.",
                "5": "Valor universal excepcional del PCC.",
                "7": "La colombianidad como factor de unión y desarrollo."
            }
        }
    }
};
"""

# Insert mallaTurismo before window.mallaFisica
if "window.mallaTurismo" not in js:
    js = js.replace('window.mallaFisica = {', malla_turismo + '\nwindow.mallaFisica = {')

# Modificar actualizarPlaneacionEstudiante
nueva_actualizar = """
window.actualizarPlaneacionEstudiante = function() {
    const contenido = document.getElementById('student-planeacion-contenido');
    const subjectTitle = document.getElementById('student-subject-title');
    
    if (!contenido || !window.gradoActualEstudiante || !subjectTitle) return;

    const gradoNum = window.gradoActualEstudiante.replace(/[^0-9PENS]/g, '');
    let asignatura = subjectTitle.innerText.replace('Aula de ', '').trim();
    
    let malla = null;
    if (asignatura.toLowerCase().includes('física')) {
        malla = window.mallaFisica;
    } else if (asignatura.toLowerCase().includes('turismo')) {
        malla = window.mallaTurismo;
    }

    const dataGrado = malla ? malla[gradoNum] : null;

    if (!dataGrado) {
        contenido.innerHTML = `<p style="color: #6B7280; font-style: italic; margin: 0;">Planeación en construcción para la materia de ${asignatura} en este grado.</p>`;
        contenido.style.display = 'block';
        return;
    }

    const periodo = document.getElementById('student-select-periodo').value;
    const semanaStr = document.getElementById('student-select-semana').value;
    const semanaNum = parseInt(semanaStr, 10);
    
    // Mapear semana 1-8 al bloque de temas '1', '3', '5', '7'
    let indexTema = '1';
    if (semanaNum >= 3 && semanaNum <= 4) indexTema = '3';
    else if (semanaNum >= 5 && semanaNum <= 6) indexTema = '5';
    else if (semanaNum >= 7 && semanaNum <= 8) indexTema = '7';

    const objetivo = dataGrado.objetivo;
    const tema = dataGrado.periodos[periodo] ? dataGrado.periodos[periodo][indexTema] : 'Sin tema definido';

    contenido.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Meta de Comprensión del Año:</strong>
            <p style="margin: 4px 0 0 0; color: #374151; font-size: 0.9rem;">${objetivo}</p>
        </div>
        <div>
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Tópico Generativo (Periodo ${periodo}, Semana ${semanaNum}):</strong>
            <p style="margin: 4px 0 0 0; color: #111827; font-weight: bold; font-size: 1rem;">${tema}</p>
        </div>
    `;
    contenido.style.display = 'block';
};
"""

# Usar regex para reemplazar la función entera
js = re.sub(r'window\.actualizarPlaneacionEstudiante\s*=\s*function\(\)\s*\{.*?\};\n', nueva_actualizar, js, flags=re.DOTALL)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
