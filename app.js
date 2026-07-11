// ==========================================
// MATRIZ FÍSICA INYECTADA (FASE 2)
// ==========================================
const mallaFisicaMontenegro = {
  "6": {
    "1": "Movimiento planetario y gravitación universal.",
    "2": "Conceptos de posición, desplazamiento, velocidad y aceleración.",
    "3": "Impulso, cantidad de movimiento y choques.",
    "4": "Fenómenos naturales comunes en el entorno."
  },
  "7": {
    "1": "Cantidades escalares y vectoriales en fenómenos naturales.",
    "2": "Análisis y construcción de gráficas de movimiento.",
    "3": "Movimiento de un cuerpo en dos dimensiones.",
    "4": "Energía mecánica y principio de conservación de la energía."
  }
};

document.addEventListener("DOMContentLoaded", function() {
    const btnShowReg = document.getElementById("btn-show-register");
    const btnCancelReg = document.getElementById("btn-cancel-register");
    const loginView = document.getElementById("login-screen-container");
    const regView = document.getElementById("register-screen-container");
    const dashboardView = document.getElementById("dashboard-screen-container");
    const docenteDashboardView = document.getElementById("docente-dashboard-container");

    let usuario_actual = "";

    if (btnShowReg) {
        btnShowReg.addEventListener("click", function(e) {
            e.preventDefault();
            loginView.style.display = "none";
            regView.style.display = "flex";
        });
    }

    if (btnCancelReg) {
        btnCancelReg.addEventListener("click", function(e) {
            e.preventDefault();
            regView.style.display = "none";
            loginView.style.display = "grid";
        });
    }

    // ==========================================
    // LÓGICA DE LOGIN (EXPANDIDA)
    // ==========================================
    const loginBtn = document.getElementById("btn-login-core");
    const errorMsg = document.getElementById("login-error-msg");
    const rolSelectGlobal = document.getElementById("login-role");
    const adminUserGlobal = document.getElementById("admin-user");
    const adminPassGlobal = document.getElementById("admin-pass");

    if (rolSelectGlobal) {
        rolSelectGlobal.addEventListener("change", function() {
            if (this.value === "estudiante") {
                if (adminUserGlobal) adminUserGlobal.placeholder = "Número de Identificación";
                if (adminPassGlobal) adminPassGlobal.style.display = "none";
            } else {
                if (adminUserGlobal) adminUserGlobal.placeholder = "Usuario";
                if (adminPassGlobal) adminPassGlobal.style.display = "block";
            }
        });
        // Set initial state
        rolSelectGlobal.dispatchEvent(new Event("change"));
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", async function(e) {
            e.preventDefault();
            let user = document.getElementById("admin-user") ? String(document.getElementById("admin-user").value).trim() : "";
            let pass = document.getElementById("admin-pass") ? String(document.getElementById("admin-pass").value).trim() : "";
            const rolSelect = document.getElementById("login-role");
            const rol = rolSelect ? rolSelect.value : "estudiante";
            
            if (rol === "estudiante") {
                pass = user;
            }

            if (!user || !pass) {
                if (errorMsg) { errorMsg.style.display = "block"; errorMsg.innerText = "Ingresa credenciales completas."; }
                return;
            }

            loginBtn.innerText = "Verificando...";
            
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: user, clave: pass, rol: rol })
                });
                
                const data = await res.json();
                
                if (data.status === 'success') {
                    loginView.style.display = "none";
                    if (errorMsg) errorMsg.style.display = "none";
                    
                    usuario_actual = data.usuario; // Guardar ID del usuario actual

                    if (data.rol === 'admin') {
                        if (dashboardView) dashboardView.style.display = "block";
                        cargarDatosAdmin();
                    } else if (data.rol === 'docente') {
                        if (docenteDashboardView) docenteDashboardView.style.display = "block";
                        const dHeader = document.getElementById("docente-nombre-header");
                        if (dHeader) dHeader.innerText = data.nombre;
                        cargarEstudiantesDocente(data.usuario);
                    } else { // Estudiante
                        const studentView = document.getElementById("student-dashboard-container");
                        if (studentView) {
                            studentView.style.display = "block";
                            const welcomeMsg = document.getElementById("student-welcome-name");
                            if (welcomeMsg) welcomeMsg.innerText = "Bienvenido/a, " + data.nombre;
                            const gradoLimpio = data.grado.replace('°', '').trim();
                            const mallaEstudiante = document.getElementById("student-malla-" + gradoLimpio);
                            if (mallaEstudiante) mallaEstudiante.style.display = "block";
                        } else {
                            // Fallback temporal si la vista de estudiante no está definida
                            alert("Bienvenido Estudiante: " + data.nombre);
                        }
                    }
                } else {
                    if (errorMsg) { errorMsg.style.display = "block"; errorMsg.innerText = "Credenciales incorrectas."; }
                }
            } catch (err) {
                console.error(err);
                if (errorMsg) { errorMsg.style.display = "block"; errorMsg.innerText = "Error interno o de red."; }
            } finally {
                loginBtn.innerText = "Iniciar Sesión";
            }
        });
    }

    // ==========================================
    // LÓGICA PANEL DOCENTE HOME SCHOOL
    // ==========================================
    const btnDocenteMatricular = document.getElementById("btn-docente-matricular");
    if (btnDocenteMatricular) {
        btnDocenteMatricular.addEventListener("click", async function(e) {
            e.preventDefault();
            const doc = document.getElementById("docente-reg-doc").value.trim();
            const nom = document.getElementById("docente-reg-nom").value.trim();
            const ape = document.getElementById("docente-reg-ape").value.trim();
            const edad = document.getElementById("docente-reg-edad").value.trim();
            const gen = document.getElementById("docente-reg-gen").value;
            const grado = document.getElementById("docente-reg-grado").value;
            
            // Obtener asignaturas chuleadas
            const checkboxes = document.querySelectorAll('.materia-chk:checked');
            let materias_matriculadas = [];
            checkboxes.forEach(chk => {
                materias_matriculadas.push(chk.value);
            });

            if (!doc || !nom || !ape || !edad || !gen || !grado) {
                alert("Completa todos los datos básicos del estudiante.");
                return;
            }

            btnDocenteMatricular.innerText = "Guardando...";
            btnDocenteMatricular.disabled = true;

            const payload = {
                documento: doc,
                nombre: nom,
                apellidos: ape,
                edad: edad,
                genero: gen,
                grado: grado,
                docente_id: usuario_actual,
                materias: materias_matriculadas
            };

            try {
                const res = await fetch("/api/registro-estudiante", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    alert("✅ Estudiante matriculado.");
                    // Limpiar form
                    document.getElementById("docente-reg-doc").value = "";
                    document.getElementById("docente-reg-nom").value = "";
                    document.getElementById("docente-reg-ape").value = "";
                    document.getElementById("docente-reg-edad").value = "";
                    document.getElementById("docente-reg-gen").value = "";
                    document.getElementById("docente-reg-grado").value = "";
                    document.getElementById("materias-checkboxes-container").innerHTML = '<span style="color: #6B7280; font-size: 0.9rem;">Selecciona un grado primero.</span>';
                    
                    cargarEstudiantesDocente(usuario_actual);
                } else {
                    alert("❌ Error al guardar.");
                }
            } catch (error) {
                alert("❌ Error de red.");
            } finally {
                btnDocenteMatricular.innerText = "Matricular";
                btnDocenteMatricular.disabled = false;
            }
        });
    }

    // Registro antiguo (por si acaso se usa)
    const btnSubmit = document.getElementById("btn-submit-register");
    if (btnSubmit) {
        btnSubmit.addEventListener("click", function(e) {
            e.preventDefault();
            // (Código de registro original de estudiantes, se mantiene para no romper lógica anterior)
            const doc = document.getElementById("reg-documento") ? document.getElementById("reg-documento").value.trim() : "";
            const ap = document.getElementById("reg-apellidos") ? document.getElementById("reg-apellidos").value.trim() : "";
            const nom = document.getElementById("reg-nombre") ? document.getElementById("reg-nombre").value.trim() : "";
            const ed = document.getElementById("reg-edad") ? document.getElementById("reg-edad").value.trim() : "";
            const gen = document.getElementById("reg-genero") ? document.getElementById("reg-genero").value : "";
            const gra = document.getElementById("reg-grado") ? document.getElementById("reg-grado").value : "";
            const grupo = document.getElementById("registro-grupo") ? document.getElementById("registro-grupo").value : "";
            const asig = document.getElementById("registro-asignatura") ? document.getElementById("registro-asignatura").value : "";

            if (!doc || !ap || !nom || !ed || !gen || !gra || !grupo || !asig) {
                alert("⚠️ Por favor, completa todos los campos.");
                return;
            }
            fetch("/api/registro-estudiante", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra, grupo: grupo, asignatura: asig })
            }).then(r => {
                if(r.ok) { alert("Registrado!"); location.reload(); }
            });
        });
    }

    // ==========================================
    // TABS ADMIN (NUEVO)
    // ==========================================
    const adminTabs = document.querySelectorAll('.admin-tab-btn');
    if (adminTabs.length > 0) {
        adminTabs.forEach(btn => {
            btn.addEventListener('click', function() {
                adminTabs.forEach(b => {
                    b.classList.remove('active');
                    b.style.borderBottom = 'none';
                    b.style.background = 'transparent';
                    b.style.color = '#6B7280';
                });
                this.classList.add('active');
                this.style.borderBottom = '3px solid #3B82F6';
                this.style.background = 'white';
                this.style.color = 'black';
                
                const tabId = this.getAttribute('data-tab');
                document.querySelectorAll('.admin-view').forEach(view => {
                    view.style.display = 'none';
                });
                document.getElementById('admin-view-' + tabId).style.display = 'block';
            });
        });
    }

    const btnCrearAsig = document.getElementById("btn-crear-asignatura");
    if (btnCrearAsig) {
        btnCrearAsig.addEventListener('click', async () => {
            const nom = document.getElementById("admin-asig-nombre").value.trim();
            const gra = document.getElementById("admin-asig-grado").value;
            if(!nom) return alert("Ingresa un nombre.");
            
            try {
                await fetch('/api/asignaturas', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ nombre: nom, grado: gra })
                });
                alert("✅ Asignatura creada.");
                document.getElementById("admin-asig-nombre").value = "";
            } catch(e) {
                alert("Error creando asignatura");
            }
        });
    }

    // ==========================================
    // RENDERIZADO INTELIGENTE PESTAÑAS (FASE 3)
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-grado-btn');
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const target = this.getAttribute('data-target');
                const grado = target.charAt(0);
                
                // Mostrar la planeación
                const mallaDisplay = document.getElementById('malla-display');
                if (mallaDisplay && mallaFisicaMontenegro[grado]) {
                    const plan = mallaFisicaMontenegro[grado];
                    mallaDisplay.innerHTML = `
                        <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); text-align: left;">
                            <h4 style="border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-bottom: 15px; font-weight: 800; font-family: Outfit, sans-serif; font-size: 1.4rem;">Planeación Física ${target}</h4>
                            <ul style="list-style-type: none; padding: 0; color: #374151; font-size: 1.1rem; line-height: 1.8;">
                                <li style="margin-bottom: 10px;"><b>Semana 1:</b> ${plan["1"]}</li>
                                <li style="margin-bottom: 10px;"><b>Semana 2:</b> ${plan["2"]}</li>
                                <li style="margin-bottom: 10px;"><b>Semana 3:</b> ${plan["3"]}</li>
                                <li><b>Semana 4:</b> ${plan["4"]}</li>
                            </ul>
                        </div>
                    `;
                }

                // Filtrar tabla de estudiantes
                const tbody = document.getElementById('tbody-docente-estudiantes');
                if (tbody) {
                    const rows = tbody.querySelectorAll('tr');
                    rows.forEach(row => {
                        const txt = row.innerText;
                        // Checking if row contains the specific group
                        if (txt.includes(` - ${target} `) || txt.includes(` - ${target} (`)) {
                            row.style.display = 'table-row';
                        } else {
                            row.style.display = 'none';
                        }
                    });
                }
            });
        });
    }

}); // Fin DOMContentLoaded

