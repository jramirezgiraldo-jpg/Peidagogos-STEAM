// ==========================================
// MATRIZ FÍSICA INYECTADA (FASE 2)
// ==========================================
var mallaFisicaMontenegro = {
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

// ==========================================
// MALLA NARRATIVA MAESTRA (FÍSICA GRADOS 6 Y 7 - PERIODO 1)
// ==========================================
var MallaNarrativaMaestra = {
    obtenerTexto: function(config) {
        let textoPedagogico = "";
        
        if (config.grado === "6" && config.periodo === "1") {
            textoPedagogico = `<strong>Temas:</strong> Interpretación de fenómenos naturales comunes en el entorno.<br>
            <strong>DBA:</strong> Comprende cómo los cuerpos pueden ser cargados eléctricamente asociando esta carga a efectos de atracción y repulsión.<br>
            <strong>Objetivo Específico:</strong> Construir estrategias a partir de los conocimientos adquiridos para la interpretación de fenómenos naturales y reconocer la importancia de la física en el desarrollo humano.<br><br>
            En este primer periodo, analizamos los fenómenos naturales de nuestro entorno. En sitios como el Parque del Café o en las haciendas ganaderas de Montenegro, ocurren constantemente fenómenos físicos. Durante el beneficio del café o al interactuar con el pelaje del ganado en climas secos, se puede evidenciar la electricidad estática al frotar ciertos materiales, demostrando cómo los cuerpos se cargan eléctricamente (atracción y repulsión). Tu objetivo es interpretar estos fenómenos que vemos a diario en nuestro bello municipio y aplicar tus estrategias de análisis científico para beneficio de nuestra comunidad.`;
        } else if (config.grado === "7" && config.periodo === "1") {
            textoPedagogico = `<strong>Temas:</strong> Cantidades escalares y vectoriales en fenómenos naturales.<br>
            <strong>DBA:</strong> Comprende las formas y las transformaciones de energía en un sistema mecánico y la manera como, en los casos reales, la energía se disipa en el medio (calor, sonido).<br>
            <strong>Objetivo Específico:</strong> Evaluar y clasificar cantidades escalares y vectoriales, interpretando la presencia de ellas en fenómenos naturales y situaciones de su entorno.<br><br>
            En este primer periodo, aprenderemos a evaluar cantidades escalares y vectoriales. Imagina el recorrido de los tradicionales Jeeps Willys transportando café o turistas por las empinadas vías de Montenegro o el desplazamiento del ganado por las laderas: aquí actúan vectores de velocidad y fuerza. Asimismo, en las montañas rusas del Parque del Café se observan maravillosas transformaciones de energía mecánica, donde la energía potencial y cinética se conservan o se disipan en forma de calor y sonido debido a la fricción. Tu misión es evaluar estas magnitudes físicas para interpretar la dinámica de nuestra región cafetera y turística.`;
        } else {
            textoPedagogico = `En Montenegro, la cultura cafetera, la ganadería y el turismo son motores económicos y laboratorios vivos de ciencias naturales y física. Analiza tu entorno y aplica tus saberes para dar soluciones a nuestra comunidad.`;
        }

        return `
            Bienvenido al municipio de Montenegro, corazón del Quindío. Como <strong>${config.rol || 'estudiante'}</strong>, tu misión de hoy se desarrolla en <strong>${config.escenario || 'tu entorno'}</strong>. Utilizando la mecánica de <strong>${config.mecanica || 'investigación'}</strong>, buscarás alcanzar el botín: <strong>${config.botin || 'conocimiento'}</strong>.
            <br><br>
            ${textoPedagogico}
        `;
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
                if (adminPassGlobal) {
                    adminPassGlobal.style.display = "block";
                    adminPassGlobal.placeholder = "Contraseña (Por defecto tu ID)";
                }
            } else {
                if (adminUserGlobal) adminUserGlobal.placeholder = "Usuario";
                if (adminPassGlobal) {
                    adminPassGlobal.style.display = "block";
                    adminPassGlobal.placeholder = "Contraseña";
                }
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
                    
                    window.rol_actual = data.rol; usuario_actual = data.usuario; // Guardar ID del usuario actual

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
                        window.usuarioEstudianteActual = data;
                        localStorage.setItem('usuario_sesion', JSON.stringify(data));
                        
                        if (studentView) {
                            studentView.style.display = "block";
                            const welcomeMsg = document.getElementById("student-welcome-name");
                            if (welcomeMsg) welcomeMsg.innerText = "¡Hola, " + data.nombre + "!";
                            
                            const badgeMsg = document.getElementById("student-grade-badge");
                            if (badgeMsg) {
                                let badgeText = [];
                                if (data.grado) badgeText.push("Grado " + data.grado);
                                if (data.grupo) badgeText.push("Grupo " + data.grupo);
                                badgeMsg.innerText = badgeText.length > 0 ? badgeText.join(" | ") : "Estudiante";
                            }
                            
                            const headerName = document.getElementById("header-student-name");
                            if (headerName) headerName.innerText = data.nombre;
                            const headerGrade = document.getElementById("header-student-grade");
                            if (headerGrade) headerGrade.innerText = data.grado || "N/A";
                            
                            // Mostrar materias matriculadas
                            const subjectsGrid = document.getElementById("student-subjects-grid");
                            if (subjectsGrid) {
                                subjectsGrid.innerHTML = ""; // Limpiar previas
                                let asignaturas = [];
                                if (data.asignatura) {
                                    asignaturas = data.asignatura.split(',').map(s => s.trim()).filter(s => s);
                                }
                                
                                if (asignaturas.length === 0) {
                                    subjectsGrid.innerHTML = "<p style='color: #6B7280; font-size: 1.1rem;'>No tienes asignaturas matriculadas.</p>";
                                } else {
                                    asignaturas.forEach(asig => {
                                        const card = document.createElement("div");
                                        card.style.cssText = "background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s; border-top: 4px solid #10B981; display: flex; flex-direction: column; justify-content: space-between; height: 180px;";
                                        card.onmouseover = () => { card.style.transform = "translateY(-5px)"; card.style.boxShadow = "0 10px 15px rgba(0,0,0,0.1)"; };
                                        card.onmouseout = () => { card.style.transform = "none"; card.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)"; };
                                        
                                        card.innerHTML = `
                                            <div>
                                                <div style="font-size: 2rem; margin-bottom: 10px;">📚</div>
                                                <h3 style="margin: 0; font-size: 1.3rem; color: #111827; font-weight: 800;">${asig}</h3>
                                            </div>
                                            <button style="background: #10B981; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; width: 100%; font-family: Inter, sans-serif; margin-top: 15px;" onclick="abrirAsignaturaEstudiante('${asig}', '${data.grado || data.grupo || ''}')">Entrar al Aula</button>
                                        `;
                                        subjectsGrid.appendChild(card);
                                    });
                                }
                            }
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

            if (!doc || !ap || !nom || !ed || !gen || (!gra && !grupo) || !asig) {
                alert("⚠️ Por favor, completa todos los campos.");
                return;
            }
            fetch("/api/registro-estudiante", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra, grupo: grupo, asignatura: asig })
            }).then(async r => {
                if(r.ok) { 
                    alert("Registrado!"); location.reload(); 
                } else {
                    const errMsg = await r.text();
                    alert("❌ Error del servidor (" + r.status + "): " + errMsg);
                }
            }).catch(err => {
                alert("❌ Error crítico: El servidor backend está apagado o inaccesible.");
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
                const tipoVinculacion = d.institucion ? d.institucion : "Homeschool";
                tbodyDoc.innerHTML += `
                <tr>
                    <td style="padding: 15px;">${d.documento}</td>
                    <td style="padding: 15px; font-weight: bold;">${d.nombre} ${d.apellidos}</td>
                    <td style="padding: 15px;"><span class="badge" style="background: #EFF6FF; color: #1D4ED8; padding: 5px 10px; border-radius: 20px; font-size: 0.85em;">${tipoVinculacion}</span></td>
                </tr>`;
            });
        }

        // Renderizado del Admin
        window.todosEstudiantes = estudiantes;
        
        const filtroGrupo = document.getElementById('admin-grupo-filtro');
        if (filtroGrupo) {
            // Guardar selección actual si existe
            const currentSelection = filtroGrupo.value;
            
            const gruposUnicos = [...new Set(estudiantes.map(e => e.grupo).filter(g => g))];
            filtroGrupo.innerHTML = '<option value="todos">Todos los Grupos</option>';
            gruposUnicos.sort().forEach(g => {
                filtroGrupo.innerHTML += `<option value="${g}">${g}</option>`;
            });
            
            // Restaurar selección si el grupo todavía existe
            if(gruposUnicos.includes(currentSelection)) {
                filtroGrupo.value = currentSelection;
            }
            
            filtroGrupo.onchange = renderizarTablaAdmin;
        }

        renderizarTablaAdmin();
        
    } catch(e) { console.error(e); }
}

window.eliminarEstudiante = async function(documento) {
    if(!confirm("¿Estás seguro de que deseas eliminar este estudiante? Esta acción no se puede deshacer.")) return;
    
    try {
        const res = await fetch('/api/eliminar-estudiante', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documento: String(documento) })
        });
        if(res.ok) {
            alert("Estudiante eliminado correctamente.");
            cargarDatosAdmin(); // recargar
        } else {
            const data = await res.json();
            alert("Error: " + data.message);
        }
    } catch(e) {
        alert("Error de red al intentar eliminar.");
    }
};

function renderizarTablaAdmin() {
    // Disabled to prevent overwriting the static 'Instituciones' layout.
}


function obtenerMateriasPorGrupo(grupoName) {
    if (grupoName === '6A' || grupoName === '6B') {
        return [{ nombre: 'Física', horas: '2h', estado: 'Pendiente', color: '#6B7280' }];
    } else if (grupoName === '7A') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Física', horas: '3h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName === '7B') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Física', horas: '2h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName === '7C') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Ética', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Física', horas: '2h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName === '8A' || grupoName === '8B' || grupoName === '9A') {
        return [{ nombre: 'Artística', horas: '1h', estado: 'Pendiente', color: '#6B7280' }];
    } else if (grupoName === '10A' || grupoName === '10D') {
        return [{ nombre: 'Ética', horas: '1h', estado: 'Pendiente', color: '#6B7280' }];
    } else if (grupoName === 'PENS') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Química', horas: '2h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else {
        return [{ nombre: 'Asignaturas Básicas', horas: 'Varias', estado: 'Pendiente', color: '#6B7280' }];
    }
}


// --- INICIO MALLA CURRICULAR FÍSICA ---

