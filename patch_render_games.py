import io
import re

with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Buscamos la parte donde se añade el boton de completar mision
pattern = r"htmlRenderizado \+= `<div style=\"text-align: center; margin-top: 30px; padding-bottom: 20px;\">[\r\n\s]+<button onclick=\"completarMisionActual\(\)\".*?</button>[\r\n\s]+</div>`"

new_render = '''        // JUEGOS 1
        if (guideData.juegos_ordenar_letras_1) {
            htmlRenderizado += `<h4 style="color: #F59E0B; margin-top: 20px;">🧩 Minijuegos de Agilidad</h4>`;
            guideData.juegos_ordenar_letras_1.forEach(palabra => {
                htmlRenderizado += `<div style="margin-bottom: 15px;">`;
                htmlRenderizado += `<p>Ordena las letras:</p>`;
                htmlRenderizado += window.renderizarJuegoOrdenar(palabra.split(''), 'letras');
                htmlRenderizado += `</div>`;
            });
        }
        if (guideData.juego_ordenar_frase_1) {
            htmlRenderizado += `<div style="margin-bottom: 15px;">`;
            htmlRenderizado += `<p>Ordena la frase:</p>`;
            htmlRenderizado += window.renderizarJuegoOrdenar(guideData.juego_ordenar_frase_1.split(' '), 'palabras');
            htmlRenderizado += `</div>`;
        }
        
        // TEXTO DEDUCTIVO
        if (guideData.texto_deductivo) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 30px;">📖 Profundización: Texto Deductivo</h4>`;
            htmlRenderizado += `<div class="markdown-body" style="font-size: 1.1rem; line-height: 1.6; color: #374151;">${marked.parse(guideData.texto_deductivo)}</div>`;
        }
        
        // PREGUNTAS DEDUCTIVAS
        if (guideData.preguntas_deductivas_pagina) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">✍️ Análisis Deductivo</h4>`;
            htmlRenderizado += `<div style="background: #F8FAFC; padding: 20px; border: 1px dashed #94A3B8; border-radius: 8px; margin-bottom: 20px;">`;
            guideData.preguntas_deductivas_pagina.forEach((p, i) => {
                htmlRenderizado += `
                    <div style="margin-bottom: 15px;">
                        <label style="font-weight: bold; color: #1E293B; display: block; margin-bottom: 8px;">${i+1}. ${p}</label>
                        <textarea class="anti-cheat-textarea" data-qindex="${i+5}" rows="3" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #CBD5E1;" onpaste="return false;" ondrop="return false;" oninput="verificarEscrituraIA(this)"></textarea>
                        <div class="ai-warning" style="color: #EF4444; font-size: 0.9rem; font-weight: bold; display: none; margin-top: 5px;">⚠️ Bloqueo Anti-CopyPaste activado.</div>
                    </div>
                `;
            });
            htmlRenderizado += `<button onclick="validarPreguntasInductivas()" style="background: #10B981; color: white; padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%;">Enviar Respuestas</button>`;
            htmlRenderizado += `</div>`;
        }
        
        // CUADERNO DEDUCTIVAS
        if (guideData.preguntas_deductivas_cuaderno) {
            htmlRenderizado += `<div id="cuaderno-container-2" style="background: #FFFBEB; padding: 20px; border: 1px dashed #F59E0B; border-radius: 8px; margin-bottom: 20px;">`;
            htmlRenderizado += `<ul style="margin-bottom: 20px;">`;
            guideData.preguntas_deductivas_cuaderno.forEach(p => {
                htmlRenderizado += `<li style="margin-bottom: 8px; color: #451A03;">${p}</li>`;
            });
            htmlRenderizado += `</ul>`;
            htmlRenderizado += `<button onclick="validarCuaderno()" style="background: #F59E0B; color: white; padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%;">✔️ Resuelto en mi cuaderno</button>`;
            htmlRenderizado += `</div>`;
        }
        
        // SOPA Y CRUCIGRAMA
        if (guideData.sopa_letras && guideData.sopa_letras.length > 0) {
            htmlRenderizado += `<h4 style="color: #F59E0B; margin-top: 30px;">🔍 Sopa de Letras</h4>`;
            htmlRenderizado += window.renderizarSopaLetras(guideData.sopa_letras);
        }
        if (guideData.crucigrama && guideData.crucigrama.length > 0) {
            htmlRenderizado += `<h4 style="color: #F59E0B; margin-top: 30px;">📝 Crucigrama de Conceptos</h4>`;
            htmlRenderizado += window.renderizarCrucigrama(guideData.crucigrama);
        }
        
        // ICFES
        if (guideData.icfes && guideData.icfes.length > 0) {
            htmlRenderizado += `<h4 style="color: #DC2626; margin-top: 40px; border-bottom: 2px solid #DC2626; padding-bottom: 10px;">🎓 Evaluación Formativa Tipo ICFES</h4>`;
            guideData.icfes.forEach((q, idx) => {
                htmlRenderizado += `<div style="background: white; border: 1px solid #E5E7EB; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">`;
                htmlRenderizado += `<div style="background: #DBEAFE; color: #1E40AF; padding: 5px 10px; border-radius: 4px; display: inline-block; font-size: 0.8rem; font-weight: bold; margin-bottom: 10px;">${q.competencia}</div>`;
                htmlRenderizado += `<p style="color: #374151; font-style: italic;">${q.texto_introductorio}</p>`;
                if (q.tabla_o_grafica_markdown) {
                    htmlRenderizado += `<div class="markdown-body" style="margin: 15px 0; background: #F9FAFB; padding: 15px; border-radius: 6px;">${marked.parse(q.tabla_o_grafica_markdown)}</div>`;
                }
                htmlRenderizado += `<p style="font-weight: 800; font-size: 1.1rem; color: #111827;">${idx+1}. ${q.pregunta}</p>`;
                htmlRenderizado += `<div style="margin-top: 15px;">`;
                
                // Preparar feedback limpio para inyectar como JSON en el dataset
                let fbClean = JSON.stringify(q.retroalimentacion || {}).replace(/'/g, "&apos;");
                
                q.opciones.forEach((opc, i) => {
                    htmlRenderizado += `
                        <label style="display: block; margin-bottom: 8px; cursor: pointer; padding: 12px; background: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 6px; transition: background 0.2s;">
                            <input type="radio" name="icfes_${idx}" value="${i}" data-correct="${q.correcta}" data-feedback='${fbClean}' style="margin-right: 10px;">
                            ${opc}
                        </label>
                    `;
                });
                htmlRenderizado += `</div>`;
                htmlRenderizado += `<button onclick="evaluarIcfes(${idx})" style="margin-top: 15px; background: #3B82F6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">Verificar Respuesta</button>`;
                htmlRenderizado += `<div id="icfes-fb-${idx}" style="margin-top: 15px; display: none;"></div>`;
                htmlRenderizado += `</div>`;
            });
        }
        
        htmlRenderizado += `<div style="text-align: center; margin-top: 30px; padding-bottom: 20px;">
                <button onclick="completarMisionActual()" style="background: #10B981; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: transform 0.2s;">✅ Completar Misión</button>
            </div>`
'''

if re.search(pattern, js):
    js = re.sub(pattern, new_render, js)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
