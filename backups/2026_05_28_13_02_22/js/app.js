// Peidagogos - App Logic & SPA Router
const app = {
    // ESTADO: Backend Future-Proofing
    // En Fase 2, todo el manejo de localStorage se reemplazará por fetch() a la API Python.

    init() {
        this.checkAuthStatus();
        this.renderGruposAdmin();
    },

    navigate(viewId) {
        document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
        document.getElementById(viewId).style.display = 'block';
    },

    switchAuthTab(tab) {
        if(tab === 'login') {
            document.getElementById('auth-login').style.display = 'block';
            document.getElementById('auth-register').style.display = 'none';
            document.querySelectorAll('.tab-btn')[0].classList.add('active');
            document.querySelectorAll('.tab-btn')[1].classList.remove('active');
        } else {
            document.getElementById('auth-login').style.display = 'none';
            document.getElementById('auth-register').style.display = 'block';
            document.querySelectorAll('.tab-btn')[0].classList.remove('active');
            document.querySelectorAll('.tab-btn')[1].classList.add('active');
        }
    },

    handleLogin(e) {
        e.preventDefault();
        const user = document.getElementById('login-user').value.trim();
        const pass = document.getElementById('login-pass').value.trim();

        // Admin Auth mock (Hardcoded)
        if(user === "jramirezgiraldo" && pass === "Biol2008%") {
            this.setSession({ role: 'admin', name: 'Administrador' });
            this.navigate('view-admin');
            return;
        }

        // Student Auth mock
        const estudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]');
        const student = estudiantes.find(s => s.documento === user);
        
        if(student && pass === student.documento) {
            this.setSession({ role: 'student', ...student });
            this.renderStudentDashboard();
            this.navigate('view-student');
        } else {
            alert('Credenciales incorrectas. Intente de nuevo.');
        }
    },

    handleRegister(e) {
        e.preventDefault();
        const studentData = {
            nombres: document.getElementById('reg-nombres').value,
            apellidos: document.getElementById('reg-apellidos').value,
            documento: document.getElementById('reg-doc').value,
            edad: document.getElementById('reg-edad').value,
            genero: document.getElementById('reg-genero').value,
            grado: document.getElementById('reg-grado').value
        };

        this.guardarUsuario(studentData);
        alert('Registro exitoso. Puede ingresar usando su documento como contraseña.');
        this.switchAuthTab('login');
        document.getElementById('form-register').reset();
    },

    handleCrearGrupo(e) {
        e.preventDefault();
        const grado = document.getElementById('grupo-grado').value;
        const letra = document.getElementById('grupo-letra').value;
        const grupo = `${grado}-${letra}`;

        this.crearGrupo(grupo);
        this.renderGruposAdmin();
        document.getElementById('form-grupo').reset();
    },

    logout() {
        localStorage.removeItem('session');
        this.navigate('view-landing');
    },

    checkAuthStatus() {
        const session = JSON.parse(localStorage.getItem('session'));
        if(session) {
            if(session.role === 'admin') this.navigate('view-admin');
            if(session.role === 'student') {
                this.renderStudentDashboard();
                this.navigate('view-student');
            }
        }
    },

    // -------------------------------------------------------------
    // FASE 2: PREPARACIÓN PARA BACKEND PYTHON
    // Las siguientes funciones simulan interactuar con una base de datos.
    // Futuro: reemplazar 'localStorage' por peticiones 'fetch("/api/...")'
    // -------------------------------------------------------------
    
    setSession(data) {
        // Futuro: Manejo de JWT en cookies httpOnly
        localStorage.setItem('session', JSON.stringify(data));
    },

    guardarUsuario(userData) {
        // Futuro: POST /api/v1/auth/register
        let estudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]');
        estudiantes.push(userData);
        localStorage.setItem('estudiantes', JSON.stringify(estudiantes));
    },

    crearGrupo(nombreGrupo) {
        // Futuro: POST /api/v1/grupos
        let grupos = JSON.parse(localStorage.getItem('grupos') || '[]');
        if(!grupos.includes(nombreGrupo)) {
            grupos.push(nombreGrupo);
            localStorage.setItem('grupos', JSON.stringify(grupos));
            alert('Grupo matriculado: ' + nombreGrupo);
        } else {
            alert('El grupo ya existe.');
        }
    },

    obtenerGrupos() {
        // Futuro: GET /api/v1/grupos
        return JSON.parse(localStorage.getItem('grupos') || '[]');
    },

    obtenerMaterias() {
        // Futuro: GET /api/v1/estudiantes/{id}/materias
        return [
            {
                id: 'mat-01',
                nombre: 'Ciencias Naturales',
                docente: 'Juan Felipe Ramírez Giraldo',
                iconSvg: `<svg viewBox="0 0 24 24" width="64" height="64" stroke="var(--accent-green)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 20l-5.5 2 2-5.5a10 10 0 1 1 14-8 10 10 0 0 1-10.5 11.5z"></path>
                            <circle cx="15" cy="9" r="1"></circle>
                          </svg>`
            }
        ];
    },

    // -------------------------------------------------------------
    // RENDERIZADO UI
    // -------------------------------------------------------------
    
    renderGruposAdmin() {
        const list = document.getElementById('lista-grupos');
        if(!list) return;
        const grupos = this.obtenerGrupos();
        list.innerHTML = grupos.map(g => `<li>Grupo ${g}</li>`).join('');
    },

    renderStudentDashboard() {
        const session = JSON.parse(localStorage.getItem('session'));
        if(!session) return;

        document.getElementById('student-name-display').textContent = session.nombres;
        
        const materias = this.obtenerMaterias();
        const grid = document.getElementById('student-materias-grid');
        grid.innerHTML = materias.map(mat => `
            <div class="card course-card">
                <div class="card-icon">${mat.iconSvg}</div>
                <h3 class="card-title">${mat.nombre}</h3>
                <p class="card-description">Docente: ${mat.docente}</p>
                <button class="cta-button outline full-width">Entrar al Laboratorio</button>
            </div>
        `).join('');
    },

    // -------------------------------------------------------------
    // FASE 3: MALLA CURRICULAR Y MISSION CARDS
    // -------------------------------------------------------------

    handleMallaFilter(role) {
        let grado;
        if (role === 'admin') {
            grado = document.getElementById('malla-grado-admin').value;
        } else {
            const session = JSON.parse(localStorage.getItem('session'));
            grado = session ? session.grado : null;
        }

        const periodoSelect = document.getElementById(`malla-periodo-${role}`);
        const semanaSelect = document.getElementById(`malla-semana-${role}`);
        const periodo = periodoSelect.value;
        const semana = semanaSelect.value;

        // Cascading Logic
        if (grado) {
            periodoSelect.disabled = false;
        } else {
            periodoSelect.disabled = true;
            periodoSelect.value = "";
            semanaSelect.disabled = true;
            semanaSelect.value = "";
        }

        if (periodo) {
            semanaSelect.disabled = false;
        } else {
            semanaSelect.disabled = true;
            semanaSelect.value = "";
        }

        this.renderMissionCard(role, grado, periodo, semana);
    },

    renderMissionCard(role, grado, periodo, semana) {
        const container = document.getElementById(`malla-result-${role}`);
        
        if (!grado || !periodo || !semana) {
            container.innerHTML = `<div class="no-data-msg">Seleccione Grado, Periodo y Semana para ver la Ruta de Aprendizaje.</div>`;
            return;
        }

        if (!window.curriculumData || !window.curriculumData[grado] || !window.curriculumData[grado][periodo] || !window.curriculumData[grado][periodo][semana]) {
            container.innerHTML = `<div class="no-data-msg">No hay misiones configuradas aún para esta semana (Grado ${grado}, Periodo ${periodo}, Semana ${semana}).</div>`;
            return;
        }

        const data = window.curriculumData[grado][periodo][semana];
        
        let ovaBtnHtml = "";
        if(role === 'student') {
            ovaBtnHtml = `<div style="text-align: center; margin-top: 1rem;"><button class="btn-ova" onclick="app.openOvaModal()">🚀 Iniciar OVA</button></div>`;
        }

        const transversalChips = data.transversalizacion ? data.transversalizacion.map(t => `<span class="chip chip-transversal">${t}</span>`).join('') : '';

        container.innerHTML = `
            <div class="mission-card">
                <div class="mission-card-header">
                    <span class="chip chip-main">${data.asignatura}</span>
                    ${transversalChips}
                </div>
                
                <div class="mission-hero">
                    <h3>${data.pregunta_problematizadora}</h3>
                </div>

                <div class="mission-grid">
                    <div class="mission-subcard">
                        <h4>🔬 Acción Científica</h4>
                        <p>${data.aproximacion_cientifica}</p>
                    </div>
                    <div class="mission-subcard">
                        <h4>🧠 Conocimientos</h4>
                        <p>${data.conocimientos_propios}</p>
                    </div>
                    <div class="mission-subcard">
                        <h4>🌱 Autogestión</h4>
                        <p>${data.compromisos_autogestion}</p>
                    </div>
                </div>

                ${ovaBtnHtml}
            </div>
        `;
    },

    // -------------------------------------------------------------
    // MODAL Y GAMIFICACION OVA
    // -------------------------------------------------------------
    openOvaModal() {
        document.getElementById('ova-modal').classList.add('active');
    },

    closeOvaModal() {
        document.getElementById('ova-modal').classList.remove('active');
    },

    toggleSelect(selectId) {
        document.getElementById(selectId).classList.toggle('open');
    },

    selectOption(selectId, text, value) {
        const select = document.getElementById(selectId);
        select.querySelector('.trigger-text').textContent = text;
        select.setAttribute('data-value', value);
        select.classList.remove('open');
    },

    showToast(message) {
        const toast = document.getElementById('toast');
        document.getElementById('toast-msg').textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    },

    generarMisionOva() {
        const uNode = document.getElementById('select-universo');
        const rNode = document.getElementById('select-rol');
        const cNode = document.getElementById('select-canal');
        
        const universoVal = uNode.getAttribute('data-value');
        const rolVal = rNode.getAttribute('data-value');
        const canalVal = cNode.getAttribute('data-value');

        if(!universoVal || !rolVal || !canalVal) {
            alert('Por favor selecciona todas las configuraciones para tu misión.');
            return;
        }

        const universoText = uNode.querySelector('.trigger-text').textContent;
        const rolText = rNode.querySelector('.trigger-text').textContent;
        const canalText = cNode.querySelector('.trigger-text').textContent;

        const preferencias = { universo: universoVal, rol: rolVal, canal: canalVal };
        localStorage.setItem('preferenciasOVA', JSON.stringify(preferencias));
        
        this.closeOvaModal();
        this.showToast(`¡Misión configurada! Preparando tu entorno...`);
        
        setTimeout(() => {
            this.navigate('view-ova');
            this.renderOvaContent();
        }, 1500);
    },

    // -------------------------------------------------------------
    // RENDERIZADO OVA E INTERACCIONES
    // -------------------------------------------------------------
    renderOvaContent() {
        const container = document.getElementById('ova-content-container');
        if(!window.mockOvaData) {
            container.innerHTML = '<p>Cargando datos OVA...</p>';
            return;
        }
        
        const data = window.mockOvaData;
        
        // Anti copy-paste handler snippet
        const antiCopyPaste = `oncopy="return false;" onpaste="return false;" oncut="return false;" autocomplete="off" oninput="app.checkWordCount(this)"`;

        let html = `
            <section class="ova-section">
                <h3>🌌 ${data.pregunta_problematizadora}</h3>
                <p class="ova-text"><strong>Objetivo:</strong> ${data.objetivo_aprendizaje}</p>
            </section>
            
            <section class="ova-section">
                <h3>🔍 Decodificación Inicial (Sopa de Letras)</h3>
                <div id="sopa-container"></div>
            </section>

            <section class="ova-section">
                <h3>🧠 Saberes Previos</h3>
                <ul class="ova-text">
                    ${data.saberes_previos.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </section>

            <section class="ova-section">
                <h3>📜 Misión Principal</h3>
                <p class="ova-text">${data.texto_inductivo}</p>
            </section>
            
            <section class="ova-section">
                <h3>🧩 Ordena los Conceptos (Drag & Drop)</h3>
                <div id="dnd-area"></div>
            </section>

            <section class="ova-section">
                <h3>📓 Cuaderno de Misión 1</h3>
                <ul class="ova-text">
                    ${data.actividades_cuaderno_1.map(a => `<li>${a}</li>`).join('')}
                </ul>
                <button class="btn-mision-check" onclick="app.updateProgress(25)">✅ Misión en Cuaderno Completada</button>
            </section>

            <section class="ova-section">
                <h3>📝 Preguntas Abiertas de Síntesis</h3>
                <p style="color:red; font-size:0.9rem;">(Máximo 15 palabras. Pegar bloqueado por seguridad anti-fraude)</p>
                ${data.preguntas_abiertas_ova.map((p, i) => `
                    <div style="margin-bottom: 1.5rem;">
                        <p><strong>${p}</strong></p>
                        <textarea class="protected-textarea" id="pa_${i}" ${antiCopyPaste}></textarea>
                        <div class="word-count" id="wc_pa_${i}">0 / 15 palabras</div>
                    </div>
                `).join('')}
            </section>
        `;

        container.innerHTML = html;
        
        // Iniciar interactividad
        this.initSopaLetras(data.sopa_letras);
        this.initDragAndDrop(data.drag_and_drop);
        this.updateProgress(5); // start
    },

    updateProgress(percent) {
        const pBar = document.getElementById('ova-progress');
        let current = parseInt(pBar.style.width) || 0;
        let next = Math.min(100, current + percent);
        pBar.style.width = next + '%';
        if(next === 100) this.showToast('¡Misión Completada al 100%!');
    },

    checkWordCount(textarea) {
        const maxWords = 15;
        const text = textarea.value.trim();
        const words = text ? text.split(/\s+/) : [];
        const countId = 'wc_' + textarea.id;
        const countEl = document.getElementById(countId);
        
        if (words.length > maxWords) {
            // Trim to max words
            textarea.value = words.slice(0, maxWords).join(" ");
            countEl.textContent = `${maxWords} / ${maxWords} palabras`;
            countEl.classList.add('limit-reached');
        } else {
            countEl.textContent = `${words.length} / ${maxWords} palabras`;
            countEl.classList.remove('limit-reached');
        }
    },

    initSopaLetras(palabras) {
        // Grid simple simulado para demo
        const container = document.getElementById('sopa-container');
        let letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
        let gridHtml = '<div class="sopa-grid" style="grid-template-columns: repeat(12, 1fr);">';
        for(let i=0; i<144; i++) {
            let char = letters.charAt(Math.floor(Math.random() * letters.length));
            gridHtml += `<div class="sopa-cell" onclick="this.classList.toggle('selected')">${char}</div>`;
        }
        gridHtml += '</div>';
        gridHtml += `<p style="margin-top:1rem;"><strong>Encuentra:</strong> ${palabras.join(', ')}</p>`;
        container.innerHTML = gridHtml;
    },

    initDragAndDrop(dndData) {
        const container = document.getElementById('dnd-area');
        let html = '';
        dndData.forEach((item, idx) => {
            html += `
                <div class="dnd-container">
                    <div class="dnd-word" draggable="true" id="drag_${idx}" ondragstart="app.dragStart(event)">${item.palabra_desordenada.toUpperCase()}</div>
                    <div class="dnd-dropzone" id="drop_${idx}" data-correct="${item.palabra_correcta.toUpperCase()}" ondragover="app.dragOver(event)" ondragleave="app.dragLeave(event)" ondrop="app.drop(event)">Suelta aquí</div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.innerText);
        e.dataTransfer.setData('sourceId', e.target.id);
    },
    dragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    },
    dragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    },
    drop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const text = e.dataTransfer.getData('text/plain');
        const sourceId = e.dataTransfer.getData('sourceId');
        
        e.currentTarget.innerText = text;
        e.currentTarget.classList.add('correct');
        document.getElementById(sourceId).style.display = 'none';
        app.updateProgress(5);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
    // Pre-render malla placeholders
    app.handleMallaFilter('admin');
    const session = JSON.parse(localStorage.getItem('session'));
    if (session && session.role === 'student') {
        app.handleMallaFilter('student');
    }
});
