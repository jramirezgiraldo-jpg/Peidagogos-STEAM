import io
import re

# PATCH LOGIN.HTML
with io.open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add marked.js
script_tag = '<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>'
if script_tag not in html:
    html = html.replace('</head>', f'    {script_tag}\n</head>')

# Add styles for markdown content in student guide
custom_styles = '''
    <style>
        .markdown-body {
            font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
            font-size: 16px;
            line-height: 1.5;
            word-wrap: break-word;
            color: #24292f;
        }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
            border-bottom: 1px solid #hsla(210,18%,87%,1);
            padding-bottom: .3em;
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
            color: #111827;
        }
        .markdown-body ul {
            padding-left: 2em;
            margin-top: 0;
            margin-bottom: 16px;
            list-style-type: disc;
        }
        .markdown-body p {
            margin-top: 0;
            margin-bottom: 16px;
        }
        .markdown-body strong {
            font-weight: 600;
            color: #1E3A8A;
        }
    </style>
'''
if 'markdown-body' not in html:
    html = html.replace('</head>', f'{custom_styles}\n</head>')

with io.open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)

# PATCH APP.JS
with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Modify ingresarAGuia to do the fetch
target_ingresar = '''window.ingresarAGuia = function() {
    const rol = document.getElementById("student-quest-rol").value;
    const ambiente = document.getElementById("student-quest-ambiente").value;
    const nivel = document.getElementById("student-quest-nivel").value;
    const enfoque = document.getElementById("student-quest-enfoque").value;
    
    if (!rol || !ambiente || !nivel || !enfoque) {
        alert("¡Por favor completa todos los menús para personalizar tu aventura!");
        return;
    }
    
    const periodo = document.getElementById("student-select-periodo").value;
    const semana = document.getElementById("student-select-semana").value;
    
    const questContainer = document.getElementById("student-quest-container");
    const guideContent = document.getElementById("student-guide-content");
    const innerContent = document.getElementById("student-guide-inner-content");
    
    if (questContainer) questContainer.style.display = "none";
    if (guideContent) guideContent.style.display = "block";
    
    if (innerContent) {
        innerContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #1D4ED8; font-weight: 800; font-size: 1.5rem;">🎮 Misión Inicializada</h3>
                <p style="color: #6B7280;">Periodo ${periodo} - Semana ${semana}</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px;">
                <h4 style="color: #111827; font-weight: bold; margin-bottom: 15px;">Parámetros de tu Aventura:</h4>
                <ul style="list-style-type: none; padding: 0; color: #374151; font-weight: 500;">
                    <li style="margin-bottom: 8px;">👤 <strong style="color: #1E3A8A;">Rol:</strong> ${document.getElementById("student-quest-rol").options[document.getElementById("student-quest-rol").selectedIndex].text}</li>
                    <li style="margin-bottom: 8px;">🌍 <strong style="color: #10B981;">Ambiente:</strong> ${document.getElementById("student-quest-ambiente").options[document.getElementById("student-quest-ambiente").selectedIndex].text}</li>
                    <li style="margin-bottom: 8px;">⚔️ <strong style="color: #F59E0B;">Nivel:</strong> ${document.getElementById("student-quest-nivel").options[document.getElementById("student-quest-nivel").selectedIndex].text}</li>
                    <li style="margin-bottom: 8px;">🎯 <strong style="color: #EC4899;">Enfoque:</strong> ${document.getElementById("student-quest-enfoque").options[document.getElementById("student-quest-enfoque").selectedIndex].text}</li>
                </ul>
            </div>
            <div style="padding: 20px; background: #FFFBEB; border: 1px dashed #F59E0B; border-radius: 8px; text-align: center; color: #92400E; font-weight: 600;">
                <p>Aquí se cargará el contenido gamificado de la guía de estudio según la configuración elegida.</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">(Desarrollo en progreso)</p>
            </div>
        `;
    }
};'''

