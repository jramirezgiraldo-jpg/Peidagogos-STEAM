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
        
        const defaultMap = {
            "6": ["Física"],
            "7": ["Turismo", "Ética", "Física"],
            "8": ["Artística"],
            "9": ["Artística"],
            "10": ["Ética"],
            "11": ["Física", "Ética", "Química", "Turismo"],
            "PENS": ["Turismo", "Química"],
            "Ciclo I": ["Ciencias Naturales", "Ética", "Artística"],
            "Ciclo II": ["Ciencias Naturales", "Ética", "Artística"],
            "Ciclo III": ["Física", "Turismo", "Ética"],
            "Ciclo IV": ["Artística", "Turismo", "Ciencias"],
            "Ciclo V": ["Ética", "Química", "Turismo"],
            "Ciclo VI": ["Física", "Ética", "Química", "Turismo"]
        };

        // Normalizar clave grado
        let cleanGrade = gradoSeleccionado.split('(')[0].trim().replace('°', '');

        let html = '';
        let cont = 0;
        if (Array.isArray(asignaturas) && asignaturas.length > 0) {
            asignaturas.forEach(a => {
                const aClean = a.grado ? a.grado.split('(')[0].trim().replace('°', '') : '';
                if (a.grado == gradoSeleccionado || aClean == cleanGrade) {
                    html += `
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" class="materia-chk" value="${a.nombre}" checked>
                        ${a.nombre}
                    </label>`;
                    cont++;
                }
            });
        }
        
        if (cont === 0 && (defaultMap[gradoSeleccionado] || defaultMap[cleanGrade])) {
            const list = defaultMap[gradoSeleccionado] || defaultMap[cleanGrade];
            list.forEach(materia => {
                html += `
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" class="materia-chk" value="${materia}" checked>
                    ${materia}
                </label>`;
                cont++;
            });
        }

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
    } else if (grupoName.includes('Ciclo I') || grupoName === 'Ciclo 1') {
        return [
            { nombre: 'Ciencias Naturales', horas: '2h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Ética', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Artística', horas: '1h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName.includes('Ciclo II') || grupoName === 'Ciclo 2') {
        return [
            { nombre: 'Ciencias Naturales', horas: '2h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Ética', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Artística', horas: '1h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName.includes('Ciclo III') || grupoName === 'Ciclo 3') {
        return [
            { nombre: 'Física', horas: '2h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Turismo', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Ética', horas: '1h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName.includes('Ciclo IV') || grupoName === 'Ciclo 4') {
        return [
            { nombre: 'Artística', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Turismo', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Ciencias Naturales', horas: '2h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName.includes('Ciclo V') || grupoName === 'Ciclo 5') {
        return [
            { nombre: 'Ética', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Química', horas: '2h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Turismo', horas: '1h', estado: 'Pendiente', color: '#6B7280' }
        ];
    } else if (grupoName.includes('Ciclo VI') || grupoName === 'Ciclo 6') {
        return [
            { nombre: 'Física', horas: '2h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Ética', horas: '1h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Química', horas: '2h', estado: 'Pendiente', color: '#6B7280' },
            { nombre: 'Turismo', horas: '1h', estado: 'Pendiente', color: '#6B7280' }
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

window.mallaQuimica = {
    '11': {
        objetivo: 'Comprender la química orgánica, reactividad del carbono y aplicaciones industriales.',
        periodos: {
            '1': { '1': 'El átomo de carbono e hibridación.', '3': 'Hidrocarburos alifáticos y aromáticos.', '5': 'Grupos funcionales oxigenados.', '7': 'Grupos nitrogenados.' },
            '2': { '1': 'Reacciones orgánicas.', '3': 'Biomoléculas.', '5': 'Polímeros y plásticos.', '7': 'Química verde.' },
            '3': { '1': 'Cinética y equilibrio químico.', '3': 'Ácidos y bases de Brønsted-Lowry.', '5': 'Electroquímica y pilas.', '7': 'Termoquímica.' },
            '4': { '1': 'Química ambiental.', '3': 'Industria química y procesos.', '5': 'Saber 11 Química.', '7': 'Proyecto final.' }
        }
    },
    'PENS': {
        objetivo: 'Aplicar conceptos de química a procesos industriales, culinarios y de salud.',
        periodos: {
            '1': { '1': 'Materia, mezclas y separación en la industria.', '3': 'Reacciones químicas cotidianas.', '5': 'Gases y soluciones.', '7': 'Química del carbono básica.' },
            '2': { '1': 'Química de los alimentos.', '3': 'Productos de limpieza e higiene.', '5': 'Bioquímica humana.', '7': 'Seguridad en el manejo de químicos.' },
            '3': { '1': 'Procesos de fermentación y destilación.', '3': 'Polímeros y reciclaje.', '5': 'Energía y combustibles.', '7': 'Control de calidad.' },
            '4': { '1': 'Tratamiento de aguas residuales.', '3': 'Fertilizantes y pesticidas.', '5': 'Impacto ambiental industrial.', '7': 'Taller de química aplicada.' }
        }
    },
    'Ciclo V': {
        objetivo: 'Reconocer la estructura de la materia, elementos químicos y transformaciones cotidianas.',
        periodos: {
            '1': { '1': 'Diagnóstico inicial: Estructura de la materia y sustancias cotidianas.', '3': 'La tabla periódica y elementos esenciales.', '5': 'Enlaces químicos en materiales de uso diario.', '7': 'Reacciones químicas caseras e industriales.' },
            '2': { '1': 'Nomenclatura química básica.', '3': 'Conservación de la masa y balanceo.', '5': 'Ácidos y bases en el hogar.', '7': 'Soluciones y concentraciones en sueros y bebidas.' },
            '3': { '1': 'Comportamiento de gases y presión.', '3': 'Calor y temperatura en cambios químicos.', '5': 'Oxidación y reducción en la vida diaria.', '7': 'Manejo seguro de sustancias químicas.' },
            '4': { '1': 'Química y medio ambiente.', '3': 'Contaminación y alternativas ecológicas.', '5': 'Química en la agricultura.', '7': 'Proyecto de aula química aplicada.' }
        }
    },
    'Ciclo VI': {
        objetivo: 'Comprender la química orgánica, reactividad del carbono, biomoléculas y aplicaciones sostenibles.',
        periodos: {
            '1': { '1': 'Diagnóstico inicial: El carbono y la química de los seres vivos.', '3': 'Combustibles fósiles y biocombustibles.', '5': 'Alcoholes, vinagres y fragancias en la industria.', '7': 'Carbohidratos, grasas y proteínas en la alimentación.' },
            '2': { '1': 'Plásticos, polímeros y alternativas biodegradables.', '3': 'Medicamentos, cosméticos y química farmacéutica.', '5': 'Jabones y detergentes: química de la saponificación.', '7': 'Fermentación en el café, pan y bebidas.' },
            '3': { '1': 'Equilibrio químico y pH en el cuerpo humano.', '3': 'Baterías, pilas y energía electroquímica.', '5': 'Lectura crítica de tablas y gráficas químicas (Saber 11).', '7': 'Química verde y sostenibilidad ambiental.' },
            '4': { '1': 'Toxicología y prevención en el trabajo.', '3': 'Nanotecnología y nuevos materiales.', '5': 'Cambio climático desde la perspectiva química.', '7': 'Proyecto de aplicación comunitaria.' }
        }
    }
};

window.mallaNaturales = {
    '6': { objetivo: 'Comprender la estructura celular y el entorno vivo.', periodos: { '1': { '1': 'La Célula y sus partes.', '3': 'Funciones Celulares y organelos.', '5': 'Tejidos y órganos.', '7': 'Ecosistemas y biodiversidad.' } } },
    'Ciclo I': {
        objetivo: 'Reconocer los seres vivos, el cuidado del cuerpo, los sentidos y la preservación del entorno natural cercano de forma práctica y cotidiana.',
        periodos: {
            '1': {
                '1': 'Diagnóstico inicial: Los sentidos y cómo percibimos el mundo que nos rodea.',
                '3': 'Seres vivos y elementos no vivos en el hogar, el campo y la comunidad.',
                '5': 'El cuidado del agua y hábitos de higiene y salud personal.',
                '7': 'Las plantas y animales de nuestra región (Quindío) y su importancia.'
            },
            '2': {
                '1': 'Partes del cuerpo humano y su funcionamiento básico.',
                '3': 'Alimentos saludables y nutrición en la familia.',
                '5': 'El día y la noche: el Sol y la Luna en la vida diaria.',
                '7': 'Cuidado de mascotas y animales domésticos.'
            },
            '3': {
                '1': 'Los estados del agua en la cocina y la naturaleza.',
                '3': 'Plantas medicinales y cultivos tradicionales.',
                '5': 'El suelo y cómo cuidarlo para sembrar.',
                '7': 'El aire que respiramos y la prevención de enfermedades respiratorias.'
            },
            '4': {
                '1': 'Reciclaje y manejo de basuras en la casa y el barrio.',
                '3': 'Los sonidos del entorno y el cuidado del oído.',
                '5': 'Las estaciones, lluvias y clima local.',
                '7': 'Proyecto comunitario de cuidado ambiental.'
            }
        }
    },
    'Ciclo II': {
        objetivo: 'Identificar las relaciones entre los seres vivos y su medio ambiente, los estados de la materia y la nutrición balanceada.',
        periodos: {
            '1': {
                '1': 'Diagnóstico inicial: Estados del agua en la naturaleza y en el hogar (sólido, líquido y vapor).',
                '3': 'Alimentación saludable, grupos de alimentos y origen de lo que comemos.',
                '5': 'Cadenas alimenticias sencillas y equilibrio en los ecosistemas.',
                '7': 'Clasificación básica de los seres vivos y cuidado de los recursos naturales.'
            },
            '2': {
                '1': 'El sistema digestivo y la absorción de nutrientes.',
                '3': 'El sistema respiratorio y circulatorio en el esfuerzo físico.',
                '5': 'La fotosíntesis explicada de forma sencilla: cómo las plantas fabrican su alimento.',
                '7': 'Adaptaciones de animales y plantas a diferentes climas.'
            },
            '3': {
                '1': 'Mezclas en la cocina: solubilidad del azúcar, sal y café.',
                '3': 'Fuerzas cotidianas: empujar, jalar, fricción y gravedad.',
                '5': 'Fuentes de energía en el hogar: luz, calor y electricidad.',
                '7': 'Ahorro de energía y uso responsable de electrodomésticos.'
            },
            '4': {
                '1': 'El ciclo del agua y el cuidado de ríos y quebradas locales.',
                '3': 'Contaminación del aire y del agua: causas y soluciones.',
                '5': 'Biodiversidad de la flora y fauna colombiana.',
                '7': 'Acciones prácticas para un hogar ecológico y sostenible.'
            }
        }
    },
    'Ciclo III': {
        objetivo: 'Comprender la célula como unidad básica de vida, los tipos de mezclas cotidianas y las formas elementales de energía.',
        periodos: {
            '1': {
                '1': 'Diagnóstico inicial: La célula y los componentes básicos de los organismos vivos.',
                '3': 'Mezclas homogéneas y heterogéneas en la vida diaria (café, agua y aceite, suelo).',
                '5': 'El ciclo del agua y su importancia para la vida, la salud y la agricultura.',
                '7': 'Formas de energía que usamos a diario (calor, luz solar, electricidad, movimiento).'
            },
            '2': {
                '1': 'Estructura y organelos principales de la célula (membrana, núcleo, citoplasma).',
                '3': 'Célula vegetal vs célula animal: diferencias clave en la vida práctica.',
                '5': 'Organización de los seres vivos: células, tejidos, órganos y sistemas.',
                '7': 'Microorganismos en los alimentos (levaduras, bacterias del yogur) y en la salud.'
            },
            '3': {
                '1': 'Métodos caseros y de laboratorio para separar mezclas (filtración, decantación, evaporación).',
                '3': 'Sustancias puras vs mezclas: la sal, el agua pura y el aire.',
                '5': 'Temperatura, calor y cambios de fase en la materia.',
                '7': 'Energías limpias y renovables (solar, eólica e hidroeléctrica) en Colombia.'
            },
            '4': {
                '1': 'Ecosistemas locales: bosques de niebla, guaduales y cafetales.',
                '3': 'Relaciones biológicas: mutualismo, parasitismo y depredación.',
                '5': 'Impacto de la actividad humana en el cambio climático.',
                '7': 'Estrategias de conservación y desarrollo sostenible en el Quindío.'
            }
        }
    },
    'Ciclo IV': {
        objetivo: 'Reconocer los principios básicos de la herencia biológica, transformaciones de la materia y el impacto ecológico en la región.',
        periodos: {
            '1': {
                '1': 'Diagnóstico inicial: Herencia biológica básica (rasgos familiares y características genéticas).',
                '3': 'Cambios físicos vs transformaciones químicas cotidianas (combustión, oxidación, fermentación).',
                '5': 'Ecosistemas del Paisaje Cultural Cafetero y biodiversidad del Quindío.',
                '7': 'Reciclaje, gestión de residuos y conservación del medio ambiente.'
            },
            '2': {
                '1': 'ADN, genes y cromosomas: el manual de instrucciones de los seres vivos.',
                '3': 'Leyes básicas de la herencia (Mendel) aplicadas a rasgos humanos y plantas.',
                '5': 'Reproducción celular: mitosis y meiosis explicadas para la regeneración y herencia.',
                '7': 'Biotecnología y mejoramiento genético tradicional en la agricultura.'
            },
            '3': {
                '1': 'Estructura atómica básica: protones, neutrones y electrones.',
                '3': 'La tabla periódica: metales, no metales y elementos vitales (C, H, O, N, P, S).',
                '5': 'Reacciones químicas cotidianas: cómo arde una vela y cómo se oxida un metal.',
                '7': 'Ácidos y bases en el hogar (vinagre, jabón, bicarbonato, limón) y escala de pH.'
            },
            '4': {
                '1': 'Evolución y selección natural: cómo las especies se adaptan al entorno.',
                '3': 'Impacto de la minería, deforestación y agroquímicos en los suelos.',
                '5': 'Servicios ecosistémicos del agua y los polinizadores (abejas y colibríes).',
                '7': 'Propuesta de gestión ambiental y sostenibilidad para la comunidad.'
            }
        }
    },
    'Ciclo V': {
        objetivo: 'Interpretar la estructura de la materia, elementos químicos comunes y las fuerzas aplicadas al trabajo y transporte.',
        periodos: {
            '1': {
                '1': 'Diagnóstico inicial: La materia, átomos y elementos químicos esenciales en la vida (oxígeno, carbono, agua).',
                '3': 'Sustancias puras, compuestos y mezclas en el hogar y la industria local.',
                '5': 'Fuerzas, gravedad y movimiento aplicados a herramientas, máquinas y vehículos.',
                '7': 'Energía térmica, calor y temperatura en la vida cotidiana y laboral.'
            },
            '2': {
                '1': 'Modelos atómicos y configuración electrónica simplificada.',
                '3': 'Enlaces químicos: iónico, covalente y metálico en materiales comunes.',
                '5': 'Nomenclatura básica de óxidos, hidróxidos y ácidos cotidianos.',
                '7': 'Estequiometría básica: la ley de conservación de la masa (Lavoisier) en la cocina e industria.'
            },
            '3': {
                '1': 'Cinemática aplicada: velocidad, rapidez y tiempo en desplazamientos reales.',
                '3': 'Leyes de Newton: inercia, fuerza (F=m*a) y acción-reacción en el trabajo y transporte.',
                '5': 'Trabajo mecánico, potencia y energía cinética vs potencial.',
                '7': 'Presión y fluidos: principio de Pascal y Arquímedes en prensas hidráulicas y barcos.'
            },
            '4': {
                '1': 'Gases ideales: presión, volumen y temperatura en ollas de presión y neumáticos.',
                '3': 'Soluciones químicas: concentración en porcentaje y molaridad en sueros y fertilizantes.',
                '5': 'Termodinámica básica: calor específico y transferencia de calor por conducción, convección y radiación.',
                '7': 'Química ambiental: lluvia ácida, efecto invernadero y tratamiento de aguas.'
            }
        }
    },
    'Ciclo VI': {
        objetivo: 'Analizar los procesos biofísicos y químicos del entorno, fuentes de energía sostenible y comprensión científica tipo Saber 11 adaptada a adultos.',
        periodos: {
            '1': {
                '1': 'Diagnóstico inicial: Química básica de la vida y el carbono (alimentos, plásticos y combustibles).',
                '3': 'Flujos de energía en el planeta, ciclos biogeoquímicos y cambio climático global.',
                '5': 'Leyes físicas cotidianas (electricidad, circuitos, luz y sonido en la tecnología).',
                '7': 'Lectura crítica de fenómenos naturales y toma de decisiones ambientales fundamentadas (Saber 11 formativo).'
            },
            '2': {
                '1': 'Química orgánica: el átomo de carbono, hidrocarburos y combustibles fósiles.',
                '3': 'Grupos funcionales clave: alcoholes, aldehídos, cetonas, ácidos carboxílicos y ésteres.',
                '5': 'Biomoléculas: carbohidratos, lípidos, proteínas y ácidos nucleicos en la nutrición humana.',
                '7': 'Polímeros sintéticos, microplásticos y nuevos materiales biodegradables.'
            },
            '3': {
                '1': 'Electricidad y magnetismo: voltaje, corriente, resistencia (Ley de Ohm) en instalaciones domésticas.',
                '3': 'Ondas electromagnéticas: radio, microondas, luz visible, rayos X y comunicaciones modernas.',
                '5': 'Óptica básica: reflexión, refracción, lentes y el funcionamiento del ojo humano.',
                '7': 'Física nuclear y medicina: radioterapia, rayos X y energía nuclear controlada.'
            },
            '4': {
                '1': 'Bioética y ciencia: organismos genéticamente modificados y farmacología.',
                '3': 'Transición energética: paneles solares fotovoltaicos, biocombustibles e hidrógeno verde.',
                '5': 'Análisis de gráficas y tablas experimentales tipo ICFES Saber 11 para adultos.',
                '7': 'Proyecto de grado: Solución científico-tecnológica a una problemática de la comunidad.'
            }
        }
    }
};

window.mallaSociales = {
    '6': { objetivo: 'Identificar el espacio geográfico y el universo.', periodos: { '1': { '1': 'Geografía Física.', '2': 'El Sistema Solar.' } } }
};
window.mallaCastellano = {
    '6': { objetivo: 'Fortalecer la comprensión lectora.', periodos: { '1': { '1': 'Tipos de Textos.', '2': 'Estructura del Cuento.' } } }
};

window.normalizarGradoOCiclo = function(gradoStr) {
    if (!gradoStr) return '6';
    const g = gradoStr.toString().trim();
    if (g.includes('Ciclo I') && !g.includes('Ciclo II') && !g.includes('Ciclo III') && !g.includes('Ciclo IV')) return 'Ciclo I';
    if (g.includes('Ciclo II') && !g.includes('Ciclo III')) return 'Ciclo II';
    if (g.includes('Ciclo III')) return 'Ciclo III';
    if (g.includes('Ciclo IV')) return 'Ciclo IV';
    if (g.includes('Ciclo V') && !g.includes('Ciclo VI')) return 'Ciclo V';
    if (g.includes('Ciclo VI')) return 'Ciclo VI';
    if (g.toUpperCase().includes('PENS')) return 'PENS';
    const match = g.match(/\d+/);
    return match ? match[0] : g;
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
    },
    'Ciclo III': {
        objetivo: 'Comprender conceptos fundamentales del movimiento, fuerza y energía en la vida cotidiana.',
        periodos: {
            '1': { '1': 'Diagnóstico inicial: Movimiento, rapidez y fuerzas en el entorno.', '3': 'La gravedad y el peso de los objetos.', '5': 'Energía y trabajo en las actividades diarias.', '7': 'Máquinas simples (palancas, poleas y planos inclinados).' },
            '2': { '1': 'Vectores y dirección del movimiento.', '3': 'Velocidad constante vs aceleración.', '5': 'Fuerza de rozamiento y frenado.', '7': 'Presión en líquidos y gases.' },
            '3': { '1': 'Calor y temperatura en el hogar.', '3': 'Sonido y ondas en la comunicación.', '5': 'Luz y sombras: óptica básica.', '7': 'Electricidad estática y precauciones.' },
            '4': { '1': 'Circuitos eléctricos simples.', '3': 'Imanes y brújulas.', '5': 'Energías renovables.', '7': 'Taller de física práctica.' }
        }
    },
    'Ciclo VI': {
        objetivo: 'Interpretar fenómenos mecánicos, termodinámicos y electromagnéticos aplicados con orientación Saber 11 formativo.',
        periodos: {
            '1': { '1': 'Diagnóstico inicial: Cinemática, fuerzas y leyes del movimiento.', '3': 'Trabajo mecánico, potencia y conservación de la energía.', '5': 'Fluidos: densidad, presión y empuje.', '7': 'Preguntas tipo Saber 11 formativas de Física.' },
            '2': { '1': 'Termodinámica: calor, dilatación y máquinas térmicas.', '3': 'Ondas mecánicas y sonido.', '5': 'Óptica geométrica: espejos y lentes.', '7': 'Análisis de gráficas experimentales de física.' },
            '3': { '1': 'Electrostática y ley de Coulomb.', '3': 'Circuitos eléctricos domésticos y ley de Ohm.', '5': 'Magnetismo y motores eléctricos.', '7': 'Consumo eficiente de energía eléctrica.' },
            '4': { '1': 'Ondas electromagnéticas y telecomunicaciones.', '3': 'Física moderna y aplicaciones médicas.', '5': 'Simulacro Saber 11 de Ciencias Naturales / Física.', '7': 'Proyecto tecnológico de aplicación.' }
        }
    }
};

window.gradoActualPlaneacion = null;

window.actualizarVisualizadorPlaneacion = function() {
    const selectorAsignatura = document.getElementById('select-planeacion-asignatura');
    const visualizador = document.getElementById('planeacion-contenido-actual');
    
    if (!visualizador || !window.gradoActualPlaneacion) return;

    const gradoSeleccionado = window.gradoActualPlaneacion;
    const gradoNum = window.normalizarGradoOCiclo ? window.normalizarGradoOCiclo(gradoSeleccionado) : gradoSeleccionado.replace(/[^0-9PENS]/g, '');
    let asignatura = selectorAsignatura ? selectorAsignatura.value : 'Física';
    
    let malla = null;

    if (asignatura.toLowerCase().includes('física')) {
        malla = window.mallaFisica;
    } else if (asignatura.toLowerCase().includes('química') || asignatura.toLowerCase().includes('quimica')) {
        malla = window.mallaQuimica;
    } else if (asignatura.toLowerCase().includes('matemática') || asignatura.toLowerCase().includes('matematica')) {
        malla = window.mallaMatematicas;
    } else if (asignatura.toLowerCase().includes('naturales') || asignatura.toLowerCase().includes('ciencias')) {
        malla = window.mallaNaturales;
    } else if (asignatura.toLowerCase().includes('sociales')) {
        malla = window.mallaSociales;
    } else if (asignatura.toLowerCase().includes('castellano') || asignatura.toLowerCase().includes('humanidades')) {
        malla = window.mallaCastellano;
    } else if (asignatura.toLowerCase().includes('turismo')) {
        malla = window.mallaTurismo;
    } else if (asignatura.toLowerCase().includes('artística') || asignatura.toLowerCase().includes('música') || asignatura.toLowerCase().includes('artistica')) {
        malla = window.mallaArtistica;
    } else if (asignatura.toLowerCase().includes('ética') || asignatura.toLowerCase().includes('etica')) {
        malla = window.mallaEtica;
    }

    const dataGrado = malla ? (malla[gradoNum] || malla[gradoSeleccionado] || malla['6']) : null;

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
    window.juegosPendientes = [];
    
    let htmlRenderizado = `
        <div style="text-align: center; margin-bottom: 20px; background: #FEF3C7; padding: 10px; border-radius: 8px; border: 2px solid #F59E0B;">
            <h3 style="color: #D97706; font-weight: 900; margin: 0;">👨‍🏫 VISTA DE PROFESOR</h3>
            <p style="color: #92400E; margin: 5px 0 0 0;">Visualizando guía pedagógica completa y respuestas oficiales.</p>
            <button onclick="cerrarGuiaProfesor()" style="margin-top: 10px; background: #EF4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">Cerrar Vista Profesor</button>
        </div>
        <div class="mega-guide-container" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #E5E7EB; font-family: 'Inter', sans-serif;">
    `;
    
    // Objetivo y Pregunta Problematizadora
    if (guideData.objetivo_aprendizaje || guideData.pregunta_problematizadora) {
        htmlRenderizado += `
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                ${guideData.objetivo_aprendizaje ? `<p style="margin: 0 0 8px 0; color: #1E40AF;">🎯 <b>Objetivo de Aprendizaje:</b> ${guideData.objetivo_aprendizaje}</p>` : ''}
                ${guideData.pregunta_problematizadora ? `<p style="margin: 0; color: #9A3412;">❓ <b>Pregunta Problematizadora:</b> <i>${guideData.pregunta_problematizadora}</i></p>` : ''}
            </div>
        `;
    }

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
        htmlRenderizado += `<h4 style="color: #4F46E5;">📖 Fase 1: Exploración (Texto Inductivo)</h4>`;
        htmlRenderizado += `<div class="markdown-body" style="font-size: 1.1rem; line-height: 1.6; color: #374151;">${window.procesarJuegosEnTexto(guideData.texto_inductivo)}</div>`;
    }

    if (guideData.recurso_visual) {
        htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">📊 Recurso Visual</h4>`;
        if (guideData.recurso_visual.includes('graph TD') || guideData.recurso_visual.includes('graph LR') || guideData.recurso_visual.includes('pie') || guideData.recurso_visual.includes('flowchart') || guideData.recurso_visual.includes('mermaid')) {
            let concepts = [];
            let regex = /[\[\(\{]([^\]\)\}]+)[\]\)\}]/g;
            let match;
            while ((match = regex.exec(guideData.recurso_visual)) !== null) {
                if(match[1] && match[1].trim().length > 3 && !match[1].includes('#') && !match[1].includes('mermaid') && !match[1].includes('graph')) {
                    concepts.push(match[1].trim().replace(/['"]/g, ''));
                }
            }
            let uniqueConcepts = [...new Set(concepts)];
            let instructionText = "Elabora en tu cuaderno un esquema, mapa mental o dibujo que resuma la información del texto.";
            if (uniqueConcepts.length > 0) {
                let instructionsList = [
                    "🎨 <b>Misión de Mapa Mental:</b> Toma tu cuaderno de forma horizontal. En el centro, escribe el concepto principal de esta lista y enciérralo en una nube. Luego, saca flechas (ramificaciones) hacia los demás conceptos. Usa un color diferente para cada rama.",
                    "📏 <b>Misión de Tabla Organizadora:</b> Usa tu regla para dibujar una tabla amplia en tu cuaderno. En la primera columna, escribe cada uno de los conceptos de la lista. En la segunda columna, explica con tus propias palabras qué significa cada uno. En la tercera columna, da un ejemplo de la vida real.",
                    "🔗 <b>Misión de Esquema de Conectores:</b> Escribe los conceptos de la lista distribuidos por toda la página de tu cuaderno. Ahora, el reto es conectarlos con líneas. Sobre cada línea que dibujes, escribe una palabra de enlace (ej: 'sirve para', 'se divide en', 'produce').",
                    "🖍️ <b>Misión de Dibujo Explicativo:</b> Haz un dibujo grande y detallado en tu cuaderno donde aparezcan y se relacionen los conceptos de esta lista. Usa flechas y etiquetas para señalar dónde está cada concepto dentro de tu dibujo. ¡Ponle colores para que destaque!"
                ];
                let randIndex = Math.floor(Math.random() * instructionsList.length);
                instructionText = instructionsList[randIndex] + "<br><br><div style='background: #e2e8f0; padding: 10px; border-radius: 6px; display:inline-block; text-align:left; margin-top: 5px;'><b>Conceptos a incluir obligatoriamente:</b><br>• " + uniqueConcepts.join("<br>• ") + "</div>";
            }
            htmlRenderizado += `<div style="text-align:center; padding:20px; border: 2px dashed #94A3B8; border-radius: 8px; color: #475569; background: #F8FAFC; margin-bottom: 20px;"><i>📝 <b>Instrucción para tu cuaderno:</b><br><br>${instructionText}</i></div>`;
        } else {
            htmlRenderizado += `<div class="markdown-body" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; overflow-x: auto;">${marked.parse(guideData.recurso_visual)}</div>`;
        }
    }
    
    if (guideData.texto_deductivo) {
        htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 30px;">📖 Fase 2: Síntesis (Texto Deductivo)</h4>`;
        htmlRenderizado += `<div class="markdown-body" style="font-size: 1.1rem; line-height: 1.6; color: #374151;">${window.procesarJuegosEnTexto(guideData.texto_deductivo)}</div>`;
    }
    
    // ICFES Saber 11
    if (guideData.icfes) {
        htmlRenderizado += window.renderizarSeccionIcfes(guideData.icfes, true);
    }

    // Cierre Gamificado
    if (guideData.cierre_gamificado) {
        htmlRenderizado += window.renderizarCierreGamificado(guideData.cierre_gamificado, true);
    }
    
    htmlRenderizado += `</div>`;
    innerContent.innerHTML = htmlRenderizado;
    if(window.renderizarBloquesEspeciales) window.renderizarBloquesEspeciales(innerContent);
    
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
    let maxSemanaUnlocked = 8; // Desbloqueo total solicitado por el usuario
    
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
    let maxSemanaUnlocked = 8; // Desbloqueo total solicitado por el usuario
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

    const gradoSeleccionado = window.gradoActualEstudiante;
    const gradoNum = window.normalizarGradoOCiclo ? window.normalizarGradoOCiclo(gradoSeleccionado) : gradoSeleccionado.replace(/[^0-9PENS]/g, '');
    let asignatura = subjectTitle.innerText.replace('Aula de ', '').trim();
    
    let malla = null;

    if (asignatura.toLowerCase().includes('física')) {
        malla = window.mallaFisica;
    } else if (asignatura.toLowerCase().includes('química') || asignatura.toLowerCase().includes('quimica')) {
        malla = window.mallaQuimica;
    } else if (asignatura.toLowerCase().includes('matemática') || asignatura.toLowerCase().includes('matematica')) {
        malla = window.mallaMatematicas;
    } else if (asignatura.toLowerCase().includes('naturales') || asignatura.toLowerCase().includes('ciencias')) {
        malla = window.mallaNaturales;
    } else if (asignatura.toLowerCase().includes('sociales')) {
        malla = window.mallaSociales;
    } else if (asignatura.toLowerCase().includes('castellano') || asignatura.toLowerCase().includes('humanidades')) {
        malla = window.mallaCastellano;
    } else if (asignatura.toLowerCase().includes('turismo')) {
        malla = window.mallaTurismo;
    } else if (asignatura.toLowerCase().includes('artística') || asignatura.toLowerCase().includes('música') || asignatura.toLowerCase().includes('artistica')) {
        malla = window.mallaArtistica;
    } else if (asignatura.toLowerCase().includes('ética') || asignatura.toLowerCase().includes('etica')) {
        malla = window.mallaEtica;
    }

    const dataGrado = malla ? (malla[gradoNum] || malla[gradoSeleccionado] || malla['6']) : null;

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
    
    // 1. Buscar [JUEGO:TIPO:DATOS]
    const regexJuegos = /\[JUEGO:(ORDENAR_LETRAS|ORDENAR_FRASE|SOPA_LETRAS|CRUCIGRAMA):(.*?)\]/g;
    html = html.replace(regexJuegos, (match, tipo, datos) => {
        let uniqueId = 'juego_' + Math.random().toString(36).substr(2, 9);
        if (tipo === 'ORDENAR_LETRAS') {
            return `<div class="juego-incrustado" style="background:#F0FDF4; border:2px dashed #22C55E; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#166534; margin-top:0; display:flex; align-items:center; gap:8px;">🧩 Minijuego: Ordenar Letras</h5>
                ${window.renderizarJuegoOrdenar(datos.split(''), 'letras')}
            </div>`;
        } else if (tipo === 'ORDENAR_FRASE') {
            let palabras = datos.split(' ');
            return `<div class="juego-incrustado" style="background:#EFF6FF; border:2px dashed #3B82F6; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#1E3A8A; margin-top:0; display:flex; align-items:center; gap:8px;">🧩 Minijuego: Ordenar Frase</h5>
                ${window.renderizarJuegoOrdenar(palabras, 'palabras')}
            </div>`;
        } else if (tipo === 'SOPA_LETRAS') {
            let palabras = datos.split(',');
            window.juegosPendientes.push(() => window.renderizarSopaLetras(uniqueId, palabras));
            return `<div class="juego-incrustado" style="background:#FFFBEB; border:2px dashed #F59E0B; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#92400E; margin-top:0; display:flex; align-items:center; gap:8px;">🔍 Minijuego: Sopa de Letras</h5>
                <div id="${uniqueId}" style="display:flex; flex-direction:column; align-items:center;">Cargando sopa de letras...</div>
            </div>`;
        } else if (tipo === 'CRUCIGRAMA') {
            window.juegosPendientes.push(() => window.renderizarCrucigrama(uniqueId, datos));
            return `<div class="juego-incrustado" style="background:#FAF5FF; border:2px dashed #A855F7; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#581C87; margin-top:0; display:flex; align-items:center; gap:8px;">✏️ Minijuego: Crucigrama</h5>
                <div id="${uniqueId}" style="display:flex; flex-direction:column; align-items:center;">Cargando crucigrama...</div>
            </div>`;
        }
        return match;
    });

    // 2. Buscar [ACTIVIDAD:PLATAFORMA:PREGUNTA|RESPUESTA]
    const regexPlat = /\[ACTIVIDAD:PLATAFORMA:(.*?)\]/g;
    html = html.replace(regexPlat, (match, datos) => {
        let partes = datos.split('|');
        let preg = partes[0] ? partes[0].trim() : 'Responde la siguiente pregunta de análisis:';
        let actId = 'act_plat_' + Math.random().toString(36).substr(2, 9);
        return `<div class="actividad-plataforma-box" style="background: #F8FAFC; border: 2px dashed #3B82F6; padding: 18px; margin: 20px 0; border-radius: 8px;">
            <h5 style="color: #1E40AF; margin-top: 0; display:flex; align-items:center; gap:8px;">✍️ Actividad en Plataforma (No Copy-Paste)</h5>
            <p style="font-weight: bold; color: #1E293B; margin-bottom: 10px;">${preg}</p>
            <textarea class="anti-cheat-textarea" id="textarea_${actId}" rows="3" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #CBD5E1;" onpaste="return false;" ondrop="return false;" oninput="verificarEscrituraIA(this)" placeholder="Escribe tu análisis con tus propias palabras..."></textarea>
            <div class="ai-warning" style="color: #EF4444; font-size: 0.85rem; font-weight: bold; display: none; margin-top: 5px;">⚠️ Se detectó velocidad anormal de tipeo. Escribe tu propia respuesta.</div>
            <button onclick="validarActividadPlataformaIncrustada('${actId}')" id="btn_${actId}" style="background: #3B82F6; color: white; padding: 8px 18px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px;">Validar Respuesta</button>
            <div id="feedback_${actId}" style="display:none; margin-top:10px; padding:10px; background:#ECFDF5; border:1px solid #10B981; border-radius:6px; color:#065F46; font-size:0.9rem;">✔️ ¡Respuesta validada y registrada correctamente!</div>
        </div>`;
    });

    // 3. Buscar [ACTIVIDAD:CUADERNO:INSTRUCCION]
    const regexCuad = /\[ACTIVIDAD:CUADERNO:(.*?)\]/g;
    html = html.replace(regexCuad, (match, instruccion) => {
        return `<div class="actividad-cuaderno-box" style="background: #FFFBEB; border: 2px dashed #F59E0B; padding: 18px; margin: 20px 0; border-radius: 8px;">
            <h5 style="color: #92400E; margin-top: 0; display:flex; align-items:center; gap:8px;">📓 Actividad para Desarrollar en el Cuaderno</h5>
            <p style="color: #451A03; font-weight: 500; line-height: 1.5; margin-bottom: 12px;">${instruccion}</p>
            <button onclick="this.style.background='#10B981'; this.innerText='✔️ Lo resolví en mi cuaderno';" style="background: #F59E0B; color: white; padding: 8px 18px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.2s;">✔️ Lo resolví en mi cuaderno</button>
        </div>`;
    });
    
    return html;
};

window.validarActividadPlataformaIncrustada = function(actId) {
    const textarea = document.getElementById(`textarea_${actId}`);
    const btn = document.getElementById(`btn_${actId}`);
    const fb = document.getElementById(`feedback_${actId}`);
    if (!textarea || textarea.value.trim().length < 5) {
        alert("Por favor escribe tu respuesta completa antes de validar.");
        return;
    }
    textarea.disabled = true;
    if (btn) btn.style.display = 'none';
    if (fb) fb.style.display = 'block';
};

window.renderizarSeccionIcfes = function(icfesData, isTeacher = false) {
    if (!icfesData || !Array.isArray(icfesData) || icfesData.length === 0) return '';
    
    let html = `
        <div style="margin-top: 35px; background: #F8FAFC; border: 2px solid #3B82F6; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #E2E8F0; padding-bottom: 12px;">
                <span style="font-size: 1.8rem;">🏛️</span>
                <div>
                    <h3 style="color: #1E40AF; margin: 0; font-size: 1.35rem; font-weight: 800;">Desafío Saber 11 (Pruebas ICFES)</h3>
                    <p style="color: #64748B; margin: 2px 0 0 0; font-size: 0.9rem;">Preguntas alineadas al Diseño Centrado en Evidencias del ICFES Colombia.</p>
                </div>
            </div>
    `;

    icfesData.forEach((q, idx) => {
        let comp = q.competencia || 'Competencia Científica';
        let intro = q.texto_introductorio || '';
        let tabla = q.tabla_o_grafica_markdown || '';
        let preg = q.pregunta || '';
        let opciones = q.opciones || [];
        let correcta = q.correcta !== undefined ? q.correcta : 0;
        let retro = q.retroalimentacion || {};

        html += `
            <div id="icfes_pregunta_${idx}" class="icfes-card" style="background: white; border: 1px solid #CBD5E1; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
                <div style="display: inline-block; background: #DBEAFE; color: #1E40AF; font-size: 0.8rem; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-bottom: 12px;">
                    🎯 Competencia: ${comp}
                </div>
                ${intro ? `<div style="font-size: 1rem; color: #334155; line-height: 1.6; margin-bottom: 12px;">${marked.parse(intro)}</div>` : ''}
                ${tabla ? `<div style="background: #F1F5F9; padding: 12px; border-radius: 6px; margin-bottom: 15px; overflow-x: auto;">${marked.parse(tabla)}</div>` : ''}
                <p style="font-weight: 700; color: #0F172A; font-size: 1.05rem; margin-bottom: 15px;">${idx + 1}. ${preg}</p>
                
                <div class="icfes-opciones-list" style="display: flex; flex-direction: column; gap: 10px;">
                    ${opciones.map((opc, opcIdx) => {
                        let letra = String.fromCharCode(65 + opcIdx);
                        if (isTeacher) {
                            let esCorrecta = opcIdx === correcta;
                            return `
                                <div style="display: flex; align-items: flex-start; gap: 10px; padding: 12px; border-radius: 8px; border: 2px solid ${esCorrecta ? '#10B981' : '#E2E8F0'}; background: ${esCorrecta ? '#ECFDF5' : 'white'};">
                                    <span style="font-weight: 800; color: ${esCorrecta ? '#065F46' : '#64748B'};">${letra}.</span>
                                    <div style="flex: 1; color: #1E293B;">${opc} ${esCorrecta ? '✅ <b>(Correcta)</b>' : ''}</div>
                                </div>
                            `;
                        } else {
                            return `
                                <label class="icfes-opcion-label" id="label_icfes_${idx}_${opcIdx}" style="display: flex; align-items: flex-start; gap: 10px; padding: 12px; border-radius: 8px; border: 1.5px solid #CBD5E1; background: white; cursor: pointer; transition: all 0.2s;">
                                    <input type="radio" name="icfes_opt_${idx}" value="${opcIdx}" style="margin-top: 4px;">
                                    <span style="font-weight: 800; color: #1E40AF;">${letra}.</span>
                                    <span style="flex: 1; color: #1E293B;">${opc}</span>
                                </label>
                            `;
                        }
                    }).join('')}
                </div>

                ${isTeacher ? `
                    <div style="margin-top: 15px; padding: 15px; background: #F8FAFC; border-left: 4px solid #3B82F6; border-radius: 0 8px 8px 0;">
                        <h6 style="margin: 0 0 8px 0; color: #1E40AF; font-size: 0.95rem;">💡 Justificación Pedagógica y Análisis de Distractores:</h6>
                        ${Object.keys(retro).map(k => `
                            <p style="margin: 3px 0; font-size: 0.88rem; color: ${parseInt(k) === correcta ? '#065F46' : '#475569'};">
                                <b>Opción ${String.fromCharCode(65 + parseInt(k))}:</b> ${retro[k]}
                            </p>
                        `).join('')}
                    </div>
                ` : `
                    <button id="btn_icfes_${idx}" onclick="verificarIcfesPregunta(${idx}, ${correcta}, ${JSON.stringify(retro).replace(/"/g, '&quot;')})" style="margin-top: 15px; background: #2563EB; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.2s;">
                        Verificar Respuesta Saber
                    </button>
                    <div id="icfes_feedback_${idx}" style="display: none;"></div>
                `}
            </div>
        `;
    });

    html += `</div>`;
    return html;
};

window.verificarIcfesPregunta = function(qIndex, correctaIndex, retroMap) {
    const selected = document.querySelector(`input[name="icfes_opt_${qIndex}"]:checked`);
    if (!selected) {
        alert("Por favor selecciona una opción antes de verificar.");
        return;
    }
    const val = parseInt(selected.value);
    const feedbackBox = document.getElementById(`icfes_feedback_${qIndex}`);
    const btn = document.getElementById(`btn_icfes_${qIndex}`);
    if (btn) btn.disabled = true;

    // Deshabilitar radios y marcar colores
    document.querySelectorAll(`input[name="icfes_opt_${qIndex}"]`).forEach((r, i) => {
        r.disabled = true;
        const lbl = document.getElementById(`label_icfes_${qIndex}_${i}`);
        if (lbl) {
            if (i === parseInt(correctaIndex)) {
                lbl.style.background = '#ECFDF5';
                lbl.style.borderColor = '#10B981';
            } else if (i === val) {
                lbl.style.background = '#FEF2F2';
                lbl.style.borderColor = '#EF4444';
            }
        }
    });

    if (feedbackBox) {
        feedbackBox.style.display = 'block';
        let isCorrect = val === parseInt(correctaIndex);
        let retroElegida = (retroMap && (retroMap[val] || retroMap[String(val)])) || (isCorrect ? "¡Opción correcta!" : "Opción incorrecta.");
        let retroCorrecta = (retroMap && (retroMap[correctaIndex] || retroMap[String(correctaIndex)])) || "";

        let html = `
            <div style="padding: 15px; border-radius: 8px; margin-top: 15px; background: ${isCorrect ? '#ECFDF5' : '#FEF2F2'}; border: 2px solid ${isCorrect ? '#10B981' : '#EF4444'};">
                <h5 style="margin: 0 0 8px 0; color: ${isCorrect ? '#065F46' : '#991B1B'}; font-size: 1.05rem;">
                    ${isCorrect ? '🎉 ¡Respuesta Correcta! (+50 XP)' : '❌ Respuesta Incorrecta'}
                </h5>
                <p style="margin: 0 0 8px 0; color: #1E293B; font-size: 0.95rem;"><b>Análisis de tu respuesta:</b> ${retroElegida}</p>
                ${!isCorrect && retroCorrecta ? `<p style="margin: 0; color: #065F46; font-size: 0.95rem;"><b>💡 Justificación de la opción correcta (Opción ${String.fromCharCode(65 + parseInt(correctaIndex))}):</b> ${retroCorrecta}</p>` : ''}
            </div>
        `;
        feedbackBox.innerHTML = html;
        
        if (isCorrect) {
            let xpElem = document.getElementById('student-guide-header-xp');
            if (xpElem) {
                xpElem.innerText = parseInt(xpElem.innerText || 0) + 50;
            }
        }
    }
};

window.renderizarCierreGamificado = function(cierreData, isTeacher = false) {
    if (!cierreData) return '';
    let html = `
        <div style="margin-top: 35px; background: linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%); border: 2px solid #A855F7; border-radius: 12px; padding: 25px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <span style="font-size: 1.8rem;">🏆</span>
                <div>
                    <h3 style="color: #6B21A8; margin: 0; font-size: 1.35rem; font-weight: 800;">Cierre Gamificado de la Misión</h3>
                    <p style="color: #7E22CE; margin: 2px 0 0 0; font-size: 0.9rem;">Consolida los 10 conceptos fundamentales de la semana.</p>
                </div>
            </div>
    `;

    if (cierreData.sopa_letras) {
        let sopaId = 'sopa_final_' + Math.random().toString(36).substr(2, 9);
        let palabras = typeof cierreData.sopa_letras === 'string' ? cierreData.sopa_letras.split(',') : cierreData.sopa_letras;
        window.juegosPendientes.push(() => window.renderizarSopaLetras(sopaId, palabras));
        html += `
            <div style="background: white; border: 1px solid #D8B4FE; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                <h4 style="color: #6B21A8; margin-top: 0; display:flex; align-items:center; gap:8px;">🔍 Sopa de Letras Final (10 Conceptos Clave)</h4>
                <div id="${sopaId}">Cargando sopa de letras...</div>
            </div>
        `;
    }

    if (cierreData.crucigrama) {
        let crucId = 'crucigrama_final_' + Math.random().toString(36).substr(2, 9);
        window.juegosPendientes.push(() => window.renderizarCrucigrama(crucId, cierreData.crucigrama));
        html += `
            <div style="background: white; border: 1px solid #D8B4FE; border-radius: 10px; padding: 20px;">
                <h4 style="color: #6B21A8; margin-top: 0; display:flex; align-items:center; gap:8px;">✏️ Crucigrama Final (10 Desafíos Conceptuales)</h4>
                <div id="${crucId}">Cargando crucigrama...</div>
            </div>
        `;
    }

    html += `</div>`;
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
    const gradoSeleccionado = window.gradoActualEstudiante || '6';
    const gradoNum = window.normalizarGradoOCiclo ? window.normalizarGradoOCiclo(gradoSeleccionado) : gradoSeleccionado.replace(/[^0-9PENS]/g, '');
    let malla = null;
    if (asignatura.toLowerCase().includes('física')) malla = window.mallaFisica;
    else if (asignatura.toLowerCase().includes('química') || asignatura.toLowerCase().includes('quimica')) malla = window.mallaQuimica;
    else if (asignatura.toLowerCase().includes('matemática') || asignatura.toLowerCase().includes('matematica')) malla = window.mallaMatematicas;
    else if (asignatura.toLowerCase().includes('naturales') || asignatura.toLowerCase().includes('ciencias')) malla = window.mallaNaturales;
    else if (asignatura.toLowerCase().includes('sociales')) malla = window.mallaSociales;
    else if (asignatura.toLowerCase().includes('castellano') || asignatura.toLowerCase().includes('humanidades')) malla = window.mallaCastellano;
    else if (asignatura.toLowerCase().includes('turismo')) malla = window.mallaTurismo;
    else if (asignatura.toLowerCase().includes('artística') || asignatura.toLowerCase().includes('música') || asignatura.toLowerCase().includes('artistica')) malla = window.mallaArtistica;
    else if (asignatura.toLowerCase().includes('ética') || asignatura.toLowerCase().includes('etica')) malla = window.mallaEtica;
    
    let meta = "Aprender los conceptos básicos";
    let topico = "Introducción a la materia";
    
    const dataGrado = malla ? (malla[gradoNum] || malla[gradoSeleccionado] || malla['6']) : null;
    if (dataGrado) {
        meta = dataGrado.objetivo || meta;
        const semanaNum = parseInt(semanaStr, 10);
        let indexTema = '1';
        if (semanaNum >= 3 && semanaNum <= 4) indexTema = '3';
        else if (semanaNum >= 5 && semanaNum <= 6) indexTema = '5';
        else if (semanaNum >= 7 && semanaNum <= 8) indexTema = '7';
        if (dataGrado.periodos && dataGrado.periodos[periodo]) {
            topico = dataGrado.periodos[periodo][indexTema] || topico;
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
            grado: gradoSeleccionado,
            periodo,
            semana: semanaStr,
            meta,
            topico,
            rol: rolElem.options[rolElem.selectedIndex].text,
            ambiente: ambienteElem.options[ambienteElem.selectedIndex].text,
            nivel: nivelElem.options[nivelElem.selectedIndex].text,
            enfoque: enfoqueElem.options[enfoqueElem.selectedIndex].text
        };
        
        // Petición al endpoint VIP de generación
        const response = await fetch('/api/generate-guide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            let errMsg = "Error desconocido";
            try {
                const errData = await response.json();
                errMsg = errData.error || errData.details || errMsg;
            } catch(e){}
            innerContent.innerHTML = `<div style="padding: 20px; background: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px; color: #B91C1C;"><strong>No se pudo generar la guía:</strong> ${errMsg}</div>`;
            return;
        }
        
        let guideData;
        try {
            const rawData = await response.json();
            if (rawData && typeof rawData.text === 'string') {
                try {
                    guideData = JSON.parse(rawData.text);
                } catch(e) {
                    guideData = rawData;
                }
            } else if (rawData && rawData.text && typeof rawData.text === 'object') {
                guideData = rawData.text;
            } else {
                guideData = rawData;
            }
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
            
            const studentDisplayName = user.nombre || ((user.nombres || '') + ' ' + (user.apellidos || '')).trim() || 'Estudiante';
            document.getElementById('student-guide-header-name').innerText = studentDisplayName;
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
        
        // Objetivo y Pregunta Problematizadora
        if (guideData.objetivo_aprendizaje || guideData.pregunta_problematizadora) {
            htmlRenderizado += `
                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                    ${guideData.objetivo_aprendizaje ? `<p style="margin: 0 0 8px 0; color: #1E40AF;">🎯 <b>Objetivo de Aprendizaje:</b> ${guideData.objetivo_aprendizaje}</p>` : ''}
                    ${guideData.pregunta_problematizadora ? `<p style="margin: 0; color: #9A3412;">❓ <b>Pregunta Problematizadora:</b> <i>${guideData.pregunta_problematizadora}</i></p>` : ''}
                </div>
            `;
        }

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
            htmlRenderizado += `<h4 style="color: #4F46E5;">📖 Fase 1: Exploración (Texto Inductivo)</h4>`;
            htmlRenderizado += `<div class="markdown-body" style="font-size: 1.1rem; line-height: 1.6; color: #374151;">${window.procesarJuegosEnTexto(guideData.texto_inductivo)}</div>`;
        }

        if (guideData.recurso_visual) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 20px;">📊 Recurso Visual</h4>`;
            if (guideData.recurso_visual.includes('graph TD') || guideData.recurso_visual.includes('graph LR') || guideData.recurso_visual.includes('pie') || guideData.recurso_visual.includes('flowchart') || guideData.recurso_visual.includes('mermaid')) {
                let concepts = [];
                let regex = /[\[\(\{]([^\]\)\}]+)[\]\)\}]/g;
                let match;
                while ((match = regex.exec(guideData.recurso_visual)) !== null) {
                    if(match[1] && match[1].trim().length > 3 && !match[1].includes('#') && !match[1].includes('mermaid') && !match[1].includes('graph')) {
                        concepts.push(match[1].trim().replace(/['"]/g, ''));
                    }
                }
                let uniqueConcepts = [...new Set(concepts)];
                let instructionText = "Elabora en tu cuaderno un esquema, mapa mental o dibujo que resuma la información del texto.";
                if (uniqueConcepts.length > 0) {
                    let instructionsList = [
                        "🎨 <b>Misión de Mapa Mental:</b> Toma tu cuaderno de forma horizontal. En el centro, escribe el concepto principal de esta lista y enciérralo en una nube. Luego, saca flechas (ramificaciones) hacia los demás conceptos. Usa un color diferente para cada rama.",
                        "📏 <b>Misión de Tabla Organizadora:</b> Usa tu regla para dibujar una tabla amplia en tu cuaderno. En la primera columna, escribe cada uno de los conceptos de la lista. En la segunda columna, explica con tus propias palabras qué significa cada uno. En la tercera columna, da un ejemplo de la vida real.",
                        "🔗 <b>Misión de Esquema de Conectores:</b> Escribe los conceptos de la lista distribuidos por toda la página de tu cuaderno. Ahora, el reto es conectarlos con líneas. Sobre cada línea que dibujes, escribe una palabra de enlace (ej: 'sirve para', 'se divide en', 'produce').",
                        "🖍️ <b>Misión de Dibujo Explicativo:</b> Haz un dibujo grande y detallado en tu cuaderno donde aparezcan y se relacionen los conceptos de esta lista. Usa flechas y etiquetas para señalar dónde está cada concepto dentro de tu dibujo. ¡Ponle colores para que destaque!"
                    ];
                    let randIndex = Math.floor(Math.random() * instructionsList.length);
                    instructionText = instructionsList[randIndex] + "<br><br><div style='background: #e2e8f0; padding: 10px; border-radius: 6px; display:inline-block; text-align:left; margin-top: 5px;'><b>Conceptos a incluir obligatoriamente:</b><br>• " + uniqueConcepts.join("<br>• ") + "</div>";
                }
                htmlRenderizado += `<div style="text-align:center; padding:20px; border: 2px dashed #94A3B8; border-radius: 8px; color: #475569; background: #F8FAFC; margin-bottom: 20px;"><i>📝 <b>Instrucción para tu cuaderno:</b><br><br>${instructionText}</i></div>`;
            } else {
                htmlRenderizado += `<div class="markdown-body" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; overflow-x: auto;">${marked.parse(guideData.recurso_visual)}</div>`;
            }
        }
        
        // --- FASE DEDUCTIVA ---
        if (guideData.texto_deductivo) {
            htmlRenderizado += `<h4 style="color: #4F46E5; margin-top: 30px;">📖 Fase 2: Síntesis (Texto Deductivo)</h4>`;
            htmlRenderizado += `<div class="markdown-body" style="font-size: 1.1rem; line-height: 1.6; color: #374151;">${window.procesarJuegosEnTexto(guideData.texto_deductivo)}</div>`;
        }

        // ICFES Saber 11
        if (guideData.icfes) {
            htmlRenderizado += window.renderizarSeccionIcfes(guideData.icfes, false);
        }

        // Cierre Gamificado
        if (guideData.cierre_gamificado) {
            htmlRenderizado += window.renderizarCierreGamificado(guideData.cierre_gamificado, false);
        }

        htmlRenderizado += `<div style="text-align: center; margin-top: 35px; padding-bottom: 20px;">
                <button onclick="completarMisionActual()" style="background: #10B981; color: white; border: none; padding: 15px 35px; border-radius: 8px; font-weight: bold; font-size: 1.15rem; cursor: pointer; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: transform 0.2s;">✅ Completar Misión</button>
            </div>
        </div>`;

        innerContent.innerHTML = htmlRenderizado;
    if(window.renderizarBloquesEspeciales) window.renderizarBloquesEspeciales(innerContent);
    
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
window.renderizarSopaLetras = function(arg1, arg2) {
    let containerId = null;
    let palabras = [];
    
    if (arg2 !== undefined) {
        containerId = arg1;
        palabras = Array.isArray(arg2) ? arg2 : (typeof arg2 === 'string' ? arg2.split(',') : []);
    } else {
        palabras = Array.isArray(arg1) ? arg1 : (typeof arg1 === 'string' ? arg1.split(',') : []);
    }
    
    palabras = palabras.map(p => p.trim().toUpperCase()).filter(p => p.length > 0);
    
    const size = 14;
    let grid = Array(size).fill(null).map(() => Array(size).fill(''));
    const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    
    // Intentar ubicar palabras en la cuadrícula
    palabras.forEach((pal, idx) => {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 50) {
            attempts++;
            let dir = Math.random() > 0.5 ? 'H' : 'V'; // Horizontal o Vertical
            let row = Math.floor(Math.random() * (dir === 'H' ? size : size - pal.length + 1));
            let col = Math.floor(Math.random() * (dir === 'H' ? size - pal.length + 1 : size));
            
            let canPlace = true;
            for (let i = 0; i < pal.length; i++) {
                let r = dir === 'H' ? row : row + i;
                let c = dir === 'H' ? col + i : col;
                if (grid[r][c] !== '' && grid[r][c] !== pal[i]) {
                    canPlace = false;
                    break;
                }
            }
            if (canPlace) {
                for (let i = 0; i < pal.length; i++) {
                    let r = dir === 'H' ? row : row + i;
                    let c = dir === 'H' ? col + i : col;
                    grid[r][c] = pal[i];
                }
                placed = true;
            }
        }
    });

    // Llenar vacíos con letras aleatorias
    for(let r=0; r<size; r++) {
        for(let c=0; c<size; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = letras.charAt(Math.floor(Math.random() * letras.length));
            }
        }
    }

    let html = `
        <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; justify-content: center;">
            <div style="display: grid; grid-template-columns: repeat(${size}, minmax(22px, 28px)); gap: 3px; background: #F1F5F9; padding: 10px; border-radius: 8px; border: 1px solid #CBD5E1; user-select: none;">
    `;
    for(let r=0; r<size; r++) {
        for(let c=0; c<size; c++) {
            html += `<div style="aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: white; border-radius: 4px; font-weight: 700; font-size: 0.95rem; color: #1E293B; cursor: pointer; border: 1px solid #E2E8F0; transition: background 0.15s;" onclick="this.style.background = this.style.background === 'rgb(253, 230, 138)' ? 'white' : '#FDE68A'">${grid[r][c]}</div>`;
        }
    }
    html += `
            </div>
            <div style="flex: 1; min-width: 200px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #E2E8F0;">
                <p style="margin: 0 0 10px 0; font-weight: 700; color: #1E293B;">🔍 Palabras a encontrar (${palabras.length}):</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 6px;">
                    ${palabras.map(p => `
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 0.88rem; color: #475569; cursor: pointer;">
                            <input type="checkbox" onchange="this.parentElement.style.textDecoration = this.checked ? 'line-through' : 'none'; this.parentElement.style.color = this.checked ? '#10B981' : '#475569';">
                            <span>${p}</span>
                        </label>
                    `).join('')}
                </div>
                <button onclick="this.disabled=true; this.innerHTML='✅ ¡Sopa Completada! (+40 XP)'; this.style.background='#10B981'; mostrarHuevos();" style="margin-top: 15px; width: 100%; background: #F59E0B; color: white; border: none; padding: 8px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.2s;">
                    Verificar Sopa de Letras
                </button>
            </div>
        </div>
    `;
    
    if (containerId) {
        let el = document.getElementById(containerId);
        if (el) el.innerHTML = html;
    }
    return html;
};

// --- CRUCIGRAMA ---
window.renderizarCrucigrama = function(arg1, arg2) {
    let containerId = null;
    let datos = [];
    
    if (arg2 !== undefined) {
        containerId = arg1;
        datos = arg2;
    } else {
        datos = arg1;
    }
    
    if (typeof datos === 'string') {
        // Formato: "Pista 1|PALABRA1;Pista 2|PALABRA2"
        datos = datos.split(';').map(item => {
            let p = item.split('|');
            return {
                pista: p[0] ? p[0].trim() : 'Pista conceptual',
                palabra: p[1] ? p[1].trim() : ''
            };
        }).filter(d => d.palabra.length > 0);
    }
    
    if (!Array.isArray(datos)) datos = [];

    let html = `
        <div style="background: #F8FAFC; padding: 20px; border: 1px solid #CBD5E1; border-radius: 8px;">
            <p style="margin: 0 0 15px 0; color: #475569; font-size: 0.9rem;">Escribe la palabra correspondiente a cada pista conceptual en MAYÚSCULAS:</p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
    `;
    datos.forEach((item, idx) => {
        html += `
            <div style="background: white; padding: 12px 15px; border-radius: 8px; border: 1px solid #E2E8F0;">
                <p style="margin: 0 0 6px 0; font-size: 0.95rem; color: #1E293B;"><strong>${idx+1}.</strong> ${item.pista}</p>
                <input type="text" style="padding: 6px 10px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; border: 1.5px solid #CBD5E1; border-radius: 6px; width: 100%; max-width: 300px;" data-correct="${item.palabra}" placeholder="Escribe aquí..." oninput="verificarPalabraCrucigrama(this)">
            </div>
        `;
    });
    html += `
            </div>
            <button onclick="verificarCrucigramaCompleto(this, ${datos.length})" style="margin-top: 18px; background: #3B82F6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background 0.2s;">
                Validar Crucigrama Completo
            </button>
        </div>
    `;
    
    if (containerId) {
        let el = document.getElementById(containerId);
        if (el) el.innerHTML = html;
    }
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

    // Reemplazar bloques de Mermaid generados por markdown con un mensaje didáctico
    const mermaidBlocks = containerElement.querySelectorAll('pre code.language-mermaid');
    mermaidBlocks.forEach((block, index) => {
        let code = block.textContent;
        let concepts = [];
        let regex = /[\[\(\{]([^\]\)\}]+)[\]\)\}]/g;
        let match;
        while ((match = regex.exec(code)) !== null) {
            if(match[1] && match[1].trim().length > 3 && !match[1].includes('#') && !match[1].includes('mermaid') && !match[1].includes('graph')) {
                concepts.push(match[1].trim().replace(/['"]/g, ''));
            }
        }
        let uniqueConcepts = [...new Set(concepts)];
        let instructionText = "Elabora en tu cuaderno un esquema, mapa mental o dibujo que resuma la información del texto.";
        if (uniqueConcepts.length > 0) {
            let instructionsList = [
                "🎨 <b>Misión de Mapa Mental:</b> Toma tu cuaderno de forma horizontal. En el centro, escribe el concepto principal de esta lista y enciérralo en una nube. Luego, saca flechas (ramificaciones) hacia los demás conceptos. Usa un color diferente para cada rama.",
                "📏 <b>Misión de Tabla Organizadora:</b> Usa tu regla para dibujar una tabla amplia en tu cuaderno. En la primera columna, escribe cada uno de los conceptos de la lista. En la segunda columna, explica con tus propias palabras qué significa cada uno. En la tercera columna, da un ejemplo de la vida real.",
                "🔗 <b>Misión de Esquema de Conectores:</b> Escribe los conceptos de la lista distribuidos por toda la página de tu cuaderno. Ahora, el reto es conectarlos con líneas. Sobre cada línea que dibujes, escribe una palabra de enlace (ej: 'sirve para', 'se divide en', 'produce').",
                "🖍️ <b>Misión de Dibujo Explicativo:</b> Haz un dibujo grande y detallado en tu cuaderno donde aparezcan y se relacionen los conceptos de esta lista. Usa flechas y etiquetas para señalar dónde está cada concepto dentro de tu dibujo. ¡Ponle colores para que destaque!"
            ];
            let randIndex = Math.floor(Math.random() * instructionsList.length);
            instructionText = instructionsList[randIndex] + "<br><br><div style='background: #e2e8f0; padding: 10px; border-radius: 6px; display:inline-block; text-align:left; margin-top: 5px;'><b>Conceptos a incluir obligatoriamente:</b><br>• " + uniqueConcepts.join("<br>• ") + "</div>";
        }
        const divMsg = document.createElement('div');
        divMsg.style.cssText = "text-align:center; padding:20px; border: 2px dashed #94A3B8; border-radius: 8px; color: #475569; background: #F8FAFC; margin-bottom: 20px;";
        divMsg.innerHTML = "<i>📝 <b>Instrucción para tu cuaderno:</b><br><br>" + instructionText + "</i>";
        block.parentElement.parentNode.replaceChild(divMsg, block.parentElement);
    });

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