// ==========================================
// MALLA CURRICULAR TURISMO
// ==========================================
window.mallaTurismo = {
    "7": {
        objetivo: "Desarrollar una mentalidad emprendedora y de reconocimiento cultural, valorando la riqueza del Eje Cafetero y de Colombia, así como el Paisaje Cultural Cafetero (PCC).",
        periodos: {
            "1": {
                "1": "El eje cafetero. Departamentos más importantes.",
                "3": "Municipios más importantes. Símbolos que identifican el eje cafetero.",
                "5": "Lugares turísticos más importantes del eje cafetero.",
                "7": "Mitos y leyendas del eje cafetero."
            },
            "2": {
                "1": "País de Colombia. Ubicación geográfica, mapa, himno, escudo, bandera.",
                "3": "Departamentos y capital de Colombia.",
                "5": "Costumbres, cultura y gentilicio de Colombia.",
                "7": "Sitios turísticos más importantes de Colombia. Mitos y leyendas."
            },
            "3": {
                "1": "Qué es el emprendimiento y su definición.",
                "3": "Tipos de emprendimiento.",
                "5": "Características y ejemplos de emprendimiento.",
                "7": "Idea de productos perecederos (maíz y huevo) y realización de su propio emprendimiento."
            },
            "4": {
                "1": "El reconocimiento de valor universal excepcional concedido al PCC.",
                "3": "Qué significa la inscripción de patrimonio mundial.",
                "5": "Qué significa el reconocimiento de valor universal excepcional concedido al PCC.",
                "7": "Colombianidad: qué es y por qué es importante. Todos los colombianos compartimos la misma colombianidad."
            }
        }
    },
    "PENS": {
        objetivo: "Fomentar el reconocimiento del Paisaje Cultural Cafetero, la cultura colombiana y el desarrollo de ideas emprendedoras en el contexto del turismo regional (Adaptación CLEI).",
        periodos: {
            "1": {
                "1": "El eje cafetero y sus departamentos más importantes.",
                "3": "Municipios y símbolos del eje cafetero.",
                "5": "Lugares turísticos más importantes.",
                "7": "Mitos y leyendas de la región."
            },
            "2": {
                "1": "Geografía, símbolos y departamentos de Colombia.",
                "3": "Costumbres y cultura nacional.",
                "5": "Sitios turísticos más importantes de Colombia.",
                "7": "Identidad cultural colombiana."
            },
            "3": {
                "1": "Introducción al emprendimiento.",
                "3": "Tipos y características del emprendimiento.",
                "5": "Desarrollo de ideas de negocio turísticas.",
                "7": "Formulación de proyectos productivos locales."
            },
            "4": {
                "1": "Patrimonio mundial y el PCC.",
                "3": "Importancia del Paisaje Cultural Cafetero.",
                "5": "Valor universal excepcional del PCC.",
                "7": "La colombianidad como factor de unión y desarrollo."
            }
        }
    }
};

// MALLA CURRICULAR ARTÍSTICA (MÚSICA INTERACTIVA)
// ==========================================
window.mallaArtistica = {
    "7": {
        objetivo: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.",
        periodos: {
            "1": {
                "1": "Introducción a la música digital y uso del teclado como instrumento.",
                "3": "El ritmo y el pulso: patrones rítmicos básicos.",
                "5": "Identificación de notas musicales en la interfaz digital.",
                "7": "Ejecución de melodías sencillas a una mano."
            },
            "2": {
                "1": "Coordinación rítmica y ejercicios de digitación.",
                "3": "Lectura básica de partituras simplificadas.",
                "5": "Interpretación de una canción tradicional.",
                "7": "Creación de un ritmo base para acompañamiento."
            },
            "3": {
                "1": "Exploración de géneros musicales modernos y sus patrones.",
                "3": "Ensamblaje de percusión y melodía.",
                "5": "Uso de secuencias y loops en la música interactiva.",
                "7": "Composición de una breve pieza musical original."
            },
            "4": {
                "1": "Audición crítica: apreciación de diferentes instrumentos.",
                "3": "Práctica de ensamble virtual.",
                "5": "Preparación de la presentación musical del periodo.",
                "7": "Presentación final de interpretaciones musicales."
            }
        }
    },
    "8": {
        objetivo: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.",
        periodos: {
            "1": {
                "1": "Introducción a la música digital y uso del teclado como instrumento.",
                "3": "El ritmo y el pulso: patrones rítmicos básicos.",
                "5": "Identificación de notas musicales en la interfaz digital.",
                "7": "Ejecución de melodías sencillas a una mano."
            },
            "2": {
                "1": "Coordinación rítmica y ejercicios de digitación.",
                "3": "Lectura básica de partituras simplificadas.",
                "5": "Interpretación de una canción tradicional.",
                "7": "Creación de un ritmo base para acompañamiento."
            },
            "3": {
                "1": "Exploración de géneros musicales modernos y sus patrones.",
                "3": "Ensamblaje de percusión y melodía.",
                "5": "Uso de secuencias y loops en la música interactiva.",
                "7": "Composición de una breve pieza musical original."
            },
            "4": {
                "1": "Audición crítica: apreciación de diferentes instrumentos.",
                "3": "Práctica de ensamble virtual.",
                "5": "Preparación de la presentación musical del periodo.",
                "7": "Presentación final de interpretaciones musicales."
            }
        }
    },
    "9": {
        objetivo: "Desarrollar habilidades rítmicas, auditivas y creativas utilizando herramientas digitales y el teclado del computador como instrumento musical.",
        periodos: {
            "1": {
                "1": "Introducción a la música digital y uso del teclado como instrumento.",
                "3": "El ritmo y el pulso: patrones rítmicos básicos.",
                "5": "Identificación de notas musicales en la interfaz digital.",
                "7": "Ejecución de melodías sencillas a una mano."
            },
            "2": {
                "1": "Coordinación rítmica y ejercicios de digitación.",
                "3": "Lectura básica de partituras simplificadas.",
                "5": "Interpretación de una canción tradicional.",
                "7": "Creación de un ritmo base para acompañamiento."
            },
            "3": {
                "1": "Exploración de géneros musicales modernos y sus patrones.",
                "3": "Ensamblaje de percusión y melodía.",
                "5": "Uso de secuencias y loops en la música interactiva.",
                "7": "Composición de una breve pieza musical original."
            },
            "4": {
                "1": "Audición crítica: apreciación de diferentes instrumentos.",
                "3": "Práctica de ensamble virtual.",
                "5": "Preparación de la presentación musical del periodo.",
                "7": "Presentación final de interpretaciones musicales."
            }
        }
    }
};

// MALLA CURRICULAR ÉTICA (PROYECTO DE VIDA Y DILEMAS)
// ==========================================
window.mallaEtica = {
    "7": {
        objetivo: "Fomentar el reconocimiento de sí mismo y el desarrollo de la empatía a través de dilemas morales, contribuyendo a la construcción de su proyecto de vida.",
        periodos: {
            "1": {
                "1": "Autoconocimiento: mis fortalezas y talentos en mi proyecto de vida.",
                "3": "Resolución pacífica de conflictos y el diálogo asertivo.",
                "5": "Dilemas morales: la honestidad vs la presión social.",
                "7": "Empatía digital: convivencia sana y prevención del ciberacoso."
            },
            "2": {
                "1": "Mis emociones y cómo influyen en mis decisiones.",
                "3": "Toma de decisiones responsables frente a situaciones difíciles.",
                "5": "El valor del respeto a la diversidad en mi entorno.",
                "7": "Construyendo metas a corto plazo para mi futuro."
            },
            "3": {
                "1": "El trabajo en equipo y la solidaridad grupal.",
                "3": "Cómo actuar frente a la injusticia: mi rol activo.",
                "5": "Mis derechos y mis deberes como estudiante y ciudadano.",
                "7": "La influencia de las redes sociales en mi identidad."
            },
            "4": {
                "1": "Reconociendo líderes positivos en mi comunidad.",
                "3": "El esfuerzo y la disciplina como pilares del éxito.",
                "5": "Reflexión sobre las decisiones del año y aprendizajes.",
                "7": "Proyección: Visualizando mis metas para el próximo año."
            }
        }
    },
    "10": {
        objetivo: "Estructurar el proyecto de vida con bases éticas sólidas, analizando dilemas morales complejos y asumiendo responsabilidad ciudadana y profesional.",
        periodos: {
            "1": {
                "1": "El Proyecto de Vida: propósitos, vocación y visión a futuro.",
                "3": "La libertad y la responsabilidad en la toma de decisiones.",
                "5": "Dilemas éticos modernos: tecnología, bioética y sociedad.",
                "7": "La presión de grupo y la autenticidad en la adolescencia."
            },
            "2": {
                "1": "Exploración vocacional y profesional: ¿quién quiero ser?",
                "3": "Ética profesional y la integridad en el ámbito laboral.",
                "5": "Liderazgo ético y el impacto positivo en mi comunidad.",
                "7": "Resolución de conflictos morales: análisis de casos reales."
            },
            "3": {
                "1": "Ciudadanía activa y participación democrática juvenil.",
                "3": "Los Derechos Humanos y su defensa en el entorno cercano.",
                "5": "Consumo responsable y ética ambiental.",
                "7": "La influencia de los medios masivos en nuestra moralidad."
            },
            "4": {
                "1": "Manejo de la frustración y la resiliencia ante el fracaso.",
                "3": "Planificación financiera básica con enfoque ético.",
                "5": "Presentación del bosquejo del Proyecto de Vida personal.",
                "7": "Evaluación moral del año y compromisos para el futuro."
            }
        }
    }
};

window.mallaMatematicas = {
    '6': { objetivo: 'Desarrollar el pensamiento numérico y espacial.', periodos: { '1': { '1': 'Sistemas Numéricos (Números Enteros).', '2': 'Operaciones Básicas con Enteros.' } } }
};
window.mallaNaturales = {
    '6': { objetivo: 'Comprender la estructura celular y el entorno vivo.', periodos: { '1': { '1': 'La Célula y sus partes.', '2': 'Funciones Celulares y organelos.' } } }
};
window.mallaSociales = {
    '6': { objetivo: 'Identificar el espacio geográfico y el universo.', periodos: { '1': { '1': 'Geografía Física.', '2': 'El Sistema Solar.' } } }
};
window.mallaCastellano = {
    '6': { objetivo: 'Fortalecer la comprensión lectora.', periodos: { '1': { '1': 'Tipos de Textos.', '2': 'Estructura del Cuento.' } } }
};