replacement_ingresar = '''window.ingresarAGuia = async function() {
    const rolElem = document.getElementById("student-quest-rol");
    const ambienteElem = document.getElementById("student-quest-ambiente");
    const nivelElem = document.getElementById("student-quest-nivel");
    const enfoqueElem = document.getElementById("student-quest-enfoque");
    
    if (!rolElem.value || !ambienteElem.value || !nivelElem.value || !enfoqueElem.value) {
        alert("¡Por favor completa todos los menús para personalizar tu aventura!");
        return;
    }
    
    const periodo = document.getElementById("student-select-periodo").value;
    const semanaStr = document.getElementById("student-select-semana").value;
    const asignatura = document.getElementById('student-subject-title').innerText.replace('Aula de ', '').trim();
    
    const questContainer = document.getElementById("student-quest-container");
    const guideContent = document.getElementById("student-guide-content");
    const innerContent = document.getElementById("student-guide-inner-content");
    
    if (questContainer) questContainer.style.display = "none";
    if (guideContent) guideContent.style.display = "block";
    
    // Obtener la meta y el tópico de la malla
    const gradoNum = window.gradoActualEstudiante.replace(/[^0-9PENS]/g, '');
    let malla = null;
    if (asignatura.toLowerCase().includes('física')) malla = window.mallaFisica;
    else if (asignatura.toLowerCase().includes('turismo')) malla = window.mallaTurismo;
    
    let meta = "Aprender los conceptos básicos";
    let topico = "Introducción a la materia";
    
    if (malla && malla[gradoNum]) {
        meta = malla[gradoNum].objetivo;
        const semanaNum = parseInt(semanaStr, 10);
        let indexTema = '1';
        if (semanaNum >= 3 && semanaNum <= 4) indexTema = '3';
        else if (semanaNum >= 5 && semanaNum <= 6) indexTema = '5';
        else if (semanaNum >= 7 && semanaNum <= 8) indexTema = '7';
        if (malla[gradoNum].periodos[periodo]) {
            topico = malla[gradoNum].periodos[periodo][indexTema] || topico;
        }
    }
    
    // Mostrar UI de carga
    if (innerContent) {
        innerContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #1D4ED8; font-weight: 800; font-size: 1.5rem;">🎮 Misión Inicializada</h3>
                <p style="color: #6B7280;">Periodo ${periodo} - Semana ${semanaStr} | ${asignatura}</p>
            </div>
            <div style="text-align: center; padding: 40px;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #E5E7EB; border-top-color: #3B82F6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                <h3 style="margin-top: 20px; color: #3B82F6;">Generando tu aventura...</h3>
                <p style="color: #6B7280;">La Inteligencia Artificial está tejiendo tu misión, por favor espera unos segundos.</p>
            </div>
        `;
    }
    
    // Petición al Backend
    try {
        const payload = {
            asignatura,
            periodo,
            semana: semanaStr,
            meta,
            topico,
            rol: rolElem.options[rolElem.selectedIndex].text,
            ambiente: ambienteElem.options[ambienteElem.selectedIndex].text,
            nivel: nivelElem.options[nivelElem.selectedIndex].text,
            enfoque: enfoqueElem.options[enfoqueElem.selectedIndex].text
        };
        
        const response = await fetch('/api/generate-guide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (data.error) {
            innerContent.innerHTML = `<div style="padding: 20px; background: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px; color: #B91C1C;"><strong>Error:</strong> ${data.error}</div>`;
            return;
        }
        
        // Renderizar el Markdown usando marked.js
        const htmlGenerado = marked.parse(data.text);
        
        innerContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #1D4ED8; font-weight: 800; font-size: 1.5rem;">🎮 Tu Misión</h3>
                <p style="color: #6B7280;">Periodo ${periodo} - Semana ${semanaStr} | ${asignatura}</p>
            </div>
            <div class="markdown-body" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #E5E7EB;">
                ${htmlGenerado}
            </div>
        `;
        
    } catch (error) {
        console.error(error);
        innerContent.innerHTML = `<div style="padding: 20px; background: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px; color: #B91C1C;"><strong>Error de conexión:</strong> No se pudo conectar con el servidor central.</div>`;
    }
};'''

if 'window.ingresarAGuia = async function()' not in js:
    # Use re to safely replace
    js = re.sub(r'window\.ingresarAGuia\s*=\s*function\(\)\s*\{.*?\};\n', replacement_ingresar + '\n', js, flags=re.DOTALL)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
