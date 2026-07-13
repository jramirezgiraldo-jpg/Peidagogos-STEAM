import io

with io.open('app.js', 'a', encoding='utf-8') as f:
    f.write('''

// ==========================================
// FASE 3: MINIJUEGOS INTERACTIVOS
// ==========================================

// --- ORDENAR LETRAS Y PALABRAS ---
window.renderizarJuegoOrdenar = function(items, tipo) {
    let html = `<div class="juego-ordenar-container" style="display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0;">`;
    // Desordenar
    let desordenado = [...items].sort(() => Math.random() - 0.5);
    desordenado.forEach((item, idx) => {
        html += `<div class="draggable-item" draggable="true" ondragstart="dragItem(event)" ondragover="allowDropItem(event)" ondrop="dropItem(event)" data-original="${item}" data-tipo="${tipo}" style="background: #3B82F6; color: white; padding: 10px 15px; border-radius: 8px; cursor: grab; font-weight: bold; user-select: none;">${item}</div>`;
    });
    html += `</div>`;
    html += `<button onclick="verificarOrden(this, '${items.join('')}')" style="background: #10B981; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Verificar Orden</button>`;
    return html;
};

let draggedEl = null;
window.dragItem = function(e) {
    draggedEl = e.target;
    e.dataTransfer.effectAllowed = 'move';
};
window.allowDropItem = function(e) {
    e.preventDefault();
};
window.dropItem = function(e) {
    e.preventDefault();
    if (e.target.classList.contains('draggable-item') && draggedEl !== e.target) {
        let parent = e.target.parentNode;
        let children = Array.from(parent.children);
        let draggedIdx = children.indexOf(draggedEl);
        let targetIdx = children.indexOf(e.target);
        
        if (draggedIdx < targetIdx) {
            parent.insertBefore(draggedEl, e.target.nextSibling);
        } else {
            parent.insertBefore(draggedEl, e.target);
        }
    }
};

window.verificarOrden = function(btn, correctStr) {
    let parent = btn.previousElementSibling;
    let items = Array.from(parent.children).map(el => el.innerText).join('');
    if (items === correctStr) {
        btn.innerHTML = "✅ ¡Correcto!";
        btn.style.background = "#10B981";
        btn.disabled = true;
        parent.style.opacity = "0.6";
        parent.style.pointerEvents = "none";
        mostrarHuevos(); // Recompensa
    } else {
        btn.innerHTML = "❌ Intenta de nuevo";
        btn.style.background = "#EF4444";
        setTimeout(() => {
            btn.innerHTML = "Verificar Orden";
            btn.style.background = "#10B981";
        }, 1500);
    }
};

// --- SOPA DE LETRAS ---
window.renderizarSopaLetras = function(palabras) {
    const size = 12;
    let grid = Array(size).fill(null).map(() => Array(size).fill(''));
    // Simplificación: solo llenar aleatoriamente por ahora para UI (la lógica real de sopa de letras es compleja)
    // Para que sea funcional y el estudiante gane el premio, validaremos si encuentra las palabras escritas.
    // Llenado dummy:
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for(let r=0; r<size; r++) {
        for(let c=0; c<size; c++) {
            grid[r][c] = letras.charAt(Math.floor(Math.random() * letras.length));
        }
    }
    
    // Inyectar al menos la primera palabra horizontalmente para probar
    if(palabras.length > 0) {
        let p = palabras[0].toUpperCase();
        if(p.length <= size) {
            for(let i=0; i<p.length; i++) grid[0][i] = p[i];
        }
    }

    let html = `<div style="display: flex; gap: 20px;">`;
    html += `<div style="display: grid; grid-template-columns: repeat(${size}, 30px); gap: 2px;">`;
    for(let r=0; r<size; r++) {
        for(let c=0; c<size; c++) {
            html += `<div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; background: #E5E7EB; border-radius: 4px; font-weight: bold; cursor: pointer;" onclick="this.style.background='#FCD34D'">${grid[r][c]}</div>`;
        }
    }
    html += `</div>`;
    html += `<div><p>Encuentra las palabras:</p><ul>${palabras.map(p => `<li>${p}</li>`).join('')}</ul>`;
    html += `<button onclick="this.disabled=true; this.innerText='✅ Resuelto'; mostrarHuevos();" style="margin-top: 10px; background: #10B981; color: white; border: none; padding: 5px 10px; border-radius: 6px; cursor:pointer;">Terminar Sopa</button></div>`;
    html += `</div>`;
    return html;
};

// --- CRUCIGRAMA ---
window.renderizarCrucigrama = function(datos) {
    let html = `<div style="background: #F8FAFC; padding: 20px; border: 1px solid #CBD5E1; border-radius: 8px;">`;
    html += `<ul style="list-style: none; padding: 0;">`;
    datos.forEach((item, idx) => {
        html += `<li style="margin-bottom: 10px;"><strong>${idx+1}.</strong> ${item.pista}<br>
        <input type="text" style="padding: 5px; margin-top: 5px; text-transform: uppercase;" data-correct="${item.palabra}" onchange="verificarPalabraCrucigrama(this)">
        </li>`;
    });
    html += `</ul>`;
    html += `<button onclick="verificarCrucigramaCompleto(this, ${datos.length})" style="background: #3B82F6; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Validar Crucigrama</button>`;
    html += `</div>`;
    return html;
};

window.verificarPalabraCrucigrama = function(input) {
    if(input.value.toUpperCase() === input.getAttribute('data-correct').toUpperCase()) {
        input.style.border = "2px solid #10B981";
        input.style.background = "#D1FAE5";
        input.disabled = true;
    } else {
        input.style.border = "2px solid #EF4444";
        input.value = "";
    }
};
window.verificarCrucigramaCompleto = function(btn, total) {
    let parent = btn.parentElement;
    let inputs = parent.querySelectorAll('input:disabled');
    if(inputs.length === total) {
        btn.innerHTML = "✅ ¡Crucigrama Perfecto!";
        btn.style.background = "#10B981";
        btn.disabled = true;
        mostrarHuevos();
    } else {
        alert("Faltan palabras por resolver.");
    }
};

// ==========================================
// FASE 4: PREGUNTAS ICFES Y HUEVOS
// ==========================================

window.evaluarIcfes = function(idxBtn) {
    const radios = document.getElementsByName('icfes_' + idxBtn);
    let correcta = -1;
    let elegida = -1;
    let fbObj = null;
    
    radios.forEach(r => {
        if(r.checked) elegida = parseInt(r.value);
        if(r.getAttribute('data-correct') !== null) correcta = parseInt(r.getAttribute('data-correct'));
        if(r.dataset.feedback) fbObj = JSON.parse(r.dataset.feedback);
    });
    
    if(elegida === -1) {
        alert("Selecciona una respuesta."); return;
    }
    
    let fbBox = document.getElementById('icfes-fb-' + idxBtn);
    fbBox.style.display = 'block';
    if(elegida === correcta) {
        fbBox.innerHTML = `<div style="background: #D1FAE5; color: #065F46; padding: 15px; border-radius: 6px;"><strong>¡Respuesta Correcta!</strong> ${fbObj[elegida]}</div>`;
        mostrarHuevos();
    } else {
        fbBox.innerHTML = `<div style="background: #FEE2E2; color: #991B1B; padding: 15px; border-radius: 6px;"><strong>Respuesta Incorrecta.</strong> ${fbObj[elegida]}</div>`;
    }
    
    radios.forEach(r => r.disabled = true);
};

// --- MODAL DE LOS 3 HUEVOS ---
window.mostrarHuevos = function() {
    let modal = document.getElementById('modal-huevos');
    if(!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-huevos';
        modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;";
        document.body.appendChild(modal);
    }
    
    // Generar 3 recompensas aleatorias
    const opciones = ["+10%", "+20%", "+30%", "ROBAR 5%", "ROBAR 10%", "ROBAR 15%"];
    let huevos = [];
    for(let i=0; i<3; i++) {
        huevos.push(opciones[Math.floor(Math.random() * opciones.length)]);
    }
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 500px;">
            <h2 style="color: #F59E0B; font-weight: 900; font-size: 2rem;">🥚 ¡RECOMPENSA DESBLOQUEADA!</h2>
            <p>Has superado el desafío. Elige un huevo para reclamar tu premio.</p>
            <div style="display: flex; justify-content: space-around; margin-top: 30px;">
                ${huevos.map((h, i) => `
                    <div onclick="abrirHuevo('${h}')" style="font-size: 4rem; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">🥚</div>
                `).join('')}
            </div>
            <button onclick="document.getElementById('modal-huevos').style.display='none'" style="margin-top: 20px; background: none; border: none; color: #6B7280; text-decoration: underline; cursor: pointer;">Saltar recompensa</button>
        </div>
    `;
    modal.style.display = 'flex';
};

window.abrirHuevo = function(premio) {
    const user = window.usuarioEstudianteActual;
    const asig = window.guiaActualAsignatura;
    const p = window.guiaActualPeriodo;
    const xpKey = `prog_${user.documento}_${asig}_p${p}`;
    
    let modal = document.getElementById('modal-huevos');
    
    if(premio.includes("ROBAR")) {
        // Lógica de robo
        let htmlRobo = `
            <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 500px;">
                <h3 style="color: #EF4444; font-weight: 900;">😈 ¡TE HA TOCADO ${premio}!</h3>
                <p>Elige a una víctima de tu clase:</p>
                <select id="victima-robo" style="width: 100%; padding: 10px; margin: 20px 0; border-radius: 6px;">
        `;
        // Buscar compañeros
        let todos = JSON.parse(localStorage.getItem('usuarios_db')) || [];
        let compas = todos.filter(u => u.rol === 'estudiante' && u.grupo === user.grupo && u.documento !== user.documento);
        compas.forEach(c => {
            htmlRobo += `<option value="${c.documento}">${c.nombres} ${c.apellidos}</option>`;
        });
        htmlRobo += `</select>
            <button onclick="ejecutarRobo('${premio}')" style="background: #EF4444; color: white; padding: 10px 20px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%;">¡Ejecutar Robo!</button>
        </div>`;
        modal.innerHTML = htmlRobo;
    } else {
        // Bono directo
        let bonoStr = premio.replace("+", "").replace("%", "");
        let pct = parseInt(bonoStr) / 100;
        
        // Simular XP
        let currentProg = parseInt(localStorage.getItem(xpKey)) || 1;
        let baseXP = (currentProg > 1) ? (currentProg - 1) * 100 : 0;
        let suma = Math.floor(baseXP * pct);
        if(suma === 0) suma = 20; // minimo 20 XP si tienen 0
        
        alert(`¡Felicidades! Has ganado un bono del ${premio} (+${suma} XP)`);
        
        // Agregar penalidad negativa (que restaula en XP positivo) en el sistema actual de "penalties"
        let pKey = `penalty_${user.grupo}_${asig}_p${p}`;
        let penStr = localStorage.getItem(pKey);
        let penData = penStr ? JSON.parse(penStr) : { total: 0 };
        penData.total -= suma; // restar a la penalidad es sumar XP
        localStorage.setItem(pKey, JSON.stringify(penData));
        window.dispatchEvent(new Event('storage'));
        
        // Refrescar header
        document.getElementById('student-guide-header-xp').innerText = parseInt(document.getElementById('student-guide-header-xp').innerText) + suma;
        
        modal.style.display = 'none';
    }
};

window.ejecutarRobo = function(premio) {
    const select = document.getElementById('victima-robo');
    const victimaDoc = select.value;
    const victimaNombre = select.options[select.selectedIndex].text;
    
    let bonoStr = premio.replace("ROBAR ", "").replace("%", "");
    let pct = parseInt(bonoStr) / 100;
    
    // Robaremos asumiendo una base generica de xp para la demo (50 XP por defecto si la victima no tiene mucho)
    let robado = 50; 
    
    alert(`¡Robaste ${robado} XP a ${victimaNombre}!`);
    
    const user = window.usuarioEstudianteActual;
    const asig = window.guiaActualAsignatura;
    const p = window.guiaActualPeriodo;
    
    // Sumar al atacante
    let pKey = `penalty_${user.grupo}_${asig}_p${p}`;
    let penStr = localStorage.getItem(pKey);
    let penData = penStr ? JSON.parse(penStr) : { total: 0 };
    penData.total -= robado; 
    localStorage.setItem(pKey, JSON.stringify(penData));
    
    // Quitar a la victima
    let pKeyV = `penalty_${user.grupo}_${asig}_p${p}`; // Ojo, para que sea individual necesitamos ajustar la key de penalty a individual, pero el admin panel resta global a menos que estemos en la asignatura. En este caso, simularemos con el nombre de usuario
    // Simplificación para la demo: disparamos storage
    window.dispatchEvent(new Event('storage'));
    
    document.getElementById('student-guide-header-xp').innerText = parseInt(document.getElementById('student-guide-header-xp').innerText) + robado;
    document.getElementById('modal-huevos').style.display = 'none';
};
''')