window.mallaFisica = {
    '6': {
        objetivo: 'Interpretar fenómenos naturales, la gravitación y los conceptos básicos de cinemática (posición, velocidad y aceleración).',
        periodos: {
            '1': {
                '1': 'Introducción a la Física y su importancia en el desarrollo humano.',
                '3': 'Observación e interpretación de fenómenos naturales en el entorno.',
                '5': 'El sistema planetario y sus componentes.',
                '7': 'Ley de la gravitación universal y movimiento de satélites naturales.'
            },
            '2': {
                '1': 'Conceptos de posición y trayectoria.',
                '3': 'Distancia y desplazamiento.',
                '5': 'Velocidad y rapidez en el entorno cotidiano.',
                '7': 'Aceleración y características de los diferentes tipos de movimiento.'
            },
            '3': {
                '1': 'Revisión del movimiento planetario desde el punto de vista científico.',
                '3': 'Aplicación de la ley de la gravitación universal.',
                '5': 'Satélites naturales vs. satélites artificiales.',
                '7': 'Proyecto de aula: Modelando el sistema solar y sus fuerzas.'
            },
            '4': {
                '1': 'Concepto de impulso en situaciones cotidianas.',
                '3': 'Cantidad de movimiento (Momentum).',
                '5': 'Choques elásticos: Teoría y ejemplos.',
                '7': 'Choques inelásticos e identificación de fuerzas internas y externas.'
            }
        }
    },
    '7': {
        objetivo: 'Analizar gráficamente el movimiento bidimensional y aplicar el principio de conservación de la energía mecánica.',
        periodos: {
            '1': {
                '1': 'Diferencia entre magnitudes escalares y vectoriales.',
                '3': 'Representación gráfica de vectores.',
                '5': 'Suma y resta de vectores en contextos físicos.',
                '7': 'Interpretación de vectores en fenómenos naturales del entorno.'
            },
            '2': {
                '1': 'Construcción e interpretación de gráficas de posición vs tiempo (x-t).',
                '3': 'Gráficas de velocidad vs tiempo (v-t).',
                '5': 'Gráficas de aceleración vs tiempo (a-t).',
                '7': 'Comparación de movimientos utilizando herramientas gráficas.'
            },
            '3': {
                '1': 'Características de un cuerpo que se mueve en dos dimensiones.',
                '3': 'Movimiento semiparabólico y parabólico.',
                '5': 'Movimiento circular uniforme.',
                '7': 'Argumentación y resolución de problemas bidimensionales.'
            },
            '4': {
                '1': 'Tipos de energía mecánica: Cinética y Potencial.',
                '3': 'Principio de conservación de la energía mecánica.',
                '5': 'Transformaciones de energía en sistemas físicos.',
                '7': 'Resolución de problemas aplicando la conservación de la energía.'
            }
        }
    },
    '8': {
        objetivo: 'Comprender la utilidad de las máquinas simples, las leyes de la termodinámica y el comportamiento de fluidos.',
        periodos: {
            '1': { '1': 'Concepto de trabajo, ventaja mecánica y eficiencia.', '3': 'Tipos de máquinas simples.', '5': 'Máquinas compuestas en la vida diaria.', '7': 'Diseño y construcción de máquinas simples (Laboratorio).' },
            '2': { '1': 'Energía mecánica y su transformación cualitativa.', '3': 'Relación entre trabajo mecánico y energía.', '5': 'Conservación de la energía en diferentes situaciones.', '7': 'Cuantificación de la transformación energética.' },
            '3': { '1': 'Energía interna, temperatura y calor.', '3': 'Primera ley de la termodinámica.', '5': 'Segunda ley de la termodinámica.', '7': 'Aplicación de leyes en motores térmicos y refrigeradores.' },
            '4': { '1': 'Variables termodinámicas: Presión, Volumen y Temperatura.', '3': 'Leyes de Boyle, Charles y Gay-Lussac.', '5': 'Ecuación de estado de los gases ideales.', '7': 'Dinámica de fluidos y eventos cotidianos (globos aerostáticos).' }
        }
    },
    '9': {
        objetivo: 'Analizar cargas eléctricas, circuitos, ondas mecánicas y fenómenos ópticos.',
        periodos: {
            '1': { '1': 'Naturaleza de la carga eléctrica y métodos de electrización.', '3': 'Ley de Coulomb.', '5': 'Concepto de Campo Eléctrico.', '7': 'Potencial Eléctrico y su aplicación.' },
            '2': { '1': 'Corriente eléctrica, voltaje y resistencia.', '3': 'Ley de Ohm.', '5': 'Circuitos en serie y paralelo.', '7': 'Resolución de circuitos y modelos prácticos.' },
            '3': { '1': 'Características de las ondas mecánicas.', '3': 'Frecuencia, longitud de onda y velocidad.', '5': 'Reflexión, refracción y difracción.', '7': 'El sonido como onda mecánica y sus propiedades.' },
            '4': { '1': 'Naturaleza de la luz y el espectro electromagnético.', '3': 'Reflexión y espejos.', '5': 'Refracción y lentes.', '7': 'Aplicaciones ópticas en la vida cotidiana.' }
        }
    },
    '10': {
        objetivo: 'Profundizar en el modelado matemático del movimiento y las condiciones de equilibrio de los cuerpos.',
        periodos: {
            '1': { '1': 'Sistemas de referencia inerciales.', '3': 'Movimiento Rectilíneo Uniforme (MRU).', '5': 'Movimiento Rectilíneo Uniformemente Variado (MRUV).', '7': 'Análisis matemático y gráfico de la cinemática.' },
            '2': { '1': 'Vectores avanzados y sus componentes.', '3': 'Tiro parabólico y ecuaciones de trayectoria.', '5': 'Dinámica del movimiento circular.', '7': 'Aplicación de conocimientos en situaciones del entorno.' },
            '3': { '1': 'Concepto de Fuerza e Inercia (Primera Ley).', '3': 'Relación entre Fuerza, Masa y Aceleración (Segunda Ley).', '5': 'Acción y Reacción (Tercera Ley).', '7': 'Fricción y fuerzas en planos inclinados.' },
            '4': { '1': 'Fuerzas coplanares y concurrentes.', '3': 'Equilibrio de traslación.', '5': 'Torque y momento de fuerza.', '7': 'Equilibrio de rotación y equilibrio estático total.' }
        }
    },
    '11': {
        objetivo: 'Consolidar competencias ICFES a través de la integración de toda la física.',
        periodos: {
            '1': { '1': 'Repaso integrador de Cinemática y Dinámica.', '3': 'Trabajo, Potencia y Energía.', '5': 'Conservación del momento lineal.', '7': 'Preparación pruebas SABER 11 (Mecánica Clásica).' },
            '2': { '1': 'Estática y dinámica de fluidos.', '3': 'Calorimetría y cambios de fase.', '5': 'Procesos termodinámicos avanzados.', '7': 'Preparación pruebas SABER 11 (Eventos termodinámicos).' },
            '3': { '1': 'Electrodinámica avanzada.', '3': 'Magnetismo e inducción electromagnética.', '5': 'Física moderna básica y óptica física.', '7': 'Preparación pruebas SABER 11 (Eventos electromagnéticos).' },
            '4': { '1': 'Planteamiento de un problema de investigación física.', '3': 'Diseño y construcción de un prototipo o experimento.', '5': 'Análisis de datos y evaluación de hipótesis.', '7': 'Presentación del proyecto final (Feria de la Ciencia).' }
        }
    }
};

window.gradoActualPlaneacion = null;


