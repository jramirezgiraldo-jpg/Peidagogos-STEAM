import re

with open('app.js', 'r', encoding='latin-1') as f:
    content = f.read()

# 1. Update procesarJuegosEnTexto
juegos_new = """window.procesarJuegosEnTexto = function(textoMarkdown) {
    if (!textoMarkdown) return "";
    let html = marked.parse(textoMarkdown);
    
    // Buscar [JUEGO:TIPO:DATOS]
    const regexJuego = /\\[JUEGO:(ORDENAR_LETRAS|ORDENAR_FRASE|SOPA_LETRAS|CRUCIGRAMA):(.*?)\\]/g;
    html = html.replace(regexJuego, (match, tipo, datos) => {
        let uniqueId = 'juego_' + Math.random().toString(36).substr(2, 9);
        if (tipo === 'ORDENAR_LETRAS') {
            return `<div class="juego-incrustado" style="background:#F0FDF4; border:2px dashed #22C55E; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#166534; margin-top:0;">🎮 Minijuego: Ordenar Letras</h5>
                ${window.renderizarJuegoOrdenar(datos.split(''), 'letras')}
            </div>`;
        } else if (tipo === 'ORDENAR_FRASE') {
            let palabras = datos.split(' ');
            return `<div class="juego-incrustado" style="background:#EFF6FF; border:2px dashed #3B82F6; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#1E3A8A; margin-top:0;">🎮 Minijuego: Ordenar Frase</h5>
                ${window.renderizarJuegoOrdenar(palabras, 'palabras')}
            </div>`;
        } else if (tipo === 'SOPA_LETRAS') {
            let palabras = datos.split(',');
            window.juegosPendientes.push(() => window.renderizarSopaLetras(uniqueId, palabras));
            return `<div class="juego-incrustado" style="background:#FFFBEB; border:2px dashed #F59E0B; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#92400E; margin-top:0;">🔍 Minijuego: Sopa de Letras</h5>
                <div id="${uniqueId}" style="display:flex; flex-direction:column; align-items:center;">Cargando sopa de letras...</div>
            </div>`;
        } else if (tipo === 'CRUCIGRAMA') {
            window.juegosPendientes.push(() => window.renderizarCrucigrama(uniqueId, datos));
            return `<div class="juego-incrustado" style="background:#FAF5FF; border:2px dashed #A855F7; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#581C87; margin-top:0;">✏️ Minijuego: Crucigrama</h5>
                <div id="${uniqueId}" style="display:flex; flex-direction:column; align-items:center;">Cargando crucigrama...</div>
            </div>`;
        }
        return match;
    });

    const regexAct = /\\[ACTIVIDAD:(PLATAFORMA|CUADERNO):(.*?)\\]/g;
    html = html.replace(regexAct, (match, tipo, datos) => {
        if (tipo === 'PLATAFORMA') {
            const partes = datos.split('|');
            const pregunta = partes[0] || '';
            const respuesta = partes[1] || '';
            const idText = 'act_' + Math.random().toString(36).substr(2, 9);
            return `<div style="background:#F3F4F6; padding:15px; border-left:4px solid #3B82F6; margin: 15px 0; border-radius:4px;">
                <h5 style="color:#1E3A8A; margin-top:0; margin-bottom:10px;">💻 Actividad en Plataforma</h5>
                <p style="margin-bottom:10px; font-weight:bold;">${pregunta}</p>
                <textarea id="${idText}" rows="3" style="width:100%; border:1px solid #D1D5DB; border-radius:4px; padding:10px;" placeholder="Escribe tu respuesta aquí..."></textarea>
                <button onclick="verificarRespuestaActividad('${idText}', '${btoa(encodeURIComponent(respuesta))}')" style="margin-top:10px; background:#3B82F6; color:white; border:none; padding:8px 16px; border-radius:4px; font-weight:bold; cursor:pointer;">Responder</button>
                <div id="fb_${idText}" style="margin-top:10px; display:none;"></div>
            </div>`;
        } else if (tipo === 'CUADERNO') {
            return `<div style="background:#FEF3C7; padding:15px; border-left:4px solid #D97706; margin: 15px 0; border-radius:4px;">
                <h5 style="color:#92400E; margin-top:0; margin-bottom:10px;">📝 Actividad en el Cuaderno</h5>
                <p style="margin-bottom:0;">${datos}</p>
            </div>`;
        }
        return match;
    });
    
    return html;
};

window.verificarRespuestaActividad = function(id, respuestaEsperadaB64) {
    const textarea = document.getElementById(id);
    const fb = document.getElementById('fb_' + id);
    if (!textarea.value.trim()) {
        fb.innerHTML = '<span style="color:#DC2626;">Por favor escribe una respuesta.</span>';
        fb.style.display = 'block';
        return;
    }
    const respuestaEsperada = decodeURIComponent(atob(respuestaEsperadaB64));
    fb.innerHTML = `<div style="background:#D1FAE5; color:#065F46; padding:10px; border-radius:4px; margin-top:10px;">
        <strong>¡Muy bien!</strong> Tu respuesta ha sido enviada. Compara tu respuesta con esta idea clave: <em>${respuestaEsperada}</em>
    </div>`;
    fb.style.display = 'block';
    textarea.disabled = true;
    if(typeof mostrarHuevos === 'function') mostrarHuevos();
};
"""

