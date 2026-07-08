document.addEventListener("DOMContentLoaded", function() {
    const btnShowReg = document.getElementById("btn-show-register");
    const btnCancelReg = document.getElementById("btn-cancel-register");
    const loginView = document.getElementById("login-screen-container");
    const regView = document.getElementById("register-screen-container");
    const dashboardView = document.getElementById("dashboard-screen-container");

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

    const loginBtn = document.getElementById("btn-login-core");
    const errorMsg = document.getElementById("login-error-msg");

    if (loginBtn) {
        loginBtn.addEventListener("click", async function(e) {
            e.preventDefault();
            const user = document.getElementById("admin-user") ? String(document.getElementById("admin-user").value).trim() : "";
            const pass = document.getElementById("admin-pass") ? String(document.getElementById("admin-pass").value).trim() : "";
            
            // 1. Acceso Maestro (Profesor)
            if (user === "jramirezgiraldo" && pass === "Biol2008%") {
                if (loginView) loginView.style.display = "none";
                if (dashboardView) dashboardView.style.display = "block";
                if (errorMsg) errorMsg.style.display = "none";
                cargarEstudiantesAdmin();
                return;
            }

            // 2. Acceso Estudiante (Validación en Python)
            if (!user || !pass) {
                if (errorMsg) { errorMsg.style.display = "block"; errorMsg.innerText = "Ingresa documento en ambos campos."; }
                return;
            }

            loginBtn.innerText = "Verificando...";
            
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: user, clave: pass })
                });
                
                const rawText = await res.text(); // Lee como texto primero
                let data;
                try {
                    data = JSON.parse(rawText);
                } catch (parseError) {
                    console.error("Respuesta cruda del servidor:", rawText);
                    throw new Error("El servidor no devolvió un JSON válido.");
                }
                
                if (data.status === 'success') {
                    loginView.style.display = "none";
                    if (errorMsg) errorMsg.style.display = "none";
                    
                    // Mostrar vista de estudiante
                    const studentView = document.getElementById("student-dashboard-container");
                    if (studentView) {
                        studentView.style.display = "block";
                        // Saludo
                        const welcomeMsg = document.getElementById("student-welcome-name");
                        if (welcomeMsg) welcomeMsg.innerText = "Bienvenido/a, " + data.nombre;
                        
                        // Mostrar solo la malla de su grado
                        const gradoLimpio = data.grado.replace('°', '').trim(); // Limpiar el string por si viene como "6°" o "6"
                        const mallaEstudiante = document.getElementById("student-malla-" + gradoLimpio);
                        if (mallaEstudiante) mallaEstudiante.style.display = "block";
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

    const btnSubmit = document.getElementById("btn-submit-register");
    if (btnSubmit) {
        btnSubmit.addEventListener("click", function(e) {
            e.preventDefault();
            
            const doc = document.getElementById("reg-documento") ? document.getElementById("reg-documento").value.trim() : "";
            const ap = document.getElementById("reg-apellidos") ? document.getElementById("reg-apellidos").value.trim() : "";
            const nom = document.getElementById("reg-nombre") ? document.getElementById("reg-nombre").value.trim() : "";
            const ed = document.getElementById("reg-edad") ? document.getElementById("reg-edad").value.trim() : "";
            const gen = document.getElementById("reg-genero") ? document.getElementById("reg-genero").value : "";
            const gra = document.getElementById("reg-grado") ? document.getElementById("reg-grado").value : "";

            if (!doc || !ap || !nom || !ed || !gen || !gra) {
                alert("⚠️ Por favor, completa todos los campos.");
                return;
            }

            btnSubmit.innerText = "Guardando...";
            btnSubmit.disabled = true;

            fetch("/api/registro-estudiante", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
            })
            .then(function(response) {
                if (response.ok) {
                    alert("✅ Estudiante registrado exitosamente.");
                    // Resetear formulario y volver
                    document.getElementById("register-screen-container").style.display = "none";
                    document.getElementById("login-screen-container").style.display = "grid";
                    document.getElementById("reg-documento").value = "";
                    document.getElementById("reg-apellidos").value = "";
                    document.getElementById("reg-nombre").value = "";
                    document.getElementById("reg-edad").value = "";
                    document.getElementById("reg-genero").value = "";
                    document.getElementById("reg-grado").value = "";
                    
                    // Actualizar dinámicamente la tabla del admin
                    if (typeof cargarEstudiantesAdmin === 'function') {
                        cargarEstudiantesAdmin();
                    }
                } else {
                    alert("❌ Error interno del servidor al guardar.");
                }
                btnSubmit.innerText = "Crear Estudiante";
                btnSubmit.disabled = false;
            })
            .catch(function(error) {
                alert("❌ Error de red. ¿Está ejecutándose el servidor Python?");
                btnSubmit.innerText = "Crear Estudiante";
                btnSubmit.disabled = false;
            });
        });
    }

    

    // ==========================================
// MÓDULO DE PANEL DOCENTE Y MALLAS (CORREGIDO)
// ==========================================

function normalizar(valor) {
    if (valor === null || valor === undefined) return '';
    return String(valor).replace('°', '').trim().toLowerCase();
}

async function cargarEstudiantesAdmin() {
    try {
        const res = await fetch('/api/estudiantes');
        const estudiantes = await res.json();
        
        // Busca el cuerpo de la tabla en el panel del administrador
        const tbody = document.querySelector('.table tbody') || document.getElementById('tbody-estudiantes') || document.getElementById('tabla-estudiantes-body'); 
        
        if (tbody) {
            tbody.innerHTML = ''; // Limpiar tabla
            estudiantes.forEach(est => {
                const gradoLimpio = normalizar(est.grado);
                
                // INYECCIÓN SEGURA CON BACKTICKS (PROHIBIDO CAMBIAR)
                tbody.innerHTML += `
                <tr class="fila-estudiante" data-grado="${gradoLimpio}" style="display: none;">
                    <td style="padding: 15px;">${est.documento || ''}</td>
                    <td style="padding: 15px; font-weight: bold;">${est.nombre || ''} ${est.apellidos || ''}</td>
                    <td style="padding: 15px; color: #10B981; font-weight: bold;">0 XP</td>
                    <td style="padding: 15px;"><button style="background:#10B981; color:white; border:none; padding:5px 10px; border-radius:5px;">+1</button></td>
                    <td style="padding: 15px;"><button style="background:#EF4444; color:white; border:none; padding:5px 10px; border-radius:5px;">-5</button></td>
                </tr>`;
            });
        }
    } catch (error) {
        console.error("Error cargando estudiantes:", error);
    }
}

// Lógica de Pestañas (Tabs) para Mallas y Estudiantes
const tabBtns = document.querySelectorAll('.tab-grado-btn, .tab-btn');
if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 1. Manejo de Estilos visuales de la pestaña
            tabBtns.forEach(b => {
                b.classList.remove('activa', 'active');
                b.style.borderBottom = '3px solid transparent';
                b.style.color = '#6B7280';
            });
            this.classList.add('activa', 'active');
            this.style.borderBottom = '3px solid #3B82F6';
            this.style.color = '#3B82F6';
            
            // 2. Obtener el grado seleccionado
            const rawTarget = this.getAttribute('data-target') || this.getAttribute('data-grado') || '';
            const gradoTarget = normalizar(rawTarget);
            
            // 3. Mostrar la malla curricular correspondiente
            document.querySelectorAll('.vista-grado, .malla-view').forEach(vista => {
                vista.style.display = 'none';
            });
            const mallaActiva = document.getElementById('contenido-grado-' + gradoTarget) || document.getElementById('admin-malla-' + gradoTarget);
            if (mallaActiva) {
                mallaActiva.style.display = 'block';
            }
            
            // 4. Filtrar los estudiantes en la tabla
            document.querySelectorAll('.fila-estudiante').forEach(fila => {
                const filaGrado = normalizar(fila.getAttribute('data-grado'));
                
                console.log(`[Filtro UI] Comparando Fila: '${filaGrado}' vs Pestaña: '${gradoTarget}'`);
                
                if (filaGrado === gradoTarget) {
                    fila.style.display = 'table-row'; // Mostrar como fila normal
                } else {
                    fila.style.display = 'none'; // Ocultar
                }
            });
        });
    });
}
});