window.actualizarVisualizadorPlaneacion = function() {
    const selectorAsignatura = document.getElementById('select-planeacion-asignatura');
    const visualizador = document.getElementById('planeacion-contenido-actual');
    
    if (!visualizador || !window.gradoActualPlaneacion) return;

    const gradoSeleccionado = window.gradoActualPlaneacion;

    const gradoNum = gradoSeleccionado.replace(/[^0-9PENS]/g, '');
    let asignatura = selectorAsignatura ? selectorAsignatura.value : 'Física';
    
    let malla = null;

    if (asignatura.toLowerCase().includes('física')) {
        malla = window.mallaFisica;
    } else if (asignatura.toLowerCase().includes('matemática') || asignatura.toLowerCase().includes('matematica')) {
        malla = window.mallaMatematicas;
    } else if (asignatura.toLowerCase().includes('naturales')) {
        malla = window.mallaNaturales;
    } else if (asignatura.toLowerCase().includes('sociales')) {
        malla = window.mallaSociales;
    } else if (asignatura.toLowerCase().includes('castellano') || asignatura.toLowerCase().includes('humanidades')) {
        malla = window.mallaCastellano;

        malla = window.mallaFisica;
    } else if (asignatura.toLowerCase().includes('turismo')) {
        malla = window.mallaTurismo;
    } else if (asignatura.toLowerCase().includes('artística') || asignatura.toLowerCase().includes('música') || asignatura.toLowerCase().includes('artistica')) {
        malla = window.mallaArtistica;
    } else if (asignatura.toLowerCase().includes('ética') || asignatura.toLowerCase().includes('etica')) {
        malla = window.mallaEtica;
    }

    const dataGrado = malla ? malla[gradoNum] : null;

    if (!dataGrado) {
        visualizador.innerHTML = `<p style="color: #6B7280; font-style: italic; margin: 0;">Planeación en construcción para la materia de ${asignatura} en este grado.</p>`;
        visualizador.style.display = 'block';
        return;
    }

    const periodo = document.getElementById('select-planeacion-periodo').value;
    const semanaStr = document.getElementById('select-planeacion-semana').value;
    const semanaNum = parseInt(semanaStr, 10);
    
    let indexTema = '1';
    if (semanaNum >= 3 && semanaNum <= 4) indexTema = '3';
    else if (semanaNum >= 5 && semanaNum <= 6) indexTema = '5';
    else if (semanaNum >= 7 && semanaNum <= 8) indexTema = '7';

    const objetivo = dataGrado.objetivo;
    const tema = dataGrado.periodos[periodo] ? dataGrado.periodos[periodo][indexTema] : 'Sin tema definido';

    const subTema = (semanaNum % 2 !== 0) 
        ? "Conceptos básicos e introducción a: " + tema.toLowerCase()
        : "Profundización, práctica y aplicación de: " + tema.toLowerCase();

    visualizador.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Meta de Comprensión del Año (${asignatura}):</strong>
            <p style="margin: 4px 0 0 0; color: #374151; font-size: 0.9rem;">${objetivo}</p>
        </div>
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Tópico Generativo (Bloque Quincenal):</strong>
            <p style="margin: 4px 0 0 0; color: #4B5563; font-size: 0.95rem;">${tema}</p>
        </div>
        <div>
            <strong style="color: #10B981; font-size: 0.95rem;">Tema Específico (Semana ${semanaNum}):</strong>
            <p style="margin: 4px 0 0 0; color: #111827; font-weight: bold; font-size: 1rem;">${subTema}</p>
        </div>
    `;
    visualizador.style.display = 'block';
};
// --- FIN MALLA CURRICULAR FÍSICA ---

window.abrirGrupo = function(grupoName) {
    document.getElementById('admin-grupos-container').style.display = 'none';
    document.getElementById('admin-estudiantes-grupo-container').style.display = 'block';
    if(typeof pushSubView === 'function') pushSubView();
    document.getElementById('admin-titulo-grupo-actual').textContent = 'Grupo: ' + grupoName;

    // Inicializar planeacion
    window.gradoActualPlaneacion = grupoName;
    const contPlaneacion = document.getElementById('visualizador-planeacion-container');
    if (contPlaneacion) {
        contPlaneacion.style.display = 'block';
        document.getElementById('select-planeacion-periodo').value = '3';
        document.getElementById('select-planeacion-semana').value = '1';
        actualizarVisualizadorPlaneacion();
    }

    // Mostrar materias del grupo de inmediato
    const materiasDiv = document.getElementById('admin-materias-grupo-actual');
    const selectAsig = document.getElementById('select-planeacion-asignatura');
    let mat = [];
    if (materiasDiv) {
        mat = obtenerMateriasPorGrupo(grupoName);
        let tagsHTML = mat.map(m => `
            <div style="background: #E0E7FF; color: #4338CA; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 0.9rem; display: inline-block; margin-right: 10px; margin-bottom: 10px;">
                📚 ${m.nombre} (${m.horas})
            </div>
        `).join('');
        materiasDiv.innerHTML = `
            <div style="background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <h5 style="margin: 0 0 10px 0; font-size: 1rem; color: #374151;">Asignaturas del Grado:</h5>
                ${tagsHTML}
            </div>
        `;
    }
    
    if (selectAsig) {
        selectAsig.innerHTML = '';
        mat.forEach(m => {
            selectAsig.innerHTML += `<option value="${m.nombre}">${m.nombre}</option>`;
        });
        if (mat.length > 0) {
            selectAsig.style.display = 'inline-block';
        } else {
            selectAsig.style.display = 'none';
        }
    }

    const tbodyEst = document.getElementById('tbody-admin-estudiantes-por-grupo');
    const estFiltrados = window.todosEstudiantes.filter(e => (e.grupo || 'Sin asignar') === grupoName);

    tbodyEst.innerHTML = '';
    estFiltrados.forEach(est => {
        // Progreso aleatorio para la demostración
        const progreso = Math.floor(Math.random() * 60) + 40; 
        
        tbodyEst.innerHTML += `
        <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 15px;">${est.documento || ''}</td>
            <td style="padding: 15px; font-weight: bold;">${est.nombre || ''} ${est.apellidos || ''}</td>
            <td style="padding: 15px;">${est.grado || ''}°</td>
            <td style="padding: 15px;">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    ${obtenerMateriasPorGrupo(grupoName).map(m => `
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #F3F4F6; padding: 4px 8px; border-radius: 4px;">
                            <span style="font-size: 0.85rem; font-weight: bold; color: #374151;">${m.nombre} (${m.horas})</span>
                            <span style="font-size: 0.75rem; color: ${m.color}; font-weight: bold;">${m.estado}</span>
                        </div>
                    `).join('')}
                </div>
            </td>
            <td style="padding: 15px; text-align: center;">
                    <button onclick="verInformeEstudiante('${est.nombre || ''} ${est.apellidos || ''}', ${progreso}, '${grupoName}', '${est.documento}')" style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px;" title="Ver Informe">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Informe
                    </button>
                    <button onclick="eliminarEstudiante('${est.documento}')" style="background: #EF4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px;" title="Eliminar">
                        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </td>
        </tr>`;
    });
};

window.volverAGrupos = function() {
    document.getElementById('admin-grupos-container').style.display = 'grid';
    document.getElementById('admin-estudiantes-grupo-container').style.display = 'none';
};

window.verInformeEstudiante = function(nombre, progreso, grupoName, documento) {
    document.getElementById('informe-nombre-estudiante').textContent = 'Informe: ' + nombre + ' (' + (grupoName || 'Sin Grupo') + ')';
    
    // Mapping of group to subjects based on the provided schedule
    let materiasHTML = '';
    let materias = obtenerMateriasPorGrupo(grupoName);
    
    materias.forEach(m => {
        let guiasHtml = '';
        if (documento) {
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (key.startsWith(`config_${documento}_${m.nombre}`)) {
                    let p = key.match(/_p(\d+)_/);
                    let s = key.match(/_s(\d+)$/);
                    let per = p ? p[1] : '?';
                    let sem = s ? s[1] : '?';
                    guiasHtml += `<button onclick="abrirGuiaProfesor('${key}')" style="margin-top: 5px; margin-right: 5px; background:#10B981; color:white; border:none; border-radius:4px; font-size:0.75rem; padding:4px 8px; cursor:pointer;">P${per} S${sem}</button>`;
                }
            }
        }
        
        materiasHTML += `
            <li style="display: flex; flex-direction: column; padding: 10px 0; border-bottom: 1px solid #E5E7EB;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="font-weight: bold;">${m.nombre} (${m.horas})</span>
                    <span style="color: ${m.color}; font-weight: bold;">${m.estado}</span>
                </div>
                ${guiasHtml ? `<div style="margin-top: 5px; display: flex; flex-wrap: wrap;">Guías: ${guiasHtml}</div>` : ''}
            </li>
        `;
    });

    document.getElementById('informe-contenido').innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4 style="font-weight: 800; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-bottom: 15px;">Resumen de Actividad</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: #F3F4F6; padding: 15px; border-radius: 8px;">
                    <div style="color: #6B7280; font-size: 0.85rem; font-weight: bold; text-transform: uppercase;">Progreso Total</div>
                    <div style="font-size: 1.5rem; font-weight: 900; color: #10B981;">${progreso}%</div>
                </div>
                <div style="background: #F3F4F6; padding: 15px; border-radius: 8px;">
                    <div style="color: #6B7280; font-size: 0.85rem; font-weight: bold; text-transform: uppercase;">Materias Asignadas</div>
                    <div style="font-size: 1.5rem; font-weight: 900; color: #3B82F6;">${materias.length}</div>
                </div>
            </div>
        </div>
        <div>
            <h4 style="font-weight: 800; border-bottom: 2px solid #E5E7EB; padding-bottom: 10px; margin-bottom: 15px;">Materias Matriculadas</h4>
            <ul style="list-style: none; padding: 0; margin: 0;">
                ${materiasHTML}
            </ul>
        </div>
    `;
    
    document.getElementById('modal-informe-estudiante').style.display = 'flex';
    if(typeof pushSubView === 'function') pushSubView();
};

window.abrirGuiaProfesor = async function(key) {
    const configStr = localStorage.getItem(key);
    if (!configStr) return alert("Configuración no encontrada");
    const payload = JSON.parse(configStr);
    
    const fileNameSafe = [payload.asignatura, payload.periodo, payload.semana, payload.rol, payload.ambiente, payload.nivel, payload.enfoque]
        .map(s => s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '_') : 'na')
        .join('_') + '.json';

    try {
        const response = await fetch('guias_cache/' + fileNameSafe);
        if (!response.ok) return alert("Guía no encontrada en caché: " + fileNameSafe);
        
        const guideData = await response.json();
        
        // Cargar vista de profesor
        window.isTeacherView = true;
        
        // Simular variables que necesita la UI de estudiante
        document.getElementById("admin-dashboard-container").style.display = "none";
        document.getElementById("student-dashboard-container").style.display = "block";
        document.getElementById("student-quest-container").style.display = "none";
        document.getElementById("student-guide-content").style.display = "block";
        
        const innerContent = document.getElementById("student-guide-inner-content");
        innerContent.innerHTML = "<p>Cargando vista de profesor...</p>";
        
        // Llamar a ingresarAGuia mockeando el comportamiento
        window.guiaActualAsignatura = payload.asignatura;
        window.guiaActualPeriodo = payload.periodo;
        document.getElementById('student-select-semana').value = payload.semana;
        document.getElementById('student-select-periodo').value = payload.periodo;
        
        // Simular una llamada directa para renderizar (usaremos una copia adaptada de la lógica de ingresarAGuia)
        renderizarGuiaProfesor(guideData, payload.asignatura, payload.periodo, payload.semana);
        
    } catch (e) {
        console.error(e);
        alert("Error cargando la guía");
    }
};

function renderizarGuiaProfesor(guideData, asignatura, periodo, semanaStr) {
    const innerContent = document.getElementById("student-guide-inner-content");
    window.guideDataCache = guideData;
    
    let htmlRenderizado = `
        <div style="text-align: center; margin-bottom: 20px; background: #FEF3C7; padding: 10px; border-radius: 8px; border: 2px solid #F59E0B;">
            <h3 style="color: #D97706; font-weight: 900; margin: 0;">👨‍🏫 VISTA DE PROFESOR</h3>
            <p style="color: #92400E; margin: 5px 0 0 0;">Visualizando guía exacta generada por el estudiante.</p>
            <button onclick="cerrarGuiaProfesor()" style="margin-top: 10px; background: #EF4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">Cerrar Vista Profesor</button>
        </div>
        <div class="mega-guide-container" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #E5E7EB; font-family: 'Inter', sans-serif;">
    `;
    
    if (guideData.saberes_previos) {
        htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 0;">🧠 Saberes Previos</h4>`;
        htmlRenderizado += `<div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">`;
        guideData.saberes_previos.forEach((pregunta, idx) => {
            htmlRenderizado += `
                <div style="margin-bottom: 15px;">
                    <p style="font-weight: bold;">${idx+1}. ${pregunta.pregunta}</p>
                    ${pregunta.opciones.map((opcion, i) => `
                        <label style="display: block; margin-bottom: 8px; padding: 10px; background: ${i === pregunta.correcta ? '#10B981' : 'white'}; border: 1px solid #D1D5DB; border-radius: 6px; ${i === pregunta.correcta ? 'color: white; font-weight: bold;' : ''}">
                            <input type="radio" disabled ${i === pregunta.correcta ? 'checked' : ''} style="margin-right: 10px;">
                            ${opcion} ${i === pregunta.correcta ? '✅' : ''}
                        </label>
                    `).join('')}
                </div>
            `;
        });
        htmlRenderizado += `</div>`;
    }
    
    if (guideData.texto_inductivo) {
        htmlRenderizado += `<h4 style="color: #4F46E5;">📖 Texto Inductivo</h4>`;
        htmlRenderizado += `<div class="markdown-body" style="font-size: 1.1rem; line-height: 1.6; color: #374151;">${window.procesarJuegosEnTexto(guideData.texto_inductivo)}</div>`;
    }

    if (guideData.recurso_visual) {
        htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">📊 Recurso Visual</h4>`;
        if (guideData.recurso_visual.includes('graph TD') || guideData.recurso_visual.includes('graph LR') || guideData.recurso_visual.includes('pie') || guideData.recurso_visual.includes('flowchart')) {
            let cleanMermaid = guideData.recurso_visual.replace(/```mermaid/g, '').replace(/```/g, '').trim();
            htmlRenderizado += `<div class="mermaid" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; overflow-x: auto;">${cleanMermaid}</div>`;
        } else {
            htmlRenderizado += `<div class="markdown-body" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; overflow-x: auto;">${marked.parse(guideData.recurso_visual)}</div>`;
        }
    }
    
    if (guideData.preguntas_inductivas_pagina) {
        htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">✍️ Preguntas de Análisis</h4>`;
        htmlRenderizado += `<div style="background: #F8FAFC; padding: 20px; border: 1px dashed #94A3B8; border-radius: 8px; margin-bottom: 20px;">`;
        guideData.preguntas_inductivas_pagina.forEach((p, i) => {
            let textoPreg = typeof p === 'string' ? p : p.pregunta;
            let resEsp = typeof p === 'string' ? '' : p.respuesta_esperada;
            htmlRenderizado += `
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; color: #1E293B; display: block; margin-bottom: 8px;">${i+1}. ${textoPreg}</label>
                    <textarea disabled rows="3" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #CBD5E1; background: #F1F5F9;"></textarea>
                    ${resEsp ? `<div style="margin-top: 5px; padding: 10px; background: #ECFDF5; border: 1px solid #10B981; border-radius: 6px; font-size: 0.9rem;"><strong style="color: #047857;">💡 Respuesta Esperada:</strong> ${resEsp}</div>` : ''}
                </div>
            `;
        });
        htmlRenderizado += `</div>`;
    }
    
    if (guideData.texto_deductivo) {
        htmlRenderizado += `<h4 style="color: #4F46E5;">🔍 Texto Deductivo</h4>`;
        htmlRenderizado += `<div class="markdown-body" style="font-size: 1.1rem; line-height: 1.6; color: #374151;">${window.procesarJuegosEnTexto(guideData.texto_deductivo)}</div>`;
    }
    
    if (guideData.preguntas_deductivas_pagina) {
        htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">✍️ Preguntas Deductivas</h4>`;
        htmlRenderizado += `<div style="background: #F8FAFC; padding: 20px; border: 1px dashed #94A3B8; border-radius: 8px; margin-bottom: 20px;">`;
        guideData.preguntas_deductivas_pagina.forEach((p, i) => {
            let textoPreg = typeof p === 'string' ? p : p.pregunta;
            let resEsp = typeof p === 'string' ? '' : p.respuesta_esperada;
            htmlRenderizado += `
                <div style="margin-bottom: 15px;">
                    <label style="font-weight: bold; color: #1E293B; display: block; margin-bottom: 8px;">${i+1}. ${textoPreg}</label>
                    <textarea disabled rows="3" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #CBD5E1; background: #F1F5F9;"></textarea>
                    ${resEsp ? `<div style="margin-top: 5px; padding: 10px; background: #ECFDF5; border: 1px solid #10B981; border-radius: 6px; font-size: 0.9rem;"><strong style="color: #047857;">💡 Respuesta Esperada:</strong> ${resEsp}</div>` : ''}
                </div>
            `;
        });
        htmlRenderizado += `</div>`;
    }
    
    htmlRenderizado += `</div>`;
    innerContent.innerHTML = htmlRenderizado;\n    if(window.renderizarBloquesEspeciales) window.renderizarBloquesEspeciales(innerContent);
    
    setTimeout(() => {
        if (window.juegosPendientes && window.juegosPendientes.length > 0) {
            window.juegosPendientes.forEach(j => j());
            window.juegosPendientes = [];
        }
    }, 200);
    
    if (window.MathJax) {
        window.MathJax.typesetPromise().catch((err) => console.log('MathJax error: ', err));
    }
}

