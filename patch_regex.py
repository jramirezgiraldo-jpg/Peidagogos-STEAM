import io
import re

with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Buscamos desde "const htmlGenerado = marked.parse(data.text);"
# hasta antes del "} catch (error) {"
pattern = r"// Renderizar el Markdown usando marked\.js.*?\} catch \(error\) \{"

new_logic = '''// Inicializar Sticky Header
        const user = window.usuarioEstudianteActual;
        if (user) {
            document.getElementById('student-guide-header-name').innerText = user.nombres + " " + user.apellidos;
            // Calcular XP total del estudiante para esta materia y periodo
            const xpKey = `prog_${user.documento}_${asignatura}_p${periodo}`;
            let prog = parseInt(localStorage.getItem(xpKey)) || 1;
            // For now, XP calculation based on progress (simplification for testing)
            let currentXP = (prog > 1) ? (prog - 1) * 100 : 0;
            
            // Apply global penalties
            let pKey = `penalty_${user.grupo}_p${periodo}`;
            if (asignatura) pKey = `penalty_${user.grupo}_${asignatura}_p${periodo}`;
            let penStr = localStorage.getItem(pKey);
            if (penStr) {
                let penData = JSON.parse(penStr);
                currentXP -= (penData.total || 0);
            }
            if (currentXP < 0) currentXP = 0;
            
            document.getElementById('student-guide-header-xp').innerText = currentXP;
            
            window.guiaActualAsignatura = asignatura;
            window.guiaActualPeriodo = periodo;
        }

        let guideData;
        try {
            let cleanJson = data.text.replace(/```json/gi, '').replace(/```/g, '').trim();
            guideData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Error parseando JSON:", e, data.text);
            innerContent.innerHTML = `<div style="padding: 20px; background: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px; color: #B91C1C;"><strong>Error de formato IA:</strong> El generador no produjo un formato estructurado correcto.</div>`;
            return;
        }
        
        window.guideDataCache = guideData;
        
        let htmlRenderizado = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #1D4ED8; font-weight: 800; font-size: 1.5rem;">🎮 Tu Misión</h3>
                <p style="color: #6B7280;">Periodo ${periodo} - Semana ${semanaStr} | ${asignatura}</p>
            </div>
            <div class="mega-guide-container" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #E5E7EB; font-family: 'Inter', sans-serif;">
        `;
        
        if (guideData.saberes_previos) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 0;">🧠 Desafío 1: Saberes Previos</h4>`;
            htmlRenderizado += `<div id="saberes-previos-container" style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">`;
            guideData.saberes_previos.forEach((pregunta, idx) => {
                htmlRenderizado += `
                    <div class="pregunta-saberes" style="margin-bottom: 15px;">
                        <p style="font-weight: bold;">${idx+1}. ${pregunta.pregunta}</p>
                        ${pregunta.opciones.map((opcion, i) => `
                            <label style="display: block; margin-bottom: 8px; cursor: pointer; padding: 10px; background: white; border: 1px solid #D1D5DB; border-radius: 6px;">
                                <input type="radio" name="saber_${idx}" value="${i}" data-correct="${pregunta.correcta}" style="margin-right: 10px;">
                                ${opcion}
                            </label>
                        `).join('')}
                    </div>
                `;
            });
            htmlRenderizado += `<button onclick="evaluarSaberesPrevios()" style="background: #3B82F6; color: white; padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%;">Validar Respuestas</button>`;
            htmlRenderizado += `</div>`;
        }
        
        htmlRenderizado += `<div id="rest-of-guide-container" style="display: none; opacity: 0; transition: opacity 1s;">`;
        
        if (guideData.texto_inductivo) {
            htmlRenderizado += `<h4 style="color: #4F46E5;">📖 Exploración: Texto Inductivo</h4>`;
            htmlRenderizado += `<div class="markdown-body" style="font-size: 1.1rem; line-height: 1.6; color: #374151;">${marked.parse(guideData.texto_inductivo)}</div>`;
        }
        
        // Anti-cheat inputs para las preguntas
        if (guideData.preguntas_inductivas_pagina) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">✍️ Preguntas de Análisis (No Copy-Paste)</h4>`;
            htmlRenderizado += `<div style="background: #F8FAFC; padding: 20px; border: 1px dashed #94A3B8; border-radius: 8px; margin-bottom: 20px;">`;
            guideData.preguntas_inductivas_pagina.forEach((p, i) => {
                htmlRenderizado += `
                    <div style="margin-bottom: 15px;">
                        <label style="font-weight: bold; color: #1E293B; display: block; margin-bottom: 8px;">${i+1}. ${p}</label>
                        <textarea class="anti-cheat-textarea" data-qindex="${i}" rows="3" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #CBD5E1;" onpaste="return false;" ondrop="return false;" oninput="verificarEscrituraIA(this)"></textarea>
                        <div class="ai-warning" style="color: #EF4444; font-size: 0.9rem; font-weight: bold; display: none; margin-top: 5px;">⚠️ Se ha detectado velocidad de escritura anormal (Posible Copy-Paste / IA). Intenta escribir con tus propias palabras.</div>
                    </div>
                `;
            });
            htmlRenderizado += `<button onclick="validarPreguntasInductivas()" style="background: #10B981; color: white; padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%;">Enviar Respuestas</button>`;
            htmlRenderizado += `</div>`;
        }
        
        // Preguntas Cuaderno
        if (guideData.preguntas_inductivas_cuaderno) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">📓 Para desarrollar en el cuaderno</h4>`;
            htmlRenderizado += `<div id="cuaderno-container" style="background: #FFFBEB; padding: 20px; border: 1px dashed #F59E0B; border-radius: 8px; margin-bottom: 20px;">`;
            htmlRenderizado += `<ul style="margin-bottom: 20px;">`;
            guideData.preguntas_inductivas_cuaderno.forEach(p => {
                htmlRenderizado += `<li style="margin-bottom: 8px; color: #451A03;">${p}</li>`;
            });
            htmlRenderizado += `</ul>`;
            htmlRenderizado += `<button id="btn-cuaderno" onclick="validarCuaderno()" style="background: #F59E0B; color: white; padding: 10px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%;">✔️ Confirmo que lo he resuelto en mi cuaderno</button>`;
            htmlRenderizado += `</div>`;
        }
        
        htmlRenderizado += `<div style="text-align: center; margin-top: 30px; padding-bottom: 20px;">
                <button onclick="completarMisionActual()" style="background: #10B981; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: transform 0.2s;">✅ Completar Misión</button>
            </div>
        </div></div>`;

        innerContent.innerHTML = htmlRenderizado;
        
        // Registrar avance de semana
        if (user) {
            const key = `prog_${user.documento}_${asignatura}_p${periodo}`;
            let prog = parseInt(localStorage.getItem(key)) || 1;
            if (parseInt(semanaStr) >= prog) {
                localStorage.setItem(key, (parseInt(semanaStr) + 1).toString());
            }
        }
        
    } catch (error) {'''

# Usar re.DOTALL para que .* haga match con saltos de línea
js = re.sub(pattern, new_logic, js, flags=re.DOTALL)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
