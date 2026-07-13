import io

with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_logic = '''        // Renderizar el Markdown usando marked.js
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
        
        // Registrar que esta semana se desbloqueó o guardar progreso
        const user = window.usuarioEstudianteActual;
        if (user) {
            const key = `prog_${user.documento}_${asignatura}_p${periodo}`;
            let prog = parseInt(localStorage.getItem(key)) || 1;
            if (parseInt(semanaStr) >= prog) {
                localStorage.setItem(key, (parseInt(semanaStr) + 1).toString());
                // Disparar evento de storage manualmente para actualizar el ranking del admin si está abierto
                window.dispatchEvent(new Event('storage'));
            }
        }
        
    } catch (error) {'''

new_logic = '''        // Inicializar Sticky Header
        const user = window.usuarioEstudianteActual;
        if (user) {
            document.getElementById('student-guide-header-name').innerText = user.nombres + " " + user.apellidos;
            // Calcular XP total del estudiante para esta materia y periodo
            const xpKey = `xp_${user.documento}_${asignatura}_p${periodo}`;
            let currentXP = parseInt(localStorage.getItem(xpKey)) || 0;
            document.getElementById('student-guide-header-xp').innerText = currentXP;
            // Guardar en window variables globales para facil acceso durante los minijuegos
            window.guiaActualAsignatura = asignatura;
            window.guiaActualPeriodo = periodo;
        }

        // Parsear el JSON generado
        let guideData;
        try {
            // A veces Gemini puede devolver markdown codeblocks, limpiamos:
            let cleanJson = data.text.replace(/```json/gi, '').replace(/```/g, '').trim();
            guideData = JSON.parse(cleanJson);
        } catch (e) {
            console.error("Error parseando JSON de Gemini:", e);
            console.log("Raw response:", data.text);
            innerContent.innerHTML = `<div style="padding: 20px; background: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px; color: #B91C1C;"><strong>Error de formato IA:</strong> El generador no produjo un formato estructurado correcto. Por favor, intenta generar la guía de nuevo.</div>`;
            return;
        }
        
        // Motor de Renderizado JSON a HTML
        window.guideDataCache = guideData; // Lo guardamos globalmente para los minijuegos
        
        let htmlRenderizado = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #1D4ED8; font-weight: 800; font-size: 1.5rem;">🎮 Tu Misión</h3>
                <p style="color: #6B7280;">Periodo ${periodo} - Semana ${semanaStr} | ${asignatura}</p>
            </div>
            <div class="mega-guide-container" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #E5E7EB; font-family: 'Inter', sans-serif;">
        `;
        
        // Renderizar Saberes Previos
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
        
        // TEXTO INDUCTIVO
        if (guideData.texto_inductivo) {
            htmlRenderizado += `<h4 style="color: #4F46E5;">📖 Exploración: Texto Inductivo</h4>`;
            htmlRenderizado += `<div class="markdown-body" style="font-size: 1.1rem; line-height: 1.6; color: #374151;">${marked.parse(guideData.texto_inductivo)}</div>`;
        }
        
        // ... el resto de la interfaz (preguntas inductivas, juegos, deductivo, icfes) se irán construyendo y revelando poco a poco.
        // Por ahora dejaremos este placeholder para ir iterando fase por fase:
        htmlRenderizado += `<p style="margin-top: 20px;"><em>[El resto de la guía se encuentra bloqueado hasta superar los saberes previos...]</em></p>`;
        
        htmlRenderizado += `</div>`; // fin rest-of-guide-container
        htmlRenderizado += `</div>`; // fin mega-guide-container

        innerContent.innerHTML = htmlRenderizado;
        
        // Registrar avance de semana
        if (user) {
            const key = `prog_${user.documento}_${asignatura}_p${periodo}`;
            let prog = parseInt(localStorage.getItem(key)) || 1;
            if (parseInt(semanaStr) >= prog) {
                localStorage.setItem(key, (parseInt(semanaStr) + 1).toString());
                // En lugar de enviar un 'storage' genérico, ahora se actualizan los XP con los botones y minijuegos.
            }
        }
        
    } catch (error) {'''

if old_logic in js:
    js = js.replace(old_logic, new_logic)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