window.cerrarGuiaProfesor = function() {
    window.isTeacherView = false;
    document.getElementById("student-dashboard-container").style.display = "none";
    document.getElementById("student-guide-content").style.display = "none";
    document.getElementById("admin-dashboard-container").style.display = "block";
};

function normalizar(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor).replace('°', '').trim().toLowerCase();
}

// Mantener lógica de mallas original (filtrarContenido, etc) que el usuario tenía
// ...


// ==========================================
// LÓGICA DEL PANEL ESTUDIANTE (GAMIFICACIÓN)
// ==========================================

window.aplicarRestriccionesProgreso = function() {
    const periodo = document.getElementById("student-select-periodo").value;
    const subjectTitle = document.getElementById('student-subject-title');
    if (!subjectTitle) return;
    const asignatura = subjectTitle.innerText.replace('Aula de ', '').trim();
    
    const key = `prog_${window.usuario_actual || 'default'}_${asignatura}_p${periodo}`;
    let maxSemanaUnlocked = parseInt(localStorage.getItem(key)) || 1; if (window.rol_actual === "admin" || window.rol_actual === "docente") { maxSemanaUnlocked = 8; }
    
    const selectSemana = document.getElementById("student-select-semana");
    if (!selectSemana) return;
    
    Array.from(selectSemana.options).forEach((opt) => {
        const num = parseInt(opt.value);
        if (num > maxSemanaUnlocked) {
            opt.disabled = true;
            opt.text = `Semana ${num} (Bloqueada 🔒)`;
        } else {
            opt.disabled = false;
            opt.text = `Semana ${num}`;
        }
    });
    
    // Si la seleccionada actualmente está bloqueada, volver a la maxima permitida
    if (parseInt(selectSemana.value) > maxSemanaUnlocked) {
        selectSemana.value = maxSemanaUnlocked;
    }
};

window.completarMisionActual = function() {
    const periodo = document.getElementById("student-select-periodo").value;
    const semanaStr = document.getElementById("student-select-semana").value;
    const subjectTitle = document.getElementById('student-subject-title');
    if (!subjectTitle) return;
    const asignatura = subjectTitle.innerText.replace('Aula de ', '').trim();
    
    const key = `prog_${window.usuario_actual || 'default'}_${asignatura}_p${periodo}`;
    let maxSemanaUnlocked = parseInt(localStorage.getItem(key)) || 1; if (window.rol_actual === "admin" || window.rol_actual === "docente") { maxSemanaUnlocked = 8; }
    let semanaActual = parseInt(semanaStr);
    
    if (semanaActual === maxSemanaUnlocked) {
        if (maxSemanaUnlocked < 8) {
            localStorage.setItem(key, maxSemanaUnlocked + 1);
            alert("¡Felicidades! Has completado esta misión y desbloqueado la siguiente semana.");
        } else {
            alert("¡Increíble! Has completado todas las misiones de este periodo.");
        }
    } else {
        alert("¡Misión repasada con éxito!");
    }
    
    cerrarGuia();
};

window.actualizarPlaneacionEstudiante = function() {
    aplicarRestriccionesProgreso();
    const contenido = document.getElementById('student-planeacion-contenido');
    const subjectTitle = document.getElementById('student-subject-title');
    
    if (!contenido || !window.gradoActualEstudiante || !subjectTitle) return;

    const gradoNum = window.gradoActualEstudiante.replace(/[^0-9PENS]/g, '');
    let asignatura = subjectTitle.innerText.replace('Aula de ', '').trim();
    
    let malla = null;

    if (asignatura.toLowerCase().includes('física')) {
        malla = window.mallaFisica;
    } else if (asignatura.toLowerCase().includes('matemática') || asignatura.toLowerCase().includes('matematica')) {
        malla = window.mallaMatematicas;
    } else if (asignatura.toLowerCase().includes('naturales')) {
        malla = window.mallaNaturales;
    } else if (asignatura.toLowerCase().includes('sociales')) {
        malla = window.mallaSociales;
    } else if (asignatura.toLowerCase().includes('castellano') || asignatura.toLowerCase().includes('humanidades')) {
        malla = window.mallaCastellano;

        malla = window.mallaFisica;
    } else if (asignatura.toLowerCase().includes('turismo')) {
        malla = window.mallaTurismo;
    } else if (asignatura.toLowerCase().includes('artística') || asignatura.toLowerCase().includes('música') || asignatura.toLowerCase().includes('artistica')) {
        malla = window.mallaArtistica;
    } else if (asignatura.toLowerCase().includes('ética') || asignatura.toLowerCase().includes('etica')) {
        malla = window.mallaEtica;
    }

    const dataGrado = malla ? malla[gradoNum] : null;

    if (!dataGrado) {
        contenido.innerHTML = `<p style="color: #6B7280; font-style: italic; margin: 0;">Planeación en construcción para la materia de ${asignatura} en este grado.</p>`;
        contenido.style.display = 'block';
        return;
    }

    const periodo = document.getElementById('student-select-periodo').value;
    const semanaStr = document.getElementById('student-select-semana').value;
    const semanaNum = parseInt(semanaStr, 10);
    
    // Mapear semana 1-8 al bloque de temas '1', '3', '5', '7'
    let indexTema = '1';
    if (semanaNum >= 3 && semanaNum <= 4) indexTema = '3';
    else if (semanaNum >= 5 && semanaNum <= 6) indexTema = '5';
    else if (semanaNum >= 7 && semanaNum <= 8) indexTema = '7';

    const objetivo = dataGrado.objetivo;
    const tema = dataGrado.periodos[periodo] ? dataGrado.periodos[periodo][indexTema] : 'Sin tema definido';

    const subTema = (semanaNum % 2 !== 0) 
        ? "Conceptos básicos e introducción a: " + tema.toLowerCase()
        : "Profundización, práctica y aplicación de: " + tema.toLowerCase();

    contenido.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Meta de Comprensión del Año:</strong>
            <p style="margin: 4px 0 0 0; color: #374151; font-size: 0.9rem;">${objetivo}</p>
        </div>
        <div style="margin-bottom: 10px;">
            <strong style="color: #1E3A8A; font-size: 0.95rem;">Tópico Generativo (Bloque Quincenal):</strong>
            <p style="margin: 4px 0 0 0; color: #4B5563; font-size: 0.95rem;">${tema}</p>
        </div>
        <div>
            <strong style="color: #10B981; font-size: 0.95rem;">Tema Específico (Semana ${semanaNum}):</strong>
            <p style="margin: 4px 0 0 0; color: #111827; font-weight: bold; font-size: 1rem;">${subTema}</p>
        </div>
    `;
    contenido.style.display = 'block';
};

window.abrirAsignaturaEstudiante = function(asig, grado) {
    window.gradoActualEstudiante = grado;
    const mainContent = document.getElementById("student-main-content");
    const subjectView = document.getElementById("student-subject-view-container");
    const subjectTitle = document.getElementById("student-subject-title");
    const questContainer = document.getElementById("student-quest-container");
    const guideContent = document.getElementById("student-guide-content");
    
    if (mainContent && subjectView) {
        mainContent.style.display = "none";
        subjectView.style.display = "block";
        if(typeof pushSubView === 'function') pushSubView();
    }
    
    if (subjectTitle) {
        subjectTitle.innerText = "Aula de " + asig;
    }
    
    // Reset questionnaire
    document.getElementById("student-select-periodo").value = "3";
    document.getElementById("student-select-semana").value = "1";
    document.getElementById("student-quest-rol").value = "";
    document.getElementById("student-quest-ambiente").value = "";
    document.getElementById("student-quest-nivel").value = "";
    document.getElementById("student-quest-enfoque").value = "";
    
    // Show questionnaire, hide guide
    if (questContainer) questContainer.style.display = "block";
    if (guideContent) guideContent.style.display = "none";
    
    aplicarRestriccionesProgreso();
    actualizarPlaneacionEstudiante();
};

window.volverAlGridEstudiante = function() {
    const mainContent = document.getElementById("student-main-content");
    const subjectView = document.getElementById("student-subject-view-container");
    
    if (mainContent && subjectView) {
        mainContent.style.display = "block";
        subjectView.style.display = "none";
    }
};

window.procesarJuegosEnTexto = function(textoMarkdown) {
    if (!textoMarkdown) return "";
    let html = marked.parse(textoMarkdown);
    
    // Buscar [JUEGO:TIPO:DATOS]
    const regex = /\[JUEGO:(ORDENAR_LETRAS|ORDENAR_FRASE|SOPA_LETRAS|CRUCIGRAMA):(.*?)\]/g;
    html = html.replace(regex, (match, tipo, datos) => {
        let uniqueId = 'juego_' + Math.random().toString(36).substr(2, 9);
        if (tipo === 'ORDENAR_LETRAS') {
            return `<div class="juego-incrustado" style="background:#F0FDF4; border:2px dashed #22C55E; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#166534; margin-top:0;">🧩 Minijuego: Ordenar Letras</h5>
                ${window.renderizarJuegoOrdenar(datos.split(''), 'letras')}
            </div>`;
        } else if (tipo === 'ORDENAR_FRASE') {
            let palabras = datos.split(' ');
            return `<div class="juego-incrustado" style="background:#EFF6FF; border:2px dashed #3B82F6; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#1E3A8A; margin-top:0;">🧩 Minijuego: Ordenar Frase</h5>
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
    
    return html;
};