// ==========================================
// FILTRO DE ESTRUCTURA CURRICULAR (MALLA)
// ==========================================
function filtrarContenido() {
    // Asumimos que existen selects globales o por grado con estos IDs o clases
    const selectPeriodo = document.getElementById('select-periodo');
    const selectSemana = document.getElementById('select-semana');
    
    if (!selectPeriodo || !selectSemana) return;
    
    const periodo = selectPeriodo.value.toLowerCase().trim();
    const semana = selectSemana.value.toLowerCase().trim();
    
    // Buscar la malla que actualmente esté visible
    const mallaActiva = document.querySelector('.malla-view[style*="display: block"]');
    if (!mallaActiva) return;
    
    // Obtener las filas de la tabla de la malla activa
    const filas = mallaActiva.querySelectorAll('table tbody tr');
    
    filas.forEach(fila => {
        // Obtenemos los valores de periodo y semana desde los data-attributes o clases
        const filaPeriodo = fila.getAttribute('data-periodo') ? fila.getAttribute('data-periodo').toLowerCase().trim() : '';
        const filaSemana = fila.getAttribute('data-semana') ? fila.getAttribute('data-semana').toLowerCase().trim() : '';
        
        // También soportamos si el usuario usa las clases .w-exp, .w-ind, etc. que representan semanas
        const claseSemanaMatch = Array.from(fila.classList).find(c => c.startsWith('w-'));
        const semanaPorClase = claseSemanaMatch ? claseSemanaMatch.replace('w-', 'semana ') : '';
        
        const targetSemana = filaSemana || semanaPorClase;
        
        // Si coinciden los filtros (o si el filtro está vacío/"todos"), se muestra
        const coincidePeriodo = (periodo === '' || periodo === 'todos' || filaPeriodo === periodo);
        const coincideSemana = (semana === '' || semana === 'todas' || targetSemana === semana || targetSemana.includes(semana));
        
        if (coincidePeriodo && coincideSemana) {
            fila.style.display = 'table-row';
        } else {
            fila.style.display = 'none';
        }
    });
}

// Escuchar cambios en los selects
document.addEventListener('DOMContentLoaded', () => {
    const pSel = document.getElementById('select-periodo');
    const sSel = document.getElementById('select-semana');
    if(pSel) pSel.addEventListener('change', filtrarContenido);
    if(sSel) sSel.addEventListener('change', filtrarContenido);
});