// ==========================================
// FUNCIONES GLOBALES
// ==========================================

async function cargarEstudiantesDocente(docenteId) {
    try {
        const res = await fetch('/api/estudiantes');
        const estudiantes = await res.json();
        const tbody = document.getElementById('tbody-docente-estudiantes');
        
        const filtroAsig = document.getElementById('filtro-asignatura') ? document.getElementById('filtro-asignatura').value : "Todas las Asignaturas";
        const filtroGrupo = document.getElementById('filtro-grupo') ? document.getElementById('filtro-grupo').value : "Todos los Grupos";

        if (tbody) {
            tbody.innerHTML = '';
            estudiantes.forEach(est => {
                const matchAsig = (filtroAsig === "Todas las Asignaturas") || (est.asignatura === filtroAsig);
                const matchGrupo = (filtroGrupo === "Todos los Grupos") || (est.grupo === filtroGrupo);

                if (est.docente_id === docenteId && matchAsig && matchGrupo) {
                    tbody.innerHTML += `
                    <tr>
                        <td style="padding: 10px;">${est.documento || ''}</td>
                        <td style="padding: 10px; font-weight: bold;">${est.nombre || ''} ${est.apellidos || ''}</td>
                        <td style="padding: 10px;">${est.grado || ''}° - ${est.grupo || ''} (${est.asignatura || ''})</td>
                    </tr>`;
                }
            });
        }
    } catch(e) { console.error(e); }
}