window.ingresarAGuia = async function() {
    window.juegosPendientes = [];
    const rolElem = document.getElementById("student-quest-rol");
    const ambienteElem = document.getElementById("student-quest-ambiente");
    const nivelElem = document.getElementById("student-quest-nivel");
    const enfoqueElem = document.getElementById("student-quest-enfoque");
    
    if (!rolElem.value || !ambienteElem.value || !nivelElem.value || !enfoqueElem.value) {
        alert("¡Por favor completa todos los menús para personalizar tu aventura!");
        return;
    }
    
    const periodo = document.getElementById("student-select-periodo").value;
    const semanaStr = document.getElementById("student-select-semana").value;
    const asignatura = document.getElementById('student-subject-title').innerText.replace('Aula de ', '').trim();
    
    const questContainer = document.getElementById("student-quest-container");
    const guideContent = document.getElementById("student-guide-content");
    const innerContent = document.getElementById("student-guide-inner-content");
    
    if (questContainer) questContainer.style.display = "none";
    if (guideContent) {
        guideContent.style.display = "block";
        if(typeof pushSubView === 'function') pushSubView();
    }
    
    // Obtener la meta y el tópico de la malla
    const gradoNum = window.gradoActualEstudiante.replace(/[^0-9PENS]/g, '');
    let malla = null;
    if (asignatura.toLowerCase().includes('física')) malla = window.mallaFisica;
    else if (asignatura.toLowerCase().includes('matemática') || asignatura.toLowerCase().includes('matematica')) malla = window.mallaMatematicas;
    else if (asignatura.toLowerCase().includes('naturales')) malla = window.mallaNaturales;
    else if (asignatura.toLowerCase().includes('sociales')) malla = window.mallaSociales;
    else if (asignatura.toLowerCase().includes('castellano') || asignatura.toLowerCase().includes('humanidades')) malla = window.mallaCastellano;

    else if (asignatura.toLowerCase().includes('turismo')) malla = window.mallaTurismo;
    else if (asignatura.toLowerCase().includes('artística') || asignatura.toLowerCase().includes('música') || asignatura.toLowerCase().includes('artistica')) malla = window.mallaArtistica;
    else if (asignatura.toLowerCase().includes('ética') || asignatura.toLowerCase().includes('etica')) malla = window.mallaEtica;
    
    let meta = "Aprender los conceptos básicos";
    let topico = "Introducción a la materia";
    
    if (malla && malla[gradoNum]) {
        meta = malla[gradoNum].objetivo;
        const semanaNum = parseInt(semanaStr, 10);
        let indexTema = '1';
        if (semanaNum >= 3 && semanaNum <= 4) indexTema = '3';
        else if (semanaNum >= 5 && semanaNum <= 6) indexTema = '5';
        else if (semanaNum >= 7 && semanaNum <= 8) indexTema = '7';
        if (malla[gradoNum].periodos[periodo]) {
            topico = malla[gradoNum].periodos[periodo][indexTema] || topico;
        }
    }
    
    // Mostrar UI de carga
    if (innerContent) {
        innerContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #1D4ED8; font-weight: 800; font-size: 1.5rem;">🎮 Misión Inicializada</h3>
                <p style="color: #6B7280;">Periodo ${periodo} - Semana ${semanaStr} | ${asignatura}</p>
            </div>
            <div style="text-align: center; padding: 40px;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #E5E7EB; border-top-color: #3B82F6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
                <h3 style="margin-top: 20px; color: #3B82F6;">Generando tu aventura...</h3>
                <p style="color: #6B7280;">La Inteligencia Artificial está tejiendo tu misión, por favor espera unos segundos.</p>
            </div>
        `;
    }
    
    // Petición al caché local (Archivos JSON estáticos)
    try {
        const payload = {
            asignatura,
            periodo,
            semana: semanaStr,
            meta,
            topico,
            rol: rolElem.options[rolElem.selectedIndex].text,
            ambiente: ambienteElem.options[ambienteElem.selectedIndex].text,
            nivel: nivelElem.options[nivelElem.selectedIndex].text,
            enfoque: enfoqueElem.options[enfoqueElem.selectedIndex].text
        };
        
        const fileNameSafe = [payload.asignatura, payload.periodo, payload.semana, payload.rol, payload.ambiente, payload.nivel, payload.enfoque]
            .map(s => s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '_') : 'na')
            .join('_') + '.json';

        const response = await fetch('guias_cache/' + fileNameSafe);
        
        if (!response.ok) {
            innerContent.innerHTML = `<div style="padding: 20px; background: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px; color: #B91C1C;"><strong>Guía no encontrada:</strong> La guía para esta configuración aún no ha sido generada o no está disponible localmente.</div>`;
            return;
        }
        
        let guideData;
        try {
            guideData = await response.json();
        } catch (e) {
            console.error("Error parseando JSON:", e);
            innerContent.innerHTML = `<div style="padding: 20px; background: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px; color: #B91C1C;"><strong>Error de formato:</strong> El archivo de la guía tiene un formato incorrecto.</div>`;
            return;
        }
        
        // Inicializar Sticky Header
        const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion'));
        if (user) {
            // Guardar configuración para el panel admin (Teacher View)
            const configKey = `config_${user.documento}_${asignatura}_p${periodo}_s${semanaStr}`;
            localStorage.setItem(configKey, JSON.stringify(payload));
            
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
                let disabled = idx === 0 ? '' : 'disabled style="opacity:0.5;"'; // Bloquear secuencial
                htmlRenderizado += `
                    <div class="pregunta-saberes" id="container_saber_${idx}" style="margin-bottom: 15px;" ${disabled}>
                        <p style="font-weight: bold;">${idx+1}. ${pregunta.pregunta}</p>
                        ${pregunta.opciones.map((opcion, i) => `
                            <label style="display: block; margin-bottom: 8px; cursor: pointer; padding: 10px; background: white; border: 1px solid #D1D5DB; border-radius: 6px;">
                                <input type="radio" name="saber_${idx}" value="${i}" data-correct="${pregunta.correcta}" style="margin-right: 10px;">
                                ${opcion}
                            </label>
                        `).join('')}
                        <button id="btn_saber_${idx}" onclick="verificarSaberIndividual(${idx})" style="background: #3B82F6; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px;">Verificar</button>
                    </div>
                `;
            });
            htmlRenderizado += `</div>`;
        }
        
        htmlRenderizado += `<div id="rest-of-guide-container">`;
        
        if (guideData.texto_inductivo) {
            htmlRenderizado += `<h4 style="color: #4F46E5;">📖 Exploración: Texto Inductivo</h4>`;
            htmlRenderizado += `<div class="markdown-body" style="font-size: 1.1rem; line-height: 1.6; color: #374151;">${window.procesarJuegosEnTexto(guideData.texto_inductivo)}</div>`;
        }

        if (guideData.recurso_visual) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">📊 Recurso Visual</h4>`;
            if (guideData.recurso_visual.includes('graph TD') || guideData.recurso_visual.includes('graph LR') || guideData.recurso_visual.includes('pie') || guideData.recurso_visual.includes('flowchart')) {
                // Es código mermaid
                let cleanMermaid = guideData.recurso_visual.replace(/```mermaid/g, '').replace(/```/g, '').trim();
                htmlRenderizado += `<div class="mermaid" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; overflow-x: auto;">${cleanMermaid}</div>`;
            } else {
                // Es markdown tabla o imagen
                htmlRenderizado += `<div class="markdown-body" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; overflow-x: auto;">${marked.parse(guideData.recurso_visual)}</div>`;
            }
        }
        
        // Anti-cheat inputs para las preguntas
        if (guideData.preguntas_inductivas_pagina) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">✍️ Preguntas de Análisis (No Copy-Paste)</h4>`;
            htmlRenderizado += `<div style="background: #F8FAFC; padding: 20px; border: 1px dashed #94A3B8; border-radius: 8px; margin-bottom: 20px;">`;
            guideData.preguntas_inductivas_pagina.forEach((p, i) => {
                let disabled = 'disabled style="opacity:0.5;"'; // Bloquear hasta que se active por código
                htmlRenderizado += `
                    <div class="pregunta-inductiva-pag" id="container_ind_pag_${i}" style="margin-bottom: 15px;" ${disabled}>
                        <label style="font-weight: bold; color: #1E293B; display: block; margin-bottom: 8px;">${i+1}. ${p}</label>
                        <textarea class="anti-cheat-textarea" id="textarea_ind_pag_${i}" data-qindex="${i}" rows="3" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #CBD5E1;" onpaste="return false;" ondrop="return false;" oninput="verificarEscrituraIA(this)"></textarea>
                        <div class="ai-warning" style="color: #EF4444; font-size: 0.9rem; font-weight: bold; display: none; margin-top: 5px;">⚠️ Se ha detectado velocidad de escritura anormal (Posible Copy-Paste / IA). Intenta escribir con tus propias palabras.</div>
                        <button id="btn_ind_pag_${i}" onclick="verificarInductivaPagina(${i})" style="background: #10B981; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px;">Validar Respuesta</button>
                    </div>
                `;
            });
            htmlRenderizado += `</div>`;
        }
        
        // Preguntas Cuaderno
        if (guideData.preguntas_inductivas_cuaderno) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">📓 Para desarrollar en el cuaderno</h4>`;
            htmlRenderizado += `<div id="cuaderno-container" style="background: #FFFBEB; padding: 20px; border: 1px dashed #F59E0B; border-radius: 8px; margin-bottom: 20px;">`;
            guideData.preguntas_inductivas_cuaderno.forEach((p, i) => {
                let disabled = 'disabled style="opacity:0.5;"';
                htmlRenderizado += `
                    <div class="pregunta-cuaderno" id="container_cuaderno_${i}" style="margin-bottom: 15px;" ${disabled}>
                        <p style="margin-bottom: 8px; color: #451A03; font-weight: bold;">${i+1}. ${p}</p>
                        <button id="btn_cuaderno_${i}" onclick="verificarCuadernoIndividual(${i})" style="background: #F59E0B; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">✔️ Lo resolví en mi cuaderno</button>
                    </div>
                `;
            });
            htmlRenderizado += `</div>`;
        }
        
        // --- FASE DEDUCTIVA ---
        if (guideData.texto_deductivo) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 30px;">📖 Síntesis: Texto Deductivo</h4>`;
            htmlRenderizado += `<div class="markdown-body" style="font-size: 1.1rem; line-height: 1.6; color: #374151;">${window.procesarJuegosEnTexto(guideData.texto_deductivo)}</div>`;
        }

        if (guideData.preguntas_deductivas_pagina) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">✍️ Preguntas de Síntesis (No Copy-Paste)</h4>`;
            htmlRenderizado += `<div style="background: #F8FAFC; padding: 20px; border: 1px dashed #94A3B8; border-radius: 8px; margin-bottom: 20px;">`;
            guideData.preguntas_deductivas_pagina.forEach((p, i) => {
                let disabled = 'disabled style="opacity:0.5;"'; // Bloquear hasta que se active por código
                htmlRenderizado += `
                    <div class="pregunta-deductiva-pag" id="container_ded_pag_${i}" style="margin-bottom: 15px;" ${disabled}>
                        <label style="font-weight: bold; color: #1E293B; display: block; margin-bottom: 8px;">${i+1}. ${p}</label>
                        <textarea class="anti-cheat-textarea" id="textarea_ded_pag_${i}" data-qindex="ded_${i}" rows="3" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #CBD5E1;" onpaste="return false;" ondrop="return false;" oninput="verificarEscrituraIA(this)"></textarea>
                        <div class="ai-warning" style="color: #EF4444; font-size: 0.9rem; font-weight: bold; display: none; margin-top: 5px;">⚠️ Se ha detectado velocidad de escritura anormal.</div>
                        <button id="btn_ded_pag_${i}" onclick="verificarDeductivaPagina(${i})" style="background: #10B981; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px;">Validar Respuesta</button>
                    </div>
                `;
            });
            htmlRenderizado += `</div>`;
        }

        if (guideData.preguntas_deductivas_cuaderno) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">📓 Para desarrollar en el cuaderno (Síntesis)</h4>`;
            htmlRenderizado += `<div id="cuaderno-ded-container" style="background: #FFFBEB; padding: 20px; border: 1px dashed #F59E0B; border-radius: 8px; margin-bottom: 20px;">`;
            guideData.preguntas_deductivas_cuaderno.forEach((p, i) => {
                let disabled = 'disabled style="opacity:0.5;"';
                htmlRenderizado += `
                    <div class="pregunta-cuaderno-ded" id="container_cuaderno_ded_${i}" style="margin-bottom: 15px;" ${disabled}>
                        <p style="margin-bottom: 8px; color: #451A03; font-weight: bold;">${i+1}. ${p}</p>
                        <button id="btn_cuaderno_ded_${i}" onclick="verificarCuadernoDeductivoIndividual(${i})" style="background: #F59E0B; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">✔️ Lo resolví en mi cuaderno</button>
                    </div>
                `;
            });
            htmlRenderizado += `</div>`;
        }

        htmlRenderizado += `<div style="text-align: center; margin-top: 30px; padding-bottom: 20px;">
                <button onclick="completarMisionActual()" style="background: #10B981; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: transform 0.2s;">✅ Completar Misión</button>
            </div>
        </div>`;

        innerContent.innerHTML = htmlRenderizado;\n    if(window.renderizarBloquesEspeciales) window.renderizarBloquesEspeciales(innerContent);
    
    setTimeout(() => {
        if (window.juegosPendientes && window.juegosPendientes.length > 0) {
            window.juegosPendientes.forEach(j => j());
            window.juegosPendientes = [];
        }
    }, 200);
        
        if (window.MathJax) {
            window.MathJax.typesetPromise().catch((err) => console.log('MathJax error: ', err));
        }
        if (window.juegosPendientes && window.juegosPendientes.length > 0) {
            setTimeout(() => {
                window.juegosPendientes.forEach(j => j());
                window.juegosPendientes = [];
            }, 200);
        }
        // Registrar avance de semana
        if (user) {
            const key = `prog_${user.documento}_${asignatura}_p${periodo}`;
            let prog = parseInt(localStorage.getItem(key)) || 1;
            if (parseInt(semanaStr) >= prog) {
                localStorage.setItem(key, (parseInt(semanaStr) + 1).toString());
            }
        }
        
    } catch (error) {
        console.error(error);
        innerContent.innerHTML = `<div style="padding: 20px; background: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px; color: #B91C1C;"><strong>Error de conexión:</strong> No se pudo conectar con el servidor central.</div>`;
    }
};

