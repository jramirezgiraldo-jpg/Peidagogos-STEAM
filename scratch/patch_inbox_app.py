import re

with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    app = f.read()

target = """window.cambiarTabEstudiante = function(tab) {
    const btnMaterias = document.getElementById('btn-tab-estudiante-materias');
    const btnMalla = document.getElementById('btn-tab-estudiante-malla');
    const vistaMaterias = document.getElementById('vista-estudiante-materias');
    const vistaMalla = document.getElementById('vista-estudiante-malla');"""

replacement = """window.renderizarInboxEstudiante = function() {
    const grid = document.getElementById('inbox-estudiante-grid');
    const badge = document.getElementById('student-inbox-badge');
    if (!grid) return;
    
    let authSes = {};
    try { authSes = JSON.parse(sessionStorage.getItem('peidagogos_auth') || localStorage.getItem('usuario_sesion') || localStorage.getItem('usuario_actual') || '{}'); } catch(e) {}
    
    let curGrado = window.grado_estudiante || (authSes.usuarioObj && authSes.usuarioObj.grado) || authSes.grado || '7C';
    let inbox = [];
    try { inbox = JSON.parse(localStorage.getItem('inbox_estudiantes') || '[]'); } catch(e) {}
    
    // Filtrar inbox para este grado/grupo
    let myInbox = inbox.filter(a => a.grupo === 'Todos' || String(a.grupo).trim().toLowerCase() === String(curGrado).trim().toLowerCase());
    
    // Sort desc
    myInbox.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    if (badge) {
        if (myInbox.length > 0) {
            badge.style.display = 'flex';
            badge.innerText = myInbox.length;
        } else {
            badge.style.display = 'none';
        }
    }
    
    if (myInbox.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; background: white; border: 1.5px dashed #CBD5E1; padding: 40px; text-align: center; border-radius: 16px;">
            <div style="font-size: 3rem; margin-bottom: 10px;">🍃</div>
            <h3 style="color: #475569; margin:0;">Buzón Vacío</h3>
            <p style="color: #94A3B8; font-size: 0.95rem;">No tienes actividades asignadas por el momento.</p>
        </div>`;
        return;
    }
    
    grid.innerHTML = myInbox.map(a => `
        <div style="background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px; align-items: flex-start;">
                    <div style="font-size: 2.2rem; background: #F1F5F9; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px;">${a.toolIcono || '🎮'}</div>
                    <div style="font-size: 0.75rem; background: #FEF3C7; color: #92400E; padding: 4px 10px; border-radius: 12px; font-weight: 800;">${new Date(a.fecha).toLocaleDateString()}</div>
                </div>
                <h3 style="margin: 0 0 5px 0; color: #1E293B; font-weight: 900; font-size: 1.15rem;">${a.toolTitulo || 'Actividad'}</h3>
                <p style="margin: 0 0 10px 0; color: #64748B; font-size: 0.9rem; font-weight: 600;">${a.materia} • ${a.tema}</p>
                <div style="font-size: 0.8rem; color: #94A3B8; display: flex; align-items: center; gap: 5px; margin-bottom: 15px;">
                    <span>👨‍🏫</span> Asignado por: ${a.docente}
                </div>
            </div>
            <button onclick="window.abrirActividadDesdeInbox('${a.id}')" style="width: 100%; background: #3B82F6; color: white; border: none; padding: 10px; border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.2s;">▶ Jugar Ahora</button>
        </div>
    `).join('');
};

window.abrirActividadDesdeInbox = function(id) {
    let inbox = [];
    try { inbox = JSON.parse(localStorage.getItem('inbox_estudiantes') || '[]'); } catch(e) {}
    let actividad = inbox.find(a => a.id === id);
    if (!actividad) return;
    
    // Cargar data en IA
    window._aiGameData = actividad.dataIA;
    
    if (typeof window.abrirVisorHerramienta === 'function') {
        window.abrirVisorHerramienta(actividad.toolId, true);
    }
};

window.cambiarTabEstudiante = function(tab) {
    const btnMaterias = document.getElementById('btn-tab-estudiante-materias');
    const btnMalla = document.getElementById('btn-tab-estudiante-malla');
    const btnInbox = document.getElementById('btn-tab-estudiante-inbox');
    const vistaMaterias = document.getElementById('vista-estudiante-materias');
    const vistaMalla = document.getElementById('vista-estudiante-malla');
    const vistaInbox = document.getElementById('vista-estudiante-inbox');

    const resetBtns = () => {
        if(btnMaterias) { btnMaterias.style.background='white'; btnMaterias.style.color='#475569'; btnMaterias.style.border='1.5px solid #CBD5E1'; btnMaterias.style.boxShadow='none'; }
        if(btnMalla) { btnMalla.style.background='white'; btnMalla.style.color='#475569'; btnMalla.style.border='1.5px solid #CBD5E1'; btnMalla.style.boxShadow='none'; }
        if(btnInbox) { btnInbox.style.background='white'; btnInbox.style.color='#475569'; btnInbox.style.border='1.5px solid #CBD5E1'; btnInbox.style.boxShadow='none'; }
        if(vistaMaterias) vistaMaterias.style.display='none';
        if(vistaMalla) vistaMalla.style.display='none';
        if(vistaInbox) vistaInbox.style.display='none';
    };
    resetBtns();"""