content = re.sub(r'window\.procesarJuegosEnTexto = function\(textoMarkdown\) \{.*?\};\s*window\.ingresarAGuia =', juegos_new + '\nwindow.ingresarAGuia =', content, flags=re.DOTALL)


# 2. Update Juegos Drag & Drop to Click-Swap
swap_code = """window.renderizarJuegoOrdenar = function(items, tipo) {
    let html = `<div class="juego-ordenar-container" style="display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0;">`;
    let desordenado = [...items].sort(() => Math.random() - 0.5);
    desordenado.forEach((item, idx) => {
        html += `<div class="swap-item" onclick="seleccionarSwap(this)" data-original="${item}" data-tipo="${tipo}" style="background: #3B82F6; color: white; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; user-select: none; transition: transform 0.2s, background 0.2s;">${item}</div>`;
    });
    html += `</div>`;
    html += `<button onclick="verificarOrdenSwap(this, '${btoa(encodeURIComponent(items.join('')))}', '${tipo}')" style="background: #10B981; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Verificar Orden</button>`;
    return html;
};

var swapSeleccionado = null;
window.seleccionarSwap = function(el) {
    if (swapSeleccionado === null) {
        swapSeleccionado = el;
        el.style.transform = 'scale(1.1)';
        el.style.background = '#2563EB';
    } else if (swapSeleccionado === el) {
        swapSeleccionado.style.transform = 'scale(1)';
        swapSeleccionado.style.background = '#3B82F6';
        swapSeleccionado = null;
    } else {
        let tempText = el.innerText;
        let tempOrig = el.getAttribute('data-original');
        el.innerText = swapSeleccionado.innerText;
        el.setAttribute('data-original', swapSeleccionado.getAttribute('data-original'));
        swapSeleccionado.innerText = tempText;
        swapSeleccionado.setAttribute('data-original', tempOrig);
        swapSeleccionado.style.transform = 'scale(1)';
        swapSeleccionado.style.background = '#3B82F6';
        swapSeleccionado = null;
    }
};

window.verificarOrdenSwap = function(btn, originalB64, tipo) {
    const originalStr = decodeURIComponent(atob(originalB64));
    const container = btn.previousElementSibling;
    const items = container.querySelectorAll('.swap-item');
    let currentStr = Array.from(items).map(i => i.getAttribute('data-original')).join(tipo==='palabras' ? '' : '');
    let originalTarget = originalStr;
    if(tipo==='palabras') originalTarget = originalStr.split('').join('');
    
    if (currentStr === originalTarget) {
        btn.style.background = '#34D399';
        btn.innerText = '¡Correcto! 🎉';
        btn.disabled = true;
        items.forEach(i => { i.style.background = '#10B981'; i.style.cursor = 'default'; i.onclick = null; });
        if(typeof mostrarHuevos === 'function') mostrarHuevos();
    } else {
        btn.style.background = '#EF4444';
        btn.innerText = '¡Inténtalo de nuevo!';
        setTimeout(() => {
            btn.style.background = '#10B981';
            btn.innerText = 'Verificar Orden';
        }, 2000);
    }
};
"""
content = re.sub(r'window\.renderizarJuegoOrdenar = function.*?window\.verificarOrden = function.*?\}\s*;\s*', swap_code + '\n', content, flags=re.DOTALL)


