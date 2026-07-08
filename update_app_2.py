with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the previous logic block
start_str = "// LOGICA DE INTERFAZ Y FILTRADO (DOCENTE)"
start_idx = js.find(start_str)

if start_idx != -1:
    end_idx = js.rfind("});")
    if end_idx != -1:
        new_logic = '''// LOGICA DE INTERFAZ Y FILTRADO (DOCENTE)
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const periodoSelect = document.getElementById('periodo-select');
    const semanaSelect = document.getElementById('semana-select');
    
    async function cargarEstudiantesAdmin() {
        try {
            const res = await fetch('/api/estudiantes');
            const estudiantes = await res.json();
            const tbody = document.getElementById('tabla-estudiantes-body');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            let count = 0;
            estudiantes.forEach(est => {
                const gradoLimpio = est.grado ? est.grado.replace('°', '').trim() : '';
                const tr = document.createElement('tr');
                tr.className = 'fila-estudiante';
                tr.setAttribute('data-grado', gradoLimpio);
                tr.innerHTML = 
                    <td style="padding: 15px;"></td>
                    <td style="padding: 15px; font-weight: bold;"> </td>
                    <td style="padding: 15px; color: #10B981; font-weight: bold;">0 XP</td>
                    <td style="padding: 15px;"><button style="background:#10B981; color:white; border:none; padding:5px 10px; border-radius:5px;">+1</button></td>
                    <td style="padding: 15px;"><button style="background:#EF4444; color:white; border:none; padding:5px 10px; border-radius:5px;">-5</button></td>
                ;
                tbody.appendChild(tr);
                count++;
            });
            
            if(count === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 60px 20px; color: #9CA3AF; font-style: italic;">No hay estudiantes registrados.</td></tr>';
            }
            
            // Activar por defecto el grado 6 si existe algun tab activo
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                activarVistaGrado(activeTab.getAttribute('data-target'));
            }
        } catch(e) {
            console.error("Error cargando estudiantes:", e);
        }
    }

    function activarVistaGrado(grado) {
        // Estilos tabs
        tabBtns.forEach(btn => {
            if (btn.getAttribute('data-target') === grado) {
                btn.style.borderBottom = '3px solid #3B82F6';
                btn.style.color = '#3B82F6';
                btn.classList.add('active');
            } else {
                btn.style.borderBottom = '3px solid transparent';
                btn.style.color = '#6B7280';
                btn.classList.remove('active');
            }
        });
        
        // Vistas de Mallas
        document.querySelectorAll('.vista-grado').forEach(v => v.style.display = 'none');
        const vistaActiva = document.getElementById('contenido-grado-' + grado);
        if (vistaActiva) vistaActiva.style.display = 'block';

        // Filas de Estudiantes
        const filas = document.querySelectorAll('.fila-estudiante');
        filas.forEach(fila => {
            if (fila.getAttribute('data-grado') === grado) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
        
        aplicarFiltrosPlaneacion();
    }
    
    function aplicarFiltrosPlaneacion() {
        const periodo = periodoSelect ? periodoSelect.value : '';
        const semana = semanaSelect ? semanaSelect.value : '';
        
        // Asume que los tr de planeacion tienen atributos data-periodo y data-semana
        const mallasVisibles = document.querySelectorAll('.vista-grado[style*="display: block"] tr[data-periodo]');
        mallasVisibles.forEach(fila => {
            const fP = fila.getAttribute('data-periodo');
            const fS = fila.getAttribute('data-semana');
            
            if ((!periodo || fP === periodo) && (!semana || fS === semana)) {
                fila.style.display = '';
            } else {
                fila.style.display = 'none';
            }
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            activarVistaGrado(this.getAttribute('data-target'));
        });
    });
    
    if (periodoSelect) periodoSelect.addEventListener('change', aplicarFiltrosPlaneacion);
    if (semanaSelect) semanaSelect.addEventListener('change', aplicarFiltrosPlaneacion);
    
    // Al entrar al panel docente
    const btnAdminLogin = document.getElementById("btn-login-core");
    if (btnAdminLogin) {
        btnAdminLogin.addEventListener("click", function() {
            // El login de admin verdadero esta arriba y recarga a la vista dashboard.
            // Para asegurar que se carguen los estudiantes cuando se muestra el dashboard:
            setTimeout(() => {
                if(document.getElementById("dashboard-screen-container").style.display === "block") {
                    cargarEstudiantesAdmin();
                }
            }, 500);
        });
    }
'''
        # Let's fix the auto-load of students on admin login block instead of settimeout
        js = js[:start_idx - 5] + ui_logic + js[end_idx:]

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

# Wait, in app.js, the admin login returns early:
# if (user === "jramirezgiraldo" && pass === "Biol2008%") {
#    if (loginView) loginView.style.display = "none";
#    if (dashboardView) dashboardView.style.display = "block";
#    cargarEstudiantesAdmin();
#    return;
# }
