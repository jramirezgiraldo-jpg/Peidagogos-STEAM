import io
import re

with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Fix user error in abrirHuevo
js = js.replace("const user = window.usuarioEstudianteActual;", "const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion'));")

# 2. Fix mostrarHuevos in evaluarSaberesPrevios
# change: mostrarHuevos(); 
# to: if (puntaje === numPreguntas) { mostrarHuevos(); }
js = re.sub(
    r'(document\.getElementById\(\'saberes-previos-container\'\)\.style\.opacity = \'0\.5\';.*?)(mostrarHuevos\(\);)',
    r'\1if (puntaje === numPreguntas) { \2 }',
    js, flags=re.DOTALL
)

# Remove mostrarHuevos from validarPreguntasInductivas and validarCuaderno
js = js.replace("textareas.forEach(t => t.disabled = true);\n    mostrarHuevos();", "textareas.forEach(t => t.disabled = true);")
js = js.replace("alert(\"¡Fantástico! Trabajar en el cuaderno fortalece tu memoria motriz. Continúa tu aventura.\");\n    mostrarHuevos();", "alert(\"¡Fantástico! Trabajar en el cuaderno fortalece tu memoria motriz. Continúa tu aventura.\");")

# 3. Modify rendering to interleave questions with paragraphs!
# We find the place where texto_inductivo and preguntas_inductivas_pagina are rendered.
# Currently it looks like:
# htmlRenderizado += `<div class="story-section"><h3>📖 La Aventura</h3><p>${data.texto_inductivo.replace(/\\n/g, '<br>')}</p></div>`;
# htmlRenderizado += `<div class="question-section" style="margin-top: 20px;">
#             <h3 style="color: #4F46E5; display: flex; align-items: center; gap: 8px;">🧠 Preguntas de Análisis (No Copy-Paste)</h3>`;
# data.preguntas_inductivas_pagina.forEach((p, i) => ...

# We will replace the whole inductive and deductive rendering!

new_inductive_render = """
        // Separar texto en párrafos para intercalar preguntas
        let parrafosInductivos = data.texto_inductivo.split(/\\n\\n+/);
        let htmlInductivo = `<div class="story-section"><h3>📖 La Aventura</h3>`;
        let preguntasI = data.preguntas_inductivas_pagina || [];
        
        parrafosInductivos.forEach((parrafo, i) => {
            htmlInductivo += `<p>${parrafo.replace(/\\n/g, '<br>')}</p>`;
            // Intercalar 1 pregunta por cada párrafo si hay disponibles
            if (preguntasI[i]) {
                htmlInductivo += `
                <div class="question-section" style="margin: 15px 0; padding: 15px; border-left: 4px solid #4F46E5; background: #F8FAFC; border-radius: 0 8px 8px 0;">
                    <p style="font-weight: bold; color: #4F46E5; margin-bottom: 8px;">🤔 Pregunta Flash:</p>
                    <p>${preguntasI[i]}</p>
                    <textarea class="ia-protected-textarea" onpaste="return false;" oncopy="return false;" oncut="return false;" ondrop="return false;" oninput="verificarEscrituraIA(this)" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #CBD5E1; margin-top: 10px;" rows="2"></textarea>
                </div>`;
            }
        });
        
        // Si sobraron preguntas, ponerlas al final
        for (let i = parrafosInductivos.length; i < preguntasI.length; i++) {
            htmlInductivo += `
                <div class="question-section" style="margin: 15px 0; padding: 15px; border-left: 4px solid #4F46E5; background: #F8FAFC; border-radius: 0 8px 8px 0;">
                    <p style="font-weight: bold; color: #4F46E5; margin-bottom: 8px;">🤔 Pregunta Flash:</p>
                    <p>${preguntasI[i]}</p>
                    <textarea class="ia-protected-textarea" onpaste="return false;" oncopy="return false;" oncut="return false;" ondrop="return false;" oninput="verificarEscrituraIA(this)" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #CBD5E1; margin-top: 10px;" rows="2"></textarea>
                </div>`;
        }
        
        htmlInductivo += `<button onclick="validarPreguntasInductivas()" style="margin-top: 15px; background: #1E293B; color: white; padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Enviar Respuestas</button></div>`;
        
        htmlRenderizado += htmlInductivo;
"""

# Deductive rendering replacement
new_deductive_render = """
        let parrafosDeductivos = data.texto_deductivo.split(/\\n\\n+/);
        let htmlDeductivo = `<div class="story-section" style="margin-top: 30px;"><h3>📜 El Desafío Final</h3>`;
        let preguntasD = data.preguntas_deductivas_pagina || [];
        
        parrafosDeductivos.forEach((parrafo, i) => {
            htmlDeductivo += `<p>${parrafo.replace(/\\n/g, '<br>')}</p>`;
            // Intercalar 1 pregunta
            if (preguntasD[i]) {
                htmlDeductivo += `
                <div class="question-section" style="margin: 15px 0; padding: 15px; border-left: 4px solid #10B981; background: #F0FDF4; border-radius: 0 8px 8px 0;">
                    <p style="font-weight: bold; color: #10B981; margin-bottom: 8px;">🤔 Pregunta Flash:</p>
                    <p>${preguntasD[i]}</p>
                    <textarea class="ia-protected-textarea" onpaste="return false;" oncopy="return false;" oncut="return false;" ondrop="return false;" oninput="verificarEscrituraIA(this)" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #CBD5E1; margin-top: 10px;" rows="2"></textarea>
                </div>`;
            }
        });
        
        for (let i = parrafosDeductivos.length; i < preguntasD.length; i++) {
            htmlDeductivo += `
                <div class="question-section" style="margin: 15px 0; padding: 15px; border-left: 4px solid #10B981; background: #F0FDF4; border-radius: 0 8px 8px 0;">
                    <p style="font-weight: bold; color: #10B981; margin-bottom: 8px;">🤔 Pregunta Flash:</p>
                    <p>${preguntasD[i]}</p>
                    <textarea class="ia-protected-textarea" onpaste="return false;" oncopy="return false;" oncut="return false;" ondrop="return false;" oninput="verificarEscrituraIA(this)" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #CBD5E1; margin-top: 10px;" rows="2"></textarea>
                </div>`;
        }
        htmlDeductivo += `<button onclick="validarPreguntasInductivas()" style="margin-top: 15px; background: #1E293B; color: white; padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Enviar Respuestas</button></div>`;
        
        htmlRenderizado += htmlDeductivo;
"""

# Regex to find inductive block
js = re.sub(
    r'htmlRenderizado \+= `<div class="story-section"><h3>📖 La Aventura</h3><p>\$\{data\.texto_inductivo\.replace\(/\\n/g, \'<br>\'\)\}</p></div>`;.*?<button onclick="validarPreguntasInductivas\(\)".*?</button>\s*</div>`;',
    new_inductive_render,
    js, flags=re.DOTALL
)

# Regex to find deductive block
js = re.sub(
    r'htmlRenderizado \+= `<div class="story-section" style="margin-top: 30px;"><h3>📜 El Desafío Final</h3><p>\$\{data\.texto_deductivo\.replace\(/\\n/g, \'<br>\'\)\}</p></div>`;.*?<button onclick="validarPreguntasInductivas\(\)".*?</button>\s*</div>`;',
    new_deductive_render,
    js, flags=re.DOTALL
)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
