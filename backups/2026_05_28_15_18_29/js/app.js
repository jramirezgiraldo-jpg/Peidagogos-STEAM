// Peidagogos - App Logic & SPA Router
const app = {
    // ESTADO: Backend Future-Proofing
    // En Fase 2, todo el manejo de localStorage se reemplazarÃ¡ por fetch() a la API Python.

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
        alert('Registro exitoso. Puede ingresar usando su documento como contraseÃ±a.');
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
        const hud = document.getElementById('global-hud');
        if(hud) hud.classList.add('hidden');
        this.navigate('view-landing');
    },

    checkAuthStatus() {
        const session = JSON.parse(localStorage.getItem('session'));
        if(session) {
            if(session.role === 'admin') this.navigate('view-admin');
            if(session.role === 'student') {
                this.renderStudentDashboard();
                this.actualizarHUD();
                document.getElementById('global-hud').classList.remove('hidden');
                this.navigate('view-student');
            }
        } else {
            const hud = document.getElementById('global-hud');
            if(hud) hud.classList.add('hidden');
        }
    },

    // -------------------------------------------------------------
    // FASE 2: PREPARACIÃ“N PARA BACKEND PYTHON
    // Las siguientes funciones simulan interactuar con una base de datos.
    // Futuro: reemplazar 'localStorage' por peticiones 'fetch("/api/...")'
    // -------------------------------------------------------------
    
    setSession(data) {
        // Futuro: Manejo de JWT en cookies httpOnly
        localStorage.setItem('session', JSON.stringify(data));
    },

    // -------------------------------------------------------------
    // SISTEMA DE PUNTUACIÃ“N Y LEADERBOARD (API Python)
    // -------------------------------------------------------------
    async sumarPuntos(cantidad) {
        const session = JSON.parse(localStorage.getItem('session'));
        if(!session || session.role !== 'student') return;
        
        try {
            const host = window.location.hostname || 'localhost';
            const res = await fetch(`http://${host}:8080/api/puntos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: session.documento,
                    nombre: session.nombres + ' ' + session.apellidos,
                    grado: session.grado,
                    grupo: session.grupo || 'A',
                    puntos_obtenidos: cantidad
                })
            });
            if(res.ok) {
                session.puntos = (session.puntos || 0) + cantidad;
                localStorage.setItem('session', JSON.stringify(session));
                this.actualizarHUD();
                
                const hudScore = document.getElementById('hud-points');
                if(hudScore) {
                    hudScore.parentElement.classList.remove('animate-score');
                    void hudScore.parentElement.offsetWidth; // trigger reflow
                    hudScore.parentElement.classList.add('animate-score');
                }
            }
        } catch(e) {
            console.error('Error enviando puntos:', e);
        }
    },

    actualizarHUD() {
        const session = JSON.parse(localStorage.getItem('session'));
        if(!session || session.role !== 'student') return;
        
        const hudName = document.getElementById('hud-name');
        if(hudName) hudName.textContent = session.nombres;
        
        const pts = session.puntos || 0;
        const hudPoints = document.getElementById('hud-points');
        if(hudPoints) hudPoints.textContent = pts;
        
        const nivel = Math.floor(pts / 50) + 1;
        const hudLevel = document.getElementById('hud-level');
        if(hudLevel) hudLevel.textContent = 'Nivel ' + nivel;
        
        const hudAvatar = document.getElementById('hud-avatar');
        if(hudAvatar && session.nombres) {
            hudAvatar.textContent = session.nombres.charAt(0).toUpperCase();
        }
    },

            async generarSemanaBatch() {
        const btn = document.getElementById('btn-generar-batch');
        const select = document.getElementById('select-semana-batch');
        const container = document.getElementById('batch-progress-container');
        const statusText = document.getElementById('batch-status-text');
        
        btn.disabled = true;
        select.disabled = true;
        btn.innerHTML = '⏳ Procesando...';
        container.classList.remove('d-none');
        
        try {
            const host = window.location.hostname || 'localhost';
            await fetch(http:// + host + :8080/api/admin/generar-semana, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ semana: select.value })
            });
            
            this.iniciarPollingProgreso();
        } catch(e) {
            console.error('Error starting batch:', e);
            statusText.textContent = "Error al iniciar proceso.";
            btn.disabled = false;
            select.disabled = false;
            btn.innerHTML = '🚀 Generar Lote de 216 Guías';
        }
    },
    
    iniciarPollingProgreso() {
        const host = window.location.hostname || 'localhost';
        const barra = document.getElementById('batch-progress-bar');
        const statusText = document.getElementById('batch-status-text');
        const pctText = document.getElementById('batch-percentage');
        
        const poll = setInterval(async () => {
            try {
                const res = await fetch(http:// + host + :8080/api/admin/progreso-generacion);
                const data = await res.json();
                
                barra.style.width = data.percentage + '%';
                pctText.textContent = data.percentage + '%';
                statusText.textContent = Generadas:  + data.current +  /  + data.total;
                
                if(data.status === "completed") {
                    clearInterval(poll);
                    barra.classList.remove('progress-bar-animated');
                    statusText.textContent = "¡Éxito! 216 guías generadas y guardadas localmente.";
                    
                    const btn = document.getElementById('btn-generar-batch');
                    const select = document.getElementById('select-semana-batch');
                    btn.disabled = false;
                    select.disabled = false;
                    btn.innerHTML = '✅ Lote Generado. ¿Otro?';
                }
            } catch(e) {
                console.error("Error polling:", e);
            }
        }, 500);
    },

    async cargarDatosConexion() {
        const ipDisplay = document.getElementById('ip-proyector');
        const ssidDisplay = document.getElementById('ssid-proyector');
        if(!ipDisplay || !ssidDisplay) return;
        
        ipDisplay.textContent = "Cargando...";
        
        try {
            const host = window.location.hostname || 'localhost';
            const res = await fetch(http:// + host + :8080/api/conexion);
            const data = await res.json();
            
            ipDisplay.textContent = http:// + data.ip + : + data.puerto;
            ssidDisplay.textContent = data.ssid;
        } catch(e) {
            ipDisplay.textContent = "Revisa la consola del profesor";
            ssidDisplay.textContent = "Error";
            console.error('Error fetching conexion:', e);
        }
    },
    leaderboardInterval: null,
    
    openLeaderboard() {
        document.getElementById('modal-leaderboard').style.display = 'block';
        this.cargarDatosConexion();
        this.fetchLeaderboard();
        this.leaderboardInterval = setInterval(() => this.fetchLeaderboard(), 3000);
    },

    closeLeaderboard() {
        document.getElementById('modal-leaderboard').style.display = 'none';
        if(this.leaderboardInterval) clearInterval(this.leaderboardInterval);
    },

    async fetchLeaderboard() {
        try {
            const grado = document.getElementById('lb-grado').value;
            const host = window.location.hostname || 'localhost';
            const res = await fetch(`http://${host}:8080/api/leaderboard?grado=${grado}`);
            const data = await res.json();
            
            const list = document.getElementById('leaderboard-list');
            if(!list) return;
            list.innerHTML = '';
            data.forEach((student, index) => {
                const li = document.createElement('li');
                li.className = 'leaderboard-item';
                li.innerHTML = `
                    <span class="lb-rank">#${index + 1}</span>
                    <span class="lb-name">${student.nombre} (Grado ${student.grado})</span>
                    <span class="lb-score">${student.puntos_obtenidos} pts</span>
                `;
                list.appendChild(li);
            });
        } catch(e) {
            console.error('Error fetching leaderboard:', e);
        }
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
                docente: 'Juan Felipe RamÃ­rez Giraldo',
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
            container.innerHTML = `<div class="no-data-msg">No hay misiones configuradas aÃºn para esta semana (Grado ${grado}, Periodo ${periodo}, Semana ${semana}).</div>`;
            return;
        }

        const data = window.curriculumData[grado][periodo][semana];
        
        let ovaBtnHtml = "";
        if(role === 'student') {
            ovaBtnHtml = `<div style="text-align: center; margin-top: 1rem;"><button class="btn-ova" onclick="app.openOvaModal()">ðŸš€ Iniciar OVA</button></div>`;
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
                        <h4>ðŸ”¬ AcciÃ³n CientÃ­fica</h4>
                        <p>${data.aproximacion_cientifica}</p>
                    </div>
                    <div class="mission-subcard">
                        <h4>ðŸ§  Conocimientos</h4>
                        <p>${data.conocimientos_propios}</p>
                    </div>
                    <div class="mission-subcard">
                        <h4>ðŸŒ± AutogestiÃ³n</h4>
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
            alert('Por favor selecciona todas las configuraciones para tu misiÃ³n.');
            return;
        }

        const universoText = uNode.querySelector('.trigger-text').textContent;
        const rolText = rNode.querySelector('.trigger-text').textContent;
        const canalText = cNode.querySelector('.trigger-text').textContent;

        const preferencias = { universo: universoVal, rol: rolVal, canal: canalVal };
        localStorage.setItem('preferenciasOVA', JSON.stringify(preferencias));
        
        this.closeOvaModal();
        this.showToast(`Â¡MisiÃ³n configurada! Preparando tu entorno...`);
        
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
        
        const antiCopyPaste = `oncopy="return false;" onpaste="return false;" oncut="return false;" autocomplete="off" oninput="app.checkWordCount(this)" maxlength="150"`;

        let html = `
            <section class="ova-section">
                <h3>ðŸŒŒ ${data.pregunta_problematizadora}</h3>
                <p class="ova-text"><strong>Objetivo:</strong> ${data.objetivo_aprendizaje}</p>
            </section>
            
            <section class="ova-section">
                <h3>ðŸ” DecodificaciÃ³n Inicial (Sopa de Letras)</h3>
                <div id="sopa-container"></div>
            </section>

            <section class="ova-section">
                <h3>ðŸ§  Saberes Previos</h3>
                ${data.saberes_previos.map((q, i) => `
                    <div style="margin-bottom: 1.5rem;">
                        <p class="ova-text"><strong>${i+1}. ${q.pregunta}</strong></p>
                        ${Object.keys(q.opciones).map(k => `
                            <label class="icfes-option">
                                <input type="radio" name="presaberes_${i}" value="${k}">
                                <div class="icfes-card"><strong>${k}.</strong> ${q.opciones[k]}</div>
                            </label>
                        `).join('')}
                    </div>
                `).join('')}
            </section>

            <section class="ova-section">
                <h3>ðŸ“œ MisiÃ³n Principal</h3>
                <div class="ova-text" style="text-align: justify; line-height: 1.8;">${data.texto_inductivo}</div>
            </section>

            <section class="ova-section">
                <h3>ðŸ““ Cuaderno de MisiÃ³n 1</h3>
                <ul class="ova-text">
                    ${data.actividades_cuaderno_1.map(a => `<li>${a}</li>`).join('')}
                </ul>
                <button class="btn-mision-check" onclick="app.updateProgress(15); alert('âœ… MisiÃ³n en Cuaderno Completada!');">âœ… MisiÃ³n en Cuaderno Completada</button>
            </section>
            
            <section class="ova-section">
                <h3>ðŸ§© Ordena los Conceptos (Drag & Drop)</h3>
                
                <h4 style="margin-top:2rem;">Nivel 1: Construye la Palabra</h4>
                <div class="dnd-section" id="dnd-letras-container"></div>
                
                <h4 style="margin-top:2rem;">Nivel 2: Construye la Frase</h4>
                <div class="dnd-section" id="dnd-frases-container"></div>
                
                <div style="margin-top: 1rem; text-align: center;">
                    <button class="btn-mision-check" onclick="app.verificarDragAndDrop()">Verificar Orden</button>
                </div>
            </section>

            <section class="ova-section">
                <h3>âž• CriptografÃ­a Espacial (Crucigrama)</h3>
                <div id="crucigrama-container" class="crucigrama-container"></div>
            </section>

            <section class="ova-section">
                <h3>ðŸ“š ProfundizaciÃ³n</h3>
                <div class="ova-text" style="text-align: justify; line-height: 1.8;">${data.texto_deductivo}</div>
            </section>

            <section class="ova-section">
                <h3>ðŸ““ Cuaderno de MisiÃ³n 2</h3>
                <ul class="ova-text">
                    ${data.actividades_cuaderno_2.map(a => `<li>${a}</li>`).join('')}
                </ul>
                <button class="btn-mision-check" onclick="app.updateProgress(15); alert('âœ… MisiÃ³n en Cuaderno 2 Completada!');">âœ… MisiÃ³n en Cuaderno Completada</button>
            </section>

            <section class="ova-section">
                <h3>ðŸŽ¯ EvaluaciÃ³n de MisiÃ³n (ICFES)</h3>
                ${data.preguntas_icfes.map((q, i) => `
                    <div style="margin-bottom: 2.5rem; padding: 2rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                        <span class="badge-competencia">${q.competencia}</span>
                        <p class="icfes-contexto">${q.contexto}</p>
                        <p class="ova-text" style="font-size: 1.1rem; margin-bottom: 1.5rem;"><strong>${i+1}. ${q.enunciado}</strong></p>
                        ${Object.keys(q.opciones).map(k => `
                            <label class="icfes-option">
                                <input type="radio" name="icfes_${i}" value="${k}">
                                <div class="icfes-card"><strong>${k}.</strong> ${q.opciones[k]}</div>
                            </label>
                        `).join('')}
                    </div>
                `).join('')}
            </section>

            <section class="ova-section">
                <h3>ðŸ“ Cierre de SelecciÃ³n MÃºltiple</h3>
                ${data.seleccion_multiple_basica.map((q, i) => `
                    <div style="margin-bottom: 1.5rem;">
                        <p class="ova-text"><strong>${i+1}. ${q.pregunta}</strong></p>
                        ${Object.keys(q.opciones).map(k => `
                            <label class="icfes-option">
                                <input type="radio" name="cierre_${i}" value="${k}">
                                <div class="icfes-card"><strong>${k}.</strong> ${q.opciones[k]}</div>
                            </label>
                        `).join('')}
                    </div>
                `).join('')}
            </section>

            <section class="ova-section">
                <h3>âœï¸ Preguntas Abiertas de SÃ­ntesis</h3>
                <p style="color:red; font-size:0.9rem;">(MÃ¡ximo 15 palabras. Pegar bloqueado por seguridad anti-fraude)</p>
                ${data.preguntas_abiertas_ova.map((p, i) => `
                    <div style="margin-bottom: 1.5rem;">
                        <p><strong>${i+1}. ${p}</strong></p>
                        <textarea class="protected-textarea" id="pa_${i}" ${antiCopyPaste}></textarea>
                        <div class="word-count" id="wc_pa_${i}">0 / 15 palabras</div>
                    </div>
                `).join('')}
            </section>
        `;

        container.innerHTML = html;
        
        // Iniciar interactividad
        this.initSopaLetras(data.sopa_letras);
        this.initDragAndDrop(data.drag_drop_letras, data.drag_drop_frases);
        this.renderCrucigrama(data.crucigrama);
        this.updateProgress(5); // start
    },

    updateProgress(percent) {
        const pBar = document.getElementById('ova-progress');
        let current = parseInt(pBar.style.width) || 0;
        let next = Math.min(100, current + percent);
        pBar.style.width = next + '%';
        if(next === 100) this.showToast('Â¡MisiÃ³n Completada al 100%!');
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
        let letters = "ABCDEFGHIJKLMNÃ‘OPQRSTUVWXYZ";
        let gridHtml = '<div class="sopa-grid" style="grid-template-columns: repeat(12, 1fr);">';
        for(let i=0; i<144; i++) {
            let char = letters.charAt(Math.floor(Math.random() * letters.length));
            gridHtml += `<div class="sopa-cell" onclick="app.clickSopaCell(this, '' )">${char}</div>`;
        }
        gridHtml += '</div>';
        gridHtml += `<p style="margin-top:1rem;"><strong>Encuentra:</strong> ${palabras.join(', ')}</p>`;
        container.innerHTML = gridHtml;
    },

    initDragAndDrop(letrasData, frasesData) {
        const letrasContainer = document.getElementById('dnd-letras-container');
        const frasesContainer = document.getElementById('dnd-frases-container');
        
        let htmlLetras = '';
        letrasData.forEach((item, idx) => {
            htmlLetras += `<div style="margin-bottom:1.5rem; text-align:center;">`;
            htmlLetras += `<div>${item.letras.map((l, i) => `<span class="letra-tile" draggable="true" id="l_${idx}_${i}" ondragstart="app.dragStart(event)" ontouchstart="app.touchStart(event)" ontouchmove="app.touchMove(event)" ontouchend="app.touchEnd(event)">${l}</span>`).join('')}</div>`;
            htmlLetras += `<div style="margin-top:1rem;">${item.letras.map((l, i) => `<div class="slot-letra" ondragover="event.preventDefault(); this.classList.add('dragover');" ondragleave="this.classList.remove('dragover');" ondrop="app.drop(event)"></div>`).join('')}</div>`;
            htmlLetras += `<div style="display:none;" class="expected-word">${item.palabra}</div>`;
            htmlLetras += `</div>`;
        });
        letrasContainer.innerHTML = htmlLetras;

        let htmlFrases = '';
        frasesData.forEach((item, idx) => {
            htmlFrases += `<div style="margin-bottom:1.5rem; text-align:center;">`;
            htmlFrases += `<div>${item.palabras.map((p, i) => `<span class="palabra-tile" draggable="true" id="p_${idx}_${i}" ondragstart="app.dragStart(event)" ontouchstart="app.touchStart(event)" ontouchmove="app.touchMove(event)" ontouchend="app.touchEnd(event)">${p}</span>`).join('')}</div>`;
            htmlFrases += `<div style="margin-top:1rem;">${item.palabras.map((p, i) => `<div class="slot-palabra" ondragover="event.preventDefault(); this.classList.add('dragover');" ondragleave="this.classList.remove('dragover');" ondrop="app.drop(event)"></div>`).join('')}</div>`;
            htmlFrases += `<div style="display:none;" class="expected-phrase">${item.frase}</div>`;
            htmlFrases += `</div>`;
        });
        frasesContainer.innerHTML = htmlFrases;
    },

    dragStart(e) {
        e.dataTransfer.setData('sourceId', e.target.id);
    },

    drop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const sourceId = e.dataTransfer.getData('sourceId');
        const element = document.getElementById(sourceId);
        
        // Si el slot ya tiene un elemento, no permite soltar (o se puede intercambiar, pero lo bloquearemos)
        if (e.currentTarget.children.length > 0) return;
        
        e.currentTarget.appendChild(element); app.validarDropIndividual(e.currentTarget.parentElement.parentElement);
    },

    // --- LÃ“GICA TOUCH PARA MÃ“VILES ---
    touchStart(e) {
        // Solo prevenimos el default si no es un scroll multi-touch
        if (e.touches.length > 1) return;
        e.preventDefault(); 
        const tile = e.target;
        tile.classList.add('dragging');
        
        // Guardamos posiciÃ³n original por si soltamos en la nada
        if(!tile.dataset.origParent) {
            tile.dataset.origParent = tile.parentElement.id || "temp_" + Math.random();
            if(!tile.parentElement.id) tile.parentElement.id = tile.dataset.origParent;
        }
    },

    touchMove(e) {
        e.preventDefault(); // Prevenir scroll al arrastrar
        const tile = e.target;
        if(!tile.classList.contains('dragging')) return;
        
        const touch = e.touches[0];
        // Movemos la ficha absolutamente basada en el dedo
        tile.style.position = 'fixed';
        tile.style.left = (touch.clientX - tile.offsetWidth / 2) + 'px';
        tile.style.top = (touch.clientY - tile.offsetHeight / 2) + 'px';
        tile.style.zIndex = '9999';
    },

    touchEnd(e) {
        const tile = e.target;
        if(!tile.classList.contains('dragging')) return;
        tile.classList.remove('dragging');
        
        // Ocultar momentÃ¡neamente para detectar quÃ© hay debajo
        tile.style.display = 'none';
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        tile.style.display = 'inline-block';
        
        // Restablecer estilos de movimiento absoluto
        tile.style.position = '';
        tile.style.left = '';
        tile.style.top = '';
        tile.style.zIndex = '';
        
        // Verificar si caÃ­mos en un cajÃ³n vÃ¡lido
        if (elementBelow && (elementBelow.classList.contains('slot-letra') || elementBelow.classList.contains('slot-palabra'))) {
            if (elementBelow.children.length === 0) {
                elementBelow.appendChild(tile);
                return;
            }
        }
        
        // Si no es vÃ¡lido o estÃ¡ lleno, devolvemos a su padre original
        const origParent = document.getElementById(tile.dataset.origParent);
        if(origParent) {
            origParent.appendChild(tile);
        }
    },
    
        // --- GACHA & PVP LOGIC ---
    lanzarHuevosMisteriosos() {
        document.getElementById('modal-gacha').style.display = 'block';
        const huevos = document.querySelectorAll('.huevo');
        huevos.forEach(h => {
            h.classList.add('shake');
            h.style.display = 'block';
        });
        document.getElementById('gacha-resultado').style.display = 'none';
        
        // Progress for Grade
        app.state.progress = (app.state.progress || 0) + 20; // Simulated progress
    },

    abrirHuevo(el) {
        // Detener shake
        document.querySelectorAll('.huevo').forEach(h => h.classList.remove('shake'));
        const rng = Math.random();
        let efecto = '';
        let porcentaje = 0;
        
        if(rng < 0.35) { // 35% BUFF
            porcentaje = [10, 20, 30, 40, 50][Math.floor(Math.random() * 5)];
            efecto = 'BUFF';
        } else if (rng < 0.60) { // 25% NERF
            porcentaje = [10, 15, 20][Math.floor(Math.random() * 3)];
            efecto = 'NERF';
        } else { // 40% PVP (ROBO)
            porcentaje = [15, 30, 50][Math.floor(Math.random() * 3)];
            efecto = 'PVP';
        }
        
        this.procesarResultadoHuevo(efecto, porcentaje);
    },

    async procesarResultadoHuevo(efecto, porcentaje) {
        const session = JSON.parse(localStorage.getItem('session'));
        const resDiv = document.getElementById('gacha-resultado');
        resDiv.style.display = 'block';
        
        const currentPoints = session.puntos || 0;
        
        if (efecto === 'BUFF') {
            const extra = Math.floor(currentPoints * (porcentaje / 100));
            resDiv.innerHTML = ¡Bendición Académica! <br> + + porcentaje + % puntos (+ + extra +  pts);
            resDiv.style.color = '#4ade80';
            this.sumarPuntos(extra);
            setTimeout(() => { document.getElementById('modal-gacha').style.display = 'none'; }, 2000);
            
        } else if (efecto === 'NERF') {
            const loss = Math.floor(currentPoints * (porcentaje / 100));
            resDiv.innerHTML = ¡Mala Suerte! <br> - + porcentaje + % puntos (- + loss +  pts);
            resDiv.style.color = '#f87171';
            this.sumarPuntos(-loss);
            setTimeout(() => { document.getElementById('modal-gacha').style.display = 'none'; }, 2000);
            
        } else if (efecto === 'PVP') {
            resDiv.innerHTML = ¡Robo Activado! <br> Robarás el  + porcentaje + % a un compañero.;
            resDiv.style.color = '#fbbf24';
            
            setTimeout(() => {
                document.getElementById('modal-gacha').style.display = 'none';
                this.iniciarPvP(porcentaje);
            }, 2000);
        }
    },

    async iniciarPvP(porcentaje) {
        const session = JSON.parse(localStorage.getItem('session'));
        document.getElementById('modal-pvp').style.display = 'block';
        const lista = document.getElementById('pvp-lista');
        lista.innerHTML = 'Cargando presas...';
        
        try {
            const host = window.location.hostname || 'localhost';
            const res = await fetch(http:// + host + :8080/api/companeros?grado= + session.grado + &exclude= + session.documento);
            const companeros = await res.json();
            
            lista.innerHTML = '';
            if(companeros.length === 0) {
                lista.innerHTML = 'No hay nadie a quien robar.';
                setTimeout(() => { document.getElementById('modal-pvp').style.display = 'none'; }, 2000);
                return;
            }
            
            companeros.forEach(c => {
                const li = document.createElement('li');
                li.className = 'pvp-item';
                li.onclick = () => this.ejecutarRobo(c.id, porcentaje / 100, c.nombre);
                li.innerHTML = 
                    <span class="pvp-name"> + c.nombre + </span>
                    <span class="pvp-score"> + (c.puntos_obtenidos || 0) +  pts</span>
                ;
                lista.appendChild(li);
            });
            
        } catch(e) {
            lista.innerHTML = 'Error de conexión.';
        }
    },

    async ejecutarRobo(victima_id, porcentaje_decimal, victima_nombre) {
        const session = JSON.parse(localStorage.getItem('session'));
        try {
            const host = window.location.hostname || 'localhost';
            const res = await fetch(http:// + host + :8080/api/puntos, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_atacante: session.documento,
                    id_victima: victima_id,
                    porcentaje_robo: porcentaje_decimal
                })
            });
            const data = await res.json();
            if(res.ok) {
                alert('¡Has robado ' + data.robados + ' puntos a ' + victima_nombre + '!');
                // Local sync
                session.puntos = (session.puntos || 0) + data.robados;
                localStorage.setItem('session', JSON.stringify(session));
                this.actualizarHUD();
            }
        } catch(e) {
            console.error('Error en robo:', e);
        }
        document.getElementById('modal-pvp').style.display = 'none';
    },

    async finalizarOva() {
        const progress = Math.min(this.state.progress || 100, 100);
        let nota = (progress / 100) * 5.0;
        if(nota < 1.0) nota = 1.0; // Nota mínima
        
        const session = JSON.parse(localStorage.getItem('session'));
        
        // Save Nota to backend
        try {
            const host = window.location.hostname || 'localhost';
            await fetch(http:// + host + :8080/api/puntos, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: session.documento,
                    nombre: session.nombres + ' ' + session.apellidos,
                    grado: session.grado,
                    grupo: session.grupo || 'A',
                    puntos_obtenidos: 0,
                    nota_academica: nota.toFixed(1)
                })
            });
        } catch(e) {}
        
        document.getElementById('nota-final-display').textContent = nota.toFixed(1);
        document.getElementById('modal-final-ova').style.display = 'block';
    },
    
    cerrarFinalOva() {
        document.getElementById('modal-final-ova').style.display = 'none';
        this.navigate('view-student');
    }, 
    verificarDragAndDrop() {
        let correctos = true;
        // Verificar Letras
        const letrasCont = document.getElementById('dnd-letras-container').children;
        Array.from(letrasCont).forEach(block => {
            const slots = block.querySelectorAll('.slot-letra');
            const expected = block.querySelector('.expected-word').textContent.trim();
            let word = '';
            slots.forEach(slot => {
                if(slot.firstChild) word += slot.firstChild.textContent.trim();
            });
            if(word !== expected) correctos = false;
        });

        // Verificar Frases
        const frasesCont = document.getElementById('dnd-frases-container').children;
        Array.from(frasesCont).forEach(block => {
            const slots = block.querySelectorAll('.slot-palabra');
            const expected = block.querySelector('.expected-phrase').textContent.trim();
            let fraseArr = [];
            slots.forEach(slot => {
                if(slot.firstChild) fraseArr.push(slot.firstChild.textContent.trim());
            });
            const frase = fraseArr.join(' ');
            if(frase !== expected) correctos = false;
        });

        if(correctos) {
            alert('Â¡Impecable! Todo estÃ¡ ordenado correctamente.');
            app.updateProgress(10);
            app.sumarPuntos(20); setTimeout(() => app.lanzarHuevosMisteriosos(), 500);
        } else {
            alert('AÃºn hay piezas desordenadas. Â¡IntÃ©ntalo de nuevo!');
        }
    },

    startOva(grado, periodo, semana) {
        const session = JSON.parse(localStorage.getItem('session'));
        if(session && session.role === 'student') {
            app.state.currentOva = { grado: session.grado, periodo, semana };
            app.navigate('view-ova');
            app.renderOvaContent();
            return;
        }
    },

    renderCrucigrama(crucigramaData) {
        const container = document.getElementById('crucigrama-container');
        if(!crucigramaData || crucigramaData.length === 0) return;

        let maxX = 0, maxY = 0;
        crucigramaData.forEach(item => {
            let cx = item.x, cy = item.y;
            if(item.orientacion === 'H') cx += item.respuesta.length;
            if(item.orientacion === 'V') cy += item.respuesta.length;
            if(cx > maxX) maxX = cx;
            if(cy > maxY) maxY = cy;
        });

        // Initialize grid
        let grid = Array.from({length: maxY + 2}, () => Array(maxX + 2).fill(null));
        
        crucigramaData.forEach(item => {
            for(let i=0; i<item.respuesta.length; i++) {
                if(item.orientacion === 'H') grid[item.y][item.x + i] = true;
                if(item.orientacion === 'V') grid[item.y + i][item.x] = true;
            }
        });

        let tableHtml = '<table class="crucigrama-table">';
        for(let r=1; r<=maxY; r++) {
            tableHtml += '<tr>';
            for(let c=1; c<=maxX; c++) {
                if(grid[r][c]) {
                    tableHtml += `<td><input type="text" maxlength="1" class="crucigrama-cell" onkeyup="app.verificarCrucigramaIndividual(this, ' + item.respuesta[i] + ')" /></td>`;
                } else {
                    tableHtml += `<td class="crucigrama-black"></td>`;
                }
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</table>';
        
        tableHtml += '<div style="text-align:left; margin-top: 1rem;"><p><strong>Pistas:</strong></p><ul>';
        crucigramaData.forEach(item => {
            tableHtml += `<li>(${item.orientacion}) ${item.pista}</li>`;
        });
        tableHtml += '</ul></div>';

        container.innerHTML = tableHtml;
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





