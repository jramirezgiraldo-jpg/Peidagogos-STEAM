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
        const user = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;

        // Admin Auth mock
        if(user === 'jramirezgiraldo' && pass === 'Biol2008%') {
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
            alert('Credenciales inválidas. Si es estudiante nuevo, por favor regístrese.');
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
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