target2 = """    if (tab === 'materias') {
        if (btnMaterias) {
            btnMaterias.style.background = '#2563EB';
            btnMaterias.style.color = 'white';
            btnMaterias.style.border = 'none';
            btnMaterias.style.boxShadow = '0 4px 10px rgba(37,99,235,0.25)';
        }
        if (btnMalla) {
            btnMalla.style.background = 'white';
            btnMalla.style.color = '#475569';
            btnMalla.style.border = '1.5px solid #CBD5E1';
            btnMalla.style.boxShadow = 'none';
        }
        if (vistaMaterias) vistaMaterias.style.display = 'block';
        if (vistaMalla) vistaMalla.style.display = 'none';
    } else {
        if (btnMaterias) {
            btnMaterias.style.background = 'white';
            btnMaterias.style.color = '#475569';
            btnMaterias.style.border = '1.5px solid #CBD5E1';
            btnMaterias.style.boxShadow = 'none';
        }
        if (btnMalla) {
            btnMalla.style.background = '#2563EB';
            btnMalla.style.color = 'white';
            btnMalla.style.border = 'none';
            btnMalla.style.boxShadow = '0 4px 10px rgba(37,99,235,0.25)';
        }
        if (vistaMaterias) vistaMaterias.style.display = 'none';
        if (vistaMalla) vistaMalla.style.display = 'block';

        window.renderizarMallaEstudianteDBA();
    }"""

replacement2 = """    if (tab === 'materias') {
        if (btnMaterias) {
            btnMaterias.style.background = '#2563EB';
            btnMaterias.style.color = 'white';
            btnMaterias.style.border = 'none';
            btnMaterias.style.boxShadow = '0 4px 10px rgba(37,99,235,0.25)';
        }
        if (vistaMaterias) vistaMaterias.style.display = 'block';
    } else if (tab === 'malla') {
        if (btnMalla) {
            btnMalla.style.background = '#2563EB';
            btnMalla.style.color = 'white';
            btnMalla.style.border = 'none';
            btnMalla.style.boxShadow = '0 4px 10px rgba(37,99,235,0.25)';
        }
        if (vistaMalla) vistaMalla.style.display = 'block';
        window.renderizarMallaEstudianteDBA();
    } else if (tab === 'inbox') {
        if (btnInbox) {
            btnInbox.style.background = '#2563EB';
            btnInbox.style.color = 'white';
            btnInbox.style.border = 'none';
            btnInbox.style.boxShadow = '0 4px 10px rgba(37,99,235,0.25)';
        }
        if (vistaInbox) vistaInbox.style.display = 'block';
        window.renderizarInboxEstudiante();
    }"""

app = app.replace(target, replacement)
app = app.replace(target2, replacement2)

with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
    f.write(app)

print('app.js patched for inbox student tab logic')