async function cargarAsignaturasDocente(gradoSeleccionado) {
    const container = document.getElementById("materias-checkboxes-container");
    if (!container) return;
    
    if (!gradoSeleccionado) {
        container.innerHTML = '<span style="color: #6B7280; font-size: 0.9rem;">Selecciona un grado primero.</span>';
        return;
    }

    try {
        const res = await fetch('/api/asignaturas');
        const asignaturas = await res.json();
        
        let html = '';
        let cont = 0;
        asignaturas.forEach(a => {
            if (a.grado == gradoSeleccionado) {
                html += `
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" class="materia-chk" value="${a.nombre}">
                    ${a.nombre}
                </label>`;
                cont++;
            }
        });
        
        if (cont === 0) {
            container.innerHTML = '<span style="color: #6B7280; font-size: 0.9rem;">No hay asignaturas para este grado.</span>';
        } else {
            container.innerHTML = html;
        }
    } catch(e) { console.error(e); }
}

async function cargarDatosAdmin() {
    try {
        // Cargar Docentes
        const resDocentes = await fetch('/api/docentes');
        const docentes = await resDocentes.json();
        
        // Cargar Estudiantes
        const resEstud = await fetch('/api/estudiantes');
        const estudiantes = await resEstud.json();

        const tbodyDoc = document.getElementById('tbody-admin-docentes');
        const tbodyEst = document.getElementById('tbody-admin-todos-estudiantes');

        if (tbodyDoc) {
            tbodyDoc.innerHTML = '';
            docentes.forEach(d => {
                const cant = estudiantes.filter(e => e.docente_id === d.documento).length;
                tbodyDoc.innerHTML += `
                <tr>
                    <td style="padding: 15px;">${d.documento}</td>
                    <td style="padding: 15px; font-weight: bold;">${d.nombre} ${d.apellidos}</td>
                    <td style="padding: 15px;">${cant}</td>
                </tr>`;
            });
        }

        if (tbodyEst) {
            tbodyEst.innerHTML = '';
            estudiantes.forEach(est => {
                tbodyEst.innerHTML += `
                <tr>
                    <td style="padding: 15px;">${est.documento || ''}</td>
                    <td style="padding: 15px; font-weight: bold;">${est.nombre || ''} ${est.apellidos || ''}</td>
                    <td style="padding: 15px;">${est.grado || ''}°</td>
                </tr>`;
            });
        }
        
    } catch(e) { console.error(e); }
}

function normalizar(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor).replace('°', '').trim().toLowerCase();
}

// Mantener lógica de mallas original (filtrarContenido, etc) que el usuario tenía
// ...