window.cerrarGuia = function() {
    const questContainer = document.getElementById("student-quest-container");
    const guideContent = document.getElementById("student-guide-content");
    if (questContainer) questContainer.style.display = "block";
    if (guideContent) guideContent.style.display = "none";
    aplicarRestriccionesProgreso();
    actualizarPlaneacionEstudiante();
};


// ==========================================
// RANKING Y GAMIFICACIÓN (ADMIN)
// ==========================================
window.abrirRankingGrupo = async function() {
    try {
        const modal = document.getElementById('modal-ranking-global');
        if (!modal) return;
        
        const tbody = document.getElementById('tabla-ranking-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; font-weight: bold; color: #6B7280;">Calculando puntajes... ⏳</td></tr>';
        }
        
                const subtitle = document.getElementById('ranking-modal-subtitle');
        if (subtitle && window.gradoActualPlaneacion) {
            subtitle.innerText = "Clasificación del Grupo: " + window.gradoActualPlaneacion;
        }
        modal.style.display = 'flex';
        
        // Fetch students
        const res = await fetch('/api/estudiantes');
        if (!res.ok) throw new Error("Error fetching estudiantes");
        let estudiantes = await res.json();
        
        // Filtrar por el grupo actual
        if (window.gradoActualPlaneacion) {
            estudiantes = estudiantes.filter(e => e.grupo === window.gradoActualPlaneacion);
        }
        
        // Calculate XP for each student
        const estudiantesConXP = estudiantes.map(est => {
            let xpTotal = 0;
            // Iterate over localStorage keys to find their progress
            const prefix = `prog_${est.documento}_`;
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k.startsWith(prefix)) {
                    let maxSemanaUnlocked = parseInt(localStorage.getItem(k));
                    if (!isNaN(maxSemanaUnlocked) && maxSemanaUnlocked > 1) {
                        xpTotal += (maxSemanaUnlocked - 1) * 100;
                    }
                }
            }
            return {
                ...est,
                xp: xpTotal
            };
        });
        
        // Sort descending by XP
        estudiantesConXP.sort((a, b) => b.xp - a.xp);
        
        // Render
        if (tbody) {
            tbody.innerHTML = '';
            if (estudiantesConXP.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #9CA3AF;">No hay estudiantes registrados</td></tr>';
                return;
            }
            
            estudiantesConXP.forEach((est, index) => {
                let medalla = '';
                let bgStyle = 'background: white; border: 1px solid transparent;';
                let nombreColor = '#374151';
                
                if (index === 0) {
                    medalla = '🥇';
                    bgStyle = 'background: linear-gradient(90deg, #FFFBEB, white); box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1); border-left: 4px solid #F59E0B; border-top: 1px solid #FDE68A; border-bottom: 1px solid #FDE68A; border-right: 1px solid #FDE68A;';
                    nombreColor = '#D97706';
                } else if (index === 1) {
                    medalla = '🥈';
                    bgStyle = 'background: linear-gradient(90deg, #F3F4F6, white); border-left: 4px solid #9CA3AF; border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB; border-right: 1px solid #E5E7EB;';
                } else if (index === 2) {
                    medalla = '🥉';
                    bgStyle = 'background: linear-gradient(90deg, #FEF3C7, white); border-left: 4px solid #B45309; border-top: 1px solid #FDE68A; border-bottom: 1px solid #FDE68A; border-right: 1px solid #FDE68A;';
                } else {
                    medalla = `${index + 1}`;
                    bgStyle = 'background: white; border-bottom: 1px solid #F3F4F6;';
                }
                
                const tr = document.createElement('tr');
                tr.style.transition = 'transform 0.2s';
                tr.onmouseover = () => { tr.style.transform = 'scale(1.01)'; };
                tr.onmouseout = () => { tr.style.transform = 'scale(1)'; };
                
                tr.innerHTML = `
                    <td style="${bgStyle} border-radius: 8px 0 0 8px; padding: 15px; text-align: center; font-size: 1.5rem; font-weight: 900; color: #9CA3AF;">${medalla}</td>
                    <td style="${bgStyle} padding: 15px; font-weight: bold; color: ${nombreColor}; font-size: 1.1rem;">
                        ${est.nombre} ${est.apellidos}
                        <div style="font-size: 0.8rem; color: #6B7280; font-weight: normal; margin-top: 4px;">ID: ${est.documento}</div>
                    </td>
                    <td style="${bgStyle} padding: 15px; text-align: center;">
                        <span style="background: #E0E7FF; color: #4338CA; padding: 4px 10px; border-radius: 20px; font-weight: bold; font-size: 0.85rem;">
                            ${est.grupo || 'Sin Grupo'}
                        </span>
                    </td>
                    <td style="${bgStyle} border-radius: 0 8px 8px 0; padding: 15px; text-align: right; font-weight: 900; color: #10B981; font-size: 1.3rem;">
                        ${est.xp} <span style="font-size: 0.9rem; color: #6B7280;">XP</span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        
    } catch (e) {
        console.error(e);
        alert("Error cargando la clasificación");
    }
};

window.cerrarRankingGlobal = function() {
    const modal = document.getElementById('modal-ranking-global');
    if (modal) modal.style.display = 'none';
};

window.abrirRankingEnNuevaPestana = function() {
    const asignaturaSeleccionada = document.getElementById('select-planeacion-asignatura').value;
    if (window.gradoActualPlaneacion && asignaturaSeleccionada) {
        window.open('ranking.html?grupo=' + encodeURIComponent(window.gradoActualPlaneacion) + '&asignatura=' + encodeURIComponent(asignaturaSeleccionada), '_blank');
    } else if (window.gradoActualPlaneacion) {
        window.open('ranking.html?grupo=' + encodeURIComponent(window.gradoActualPlaneacion), '_blank');
    }
};


// --- FUNCIONES INTERACTIVAS MEGA GUIA ---

window.verificarSaberIndividual = function(idx) {
    const radios = document.getElementsByName('saber_' + idx);
    let selected = null;
    radios.forEach(r => { if (r.checked) selected = r; });
    
    if (!selected) {
        alert("Selecciona una opción antes de verificar.");
        return;
    }
    
    const correct = selected.value === selected.getAttribute('data-correct');
    const btn = document.getElementById('btn_saber_' + idx);
    const container = document.getElementById('container_saber_' + idx);
    
    if (correct) {
        btn.innerText = "✅ Correcto";
        btn.style.background = "#10B981";
        btn.disabled = true;
        
        // Bloquear radios
        radios.forEach(r => r.disabled = true);
        
        mostrarHuevos(); // Recompensa
        
        // Habilitar la siguiente si existe
        const nextContainer = document.getElementById('container_saber_' + (idx + 1));
        if (nextContainer) {
            nextContainer.style.opacity = '1';
            nextContainer.removeAttribute('disabled');
        }
    } else {
        btn.innerText = "❌ Incorrecto, intenta de nuevo";
        btn.style.background = "#EF4444";
        setTimeout(() => {
            btn.innerText = "Verificar";
            btn.style.background = "#3B82F6";
        }, 1500);
    }
};

window.verificarInductivaPagina = function(idx) {
    const textarea = document.getElementById('textarea_ind_pag_' + idx);
    if (!textarea || textarea.value.trim().length < 10) {
        alert("Escribe una respuesta más completa (al menos 10 caracteres).");
        return;
    }
    
    const btn = document.getElementById('btn_ind_pag_' + idx);
    btn.innerText = "✅ Validado";
    btn.style.background = "#10B981";
    btn.disabled = true;
    textarea.disabled = true;
    
    mostrarHuevos(); // Recompensa
    
    const nextContainer = document.getElementById('container_ind_pag_' + (idx + 1));
    if (nextContainer) {
        nextContainer.style.opacity = '1';
        nextContainer.removeAttribute('disabled');
    }
};

window.verificarCuadernoIndividual = function(idx) {
    const btn = document.getElementById('btn_cuaderno_' + idx);
    btn.innerText = "✅ Confirmado";
    btn.style.background = "#10B981";
    btn.disabled = true;
    
    mostrarHuevos(); // Recompensa
    
    const nextContainer = document.getElementById('container_cuaderno_' + (idx + 1));
    if (nextContainer) {
        nextContainer.style.opacity = '1';
        nextContainer.removeAttribute('disabled');
    }
};

window.verificarDeductivaPagina = function(idx) {
    const textarea = document.getElementById('textarea_ded_pag_' + idx);
    if (!textarea || textarea.value.trim().length < 10) {
        alert("Escribe una respuesta más completa (al menos 10 caracteres).");
        return;
    }
    
    const btn = document.getElementById('btn_ded_pag_' + idx);
    btn.innerText = "✅ Validado";
    btn.style.background = "#10B981";
    btn.disabled = true;
    textarea.disabled = true;
    
    mostrarHuevos(); // Recompensa
    
    const nextContainer = document.getElementById('container_ded_pag_' + (idx + 1));
    if (nextContainer) {
        nextContainer.style.opacity = '1';
        nextContainer.removeAttribute('disabled');
    }
};

window.verificarCuadernoDeductivoIndividual = function(idx) {
    const btn = document.getElementById('btn_cuaderno_ded_' + idx);
    btn.innerText = "✅ Confirmado";
    btn.style.background = "#10B981";
    btn.disabled = true;
    
    mostrarHuevos(); // Recompensa
    
    const nextContainer = document.getElementById('container_cuaderno_ded_' + (idx + 1));
    if (nextContainer) {
        nextContainer.style.opacity = '1';
        nextContainer.removeAttribute('disabled');
    }
};


// --- FASE 2: ANTI-CHEAT Y VALIDACIONES ---

window.verificarEscrituraIA = function(textarea) {
    const val = textarea.value;
    const lastLen = textarea.dataset.lastLen || 0;
    
    // Si la longitud crece en más de 8 caracteres de golpe, es casi imposible escribiendo letra por letra
    if (val.length - lastLen > 8) {
        textarea.dataset.aiFlag = "true";
        textarea.parentElement.querySelector('.ai-warning').style.display = 'block';
        // Bloquear al usuario un par de segundos
        textarea.disabled = true;
        setTimeout(() => {
            textarea.value = "";
            textarea.disabled = false;
            textarea.dataset.lastLen = 0;
            textarea.focus();
        }, 1500);
    } else {
        textarea.dataset.lastLen = val.length;
    }
};



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

var draggedEl = null;
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
        <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; max-width: 500px; position: relative;">
            <button onclick="document.getElementById('modal-huevos').style.display='none'" style="position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 2rem; cursor: pointer; color: #9CA3AF; transition: color 0.2s;" onmouseover="this.style.color='#EF4444'" onmouseout="this.style.color='#9CA3AF'">&times;</button>
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
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion'));
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
    
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion'));
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

window.renderizarSopaLetras = function(containerId, palabras) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Generar una sopa de letras simple 10x10
    const size = 10;
    let grid = Array(size).fill(null).map(() => Array(size).fill(''));
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
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
                for (let i=0; i<p.length; i++) {
                    if (grid[row][col+i] !== '' && grid[row][col+i] !== p[i]) {
                        canPlace = false;
                        break;
                    }
                }
                if (canPlace) {
                    for (let i=0; i<p.length; i++) grid[row][col+i] = p[i];
                    placed = true;
                }
            } else if (dir === 'V' && row + p.length <= size) {
                let canPlace = true;
                for (let i=0; i<p.length; i++) {
                    if (grid[row+i][col] !== '' && grid[row+i][col] !== p[i]) {
                        canPlace = false;
                        break;
                    }
                }
                if (canPlace) {
                    for (let i=0; i<p.length; i++) grid[row+i][col] = p[i];
                    placed = true;
                }
            }
            attempts++;
        }
    });
    
    // Rellenar vacíos
    for (let i=0; i<size; i++) {
        for (let j=0; j<size; j++) {
            if (grid[i][j] === '') grid[i][j] = letras[Math.floor(Math.random() * letras.length)];
        }
    }
    
    let html = `<div style="display:grid; grid-template-columns:repeat(${size}, 30px); gap:2px; margin-bottom:10px;">`;
    for (let i=0; i<size; i++) {
        for (let j=0; j<size; j++) {
            html += `<div style="width:30px; height:30px; background:white; border:1px solid #D1D5DB; display:flex; align-items:center; justify-content:center; font-weight:bold; cursor:pointer;" onclick="this.style.background='#FDE047'; this.style.borderColor='#EAB308';">${grid[i][j]}</div>`;
        }
    }
    html += `</div><div style="font-size:0.9rem; color:#6B7280;">Encuentra: <b>${palabras.join(', ')}</b></div>`;
    container.innerHTML = html;
};

window.renderizarCrucigrama = function(containerId, datosCrucigrama) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let pistas = datosCrucigrama.split(';');
    let html = `<div style="width: 100%; max-width: 400px; text-align: left;">`;
    pistas.forEach((pistaStr, i) => {
        let parts = pistaStr.split('|');
        if (parts.length === 2) {
            let desc = parts[0].trim();
            let res = parts[1].trim().toUpperCase();
            html += `
            <div style="margin-bottom: 10px;">
                <div style="font-weight: bold; font-size: 0.9rem; margin-bottom: 5px;">${i+1}. ${desc}</div>
                <div style="display:flex; gap:2px; overflow-x: auto; padding-bottom: 5px;">
                    ${res.split('').map(l => `<input type="text" maxlength="1" oninput="this.value = this.value.toUpperCase(); if(this.value === '${l}') { this.style.background = '#BBF7D0'; this.style.borderColor='#22C55E'; } else { this.style.background = 'white'; }" style="width:30px; height:30px; min-width:30px; text-align:center; font-weight:bold; border:1px solid #9CA3AF; border-radius:4px; text-transform:uppercase;">`).join('')}
                </div>
            </div>`;
        }
    });
    html += `</div>`;
    container.innerHTML = html;
};

// ==========================================
// HISTORY API INTERCEPTOR (NAVEGACI�N BOT�N ATR�S)
// ==========================================
let subviewsDepth = 0;

window.pushSubView = function() {
    subviewsDepth++;
    history.pushState({ depth: subviewsDepth }, "", location.href);
};

window.addEventListener('popstate', (e) => {
    if (subviewsDepth > 0) {
        subviewsDepth--;
        
        // 1. Modals
        const modalInforme = document.getElementById('modal-informe-estudiante');
        if (modalInforme && modalInforme.style.display === 'flex') {
            modalInforme.style.display = 'none';
            return;
        }
        
        // 2. Student Guide View -> Back to Quest View
        const guideContent = document.getElementById("student-guide-content");
        if (guideContent && guideContent.style.display === 'block') {
            if (typeof volverAlFormulario === 'function') volverAlFormulario();
            return;
        }
        
        // 3. Student Subject View -> Back to Student Grid
        const subjectView = document.getElementById("student-subject-view-container");
        if (subjectView && subjectView.style.display === 'block') {
            if (typeof volverAlGridEstudiante === 'function') volverAlGridEstudiante();
            return;
        }

        // 4. Admin Subviews
        const estudiantesGrupo = document.getElementById('admin-estudiantes-grupo-container');
        if (estudiantesGrupo && estudiantesGrupo.style.display === 'block') {
            if (typeof volverGruposAdmin === 'function') volverGruposAdmin();
            return;
        }
    } else {
        // They are at the root of a dashboard (depth 0). If they press back, log them out.
        location.reload();
    }
});

// ==========================================
// RENDERIZADO DE BLOQUES ESPECIALES (MERMAID Y ABC)
// ==========================================
window.renderizarBloquesEspeciales = function(containerElement) {
    if (!containerElement) return;

    // Renderizar Mermaid
    const mermaidBlocks = containerElement.querySelectorAll('pre code.language-mermaid');
    mermaidBlocks.forEach((block, index) => {
        const text = block.textContent;
        const pre = block.parentElement;
        const div = document.createElement('div');
        div.className = 'mermaid';
        div.style.background = 'white';
        div.style.padding = '20px';
        div.style.borderRadius = '8px';
        div.style.marginBottom = '20px';
        div.style.textAlign = 'center';
        div.style.overflowX = 'auto';
        div.textContent = text;
        pre.parentNode.replaceChild(div, pre);
    });
    
    if (mermaidBlocks.length > 0 && window.mermaid) {
        try {
            mermaid.init(undefined, containerElement.querySelectorAll('.mermaid'));
        } catch (e) {
            console.error("Error renderizando mermaid:", e);
        }
    }

    // Renderizar ABC
    const abcBlocks = containerElement.querySelectorAll('pre code.language-abc');
    abcBlocks.forEach((block, index) => {
        const text = block.textContent;
        const pre = block.parentElement;
        const div = document.createElement('div');
        const uniqueId = 'abc-render-' + Date.now() + '-' + index;
        div.id = uniqueId;
        div.className = 'abcjs-container';
        div.style.background = 'white';
        div.style.padding = '20px';
        div.style.borderRadius = '8px';
        div.style.marginBottom = '20px';
        div.style.overflowX = 'auto';
        pre.parentNode.replaceChild(div, pre);
        
        if (window.ABCJS) {
            try {
                ABCJS.renderAbc(uniqueId, text, { responsive: 'resize' });
            } catch (e) {
                console.error("Error renderizando abc:", e);
            }
        }
    });
};