# 3. Update renderizarSopaLetras to touch friendly
sopa_code = """window.renderizarSopaLetras = function(containerId, palabras) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const size = 12;
    let grid = Array(size).fill(null).map(() => Array(size).fill(''));
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let html = `<div style="display: flex; flex-direction: column; gap: 20px; align-items:center;">`;
    
    // Put words randomly for UI demo. Real generation is complex for frontend.
    palabras.forEach(palabra => {
        let p = palabra.toUpperCase().replace(/[^A-Z]/g, '');
        if (p.length > size) p = p.substring(0, size);
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 50) {
            let row = Math.floor(Math.random() * size);
            let col = Math.floor(Math.random() * size);
            let dir = Math.random() > 0.5 ? 'H' : 'V';
            if (dir === 'H' && col + p.length <= size) {
                let canPlace = true;
                for (let i=0; i<p.length; i++) if (grid[row][col+i] !== '' && grid[row][col+i] !== p[i]) canPlace = false;
                if (canPlace) {
                    for (let i=0; i<p.length; i++) grid[row][col+i] = p[i];
                    placed = true;
                }
            } else if (dir === 'V' && row + p.length <= size) {
                let canPlace = true;
                for (let i=0; i<p.length; i++) if (grid[row+i][col] !== '' && grid[row+i][col] !== p[i]) canPlace = false;
                if (canPlace) {
                    for (let i=0; i<p.length; i++) grid[row+i][col] = p[i];
                    placed = true;
                }
            }
            attempts++;
        }
    });

    for(let r=0; r<size; r++) {
        for(let c=0; c<size; c++) {
            if(grid[r][c] === '') grid[r][c] = letras.charAt(Math.floor(Math.random() * letras.length));
        }
    }
    
    html += `<div style="display: grid; grid-template-columns: repeat(${size}, 30px); gap: 2px;">`;
    for(let r=0; r<size; r++) {
        for(let c=0; c<size; c++) {
            html += `<div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: #E5E7EB; border-radius: 4px; font-weight: bold; cursor: pointer; user-select:none;" onclick="this.style.background = (this.style.background.includes('rgb(252, 211, 77)') ? '#E5E7EB' : '#FCD34D')">${grid[r][c]}</div>`;
        }
    }
    html += `</div>`;
    html += `<div style="text-align:center;"><p>Encuentra las palabras:</p><div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">${palabras.map(p => `<span style="background:#DBEAFE; padding:4px 8px; border-radius:4px; font-size:0.9rem;">${p}</span>`).join('')}</div></div>`;
    html += `<button onclick="this.disabled=true; this.innerText='🎉 Sopa Completada'; this.style.background='#10B981'; if(typeof mostrarHuevos === 'function') mostrarHuevos();" style="margin-top: 10px; background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor:pointer; font-weight:bold;">Validar y Terminar Sopa</button></div>`;
    
    container.innerHTML = html;
};"""

content = re.sub(r'window\.renderizarSopaLetras = function.*?\}\s*;\s*// --- CRUCIGRAMA ---', sopa_code + '\n\n// --- CRUCIGRAMA ---', content, flags=re.DOTALL)
content = re.sub(r'window\.renderizarSopaLetras = function\(containerId, palabras\).*?if \(canPlace\).*?\}\s*\}\s*', '', content, flags=re.DOTALL)

# 4. Update htmlRenderizado removal of old questions and addition of ICFES
html_build_regex = r'(// Anti-cheat inputs para las preguntas.*?)(\s*htmlRenderizado \+= `<div style="text-align: center; margin-top: 30px; padding-bottom: 20px;">)'

icfes_inject = r"""
        // FASE ICFES
        if (guideData.icfes && guideData.icfes.length > 0) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 30px;">📝 Pruebas Saber (ICFES)</h4>`;
            htmlRenderizado += `<div style="background: #F8FAFC; padding: 20px; border: 1px dashed #94A3B8; border-radius: 8px; margin-bottom: 20px;">`;
            
            guideData.icfes.forEach((q, idx) => {
                htmlRenderizado += `<div style="margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #CBD5E1;">
                    <span style="background: #E0E7FF; color: #4338CA; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; margin-bottom: 10px; display: inline-block;">Competencia: ${q.competencia || 'General'}</span>
                    <p style="margin-bottom: 15px; font-size: 1.05rem;">${marked.parse(q.texto_introductorio || '')}</p>
                    ${q.tabla_o_grafica_markdown ? `<div style="margin-bottom: 15px; overflow-x: auto;">${marked.parse(q.tabla_o_grafica_markdown)}</div>` : ''}
                    <p style="font-weight: bold; margin-bottom: 15px;">${idx+1}. ${q.pregunta}</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                `;
                q.opciones.forEach((opt, optIdx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const isCorrect = (optIdx === q.correcta);
                    const retro = (q.retroalimentacion && q.retroalimentacion[optIdx]) ? btoa(encodeURIComponent(q.retroalimentacion[optIdx])) : btoa(encodeURIComponent(''));
                    
                    htmlRenderizado += `
                        <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; padding: 10px; background: white; border: 1px solid #E2E8F0; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='#F1F5F9'" onmouseout="this.style.background='white'">
                            <input type="radio" name="icfes_${idx}" value="${optIdx}" style="margin-top: 4px;" onclick="seleccionarIcfes(this, ${isCorrect}, '${retro}')">
                            <span><strong>${letters[optIdx]}.</strong> ${opt}</span>
                        </label>
                    `;
                });
                
                htmlRenderizado += `
                    </div>
                    <div id="icfes_fb_${idx}" style="margin-top: 15px; display: none; padding: 15px; border-radius: 8px;"></div>
                </div>`;
            });
            htmlRenderizado += `</div>`;
        }

        window.seleccionarIcfes = function(radio, isCorrect, retroB64) {
            const name = radio.name;
            const idx = name.split('_')[1];
            const fbBox = document.getElementById('icfes_fb_' + idx);
            const retro = decodeURIComponent(atob(retroB64));
            
            // Disable all radios in this group
            const group = document.getElementsByName(name);
            group.forEach(r => r.disabled = true);
            
            if (isCorrect) {
                fbBox.style.background = '#D1FAE5';
                fbBox.style.color = '#065F46';
                fbBox.innerHTML = `<strong>¡Correcto! 🎉</strong><br><br>${retro}`;
                if(typeof mostrarHuevos === 'function') mostrarHuevos();
            } else {
                fbBox.style.background = '#FEE2E2';
                fbBox.style.color = '#991B1B';
                fbBox.innerHTML = `<strong>Incorrecto.</strong><br><br>${retro}`;
            }
            fbBox.style.display = 'block';
        };
\g<2>"""

content = re.sub(html_build_regex, icfes_inject, content, flags=re.DOTALL)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

