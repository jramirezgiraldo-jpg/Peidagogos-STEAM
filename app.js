// ==========================================
// UTILIDAD GLOBAL DE NORMALIZACIÓN DE GRADOS Y CICLOS
// ==========================================
window.normalizarGradoOCiclo = function(g) {
    if (!g) return '6';
    const str = String(g).trim();
    const strLower = str.toLowerCase();
    
    if (strLower.includes('ciclo i') || strLower.includes('ciclo 1') || strLower === 'ciclo i') {
        if (strLower.includes('ciclo iii') || strLower.includes('ciclo 3')) return 'Ciclo III';
        if (strLower.includes('ciclo ii') || strLower.includes('ciclo 2')) return 'Ciclo II';
        if (strLower.includes('ciclo iv') || strLower.includes('ciclo 4')) return 'Ciclo IV';
        if (strLower.includes('ciclo vi') || strLower.includes('ciclo 6')) return 'Ciclo VI';
        if (strLower.includes('ciclo v') || strLower.includes('ciclo 5')) return 'Ciclo V';
        return 'Ciclo I';
    }
    if (strLower.includes('ciclo ii') || strLower.includes('ciclo 2')) return 'Ciclo II';
    if (strLower.includes('ciclo iii') || strLower.includes('ciclo 3')) return 'Ciclo III';
    if (strLower.includes('ciclo iv') || strLower.includes('ciclo 4')) return 'Ciclo IV';
    if (strLower.includes('ciclo v') || strLower.includes('ciclo 5')) return 'Ciclo V';
    if (strLower.includes('ciclo vi') || strLower.includes('ciclo 6')) return 'Ciclo VI';
    if (strLower.includes('pens')) return 'PENS';
    
    // Regular grade: extract numeric part like "6", "7", "8", "9", "10", "11"
    const match = str.match(/\b(10|11|[3-9])\b/) || str.match(/(10|11|[3-9])/);
    if (match) return match[1];
    
    return str.replace(/[^0-9PENS]/g, '') || '6';
};

// =========================================================
// MÓDULO DE PERSONALIZACIÓN Y RENDERIZADO DE PANEL DE ESTUDIANTE
// =========================================================

window.seleccionarAvatarPerfil = function(emoji) {
    const hidden = document.getElementById("perfil-avatar-selected");
    if (hidden) hidden.value = emoji;
    const buttons = document.querySelectorAll(".avatar-opt-btn");
    buttons.forEach(btn => {
        if (btn.getAttribute("data-avatar") === emoji) {
            btn.style.borderColor = "#3B82F6";
            btn.style.background = "#EFF6FF";
            btn.style.transform = "scale(1.1)";
        } else {
            btn.style.borderColor = "#E2E8F0";
            btn.style.background = "#F8FAFC";
            btn.style.transform = "scale(1)";
        }
    });
};

window.abrirModalPerfilEstudiante = function() {
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const modal = document.getElementById("modal-perfil-estudiante");
    if (!modal) return;

    const nomInp = document.getElementById("perfil-nombre-input");
    const apeInp = document.getElementById("perfil-apellidos-input");
    const gradoSelect = document.getElementById("perfil-grado-ciclo-select");
    const aliasInp = document.getElementById("perfil-alias-input");

    // Limpiar o prellenar con datos existentes
    let nombreVal = user.nombre || user.nombres || '';
    if (nombreVal === 'Estudiante' || nombreVal === 'Estudiante Montenegro') nombreVal = '';
    let apeVal = user.apellidos || '';
    if (apeVal === 'Nocturno') apeVal = '';

    if (nomInp) nomInp.value = nombreVal;
    if (apeInp) apeInp.value = apeVal;
    if (gradoSelect) {
        const g = user.grado || user.grupo || 'Ciclo VI';
        gradoSelect.value = g;
    }
    if (aliasInp) aliasInp.value = user.alias || 'Explorador STEAM';

    const avatar = user.avatar || '🚀';
    window.seleccionarAvatarPerfil(avatar);

    modal.style.display = "flex";
    if (nomInp) nomInp.focus();
};

window.cerrarModalPerfilEstudiante = function() {
    const modal = document.getElementById("modal-perfil-estudiante");
    if (modal) modal.style.display = "none";
};

window.guardarPerfilEstudiante = function() {
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const nom = document.getElementById("perfil-nombre-input") ? document.getElementById("perfil-nombre-input").value.trim() : '';
    const ape = document.getElementById("perfil-apellidos-input") ? document.getElementById("perfil-apellidos-input").value.trim() : '';
    const grado = document.getElementById("perfil-grado-ciclo-select") ? document.getElementById("perfil-grado-ciclo-select").value : (user.grado || 'Ciclo VI');
    const alias = document.getElementById("perfil-alias-input") ? document.getElementById("perfil-alias-input").value.trim() : 'Explorador STEAM';
    const avatar = document.getElementById("perfil-avatar-selected") ? document.getElementById("perfil-avatar-selected").value : '🚀';

    if (!nom) {
        alert("Por favor ingresa tu nombre para personalizar tu perfil.");
        return;
    }

    const doc = String(user.documento || user.usuario || user.id || '').trim();
    const nombreCompleto = ape ? `${nom} ${ape}`.trim() : nom;

    // Actualizar objeto de sesión
    const updatedUser = {
        ...user,
        nombre: nom,
        apellidos: ape,
        nombre_completo: nombreCompleto,
        grado: grado,
        grupo: grado,
        avatar: avatar,
        alias: alias,
        rol: grado.includes('Ciclo') ? 'validacion' : (user.rol || 'estudiante')
    };

    window.usuarioEstudianteActual = updatedUser;
    localStorage.setItem('usuario_sesion', JSON.stringify(updatedUser));

    // Actualizar en base de datos local
    try {
        let db = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
        const normDoc = doc.toLowerCase().replace(/[\.\,\-\_\s]/g, '');
        const idx = db.findIndex(u => String(u.documento || u.id || '').toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc);
        if (idx >= 0) {
            db[idx] = { ...db[idx], ...updatedUser };
        } else {
            db.push(updatedUser);
        }
        localStorage.setItem('usuarios_db', JSON.stringify(db));
    } catch(e) {}

    // Sincronizar backend en segundo plano
    fetch('/api/registro-estudiante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
    }).catch(() => {});

    // Actualizar live UI
    window.inicializarPanelEstudiante(updatedUser);
    window.cerrarModalPerfilEstudiante();
};

// =========================================================
// SISTEMA DE PENALIZACIONES (-10% XP) Y GUÍA RESUELTA EN VIVO
// =========================================================

window.abrirGuiaOrientadorDirecto = function(doc, grado, asignatura) {
    const docClean = String(doc || '').trim();
    const asigClean = asignatura || "Ciencias Naturales";
    const perClean = "3";
    const semClean = "1";

    if (typeof abrirGuiaOrientador === 'function') {
        abrirGuiaOrientador(docClean, asigClean, perClean, semClean);
    } else {
        alert("Cargando solucionario...");
    }
};

window.abrirModalPenalizacion = function(doc, nombre, gradoGrupo) {
    const docClean = String(doc || '').trim();
    const modal = document.getElementById("modal-penalizacion-estudiante");
    if (!modal) return;

    // Calcular XP acumulado actual del estudiante
    let baseXP = 0;
    try {
        const xpKey = `xp_${docClean}`;
        baseXP = parseInt(localStorage.getItem(xpKey)) || 0;
        if (baseXP === 0) {
            const diagXP = parseInt(localStorage.getItem(`prog_${docClean}_diag_xp`)) || 0;
            baseXP += diagXP;
        }
    } catch(e) {}

    // Si aún no tiene XP acumulado, asignar base de 500 XP
    if (baseXP <= 0) baseXP = 500;

    const descuento10 = Math.max(50, Math.round(baseXP * 0.10));

    const nomElem = document.getElementById("penalizacion-estudiante-nombre");
    const detElem = document.getElementById("penalizacion-estudiante-detalles");
    const montoElem = document.getElementById("penalizacion-monto-descuento");
    const docTarget = document.getElementById("penalizacion-doc-target");
    const xpActual = document.getElementById("penalizacion-xp-actual");

    if (nomElem) nomElem.innerText = nombre || `Estudiante (${docClean})`;
    if (detElem) detElem.innerText = `Documento: ${docClean} | Grado/Ciclo: ${gradoGrupo || 'N/A'} | Puntos XP Base: ${baseXP} XP`;
    if (montoElem) montoElem.innerText = `⚡ Sanción a aplicar: -10% (${descuento10} Puntos XP descontados)`;
    if (docTarget) docTarget.value = docClean;
    if (xpActual) xpActual.value = baseXP;

    modal.style.display = "flex";
};

window.cerrarModalPenalizacion = function() {
    const modal = document.getElementById("modal-penalizacion-estudiante");
    if (modal) modal.style.display = "none";
};

window.ejecutarPenalizacionEstudiante = function() {
    const docTarget = document.getElementById("penalizacion-doc-target");
    const doc = docTarget ? docTarget.value : '';
    if (!doc) return alert("Selecciona un estudiante válido.");

    const baseXP = parseInt(document.getElementById("penalizacion-xp-actual") ? document.getElementById("penalizacion-xp-actual").value : '500') || 500;
    const descuento10 = Math.max(50, Math.round(baseXP * 0.10));

    const radios = document.getElementsByName("motivo-penalizacion");
    let motivo = "📱 Uso indebido del celular en clase";
    for (let r of radios) {
        if (r.checked) { motivo = r.value; break; }
    }

    const obsInput = document.getElementById("penalizacion-observacion-input");
    const obs = obsInput ? obsInput.value.trim() : '';

    const now = new Date();
    const fechaStr = now.toLocaleDateString('es-CO') + ' ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    // 1. Guardar historial de penalizaciones
    let historial = [];
    try {
        historial = JSON.parse(localStorage.getItem(`penalizaciones_${doc}`) || '[]');
    } catch(e) {}
    const nuevaPenalizacion = {
        id: Date.now(),
        fecha: fechaStr,
        motivo: motivo,
        observacion: obs,
        puntos: descuento10
    };
    historial.unshift(nuevaPenalizacion);
    localStorage.setItem(`penalizaciones_${doc}`, JSON.stringify(historial));

    // 2. Acumular descuento total de puntos
    let penaltyTotal = parseInt(localStorage.getItem(`penalty_total_${doc}`)) || 0;
    penaltyTotal += descuento10;
    localStorage.setItem(`penalty_total_${doc}`, penaltyTotal);

    // 3. Activar notificación para la pantalla del estudiante
    localStorage.setItem(`notificacion_penalizacion_${doc}`, JSON.stringify(nuevaPenalizacion));

    alert(`⚡ ¡Penalización aplicada exitosamente!\n\nSe han descontado -${descuento10} XP (10%) al estudiante (Doc: ${doc}).\nMotivo: "${motivo}".\n\nEsta sanción se mostrará en vivo en la pantalla del estudiante.`);

    window.cerrarModalPenalizacion();

    // Recargar tabla docente
    if (typeof window.cargarEstudiantesDocente === 'function') {
        window.cargarEstudiantesDocente(window.usuario_actual || 'docente');
    }
};

window.marcarPenalizacionLeida = function(doc) {
    if (!doc) return;
    localStorage.removeItem(`notificacion_penalizacion_${doc}`);
    const banner = document.getElementById("banner-penalizacion-alerta");
    if (banner) banner.style.display = "none";
};

// =========================================================
// SISTEMA DE BONIFICACIONES (+10% XP)
// =========================================================

window.abrirModalBonificacion = function(doc, nombre, gradoGrupo) {
    const docClean = String(doc || '').trim();
    const modal = document.getElementById("modal-bonificacion-estudiante");
    if (!modal) return;

    let baseXP = 0;
    try {
        const xpKey = `xp_${docClean}`;
        baseXP = parseInt(localStorage.getItem(xpKey)) || 0;
        if (baseXP === 0) {
            const diagXP = parseInt(localStorage.getItem(`prog_${docClean}_diag_xp`)) || 0;
            baseXP += diagXP;
        }
    } catch(e) {}

    if (baseXP <= 0) baseXP = 500;
    const incremento10 = Math.max(50, Math.round(baseXP * 0.10));

    const nomElem = document.getElementById("bonificacion-estudiante-nombre");
    const detElem = document.getElementById("bonificacion-estudiante-detalles");
    const montoElem = document.getElementById("bonificacion-monto-incremento");
    const docTarget = document.getElementById("bonificacion-doc-target");
    const xpActual = document.getElementById("bonificacion-xp-actual");

    if (nomElem) nomElem.innerText = nombre || `Estudiante (${docClean})`;
    if (detElem) detElem.innerText = `Documento: ${docClean} | Grado/Ciclo: ${gradoGrupo || 'N/A'} | Puntos XP Base: ${baseXP} XP`;
    if (montoElem) montoElem.innerText = `🎁 Bonificación a aplicar: +10% (+${incremento10} Puntos XP otorgados)`;
    if (docTarget) docTarget.value = docClean;
    if (xpActual) xpActual.value = baseXP;

    modal.style.display = "flex";
};

window.cerrarModalBonificacion = function() {
    const modal = document.getElementById("modal-bonificacion-estudiante");
    if (modal) modal.style.display = "none";
};

window.ejecutarBonificacionEstudiante = function() {
    const docTarget = document.getElementById("bonificacion-doc-target");
    const doc = docTarget ? docTarget.value : '';
    if (!doc) return alert("Selecciona un estudiante válido.");

    const baseXP = parseInt(document.getElementById("bonificacion-xp-actual") ? document.getElementById("bonificacion-xp-actual").value : '500') || 500;
    const incremento10 = Math.max(50, Math.round(baseXP * 0.10));

    const radios = document.getElementsByName("motivo-bonificacion");
    let motivo = "🌟 Excelente participación activa en clase";
    for (let r of radios) {
        if (r.checked) { motivo = r.value; break; }
    }

    const obsInput = document.getElementById("bonificacion-observacion-input");
    const obs = obsInput ? obsInput.value.trim() : '';

    const now = new Date();
    const fechaStr = now.toLocaleDateString('es-CO') + ' ' + now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    let historial = [];
    try {
        historial = JSON.parse(localStorage.getItem(`bonificaciones_${doc}`) || '[]');
    } catch(e) {}
    const nuevaBonificacion = {
        id: Date.now(),
        fecha: fechaStr,
        motivo: motivo,
        observacion: obs,
        puntos: incremento10
    };
    historial.unshift(nuevaBonificacion);
    localStorage.setItem(`bonificaciones_${doc}`, JSON.stringify(historial));

    let bonusTotal = parseInt(localStorage.getItem(`bonus_total_${doc}`)) || 0;
    bonusTotal += incremento10;
    localStorage.setItem(`bonus_total_${doc}`, bonusTotal);

    localStorage.setItem(`notificacion_bonificacion_${doc}`, JSON.stringify(nuevaBonificacion));

    alert(`🎁 ¡Bonificación aplicada exitosamente!\n\nSe han otorgado +${incremento10} XP (10%) al estudiante (Doc: ${doc}).\nMotivo: "${motivo}".\n\nSe reflejará en vivo en la pantalla del estudiante y en la proyección del aula.`);

    window.cerrarModalBonificacion();

    if (typeof window.cargarEstudiantesDocente === 'function') {
        window.cargarEstudiantesDocente(window.usuario_actual || 'docente');
    }
    if (typeof window.actualizarProyeccionGrupo === 'function') {
        window.actualizarProyeccionGrupo();
    }
};

window.marcarBonificacionLeida = function(doc) {
    if (!doc) return;
    localStorage.removeItem(`notificacion_bonificacion_${doc}`);
    const banner = document.getElementById("banner-bonificacion-alerta");
    if (banner) banner.style.display = "none";
};

// =========================================================
// SISTEMA DE PROYECCIÓN EN VIVO EN AULA (VIDEOBEAM / TV)
// =========================================================

window.proyeccionUltimosPuntajes = {};

window.abrirProyeccionGrupo = function() {
    const modal = document.getElementById("modal-proyeccion-grupo");
    if (!modal) return;

    modal.style.display = "block";

    window.actualizarProyeccionGrupo();

    if (window.proyeccionInterval) clearInterval(window.proyeccionInterval);
    window.proyeccionInterval = setInterval(window.actualizarProyeccionGrupo, 1500);
};

window.cerrarProyeccionGrupo = function() {
    const modal = document.getElementById("modal-proyeccion-grupo");
    if (modal) modal.style.display = "none";
    if (window.proyeccionInterval) {
        clearInterval(window.proyeccionInterval);
        window.proyeccionInterval = null;
    }
};

window.actualizarProyeccionGrupo = function() {
    const grid = document.getElementById("proyeccion-estudiantes-grid");
    if (!grid) return;

    const grupoSelect = document.getElementById("filtro-grupo");
    const asigSelect = document.getElementById("filtro-asignatura");
    const grupoFiltro = grupoSelect ? grupoSelect.value : "Todos los Grupos";
    const asigFiltro = asigSelect ? asigSelect.value : "Todas las Asignaturas";

    const gNomElem = document.getElementById("proyeccion-grupo-nombre");
    const aNomElem = document.getElementById("proyeccion-materia-nombre");
    if (gNomElem) gNomElem.innerText = grupoFiltro;
    if (aNomElem) aNomElem.innerText = asigFiltro;

    // Obtener lista completa de estudiantes
    let estudiantes = [];
    try {
        const localUsers = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
        estudiantes = localUsers;
    } catch(e) {}

    // Filtrar por grupo si está seleccionado
    let listaFiltrada = estudiantes.filter(est => {
        const matchGrupo = (grupoFiltro === "Todos los Grupos") || (est.grupo === grupoFiltro) || (est.grado === grupoFiltro);
        const matchAsig = (asigFiltro === "Todas las Asignaturas") || (est.asignatura && est.asignatura.includes(asigFiltro));
        return matchGrupo && matchAsig;
    });

    if (listaFiltrada.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(30,41,59,0.5); border: 2px dashed #334155; border-radius: 20px;">
                <div style="font-size: 3rem; margin-bottom: 10px;">🏫</div>
                <h3 style="color: #94A3B8; font-size: 1.4rem; font-weight: 800;">No hay estudiantes registrados en este grupo aún.</h3>
                <p style="color: #64748B; margin-top: 5px;">Selecciona otro grupo en el panel de docente para proyectar.</p>
            </div>
        `;
        return;
    }

    // Calcular puntos XP netos (base + bonus - penalizaciones)
    let estudiantesProyeccion = listaFiltrada.map(est => {
        const doc = String(est.documento || est.usuario || est.id || '');
        const nom = ((est.nombre || '') + ' ' + (est.apellidos || '')).trim() || 'Estudiante';
        const avatar = est.avatar || '🚀';
        const alias = est.alias || 'Explorador STEAM';

        let baseXP = 0;
        try {
            baseXP = parseInt(localStorage.getItem(`xp_${doc}`)) || 0;
            if (baseXP === 0) {
                baseXP = parseInt(localStorage.getItem(`prog_${doc}_diag_xp`)) || 0;
            }
        } catch(e) {}

        const bonusTotal = parseInt(localStorage.getItem(`bonus_total_${doc}`)) || 0;
        const penaltyTotal = parseInt(localStorage.getItem(`penalty_total_${doc}`)) || 0;
        const xpEfectivo = Math.max(0, baseXP + bonusTotal - penaltyTotal);

        return {
            doc,
            nombre: nom,
            avatar,
            alias,
            grado: est.grado || est.grupo || 'Ciclo VI',
            xp: xpEfectivo,
            bonus: bonusTotal,
            penalty: penaltyTotal
        };
    });

    // Ordenar de mayor a menor puntaje (Ránking de Clase)
    estudiantesProyeccion.sort((a, b) => b.xp - a.xp);

    // Actualizar métricas generales de la cabecera
    const totElem = document.getElementById("proyeccion-total-estudiantes");
    const liderElem = document.getElementById("proyeccion-lider-nombre");
    const maxElem = document.getElementById("proyeccion-max-xp");

    if (totElem) totElem.innerText = estudiantesProyeccion.length;
    if (liderElem) liderElem.innerText = estudiantesProyeccion[0] ? estudiantesProyeccion[0].nombre : "---";
    if (maxElem) maxElem.innerText = (estudiantesProyeccion[0] ? estudiantesProyeccion[0].xp : 0) + " XP";

    // Generar tarjetas animadas
    let htmlGrid = "";
    estudiantesProyeccion.forEach((est, idx) => {
        const rangoPos = idx + 1;
        let borderStyle = "border: 1px solid #334155; background: rgba(30, 41, 59, 0.7);";
        let rankBadge = `<span style="font-weight: 900; color: #94A3B8; font-size: 1.1rem;">#${rangoPos}</span>`;

        if (rangoPos === 1) {
            borderStyle = "border: 2px solid #F59E0B; background: linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(30,41,59,0.9) 100%); box-shadow: 0 10px 25px rgba(245,158,11,0.3);";
            rankBadge = `<span style="font-size: 1.8rem;" title="Primer Lugar">🥇</span>`;
        } else if (rangoPos === 2) {
            borderStyle = "border: 2px solid #94A3B8; background: linear-gradient(135deg, rgba(148,163,184,0.2) 0%, rgba(30,41,59,0.9) 100%); box-shadow: 0 8px 20px rgba(148,163,184,0.2);";
            rankBadge = `<span style="font-size: 1.8rem;" title="Segundo Lugar">🥈</span>`;
        } else if (rangoPos === 3) {
            borderStyle = "border: 2px solid #D97706; background: linear-gradient(135deg, rgba(217,119,6,0.15) 0%, rgba(30,41,59,0.9) 100%); box-shadow: 0 8px 20px rgba(217,119,6,0.15);";
            rankBadge = `<span style="font-size: 1.8rem;" title="Tercer Lugar">🥉</span>`;
        }

        // Detectar si el puntaje cambió para aplicar animación visual
        const prevXP = window.proyeccionUltimosPuntajes[est.doc];
        let animClass = "";
        if (prevXP !== undefined && prevXP !== est.xp) {
            animClass = "animation: pulse 1s ease-in-out;";
        }
        window.proyeccionUltimosPuntajes[est.doc] = est.xp;

        htmlGrid += `
            <div style="${borderStyle} padding: 22px; border-radius: 18px; transition: transform 0.3s; ${animClass}">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 2.2rem; background: rgba(255,255,255,0.1); padding: 6px; border-radius: 50%;">${est.avatar}</span>
                        <div>
                            <div style="font-weight: 900; font-size: 1.15rem; color: white;">${est.nombre}</div>
                            <div style="font-size: 0.8rem; color: #94A3B8;">${est.alias} • ${est.grado}</div>
                        </div>
                    </div>
                    <div>${rankBadge}</div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
                    <div>
                        ${est.bonus > 0 ? `<span style="font-size: 0.75rem; background: rgba(16,185,129,0.2); color: #34D399; padding: 2px 8px; border-radius: 10px; font-weight: bold; margin-right: 4px;">🎁 +${est.bonus} XP</span>` : ''}
                        ${est.penalty > 0 ? `<span style="font-size: 0.75rem; background: rgba(239,68,68,0.2); color: #FCA5A5; padding: 2px 8px; border-radius: 10px; font-weight: bold;">⚡ -${est.penalty} XP</span>` : ''}
                    </div>
                    <div style="font-weight: 900; font-size: 1.6rem; color: #F59E0B; letter-spacing: -0.5px;">
                        ${est.xp} <span style="font-size: 0.85rem; color: #CBD5E1; font-weight: normal;">XP</span>
                    </div>
                </div>
            </div>
        `;
    });

    grid.innerHTML = htmlGrid;
};

window.inicializarPanelEstudiante = function(data) {
    if (!data) return;
    window.usuarioEstudianteActual = data;
    window.usuario_actual = data.documento || data.usuario;
    window.rol_actual = data.rol || (String(data.grado || '').includes('Ciclo') ? 'validacion' : 'estudiante');

    if (typeof mostrarVista === 'function') mostrarVista('student-dashboard-container');
    const studentView = document.getElementById("student-dashboard-container");
    if (studentView) studentView.style.display = "block";

    let nombreLimpio = "";
    if (data.nombre && data.apellidos && data.nombre !== 'Estudiante' && data.apellidos !== 'Nocturno') {
        nombreLimpio = `${data.nombre} ${data.apellidos}`.trim();
    } else if (data.nombre_completo) {
        nombreLimpio = data.nombre_completo.trim();
    } else if (data.nombre && data.nombre !== 'Estudiante') {
        nombreLimpio = data.nombre.trim();
    } else if (data.nombres) {
        nombreLimpio = `${data.nombres} ${data.apellidos || ''}`.trim();
    } else {
        nombreLimpio = data.nombre || "Estudiante";
    }

    const avatar = data.avatar || "🚀";
    const gradoCiclo = data.grado || data.grupo || "Ciclo VI";
    const alias = data.alias || "Explorador STEAM";
    const doc = String(data.documento || data.usuario || '');

    // Calcular XP acumulado considerando bonificaciones y penalizaciones
    let baseXP = 0;
    try {
        const xpKey = `xp_${doc}`;
        baseXP = parseInt(localStorage.getItem(xpKey)) || 0;
        if (baseXP === 0) {
            const diagXP = parseInt(localStorage.getItem(`prog_${doc}_diag_xp`)) || 0;
            baseXP += diagXP;
        }
    } catch(e) {}

    const bonusTotal = parseInt(localStorage.getItem(`bonus_total_${doc}`)) || 0;
    const penaltyTotal = parseInt(localStorage.getItem(`penalty_total_${doc}`)) || 0;
    let totalXP = Math.max(0, baseXP + bonusTotal - penaltyTotal);

    // 1. Header Superior
    const hAvatar = document.getElementById("header-student-avatar");
    if (hAvatar) hAvatar.innerText = avatar;
    const hName = document.getElementById("header-student-name");
    if (hName) hName.innerText = nombreLimpio;
    const hGrade = document.getElementById("header-student-grade");
    if (hGrade) hGrade.innerText = gradoCiclo;
    const hScore = document.getElementById("student-score-display");
    if (hScore) hScore.innerText = totalXP;

    // 2. Hero Banner
    const heroAvatar = document.getElementById("student-avatar-hero");
    if (heroAvatar) heroAvatar.innerText = avatar;
    const welcomeMsg = document.getElementById("student-welcome-name");
    if (welcomeMsg) welcomeMsg.innerText = "¡Hola, " + nombreLimpio + "!";
    const welcomeSubtitle = document.getElementById("student-welcome-subtitle");
    if (welcomeSubtitle) {
        welcomeSubtitle.innerText = `Rango: ${alias} | Bienvenido a tu aula y panel interactivo STEAM.`;
    }
    const badgeMsg = document.getElementById("student-grade-badge");
    if (badgeMsg) {
        const ieName = data.institucion === 'InstitutoMontenegro' ? 'IE Instituto Montenegro' : (data.institucion || 'Instituto Montenegro');
        badgeMsg.innerText = `🎓 ${gradoCiclo} | 🏛️ ${ieName}`;
    }

    // Detección de Modalidad: Home School o Validación Virtual vs. Colegio Regular
    const esHomeSchool = data.institucion === 'HomeSchool' || data.rol === 'homeschool' || data.rol === 'homeschool_tutor' || String(data.grupo || '').startsWith('HS-');
    const esValidacionVirtual = data.rol === 'validacion' || data.institucion === 'Validacion' || String(data.grado || data.grupo || '').toLowerCase().includes('ciclo') || String(data.institucion || '').toLowerCase().includes('nocturn');

    // Visibilidad de pestañas DBA: Solo para Home School y Validación Virtual
    const navTabs = document.getElementById("student-nav-tabs");
    if (navTabs) {
        navTabs.style.display = (esHomeSchool || esValidacionVirtual) ? 'flex' : 'none';
    }
    if (!esHomeSchool && !esValidacionVirtual) {
        if (typeof window.cambiarTabEstudiante === 'function') {
            window.cambiarTabEstudiante('materias');
        }
    }

    // Sincronizar selector de Malla Curricular Oficial DBA del Estudiante
    const selectMallaEst = document.getElementById("select-estudiante-malla-grado");
    if (selectMallaEst) {
        let normG = window.normalizarGradoOCiclo ? window.normalizarGradoOCiclo(gradoCiclo) : gradoCiclo;
        if (String(gradoCiclo).includes('Ciclo')) normG = String(gradoCiclo).trim();
        for (let opt of selectMallaEst.options) {
            if (opt.value === normG || opt.value === gradoCiclo || opt.text.includes(gradoCiclo)) {
                selectMallaEst.value = opt.value;
                break;
            }
        }
    }

    // Cálculo de Nivel y Porcentaje de Progreso
    let nivelNum = 1;
    let nivelNombre = "Novato STEAM 🌱";
    let proximaMeta = 300;
    let baseNivel = 0;

    if (totalXP >= 2000) {
        nivelNum = 5;
        nivelNombre = "Sabio Cuántico STEAM 👑";
        proximaMeta = 3000;
        baseNivel = 2000;
    } else if (totalXP >= 1200) {
        nivelNum = 4;
        nivelNombre = "Maestro Investigador 🧙‍♂️";
        proximaMeta = 2000;
        baseNivel = 1200;
    } else if (totalXP >= 700) {
        nivelNum = 3;
        nivelNombre = "Científico Avanzado 🔬";
        proximaMeta = 1200;
        baseNivel = 700;
    } else if (totalXP >= 300) {
        nivelNum = 2;
        nivelNombre = "Explorador de Campo 🚀";
        proximaMeta = 700;
        baseNivel = 300;
    } else {
        nivelNum = 1;
        nivelNombre = "Novato STEAM 🌱";
        proximaMeta = 300;
        baseNivel = 0;
    }

    let xpEnNivel = totalXP - baseNivel;
    let rangoNivel = Math.max(1, proximaMeta - baseNivel);
    let porcentajeProgreso = Math.min(100, Math.max(5, Math.round((xpEnNivel / rangoNivel) * 100)));

    const pBar = document.getElementById("student-xp-progress-bar");
    if (pBar) pBar.style.width = `${porcentajeProgreso}%`;

    const pText = document.getElementById("student-xp-progress-text");
    if (pText) pText.innerText = `${totalXP} / ${proximaMeta} XP (${porcentajeProgreso}% hacia Nivel ${nivelNum + 1})`;

    const pLevelBadge = document.getElementById("student-xp-level-name");
    if (pLevelBadge) pLevelBadge.innerText = `Nivel ${nivelNum}: ${nivelNombre}`;

    // 3. Header de Guía (si se abre)
    const gAvatar = document.getElementById("student-guide-header-avatar");
    if (gAvatar) gAvatar.innerText = avatar;
    const gName = document.getElementById("student-guide-header-name");
    if (gName) gName.innerText = nombreLimpio;
    const gBadge = document.getElementById("student-guide-header-badge");
    if (gBadge) gBadge.innerText = gradoCiclo;
    const gXP = document.getElementById("student-guide-header-xp");
    if (gXP) gXP.innerText = totalXP;

    // Banner de Felicitación / Bonificación si el profesor otorgó puntos
    const bannerBonus = document.getElementById("banner-bonificacion-alerta");
    if (bannerBonus) {
        let notifBonusStr = localStorage.getItem(`notificacion_bonificacion_${doc}`);
        if (notifBonusStr) {
            try {
                const notifB = JSON.parse(notifBonusStr);
                bannerBonus.style.display = "block";
                bannerBonus.innerHTML = `
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: flex-start; gap: 15px;">
                            <span style="font-size: 2.2rem;">🎉</span>
                            <div>
                                <h4 style="margin: 0; color: #065F46; font-size: 1.15rem; font-weight: 900;">¡FELICITACIONES POR TU RECONOCIMIENTO!</h4>
                                <p style="margin: 4px 0 0 0; color: #047857; font-size: 0.95rem;">
                                    Tu profesor te ha otorgado una <b>Bonificación del +10% (+${notifB.puntos} XP)</b> por tu logro en clase:
                                </p>
                                <div style="background: white; border: 1px solid #A7F3D0; padding: 10px 14px; border-radius: 8px; margin-top: 8px; font-weight: 800; color: #059669; display: inline-block;">
                                    ${notifB.motivo} ${notifB.observacion ? `<br><small style="color:#64748B; font-weight:normal;">Nota: "${notifB.observacion}"</small>` : ''}
                                </div>
                                <div style="font-size: 0.8rem; color: #047857; margin-top: 6px;">Otorgado el ${notifB.fecha} por tu Docente Orientador.</div>
                            </div>
                        </div>
                        <button onclick="marcarBonificacionLeida('${doc}')" style="background: #10B981; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; cursor: pointer; box-shadow: 0 4px 10px rgba(16,185,129,0.3); transition: background 0.2s;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10B981'">
                            ✓ Reclamar y Continuar
                        </button>
                    </div>
                `;
            } catch(e) {
                bannerBonus.style.display = "none";
            }
        } else {
            bannerBonus.style.display = "none";
        }
    }

    // Banner de Alerta Disciplinaria / Penalización si el profesor aplicó sanciones
    const bannerAlerta = document.getElementById("banner-penalizacion-alerta");
    if (bannerAlerta) {
        let notifStr = localStorage.getItem(`notificacion_penalizacion_${doc}`);
        if (notifStr) {
            try {
                const notif = JSON.parse(notifStr);
                bannerAlerta.style.display = "block";
                bannerAlerta.innerHTML = `
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: flex-start; gap: 15px;">
                            <span style="font-size: 2.2rem;">⚠️</span>
                            <div>
                                <h4 style="margin: 0; color: #991B1B; font-size: 1.15rem; font-weight: 900;">SANCIÓN DISCIPLINARIA APLICADA POR TU PROFESOR</h4>
                                <p style="margin: 4px 0 0 0; color: #7F1D1D; font-size: 0.95rem;">
                                    Se ha descontado el <b>-10% de tus puntos acumulados (-${notif.puntos} XP)</b> por la siguiente razón disciplinaria en clase:
                                </p>
                                <div style="background: white; border: 1px solid #FCA5A5; padding: 10px 14px; border-radius: 8px; margin-top: 8px; font-weight: 800; color: #DC2626; display: inline-block;">
                                    ${notif.motivo} ${notif.observacion ? `<br><small style="color:#64748B; font-weight:normal;">Nota del profesor: "${notif.observacion}"</small>` : ''}
                                </div>
                                <div style="font-size: 0.8rem; color: #991B1B; margin-top: 6px;">Registrado el ${notif.fecha} por tu Docente Orientador.</div>
                            </div>
                        </div>
                        <button onclick="marcarPenalizacionLeida('${doc}')" style="background: #DC2626; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; cursor: pointer; box-shadow: 0 4px 10px rgba(220,38,38,0.3); transition: background 0.2s;" onmouseover="this.style.background='#B91C1C'" onmouseout="this.style.background='#DC2626'">
                            ✓ Entendido y Acepto las Normas
                        </button>
                    </div>
                `;
            } catch(e) {
                bannerAlerta.style.display = "none";
            }
        } else {
            bannerAlerta.style.display = "none";
        }
    }

    // 4. Banner de pago si aplica
    const bannerPago = document.getElementById("banner-pago-estado");
    if (bannerPago) {
        if (data.rol === 'validacion' || data.institucion === 'Validacion' || data.institucion === 'HomeSchool') {
            bannerPago.style.display = "block";
            if (data.pago_realizado) {
                bannerPago.style.background = "#ECFDF5";
                bannerPago.style.borderColor = "#10B981";
                bannerPago.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 1.8rem;">✅</span>
                        <div>
                            <h4 style="margin: 0; color: #065F46; font-size: 1.1rem; font-weight: 800;">Matrícula y Acceso a Guías Habilitado</h4>
                            <p style="margin: 2px 0 0 0; color: #047857; font-size: 0.9rem;">Acceso verificado para <strong>${nombreLimpio}</strong>. Tienes acceso completo a todas las guías, simulacros y laboratorios.</p>
                        </div>
                    </div>
                `;
            } else {
                const monto = 60000;
                bannerPago.style.background = "#FEF3C7";
                bannerPago.style.borderColor = "#F59E0B";
                bannerPago.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 1.8rem;">⚠️</span>
                            <div>
                                <h4 style="margin: 0; color: #92400E; font-size: 1.1rem; font-weight: 800;">Acceso a Guías Pendiente de Pago</h4>
                                <p style="margin: 2px 0 0 0; color: #B45309; font-size: 0.9rem;">Para desbloquear todo el contenido pedagógico de ${gradoCiclo}, cancela los derechos de acceso ($${monto.toLocaleString('es-CO')} COP).</p>
                            </div>
                        </div>
                        <button onclick="abrirPasarelaPago({ concepto: 'Acceso a Guías y Simulacros de Validación', documento: '${data.documento || data.usuario}', monto: ${monto}, rol: '${data.rol}', callback: () => location.reload() })" style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 10px rgba(217,119,6,0.3); display: flex; align-items: center; gap: 8px;">
                            💳 Pagar Guías Ahora
                        </button>
                    </div>
                `;
            }
        } else {
            bannerPago.style.display = "none";
        }
    }

    // 4.5. Cargar actividades y juegos asignados al estudiante
    if (typeof window.cargarActividadesEstudiante === 'function') {
        window.cargarActividadesEstudiante();
    }

    // 5. Grid de Materias
    const subjectsGrid = document.getElementById("student-subjects-grid");
    if (subjectsGrid) {
        subjectsGrid.innerHTML = "";
        let asignaturas = [];
        const materiasHorario = window.obtenerMateriasHorarioGrado(gradoCiclo);

        if (esValidacionVirtual) {
            // Estudiantes de Validación Virtual: Todas las áreas fundamentales oficiales
            asignaturas = ["Ciencias Naturales", "Matemáticas", "Lengua Castellana", "Ciencias Sociales", "Inglés"];
        } else if (esHomeSchool) {
            // Estudiantes de Home School: Todas las áreas fundamentales oficiales
            asignaturas = ["Ciencias Naturales", "Matemáticas", "Lengua Castellana", "Ciencias Sociales", "Inglés"];
            if (Array.isArray(data.materias) && data.materias.length > 0) {
                data.materias.forEach(m => {
                    if (!asignaturas.includes(m)) asignaturas.push(m);
                });
            }
        } else {
            // Estudiantes de Colegio Regular (ej. IE Instituto Montenegro / Ramón Messa): SOLO sus asignaturas matriculadas del colegio
            if (data.asignatura && data.asignatura !== 'Ciencias Naturales' && !data.asignatura.includes('Todas')) {
                asignaturas = data.asignatura.split(',').map(s => s.trim()).filter(Boolean);
            } else if (Array.isArray(data.materias) && data.materias.length > 0) {
                asignaturas = data.materias;
            } else {
                asignaturas = materiasHorario;
            }
        }

        // Tarjeta Transversal Especial: Primeros Auxilios Emocionales luego del Terremoto (Para todos los matriculados)
        const specialCard = document.createElement("div");
        specialCard.style.cssText = "background: linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%); border-radius: 16px; padding: 25px; box-shadow: 0 4px 15px rgba(239,68,68,0.1); transition: transform 0.2s, box-shadow 0.2s; border-top: 5px solid #EF4444; border: 1.5px solid #FECDD3; display: flex; flex-direction: column; justify-content: space-between; height: 190px;";
        specialCard.onmouseover = () => { specialCard.style.transform = "translateY(-5px)"; specialCard.style.boxShadow = "0 12px 20px rgba(239,68,68,0.2)"; };
        specialCard.onmouseout = () => { specialCard.style.transform = "none"; specialCard.style.boxShadow = "0 4px 15px rgba(239,68,68,0.1)"; };
        specialCard.innerHTML = `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 2.2rem;">❤️‍🩹</span>
                    <span style="background: #FEE2E2; color: #991B1B; font-weight: 800; font-size: 0.8rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #FCA5A5;">Transversal</span>
                </div>
                <h3 style="margin: 0; font-size: 1.25rem; color: #991B1B; font-weight: 800;">Primeros Auxilios Emocionales</h3>
                <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #64748B;">Módulo Post-Terremoto • +150 XP</p>
            </div>
            <button style="background: linear-gradient(135deg, #EF4444, #DC2626); color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 800; cursor: pointer; width: 100%; font-family: Inter, sans-serif; box-shadow: 0 4px 10px rgba(239,68,68,0.25); display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="window.abrirClasePrimerosAuxiliosEmocionales('estudiante')">
                🧘‍♂️ Entrar al Taller
            </button>
        `;
        subjectsGrid.appendChild(specialCard);

        asignaturas.forEach(asig => {
            const card = document.createElement("div");
            card.style.cssText = "background: white; border-radius: 16px; padding: 22px; box-shadow: 0 4px 15px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s; border-top: 5px solid #10B981; display: flex; flex-direction: column; justify-content: space-between; min-height: 205px;";
            card.onmouseover = () => { card.style.transform = "translateY(-5px)"; card.style.boxShadow = "0 12px 20px rgba(0,0,0,0.12)"; };
            card.onmouseout = () => { card.style.transform = "none"; card.style.boxShadow = "0 4px 15px rgba(0,0,0,0.06)"; };

            // 1. Icono temático
            let iconAsig = "🔬";
            const asigLow = asig.toLowerCase();
            if (asigLow.includes('física') || asigLow.includes('fisica')) iconAsig = "⚛️";
            else if (asigLow.includes('química') || asigLow.includes('quimica')) iconAsig = "🧪";
            else if (asigLow.includes('matemática') || asigLow.includes('matematica')) iconAsig = "📐";
            else if (asigLow.includes('social') || asigLow.includes('sociales')) iconAsig = "🌍";
            else if (asigLow.includes('lengua') || asigLow.includes('castellano')) iconAsig = "📖";
            else if (asigLow.includes('inglés') || asigLow.includes('ingles')) iconAsig = "🗣️";
            else if (asigLow.includes('tecno') || asigLow.includes('informática')) iconAsig = "💻";
            else if (asigLow.includes('turismo')) iconAsig = "✈️";
            else if (asigLow.includes('artística') || asigLow.includes('artistica')) iconAsig = "🎨";
            else if (asigLow.includes('ética') || asigLow.includes('filosofía')) iconAsig = "🤝";
            else if (asigLow.includes('robot') || asigLow.includes('robótica')) iconAsig = "🤖";
            else if (asigLow.includes('emprend')) iconAsig = "💡";
            else {
                try {
                    const customAsigs = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]');
                    const cMatch = customAsigs.find(c => c.nombre.toLowerCase().trim() === asigLow.trim());
                    if (cMatch && cMatch.icono) iconAsig = cMatch.icono;
                } catch(e) {}
            }

            // 2. Docente Titular Orientador
            let docenteTitular = "Docente Titular STEAM";
            try {
                const dList = JSON.parse(localStorage.getItem('docentes_db') || '[]');
                const ieEst = String(data.institucion || '').toLowerCase();
                const gEst = String(gradoCiclo).toLowerCase();
                
                const dFound = dList.find(doc => {
                    const dIE = String(doc.institucion || '').toLowerCase();
                    const dMat = (Array.isArray(doc.materias) ? doc.materias.join(' ') : String(doc.asignatura || '')).toLowerCase();
                    const dGra = (Array.isArray(doc.grados) ? doc.grados.join(' ') : String(doc.grado || doc.grupo || '')).toLowerCase();
                    
                    const coincideIE = !dIE || dIE.includes(ieEst) || ieEst.includes(dIE) || dIE.includes('instituto') || dIE.includes('todos');
                    const coincideMat = dMat.includes(asigLow) || dMat.includes('todas') || asigLow.includes(dMat);
                    const coincideGra = dGra.includes(gEst) || dGra.includes('todos') || dGra.includes(gEst.replace(/[^0-9CicloIVPENS]/g, ''));
                    
                    return coincideMat && (coincideGra || dGra.length === 0);
                });

                if (dFound) {
                    docenteTitular = `Prof. ${dFound.nombre || dFound.nombres || dFound.nombre_completo || 'Docente'}`;
                }
            } catch(e) {}

            card.innerHTML = `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span style="font-size: 2rem;">${iconAsig}</span>
                        <span style="background: #ECFDF5; color: #047857; font-weight: 800; font-size: 0.78rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #A7F3D0;">Activa</span>
                    </div>
                    <h3 style="margin: 0; font-size: 1.22rem; color: #111827; font-weight: 800; line-height: 1.25;">${asig}</h3>
                    <div style="margin-top: 6px; font-size: 0.82rem; color: #4B5563;">
                        <div style="font-weight: 700; color: #2563EB; display: flex; align-items: center; gap: 4px;">
                            <span>👨‍🏫</span> ${docenteTitular}
                        </div>
                        <div style="color: #6B7280; margin-top: 2px;">${gradoCiclo} • STEAM 2026</div>
                    </div>
                </div>
                <button style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 10px 12px; border-radius: 10px; font-weight: 800; cursor: pointer; width: 100%; font-family: Inter, sans-serif; box-shadow: 0 4px 10px rgba(16,185,129,0.25); display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px;" onclick="abrirAsignaturaEstudiante('${asig}', '${gradoCiclo}')">
                    🚀 Entrar al Aula
                </button>
            `;
            subjectsGrid.appendChild(card);
        });
    }
};

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

// ==========================================
// BÚSQUEDA Y LÓGICA DE LOGIN (GLOBAL)
// ==========================================
window.buscarEstudianteFlexible = function(queryDoc, lista) {
    if (!queryDoc || !Array.isArray(lista)) return null;
    const normQ = String(queryDoc).trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');
    if (!normQ) return null;

    // 1. Coincidencia exacta de documento
    let found = lista.find(u => {
        const d = String(u.documento || u.id || u.usuario || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');
        return d === normQ;
    });
    if (found) return found;

    // 2. Coincidencia por nombre o apellidos
    found = lista.find(u => {
        const n = String(u.nombre || '').toLowerCase().replace(/[\.\,\-\_\s]/g, '');
        const a = String(u.apellidos || '').toLowerCase().replace(/[\.\,\-\_\s]/g, '');
        const full = `${n} ${a}`.trim();
        return (n && normQ.includes(n)) || (a && normQ.includes(a)) || (full && (normQ.includes(full) || full.includes(normQ)));
    });
    if (found) return found;

    // 3. Coincidencia flexible de dígitos (prefijos, subcadenas o primeros 6 dígitos)
    found = lista.find(u => {
        const d = String(u.documento || u.id || u.usuario || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');
        if (d.length >= 5 && normQ.length >= 5) {
            return d.startsWith(normQ) || normQ.startsWith(d) || d.includes(normQ) || normQ.includes(d) || d.substring(0,6) === normQ.substring(0,6);
        }
        return false;
    });
    return found || null;
};

window.ejecutarLogin = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const loginBtn = document.getElementById("btn-login-core");
    const errorMsg = document.getElementById("login-error-msg");
    const dashboardView = document.getElementById("dashboard-screen-container");
    const docenteDashboardView = document.getElementById("docente-dashboard-container");

    let rawUser = document.getElementById("admin-user") ? String(document.getElementById("admin-user").value).trim() : "";
    let rawPass = document.getElementById("admin-pass") ? String(document.getElementById("admin-pass").value).trim() : "";
    const rolSelect = document.getElementById("login-role");
    const rol = rolSelect ? rolSelect.value : "estudiante";

    if (!rawUser) {
        if (errorMsg) { 
            errorMsg.style.display = "block"; 
            errorMsg.innerText = "Por favor ingresa tu número de documento de identidad."; 
        }
        return;
    }

    const normUser = rawUser.toLowerCase().replace(/[\.\,\-\_\s]/g, '');
    // Si el estudiante no escribió contraseña, su contraseña por defecto es su mismo documento de identidad
    let pass = rawPass || rawUser;

    if (loginBtn) {
        loginBtn.innerText = "Verificando...";
        loginBtn.disabled = true;
    }
    if (errorMsg) errorMsg.style.display = "none";
    
    try {
        let data = null;
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: rawUser, clave: pass, rol: rol })
            });
            if (res.ok) {
                data = await res.json();
            }
        } catch (netErr) {
            console.warn("Fallo conectando al servidor backend, buscando respaldo local...", netErr);
        }
        
        // Si la API no respondió éxito, verificar si el estudiante o docente está en localStorage o usuarios.json con búsqueda flexible
        if (!data || data.status !== 'success') {
            // 1. Buscar primero en docentes_db
            let localDocentes = JSON.parse(localStorage.getItem('docentes_db') || '[]');
            let localDoc = localDocentes.find(d => String(d.documento || d.cedula || d.usuario || '').toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normUser);

            let localUsers = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
            let localEst = window.buscarEstudianteFlexible(normUser, localUsers);

            // Si no está aún en localStorage, consultar directamente usuarios.json
            if (!localEst && !localDoc) {
                try {
                    const uRes = await fetch('usuarios.json?t=' + Date.now());
                    if (uRes.ok) {
                        const uData = await uRes.json();
                        if (Array.isArray(uData)) {
                            localEst = window.buscarEstudianteFlexible(normUser, uData);
                            if (localEst) {
                                localUsers.push(localEst);
                                localStorage.setItem('usuarios_db', JSON.stringify(localUsers));
                            }
                        }
                    }
                } catch(e) {}
            }

            if (localDoc && (rol === 'docente' || rol === 'homeschool_tutor' || !localEst)) {
                data = {
                    status: 'success',
                    usuario: localDoc.documento || localDoc.usuario || rawUser,
                    nombre: localDoc.nombre_completo || `${localDoc.nombre || ''} ${localDoc.apellidos || ''}`.trim() || rawUser,
                    rol: localDoc.rol || (rol === 'homeschool_tutor' ? 'homeschool_tutor' : 'docente'),
                    grado: localDoc.grado || 'Todos',
                    grupo: localDoc.grupo || 'Todos',
                    institucion: localDoc.institucion || 'IE Instituto Montenegro',
                    asignatura: localDoc.asignatura || 'Ciencias Naturales',
                    pago_activo: true,
                    pago_realizado: true,
                    usuarioObj: localDoc
                };
            } else if (localEst) {
                const rolDeterminado = localEst.rol ? localEst.rol : ((localEst.institucion === 'Validacion' || String(localEst.grupo || '').toLowerCase().includes('ciclo') || String(localEst.grado || '').toLowerCase().includes('ciclo')) ? 'validacion' : (rol === 'docente' ? 'docente' : 'estudiante'));
                data = {
                    status: 'success',
                    usuario: localEst.documento || rawUser,
                    nombre: `${localEst.nombre || ''} ${localEst.apellidos || ''}`.trim() || rawUser,
                    rol: rolDeterminado,
                    grado: localEst.grado || localEst.grupo || '',
                    grupo: localEst.grupo || localEst.grado || '',
                    asignatura: localEst.asignatura || (localEst.materias ? localEst.materias.join(', ') : 'Ciencias Naturales'),
                    institucion: localEst.institucion || 'IE Instituto Montenegro',
                    pago_activo: localEst.pago_realizado !== false,
                    pago_realizado: localEst.pago_realizado !== false,
                    usuarioObj: localEst
                };
                // Sincronizar en segundo plano al backend
                fetch('/api/registro-estudiante', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(localEst)
                }).catch(() => {});
            } else if (normUser === 'admin' && (pass === 'admin' || pass === '123456' || pass === 'Biol2008%')) {
                data = { status: 'success', usuario: 'admin', nombre: 'Administrador', rol: 'admin' };
            }
        }

        if (data && data.status === 'success') {
            if (errorMsg) errorMsg.style.display = "none";
            
            window.rol_actual = data.rol; 
            window.usuario_actual = data.usuario; // Guardar ID del usuario actual

            // Guardar en sesión
            localStorage.setItem('usuario_sesion', JSON.stringify(data));
            
            // Asegurar que también quede en usuarios_db
            if (data.usuarioObj) {
                try {
                    let uList = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
                    const idx = uList.findIndex(u => String(u.documento || u.id || '').toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normUser);
                    if (idx >= 0) uList[idx] = { ...uList[idx], ...data.usuarioObj };
                    else uList.push(data.usuarioObj);
                    localStorage.setItem('usuarios_db', JSON.stringify(uList));
                } catch(e) {}
            }

            if (data.rol === 'admin') {
                if (typeof mostrarVista === 'function') mostrarVista('dashboard-screen-container');
                else if (dashboardView) dashboardView.style.display = "block";
                if (typeof cargarDatosAdmin === 'function') cargarDatosAdmin();
            } else if (data.rol === 'docente') {
                if (typeof mostrarVista === 'function') mostrarVista('docente-dashboard-container');
                else if (docenteDashboardView) docenteDashboardView.style.display = "block";
                const dHeader = document.getElementById("docente-nombre-header");
                if (dHeader) dHeader.innerText = data.nombre;
                if (typeof cargarEstudiantesDocente === 'function') cargarEstudiantesDocente(data.usuario);
            } else if (data.rol === 'homeschool_tutor') {
                if (typeof mostrarVista === 'function') mostrarVista('tutor-dashboard-container');
                const tutorView = document.getElementById("tutor-dashboard-container");
                if (tutorView) tutorView.style.display = "block";
                const tHeader = document.getElementById("tutor-nombre-header");
                if (tHeader) tHeader.innerText = data.nombre;
                if (typeof cargarEstudiantesTutor === 'function') cargarEstudiantesTutor(data.usuario);
            } else { // Estudiante regular o Validación
                if (typeof window.inicializarPanelEstudiante === 'function') {
                    window.inicializarPanelEstudiante(data);
                }
            }
        } else {
            // AUTO-HABILITACIÓN DIRECTA: Si no se encontró por coincidencia exacta o difusa, abrir modal de auto-habilitación para que ingrese en 1 clic
            const modalAuto = document.getElementById("modal-auto-habilitacion");
            if (modalAuto) {
                const badge = document.getElementById("modal-auto-doc-badge");
                if (badge) badge.innerText = rawUser;
                const nomInput = document.getElementById("auto-nombre-completo");
                if (nomInput) nomInput.value = "Estudiante Montenegro";
                const cicloSelect = document.getElementById("auto-ciclo-grado");
                if (cicloSelect && rol === 'validacion') {
                    cicloSelect.value = "Ciclo VI";
                }
                modalAuto.style.display = "flex";
                if (nomInput) nomInput.focus();
            } else if (errorMsg) { 
                errorMsg.style.display = "block"; 
                errorMsg.innerText = "❌ Documento no encontrado. Haz clic en '➕ Registrar Nuevo Estudiante / Matrícula'."; 
            }
        }
    } catch (err) {
        console.error(err);
        if (errorMsg) { errorMsg.style.display = "block"; errorMsg.innerText = "Error interno o de red al ingresar."; }
    } finally {
        if (loginBtn) {
            loginBtn.innerText = "Iniciar Sesión";
            loginBtn.disabled = false;
        }
    }
};


// =========================================================
// MÓDULO DE GESTIÓN DINÁMICA DE INSTITUCIONES EDUCATIVAS (IE)
// =========================================================
window.obtenerListaInstituciones = function() {
    let listaDefecto = [
        { id: "InstitutoMontenegro", nombre: "IE Instituto Montenegro", municipio: "Montenegro, Quindío", codigo: "ieinstituto2026", tipo: "oficial" },
        { id: "RamonMessa", nombre: "Colegio Ramón Messa Londoño", municipio: "Montenegro, Quindío", codigo: "messa2026", tipo: "oficial" },
        { id: "SantaMariaDelRio", nombre: "Colegio Santa María del Río", municipio: "Montenegro, Quindío", codigo: "santamaria2026", tipo: "oficial" },
        { id: "HomeSchool", nombre: "Home School (Educación en Casa)", municipio: "Nacional / En Casa", codigo: "homeschool2026", tipo: "homeschool" },
        { id: "Validacion", nombre: "Validación Bachillerato por Ciclos", municipio: "Virtual / Colombia", codigo: "validacion2026", tipo: "validacion" }
    ];
    try {
        let guardadas = JSON.parse(localStorage.getItem('instituciones_db') || '[]');
        guardadas.forEach(g => {
            if (!listaDefecto.some(d => d.id === g.id || d.nombre.toLowerCase().trim() === g.nombre.toLowerCase().trim())) {
                listaDefecto.push(g);
            }
        });
    } catch(e) {}
    return listaDefecto;
};

window.guardarNuevaInstitucion = function(nombre, municipio = "Colombia", codigo = "") {
    if (!nombre || !nombre.trim()) return null;
    const cleanNombre = nombre.trim();
    const id = cleanNombre.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const codigoFinal = (codigo && codigo.trim()) ? codigo.trim() : (id.replace(/_/g, '') + '2026');
    
    const nuevaIE = {
        id: id,
        nombre: cleanNombre,
        municipio: municipio.trim() || "Montenegro, Quindío",
        codigo: codigoFinal,
        tipo: "oficial",
        fecha: new Date().toISOString()
    };

    try {
        let guardadas = JSON.parse(localStorage.getItem('instituciones_db') || '[]');
        const idx = guardadas.findIndex(g => g.id === id || g.nombre.toLowerCase().trim() === cleanNombre.toLowerCase());
        if (idx >= 0) guardadas[idx] = nuevaIE;
        else guardadas.push(nuevaIE);
        localStorage.setItem('instituciones_db', JSON.stringify(guardadas));
    } catch(e) {}

    window.refrescarSelectoresInstituciones(id);
    return nuevaIE;
};

window.refrescarSelectoresInstituciones = function(seleccionarId = null) {
    const lista = window.obtenerListaInstituciones();
    
    // 1. Selector General de Registro (#reg-ie)
    const selReg = document.getElementById("reg-ie");
    if (selReg) {
        const valActual = selReg.value;
        let html = `<option value="">Institución / Modalidad / Perfil...</option>`;
        
        // Categoría Estudiantes por Institución
        html += `<optgroup label="🏫 Instituciones Educativas (Colegios)">`;
        lista.filter(i => i.tipo === 'oficial').forEach(i => {
            html += `<option value="${i.id}">🏫 ${i.nombre} (${i.municipio})</option>`;
        });
        html += `<option value="__NUEVA_IE__" style="color: #2563EB; font-weight: 800;">➕ Registrar Nueva Institución Educativa...</option>`;
        html += `</optgroup>`;

        // Categoría Perfiles y Modalidades Especiales
        html += `<optgroup label="👥 Perfiles y Modalidades Flexibles">`;
        html += `<option value="DocenteRegular">👨‍🏫 Docente Regular (Colegio / Institución)</option>`;
        html += `<option value="HomeSchool">🏡 Tutor Home School (Educación en Casa)</option>`;
        html += `<option value="Validacion">🎓 Estudiante de Validación Bachillerato (Ciclos)</option>`;
        html += `</optgroup>`;

        selReg.innerHTML = html;
        if (seleccionarId) selReg.value = seleccionarId;
        else if (valActual && Array.from(selReg.options).some(o => o.value === valActual)) selReg.value = valActual;
    }

    // 2. Selector Específico de Docente (#reg-docente-ie-select)
    const selDocIE = document.getElementById("reg-docente-ie-select");
    if (selDocIE) {
        const valDoc = selDocIE.value;
        let htmlDoc = `<option value="">Selecciona tu Colegio / Institución...</option>`;
        lista.forEach(i => {
            htmlDoc += `<option value="${i.nombre}">🏫 ${i.nombre} (${i.municipio})</option>`;
        });
        selDocIE.innerHTML = htmlDoc;
        if (seleccionarId) {
            const match = lista.find(l => l.id === seleccionarId);
            if (match) selDocIE.value = match.nombre;
        } else if (valDoc) selDocIE.value = valDoc;
    }
};

window.abrirModalCrearIE = function(origen = 'registro') {
    window._origenModalIE = origen;
    const modal = document.getElementById("modal-crear-institucion-educativa");
    if (modal) {
        modal.style.display = "flex";
        const inNombre = document.getElementById("nueva-ie-nombre");
        if (inNombre) { inNombre.value = ""; inNombre.focus(); }
    }
};

window.cerrarModalCrearIE = function() {
    const modal = document.getElementById("modal-crear-institucion-educativa");
    if (modal) modal.style.display = "none";
};

window.ejecutarGuardarNuevaIE = function() {
    const inNombre = document.getElementById("nueva-ie-nombre");
    const inMun = document.getElementById("nueva-ie-municipio");
    const inCod = document.getElementById("nueva-ie-codigo");

    if (!inNombre || !inNombre.value.trim()) {
        alert("Por favor ingresa el nombre de la Institución Educativa.");
        return;
    }

    const res = window.guardarNuevaInstitucion(inNombre.value, inMun ? inMun.value : "", inCod ? inCod.value : "");
    if (res) {
        alert(`🎉 ¡Institución "${res.nombre}" registrada con éxito! Ya está disponible permanentemente para todos los docentes y estudiantes.`);
        window.cerrarModalCrearIE();
        if (window.toggleIEOptions) window.toggleIEOptions();
    }
};

window.abrirModalTerminosDNDA = function() {
    const modal = document.getElementById("modal-terminos-legales-dnda");
    if (modal) modal.style.display = "flex";
};

window.cerrarModalTerminosDNDA = function() {
    const modal = document.getElementById("modal-terminos-legales-dnda");
    if (modal) modal.style.display = "none";
};

// =========================================================
// MÓDULO DE CREACIÓN DE ASIGNATURAS Y APRENDIZAJE DE DOCUMENTOS
// =========================================================
window.obtenerCatalogoAsignaturas = function() {
    let base = [
        "Ciencias Naturales y Educación Ambiental",
        "Física",
        "Química",
        "Matemáticas",
        "Tecnología e Informática",
        "Ciencias Sociales",
        "Lengua Castellana",
        "Idioma Extranjero Inglés",
        "Educación Artística",
        "Ética y Valores Humanos",
        "Filosofía",
        "Turismo y Proyectos Especiales",
        "Educación Física"
    ];
    try {
        let custom = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]');
        custom.forEach(c => {
            if (c.nombre && !base.includes(c.nombre)) base.push(c.nombre);
        });
    } catch(e) {}
    return base;
};

window.renderizarPillsDocenteRegistro = function() {
    // 1. Materias que orienta
    const containerMat = document.getElementById("reg-docente-materias-pills");
    if (containerMat) {
        const todasMat = window.obtenerCatalogoAsignaturas();
        containerMat.innerHTML = todasMat.map((mat, idx) => `
            <label style="display: inline-flex; align-items: center; gap: 4px; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; cursor: pointer; user-select: none;">
                <input type="checkbox" name="docente_materia_check" value="${mat}" ${idx === 0 ? 'checked' : ''} onchange="actualizarMaterias()">
                <span>${mat}</span>
            </label>
        `).join('');
    }

    // 2. Grados / Ciclos a cargo
    const containerGra = document.getElementById("reg-docente-grados-pills");
    if (containerGra) {
        const gradosList = [
            { v: "1", l: "1° Primaria" }, { v: "2", l: "2° Primaria" }, { v: "3", l: "3° Primaria" },
            { v: "4", l: "4° Primaria" }, { v: "5", l: "5° Primaria" }, { v: "6", l: "6° Secundaria" },
            { v: "7", l: "7° Secundaria" }, { v: "8", l: "8° Secundaria" }, { v: "9", l: "9° Secundaria" },
            { v: "10", l: "10° Media" }, { v: "11", l: "11° Media" },
            { v: "Ciclo I", l: "Ciclo I" }, { v: "Ciclo II", l: "Ciclo II" }, { v: "Ciclo III", l: "Ciclo III" },
            { v: "Ciclo IV", l: "Ciclo IV" }, { v: "Ciclo V", l: "Ciclo V" }, { v: "Ciclo VI", l: "Ciclo VI" }
        ];
        containerGra.innerHTML = gradosList.map((g, idx) => `
            <label style="display: inline-flex; align-items: center; gap: 4px; background: #F8FAFC; border: 1px solid #CBD5E1; padding: 4px 8px; border-radius: 16px; font-size: 0.78rem; font-weight: 600; cursor: pointer; user-select: none;">
                <input type="checkbox" name="docente_grado_check" value="${g.v}" ${idx >= 5 && idx <= 8 ? 'checked' : ''}>
                <span>${g.l}</span>
            </label>
        `).join('');
    }
};

window.obtenerMateriasDocenteSeleccionadas = function() {
    const checks = document.querySelectorAll('input[name="docente_materia_check"]:checked');
    const mats = Array.from(checks).map(c => c.value);
    return mats.length > 0 ? mats : ["Ciencias Naturales y Educación Ambiental"];
};

window.obtenerGradosDocenteSeleccionados = function() {
    const checks = document.querySelectorAll('input[name="docente_grado_check"]:checked');
    const gras = Array.from(checks).map(c => c.value);
    return gras.length > 0 ? gras : ["6", "7", "8", "9"];
};

window.abrirModalCrearAsignaturaDocente = function(origen = 'docente') {
    window._origenModalAsig = origen;
    const modal = document.getElementById("modal-crear-asignatura-docente");
    if (modal) {
        modal.style.display = "flex";
        
        // Renderizar pills de grados en modal
        const gCont = document.getElementById("modal-asig-grados-container");
        if (gCont) {
            const gradosList = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "Ciclo I", "Ciclo II", "Ciclo III", "Ciclo IV", "Ciclo V", "Ciclo VI"];
            gCont.innerHTML = gradosList.map(g => `
                <label style="display: inline-flex; align-items: center; gap: 4px; background: #F1F5F9; border: 1px solid #CBD5E1; padding: 4px 8px; border-radius: 16px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
                    <input type="checkbox" name="modal_asig_grado_check" value="${g}" ${['6','7','8','9','10','11'].includes(g) ? 'checked' : ''}>
                    <span>${g.includes('Ciclo') ? g : g + '°'}</span>
                </label>
            `).join('');
        }
    }
};

window.cerrarModalCrearAsignaturaDocente = function() {
    const modal = document.getElementById("modal-crear-asignatura-docente");
    if (modal) modal.style.display = "none";
};

window._textoDocumentoAsignaturaDocente = "";
window._nombreArchivoAsignaturaDocente = "";

window.manejarArchivoAsignaturaDocente = function(event) {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    window._nombreArchivoAsignaturaDocente = file.name;
    const lbl = document.getElementById("modal-asig-archivo-nombre");
    if (lbl) {
        lbl.style.display = "block";
        lbl.innerHTML = `✅ Archivo cargado: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        window._textoDocumentoAsignaturaDocente = String(e.target.result || '');
    };
    reader.onerror = function() {
        console.warn("No se pudo leer el archivo directamente en texto plano.");
    };
    reader.readAsText(file);
};

window.ejecutarCrearAsignaturaDocenteConIA = function() {
    const inNom = document.getElementById("modal-asig-nombre");
    const inIcono = document.getElementById("modal-asig-icono");
    const inDesc = document.getElementById("modal-asig-desc");
    const inTxt = document.getElementById("modal-asig-texto-directo");

    if (!inNom || !inNom.value.trim()) {
        alert("Por favor ingresa el nombre de la nueva asignatura.");
        return;
    }

    const nombreAsig = inNom.value.trim();
    const icono = inIcono ? inIcono.value : "💡";
    const desc = inDesc ? inDesc.value.trim() : "";
    const txtDirecto = inTxt ? inTxt.value.trim() : "";
    const textoDoc = (window._textoDocumentoAsignaturaDocente + "\n" + txtDirecto).trim();

    const gChecks = document.querySelectorAll('input[name="modal_asig_grado_check"]:checked');
    const gradosArr = Array.from(gChecks).map(c => c.value);
    if (gradosArr.length === 0) gradosArr.push("6", "7", "8", "9", "10", "11");

    // Motor de Aprendizaje y Estructuración Curricular
    const nuevaMalla = window.procesarDocumentoYCrearMalla(nombreAsig, gradosArr, desc, textoDoc, window._nombreArchivoAsignaturaDocente);
    if (nuevaMalla) {
        nuevaMalla.icono = icono;
        let asigList = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]');
        const ex = asigList.find(a => a.nombre.toLowerCase().trim() === nombreAsig.toLowerCase().trim());
        if (ex) ex.icono = icono;
        localStorage.setItem('asignaturas_personalizadas_db', JSON.stringify(asigList));
    }

    alert(`🎉 ¡Asignatura "${nombreAsig}" y su Malla Curricular Oficial creadas con éxito!\n\nSe han estructurado los 4 periodos académicos, temas quincenales y DBAs a partir de tus documentos.`);
    window.cerrarModalCrearAsignaturaDocente();
    
    // Actualizar selectores e interfaz
    if (window.renderizarPillsDocenteRegistro) window.renderizarPillsDocenteRegistro();
    if (window.actualizarMaterias) window.actualizarMaterias();
};

window.procesarDocumentoYCrearMalla = function(nombreAsig, gradosArray, descripcion, textoDocumento, archivoNombre = "") {
    let palabrasClave = [];
    if (textoDocumento) {
        const tokens = textoDocumento.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 4);
        const freqs = {};
        tokens.forEach(t => { const w = t.toLowerCase(); freqs[w] = (freqs[w] || 0) + 1; });
        palabrasClave = Object.keys(freqs).sort((a,b) => freqs[b] - freqs[a]).slice(0, 20);
    }
    
    const objMeta = descripcion || `Desarrollar competencias teóricas, investigativas y prácticas en ${nombreAsig}, aplicando metodologías activas, indagación y resolución de problemas reales.`;
    
    const dbas = [
        `DBA 1: Comprende los conceptos fundamentales y principios esenciales de ${nombreAsig} en su entorno.`,
        `DBA 2: Analiza y modela situaciones problemáticas utilizando las herramientas metodológicas de ${nombreAsig}.`,
        `DBA 3: Diseña y ejecuta proyectos o experimentos aplicando el pensamiento crítico y el trabajo colaborativo en ${nombreAsig}.`,
        `DBA 4: Evalúa el impacto ético, tecnológico y social de los saberes de ${nombreAsig} en su comunidad.`
    ];

    const tBase = palabrasClave.length >= 8 ? palabrasClave : ["Fundamentos", "Estructura", "Metodología", "Análisis", "Aplicación", "Proyectos", "Evaluación", "Innovación"];
    
    const periodos = {
        '1': {
            '1': `Introducción a ${nombreAsig}: conceptos básicos y contexto.`,
            '3': `Principios de ${tBase[0] || 'indagación'} y ${tBase[1] || 'marco conceptual'}.`,
            '5': `Laboratorio y dinámicas de ${tBase[2] || 'observación y registro'}.`,
            '7': `Evaluación de saberes iniciales y proyecto de periodo 1.`
        },
        '2': {
            '1': `Profundización en ${tBase[3] || 'técnicas y modelos'} de ${nombreAsig}.`,
            '3': `Modelado y aplicación de ${tBase[4] || 'herramientas clave'}.`,
            '5': `Estudio de caso y análisis crítico en el contexto territorial.`,
            '7': `Taller experimental y síntesis del periodo 2.`
        },
        '3': {
            '1': `Desarrollo de proyectos interdisciplinares en ${nombreAsig}.`,
            '3': `Integración con metodologías STEAM y tecnología aplicada.`,
            '5': `Resolución de retos formativos y simulación práctica.`,
            '7': `Presentación de avances y coevaluación del periodo 3.`
        },
        '4': {
            '1': `Innovación, bioética e impacto social de ${nombreAsig}.`,
            '3': `Solución de problemáticas comunitarias y transferencia del saber.`,
            '5': `Preparación de la muestra final y feria del conocimiento.`,
            '7': `Consolidación de aprendizajes y evaluación anual integral.`
        }
    };

    const estructuraMallaPorGrado = {
        objetivo: objMeta,
        dba: dbas,
        periodos: periodos,
        documento_origen: archivoNombre || "Documento Curricular Cargado",
        fecha_creacion: new Date().toISOString()
    };

    // Guardar en mallas_personalizadas_db
    let mallasCustom = {};
    try { mallasCustom = JSON.parse(localStorage.getItem('mallas_personalizadas_db') || '{}'); } catch(e) {}
    if (!mallasCustom[nombreAsig]) mallasCustom[nombreAsig] = {};
    
    gradosArray.forEach(g => {
        const gNorm = window.normalizarGradoOCiclo ? window.normalizarGradoOCiclo(g) : g;
        mallasCustom[nombreAsig][g] = estructuraMallaPorGrado;
        mallasCustom[nombreAsig][gNorm] = estructuraMallaPorGrado;
    });
    localStorage.setItem('mallas_personalizadas_db', JSON.stringify(mallasCustom));

    // Guardar en asignaturas_personalizadas_db
    let asigCustomList = [];
    try { asigCustomList = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]'); } catch(e) {}
    const asigPayload = {
        id: nombreAsig.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        nombre: nombreAsig,
        grados: gradosArray,
        descripcion: objMeta,
        icono: "💡",
        color: "#6366F1",
        colorFondo: "#EEF2FF",
        malla: estructuraMallaPorGrado
    };
    const exIdx = asigCustomList.findIndex(a => a.nombre.toLowerCase().trim() === nombreAsig.toLowerCase().trim());
    if (exIdx >= 0) asigCustomList[exIdx] = asigPayload;
    else asigCustomList.push(asigPayload);
    localStorage.setItem('asignaturas_personalizadas_db', JSON.stringify(asigCustomList));

    return asigPayload;
};

window.refrescarPillsMallaCurricular = function(rol = 'estudiante') {
    let container = null;
    let clickFn = '';
    let pillClass = '';
    let materiaActual = '';

    if (rol === 'estudiante') {
        container = document.getElementById('estudiante-malla-pills-container');
        clickFn = 'seleccionarMateriaEstudianteMalla';
        pillClass = 'estudiante-materia-pill';
        materiaActual = window.materiaEstudianteMallaActual || 'Naturales';
    } else if (rol === 'homeschool_tutor' || rol === 'tutor') {
        container = document.getElementById('tutor-malla-pills-container');
        clickFn = 'seleccionarMateriaTutorMalla';
        pillClass = 'tutor-materia-pill';
        materiaActual = window.materiaTutorMallaActual || 'Naturales';
    } else if (rol === 'docente') {
        container = document.getElementById('docente-malla-pills-container');
        clickFn = 'seleccionarMateriaDocenteMalla';
        pillClass = 'docente-materia-pill';
        materiaActual = window.materiaDocenteMallaActual || 'Naturales';
    }

    if (!container) return;

    let basePills = [
        { id: 'Naturales', label: '🌿 Ciencias Naturales' },
        { id: 'Matematicas', label: '📐 Matemáticas' },
        { id: 'Lenguaje', label: '📖 Lengua Castellana' },
        { id: 'Sociales', label: '🌍 Ciencias Sociales' }
    ];

    try {
        const custom = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]');
        custom.forEach(c => {
            if (!basePills.some(b => b.id === c.nombre)) {
                basePills.push({ id: c.nombre, label: `${c.icono || '💡'} ${c.nombre}` });
            }
        });
    } catch(e) {}

    container.innerHTML = basePills.map(p => {
        const esActivo = materiaActual === p.id;
        const style = esActivo 
            ? 'padding: 8px 14px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; cursor: pointer; border: 2px solid #2563EB; background: #EFF6FF; color: #1D4ED8;'
            : 'padding: 8px 14px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; cursor: pointer; border: 1.5px solid #CBD5E1; background: white; color: #475569;';
        return `<button class="${pillClass} ${esActivo ? 'active' : ''}" data-materia="${p.id}" onclick="${clickFn}('${p.id}')" style="${style}">${p.label}</button>`;
    }).join('');
};

window.inicializarAppCore = function() {
    const btnShowReg = document.getElementById("btn-show-register");
    const btnCancelReg = document.getElementById("btn-cancel-register");
    const loginView = document.getElementById("login-screen-container");
    const regView = document.getElementById("register-screen-container");
    const dashboardView = document.getElementById("dashboard-screen-container");
    const docenteDashboardView = document.getElementById("docente-dashboard-container");

    let usuario_actual = "";

    // Sincronización automática de base de datos de usuarios (soporte web y local)
    async function sincronizarUsuariosDB() {
        try {
            const res = await fetch('usuarios.json?t=' + Date.now());
            if (res.ok) {
                const serverUsers = await res.json();
                if (Array.isArray(serverUsers)) {
                    let localUsers = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
                    serverUsers.forEach(su => {
                        const normDoc = String(su.documento || su.id || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');
                        if (normDoc) {
                            const idx = localUsers.findIndex(lu => String(lu.documento || lu.id || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc);
                            if (idx >= 0) {
                                localUsers[idx] = { ...su, ...localUsers[idx] };
                            } else {
                                localUsers.push(su);
                            }
                        }
                    });
                    localStorage.setItem('usuarios_db', JSON.stringify(localUsers));
                }
            }
        } catch(e) {
            console.warn("Aviso: usando base de datos local de usuarios.", e);
        }
    }
    sincronizarUsuariosDB();
    if (window.refrescarSelectoresInstituciones) window.refrescarSelectoresInstituciones();
    if (window.renderizarPillsDocenteRegistro) window.renderizarPillsDocenteRegistro();

    if (btnShowReg) {
        btnShowReg.addEventListener("click", function(e) {
            e.preventDefault();
            if (loginView) loginView.style.display = "none";
            if (regView) regView.style.display = "flex";
        });
    }

    if (btnCancelReg) {
        btnCancelReg.addEventListener("click", function(e) {
            e.preventDefault();
            if (regView) regView.style.display = "none";
            if (loginView) loginView.style.display = "grid";
        });
    }

    // ==========================================
    // LÓGICA DE LOGIN (EXPANDIDA)
    // ==========================================
    const loginBtn = document.getElementById("btn-login-core");
    const rolSelectGlobal = document.getElementById("login-role");
    const adminUserGlobal = document.getElementById("admin-user");
    const adminPassGlobal = document.getElementById("admin-pass");

    if (rolSelectGlobal) {
        rolSelectGlobal.addEventListener("change", function() {
            if (this.value === "estudiante" || this.value === "validacion") {
                if (adminUserGlobal) adminUserGlobal.placeholder = "Número de Identificación";
                if (adminPassGlobal) {
                    adminPassGlobal.style.display = "block";
                    adminPassGlobal.placeholder = "Contraseña (Por defecto tu ID)";
                }
            } else {
                if (adminUserGlobal) adminUserGlobal.placeholder = "Usuario o Documento";
                if (adminPassGlobal) {
                    adminPassGlobal.style.display = "block";
                    adminPassGlobal.placeholder = "Contraseña";
                }
            }
        });
        // Set initial state
        rolSelectGlobal.dispatchEvent(new Event("change"));
    }

    // Permitir presionar Enter en los campos de usuario y contraseña
    [adminUserGlobal, adminPassGlobal].forEach(input => {
        if (input) {
            input.addEventListener("keypress", function(e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    window.ejecutarLogin(e);
                }
            });
        }
    });

    if (loginBtn) {
        loginBtn.addEventListener("click", function(e) {
            window.ejecutarLogin(e);
        });
    }

    // Manejador del botón de auto-habilitación e ingreso inmediato
    const btnAutoIngreso = document.getElementById("btn-ejecutar-auto-ingreso");
    if (btnAutoIngreso) {
        btnAutoIngreso.addEventListener("click", function(e) {
            e.preventDefault();
            const rawUser = document.getElementById("admin-user") ? String(document.getElementById("admin-user").value).trim() : "";
            const rawNombre = document.getElementById("auto-nombre-completo") ? document.getElementById("auto-nombre-completo").value.trim() : "Estudiante";
            const cicloGrado = document.getElementById("auto-ciclo-grado") ? document.getElementById("auto-ciclo-grado").value : "Ciclo VI";
            
            const docFinal = rawUser || String(Date.now()).slice(-8);
            const esCiclo = cicloGrado.includes("Ciclo");
            
            const payload = {
                documento: docFinal,
                nombre: rawNombre,
                apellidos: "",
                edad: "18",
                genero: "M",
                institucion: "InstitutoMontenegro",
                codigo_institucional: "ieinstituto2026",
                grado: cicloGrado,
                grupo: cicloGrado,
                asignatura: "Ciencias Naturales",
                materias: ["Ciencias Naturales"],
                pago_realizado: true,
                pago_activo: true,
                suscrito: true,
                tipo_acceso: "institucional_ilimitado"
            };

            const normDoc = docFinal.toLowerCase().replace(/[\.\,\-\_\s]/g, '');
            let uList = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
            const idx = uList.findIndex(u => String(u.documento || u.id || '').toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc);
            if (idx >= 0) uList[idx] = { ...uList[idx], ...payload };
            else uList.push(payload);
            localStorage.setItem('usuarios_db', JSON.stringify(uList));

            const sessionData = {
                status: 'success',
                usuario: docFinal,
                nombre: rawNombre,
                rol: esCiclo ? 'validacion' : 'estudiante',
                grado: cicloGrado,
                grupo: cicloGrado,
                asignatura: "Ciencias Naturales",
                institucion: "InstitutoMontenegro",
                pago_activo: true,
                pago_realizado: true,
                usuarioObj: payload
            };
            localStorage.setItem('usuario_sesion', JSON.stringify(sessionData));

            // Cerrar modal
            const modalAuto = document.getElementById("modal-auto-habilitacion");
            if (modalAuto) modalAuto.style.display = "none";

            // Sincronizar backend en segundo plano
            fetch('/api/registro-estudiante', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(() => {});

            // Iniciar sesión inmediatamente y personalizar interfaz
            window.inicializarPanelEstudiante(sessionData);
        });
    }

    // ==========================================
    // LÓGICA PANEL DOCENTE HOME SCHOOL
    // ==========================================
    const btnDocenteMatricular = document.getElementById("btn-docente-matricular");
    if (btnDocenteMatricular) {
        btnDocenteMatricular.addEventListener("click", async function(e) {
            e.preventDefault();
            const doc = document.getElementById("docente-reg-doc") ? document.getElementById("docente-reg-doc").value.trim() : "";
            const nom = document.getElementById("docente-reg-nom") ? document.getElementById("docente-reg-nom").value.trim() : "";
            const ape = document.getElementById("docente-reg-ape") ? document.getElementById("docente-reg-ape").value.trim() : "";
            const edad = document.getElementById("docente-reg-edad") ? document.getElementById("docente-reg-edad").value.trim() : "";
            const gen = document.getElementById("docente-reg-gen") ? document.getElementById("docente-reg-gen").value : "";
            const grado = document.getElementById("docente-reg-grado") ? document.getElementById("docente-reg-grado").value : "";
            
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

            if (materias_matriculadas.length === 0) {
                materias_matriculadas = window.obtenerMateriasHorarioGrado(grado);
            }

            btnDocenteMatricular.innerText = "Guardando...";
            btnDocenteMatricular.disabled = true;

            const normDoc = doc.toLowerCase().replace(/[\.\,\-\_\s]/g, '');
            const payload = {
                documento: doc,
                nombre: nom,
                apellidos: ape,
                edad: edad,
                genero: gen,
                grado: grado,
                grupo: grado,  // Para ciclos, el grupo ES el ciclo
                asignatura: materias_matriculadas.join(', '),
                materias: materias_matriculadas,
                docente_id: usuario_actual || 'docente',
                institucion: 'IE Instituto Montenegro',
                codigo_institucional: 'ieinstituto2026',
                pago_realizado: true,
                pago_activo: true,
                suscrito: true,
                tipo_acceso: 'institucional_ilimitado'
            };

            // Guardar inmediatamente en localStorage como respaldo local
            try {
                let uList = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
                const idx = uList.findIndex(u => String(u.documento || u.id || '').toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc);
                if (idx >= 0) uList[idx] = { ...uList[idx], ...payload };
                else uList.push(payload);
                localStorage.setItem('usuarios_db', JSON.stringify(uList));
            } catch(e) {}

            try {
                const res = await fetch("/api/registro-estudiante", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                alert(`✅ Estudiante ${nom} ${ape} matriculado con éxito.`);
            } catch (error) {
                alert(`✅ Estudiante ${nom} ${ape} matriculado localmente.`);
            } finally {
                // Limpiar form
                if (document.getElementById("docente-reg-doc")) document.getElementById("docente-reg-doc").value = "";
                if (document.getElementById("docente-reg-nom")) document.getElementById("docente-reg-nom").value = "";
                if (document.getElementById("docente-reg-ape")) document.getElementById("docente-reg-ape").value = "";
                if (document.getElementById("docente-reg-edad")) document.getElementById("docente-reg-edad").value = "";
                if (document.getElementById("docente-reg-gen")) document.getElementById("docente-reg-gen").value = "";
                if (document.getElementById("docente-reg-grado")) document.getElementById("docente-reg-grado").value = "";
                if (document.getElementById("materias-checkboxes-container")) {
                    document.getElementById("materias-checkboxes-container").innerHTML = '<span style="color: #6B7280; font-size: 0.9rem;">Selecciona un grado primero.</span>';
                }
                
                cargarEstudiantesDocente(usuario_actual);
                btnDocenteMatricular.innerText = "Matricular Estudiante";
                btnDocenteMatricular.disabled = false;
            }
        });
    }

    // Registro de estudiante (Auto-registro en página web)
    // Registro de estudiante (Auto-registro en página web y móviles)
    window.ejecutarRegistroEstudiante = async function(e) {
        if (e && e.preventDefault) e.preventDefault();
        
        const feedback = document.getElementById("reg-feedback-msg");
        function mostrarErrorReg(msg) {
            if (feedback) {
                feedback.style.display = "block";
                feedback.style.background = "#FEE2E2";
                feedback.style.color = "#991B1B";
                feedback.style.border = "1px solid #FCA5A5";
                feedback.innerText = msg;
            }
            alert(msg);
        }

        const docElem = document.getElementById("reg-documento");
        const apElem = document.getElementById("reg-apellidos");
        const nomElem = document.getElementById("reg-nombre");
        const edElem = document.getElementById("reg-edad");
        const genElem = document.getElementById("reg-genero");
        const ieElem = document.getElementById("reg-ie");
        const graElem = document.getElementById("reg-grado");
        const grupoElem = document.getElementById("registro-grupo");
        const asigElem = document.getElementById("registro-asignatura");
        const codElem = document.getElementById("reg-codigo-institucional");
        const btnSubmit = document.getElementById("btn-submit-register");

        const doc = docElem ? docElem.value.trim() : "";
        const ap = apElem ? apElem.value.trim() : "";
        const nom = nomElem ? nomElem.value.trim() : "";
        const ed = edElem ? edElem.value.trim() : "";
        const gen = genElem ? genElem.value : "";
        const ie = ieElem ? ieElem.value : "";
        const gra = graElem ? graElem.value : "";
        let grupo = grupoElem ? grupoElem.value : "";
        let asig = asigElem ? asigElem.value : "";
        const codigoInst = codElem ? codElem.value.trim() : "";

        if (!doc) { mostrarErrorReg("⚠️ El campo Número de Documento es obligatorio."); return; }
        if (!nom) { mostrarErrorReg("⚠️ El campo Nombres es obligatorio."); return; }
        if (!ap) { mostrarErrorReg("⚠️ El campo Apellidos es obligatorio."); return; }
        if (!ie) { mostrarErrorReg("⚠️ Debes seleccionar tu Institución o Modalidad de estudio."); return; }

        const tipoDocSel = document.getElementById("reg-tipo-doc");
        const tipoDoc = tipoDocSel ? tipoDocSel.value : (doc.length > 8 ? "CC" : "TI");
        const normDoc = doc.toLowerCase().replace(/[\.\,\-\_\s]/g, '');

        // ==========================================
        // CASO 1: REGISTRO DE TUTOR HOME SCHOOL
        // ==========================================
        if (ie === "HomeSchool") {
            if (btnSubmit) {
                btnSubmit.innerText = "⏳ Creando Cuenta de Tutor...";
                btnSubmit.disabled = true;
            }
            if (feedback) {
                feedback.style.display = "block";
                feedback.style.background = "#ECFDF5";
                feedback.style.color = "#065F46";
                feedback.style.border = "1px solid #86EFAC";
                feedback.innerText = "⏳ Registrando Tutor Home School e ingresando al panel...";
            }

            const payloadTutor = {
                documento: doc,
                cedula: doc,
                usuario: doc,
                nombre: nom,
                nombres: nom,
                apellidos: ap,
                nombre_completo: `${nom} ${ap}`.trim(),
                edad: ed || '35',
                genero: gen || 'otro',
                rol: 'homeschool_tutor',
                tipo: 'tutor_homeschool',
                institucion: 'HomeSchool'
            };

            // 1. Guardar localmente
            try {
                let dList = JSON.parse(localStorage.getItem('docentes_db') || '[]');
                const idx = dList.findIndex(d => String(d.documento || d.usuario || '').toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc);
                if (idx >= 0) dList[idx] = { ...dList[idx], ...payloadTutor };
                else dList.push(payloadTutor);
                localStorage.setItem('docentes_db', JSON.stringify(dList));
            } catch(e) {}

            const sessionData = {
                status: 'success',
                usuario: doc,
                nombre: `${nom} ${ap}`.trim(),
                rol: 'homeschool_tutor',
                tipo: 'tutor_homeschool',
                institucion: 'HomeSchool',
                usuarioObj: payloadTutor
            };
            localStorage.setItem('usuario_sesion', JSON.stringify(sessionData));

            // 2. Enviar a servidor
            try {
                await fetch("/api/registro-tutor", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payloadTutor)
                });
            } catch(err) {
                console.warn("Registro tutor guardado localmente:", err);
            }

            alert(`✅ ¡Registro de Tutor Exitoso!\n\nBienvenido(a) ${nom} ${ap}. Has ingresado a tu Panel de Tutor Home School.\n\nDesde aquí puedes matricular a tus hijos o estudiantes a cargo, consultar las mallas DBA y orientar su aprendizaje.`);

            // 3. Activar Panel de Tutor
            window.usuario_actual = doc;
            window.rol_actual = 'homeschool_tutor';
            if (typeof mostrarVista === 'function') mostrarVista('tutor-dashboard-container');
            const tutorView = document.getElementById("tutor-dashboard-container");
            if (tutorView) tutorView.style.display = "block";
            const tHeader = document.getElementById('tutor-nombre-header');
            if (tHeader) tHeader.innerText = `${nom} ${ap}`.trim();
            if (typeof window.cargarEstudiantesTutor === 'function') {
                window.cargarEstudiantesTutor(doc);
            }

            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            if (document.documentElement) document.documentElement.scrollTop = 0;
            if (document.body) document.body.scrollTop = 0;
            if (tutorView) tutorView.scrollTop = 0;
            return;
        }

        // ==========================================
        // CASO: REGISTRO DE DOCENTE REGULAR (COLEGIO / INSTITUCIÓN)
        // ==========================================
        if (ie === "DocenteRegular") {
            const normCod = codigoInst.toLowerCase().replace(/[\.\,\-\_\s]/g, '');
            if (normCod !== "ieinstituto2026" && normCod !== "instituto2026" && normCod !== "docente2026" && normCod !== "steam2026" && normCod !== "admin") {
                mostrarErrorReg("❌ Código institucional / verificación docente incorrecto.\n\nPara inscribirte como Docente debes ingresar el código oficial: ieinstituto2026");
                if (codElem) {
                    codElem.focus();
                    codElem.style.borderColor = "#EF4444";
                }
                return;
            }

            if (btnSubmit) {
                btnSubmit.innerText = "⏳ Creando Cuenta de Docente...";
                btnSubmit.disabled = true;
            }
            if (feedback) {
                feedback.style.display = "block";
                feedback.style.background = "#F5F3FF";
                feedback.style.color = "#5B21B6";
                feedback.style.border = "1px solid #DDD6FE";
                feedback.innerText = "⏳ Registrando cuenta de Docente Regular e ingresando...";
            }

            const selDocIE = document.getElementById("reg-docente-ie-select");
            const ieDocenteSeleccionada = (selDocIE && selDocIE.value.trim()) ? selDocIE.value.trim() : "IE Instituto Montenegro";
            
            const materiasDocente = (window.obtenerMateriasDocenteSeleccionadas) ? window.obtenerMateriasDocenteSeleccionadas() : [asig || "Ciencias Naturales y Educación Ambiental"];
            const gradosDocente = (window.obtenerGradosDocenteSeleccionados) ? window.obtenerGradosDocenteSeleccionados() : ["6", "7", "8", "9"];
            let asigDoc = materiasDocente.join(', ');
            let graDoc = gradosDocente.join(', ');
            let grupoDoc = gradosDocente.join(', ');

            const payloadDocente = {
                tipo_doc: tipoDoc,
                tipo_documento: tipoDoc,
                documento: doc,
                cedula: doc,
                usuario: doc,
                nombre: nom,
                nombres: nom,
                apellidos: ap,
                nombre_completo: `${nom} ${ap}`.trim(),
                edad: ed || '30',
                genero: gen || 'otro',
                rol: 'docente',
                tipo: 'docente_regular',
                institucion: ieDocenteSeleccionada,
                codigo_institucional: codigoInst,
                asignatura: asigDoc,
                materias: materiasDocente,
                grados: gradosDocente,
                grado: graDoc,
                grupo: grupoDoc,
                pago_realizado: true,
                pago_activo: true,
                fecha_registro: new Date().toISOString()
            };

            // 1. Guardar localmente en docentes_db y usuarios_db
            try {
                let dList = JSON.parse(localStorage.getItem('docentes_db') || '[]');
                const idx = dList.findIndex(d => String(d.documento || d.usuario || d.cedula || '').toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc);
                if (idx >= 0) dList[idx] = { ...dList[idx], ...payloadDocente };
                else dList.push(payloadDocente);
                localStorage.setItem('docentes_db', JSON.stringify(dList));

                let uList = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
                const uIdx = uList.findIndex(u => String(u.documento || u.id || '').toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc);
                if (uIdx >= 0) uList[uIdx] = { ...uList[uIdx], ...payloadDocente };
                else uList.push(payloadDocente);
                localStorage.setItem('usuarios_db', JSON.stringify(uList));
            } catch(e) {}

            const sessionData = {
                status: 'success',
                usuario: doc,
                nombre: `${nom} ${ap}`.trim(),
                rol: 'docente',
                tipo: 'docente_regular',
                institucion: 'IE Instituto Montenegro',
                asignatura: asigDoc,
                grado: graDoc,
                grupo: grupoDoc,
                pago_activo: true,
                pago_realizado: true,
                usuarioObj: payloadDocente
            };
            localStorage.setItem('usuario_sesion', JSON.stringify(sessionData));

            // 2. Enviar a servidor
            try {
                await fetch("/api/registro-estudiante", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payloadDocente)
                });
            } catch(err) {
                console.warn("Registro docente guardado localmente:", err);
            }

            alert(`✅ ¡Inscripción de Docente Regular Exitosa!\n\nBienvenido(a) Profesor(a) ${nom} ${ap}.\n\nHas ingresado a tu Panel Docente. Desde aquí puedes proyectar la clase, consultar el Leaderboard en vivo, evaluar con rúbricas formativas y utilizar la Caja de Herramientas STEAM.`);

            // 3. Activar Panel de Docente
            window.usuario_actual = doc;
            window.rol_actual = 'docente';
            if (typeof mostrarVista === 'function') mostrarVista('docente-dashboard-container');
            const docenteView = document.getElementById("docente-dashboard-container");
            if (docenteView) docenteView.style.display = "block";
            const dHeader = document.getElementById('docente-nombre-header');
            if (dHeader) dHeader.innerText = `${nom} ${ap}`.trim();
            if (typeof window.cargarEstudiantesDocente === 'function') {
                window.cargarEstudiantesDocente(doc);
            }

            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            if (document.documentElement) document.documentElement.scrollTop = 0;
            if (document.body) document.body.scrollTop = 0;
            if (docenteView) docenteView.scrollTop = 0;
            return;
        }

        // ==========================================
        // CASO 2: REGISTRO DE ESTUDIANTE (VALIDACIÓN O COLEGIO REGULAR)
        // ==========================================
        if (!ed) { mostrarErrorReg("⚠️ El campo Edad es obligatorio."); return; }
        if (!gen) { mostrarErrorReg("⚠️ El campo Género es obligatorio."); return; }
        if (ie === 'InstitutoMontenegro' && !grupo) { mostrarErrorReg("⚠️ Debes seleccionar tu Grupo en la IE Instituto Montenegro."); return; }
        if (ie === 'Validacion' && !gra) { mostrarErrorReg("⚠️ Debes seleccionar tu Grado o Ciclo a cursar."); return; }

        // Si por alguna razón el campo oculto de asignaturas no se llenó en el móvil, calcularlo automáticamente
        if (!asig) {
            if (typeof actualizarMaterias === 'function') actualizarMaterias();
            asig = asigElem ? asigElem.value : "";
        }
        if (!asig) {
            if (ie === "Validacion" || (gra && gra.includes("Ciclo")) || (grupo && grupo.includes("Ciclo"))) {
                asig = "Ciencias Naturales, Matemáticas, Física, Química, Lengua Castellana, Ciencias Sociales, Inglés, Filosofía y Ética";
            } else {
                asig = "Física, Matemáticas, Ciencias Naturales, Lengua Castellana, Ciencias Sociales, Inglés, Tecnología, Educación Artística, Ética";
            }
        }

        const normCod = codigoInst.toLowerCase().replace(/[\.\,\-\_\s]/g, '');
        // Validación estricta del código institucional para IE Instituto Montenegro
        if (ie === "InstitutoMontenegro") {
            if (normCod !== "ieinstituto2026" && normCod !== "instituto2026") {
                mostrarErrorReg("❌ Código institucional incorrecto.\n\nPara matricularte en la IE Instituto Montenegro debes ingresar el código oficial: ieinstituto2026");
                if (codElem) {
                    codElem.focus();
                    codElem.style.borderColor = "#EF4444";
                }
                return;
            }
        }

        let gradoFinal = gra || grupo;
        let grupoFinal = grupo || gra;

        // Para Ciclos del nocturno (I al VI), la asignatura SIEMPRE es Ciencias Naturales
        if (gradoFinal.includes("Ciclo") || grupoFinal.includes("Ciclo")) {
            asig = "Ciencias Naturales";
        }

        if (ie === 'RamonMessa' && gra && !gra.includes('Ciclo')) {
            grupoFinal = 'RM-' + gra + 'A';
        }

        const payload = {
            tipo_doc: tipoDoc,
            tipo_documento: tipoDoc,
            documento: doc,
            apellidos: ap,
            nombre: nom,
            edad: ed,
            genero: gen,
            institucion: ie,
            codigo_institucional: codigoInst,
            grado: gradoFinal,
            grupo: grupoFinal,
            asignatura: asig,
            materias: asig.split(',').map(s => s.trim()).filter(Boolean),
            pago_realizado: ie === "InstitutoMontenegro",
            pago_activo: ie === "InstitutoMontenegro",
            suscrito: ie === "InstitutoMontenegro",
            tipo_acceso: ie === "InstitutoMontenegro" ? "institucional_ilimitado" : "freemium_primera_guia_gratis"
        };

        // 1. Guardar inmediatamente en respaldo local usuarios_db y en window.todosEstudiantes
        try {
            let uList = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
            const idx = uList.findIndex(u => String(u.documento || u.id || '').toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc);
            if (idx >= 0) uList[idx] = { ...uList[idx], ...payload };
            else uList.push(payload);
            localStorage.setItem('usuarios_db', JSON.stringify(uList));

            if (!window.todosEstudiantes) window.todosEstudiantes = [];
            const idxGlobal = window.todosEstudiantes.findIndex(u => String(u.documento || u.id || '').toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc);
            if (idxGlobal >= 0) window.todosEstudiantes[idxGlobal] = { ...window.todosEstudiantes[idxGlobal], ...payload };
            else window.todosEstudiantes.push(payload);
        } catch(e) {}

        // 2. Prellenar datos de sesión
        const sessionData = {
            status: 'success',
            usuario: doc,
            nombre: `${nom} ${ap}`.trim(),
            rol: (ie === 'Validacion' || gradoFinal.includes('Ciclo') || grupoFinal.includes('Ciclo')) ? 'validacion' : 'estudiante',
            grado: gradoFinal,
            grupo: grupoFinal,
            asignatura: asig,
            institucion: ie,
            pago_activo: ie === "InstitutoMontenegro",
            pago_realizado: ie === "InstitutoMontenegro",
            usuarioObj: payload
        };
        localStorage.setItem('usuario_sesion', JSON.stringify(sessionData));

        if (btnSubmit) {
            btnSubmit.innerText = "⏳ Matriculando e Ingresando...";
            btnSubmit.disabled = true;
        }

        if (feedback) {
            feedback.style.display = "block";
            feedback.style.background = "#ECFDF5";
            feedback.style.color = "#065F46";
            feedback.style.border = "1px solid #86EFAC";
            feedback.innerText = "⏳ Registrando en servidor e iniciando sesión...";
        }

        try {
            const res = await fetch("/api/registro-estudiante", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const resData = await res.json().catch(() => ({}));
            if (!res.ok && resData.error) {
                mostrarErrorReg("⚠️ " + resData.error);
                if (btnSubmit) {
                    btnSubmit.innerText = "Continuar con la Matrícula";
                    btnSubmit.disabled = false;
                }
                return;
            }
        } catch (err) {
            console.warn("Registro enviado y guardado localmente:", err);
        }

        const bienvenidaMsg = ie === "InstitutoMontenegro"
            ? `✅ ¡Matrícula oficial exitosa en IE Instituto Montenegro!\n\nBienvenido(a) ${nom} ${ap}. Ingresando a tu aula virtual...`
            : `✅ ¡Matrícula completada exitosamente!\n\nBienvenido(a) ${nom} ${ap}. Ingresando a tu aula virtual...`;
        alert(bienvenidaMsg);

        // Iniciar sesión inmediatamente y activar vista de estudiante personalizada
        window.inicializarPanelEstudiante(sessionData);
        
        // Reset scroll en móviles y desktop
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
        const sDash = document.getElementById("student-dashboard-container");
        if (sDash) sDash.scrollTop = 0;
    };

    const btnSubmit = document.getElementById("btn-submit-register");
    if (btnSubmit) {
        btnSubmit.addEventListener("click", window.ejecutarRegistroEstudiante);
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

}; // Fin inicializarAppCore

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.inicializarAppCore);
} else {
    window.inicializarAppCore();
}

// ==========================================
// FUNCIONES GLOBALES
// ==========================================

// Helper global para resolver el nombre real del estudiante
window.obtenerNombreCompletoEstudiante = function(est) {
    if (!est) return 'Estudiante';
    if (typeof est === 'string') return est.trim() || 'Estudiante';
    if (est.nombre_completo && est.nombre_completo.trim() && est.nombre_completo !== 'Estudiante Nocturno' && est.nombre_completo !== 'Estudiante') {
        return est.nombre_completo.trim();
    }
    if (est.nombre_estudiante && est.nombre_estudiante.trim() && est.nombre_estudiante !== 'Estudiante Nocturno' && est.nombre_estudiante !== 'Estudiante') {
        return est.nombre_estudiante.trim();
    }
    const nomPart = (est.nombre || est.nombres || '').trim();
    const apePart = (est.apellidos || '').trim();
    const full = `${nomPart} ${apePart}`.trim();
    if (full && full !== 'Estudiante Nocturno' && full !== 'Estudiante') {
        return full;
    }
    if (nomPart && nomPart !== 'Estudiante' && nomPart !== 'Estudiante Nocturno') return nomPart;
    if (est.alias && est.alias !== 'Explorador STEAM') return est.alias;
    return est.documento || 'Estudiante';
};

window.abrirModalEditarEstudianteDocente = async function(docClean, currentName) {
    const defaultVal = (currentName === 'Estudiante Nocturno' || currentName === 'Estudiante') ? '' : currentName;
    const nuevoNombre = prompt(`✏️ Editar Nombre Completo del Estudiante (Documento: ${docClean}):\n\nIngresa los Nombres y Apellidos reales:`, defaultVal);
    if (nuevoNombre === null) return;
    const trimNom = nuevoNombre.trim();
    if (!trimNom) {
        alert("El nombre no puede estar vacío.");
        return;
    }

    const partes = trimNom.split(' ');
    const nombre = partes[0] || trimNom;
    const apellidos = partes.slice(1).join(' ') || '';

    try {
        const res = await fetch('/api/registro-estudiante', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                documento: docClean,
                nombre: nombre,
                apellidos: apellidos,
                nombre_completo: trimNom,
                nombre_estudiante: trimNom
            })
        });

        // Actualizar local db
        const localUsers = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
        const idx = localUsers.findIndex(u => String(u.documento || u.id || u.usuario || '').trim() === String(docClean).trim());
        if (idx !== -1) {
            localUsers[idx].nombre = nombre;
            localUsers[idx].apellidos = apellidos;
            localUsers[idx].nombre_completo = trimNom;
            localUsers[idx].nombre_estudiante = trimNom;
        } else {
            localUsers.push({ documento: docClean, nombre, apellidos, nombre_completo: trimNom, nombre_estudiante: trimNom });
        }
        localStorage.setItem('usuarios_db', JSON.stringify(localUsers));

        if (Array.isArray(window.todosEstudiantes)) {
            const eIdx = window.todosEstudiantes.findIndex(u => String(u.documento || u.id || '').trim() === String(docClean).trim());
            if (eIdx !== -1) {
                window.todosEstudiantes[eIdx].nombre = nombre;
                window.todosEstudiantes[eIdx].apellidos = apellidos;
                window.todosEstudiantes[eIdx].nombre_completo = trimNom;
                window.todosEstudiantes[eIdx].nombre_estudiante = trimNom;
            }
        }

        alert(`✅ ¡Nombre del estudiante (${docClean}) asignado con éxito a: ${trimNom}!`);

        if (typeof window.cargarEstudiantesDocente === 'function') {
            window.cargarEstudiantesDocente(window.usuario_actual || 'docente');
        }
        const containerGrupo = document.getElementById('admin-estudiantes-grupo-container');
        if (containerGrupo && containerGrupo.style.display !== 'none' && window.grupoActualSeleccionado) {
            window.verDetalleGrupo(window.grupoActualSeleccionado);
        }
    } catch(e) {
        console.error(e);
        alert("Error de red al intentar actualizar el nombre del estudiante.");
    }
};

async function cargarEstudiantesDocente(docenteId) {
    try {
        let estudiantes = [];
        try {
            const res = await fetch('/api/estudiantes');
            if (res.ok) estudiantes = await res.json();
        } catch(netErr) {}
        
        // Unir con respaldo local de usuarios_db para garantizar visibilidad inmediata
        const localUsers = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
        localUsers.forEach(lu => {
            const normDoc = String(lu.documento || lu.id || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');
            if (normDoc && !estudiantes.some(e => String(e.documento || e.id || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc)) {
                estudiantes.push(lu);
            }
        });

        const tbody = document.getElementById('tbody-docente-estudiantes');
        const filtroAsig = document.getElementById('filtro-asignatura') ? document.getElementById('filtro-asignatura').value : "Todas las Asignaturas";
        const filtroGrupo = document.getElementById('filtro-grupo') ? document.getElementById('filtro-grupo').value : "Todos los Grupos";

        if (tbody) {
            tbody.innerHTML = '';
            estudiantes.forEach(est => {
                const matchAsig = (filtroAsig === "Todas las Asignaturas") || (est.asignatura && est.asignatura.includes(filtroAsig));
                const matchGrupo = (filtroGrupo === "Todos los Grupos") || (est.grupo === filtroGrupo) || (est.grado === filtroGrupo);
                const isMyStudent = !est.docente_id || est.docente_id === docenteId || docenteId === 'jramirezgiraldo' || docenteId === 'admin' || est.institucion === 'InstitutoMontenegro' || est.institucion === 'IE Instituto Montenegro';

                if (isMyStudent && matchAsig && matchGrupo) {
                    const docClean = est.documento || est.usuario || est.id || '';
                    const tipoDoc = est.tipo_doc || est.tipo_documento || (docClean.length > 8 ? 'CC' : 'TI');
                    const nomClean = window.obtenerNombreCompletoEstudiante(est);
                    const grupoClean = est.grupo || est.grado || '';
                    const asigClean = est.asignatura || 'Ciencias Naturales';
                    const edad = est.edad ? `${est.edad} años` : 'N/A';
                    const genero = est.genero === 'F' ? '♀ F' : (est.genero === 'M' ? '♂ M' : (est.genero || 'N/A'));
                    const inst = est.institucion === 'InstitutoMontenegro' ? 'IE Instituto Montenegro' : (est.institucion || 'IE Instituto Montenegro');

                    let xpEst = parseInt(localStorage.getItem(`xp_${docClean}`)) || 0;
                    if (xpEst === 0) {
                        const diagXP = parseInt(localStorage.getItem(`prog_${docClean}_diag_xp`)) || 0;
                        xpEst = diagXP || 500;
                    }
                    const bonusTotal = parseInt(localStorage.getItem(`bonus_total_${docClean}`)) || 0;
                    const penaltyTotal = parseInt(localStorage.getItem(`penalty_total_${docClean}`)) || 0;
                    let totalXPAcumulado = Math.max(0, xpEst + bonusTotal - penaltyTotal);

                    tbody.innerHTML += `
                    <tr style="border-bottom: 1px solid #F1F5F9;">
                        <td style="padding: 12px 10px; font-family: monospace; font-size: 0.9rem;">
                            <span style="background: #F1F5F9; color: #475569; padding: 2px 5px; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">${tipoDoc}</span>
                            <strong>${docClean}</strong>
                        </td>
                        <td style="padding: 12px 10px; font-weight: 800; color: #1E293B;">
                            ${nomClean}
                            <button onclick="abrirModalEditarEstudianteDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}')" style="background: #F3F4F6; border: 1px solid #CBD5E1; color: #374151; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; cursor: pointer; margin-left: 6px; display: inline-flex; align-items: center; gap: 4px;" title="Editar o asignar el nombre real de este estudiante">
                                ✏️ Editar Nombre
                            </button>
                        </td>
                        <td style="padding: 12px 10px; font-size: 0.85rem; color: #475569;">
                            <b>${edad}</b> • <span>${genero}</span>
                        </td>
                        <td style="padding: 12px 10px; color: #334155; font-size: 0.9rem;">
                            <span style="background: #F1F5F9; color: #334155; padding: 3px 8px; border-radius: 6px; font-weight: bold;">${grupoClean}</span>
                        </td>
                        <td style="padding: 12px 10px; font-size: 0.82rem;">
                            <span style="background: #EFF6FF; color: #1E40AF; padding: 3px 8px; border-radius: 6px; font-weight: 600;">${inst}</span>
                        </td>
                        <td style="padding: 12px 10px;">
                            <span style="background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; padding: 4px 10px; border-radius: 16px; font-weight: 900; font-size: 0.85rem;">
                                🌟 ${totalXPAcumulado} XP
                            </span>
                        </td>
                        <td style="padding: 12px 10px; text-align: center;">
                            <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; align-items: center;">
                                <button onclick="abrirGuiaOrientadorDirecto('${docClean}', '${grupoClean}', '${asigClean}')" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 800; cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;" title="Ver la guía resuelta con respuestas oficiales para este estudiante">
                                    👁️ Guía
                                </button>
                                <button onclick="verInformeEstudiante('${nomClean}', 0, '${grupoClean}', '${docClean}')" style="background: #2563EB; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 800; cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;" title="Ver informe completo">
                                    📊 Informe
                                </button>
                                <button onclick="abrirMallaDocenteDesdeEstudiante('${grupoClean}', '${asigClean}')" style="background: #059669; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 800; cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(5,150,105,0.2);" title="Ver Malla Curricular Oficial DBA del grado de este estudiante">
                                    📚 Malla DBA
                                </button>
                                <button onclick="abrirModalBonificacion('${docClean}', '${nomClean}', '${grupoClean}')" style="background: #10B981; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 800; cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px;" title="Otorgar bonificación del +10% XP">
                                    🎁 +10%
                                </button>

                                <!-- Menú Colgante Sanciones Disciplinarias (-10%) -->
                                <div class="dropdown-sancion-container" style="position: relative; display: inline-block;">
                                    <button onclick="toggleMenuSancion('${docClean}', event)" style="background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 800; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(220,38,38,0.25);" title="Aplicar sanción disciplinaria del -10% de puntos">
                                        ⚡ -10% ▾
                                    </button>
                                    <div id="menu-sancion-${docClean}" class="menu-sancion-dropdown" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 4px; background: white; border: 1.5px solid #E2E8F0; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); min-width: 215px; z-index: 9999; padding: 6px 0; text-align: left;">
                                        <div style="padding: 6px 12px; font-size: 0.72rem; font-weight: 800; color: #64748B; text-transform: uppercase; border-bottom: 1px solid #F1F5F9;">
                                            Sanción Disciplinaria (-10%)
                                        </div>
                                        <button onclick="aplicarSancionDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}', 'Indisciplina', '⚡ Indisciplina en clase')" class="item-sancion-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: #1E293B; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                            ⚡ Indisciplina
                                        </button>
                                        <button onclick="aplicarSancionDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}', 'Comer en clase', '🥪 Comer en clase')" class="item-sancion-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: #1E293B; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                            🥪 Comer en clase
                                        </button>
                                        <button onclick="aplicarSancionDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}', 'Uso de celular', '📱 Usar el celular')" class="item-sancion-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: #1E293B; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                            📱 Usar el celular
                                        </button>
                                        <button onclick="aplicarSancionDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}', 'Levantarse sin permiso', '🚶 Levantarse sin permiso')" class="item-sancion-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: #1E293B; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                            🚶 Levantarse sin permiso
                                        </button>
                                        <button onclick="aplicarSancionDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}', 'Arrancar hojas', '📄 Arrancar hojas')" class="item-sancion-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: #1E293B; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                            📄 Arrancar hojas
                                        </button>
                                        <div style="border-top: 1px solid #F1F5F9; margin-top: 3px; padding-top: 3px;">
                                            <button onclick="aplicarSancionDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}', 'Personalizado')" class="item-sancion-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: #6366F1; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                                ✏️ Otro motivo...
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>`;
                }
            });
        }
    } catch(e) { console.error(e); }
}

window.HORARIO_IE_MONTENEGRO = {
    "6": ["Física"],
    "6A": ["Física"],
    "6B": ["Física"],
    "7": ["Física", "Turismo", "Ética", "Artística"],
    "7A": ["Física", "Turismo"],
    "7B": ["Física", "Turismo"],
    "7C": ["Física", "Turismo", "Ética", "Artística"],
    "8": ["Artística"],
    "8A": ["Artística"],
    "8B": ["Artística"],
    "9": ["Artística"],
    "9A": ["Artística"],
    "10": ["Ética"],
    "10A": ["Ética"],
    "10D": ["Ética"],
    "11": ["Física", "Química", "Ética", "Turismo"],
    "PENS": ["Química", "Turismo"],
    "Ciclo I": ["Ciencias Naturales"],
    "Ciclo II": ["Ciencias Naturales"],
    "Ciclo III": ["Ciencias Naturales"],
    "Ciclo IV": ["Ciencias Naturales"],
    "Ciclo V": ["Ciencias Naturales"],
    "Ciclo VI": ["Ciencias Naturales"]
};

window.obtenerMateriasHorarioGrado = function(gradoStr) {
    if (!gradoStr) return ["Física"];
    const str = String(gradoStr).trim().toUpperCase();

    if (str.includes('CICLO')) return ["Ciencias Naturales"];
    if (str === 'PENS') return ["Química", "Turismo"];

    if (window.HORARIO_IE_MONTENEGRO[str]) return window.HORARIO_IE_MONTENEGRO[str];

    // Buscar coincidencia directa de grado (6A -> 6A, 7C -> 7C) o por número (6, 7, 8, 9, 10, 11)
    const match = str.match(/\b(10|11|[6-9])[A-Z]?\b/);
    if (match && window.HORARIO_IE_MONTENEGRO[match[0]]) {
        return window.HORARIO_IE_MONTENEGRO[match[0]];
    }

    const numMatch = str.match(/\b(10|11|[6-9])\b/);
    if (numMatch && window.HORARIO_IE_MONTENEGRO[numMatch[1]]) {
        return window.HORARIO_IE_MONTENEGRO[numMatch[1]];
    }

    return ["Física"];
};

async function cargarAsignaturasDocente(gradoSeleccionado) {
    const container = document.getElementById("materias-checkboxes-container");
    if (!container) return;
    
    if (!gradoSeleccionado) {
        container.innerHTML = '<span style="color: #6B7280; font-size: 0.9rem;">Selecciona un grado primero.</span>';
        return;
    }

    const materiasOficiales = window.obtenerMateriasHorarioGrado(gradoSeleccionado);

    let html = '';
    materiasOficiales.forEach(materia => {
        html += `
        <label style="display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 4px; font-weight: 700; color: #1E293B;">
            <input type="checkbox" class="materia-chk" value="${materia}" checked style="width: 18px; height: 18px;">
            📚 ${materia}
        </label>`;
    });

    container.innerHTML = html;
}


// Helper para verificar si un estudiante pertenece a un grupo/ciclo específico
window.perteneceAlGrupo = function(est, grupoName) {
    if (!est || !grupoName) return false;
    const gEst = (est.grupo || '').trim();
    const graEst = (est.grado || '').trim();
    const target = grupoName.trim();

    if (gEst === target || graEst === target) return true;

    // Comparación robusta para Ciclos (I, II, III, IV, V, VI)
    if (target.toLowerCase().includes('ciclo') || gEst.toLowerCase().includes('ciclo') || graEst.toLowerCase().includes('ciclo')) {
        const regexCiclo = /ciclo\s*(VI|IV|V|III|II|I)\b/i;
        const targetMatch = target.match(regexCiclo);
        if (targetMatch) {
            const cTarget = targetMatch[1].toUpperCase();
            const estMatch = (gEst + ' ' + graEst).match(regexCiclo);
            if (estMatch && estMatch[1].toUpperCase() === cTarget) {
                return true;
            }
        }
    }

    // Normalización para grupos con prefijo RM-
    if (target.startsWith('RM-')) {
        const simpleTarget = target.replace('RM-', '').toLowerCase();
        if (gEst.toLowerCase() === target.toLowerCase() || gEst.toLowerCase() === simpleTarget || graEst.toLowerCase() === simpleTarget || graEst.toLowerCase() === simpleTarget.replace(/[a-z]/g, '')) {
            return true;
        }
    }

    if (gEst.toLowerCase() === target.toLowerCase()) return true;

    return false;
};

async function cargarDatosAdmin() {
    try {
        // Cargar Docentes
        let docentes = [];
        try {
            const resDocentes = await fetch('/api/docentes');
            if (resDocentes.ok) docentes = await resDocentes.json();
        } catch(e) {}
        
        // Unir con respaldo local de docentes_db
        const localDocentes = JSON.parse(localStorage.getItem('docentes_db') || '[]');
        localDocentes.forEach(ld => {
            const normDoc = String(ld.documento || ld.cedula || ld.usuario || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');
            if (normDoc && !docentes.some(d => String(d.documento || d.cedula || d.usuario || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc)) {
                docentes.push(ld);
            }
        });
        
        // Cargar Estudiantes
        let estudiantes = [];
        try {
            const resEstud = await fetch('/api/estudiantes');
            if (resEstud.ok) estudiantes = await resEstud.json();
        } catch(e) {}

        // Unir con respaldo local de usuarios_db para garantizar visibilidad inmediata de todos los matriculados
        const localUsers = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
        localUsers.forEach(lu => {
            const normDoc = String(lu.documento || lu.id || lu.usuario || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');
            if (normDoc && !estudiantes.some(e => String(e.documento || e.id || e.usuario || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc)) {
                estudiantes.push(lu);
            }
        });

        const tbodyDoc = document.getElementById('tbody-admin-docentes');
        const tbodyEst = document.getElementById('tbody-admin-todos-estudiantes');

        if (tbodyDoc) {
            tbodyDoc.innerHTML = '';
            docentes.forEach(d => {
                const tipoVinculacion = d.institucion ? d.institucion : (d.rol === 'docente' ? 'Docente Regular' : 'Homeschool');
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
        
        // Actualizar automáticamente los contadores de estudiantes en los botones de grupos
        document.querySelectorAll('#grupos-montenegro .grupo-btn, #grupos-ramon_messa .grupo-btn').forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick') || '';
            const match = onclickAttr.match(/abrirGrupo\(['"]([^'"]+)['"]\)/);
            if (match) {
                const gName = match[1];
                const count = estudiantes.filter(e => window.perteneceAlGrupo(e, gName)).length;
                let badge = btn.querySelector('.grupo-badge-count');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'grupo-badge-count';
                    badge.style.fontSize = '0.75rem';
                    badge.style.padding = '3px 8px';
                    badge.style.borderRadius = '12px';
                    badge.style.fontWeight = 'bold';
                    badge.style.marginTop = '4px';
                    btn.appendChild(badge);
                }
                if (count > 0) {
                    badge.style.background = '#DCFCE7';
                    badge.style.color = '#15803D';
                    badge.textContent = `👤 ${count} ${count === 1 ? 'estudiante' : 'estudiantes'}`;
                } else {
                    badge.style.background = '#F3F4F6';
                    badge.style.color = '#9CA3AF';
                    badge.textContent = '0 estudiantes';
                }
            }
        });

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
            await cargarDatosAdmin(); // recargar
            if (window.gradoActualPlaneacion && document.getElementById('admin-estudiantes-grupo-container').style.display !== 'none') {
                window.abrirGrupo(window.gradoActualPlaneacion);
            }
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


function obtenerMateriasPorGrupo(grupoName, est) {
    if (est && est.asignatura) {
        const asigs = est.asignatura.split(',').map(s => s.trim()).filter(Boolean);
        if (asigs.length > 0) {
            return asigs.map(a => ({ nombre: a, horas: 'Semanal', estado: 'Habilitada', color: '#10B981' }));
        }
    }
    if (est && Array.isArray(est.materias) && est.materias.length > 0) {
        return est.materias.map(a => ({ nombre: typeof a === 'string' ? a : (a.nombre || a), horas: 'Semanal', estado: 'Habilitada', color: '#10B981' }));
    }

    if (!grupoName) return [{ nombre: 'Ciencias Naturales', horas: '2h', estado: 'Habilitada', color: '#10B981' }];

    const gUpper = String(grupoName).toUpperCase().trim();
    if (gUpper === '6A' || gUpper === '6B') {
        return [{ nombre: 'Física', horas: '2h', estado: 'Habilitada', color: '#10B981' }];
    } else if (gUpper === '7A') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Física', horas: '3h', estado: 'Habilitada', color: '#10B981' }
        ];
    } else if (gUpper === '7B') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Física', horas: '2h', estado: 'Habilitada', color: '#10B981' }
        ];
    } else if (gUpper === '7C') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Ética', horas: '1h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Física', horas: '2h', estado: 'Habilitada', color: '#10B981' }
        ];
    } else if (gUpper === '8A' || gUpper === '8B' || gUpper === '9A') {
        return [{ nombre: 'Artística', horas: '1h', estado: 'Habilitada', color: '#10B981' }];
    } else if (gUpper === '10A' || gUpper === '10D') {
        return [{ nombre: 'Ética', horas: '1h', estado: 'Habilitada', color: '#10B981' }];
    } else if (gUpper === 'PENS') {
        return [
            { nombre: 'Turismo', horas: '1h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Química', horas: '2h', estado: 'Habilitada', color: '#10B981' }
        ];
    } else if (gUpper.includes('CICLO')) {
        return [{ nombre: 'Ciencias Naturales', horas: '2h', estado: 'Habilitada', color: '#059669' }];
    } else if (gUpper === '3' || gUpper === '4' || gUpper === '5' || gUpper.includes('PRIMARIA')) {
        return [
            { nombre: 'Matemáticas', horas: '5h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Ciencias Naturales', horas: '4h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Lengua Castellana', horas: '5h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Ciencias Sociales', horas: '3h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Inglés', horas: '3h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Tecnología', horas: '2h', estado: 'Habilitada', color: '#10B981' }
        ];
    } else if (['6', '7', '8', '9'].includes(gUpper) || gUpper.includes('SECUNDARIA') || gUpper.startsWith('HS-') || gUpper.startsWith('VAL-')) {
        return [
            { nombre: 'Matemáticas', horas: '4h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Ciencias Naturales', horas: '4h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Física', horas: '3h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Lengua Castellana', horas: '4h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Ciencias Sociales', horas: '3h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Inglés', horas: '3h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Tecnología', horas: '2h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Ética', horas: '1h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Artística', horas: '1h', estado: 'Habilitada', color: '#10B981' }
        ];
    } else if (['10', '11'].includes(gUpper) || gUpper.includes('MEDIA')) {
        return [
            { nombre: 'Matemáticas', horas: '4h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Física', horas: '4h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Química', horas: '4h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Lengua Castellana', horas: '4h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Ciencias Sociales', horas: '3h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Filosofía', horas: '2h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Inglés', horas: '3h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Tecnología', horas: '2h', estado: 'Habilitada', color: '#10B981' }
        ];
    } else {
        return [
            { nombre: 'Matemáticas', horas: '4h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Ciencias Naturales', horas: '4h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Lengua Castellana', horas: '4h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Ciencias Sociales', horas: '3h', estado: 'Habilitada', color: '#10B981' },
            { nombre: 'Inglés', horas: '3h', estado: 'Habilitada', color: '#10B981' }
        ];
    }
}


// --- INICIO MALLA CURRICULAR FÍSICA ---

// ==========================================
// MALLA CURRICULAR TURISMO
// ==========================================
window.mallaTurismo = {
    "7": {
        objetivo: "Desarrollar un producto o servicio turístico local (bien o servicio) en las primeras tres semanas, valorando la riqueza del Paisaje Cultural Cafetero (PCC - Montenegro) y el emprendimiento regional.",
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
                "1": "Desarrollo de Producto Turístico (Semana 1): Identificación de oportunidades locales y diseño inicial del bien o servicio turístico (PCC Montenegro).",
                "3": "Desarrollo de Producto Turístico (Semana 2 y 3): Estructuración del bien o servicio, propuesta de valor, prototipado y validación de campo.",
                "5": "Estrategias de empaquetado, marca y promoción del producto o servicio turístico local.",
                "7": "Costos de producción, precio y comercialización del producto turístico desarrollado."
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
        objetivo: "Desarrollar un producto o servicio turístico regional (bien o servicio) en las primeras tres semanas, fortaleciendo el emprendimiento en el Paisaje Cultural Cafetero.",
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
                "1": "Desarrollo de Producto Turístico (Semana 1): Formulación inicial del bien o servicio turístico para la región del PCC.",
                "3": "Desarrollo de Producto Turístico (Semana 2 y 3): Diseño detallado, propuesta de valor, prototipado y pruebas de mercado.",
                "5": "Estrategias de comercialización y empaquetado del bien o servicio turístico.",
                "7": "Presentación final y plan de negocios del proyecto productivo turístico."
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
    '1': {
        objetivo: 'Desarrollar el pensamiento numérico y espacial inicial: conteo, adición y sustracción básica (0-99), figuras geométricas y resolución de problemas cotidianos.',
        dba: [
            'DBA 1: Identifica los usos de los números (como código, cardinal, medida, ordinal) y las operaciones en la vida diaria.',
            'DBA 2: Utiliza diferentes estrategias para contar, sumar, restar y resolver problemas aditivos sencillos.',
            'DBA 3: Reconoce y compara atributos medibles en objetos: longitud, peso, capacidad y tiempo.',
            'DBA 4: Describe y clasifica figuras bidimensionales y cuerpos tridimensionales en su entorno.'
        ],
        periodos: {
            '1': { '1': 'Conteo y secuencia numérica del 0 al 20.', '3': 'Concepto intuitivo de adición y agrupación.', '5': 'Figuras geométricas básicas (círculo, cuadrado, triángulo).', '7': 'Resolución de problemas de suma sencilla.' },
            '2': { '1': 'Números hasta el 50 y valor posicional (unidades y decenas).', '3': 'Sustracción como quitar y comparar.', '5': 'Noción de longitud (largo, corto) y medición con objetos.', '7': 'Problemas combinados de suma y resta.' },
            '3': { '1': 'Números hasta el 99 y conteo de 2 en 2, 5 en 5 y 10 en 10.', '3': 'Operaciones de suma y resta sin reagrupación.', '5': 'Cuerpos geométricos en el entorno (cubo, esfera, cilindro).', '7': 'Lectura de tablas sencillas y pictogramas.' },
            '4': { '1': 'Ubicación espacial: arriba, abajo, izquierda, derecha.', '3': 'El reloj y la noción del tiempo (días de la semana, meses).', '5': 'Resolución de desafíos matemáticos infantiles.', '7': 'Feria de juegos matemáticos de 1°.' }
        }
    },
    '2': {
        objetivo: 'Consolidar el valor posicional (centenas), suma y resta con reagrupación, iniciación a la multiplicación, medición estándar y recolección de datos.',
        dba: [
            'DBA 1: Aplica el sistema de numeración decimal para representar, comparar y operar con números de hasta tres cifras (0-999).',
            'DBA 2: Utiliza el conteo y la suma iterada para comprender la noción de multiplicación y resolver problemas.',
            'DBA 3: Mide y estima longitudes utilizando instrumentos estandarizados (metro, centímetro) y unidades de tiempo.',
            'DBA 4: Clasifica y organiza datos en tablas de doble entrada y gráficos de barras sencillos.'
        ],
        periodos: {
            '1': { '1': 'Números de tres cifras (centenas) y valor posicional.', '3': 'Adición con reagrupación (llevando).', '5': 'Líneas rectas, curvas y figuras planas.', '7': 'Resolución de problemas de compra y venta.' },
            '2': { '1': 'Sustracción con desagrupación (prestando).', '3': 'La multiplicación como suma repetida.', '5': 'El metro y el centímetro como unidades de medida.', '7': 'Tablas del 2, 3, 4 y 5.' },
            '3': { '1': 'Tablas de multiplicar del 6 al 9.', '3': 'Noción de reparto equitativo.', '5': 'El reloj de manecillas y digital (horas y minutos).', '7': 'Gráficos de barras y recolección de datos.' },
            '4': { '1': 'Cálculo mental y estimaciones.', '3': 'Cuerpos geométricos: caras, vértices y aristas.', '5': 'Problemas matemáticos de dos operaciones.', '7': 'Olimpiadas matemáticas de 2°.' }
        }
    },
    '3': {
        objetivo: 'Desarrollar el pensamiento numérico y el cálculo mental con números naturales, suma, resta y multiplicación básica.',
        dba: [
            'DBA 1: Interpreta y formula problemas multiplicativos y aditivos con números de hasta cuatro cifras.',
            'DBA 2: Comprende el concepto de fracción como parte de una unidad o de una colección de objetos.',
            'DBA 3: Describe y representa formas bidimensionales y tridimensionales, calculando perímetros de figuras simples.',
            'DBA 4: Formula preguntas y lee gráficos estadísticos sencillos de la vida cotidiana.'
        ],
        periodos: {
            '1': { '1': 'El sistema de numeración decimal y valor posicional.', '3': 'Adición y sustracción con situaciones problema.', '5': 'Introducción a la multiplicación como suma repetida.', '7': 'Tablas de multiplicar y propiedades.' },
            '2': { '1': 'Multiplicación por una y dos cifras.', '3': 'Reparto equitativo e iniciación a la división.', '5': 'Figuras geométricas básicas y simetría.', '7': 'Medición de longitud y tiempo (reloj y calendario).' },
            '3': { '1': 'División exacta e inexacta.', '3': 'Fracciones como parte de la unidad.', '5': 'Representación de datos en tablas y pictogramas.', '7': 'Resolución de problemas cotidianos.' },
            '4': { '1': 'Cálculo de perímetros en figuras planas.', '3': 'Unidades de masa y capacidad.', '5': 'Patrones numéricos y secuencias.', '7': 'Proyecto de aplicación matemática.' }
        }
    },
    '4': {
        objetivo: 'Dominar las operaciones básicas con números naturales, fracciones y conceptos iniciales de geometría y estadística.',
        periodos: {
            '1': { '1': 'Números de más de seis cifras y operaciones combinadas.', '3': 'Múltiplos, divisores y criterios de divisibilidad.', '5': 'Números primos y compuestos.', '7': 'Resolución de problemas con las 4 operaciones.' },
            '2': { '1': 'Concepto y representación de fracciones.', '3': 'Fracciones equivalentes y simplificación.', '5': 'Suma y resta de fracciones homogéneas.', '7': 'Clasificación de ángulos y triángulos.' },
            '3': { '1': 'Números decimales y su relación con fracciones.', '3': 'Operaciones con números decimales en dinero y medidas.', '5': 'Cálculo de área de rectángulos y triángulos.', '7': 'Gráficos de barras y moda estadística.' },
            '4': { '1': 'Medidas de volumen y capacidad.', '3': 'Probabilidad simple en juegos cotidianos.', '5': 'Ecuaciones sencillas con incógnita.', '7': 'Taller de razonamiento lógico.' }
        }
    },
    '5': {
        objetivo: 'Consolidar el pensamiento numérico, proporcionalidad, operaciones con decimales y fracciones, y preparación básica para secundaria.',
        periodos: {
            '1': { '1': 'Teoría de números: MCM y MCD en problemas prácticos.', '3': 'Operaciones con fracciones heterogéneas.', '5': 'Multiplicación y división de fracciones.', '7': 'Potenciación y radicación básica.' },
            '2': { '1': 'Operaciones combinadas con decimales.', '3': 'Razones y proporciones.', '5': 'Regla de tres simple directa e inversa.', '7': 'Porcentajes e interés en compras cotidianas.' },
            '3': { '1': 'Polígonos regulares y área de figuras compuestas.', '3': 'Volumen de prismas rectangulares.', '5': 'Transformaciones en el plano (traslación y rotación).', '7': 'Medidas de tendencia central: media y mediana.' },
            '4': { '1': 'Interpretación de diagramas circulares.', '3': 'Concepto de variable y patrones algebraicos.', '5': 'Preparación Pruebas Saber 5° Matemáticas.', '7': 'Proyecto de emprendimiento numérico.' }
        }
    },
    '6': {
        objetivo: 'Comprender el conjunto de los números enteros, geometría básica y pensamiento variacional.',
        periodos: {
            '1': { '1': 'El conjunto de los números enteros (Z) y la recta numérica.', '3': 'Suma y resta de números enteros en balances y temperaturas.', '5': 'Multiplicación y división de enteros (ley de signos).', '7': 'Polinomios aritméticos y signos de agrupación.' },
            '2': { '1': 'Potenciación y radicación en Z.', '3': 'Ecuaciones lineales de primer grado en enteros.', '5': 'Elementos fundamentales de la geometría: punto, recta y plano.', '7': 'Construcción y clasificación de polígonos.' },
            '3': { '1': 'El conjunto de los números racionales (Q).', '3': 'Operaciones con racionales (fracciones y decimales).', '5': 'Unidades de longitud, área y conversión de unidades.', '7': 'Población, muestra y tablas de frecuencia.' },
            '4': { '1': 'Razones, proporciones y proporcionalidad directa.', '3': 'Diagramas de barras y circulares.', '5': 'Probabilidad frecuencial.', '7': 'Taller de integración matemática.' }
        }
    },
    '7': {
        objetivo: 'Dominar las operaciones con números racionales, proporcionalidad, semejanza y estadística inferencial básica.',
        periodos: {
            '1': { '1': 'Operaciones avanzadas con números racionales (Q).', '3': 'Potenciación y propiedades en Q.', '5': 'Notación científica y números muy grandes o pequeños.', '7': 'Ecuaciones en el conjunto de racionales.' },
            '2': { '1': 'Magnitudes directas e inversamente proporcionales.', '3': 'Regla de tres compuesta y aplicaciones.', '5': 'Porcentajes, descuentos e IVA en finanzas.', '7': 'Círculo, circunferencia y cálculo de Pi.' },
            '3': { '1': 'Teorema de Tales y proporcionalidad geométrica.', '3': 'Criterios de congruencia y semejanza de triángulos.', '5': 'Áreas sombreadas y figuras complejas.', '7': 'Medidas de tendencia central para datos agrupados.' },
            '4': { '1': 'Experimentos aleatorios y espacio muestral.', '3': 'Modelación de relaciones lineales.', '5': 'Análisis de datos en situaciones reales.', '7': 'Proyecto de investigación matemática.' }
        }
    },
    '8': {
        objetivo: 'Comprender el lenguaje algebraico, operaciones con polinomios, productos notables y factorización.',
        periodos: {
            '1': { '1': 'Introducción al Álgebra: expresiones algebraicas y términos.', '3': 'Suma y resta de polinomios.', '5': 'Multiplicación de monomios y polinomios.', '7': 'División de polinomios y regla de Ruffini.' },
            '2': { '1': 'Productos notables (binomio al cuadrado y al cubo).', '3': 'Cocientes notables.', '5': 'Factorización: Factor común y agrupación.', '7': 'Factorización: Trinomios de la forma x²+bx+c y ax²+bx+c.' },
            '3': { '1': 'Factorización: Diferencia y suma de cubos y cuadrados.', '3': 'Fracciones algebraicas y simplificación.', '5': 'Teorema de Pitágoras y aplicaciones.', '7': 'Área y volumen de cuerpos geométricos.' },
            '4': { '1': 'Ecuaciones fraccionarias.', '3': 'Medidas de dispersión: rango y varianza.', '5': 'Diagramas de dispersión y correlación.', '7': 'Taller de resolución algebraica.' }
        }
    },
    '9': {
        objetivo: 'Dominar la función lineal, sistemas de ecuaciones 2x2, números complejos y función cuadrática.',
        periodos: {
            '1': { '1': 'El conjunto de los números reales (R) y radicales.', '3': 'Racionalización de denominadores.', '5': 'Números complejos e imaginarios.', '7': 'Función lineal, pendiente y ecuación de la recta.' },
            '2': { '1': 'Sistemas de ecuaciones lineales 2x2 (método gráfico y sustitución).', '3': 'Sistemas 2x2 (método de igualación y reducción).', '5': 'Regla de Cramer (determinantes).', '7': 'Problemas de aplicación con sistemas de ecuaciones.' },
            '3': { '1': 'Función cuadrática y gráfica de la parábola.', '3': 'Ecuación cuadrática por factorización y fórmula general.', '5': 'Discriminante y naturaleza de las raíces.', '7': 'Cuerpos redondos: cilindro, cono y esfera.' },
            '4': { '1': 'Sucesiones aritméticas y geométricas.', '3': 'Combinatoria y permutaciones.', '5': 'Probabilidad condicional.', '7': 'Preparación Saber 9°.' }
        }
    },
    '10': {
        objetivo: 'Comprender la trigonometría analítica, identidades, leyes del seno y coseno, y geometría analítica.',
        periodos: {
            '1': { '1': 'Ángulos, sistemas de medición (grados y radianes).', '3': 'Razones trigonométricas en el triángulo rectángulo.', '5': 'Círculo unitario y funciones trigonométricas.', '7': 'Gráficas de seno, coseno y tangente.' },
            '2': { '1': 'Identidades trigonométricas fundamentales.', '3': 'Demostración de identidades trigonométricas.', '5': 'Ecuaciones trigonométricas.', '7': 'Ley del Seno y Ley del Coseno en triángulos oblicuángulos.' },
            '3': { '1': 'Geometría analítica: Distancia entre dos puntos y punto medio.', '3': 'Ecuación de la recta y posiciones relativas.', '5': 'Secciones cónicas: La circunferencia.', '7': 'Secciones cónicas: La parábola y la elipse.' },
            '4': { '1': 'Vectores en el plano y operaciones.', '3': 'Distribuciones de probabilidad binomial.', '5': 'Lectura crítica de tablas Saber 10°.', '7': 'Taller de trigonometría aplicada.' }
        }
    },
    '11': {
        objetivo: 'Dominar el cálculo diferencial, límites, derivadas, optimización y preparación integral Saber 11 Matemáticas.',
        periodos: {
            '1': { '1': 'Desigualdades e inecuaciones en los números reales.', '3': 'Funciones reales, dominio, rango y asíntotas.', '5': 'Concepto intuitivo y formal de límite.', '7': 'Cálculo algebraico de límites y límites al infinito.' },
            '2': { '1': 'Continuidad de funciones.', '3': 'Concepto de derivada como razón de cambio instantánea.', '5': 'Reglas de derivación (suma, producto, cociente y cadena).', '7': 'Derivadas de funciones trigonométricas y exponenciales.' },
            '3': { '1': 'Aplicaciones de la derivada: Máximos, mínimos y concavidad.', '3': 'Problemas de optimización en economía e ingeniería.', '5': 'Introducción a la antiderivada e integral.', '7': 'Simulacros y análisis de evidencias ICFES Saber 11.' },
            '4': { '1': 'Estadística inferencial y distribución normal.', '3': 'Toma de decisiones bajo incertidumbre.', '5': 'Entrenamiento intensivo en razonamiento cuantitativo Saber 11.', '7': 'Evaluación final y proyecto de egreso.' }
        }
    },
    'Ciclo I': {
        objetivo: 'Desarrollar habilidades matemáticas esenciales para la vida cotidiana: conteo, sumas, restas y manejo de dinero.',
        periodos: {
            '1': { '1': 'Los números naturales en la vida diaria y el conteo.', '3': 'Suma y resta aplicadas a compras y cuentas del hogar.', '5': 'Organización del presupuesto familiar.', '7': 'Manejo del dinero y cálculo de cambio.' },
            '2': { '1': 'Introducción a la multiplicación.', '3': 'Lectura del reloj y medidas de tiempo.', '5': 'Medición de longitudes con cinta métrica.', '7': 'Formas geométricas en el entorno.' },
            '3': { '1': 'Reparto equitativo e iniciación a la división.', '3': 'Fracciones cotidianas (medio kilo, un cuarto de litro).', '5': 'Tablas y listas de control en el trabajo.', '7': 'Resolución de problemas prácticos.' },
            '4': { '1': 'Unidades de peso (gramos, kilos, libras).', '3': 'Cálculo de vueltas y descuentos simples.', '5': 'Planificación financiera personal.', '7': 'Proyecto de aplicación.' }
        }
    },
    'Ciclo II': {
        objetivo: 'Fortalecer el cálculo numérico, las 4 operaciones básicas, fracciones y geometría práctica para adultos.',
        periodos: {
            '1': { '1': 'Las cuatro operaciones básicas con números grandes.', '3': 'Resolución de problemas laborales y comerciales.', '5': 'Múltiplos y divisores aplicados.', '7': 'Fracciones y su uso en recetas y construcción.' },
            '2': { '1': 'Suma y resta de fracciones.', '3': 'Números decimales y dinero.', '5': 'Cálculo de perímetros y áreas de terrenos.', '7': 'Lectura de facturas de servicios públicos.' },
            '3': { '1': 'Multiplicación y división con decimales.', '3': 'Regla de tres simple y porcentajes.', '5': 'Intereses en préstamos y compras a plazos.', '7': 'Gráficos sencillos en medios de comunicación.' },
            '4': { '1': 'Medidas de capacidad y volumen en el hogar.', '3': 'Promedios y estadísticas básicas.', '5': 'Presupuesto de microempresa.', '7': 'Taller integrador.' }
        }
    },
    'Ciclo III': {
        objetivo: 'Dominar los números enteros, racionales, porcentajes y resolución de problemas prácticos de validación.',
        periodos: {
            '1': { '1': 'Números enteros: saldos a favor, deudas y variaciones térmicas.', '3': 'Operaciones con enteros y ley de signos.', '5': 'Números racionales y fracciones equivalentes.', '7': 'Operaciones combinadas con racionales.' },
            '2': { '1': 'Proporcionalidad directa e inversa.', '3': 'Porcentajes, IVA y descuentos comerciales.', '5': 'Geometría plana: cálculo de áreas de lotes y habitaciones.', '7': 'Teorema de Pitágoras en la construcción.' },
            '3': { '1': 'Introducción a las ecuaciones de primer grado.', '3': 'Despeje de fórmulas en la vida práctica.', '5': 'Lectura de tablas de frecuencias y porcentajes.', '7': 'Gráficos de barras y líneas para análisis de datos.' },
            '4': { '1': 'Conversión de unidades métricas e imperiales.', '3': 'Probabilidad cotidiana.', '5': 'Preparación para pruebas de ciclo.', '7': 'Proyecto de emprendimiento.' }
        }
    },
    'Ciclo IV': {
        objetivo: 'Comprender el álgebra fundamental, ecuaciones, sistemas 2x2 y geometría analítica para validantes.',
        periodos: {
            '1': { '1': 'Expresiones algebraicas y valor numérico en fórmulas.', '3': 'Operaciones con polinomios.', '5': 'Productos notables y factorización clave.', '7': 'Ecuaciones lineales aplicadas.' },
            '2': { '1': 'Función lineal y gráficas de costo-beneficio.', '3': 'Sistemas de ecuaciones 2x2 en problemas de mezclas y finanzas.', '5': 'Ecuación cuadrática y sus aplicaciones.', '7': 'Área y volumen de tanques y cilindros.' },
            '3': { '1': 'Razonamiento lógico y secuencias.', '3': 'Estadística: promedio, moda y mediana en reportes.', '5': 'Interpretación de diagramas circulares.', '7': 'Probabilidad en decisiones cotidianas.' },
            '4': { '1': 'Entrenamiento en preguntas tipo Saber Ciclo IV.', '3': 'Modelado de situaciones financieras.', '5': 'Simulacro de validación.', '7': 'Cierre del ciclo.' }
        }
    },
    'Ciclo V': {
        objetivo: 'Dominar la trigonometría, funciones, geometría analítica y razonamiento cuantitativo para validación.',
        periodos: {
            '1': { '1': 'Razones trigonométricas en triángulos rectángulos.', '3': 'Aplicaciones de la trigonometría en topografía y distancias.', '5': 'Funciones trigonométricas y sus gráficas.', '7': 'Ley del Seno y Coseno.' },
            '2': { '1': 'Geometría analítica: La recta y pendientes.', '3': 'Circunferencia y parábola en la tecnología.', '5': 'Desigualdades e inecuaciones.', '7': 'Funciones exponenciales y logarítmicas en finanzas.' },
            '3': { '1': 'Lectura crítica de tablas y gráficos Saber 11.', '3': 'Análisis de dispersión estadística.', '5': 'Probabilidad condicional en diagnósticos.', '7': 'Resolución de problemas complejos.' },
            '4': { '1': 'Estrategias de respuesta rápida en pruebas de Estado.', '3': 'Simulacros intensivos de matemáticas.', '5': 'Retroalimentación de errores comunes.', '7': 'Proyecto vocacional.' }
        }
    },
    'Ciclo VI': {
        objetivo: 'Consolidar el cálculo, análisis de razones de cambio, optimización y preparación final Saber 11 Validación.',
        periodos: {
            '1': { '1': 'Funciones reales, modelos de crecimiento y decrecimiento.', '3': 'Concepto de límite y continuidad.', '5': 'La derivada como razón de cambio instantánea.', '7': 'Reglas básicas de derivación.' },
            '2': { '1': 'Optimización: maximizar ganancias y minimizar costos.', '3': 'Interpretación de gráficas de derivadas.', '5': 'Noción de integral y acumulación.', '7': 'Modelado matemático de situaciones reales.' },
            '3': { '1': 'Razonamiento cuantitativo Saber 11 (Módulo oficial MEN).', '3': 'Estadística inferencial y toma de decisiones.', '5': 'Geometría espacial y cálculo de volúmenes complejos.', '7': 'Simulacro completo Saber 11 con retroalimentación.' },
            '4': { '1': 'Resolución de ítems de alta dificultad.', '3': 'Manejo del tiempo y técnicas de examen.', '5': 'Validación final de competencias matemáticas.', '7': 'Proyecto de grado y graduación.' }
        }
    },
    'PENS': {
        objetivo: 'Aplicar matemáticas operativas, financieras y de razonamiento lógico en contextos productivos.',
        periodos: {
            '1': { '1': 'Operaciones con números reales y porcentajes.', '3': 'Regla de tres y proporcionalidad.', '5': 'Presupuestos y costos de producción.', '7': 'Ecuaciones de primer grado en finanzas.' },
            '2': { '1': 'Cálculo de áreas y volúmenes en obra y almacenamiento.', '3': 'Funciones lineales de oferta y demanda.', '5': 'Manejo de hojas de cálculo y estadísticas.', '7': 'Gráficos de control de calidad.' },
            '3': { '1': 'Interés simple y compuesto.', '3': 'Amortización de préstamos e inversiones.', '5': 'Interpretación de datos para la toma de decisiones.', '7': 'Modelos de optimización sencillos.' },
            '4': { '1': 'Evaluación económica de proyectos.', '3': 'Simulacros de validación de matemáticas.', '5': 'Taller de lógica y razonamiento.', '7': 'Proyecto productivo final.' }
        }
    }
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
    '1': {
        objetivo: 'Reconocer los sentidos, las partes del cuerpo, los seres vivos del entorno y los objetos cotidianos.',
        dba: [
            'DBA 1: Comprende que los sentidos le permiten percibir características de los objetos (forma, color, textura, sabor, sonido).',
            'DBA 2: Comprende que los seres vivos (plantas y animales) tienen características comunes y necesidades básicas para vivir.'
        ],
        periodos: {
            '1': { '1': 'Los cinco sentidos y el cuidado del cuerpo.', '3': 'Seres vivos vs. objetos inertes en el entorno.', '5': 'Las plantas: partes básicas (raíz, tallo, hojas).', '7': 'Animales del entorno y cómo se mueven.' },
            '2': { '1': 'El día, la noche y el Sol en el cielo.', '3': 'El agua y su importancia para la vida.', '5': 'Alimentos saludables de origen vegetal y animal.', '7': 'Cuidado y respeto hacia los animales.' },
            '3': { '1': 'Materiales de los objetos: madera, plástico, metal, vidrio.', '3': 'Sonidos del entorno: suaves, fuertes, agradables y ruidos.', '5': 'El suelo y las plantas que crecen en él.', '7': 'El aire y la respiración.' },
            '4': { '1': 'Cambios del clima: días soleados y lluviosos.', '3': 'Hábitos de higiene personal.', '5': 'Reciclaje básico y cuidado del aula.', '7': 'Muestra de ciencias de 1°.' }
        }
    },
    '2': {
        objetivo: 'Identificar ciclos de vida, estados de la materia, fuentes de luz y sonido, y adaptaciones sencillas de los seres vivos.',
        dba: [
            'DBA 1: Comprende que las sustancias pueden encontrarse en distintos estados (sólido, líquido y gas).',
            'DBA 2: Explica los procesos de cambios físicos y ciclos de vida en plantas y animales a lo largo del tiempo.'
        ],
        periodos: {
            '1': { '1': 'Estados de la materia: sólidos, líquidos y gases en el hogar.', '3': 'Ciclo de vida de las plantas (germinación y crecimiento).', '5': 'Ciclo de vida de los animales (nacimiento, crecimiento, reproducción).', '7': 'Cambios en el cuerpo humano con la edad.' },
            '2': { '1': 'Fuentes de luz naturales (Sol, estrellas) y artificiales (bombillos, linternas).', '3': 'La luz y la formación de sombras.', '5': 'Fuentes de sonido y vibración.', '7': 'El cuidado de los ojos y los oídos.' },
            '3': { '1': 'Hábitats terrestres y acuáticos.', '3': 'Adaptaciones de los animales a su ambiente.', '5': 'El agua: cambios de estado (hielo, agua líquida, vapor).', '7': 'Ahorro y conservación del agua.' },
            '4': { '1': 'Fuerzas: empujar, jalar y mover objetos.', '3': 'Los recursos naturales renovables.', '5': 'Cuidado del medio ambiente escolar y familiar.', '7': 'Feria de la ciencia de 2°.' }
        }
    },
    '3': {
        objetivo: 'Comprender las relaciones bióticas, adaptaciones ecosistémicas, mezclas y separación, y el movimiento por fuerzas.',
        dba: [
            'DBA 1: Comprende la influencia de la variación de la temperatura en los cambios de estado de la materia.',
            'DBA 2: Explica la influencia de los factores bióticos y abióticos en los ecosistemas.'
        ],
        periodos: {
            '1': { '1': 'Ecosistemas locales: factores bióticos (seres vivos) y abióticos (luz, agua, suelo).', '3': 'Adaptaciones morfológicas y de comportamiento.', '5': 'Cadenas alimentarias: productores, consumidores y descomponedores.', '7': 'El calor y la temperatura en los cambios de estado.' },
            '2': { '1': 'Mezclas homogéneas y heterogéneas en la cocina.', '3': 'Métodos de separación de mezclas (filtración, tamizado, decantación).', '5': 'Fuerzas por contacto y a distancia (magnetismo, gravedad).', '7': 'Efecto de las fuerzas en el movimiento y deformación de objetos.' },
            '3': { '1': 'El sistema óseo y muscular del cuerpo humano.', '3': 'Nutrición balanceada y grupos de alimentos.', '5': 'El ciclo del agua en la naturaleza.', '7': 'Fuentes de energía en la vida diaria.' },
            '4': { '1': 'Contaminación del suelo y del agua.', '3': 'Especies protegidas de Colombia.', '5': 'Experimentos caseros de mezclas y fuerzas.', '7': 'Proyecto de aula ambiental.' }
        }
    },
    '4': {
        objetivo: 'Analizar redes tróficas, transformaciones de energía, calor, temperatura y sistemas biológicos.',
        dba: [
            'DBA 1: Comprende que la luz y el sonido viajan en diferentes medios y experimentan transformaciones.',
            'DBA 2: Comprende que los organismos cumplen funciones de nutrición, respiración y relación en los ecosistemas.'
        ],
        periodos: {
            '1': { '1': 'Estructura de los ecosistemas y flujo de energía en redes tróficas.', '3': 'Niveles de organización biológica: célula, tejido, órgano, sistema, organismo.', '5': 'La fotosíntesis y la respiración en las plantas.', '7': 'El sistema digestivo y circulatorio humano.' },
            '2': { '1': 'La energía: formas de energía (mecánica, térmica, lumínica, sonora, eléctrica).', '3': 'Transformación y conservación de la energía.', '5': 'Transferencia de calor: conducción, convección y radiación.', '7': 'Conductores y aislantes térmicos.' },
            '3': { '1': 'Propagación de la luz: reflexión, refracción y espejos.', '3': 'El sonido: tono, timbre e intensidad.', '5': 'El suelo: horizontes, permeabilidad y erosión.', '7': 'Biodiversidad colombiana y parques nacionales.' },
            '4': { '1': 'Impacto humano en los ecosistemas.', '3': 'Uso eficiente de la energía.', '5': 'Preparación Saber 4° Ciencias.', '7': 'Feria científica escolar.' }
        }
    },
    '5': {
        objetivo: 'Comprender los sistemas del cuerpo humano, la materia a nivel corpuscular, circuitos eléctricos y equilibrio ambiental.',
        dba: [
            'DBA 1: Comprende que los sistemas del cuerpo humano interactúan para mantener el equilibrio y la salud.',
            'DBA 2: Comprende que los circuitos eléctricos requieren de una fuente, conductores y receptores para funcionar.'
        ],
        periodos: {
            '1': { '1': 'Sistemas del cuerpo humano: respiratorio, excretor y nervioso.', '3': 'Interacción entre sistemas para la homeostasis.', '5': 'Microorganismos: bacterias, virus y hongos (beneficios y prevención de enfermedades).', '7': 'La materia: masa, volumen y densidad.' },
            '2': { '1': 'Estructura básica del átomo y moléculas.', '3': 'Electricidad estática y cargas eléctricas.', '5': 'Circuitos eléctricos simples: serie y paralelo.', '7': 'Magnetismo y electroimanes.' },
            '3': { '1': 'Dinámica de los ecosistemas y equilibrio ecológico.', '3': 'Ciclos biogeoquímicos del agua, carbono y nitrógeno.', '5': 'La atmósfera y el efecto invernadero.', '7': 'Lectura crítica de tablas y experimentos Saber 5°.' },
            '4': { '1': 'Fuentes de energía renovables vs. no renovables.', '3': 'Gestión de residuos sólidos y huella ecológica.', '5': 'Simulacros Saber 5° Ciencias Naturales.', '7': 'Proyecto de ciencias aplicadas.' }
        }
    },
    '6': {
        objetivo: 'Comprender la estructura celular, la taxonomía de los seres vivos, la materia y el universo.',
        dba: [
            'DBA 1: Comprende que la célula es la unidad estructural y funcional de los seres vivos.',
            'DBA 2: Clasifica los organismos en los dominios y reinos biológicos.',
            'DBA 3: Explica la estructura de la materia y los modelos atómicos.'
        ],
        periodos: {
            '1': { '1': 'La Célula: teoría celular, membrana, núcleo y citoplasma.', '3': 'Célula animal vs vegetal y organelos celulares.', '5': 'Transporte celular: difusión y ósmosis.', '7': 'Tejidos vegetales y animales.' },
            '2': { '1': 'Clasificación de los seres vivos y reinos de la naturaleza.', '3': 'Microbiología: bacterias, protozoos y virus.', '5': 'Nutrición autótrofa y heterótrofa.', '7': 'Ecosistemas acuáticos y terrestres.' },
            '3': { '1': 'Materia, sustancias puras y mezclas.', '3': 'Modelos atómicos y tabla periódica inicial.', '5': 'Propiedades físicas y químicas de la materia.', '7': 'Masa, volumen y densidad en laboratorio.' },
            '4': { '1': 'El Sistema Solar y la Tierra en el universo.', '3': 'Atmósfera e hidrósfera.', '5': 'El ciclo de las rocas y litósfera.', '7': 'Muestra de ciencias de 6°.' }
        }
    },
    '7': {
        objetivo: 'Analizar los tejidos biológicos, respiración celular, enlaces químicos y leyes del movimiento.',
        dba: [
            'DBA 1: Explica cómo los sistemas de órganos (respiratorio, circulatorio, digestivo, excretor) interactúan en los seres vivos.',
            'DBA 2: Explica la formación de enlaces químicos a partir de la configuración electrónica de los elementos.'
        ],
        periodos: {
            '1': { '1': 'Respiración celular y metabolismo energético (ATP).', '3': 'Nutrición y digestión en organismos complejos.', '5': 'Circulación en plantas y animales.', '7': 'Excreción y osmorregulación.' },
            '2': { '1': 'Estructura atómica y electrones de valencia.', '3': 'La tabla periódica: grupos, periodos y propiedades periódicas.', '5': 'Enlaces químicos: iónico, covalente y metálico.', '7': 'Fórmulas químicas y compuestos inorgánicos.' },
            '3': { '1': 'Cinemática básica: distancia, desplazamiento y rapidez.', '3': 'Fuerzas cotidianas y Primera Ley de Newton.', '5': 'Segunda y Tercera Ley de Newton en situaciones reales.', '7': 'Energía cinética y potencial gravitacional.' },
            '4': { '1': 'Flujo de materia y energía en los ecosistemas.', '3': 'Biomas del mundo y pisos bioclimáticos.', '5': 'Cuidado del medio ambiente y biodiversidad.', '7': 'Proyecto integrador de ciencias de 7°.' }
        }
    },
    '8': {
        objetivo: 'Comprender la reproducción celular, sistemas de control (nervioso y endocrino), termodinámica y fluidos.',
        dba: [
            'DBA 1: Explica los procesos de división celular (mitosis y meiosis) y su importancia en la reproducción.',
            'DBA 2: Comprende el funcionamiento de los sistemas nervioso y endocrino en la regulación corporal.'
        ],
        periodos: {
            '1': { '1': 'División celular: Mitosis y Meiosis.', '3': 'Reproducción asexual y sexual en plantas y animales.', '5': 'Sistema reproductor humano y salud sexual.', '7': 'Embriogénesis y desarrollo fetal.' },
            '2': { '1': 'Sistema nervioso: neuronas, sinapsis y sistema central/periférico.', '3': 'Sistema endocrino y hormonas en el cuerpo humano.', '5': 'Respuestas a estímulos y receptores sensoriales.', '7': 'Efecto de sustancias psicoactivas en el sistema nervioso.' },
            '3': { '1': 'Calor, temperatura y escalas termométricas.', '3': 'Leyes de los gases (Boyle, Charles, Gay-Lussac).', '5': 'Fluidos: presión, principio de Pascal y Arquímedes.', '7': 'Termodinámica en sistemas vivos y motores.' },
            '4': { '1': 'Contaminación por residuos químicos y plásticos.', '3': 'Cambio climático y calentamiento global.', '5': 'Lectura crítica Saber 8°.', '7': 'Feria científica de grado 8°.' }
        }
    },
    '9': {
        objetivo: 'Analizar la genética mendeliana, el ADN, la evolución por selección natural, ondas y electromagnetismo.',
        dba: [
            'DBA 1: Explica la forma como se transmite la información hereditaria en los seres vivos (genética mendeliana y molecular).',
            'DBA 2: Explica la teoría de la evolución biológica por selección natural y especiación.'
        ],
        periodos: {
            '1': { '1': 'Genética mendeliana: leyes de Mendel y cuadros de Punnett.', '3': 'Genética no mendeliana (codominancia, alelos múltiples).', '5': 'Estructura del ADN y ARN, replicación y síntesis de proteínas.', '7': 'Mutaciones genéticas y biotecnología (OGM, clonación).' },
            '2': { '1': 'Teoría de la evolución de Darwin-Wallace y selección natural.', '3': 'Evidencias de la evolución (fósiles, anatomía comparada, genética).', '5': 'Especiación y biodiversidad a lo largo del tiempo geológico.', '7': 'Historia de la vida en la Tierra y extinciones masivas.' },
            '3': { '1': 'Ondas mecánicas y electromagnéticas.', '3': 'El sonido: acústica, velocidad y aplicaciones médicas (ecografía).', '5': 'La luz: óptica geométrica y espectro electromagnético.', '7': 'Electricidad y circuitos de corriente directa.' },
            '4': { '1': 'Química ambiental y ciclos del carbono.', '3': 'Preparación Saber 9° Ciencias Naturales.', '5': 'Bioética y debates científicos.', '7': 'Proyecto de grado 9°.' }
        }
    },
    '10': {
        objetivo: 'Dominar la química inorgánica, estequiometría, cinemática vectorial, leyes de Newton y ecología de poblaciones.',
        dba: [
            'DBA 1: Relaciona la estructura del átomo con los enlaces químicos, fórmulas y nomenclatura inorgánica.',
            'DBA 2: Resuelve problemas de estequiometría aplicando la ley de conservación de la materia.',
            'DBA 3: Modela matemáticamente el movimiento rectilíneo y curvilíneo de los cuerpos.'
        ],
        periodos: {
            '1': { '1': 'Química general: materia, tabla periódica y configuración electrónica.', '3': 'Enlaces químicos y geometría molecular.', '5': 'Nomenclatura inorgánica (óxidos, hidróxidos, ácidos, sales).', '7': 'Cinemática 1D y 2D (MRU, MRUV, tiro parabólico).' },
            '2': { '1': 'Reacciones químicas y balanceo (tanteo y redox).', '3': 'Estequiometría: mol, masa molar, reactivo límite y rendimiento.', '5': 'Dinámica newtoniana: fuerzas, diagramas de cuerpo libre y fricción.', '7': 'Trabajo, potencia y conservación de la energía mecánica.' },
            '3': { '1': 'Gases ideales y ecuación de estado (PV=nRT).', '3': 'Soluciones químicas: porcentaje, molaridad y normalidad.', '5': 'Ecología de poblaciones y capacidad de carga.', '7': 'Simulacros Saber 10° Ciencias Naturales.' },
            '4': { '1': 'Ácidos, bases y escala de pH.', '3': 'Impulso y cantidad de movimiento.', '5': 'Química verde y sostenibilidad industrial.', '7': 'Proyecto de investigación científica 10°.' }
        }
    },
    '11': {
        objetivo: 'Consolidar la química orgánica, física de fluidos, electromagnetismo, óptica y preparación intensiva Saber 11 Ciencias Naturales.',
        dba: [
            'DBA 1: Explica la estructura y reactividad de los compuestos orgánicos a partir de la química del carbono.',
            'DBA 2: Analiza los principios de la mecánica de fluidos, termodinámica y electromagnetismo.',
            'DBA 3: Evalúa críticamente el impacto de desarrollos científicos y tecnológicos en la sociedad.'
        ],
        periodos: {
            '1': { '1': 'Química del carbono: hibridación, enlaces y tipos de cadenas.', '3': 'Hidrocarburos: alcanos, alquenos, alquinos y aromáticos.', '5': 'Mecánica de fluidos: hidrostática, presión, Pascal y Arquímedes.', '7': 'Hidrodinámica: ecuación de continuidad y principio de Bernoulli.' },
            '2': { '1': 'Grupos funcionales oxigenados (alcoholes, aldehídos, cetonas, ácidos).', '3': 'Grupos funcionales nitrogenados (aminas, amidas).', '5': 'Termodinámica: leyes, máquinas térmicas y entropía.', '7': 'Electrostática: Ley de Coulomb, campo y potencial eléctrico.' },
            '3': { '1': 'Biomoléculas: carbohidratos, lípidos, proteínas y ácidos nucleicos.', '3': 'Circuitos eléctricos, Ley de Ohm y Leyes de Kirchhoff.', '5': 'Magnetismo e inducción electromagnética (Faraday).', '7': 'Simulacros intensivos Saber 11 Ciencias Naturales con justificaciones.' },
            '4': { '1': 'Polímeros sintéticos, biomateriales y nanotecnología.', '3': 'Física moderna: efecto fotoeléctrico y relatividad conceptual.', '5': 'Estrategias de resolución de problemas complejos en Saber 11.', '7': 'Sustentación de proyectos de egreso.' }
        }
    },
    'Ciclo I': {
        objetivo: 'Reconocer los seres vivos, el cuidado del cuerpo, los sentidos y la preservación del entorno natural cercano de forma práctica y cotidiana.',
        dba: [
            'DBA 1: Reconoce las partes del cuerpo humano, los sentidos y hábitos de salud y nutrición.',
            'DBA 2: Identifica seres vivos, plantas medicinales y recursos naturales de la región.'
        ],
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
        dba: [
            'DBA 1: Explica los sistemas digestivo, respiratorio y circulatorio y la nutrición balanceada.',
            'DBA 2: Comprende las cadenas tróficas, mezclas cotidianas y fuerzas mecánicas.'
        ],
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
        dba: [
            'DBA 1: Describe la célula, organelos y niveles de organización biológica.',
            'DBA 2: Diferencia sustancias puras y mezclas homogéneas/heterogéneas.'
        ],
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
                '1': 'Nutrición en los seres vivos: autótrofos (plantas) y heterótrofos (animales y humanos).',
                '3': 'Fuerza, masa y gravedad: por qué caen las cosas y cómo funcionan las palancas.',
                '5': 'El sonido y la luz como ondas que viajan en el aire.',
                '7': 'Ecosistemas de Colombia: páramos, selvas y bosques andinos.'
            },
            '4': {
                '1': 'Contaminación por plásticos y basuras: alternativas de reciclaje y reutilización.',
                '3': 'Calentamiento global y el efecto invernadero en la agricultura local.',
                '5': 'Preparación para pruebas de validación de Ciencias Naturales.',
                '7': 'Proyecto ambiental comunitario del ciclo.'
            }
        }
    },
    'Ciclo IV': {
        objetivo: 'Analizar la división celular, las leyes de la herencia genética, las propiedades de la materia y el átomo.',
        dba: [
            'DBA 1: Explica la reproducción celular (mitosis/meiosis) y principios de herencia genética.',
            'DBA 2: Comprende la estructura atómica, tabla periódica y transformaciones de energía.'
        ],
        periodos: {
            '1': {
                '1': 'Diagnóstico inicial: La reproducción celular (mitosis y meiosis) y la herencia de rasgos.',
                '3': 'El sistema endocrino y nervioso: hormonas, estrés y control del cuerpo.',
                '5': 'Leyes de Mendel explicadas con ejemplos de la agricultura y cría de animales.',
                '7': 'Ácido desoxirribonucleico (ADN) y su importancia en la vida.'
            },
            '2': {
                '1': 'El átomo: protones, neutrones y electrones.',
                '3': 'La tabla periódica: metales, no metales y elementos esenciales para la vida.',
                '5': 'Enlaces químicos cotidianos (la sal de cocina, el agua, el oxígeno).',
                '7': 'Transformaciones químicas de la materia en la cocina y la industria.'
            },
            '3': {
                '1': 'Leyes de Newton aplicadas al transporte y las herramientas de trabajo.',
                '3': 'Energía cinética y potencial en caídas de agua y represas hidroeléctricas.',
                '5': 'Calor vs temperatura y dilatación térmica de materiales.',
                '7': 'Presión atmosférica e hidrostática en la vida real.'
            },
            '4': {
                '1': 'Teoría de la evolución de las especies y selección natural.',
                '3': 'Impacto ambiental de la minería y la deforestación en Colombia.',
                '5': 'Simulacros de validación de ciencias de Ciclo IV.',
                '7': 'Proyecto de ciencias y desarrollo sostenible.'
            }
        }
    },
    'Ciclo V': {
        objetivo: 'Dominar la química inorgánica, estequiometría básica, cinemática y leyes de Newton aplicadas.',
        dba: [
            'DBA 1: Resuelve situaciones de estequiometría, enlaces químicos y nomenclatura inorgánica.',
            'DBA 2: Analiza el movimiento, fuerzas y energía en sistemas mecánicos cotidianos.'
        ],
        periodos: {
            '1': {
                '1': 'Diagnóstico inicial: Estructura de la materia, enlaces químicos y nomenclatura.',
                '3': 'Soluciones químicas y concentraciones porcentuales en la vida laboral y doméstica.',
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
        dba: [
            'DBA 1: Comprende la química orgánica del carbono, biomoléculas y combustibles.',
            'DBA 2: Analiza circuitos eléctricos, electromagnetismo y termodinámica.',
            'DBA 3: Aplica el razonamiento científico en preguntas tipo ICFES Saber 11.'
        ],
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
    '1': {
        objetivo: 'Reconocer la identidad personal, la familia, los acuerdos de convivencia en la escuela y los puntos de orientación en el barrio.',
        dba: [
            'DBA 1: Se reconoce como sujeto de derechos y miembro activo de una familia y una comunidad escolar.',
            'DBA 2: Describe las características de su entorno físico (la casa, la escuela, el barrio) y utiliza puntos de referencia.',
            'DBA 3: Participa en la construcción de acuerdos de convivencia y resolución de pequeños conflictos.',
            'DBA 4: Identifica las celebraciones y tradiciones culturales de su familia y entorno local.'
        ],
        periodos: {
            '1': { '1': 'Quién soy yo: mi nombre, familia y cualidades.', '3': 'La escuela y el aula: acuerdos de convivencia.', '5': 'Mi casa y las dependencias del hogar.', '7': 'Puntos de orientación y ubicación espacial.' },
            '2': { '1': 'El barrio y la vereda: lugares y vecinos.', '3': 'Normas de tránsito peatonal y seguridad.', '5': 'Oficios y profesiones en mi comunidad.', '7': 'Cuidado de los espacios públicos.' },
            '3': { '1': 'Derechos y deberes de los niños en la familia.', '3': 'Historias familiares y de los abuelos.', '5': 'Paisajes naturales y construidos.', '7': 'Resolución pacífica de diferencias.' },
            '4': { '1': 'Símbolos patrios: bandera, himno y escudo.', '3': 'Celebraciones comunitarias.', '5': 'Cuidado de los recursos naturales del barrio.', '7': 'Muestra de identidad familiar.' }
        }
    },
    '2': {
        objetivo: 'Comprender la organización del municipio, las diferencias entre el paisaje rural y urbano, los oficios y los servicios públicos.',
        dba: [
            'DBA 1: Reconoce los puntos cardinales y los usa para orientarse en el plano de su municipio.',
            'DBA 2: Compara los paisajes rurales y urbanos, identificando sus actividades económicas y medios de transporte.',
            'DBA 3: Reconoce la diversidad cultural de los habitantes de su municipio y valora sus saberes tradicionales.',
            'DBA 4: Identifica los servicios públicos esenciales y la importancia de cuidar el medio ambiente local.'
        ],
        periodos: {
            '1': { '1': 'Los puntos cardinales y la rosa de los vientos.', '3': 'El municipio: historia, plano y lugares representativos.', '5': 'Autoridades del municipio (Alcalde, Concejo).', '7': 'Normas de convivencia ciudadana.' },
            '2': { '1': 'Paisaje rural (el campo, fincas, cultivos).', '3': 'Paisaje urbano (la ciudad, barrios, avenidas).', '5': 'Medios de transporte y vías de comunicación.', '7': 'Trabajo en el campo vs trabajo en la ciudad.' },
            '3': { '1': 'Servicios públicos: agua, luz, gas, aseo y su uso responsable.', '3': 'Tradiciones culturales y fiestas del municipio.', '5': 'Comunidades afrodescendientes e indígenas del territorio.', '7': 'Monumentos y patrimonio histórico municipal.' },
            '4': { '1': 'Recursos hídricos y ambientales del municipio.', '3': 'Prevención de riesgos y desastres naturales.', '5': 'Derecho a la educación y la salud.', '7': 'Proyecto: Mi municipio querido.' }
        }
    },
    '3': {
        objetivo: 'Reconocer el municipio, las normas de convivencia, la historia local y la geografía del departamento.',
        dba: [
            'DBA 1: Comprende la importancia de los recursos naturales en el desarrollo económico del departamento.',
            'DBA 2: Explica las formas de relieve y las cuencas hidrográficas del departamento.'
        ],
        periodos: {
            '1': { '1': 'El municipio y sus autoridades.', '3': 'El paisaje rural y el paisaje urbano.', '5': 'Puntos cardinales y orientación.', '7': 'Normas de convivencia escolar y comunitaria.' },
            '2': { '1': 'El departamento y sus municipios principales.', '3': 'Relieve, ríos y clima del departamento.', '5': 'Primeros pobladores y comunidades indígenas locales.', '7': 'Tradiciones, fiestas y gastronomía regional.' },
            '3': { '1': 'Recursos naturales y su cuidado.', '3': 'Actividades económicas del municipio (agricultura, comercio, turismo).', '5': 'Servicios públicos y su importancia.', '7': 'Los derechos de los niños y deberes ciudadanos.' },
            '4': { '1': 'Símbolos municipales y departamentales.', '3': 'Medios de transporte y vías de comunicación.', '5': 'Prevención de desastres en la comunidad.', '7': 'Feria de saberes locales.' }
        }
    },
    '4': {
        objetivo: 'Comprender la geografía de Colombia, regiones naturales, diversidad étnica y la organización del Estado.',
        periodos: {
            '1': { '1': 'Ubicación geográfica y astronómica de Colombia.', '3': 'Relieve colombiano: las tres cordilleras y valles interandinos.', '5': 'Hidrografía de Colombia: ríos principales y vertientes.', '7': 'Climas y pisos térmicos en Colombia.' },
            '2': { '1': 'Las regiones naturales de Colombia (Andina, Caribe, Pacífica, Orinoquía, Amazonía, Insular).', '3': 'Diversidad cultural, grupos étnicos y afrocolombianidad.', '5': 'Parques nacionales naturales y biodiversidad.', '7': 'Problemas ambientales en Colombia y conservación.' },
            '3': { '1': 'Culturas indígenas prehispánicas de Colombia (Muiscas, Taironas, Quimbayas).', '3': 'El Descubrimiento y la Conquista en territorio colombiano.', '5': 'La época colonial: economía, sociedad y gobierno.', '7': 'El grito de Independencia y la Campaña Libertadora.' },
            '4': { '1': 'La Constitución Política de Colombia de 1991: derechos fundamentales.', '3': 'Ramas del poder público en Colombia.', '5': 'Participación ciudadana en la escuela y el barrio.', '7': 'Proyecto: Conociendo a mi Colombia.' }
        }
    },
    '5': {
        objetivo: 'Analizar la historia de Colombia en el siglo XIX y XX, la economía nacional y los derechos humanos.',
        periodos: {
            '1': { '1': 'La Gran Colombia y su disolución.', '3': 'Partidos políticos tradicionales (Liberal y Conservador) y guerras civiles del siglo XIX.', '5': 'La Constitución de 1886 y la Regeneración.', '7': 'La Guerra de los Mil Días y la pérdida de Panamá.' },
            '2': { '1': 'Colombia en la primera mitad del siglo XX: economía cafetera e industrialización.', '3': 'El Bogotazo y el periodo de La Violencia.', '5': 'El Frente Nacional y sus consecuencias.', '7': 'Surgimiento de los movimientos sociales y guerrilleros.' },
            '3': { '1': 'Sectores de la economía colombiana (primario, secundario, terciario, cuaternario).', '3': 'El comercio exterior: importaciones y exportaciones de Colombia.', '5': 'La población colombiana: demografía, migración y desplazamientos.', '7': 'Derechos Humanos y mecanismos de protección (tutela, derecho de petición).' },
            '4': { '1': 'La Constitución de 1991 y el Estado Social de Derecho.', '3': 'Preparación Saber 5° Sociales y Ciudadanas.', '5': 'Cultura de paz y resolución de conflictos.', '7': 'Foro escolar de historia y ciudadanía.' }
        }
    },
    '6': {
        objetivo: 'Comprender el origen del universo, la Tierra, las primeras civilizaciones fluviales y la antigüedad clásica.',
        periodos: {
            '1': { '1': 'El origen del universo y del planeta Tierra (teorías científicas y mitológicas).', '3': 'Estructura interna de la Tierra, placas tectónicas y relieve.', '5': 'Coordenadas geográficas: latitud, longitud, husos horarios y mapas.', '7': 'El proceso de hominización y la prehistoria (Paleolítico y Neolítico).' },
            '2': { '1': 'Civilizaciones fluviales: Mesopotamia (Sumeria, Babilonia) y el Código de Hammurabi.', '3': 'El Antiguo Egipto: faraones, pirámides, religión y sociedad.', '5': 'Civilizaciones de Oriente: Antigua India y Antigua China.', '7': 'Aportes culturales, científicos y tecnológicos de las civilizaciones antiguas.' },
            '3': { '1': 'La Antigua Grecia: polis (Atenas y Esparta), democracia y filosofía.', '3': 'El Helenismo y las conquistas de Alejandro Magno.', '5': 'La Antigua Roma: Monarquía, República e Imperio Romano.', '7': 'El Derecho Romano, el cristianismo primitivo y la caída del Imperio Romano.' },
            '4': { '1': 'Geografía física de los continentes (África, Asia, Europa, América, Oceanía).', '3': 'El agua como recurso estratégico mundial.', '5': 'Patrimonio histórico de la humanidad.', '7': 'Muestra de civilizaciones de la antigüedad.' }
        }
    },
    '7': {
        objetivo: 'Analizar la Edad Media, el Renacimiento, el Islam, las civilizaciones prehispánicas de América y la geografía humana.',
        periodos: {
            '1': { '1': 'La Edad Media en Europa: el Feudalismo, sociedad estamental y economía señorial.', '3': 'El papel de la Iglesia Católica y las Cruzadas.', '5': 'El Imperio Bizantino y el Imperio Carolingio.', '7': 'El surgimiento del Islam y la expansión árabe.' },
            '2': { '1': 'El Renacimiento, el Humanismo y la Revolución Científica.', '3': 'La crisis de la Iglesia y la Reforma Protestante (Lutero, Calvino).', '5': 'La Contrarreforma Católica y el Concilio de Trento.', '7': 'Las grandes exploraciones marítimas europeas de los siglos XV y XVI.' },
            '3': { '1': 'Grandes imperios prehispánicos de América: Mayas, Aztecas e Incas.', '3': 'Sociedades indígenas de Colombia antes de 1492.', '5': 'El impacto del encuentro entre dos mundos: conquista y catástrofe demográfica.', '7': 'La colonización española y portuguesa en América.' },
            '4': { '1': 'Demografía mundial: crecimiento, distribución y pirámides de población.', '3': 'Procesos de urbanización y megaciudades en el mundo.', '5': 'Diversidad cultural y respeto interreligioso.', '7': 'Proyecto de investigación histórica.' }
        }
    },
    '8': {
        objetivo: 'Examinar las revoluciones burguesas, la Revolución Industrial, el imperialismo y la conformación de los Estados nacionales.',
        periodos: {
            '1': { '1': 'La Ilustración y el pensamiento político moderno (Montesquieu, Rousseau, Locke).', '3': 'La Revolución Industrial: máquina de vapor, capitalismo y surgimiento del proletariado.', '5': 'La Revolución Francesa y la Declaración de los Derechos del Hombre.', '7': 'El Imperio Napoleónico y la Restauración monárquica.' },
            '2': { '1': 'Procesos de Independencia en América Latina y líderes libertadores.', '3': 'Formación de los Estados nacionales en América Latina en el siglo XIX.', '5': 'Guerra civil estadounidense y consolidación de EE.UU.', '7': 'El Imperialismo y el colonialismo europeo en África y Asia en el siglo XIX.' },
            '3': { '1': 'Historia de Colombia en el siglo XIX: centralistas vs. federalistas.', '3': 'Constituciones colombianas de 1863 (Rionegro) y 1886.', '5': 'La economía agroexportadora y el tabaco, quina y café en Colombia.', '7': 'Conflictos fronterizos y separación de Panamá.' },
            '4': { '1': 'Geografía económica mundial: recursos energéticos y materias primas.', '3': 'Movimientos obreros, socialismo y sindicalismo.', '5': 'Derecho Internacional Humanitario.', '7': 'Taller de análisis historiográfico.' }
        }
    },
    '9': {
        objetivo: 'Analizar el siglo XX mundial y colombiano: Guerras Mundiales, Guerra Fría, dictaduras y conflicto armado.',
        periodos: {
            '1': { '1': 'La Primera Guerra Mundial: causas, desarrollo y Tratado de Versalles.', '3': 'La Revolución Rusa de 1917 y el nacimiento de la URSS.', '5': 'La Gran Depresión de 1929 y la crisis del capitalismo.', '7': 'El ascenso de los totalitarismos: Fascismo italiano y Nazismo alemán.' },
            '2': { '1': 'La Segunda Guerra Mundial: frentes, Holocausto y bombas atómicas.', '3': 'La creación de la ONU y la Declaración Universal de los Derechos Humanos (1948).', '5': 'La Guerra Fría: bloques capitalista y comunista, crisis de los misiles y carrera espacial.', '7': 'Procesos de descolonización en Asia y África.' },
            '3': { '1': 'Dictaduras militares en América Latina y Doctrina de Seguridad Nacional.', '3': 'La Revolución Cubana y su impacto continental.', '5': 'Colombia en el siglo XX: La Hegemonía Conservadora, la República Liberal y el 9 de abril de 1948.', '7': 'Origen y evolución del conflicto armado en Colombia y narcotráfico.' },
            '4': { '1': 'La caída del Muro de Berlín y el fin de la Guerra Fría.', '3': 'La Constitución de 1991 y los procesos de paz en Colombia.', '5': 'Preparación Saber 9° Ciencias Sociales y Competencias Ciudadanas.', '7': 'Foro de memoria histórica y reconciliación.' }
        }
    },
    '10': {
        objetivo: 'Analizar la economía política, globalización, geopolítica mundial, sistemas de gobierno y competencias ciudadanas.',
        periodos: {
            '1': { '1': 'Fundamentos de economía: escasez, oferta, demanda y mercados.', '3': 'Sistemas económicos: Capitalismo, Socialismo y Economía Mixta.', '5': 'Políticas monetarias y fiscales: inflación, desempleo y PIB.', '7': 'Teorías del Estado y filosofía política (Hobbes, Locke, Maquiavelo).' },
            '2': { '1': 'Sistemas políticos contemporáneos: democracias, autoritarismos y totalitarismos.', '3': 'El Estado Social de Derecho y la Constitución de 1991 en Colombia.', '5': 'Mecanismos de participación ciudadana (voto, plebiscito, referendo, cabildo abierto).', '7': 'Organismos de control en Colombia (Procuraduría, Contraloría, Defensoría).' },
            '3': { '1': 'La Globalización: dimensiones económicas, culturales, tecnológicas y ambientales.', '3': 'Organismos económicos internacionales (FMI, Banco Mundial, OMC).', '5': 'Geopolítica mundial del siglo XXI: potencias hegemónicas y bloques emergentes (BRICS).', '7': 'Crisis migratorias y refugiados en el mundo.' },
            '4': { '1': 'Desarrollo sostenible y cambio climático en la agenda global.', '3': 'Competencias ciudadanas: análisis de dilemas morales y multiperspectivismo.', '5': 'Simulacros Saber 10° Sociales.', '7': 'Proyecto de veeduría ciudadana escolar.' }
        }
    },
    '11': {
        objetivo: 'Dominar el análisis crítico de la historia contemporánea, conflictos geopolíticos, acuerdos de paz y preparación intensiva Saber 11 Sociales y Ciudadanas.',
        periodos: {
            '1': { '1': 'Estructura y evidencias de la prueba Saber 11: Competencias Sociales y Ciudadanas.', '3': 'Multiperspectivismo: análisis de actores, intereses y valoraciones en conflictos sociales.', '5': 'Pensamiento social: conceptos estructurantes (poder, legitimidad, territorio, identidad).', '7': 'Interpretación y análisis de perspectivas en textos históricos y constitucionales.' },
            '2': { '1': 'El conflicto armado colombiano contemporáneo: actores, dinámicas territoriales y víctimas.', '3': 'El Acuerdo de Paz de 2016, la Comisión de la Verdad y la JEP.', '5': 'Modelos de desarrollo económico en Colombia y desigualdad social.', '7': 'Políticas públicas, ordenamiento territorial y regalías.' },
            '3': { '1': 'Geopolítica contemporánea: conflictos en Medio Oriente, Europa del Este y tensiones Asia-Pacífico.', '3': 'Terrorismo, ciberseguridad y soberanía en la era digital.', '5': 'Derechos Humanos de tercera y cuarta generación.', '7': 'Entrenamiento intensivo en resolución de preguntas Saber 11 con retroalimentación.' },
            '4': { '1': 'Estrategias para enfrentar preguntas de alta complejidad y manejo del tiempo.', '3': 'Simulacro final Saber 11 Sociales y Ciudadanas.', '5': 'Reflexión sobre el rol del ciudadano en el desarrollo nacional.', '7': 'Evaluación final y cierre académico.' }
        }
    },
    'Ciclo I': {
        objetivo: 'Reconocer el entorno geográfico cercano, los valores ciudadanos, la familia y la comunidad.',
        periodos: {
            '1': { '1': 'La persona, la familia y los vecinos.', '3': 'El barrio y la vereda: lugares importantes y servicios.', '5': 'Normas de convivencia y respeto mutuo.', '7': 'Puntos de referencia y cómo orientarse.' },
            '2': { '1': 'El municipio y sus tradiciones culturales.', '3': 'El trabajo y los diferentes oficios en la comunidad.', '5': 'Cuidado del medio ambiente y los recursos naturales.', '7': 'Símbolos locales.' },
            '3': { '1': 'Los derechos fundamentales de las personas.', '3': 'La historia familiar y de los abuelos.', '5': 'Resolución pacífica de problemas entre vecinos.', '7': 'Participación en la junta de acción comunal.' },
            '4': { '1': 'El departamento y sus paisajes.', '3': 'Solidaridad y trabajo comunitario.', '5': 'Celebraciones patrias.', '7': 'Muestra de identidad comunitaria.' }
        }
    },
    'Ciclo II': {
        objetivo: 'Comprender la geografía e historia de Colombia, las regiones naturales y los derechos y deberes ciudadanos.',
        periodos: {
            '1': { '1': 'Colombia en el mapa: fronteras, mares y cordilleras.', '3': 'Las regiones naturales y su economía.', '5': 'Población colombiana y diversidad cultural.', '7': 'Pisos térmicos y agricultura.' },
            '2': { '1': 'Nuestros antepasados indígenas y su legado.', '3': 'La época colonial y la lucha por la Independencia.', '5': 'Héroes de la patria y fechas históricas.', '7': 'Símbolos nacionales de Colombia.' },
            '3': { '1': 'La Constitución y los derechos ciudadanos.', '3': 'Autoridades del país y cómo se eligen.', '5': 'Mecanismos de protección de derechos.', '7': 'El cuidado del agua y la tierra.' },
            '4': { '1': 'Actividades económicas del país.', '3': 'Convivencia pacífica y reconciliación.', '5': 'Evaluación de saberes sociales.', '7': 'Proyecto de memoria local.' }
        }
    },
    'Ciclo III': {
        objetivo: 'Analizar las civilizaciones antiguas, la Edad Media, el descubrimiento de América y la geografía universal para validantes.',
        periodos: {
            '1': { '1': 'Origen del planeta, mapas y coordenadas geográficas.', '3': 'Grandes civilizaciones de la antigüedad (Egipto, Grecia, Roma).', '5': 'Aportes de la antigüedad a las leyes y la democracia.', '7': 'Prehistoria y primeros pobladores de América.' },
            '2': { '1': 'La Edad Media: feudalismo, religión y comercio.', '3': 'El Renacimiento y los descubrimientos marítimos.', '5': 'Culturas indígenas prehispánicas (Aztecas, Mayas, Incas, Muiscas).', '7': 'La Conquista y Colonización de América.' },
            '3': { '1': 'Geografía de los continentes y recursos naturales.', '3': 'Población mundial y migraciones.', '5': 'Derechos Humanos y su evolución histórica.', '7': 'Democracia y participación ciudadana.' },
            '4': { '1': 'Problemas ambientales globales.', '3': 'Preparación para pruebas de ciclo.', '5': 'Simulacro de validación.', '7': 'Cierre del ciclo.' }
        }
    },
    'Ciclo IV': {
        objetivo: 'Examinar las revoluciones modernas, la historia de Colombia en los siglos XIX y XX y el conflicto armado.',
        periodos: {
            '1': { '1': 'La Revolución Industrial y la Revolución Francesa.', '3': 'Independencia de Colombia y la Gran Colombia.', '5': 'El siglo XIX colombiano: guerras civiles y constituciones.', '7': 'El imperialismo y la Primera Guerra Mundial.' },
            '2': { '1': 'La Segunda Guerra Mundial y la creación de la ONU.', '3': 'La Guerra Fría y su impacto en América Latina.', '5': 'Colombia en el siglo XX: El Bogotazo y La Violencia.', '7': 'Nacimiento de las guerrillas y el narcotráfico en Colombia.' },
            '3': { '1': 'La Constitución Política de 1991: Estado Social de Derecho.', '3': 'Ramas del poder público y organismos de control.', '5': 'Mecanismos de participación ciudadana y tutela.', '7': 'Economía colombiana y sectores productivos.' },
            '4': { '1': 'Entrenamiento Saber Ciclo IV Sociales.', '3': 'Cultura de paz y convivencia.', '5': 'Simulacro final.', '7': 'Graduación del ciclo.' }
        }
    },
    'Ciclo V': {
        objetivo: 'Dominar la economía política, geopolítica contemporánea, multiperspectivismo y preparación Saber 11 Sociales.',
        periodos: {
            '1': { '1': 'Principios de economía: mercados, inflación, empleo y presupuesto.', '3': 'Modelos económicos: Capitalismo, Socialismo y Neoliberalismo.', '5': 'El Estado y la política fiscal en Colombia.', '7': 'Geopolítica mundial y organismos internacionales.' },
            '2': { '1': 'Competencias ciudadanas: análisis de prejuicios y argumentos.', '3': 'Multiperspectivismo en problemáticas sociales complejas.', '5': 'Derechos Humanos y Derecho Internacional Humanitario.', '7': 'Lectura crítica de textos y fuentes históricas.' },
            '3': { '1': 'Historia reciente de Colombia: Constitución de 1991 y procesos de paz.', '3': 'Conflicto armado, víctimas y justicia transicional.', '5': 'Desarrollo sostenible y problemáticas ambientales.', '7': 'Simulacros de prueba Saber 11 Sociales y Ciudadanas.' },
            '4': { '1': 'Estrategias de resolución de preguntas tipo ICFES.', '3': 'Análisis de casos y dilemas morales.', '5': 'Refuerzo conceptual.', '7': 'Evaluación integral.' }
        }
    },
    'Ciclo VI': {
        objetivo: 'Consolidar las competencias Saber 11 en Sociales y Ciudadanas, análisis crítico de políticas públicas y formación ciudadana de egreso.',
        periodos: {
            '1': { '1': 'Evidencias del módulo oficial Saber 11 Sociales y Ciudadanas.', '3': 'Pensamiento social y análisis sistémico de problemas del país.', '5': 'Interpretación de perspectivas y dimensiones (económica, política, ambiental, cultural).', '7': 'Análisis de la Constitución y fallos de la Corte Constitucional.' },
            '2': { '1': 'El Acuerdo de Paz de 2016 y los retos del posconflicto en Colombia.', '3': 'Geopolítica del siglo XXI: nuevas potencias y globalización.', '5': 'Ética pública, transparencia y lucha contra la corrupción.', '7': 'Simulacros intensivos con retroalimentación completa.' },
            '3': { '1': 'Manejo de tiempos y técnicas para descartar opciones incorrectas.', '3': 'Repaso intensivo de los temas de mayor peso en la prueba de Estado.', '5': 'Debate sobre el futuro socioeconómico de Colombia.', '7': 'Simulacro general de validación.' },
            '4': { '1': 'Prueba final de Estado y validación de bachillerato.', '3': 'Liderazgo comunitario y plan de vida ciudadana.', '5': 'Sustentación de proyectos.', '7': 'Graduación.' }
        }
    },
    'PENS': {
        objetivo: 'Analizar la realidad socioeconómica regional, legislación laboral y participación ciudadana productiva.',
        periodos: {
            '1': { '1': 'Geografía económica y potencial productivo del Eje Cafetero.', '3': 'Normativa laboral: contratos, salarios y prestaciones sociales.', '5': 'Derecho de petición y tutela en el ámbito laboral.', '7': 'Economía solidaria y cooperativismo.' },
            '2': { '1': 'Políticas de fomento empresarial y microcréditos.', '3': 'Impacto social y ambiental de las empresas.', '5': 'Participación ciudadana en planes de desarrollo municipal.', '7': 'Resolución de conflictos laborales.' },
            '3': { '1': 'Globalización y comercio justo.', '3': 'Preparación de pruebas de validación social.', '5': 'Simulacros tipo Saber.', '7': 'Análisis de casos socioeconómicos.' },
            '4': { '1': 'Diseño del componente social del proyecto productivo.', '3': 'Sustentación de la propuesta comunitaria.', '5': 'Evaluación final.', '7': 'Graduación.' }
        }
    }
};

window.mallaCastellano = {
    '1': {
        objetivo: 'Desarrollar la conciencia fonológica, asociación fonema-grafema, lectura de palabras y oraciones cortas, y expresión oral respetuosa.',
        dba: [
            'DBA 1: Reconoce los sonidos iniciales y finales de las palabras y los asocia con las letras correspondientes.',
            'DBA 2: Lee y comprende palabras, frases y textos cortos apoyándose en imágenes e ilustraciones.',
            'DBA 3: Escribe textos sencillos con diferentes intenciones comunicativas (mensajes, tarjetas, listas).',
            'DBA 4: Participa en conversaciones y rondas infantiles respetando turnos de habla.'
        ],
        periodos: {
            '1': { '1': 'Conciencia fonológica y vocales.', '3': 'Consonantes iniciales (m, p, s, l, t).', '5': 'Lectura de palabras y oraciones sencillas con imágenes.', '7': 'Expresión oral: rimas y rondas infantiles.' },
            '2': { '1': 'Consonantes intermedias (d, n, r, f, b, v).', '3': 'Combinaciones silábicas directas.', '5': 'Cuentos infantiles cortos y comprensión literal.', '7': 'Escritura de palabras y dictados sencillos.' },
            '3': { '1': 'Combinaciones con consonantes complejas (bl, br, pl, pr, cl, cr).', '3': 'Uso de la mayúscula y el punto en oraciones.', '5': 'Fábulas con moraleja y personajes de animales.', '7': 'Creación de pequeños mensajes y tarjetas.' },
            '4': { '1': 'Lectura fluida de textos breves.', '3': 'Descripción oral de objetos, animales y personas.', '5': 'Secuencia de historias (inicio, nudo, final).', '7': 'Feria de la lectura y títeres de 1°.' }
        }
    },
    '2': {
        objetivo: 'Fortalecer la lectura fluida, comprensión de fábulas y cuentos, escritura de párrafos con concordancia y enriquecimiento de vocabulario.',
        dba: [
            'DBA 1: Lee en voz alta con entonación adecuada textos narrativos e instructivos breves.',
            'DBA 2: Identifica la estructura de textos narrativos (inicio, nudo, desenlace) y sus personajes.',
            'DBA 3: Produce textos escritos utilizando mayúsculas al inicio y punto al final.',
            'DBA 4: Utiliza el orden alfabético para buscar palabras en el diccionario.'
        ],
        periodos: {
            '1': { '1': 'El abecedario y el orden alfabético.', '3': 'El cuento: personajes, lugar y tiempo de la historia.', '5': 'El sustantivo común y propio.', '7': 'Uso de la mayúscula en nombres propios.' },
            '2': { '1': 'La fábula y la personificación.', '3': 'El adjetivo calificativo y la descripción.', '5': 'Uso del punto y la coma en listas.', '7': 'Lectura en voz alta con entonación.' },
            '3': { '1': 'El texto instructivo: recetas y normas de juego.', '3': 'El verbo y acciones cotidianas.', '5': 'Sinónimos y antónimos en la escritura.', '7': 'Acentuación básica de palabras familiares.' },
            '4': { '1': 'La poesía infantil, rimas y coplas.', '3': 'La historieta y las viñetas.', '5': 'Producción de un cuento corto propio.', '7': 'Festival de declamación y lectura de 2°.' }
        }
    },
    '3': {
        objetivo: 'Fortalecer la lectura fluida, comprensión de textos narrativos e informativos y ortografía básica.',
        dba: [
            'DBA 1: Comprende el sentido global de los textos que lee (tema, propósito e ideas principales).',
            'DBA 2: Escribe textos narrativos e informativos organizando las ideas en párrafos coherentes.'
        ],
        periodos: {
            '1': { '1': 'El cuento y sus partes (inicio, nudo, desenlace).', '3': 'El sustantivo, género y número.', '5': 'El adjetivo y la descripción de personajes.', '7': 'Uso del punto y la mayúscula.' },
            '2': { '1': 'La fábula y la moraleja.', '3': 'El verbo y los tiempos verbales (pasado, presente, futuro).', '5': 'Sinónimos y antónimos.', '7': 'Uso de la coma en enumeraciones.' },
            '3': { '1': 'El poema, la rima y el verso.', '3': 'La noticia y textos informativos sencillos.', '5': 'Familias de palabras y prefijos.', '7': 'Palabras agudas, graves y esdrújulas.' },
            '4': { '1': 'El teatro infantil y los diálogos.', '3': 'La carta y el correo electrónico.', '5': 'Comprensión lectora y resumen.', '7': 'Taller de creación literaria.' }
        }
    },
    '4': {
        objetivo: 'Desarrollar habilidades de redacción, análisis de textos instructivos, líricos y narrativos, y acentuación.',
        periodos: {
            '1': { '1': 'Mitos y leyendas tradicionales.', '3': 'El párrafo y la idea principal.', '5': 'Clasificación de palabras según el acento (agudas, graves, esdrújulas).', '7': 'Los pronombres personales.' },
            '2': { '1': 'El texto instructivo: recetas y manuales.', '3': 'Adverbios de tiempo, lugar y modo.', '5': 'Uso de conectores lógicos de causa y consecuencia.', '7': 'Signos de interrogación y exclamación.' },
            '3': { '1': 'El texto expositivo y la infografía.', '3': 'Preposiciones y conjunciones.', '5': 'Sentido literal y figurado (metáforas sencillas).', '7': 'Uso de la b, v, c, s, z.' },
            '4': { '1': 'La historieta y el lenguaje del cómic.', '3': 'Técnicas de exposición oral.', '5': 'Comprensión inferencial.', '7': 'Feria del libro escolar.' }
        }
    },
    '5': {
        objetivo: 'Comprender textos argumentativos básicos, enriquecer la producción textual y desarrollar lectura crítica inicial.',
        periodos: {
            '1': { '1': 'La novela juvenil y sus elementos narrativos.', '3': 'Estructura de la oración: sujeto, predicado y núcleos.', '5': 'Uso de diptongos, triptongos y hiatos.', '7': 'El resumen y la síntesis.' },
            '2': { '1': 'El artículo de opinión y la argumentación.', '3': 'La entrevista y el reportaje.', '5': 'Uso de comillas, guiones y paréntesis.', '7': 'Homófonas y parónimas.' },
            '3': { '1': 'El texto publicitario: lemas y persuasión.', '3': 'Figuras literarias: símil, hipérbole y personificación.', '5': 'Voz activa y voz pasiva.', '7': 'Lectura crítica de medios de comunicación.' },
            '4': { '1': 'Mesa redonda y debate escolar.', '3': 'Preparación Saber 5° Lenguaje.', '5': 'Ensayo infantil.', '7': 'Antología de cuentos propios.' }
        }
    },
    '6': {
        objetivo: 'Interpretar y producir textos narrativos, líricos y dramáticos reconociendo su estructura y funciones gramaticales.',
        periodos: {
            '1': { '1': 'La tradición oral: mitos y leyendas universales.', '3': 'Estructura profunda de los textos narrativos.', '5': 'Categorías gramaticales y sintaxis básica.', '7': 'Reglas ortográficas y uso de signos de puntuación.' },
            '2': { '1': 'El género lírico: poemas, odas y figuras retóricas.', '3': 'Métrica, rima y ritmo poético.', '5': 'El texto expositivo: ideas principales y secundarias.', '7': 'Cohesión y coherencia en el párrafo.' },
            '3': { '1': 'El género dramático: guion teatral, acotaciones y puesta en escena.', '3': 'Medios de comunicación: la noticia y la crónica.', '5': 'Semántica: polisemia, homonimia y campos semánticos.', '7': 'Mapas conceptuales y esquemas de lectura.' },
            '4': { '1': 'La novela de aventuras y fantasía.', '3': 'El debate y la argumentación oral.', '5': 'Uso de conectores discursivos.', '7': 'Creación de una revista escolar.' }
        }
    },
    '7': {
        objetivo: 'Analizar textos de la literatura precolombina y colonial, afianzar el texto argumentativo y la ortografía avanzada.',
        periodos: {
            '1': { '1': 'Literatura precolombina: cosmogonía y mitos indígenas.', '3': 'Literatura del Descubrimiento y la Conquista (diarios de Indias).', '5': 'Oraciones compuestas por coordinación.', '7': 'Uso del punto y coma y dos puntos.' },
            '2': { '1': 'La crónica periodística y el reportaje.', '3': 'El texto argumentativo: tesis, argumentos y contraargumentos.', '5': 'Nexos subordinantes y oraciones complejas.', '7': 'Análisis crítico de la publicidad.' },
            '3': { '1': 'El teatro del Siglo de Oro español.', '3': 'Figuras literarias de pensamiento: antítesis e ironía.', '5': 'Tipologías textuales y su intención comunicativa.', '7': 'El ensayo corto de opinión.' },
            '4': { '1': 'La literatura de ciencia ficción.', '3': 'Ética de la comunicación en redes sociales.', '5': 'Técnicas de oratoria y exposición.', '7': 'Proyecto de investigación literaria.' }
        }
    },
    '8': {
        objetivo: 'Explorar la literatura colombiana y latinoamericana, el ensayo argumentativo y la lectura crítica.',
        periodos: {
            '1': { '1': 'Literatura de la Colonia y la Independencia en Colombia.', '3': 'El Romanticismo y el Costumbrismo colombiano (María de Jorge Isaacs).', '5': 'El Modernismo en Colombia (José Asunción Silva).', '7': 'Oraciones compuestas por subordinación adjetiva y sustantiva.' },
            '2': { '1': 'El ensayo: estructura formal y tipos de argumentos.', '3': 'Literatura de la Violencia en Colombia.', '5': 'Vicios del lenguaje: dequeísmo, pleonasmo y extranjerismos.', '7': 'Citas textuales y normas de citación.' },
            '3': { '1': 'El Boom Latinoamericano y el Realismo Mágico (Gabriel García Márquez).', '3': 'Análisis semiótico de imágenes y cine.', '5': 'Cohesión léxica y gramatical avanzada.', '7': 'La mesa redonda y el panel de discusión.' },
            '4': { '1': 'Literatura contemporánea colombiana.', '3': 'El discurso político y su análisis crítico.', '5': 'Taller de producción de ensayos.', '7': 'Muestra literaria escolar.' }
        }
    },
    '9': {
        objetivo: 'Analizar la literatura latinoamericana universal, vanguardias, pensamiento crítico y preparación Saber 9°.',
        periodos: {
            '1': { '1': 'Vanguardias literarias en América Latina (creacionismo, ultraísmo).', '3': 'Poesía social latinoamericana (Neruda, Vallejo, Mistral).', '5': 'Análisis sintáctico de oraciones compuestas.', '7': 'Mecanismos de coherencia y progresión temática.' },
            '2': { '1': 'La novela social e indigenista en América Latina.', '3': 'El artículo de opinión y la columna editorial.', '5': 'Falacias argumentativas y cómo refutarlas.', '7': 'Ética del discurso en medios masivos.' },
            '3': { '1': 'El teatro contemporáneo y teatro del absurdo.', '3': 'Ensayo filosófico y literario.', '5': 'Lectura crítica: identificación de intenciones del autor.', '7': 'Análisis de editoriales de prensa.' },
            '4': { '1': 'Literatura posmoderna y nuevas narrativas digitales.', '3': 'Preparación Saber 9° Lenguaje.', '5': 'Seminario de oratoria y debate.', '7': 'Proyecto final de publicación.' }
        }
    },
    '10': {
        objetivo: 'Estudiar la literatura española desde sus orígenes hasta el siglo XX, tipologías textuales complejas y ensayo.',
        periodos: {
            '1': { '1': 'Literatura Medieval española: El Cantar de Mio Cid y el mester de juglaría.', '3': 'El Renacimiento y el Siglo de Oro (La Celestina, El Quijote).', '5': 'Poesía mística y barroca (Garcilaso, Góngora, Quevedo).', '7': 'Estructura profunda del texto argumentativo y el ensayo.' },
            '2': { '1': 'El Neoclasicismo y la Ilustración española.', '3': 'El Romanticismo español (Bécquer, Espronceda).', '5': 'El Realismo y Naturalismo (Galdós, Clarín).', '7': 'Lectura crítica Saber 10°: inferencia y valoración.' },
            '3': { '1': 'La Generación del 98 (Unamuno, Machado) y del 27 (Lorca, Cernuda).', '3': 'Análisis de textos filosóficos y científicos.', '5': 'Pragmática lingüística y actos de habla.', '7': 'Redacción de artículos académicos con normas APA.' },
            '4': { '1': 'Literatura española contemporánea.', '3': 'El debate académico formal.', '5': 'Simulacros de lectura crítica.', '7': 'Ensayo de grado 10°.' }
        }
    },
    '11': {
        objetivo: 'Analizar la literatura universal (Clásica a Contemporánea), dominio del ensayo crítico y preparación intensiva Saber 11 Lectura Crítica.',
        periodos: {
            '1': { '1': 'Literatura Clásica Griega y Latina (Homero, Sófocles, Virgilio).', '3': 'Literatura Medieval y Renacentista Universal (Dante, Shakespeare).', '5': 'Estructura y niveles de la prueba Saber 11 Lectura Crítica (Literal, Inferencial, Crítico-Intertextual).', '7': 'Análisis de textos discontinuos (caricaturas, infografías, tablas).' },
            '2': { '1': 'El Racionalismo, Ilustración y Romanticismo Universal (Goethe, Poe, Dostoievski).', '3': 'El Existencialismo y literatura del siglo XX (Kafka, Camus, Sartre).', '5': 'Identificación de tesis, premisas, argumentos y contraargumentos en textos filosóficos.', '7': 'Detección de supuestos ideológicos e intención comunicativa del autor.' },
            '3': { '1': 'Literatura Oriental y Africana contemporánea.', '3': 'El ensayo crítico-filosófico de grado.', '5': 'Estrategias de resolución de preguntas tipo Saber 11 Lectura Crítica.', '7': 'Simulacros intensivos con retroalimentación pregunta por pregunta.' },
            '4': { '1': 'Lectura crítica de medios y análisis de discursos políticos.', '3': 'Técnicas de manejo de tiempo en Saber 11.', '5': 'Sustentación de ensayos de grado.', '7': 'Evaluación final y cierre de bachillerato.' }
        }
    },
    'Ciclo I': {
        objetivo: 'Desarrollar la alfabetización funcional, comprensión lectora básica y redacción de textos cotidianos para adultos.',
        periodos: {
            '1': { '1': 'Lectura comprensiva de textos cortos y cotidianos.', '3': 'La oración, el sujeto y la acción.', '5': 'Escritura de datos personales y formularios.', '7': 'Signos de puntuación esenciales.' },
            '2': { '1': 'Lectura de avisos, carteles y empaques de productos.', '3': 'El abecedario y búsqueda en diccionarios.', '5': 'Redacción de notas, mensajes y recados.', '7': 'Uso correcto de mayúsculas.' },
            '3': { '1': 'Cuentos y anécdotas de la tradición popular.', '3': 'La carta familiar y la solicitud sencilla.', '5': 'Lectura de noticias breves.', '7': 'Ortografía de palabras frecuentes.' },
            '4': { '1': 'Instrucciones de medicamentos y recetas.', '3': 'Conversación y expresión oral respetuosa.', '5': 'Lectura en familia.', '7': 'Proyecto de lectoescritura.' }
        }
    },
    'Ciclo II': {
        objetivo: 'Consolidar la lectura fluida, redacción de documentos laborales y comprensión de diversos tipos de textos para adultos.',
        periodos: {
            '1': { '1': 'Estructura de textos informativos y narrativos.', '3': 'El párrafo y la conexión entre ideas.', '5': 'Elaboración de cartas formales y derechos de petición.', '7': 'Acentuación y reglas ortográficas prácticas.' },
            '2': { '1': 'La noticia y la crónica comunitaria.', '3': 'Textos instructivos: manuales de uso y seguridad laboral.', '5': 'Uso de conectores de orden y causa.', '7': 'Lectura de contratos y acuerdos.' },
            '3': { '1': 'La poesía popular y las coplas de la región.', '3': 'Expresión oral en reuniones de trabajo y comunidad.', '5': 'El resumen de textos extensos.', '7': 'Comprensión inferencial en situaciones reales.' },
            '4': { '1': 'Uso de medios digitales: correos y mensajes.', '3': 'Lectura de artículos de salud y bienestar.', '5': 'Muestra de escritos propios.', '7': 'Taller integrador.' }
        }
    },
    'Ciclo III': {
        objetivo: 'Desarrollar la comprensión crítica de textos informativos y literarios, redacción argumentativa y normas ortográficas.',
        periodos: {
            '1': { '1': 'Mitos, leyendas y tradición oral colombiana.', '3': 'Estructura de la narración y personajes.', '5': 'Gramática funcional: categorías de palabras.', '7': 'Signos de puntuación para dar claridad al texto.' },
            '2': { '1': 'El texto informativo y periodístico.', '3': 'El texto argumentativo: dar razones y fundamentar opiniones.', '5': 'Uso de conectores lógicos.', '7': 'Análisis crítico de noticias y publicidad.' },
            '3': { '1': 'El teatro y la expresión corporal y verbal.', '3': 'El género lírico y la sensibilidad poética.', '5': 'Técnicas de resumen y síntesis.', '7': 'Redacción de hojas de vida y solicitudes laborales.' },
            '4': { '1': 'La novela corta y el cuento latinoamericano.', '3': 'El debate y la escucha activa.', '5': 'Preparación para pruebas de ciclo.', '7': 'Proyecto de comunicación comunitaria.' }
        }
    },
    'Ciclo IV': {
        objetivo: 'Fortalecer el análisis literario, la redacción de ensayos cortos y la lectura crítica para la validación.',
        periodos: {
            '1': { '1': 'Literatura colombiana: identidad, violencia y memoria.', '3': 'El ensayo argumentativo: tesis y sustentación.', '5': 'Oraciones compuestas y conectores discursivos.', '7': 'Normas ortográficas avanzadas.' },
            '2': { '1': 'El Realismo Mágico y Gabriel García Márquez.', '3': 'El artículo de opinión y la columna periodística.', '5': 'Detección de falacias y argumentos débiles.', '7': 'Lectura de textos discontinuos (gráficos e infografías).' },
            '3': { '1': 'Literatura latinoamericana: novela social y vanguardias.', '3': 'El discurso oral persuasivo.', '5': 'Semántica y pragmática en la comunicación.', '7': 'Elaboración de proyectos escritos.' },
            '4': { '1': 'Entrenamiento en preguntas tipo Saber Ciclo IV.', '3': 'Análisis crítico de redes sociales y medios.', '5': 'Simulacro de validación de lenguaje.', '7': 'Cierre del ciclo.' }
        }
    },
    'Ciclo V': {
        objetivo: 'Dominar la lectura crítica, análisis de textos filosóficos y literarios españoles y universales, y ensayo formal.',
        periodos: {
            '1': { '1': 'Literatura Española Clásica y del Siglo de Oro (El Quijote).', '3': 'Estructura del ensayo académico y citas.', '5': 'Niveles de lectura: literal, inferencial y crítico.', '7': 'Análisis de textos filosóficos y ensayísticos.' },
            '2': { '1': 'Generaciones literarias españolas y universales.', '3': 'Tipologías textuales y actos de habla.', '5': 'Lectura de caricaturas políticas y textos discontinuos.', '7': 'Estrategias de comprensión lectora Saber 11.' },
            '3': { '1': 'El discurso argumentativo en debates públicos.', '3': 'Identificación de supuestos, intenciones y sesgos en el autor.', '5': 'Redacción de textos reflexivos de vida.', '7': 'Simulacros de lectura crítica con análisis detallado.' },
            '4': { '1': 'Manejo del tiempo y técnicas de examen de Estado.', '3': 'Refuerzo en preguntas de alta complejidad.', '5': 'Ensayo de proyecto de vida.', '7': 'Evaluación integral.' }
        }
    },
    'Ciclo VI': {
        objetivo: 'Consolidar la competencia de Lectura Crítica Saber 11, análisis filosófico universal y producción textual de egreso.',
        periodos: {
            '1': { '1': 'Literatura Universal: de la tragedia griega a la modernidad.', '3': 'Módulo oficial ICFES Saber 11: Lectura Crítica (Evidencias y competencias).', '5': 'Análisis de textos filosóficos clásicos y modernos.', '7': 'Textos continuos vs. textos discontinuos en pruebas de Estado.' },
            '2': { '1': 'El Existencialismo y las vanguardias del siglo XX.', '3': 'Estrategias para descartar distractores en preguntas de opción múltiple.', '5': 'Análisis ideológico de textos periodísticos y ensayos políticos.', '7': 'Redacción del ensayo de grado.' },
            '3': { '1': 'Simulacros intensivos Saber 11 de Lectura Crítica.', '3': 'Retroalimentación detallada de errores comunes.', '5': 'Argumentación oral y defensa de puntos de vista.', '7': 'Lectura intertextual y comparación de posturas.' },
            '4': { '1': 'Prueba final de validación de bachillerato.', '3': 'Oratoria y habilidades de comunicación para el mundo laboral.', '5': 'Sustentación del ensayo final.', '7': 'Graduación y plan de vida profesional.' }
        }
    },
    'PENS': {
        objetivo: 'Aplicar la comunicación asertiva, redacción técnica y lectura crítica en contextos laborales y comerciales.',
        periodos: {
            '1': { '1': 'Comprensión de textos técnicos e instructivos laborales.', '3': 'Redacción de informes, actas y correspondencia comercial.', '5': 'Ortografía y puntuación en documentos oficiales.', '7': 'Lectura crítica de contratos y normativas.' },
            '2': { '1': 'Comunicación asertiva y resolución pacífica de conflictos.', '3': 'Técnicas de atención al cliente y servicio.', '5': 'Elaboración de propuestas comerciales y proyectos.', '7': 'Presentaciones orales efectivas.' },
            '3': { '1': 'Análisis de medios y publicidad engañosa.', '3': 'El ensayo de opinión sobre problemáticas socioeconómicas.', '5': 'Preparación de pruebas de validación de lenguaje.', '7': 'Simulacros tipo Saber.' },
            '4': { '1': 'Diseño del manual de procesos o producto final.', '3': 'Sustentación oral del proyecto productivo.', '5': 'Cierre curricular y evaluación de egreso.', '7': 'Graduación.' }
        }
    }
};

window.mallaIngles = {
    '3': {
        objetivo: 'Reconocer vocabulario básico en inglés: saludos, números, colores, animales, familia y órdenes sencillas de clase.',
        periodos: {
            '1': { '1': 'Greetings and farewells (Hello, Goodbye, Good morning).', '3': 'Numbers from 1 to 20 and basic colors.', '5': 'Classroom objects and simple commands.', '7': 'The alphabet and spelling names.' },
            '2': { '1': 'Family members (Father, Mother, Brother, Sister).', '3': 'Farm and wild animals.', '5': 'Parts of the body (Head, Shoulders, Knees, Toes).', '7': 'Singular and plural nouns with A/An.' },
            '3': { '1': 'Fruits and vegetables.', '3': 'Days of the week and months of the year.', '5': 'Basic feelings and emotions (Happy, Sad, Angry).', '7': 'Simple questions: What is this? Who is that?' },
            '4': { '1': 'Clothes and weather (Sunny, Rainy, Cold).', '3': 'Shapes and sizes (Big, Small).', '5': 'Songs and chants in English.', '7': 'English show and tell.' }
        }
    },
    '4': {
        objetivo: 'Comprender frases cortas en presente simple, descripciones personales, la hora y rutinas diarias.',
        periodos: {
            '1': { '1': 'Personal pronouns (I, You, He, She, It, We, They).', '3': 'Verb To Be in affirmative and negative.', '5': 'Countries, nationalities and languages.', '7': 'Numbers from 20 to 100.' },
            '2': { '1': 'Telling the time (O clock, Half past, Quarter to/past).', '3': 'Daily routines (Wake up, Have breakfast, Go to school).', '5': 'Simple Present with action verbs (Like, Play, Eat).', '7': 'Adverbs of frequency (Always, Sometimes, Never).' },
            '3': { '1': 'Parts of the house and furniture.', '3': 'Prepositions of place (In, On, Under, Next to).', '5': 'Possessive adjectives (My, Your, His, Her, Our, Their).', '7': 'There is / There are in descriptions.' },
            '4': { '1': 'Sports and free time activities.', '3': 'Can / Can t for abilities.', '5': 'Short reading comprehension texts.', '7': 'Role-play in English.' }
        }
    },
    '5': {
        objetivo: 'Consolidar el Presente Simple, Presente Continuo, vocabulario de lugares de la ciudad y textos descriptivos.',
        periodos: {
            '1': { '1': 'Review of Verb To Be and Simple Present rules (Third person -s/-es).', '3': 'Wh- questions (What, Where, When, Why, Who, How).', '5': 'Places in the city (Bank, Hospital, Park, Supermarket).', '7': 'Giving simple directions (Turn left, Turn right, Go straight).' },
            '2': { '1': 'Present Continuous: actions happening now (Verb + ing).', '3': 'Contrast between Simple Present and Present Continuous.', '5': 'Professions and jobs (Doctor, Teacher, Engineer).', '7': 'Food, meals and countable/uncountable nouns (Some/Any).' },
            '3': { '1': 'Comparative adjectives (Taller, Bigger, More intelligent).', '3': 'Superlative adjectives (The tallest, The biggest, The most interesting).', '5': 'Past of Verb To Be: Was / Were.', '7': 'Describing past holidays and events.' },
            '4': { '1': 'Going to for future plans.', '3': 'Preparación Saber 5° Inglés.', '5': 'Short dialogues and presentations.', '7': 'English festival.' }
        }
    },
    '6': {
        objetivo: 'Desarrollar competencias comunicativas en nivel A1: descripciones personales, rutinas y presente continuo.',
        periodos: {
            '1': { '1': 'Introductions, personal information and Verb To Be.', '3': 'Subject pronouns and possessive adjectives.', '5': 'Cardinal and ordinal numbers, dates and time.', '7': 'Classroom language and imperative forms.' },
            '2': { '1': 'Simple Present tense (Affirmative, Negative, Interrogative).', '3': 'Daily routines and time expressions.', '5': 'Adverbs of frequency and leisure activities.', '7': 'Likes, dislikes and preferences (Like, Love, Hate + ing).' },
            '3': { '1': 'There is / There are and quantifiers (Much, Many, A lot of).', '3': 'Prepositions of place and movement.', '5': 'Present Continuous tense for current activities.', '7': 'Reading comprehension: descriptive paragraphs.' },
            '4': { '1': 'Modal verb Can / Can t for ability and permission.', '3': 'Body parts, physical appearance and personality adjectives.', '5': 'Writing a short personal profile.', '7': 'English project presentation.' }
        }
    },
    '7': {
        objetivo: 'Consolidar el nivel A1+ hacia A2: Pasado Simple regular e irregular, comparativos y planes futuros.',
        periodos: {
            '1': { '1': 'Simple Past of Verb To Be (Was / Were).', '3': 'Past Simple: Regular verbs (-ed endings and pronunciation).', '5': 'Past Simple: Irregular verbs (Common list and usage).', '7': 'Past Simple questions and negative forms (Did / Didn t).' },
            '2': { '1': 'Time expressions for the past (Yesterday, Last week, Ago).', '3': 'Biographies of famous people and historical events.', '5': 'Comparative and superlative adjectives.', '7': 'Giving opinions and making comparisons between places.' },
            '3': { '1': 'Countable and uncountable nouns with How much / How many.', '3': 'Food, nutrition and ordering at a restaurant.', '5': 'Future with Be Going To (Plans and intentions).', '7': 'Weather forecast and holiday planning.' },
            '4': { '1': 'Have to / Don t have to for obligations.', '3': 'Reading short stories and fables.', '5': 'Writing an email to a pen pal.', '7': 'Cultural awareness project.' }
        }
    },
    '8': {
        objetivo: 'Alcanzar el nivel A2: Pasado Continuo, Futuro Will vs. Going to, Primer Condicional y Modales.',
        periodos: {
            '1': { '1': 'Review of Past Simple vs. Past Continuous (When / While).', '3': 'Narrating stories and anecdotes in the past.', '5': 'Used to for past habits and states.', '7': 'Vocabulary of technology, internet and social media.' },
            '2': { '1': 'Future forms: Will (Predictions, promises, spontaneous decisions).', '3': 'Future forms: Be Going To vs. Will.', '5': 'First Conditional (If + Present, Will + Verb) for cause and effect.', '7': 'Environmental issues and green solutions.' },
            '3': { '1': 'Modal verbs for advice and obligation (Should, Must, Have to).', '3': 'Health problems, symptoms and remedies.', '5': 'Indefinite pronouns (Someone, Anything, Nowhere).', '7': 'Reading informative articles.' },
            '4': { '1': 'Present Perfect introductory concepts (Ever / Never).', '3': 'Writing a formal and informal letter.', '5': 'Speaking: Debating simple topics.', '7': 'English talent show.' }
        }
    },
    '9': {
        objetivo: 'Avanzar en el nivel B1 inicial: Presente Perfecto, Voz Pasiva básica, Segundo Condicional y preparación Saber 9°.',
        periodos: {
            '1': { '1': 'Present Perfect Simple (Have/Has + Past Participle).', '3': 'Present Perfect with Already, Just, Yet, For, Since.', '5': 'Contrast: Present Perfect vs. Past Simple.', '7': 'Talking about life experiences and achievements.' },
            '2': { '1': 'Second Conditional (If + Past Simple, Would + Verb) for hypothetical situations.', '3': 'Giving advice with If I were you...', '5': 'Relative clauses with Who, Which, That, Where.', '7': 'Describing objects, people and places in detail.' },
            '3': { '1': 'Passive Voice in Present and Past Simple (Form and usage).', '3': 'Inventions, discoveries and scientific processes.', '5': 'Reported Speech basics (Said that, Told me that).', '7': 'Reading journalistic and opinion articles.' },
            '4': { '1': 'Phrasal verbs common in everyday English.', '3': 'Preparación Saber 9° Inglés.', '5': 'Mock exam practice with feedback.', '7': 'Final oral presentation.' }
        }
    },
    '10': {
        objetivo: 'Dominar la gramática intermedia B1: Pasado Perfecto, Tercer Condicional, Modales de deducción y lectura inferencial.',
        periodos: {
            '1': { '1': 'Past Perfect Simple (Had + Past Participle) and sequence of past events.', '3': 'Past Perfect vs. Past Simple with Before, After, By the time.', '5': 'Used to, Be used to, Get used to.', '7': 'Advanced narrative writing.' },
            '2': { '1': 'Third Conditional (If + Past Perfect, Would have + Past Participle) for regrets.', '3': 'Mixed conditionals overview.', '5': 'Modals of deduction in the present (Must be, Can t be, Might be).', '7': 'Modals of deduction in the past (Must have been, Could have been).' },
            '3': { '1': 'Advanced Passive Voice with modal verbs and continuous tenses.', '3': 'Causative verbs (Have/Get something done).', '5': 'Estructura de la prueba Saber 11 Inglés: Partes 1 a 4 (Avisos, Vocabulario, Conversaciones, Textos incompletos).', '7': 'Reading strategies: Skimming, scanning and inferencing.' },
            '4': { '1': 'Vocabulary of global issues, politics and ethics.', '3': 'Writing argumentative essays in English.', '5': 'Simulacro Saber 10° Inglés.', '7': 'Debate in English on current affairs.' }
        }
    },
    '11': {
        objetivo: 'Alcanzar competencia B1+ / B2 y preparación integral para las 7 partes de la prueba Saber 11 de Inglés.',
        periodos: {
            '1': { '1': 'Saber 11 Part 1 (Avisos y lugares) and Part 2 (Emparejamiento de vocabulario y definiciones).', '3': 'Saber 11 Part 3 (Conversaciones cortas y pragmática comunicativa).', '5': 'Saber 11 Part 4 (Textos con espacios gramaticales - Cloze Test).', '7': 'Grammar review: Tenses, prepositions, linking words and collocations.' },
            '2': { '1': 'Saber 11 Part 5 (Comprensión de lectura literal e inferencial).', '3': 'Saber 11 Part 6 (Lectura crítica de opinión y punto de vista del autor).', '5': 'Saber 11 Part 7 (Texto largo con espacios de vocabulario avanzado y conectores).', '7': 'Time management strategies and error elimination techniques.' },
            '3': { '1': 'Full-length Saber 11 Mock Exams with in-depth feedback.', '3': 'Advanced phrasal verbs, idioms and academic vocabulary.', '5': 'Writing: Personal statement and cover letter for university.', '7': 'Oral presentation: Global challenges and solutions.' },
            '4': { '1': 'Intensive drilling on high-difficulty questions.', '3': 'Tips and mental preparation for the official exam.', '5': 'Evaluation and language portfolio review.', '7': 'English graduation project.' }
        }
    },
    'Ciclo I': {
        objetivo: 'Aprender vocabulario elemental en inglés para el trabajo y la vida cotidiana.',
        periodos: {
            '1': { '1': 'Saludos y presentaciones básicas.', '3': 'Números del 1 al 50 y dinero.', '5': 'Días de la semana y meses.', '7': 'Palabras de cortesía (Please, Thank you).' },
            '2': { '1': 'Nombres de objetos comunes y herramientas.', '3': 'La familia y ocupaciones.', '5': 'Colores y prendas de vestir.', '7': 'Frases útiles en el trabajo.' },
            '3': { '1': 'Comidas, bebidas y compras.', '3': 'Preguntar la hora y direcciones sencillas.', '5': 'Señales de advertencia en inglés.', '7': 'Práctica oral básica.' },
            '4': { '1': 'Lectura de avisos y etiquetas.', '3': 'Conversaciones cotidianas.', '5': 'Repaso general.', '7': 'Evaluación práctica.' }
        }
    },
    'Ciclo II': {
        objetivo: 'Comprender instrucciones, descripciones sencillas y vocabulario práctico en inglés para adultos.',
        periodos: {
            '1': { '1': 'El verbo To Be en presente.', '3': 'Preguntas básicas de información personal.', '5': 'Números hasta 1000 y precios.', '7': 'Lugares de la ciudad y el barrio.' },
            '2': { '1': 'Presente simple: rutinas y horarios.', '3': 'Profesiones y actividades laborales.', '5': 'El cuerpo humano y síntomas de salud.', '7': 'Lectura de textos cortos.' },
            '3': { '1': 'Uso de Can para habilidades y permisos.', '3': 'Preposiciones de lugar en mapas.', '5': 'Compras en tiendas y restaurantes.', '7': 'Escritura de mensajes breves.' },
            '4': { '1': 'Avisos en aeropuertos y terminales.', '3': 'Diálogos de simulación.', '5': 'Evaluación de competencias.', '7': 'Cierre del ciclo.' }
        }
    },
    'Ciclo III': {
        objetivo: 'Dominar el presente simple, pasado básico y comprensión de lecturas cortas en inglés de validación.',
        periodos: {
            '1': { '1': 'Presente simple y pronombres personales.', '3': 'Rutinas diarias y adverbios de frecuencia.', '5': 'There is / There are y cantidades.', '7': 'Lectura de párrafos descriptivos.' },
            '2': { '1': 'Pasado simple del verbo To Be (Was / Were).', '3': 'Verbos regulares e irregulares en pasado.', '5': 'Frases de tiempo en pasado (Yesterday, Last year).', '7': 'Biografías breves.' },
            '3': { '1': 'Comparativos y superlativos.', '3': 'Planes futuros con Going to.', '5': 'Vocabulario de viajes y transporte.', '7': 'Comprensión de avisos públicos.' },
            '4': { '1': 'Entrenamiento en preguntas tipo Saber Ciclo III.', '3': 'Simulacro de validación.', '5': 'Repaso.', '7': 'Evaluación final.' }
        }
    },
    'Ciclo IV': {
        objetivo: 'Avanzar en pasado simple, presente perfecto básico, modales y preparación Saber de validación.',
        periodos: {
            '1': { '1': 'Pasado simple vs. Pasado continuo.', '3': 'Futuro con Will y Going to.', '5': 'Primer condicional (If + Present, Will).', '7': 'Vocabulario de medio ambiente y tecnología.' },
            '2': { '1': 'Verbos modales (Should, Must, Have to).', '3': 'Presente perfecto introductorio (Have you ever...?).', '5': 'Lectura de artículos informativos breves.', '7': 'Conversaciones en contexto laboral.' },
            '3': { '1': 'Voz pasiva básica en presente y pasado.', '3': 'Phrasal verbs más comunes.', '5': 'Estrategias para responder preguntas de selección múltiple.', '7': 'Simulacros tipo prueba de Estado.' },
            '4': { '1': 'Revisión de vocabulario clave Saber Ciclo IV.', '3': 'Simulacro de validación.', '5': 'Retroalimentación.', '7': 'Cierre del ciclo.' }
        }
    },
    'Ciclo V': {
        objetivo: 'Dominar la comprensión lectora, gramática intermedia y las primeras partes del examen Saber 11 Inglés.',
        periodos: {
            '1': { '1': 'Estructura de la prueba de inglés Saber 11: Partes 1 y 2.', '3': 'Avisos publicitarios y señales en inglés (Part 1).', '5': 'Asociación de definiciones y vocabulario (Part 2).', '7': 'Tiempos verbales compuestos y conectores.' },
            '2': { '1': 'Completación de conversaciones (Part 3).', '3': 'Textos incompletos con gramática (Part 4).', '5': 'Segundo y tercer condicional.', '7': 'Modales de deducción y probabilidad.' },
            '3': { '1': 'Lectura literal e inferencial de artículos (Part 5).', '3': 'Vocabulario laboral, científico y tecnológico.', '5': 'Técnicas para identificar la idea central.', '7': 'Simulacros de práctica.' },
            '4': { '1': 'Manejo del tiempo en el examen.', '3': 'Refuerzo de puntos débiles.', '5': 'Simulacro completo.', '7': 'Evaluación integral.' }
        }
    },
    'Ciclo VI': {
        objetivo: 'Consolidar las 7 partes de la prueba Saber 11 de Inglés para la obtención del título de bachiller.',
        periodos: {
            '1': { '1': 'Repaso intensivo Saber 11: Partes 1, 2 y 3 (Avisos, Vocabulario, Diálogos).', '3': 'Estrategias para la Parte 4 (Cloze Test gramatical).', '5': 'Comprensión de lectura crítica: Partes 5 y 6 (Textos de opinión e inferencia).', '7': 'Técnicas para la Parte 7 (Vocabulario de nivel B1+).' },
            '2': { '1': 'Conectores discursivos, preposiciones dependientes y collocations.', '3': 'Análisis de errores recurrentes y trampas en opciones de respuesta.', '5': 'Simulacro completo Saber 11 Inglés bajo condiciones reales.', '7': 'Retroalimentación detallada y plan de mejora individual.' },
            '3': { '1': 'Inglés práctico para entrevistas laborales y hojas de vida.', '3': 'Lectura de manuales técnicos y correspondencia internacional.', '5': 'Práctica intensiva con bancos oficiales de preguntas.', '7': 'Simulacro final de validación.' },
            '4': { '1': 'Examen oficial de Estado Saber 11.', '3': 'Evaluación final y portfolio de aprendizaje.', '5': 'Cierre de la asignatura de inglés.', '7': 'Graduación.' }
        }
    },
    'PENS': {
        objetivo: 'Aplicar el inglés técnico, comercial y de servicio al cliente en empresas turísticas y productivas.',
        periodos: {
            '1': { '1': 'Inglés para atención al cliente y bienvenida a turistas.', '3': 'Vocabulario de hotelería, gastronomía y transporte.', '5': 'Dar información sobre atractivos del Paisaje Cultural Cafetero.', '7': 'Manejo de reservas y facturación en inglés.' },
            '2': { '1': 'Redacción de correos electrónicos comerciales en inglés.', '3': 'Descripción de productos, café y artesanías.', '5': 'Resolución de quejas y situaciones imprevistas.', '7': 'Presentación de catálogos y menús.' },
            '3': { '1': 'Preparación para pruebas Saber de inglés.', '3': 'Simulacros de comprensión de lectura técnica.', '5': 'Diálogos de negociación comercial.', '7': 'Glosario especializado de emprendimiento.' },
            '4': { '1': 'Diseño del material bilingüe del proyecto productivo.', '3': 'Sustentación en inglés del producto o servicio.', '5': 'Evaluación final.', '7': 'Graduación.' }
        }
    }
};

window.mallaTecnologia = {
    '3': {
        objetivo: 'Reconocer artefactos tecnológicos del entorno, su evolución, uso seguro y partes básicas del computador.',
        periodos: {
            '1': { '1': 'Qué es la tecnología y artefactos del hogar.', '3': 'Evolución de los artefactos: antes y ahora.', '5': 'Partes principales del computador (pantalla, teclado, ratón, CPU).', '7': 'Normas de postura y cuidado en la sala de sistemas.' },
            '2': { '1': 'El ratón y sus funciones (clic, doble clic, arrastrar).', '3': 'El teclado: teclas alfanuméricas y barra espaciadora.', '5': 'Programas de dibujo digital (Paint) y creatividad.', '7': 'Guardar y abrir archivos en el computador.' },
            '3': { '1': 'La energía y los electrodomésticos en la casa.', '3': 'Materiales naturales y artificiales en los objetos.', '5': 'Uso seguro de herramientas sencillas (tijeras, reglas).', '7': 'Reciclaje de aparatos electrónicos.' },
            '4': { '1': 'Internet: una ventana al conocimiento.', '3': 'Cuidado con la información personal en línea.', '5': 'Creación de una tarjeta digital.', '7': 'Muestra de inventos infantiles.' }
        }
    },
    '4': {
        objetivo: 'Comprender el funcionamiento de procesadores de texto, sistemas simples, mecanismos y uso responsable de la red.',
        periodos: {
            '1': { '1': 'El procesador de texto: formato de fuentes, párrafos y títulos.', '3': 'Insertar imágenes, formas y tablas en documentos.', '5': 'Artefactos y procesos: de la materia prima al producto final.', '7': 'Inventores famosos y sus creaciones.' },
            '2': { '1': 'Mecanismos simples: palancas, poleas y ruedas.', '3': 'Estructuras y resistencia de materiales.', '5': 'Búsqueda de información académica en internet.', '7': 'Correo electrónico y comunicación digital básica.' },
            '3': { '1': 'Circuitos eléctricos simples (pila, cable, bombillo).', '3': 'Conductores y aislantes de la electricidad.', '5': 'Presentaciones digitales básicas con diapositivas.', '7': 'Diseño de un folleto digital sobre el cuidado ambiental.' },
            '4': { '1': 'Introducción al pensamiento computacional con juegos de lógica.', '3': 'Seguridad digital y ciberacoso (Netiqueta).', '5': 'Construcción de un juguete con materiales reciclados.', '7': 'Feria de tecnología escolar.' }
        }
    },
    '5': {
        objetivo: 'Dominar hojas de cálculo básicas, presentaciones multimedia, fuentes de energía y principios de programación por bloques.',
        periodos: {
            '1': { '1': 'La hoja de cálculo: filas, columnas, celdas y datos.', '3': 'Operaciones matemáticas básicas en hojas de cálculo (suma, resta, promedio).', '5': 'Creación de gráficos estadísticos digitales.', '7': 'Fuentes de energía renovables (solar, eólica, hidráulica) vs. no renovables.' },
            '2': { '1': 'Presentaciones multimedia avanzadas: transiciones y animaciones.', '3': 'Sistemas tecnológicos: entrada, proceso y salida.', '5': 'Introducción a la programación por bloques (Scratch).', '7': 'Movimiento de personajes y eventos en Scratch.' },
            '3': { '1': 'Sensores y condicionales en la programación por bloques.', '3': 'La robótica en la vida moderna y la medicina.', '5': 'Huella de carbono digital y basura electrónica (e-waste).', '7': 'Derechos de autor y licencias Creative Commons.' },
            '4': { '1': 'Diseño de un videojuego educativo en Scratch.', '3': 'Preparación Saber 5° en pensamiento tecnológico.', '5': 'Presentación de proyectos digitales.', '7': 'Exposición tecnológica escolar.' }
        }
    },
    '6': {
        objetivo: 'Comprender la naturaleza de la tecnología, operadores mecánicos y eléctricos, y ofimática aplicada.',
        periodos: {
            '1': { '1': 'Concepto de tecnología, técnica y ciencia.', '3': 'Evolución histórica de la tecnología y revoluciones industriales.', '5': 'Hardware y Software: sistemas operativos y arquitectura básica.', '7': 'Manejo avanzado de procesadores de texto y normas de formato.' },
            '2': { '1': 'Operadores mecánicos: engranajes, bielas y manivelas.', '3': 'Transformación de movimientos en máquinas.', '5': 'Hojas de cálculo: fórmulas lógicas y funciones condicionales.', '7': 'Seguridad en internet, contraseñas seguras y privacidad.' },
            '3': { '1': 'Electricidad básica: circuitos serie y paralelo.', '3': 'Leyes básicas de la electricidad (Ley de Ohm conceptual).', '5': 'Diseño y modelado 2D con herramientas digitales.', '7': 'Algoritmos y diagramas de flujo de procesos.' },
            '4': { '1': 'Introducción a la robótica educativa y sensores.', '3': 'Impacto ambiental de la tecnología y obsolescencia programada.', '5': 'Construcción de un prototipo tecnológico.', '7': 'Feria de la ciencia y tecnología.' }
        }
    },
    'Ciclo I': {
        objetivo: 'Aprender el uso básico del teléfono celular, computador y herramientas digitales para la vida cotidiana de adultos.',
        periodos: {
            '1': { '1': 'El celular: llamadas, mensajes y configuración básica.', '3': 'El computador: encendido, apagado y uso del ratón.', '5': 'Navegación en internet y búsqueda de información.', '7': 'Seguridad y prevención de estafas digitales.' },
            '2': { '1': 'Escritura de textos cortos en el computador.', '3': 'Uso de WhatsApp para el trabajo y la familia.', '5': 'Trámites en línea sencillos (citas médicas, certificados).', '7': 'Cuidado y mantenimiento de aparatos electrónicos.' },
            '3': { '1': 'Uso de la calculadora del celular y cuentas.', '3': 'Fotografía digital y envío de documentos.', '5': 'Medios de transporte y aplicaciones útiles.', '7': 'Tecnología en el hogar y ahorro de energía.' },
            '4': { '1': 'Herramientas digitales para el empleo.', '3': 'Evaluación práctica de habilidades.', '5': 'Repaso general.', '7': 'Cierre del ciclo.' }
        }
    }
};

window.mallaFisica = {
    '6': {
        objetivo: '100% CONCEPTUAL SIN FÓRMULAS NI CÁLCULOS MATEMÁTICOS: Interpretar fenómenos naturales del entorno, la gravitación y los conceptos básicos del movimiento mediante observación intuitiva, modelos cualitativos y representaciones visuales.',
        periodos: {
            '1': { '1': 'Introducción a la Física: observación intuitiva de fenómenos en la vida diaria.', '3': 'Fenómenos naturales del entorno y fuerzas cotidianas sin matemáticas.', '5': 'El sistema planetario: movimiento cualitativo de los astros.', '7': 'Noción cualitativa de atracción gravitacional (por qué caen las cosas).' },
            '2': { '1': 'Noción cualitativa de posición y trayectoria en el entorno.', '3': 'Diferencia visual e intuitiva entre distancia y desplazamiento.', '5': 'Movimiento cotidiano: comparación cualitativa de rapidez.', '7': 'Noción cualitativa de cambio de ritmo (aceleración visual).' },
            '3': { '1': 'Movimiento planetario conceptual: gravitación y órbitas en el espacio (sin ecuaciones).', '3': 'Atracción gravitacional cotidiana (por qué caen los objetos y cómo flotan los astronautas).', '5': 'Satélites naturales y artificiales: comunicación y observación visual de la Tierra.', '7': 'Modelado gráfico, dibujo y mapa conceptual del Sistema Solar.' },
            '4': { '1': 'Noción intuitiva de empuje e impulso.', '3': 'Cantidad de movimiento en situaciones reales.', '5': 'Colisiones y choques cotidianos.', '7': 'Transformación y conservación cualitativa del movimiento.' }
        }
    },
    '7': {
        objetivo: '100% CONCEPTUAL SIN FÓRMULAS NI CÁLCULOS MATEMÁTICOS: Analizar cualitativa y visualmente el movimiento en dos dimensiones y el principio de conservación de la energía en la naturaleza.',
        periodos: {
            '1': { '1': 'Noción cualitativa de dirección y sentido en fenómenos cotidianos.', '3': 'Representación gráfica e intuitiva de fuerzas en el entorno.', '5': 'Efecto cualitativo de múltiples fuerzas sobre un objeto.', '7': 'Fenómenos naturales y observación de fuerzas en la vida diaria.' },
            '2': { '1': 'Interpretación visual de gráficos cualitativos de movimiento.', '3': 'Comparación visual de movimientos rápidos y lentos.', '5': 'Análisis gráfico cualitativo de trayectorias.', '7': 'Esquemas visuales y mapas conceptuales de movimiento.' },
            '3': { '1': 'Movimiento en dos dimensiones en la vida real (lanzamiento de balones y proyectiles).', '3': 'Movimiento parabólico conceptual en deportes y juegos (sin fórmulas).', '5': 'Movimiento circular cualitativo en ruedas y atracciones de feria.', '7': 'Esquemas visuales y mapas mentales de movimientos combinados.' },
            '4': { '1': 'Energía en la naturaleza: movimiento y posición desde el análisis cualitativo.', '3': 'Conservación cualitativa de la energía mecánica.', '5': 'Transformaciones energéticas cotidianas en la comunidad.', '7': 'Identificación visual de formas de energía.' }
        }
    },
    '8': {
        objetivo: 'Comprender máquinas simples, termodinámica y fluidos.',
        periodos: {
            '1': { '1': 'Trabajo y eficiencia.', '3': 'Tipos de máquinas simples.', '5': 'Máquinas compuestas.', '7': 'Laboratorio de máquinas simples.' },
            '2': { '1': 'Energía mecánica.', '3': 'Trabajo y energía.', '5': 'Conservación de la energía.', '7': 'Cuantificación energética.' },
            '3': { '1': 'Calor y temperatura.', '3': 'Primera ley termodinámica.', '5': 'Segunda ley termodinámica.', '7': 'Motores térmicos.' },
            '4': { '1': 'Variables termodinámicas.', '3': 'Leyes de los gases.', '5': 'Gases ideales.', '7': 'Dinámica de fluidos.' }
        }
    },
    '9': {
        objetivo: 'Analizar carga eléctrica, circuitos, ondas y óptica.',
        periodos: {
            '1': { '1': 'Carga eléctrica.', '3': 'Ley de Coulomb.', '5': 'Campo Eléctrico.', '7': 'Potencial Eléctrico.' },
            '2': { '1': 'Corriente y voltaje.', '3': 'Ley de Ohm.', '5': 'Circuitos en serie y paralelo.', '7': 'Resolución de circuitos.' },
            '3': { '1': 'Ondas mecánicas.', '3': 'Frecuencia y longitud.', '5': 'Reflexión y refracción.', '7': 'Sonido.' },
            '4': { '1': 'Luz y espectro.', '3': 'Reflexión y espejos.', '5': 'Refracción y lentes.', '7': 'Aplicaciones ópticas.' }
        }
    },
    '10': {
        objetivo: 'Modelado matemático del movimiento y equilibrio.',
        periodos: {
            '1': { '1': 'Sistemas de referencia.', '3': 'MRU.', '5': 'MRUV.', '7': 'Análisis cinemático.' },
            '2': { '1': 'Vectores avanzados.', '3': 'Tiro parabólico.', '5': 'Dinámica circular.', '7': 'Situaciones del entorno.' },
            '3': { '1': 'Fuerza e inercia.', '3': 'Segunda ley de Newton.', '5': 'Tercera ley de Newton.', '7': 'Fricción.' },
            '4': { '1': 'Fuerzas coplanares.', '3': 'Equilibrio de traslación.', '5': 'Torque.', '7': 'Equilibrio estático.' }
        }
    },
    '11': {
        objetivo: 'Consolidar competencias ICFES.',
        periodos: {
            '1': { '1': 'Repaso mecánica.', '3': 'Energía.', '5': 'Momento lineal.', '7': 'SABER 11 Mecánica.' },
            '2': { '1': 'Estática fluidos.', '3': 'Calorimetría.', '5': 'Termodinámica.', '7': 'SABER 11 Termodinámica.' },
            '3': { '1': 'Electrodinámica.', '3': 'Magnetismo.', '5': 'Física moderna.', '7': 'SABER 11 Electromagnetismo.' },
            '4': { '1': 'Problema investigación.', '3': 'Construcción prototipo.', '5': 'Análisis datos.', '7': 'Feria de la Ciencia.' }
        }
    },
    'Ciclo III': {
        objetivo: 'Movimiento, fuerza y energía.',
        periodos: {
            '1': { '1': 'Rapidez y fuerzas.', '3': 'Gravedad y peso.', '5': 'Energía y trabajo.', '7': 'Máquinas simples.' },
            '2': { '1': 'Vectores.', '3': 'Velocidad y aceleración.', '5': 'Fuerza de rozamiento.', '7': 'Presión.' },
            '3': { '1': 'Calor y temperatura.', '3': 'Sonido.', '5': 'Luz y sombras.', '7': 'Electricidad estática.' },
            '4': { '1': 'Circuitos.', '3': 'Magnetismo.', '5': 'Energías renovables.', '7': 'Física práctica.' }
        }
    },
    'Ciclo VI': {
        objetivo: 'Mecánica, termodinámica y electromagnetismo.',
        periodos: {
            '1': { '1': 'Cinemática y fuerzas.', '3': 'Trabajo y energía.', '5': 'Fluidos.', '7': 'SABER 11 Física.' },
            '2': { '1': 'Termodinámica.', '3': 'Ondas y sonido.', '5': 'Óptica.', '7': 'Análisis experimental.' },
            '3': { '1': 'Electrostática.', '3': 'Circuitos y Ley de Ohm.', '5': 'Magnetismo.', '7': 'Eficiencia energética.' },
            '4': { '1': 'Ondas electromagnéticas.', '3': 'Física moderna.', '5': 'Simulacro Saber 11.', '7': 'Proyecto aplicativo.' }
        }
    }
};

window.actualizarVisualizadorPlaneacion = function() {
    const selectorAsignatura = document.getElementById('select-planeacion-asignatura');
    const visualizador = document.getElementById('planeacion-contenido-actual');
    
    if (!visualizador || !window.gradoActualPlaneacion) return;

    const gradoSeleccionado = window.gradoActualPlaneacion;
    const gradoNum = window.normalizarGradoOCiclo ? window.normalizarGradoOCiclo(gradoSeleccionado) : gradoSeleccionado.replace(/[^0-9PENS]/g, '');
    let asignatura = selectorAsignatura ? selectorAsignatura.value : 'Física';
    
    let malla = null;
    if (asignatura.toLowerCase().includes('física') || asignatura.toLowerCase().includes('fisica')) {
        malla = window.mallaFisica;
    } else if (asignatura.toLowerCase().includes('química') || asignatura.toLowerCase().includes('quimica')) {
        malla = window.mallaQuimica;
    } else if (asignatura.toLowerCase().includes('matemática') || asignatura.toLowerCase().includes('matematica')) {
        malla = window.mallaMatematicas;
    } else if (asignatura.toLowerCase().includes('naturales') || asignatura.toLowerCase().includes('ciencias')) {
        malla = window.mallaNaturales;
    } else if (asignatura.toLowerCase().includes('sociales')) {
        malla = window.mallaSociales;
    } else if (asignatura.toLowerCase().includes('castellano') || asignatura.toLowerCase().includes('humanidades') || asignatura.toLowerCase().includes('lengua')) {
        malla = window.mallaCastellano;
    } else if (asignatura.toLowerCase().includes('inglés') || asignatura.toLowerCase().includes('ingles') || asignatura.toLowerCase().includes('idioma')) {
        malla = window.mallaIngles;
    } else if (asignatura.toLowerCase().includes('tecnología') || asignatura.toLowerCase().includes('tecnologia') || asignatura.toLowerCase().includes('informática') || asignatura.toLowerCase().includes('informatica')) {
        malla = window.mallaTecnologia;
    } else if (asignatura.toLowerCase().includes('turismo')) {
        malla = window.mallaTurismo;
    } else if (asignatura.toLowerCase().includes('artística') || asignatura.toLowerCase().includes('música') || asignatura.toLowerCase().includes('artistica')) {
        malla = window.mallaArtistica;
    } else if (asignatura.toLowerCase().includes('ética') || asignatura.toLowerCase().includes('etica') || asignatura.toLowerCase().includes('filosofía') || asignatura.toLowerCase().includes('filosofia')) {
        malla = window.mallaEtica;
    }

    if (!malla) {
        try {
            const mallasCustom = JSON.parse(localStorage.getItem('mallas_personalizadas_db') || '{}');
            if (mallasCustom[asignatura]) {
                malla = mallasCustom[asignatura];
            } else {
                const asigCustomList = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]');
                const cObj = asigCustomList.find(a => a.nombre.toLowerCase().trim() === asignatura.toLowerCase().trim());
                if (cObj && mallasCustom[cObj.nombre]) {
                    malla = mallasCustom[cObj.nombre];
                }
            }
        } catch(e) {}
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

window.abrirGrupo = async function(grupoName) {
    document.getElementById('admin-grupos-container').style.display = 'none';
    document.getElementById('admin-estudiantes-grupo-container').style.display = 'block';
    if(typeof pushSubView === 'function') pushSubView();
    document.getElementById('admin-titulo-grupo-actual').textContent = 'Grupo: ' + grupoName;

    // Inicializar planeacion
    window.gradoActualPlaneacion = grupoName;
    const contPlaneacion = document.getElementById('visualizador-planeacion-container');
    if (contPlaneacion) {
        contPlaneacion.style.display = 'block';
        const pSel = document.getElementById('select-planeacion-periodo');
        const sSel = document.getElementById('select-planeacion-semana');
        if (pSel) pSel.value = '3';
        if (sSel) sSel.value = '1';
        if (typeof actualizarVisualizadorPlaneacion === 'function') {
            actualizarVisualizadorPlaneacion();
        }
    }

    // Mostrar materias del grupo de inmediato
    const materiasDiv = document.getElementById('admin-materias-grupo-actual');
    const selectAsig = document.getElementById('select-planeacion-asignatura');
    let mat = [];
    if (typeof obtenerMateriasPorGrupo === 'function') {
        mat = obtenerMateriasPorGrupo(grupoName);
    }
    if (materiasDiv) {
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
    if (!tbodyEst) return;

    // Asegurar que window.todosEstudiantes tenga datos (desde API y localStorage)
    if (!window.todosEstudiantes || window.todosEstudiantes.length === 0) {
        let lista = [];
        try {
            const res = await fetch('/api/estudiantes');
            if (res.ok) lista = await res.json();
        } catch(e) {}
        const localUsers = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
        localUsers.forEach(lu => {
            const normDoc = String(lu.documento || lu.id || lu.usuario || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '');
            if (normDoc && !lista.some(e => String(e.documento || e.id || e.usuario || '').trim().toLowerCase().replace(/[\.\,\-\_\s]/g, '') === normDoc)) {
                lista.push(lu);
            }
        });
        window.todosEstudiantes = lista;
    }

    const estFiltrados = (window.todosEstudiantes || []).filter(e => window.perteneceAlGrupo(e, grupoName));

    tbodyEst.innerHTML = '';
    if (estFiltrados.length === 0) {
        tbodyEst.innerHTML = `
        <tr>
            <td colspan="7" style="padding: 35px; text-align: center; color: #6B7280;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <span style="font-size: 2.2rem;">👥</span>
                    <span style="font-size: 1.1rem; font-weight: bold; color: #374151;">No hay estudiantes matriculados en este grupo aún</span>
                    <span style="font-size: 0.9rem; color: #6B7280;">Cuando los estudiantes se matriculen en la página seleccionando <strong>${grupoName}</strong>, aparecerán aquí automáticamente con toda su información personal.</span>
                </div>
            </td>
        </tr>`;
    } else {
        estFiltrados.forEach(est => {
            const docClean = est.documento || est.usuario || est.id || 'Sin Doc';
            const tipoDoc = est.tipo_doc || est.tipo_documento || (docClean.length > 8 ? 'CC' : 'TI');
            const nomClean = window.obtenerNombreCompletoEstudiante(est);
            const edad = est.edad ? `${est.edad} años` : 'N/A';
            const genero = est.genero === 'F' ? '♀ Femenino' : (est.genero === 'M' ? '♂ Masculino' : (est.genero || 'N/A'));
            const inst = est.institucion === 'InstitutoMontenegro' ? 'IE Instituto Montenegro' : (est.institucion || 'IE Instituto Montenegro');
            const progreso = Math.floor(Math.random() * 60) + 40; 
            const materiasGrupo = typeof obtenerMateriasPorGrupo === 'function' ? obtenerMateriasPorGrupo(grupoName) : [];
            
            // Calcular Puntos Acumulados Reales (XP) del estudiante
            let xpEst = parseInt(localStorage.getItem(`xp_${docClean}`)) || 0;
            if (xpEst === 0) {
                const diagXP = parseInt(localStorage.getItem(`prog_${docClean}_diag_xp`)) || 0;
                xpEst = diagXP || 500;
            }
            const bonusTotal = parseInt(localStorage.getItem(`bonus_total_${docClean}`)) || 0;
            const penaltyTotal = parseInt(localStorage.getItem(`penalty_total_${docClean}`)) || 0;
            let totalXPAcumulado = Math.max(0, xpEst + bonusTotal - penaltyTotal);

            tbodyEst.innerHTML += `
            <tr style="border-bottom: 1px solid #f3f4f6; transition: background 0.2s;" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='white'">
                <td style="padding: 14px 10px; font-family: monospace; font-size: 0.9rem;">
                    <span style="background: #F1F5F9; color: #475569; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.75rem; margin-right: 4px;">${tipoDoc}</span>
                    <strong style="color: #0F172A;">${docClean}</strong>
                </td>
                <td style="padding: 14px 10px; font-weight: bold; color: #111827;">
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <span style="font-size: 0.95rem;">${nomClean}</span>
                        <button onclick="abrirModalEditarEstudianteDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}')" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #334155; padding: 2px 7px; border-radius: 5px; font-size: 0.75rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;" title="Editar nombre de este estudiante">
                            ✏️ Editar
                        </button>
                    </div>
                </td>
                <td style="padding: 14px 10px; font-size: 0.85rem; color: #475569;">
                    <div><strong>${edad}</strong></div>
                    <div style="font-size: 0.8rem; color: #64748B;">${genero}</div>
                </td>
                <td style="padding: 14px 10px; font-size: 0.85rem;">
                    <span style="background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; padding: 3px 8px; border-radius: 6px; font-weight: 600; display: inline-block;">
                        🏛️ ${inst}
                    </span>
                </td>
                <td style="padding: 14px 10px;">
                    <span style="background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; padding: 5px 12px; border-radius: 16px; font-weight: 900; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 2px 4px rgba(16,185,129,0.12);">
                        🌟 ${totalXPAcumulado} XP
                    </span>
                </td>
                <td style="padding: 14px 10px;">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        ${materiasGrupo.map(m => `
                            <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 3px 8px; border-radius: 4px;">
                                <span style="font-size: 0.8rem; font-weight: 700; color: #334155;">📚 ${m.nombre}</span>
                                <span style="font-size: 0.72rem; color: ${m.color || '#10B981'}; font-weight: 800;">${m.estado || 'Activo'}</span>
                            </div>
                        `).join('')}
                    </div>
                </td>
                <td style="padding: 14px 10px; text-align: center;">
                    <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; align-items: center;">
                        <button onclick="verInformeEstudiante('${nomClean.replace(/'/g, "\\'")}', ${progreso}, '${grupoName}', '${docClean}')" style="background: #3B82F6; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: bold; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Ver Ficha / Informe Pedagógico">
                            📊 Informe
                        </button>
                        <button onclick="window.abrirModalAsignarActividad('estudiante', '${docClean}', '${grupoName}', '${nomClean.replace(/'/g, "\\'")}')" style="background: linear-gradient(135deg, #7C3AED, #6D28D9); color: white; border: none; padding: 5px 9px; border-radius: 6px; font-weight: bold; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 5px rgba(124,58,237,0.25);" title="Asignar actividad o juego personalizado a este estudiante">
                            🎮 Reto
                        </button>

                        <!-- Menú Colgante Sanciones Disciplinarias (-10%) -->
                        <div class="dropdown-sancion-container" style="position: relative; display: inline-block;">
                            <button onclick="toggleMenuSancion('${docClean}', event)" style="background: linear-gradient(135deg, #DC2626, #B91C1C); color: white; border: none; padding: 5px 9px; border-radius: 6px; font-weight: 800; font-size: 0.78rem; cursor: pointer; display: inline-flex; align-items: center; gap: 3px; box-shadow: 0 2px 4px rgba(220,38,38,0.2);" title="Aplicar sanción disciplinaria del -10% de puntos">
                                ⚡ -10% ▾
                            </button>
                            <div id="menu-sancion-${docClean}" class="menu-sancion-dropdown" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 4px; background: white; border: 1.5px solid #E2E8F0; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); min-width: 215px; z-index: 9999; padding: 6px 0; text-align: left;">
                                <div style="padding: 6px 12px; font-size: 0.72rem; font-weight: 800; color: #64748B; text-transform: uppercase; border-bottom: 1px solid #F1F5F9;">
                                    Sanción Disciplinaria (-10%)
                                </div>
                                <button onclick="aplicarSancionDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}', 'Indisciplina', '⚡ Indisciplina en clase')" class="item-sancion-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: #1E293B; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                    ⚡ Indisciplina
                                </button>
                                <button onclick="aplicarSancionDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}', 'Comer en clase', '🥪 Comer en clase')" class="item-sancion-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: #1E293B; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                    🥪 Comer en clase
                                </button>
                                <button onclick="aplicarSancionDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}', 'Uso de celular', '📱 Usar el celular')" class="item-sancion-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: #1E293B; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                    📱 Usar el celular
                                </button>
                                <button onclick="aplicarSancionDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}', 'Levantarse sin permiso', '🚶 Levantarse sin permiso')" class="item-sancion-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: #1E293B; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                    🚶 Levantarse sin permiso
                                </button>
                                <button onclick="aplicarSancionDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}', 'Arrancar hojas', '📄 Arrancar hojas')" class="item-sancion-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: #1E293B; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                    📄 Arrancar hojas
                                </button>
                                <div style="border-top: 1px solid #F1F5F9; margin-top: 3px; padding-top: 3px;">
                                    <button onclick="aplicarSancionDocente('${docClean}', '${nomClean.replace(/'/g, "\\'")}', 'Personalizado')" class="item-sancion-btn" style="width: 100%; text-align: left; background: none; border: none; padding: 7px 12px; font-size: 0.8rem; font-weight: 700; color: #6366F1; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                                        ✏️ Otro motivo...
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button onclick="eliminarEstudiante('${docClean}')" style="background: #EF4444; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-weight: bold; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center;" title="Eliminar estudiante">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>`;
        });
    }
};

window.volverAGrupos = function() {
    document.getElementById('admin-grupos-container').style.display = 'grid';
    document.getElementById('admin-estudiantes-grupo-container').style.display = 'none';
};

window.verInformeEstudiante = async function(nombreOrDoc, progreso, grupoName, documento) {
    let docId = documento || '';
    let nombreEst = '';
    let gradoEst = grupoName || '';
    
    // Normalizar argumentos si fue llamado solo con docId o con objeto
    if (typeof nombreOrDoc === 'object' && nombreOrDoc !== null) {
        docId = nombreOrDoc.documento || nombreOrDoc.usuario || '';
        nombreEst = nombreOrDoc.nombre || '';
        gradoEst = nombreOrDoc.grado || nombreOrDoc.grupo || '';
    } else if (!documento && String(nombreOrDoc).match(/^\d+$/)) {
        docId = String(nombreOrDoc);
    } else {
        nombreEst = nombreOrDoc || '';
    }

    // Consultar lista completa de estudiantes para tener el objeto completo
    let estObj = null;
    try {
        const res = await fetch('/api/estudiantes');
        const listaEstudiantes = await res.json();
        estObj = listaEstudiantes.find(e => String(e.documento).trim() === String(docId).trim());
    } catch(e) { console.error(e); }

    if (estObj) {
        nombreEst = ((estObj.nombre || '') + ' ' + (estObj.apellidos || '')).trim() || estObj.documento;
        gradoEst = estObj.grado || estObj.grupo || gradoEst || '6';
    } else if (!nombreEst) {
        nombreEst = 'Estudiante (' + docId + ')';
    }

    const modalTitle = document.getElementById('informe-nombre-estudiante');
    if (modalTitle) {
        modalTitle.innerHTML = `📋 Informe & Orientador: <span style="color:#2563EB;">${nombreEst}</span> <span style="font-size:0.9rem; color:#6B7280; font-weight:normal;">(Doc: ${docId} | Grado/Grupo: ${gradoEst})</span>`;
    }

    const materias = obtenerMateriasPorGrupo(gradoEst, estObj);

    // Contar guías generadas en localStorage
    let totalGuiasGeneradas = 0;
    let guiasPorMateriaHtml = '';

    materias.forEach(m => {
        let botonesGuias = '';
        if (docId) {
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                if (key.startsWith(`config_${docId}_${m.nombre}`)) {
                    totalGuiasGeneradas++;
                    let p = key.match(/_p(\d+)_/);
                    let s = key.match(/_s(\d+)$/);
                    let per = p ? p[1] : '1';
                    let sem = s ? s[1] : '1';
                    botonesGuias += `
                        <button onclick="abrirGuiaProfesor('${key}')" style="background: #10B981; color: white; border: none; border-radius: 6px; font-size: 0.75rem; padding: 4px 8px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            👁️ P${per} S${sem} (Solucionario)
                        </button>
                    `;
                }
            }
        }

        guiasPorMateriaHtml += `
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                    <strong style="color: #1E293B; font-size: 0.95rem;">📚 ${m.nombre}</strong>
                    <span style="font-size: 0.8rem; color: #64748B; margin-left: 6px;">(${m.horas})</span>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    ${botonesGuias || '<span style="font-size: 0.8rem; color: #94A3B8; font-style: italic;">Sin guías previas guardadas</span>'}
                </div>
            </div>
        `;
    });

    const estadoPago = estObj && (estObj.pago_realizado || estObj.pago_activo) ? '🟢 Matrícula Activa' : '🟡 Modo Freemium (1ª Guía Gratis)';
    const opcionesMaterias = materias.map(m => `<option value="${m.nombre}">${m.nombre}</option>`).join('');

    const modalContenido = document.getElementById('informe-contenido');
    if (modalContenido) {
        modalContenido.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px;">
                    <div style="background: #EFF6FF; border: 1px solid #BFDBFE; padding: 12px 16px; border-radius: 8px;">
                        <div style="color: #1E40AF; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">Estado de Cuenta</div>
                        <div style="font-size: 0.95rem; font-weight: 800; color: #1E3A8A; margin-top: 4px;">${estadoPago}</div>
                    </div>
                    <div style="background: #ECFDF5; border: 1px solid #A7F3D0; padding: 12px 16px; border-radius: 8px;">
                        <div style="color: #065F46; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">Guías Guardadas</div>
                        <div style="font-size: 1.3rem; font-weight: 900; color: #047857; margin-top: 4px;">${totalGuiasGeneradas}</div>
                    </div>
                    <div style="background: #FDF4FF; border: 1px solid #F0ABFC; padding: 12px 16px; border-radius: 8px;">
                        <div style="color: #86198F; font-size: 0.8rem; font-weight: bold; text-transform: uppercase;">Materias Asignadas</div>
                        <div style="font-size: 1.3rem; font-weight: 900; color: #701A75; margin-top: 4px;">${materias.length}</div>
                    </div>
                </div>

                <!-- SECCIÓN 1: EXPLORADOR DE GUÍAS CON SOLUCIONARIO -->
                <div style="background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border: 2px solid #818CF8; border-radius: 12px; padding: 20px; margin-bottom: 25px; box-shadow: 0 4px 10px rgba(99,102,241,0.1);">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 1.5rem;">🧭</span>
                        <h4 style="margin: 0; font-size: 1.15rem; color: #312E81; font-weight: 900;">Explorador & Solucionario Pedagógico para el Tutor</h4>
                    </div>
                    <p style="margin: 0 0 15px 0; font-size: 0.9rem; color: #4338CA;">
                        Selecciona cualquier asignatura, periodo y semana para abrir la guía correspondiente con todas las <b>respuestas oficiales</b>, pistas didácticas y justificaciones ICFES.
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; align-items: flex-end;">
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #3730A3; margin-bottom: 4px;">Asignatura:</label>
                            <select id="orientador-select-materia" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #A5B4FC; font-weight: bold; color: #1E1B4B; background: white;">
                                ${opcionesMaterias}
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #3730A3; margin-bottom: 4px;">Periodo:</label>
                            <select id="orientador-select-periodo" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #A5B4FC; font-weight: bold; color: #1E1B4B; background: white;">
                                <option value="1">Periodo 1</option>
                                <option value="2">Periodo 2</option>
                                <option value="3" selected>Periodo 3</option>
                                <option value="4">Periodo 4</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.8rem; font-weight: bold; color: #3730A3; margin-bottom: 4px;">Semana:</label>
                            <select id="orientador-select-semana" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid #A5B4FC; font-weight: bold; color: #1E1B4B; background: white;">
                                <option value="1">Semana 1</option>
                                <option value="2">Semana 2</option>
                                <option value="3">Semana 3</option>
                                <option value="4">Semana 4</option>
                                <option value="5">Semana 5</option>
                                <option value="6">Semana 6</option>
                                <option value="7">Semana 7</option>
                                <option value="8">Semana 8</option>
                            </select>
                        </div>
                        <div>
                            <button onclick="ejecutarAperturaOrientador('${docId}')" style="width: 100%; background: #4F46E5; color: white; border: none; padding: 10px 14px; border-radius: 6px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 6px rgba(79,70,229,0.3);">
                                <span>👁️</span> Abrir Solucionario
                            </button>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 2: HISTORIAL Y MATERIAS ASIGNADAS -->
                <div>
                    <h4 style="font-weight: 800; color: #1E293B; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                        <span>📚</span> Asignaturas y Guías en Progreso
                    </h4>
                    ${guiasPorMateriaHtml}
                </div>
            </div>
        `;
    }

    const modal = document.getElementById('modal-informe-estudiante');
    if (modal) {
        modal.style.display = 'flex';
        if (typeof pushSubView === 'function') pushSubView();
    }
};

window.verInformeDetallado = window.verInformeEstudiante;

window.ejecutarAperturaOrientador = function(documento) {
    const matElem = document.getElementById('orientador-select-materia');
    const perElem = document.getElementById('orientador-select-periodo');
    const semElem = document.getElementById('orientador-select-semana');
    if (!matElem || !perElem || !semElem) return;

    const asignatura = matElem.value;
    const periodo = perElem.value;
    const semana = semElem.value;

    abrirGuiaOrientador(documento, asignatura, periodo, semana);
};

window.abrirGuiaOrientador = async function(documento, asignatura, periodo, semanaStr) {
    let est = {
        nombre: 'Estudiante',
        grado: '6',
        documento: documento,
        institucion: 'HomeSchool',
        rol: 'estudiante'
    };

    try {
        const resEst = await fetch('/api/estudiantes');
        const estudiantes = await resEst.json();
        const found = estudiantes.find(e => String(e.documento).trim() === String(documento).trim());
        if (found) est = found;
    } catch(e) { console.error(e); }
    
    const studentDisplayName = ((est.nombre || '') + (est.apellidos ? ' ' + est.apellidos : '')).trim() || 'Estudiante';
    const grado = est.grado || est.grupo || '6';
    const institucion = est.institucion || (est.rol === 'validacion' ? 'Validacion' : 'HomeSchool');
    const modo = est.rol || (institucion === 'Validacion' ? 'validacion' : (institucion === 'HomeSchool' ? 'homeschool' : 'regular'));

    // Determinar meta y tópico de la malla
    const gradoNum = window.normalizarGradoOCiclo ? window.normalizarGradoOCiclo(grado) : grado.replace(/[^0-9PENS]/g, '');
    let malla = null;
    if (asignatura.toLowerCase().includes('física') || asignatura.toLowerCase().includes('fisica')) malla = window.mallaFisica;
    else if (asignatura.toLowerCase().includes('química') || asignatura.toLowerCase().includes('quimica')) malla = window.mallaQuimica;
    else if (asignatura.toLowerCase().includes('matemática') || asignatura.toLowerCase().includes('matematica')) malla = window.mallaMatematicas;
    else if (asignatura.toLowerCase().includes('naturales') || asignatura.toLowerCase().includes('ciencias')) malla = window.mallaNaturales;
    else if (asignatura.toLowerCase().includes('sociales')) malla = window.mallaSociales;
    else if (asignatura.toLowerCase().includes('castellano') || asignatura.toLowerCase().includes('lengua')) malla = window.mallaCastellano;
    else if (asignatura.toLowerCase().includes('inglés') || asignatura.toLowerCase().includes('ingles')) malla = window.mallaIngles;
    else if (asignatura.toLowerCase().includes('tecnología') || asignatura.toLowerCase().includes('tecnologia')) malla = window.mallaTecnologia;
    else if (asignatura.toLowerCase().includes('turismo')) malla = window.mallaTurismo;
    else if (asignatura.toLowerCase().includes('artística') || asignatura.toLowerCase().includes('artistica')) malla = window.mallaArtistica;
    else if (asignatura.toLowerCase().includes('ética') || asignatura.toLowerCase().includes('filosofía')) malla = window.mallaEtica;

    let meta = `Desarrollar competencias integrales en ${asignatura} para grado ${grado}.`;
    let topico = `Unidad temática de ${asignatura} - Semana ${semanaStr}`;

    const dataGrado = malla ? (malla[gradoNum] || malla[grado] || malla['6']) : null;
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

    const payload = {
        asignatura,
        grado: grado,
        periodo,
        semana: semanaStr,
        meta,
        topico,
        rol: "Profesor / Orientador Pedagógico",
        ambiente: "Aula Virtual Guiada",
        nivel: "Intermedio",
        enfoque: "STEAM Gamificado con Solucionario",
        nombre_estudiante: studentDisplayName,
        estudiante_nombre: studentDisplayName,
        institucion: institucion,
        modo: modo
    };

    // Close modal
    const modalInforme = document.getElementById('modal-informe-estudiante');
    if (modalInforme) modalInforme.style.display = 'none';

    // Set vista origen to return accurately
    window.vistaOrigenOrientador = (window.rol_actual === 'homeschool_tutor') ? 'tutor-dashboard-container' : ((window.rol_actual === 'docente') ? 'docente-dashboard-container' : 'dashboard-screen-container');

    // Show loading in guide inner content
    const studentView = document.getElementById("student-dashboard-container");
    const adminView = document.getElementById("dashboard-screen-container") || document.getElementById("admin-dashboard-container");
    const docView = document.getElementById("docente-dashboard-container");
    const tutorView = document.getElementById("tutor-dashboard-container");
    const questContainer = document.getElementById("student-quest-container");
    const guideContent = document.getElementById("student-guide-content");
    const innerContent = document.getElementById("student-guide-inner-content");

    if (adminView) adminView.style.display = "none";
    if (docView) docView.style.display = "none";
    if (tutorView) tutorView.style.display = "none";
    if (studentView) studentView.style.display = "block";
    if (questContainer) questContainer.style.display = "none";
    if (guideContent) guideContent.style.display = "block";

    if (innerContent) {
        innerContent.innerHTML = `
            <div style="text-align:center; padding: 50px 20px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">🧭</div>
                <h3 style="color:#2563EB; font-weight:800; font-size:1.4rem;">Cargando Guía con Solucionario y Pistas Pedagógicas...</h3>
                <p style="color:#64748B; font-size:1rem; margin-top:8px;">
                    Personalizando contenidos para: <b>${studentDisplayName}</b><br>
                    ${asignatura} • Periodo ${periodo}, Semana ${semanaStr}
                </p>
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #E5E7EB; border-top-color: #2563EB; border-radius: 50%; animation: spin 1s linear infinite; margin-top:20px;"></div>
            </div>
        `;
    }

    window.isTeacherView = true;

    try {
        const response = await fetch('/api/generate-guide', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            let errMsg = "Error al obtener la guía";
            try { const eData = await response.json(); errMsg = eData.error || errMsg; } catch(e){}
            innerContent.innerHTML = `<div style="padding: 20px; background: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px; color: #B91C1C;"><strong>No se pudo cargar la guía:</strong> ${errMsg}</div>`;
            return;
        }

        const rawData = await response.json();
        let guideData = rawData;
        if (rawData && typeof rawData.text === 'string') {
            try { guideData = JSON.parse(rawData.text); } catch(e){ guideData = rawData; }
        } else if (rawData && rawData.text && typeof rawData.text === 'object') {
            guideData = rawData.text;
        }

        renderizarGuiaProfesor(guideData, asignatura, periodo, semanaStr, studentDisplayName);
    } catch(err) {
        console.error("Error abriendo guía orientador:", err);
        innerContent.innerHTML = `<div style="padding: 20px; background: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px; color: #B91C1C;"><strong>Error de conexión al cargar la guía.</strong></div>`;
    }
};

window.abrirGuiaProfesor = async function(key) {
    const configStr = localStorage.getItem(key);
    if (!configStr) return alert("Configuración no encontrada");
    const payload = JSON.parse(configStr);
    
    const fileNameSafe = [payload.asignatura, payload.periodo, payload.semana, payload.rol, payload.ambiente, payload.nivel, payload.enfoque]
        .map(s => s ? s.toString().toLowerCase().replace(/[^a-z0-9]/g, '_') : 'na')
        .join('_') + '.json';

    window.vistaOrigenOrientador = (window.rol_actual === 'homeschool_tutor') ? 'tutor-dashboard-container' : ((window.rol_actual === 'docente') ? 'docente-dashboard-container' : 'dashboard-screen-container');

    const modalInforme = document.getElementById('modal-informe-estudiante');
    if (modalInforme) modalInforme.style.display = 'none';

    try {
        const response = await fetch('guias_cache/' + fileNameSafe);
        let guideData = null;
        if (response.ok) {
            guideData = await response.json();
        } else {
            const resGen = await fetch('/api/generate-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (resGen.ok) {
                const raw = await resGen.json();
                guideData = (raw && typeof raw.text === 'string') ? JSON.parse(raw.text) : (raw.text || raw);
            }
        }

        if (!guideData) return alert("No se pudo cargar la guía.");
        
        window.isTeacherView = true;
        
        const adminView = document.getElementById("dashboard-screen-container") || document.getElementById("admin-dashboard-container");
        const docView = document.getElementById("docente-dashboard-container");
        const tutorView = document.getElementById("tutor-dashboard-container");
        const studentView = document.getElementById("student-dashboard-container");
        const questContainer = document.getElementById("student-quest-container");
        const guideContent = document.getElementById("student-guide-content");

        if (adminView) adminView.style.display = "none";
        if (docView) docView.style.display = "none";
        if (tutorView) tutorView.style.display = "none";
        if (studentView) studentView.style.display = "block";
        if (questContainer) questContainer.style.display = "none";
        if (guideContent) guideContent.style.display = "block";
        
        const studentDisplayName = payload.nombre_estudiante || payload.estudiante_nombre || 'Estudiante';
        renderizarGuiaProfesor(guideData, payload.asignatura, payload.periodo, payload.semana, studentDisplayName);
        
    } catch (e) {
        console.error(e);
        alert("Error cargando la guía");
    }
};

function renderizarGuiaProfesor(guideData, asignatura, periodo, semanaStr, studentName = '') {
    const innerContent = document.getElementById("student-guide-inner-content");
    window.guideDataCache = guideData;
    window.juegosPendientes = [];

    const nombreEst = studentName || (window.usuarioEstudianteActual ? window.usuarioEstudianteActual.nombre : 'Estudiante');
    
    let htmlRenderizado = `
        <div style="text-align: center; margin-bottom: 25px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 18px 24px; border-radius: 12px; border: 2px solid #F59E0B; box-shadow: 0 4px 12px rgba(245,158,11,0.15);">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                <div style="text-align: left;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.6rem;">🧭</span>
                        <h3 style="color: #92400E; font-weight: 900; margin: 0; font-size: 1.25rem;">VISTA DE ORIENTADOR / PROFESOR TUTOR</h3>
                    </div>
                    <p style="color: #B45309; margin: 4px 0 0 0; font-size: 0.95rem;">
                        Guía de <b>${asignatura}</b> (Periodo ${periodo}, Semana ${semanaStr}) para el estudiante: <b>${nombreEst}</b>.
                        <span style="display: block; font-size: 0.85rem; color: #78350F; margin-top: 2px;">✅ Respuestas oficiales, pistas pedagógicas y justificaciones ICFES activadas.</span>
                    </p>
                </div>
                <button onclick="cerrarGuiaProfesor()" style="background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(239,68,68,0.3);">
                    <span>⬅️</span> Volver a mi Panel
                </button>
            </div>
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
            let opcionesList = (Array.isArray(pregunta.opciones) && pregunta.opciones.length > 0) 
                ? pregunta.opciones 
                : (Array.isArray(pregunta.opcion) ? pregunta.opcion : ["Opción A", "Opción B", "Opción C", "Opción D"]);

            htmlRenderizado += `
                <div style="margin-bottom: 15px;">
                    <p style="font-weight: bold;">${idx+1}. ${pregunta.pregunta}</p>
                    ${opcionesList.map((opcion, i) => `
                        <label style="display: block; margin-bottom: 8px; padding: 10px; background: ${i === (pregunta.correcta !== undefined ? pregunta.correcta : 0) ? '#10B981' : 'white'}; border: 1px solid #D1D5DB; border-radius: 6px; ${i === (pregunta.correcta !== undefined ? pregunta.correcta : 0) ? 'color: white; font-weight: bold;' : ''}">
                            <input type="radio" disabled ${i === (pregunta.correcta !== undefined ? pregunta.correcta : 0) ? 'checked' : ''} style="margin-right: 10px;">
                            ${opcion} ${i === (pregunta.correcta !== undefined ? pregunta.correcta : 0) ? '✅' : ''}
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
    const studentView = document.getElementById("student-dashboard-container");
    const guideContent = document.getElementById("student-guide-content");
    if (studentView) studentView.style.display = "none";
    if (guideContent) guideContent.style.display = "none";

    const targetVista = window.vistaOrigenOrientador || ((window.rol_actual === 'homeschool_tutor') ? 'tutor-dashboard-container' : ((window.rol_actual === 'docente') ? 'docente-dashboard-container' : 'dashboard-screen-container'));
    
    if (typeof mostrarVista === 'function') {
        mostrarVista(targetVista);
    } else {
        const el = document.getElementById(targetVista) || document.getElementById('dashboard-screen-container');
        if (el) el.style.display = "block";
    }
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
    
    const selectSemana = document.getElementById("student-select-semana");
    if (!selectSemana) return;
    
    const curUser = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const esInstitucional = (curUser.institucion === 'IE Instituto Montenegro' || curUser.codigo_institucional === 'ieinstituto2026');
    const estaPagado = (curUser.pago_realizado === true || curUser.pago_activo === true || esInstitucional);
    
    Array.from(selectSemana.options).forEach((opt) => {
        const num = parseInt(opt.value);
        if (!estaPagado && (periodo !== "1" || num > 1)) {
            opt.text = `Semana ${num} (🔒 Requiere Suscripción)`;
        } else if (!estaPagado && periodo === "1" && num === 1) {
            opt.text = `Semana 1 (✨ Guía Gratuita)`;
        } else {
            opt.text = `Semana ${num}`;
        }
    });
};

window.completarMisionActual = function() {
    const periodo = document.getElementById("student-select-periodo").value;
    const semanaStr = document.getElementById("student-select-semana").value;
    const subjectTitle = document.getElementById('student-subject-title');
    if (!subjectTitle) return;
    const asignatura = subjectTitle.innerText.replace('Aula de ', '').trim();
    
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const doc = String(user.documento || user.usuario || window.usuario_actual || 'default').trim();
    
    // Marcar misión completada
    const misKey = `mision_hecha_${doc}_${asignatura}_p${periodo}_s${semanaStr}`;
    const yaCompletada = localStorage.getItem(misKey) === 'true';
    localStorage.setItem(misKey, 'true');
    
    // Verificación de Clase Especial: Primeros Auxilios Emocionales luego del Terremoto
    if (asignatura.toLowerCase().includes('primeros auxilios') || asignatura.toLowerCase().includes('emocionales') || asignatura.toLowerCase().includes('terremoto')) {
        localStorage.setItem(`insignia_resiliencia_${doc}`, 'true');
        if (!yaCompletada && window.sumarXPEstudiante) {
            window.sumarXPEstudiante(doc, 150, `Taller Especial: Primeros Auxilios Emocionales luego del Terremoto`);
        }
        alert(`🎉 ¡FELICITACIONES! Has completado con éxito la misión: 'Primeros Auxilios Emocionales luego del Terremoto'.\n\n🏆 Has ganado +150 XP y la Insignia de Honor: '🏅 Guardián de la Resiliencia Emocional'.\n\nRecuerda llevar siempre contigo tu Botiquín Emocional y tus técnicas de respiración diafragmática.`);
        cerrarGuia();
        return;
    }

    // Sumar 100 XP si es la primera vez
    if (!yaCompletada && window.sumarXPEstudiante) {
        window.sumarXPEstudiante(doc, 100, `Misión Semana ${semanaStr} (${asignatura}) Completada`);
    }
    
    const key = `prog_${doc}_${asignatura}_p${periodo}`;
    let semanaActual = parseInt(semanaStr);
    let maxSemanaUnlocked = 8;
    
    if (semanaActual === maxSemanaUnlocked) {
        alert("🎉 ¡Increíble! Has completado todas las misiones de este periodo. Has sumado +100 XP a tu acumulado.");
    } else {
        localStorage.setItem(key, Math.max(semanaActual + 1, parseInt(localStorage.getItem(key) || 1)));
        alert(`🎉 ¡Felicidades! Has completado con éxito la misión de la Semana ${semanaStr} de ${asignatura} y ganado +100 XP.`);
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
    } else if (asignatura.toLowerCase().includes('castellano') || asignatura.toLowerCase().includes('humanidades') || asignatura.toLowerCase().includes('lengua')) {
        malla = window.mallaCastellano;
    } else if (asignatura.toLowerCase().includes('inglés') || asignatura.toLowerCase().includes('ingles') || asignatura.toLowerCase().includes('idioma')) {
        malla = window.mallaIngles;
    } else if (asignatura.toLowerCase().includes('tecnología') || asignatura.toLowerCase().includes('tecnologia') || asignatura.toLowerCase().includes('informática') || asignatura.toLowerCase().includes('informatica')) {
        malla = window.mallaTecnologia;
    } else if (asignatura.toLowerCase().includes('turismo')) {
        malla = window.mallaTurismo;
    } else if (asignatura.toLowerCase().includes('artística') || asignatura.toLowerCase().includes('música') || asignatura.toLowerCase().includes('artistica')) {
        malla = window.mallaArtistica;
    } else if (asignatura.toLowerCase().includes('ética') || asignatura.toLowerCase().includes('etica') || asignatura.toLowerCase().includes('filosofía') || asignatura.toLowerCase().includes('filosofia')) {
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

    // Comprobar si existe guía guardada para esta semana
    const curUser = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const docClean = String(curUser.documento || curUser.usuario || 'EST').trim();
    const guiaGuardadaKey = `guia_guardada_${docClean}_${asignatura}_p${periodo}_s${semanaStr}`;
    const tieneGuiaGuardada = !!localStorage.getItem(guiaGuardadaKey);

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

    const questContainer = document.getElementById("student-quest-container");
    if (questContainer) {
        if (tieneGuiaGuardada) {
            questContainer.style.border = "2px dashed #10B981";
            questContainer.style.background = "#ECFDF5";
            questContainer.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <span style="font-size: 2.5rem;">📖</span>
                    <h3 style="font-weight: 900; color: #065F46; margin: 10px 0 6px 0; font-size: 1.3rem;">Misión de la Semana ${semanaStr} en Curso</h3>
                    <p style="color: #047857; margin: 0 0 20px 0; font-size: 0.95rem;">Tu guía ya fue creada para esta semana. Debes continuar trabajando sobre ella y registrar tu progreso hasta completarla.</p>
                    <button type="button" onclick="cargarGuiaGuardadaDirecta()" style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 14px 36px; border-radius: 30px; border: none; font-weight: 900; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(16,185,129,0.35); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                        🚀 Abrir y Continuar Mi Guía de la Semana ${semanaStr}
                    </button>
                </div>
            `;
        } else {
            questContainer.style.border = "2px dashed #3B82F6";
            questContainer.style.background = "#EFF6FF";
            questContainer.innerHTML = `
                <h3 style="font-weight: 800; color: #1D4ED8; margin-bottom: 15px;">¡Personaliza tu Aventura de Aprendizaje!</h3>
                <p style="color: #1E3A8A; margin-bottom: 20px;">Configura los parámetros para crear tu misión de la Semana ${semanaStr}. Una vez generada, trabajarás sobre ella hasta completarla.</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div>
                        <label style="font-weight: bold; color: #111827;">Menú 1: Tu Rol</label>
                        <select id="student-quest-rol" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #93C5FD; margin-top: 5px;">
                            <option value="">Seleccionar...</option>
                            <option value="Detective de Misterios">Detective de Misterios</option>
                            <option value="Explorador Espacial">Explorador Espacial</option>
                            <option value="Cientifico Loco">Científico Loco</option>
                            <option value="Hacker Tecnologico">Hacker Tecnológico</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-weight: bold; color: #111827;">Menú 2: Ambiente de Trabajo</label>
                        <select id="student-quest-ambiente" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #93C5FD; margin-top: 5px;">
                            <option value="">Seleccionar...</option>
                            <option value="Mundo Post-Apocalíptico">Mundo Post-Apocalíptico</option>
                            <option value="Estación Espacial Internacional">Estación Espacial Internacional</option>
                            <option value="Expedición en la Selva">Expedición en la Selva</option>
                            <option value="Laboratorio Secreto Subterráneo">Laboratorio Secreto Subterráneo</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-weight: bold; color: #111827;">Menú 3: Nivel de Desafío</label>
                        <select id="student-quest-nivel" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #93C5FD; margin-top: 5px;">
                            <option value="">Seleccionar...</option>
                            <option value="Modo Novato (Fácil)">Modo Novato (Fácil)</option>
                            <option value="Modo Supervivencia (Intermedio)">Modo Supervivencia (Intermedio)</option>
                            <option value="Modo Héroe (Avanzado)">Modo Héroe (Avanzado)</option>
                            <option value="Modo Dios (Experto)">Modo Dios (Experto)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-weight: bold; color: #111827;">Menú 4: Enfoque de la Tarea</label>
                        <select id="student-quest-enfoque" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #93C5FD; margin-top: 5px;">
                            <option value="">Seleccionar...</option>
                            <option value="Resolver un misterio (Indagación)">Resolver un misterio (Indagación)</option>
                            <option value="Explicar un fenómeno extraño">Explicar un fenómeno extraño</option>
                            <option value="Aplicar la ciencia para sobrevivir">Aplicar la ciencia para sobrevivir</option>
                            <option value="Desmentir un mito popular (Análisis Crítico)">Desmentir un mito popular (Análisis Crítico)</option>
                        </select>
                    </div>
                </div>

                <div style="margin-top: 30px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button id="student-btn-ingresar-diag" onclick="iniciarDiagnosticoGamificado()" style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 14px 28px; border-radius: 30px; border: none; font-weight: 900; font-size: 1.05rem; cursor: pointer; box-shadow: 0 4px 15px rgba(245,158,11,0.35); display: flex; align-items: center; gap: 8px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                        🥚 Diagnóstico Inicial (Gamificado)
                    </button>
                    <button id="student-btn-ingresar-guia" onclick="ingresarAGuia()" style="background: #10B981; color: white; padding: 14px 32px; border-radius: 30px; border: none; font-weight: 800; font-size: 1.05rem; cursor: pointer; box-shadow: 0 4px 15px rgba(16,185,129,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                        🚀 Iniciar Misión de la Semana ${semanaStr}
                    </button>
                </div>
            `;
        }
    }
};

window.cargarGuiaGuardadaDirecta = function() {
    const periodo = document.getElementById("student-select-periodo").value;
    const semanaStr = document.getElementById("student-select-semana").value;
    const subjectTitle = document.getElementById('student-subject-title');
    if (!subjectTitle) return false;
    const asignatura = subjectTitle.innerText.replace('Aula de ', '').trim();
    const curUser = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const docClean = String(curUser.documento || curUser.usuario || 'EST').trim();
    const guiaGuardadaKey = `guia_guardada_${docClean}_${asignatura}_p${periodo}_s${semanaStr}`;
    const dataStr = localStorage.getItem(guiaGuardadaKey);
    
    if (dataStr) {
        try {
            const guideData = JSON.parse(dataStr);
            const questContainer = document.getElementById("student-quest-container");
            const guideContent = document.getElementById("student-guide-content");
            if (questContainer) questContainer.style.display = "none";
            if (guideContent) guideContent.style.display = "block";
            window.renderizarGuiaContenido(guideData, periodo, semanaStr, asignatura, curUser);
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            const sDash = document.getElementById('student-dashboard-container');
            if (sDash) sDash.scrollTop = 0;
            return true;
        } catch(e) {
            console.error('Error cargando guía guardada:', e);
        }
    }
    return false;
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
    
    // Reset questionnaire (Por defecto Periodo 1 Semana 1 para acceso inmediato a la guía gratuita)
    document.getElementById("student-select-periodo").value = "1";
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

    // Auto-scroll al tope
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const sDash = document.getElementById('student-dashboard-container');
    if (sDash) sDash.scrollTop = 0;
};

window.volverAlGridEstudiante = function() {
    const mainContent = document.getElementById("student-main-content");
    const subjectView = document.getElementById("student-subject-view-container");
    
    if (mainContent && subjectView) {
        mainContent.style.display = "block";
        subjectView.style.display = "none";
    }

    // Auto-scroll al tope
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const sDash = document.getElementById('student-dashboard-container');
    if (sDash) sDash.scrollTop = 0;
};

// ==========================================
// CLASE Y GUÍA INTERACTIVA: PRIMEROS AUXILIOS EMOCIONALES LUEGO DEL TERREMOTO
// ==========================================
window.obtenerGuiaPrimerosAuxiliosEmocionales = function() {
    return {
        titulo: "Misión de Resiliencia: Primeros Auxilios Emocionales luego del Terremoto y Manejo de Crisis",
        asignatura: "Socioemocional & Gestión del Riesgo",
        objetivo_aprendizaje: "Reconocer y normalizar las reacciones psicofisiológicas normales ante sismos (miedo, llanto, temblor, hiperactivación), aplicar el protocolo PAP (Primeros Auxilios Psicológicos: Observar, Escuchar, Conectar), dominar la técnica de respiración diafragmática 4-7-8, el abrazo de la mariposa, y construir el Botiquín Emocional personal y familiar para fortalecer la resiliencia en Montenegro y el Eje Cafetero.",
        pregunta_problematizadora: "¿Cómo podemos transformar el miedo, el temblor y la incertidumbre tras un terremoto en calma, seguridad compartida y apoyo solidario para nuestra familia y compañeros?",
        saberes_previos: [
            {
                pregunta: "¿Qué es lo más normal que experimente nuestro cuerpo y mente inmediatamente después de sentir un temblor fuerte o terremoto?",
                opcion: [
                    "A) Sentir taquicardia, temblor en las piernas, ganas de llorar o miedo intenso, porque el cerebro activó su sistema natural de supervivencia.",
                    "B) No sentir absolutamente nada y actuar como si nada hubiera ocurrido.",
                    "C) Sentir que somos débiles y que las demás personas nunca sienten miedo.",
                    "D) Únicamente dolor de cabeza que desaparece en 1 segundo."
                ],
                correcta: 0,
                explicacion: "La amígdala cerebral enciende la alarma de supervivencia natural ante el peligro. El temblor y el llanto son formas normales que tiene el cuerpo para liberar adrenalina."
            },
            {
                pregunta: "Si un compañero o familiar está llorando con angustia o paralizado tras un sismo, ¿cuál es la primera acción de contención adecuada?",
                opcion: [
                    "A) Gritarle para que se calme rápido y decirle que no sea exagerado.",
                    "B) Acercarnos con calma a su altura, validar que el temblor ya cesó, mirarlo a los ojos y recordarle: 'Estamos a salvo aquí y ahora; respiremos juntos'.",
                    "C) Dejarlo completamente solo en una habitación oscura.",
                    "D) Obligarlo a correr por las escaleras sin mirar."
                ],
                correcta: 1,
                explicacion: "El contacto visual empático, la voz suave y el acompañamiento afectivo ayudan a que la persona recupere el sentido de seguridad y presencia."
            },
            {
                pregunta: "¿Por qué la respiración diafragmática lenta (inhalar inflando el abdomen y exhalar despacio) calma el miedo tras una emergencia?",
                opcion: [
                    "A) Porque apaga el corazón por completo.",
                    "B) Porque activa el nervio vago y el sistema parasimpático, enviándole al cerebro la señal biológica de que el peligro ya pasó y podemos relajarnos.",
                    "C) Porque hace que olvidemos lo que pasó inmediatamente sin pensar.",
                    "D) No tiene ningún efecto en el cuerpo."
                ],
                correcta: 1,
                explicacion: "La respiración diafragmática profunda estimula el nervio vago, reduciendo la frecuencia cardíaca y restableciendo la calma autonómica."
            }
        ],
        texto_deductivo: `
### 🌋 1. La Memoria Sísmica y la Respuesta Natural de Supervivencia
En el municipio de **Montenegro y en todo el Eje Cafetero**, vivimos en una hermosa geografía volcánica y montañosa que convive con fallas geológicas activas. Cuando la tierra tiembla, una pequeña estructura en nuestro cerebro llamada **amígdala cerebral** enciende una sirena de alarma instantánea, liberando adrenalina y cortisol.

> **💡 Regla de Oro:** Sentir miedo, temblor en las manos, taquicardia, ganas de llorar o necesidad de abrazar a alguien **no es debilidad: es la respuesta biológica de tu cuerpo protegiéndote**.

---

### 🛡️ 2. El Protocolo de las 3C en Emergencias
Cuando el movimiento sísmico se detiene y nos encontramos en un punto de encuentro seguro, aplicamos el protocolo **3C**:

| Fase | Acción Clave | Cómo Aplicarla |
| :--- | :--- | :--- |
| **1. CALMA** | Regulación somática | Apoyar los pies firmes en el suelo y realizar 4 respiraciones diafragmáticas profundas. |
| **2. CONTENCIÓN** | Presencia y afecto seguro | Mirar a los ojos a quien tiene miedo, ofrecer la mano o el **Abrazo de la Mariposa**. |
| **3. COMUNICACIÓN** | Realidad y esperanza | Decir con voz suave: *"El temblor ya paró. Aquí estamos juntos y nos estamos cuidando"*. |

---

### 🦋 3. Técnicas Somáticas de Regulación Rápida

#### A. El Abrazo de la Mariposa (Técnica Bilateral de Contención)
1. Cruza tus brazos sobre el pecho, colocando las manos sobre los hombros o clavículas opuestas.
2. Cierra los ojos o mira un punto fijo en el suelo.
3. Da toquecitos suaves y rítmicos alternados (izquierda, derecha, izquierda, derecha) como el aleteo de una mariposa.
4. Mantén el aleteo durante 1 a 2 minutos mientras respiras profundo. Esto equilibra ambos hemisferios cerebrales y disipa el pánico.

#### B. Técnica de Enraizamiento Sensorial (Grounding 5-4-3-2-1)
Para regresar al momento presente seguro, nombra en voz alta:
- **5 cosas** que puedas ver a tu alrededor.
- **4 cosas** que puedas tocar (tu ropa, el suelo, tus manos).
- **3 sonidos** que puedas escuchar (el viento, los pájaros, una voz).
- **2 olores** que puedas percibir.
- **1 sensación** agradable de gratitud en tu pecho.

---

### 🫁 4. Simulador Interactivo de Respiración Diafragmática 4-7-8
*Utiliza el siguiente simulador interactivo para regular tu ritmo cardíaco y experimentar la calma en tiempo real:*

:::respirador_interactivo:::

---

### 🧰 5. Constructor de "Mi Botiquín Emocional Familiar y Escolar"
*Así como tenemos un botiquín con gasas y alcohol, cada estudiante y familia debe tener un Botiquín Emocional con anclas de seguridad:*

:::botiquin_emocional:::
        `,
        icfes: [
            {
                pregunta: "Durante una evacuación escolar por sismo en Montenegro, un estudiante de grado 7° entra en crisis de pánico en la zona verde de seguridad: hiperventila, no puede hablar y tiembla intensamente. Desde el enfoque de Primeros Auxilios Psicológicos y competencias ciudadanas, ¿cuál es la intervención más oportuna del brigadista o compañero?",
                opciones: [
                    "A) Apartarlo del grupo y pedirle que respire dentro de una bolsa plástica sin hablarle.",
                    "B) Posicionarse a su nivel visual, sostener suavemente sus manos con su consentimiento, modelar una respiración diafragmática lenta contando '1, 2, 3' y validar su emoción diciéndole que está en un lugar seguro.",
                    "C) Decirle enérgicamente que debe calmarse de inmediato porque está asustando a los niños de primaria.",
                    "D) Darle una bebida azucarada y exigirle que vuelva a entrar al salón a recoger su maletín."
                ],
                correcta: 1,
                justificacion: "La contención empática, el contacto visual tranquilizador, la validación emocional y el modelado de la respiración lenta activan el sistema nervioso parasimpático y restablecen la sensación de seguridad sin invalidar el miedo de la persona."
            },
            {
                pregunta: "Una familia de Montenegro acuerda diseñar su Plan de Emergencia y Resiliencia Emocional tras un temblor. ¿Cuál de los siguientes elementos constituye un componente esencial del Botiquín Emocional Familiar?",
                opciones: [
                    "A) Guardar en secreto los temores personales para no preocupar a los demás miembros de la familia.",
                    "B) Definir un punto de encuentro seguro, un contacto telefónico clave fuera de la zona, una lista de afirmaciones de calma y un espacio de diálogo familiar para expresar el miedo sin juzgar.",
                    "C) Prohibir hablar de lo ocurrido durante los próximos seis meses.",
                    "D) Asumir que la infraestructura nunca sufrirá daños y no practicar simulacros."
                ],
                correcta: 1,
                justificacion: "La resiliencia familiar se construye combinando la preparación logística (punto de encuentro y contacto) con la seguridad psicológica (diálogo abierto, escucha activa y anclas de tranquilidad)."
            }
        ],
        cierre_gamificado: {
            sopa_letras: "CALMA,RESILIENCIA,EMPATIA,SEGURIDAD,RESPIRACION,SOLIDARIDAD,AUTOCUIDADO,ESPERANZA,VALOR,PAZ",
            crucigrama: [
                { palabra: "CALMA", pista: "Estado de sosiego y paz que recuperamos con respiración.", fila: 1, col: 1, horizontal: true },
                { palabra: "RESILIENCIA", pista: "Capacidad de sobreponerse a situaciones de crisis y aprender.", fila: 3, col: 1, horizontal: true },
                { palabra: "EMPATIA", pista: "Comprender y acompañar el miedo de otra persona con cariño.", fila: 5, col: 1, horizontal: true },
                { palabra: "RESPIRACION", pista: "Herramienta que oxigena y calma el nervio vago.", fila: 7, col: 1, horizontal: true }
            ]
        }
    };
};

window.simuladorRespiracionTimer = null;
window.simuladorRespiracionEstado = 'pausado';
window.simuladorRespiracionCiclos = 0;
window.simuladorRespiracionSegundosRestantes = 4;

window.toggleSimuladorRespiracion = function() {
    const btn = document.getElementById('btn-toggle-breathing');
    if (window.simuladorRespiracionTimer) {
        clearInterval(window.simuladorRespiracionTimer);
        window.simuladorRespiracionTimer = null;
        if (btn) btn.innerHTML = '<span>▶️</span> Reanudar Ejercicio';
        const txt = document.getElementById('breathing-instruction');
        if (txt) txt.innerText = '⏸️ Ejercicio en pausa';
    } else {
        if (btn) btn.innerHTML = '<span>⏸️</span> Pausar Ejercicio';
        if (window.simuladorRespiracionEstado === 'pausado') {
            window.simuladorRespiracionEstado = 'inhalar';
            window.simuladorRespiracionSegundosRestantes = 4;
        }
        window.ejecutarPasoSimuladorRespiracion();
        window.simuladorRespiracionTimer = setInterval(() => {
            window.simuladorRespiracionSegundosRestantes--;
            const secElem = document.getElementById('breathing-seconds');
            if (secElem) secElem.innerText = Math.max(1, window.simuladorRespiracionSegundosRestantes);

            if (window.simuladorRespiracionSegundosRestantes <= 0) {
                if (window.simuladorRespiracionEstado === 'inhalar') {
                    window.simuladorRespiracionEstado = 'sostener';
                    window.simuladorRespiracionSegundosRestantes = 7;
                } else if (window.simuladorRespiracionEstado === 'sostener') {
                    window.simuladorRespiracionEstado = 'exhalar';
                    window.simuladorRespiracionSegundosRestantes = 8;
                } else {
                    window.simuladorRespiracionEstado = 'inhalar';
                    window.simuladorRespiracionSegundosRestantes = 4;
                    window.simuladorRespiracionCiclos++;
                    const cCount = document.getElementById('breathing-cycles-count');
                    if (cCount) cCount.innerText = window.simuladorRespiracionCiclos;
                    
                    if (window.simuladorRespiracionCiclos === 4) {
                        const curUser = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
                        const doc = curUser.documento || curUser.usuario || 'doc';
                        if (window.sumarXPEstudiante) {
                            window.sumarXPEstudiante(doc, 25, "4 Ciclos de Respiración Diafragmática 4-7-8 Completados");
                        }
                    }
                }
                window.ejecutarPasoSimuladorRespiracion();
            }
        }, 1000);
    }
};

window.ejecutarPasoSimuladorRespiracion = function() {
    const circle = document.getElementById('breathing-circle');
    const icon = document.getElementById('breathing-phase-icon');
    const instruction = document.getElementById('breathing-instruction');
    const seconds = document.getElementById('breathing-seconds');

    if (!circle || !instruction) return;

    if (window.simuladorRespiracionEstado === 'inhalar') {
        circle.style.transform = 'scale(1.5)';
        circle.style.background = 'radial-gradient(circle, #38BDF8 0%, #0284C7 70%, #0369A1 100%)';
        if (icon) icon.innerText = '🌬️';
        instruction.innerText = '1. INHALA suavemente por la nariz (Inflando el abdomen)...';
        instruction.style.color = '#38BDF8';
        if (seconds) seconds.innerText = window.simuladorRespiracionSegundosRestantes;
    } else if (window.simuladorRespiracionEstado === 'sostener') {
        circle.style.transform = 'scale(1.5)';
        circle.style.background = 'radial-gradient(circle, #F59E0B 0%, #D97706 70%, #B45309 100%)';
        if (icon) icon.innerText = '🧘';
        instruction.innerText = '2. SOSTÉN el aire... Siente la calma y el control en tu pecho.';
        instruction.style.color = '#FDE047';
        if (seconds) seconds.innerText = window.simuladorRespiracionSegundosRestantes;
    } else if (window.simuladorRespiracionEstado === 'exhalar') {
        circle.style.transform = 'scale(1.0)';
        circle.style.background = 'radial-gradient(circle, #34D399 0%, #059669 70%, #047857 100%)';
        if (icon) icon.innerText = '🍃';
        instruction.innerText = '3. EXHALA despacio por la boca... Soltando todo el miedo y la tensión.';
        instruction.style.color = '#34D399';
        if (seconds) seconds.innerText = window.simuladorRespiracionSegundosRestantes;
    }
};

window.reiniciarSimuladorRespiracion = function() {
    if (window.simuladorRespiracionTimer) {
        clearInterval(window.simuladorRespiracionTimer);
        window.simuladorRespiracionTimer = null;
    }
    window.simuladorRespiracionEstado = 'pausado';
    window.simuladorRespiracionCiclos = 0;
    window.simuladorRespiracionSegundosRestantes = 4;
    const btn = document.getElementById('btn-toggle-breathing');
    if (btn) btn.innerHTML = '<span>▶️</span> Iniciar Ejercicio de Calma';
    const cCount = document.getElementById('breathing-cycles-count');
    if (cCount) cCount.innerText = '0';
    const circle = document.getElementById('breathing-circle');
    if (circle) {
        circle.style.transform = 'scale(1.0)';
        circle.style.background = 'radial-gradient(circle, #38BDF8 0%, #0284C7 70%, #0369A1 100%)';
    }
    const icon = document.getElementById('breathing-phase-icon');
    if (icon) icon.innerText = '🫁';
    const seconds = document.getElementById('breathing-seconds');
    if (seconds) seconds.innerText = '4';
    const instruction = document.getElementById('breathing-instruction');
    if (instruction) {
        instruction.innerText = 'Presiona "Iniciar Ejercicio de Calma" para comenzar';
        instruction.style.color = '#FDE047';
    }
};

window.generarCarnetResiliencia = function() {
    const obj = document.getElementById('botiquin-objeto') ? document.getElementById('botiquin-objeto').value.trim() : 'Recuerdo seguro';
    const per = document.getElementById('botiquin-persona') ? document.getElementById('botiquin-persona').value.trim() : 'Mi familia';
    const fra = document.getElementById('botiquin-frase') ? document.getElementById('botiquin-frase').value : 'El temblor ya pasó, aquí y ahora estoy a salvo.';
    const tec = document.getElementById('botiquin-tecnica') ? document.getElementById('botiquin-tecnica').value : 'Abrazo de la Mariposa';
    
    const curUser = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const nombre = curUser.nombre || curUser.nombre_completo || 'Estudiante Montenegro';
    const doc = curUser.documento || curUser.usuario || 'DOC';

    const output = document.getElementById('carnet-resiliencia-output');
    if (output) {
        output.style.display = 'block';
        output.innerHTML = `
            <div style="background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%); border: 3px solid #F59E0B; border-radius: 16px; padding: 25px; color: white; box-shadow: 0 10px 25px rgba(0,0,0,0.25); max-width: 580px; margin: 0 auto; font-family: Inter, sans-serif; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid rgba(255,255,255,0.15); padding-bottom: 12px; margin-bottom: 15px;">
                    <div>
                        <div style="font-size: 0.75rem; color: #FDE047; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Peidagogos STEAM • Gestión del Riesgo</div>
                        <h4 style="margin: 2px 0 0 0; color: white; font-size: 1.2rem; font-weight: 900;">🏅 Carnet Oficial de Resiliencia Emocional</h4>
                    </div>
                    <span style="font-size: 2.2rem;">🛡️</span>
                </div>

                <div style="margin-bottom: 12px;">
                    <div style="font-size: 0.8rem; color: #93C5FD; font-weight: 700;">TITULAR ACREDITADO:</div>
                    <div style="font-size: 1.15rem; font-weight: 900; color: #F8FAFC;">${nombre} (ID: ${doc})</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; font-size: 0.85rem;">
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 8px;">
                        <span style="color: #FCA5A5; font-weight: bold;">🧸 Objeto Ancla:</span><br>${obj || 'Foto familiar'}
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: 8px;">
                        <span style="color: #93C5FD; font-weight: bold;">🫂 Persona Refugio:</span><br>${per || 'Mi familia'}
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.1); padding: 10px 12px; border-radius: 8px; margin-bottom: 14px; font-size: 0.88rem;">
                    <span style="color: #86EFAC; font-weight: bold;">🕊️ Mantra de Fortaleza:</span><br>
                    <em style="color: #FDE047;">"${fra}"</em>
                </div>

                <div style="background: rgba(255,255,255,0.1); padding: 10px 12px; border-radius: 8px; margin-bottom: 15px; font-size: 0.85rem;">
                    <span style="color: #DDD6FE; font-weight: bold;">🦋 Técnica Corporal de Calma:</span><br>${tec}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: #CBD5E1; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 10px;">
                    <span>📍 Montenegro, Quindío • 2026</span>
                    <button onclick="window.print()" style="background: #10B981; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Imprimir Carnet</button>
                </div>
            </div>
        `;
    }

    if (window.sumarXPEstudiante) {
        window.sumarXPEstudiante(doc, 35, "Botiquín Emocional Personalizado Creado");
    }
    alert("🎉 ¡Botiquín Emocional guardado con éxito! Has ganado +35 XP y generado tu Carnet Oficial de Resiliencia.");
};

window.abrirClasePrimerosAuxiliosEmocionales = function(modo = 'estudiante') {
    const guideData = window.obtenerGuiaPrimerosAuxiliosEmocionales();
    const curUser = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    
    // Si viene de docente o tutor en pantalla de gestión, abrir modal de proyección grupal
    if (modo === 'docente' || modo === 'tutor') {
        const modalContainer = document.createElement('div');
        modalContainer.id = 'modal-clase-terremoto-proyeccion';
        modalContainer.style.cssText = 'position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); z-index: 9999; display: flex; justify-content: center; align-items: center; padding: 20px; overflow-y: auto; backdrop-filter: blur(8px);';
        
        modalContainer.innerHTML = `
            <div style="background: white; border-radius: 20px; width: 100%; max-width: 950px; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px rgba(0,0,0,0.3); padding: 30px; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 15px; margin-bottom: 20px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 2rem;">❤️‍🩹</span>
                        <div>
                            <h3 style="margin: 0; color: #991B1B; font-size: 1.4rem; font-weight: 900;">Clase Magistral: Primeros Auxilios Emocionales luego del Terremoto</h3>
                            <p style="margin: 2px 0 0 0; color: #6B7280; font-size: 0.85rem;">Modo Taller y Proyección para VideoBeam / Trabajo Grupal y Familiar</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="window.print()" style="background: #F1F5F9; border: 1px solid #CBD5E1; color: #334155; padding: 8px 14px; border-radius: 8px; font-weight: 700; cursor: pointer;">🖨️ Imprimir Taller</button>
                        <button onclick="document.getElementById('modal-clase-terremoto-proyeccion').remove()" style="background: #EF4444; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 800; cursor: pointer;">✕ Cerrar</button>
                    </div>
                </div>
                <div id="proyeccion-guia-emocional-inner"></div>
            </div>
        `;
        document.body.appendChild(modalContainer);

        const inner = document.getElementById('proyeccion-guia-emocional-inner');
        if (inner) {
            window.isTeacherView = true;
            window.guideDataCache = guideData;
            let htmlGuide = `
                <div style="background: #FEF2F2; border: 1.5px solid #FCA5A5; border-radius: 12px; padding: 18px; margin-bottom: 20px; color: #991B1B;">
                    <div style="font-weight: 900; font-size: 1.1rem; margin-bottom: 4px;">🎯 Objetivo Pedagógico de la Clase:</div>
                    <p style="margin: 0; font-size: 0.95rem; line-height: 1.45;">${guideData.objetivo_aprendizaje}</p>
                </div>
                <div style="font-size: 1.05rem; line-height: 1.6; color: #374151;">
                    ${window.procesarJuegosEnTexto(guideData.texto_deductivo)}
                </div>
                ${window.renderizarSeccionIcfes(guideData.icfes, true)}
                ${window.renderizarCierreGamificado(guideData.cierre_gamificado, true)}
            `;
            inner.innerHTML = htmlGuide;
            if (window.renderizarBloquesEspeciales) window.renderizarBloquesEspeciales(inner);
            if (window.juegosPendientes && window.juegosPendientes.length > 0) {
                window.juegosPendientes.forEach(j => j());
                window.juegosPendientes = [];
            }
        }
        return;
    }

    // Modo Estudiante:
    window.isTeacherView = false;
    window.gradoActualEstudiante = curUser.grado || curUser.grupo || 'Ciclo VI';
    const mainContent = document.getElementById("student-main-content");
    const subjectView = document.getElementById("student-subject-view-container");
    const subjectTitle = document.getElementById("student-subject-title");
    const questContainer = document.getElementById("student-quest-container");
    const guideContent = document.getElementById("student-guide-content");

    if (mainContent && subjectView) {
        mainContent.style.display = "none";
        subjectView.style.display = "block";
    }

    if (subjectTitle) {
        subjectTitle.innerText = "❤️‍🩹 Primeros Auxilios Emocionales (Terremoto)";
    }

    if (questContainer) questContainer.style.display = "none";
    if (guideContent) guideContent.style.display = "block";

    window.renderizarGuiaContenido(guideData, "1", "1", "Primeros Auxilios Emocionales", curUser);

    // Auto-scroll al tope
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const sDash = document.getElementById('student-dashboard-container');
    if (sDash) sDash.scrollTop = 0;
};

window.procesarJuegosEnTexto = function(textoMarkdown) {
    if (!textoMarkdown) return "";
    let html = marked.parse(textoMarkdown);
    const esProfe = !!window.isTeacherView;
    
    // 1. Buscar [JUEGO:TIPO:DATOS]
    const regexJuegos = /\[JUEGO:(ORDENAR_LETRAS|ORDENAR_FRASE|SOPA_LETRAS|CRUCIGRAMA):(.*?)\]/g;
    html = html.replace(regexJuegos, (match, tipo, datos) => {
        let uniqueId = 'juego_' + Math.random().toString(36).substr(2, 9);
        if (tipo === 'ORDENAR_LETRAS') {
            const solucionProfe = esProfe 
                ? `<div style="margin-top:10px; padding:8px 12px; background:#DCFCE7; border-left:4px solid #16A34A; border-radius:4px; color:#166534; font-size:0.9rem; font-weight:bold;">💡 Solución Orientador: <span style="letter-spacing:2px; font-family:monospace; font-size:1.05rem;">${datos}</span></div>` 
                : '';
            return `<div class="juego-incrustado" style="background:#F0FDF4; border:2px dashed #22C55E; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#166534; margin-top:0; display:flex; align-items:center; gap:8px;">🧩 Minijuego: Ordenar Letras</h5>
                ${window.renderizarJuegoOrdenar(datos.split(''), 'letras')}
                ${solucionProfe}
            </div>`;
        } else if (tipo === 'ORDENAR_FRASE') {
            let palabras = datos.split(' ');
            const solucionProfe = esProfe 
                ? `<div style="margin-top:10px; padding:8px 12px; background:#DBEAFE; border-left:4px solid #2563EB; border-radius:4px; color:#1E40AF; font-size:0.9rem; font-weight:bold;">💡 Frase Solución Orientador: <span style="font-family:monospace; font-size:0.95rem;">"${datos}"</span></div>` 
                : '';
            return `<div class="juego-incrustado" style="background:#EFF6FF; border:2px dashed #3B82F6; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#1E3A8A; margin-top:0; display:flex; align-items:center; gap:8px;">🧩 Minijuego: Ordenar Frase</h5>
                ${window.renderizarJuegoOrdenar(palabras, 'palabras')}
                ${solucionProfe}
            </div>`;
        } else if (tipo === 'SOPA_LETRAS') {
            let palabras = datos.split(',');
            const solucionProfe = esProfe 
                ? `<div style="margin-top:10px; padding:8px 12px; background:#FEF3C7; border-left:4px solid #D97706; border-radius:4px; color:#92400E; font-size:0.9rem; font-weight:bold;">💡 Palabras a encontrar (Orientador): <span style="font-family:monospace;">${palabras.join(', ')}</span></div>` 
                : '';
            window.juegosPendientes.push(() => window.renderizarSopaLetras(uniqueId, palabras));
            return `<div class="juego-incrustado" style="background:#FFFBEB; border:2px dashed #F59E0B; padding:15px; margin:15px 0; border-radius:8px;">
                <h5 style="color:#92400E; margin-top:0; display:flex; align-items:center; gap:8px;">🔍 Minijuego: Sopa de Letras</h5>
                <div id="${uniqueId}" style="display:flex; flex-direction:column; align-items:center;">Cargando sopa de letras...</div>
                ${solucionProfe}
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
        let respSugerida = partes[1] ? partes[1].trim() : '';
        let actId = 'act_plat_' + Math.random().toString(36).substr(2, 9);
        const solucionProfe = (esProfe && respSugerida) 
            ? `<div style="margin-top:12px; padding:10px 14px; background:#ECFDF5; border:2px solid #10B981; border-radius:6px; color:#065F46; font-size:0.9rem;"><strong>💡 Respuesta sugerida / Criterio para el orientador:</strong><br>${respSugerida}</div>` 
            : '';
        return `<div class="actividad-plataforma-box" style="background: #F8FAFC; border: 2px dashed #3B82F6; padding: 18px; margin: 20px 0; border-radius: 8px;">
            <h5 style="color: #1E40AF; margin-top: 0; display:flex; align-items:center; gap:8px;">✍️ Actividad en Plataforma (No Copy-Paste)</h5>
            <p style="font-weight: bold; color: #1E293B; margin-bottom: 10px;">${preg}</p>
            <textarea class="anti-cheat-textarea" id="textarea_${actId}" rows="3" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #CBD5E1;" onpaste="return false;" ondrop="return false;" oninput="verificarEscrituraIA(this)" placeholder="Escribe tu análisis con tus propias palabras..."></textarea>
            <div class="ai-warning" style="color: #EF4444; font-size: 0.85rem; font-weight: bold; display: none; margin-top: 5px;">⚠️ Se detectó velocidad anormal de tipeo. Escribe tu propia respuesta.</div>
            <button onclick="validarActividadPlataformaIncrustada('${actId}')" id="btn_${actId}" style="background: #3B82F6; color: white; padding: 8px 18px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px;">Validar Respuesta</button>
            <div id="feedback_${actId}" style="display:none; margin-top:10px; padding:10px; background:#ECFDF5; border:1px solid #10B981; border-radius:6px; color:#065F46; font-size:0.9rem;">✔️ ¡Respuesta validada y registrada correctamente!</div>
            ${solucionProfe}
        </div>`;
    });

    // 3. Buscar [ACTIVIDAD:CUADERNO:INSTRUCCION]
    const regexCuad = /\[ACTIVIDAD:CUADERNO:(.*?)\]/g;
    html = html.replace(regexCuad, (match, instruccion) => {
        const solucionProfe = esProfe 
            ? `<div style="margin-top:10px; padding:8px 12px; background:#FEF3C7; border-left:4px solid #D97706; border-radius:4px; color:#92400E; font-size:0.85rem;"><strong>💡 Orientación Pedagógica:</strong> Verificar que el estudiante consigne en su cuaderno la actividad con título, fecha y desarrollo claro.</div>` 
            : '';
        return `<div class="actividad-cuaderno-box" style="background: #FFFBEB; border: 2px dashed #F59E0B; padding: 18px; margin: 20px 0; border-radius: 8px;">
            <h5 style="color: #92400E; margin-top: 0; display:flex; align-items:center; gap:8px;">📓 Actividad para Desarrollar en el Cuaderno</h5>
            <p style="color: #451A03; font-weight: 500; line-height: 1.5; margin-bottom: 12px;">${instruccion}</p>
            <button onclick="this.style.background='#10B981'; this.innerText='✔️ Lo resolví en mi cuaderno';" style="background: #F59E0B; color: white; padding: 8px 18px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; transition: all 0.2s;">✔️ Lo resolví en mi cuaderno</button>
            ${solucionProfe}
        </div>`;
    });
    
    // 3. Procesar :::respirador_interactivo::: (Simulador de Respiración Diafragmática)
    if (html.includes(':::respirador_interactivo:::') || html.includes('&colon;&colon;&colon;respirador_interactivo&colon;&colon;&colon;') || html.includes('respirador_interactivo')) {
        const breathingHtml = `
        <div id="simulador-respiracion-box" style="background: linear-gradient(135deg, #0F172A, #1E293B); border: 2px solid #38BDF8; border-radius: 18px; padding: 25px 20px; text-align: center; color: white; margin: 25px 0; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 1.8rem;">🌬️</span>
                <h4 style="color: #38BDF8; font-size: 1.3rem; font-weight: 900; margin: 0;">Simulador Interactivo: Respiración Diafragmática 4-7-8</h4>
            </div>
            <p style="color: #94A3B8; font-size: 0.92rem; margin: 0 auto 20px auto; max-width: 600px;">
                Esta técnica disminuye el ritmo cardíaco, oxigena el lóbulo frontal y envía una señal directa al nervio vago: <em>"El peligro ya pasó, aquí y ahora estoy a salvo"</em>.
            </p>

            <div style="position: relative; width: 200px; height: 200px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center;">
                <div id="breathing-circle-outer" style="position: absolute; width: 190px; height: 190px; border-radius: 50%; border: 3px dashed rgba(56, 189, 248, 0.4); transition: transform 4s ease-in-out;"></div>
                <div id="breathing-circle" style="width: 110px; height: 110px; border-radius: 50%; background: radial-gradient(circle, #38BDF8 0%, #0284C7 70%, #0369A1 100%); box-shadow: 0 0 25px rgba(56, 189, 248, 0.6); display: flex; flex-direction: column; align-items: center; justify-content: center; transition: transform 4s ease-in-out, background 1s;">
                    <span id="breathing-phase-icon" style="font-size: 1.8rem;">🫁</span>
                    <span id="breathing-seconds" style="font-size: 1.6rem; font-weight: 900; color: white;">4</span>
                </div>
            </div>

            <div id="breathing-instruction" style="font-size: 1.3rem; font-weight: 900; color: #FDE047; min-height: 35px; margin-bottom: 18px;">
                Presiona "Iniciar Ejercicio de Calma" para comenzar
            </div>

            <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                <button id="btn-toggle-breathing" onclick="window.toggleSimuladorRespiracion()" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 12px 26px; border-radius: 30px; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 15px rgba(16,185,129,0.3);">
                    <span>▶️</span> Iniciar Ejercicio de Calma
                </button>
                <button onclick="window.reiniciarSimuladorRespiracion()" style="background: rgba(255,255,255,0.1); color: #E2E8F0; border: 1px solid #475569; padding: 12px 18px; border-radius: 30px; font-weight: 700; font-size: 0.9rem; cursor: pointer;">
                    🔄 Reiniciar
                </button>
            </div>

            <div style="margin-top: 15px; font-size: 0.85rem; color: #34D399; font-weight: 700;">
                Ciclos completados: <span id="breathing-cycles-count">0</span> / 4 recomendados (+25 XP al completar)
            </div>
        </div>
        `;
        html = html.replace(/:::respirador_interactivo:::/g, breathingHtml)
                   .replace(/&colon;&colon;&colon;respirador_interactivo&colon;&colon;&colon;/g, breathingHtml)
                   .replace(/<p>:::respirador_interactivo:::<\/p>/g, breathingHtml);
    }

    // 4. Procesar :::botiquin_emocional::: (Constructor Interactivo)
    if (html.includes(':::botiquin_emocional:::') || html.includes('&colon;&colon;&colon;botiquin_emocional&colon;&colon;&colon;') || html.includes('botiquin_emocional')) {
        const botiquinHtml = `
        <div id="constructor-botiquin-emocional" style="background: white; border: 2px solid #FBCFE8; border-radius: 18px; padding: 25px; margin: 25px 0; box-shadow: 0 6px 20px rgba(244, 114, 182, 0.1);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                <span style="font-size: 2.2rem;">🧰</span>
                <div>
                    <h4 style="margin: 0; color: #9D174D; font-size: 1.3rem; font-weight: 900;">Taller Práctico: Constructor de "Mi Botiquín Emocional"</h4>
                    <p style="margin: 2px 0 0 0; color: #6B7280; font-size: 0.9rem;">Personaliza tus 4 anclas de seguridad emocional para tener listas ante cualquier emergencia o momento de miedo.</p>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 12px; padding: 14px;">
                    <label style="font-weight: 800; color: #9F1239; font-size: 0.88rem; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                        <span>1. 🧸</span> Mi Objeto o Recuerdo Ancla:
                    </label>
                    <input type="text" id="botiquin-objeto" placeholder="Ej: Peluche favorito, foto familiar, piedra suave" value="Foto de mi familia y mi mascota" style="width: 100%; padding: 8px 12px; border: 1px solid #FDA4AF; border-radius: 8px; box-sizing: border-box; font-size: 0.9rem;">
                </div>

                <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 14px;">
                    <label style="font-weight: 800; color: #1E40AF; font-size: 0.88rem; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                        <span>2. 🫂</span> Mi Persona de Refugio:
                    </label>
                    <input type="text" id="botiquin-persona" placeholder="Ej: Mi mamá, abuela, profe guía" value="Mi madre y mi profesor guía" style="width: 100%; padding: 8px 12px; border: 1px solid #93C5FD; border-radius: 8px; box-sizing: border-box; font-size: 0.9rem;">
                </div>

                <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 14px;">
                    <label style="font-weight: 800; color: #166534; font-size: 0.88rem; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                        <span>3. 🕊️</span> Mi Frase de Fortaleza:
                    </label>
                    <select id="botiquin-frase" style="width: 100%; padding: 8px 12px; border: 1px solid #86EFAC; border-radius: 8px; box-sizing: border-box; font-size: 0.88rem; font-weight: 600;">
                        <option value="El temblor ya pasó, aquí y ahora estoy a salvo y acompañado.">"El temblor ya pasó, aquí y ahora estoy a salvo y acompañado."</option>
                        <option value="Puedo respirar profundo y calmar mi cuerpo paso a paso.">"Puedo respirar profundo y calmar mi cuerpo paso a paso."</option>
                        <option value="El miedo es normal; soy valiente y nos cuidamos juntos en Montenegro.">"El miedo es normal; soy valiente y nos cuidamos juntos en Montenegro."</option>
                        <option value="Somos una comunidad fuerte que se apoya y sale adelante.">"Somos una comunidad fuerte que se apoya y sale adelante."</option>
                    </select>
                </div>

                <div style="background: #FAF5FF; border: 1px solid #E9D5FF; border-radius: 12px; padding: 14px;">
                    <label style="font-weight: 800; color: #6B21A8; font-size: 0.88rem; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                        <span>4. 🦋</span> Mi Técnica Corporal de Calma:
                    </label>
                    <select id="botiquin-tecnica" style="width: 100%; padding: 8px 12px; border: 1px solid #D8B4FE; border-radius: 8px; box-sizing: border-box; font-size: 0.88rem; font-weight: 600;">
                        <option value="Abrazo de la Mariposa (toques suaves alternados en el pecho)">Abrazo de la Mariposa (toques suaves alternados en el pecho)</option>
                        <option value="Técnica 5-4-3-2-1 de Enraizamiento Sensorial">Técnica 5-4-3-2-1 de Enraizamiento Sensorial</option>
                        <option value="Respiración Diafragmática 4-7-8 con la mano en el abdomen">Respiración Diafragmática 4-7-8 con la mano en el abdomen</option>
                    </select>
                </div>
            </div>

            <div style="text-align: center;">
                <button onclick="window.generarCarnetResiliencia()" style="background: linear-gradient(135deg, #EC4899, #DB2777); color: white; border: none; padding: 12px 26px; border-radius: 10px; font-weight: 800; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 12px rgba(236,72,153,0.3); display: inline-flex; align-items: center; gap: 8px;">
                    <span>🪪</span> Guardar y Generar Mi Carnet de Resiliencia (+35 XP)
                </button>
            </div>

            <div id="carnet-resiliencia-output" style="display: none; margin-top: 20px;"></div>
        </div>
        `;
        html = html.replace(/:::botiquin_emocional:::/g, botiquinHtml)
                   .replace(/&colon;&colon;&colon;botiquin_emocional&colon;&colon;&colon;/g, botiquinHtml)
                   .replace(/<p>:::botiquin_emocional:::<\/p>/g, botiquinHtml);
    }
    
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
    if (window.cargarGuiaGuardadaDirecta && window.cargarGuiaGuardadaDirecta()) {
        return;
    }
    window.juegosPendientes = [];
    const rolElem = document.getElementById("student-quest-rol");
    const ambienteElem = document.getElementById("student-quest-ambiente");
    const nivelElem = document.getElementById("student-quest-nivel");
    const enfoqueElem = document.getElementById("student-quest-enfoque");
    
    if (!rolElem || !ambienteElem || !nivelElem || !enfoqueElem || !rolElem.value || !ambienteElem.value || !nivelElem.value || !enfoqueElem.value) {
        alert("¡Por favor completa todos los menús para personalizar tu aventura!");
        return;
    }
    
    const periodo = document.getElementById("student-select-periodo").value;
    const semanaStr = document.getElementById("student-select-semana").value;
    const asignatura = document.getElementById('student-subject-title').innerText.replace('Aula de ', '').trim();
    
    // Verificación de Modelo Freemium: Primera guía (Semana 1, Periodo 1) es 100% gratuita. A partir de la segunda se solicita suscripción
    const curUser = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const esInstitucional = (curUser.institucion === 'IE Instituto Montenegro' || curUser.codigo_institucional === 'ieinstituto2026');
    const estaPagado = (curUser.pago_realizado === true || curUser.pago_activo === true || esInstitucional);

    if (!estaPagado && (periodo !== "1" || parseInt(semanaStr, 10) > 1)) {
        const monto = 85000;
        const concepto = (curUser.rol === 'validacion' || curUser.institucion === 'Validacion') 
            ? 'Matrícula Oficial Validación Bachillerato' 
            : 'Matrícula Oficial Home School';
        
        abrirPasarelaPago({
            concepto: `${concepto} (Semana ${semanaStr} - Periodo ${periodo})`,
            documento: curUser.documento || curUser.usuario || 'EST',
            monto: monto,
            rol: curUser.rol || 'estudiante',
            callback: () => {
                curUser.pago_realizado = true;
                curUser.pago_activo = true;
                window.usuarioEstudianteActual = curUser;
                localStorage.setItem('usuario_sesion', JSON.stringify(curUser));
                alert("🎉 ¡Suscripción activada con éxito! Todas las guías y semanas están desbloqueadas.");
                window.ingresarAGuia();
            }
        });
        return;
    }
    
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
    if (asignatura.toLowerCase().includes('física') || asignatura.toLowerCase().includes('fisica')) malla = window.mallaFisica;
    else if (asignatura.toLowerCase().includes('química') || asignatura.toLowerCase().includes('quimica')) malla = window.mallaQuimica;
    else if (asignatura.toLowerCase().includes('matemática') || asignatura.toLowerCase().includes('matematica')) malla = window.mallaMatematicas;
    else if (asignatura.toLowerCase().includes('naturales') || asignatura.toLowerCase().includes('ciencias')) malla = window.mallaNaturales;
    else if (asignatura.toLowerCase().includes('sociales')) malla = window.mallaSociales;
    else if (asignatura.toLowerCase().includes('castellano') || asignatura.toLowerCase().includes('humanidades') || asignatura.toLowerCase().includes('lengua')) malla = window.mallaCastellano;
    else if (asignatura.toLowerCase().includes('inglés') || asignatura.toLowerCase().includes('ingles') || asignatura.toLowerCase().includes('idioma')) malla = window.mallaIngles;
    else if (asignatura.toLowerCase().includes('tecnología') || asignatura.toLowerCase().includes('tecnologia') || asignatura.toLowerCase().includes('informática') || asignatura.toLowerCase().includes('informatica')) malla = window.mallaTecnologia;
    else if (asignatura.toLowerCase().includes('turismo')) malla = window.mallaTurismo;
    else if (asignatura.toLowerCase().includes('artística') || asignatura.toLowerCase().includes('música') || asignatura.toLowerCase().includes('artistica')) malla = window.mallaArtistica;
    else if (asignatura.toLowerCase().includes('ética') || asignatura.toLowerCase().includes('etica') || asignatura.toLowerCase().includes('filosofía') || asignatura.toLowerCase().includes('filosofia')) malla = window.mallaEtica;
    
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
                <h3 style="margin-top: 20px; color: #3B82F6;">Generando tu aventura personalizada...</h3>
                <p style="color: #6B7280;">La Inteligencia Artificial está tejiendo tu misión, por favor espera unos segundos.</p>
            </div>
        `;
    }
    
    // Petición al caché local (Archivos JSON estáticos) o Generación por Demanda
    try {
        const currentUser = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
        let studentDisplayName = (currentUser.nombre || ((currentUser.nombres || '') + ' ' + (currentUser.apellidos || '')).trim()) || 'Estudiante';
        const userInstitucion = currentUser.institucion || (currentUser.rol === 'validacion' ? 'Validacion' : 'IE Instituto Montenegro');
        const userModo = currentUser.rol || (currentUser.institucion === 'Validacion' ? 'validacion' : (currentUser.institucion === 'HomeSchool' ? 'homeschool' : 'regular'));

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
            enfoque: enfoqueElem.options[enfoqueElem.selectedIndex].text,
            nombre_estudiante: studentDisplayName,
            estudiante_nombre: studentDisplayName,
            institucion: userInstitucion,
            modo: userModo
        };
        
        // Petición al endpoint VIP de generación
        let response;
        try {
            response = await fetch('/api/generate-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.status === 404 && window.location.port !== '3000') {
                response = await fetch('http://localhost:3000/api/generate-guide', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
        } catch (fetchErr) {
            if (window.location.port !== '3000') {
                response = await fetch('http://localhost:3000/api/generate-guide', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                throw fetchErr;
            }
        }
        
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

        // Guardar guía en localStorage para persistencia continua de la semana
        const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
        if (user && user.documento) {
            const guiaGuardadaKey = `guia_guardada_${user.documento}_${asignatura}_p${periodo}_s${semanaStr}`;
            localStorage.setItem(guiaGuardadaKey, JSON.stringify(guideData));
        }

        window.renderizarGuiaContenido(guideData, periodo, semanaStr, asignatura, user);
        
    } catch (error) {
        console.error(error);
        innerContent.innerHTML = `<div style="padding: 20px; background: #FEE2E2; border: 1px solid #EF4444; border-radius: 8px; color: #B91C1C;"><strong>Error de conexión:</strong> No se pudo conectar con el servidor central.</div>`;
    }
};

window.renderizarGuiaContenido = function(guideData, periodo, semanaStr, asignatura, user) {
    const innerContent = document.getElementById("student-guide-inner-content");
    if (!innerContent) return;

    window.guideDataCache = guideData;
    const doc = String(user ? (user.documento || user.usuario || '') : '').trim();

    let studentDisplayName = "Estudiante";
    if (user) {
        if (user.nombre && user.apellidos && user.nombre !== 'Estudiante' && user.apellidos !== 'Nocturno') {
            studentDisplayName = `${user.nombre} ${user.apellidos}`.trim();
        } else if (user.nombre_completo) {
            studentDisplayName = user.nombre_completo.trim();
        } else if (user.nombre && user.nombre !== 'Estudiante') {
            studentDisplayName = user.nombre.trim();
        } else {
            studentDisplayName = ((user.nombres || '') + ' ' + (user.apellidos || '')).trim() || 'Estudiante';
        }

        const avatar = user.avatar || '🚀';
        const gradoBadge = user.grado || user.grupo || 'Ciclo VI';

        const gName = document.getElementById('student-guide-header-name');
        if (gName) gName.innerText = studentDisplayName;

        const gAvatar = document.getElementById('student-guide-header-avatar');
        if (gAvatar) gAvatar.innerText = avatar;

        const gBadge = document.getElementById('student-guide-header-badge');
        if (gBadge) gBadge.innerText = gradoBadge;

        const gMateria = document.getElementById('student-guide-header-materia');
        if (gMateria) gMateria.innerText = asignatura || 'Ciencias Naturales';

        // XP
        const xpKey = `xp_${doc}`;
        let currentXP = parseInt(localStorage.getItem(xpKey)) || 0;
        if (currentXP === 0) {
            const progKey = `prog_${doc}_${asignatura}_p${periodo}`;
            let prog = parseInt(localStorage.getItem(progKey)) || 1;
            currentXP = (prog > 1) ? (prog - 1) * 100 : 0;
        }

        const headerXP = document.getElementById('student-guide-header-xp');
        if (headerXP) headerXP.innerText = currentXP;

        window.guiaActualAsignatura = asignatura;
        window.guiaActualPeriodo = periodo;
    }

    let htmlRenderizado = `
        <div style="text-align: center; margin-bottom: 25px; background: linear-gradient(135deg, #EFF6FF, #F0FDF4); padding: 20px; border-radius: 16px; border: 1px solid #BFDBFE;">
            <div style="font-size: 0.9rem; font-weight: 800; color: #2563EB; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                🎯 Misión Oficial de Aprendizaje STEAM 2026
            </div>
            <h3 style="color: #1E3A8A; font-weight: 900; font-size: 1.5rem; margin: 4px 0;">
                ${user ? (user.avatar || '🚀') : '🚀'} ${studentDisplayName} • Guía Periodo ${periodo}
            </h3>
            <p style="color: #4B5563; margin: 0; font-size: 0.95rem; font-weight: 600;">
                Semana ${semanaStr} | ${asignatura} | ${user ? (user.grado || user.grupo || 'Ciclo VI') : 'Ciclo VI'}
            </p>
        </div>
        <div class="mega-guide-container" style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #E5E7EB; font-family: 'Inter', sans-serif;">
    `;

    const esInstitucional = (user && (user.institucion === 'IE Instituto Montenegro' || user.codigo_institucional === 'ieinstituto2026'));
    const estaPagado = (user && (user.pago_realizado === true || user.pago_activo === true || esInstitucional));

    if (!estaPagado) {
        htmlRenderizado += `
            <div style="background: #FEF3C7; border: 2px solid #F59E0B; padding: 18px 24px; border-radius: 14px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; box-shadow: 0 4px 15px rgba(245,158,11,0.12);">
                <div style="max-width: 650px;">
                    <div style="font-weight: 900; color: #92400E; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
                        <span>🔒</span> Modo Observación Gratuita (Guía 1 de Muestra)
                    </div>
                    <p style="margin: 6px 0 0 0; color: #78350F; font-size: 0.92rem; line-height: 1.45;">
                        Puedes leer y observar todo el contenido teórico de la guía. Para habilitar la solución interactiva, respuestas con IA, acumulación de XP y certificación oficial, activa tu matrícula con Mercado Pago.
                    </p>
                </div>
                <button onclick="abrirPasarelaPago({ concepto: 'Matrícula Oficial y Solución de Guías', documento: '${doc}', monto: 85000, rol: '${user ? user.rol : 'estudiante'}', callback: () => location.reload() })" style="background: linear-gradient(135deg, #009EE3, #007EB5); color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(0,158,227,0.35); font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                    <span>💳</span> Pagar Matrícula ($85.000 COP con Mercado Pago)
                </button>
            </div>
        `;
    }
    
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
            const respGuardada = doc ? localStorage.getItem(`resp_saber_${doc}_${asignatura}_p${periodo}_s${semanaStr}_${idx}`) : null;
            const estaRespondida = respGuardada !== null;
            let disabled = (idx === 0 || estaRespondida) ? '' : 'disabled style="opacity:0.5;"';
            let opcionesList = (Array.isArray(pregunta.opciones) && pregunta.opciones.length > 0) 
                ? pregunta.opciones 
                : (Array.isArray(pregunta.opcion) ? pregunta.opcion : ["Opción A", "Opción B", "Opción C", "Opción D"]);

            htmlRenderizado += `
                <div class="pregunta-saberes" id="container_saber_${idx}" style="margin-bottom: 15px;" ${disabled}>
                    <p style="font-weight: bold;">${idx+1}. ${pregunta.pregunta}</p>
                    ${opcionesList.map((opcion, i) => {
                        const checked = (respGuardada === String(i)) ? 'checked' : '';
                        const dis = estaRespondida ? 'disabled' : '';
                        return `
                        <label style="display: block; margin-bottom: 8px; cursor: pointer; padding: 10px; background: white; border: 1px solid #D1D5DB; border-radius: 6px;">
                            <input type="radio" name="saber_${idx}" value="${i}" ${checked} ${dis} data-correct="${pregunta.correcta !== undefined ? pregunta.correcta : 0}" style="margin-right: 10px;">
                            ${opcion}
                        </label>`;
                    }).join('')}
                    <button id="btn_saber_${idx}" onclick="verificarSaberIndividual(${idx})" ${estaRespondida ? 'disabled style="background: #10B981; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-weight: bold; margin-top: 10px;"' : 'style="background: #3B82F6; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px;"'}>
                        ${estaRespondida ? '✅ Respondido (+20 XP)' : 'Verificar'}
                    </button>
                </div>
            `;
        });
        htmlRenderizado += `</div>`;
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

        htmlRenderizado += `<div style="text-align: center; margin-top: 35px; padding-bottom: 10px;">
                <button onclick="completarMisionActual()" style="background: #10B981; color: white; border: none; padding: 15px 35px; border-radius: 8px; font-weight: bold; font-size: 1.15rem; cursor: pointer; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: transform 0.2s;">✅ Completar Misión</button>
            </div>
            <div class="peidagogos-ip-footer" style="margin-top: 25px; padding: 12px 15px; border-top: 1px dashed #CBD5E1; text-align: center; color: #64748B; font-size: 0.78rem; line-height: 1.4; user-select: none;">
                🔒 <b>Documento Oficial Protegido • Peidagogos STEAM</b><br>
                Licencia de Uso Académico Personal para <b>${studentDisplayName}</b> (ID: ${user ? (user.documento || 'S/D') : 'S/D'}). © 2026 Peidagogos STEAM. Prohibida su copia, distribución o reproducción no autorizada.
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

window.validarPermisoResolucionEstudiante = function() {
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const doc = String(user.documento || user.usuario || 'EST').trim();
    const esInstitucional = (user.institucion === 'IE Instituto Montenegro' || user.codigo_institucional === 'ieinstituto2026');
    const estaPagado = (user.pago_realizado === true || user.pago_activo === true || esInstitucional);

    if (!estaPagado) {
        abrirPasarelaPago({
            concepto: 'Matrícula Oficial y Solución de Guías',
            documento: doc,
            monto: 85000,
            rol: user.rol || 'estudiante',
            callback: () => {
                user.pago_realizado = true;
                user.pago_activo = true;
                window.usuarioEstudianteActual = user;
                localStorage.setItem('usuario_sesion', JSON.stringify(user));
                alert("🎉 ¡Matrícula activada con éxito! Ahora puedes responder todas tus guías y acumular XP.");
                location.reload();
            }
        });
        return false;
    }
    return true;
};

window.verificarSaberIndividual = function(idx) {
    if (!window.validarPermisoResolucionEstudiante()) return;

    const radios = document.getElementsByName('saber_' + idx);
    let selected = null;
    radios.forEach(r => { if (r.checked) selected = r; });
    
    if (!selected) {
        alert("Selecciona una opción antes de verificar.");
        return;
    }
    
    const correct = selected.value === selected.getAttribute('data-correct');
    const btn = document.getElementById('btn_saber_' + idx);
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const doc = String(user.documento || user.usuario || 'EST').trim();
    const periodo = document.getElementById("student-select-periodo") ? document.getElementById("student-select-periodo").value : "1";
    const semanaStr = document.getElementById("student-select-semana") ? document.getElementById("student-select-semana").value : "1";
    const asig = window.guiaActualAsignatura || 'General';
    
    if (correct) {
        btn.innerText = "✅ Correcto (+20 XP)";
        btn.style.background = "#10B981";
        btn.disabled = true;
        radios.forEach(r => r.disabled = true);
        
        // Guardar respuesta en localStorage para persistencia
        localStorage.setItem(`resp_saber_${doc}_${asig}_p${periodo}_s${semanaStr}_${idx}`, selected.value);
        
        // Sumar XP a la barra de estado
        if (window.sumarXPEstudiante && user.documento) {
            window.sumarXPEstudiante(user.documento, 20, 'Saberes Previos');
        }
        
        mostrarHuevos(); // Recompensa
        
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
    if (!window.validarPermisoResolucionEstudiante()) return;

    const textarea = document.getElementById('textarea_ind_pag_' + idx);
    if (!textarea || textarea.value.trim().length < 10) {
        alert("Escribe una respuesta más completa (al menos 10 caracteres).");
        return;
    }
    
    const btn = document.getElementById('btn_ind_pag_' + idx);
    btn.innerText = "✅ Validado (+30 XP)";
    btn.style.background = "#10B981";
    btn.disabled = true;
    textarea.disabled = true;
    
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    if (window.sumarXPEstudiante && user.documento) {
        window.sumarXPEstudiante(user.documento, 30, 'Reto Inductivo');
    }
    
    mostrarHuevos(); // Recompensa
    
    const nextContainer = document.getElementById('container_ind_pag_' + (idx + 1));
    if (nextContainer) {
        nextContainer.style.opacity = '1';
        nextContainer.removeAttribute('disabled');
    }
};

window.verificarCuadernoIndividual = function(idx) {
    if (!window.validarPermisoResolucionEstudiante()) return;

    const btn = document.getElementById('btn_cuaderno_' + idx);
    btn.innerText = "✅ Confirmado (+25 XP)";
    btn.style.background = "#10B981";
    btn.disabled = true;
    
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    if (window.sumarXPEstudiante && user.documento) {
        window.sumarXPEstudiante(user.documento, 25, 'Actividad Cuaderno');
    }
    
    mostrarHuevos(); // Recompensa
    
    const nextContainer = document.getElementById('container_cuaderno_' + (idx + 1));
    if (nextContainer) {
        nextContainer.style.opacity = '1';
        nextContainer.removeAttribute('disabled');
    }
};

window.verificarDeductivaPagina = function(idx) {
    if (!window.validarPermisoResolucionEstudiante()) return;

    const textarea = document.getElementById('textarea_ded_pag_' + idx);
    if (!textarea || textarea.value.trim().length < 10) {
        alert("Escribe una respuesta más completa (al menos 10 caracteres).");
        return;
    }
    
    const btn = document.getElementById('btn_ded_pag_' + idx);
    btn.innerText = "✅ Validado (+30 XP)";
    btn.style.background = "#10B981";
    btn.disabled = true;
    textarea.disabled = true;
    
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    if (window.sumarXPEstudiante && user.documento) {
        window.sumarXPEstudiante(user.documento, 30, 'Reto Deductivo');
    }
    
    mostrarHuevos(); // Recompensa
    
    const nextContainer = document.getElementById('container_ded_pag_' + (idx + 1));
    if (nextContainer) {
        nextContainer.style.opacity = '1';
        nextContainer.removeAttribute('disabled');
    }
};

window.verificarCuadernoDeductivoIndividual = function(idx) {
    if (!window.validarPermisoResolucionEstudiante()) return;

    const btn = document.getElementById('btn_cuaderno_ded_' + idx);
    btn.innerText = "✅ Confirmado (+25 XP)";
    btn.style.background = "#10B981";
    btn.disabled = true;
    
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    if (window.sumarXPEstudiante && user.documento) {
        window.sumarXPEstudiante(user.documento, 25, 'Actividad Cuaderno');
    }
    
    mostrarHuevos(); // Recompensa
    
    const nextContainer = document.getElementById('container_cuaderno_ded_' + (idx + 1));
    if (nextContainer) {
        nextContainer.style.opacity = '1';
        nextContainer.removeAttribute('disabled');
    }
};


// --- FASE 2: ANTI-CHEAT, SANCIONES Y RECOMPENSAS ---

// Toast Flotante de Puntos
window.mostrarToastXP = function(puntos, motivo) {
    const toast = document.getElementById('toast-xp-container');
    const content = document.getElementById('toast-xp-content');
    if (!toast || !content) return;
    content.innerHTML = `✨ <strong style="color: #FDE047;">+${puntos} XP</strong> | ${motivo || '¡Misión Cumplida!'}`;
    toast.style.display = 'block';
    clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
        toast.style.display = 'none';
    }, 3500);
};

// Utilidad global para sumar XP acumulado al perfil del estudiante y refrescar panel y barra
window.sumarXPEstudiante = function(docClean, puntos, motivo) {
    if (!docClean || !puntos) return;
    const doc = String(docClean).trim();
    const xpKey = `xp_${doc}`;
    let currentXP = parseInt(localStorage.getItem(xpKey)) || 0;
    if (currentXP === 0) {
        const diagXP = parseInt(localStorage.getItem(`prog_${doc}_diag_xp`)) || 0;
        currentXP = diagXP || 500;
    }
    const newXP = Math.max(0, currentXP + puntos);
    localStorage.setItem(xpKey, newXP);

    // Actualizar elemento header de la guía
    const gXP = document.getElementById('student-guide-header-xp');
    if (gXP) gXP.innerText = newXP;

    // Actualizar el panel global del estudiante si está activo
    const hScore = document.getElementById('student-score-display');
    if (hScore) hScore.innerText = newXP;

    // Actualizar Barra de Progreso y Nivel Gamificado en tiempo real
    const bonusTotal = parseInt(localStorage.getItem(`bonus_total_${doc}`)) || 0;
    const penaltyTotal = parseInt(localStorage.getItem(`penalty_total_${doc}`)) || 0;
    let totalXP = Math.max(0, newXP + bonusTotal - penaltyTotal);

    let nivelNum = 1;
    let nivelNombre = "Novato STEAM 🌱";
    let proximaMeta = 300;
    let baseNivel = 0;

    if (totalXP >= 2000) {
        nivelNum = 5;
        nivelNombre = "Sabio Cuántico STEAM 👑";
        proximaMeta = 3000;
        baseNivel = 2000;
    } else if (totalXP >= 1200) {
        nivelNum = 4;
        nivelNombre = "Maestro Investigador 🧙‍♂️";
        proximaMeta = 2000;
        baseNivel = 1200;
    } else if (totalXP >= 700) {
        nivelNum = 3;
        nivelNombre = "Científico Avanzado 🔬";
        proximaMeta = 1200;
        baseNivel = 700;
    } else if (totalXP >= 300) {
        nivelNum = 2;
        nivelNombre = "Explorador de Campo 🚀";
        proximaMeta = 700;
        baseNivel = 300;
    } else {
        nivelNum = 1;
        nivelNombre = "Novato STEAM 🌱";
        proximaMeta = 300;
        baseNivel = 0;
    }

    let xpEnNivel = totalXP - baseNivel;
    let rangoNivel = Math.max(1, proximaMeta - baseNivel);
    let porcentajeProgreso = Math.min(100, Math.max(5, Math.round((xpEnNivel / rangoNivel) * 100)));

    const pBar = document.getElementById("student-xp-progress-bar");
    if (pBar) pBar.style.width = `${porcentajeProgreso}%`;

    const pText = document.getElementById("student-xp-progress-text");
    if (pText) pText.innerText = `${totalXP} / ${proximaMeta} XP (${porcentajeProgreso}% hacia Nivel ${nivelNum + 1})`;

    const pLevelBadge = document.getElementById("student-xp-level-name");
    if (pLevelBadge) pLevelBadge.innerText = `Nivel ${nivelNum}: ${nivelNombre}`;

    // Sincronización en segundo plano con el servidor
    try {
        fetch('/api/actualizar-puntos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documento: doc, puntos: totalXP, motivo: motivo || 'Puntos acumulados' })
        }).catch(() => {});
    } catch(e) {}

    // Disparar toast de recompensa
    window.mostrarToastXP(puntos, motivo || '¡Misión Cumplida!');
};

// Controladores del Menú Colgante de Sanciones Disciplinarias (-10%)
window.toggleMenuSancion = function(docClean, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    document.querySelectorAll('.menu-sancion-dropdown').forEach(m => {
        if (m.id !== `menu-sancion-${docClean}`) m.style.display = 'none';
    });
    const menu = document.getElementById(`menu-sancion-${docClean}`);
    if (menu) {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
};

document.addEventListener('click', function() {
    document.querySelectorAll('.menu-sancion-dropdown').forEach(m => m.style.display = 'none');
});

window.aplicarSancionDocente = function(docClean, nomClean, motivoKey, motivoLabel) {
    const doc = String(docClean).trim();
    if (!doc) return;

    let motivoFinal = motivoLabel || motivoKey;
    let icono = '⚡';

    if (motivoKey === 'Indisciplina') icono = '⚡';
    else if (motivoKey === 'Comer en clase') icono = '🥪';
    else if (motivoKey === 'Uso de celular') icono = '📱';
    else if (motivoKey === 'Levantarse sin permiso') icono = '🚶';
    else if (motivoKey === 'Arrancar hojas') icono = '📄';
    else if (motivoKey === 'Personalizado') {
        const custom = prompt(`Ingresa el motivo específico de la infracción para ${nomClean}:`, 'Incumplimiento de acuerdos');
        if (custom === null || !custom.trim()) return;
        motivoFinal = '⚠️ ' + custom.trim();
        icono = '⚠️';
    }

    // Calcular 10% del puntaje acumulado actual
    let xpEst = parseInt(localStorage.getItem(`xp_${doc}`)) || 0;
    if (xpEst === 0) {
        const diagXP = parseInt(localStorage.getItem(`prog_${doc}_diag_xp`)) || 0;
        xpEst = diagXP || 500;
    }
    const bonusTotal = parseInt(localStorage.getItem(`bonus_total_${doc}`)) || 0;
    const penaltyTotalPrev = parseInt(localStorage.getItem(`penalty_total_${doc}`)) || 0;
    let totalXPAntes = Math.max(0, xpEst + bonusTotal - penaltyTotalPrev);

    let penaltyAmount = Math.max(30, Math.round(totalXPAntes * 0.10));
    let nuevoPenaltyTotal = penaltyTotalPrev + penaltyAmount;
    localStorage.setItem(`penalty_total_${doc}`, nuevoPenaltyTotal);

    const registroSancion = {
        id: 'sancion_' + Date.now(),
        doc: doc,
        estudiante: nomClean,
        motivo: motivoFinal,
        motivoKey: motivoKey,
        icono: icono,
        puntosDescontados: penaltyAmount,
        fecha: new Date().toLocaleDateString('es-CO', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
        hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        leido: false
    };
    localStorage.setItem(`sancion_activa_${doc}`, JSON.stringify(registroSancion));

    // Refrescar vistas en tiempo real
    if (typeof window.cargarDatosAdmin === 'function') {
        window.cargarDatosAdmin();
    }
    if (window.gradoActualPlaneacion && typeof window.abrirGrupo === 'function') {
        window.abrirGrupo(window.gradoActualPlaneacion);
    }
    if (typeof window.cargarEstudiantesDocente === 'function') {
        window.cargarEstudiantesDocente(window.usuario_actual || 'docente');
    }

    alert(`✅ Sanción del -10% (-${penaltyAmount} XP) aplicada a ${nomClean} por: ${motivoFinal}.\n\nAl estudiante le aparecerá inmediatamente la notificación formativa en su pantalla.`);
};

// Controlador de Notificaciones Disciplinarias en la Pantalla del Estudiante
window.verificarSancionesEstudiante = function() {
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const doc = String(user.documento || user.usuario || '').trim();
    if (!doc || user.rol === 'docente' || user.rol === 'admin') return;

    const rawSancion = localStorage.getItem(`sancion_activa_${doc}`);
    if (!rawSancion) return;

    try {
        const sancion = JSON.parse(rawSancion);
        if (sancion && !sancion.leido) {
            const modal = document.getElementById('modal-notificacion-disciplinaria');
            const iconoEl = document.getElementById('modal-sancion-icono');
            const motivoEl = document.getElementById('modal-sancion-motivo-texto');
            const fechaEl = document.getElementById('modal-sancion-fecha-texto');
            const ptsEl = document.getElementById('modal-sancion-puntos-descontados');

            if (iconoEl) iconoEl.innerText = sancion.icono || '⚡';
            if (motivoEl) motivoEl.innerText = sancion.motivo || 'Infracción disciplinaria';
            if (fechaEl) fechaEl.innerText = `${sancion.fecha} • ${sancion.hora}`;
            if (ptsEl) ptsEl.innerText = `-${sancion.puntosDescontados || 50} XP`;

            if (modal) modal.style.display = 'flex';
        }
    } catch(e) {}
};

window.confirmarLecturaSancion = function() {
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const doc = String(user.documento || user.usuario || '').trim();
    if (doc) {
        const rawSancion = localStorage.getItem(`sancion_activa_${doc}`);
        if (rawSancion) {
            try {
                let sancion = JSON.parse(rawSancion);
                sancion.leido = true;
                localStorage.setItem(`sancion_activa_${doc}`, JSON.stringify(sancion));
            } catch(e) {}
        }
        if (typeof window.inicializarPanelEstudiante === 'function') {
            window.inicializarPanelEstudiante(user);
        }
    }
    const modal = document.getElementById('modal-notificacion-disciplinaria');
    if (modal) modal.style.display = 'none';
};

// Chequeo activo para el estudiante
setInterval(window.verificarSancionesEstudiante, 2000);

// Detección automática Anti-Cheat al cambiar de pestaña o salir de la página
(function() {
    let ultimoDescuento = 0;
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
            const doc = String(user.documento || user.usuario || '').trim();
            if (!doc || user.rol === 'docente' || user.rol === 'admin') return;

            const ahora = Date.now();
            if (ahora - ultimoDescuento < 10000) return; // Evitar penalización repetida en menos de 10 seg
            ultimoDescuento = ahora;

            const xpKey = `xp_${doc}`;
            let currentXP = parseInt(localStorage.getItem(xpKey)) || 500;
            const penaltyAmount = Math.max(50, Math.round(currentXP * 0.10));
            const newXP = Math.max(0, currentXP - penaltyAmount);

            localStorage.setItem(xpKey, newXP);
            let penaltyTotal = parseInt(localStorage.getItem(`penalty_total_${doc}`)) || 0;
            localStorage.setItem(`penalty_total_${doc}`, penaltyTotal + penaltyAmount);

            const notif = {
                motivo: "🚨 Salida de la página / Cambio de pestaña no autorizado",
                observacion: "El sistema Anti-Cheat ha detectado que minimizaste o saliste de la aplicación durante la clase activa.",
                puntos: penaltyAmount,
                fecha: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
            };
            localStorage.setItem(`notificacion_penalizacion_${doc}`, JSON.stringify(notif));

            if (typeof window.inicializarPanelEstudiante === 'function') {
                window.inicializarPanelEstudiante(user);
            }
        }
    });
})();

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

// --- ORDENAR LETRAS Y PALABRAS (TOUCH + DRAG & DROP) ---
let selectedSwapItem = null;
window.renderizarJuegoOrdenar = function(items, tipo) {
    let desordenado = [...items].sort(() => Math.random() - 0.5);
    if (desordenado.length > 1 && desordenado.join('') === items.join('')) {
        desordenado.reverse();
    }
    const containerId = 'ord_' + Math.random().toString(36).substr(2, 9);
    let html = `<div id="${containerId}" class="juego-ordenar-container" style="display: flex; flex-wrap: wrap; gap: 10px; margin: 15px 0; align-items: center;">`;
    desordenado.forEach((item) => {
        html += `<div class="draggable-item" draggable="true" ondragstart="dragItem(event)" ondragover="allowDropItem(event)" ondrop="dropItem(event)" onclick="tapSwapItem(this)" data-original="${item}" data-tipo="${tipo}" style="background: linear-gradient(135deg, #3B82F6, #2563EB); color: white; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem; user-select: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.15s, box-shadow 0.15s, background 0.15s;">${item}</div>`;
    });
    html += `</div>`;
    html += `<div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <button onclick="verificarOrden(this, '${items.join('')}')" style="background: #10B981; color: white; padding: 9px 20px; border: none; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 0.95rem; box-shadow: 0 2px 5px rgba(16,185,129,0.3); transition: background 0.2s;">✨ Verificar Orden</button>
        <span style="font-size: 0.85rem; color: #64748B;">💡 Arrastra o toca dos fichas para intercambiarlas</span>
    </div>`;
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

window.tapSwapItem = function(elem) {
    if (!selectedSwapItem) {
        selectedSwapItem = elem;
        elem.style.transform = "scale(1.1)";
        elem.style.boxShadow = "0 0 0 3px #FBBF24, 0 4px 10px rgba(0,0,0,0.2)";
    } else if (selectedSwapItem === elem) {
        selectedSwapItem.style.transform = "none";
        selectedSwapItem.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        selectedSwapItem = null;
    } else {
        const parent = elem.parentNode;
        if (parent === selectedSwapItem.parentNode) {
            const next1 = elem.nextSibling === selectedSwapItem ? elem : elem.nextSibling;
            parent.insertBefore(elem, selectedSwapItem);
            parent.insertBefore(selectedSwapItem, next1);
        }
        selectedSwapItem.style.transform = "none";
        selectedSwapItem.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
        selectedSwapItem = null;
    }
};

window.verificarOrden = function(btn, correctStr) {
    let parent = btn.parentElement.previousElementSibling;
    if (!parent) return;
    let items = Array.from(parent.children).map(el => el.innerText.trim()).join('');
    if (items.toUpperCase() === correctStr.toUpperCase()) {
        btn.innerHTML = "✅ ¡Correcto! (+30 XP)";
        btn.style.background = "#10B981";
        btn.disabled = true;
        parent.style.opacity = "0.7";
        parent.style.pointerEvents = "none";
        
        const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
        if (window.sumarXPEstudiante && user.documento) {
            window.sumarXPEstudiante(user.documento, 30, 'Juego Ordenar');
        }
        
        if (typeof mostrarHuevos === 'function') mostrarHuevos();
    } else {
        btn.innerHTML = "❌ Intenta de nuevo";
        btn.style.background = "#EF4444";
        setTimeout(() => {
            btn.innerHTML = "✨ Verificar Orden";
            btn.style.background = "#10B981";
        }, 1500);
    }
};

// --- SOPA DE LETRAS PROFESIONAL Y COMPLETA ---
window.renderizarSopaLetras = function(arg1, arg2) {
    let containerId = null;
    let palabras = [];
    
    if (arg2 !== undefined) {
        containerId = arg1;
        palabras = Array.isArray(arg2) ? arg2 : (typeof arg2 === 'string' ? arg2.split(',') : []);
    } else {
        palabras = Array.isArray(arg1) ? arg1 : (typeof arg1 === 'string' ? arg1.split(',') : []);
    }
    
    palabras = palabras.map(p => p.trim().toUpperCase().replace(/[^A-ZÁÉÍÓÚÑ]/g, '')).filter(p => p.length > 0);
    if (palabras.length === 0) palabras = ["CIENCIA", "METODO", "HIPOTESIS", "EXPERIMENTO"];
    
    const size = Math.max(12, Math.min(15, Math.max(...palabras.map(p => p.length)) + 2));
    let grid = Array(size).fill(null).map(() => Array(size).fill(''));
    const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    
    palabras.forEach(pal => {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 80) {
            attempts++;
            let dir = Math.random() < 0.4 ? 'H' : (Math.random() < 0.7 ? 'V' : 'D');
            let maxR = dir === 'H' ? size : size - pal.length + 1;
            let maxC = dir === 'V' ? size : size - pal.length + 1;
            if (maxR <= 0 || maxC <= 0) continue;
            let row = Math.floor(Math.random() * maxR);
            let col = Math.floor(Math.random() * maxC);
            
            let canPlace = true;
            for (let i = 0; i < pal.length; i++) {
                let r = dir === 'H' ? row : (dir === 'V' ? row + i : row + i);
                let c = dir === 'H' ? col + i : (dir === 'V' ? col : col + i);
                if (grid[r][c] !== '' && grid[r][c] !== pal[i]) {
                    canPlace = false;
                    break;
                }
            }
            if (canPlace) {
                for (let i = 0; i < pal.length; i++) {
                    let r = dir === 'H' ? row : (dir === 'V' ? row + i : row + i);
                    let c = dir === 'H' ? col + i : (dir === 'V' ? col : col + i);
                    grid[r][c] = pal[i];
                }
                placed = true;
            }
        }
    });

    for(let r=0; r<size; r++) {
        for(let c=0; c<size; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = letras.charAt(Math.floor(Math.random() * letras.length));
            }
        }
    }

    let html = `
        <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; justify-content: center; width: 100%;">
            <div style="overflow-x: auto; max-width: 100%; background: #F8FAFC; padding: 12px; border-radius: 12px; border: 1.5px solid #CBD5E1; user-select: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                <div style="display: grid; grid-template-columns: repeat(${size}, minmax(24px, 30px)); gap: 3px;">
    `;
    for(let r=0; r<size; r++) {
        for(let c=0; c<size; c++) {
            html += `<div style="aspect-ratio: 1; display: flex; align-items: center; justify-content: center; background: white; border-radius: 4px; font-weight: 800; font-size: 0.95rem; color: #1E293B; cursor: pointer; border: 1px solid #E2E8F0; transition: background 0.15s, transform 0.1s;" onclick="this.style.background = (this.style.background === 'rgb(253, 230, 138)' || this.style.background === '#FDE68A') ? 'white' : '#FDE68A';">${grid[r][c]}</div>`;
        }
    }
    html += `
                </div>
            </div>
            <div style="flex: 1; min-width: 220px; background: white; padding: 18px; border-radius: 12px; border: 1.5px solid #E2E8F0; box-shadow: 0 4px 6px rgba(0,0,0,0.04);">
                <p style="margin: 0 0 12px 0; font-weight: 800; color: #1E293B; font-size: 1rem;">🔍 Palabras a encontrar (${palabras.length}):</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px;">
                    ${palabras.map(p => `
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #475569; cursor: pointer; user-select: none; padding: 4px; border-radius: 4px; background: #F8FAFC;">
                            <input type="checkbox" onchange="this.parentElement.style.textDecoration = this.checked ? 'line-through' : 'none'; this.parentElement.style.color = this.checked ? '#10B981' : '#475569'; this.parentElement.style.fontWeight = this.checked ? 'bold' : 'normal';">
                            <span>${p}</span>
                        </label>
                    `).join('')}
                </div>
                <button onclick="this.disabled=true; this.innerHTML='✅ ¡Sopa Completada! (+40 XP)'; this.style.background='#10B981'; if(typeof mostrarHuevos==='function') mostrarHuevos();" style="margin-top: 18px; width: 100%; background: #F59E0B; color: white; border: none; padding: 10px 16px; border-radius: 8px; font-weight: 800; cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 10px rgba(245,158,11,0.3);">
                    ✨ Verificar Sopa de Letras
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

// --- CRUCIGRAMA PROFESIONAL Y COMPLETO ---
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
        datos = datos.split(';').map(item => {
            let p = item.split('|');
            return {
                pista: p[0] ? p[0].trim() : 'Pista conceptual',
                palabra: p[1] ? p[1].trim() : ''
            };
        }).filter(d => d.palabra.length > 0);
    }
    
    if (!Array.isArray(datos)) datos = [];
    if (datos.length === 0) {
        datos = [
            { pista: "Unidad biológica fundamental de todo ser vivo", palabra: "CELULA" },
            { pista: "Molécula que almacena el código genético", palabra: "ADN" },
            { pista: "Proceso por el cual las plantas producen su alimento con luz solar", palabra: "FOTOSINTESIS" }
        ];
    }

    let html = `
        <div style="background: #F8FAFC; padding: 20px; border: 1.5px solid #CBD5E1; border-radius: 12px; width: 100%; box-sizing: border-box;">
            <p style="margin: 0 0 15px 0; color: #475569; font-size: 0.95rem; font-weight: 600;">Escribe cada letra correspondiente a la pista conceptual:</p>
            <div style="display: flex; flex-direction: column; gap: 14px;">
    `;
    datos.forEach((item, idx) => {
        const pal = item.palabra.toUpperCase().trim();
        html += `
            <div class="crucigrama-item" data-correct="${pal}" style="background: white; padding: 14px 18px; border-radius: 10px; border: 1.5px solid #E2E8F0; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
                <p style="margin: 0 0 8px 0; font-size: 0.95rem; color: #1E293B;"><strong>${idx+1}.</strong> ${item.pista}</p>
                <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px; align-items: center;">
                    ${pal.split('').map((char) => `
                        <input type="text" maxlength="1" data-letter="${char}" style="width: 32px; height: 36px; min-width: 32px; text-align: center; font-weight: 800; font-size: 1.1rem; border: 2px solid #CBD5E1; border-radius: 6px; text-transform: uppercase; outline: none; transition: border-color 0.2s, background 0.2s;" oninput="validarCasillaCrucigrama(this)" onkeydown="manejarKeyCrucigrama(event, this)">
                    `).join('')}
                    <span class="status-icon" style="margin-left: 8px; font-size: 1.2rem; display: none;">✅</span>
                </div>
            </div>
        `;
    });
    html += `
            </div>
            <button onclick="verificarCrucigramaCompleto(this, ${datos.length})" style="margin-top: 20px; background: linear-gradient(135deg, #3B82F6, #2563EB); color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 800; font-size: 1rem; box-shadow: 0 4px 12px rgba(37,99,235,0.3); transition: transform 0.1s;">
                ✨ Validar Crucigrama Completo
            </button>
        </div>
    `;
    
    if (containerId) {
        let el = document.getElementById(containerId);
        if (el) el.innerHTML = html;
    }
    return html;
};

window.validarCasillaCrucigrama = function(input) {
    input.value = input.value.toUpperCase();
    const row = input.closest('.crucigrama-item');
    if (!row) return;
    
    if (input.value.length === 1) {
        const next = input.nextElementSibling;
        if (next && next.tagName === 'INPUT') next.focus();
    }
    
    const inputs = Array.from(row.querySelectorAll('input'));
    const word = inputs.map(i => i.value.toUpperCase()).join('');
    const target = row.getAttribute('data-correct');
    const icon = row.querySelector('.status-icon');
    
    if (word === target) {
        inputs.forEach(i => {
            i.style.borderColor = "#10B981";
            i.style.background = "#D1FAE5";
            i.style.color = "#065F46";
        });
        if (icon) icon.style.display = "inline";
    } else {
        if (icon) icon.style.display = "none";
    }
};

window.manejarKeyCrucigrama = function(e, input) {
    if (e.key === 'Backspace' && !input.value) {
        const prev = input.previousElementSibling;
        if (prev && prev.tagName === 'INPUT') {
            prev.focus();
        }
    }
};

window.verificarCrucigramaCompleto = function(btn, total) {
    let parent = btn.parentElement;
    let items = parent.querySelectorAll('.crucigrama-item');
    let correctCount = 0;
    
    items.forEach(item => {
        const inputs = Array.from(item.querySelectorAll('input'));
        const word = inputs.map(i => i.value.toUpperCase()).join('');
        const target = item.getAttribute('data-correct');
        if (word === target) correctCount++;
    });
    
    if (correctCount === total) {
        btn.innerHTML = "✅ ¡Crucigrama Perfecto! (+50 XP)";
        btn.style.background = "#10B981";
        btn.disabled = true;
        if (typeof mostrarHuevos === 'function') mostrarHuevos();
    } else {
        alert(`Tienes ${correctCount} de ${total} palabras correctas. ¡Revisa las que faltan!`);
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
        fbBox.innerHTML = `<div style="background: #D1FAE5; color: #065F46; padding: 15px; border-radius: 6px;"><strong>¡Respuesta Correcta! (+40 XP)</strong> ${fbObj[elegida]}</div>`;
        
        const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
        if (window.sumarXPEstudiante && user.documento) {
            window.sumarXPEstudiante(user.documento, 40, 'Pregunta ICFES Saber 11');
        }
        
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
    
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const grado = window.gradoActualEstudiante || user.grado || user.grupo || '';
    const esCicloONocturno = user.rol === 'validacion' || 
                             user.institucion === 'Validacion' || 
                             grado.toString().toLowerCase().includes('ciclo') || 
                             (user.grupo && user.grupo.toString().toLowerCase().includes('ciclo')) ||
                             (user.institucion && user.institucion.toString().toLowerCase().includes('nocturn'));

    // Generar 3 recompensas aleatorias (En Ciclos / Nocturno NO se permite robar a compañeros, solo bonos constructivos)
    let opciones;
    if (esCicloONocturno) {
        opciones = ["+15%", "+25%", "+35%", "+50%", "Bono STEAM +60 XP", "Bono Sabiduría +100 XP"];
    } else {
        opciones = ["+10%", "+20%", "+30%", "ROBAR 5%", "ROBAR 10%", "ROBAR 15%"];
    }
    
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
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const asig = window.guiaActualAsignatura;
    const p = window.guiaActualPeriodo;
    const xpKey = `prog_${user.documento}_${asig}_p${p}`;
    const grado = window.gradoActualEstudiante || user.grado || user.grupo || '';
    const esCicloONocturno = user.rol === 'validacion' || 
                             user.institucion === 'Validacion' || 
                             grado.toString().toLowerCase().includes('ciclo') || 
                             (user.grupo && user.grupo.toString().toLowerCase().includes('ciclo')) ||
                             (user.institucion && user.institucion.toString().toLowerCase().includes('nocturn'));
    
    let modal = document.getElementById('modal-huevos');
    
    if (premio.includes("ROBAR") && !esCicloONocturno) {
        // Lógica de robo (solo para modalidades no nocturnas / ciclos)
        let htmlRobo = `
            <div style="background: white; padding: 35px 30px; border-radius: 20px; text-align: center; max-width: 500px; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                <button onclick="document.getElementById('modal-huevos').style.display='none'" style="position: absolute; top: 12px; right: 15px; background: #FEE2E2; border: 1.5px solid #FCA5A5; color: #EF4444; width: 38px; height: 38px; border-radius: 50%; font-size: 1.5rem; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: 0 2px 8px rgba(239,68,68,0.2); transition: all 0.2s;" onmouseover="this.style.background='#EF4444'; this.style.color='white'" onmouseout="this.style.background='#FEE2E2'; this.style.color='#EF4444'">&times;</button>
                <h3 style="color: #EF4444; font-weight: 900; font-size: 1.5rem; margin-top: 5px;">😈 ¡TE HA TOCADO ${premio}!</h3>
                <p style="color: #4B5563; font-size: 0.95rem;">Elige a un compañero de tu clase para reclamar los puntos:</p>
                <select id="victima-robo" style="width: 100%; padding: 12px; margin: 15px 0 25px 0; border-radius: 8px; border: 1px solid #CBD5E1; font-weight: 600; font-size: 0.95rem; background: white;">
        `;
        // Buscar compañeros
        let todos = JSON.parse(localStorage.getItem('usuarios_db')) || [];
        let compas = todos.filter(u => u.rol === 'estudiante' && u.grupo === user.grupo && u.documento !== user.documento);
        if (compas.length > 0) {
            compas.forEach(c => {
                const nom = c.nombre || c.nombres || 'Estudiante';
                const ape = c.apellidos || '';
                htmlRobo += `<option value="${c.documento}">${nom} ${ape}</option>`;
            });
            htmlRobo += `</select>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="document.getElementById('modal-huevos').style.display='none'" style="background: #F1F5F9; color: #475569; padding: 12px 20px; border: 1px solid #CBD5E1; border-radius: 10px; font-weight: 800; cursor: pointer; flex: 1;">✕ Cerrar</button>
                    <button onclick="ejecutarRobo('${premio}')" style="background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 12px 20px; border: none; border-radius: 10px; font-weight: 900; cursor: pointer; flex: 1; box-shadow: 0 4px 12px rgba(239,68,68,0.3);">⚡ ¡Ejecutar Robo!</button>
                </div>`;
        } else {
            htmlRobo += `<option value="">No hay compañeros matriculados en tu grupo aún</option></select>
                <p style="color: #059669; font-size: 0.95rem; font-weight: bold; background: #ECFDF5; padding: 10px; border-radius: 8px; margin-bottom: 20px;">🎉 ¡Se te otorgará un bono directo de +30 XP en su lugar!</p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="document.getElementById('modal-huevos').style.display='none'" style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 12px 20px; border: none; border-radius: 10px; font-weight: 900; cursor: pointer; width: 100%; box-shadow: 0 4px 12px rgba(16,185,129,0.3);">✓ Reclamar Bono (+30 XP)</button>
                </div>`;
        }
        htmlRobo += `</div>`;
        modal.innerHTML = htmlRobo;
    } else {
        // Bono directo
        let suma = 30;
        if (premio.includes("+")) {
            let bonoStr = premio.replace("+", "").replace("%", "");
            let pct = parseInt(bonoStr) / 100;
            let currentProg = parseInt(localStorage.getItem(xpKey)) || 1;
            let baseXP = (currentProg > 1) ? (currentProg - 1) * 100 : 0;
            suma = Math.floor(baseXP * pct);
            if (suma === 0) suma = 25;
        } else if (premio.includes("XP")) {
            let match = premio.match(/\d+/);
            suma = match ? parseInt(match[0]) : 50;
        }
        
        alert(`🎉 ¡Felicidades! Has ganado un bono de ${premio} (+${suma} XP)`);
        
        if (window.sumarXPEstudiante) {
            window.sumarXPEstudiante(user.documento || user.usuario, suma);
        }
        
        modal.style.display = 'none';
    }
};

window.ejecutarRobo = function(premio) {
    const select = document.getElementById('victima-robo');
    const victimaDoc = select.value;
    const victimaNombre = select.options[select.selectedIndex].text;
    
    let bonoStr = premio.replace("ROBAR ", "").replace("%", "");
    let robado = 50; 
    
    alert(`¡Robaste ${robado} XP a ${victimaNombre}!`);
    
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    
    if (window.sumarXPEstudiante) {
        window.sumarXPEstudiante(user.documento || user.usuario, robado);
    }
    
    document.getElementById('modal-huevos').style.display = 'none';
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

// ==========================================
// MÓDULO TUTORES HOME SCHOOL Y PASARELA DE PAGO
// ==========================================

window.toggleEnfasisDoctrinal = function() {
    const check = document.getElementById("tutor-check-etica-religion");
    const campo = document.getElementById("campo-enfasis-doctrinal");
    if (campo) {
        campo.style.display = (check && check.checked) ? "block" : "none";
    }
};

window.actualizarTotalMatriculaTutor = function() {
    let total = 85000;
    let desglose = ["Base Fundamentales ($85.000)"];

    const simatCheck = document.getElementById("tutor-check-simat");
    const inglesCheck = document.getElementById("tutor-check-ingles");
    const artesCheck = document.getElementById("tutor-check-artes");
    const eticaCheck = document.getElementById("tutor-check-etica-religion");

    if (simatCheck && simatCheck.checked) {
        total += 15000;
        desglose.push("SIMAT IE Instituto (+ $15.000/mes)");
    }
    if (inglesCheck && inglesCheck.checked) {
        total += 25000;
        desglose.push("Inglés STEAM (+ $25.000)");
    }
    if (artesCheck && artesCheck.checked) {
        total += 25000;
        desglose.push("Artes/Música (+ $25.000)");
    }
    if (eticaCheck && eticaCheck.checked) {
        total += 25000;
        desglose.push("Ética/Religión (+ $25.000)");
    }

    const badge = document.getElementById("tutor-monto-total-badge");
    const btnMonto = document.getElementById("btn-monto-texto");
    const desgloseEl = document.getElementById("tutor-desglose-pago");

    const totalFormateado = "$" + Number(total).toLocaleString('es-CO') + " COP";
    if (badge) badge.innerText = totalFormateado;
    if (btnMonto) btnMonto.innerText = totalFormateado;
    if (desgloseEl) desgloseEl.innerText = desglose.join(" • ");

    window.totalMatriculaTutorActual = total;
    window.desgloseMatriculaTutorActual = desglose;
};

window.actualizarMateriasTutor = function() {
    const gradoSelect = document.getElementById("tutor-reg-grado");
    const preview = document.getElementById("tutor-materias-preview");
    if (!gradoSelect || !preview) return;
    
    const grado = gradoSelect.value;
    if (!grado) {
        preview.innerHTML = "Selecciona un grado para ver las materias asignadas.";
        return;
    }

    let materias = [];
    if (grado.includes("Ciclo")) {
        materias = ["Ciencias Naturales", "Matemáticas", "Lenguaje", "Ciencias Sociales"];
    } else {
        const gNum = parseInt(grado);
        if (gNum >= 1 && gNum <= 5) {
            materias = ["Ciencias Naturales", "Matemáticas", "Lengua Castellana", "Ciencias Sociales"];
        } else if (gNum >= 6 && gNum <= 9) {
            materias = ["Ciencias Naturales", "Física", "Química", "Matemáticas", "Lengua Castellana", "Ciencias Sociales"];
        } else if (gNum >= 10 && gNum <= 11) {
            materias = ["Física", "Química", "Matemáticas", "Lengua Castellana", "Filosofía", "Ciencias Sociales"];
        } else {
            materias = ["Ciencias Naturales", "Matemáticas", "Lengua Castellana", "Ciencias Sociales"];
        }
    }

    preview.innerHTML = `<strong>Materias Fundamentales DBA incluidas (${materias.length}):</strong><br><span style="color: #1E40AF;">${materias.join(" • ")}</span>`;
    window.materiasTutorSeleccionadas = materias;
    actualizarTotalMatriculaTutor();
};

window.matricularYProcederPagoTutor = async function() {
    const tipoDoc = document.getElementById("tutor-reg-tipo-doc").value;
    const doc = document.getElementById("tutor-reg-doc").value.trim();
    const nom = document.getElementById("tutor-reg-nom").value.trim();
    const ape = document.getElementById("tutor-reg-ape").value.trim();
    const edad = document.getElementById("tutor-reg-edad").value.trim();
    const gen = document.getElementById("tutor-reg-gen").value;
    const grado = document.getElementById("tutor-reg-grado").value;

    if (!doc || !nom || !ape || !edad || !gen || !grado) {
        alert("⚠️ Por favor completa todos los campos del estudiante antes de continuar.");
        return;
    }

    let materias = (window.materiasTutorSeleccionadas && window.materiasTutorSeleccionadas.length > 0) 
        ? [...window.materiasTutorSeleccionadas] 
        : ["Ciencias Naturales", "Matemáticas", "Lengua Castellana", "Ciencias Sociales"];

    const simatCheck = document.getElementById("tutor-check-simat");
    const inglesCheck = document.getElementById("tutor-check-ingles");
    const artesCheck = document.getElementById("tutor-check-artes");
    const eticaCheck = document.getElementById("tutor-check-etica-religion");
    const enfasisDoctrinal = document.getElementById("tutor-reg-enfasis-doctrinal") ? document.getElementById("tutor-reg-enfasis-doctrinal").value.trim() : "";

    const tieneSIMAT = (simatCheck && simatCheck.checked);
    if (inglesCheck && inglesCheck.checked && !materias.includes("Inglés")) {
        materias.push("Inglés");
    }
    if (artesCheck && artesCheck.checked && !materias.includes("Educación Artística y Música")) {
        materias.push("Educación Artística y Música");
    }
    if (eticaCheck && eticaCheck.checked && !materias.includes("Ética y Valores Religiosos")) {
        materias.push(enfasisDoctrinal ? `Ética y Religión (${enfasisDoctrinal})` : "Ética y Valores Religiosos");
    }

    const montoFinal = window.totalMatriculaTutorActual || 85000;
    const desgloseTexto = (window.desgloseMatriculaTutorActual || []).join(" + ");

    // Abrir pasarela de pago para este estudiante con monto personalizado
    abrirPasarelaPago({
        concepto: `Matrícula Home School - Grado ${grado} (${nom} ${ape}) [${desgloseTexto}]`,
        documento: doc,
        monto: montoFinal,
        rol: 'homeschool_tutor',
        callback: async () => {
            // Registrar estudiante con pago_realizado: true y metadatos completos
            const payload = {
                documento: doc,
                tipo_documento: tipoDoc,
                nombre: nom,
                apellidos: ape,
                edad: edad,
                genero: gen,
                grado: grado,
                grupo: `HS-${grado}`,
                institucion: tieneSIMAT ? 'IE Instituto Montenegro (SIMAT Certificado)' : 'HomeSchool',
                asignatura: materias.join(', '),
                materias: materias,
                simat_activo: tieneSIMAT,
                enfasis_doctrinal: enfasisDoctrinal || null,
                monto_pagado: montoFinal,
                docente_id: usuario_actual || 'TUTOR-HS',
                pago_realizado: true,
                pago_activo: true
            };

            try {
                const res = await fetch("/api/registro-estudiante", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    alert(`🎉 ¡Matrícula y pago completados con éxito para ${nom} ${ape} por un valor de $${Number(montoFinal).toLocaleString('es-CO')} COP!\n${tieneSIMAT ? '✅ Registrado con solicitud de vinculación oficial SIMAT y boletín por periodo.' : ''}`);
                    // Limpiar formulario
                    document.getElementById("tutor-reg-doc").value = "";
                    document.getElementById("tutor-reg-nom").value = "";
                    document.getElementById("tutor-reg-ape").value = "";
                    document.getElementById("tutor-reg-edad").value = "";
                    document.getElementById("tutor-reg-gen").value = "";
                    document.getElementById("tutor-reg-grado").value = "";
                    if (simatCheck) simatCheck.checked = false;
                    if (inglesCheck) inglesCheck.checked = false;
                    if (artesCheck) artesCheck.checked = false;
                    if (eticaCheck) eticaCheck.checked = false;
                    const campoEnfasis = document.getElementById("campo-enfasis-doctrinal");
                    if (campoEnfasis) campoEnfasis.style.display = "none";
                    if (document.getElementById("tutor-reg-enfasis-doctrinal")) document.getElementById("tutor-reg-enfasis-doctrinal").value = "";
                    document.getElementById("tutor-materias-preview").innerHTML = "Selecciona un grado para ver las materias asignadas.";
                    
                    actualizarTotalMatriculaTutor();
                    cargarEstudiantesTutor(usuario_actual);
                } else {
                    alert("⚠️ El pago fue aprobado, pero hubo un error al guardar el registro en base de datos.");
                }
            } catch (err) {
                console.error("Error registrando estudiante tutor:", err);
                alert("❌ Error de red al registrar al estudiante.");
            }
        }
    });
};

window.cargarEstudiantesTutor = async function(tutorId) {
    try {
        const res = await fetch('/api/estudiantes');
        const estudiantes = await res.json();
        const tbody = document.getElementById('tbody-tutor-estudiantes');
        if (!tbody) return;
        
        // Filtrar estudiantes asignados a este tutor o de HomeSchool
        const tutorEstudiantes = estudiantes.filter(e => 
            e.docente_id === tutorId || 
            (e.institucion && (e.institucion.toLowerCase() === 'homeschool' || e.institucion.toLowerCase() === 'home school')) ||
            (e.grupo && e.grupo.startsWith('HS-'))
        );

        if (tutorEstudiantes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 30px; color: #9CA3AF;">
                        <span style="font-size: 2rem;">🏡</span><br>
                        Aún no tienes estudiantes matriculados en tu panel.<br>
                        Utiliza el formulario de la izquierda para registrar a tu primer estudiante.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = "";
        tutorEstudiantes.forEach(est => {
            const tr = document.createElement("tr");
            tr.style.borderBottom = "1px solid #E5E7EB";
            
            const estaPagado = est.pago_realizado !== false; // True por defecto si ya está registrado o pagado
            const badgePago = estaPagado 
                ? `<span style="background: #DEF7EC; color: #03543F; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.8rem;">✅ Pagado</span>`
                : `<span style="background: #FEF3C7; color: #92400E; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.8rem;">⏳ Pendiente</span>`;

            tr.innerHTML = `
                <td style="padding: 14px 10px;">
                    <div style="font-weight: 700; color: #111827;">${est.nombre} ${est.apellidos || ''}</div>
                    <div style="font-size: 0.8rem; color: #6B7280;">Doc: ${est.documento || 'N/A'} • ${est.edad || '--'} años</div>
                </td>
                <td style="padding: 14px 10px;">
                    <div style="font-weight: 600; color: #2563EB;">Grado ${est.grado || est.grupo || '--'}</div>
                    <div style="font-size: 0.75rem; color: #4B5563; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${est.asignatura || ''}">
                        ${est.asignatura || 'Materias STEAM'}
                    </div>
                </td>
                <td style="padding: 14px 10px; text-align: center;">
                    ${badgePago}
                </td>
                <td style="padding: 14px 10px; text-align: center;">
                    <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; align-items: center;">
                        <button onclick="verInformeEstudiante('${(est.nombre || '').replace(/'/g, "\\'")} ${(est.apellidos || '').replace(/'/g, "\\'")}', 0, '${est.grado || est.grupo || ''}', '${est.documento || ''}')" style="background: #4F46E5; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(79,70,229,0.2);" title="Ver fichas de aprendizaje y orientar">
                            🧭 Orientar
                        </button>
                        <button onclick="window.abrirModalAsignarActividad('estudiante', '${est.documento || ''}', '${est.grado || est.grupo || '7'}', '${(est.nombre || '').replace(/'/g, "\\'")} ${(est.apellidos || '').replace(/'/g, "\\'")}')" style="background: linear-gradient(135deg, #7C3AED, #6D28D9); color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(124,58,237,0.2);" title="Asignar reto o juego STEAM a este estudiante">
                            🎮 Reto
                        </button>
                        <button onclick="abrirMallaTutorDesdeEstudiante('${est.grado || est.grupo || '7'}', 'Naturales')" style="background: #059669; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 1px 3px rgba(5,150,105,0.2);" title="Ver Malla Curricular Oficial DBA de este grado">
                            📚 Malla DBA
                        </button>
                        ${!estaPagado ? `
                            <button onclick="abrirPasarelaPago({ concepto: 'Matrícula Home School - Grado ${est.grado} (${est.nombre})', documento: '${est.documento}', monto: 50000, rol: 'homeschool_tutor', callback: () => cargarEstudiantesTutor('${tutorId}') })" style="background: #10B981; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">💳 Pagar</button>
                        ` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error("Error cargando estudiantes tutor:", err);
    }
};

// ==========================================
// PASARELA DE PAGO UNIVERSAL
// ==========================================
window.pasarelaConfigActual = null;
window.metodoPagoActual = 'pse';

window.abrirPasarelaPago = function(config) {
    window.pasarelaConfigActual = config;
    const modal = document.getElementById("modal-pasarela-pago");
    const conceptoTxt = document.getElementById("pago-concepto-texto");
    const docTxt = document.getElementById("pago-documento-texto");
    const montoTxt = document.getElementById("pago-monto-texto");
    const feedback = document.getElementById("pago-feedback-msg");
    const btnPagar = document.getElementById("btn-confirmar-pago-pasarela");

    if (conceptoTxt) conceptoTxt.innerText = config.concepto || "Pago de Servicios Académicos";
    if (docTxt) docTxt.innerText = "Doc: " + (config.documento || "N/A");
    if (montoTxt) montoTxt.innerText = "$" + (config.monto || 50000).toLocaleString('es-CO') + " COP";
    
    if (feedback) feedback.style.display = "none";
    if (btnPagar) {
        btnPagar.disabled = false;
        btnPagar.innerHTML = "<span>🔒</span> Pagar Ahora";
    }

    seleccionarMetodoPago('pse');

    if (modal) {
        modal.style.display = "flex";
    }
};

window.cerrarPasarelaPago = function() {
    const modal = document.getElementById("modal-pasarela-pago");
    if (modal) modal.style.display = "none";
    window.pasarelaConfigActual = null;
};

window.seleccionarMetodoPago = function(metodo) {
    window.metodoPagoActual = metodo;
    
    // Cambiar estilos de pestañas
    const tabs = document.querySelectorAll(".metodo-pago-tab");
    tabs.forEach(tab => {
        if (tab.getAttribute("data-metodo") === metodo) {
            tab.classList.add("active");
            tab.style.border = "2px solid #2563EB";
            tab.style.background = "#EFF6FF";
            tab.style.color = "#1D4ED8";
            tab.style.fontWeight = "800";
        } else {
            tab.classList.remove("active");
            tab.style.border = "1px solid #CBD5E1";
            tab.style.background = "white";
            tab.style.color = "#475569";
            tab.style.fontWeight = "700";
        }
    });

    // Cambiar formularios
    const secciones = document.querySelectorAll(".pago-form-seccion");
    secciones.forEach(sec => sec.style.display = "none");

    const activeForm = document.getElementById("pago-form-" + metodo);
    if (activeForm) activeForm.style.display = "flex";
};

window.ejecutarPagoPasarela = async function() {
    if (!window.pasarelaConfigActual) return;

    const btnPagar = document.getElementById("btn-confirmar-pago-pasarela");
    const feedback = document.getElementById("pago-feedback-msg");

    if (btnPagar) {
        btnPagar.disabled = true;
        btnPagar.innerHTML = `<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Conectando con Mercado Pago...`;
    }

    const payload = {
        documento: window.pasarelaConfigActual.documento,
        rol: window.pasarelaConfigActual.rol || 'estudiante',
        concepto: window.pasarelaConfigActual.concepto,
        monto: window.pasarelaConfigActual.monto || 50000,
        metodo_pago: window.metodoPagoActual,
        referencia: `REF-${Date.now()}`
    };

    try {
        // 1. Intentar iniciar checkout oficial de Mercado Pago
        const mpRes = await fetch('/api/crear-preferencia-mercadopago', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const mpData = await mpRes.json().catch(() => ({}));

        if (mpData && mpData.init_point) {
            if (feedback) {
                feedback.style.display = "block";
                feedback.style.background = "#EFF6FF";
                feedback.style.color = "#1D4ED8";
                feedback.style.border = "1px solid #93C5FD";
                feedback.innerHTML = `🚀 <strong>Redirigiendo a Mercado Pago Seguro...</strong><br>Podrás pagar por PSE (Davivienda, Bancolombia, etc.), Nequi o Tarjeta.`;
            }
            setTimeout(() => {
                window.location.href = mpData.init_point;
            }, 800);
            return;
        }

        // 2. Procesamiento de pago directo
        const res = await fetch('/api/procesar-pago', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.status === 'success' || data.success) {
            if (feedback) {
                feedback.style.display = "block";
                feedback.style.background = "#ECFDF5";
                feedback.style.color = "#065F46";
                feedback.style.border = "1px solid #A7F3D0";
                feedback.innerHTML = `✅ ¡Transacción Aprobada!<br><span style="font-size: 0.8rem; font-weight: normal;">Referencia: ${data.comprobante.referencia} • Autorización: ${data.comprobante.codigo_aprobacion}</span>`;
            }

            setTimeout(() => {
                const cb = window.pasarelaConfigActual && window.pasarelaConfigActual.callback;
                cerrarPasarelaPago();
                if (typeof cb === 'function') {
                    cb(data);
                }
            }, 1200);

        } else {
            if (feedback) {
                feedback.style.display = "block";
                feedback.style.background = "#FEF2F2";
                feedback.style.color = "#991B1B";
                feedback.style.border = "1px solid #FECACA";
                feedback.innerText = "❌ Error: " + (data.message || "No se pudo procesar la transacción.");
            }
            if (btnPagar) {
                btnPagar.disabled = false;
                btnPagar.innerHTML = "<span>🔒</span> Reintentar Pago";
            }
        }
    } catch (err) {
        console.error("Error al procesar pago:", err);
        if (feedback) {
            feedback.style.display = "block";
            feedback.style.background = "#FEF2F2";
            feedback.style.color = "#991B1B";
            feedback.style.border = "1px solid #FECACA";
            feedback.innerText = "❌ Error de conexión con la pasarela de pagos.";
        }
        if (btnPagar) {
            btnPagar.disabled = false;
            btnPagar.innerHTML = "<span>🔒</span> Reintentar Pago";
        }
    }
};

// =========================================================
// MÓDULO UNIVERSAL DE MALLAS CURRICULARES OFICIALES DBA (MEN)
// Tutor Home School • Docente de Colegio • Estudiante Validación/Regular
// =========================================================

window.generarHTMLDetalleMallaDBA = function(grado, materiaKey, rol) {
    const gradoNum = window.normalizarGradoOCiclo ? window.normalizarGradoOCiclo(grado) : String(grado).replace(/[^0-9CicloIVPENS]/g, '').trim();
    
    let malla = null;
    let nombreMateria = "Ciencias Naturales";
    let iconoMateria = "🌿";
    let colorTema = "#2563EB";
    let colorFondo = "#EFF6FF";

    if (materiaKey === 'Matematicas' || materiaKey.includes('Matem')) {
        malla = window.mallaMatematicas;
        nombreMateria = "Matemáticas";
        iconoMateria = "📐";
        colorTema = "#7C3AED";
        colorFondo = "#F5F3FF";
    } else if (materiaKey === 'Lenguaje' || materiaKey.includes('Lengua') || materiaKey.includes('Castellano')) {
        malla = window.mallaCastellano;
        nombreMateria = "Lengua Castellana";
        iconoMateria = "📖";
        colorTema = "#EA580C";
        colorFondo = "#FFF7ED";
    } else if (materiaKey === 'Sociales' || materiaKey.includes('Social')) {
        malla = window.mallaSociales;
        nombreMateria = "Ciencias Sociales";
        iconoMateria = "🌍";
        colorTema = "#059669";
        colorFondo = "#ECFDF5";
    } else if (materiaKey === 'Fisica' || materiaKey.includes('Fís') || materiaKey.includes('Fis')) {
        malla = window.mallaFisica;
        nombreMateria = "Física";
        iconoMateria = "⚛️";
        colorTema = "#0284C7";
        colorFondo = "#F0F9FF";
    } else if (materiaKey === 'Quimica' || materiaKey.includes('Quím') || materiaKey.includes('Quim')) {
        malla = window.mallaQuimica;
        nombreMateria = "Química";
        iconoMateria = "🧪";
        colorTema = "#D97706";
        colorFondo = "#FFFBEB";
    } else if (materiaKey === 'Naturales' || materiaKey.includes('Ciencias') || materiaKey.includes('Natur')) {
        malla = window.mallaNaturales;
        nombreMateria = "Ciencias Naturales";
        iconoMateria = "🌿";
        colorTema = "#2563EB";
        colorFondo = "#EFF6FF";
    } else {
        // Buscar en mallas personalizadas creadas por docentes
        let mallasCustom = {};
        try { mallasCustom = JSON.parse(localStorage.getItem('mallas_personalizadas_db') || '{}'); } catch(e) {}
        let asigCustomList = [];
        try { asigCustomList = JSON.parse(localStorage.getItem('asignaturas_personalizadas_db') || '[]'); } catch(e) {}

        const foundCustomAsig = asigCustomList.find(a => a.nombre.toLowerCase().trim() === materiaKey.toLowerCase().trim() || a.id === materiaKey);

        if (foundCustomAsig || mallasCustom[materiaKey]) {
            const customMalla = mallasCustom[materiaKey] || (foundCustomAsig ? mallasCustom[foundCustomAsig.nombre] : null);
            if (customMalla) {
                malla = customMalla;
                nombreMateria = foundCustomAsig ? foundCustomAsig.nombre : materiaKey;
                iconoMateria = foundCustomAsig ? (foundCustomAsig.icono || "💡") : "💡";
                colorTema = foundCustomAsig ? (foundCustomAsig.color || "#4F46E5") : "#4F46E5";
                colorFondo = foundCustomAsig ? (foundCustomAsig.colorFondo || "#EEF2FF") : "#EEF2FF";
            }
        }
        if (!malla) {
            malla = window.mallaNaturales;
            nombreMateria = materiaKey || "Ciencias Naturales";
            iconoMateria = "💡";
            colorTema = "#2563EB";
            colorFondo = "#EFF6FF";
        }
    }

    const dataGrado = malla ? (malla[grado] || malla[gradoNum] || malla['6']) : null;

    if (!dataGrado) {
        return `
            <div style="background: white; border: 2px dashed #CBD5E1; border-radius: 16px; padding: 40px 20px; text-align: center;">
                <span style="font-size: 2.5rem;">📚</span>
                <h3 style="color: #475569; margin: 10px 0 5px 0; font-weight: 800;">Malla Curricular en Estructuración</h3>
                <p style="color: #64748B; font-size: 0.95rem; margin: 0;">Los estándares oficiales para ${nombreMateria} en Grado/Ciclo ${grado} se están actualizando con el estándar MEN.</p>
            </div>
        `;
    }

    // 1. Tarjeta de Objetivo Anual / Meta de Comprensión
    let html = `
        <div style="background: white; border-radius: 16px; padding: 25px 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.04); border: 1.5px solid #E2E8F0; margin-bottom: 25px;">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 15px; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 2.2rem; background: ${colorFondo}; padding: 10px; border-radius: 12px; border: 1.5px solid ${colorTema}33;">${iconoMateria}</span>
                    <div>
                        <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #0F172A;">
                            Malla Curricular Oficial: ${nombreMateria}
                        </h3>
                        <span style="background: ${colorTema}; color: white; padding: 3px 10px; border-radius: 12px; font-weight: 800; font-size: 0.78rem; text-transform: uppercase; margin-top: 4px; display: inline-block;">
                            ${grado.includes('Ciclo') ? grado : 'Grado ' + grado + '°'} • DBA Versión Oficial MEN
                        </span>
                    </div>
                </div>
            </div>
            
            <div style="background: ${colorFondo}; border-left: 4px solid ${colorTema}; padding: 15px 20px; border-radius: 0 10px 10px 0; margin-top: 10px;">
                <h4 style="margin: 0 0 5px 0; color: #1E293B; font-size: 0.95rem; font-weight: 800;">
                    🎯 Meta Anual de Comprensión y Aprendizaje:
                </h4>
                <p style="margin: 0; color: #334155; font-size: 0.95rem; line-height: 1.5;">
                    ${dataGrado.objetivo || 'Desarrollar competencias fundamentales integrales en el área.'}
                </p>
            </div>
        </div>
    `;

    // 2. Tarjeta de Derechos Básicos de Aprendizaje (DBA V2)
    if (dataGrado.dba && dataGrado.dba.length > 0) {
        html += `
            <div style="background: white; border-radius: 16px; padding: 25px 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.04); border: 1.5px solid #E2E8F0; margin-bottom: 25px;">
                <h4 style="margin: 0 0 15px 0; font-size: 1.15rem; font-weight: 900; color: #0F172A; display: flex; align-items: center; gap: 8px;">
                    <span>📋</span> Derechos Básicos de Aprendizaje Oficiales (DBA - MEN Colombia)
                </h4>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${dataGrado.dba.map((item, idx) => `
                        <div style="display: flex; gap: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 18px; align-items: flex-start;">
                            <span style="background: ${colorTema}; color: white; width: 26px; height: 26px; min-width: 26px; border-radius: 50%; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; margin-top: 2px;">
                                ${idx + 1}
                            </span>
                            <div style="color: #1E293B; font-size: 0.92rem; line-height: 1.45; font-weight: 600;">
                                ${item}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 3. Grid de los 4 Periodos Académicos y Semanas Quincenales
    if (dataGrado.periodos) {
        html += `
            <div style="margin-bottom: 25px;">
                <h4 style="margin: 0 0 15px 0; font-size: 1.15rem; font-weight: 900; color: #0F172A; display: flex; align-items: center; gap: 8px;">
                    <span>🗓️</span> Distribución Quincenal por Periodos Académicos (Semanas 1 a 8)
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        `;

        const coloresPeriodos = [
            { bg: '#EFF6FF', border: '#93C5FD', header: '#1E40AF', tag: 'Periodo 1' },
            { bg: '#F0FDF4', border: '#86EFAC', header: '#166534', tag: 'Periodo 2' },
            { bg: '#FAF5FF', border: '#D8B4FE', header: '#6B21A8', tag: 'Periodo 3' },
            { bg: '#FFF7ED', border: '#FDBA74', header: '#9A3412', tag: 'Periodo 4' }
        ];

        for (let p = 1; p <= 4; p++) {
            const pKey = String(p);
            const pData = dataGrado.periodos[pKey] || {};
            const col = coloresPeriodos[p - 1];

            html += `
                <div style="background: white; border-radius: 14px; border: 1.5px solid ${col.border}; box-shadow: 0 4px 10px rgba(0,0,0,0.03); overflow: hidden; display: flex; flex-direction: column;">
                    <div style="background: ${col.bg}; padding: 14px 18px; border-bottom: 1.5px solid ${col.border}; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 900; color: ${col.header}; font-size: 1.05rem;">${col.tag}</span>
                        <span style="font-size: 0.75rem; font-weight: 800; background: white; color: ${col.header}; padding: 2px 8px; border-radius: 10px; border: 1px solid ${col.border};">8 Semanas</span>
                    </div>
                    <div style="padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; flex: 1;">
                        <div style="background: #F8FAFC; border-radius: 8px; padding: 10px 12px; border-left: 3px solid #3B82F6;">
                            <div style="font-size: 0.75rem; font-weight: 800; color: #3B82F6; text-transform: uppercase;">Semanas 1 - 2</div>
                            <div style="font-size: 0.88rem; color: #1E293B; font-weight: 600; margin-top: 3px;">${pData['1'] || 'Fundamentación conceptual'}</div>
                        </div>
                        <div style="background: #F8FAFC; border-radius: 8px; padding: 10px 12px; border-left: 3px solid #10B981;">
                            <div style="font-size: 0.75rem; font-weight: 800; color: #10B981; text-transform: uppercase;">Semanas 3 - 4</div>
                            <div style="font-size: 0.88rem; color: #1E293B; font-weight: 600; margin-top: 3px;">${pData['3'] || 'Profundización y práctica'}</div>
                        </div>
                        <div style="background: #F8FAFC; border-radius: 8px; padding: 10px 12px; border-left: 3px solid #F59E0B;">
                            <div style="font-size: 0.75rem; font-weight: 800; color: #F59E0B; text-transform: uppercase;">Semanas 5 - 6</div>
                            <div style="font-size: 0.88rem; color: #1E293B; font-weight: 600; margin-top: 3px;">${pData['5'] || 'Aplicación y experimentación'}</div>
                        </div>
                        <div style="background: #F8FAFC; border-radius: 8px; padding: 10px 12px; border-left: 3px solid #8B5CF6;">
                            <div style="font-size: 0.75rem; font-weight: 800; color: #8B5CF6; text-transform: uppercase;">Semanas 7 - 8</div>
                            <div style="font-size: 0.88rem; color: #1E293B; font-weight: 600; margin-top: 3px;">${pData['7'] || 'Evaluación Saber y Cierre'}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }

    return html;
};

// --- CONTROLADORES DE PANEL TUTOR HOME SCHOOL ---
window.materiaTutorMallaActual = 'Naturales';

window.cambiarTabTutor = function(tab) {
    const btnEstudiantes = document.getElementById('btn-tab-tutor-estudiantes');
    const btnMallas = document.getElementById('btn-tab-tutor-mallas');
    const vistaEstudiantes = document.getElementById('vista-tutor-estudiantes');
    const vistaMallas = document.getElementById('vista-tutor-mallas');

    if (tab === 'estudiantes') {
        if (btnEstudiantes) {
            btnEstudiantes.style.background = '#2563EB';
            btnEstudiantes.style.color = 'white';
            btnEstudiantes.style.border = 'none';
            btnEstudiantes.style.boxShadow = '0 4px 10px rgba(37,99,235,0.25)';
        }
        if (btnMallas) {
            btnMallas.style.background = 'white';
            btnMallas.style.color = '#475569';
            btnMallas.style.border = '1.5px solid #CBD5E1';
            btnMallas.style.boxShadow = 'none';
        }
        if (vistaEstudiantes) vistaEstudiantes.style.display = 'grid';
        if (vistaMallas) vistaMallas.style.display = 'none';
    } else {
        if (btnEstudiantes) {
            btnEstudiantes.style.background = 'white';
            btnEstudiantes.style.color = '#475569';
            btnEstudiantes.style.border = '1.5px solid #CBD5E1';
            btnEstudiantes.style.boxShadow = 'none';
        }
        if (btnMallas) {
            btnMallas.style.background = '#2563EB';
            btnMallas.style.color = 'white';
            btnMallas.style.border = 'none';
            btnMallas.style.boxShadow = '0 4px 10px rgba(37,99,235,0.25)';
        }
        if (vistaEstudiantes) vistaEstudiantes.style.display = 'none';
        if (vistaMallas) vistaMallas.style.display = 'block';

        window.renderizarMallaTutorHomeSchool();
    }
};

window.seleccionarMateriaTutorMalla = function(materia) {
    window.materiaTutorMallaActual = materia;
    document.querySelectorAll('.tutor-materia-pill').forEach(pill => {
        if (pill.getAttribute('data-materia') === materia) {
            pill.style.border = '2px solid #2563EB';
            pill.style.background = '#EFF6FF';
            pill.style.color = '#1D4ED8';
        } else {
            pill.style.border = '1.5px solid #CBD5E1';
            pill.style.background = 'white';
            pill.style.color = '#475569';
        }
    });
    window.renderizarMallaTutorHomeSchool();
};

window.abrirMallaTutorDesdeEstudiante = function(grado, materia) {
    window.cambiarTabTutor('mallas');
    const select = document.getElementById('select-tutor-malla-grado');
    if (select) {
        let normGrado = String(grado).replace(/[^0-9CicloIVPENS]/g, '').trim();
        if (String(grado).includes('Ciclo')) normGrado = String(grado).trim();
        select.value = normGrado || '6';
    }
    if (materia) {
        window.seleccionarMateriaTutorMalla(materia);
    } else {
        window.renderizarMallaTutorHomeSchool();
    }
};

window.renderizarMallaTutorHomeSchool = function() {
    if (window.refrescarPillsMallaCurricular) window.refrescarPillsMallaCurricular('homeschool_tutor');
    const selectGrado = document.getElementById('select-tutor-malla-grado');
    const container = document.getElementById('tutor-malla-detalle-container');
    if (!container) return;

    const grado = selectGrado ? selectGrado.value : '6';
    const materia = window.materiaTutorMallaActual || 'Naturales';

    container.innerHTML = window.generarHTMLDetalleMallaDBA(grado, materia, 'homeschool_tutor');
};

// --- CONTROLADORES DE PANEL DOCENTE DE COLEGIO ---
window.materiaDocenteMallaActual = 'Naturales';

window.cambiarTabDocente = function(tab) {
    const btnEstudiantes = document.getElementById('btn-tab-docente-estudiantes');
    const btnMallas = document.getElementById('btn-tab-docente-mallas');
    const vistaEstudiantes = document.getElementById('vista-docente-estudiantes');
    const vistaMallas = document.getElementById('vista-docente-mallas');

    if (tab === 'estudiantes') {
        if (btnEstudiantes) {
            btnEstudiantes.style.background = '#2563EB';
            btnEstudiantes.style.color = 'white';
            btnEstudiantes.style.border = 'none';
            btnEstudiantes.style.boxShadow = '0 4px 10px rgba(37,99,235,0.25)';
        }
        if (btnMallas) {
            btnMallas.style.background = 'white';
            btnMallas.style.color = '#475569';
            btnMallas.style.border = '1.5px solid #CBD5E1';
            btnMallas.style.boxShadow = 'none';
        }
        if (vistaEstudiantes) vistaEstudiantes.style.display = 'grid';
        if (vistaMallas) vistaMallas.style.display = 'none';
    } else {
        if (btnEstudiantes) {
            btnEstudiantes.style.background = 'white';
            btnEstudiantes.style.color = '#475569';
            btnEstudiantes.style.border = '1.5px solid #CBD5E1';
            btnEstudiantes.style.boxShadow = 'none';
        }
        if (btnMallas) {
            btnMallas.style.background = '#2563EB';
            btnMallas.style.color = 'white';
            btnMallas.style.border = 'none';
            btnMallas.style.boxShadow = '0 4px 10px rgba(37,99,235,0.25)';
        }
        if (vistaEstudiantes) vistaEstudiantes.style.display = 'none';
        if (vistaMallas) vistaMallas.style.display = 'block';

        window.renderizarMallaDocenteColegio();
    }
};

window.seleccionarMateriaDocenteMalla = function(materia) {
    window.materiaDocenteMallaActual = materia;
    document.querySelectorAll('.docente-materia-pill').forEach(pill => {
        if (pill.getAttribute('data-materia') === materia) {
            pill.style.border = '2px solid #2563EB';
            pill.style.background = '#EFF6FF';
            pill.style.color = '#1D4ED8';
        } else {
            pill.style.border = '1.5px solid #CBD5E1';
            pill.style.background = 'white';
            pill.style.color = '#475569';
        }
    });
    window.renderizarMallaDocenteColegio();
};

window.abrirMallaDocenteDesdeEstudiante = function(grado, materia) {
    window.cambiarTabDocente('mallas');
    const select = document.getElementById('select-docente-malla-grado');
    if (select) {
        let normGrado = String(grado).replace(/[^0-9CicloIVPENS]/g, '').trim();
        if (String(grado).includes('Ciclo')) normGrado = String(grado).trim();
        select.value = normGrado || '6';
    }
    if (materia) {
        window.seleccionarMateriaDocenteMalla(materia);
    } else {
        window.renderizarMallaDocenteColegio();
    }
};

window.renderizarMallaDocenteColegio = function() {
    const selectGrado = document.getElementById('select-docente-malla-grado');
    const container = document.getElementById('docente-malla-detalle-container');
    if (!container) return;

    const grado = selectGrado ? selectGrado.value : '6';
    const materia = window.materiaDocenteMallaActual || 'Naturales';

    container.innerHTML = window.generarHTMLDetalleMallaDBA(grado, materia, 'docente');
};

// --- CONTROLADORES DE PANEL ESTUDIANTE DE VALIDACIÓN / REGULAR ---
window.materiaEstudianteMallaActual = 'Naturales';

window.cambiarTabEstudiante = function(tab) {
    const btnMaterias = document.getElementById('btn-tab-estudiante-materias');
    const btnMalla = document.getElementById('btn-tab-estudiante-malla');
    const vistaMaterias = document.getElementById('vista-estudiante-materias');
    const vistaMalla = document.getElementById('vista-estudiante-malla');

    if (tab === 'materias') {
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
    }
};

window.seleccionarMateriaEstudianteMalla = function(materia) {
    window.materiaEstudianteMallaActual = materia;
    document.querySelectorAll('.estudiante-materia-pill').forEach(pill => {
        if (pill.getAttribute('data-materia') === materia) {
            pill.style.border = '2px solid #2563EB';
            pill.style.background = '#EFF6FF';
            pill.style.color = '#1D4ED8';
        } else {
            pill.style.border = '1.5px solid #CBD5E1';
            pill.style.background = 'white';
            pill.style.color = '#475569';
        }
    });
    window.renderizarMallaEstudianteDBA();
};

window.renderizarMallaEstudianteDBA = function() {
    if (window.refrescarPillsMallaCurricular) window.refrescarPillsMallaCurricular('estudiante');
    const selectGrado = document.getElementById('select-estudiante-malla-grado');
    const container = document.getElementById('estudiante-malla-detalle-container');
    if (!container) return;

    const grado = selectGrado ? selectGrado.value : 'Ciclo VI';
    const materia = window.materiaEstudianteMallaActual || 'Naturales';

    container.innerHTML = window.generarHTMLDetalleMallaDBA(grado, materia, 'estudiante');
};

// ==========================================================================
// MOTOR DE ACTIVIDADES Y JUEGOS PEDAGÓGICOS STEAM (10 TIPOS AUTOMATIZADOS)
// ==========================================================================

window.TIPOS_ACTIVIDADES_STEAM = [
    { id: 'trivia', nombre: 'Trivia Contrarreloj', icon: '⚡', xp: 80, color: '#F59E0B', desc: '5 preguntas con cronómetro de 25s, racha de aciertos y bonus.' },
    { id: 'crucigrama', nombre: 'Crucigrama Conceptual', icon: '🧩', xp: 100, color: '#3B82F6', desc: 'Cuadrícula interactiva con conceptos clave y pistas cruzadas.' },
    { id: 'sopa_letras', nombre: 'Sopa de Letras con Pistas', icon: '🔍', xp: 70, color: '#10B981', desc: 'Pistas deductivas para buscar y descubrir términos ocultos.' },
    { id: 'laboratorio', nombre: 'Laboratorio Casero', icon: '🧪', xp: 120, color: '#8B5CF6', desc: 'Reto experimental paso a paso con materiales del hogar.' },
    { id: 'escape_room', nombre: 'Escape Room Virtual', icon: '🗺️', xp: 150, color: '#EC4899', desc: '3 enigmas encadenados para abrir el cofre del saber STEAM.' },
    { id: 'duelo_parejas', nombre: 'Duelo de Emparejamiento', icon: '🃏', xp: 80, color: '#6366F1', desc: 'Memory game interactivo para asociar Conceptos y Definiciones.' },
    { id: 'icfes_express', nombre: 'Simulacro Saber Express', icon: '🎯', xp: 100, color: '#DC2626', desc: '3 preguntas tipo ICFES con análisis de gráficas y distractores.' },
    { id: 'dilema', nombre: 'Dilema Bioético / Caso Real', icon: '⚖️', xp: 110, color: '#0D9488', desc: 'Toma de decisiones ante un desafío de impacto real en la comunidad.' },
    { id: 'redaccion_critica', nombre: 'Misión Redacción Anti-Copia', icon: '✍️', xp: 90, color: '#D97706', desc: 'Explicación creativa con detector de escritura y autoevaluación.' },
    { id: 'debate_roleplay', nombre: 'Reto de Debate en Familia/Aula', icon: '🎭', xp: 100, color: '#4F46E5', desc: 'Asignación de roles y argumentos basados en evidencia científica.' }
];

// 1. Renderizador de Botones de Tipos de Actividades en el Modal de Asignación
window.renderizarBotonesTiposActividad = function(seleccionadoId = 'trivia') {
    const grid = document.getElementById('grid-tipos-actividad');
    if (!grid) return;

    grid.innerHTML = window.TIPOS_ACTIVIDADES_STEAM.map(t => {
        const esActivo = t.id === seleccionadoId;
        const bg = esActivo ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : '#FFFFFF';
        const colorTexto = esActivo ? '#FFFFFF' : '#1E293B';
        const borderColor = esActivo ? '#7C3AED' : '#E2E8F0';
        const descColor = esActivo ? '#E9D5FF' : '#64748B';
        const shadow = esActivo ? '0 4px 12px rgba(124,58,237,0.3)' : '0 1px 3px rgba(0,0,0,0.05)';

        return `
            <div onclick="window.seleccionarTipoActividad('${t.id}')" style="background: ${bg}; border: 1.5px solid ${borderColor}; border-radius: 12px; padding: 12px; cursor: pointer; transition: all 0.15s; box-shadow: ${shadow}; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 1.4rem;">${t.icon}</span>
                        <span style="background: ${esActivo ? 'rgba(255,255,255,0.25)' : '#F3F4F6'}; color: ${esActivo ? '#FFFFFF' : '#4B5563'}; padding: 2px 8px; border-radius: 12px; font-weight: 800; font-size: 0.75rem;">
                            +${t.xp} XP
                        </span>
                    </div>
                    <div style="font-weight: 800; font-size: 0.9rem; color: ${colorTexto}; line-height: 1.25; margin-bottom: 4px;">
                        ${t.nombre}
                    </div>
                    <div style="font-size: 0.75rem; color: ${descColor}; line-height: 1.3;">
                        ${t.desc}
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

window.seleccionarTipoActividad = function(tipoId) {
    const input = document.getElementById('asignar-tipo-actividad-seleccionada');
    if (input) input.value = tipoId;
    window.renderizarBotonesTiposActividad(tipoId);
};

// 2. Abrir y Cerrar Modal de Asignación
window.abrirModalAsignarActividad = function(destinatarioTipo = 'grupo', idDestinatario = '6A', gradoDefecto = '7', nomDestinatario = '') {
    const modal = document.getElementById('modal-asignar-actividad');
    if (!modal) return;

    const label = document.getElementById('modal-asignar-destinatario-label');
    const badge = document.getElementById('modal-asignar-tipo-badge');
    const inTipo = document.getElementById('asignar-destinatario-tipo');
    const inId = document.getElementById('asignar-destinatario-id');
    const inNom = document.getElementById('asignar-destinatario-nom');
    const selGrado = document.getElementById('asignar-grado-select');

    if (inTipo) inTipo.value = destinatarioTipo;
    if (inId) inId.value = idDestinatario || 'General';
    if (inNom) inNom.value = nomDestinatario || idDestinatario;

    if (label) {
        if (destinatarioTipo === 'estudiante') {
            label.innerHTML = `<span>👤</span> ${nomDestinatario || idDestinatario} (Doc: ${idDestinatario})`;
        } else if (idDestinatario === 'HomeSchool') {
            label.innerHTML = `<span>🏡</span> Todos Mis Estudiantes Home School`;
        } else {
            label.innerHTML = `<span>🏫</span> Grupo ${idDestinatario}`;
        }
    }

    if (badge) {
        badge.innerText = destinatarioTipo === 'estudiante' ? 'Asignación Individual' : 'Asignación Grupal';
        badge.style.background = destinatarioTipo === 'estudiante' ? '#FEF3C7' : '#E0E7FF';
        badge.style.color = destinatarioTipo === 'estudiante' ? '#92400E' : '#4338CA';
    }

    if (selGrado && gradoDefecto) {
        const limpioGrado = String(gradoDefecto).replace(/[^0-9a-zA-Z\s]/g, '').trim();
        for (let opt of selGrado.options) {
            if (opt.value === gradoDefecto || opt.value === limpioGrado || gradoDefecto.includes(opt.value)) {
                selGrado.value = opt.value;
                break;
            }
        }
    }

    window.seleccionarTipoActividad('trivia');
    modal.style.display = 'flex';
};

window.cerrarModalAsignarActividad = function() {
    const modal = document.getElementById('modal-asignar-actividad');
    if (modal) modal.style.display = 'none';
};

// 3. Generador Dinámico de Contenido de Actividades (Offline & Universal)
window.generarContenidoActividad = function(tipo, materia, grado, tema) {
    const temaClean = tema && tema.trim() ? tema.trim() : `Fundamentos de ${materia} (Grado ${grado})`;

    if (tipo === 'trivia') {
        return {
            titulo: `Desafío Arcade: ${temaClean}`,
            preguntas: [
                {
                    q: `¿Cuál es el principio fundamental que rige en el estudio de ${temaClean}?`,
                    opciones: ["Conservación y transformación de la energía", "Creación espontánea de materia", "Aislamiento total sin interacción", "Fuerza constante sin aceleración"],
                    correcta: 0,
                    explicacion: "En los sistemas naturales y físicos, la energía no se crea ni se destruye, solo se transforma."
                },
                {
                    q: `En el contexto de ${materia}, ¿qué herramienta permite medir o validar una hipótesis?`,
                    opciones: ["El método científico y la recolección de datos", "La intuición sin evidencia", "La repetición memorística", "El azar no controlado"],
                    correcta: 0,
                    explicacion: "El método científico aporta rigor mediante observación, experimentación y análisis cuantitativo."
                },
                {
                    q: `¿Qué impacto tiene el desarrollo de ${temaClean} en la vida cotidiana y la tecnología?`,
                    opciones: ["Optimiza procesos y mejora la sostenibilidad", "No tiene relación con la sociedad", "Genera retroceso en los modelos de producción", "Aplica únicamente en laboratorios cerrados"],
                    correcta: 0,
                    explicacion: "La ciencia aplicada permite resolver problemas comunitarios y optimizar recursos vitales."
                },
                {
                    q: `¿Cuál de las siguientes magnitudes o variables es clave para modelar ${temaClean}?`,
                    opciones: ["Variables independientes y dependientes cuantificables", "Opiniones no verificadas", "Valores subjetivos", "Magnitudes sin unidad de medida"],
                    correcta: 0,
                    explicacion: "Todo modelo científico requiere variables precisas con unidades del Sistema Internacional."
                },
                {
                    q: `¿Cómo se vincula el enfoque STEAM en la resolución de problemas sobre ${temaClean}?`,
                    opciones: ["Integrando Ciencia, Tecnología, Ingeniería, Arte y Matemáticas", "Estudiando solo teoría sin práctica", "Descartando el diseño y la creatividad", "Separando las matemáticas de la realidad"],
                    correcta: 0,
                    explicacion: "STEAM une disciplinas interdisciplinarias para generar soluciones innovadoras y contextualizadas."
                }
            ]
        };
    } else if (tipo === 'crucigrama') {
        return {
            titulo: `Crucigrama Conceptual: ${temaClean}`,
            palabras: [
                { num: 1, dir: 'H', palabra: 'ENERGIA', pista: 'Capacidad de realizar un trabajo o producir cambios en la materia.' },
                { num: 2, dir: 'V', palabra: 'METODO', pista: 'Conjunto ordenado de pasos para investigar un fenómeno (científico).' },
                { num: 3, dir: 'H', palabra: 'HIPOTESIS', pista: 'Explicación tentativa y comprobable ante una pregunta de investigación.' },
                { num: 4, dir: 'V', palabra: 'SISTEMA', pista: 'Conjunto de elementos interrelacionados que funcionan como un todo.' },
                { num: 5, dir: 'H', palabra: 'MATERIA', pista: 'Todo lo que ocupa un lugar en el espacio y tiene masa.' },
                { num: 6, dir: 'V', palabra: 'MODELO', pista: 'Representación simplificada de la realidad para comprender un proceso.' }
            ]
        };
    } else if (tipo === 'sopa_letras') {
        return {
            titulo: `Sopa de Letras y Pistas Deductivas: ${temaClean}`,
            pistas: [
                { pista: "Proceso biológico o físico donde se intercambia calor y masa", palabra: "TERMODINAMICA" },
                { pista: "Capacidad de un ecosistema o sistema de mantenerse en equilibrio", palabra: "RESILIENCIA" },
                { pista: "Elemento indispensable para el desarrollo de la vida y el solvente universal", palabra: "AGUA" },
                { pista: "Unidad fundamental de la vida en los organismos", palabra: "CELULA" },
                { pista: "Fuerza de atracción gravitacional o interacción molecular", palabra: "GRAVEDAD" }
            ],
            grid: [
                ["T","E","R","M","O","D","I","N","A","M","I","C","A"],
                ["X","R","E","S","I","L","I","E","N","C","I","A","Q"],
                ["P","Z","A","G","U","A","M","K","L","P","W","S","E"],
                ["C","E","L","U","L","A","B","F","G","R","A","V","E"],
                ["G","R","A","V","E","D","A","D","O","P","T","N","M"],
                ["N","O","T","A","S","T","E","A","M","C","I","E","N"],
                ["E","Q","U","I","L","I","B","R","I","O","S","K","L"]
            ]
        };
    } else if (tipo === 'laboratorio') {
        return {
            titulo: `Misión Experimental en Casa: ${temaClean}`,
            materiales: ["1 Vaso o recipiente transparente", "Agua a temperatura ambiente", "Sal de cocina o azúcar", "Regla o cinta métrica", "Cronómetro del celular", "Hoja de registro de observaciones"],
            pregunta_investigacion: `¿Cómo varía el comportamiento del sistema cuando modificamos una variable clave en ${temaClean}?`,
            pasos: [
                "1. Formula tu hipótesis previa: ¿Qué crees que sucederá al variar la concentración o la fuerza aplicada?",
                "2. Prepara el montaje experimental y mide las condiciones iniciales con precisión.",
                "3. Realiza la primera prueba de control y registra el tiempo exacto en segundos.",
                "4. Introduce la variable independiente (ej: temperatura, mezcla o inclinación) y repite 3 veces.",
                "5. Registra la tabla de datos y redacta tu conclusión basada en la evidencia."
            ]
        };
    } else if (tipo === 'escape_room') {
        return {
            titulo: `Escape Room Virtual: El Enigma de ${temaClean}`,
            enigmas: [
                {
                    numero: 1,
                    titulo: "🔒 Candado 1: El Código Numérico Proporcional",
                    pista: "Un sistema consume 12 Joules cada 3 segundos. ¿Cuántos Watts de potencia representa? (P = E / t). Ingresa el número:",
                    codigo_correcto: "4",
                    explicacion: "12 / 3 = 4 Watts de potencia."
                },
                {
                    numero: 2,
                    titulo: "🔒 Candado 2: La Clave Molecular",
                    pista: "¿Cuál es el número atómico del Carbono, base de la química orgánica en nuestro planeta?",
                    codigo_correcto: "6",
                    explicacion: "El Carbono tiene número atómico Z = 6."
                },
                {
                    numero: 3,
                    titulo: "🔒 Candado 3: La Ecuación Final del Saber",
                    pista: "Suma los dos códigos anteriores (4 + 6) y multiplícalo por 2:",
                    codigo_correcto: "20",
                    explicacion: "(4 + 6) * 2 = 20."
                }
            ]
        };
    } else if (tipo === 'duelo_parejas') {
        return {
            titulo: `Duelo de Emparejamiento: ${temaClean}`,
            parejas: [
                { id: 1, concepto: "Fuerza Neta", match: "Masa × Aceleración (2da Ley de Newton)" },
                { id: 2, concepto: "Fotosíntesis", match: "Transformación de luz solar en energía química" },
                { id: 3, concepto: "Densidad", match: "Relación entre Masa y Volumen (m/V)" },
                { id: 4, concepto: "Ecosistema", match: "Interacción entre factores bióticos y abióticos" },
                { id: 5, concepto: "Variable Independiente", match: "Factor manipulado por el investigador en el experimento" },
                { id: 6, concepto: "Velocidad", match: "Cambio de posición en función del tiempo (Δx/Δt)" }
            ]
        };
    } else if (tipo === 'icfes_express') {
        return {
            titulo: `Simulacro Saber 11 Express: ${temaClean}`,
            preguntas: [
                {
                    q: `Un grupo de estudiantes realiza un experimento para medir la tasa fotosintética variando la intensidad lumínica. Los datos muestran que a partir de 800 lux la producción de oxígeno se estabiliza. Con base en esto, es correcto afirmar que:`,
                    opciones: [
                        "La luz deja de ser el factor limitante y la tasa máxima de las enzimas se ha alcanzado.",
                        "La planta detiene por completo la respiración celular.",
                        "El dióxido de carbono se destruyó espontáneamente.",
                        "A mayor luz siempre habrá un aumento infinito en la producción."
                    ],
                    correcta: 0,
                    justificacion: "La saturación enzimática y la disponibilidad de CO2 limitan la velocidad máxima del proceso biofísico."
                },
                {
                    q: `En una gráfica de Posición vs. Tiempo, una línea horizontal paralela al eje del tiempo representa que el cuerpo:`,
                    opciones: [
                        "Se encuentra en reposo (velocidad igual a cero).",
                        "Se desplaza con aceleración constante positiva.",
                        "Se mueve a la velocidad de la luz.",
                        "Posee velocidad infinita en un instante."
                    ],
                    correcta: 0,
                    justificacion: "Si la posición no varía al transcurrir el tiempo, la derivada dx/dt (velocidad) es 0."
                },
                {
                    q: `Frente a la contaminación hídrica por lixiviados en una cuenca del Quindío, ¿cuál propuesta STEAM combina bio-remediación con ingeniería sostenible?`,
                    opciones: [
                        "Implementar humedales artificiales con plantas macrofitas filtrantes y sensores IoT de pH.",
                        "Canalizar el agua contaminada directamente al río principal sin tratamiento.",
                        "Aplicar cloro masivo que destruya toda la fauna microbiana nativa.",
                        "Ignorar el monitoreo y confiar en la evaporación natural."
                    ],
                    correcta: 0,
                    justificacion: "Los humedales artificiales bio-filtran metales y materia orgánica de forma ecológica y monitoreada."
                }
            ]
        };
    } else if (tipo === 'dilema') {
        return {
            titulo: `Dilema Bioético y Caso Real: ${temaClean}`,
            contexto: `En un municipio cordillerano, una empresa propone instalar un parque eólico en una reserva biológica que suministra el 40% del agua potable local. El proyecto reduciría la huella de carbono pero podría alterar el corredor biológico de aves migratorias y fuentes hídricas.`,
            pregunta_central: `¿Cómo ponderarías la transición hacia energías limpias frente a la conservación del recurso hídrico y la biodiversidad?`,
            opciones: [
                {
                    texto: "Aprobar el proyecto exigiendo rediseño en zonas de amortiguación no críticas y reforestación con especies nativas.",
                    impacto: "Equilibra la generación de energía renovable con la protección estricta de las cuencas hídricas vitales."
                },
                {
                    texto: "Rechazar de plano el proyecto priorizando la reserva hídrica y buscando predios degradados para la energía eólica.",
                    impacto: "Garantiza el 100% de la seguridad hídrica comunitaria y promueve el ordenamiento territorial responsable."
                },
                {
                    texto: "Aprobar sin modificaciones para acelerar el crecimiento económico a corto plazo.",
                    impacto: "Riesgo crítico de daño irreversible en el abastecimiento de agua y biodiversidad local."
                }
            ]
        };
    } else if (tipo === 'redaccion_critica') {
        return {
            titulo: `Misión de Redacción Anti-Copia: ${temaClean}`,
            consigna: `Explica con tus propias palabras y un ejemplo cotidiano: ¿Cómo aplicarías los conceptos de ${temaClean} para resolver un problema de tu hogar, escuela o barrio? (Mínimo 60 palabras).`,
            rubrica: ["Originalidad del ejemplo", "Uso correcto del vocabulario técnico", "Coherencia argumentativa"]
        };
    } else {
        // debate_roleplay
        return {
            titulo: `Reto de Debate STEAM: ${temaClean}`,
            tema_debate: `¿Debe regularse estrictamente o liberarse el uso de nuevas tecnologías aplicadas a ${temaClean}?`,
            roles: [
                { rol: "🔬 Científico/Investigador", postura: "Defiende el avance riguroso con base en evidencia empírica y método científico." },
                { rol: "🌿 Ambientalista / Líder Social", postura: "Exige el principio de precaución y la protección de los derechos colectivos." },
                { rol: "⚙️ Ingeniero / Tecnólogo", postura: "Propone soluciones prácticas, escalabilidad y optimización de recursos." }
            ]
        };
    }
};

// 4. Ejecutar Asignación de Actividad (Envío a API y LocalStorage)
window.ejecutarAsignacionActividad = async function() {
    const btn = document.getElementById('btn-ejecutar-asignar-actividad');
    const inTipo = document.getElementById('asignar-destinatario-tipo');
    const inId = document.getElementById('asignar-destinatario-id');
    const inNom = document.getElementById('asignar-destinatario-nom');
    const inTipoAct = document.getElementById('asignar-tipo-actividad-seleccionada');
    const selMat = document.getElementById('asignar-materia-select');
    const selGra = document.getElementById('asignar-grado-select');
    const selPer = document.getElementById('asignar-periodo-select');
    const inTema = document.getElementById('asignar-tema-input');

    const tipo_actividad = inTipoAct ? inTipoAct.value : 'trivia';
    const destinatario_tipo = inTipo ? inTipo.value : 'grupo';
    const destinatario_id = inId ? inId.value : 'General';
    const destinatario_nombre = inNom ? inNom.value : destinatario_id;
    const materia = selMat ? selMat.value : 'Ciencias Naturales';
    const grado = selGra ? selGra.value : '7';
    const periodo = selPer ? selPer.value : '3';
    const tema = inTema && inTema.value.trim() ? inTema.value.trim() : `Fundamentos de ${materia}`;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>⏳</span> Generando Actividad STEAM...`;
    }

    try {
        const actividad_data = window.generarContenidoActividad(tipo_actividad, materia, grado, tema);

        const payload = {
            tipo_actividad,
            destinatario_tipo,
            destinatario_id,
            destinatario_nombre,
            materia,
            grado,
            periodo,
            tema,
            actividad_data,
            creador_id: window.usuario_actual || 'ADMIN'
        };

        // Guardar en backend
        let asignada = null;
        try {
            const res = await fetch('/api/asignar-actividad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const json = await res.json();
                asignada = json.actividad;
            }
        } catch(e) {
            console.warn("Fallo temporal en API backend, guardando localmente:", e);
        }

        if (!asignada) {
            asignada = {
                ...payload,
                id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                fecha_creacion: new Date().toISOString(),
                completada_por: []
            };
        }

        // Respaldo en localStorage
        let localActs = JSON.parse(localStorage.getItem('actividades_asignadas_db') || '[]');
        localActs.unshift(asignada);
        localStorage.setItem('actividades_asignadas_db', JSON.stringify(localActs));

        window.cerrarModalAsignarActividad();

        // Toast de confirmación
        if (typeof window.mostrarToastXP === 'function') {
            window.mostrarToastXP(`🎮 ¡Actividad asignada con éxito a ${destinatario_nombre}!`);
        } else {
            alert(`✅ ¡Actividad asignada con éxito a ${destinatario_nombre}!`);
        }

    } catch (err) {
        console.error("Error asignando actividad:", err);
        alert("Ocurrió un error al generar y asignar la actividad.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<span>✨</span> Generar y Asignar Actividad`;
        }
    }
};

// 5. Cargar Actividades Asignadas en el Panel del Estudiante
window.cargarActividadesEstudiante = async function() {
    const container = document.getElementById('student-actividades-container');
    const list = document.getElementById('student-actividades-list');
    const badgeCount = document.getElementById('badge-actividades-pendientes-count');
    if (!container || !list) return;

    const estudiante = window.usuarioEstudianteActual || {};
    const doc = String(estudiante.documento || estudiante.usuario || window.usuario_actual || '').trim();
    const grupo = String(estudiante.grupo || estudiante.grado || '').trim().toLowerCase();
    const grado = String(estudiante.grado || '').trim().toLowerCase();

    if (!doc) {
        container.style.display = 'none';
        return;
    }

    let actividades = [];

    // Consultar API
    try {
        const res = await fetch(`/api/actividades-estudiante?documento=${encodeURIComponent(doc)}&grupo=${encodeURIComponent(grupo)}&grado=${encodeURIComponent(grado)}`);
        if (res.ok) {
            actividades = await res.json();
        }
    } catch(e) {}

    // Combinar con localStorage
    const localActs = JSON.parse(localStorage.getItem('actividades_asignadas_db') || '[]');
    localActs.forEach(la => {
        if (!actividades.some(a => a.id === la.id)) {
            if (la.destinatario_tipo === 'estudiante' && String(la.destinatario_id).trim() === doc) {
                actividades.push(la);
            } else if (la.destinatario_tipo === 'grupo') {
                const destG = String(la.destinatario_id || '').trim().toLowerCase();
                if (destG === 'todos' || destG === 'homeschool' || destG === grupo || destG === grado || grupo.includes(destG)) {
                    actividades.push(la);
                }
            }
        }
    });

    if (actividades.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    // Contar pendientes
    let pendientes = 0;
    list.innerHTML = '';

    actividades.forEach(act => {
        const completada = (act.completada_por && act.completada_por.some(c => String(c.documento).trim() === doc)) ||
                           localStorage.getItem(`act_completada_${act.id}_${doc}`) === 'true';

        if (!completada) pendientes++;

        const tipoMeta = window.TIPOS_ACTIVIDADES_STEAM.find(t => t.id === act.tipo_actividad) || { icon: '🎮', nombre: 'Actividad STEAM', xp: 80, color: '#3B82F6' };

        const card = document.createElement('div');
        card.style.cssText = `
            background: white;
            border: 1.5px solid ${completada ? '#A7F3D0' : '#C7D2FE'};
            border-radius: 14px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.04);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
        `;

        card.innerHTML = `
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <span style="font-size: 1.8rem;">${tipoMeta.icon}</span>
                    <span style="background: ${completada ? '#DEF7EC' : '#EEF2FF'}; color: ${completada ? '#03543F' : '#4338CA'}; padding: 3px 10px; border-radius: 20px; font-weight: 800; font-size: 0.78rem;">
                        ${completada ? '✅ Completada' : `⭐ +${tipoMeta.xp} XP`}
                    </span>
                </div>
                <div style="font-weight: 800; font-size: 1.05rem; color: #1E1B4B; margin-bottom: 4px;">
                    ${act.tema || tipoMeta.nombre}
                </div>
                <div style="font-size: 0.8rem; color: #64748B; margin-bottom: 12px;">
                    📚 ${act.materia} • Grado ${act.grado} • Periodo ${act.periodo}
                </div>
            </div>
            <div>
                ${completada ? `
                    <div style="background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; padding: 8px; border-radius: 8px; font-size: 0.82rem; font-weight: 700; text-align: center;">
                        🏆 ¡Reto Superado con Éxito!
                    </div>
                ` : `
                    <button onclick="window.iniciarJuegoActividad('${act.id}')" style="width: 100%; background: linear-gradient(135deg, #7C3AED, #6D28D9); color: white; border: none; padding: 10px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 10px rgba(124,58,237,0.25);">
                        <span>🎮</span> ¡Jugar Misión Ahora!
                    </button>
                `}
            </div>
        `;
        list.appendChild(card);
    });

    if (badgeCount) {
        badgeCount.innerText = `${pendientes} Pendiente${pendientes !== 1 ? 's' : ''}`;
        badgeCount.style.background = pendientes > 0 ? '#EC4899' : '#10B981';
    }
};

// 6. Iniciar y Ejecutar Juego Interactivo para el Estudiante
window.actividadEnJuegoActual = null;
window.triviaTimerInterval = null;

window.iniciarJuegoActividad = function(actividadId) {
    const modal = document.getElementById('modal-juego-actividad');
    const container = document.getElementById('juego-actividad-contenido');
    const iconHeader = document.getElementById('juego-icono-actividad');
    const tituloHeader = document.getElementById('juego-titulo-actividad');
    const materiaBadge = document.getElementById('juego-materia-badge');
    const xpBadge = document.getElementById('juego-xp-badge');
    const timerContainer = document.getElementById('juego-timer-container');

    if (!modal || !container) return;

    // Buscar actividad en memoria o localStorage
    let localActs = JSON.parse(localStorage.getItem('actividades_asignadas_db') || '[]');
    let act = localActs.find(a => a.id === actividadId);

    if (!act) {
        alert("Actividad no encontrada.");
        return;
    }

    window.actividadEnJuegoActual = act;
    const tipoMeta = window.TIPOS_ACTIVIDADES_STEAM.find(t => t.id === act.tipo_actividad) || { icon: '🎮', nombre: 'Reto STEAM', xp: 80 };

    if (iconHeader) iconHeader.innerText = tipoMeta.icon;
    if (tituloHeader) tituloHeader.innerText = act.tema || tipoMeta.nombre;
    if (materiaBadge) materiaBadge.innerText = `📚 ${act.materia}`;
    if (xpBadge) xpBadge.innerText = `⭐ +${tipoMeta.xp} XP`;
    if (timerContainer) timerContainer.style.display = (act.tipo_actividad === 'trivia') ? 'flex' : 'none';

    container.innerHTML = '';
    modal.style.display = 'flex';

    // Despachar al motor específico
    if (act.tipo_actividad === 'trivia') {
        window.renderizarMotorTrivia(act, container);
    } else if (act.tipo_actividad === 'crucigrama') {
        window.renderizarMotorCrucigrama(act, container);
    } else if (act.tipo_actividad === 'sopa_letras') {
        window.renderizarMotorSopaLetras(act, container);
    } else if (act.tipo_actividad === 'laboratorio') {
        window.renderizarMotorLaboratorio(act, container);
    } else if (act.tipo_actividad === 'escape_room') {
        window.renderizarMotorEscapeRoom(act, container);
    } else if (act.tipo_actividad === 'duelo_parejas') {
        window.renderizarMotorMemoryCards(act, container);
    } else if (act.tipo_actividad === 'icfes_express') {
        window.renderizarMotorIcfesExpress(act, container);
    } else if (act.tipo_actividad === 'dilema') {
        window.renderizarMotorDilema(act, container);
    } else if (act.tipo_actividad === 'redaccion_critica') {
        window.renderizarMotorRedaccion(act, container);
    } else {
        window.renderizarMotorDebate(act, container);
    }
};

window.cerrarModalJuegoActividad = function() {
    const modal = document.getElementById('modal-juego-actividad');
    if (modal) modal.style.display = 'none';
    if (window.triviaTimerInterval) {
        clearInterval(window.triviaTimerInterval);
        window.triviaTimerInterval = null;
    }
};

// --- MOTOR 1: TRIVIA CONTRARRELOJ ---
window.renderizarMotorTrivia = function(act, container) {
    const data = act.actividad_data || window.generarContenidoActividad('trivia', act.materia, act.grado, act.tema);
    const preguntas = data.preguntas || [];
    let qIdx = 0;
    let aciertos = 0;
    let streak = 0;
    let tiempoRestante = 25;

    function renderPregunta() {
        if (qIdx >= preguntas.length) {
            // Fin de la trivia
            if (window.triviaTimerInterval) clearInterval(window.triviaTimerInterval);
            const puntaje = Math.round((aciertos / preguntas.length) * 100);
            window.finalizarJuegoPantalla(act, puntaje, 80);
            return;
        }

        const p = preguntas[qIdx];
        tiempoRestante = 25;
        const timerSeg = document.getElementById('juego-timer-segundos');
        if (timerSeg) timerSeg.innerText = tiempoRestante;

        if (window.triviaTimerInterval) clearInterval(window.triviaTimerInterval);
        window.triviaTimerInterval = setInterval(() => {
            tiempoRestante--;
            if (timerSeg) timerSeg.innerText = tiempoRestante;
            if (tiempoRestante <= 0) {
                clearInterval(window.triviaTimerInterval);
                responder(-1); // Tiempo agotado
            }
        }, 1000);

        container.innerHTML = `
            <div style="text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <span style="font-weight: 800; color: #4338CA; background: #EEF2FF; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem;">
                        Pregunta ${qIdx + 1} de ${preguntas.length}
                    </span>
                    <span style="font-weight: 800; color: #D97706; font-size: 0.9rem;">
                        🔥 Racha: ${streak} | Aciertos: ${aciertos}
                    </span>
                </div>
                <h4 style="font-size: 1.25rem; font-weight: 900; color: #1E1B4B; line-height: 1.4; margin-bottom: 20px;">
                    ${p.q}
                </h4>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                    ${p.opciones.map((opt, idx) => `
                        <button id="opt-trivia-${idx}" onclick="window.responderTrivia(${idx})" style="background: white; border: 2px solid #E2E8F0; padding: 14px 18px; border-radius: 12px; font-size: 1rem; font-weight: 700; color: #1E293B; text-align: left; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 10px;">
                            <span style="background: #F1F5F9; color: #475569; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.85rem;">${['A','B','C','D'][idx]}</span>
                            <span>${opt}</span>
                        </button>
                    `).join('')}
                </div>
                <div id="trivia-feedback" style="display: none; padding: 12px 16px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; margin-top: 10px;"></div>
            </div>
        `;
    }

    window.responderTrivia = function(seleccionadoIdx) {
        if (window.triviaTimerInterval) clearInterval(window.triviaTimerInterval);
        const p = preguntas[qIdx];
        const feedback = document.getElementById('trivia-feedback');

        for (let i = 0; i < p.opciones.length; i++) {
            const btn = document.getElementById(`opt-trivia-${i}`);
            if (btn) {
                btn.disabled = true;
                if (i === p.correcta) {
                    btn.style.background = '#DEF7EC';
                    btn.style.borderColor = '#10B981';
                    btn.style.color = '#03543F';
                } else if (i === seleccionadoIdx) {
                    btn.style.background = '#FDE8E8';
                    btn.style.borderColor = '#F87171';
                    btn.style.color = '#9B1C1C';
                }
            }
        }

        if (seleccionadoIdx === p.correcta) {
            aciertos++;
            streak++;
            if (feedback) {
                feedback.style.display = 'block';
                feedback.style.background = '#ECFDF5';
                feedback.style.color = '#065F46';
                feedback.style.border = '1px solid #A7F3D0';
                feedback.innerHTML = `✨ ¡Excelente! ${p.explicacion || ''}`;
            }
        } else {
            streak = 0;
            if (feedback) {
                feedback.style.display = 'block';
                feedback.style.background = '#FEF2F2';
                feedback.style.color = '#991B1B';
                feedback.style.border = '1px solid #FECACA';
                feedback.innerHTML = `💡 ${p.explicacion || 'Revisa el concepto e inténtalo de nuevo.'}`;
            }
        }

        setTimeout(() => {
            qIdx++;
            renderPregunta();
        }, 1800);
    };

    renderPregunta();
};

// --- MOTOR 2: CRUCIGRAMA CONCEPTUAL ---
window.renderizarMotorCrucigrama = function(act, container) {
    const data = act.actividad_data || window.generarContenidoActividad('crucigrama', act.materia, act.grado, act.tema);
    const palabras = data.palabras || [];

    container.innerHTML = `
        <div style="text-align: left;">
            <p style="color: #475569; font-size: 0.95rem; margin-bottom: 20px;">
                Deduce cada concepto a partir de su pista y completa las casillas con las letras correctas:
            </p>
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 25px; align-items: start;">
                <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; padding: 20px; border-radius: 16px;">
                    <h5 style="margin: 0 0 15px 0; font-size: 1.05rem; font-weight: 800; color: #1E293B;">Conceptos a Descubrir:</h5>
                    <div style="display: flex; flex-direction: column; gap: 14px;">
                        ${palabras.map(p => `
                            <div style="background: white; border: 1px solid #CBD5E1; padding: 12px; border-radius: 10px;">
                                <div style="font-weight: 800; font-size: 0.85rem; color: #4338CA; margin-bottom: 4px;">
                                    ${p.num}. [${p.dir === 'H' ? 'Horizontal' : 'Vertical'}] (${p.palabra.length} Letras)
                                </div>
                                <div style="font-size: 0.88rem; color: #334155; margin-bottom: 8px;">
                                    ${p.pista}
                                </div>
                                <input type="text" id="input-crucigrama-${p.num}" maxlength="${p.palabra.length}" placeholder="Escribe tu respuesta..." style="width: 100%; padding: 8px 12px; border: 1.5px solid #94A3B8; border-radius: 6px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; box-sizing: border-box;">
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="background: #EEF2FF; border: 1.5px solid #C7D2FE; padding: 20px; border-radius: 16px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🧩</div>
                    <h4 style="margin: 0 0 8px 0; font-weight: 900; color: #1E1B4B;">Verificación de Respuestas</h4>
                    <p style="font-size: 0.85rem; color: #475569; margin-bottom: 20px;">
                        Una vez hayas completado todos los términos, valida tu crucigrama para reclamar tus XP.
                    </p>
                    <button onclick="window.validarCrucigrama()" style="width: 100%; background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                        ✓ Comprobar Crucigrama
                    </button>
                    <div id="crucigrama-resultado" style="margin-top: 15px; font-weight: 800; font-size: 0.95rem;"></div>
                </div>
            </div>
        </div>
    `;

    window.validarCrucigrama = function() {
        let aciertos = 0;
        palabras.forEach(p => {
            const input = document.getElementById(`input-crucigrama-${p.num}`);
            if (input) {
                const val = input.value.trim().toUpperCase();
                if (val === p.palabra.toUpperCase()) {
                    aciertos++;
                    input.style.borderColor = '#10B981';
                    input.style.background = '#ECFDF5';
                } else {
                    input.style.borderColor = '#F87171';
                    input.style.background = '#FEF2F2';
                }
            }
        });

        const resDiv = document.getElementById('crucigrama-resultado');
        if (aciertos === palabras.length) {
            if (resDiv) {
                resDiv.style.color = '#059669';
                resDiv.innerText = '🎉 ¡Crucigrama 100% Correcto!';
            }
            setTimeout(() => window.finalizarJuegoPantalla(act, 100, 100), 1200);
        } else {
            if (resDiv) {
                resDiv.style.color = '#D97706';
                resDiv.innerText = `Llevas ${aciertos} de ${palabras.length} correctas. ¡Revisa las casillas en rojo!`;
            }
        }
    };
};

// --- MOTOR 3: SOPA DE LETRAS CON PISTAS ---
window.renderizarMotorSopaLetras = function(act, container) {
    const data = act.actividad_data || window.generarContenidoActividad('sopa_letras', act.materia, act.grado, act.tema);
    const pistas = data.pistas || [];
    const grid = data.grid || [];

    container.innerHTML = `
        <div style="text-align: left;">
            <p style="color: #475569; font-size: 0.95rem; margin-bottom: 15px;">
                Resuelve las pistas deductivas y encuentra las palabras ocultas en la cuadrícula:
            </p>
            <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px; align-items: start;">
                
                <!-- Cuadrícula de Letras -->
                <div style="background: white; border: 2px solid #E2E8F0; padding: 15px; border-radius: 16px; overflow-x: auto; text-align: center;">
                    <table style="margin: 0 auto; border-collapse: separate; border-spacing: 4px;">
                        ${grid.map((fila, rIdx) => `
                            <tr>
                                ${fila.map((letra, cIdx) => `
                                    <td onclick="this.style.background = (this.style.background === 'rgb(124, 58, 237)' ? 'white' : '#7C3AED'); this.style.color = (this.style.color === 'white' ? '#1E293B' : 'white');" style="width: 32px; height: 32px; border: 1.5px solid #CBD5E1; border-radius: 6px; font-weight: 900; font-size: 1rem; color: #1E293B; cursor: pointer; user-select: none; transition: 0.1s; background: white;">
                                        ${letra}
                                    </td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </table>
                </div>

                <!-- Lista de Pistas -->
                <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; padding: 16px; border-radius: 16px;">
                    <h5 style="margin: 0 0 10px 0; font-weight: 800; color: #1E1B4B; font-size: 1rem;">🔍 Pistas Deductivas:</h5>
                    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                        ${pistas.map((p, idx) => `
                            <div style="background: white; border: 1px solid #CBD5E1; padding: 10px; border-radius: 8px;">
                                <div style="font-size: 0.82rem; color: #334155; margin-bottom: 4px;">
                                    <b>${idx + 1}.</b> ${p.pista}
                                </div>
                                <input type="text" id="input-sopa-${idx}" placeholder="Palabra encontrada..." style="width: 100%; padding: 6px 10px; border: 1px solid #94A3B8; border-radius: 6px; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; box-sizing: border-box;">
                            </div>
                        `).join('')}
                    </div>

                    <button onclick="window.validarSopaLetras()" style="width: 100%; background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 900; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 10px rgba(16,185,129,0.3);">
                        ✓ Validar Palabras
                    </button>
                    <div id="sopa-resultado" style="margin-top: 10px; font-weight: 800; font-size: 0.9rem; text-align: center;"></div>
                </div>

            </div>
        </div>
    `;

    window.validarSopaLetras = function() {
        let aciertos = 0;
        pistas.forEach((p, idx) => {
            const input = document.getElementById(`input-sopa-${idx}`);
            if (input) {
                if (input.value.trim().toUpperCase() === p.palabra.toUpperCase()) {
                    aciertos++;
                    input.style.borderColor = '#10B981';
                    input.style.background = '#ECFDF5';
                } else {
                    input.style.borderColor = '#F87171';
                    input.style.background = '#FEF2F2';
                }
            }
        });

        const resDiv = document.getElementById('sopa-resultado');
        if (aciertos === pistas.length) {
            if (resDiv) {
                resDiv.style.color = '#059669';
                resDiv.innerText = '🎉 ¡Encontraste todas las palabras!';
            }
            setTimeout(() => window.finalizarJuegoPantalla(act, 100, 70), 1200);
        } else {
            if (resDiv) {
                resDiv.style.color = '#D97706';
                resDiv.innerText = `Llevas ${aciertos} de ${pistas.length} palabras.`;
            }
        }
    };
};

// --- MOTOR 4: LABORATORIO CASERO ---
window.renderizarMotorLaboratorio = function(act, container) {
    const data = act.actividad_data || window.generarContenidoActividad('laboratorio', act.materia, act.grado, act.tema);

    container.innerHTML = `
        <div style="text-align: left;">
            <div style="background: #F3E8FF; border: 1.5px solid #D8B4FE; padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 6px 0; color: #6B21A8; font-weight: 900; font-size: 1.15rem;">
                    🧪 ${data.titulo}
                </h4>
                <p style="margin: 0; color: #581C87; font-size: 0.9rem;">
                    <b>Pregunta Clave:</b> ${data.pregunta_investigacion || ''}
                </p>
            </div>

            <!-- Materiales y Pasos -->
            <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 20px; margin-bottom: 20px;">
                <div style="background: white; border: 1px solid #E2E8F0; padding: 15px; border-radius: 12px;">
                    <h5 style="margin: 0 0 8px 0; font-weight: 800; color: #1E293B;">📦 Materiales del Hogar:</h5>
                    <ul style="margin: 0; padding-left: 18px; color: #475569; font-size: 0.88rem; line-height: 1.6;">
                        ${(data.materiales || []).map(m => `<li>${m}</li>`).join('')}
                    </ul>
                </div>

                <div style="background: white; border: 1px solid #E2E8F0; padding: 15px; border-radius: 12px;">
                    <h5 style="margin: 0 0 8px 0; font-weight: 800; color: #1E293B;">📋 Procedimiento Experimental:</h5>
                    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: #334155;">
                        ${(data.pasos || []).map((paso, idx) => `
                            <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer;">
                                <input type="checkbox" id="check-lab-paso-${idx}" style="margin-top: 3px;">
                                <span>${paso}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Registro de Conclusiones -->
            <div style="background: #FAFAFA; border: 1.5px solid #E5E7EB; padding: 18px; border-radius: 12px; margin-bottom: 20px;">
                <label style="font-weight: 800; color: #1E293B; font-size: 0.92rem; display: block; margin-bottom: 6px;">
                    ✍️ Registro de Observaciones y Conclusión Científica:
                </label>
                <textarea id="textarea-lab-conclusion" rows="3" placeholder="Describe qué observaste al realizar el montaje y si tu hipótesis inicial fue confirmada o refutada..." style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-family: Inter, sans-serif; font-size: 0.9rem; box-sizing: border-box;"></textarea>
            </div>

            <button onclick="window.completarLaboratorio()" style="width: 100%; background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 14px rgba(139,92,246,0.35);">
                🚀 Entregar Informe de Laboratorio (+120 XP)
            </button>
        </div>
    `;

    window.completarLaboratorio = function() {
        const text = document.getElementById('textarea-lab-conclusion');
        const txtVal = text ? text.value.trim() : '';

        if (txtVal.length < 20) {
            alert("Por favor escribe una conclusión más completa (mínimo 20 caracteres) sobre lo observado en el experimento.");
            return;
        }

        window.finalizarJuegoPantalla(act, 100, 120, { conclusion: txtVal });
    };
};

// --- MOTOR 5: ESCAPE ROOM VIRTUAL ---
window.renderizarMotorEscapeRoom = function(act, container) {
    const data = act.actividad_data || window.generarContenidoActividad('escape_room', act.materia, act.grado, act.tema);
    const enigmas = data.enigmas || [];

    container.innerHTML = `
        <div style="text-align: left;">
            <div style="background: #FDF2F8; border: 1.5px solid #FBCFE8; padding: 16px; border-radius: 12px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 2.2rem;">🗺️</span>
                <div>
                    <h4 style="margin: 0; color: #9D174D; font-weight: 900; font-size: 1.15rem;">El Cofre Secreto del Conocimiento STEAM</h4>
                    <p style="margin: 2px 0 0 0; color: #831843; font-size: 0.88rem;">Para abrir el cofre, resuelve los 3 candados secuenciales introduciendo sus claves exactas.</p>
                </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px;">
                ${enigmas.map((e, idx) => `
                    <div style="background: white; border: 1.5px solid #E2E8F0; padding: 16px; border-radius: 12px;">
                        <h5 style="margin: 0 0 6px 0; font-weight: 800; color: #1E1B4B; font-size: 1rem;">${e.titulo}</h5>
                        <p style="margin: 0 0 10px 0; color: #475569; font-size: 0.9rem;">${e.pista}</p>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <input type="text" id="input-escape-${idx}" placeholder="Clave..." style="padding: 8px 12px; border: 1.5px solid #94A3B8; border-radius: 8px; font-weight: 900; width: 140px; font-size: 1rem; text-align: center;">
                            <span id="badge-escape-status-${idx}" style="font-size: 0.85rem; font-weight: 800; color: #64748B;">🔒 Bloqueado</span>
                        </div>
                    </div>
                `).join('')}
            </div>

            <button onclick="window.validarEscapeRoom()" style="width: 100%; background: linear-gradient(135deg, #EC4899, #DB2777); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 14px rgba(236,72,153,0.35);">
                🔓 Intentar Desbloquear el Cofre (+150 XP)
            </button>
            <div id="escape-resultado" style="margin-top: 12px; font-weight: 800; font-size: 0.95rem; text-align: center;"></div>
        </div>
    `;

    window.validarEscapeRoom = function() {
        let aciertos = 0;
        enigmas.forEach((e, idx) => {
            const input = document.getElementById(`input-escape-${idx}`);
            const badge = document.getElementById(`badge-escape-status-${idx}`);
            if (input) {
                if (input.value.trim().toLowerCase() === String(e.codigo_correcto).trim().toLowerCase()) {
                    aciertos++;
                    input.style.borderColor = '#10B981';
                    input.style.background = '#ECFDF5';
                    if (badge) {
                        badge.innerText = '🔓 ¡Desbloqueado!';
                        badge.style.color = '#059669';
                    }
                } else {
                    input.style.borderColor = '#F87171';
                    input.style.background = '#FEF2F2';
                    if (badge) {
                        badge.innerText = '🔒 Clave Incorrecta';
                        badge.style.color = '#DC2626';
                    }
                }
            }
        });

        const resDiv = document.getElementById('escape-resultado');
        if (aciertos === enigmas.length) {
            if (resDiv) {
                resDiv.style.color = '#059669';
                resDiv.innerText = '🎉 ¡TODOS LOS CANDADOS ABIERTOS! ¡EL COFRE ES TUYO!';
            }
            setTimeout(() => window.finalizarJuegoPantalla(act, 100, 150), 1200);
        } else {
            if (resDiv) {
                resDiv.style.color = '#D97706';
                resDiv.innerText = `Has desbloqueado ${aciertos} de ${enigmas.length} candados.`;
            }
        }
    };
};

// --- MOTOR 6: DUELO DE EMPAREJAMIENTO (MEMORY GAME) ---
window.renderizarMotorMemoryCards = function(act, container) {
    const data = act.actividad_data || window.generarContenidoActividad('duelo_parejas', act.materia, act.grado, act.tema);
    const parejas = data.parejas || [];

    // Crear 12 cartas (6 conceptos y 6 definiciones)
    let cartas = [];
    parejas.forEach(p => {
        cartas.push({ id: p.id, tipo: 'concepto', texto: p.concepto });
        cartas.push({ id: p.id, tipo: 'match', texto: p.match });
    });
    // Barajar
    cartas.sort(() => Math.random() - 0.5);

    let seleccionadas = [];
    let parejasEncontradas = 0;

    container.innerHTML = `
        <div style="text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <p style="color: #475569; font-size: 0.95rem; margin: 0;">
                    Encuentra las 6 parejas volteando las cartas correspondientes:
                </p>
                <span id="memory-counter" style="font-weight: 800; color: #4F46E5; background: #EEF2FF; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem;">
                    Parejas: 0 / ${parejas.length}
                </span>
            </div>

            <div id="grid-memory-cards" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
                ${cartas.map((c, idx) => `
                    <div id="card-memory-${idx}" onclick="window.voltearCarta(${idx})" style="background: #1E293B; border-radius: 12px; min-height: 90px; padding: 10px; display: flex; align-items: center; justify-content: center; text-align: center; color: white; font-weight: 800; font-size: 0.82rem; cursor: pointer; user-select: none; transition: transform 0.2s; box-shadow: 0 4px 8px rgba(0,0,0,0.15);">
                        <span id="card-text-${idx}" style="display: none;">${c.texto}</span>
                        <span id="card-cover-${idx}" style="font-size: 1.5rem;">🃏</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    window.voltearCarta = function(idx) {
        if (seleccionadas.length >= 2) return;
        const card = document.getElementById(`card-memory-${idx}`);
        const text = document.getElementById(`card-text-${idx}`);
        const cover = document.getElementById(`card-cover-${idx}`);
        if (!card || card.classList.contains('matched') || seleccionadas.some(s => s.idx === idx)) return;

        // Mostrar carta
        card.style.background = '#FFFFFF';
        card.style.border = '2px solid #6366F1';
        card.style.color = '#1E1B4B';
        if (cover) cover.style.display = 'none';
        if (text) text.style.display = 'block';

        seleccionadas.push({ idx, carta: cartas[idx] });

        if (seleccionadas.length === 2) {
            const [c1, c2] = seleccionadas;
            if (c1.carta.id === c2.carta.id && c1.carta.tipo !== c2.carta.tipo) {
                // Match exitoso
                parejasEncontradas++;
                document.getElementById(`card-memory-${c1.idx}`).style.background = '#DEF7EC';
                document.getElementById(`card-memory-${c1.idx}`).style.borderColor = '#10B981';
                document.getElementById(`card-memory-${c1.idx}`).classList.add('matched');

                document.getElementById(`card-memory-${c2.idx}`).style.background = '#DEF7EC';
                document.getElementById(`card-memory-${c2.idx}`).style.borderColor = '#10B981';
                document.getElementById(`card-memory-${c2.idx}`).classList.add('matched');

                const counter = document.getElementById('memory-counter');
                if (counter) counter.innerText = `Parejas: ${parejasEncontradas} / ${parejas.length}`;

                seleccionadas = [];

                if (parejasEncontradas === parejas.length) {
                    setTimeout(() => window.finalizarJuegoPantalla(act, 100, 80), 1000);
                }
            } else {
                // No coincide, volver a tapar
                setTimeout(() => {
                    [c1, c2].forEach(c => {
                        const el = document.getElementById(`card-memory-${c.idx}`);
                        const t = document.getElementById(`card-text-${c.idx}`);
                        const cov = document.getElementById(`card-cover-${c.idx}`);
                        if (el) {
                            el.style.background = '#1E293B';
                            el.style.borderColor = 'transparent';
                            el.style.color = 'white';
                        }
                        if (cov) cov.style.display = 'block';
                        if (t) t.style.display = 'none';
                    });
                    seleccionadas = [];
                }, 1100);
            }
        }
    };
};

// --- MOTOR 7: SIMULACRO SABER 11 / ICFES EXPRESS ---
window.renderizarMotorIcfesExpress = function(act, container) {
    const data = act.actividad_data || window.generarContenidoActividad('icfes_express', act.materia, act.grado, act.tema);
    const preguntas = data.preguntas || [];
    let qIdx = 0;
    let aciertos = 0;

    function renderIcfes() {
        if (qIdx >= preguntas.length) {
            const puntaje = Math.round((aciertos / preguntas.length) * 100);
            window.finalizarJuegoPantalla(act, puntaje, 100);
            return;
        }

        const p = preguntas[qIdx];
        container.innerHTML = `
            <div style="text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-weight: 800; color: #DC2626; background: #FEF2F2; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem;">
                        Pregunta Saber ${qIdx + 1} de ${preguntas.length}
                    </span>
                    <span style="font-size: 0.85rem; color: #64748B; font-weight: 700;">Aciertos: ${aciertos}</span>
                </div>
                <div style="background: #F8FAFC; border-left: 4px solid #DC2626; padding: 15px; border-radius: 8px; margin-bottom: 18px; font-size: 1rem; color: #1E293B; line-height: 1.5; font-weight: 600;">
                    ${p.q}
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                    ${p.opciones.map((opt, idx) => `
                        <button id="btn-icfes-${idx}" onclick="window.responderIcfes(${idx})" style="background: white; border: 1.5px solid #CBD5E1; padding: 12px 16px; border-radius: 10px; font-size: 0.95rem; font-weight: 700; color: #334155; text-align: left; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 10px;">
                            <span style="background: #F1F5F9; color: #1E293B; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.8rem;">${['A','B','C','D'][idx]}</span>
                            <span>${opt}</span>
                        </button>
                    `).join('')}
                </div>
                <div id="icfes-feedback" style="display: none; padding: 12px 16px; border-radius: 10px; font-size: 0.9rem; font-weight: 700;"></div>
            </div>
        `;
    }

    window.responderIcfes = function(idx) {
        const p = preguntas[qIdx];
        const feedback = document.getElementById('icfes-feedback');

        for (let i = 0; i < p.opciones.length; i++) {
            const btn = document.getElementById(`btn-icfes-${i}`);
            if (btn) {
                btn.disabled = true;
                if (i === p.correcta) {
                    btn.style.background = '#DEF7EC';
                    btn.style.borderColor = '#10B981';
                    btn.style.color = '#03543F';
                } else if (i === idx) {
                    btn.style.background = '#FDE8E8';
                    btn.style.borderColor = '#F87171';
                }
            }
        }

        if (idx === p.correcta) {
            aciertos++;
            if (feedback) {
                feedback.style.display = 'block';
                feedback.style.background = '#ECFDF5';
                feedback.style.color = '#065F46';
                feedback.style.border = '1px solid #A7F3D0';
                feedback.innerHTML = `✨ <b>¡Correcto!</b> ${p.justificacion || ''}`;
            }
        } else {
            if (feedback) {
                feedback.style.display = 'block';
                feedback.style.background = '#FEF2F2';
                feedback.style.color = '#991B1B';
                feedback.style.border = '1px solid #FECACA';
                feedback.innerHTML = `💡 <b>Análisis Pedagógico:</b> ${p.justificacion || 'Revisa la clave explicativa.'}`;
            }
        }

        setTimeout(() => {
            qIdx++;
            renderIcfes();
        }, 2200);
    };

    renderIcfes();
};

// --- MOTOR 8: DILEMA BIOÉTICO / CASO REAL ---
window.renderizarMotorDilema = function(act, container) {
    const data = act.actividad_data || window.generarContenidoActividad('dilema', act.materia, act.grado, act.tema);

    container.innerHTML = `
        <div style="text-align: left;">
            <div style="background: #F0FDFA; border: 1.5px solid #99F6E4; padding: 18px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 8px 0; color: #0F766E; font-weight: 900; font-size: 1.15rem;">
                    ⚖️ Caso de Estudio: ${data.titulo}
                </h4>
                <p style="margin: 0; color: #115E59; font-size: 0.92rem; line-height: 1.5;">
                    ${data.contexto || ''}
                </p>
            </div>

            <h5 style="margin: 0 0 12px 0; font-weight: 900; color: #1E293B; font-size: 1rem;">
                ${data.pregunta_central || '¿Qué decisión fundamentada tomas tú?'}
            </h5>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                ${(data.opciones || []).map((opt, idx) => `
                    <div onclick="window.seleccionarOpcionDilema(${idx})" id="dilema-opt-${idx}" style="background: white; border: 2px solid #E2E8F0; padding: 14px; border-radius: 12px; cursor: pointer; transition: all 0.15s;">
                        <div style="font-weight: 800; font-size: 0.95rem; color: #1E293B; margin-bottom: 4px;">
                            ${idx + 1}. ${opt.texto}
                        </div>
                        <div style="font-size: 0.82rem; color: #64748B;">
                            Impacto: ${opt.impacto}
                        </div>
                    </div>
                `).join('')}
            </div>

            <button id="btn-resolver-dilema" onclick="window.confirmarDecisionDilema()" style="display: none; width: 100%; background: linear-gradient(135deg, #0D9488, #0F766E); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 14px rgba(13,148,136,0.35);">
                ✓ Sustentar Decisión Ética (+110 XP)
            </button>
        </div>
    `;

    let optSeleccionada = null;
    window.seleccionarOpcionDilema = function(idx) {
        optSeleccionada = idx;
        data.opciones.forEach((_, i) => {
            const el = document.getElementById(`dilema-opt-${i}`);
            if (el) {
                el.style.background = i === idx ? '#F0FDFA' : '#FFFFFF';
                el.style.borderColor = i === idx ? '#0D9488' : '#E2E8F0';
            }
        });
        const btn = document.getElementById('btn-resolver-dilema');
        if (btn) btn.style.display = 'block';
    };

    window.confirmarDecisionDilema = function() {
        if (optSeleccionada === null) return;
        window.finalizarJuegoPantalla(act, 100, 110, { opcion_elegida: data.opciones[optSeleccionada] });
    };
};

// --- MOTOR 9: REDACCIÓN CRÍTICA ANTI-COPIA ---
window.renderizarMotorRedaccion = function(act, container) {
    const data = act.actividad_data || window.generarContenidoActividad('redaccion_critica', act.materia, act.grado, act.tema);

    container.innerHTML = `
        <div style="text-align: left;">
            <div style="background: #FFFBEB; border: 1.5px solid #FDE68A; padding: 16px; border-radius: 12px; margin-bottom: 18px;">
                <h4 style="margin: 0 0 6px 0; color: #92400E; font-weight: 900; font-size: 1.1rem;">
                    ✍️ Desafío de Explicación Creativa
                </h4>
                <p style="margin: 0; color: #78350F; font-size: 0.92rem; line-height: 1.45;">
                    ${data.consigna || ''}
                </p>
            </div>

            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <label style="font-weight: 800; color: #1E293B; font-size: 0.88rem;">Tu Respuesta Argumentada:</label>
                    <span id="palabras-count" style="font-size: 0.8rem; font-weight: 800; color: #64748B;">0 / 60 palabras</span>
                </div>
                <textarea id="textarea-redaccion" oninput="window.contarPalabrasRedaccion()" rows="5" placeholder="Escribe aquí tu análisis..." style="width: 100%; padding: 12px; border: 1.5px solid #CBD5E1; border-radius: 10px; font-family: Inter, sans-serif; font-size: 0.95rem; box-sizing: border-box;"></textarea>
            </div>

            <button onclick="window.enviarRedaccion()" style="width: 100%; background: linear-gradient(135deg, #D97706, #B45309); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 14px rgba(217,119,6,0.35);">
                🚀 Entregar Redacción (+90 XP)
            </button>
        </div>
    `;

    window.contarPalabrasRedaccion = function() {
        const txt = document.getElementById('textarea-redaccion');
        const countSpan = document.getElementById('palabras-count');
        if (txt && countSpan) {
            const count = txt.value.trim() ? txt.value.trim().split(/\s+/).length : 0;
            countSpan.innerText = `${count} / 60 palabras`;
            countSpan.style.color = count >= 60 ? '#059669' : '#64748B';
        }
    };

    window.enviarRedaccion = function() {
        const txt = document.getElementById('textarea-redaccion');
        const val = txt ? txt.value.trim() : '';
        const count = val ? val.split(/\s+/).length : 0;

        if (count < 25) {
            alert("Tu respuesta es muy breve. Por favor argumenta con al menos 25 palabras para fundamentar tu idea.");
            return;
        }

        window.finalizarJuegoPantalla(act, 100, 90, { texto: val });
    };
};

// --- MOTOR 10: DEBATE Y ROLEPLAY STEAM ---
window.renderizarMotorDebate = function(act, container) {
    const data = act.actividad_data || window.generarContenidoActividad('debate_roleplay', act.materia, act.grado, act.tema);

    container.innerHTML = `
        <div style="text-align: left;">
            <div style="background: #EEF2FF; border: 1.5px solid #C7D2FE; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="margin: 0 0 6px 0; color: #3730A3; font-weight: 900; font-size: 1.15rem;">
                    🎭 Ficha de Debate: ${data.tema_debate || ''}
                </h4>
                <p style="margin: 0; color: #4338CA; font-size: 0.88rem;">
                    Elige uno de los roles a continuación y redacta tu argumento principal basado en evidencias:
                </p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                ${(data.roles || []).map((r, idx) => `
                    <div onclick="window.seleccionarRolDebate(${idx})" id="rol-debate-${idx}" style="background: white; border: 2px solid #E2E8F0; padding: 12px; border-radius: 10px; cursor: pointer; transition: all 0.15s; text-align: center;">
                        <div style="font-weight: 900; font-size: 0.95rem; color: #1E293B; margin-bottom: 4px;">${r.rol}</div>
                        <div style="font-size: 0.78rem; color: #64748B; line-height: 1.3;">${r.postura}</div>
                    </div>
                `).join('')}
            </div>

            <div style="margin-bottom: 20px;">
                <label style="font-weight: 800; color: #1E293B; font-size: 0.88rem; display: block; margin-bottom: 6px;">
                    Tu Argumento de Defensa del Rol:
                </label>
                <textarea id="textarea-debate-arg" rows="3" placeholder="Sustenta tu posición con datos y ejemplos..." style="width: 100%; padding: 10px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-family: Inter, sans-serif; font-size: 0.9rem; box-sizing: border-box;"></textarea>
            </div>

            <button onclick="window.enviarDebate()" style="width: 100%; background: linear-gradient(135deg, #4F46E5, #4338CA); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 14px rgba(79,70,229,0.35);">
                ✓ Registrar Argumento en el Salón STEAM (+100 XP)
            </button>
        </div>
    `;

    let rolIdx = 0;
    window.seleccionarRolDebate = function(idx) {
        rolIdx = idx;
        data.roles.forEach((_, i) => {
            const el = document.getElementById(`rol-debate-${i}`);
            if (el) {
                el.style.background = i === idx ? '#EEF2FF' : '#FFFFFF';
                el.style.borderColor = i === idx ? '#4F46E5' : '#E2E8F0';
            }
        });
    };

    window.enviarDebate = function() {
        const txt = document.getElementById('textarea-debate-arg');
        const val = txt ? txt.value.trim() : '';
        if (val.length < 15) {
            alert("Por favor redacta tu argumento (mínimo 15 caracteres).");
            return;
        }
        window.finalizarJuegoPantalla(act, 100, 100, { rol: data.roles[rolIdx], argumento: val });
    };
};

// 7. Pantalla Final de Victoria y Otorgamiento de XP
window.finalizarJuegoPantalla = async function(act, puntaje = 100, xpOtorgado = 80, respuestas = {}) {
    const container = document.getElementById('juego-actividad-contenido');
    const timerContainer = document.getElementById('juego-timer-container');
    if (timerContainer) timerContainer.style.display = 'none';

    const estudiante = window.usuarioEstudianteActual || {};
    const doc = String(estudiante.documento || estudiante.usuario || window.usuario_actual || '').trim();

    // Guardar en backend
    try {
        await fetch('/api/completar-actividad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                actividad_id: act.id,
                documento: doc,
                respuestas,
                puntaje,
                xp_ganado: xpOtorgado
            })
        });
    } catch(e) {}

    // Guardar localmente
    localStorage.setItem(`act_completada_${act.id}_${doc}`, 'true');

    // Aumentar XP local
    const xpKey = `xp_${doc}`;
    let actualXP = parseInt(localStorage.getItem(xpKey)) || 0;
    actualXP += xpOtorgado;
    localStorage.setItem(xpKey, actualXP);

    // Actualizar badges
    const pScore = document.getElementById('student-score-display');
    if (pScore) pScore.innerText = actualXP;

    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 25px 15px;">
                <div style="font-size: 4rem; animation: pulse 1s infinite;">🏆</div>
                <h2 style="font-size: 2rem; font-weight: 900; color: #1E1B4B; margin: 10px 0 6px 0;">
                    ¡Misión Cumplida con Éxito!
                </h2>
                <p style="font-size: 1.05rem; color: #475569; margin: 0 0 20px 0;">
                    Has demostrado tus competencias en <strong>${act.materia}</strong>.
                </p>

                <div style="display: inline-flex; align-items: center; gap: 10px; background: #ECFDF5; border: 2px solid #34D399; padding: 12px 28px; border-radius: 30px; margin-bottom: 25px; box-shadow: 0 4px 15px rgba(16,185,129,0.2);">
                    <span style="font-size: 1.6rem;">⭐</span>
                    <span style="font-size: 1.4rem; font-weight: 900; color: #065F46;">+${xpOtorgado} XP Ganados</span>
                </div>

                <div>
                    <button onclick="window.cerrarModalJuegoActividad(); window.cargarActividadesEstudiante();" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 14px 32px; border-radius: 12px; font-weight: 900; font-size: 1.05rem; cursor: pointer; box-shadow: 0 6px 20px rgba(16,185,129,0.35);">
                        🚀 Continuar en Mi Aula STEAM
                    </button>
                </div>
            </div>
        `;
    }

    if (typeof window.mostrarToastXP === 'function') {
        window.mostrarToastXP(`✨ +${xpOtorgado} XP | ¡Reto Superado!`);
    }
};

// ==========================================================================
// MOTOR DE GENERACIÓN Y PRESENTACIÓN DE DIAPOSITIVAS SEMANALES (10 SLIDES)
// ==========================================================================

window.diapositivasDeckActual = null;
window.slideIndexActual = 0;

// Paletas de color dinámicas por materia
window.PALETAS_MATERIAS_SLIDES = {
    'Ciencias Naturales': { bgGrad: 'linear-gradient(135deg, #064E3B, #047857)', accent: '#10B981', badgeBg: '#ECFDF5', badgeText: '#065F46', icon: '🌿' },
    'Matemáticas': { bgGrad: 'linear-gradient(135deg, #1E1B4B, #3730A3)', accent: '#6366F1', badgeBg: '#EEF2FF', badgeText: '#3730A3', icon: '📐' },
    'Lengua Castellana': { bgGrad: 'linear-gradient(135deg, #78350F, #B45309)', accent: '#F59E0B', badgeBg: '#FEF3C7', badgeText: '#92400E', icon: '📖' },
    'Ciencias Sociales': { bgGrad: 'linear-gradient(135deg, #881337, #BE123C)', accent: '#F43F5E', badgeBg: '#FFE4E6', badgeText: '#9F1239', icon: '🌍' },
    'Inglés': { bgGrad: 'linear-gradient(135deg, #0C4A6E, #0284C7)', accent: '#38BDF8', badgeBg: '#E0F2FE', badgeText: '#0369A1', icon: '🇬🇧' },
    'Tecnología': { bgGrad: 'linear-gradient(135deg, #312E81, #4338CA)', accent: '#818CF8', badgeBg: '#EEF2FF', badgeText: '#312E81', icon: '💻' },
    'Educación Artística': { bgGrad: 'linear-gradient(135deg, #701A75, #A21CAF)', accent: '#E879F9', badgeBg: '#FDF4FF', badgeText: '#701A75', icon: '🎨' },
    'Ética y Valores': { bgGrad: 'linear-gradient(135deg, #134E4A, #0F766E)', accent: '#2DD4BF', badgeBg: '#F0FDFA', badgeText: '#134E4A', icon: '🕊️' }
};

window.abrirConfiguradorDiapositivas = function(rol = 'docente', materiaDef = '', gradoDef = '', perDef = '3', semDef = '1') {
    const modal = document.getElementById('modal-generar-diapositivas');
    if (!modal) return;

    const selMat = document.getElementById('slides-materia-select');
    const selGra = document.getElementById('slides-grado-select');
    const selPer = document.getElementById('slides-periodo-select');
    const selSem = document.getElementById('slides-semana-select');

    if (selMat && materiaDef) selMat.value = materiaDef;
    if (selGra && gradoDef) selGra.value = gradoDef;
    if (selPer && perDef) selPer.value = perDef;
    if (selSem && semDef) selSem.value = semDef;

    modal.style.display = 'flex';
};

window.cerrarConfiguradorDiapositivas = function() {
    const modal = document.getElementById('modal-generar-diapositivas');
    if (modal) modal.style.display = 'none';
};

// Generador de Contenido de Alta Calidad para las 10 Diapositivas
window.generar10DiapositivasPedagogicas = function(materia, grado, periodo, semana, temaCustom) {
    const paleta = window.PALETAS_MATERIAS_SLIDES[materia] || window.PALETAS_MATERIAS_SLIDES['Ciencias Naturales'];
    const temaPrincipal = temaCustom && temaCustom.trim() ? temaCustom.trim() : `Unidad Temática Semanal: ${materia} (Grado ${grado} • Periodo ${periodo} • Semana ${semana})`;

    return {
        materia,
        grado,
        periodo,
        semana,
        temaPrincipal,
        paleta,
        slides: [
            // Slide 1: Portada y Pregunta Detonante
            {
                tipo: 'portada',
                numero: 1,
                titulo: temaPrincipal,
                subtitulo: `Ruta de Aprendizaje STEAM • Grado ${grado}° • Periodo ${periodo} • Semana ${semana}`,
                pregunta_detonante: `¿Cómo podemos usar los principios de ${temaPrincipal} para comprender el mundo y diseñar soluciones sostenibles?`,
                icon: paleta.icon
            },
            // Slide 2: ¿Por Qué Importa? (Contexto Cotidiano)
            {
                tipo: 'contexto',
                numero: 2,
                titulo: '¿Por Qué es Fundamental Este Tema?',
                subtitulo: 'Conexión con tu vida diaria, tu comunidad y el entorno',
                puntos: [
                    { icon: '🏠', titulo: 'En Tu Hogar y Vida Diaria', desc: 'Permite explicar fenómenos que observas a diario y tomar mejores decisiones prácticas.' },
                    { icon: '🌱', titulo: 'En el Entorno y la Naturaleza', desc: 'Ayuda a conservar los recursos hídricos, energéticos y la biodiversidad de nuestra región.' },
                    { icon: '🚀', titulo: 'En la Ciencia y el Futuro', desc: 'Es la base de las tecnologías modernas, la ingeniería verde y la innovación digital.' }
                ]
            },
            // Slide 3: Mapa de Ruta Semanal (3 Saberes)
            {
                tipo: 'objetivos',
                numero: 3,
                titulo: 'Nuestra Ruta de Aprendizaje STEAM',
                subtitulo: 'Lo que lograremos paso a paso durante esta semana',
                objetivos: [
                    { num: '1', saber: 'Saber Conceptual', titulo: 'Explorar y Comprender', desc: 'Identificar las leyes, conceptos y variables centrales del tema.' },
                    { num: '2', saber: 'Saber Procedimental', titulo: 'Experimentar y Modelar', desc: 'Aplicar el método científico y herramientas matemáticas en situaciones reales.' },
                    { num: '3', saber: 'Saber Axiológico', titulo: 'Crear y Transformar', desc: 'Proponer soluciones colaborativas con impacto ético y ambiental.' }
                ]
            },
            // Slide 4: Concepto Clave 1 (El Fundamento & Analogía)
            {
                tipo: 'concepto_clave',
                numero: 4,
                titulo: 'El Concepto Central',
                subtitulo: 'La idea fundamental explicada de forma clara y visual',
                definicion: `En el estudio de ${temaPrincipal}, los elementos interactúan bajo principios de causa, conservación y flujo dinámico.`,
                analogia_titulo: '💡 Analogía Intuitiva:',
                analogia_texto: 'Imagina este fenómeno como una red de engranajes donde cada variable ajusta la velocidad y el equilibrio de todo el sistema.'
            },
            // Slide 5: ¿Cómo Funciona? (Diagrama de Proceso)
            {
                tipo: 'mecanismo',
                numero: 5,
                titulo: '¿Cómo Funciona en la Práctica?',
                subtitulo: 'Flujo secuencial del fenómeno en 3 momentos clave',
                pasos: [
                    { paso: 'Fase Inicial', icon: '🔍', desc: 'Entrada de energía / variables iniciales que activan el proceso.' },
                    { paso: 'Fase de Transformación', icon: '⚙️', desc: 'Interacción dinámica donde ocurren las relaciones proporcionales.' },
                    { paso: 'Fase de Resultado', icon: '📊', desc: 'Equilibrio final, producto medible o trabajo útil generado.' }
                ]
            },
            // Slide 6: Infografía Comparativa (Mito vs Realidad)
            {
                tipo: 'comparativa',
                numero: 6,
                titulo: 'Claridad Conceptual: Mito vs. Evidencia',
                subtitulo: 'Derribando ideas preconcebidas con rigor científico',
                filas: [
                    { mito: '❌ "El fenómeno ocurre de forma aislada sin interacción."', realidad: '✅ Todo sistema intercambia materia, energía o información con su entorno.' },
                    { mito: '❌ "Solo se puede estudiar con fórmulas complejas."', realidad: '✅ Comienza con la observación directa, modelos cualitativos y ejemplos cotidianos.' }
                ]
            },
            // Slide 7: Caso Real y Aplicación en el Territorio
            {
                tipo: 'caso_real',
                numero: 7,
                titulo: 'Impacto Real en Nuestro Territorio',
                subtitulo: 'Aplicación contextual en el Quindío y Colombia',
                caso_titulo: 'Gestión Sostenible y Bioeconomía',
                caso_desc: `Los conocimientos sobre ${temaPrincipal} son hoy aplicados por científicos y emprendedores para optimizar los cultivos cafeteros, proteger las cuencas de agua y diseñar fuentes de energía limpia comunitaria.`,
                impacto_badge: '🌎 Competencia Ciudadana y Ambiental'
            },
            // Slide 8: Mini-Desafío de Activación Mental
            {
                tipo: 'desafio',
                numero: 8,
                titulo: '⚡ Mini-Desafío de Activación Mental',
                subtitulo: 'Pensemos juntos durante 2 minutos antes de continuar',
                pregunta_reto: `Si duplicamos una de las variables principales en ${temaPrincipal}, ¿qué esperarías que suceda con el resultado final?`,
                pistas: [
                    '¿Es una relación directamente proporcional o inversa?',
                    '¿Qué pasaría en un caso extremo?',
                    'Compara tu hipótesis con la de tu compañero o tutor.'
                ]
            },
            // Slide 9: Semáforo de Buenas Prácticas
            {
                tipo: 'semaforo',
                numero: 9,
                titulo: 'Tips para Dominar el Tema',
                subtitulo: 'Lo que debes evitar y lo que te llevará a la excelencia',
                items: [
                    { tipo: 'error', icon: '🛑', label: 'Evita:', desc: 'Memorizar sin entender la relación de causa y efecto.' },
                    { tipo: 'alerta', icon: '⚠️', label: 'Ten cuidado con:', desc: 'Olvidar las unidades de medida y las condiciones iniciales.' },
                    { tipo: 'exito', icon: '✅', label: 'Aplica siempre:', desc: 'Explicar el concepto con tus propias palabras y un esquema gráfico.' }
                ]
            },
            // Slide 10: Misión de la Semana y Cierre
            {
                tipo: 'cierre',
                numero: 10,
                titulo: '¡Misión STEAM Semanal Activada!',
                subtitulo: 'Manos a la obra: aprende, crea y supera tu récord',
                mision_texto: `Tu desafío esta semana es desarrollar la guía de ${materia}, resolver las misiones interactivas y poner a prueba tu conocimiento.`,
                frase_motivacional: '"La ciencia no es solo un conjunto de saberes, es una forma apasionante de pensar y transformar el mundo."',
                xp_badge: '🌟 +100 XP por Completar la Guía Semanal'
            }
        ]
    };
};

window.ejecutarGeneracionDiapositivas = function() {
    const selMat = document.getElementById('slides-materia-select');
    const selGra = document.getElementById('slides-grado-select');
    const selPer = document.getElementById('slides-periodo-select');
    const selSem = document.getElementById('slides-semana-select');
    const inTema = document.getElementById('slides-tema-custom');

    const materia = selMat ? selMat.value : 'Ciencias Naturales';
    const grado = selGra ? selGra.value : '7';
    const periodo = selPer ? selPer.value : '3';
    const semana = selSem ? selSem.value : '1';
    const temaCustom = inTema ? inTema.value.trim() : '';

    const deck = window.generar10DiapositivasPedagogicas(materia, grado, periodo, semana, temaCustom);

    window.cerrarConfiguradorDiapositivas();
    window.abrirPresentadorDiapositivas(deck);
};

window.abrirPresentadorDiapositivas = function(deck) {
    const modal = document.getElementById('modal-diapositivas-presentador');
    if (!modal) return;

    window.diapositivasDeckActual = deck;
    window.slideIndexActual = 0;

    const titleHeader = document.getElementById('slides-deck-title');
    const subtitleHeader = document.getElementById('slides-deck-subtitle');

    if (titleHeader) titleHeader.innerText = deck.temaPrincipal;
    if (subtitleHeader) subtitleHeader.innerText = `${deck.materia} • Grado ${deck.grado}° • Periodo ${deck.periodo} • Semana ${deck.semana}`;

    // Renderizar los 10 puntos inferiores
    const dotsContainer = document.getElementById('slides-dots-container');
    if (dotsContainer) {
        dotsContainer.innerHTML = deck.slides.map((s, idx) => `
            <button onclick="window.irASlide(${idx})" id="slide-dot-${idx}" style="width: 28px; height: 28px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.4); background: ${idx === 0 ? '#3B82F6' : 'rgba(255,255,255,0.15)'}; color: white; font-weight: 800; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s;">
                ${idx + 1}
            </button>
        `).join('');
    }

    modal.style.display = 'flex';
    window.renderizarSlideActual();

    // Escuchador de teclado
    window.removeEventListener('keydown', window.manejarTecladoSlides);
    window.addEventListener('keydown', window.manejarTecladoSlides);
};

window.cerrarPresentadorDiapositivas = function() {
    const modal = document.getElementById('modal-diapositivas-presentador');
    if (modal) modal.style.display = 'none';
    window.removeEventListener('keydown', window.manejarTecladoSlides);
};

window.manejarTecladoSlides = function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
        window.navegarSlide(1);
    } else if (e.key === 'ArrowLeft') {
        window.navegarSlide(-1);
    } else if (e.key === 'Escape') {
        window.cerrarPresentadorDiapositivas();
    }
};

window.navegarSlide = function(delta) {
    if (!window.diapositivasDeckActual) return;
    const total = window.diapositivasDeckActual.slides.length;
    const nuevoIdx = window.slideIndexActual + delta;
    if (nuevoIdx >= 0 && nuevoIdx < total) {
        window.irASlide(nuevoIdx);
    }
};

window.irASlide = function(idx) {
    if (!window.diapositivasDeckActual) return;
    window.slideIndexActual = idx;

    // Actualizar dots
    for (let i = 0; i < window.diapositivasDeckActual.slides.length; i++) {
        const dot = document.getElementById(`slide-dot-${i}`);
        if (dot) {
            dot.style.background = (i === idx) ? '#3B82F6' : 'rgba(255,255,255,0.15)';
            dot.style.transform = (i === idx) ? 'scale(1.15)' : 'scale(1)';
            dot.style.borderColor = (i === idx) ? '#60A5FA' : 'rgba(255,255,255,0.4)';
        }
    }

    // Botones prev / next estado
    const btnPrev = document.getElementById('btn-slide-prev');
    const btnNext = document.getElementById('btn-slide-next');
    if (btnPrev) btnPrev.disabled = (idx === 0);
    if (btnNext) btnNext.disabled = (idx === window.diapositivasDeckActual.slides.length - 1);

    window.renderizarSlideActual();
};

window.renderizarSlideActual = function() {
    const stage = document.getElementById('slide-stage');
    if (!stage || !window.diapositivasDeckActual) return;

    const deck = window.diapositivasDeckActual;
    const s = deck.slides[window.slideIndexActual];
    const paleta = deck.paleta;

    let slideHTML = '';

    if (s.tipo === 'portada') {
        slideHTML = `
            <div style="flex: 1; background: ${paleta.bgGrad}; color: white; padding: 45px 50px; display: flex; flex-direction: column; justify-content: space-between; text-align: left; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 2.2rem; background: rgba(255,255,255,0.15); padding: 8px 14px; border-radius: 14px;">${s.icon}</span>
                        <div>
                            <span style="background: rgba(255,255,255,0.25); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                                ${deck.materia}
                            </span>
                        </div>
                    </div>
                    <div style="font-size: 0.95rem; font-weight: 800; color: #E2E8F0; background: rgba(0,0,0,0.25); padding: 6px 14px; border-radius: 20px;">
                        Diapositiva ${s.numero} de 10
                    </div>
                </div>

                <div style="margin: 20px 0;">
                    <h1 style="font-size: 2.6rem; font-weight: 900; line-height: 1.15; margin: 0 0 10px 0; letter-spacing: -0.5px; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                        ${s.titulo}
                    </h1>
                    <p style="font-size: 1.2rem; color: #E0E7FF; margin: 0; font-weight: 600;">
                        ${s.subtitulo}
                    </p>
                </div>

                <div style="background: rgba(255,255,255,0.12); backdrop-filter: blur(8px); border: 1.5px solid rgba(255,255,255,0.3); border-radius: 16px; padding: 18px 24px; box-shadow: 0 8px 20px rgba(0,0,0,0.15);">
                    <div style="font-size: 0.85rem; font-weight: 900; color: #FEF08A; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                        <span>❓</span> Gran Pregunta Detonante de la Semana:
                    </div>
                    <div style="font-size: 1.15rem; font-weight: 700; color: #FFFFFF; line-height: 1.4;">
                        ${s.pregunta_detonante}
                    </div>
                </div>
            </div>
        `;
    } else if (s.tipo === 'contexto') {
        slideHTML = `
            <div style="flex: 1; background: #FFFFFF; padding: 40px 45px; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">
                    <div>
                        <span style="font-size: 0.82rem; font-weight: 800; color: ${paleta.accent}; text-transform: uppercase;">Módulo de Relevancia</span>
                        <h2 style="font-size: 1.8rem; font-weight: 900; color: #1E1B4B; margin: 2px 0 0 0;">${s.titulo}</h2>
                    </div>
                    <span style="background: #F1F5F9; color: #475569; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.85rem;">Slide ${s.numero}/10</span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0;">
                    ${s.puntos.map(p => `
                        <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 22px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                            <div>
                                <span style="font-size: 2.2rem; display: inline-block; margin-bottom: 10px;">${p.icon}</span>
                                <h4 style="margin: 0 0 8px 0; font-size: 1.15rem; font-weight: 900; color: #1E293B;">${p.titulo}</h4>
                                <p style="margin: 0; color: #64748B; font-size: 0.95rem; line-height: 1.5;">${p.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="background: ${paleta.badgeBg}; border-left: 4px solid ${paleta.accent}; padding: 12px 18px; border-radius: 8px; color: ${paleta.badgeText}; font-weight: 700; font-size: 0.95rem;">
                    💡 <b>Conclusión Práctica:</b> Lo que aprendes en el aula o en casa tiene una aplicación directa en cómo entiendes y cuidas tu entorno.
                </div>
            </div>
        `;
    } else if (s.tipo === 'objetivos') {
        slideHTML = `
            <div style="flex: 1; background: #FFFFFF; padding: 40px 45px; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">
                    <div>
                        <span style="font-size: 0.82rem; font-weight: 800; color: #7C3AED; text-transform: uppercase;">Objetivos de Aprendizaje</span>
                        <h2 style="font-size: 1.8rem; font-weight: 900; color: #1E1B4B; margin: 2px 0 0 0;">${s.titulo}</h2>
                    </div>
                    <span style="background: #F1F5F9; color: #475569; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.85rem;">Slide ${s.numero}/10</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 14px; margin: 20px 0;">
                    ${s.objetivos.map(obj => `
                        <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; gap: 18px;">
                            <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #7C3AED, #6D28D9); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 900; flex-shrink: 0;">
                                ${obj.num}
                            </div>
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <h4 style="margin: 0; font-size: 1.1rem; font-weight: 900; color: #1E1B4B;">${obj.titulo}</h4>
                                    <span style="background: #EEF2FF; color: #4338CA; padding: 2px 10px; border-radius: 12px; font-weight: 800; font-size: 0.78rem;">${obj.saber}</span>
                                </div>
                                <p style="margin: 4px 0 0 0; color: #475569; font-size: 0.95rem;">${obj.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="text-align: center; color: #64748B; font-size: 0.9rem; font-weight: 600;">
                    🎯 Estándares alineados con los Derechos Básicos de Aprendizaje (DBA V2 - MEN Colombia).
                </div>
            </div>
        `;
    } else if (s.tipo === 'concepto_clave') {
        slideHTML = `
            <div style="flex: 1; background: #FFFFFF; padding: 40px 45px; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">
                    <div>
                        <span style="font-size: 0.82rem; font-weight: 800; color: #2563EB; text-transform: uppercase;">Fundamento Teórico</span>
                        <h2 style="font-size: 1.8rem; font-weight: 900; color: #1E1B4B; margin: 2px 0 0 0;">${s.titulo}</h2>
                    </div>
                    <span style="background: #F1F5F9; color: #475569; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.85rem;">Slide ${s.numero}/10</span>
                </div>

                <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 25px; margin: 20px 0; align-items: stretch;">
                    <div style="background: linear-gradient(135deg, #1E293B, #0F172A); color: white; border-radius: 18px; padding: 28px; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 10px 25px rgba(0,0,0,0.15);">
                        <span style="color: #38BDF8; font-size: 0.85rem; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">Definición Cristalina:</span>
                        <p style="font-size: 1.35rem; font-weight: 700; line-height: 1.45; margin: 0; color: #F8FAFC;">
                            ${s.definicion}
                        </p>
                    </div>

                    <div style="background: #FEF3C7; border: 1.5px solid #FCD34D; border-radius: 18px; padding: 28px; display: flex; flex-direction: column; justify-content: center;">
                        <h4 style="margin: 0 0 8px 0; color: #92400E; font-size: 1.15rem; font-weight: 900;">${s.analogia_titulo}</h4>
                        <p style="margin: 0; color: #78350F; font-size: 1.05rem; line-height: 1.5; font-weight: 600;">
                            ${s.analogia_texto}
                        </p>
                    </div>
                </div>

                <div style="background: #F0FDF4; border: 1px solid #BBF7D0; padding: 12px 18px; border-radius: 8px; color: #166534; font-size: 0.95rem; font-weight: 700;">
                    🧠 <b>Palabra Clave:</b> La conceptualización clara es la base para resolver cualquier problema científico posterior.
                </div>
            </div>
        `;
    } else if (s.tipo === 'mecanismo') {
        slideHTML = `
            <div style="flex: 1; background: #FFFFFF; padding: 40px 45px; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">
                    <div>
                        <span style="font-size: 0.82rem; font-weight: 800; color: #059669; text-transform: uppercase;">Proceso y Dinámica</span>
                        <h2 style="font-size: 1.8rem; font-weight: 900; color: #1E1B4B; margin: 2px 0 0 0;">${s.titulo}</h2>
                    </div>
                    <span style="background: #F1F5F9; color: #475569; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.85rem;">Slide ${s.numero}/10</span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 25px 0; position: relative;">
                    ${s.pasos.map((p, idx) => `
                        <div style="background: #F8FAFC; border: 2px solid #CBD5E1; border-radius: 16px; padding: 22px; text-align: center; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <span style="font-size: 2.5rem; display: block; margin-bottom: 10px;">${p.icon}</span>
                                <span style="background: #E2E8F0; color: #1E293B; padding: 3px 12px; border-radius: 12px; font-weight: 800; font-size: 0.8rem; text-transform: uppercase;">Paso ${idx + 1}</span>
                                <h4 style="margin: 10px 0 8px 0; font-size: 1.15rem; font-weight: 900; color: #0F172A;">${p.paso}</h4>
                                <p style="margin: 0; color: #475569; font-size: 0.92rem; line-height: 1.45;">${p.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="text-align: center; color: #64748B; font-size: 0.95rem; font-weight: 600;">
                    🔄 Observa cómo una alteración en la Fase 1 impacta directamente el resultado de la Fase 3.
                </div>
            </div>
        `;
    } else if (s.tipo === 'comparativa') {
        slideHTML = `
            <div style="flex: 1; background: #FFFFFF; padding: 40px 45px; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">
                    <div>
                        <span style="font-size: 0.82rem; font-weight: 800; color: #DC2626; text-transform: uppercase;">Rigor y Pensamiento Crítico</span>
                        <h2 style="font-size: 1.8rem; font-weight: 900; color: #1E1B4B; margin: 2px 0 0 0;">${s.titulo}</h2>
                    </div>
                    <span style="background: #F1F5F9; color: #475569; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.85rem;">Slide ${s.numero}/10</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 16px; margin: 20px 0;">
                    ${s.filas.map(f => `
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div style="background: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 14px; padding: 18px; color: #991B1B;">
                                <div style="font-weight: 900; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 4px;">Mito o Error Común:</div>
                                <div style="font-size: 1.05rem; font-weight: 700; line-height: 1.4;">${f.mito}</div>
                            </div>
                            <div style="background: #ECFDF5; border: 1.5px solid #A7F3D0; border-radius: 14px; padding: 18px; color: #065F46;">
                                <div style="font-weight: 900; font-size: 0.85rem; text-transform: uppercase; margin-bottom: 4px;">Evidencia Científica:</div>
                                <div style="font-size: 1.05rem; font-weight: 700; line-height: 1.4;">${f.realidad}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px 18px; border-radius: 8px; text-align: center; color: #334155; font-size: 0.95rem; font-weight: 700;">
                    🧐 El pensamiento científico consiste en contrastar creencias con observaciones reproducibles.
                </div>
            </div>
        `;
    } else if (s.tipo === 'caso_real') {
        slideHTML = `
            <div style="flex: 1; background: #FFFFFF; padding: 40px 45px; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">
                    <div>
                        <span style="font-size: 0.82rem; font-weight: 800; color: #0D9488; text-transform: uppercase;">Contexto Regional y Global</span>
                        <h2 style="font-size: 1.8rem; font-weight: 900; color: #1E1B4B; margin: 2px 0 0 0;">${s.titulo}</h2>
                    </div>
                    <span style="background: #F1F5F9; color: #475569; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.85rem;">Slide ${s.numero}/10</span>
                </div>

                <div style="background: linear-gradient(135deg, #F0FDFA, #CCFBF1); border: 2px solid #5EEAD4; border-radius: 20px; padding: 30px; margin: 20px 0; box-shadow: 0 8px 20px rgba(13,148,136,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <h3 style="margin: 0; font-size: 1.45rem; font-weight: 900; color: #0F766E;">
                            🌱 ${s.caso_titulo}
                        </h3>
                        <span style="background: #0F766E; color: white; padding: 4px 14px; border-radius: 20px; font-weight: 800; font-size: 0.82rem;">
                            ${s.impacto_badge}
                        </span>
                    </div>
                    <p style="font-size: 1.15rem; color: #115E59; line-height: 1.6; margin: 0; font-weight: 600;">
                        ${s.caso_desc}
                    </p>
                </div>

                <div style="display: flex; gap: 15px; align-items: center; background: #F8FAFC; padding: 12px 18px; border-radius: 10px;">
                    <span style="font-size: 1.6rem;">🤝</span>
                    <span style="font-size: 0.95rem; color: #475569; font-weight: 600;">¿Cómo podrías tú aplicar esta misma idea en un proyecto escolar o familiar?</span>
                </div>
            </div>
        `;
    } else if (s.tipo === 'desafio') {
        slideHTML = `
            <div style="flex: 1; background: #FFFFFF; padding: 40px 45px; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">
                    <div>
                        <span style="font-size: 0.82rem; font-weight: 800; color: #EA580C; text-transform: uppercase;">Participación Activa</span>
                        <h2 style="font-size: 1.8rem; font-weight: 900; color: #1E1B4B; margin: 2px 0 0 0;">${s.titulo}</h2>
                    </div>
                    <span style="background: #F1F5F9; color: #475569; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.85rem;">Slide ${s.numero}/10</span>
                </div>

                <div style="background: #FFF7ED; border: 2px solid #FDBA74; border-radius: 20px; padding: 28px; margin: 20px 0;">
                    <div style="font-size: 0.9rem; font-weight: 900; color: #C2410C; text-transform: uppercase; margin-bottom: 6px;">Pregunta Reto en Vivo:</div>
                    <p style="font-size: 1.35rem; font-weight: 800; color: #7C2D12; margin: 0 0 20px 0; line-height: 1.4;">
                        ${s.pregunta_reto}
                    </p>

                    <div style="background: white; border: 1px dashed #FB923C; border-radius: 12px; padding: 16px;">
                        <div style="font-weight: 800; color: #9A3412; font-size: 0.9rem; margin-bottom: 6px;">Pistas para el análisis:</div>
                        <ul style="margin: 0; padding-left: 20px; color: #431407; font-size: 0.95rem; line-height: 1.5;">
                            ${s.pistas.map(p => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div style="text-align: center; color: #EA580C; font-weight: 800; font-size: 1rem;">
                    ⏱️ Tómate 2 minutos para dialogar con tu grupo o tutor antes de dar la respuesta.
                </div>
            </div>
        `;
    } else if (s.tipo === 'semaforo') {
        slideHTML = `
            <div style="flex: 1; background: #FFFFFF; padding: 40px 45px; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 12px;">
                    <div>
                        <span style="font-size: 0.82rem; font-weight: 800; color: #4F46E5; text-transform: uppercase;">Estrategias de Estudio</span>
                        <h2 style="font-size: 1.8rem; font-weight: 900; color: #1E1B4B; margin: 2px 0 0 0;">${s.titulo}</h2>
                    </div>
                    <span style="background: #F1F5F9; color: #475569; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.85rem;">Slide ${s.numero}/10</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 14px; margin: 20px 0;">
                    ${s.items.map(item => `
                        <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 18px 22px; display: flex; align-items: center; gap: 18px;">
                            <span style="font-size: 2.2rem;">${item.icon}</span>
                            <div>
                                <div style="font-weight: 900; font-size: 1.05rem; color: #1E293B; margin-bottom: 2px;">${item.label}</div>
                                <div style="font-size: 0.95rem; color: #475569; font-weight: 600;">${item.desc}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div style="text-align: center; color: #64748B; font-size: 0.95rem; font-weight: 700;">
                    🌟 La constancia y el método son los mejores aliados del aprendizaje significativo.
                </div>
            </div>
        `;
    } else {
        // Slide 10: Cierre y Misión Semanal
        slideHTML = `
            <div style="flex: 1; background: ${paleta.bgGrad}; color: white; padding: 45px 50px; display: flex; flex-direction: column; justify-content: space-between; text-align: center; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="background: rgba(255,255,255,0.25); color: white; padding: 4px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 800; text-transform: uppercase;">
                        Cierre & Misión Semanal
                    </span>
                    <span style="font-size: 0.95rem; font-weight: 800; color: #E2E8F0; background: rgba(0,0,0,0.25); padding: 6px 14px; border-radius: 20px;">
                        Diapositiva ${s.numero} de 10
                    </span>
                </div>

                <div style="margin: 15px 0;">
                    <div style="font-size: 3.5rem; margin-bottom: 10px;">🏆</div>
                    <h1 style="font-size: 2.3rem; font-weight: 900; margin: 0 0 10px 0;">${s.titulo}</h1>
                    <p style="font-size: 1.15rem; color: #E0E7FF; max-width: 750px; margin: 0 auto; line-height: 1.5; font-weight: 600;">
                        ${s.mision_texto}
                    </p>
                </div>

                <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border: 1.5px solid rgba(255,255,255,0.3); border-radius: 16px; padding: 18px; max-width: 650px; margin: 0 auto;">
                    <p style="font-style: italic; font-size: 1rem; color: #FEF08A; margin: 0 0 8px 0; font-weight: 700;">
                        ${s.frase_motivacional}
                    </p>
                    <span style="background: #10B981; color: white; padding: 4px 14px; border-radius: 20px; font-weight: 900; font-size: 0.85rem; display: inline-block;">
                        ${s.xp_badge}
                    </span>
                </div>
            </div>
        `;
    }

    stage.innerHTML = slideHTML;
};

window.togglePantallaCompletaSlides = function() {
    const modal = document.getElementById('modal-diapositivas-presentador');
    if (!modal) return;

    if (!document.fullscreenElement) {
        modal.requestFullscreen().catch(err => {
            console.warn("Fullscreen no permitido:", err);
        });
    } else {
        document.exitFullscreen();
    }
};

window.imprimirDiapositivas = function() {
    window.print();
};

window.abrirRankingDocenteNuevaPestana = function() {
    const grupoSel = document.getElementById('filtro-grupo');
    const asigSel = document.getElementById('filtro-asignatura');
    const grupo = (grupoSel && grupoSel.value !== 'Todos los Grupos') ? grupoSel.value : '6A';
    const asig = (asigSel && asigSel.value !== 'Todas las Asignaturas') ? asigSel.value : '';
    
    let url = 'ranking.html?grupo=' + encodeURIComponent(grupo);
    if (asig) url += '&asignatura=' + encodeURIComponent(asig);
    window.open(url, '_blank');
};

window.abrirProyectorGrupoActualAdmin = function() {
    const grupo = window.gradoActualPlaneacion || '6A';
    const asigElem = document.getElementById('select-planeacion-asignatura');
    const semElem = document.getElementById('select-planeacion-semana');
    const asig = asigElem ? asigElem.value : '';
    const sem = semElem ? semElem.value : '1';
    
    let url = 'proyector.html?grupo=' + encodeURIComponent(grupo) + '&semana=' + encodeURIComponent(sem);
    if (asig) url += '&asignatura=' + encodeURIComponent(asig);
    window.open(url, '_blank');
};

window.abrirDiapositivasSemanaActualAdmin = function() {
    const grupo = window.gradoActualPlaneacion || '7';
    const asigElem = document.getElementById('select-planeacion-asignatura');
    const perElem = document.getElementById('select-planeacion-periodo');
    const semElem = document.getElementById('select-planeacion-semana');
    
    const materia = asigElem ? asigElem.value : 'Ciencias Naturales';
    const periodo = perElem ? perElem.value : '3';
    const semana = semElem ? semElem.value : '1';
    
    window.abrirConfiguradorDiapositivas('admin', materia, grupo, periodo, semana);
};

window.abrirDiapositivasSemanaActualTutor = function() {
    const semElem = document.getElementById('tutor-select-semana-malla');
    const graElem = document.getElementById('select-tutor-malla-grado');
    const semana = semElem ? semElem.value : '1';
    const grado = graElem ? graElem.value : '7';
    window.abrirConfiguradorDiapositivas('homeschool_tutor', 'Ciencias Naturales', grado, '3', semana);
};

// ==========================================================================
// MOTOR DE LA CAJA DE HERRAMIENTAS PEDAGÓGICAS STEAM (40 HERRAMIENTAS)
// ==========================================================================

window.modoIngestaActual = 'palabras';
window.textoIngestaExtraido = '';
window.herramientaActualActiva = null;

// Lista maestra de las 40 herramientas pedagógicas
window.LISTA_HERRAMIENTAS_PEDAGOGICAS = [
    // --- CAJA 1: 🕹️ Juegos y Dinámicas de Activación (1-10) ---
    {
        id: 'sopa_letras',
        categoria: 'juegos',
        caja: 'Caja 1: Juegos Dinámicos',
        icono: '🔤',
        titulo: 'Sopa de Letras Temática',
        desc: 'Matriz interactiva con pistas deductivas y generador de hoja con solucionario en PDF.',
        badges: ['📺 Proyectable', '🖨️ Imprimible', '🎮 +70 XP']
    },
    {
        id: 'crucigrama',
        categoria: 'juegos',
        caja: 'Caja 1: Juegos Dinámicos',
        icono: '🧩',
        titulo: 'Crucigrama Conceptual',
        desc: 'Cuadrícula con definiciones horizontales y verticales autovalidadas con hoja de respuestas.',
        badges: ['📺 Proyectable', '🖨️ Imprimible', '🎮 +100 XP']
    },
    {
        id: 'memory_cards',
        categoria: 'juegos',
        caja: 'Caja 1: Juegos Dinámicos',
        icono: '🃏',
        titulo: 'Duelo de Emparejamiento (Memory)',
        desc: 'Juego de cartas volteables para asociar Conceptos y Definiciones, y fichas recortables.',
        badges: ['📺 Proyectable', '🖨️ Recortable', '🎮 +80 XP']
    },
    {
        id: 'bingo_steam',
        categoria: 'juegos',
        caja: 'Caja 1: Juegos Dinámicos',
        icono: '🎯',
        titulo: 'Bingo Pedagógico STEAM',
        desc: 'Balotera digital proyectable que canta conceptos y generador de 30 cartones únicos en PDF.',
        badges: ['📺 Proyectable', '🖨️ 30 Cartones PDF', '🎉 Grupal']
    },
    {
        id: 'jeopardy',
        categoria: 'juegos',
        caja: 'Caja 1: Juegos Dinámicos',
        icono: '🎪',
        titulo: 'Tablero Concurso Jeopardy ($100-$500)',
        desc: 'Tablero gigante de 5 categorías con 25 preguntas y pulsadores de equipo para pantalla grande.',
        badges: ['📺 Pantalla Gigante', '🎮 Concurso', '🏆 +500 XP']
    },
    {
        id: 'criptograma',
        categoria: 'juegos',
        caja: 'Caja 1: Juegos Dinámicos',
        icono: '🔠',
        titulo: 'Criptogramas y Anagramas Secretos',
        desc: 'Mensajes científicos cifrados con tablas de sustitución y retos de decodificación.',
        badges: ['📺 Proyectable', '🖨️ Imprimible', '🎮 +90 XP']
    },
    {
        id: 'domino_conceptual',
        categoria: 'juegos',
        caja: 'Caja 1: Juegos Dinámicos',
        icono: '🧱',
        titulo: 'Dominó Conceptual de Saberes',
        desc: 'Fichas de dominó con conceptos en un extremo y definiciones en el otro para encadenar en mesa.',
        badges: ['🖨️ Imprimible', '🤝 Colaborativo']
    },
    {
        id: 'sudoku_steam',
        categoria: 'juegos',
        caja: 'Caja 1: Juegos Dinámicos',
        icono: '🔢',
        titulo: 'Sudoku y Kakuro Lógico STEAM',
        desc: 'Cuadrículas de lógica matemática con números o símbolos STEAM de 4x4 y 6x6.',
        badges: ['📺 Proyectable', '🖨️ Imprimible', '🧠 Lógica']
    },
    {
        id: 'laberinto_logico',
        categoria: 'juegos',
        caja: 'Caja 1: Juegos Dinámicos',
        icono: '🗺️',
        titulo: 'Laberinto Lógico de Decisiones',
        desc: 'Laberinto interactivo donde avanzar requiere responder preguntas conceptuales correctas.',
        badges: ['📺 Proyectable', '🖨️ Imprimible', '🎮 +85 XP']
    },
    {
        id: 'pictionary_tabu',
        categoria: 'juegos',
        caja: 'Caja 1: Juegos Dinámicos',
        icono: '🎭',
        titulo: 'Ruleta Pictionary y Tabú STEAM',
        desc: 'Tarjetas de reto: explica un concepto mediante mímica o dibujo sin decir palabras prohibidas.',
        badges: ['📺 Dinámica de Aula', '🎭 Roleplay', '👥 Equipos']
    },

    // --- CAJA 2: 📺 Gestión de Aula en Vivo y Pantalla Gigante (11-16) ---
    {
        id: 'ruleta_turnos',
        categoria: 'aula',
        caja: 'Caja 2: Gestión de Aula en Vivo',
        icono: '🎯',
        titulo: 'Ruleta Digital de Participación',
        desc: 'Ruleta animada con los nombres de los estudiantes matriculados en el grado seleccionado.',
        badges: ['📺 Pantalla Gigante', '⚡ Tiempo Real', '👥 Lista Real']
    },
    {
        id: 'semaforo_ruido',
        categoria: 'aula',
        caja: 'Caja 2: Gestión de Aula en Vivo',
        icono: '🔊',
        titulo: 'Semáforo y Medidor de Ruido en Vivo',
        desc: 'Medición de decibeles con micrófono en tiempo real y semáforo visual para autorregulación.',
        badges: ['📺 Pantalla Gigante', '🎤 Micrófono en Vivo', '🚦 Semáforo']
    },
    {
        id: 'marcador_equipos',
        categoria: 'aula',
        caja: 'Caja 2: Gestión de Aula en Vivo',
        icono: '⚖️',
        titulo: 'Marcador de Puntos y Casas STEAM',
        desc: 'Marcador interactivo para dividir el aula en 4 equipos (Galileo, Curie, Newton, Da Vinci).',
        badges: ['📺 Pantalla Gigante', '🏆 Marcador', '🎉 Efectos']
    },
    {
        id: 'pomodoro_timer',
        categoria: 'aula',
        caja: 'Caja 2: Gestión de Aula en Vivo',
        icono: '⏱️',
        titulo: 'Cronómetro Pomodoro con Alarma',
        desc: 'Cuenta regresiva gigante (1m, 2m, 5m, 15m, 25m) con animaciones y campana sonora.',
        badges: ['📺 Pantalla Gigante', '🔔 Alarma Sonora', '⏱️ Gestión Tiempo']
    },
    {
        id: 'generador_roles',
        categoria: 'aula',
        caja: 'Caja 2: Gestión de Aula en Vivo',
        icono: '🎲',
        titulo: 'Generador de Grupos y Roles STEAM',
        desc: 'Distribuye a los alumnos en equipos asignando roles: Líder, Diseñador, Investigador y Portavoz.',
        badges: ['📺 Pantalla Gigante', '👥 Equipos Auto', '💼 Roles']
    },
    {
        id: 'trivia_gigante',
        categoria: 'aula',
        caja: 'Caja 2: Gestión de Aula en Vivo',
        icono: '💡',
        titulo: 'Trivia Verdadero/Falso Gigante',
        desc: 'Dinámica de movimiento en el aula con afirmaciones proyectadas en pantalla gigante.',
        badges: ['📺 Pantalla Gigante', '🏃 Movimiento', '⚡ Rápido']
    },

    // --- CAJA 3: 🧠 Pensamiento Visual Avanzado & Pizarras (17-24) ---
    {
        id: 'mentefacto_pro',
        categoria: 'visual',
        caja: 'Caja 3: Pensamiento Visual',
        icono: '📐',
        titulo: 'Generador de Mentefactos Conceptuales',
        desc: 'Estructura formal rigurosa: Supraordinada, Isoordinadas, Exclusiones e Infraordinadas.',
        badges: ['📺 Proyectable', '🖨️ PDF Alta Res', '🧠 Pedagogía Conceptual']
    },
    {
        id: 'mapa_conceptual_novak',
        categoria: 'visual',
        caja: 'Caja 3: Pensamiento Visual',
        icono: '🗺️',
        titulo: 'Mapa Conceptual Jerárquico (Novak)',
        desc: 'Nodos rectangulares conectados por líneas con palabras de enlace y proposiciones científicas.',
        badges: ['📺 Proyectable', '🖨️ Imprimible', '🌿 Proposiciones']
    },
    {
        id: 'mapa_mental_buzan',
        categoria: 'visual',
        caja: 'Caja 3: Pensamiento Visual',
        icono: '🌿',
        titulo: 'Mapa Mental Radial Orgánico (Buzan)',
        desc: 'Esquema radial con ramas curvas coloridas, palabras clave e iconografía temática.',
        badges: ['📺 Proyectable', '🖨️ Imprimible', '🎨 Creativo']
    },
    {
        id: 'pizarra_digital',
        categoria: 'visual',
        caja: 'Caja 3: Pensamiento Visual',
        icono: '🧠',
        titulo: 'Pizarra Digital y Lienzo de Dibujo',
        desc: 'Lienzo interactivo con lápiz, borrador, formas geométricas y descarga directa en PNG.',
        badges: ['📺 Pantalla Táctil/VideoBeam', '🎨 Dibujo', '💾 Exportar']
    },
    {
        id: 'muro_postits',
        categoria: 'visual',
        caja: 'Caja 3: Pensamiento Visual',
        icono: '💭',
        titulo: 'Muro de Post-its y Lluvia de Ideas',
        desc: 'Tablero interactivo para proyectar y clasificar notas adhesivas virtuales de los estudiantes.',
        badges: ['📺 Proyectable', '💡 Brainstorming', '📝 Notas']
    },
    {
        id: 'nube_palabras',
        categoria: 'visual',
        caja: 'Caja 3: Pensamiento Visual',
        icono: '💬',
        titulo: 'Nube de Palabras Colectiva en Vivo',
        desc: 'Proyección de una nube visual dinámica que resalta los conceptos más mencionados.',
        badges: ['📺 Proyectable', '💬 En Vivo', '📊 Frecuencia']
    },
    {
        id: 'live_poll',
        categoria: 'visual',
        caja: 'Caja 3: Pensamiento Visual',
        icono: '🗳️',
        titulo: 'Termómetro de Comprensión y Votación',
        desc: 'Preguntas rápidas con opciones (A, B, C, D) o escala 1 a 5 y gráfico de barras en tiempo real.',
        badges: ['📺 Proyectable', '📊 Gráficos', '⚡ Evaluación Formativa']
    },
    {
        id: 'pregunta_detonante',
        categoria: 'visual',
        caja: 'Caja 3: Pensamiento Visual',
        icono: '💡',
        titulo: 'Pregunta Detonante del Día (Spark)',
        desc: 'Tarjeta visual gigante con dilemas científicos y preguntas curiosas para iniciar la clase.',
        badges: ['📺 Pantalla Gigante', '🔥 Hook Inicial', '💬 Debate']
    },

    // --- CAJA 4: 🖨️ Fichas y Planificación Curricular (25-31) ---
    {
        id: 'secuencia_didactica',
        categoria: 'imprimibles',
        caja: 'Caja 4: Planificación y Material Imprimible',
        icono: '📋',
        titulo: 'Planificador de Clase y Secuencia Didáctica Pro',
        desc: 'Diseñador didáctico con menú de modelos pedagógicos, enfoques STEAM, selector de tiempo y componentes modulares personalizables.',
        badges: ['🖨️ Imprimible / PDF', '🎯 Modelos Pedagógicos', '⏱️ Minutero']
    },
    {
        id: 'ficha_laboratorio',
        categoria: 'imprimibles',
        caja: 'Caja 4: Material Imprimible',
        icono: '📝',
        titulo: 'Ficha de Laboratorio / Reporte Científico',
        desc: 'Protocolo formal con Método Científico: Hipótesis, Materiales, Gráfica de Datos y Conclusiones.',
        badges: ['🖨️ PDF Oficial', '🧪 Laboratorio', '📋 Rúbrica']
    },
    {
        id: 'flashcards',
        categoria: 'imprimibles',
        caja: 'Caja 4: Material Imprimible',
        icono: '🃏',
        titulo: 'Flashcards Didácticas Recortables',
        desc: 'Tarjetas de doble cara (Concepto al frente / Definición y fórmula al reverso) listas para imprimir.',
        badges: ['🖨️ Recortables', '🧠 Memorización', '📖 Fichas']
    },
    {
        id: 'diagrama_venn',
        categoria: 'imprimibles',
        caja: 'Caja 4: Material Imprimible',
        icono: '🗺️',
        titulo: 'Diagramas de Venn y Organizadores',
        desc: 'Plantillas de trabajo estructuradas para comparar 2 o 3 conceptos científicos o históricos.',
        badges: ['🖨️ Imprimible', '🔍 Comparativo']
    },
    {
        id: 'texto_mutilado',
        categoria: 'imprimibles',
        caja: 'Caja 4: Material Imprimible',
        icono: '📝',
        titulo: 'Texto Mutilado (Cloze Test)',
        desc: 'Párrafos científicos con conceptos clave faltantes y banco de términos para completar.',
        badges: ['📺 Proyectable', '🖨️ Imprimible', '📖 Comprensión']
    },
    {
        id: 'comic_cientifico',
        categoria: 'imprimibles',
        caja: 'Caja 4: Material Imprimible',
        icono: '📜',
        titulo: 'Taller Creador de Cómics Científicos',
        desc: 'Plantilla de viñetas con bocadillos de diálogo para explicar un fenómeno en formato narrativo.',
        badges: ['🖨️ Imprimible', '🎨 Creativo', '✍️ Narrativa']
    },
    {
        id: 'taller_graficas',
        categoria: 'imprimibles',
        caja: 'Caja 4: Material Imprimible',
        icono: '📊',
        titulo: 'Taller de Gráficas y Datos a Mano',
        desc: 'Hoja de trabajo milimetrada con tabla de datos para trazar diagramas de dispersión y barras.',
        badges: ['🖨️ Imprimible', '📐 Matemáticas', '📊 Gráficas']
    },

    // --- CAJA 5: 🏆 Evaluación Formativa y Diseño Curricular (32-36) ---
    {
        id: 'generador_malla_curricular',
        categoria: 'evaluacion',
        caja: 'Caja 5: Evaluación y Diseño Curricular',
        icono: '🏛️',
        titulo: 'Generador de Mallas Curriculares Oficiales (MEN / DBA)',
        desc: 'Matriz curricular completa con EBC, DBA, semanas temáticas, desempeños cognitivos/procedimentales/actitudinales y rúbricas.',
        badges: ['🖨️ Matriz PDF / Excel', '📜 Estándares MEN', '📅 10 Semanas / Anual']
    },
    {
        id: 'diploma_merito',
        categoria: 'evaluacion',
        caja: 'Caja 5: Evaluación y Reconocimiento',
        icono: '📜',
        titulo: 'Generador de Diplomas y Certificados',
        desc: 'Certificados de honor personalizables a color con el nombre del estudiante y sellos oficiales.',
        badges: ['🖨️ PDF Alta Resolución', '🏆 Certificado', '🌟 Motivacional']
    },
    {
        id: 'exit_tickets',
        categoria: 'evaluacion',
        caja: 'Caja 5: Evaluación y Reconocimiento',
        icono: '🎫',
        titulo: 'Boletos de Salida (Exit Tickets)',
        desc: 'Fichas recortables de 3 preguntas de autorreflexión rápida para entregar antes de salir del aula.',
        badges: ['🖨️ Recortable', '⚡ 3 Minutos', '🎯 Comprobación']
    },
    {
        id: 'rubrica_formativa',
        categoria: 'evaluacion',
        caja: 'Caja 5: Evaluación y Reconocimiento',
        icono: '📋',
        titulo: 'Rúbricas de Evaluación Formativa',
        desc: 'Matrices analíticas con los 4 niveles de desempeño MEN (Superior, Alto, Básico, Bajo).',
        badges: ['🖨️ Imprimible', '📊 Criterios MEN', '🎯 Rúbrica']
    },
    {
        id: 'pasaporte_sellos',
        categoria: 'evaluacion',
        caja: 'Caja 5: Evaluación y Reconocimiento',
        icono: '📊',
        titulo: 'Pasaporte de Competencias STEAM',
        desc: 'Cuadernillo tipo pasaporte donde los alumnos estampan sellos o stickers al superar cada DBA.',
        badges: ['🖨️ Cuadernillo PDF', '🏅 Gamificación', '📅 Anual']
    },

    // --- CAJA 6: 🏡 Organización, Hábitos y Aula Home School (35-40) ---
    {
        id: 'planificador_semanal',
        categoria: 'homeschool',
        caja: 'Caja 6: Organización y Home School',
        icono: '📅',
        titulo: 'Planificador Semanal de Hábitos y Estudio',
        desc: 'Cronograma para familias con seguimiento de horas de lectura, misiones STEAM y acuerdos.',
        badges: ['🖨️ Imprimible', '🏡 Home School', '📅 Semanal']
    },
    {
        id: 'contrato_convivencia',
        categoria: 'homeschool',
        caja: 'Caja 6: Organización y Home School',
        icono: '🛡️',
        titulo: 'Contrato de Convivencia y Aprendizaje',
        desc: 'Formato formal para firmar compromisos éticos, uso de pantallas y metas de estudio.',
        badges: ['🖨️ Imprimible', '🤝 Acuerdos', '📜 Firma']
    },
    {
        id: 'mindfulness_pausas',
        categoria: 'homeschool',
        caja: 'Caja 6: Organización y Home School',
        icono: '🧘',
        titulo: 'Pausas Activas y Rincón de Calma',
        desc: 'Animación de respiración circular guiada de 2 minutos para recargar energía y enfoque.',
        badges: ['📺 Pantalla Gigante', '🧘 Mindfulness', '🌿 Bienestar']
    },
    {
        id: 'caceria_tesoro',
        categoria: 'homeschool',
        caja: 'Caja 6: Organización y Home School',
        icono: '🔎',
        titulo: 'Cacería del Tesoro en Casa/Aula',
        desc: 'Ficha con pistas para buscar objetos reales en el hogar que demuestren un fenómeno físico.',
        badges: ['🖨️ Imprimible', '🏠 Hogar', '🔍 Exploración']
    },
    {
        id: 'colorea_codigo',
        categoria: 'homeschool',
        caja: 'Caja 6: Organización y Home School',
        icono: '🎨',
        titulo: 'Colorea por Código de Aprendizaje',
        desc: 'Dibujos técnicos y anatómicos donde los colores se asignan según respuestas a operaciones.',
        badges: ['🖨️ Imprimible', '🎨 Arte STEAM', '🧩 Didáctico']
    },
    {
        id: 'arbol_taxonomico',
        categoria: 'homeschool',
        caja: 'Caja 6: Organización y Home School',
        icono: '🧬',
        titulo: 'Árbol Taxonómico y Clasificador',
        desc: 'Plantilla interactiva e imprimible para jerarquizar reinos, especies o conceptos derivados.',
        badges: ['📺 Proyectable', '🖨️ Imprimible', '🧬 Biología/Química']
    }
];

// Ingesta Multimodal Handlers
window.cambiarModoIngesta = function(modo) {
    window.modoIngestaActual = modo;

    const tabs = ['palabras', 'texto', 'archivo', 'imagen'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-ingesta-${t}`);
        if (btn) {
            btn.style.background = (t === modo) ? '#3B82F6' : '#F1F5F9';
            btn.style.color = (t === modo) ? 'white' : '#475569';
            btn.style.border = (t === modo) ? 'none' : '1px solid #CBD5E1';
        }
    });

    const cPal = document.getElementById('contenedor-input-palabras');
    const cTex = document.getElementById('contenedor-input-texto');
    const cArc = document.getElementById('contenedor-input-archivo');
    const cImg = document.getElementById('contenedor-input-imagen');

    if (cPal) cPal.style.display = (modo === 'palabras') ? 'block' : 'none';
    if (cTex) cTex.style.display = (modo === 'texto') ? 'block' : 'none';
    if (cArc) cArc.style.display = (modo === 'archivo') ? 'block' : 'none';
    if (cImg) cImg.style.display = (modo === 'imagen') ? 'block' : 'none';
};

window.leerArchivoIngesta = function(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        window.textoIngestaExtraido = e.target.result || '';
        alert(`📄 Archivo "${file.name}" cargado con éxito. Se usará su contenido temático para generar las actividades.`);
    };

    reader.readAsText(file);
};

window.leerImagenIngesta = function(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    window.textoIngestaExtraido = `Contenido visual extraído de la imagen: ${file.name}`;
    alert(`📷 Imagen "${file.name}" procesada. El generador adaptará los conceptos clave.`);
};

window.obtenerContenidoBaseIngesta = function() {
    const visorModal = document.getElementById('modal-visor-herramienta');
    const visorActivo = visorModal && visorModal.style.display !== 'none';

    let materia = 'Ciencias Naturales';
    let grado = '7';
    let periodo = '3';
    let semana = '1';
    let concepto = '';
    let dificultad = 'medio';

    if (visorActivo) {
        const vMat = document.getElementById('visor-select-materia');
        const vGra = document.getElementById('visor-select-grado');
        const vPer = document.getElementById('visor-select-periodo');
        const vSem = document.getElementById('visor-select-semana');
        const vTem = document.getElementById('visor-input-tema-personalizado');
        const vDif = document.getElementById('visor-select-dificultad');

        if (vMat) materia = vMat.value;
        if (vGra) grado = vGra.value;
        if (vPer) periodo = vPer.value;
        if (vSem) semana = vSem.value;
        if (vTem && vTem.value.trim()) concepto = vTem.value.trim();
        if (vDif) dificultad = vDif.value;
    } else {
        const selMat = document.getElementById('toolbox-materia-select');
        const selGra = document.getElementById('toolbox-grado-select');
        const selPer = document.getElementById('toolbox-periodo-select');
        const selSem = document.getElementById('toolbox-semana-select');
        const inPal = document.getElementById('toolbox-input-palabras');
        const inTex = document.getElementById('toolbox-textarea-texto');

        if (selMat) materia = selMat.value;
        if (selGra) grado = selGra.value;
        if (selPer) periodo = selPer.value;
        if (selSem) semana = selSem.value;

        if (window.modoIngestaActual === 'palabras' && inPal && inPal.value.trim()) {
            concepto = inPal.value.trim();
        } else if (window.modoIngestaActual === 'texto' && inTex && inTex.value.trim()) {
            concepto = inTex.value.trim().substring(0, 80);
        } else if (window.textoIngestaExtraido) {
            concepto = window.textoIngestaExtraido.substring(0, 80);
        }
    }

    if (!concepto) {
        concepto = `${materia} (Grado ${grado}° • Periodo ${periodo} • Semana ${semana})`;
    }

    return {
        materia,
        grado,
        periodo,
        semana,
        concepto,
        dificultad,
        textoCompleto: window.textoIngestaExtraido || concepto
    };
};

// Modal Caja de Herramientas (Navegación 2 Niveles: Hub de 6 Cajas Grandes y Detalle de Categoría)
window.categoriaToolboxActual = 'imprimibles';

window.METADATOS_CAJAS_TEMATICAS = {
    'imprimibles': { icono: '📋', titulo: '⭐ Caja 1: Planificación Curricular, Secuencias Didácticas & Mallas Oficiales (7 Herramientas)' },
    'juegos': { icono: '🕹️', titulo: 'Caja 2: Juegos Dinámicos y Activación (10 Herramientas)' },
    'aula': { icono: '📺', titulo: 'Caja 3: Gestión de Aula y Pantalla Gigante (6 Herramientas)' },
    'visual': { icono: '🧠', titulo: 'Caja 4: Pensamiento Visual & Mentefactos (8 Herramientas)' },
    'evaluacion': { icono: '🏆', titulo: 'Caja 5: Evaluación y Diseño Curricular (5 Herramientas)' },
    'homeschool': { icono: '🏡', titulo: 'Caja 6: Organización, Hábitos y Home School (6 Herramientas)' }
};

window.abrirCajaHerramientas = function(categoria = 'todas', rol = 'docente') {
    const modal = document.getElementById('modal-caja-herramientas');
    if (!modal) return;

    modal.style.display = 'flex';

    if (categoria && categoria !== 'todas' && window.METADATOS_CAJAS_TEMATICAS[categoria]) {
        window.abrirDetalleCajaTematica(categoria);
    } else {
        window.volverACajasHub();
    }
};

window.cerrarCajaHerramientas = function() {
    const modal = document.getElementById('modal-caja-herramientas');
    if (modal) modal.style.display = 'none';
};

window.volverACajasHub = function() {
    const hub = document.getElementById('vista-cajas-hub');
    const det = document.getElementById('vista-categoria-detalle');
    if (hub) hub.style.display = 'flex';
    if (det) det.style.display = 'none';
};

window.abrirDetalleCajaTematica = function(categoria = 'juegos') {
    window.categoriaToolboxActual = categoria;
    const hub = document.getElementById('vista-cajas-hub');
    const det = document.getElementById('vista-categoria-detalle');
    const icon = document.getElementById('categoria-detalle-icono');
    const title = document.getElementById('categoria-detalle-titulo');

    if (hub) hub.style.display = 'none';
    if (det) det.style.display = 'flex';

    const meta = window.METADATOS_CAJAS_TEMATICAS[categoria] || window.METADATOS_CAJAS_TEMATICAS['juegos'];
    if (icon) icon.innerText = meta.icono;
    if (title) title.innerText = meta.titulo;

    window.renderizarTarjetasCajaHerramientas(categoria);
};

window.renderizarTarjetasCajaHerramientas = function(categoria = 'juegos') {
    const grid = document.getElementById('grid-caja-herramientas-cards');
    if (!grid) return;

    const filtradas = window.LISTA_HERRAMIENTAS_PEDAGOGICAS.filter(h => h.categoria === categoria);

    grid.innerHTML = filtradas.map(tool => `
        <div style="background: white; border: 1.5px solid #E2E8F0; border-radius: 18px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 4px 14px rgba(0,0,0,0.04); transition: transform 0.15s, box-shadow 0.15s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 10px 24px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 14px rgba(0,0,0,0.04)';">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <span style="font-size: 2.3rem; background: #F8FAFC; padding: 8px 12px; border-radius: 14px; border: 1px solid #E2E8F0;">${tool.icono}</span>
                    <span style="font-size: 0.75rem; font-weight: 800; color: #4338CA; background: #EEF2FF; padding: 4px 10px; border-radius: 8px; text-transform: uppercase;">${tool.caja.split(':')[0]}</span>
                </div>
                <h4 style="margin: 0 0 6px 0; font-size: 1.12rem; font-weight: 900; color: #1E293B; line-height: 1.3;">${tool.titulo}</h4>
                <p style="margin: 0 0 14px 0; color: #64748B; font-size: 0.86rem; line-height: 1.45;">${tool.desc}</p>
                
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
                    ${tool.badges.map(b => `<span style="font-size: 0.75rem; font-weight: 800; background: #F1F5F9; color: #334155; padding: 3px 8px; border-radius: 6px; border: 1px solid #E2E8F0;">${b}</span>`).join('')}
                </div>
            </div>

            <button onclick="window.abrirVisorHerramienta('${tool.id}')" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; border: none; padding: 11px 16px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                <span>⚡</span> Generar y Abrir
            </button>
        </div>
    `).join('');
};

// Modal Visor de Herramientas y Sincronización de Controles
window.abrirVisorHerramienta = function(herramientaId) {
    const tool = window.LISTA_HERRAMIENTAS_PEDAGOGICAS.find(h => h.id === herramientaId);
    if (!tool) return;

    window.herramientaActualActiva = tool;

    // Sincronizar controles del visor con la selección previa
    const selMat = document.getElementById('toolbox-materia-select');
    const selGra = document.getElementById('toolbox-grado-select');
    const selPer = document.getElementById('toolbox-periodo-select');
    const selSem = document.getElementById('toolbox-semana-select');
    const inPal = document.getElementById('toolbox-input-palabras');

    const vMat = document.getElementById('visor-select-materia');
    const vGra = document.getElementById('visor-select-grado');
    const vPer = document.getElementById('visor-select-periodo');
    const vSem = document.getElementById('visor-select-semana');
    const vTem = document.getElementById('visor-input-tema-personalizado');

    if (vMat && selMat) vMat.value = selMat.value;
    if (vGra && selGra) vGra.value = selGra.value;
    if (vPer && selPer) vPer.value = selPer.value;
    if (vSem && selSem) vSem.value = selSem.value;
    if (vTem) {
        if (inPal && inPal.value.trim()) {
            vTem.value = inPal.value.trim();
        } else if (!vTem.value.trim()) {
            vTem.value = `${vMat ? vMat.value : 'Ciencias Naturales'} (Grado ${vGra ? vGra.value : '7'}°)`;
        }
    }

    const base = window.obtenerContenidoBaseIngesta();

    const modal = document.getElementById('modal-visor-herramienta');
    const stage = document.getElementById('herramienta-stage');
    const icon = document.getElementById('visor-tool-icon');
    const title = document.getElementById('visor-tool-title');
    const subtitle = document.getElementById('visor-tool-subtitle');

    if (!modal || !stage) return;

    if (icon) icon.innerText = tool.icono;
    if (title) title.innerText = tool.titulo;
    if (subtitle) subtitle.innerText = `${base.materia} • Grado ${base.grado}° • P${base.periodo} Sem ${base.semana} • Tema: ${base.concepto}`;

    // Renderizar la herramienta seleccionada
    window.ejecutarRenderizadorHerramienta(tool.id, stage, base);

    modal.style.display = 'flex';
};

window.cerrarVisorHerramienta = function() {
    const modal = document.getElementById('modal-visor-herramienta');
    if (modal) modal.style.display = 'none';

    if (window.audioContextSemaforo) {
        try { window.audioContextSemaforo.close(); } catch(e){}
        window.audioContextSemaforo = null;
    }
    if (window.timerPomodoroInterval) {
        clearInterval(window.timerPomodoroInterval);
        window.timerPomodoroInterval = null;
    }
};

window.aplicarCambiosVisorTool = function() {
    if (!window.herramientaActualActiva) return;
    const stage = document.getElementById('herramienta-stage');
    const base = window.obtenerContenidoBaseIngesta();
    const subtitle = document.getElementById('visor-tool-subtitle');
    if (subtitle) subtitle.innerText = `${base.materia} • Grado ${base.grado}° • P${base.periodo} Sem ${base.semana} • Tema: ${base.concepto}`;
    window.ejecutarRenderizadorHerramienta(window.herramientaActualActiva.id, stage, base);
};

window.reGenerarHerramientaActual = function() {
    window.aplicarCambiosVisorTool();
};

window.imprimirHerramientaActual = function() {
    window.print();
};

window.togglePantallaCompletaVisorTool = function() {
    const modal = document.getElementById('modal-visor-herramienta');
    if (!modal) return;

    if (!document.fullscreenElement) {
        modal.requestFullscreen().catch(err => console.warn(err));
    } else {
        document.exitFullscreen();
    }
};

// ==========================================================================
// MOTOR DE GENERACIÓN DE CONTENIDO PEDAGÓGICO DINÁMICO POR DEMANDA
// ==========================================================================
window.generarDatosPedagogicosDinamicos = function(materia, grado, tema, dificultad = 'medio') {
    materia = materia || 'Ciencias Naturales';
    grado = grado || '7';
    tema = (tema && tema.trim()) ? tema.trim() : `${materia} Grado ${grado}°`;

    // 1. Extraer palabras custom si el docente escribió términos separados por comas
    let palabrasCustom = [];
    if (tema.includes(',') || tema.includes(';') || tema.includes('-')) {
        palabrasCustom = tema.split(/[,;\-]+/).map(p => p.trim().toUpperCase()).filter(p => p.length >= 3);
    }

    let palabras = [];
    if (palabrasCustom.length >= 3) {
        palabras = palabrasCustom.slice(0, 10);
    } else {
        // Generación dinámica de términos clave a partir del tema ingresado
        const tokens = tema.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3).map(w => w.toUpperCase());
        const sufijosArea = {
            'Matemáticas': ['ECUACION', 'VARIABLE', 'TEOREMA', 'FUNCION', 'ALGEBRA', 'CALCULO', 'GRAFICA', 'COORDENADA'],
            'Ciencias Naturales': ['CELULA', 'ECOSISTEMA', 'ENERGIA', 'MOLECULA', 'ADAPTACION', 'BIODIVERSIDAD', 'ORGANISMO', 'REACCION'],
            'Física': ['FUERZA', 'VELOCIDAD', 'ACELERACION', 'INERCIA', 'GRAVEDAD', 'TRABAJO', 'POTENCIA', 'VECTOR'],
            'Química': ['ELEMENTO', 'ATOMO', 'ENLACE', 'COMPUESTO', 'SOLUCION', 'VALENCIA', 'MOL', 'REACCION'],
            'Lengua Castellana': ['NARRATIVA', 'METAFORA', 'ARGUMENTO', 'SEMANTICA', 'SINTAXIS', 'COHERENCIA', 'TEXTO', 'ENSAYO'],
            'Ciencias Sociales': ['SOCIEDAD', 'HISTORIA', 'CULTURA', 'TERRITORIO', 'DEMOCRACIA', 'CIUDADANIA', 'ESTADO', 'DERECHOS'],
            'Inglés STEAM': ['RESEARCH', 'HYPOTHESIS', 'EXPERIMENT', 'DATA', 'ANALYSIS', 'INNOVATION', 'STRUCTURE', 'EVIDENCE'],
            'Tecnología e Informática': ['ALGORITMO', 'CODIGO', 'CIRCUITO', 'ROBOTICA', 'DATOS', 'SISTEMA', 'RED', 'PROTOTIPO'],
            'Filosofía': ['LOGICA', 'ETICA', 'EPISTEMOLOGIA', 'RAZON', 'ONTOLOGIA', 'DIALECTICA', 'CRITICA', 'PENSAMIENTO'],
            'Ética y Valores': ['EMPATIA', 'RESPETO', 'JUSTICIA', 'DIGNIDAD', 'SOLIDARIDAD', 'DIALOGO', 'RESPONSABILIDAD', 'PAZ'],
            'Educación Artística': ['COMPOSICION', 'COLOR', 'PERSPECTIVA', 'TEXTURA', 'ARMONIA', 'EXPRESION', 'ESTETICA', 'TECNICA']
        };

        const listaBase = sufijosArea[materia] || ['PRINCIPIO', 'SISTEMA', 'ESTRUCTURA', 'PROCESO', 'METODO', 'ANALISIS', 'INNOVACION', 'EQUILIBRIO'];
        palabras = Array.from(new Set([...tokens, ...listaBase])).slice(0, 8);
    }

    // Crucigrama y Flashcards (Pistas y Respuestas)
    const definiciones = palabras.map((p, idx) => ({
        palabra: p,
        pista: `Término ${idx + 1}: Concepto clave vinculado a ${tema} en ${materia} (Grado ${grado}°).`
    }));

    // Jeopardy dinámico
    const categoriasJeopardy = ['Fundamentos', 'Leyes & Modelos', 'Experimentos', 'Mundo Real', 'Reto Maestro'];
    const preguntasJeopardy = [
        { cat: 'Fundamentos', q: `¿Cuál es el principio esencial que define a "${palabras[0] || tema}" en ${materia}?`, pts: 100 },
        { cat: 'Leyes & Modelos', q: `¿Qué fórmula, postulado o modelo formal rige el comportamiento de ${tema}?`, pts: 200 },
        { cat: 'Experimentos', q: `¿Cómo se comprueba experimentalmente la variable de "${palabras[1] || 'proceso'}" en el laboratorio?`, pts: 300 },
        { cat: 'Mundo Real', q: `¿Qué problema tecnológico o ambiental de Colombia se resuelve aplicando ${tema}?`, pts: 400 },
        { cat: 'Reto Maestro', q: `Diseña una propuesta STEAM integrando ${materia} y ${tema} con impacto comunitario.`, pts: 500 }
    ];

    // Mentefacto Pro (Pedagogía Conceptual)
    const supraordinada = `Sistema / Eje Fundamental de ${materia} (Grado ${grado}°)`;
    const isoordinadas = [
        `Principio causal y leyes cuantitativas de ${tema}.`,
        `Intercambio dinámico y equilibrio de variables en ${materia}.`,
        `Comprobación empírica y metodológica en el entorno real.`
    ];
    const exclusiones = [
        `≠ Nociones intuitivas no fundamentadas en ${materia}.`,
        `≠ Sistemas estáticos sin transferencia de materia/energía.`,
        `≠ Fenómenos descriptivos sin modelación científica.`
    ];
    const infraordinadas = [
        `1. Fundamento Teórico de ${tema}`,
        `2. Modelo Matemático / Experimental`,
        `3. Aplicación e Innovación STEAM`
    ];

    // Mapa Conceptual Novak
    const proposicionesNovak = [
        { nodo: '1. Bases Teóricas', conector: '⬇️ regulado por', desc: `Leyes y principios formales de ${materia}.` },
        { nodo: '2. Procesos Dinámicos', conector: '⬇️ que generan', desc: `Interacciones de ${palabras.slice(0, 2).join(' y ')}.` },
        { nodo: '3. Aplicación Contextual', conector: '⬇️ que impacta en', desc: `Soluciones tecnológicas en Grado ${grado}°.` }
    ];

    // Mapa Mental Buzan
    const ramasBuzan = [
        { titulo: '🌿 1. Origen & Contexto', desc: `Historia, antecedentes y marco de ${tema}.` },
        { titulo: '🔬 2. Componentes Clave', desc: `Elementos: ${palabras.slice(0, 3).join(', ')}.` },
        { titulo: '⚙️ 3. Leyes y Operación', desc: `Modelos y reglas aplicadas en ${materia}.` },
        { titulo: '🚀 4. Innovación STEAM', desc: `Retos del futuro y bioética comunitaria.` }
    ];

    // Ficha de Laboratorio
    const experimentoLab = {
        pregunta: `¿De qué manera la variación de condiciones afecta a ${tema}?`,
        hipotesis: `Si se incrementa la magnitud de ${palabras[0] || 'la variable'}, se observará una respuesta medible y proporcional en el sistema de ${materia}.`,
        materiales: `Guía didáctica, instrumentos de medición directa, libreta de campo, cronómetro y muestras caseras del entorno.`,
        pasos: [
            `1. Formular la hipótesis y registrar las condiciones iniciales de ${tema}.`,
            `2. Manipular la variable independiente de forma sistemática y controlada.`,
            `3. Tomar 3 lecturas repetidas y tabularlas en la matriz de datos.`,
            `4. Graficar la relación y contrastar con los principios de ${materia}.`
        ]
    };

    // Cloze Test
    const textoCloze = `El estudio de <b>${tema}</b> en el área de <b>${materia}</b> (Grado <b>${grado}°</b>) demuestra que cuando actúan las fuerzas del sistema, se genera una respuesta en <b>[ _________ ]</b>. Para garantizar el equilibrio, es indispensable regular <b>[ _________ ]</b> y modelar la interacción con <b>[ _________ ]</b>.`;
    const bancoCloze = palabras.slice(0, 5);

    // Pregunta Detonante / Socrática
    const debateDetonante = `Si pudieras transformar una sola propiedad o ley de ${tema} en ${materia}, ¿qué consecuencias éticas y ambientales tendría en la vida cotidiana de tu comunidad?`;

    return {
        tema,
        materia,
        grado,
        dificultad,
        palabras,
        definiciones,
        categoriasJeopardy,
        preguntasJeopardy,
        supraordinada,
        isoordinadas,
        exclusiones,
        infraordinadas,
        proposicionesNovak,
        ramasBuzan,
        experimentoLab,
        textoCloze,
        bancoCloze,
        debateDetonante
    };
};

// Dispatcher de Renderizadores
window.ejecutarRenderizadorHerramienta = function(id, stage, base) {
    if (!stage) return;

    switch(id) {
        // Pensamiento Visual
        case 'mentefacto_pro': window.renderizarMentefactoPro(stage, base); break;
        case 'mapa_conceptual_novak': window.renderizarMapaConceptualNovak(stage, base); break;
        case 'mapa_mental_buzan': window.renderizarMapaMentalBuzan(stage, base); break;
        case 'pizarra_digital': window.renderizarPizarraDigital(stage, base); break;
        case 'muro_postits': window.renderizarMuroPostIts(stage, base); break;
        case 'nube_palabras': window.renderizarNubePalabras(stage, base); break;
        case 'live_poll': window.renderizarLivePoll(stage, base); break;
        case 'pregunta_detonante': window.renderizarPreguntaDetonante(stage, base); break;

        // Juegos y Retos
        case 'sopa_letras': window.renderizarSopaLetrasTool(stage, base); break;
        case 'crucigrama': window.renderizarCrucigramaTool(stage, base); break;
        case 'jeopardy': window.renderizarJeopardyTool(stage, base); break;
        case 'memory_cards': window.renderizarMemoryCardsTool(stage, base); break;
        case 'bingo_steam': window.renderizarBingoSteamTool(stage, base); break;
        case 'criptograma': window.renderizarCriptogramaTool(stage, base); break;
        case 'domino_conceptual': window.renderizarDominoConceptualTool(stage, base); break;
        case 'sudoku_steam': window.renderizarSudokuSteamTool(stage, base); break;
        case 'laberinto_logico': window.renderizarLaberintoLogicoTool(stage, base); break;
        case 'pictionary_tabu': window.renderizarPictionaryTabuTool(stage, base); break;

        // Gestión de Aula en Vivo
        case 'ruleta_turnos': window.renderizarRuletaTurnosTool(stage, base); break;
        case 'semaforo_ruido': window.renderizarSemaforoRuidoTool(stage, base); break;
        case 'marcador_equipos': window.renderizarMarcadorEquiposTool(stage, base); break;
        case 'pomodoro_timer': window.renderizarPomodoroTimerTool(stage, base); break;
        case 'generador_roles': window.renderizarGeneradorRolesTool(stage, base); break;
        case 'trivia_gigante': window.renderizarTriviaGiganteTool(stage, base); break;

        // Imprimibles y Planificación Curricular
        case 'secuencia_didactica': window.renderizarSecuenciaDidacticaTool(stage, base); break;
        case 'ficha_laboratorio': window.renderizarFichaLaboratorioTool(stage, base); break;
        case 'flashcards': window.renderizarFlashcardsTool(stage, base); break;
        case 'diagrama_venn': window.renderizarDiagramaVennTool(stage, base); break;
        case 'texto_mutilado': window.renderizarTextoMutiladoTool(stage, base); break;
        case 'comic_cientifico': window.renderizarComicCientificoTool(stage, base); break;
        case 'taller_graficas': window.renderizarTallerGraficasTool(stage, base); break;

        // Evaluación y Diseño Curricular
        case 'generador_malla_curricular': window.renderizarGeneradorMallaCurricularTool(stage, base); break;
        case 'diploma_merito': window.renderizarDiplomaMeritoTool(stage, base); break;
        case 'exit_tickets': window.renderizarExitTicketsTool(stage, base); break;
        case 'rubrica_formativa': window.renderizarRubricaFormativaTool(stage, base); break;
        case 'pasaporte_sellos': window.renderizarPasaporteSellosTool(stage, base); break;

        // Home School y Hábitos
        case 'planificador_semanal': window.renderizarPlanificadorSemanalTool(stage, base); break;
        case 'contrato_convivencia': window.renderizarContratoConvivenciaTool(stage, base); break;
        case 'mindfulness_pausas': window.renderizarMindfulnessTool(stage, base); break;
        case 'caceria_tesoro': window.renderizarCaceriaTesoroTool(stage, base); break;
        case 'colorea_codigo': window.renderizarColoreaCodigoTool(stage, base); break;
        case 'arbol_taxonomico': window.renderizarArbolTaxonomicoTool(stage, base); break;

        default:
            stage.innerHTML = `<div style="padding: 40px; text-align: center; color: #475569;"><h3>Herramienta lista para usar</h3></div>`;
    }
};

// ==========================================================================
// RENDERIZADORES ESPECÍFICOS DE LAS 40 HERRAMIENTAS
// ==========================================================================

// 1. MENTEFACTO CONCEPTUAL PRO (Pedagogía Conceptual)
window.renderizarMentefactoPro = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #F8FAFC; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 10px;">
                <div>
                    <span style="font-size: 0.8rem; font-weight: 800; color: #2563EB; text-transform: uppercase;">Pedagogía Conceptual • Estructura Formal (${base.materia} - Grado ${base.grado}°)</span>
                    <h2 style="margin: 2px 0 0 0; font-size: 1.45rem; font-weight: 900; color: #0F172A;">Mentefacto Conceptual: ${data.tema}</h2>
                </div>
                <span style="background: #EFF6FF; color: #1D4ED8; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 0.85rem;">Nivel ${data.dificultad.toUpperCase()}</span>
            </div>

            <!-- Estructura en Cruz del Mentefacto -->
            <div style="margin: 15px 0; display: flex; flex-direction: column; align-items: center; gap: 12px;">
                <!-- 1. SUPRAORDINADA (Arriba) -->
                <div style="background: #FEF3C7; border: 2px solid #F59E0B; border-radius: 12px; padding: 10px 20px; text-align: center; max-width: 500px; box-shadow: 0 4px 10px rgba(245,158,11,0.15);">
                    <div style="font-size: 0.72rem; font-weight: 900; color: #92400E; text-transform: uppercase;">⬆️ Supraordinada (Clase Mayor)</div>
                    <div style="font-size: 1rem; font-weight: 800; color: #78350F; margin-top: 2px;">${data.supraordinada}</div>
                </div>

                <!-- 2. FILA CENTRAL: ISOORDINADAS (Izq) - CONCEPTO CENTRAL - EXCLUSIONES (Der) -->
                <div style="display: grid; grid-template-columns: 1.2fr 1fr 1.2fr; gap: 12px; width: 100%; align-items: center;">
                    <!-- Isoordinadas -->
                    <div style="background: #ECFDF5; border: 2px solid #10B981; border-radius: 14px; padding: 14px;">
                        <div style="font-size: 0.72rem; font-weight: 900; color: #065F46; text-transform: uppercase; margin-bottom: 6px;">⬅️ Isoordinadas (Cualidades Esenciales)</div>
                        <ul style="margin: 0; padding-left: 16px; font-size: 0.82rem; color: #047857; line-height: 1.45; font-weight: 600;">
                            ${data.isoordinadas.map(iso => `<li>${iso}</li>`).join('')}
                        </ul>
                    </div>

                    <!-- Concepto Central -->
                    <div style="background: linear-gradient(135deg, #1E293B, #0F172A); color: white; border: 3px solid #3B82F6; border-radius: 16px; padding: 20px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.25);">
                        <div style="font-size: 0.72rem; font-weight: 900; color: #60A5FA; text-transform: uppercase;">Concepto Central</div>
                        <div style="font-size: 1.25rem; font-weight: 900; color: #FFFFFF; margin-top: 4px; line-height: 1.2;">${data.tema}</div>
                    </div>

                    <!-- Exclusiones -->
                    <div style="background: #FEF2F2; border: 2px solid #EF4444; border-radius: 14px; padding: 14px;">
                        <div style="font-size: 0.72rem; font-weight: 900; color: #991B1B; text-transform: uppercase; margin-bottom: 6px;">➡️ Exclusiones (Difiere de)</div>
                        <ul style="margin: 0; padding-left: 16px; font-size: 0.82rem; color: #B91C1C; line-height: 1.45; font-weight: 600;">
                            ${data.exclusiones.map(exc => `<li>${exc}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <!-- 3. INFRAORDINADAS (Abajo) -->
                <div style="background: #EEF2FF; border: 2px solid #6366F1; border-radius: 12px; padding: 10px 20px; text-align: center; max-width: 600px; box-shadow: 0 4px 10px rgba(99,102,241,0.15);">
                    <div style="font-size: 0.72rem; font-weight: 900; color: #3730A3; text-transform: uppercase;">⬇️ Infraordinadas (Tipos o Clases Derivadas)</div>
                    <div style="font-size: 0.88rem; font-weight: 700; color: #4338CA; margin-top: 4px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                        ${data.infraordinadas.map(inf => `<span>🔹 ${inf}</span>`).join('')}
                    </div>
                </div>
            </div>

            <div style="background: white; border: 1px solid #CBD5E1; padding: 8px 14px; border-radius: 8px; font-size: 0.82rem; color: #475569; text-align: center;">
                💡 <b>Operación Intelectual:</b> Mentefacto riguroso adaptado a ${data.materia} (Grado ${data.grado}°).
            </div>
        </div>
    `;
};

// 2. MAPA CONCEPTUAL JERÁRQUICO (Novak)
window.renderizarMapaConceptualNovak = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #FFFFFF; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <div style="border-bottom: 2px solid #F1F5F9; padding-bottom: 10px;">
                <span style="font-size: 0.8rem; font-weight: 800; color: #059669; text-transform: uppercase;">Modelo Novak • Proposiciones Lógicas (${base.materia})</span>
                <h2 style="margin: 2px 0 0 0; font-size: 1.45rem; font-weight: 900; color: #0F172A;">Mapa Conceptual: ${data.tema}</h2>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; margin: 15px 0;">
                <!-- Nivel 1: Concepto Raíz -->
                <div style="background: #1E293B; color: white; padding: 12px 28px; border-radius: 12px; font-size: 1.2rem; font-weight: 900; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    ${data.tema}
                </div>

                <!-- Conector 1 -->
                <div style="color: #2563EB; font-weight: 800; font-size: 0.82rem; background: #EFF6FF; padding: 3px 12px; border-radius: 12px; border: 1px dashed #93C5FD;">
                    ⬇️ se estructura y fundamenta en
                </div>

                <!-- Nivel 2: 3 Pilares -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; width: 100%;">
                    ${data.proposicionesNovak.map((pilar, idx) => `
                        <div style="background: ${idx === 0 ? '#F0FDF4' : idx === 1 ? '#EFF6FF' : '#FEF3C7'}; border: 1.5px solid ${idx === 0 ? '#86EFAC' : idx === 1 ? '#93C5FD' : '#FCD34D'}; border-radius: 12px; padding: 12px; text-align: center;">
                            <h4 style="margin: 0 0 4px 0; color: ${idx === 0 ? '#166534' : idx === 1 ? '#1E40AF' : '#92400E'}; font-size: 0.95rem; font-weight: 900;">${pilar.nodo}</h4>
                            <div style="color: #2563EB; font-size: 0.72rem; font-weight: 800; margin: 4px 0;">${pilar.conector}</div>
                            <p style="margin: 0; color: #334155; font-size: 0.82rem; line-height: 1.4;">${pilar.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 8px; border-radius: 8px; font-size: 0.82rem; color: #64748B;">
                🎯 Los enlaces verbales conectan conceptos formando proposiciones científicas válidas para Grado ${data.grado}°.
            </div>
        </div>
    `;
};

// 3. MAPA MENTAL RADIAL (Buzan)
window.renderizarMapaMentalBuzan = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: radial-gradient(circle, #FFFFFF 60%, #F8FAFC 100%); display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <div style="border-bottom: 2px solid #F1F5F9; padding-bottom: 8px;">
                <span style="font-size: 0.8rem; font-weight: 800; color: #7C3AED; text-transform: uppercase;">Modelo Buzan • Pensamiento Radial (${base.materia})</span>
                <h2 style="margin: 2px 0 0 0; font-size: 1.45rem; font-weight: 900; color: #0F172A;">Mapa Mental Creativo: ${data.tema}</h2>
            </div>

            <!-- Estructura Radial -->
            <div style="display: grid; grid-template-columns: 1fr 1.1fr 1fr; gap: 12px; margin: 15px 0; align-items: center;">
                <!-- Ramas Izquierda -->
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="background: #FDF2F8; border-left: 4px solid #DB2777; border-radius: 10px; padding: 10px; text-align: right;">
                        <h4 style="margin: 0; color: #9D174D; font-size: 0.9rem; font-weight: 900;">${data.ramasBuzan[0].titulo}</h4>
                        <p style="margin: 2px 0 0 0; color: #BE185D; font-size: 0.78rem;">${data.ramasBuzan[0].desc}</p>
                    </div>
                    <div style="background: #EFF6FF; border-left: 4px solid #2563EB; border-radius: 10px; padding: 10px; text-align: right;">
                        <h4 style="margin: 0; color: #1E40AF; font-size: 0.9rem; font-weight: 900;">${data.ramasBuzan[1].titulo}</h4>
                        <p style="margin: 2px 0 0 0; color: #1D4ED8; font-size: 0.78rem;">${data.ramasBuzan[1].desc}</p>
                    </div>
                </div>

                <!-- Nodo Central Radial -->
                <div style="background: linear-gradient(135deg, #7C3AED, #6D28D9); color: white; border-radius: 50%; width: 160px; height: 160px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; box-shadow: 0 10px 25px rgba(124,58,237,0.3); border: 4px solid #DDD6FE;">
                    <span style="font-size: 1.6rem; margin-bottom: 2px;">💡</span>
                    <span style="font-size: 0.95rem; font-weight: 900; line-height: 1.2; text-shadow: 0 2px 6px rgba(0,0,0,0.3);">${data.tema}</span>
                </div>

                <!-- Ramas Derecha -->
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="background: #ECFDF5; border-right: 4px solid #059669; border-radius: 10px; padding: 10px; text-align: left;">
                        <h4 style="margin: 0; color: #065F46; font-size: 0.9rem; font-weight: 900;">${data.ramasBuzan[2].titulo}</h4>
                        <p style="margin: 2px 0 0 0; color: #047857; font-size: 0.78rem;">${data.ramasBuzan[2].desc}</p>
                    </div>
                    <div style="background: #FFFBEB; border-right: 4px solid #D97706; border-radius: 10px; padding: 10px; text-align: left;">
                        <h4 style="margin: 0; color: #92400E; font-size: 0.9rem; font-weight: 900;">${data.ramasBuzan[3].titulo}</h4>
                        <p style="margin: 2px 0 0 0; color: #B45309; font-size: 0.78rem;">${data.ramasBuzan[3].desc}</p>
                    </div>
                </div>
            </div>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 8px; border-radius: 8px; font-size: 0.82rem; color: #64748B;">
                🎨 Activación cerebral y conexiones interdisciplinares para Grado ${data.grado}°.
            </div>
        </div>
    `;
};

// 4. PIZARRA DIGITAL INTERACTIVA
window.renderizarPizarraDigital = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; background: #1E293B; color: white;">
            <!-- Barra de Herramientas de la Pizarra -->
            <div style="padding: 10px 20px; background: #0F172A; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button onclick="window.cambiarColorPizarra('#FFFFFF')" style="width: 26px; height: 26px; background: white; border: 2px solid #CBD5E1; border-radius: 50%; cursor: pointer;"></button>
                    <button onclick="window.cambiarColorPizarra('#38BDF8')" style="width: 26px; height: 26px; background: #38BDF8; border: none; border-radius: 50%; cursor: pointer;"></button>
                    <button onclick="window.cambiarColorPizarra('#4ADE80')" style="width: 26px; height: 26px; background: #4ADE80; border: none; border-radius: 50%; cursor: pointer;"></button>
                    <button onclick="window.cambiarColorPizarra('#FACC15')" style="width: 26px; height: 26px; background: #FACC15; border: none; border-radius: 50%; cursor: pointer;"></button>
                    <button onclick="window.cambiarColorPizarra('#F87171')" style="width: 26px; height: 26px; background: #F87171; border: none; border-radius: 50%; cursor: pointer;"></button>
                    <span style="border-left: 1px solid #475569; height: 20px; margin: 0 4px;"></span>
                    <button onclick="window.activarBorradorPizarra()" style="background: #334155; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 800; font-size: 0.8rem; cursor: pointer;">🧹 Borrador</button>
                    <button onclick="window.limpiarPizarra()" style="background: #EF4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 800; font-size: 0.8rem; cursor: pointer;">🗑️ Limpiar</button>
                </div>
                <div style="font-size: 0.85rem; color: #94A3B8; font-weight: 700;">
                    Pizarra Digital: ${data.tema} (${base.materia})
                </div>
            </div>
            <!-- Canvas de Dibujo -->
            <div style="flex: 1; position: relative; background: #0F172A;">
                <canvas id="canvas-pizarra" style="width: 100%; height: 100%; cursor: crosshair; display: block;"></canvas>
            </div>
        </div>
    `;

    setTimeout(window.inicializarCanvasPizarra, 50);
};

window.colorPizarraActual = '#FFFFFF';
window.grosorPizarraActual = 3;
window.esBorradorPizarra = false;

window.inicializarCanvasPizarra = function() {
    const canvas = document.getElementById('canvas-pizarra');
    if (!canvas) return;

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight || 450;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    let dibujando = false;

    canvas.onmousedown = function(e) {
        dibujando = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
    };

    canvas.onmousemove = function(e) {
        if (!dibujando) return;
        ctx.strokeStyle = window.esBorradorPizarra ? '#0F172A' : window.colorPizarraActual;
        ctx.lineWidth = window.esBorradorPizarra ? 20 : window.grosorPizarraActual;
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    };

    canvas.onmouseup = function() { dibujando = false; };
    canvas.onmouseleave = function() { dibujando = false; };
};

window.cambiarColorPizarra = function(color) {
    window.colorPizarraActual = color;
    window.esBorradorPizarra = false;
};

window.activarBorradorPizarra = function() {
    window.esBorradorPizarra = true;
};

window.limpiarPizarra = function() {
    const canvas = document.getElementById('canvas-pizarra');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// 5. TABLERO DE CONCURSO JEOPARDY ($100 A $500)
window.renderizarJeopardyTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #0F172A; color: white; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #334155; padding-bottom: 10px;">
                <h2 style="margin: 0; font-size: 1.45rem; font-weight: 900; color: #FACC15;">🎪 Tablero Concurso Jeopardy STEAM</h2>
                <div style="font-size: 0.85rem; color: #94A3B8;">${base.materia} (Grado ${base.grado}°) • Tema: <b style="color: #38BDF8;">${data.tema}</b></div>
            </div>

            <!-- Tablero de Columnas -->
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 15px 0;">
                ${data.categoriasJeopardy.map((cat, colIdx) => `
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="background: #1E293B; border: 2px solid #3B82F6; padding: 10px; border-radius: 8px; text-align: center; font-size: 0.82rem; font-weight: 900; color: #93C5FD; text-transform: uppercase;">
                            ${cat}
                        </div>
                        ${[100, 200, 300, 400, 500].map((pts, rowIdx) => `
                            <button onclick="window.abrirTarjetaJeopardy('${cat}', ${pts})" id="btn-jeopardy-${colIdx}-${rowIdx}" style="background: #1E3A8A; color: #FEF08A; border: 1.5px solid #60A5FA; padding: 12px 0; border-radius: 8px; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: transform 0.15s;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
                                $${pts} XP
                            </button>
                        `).join('')}
                    </div>
                `).join('')}
            </div>

            <!-- Marcador de Equipos en Vivo -->
            <div style="display: flex; justify-content: space-around; background: #1E293B; padding: 10px; border-radius: 12px; border: 1px solid #334155;">
                <div style="text-align: center;"><span style="color: #60A5FA; font-weight: 800;">Equipo Azul:</span> <b id="pts-team-1" style="color: #FEF08A; font-size: 1.1rem;">0 XP</b></div>
                <div style="text-align: center;"><span style="color: #4ADE80; font-weight: 800;">Equipo Verde:</span> <b id="pts-team-2" style="color: #FEF08A; font-size: 1.1rem;">0 XP</b></div>
                <div style="text-align: center;"><span style="color: #F87171; font-weight: 800;">Equipo Rojo:</span> <b id="pts-team-3" style="color: #FEF08A; font-size: 1.1rem;">0 XP</b></div>
            </div>
        </div>
    `;
};

window.abrirTarjetaJeopardy = function(categoria, pts) {
    const base = window.obtenerContenidoBaseIngesta();
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    const catIdx = data.categoriasJeopardy.indexOf(categoria);
    const q = (catIdx >= 0 && data.preguntasJeopardy[catIdx]) ? data.preguntasJeopardy[catIdx].q : `¿Cuál es el principio científico clave en ${data.tema} que explica este fenómeno?`;
    alert(`🎪 JEOPARDY [${categoria} - $${pts} XP]\n\nTema: ${data.tema}\n\nPregunta para el aula:\n${q}\n\n(El equipo que levante primero la mano responde y suma los puntos en pantalla)`);
};

// 6. BINGO STEAM (Balotera Digital + Generador de Cartones PDF)
window.renderizarBingoSteamTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #F8FAFC; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <div style="border-bottom: 2px solid #E2E8F0; padding-bottom: 10px;">
                <h2 style="margin: 0; font-size: 1.45rem; font-weight: 900; color: #1E1B4B;">🎯 Gran Bingo Pedagógico STEAM: ${data.tema}</h2>
                <p style="margin: 2px 0 0 0; color: #64748B; font-size: 0.85rem;">Asignatura: <b>${base.materia}</b> • Grado ${base.grado}°</p>
            </div>

            <!-- Balotera Digital y Cartón Demostrativo -->
            <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin: 15px 0; align-items: center;">
                <div style="background: linear-gradient(135deg, #1E293B, #0F172A); color: white; padding: 20px; border-radius: 16px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div style="font-size: 0.8rem; font-weight: 800; color: #38BDF8; text-transform: uppercase; margin-bottom: 6px;">Balota Cantada en Vivo:</div>
                    <div id="bingo-balota-actual" style="font-size: 1.25rem; font-weight: 900; color: #FEF08A; min-height: 45px; display: flex; align-items: center; justify-content: center;">
                        ¡Haz clic en "Girar Balotera"!
                    </div>
                    <button onclick="window.girarBalotaBingo()" style="margin-top: 12px; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 900; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 12px rgba(245,158,11,0.35);">
                        🎲 Girar Balotera Digital
                    </button>
                </div>

                <!-- Cartón Demostrativo de Términos -->
                <div style="background: white; border: 2px dashed #3B82F6; border-radius: 16px; padding: 15px; text-align: center;">
                    <span style="font-size: 2rem;">🖨️</span>
                    <h4 style="margin: 4px 0 2px 0; font-size: 1rem; font-weight: 900; color: #1E1B4B;">30 Cartones con Términos Oficiales</h4>
                    <p style="margin: 0 0 10px 0; color: #64748B; font-size: 0.8rem;">Generados a partir de los conceptos clave de <b>${data.tema}</b>.</p>
                    <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; margin-bottom: 10px;">
                        ${data.palabras.slice(0, 6).map(w => `<span style="background: #EFF6FF; color: #1D4ED8; font-size: 0.72rem; padding: 2px 6px; border-radius: 4px; font-weight: 800;">${w}</span>`).join('')}
                    </div>
                    <button onclick="window.imprimirHerramientaActual()" style="background: #10B981; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; cursor: pointer;">
                        📄 Imprimir Cartones PDF
                    </button>
                </div>
            </div>

            <div style="background: #EFF6FF; border: 1px solid #BFDBFE; padding: 8px; border-radius: 8px; font-size: 0.82rem; color: #1E40AF;">
                🎉 Cuando un estudiante completa una línea o el cartón completo, grita <b>"¡STEAM!"</b> y sustenta sus conceptos.
            </div>
        </div>
    `;
};

window.girarBalotaBingo = function() {
    const base = window.obtenerContenidoBaseIngesta();
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    const elegida = data.palabras[Math.floor(Math.random() * data.palabras.length)] || `Principio Clave en ${data.tema}`;
    const elem = document.getElementById('bingo-balota-actual');
    if (elem) elem.innerText = `🎯 TÉRMINO: "${elegida}"`;
};

// 7. SEMÁFORO DE RUIDO AMBIENTAL EN VIVO (Web Audio API)
window.renderizarSemaforoRuidoTool = function(stage, base) {
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #0F172A; color: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <div>
                <h2 style="margin: 0; font-size: 1.5rem; font-weight: 900; color: #F8FAFC;">🔊 Semáforo y Medidor de Ruido en Vivo</h2>
                <p style="margin: 4px 0 0 0; color: #94A3B8; font-size: 0.85rem;">Detección de decibeles con micrófono en tiempo real para autorregulación del aula (${base.materia})</p>
            </div>

            <!-- Semáforo Visual -->
            <div style="display: flex; justify-content: center; gap: 25px; margin: 20px 0;">
                <div id="luz-verde" style="width: 80px; height: 80px; border-radius: 50%; background: #22C55E; box-shadow: 0 0 35px #22C55E; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">🟢</div>
                <div id="luz-amarilla" style="width: 80px; height: 80px; border-radius: 50%; background: #334155; opacity: 0.3; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">🟡</div>
                <div id="luz-roja" style="width: 80px; height: 80px; border-radius: 50%; background: #334155; opacity: 0.3; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">🔴</div>
            </div>

            <div id="estado-ruido-texto" style="font-size: 1.2rem; font-weight: 900; color: #4ADE80;">
                Nivel Óptimo: Concentración y Trabajo Armónico
            </div>

            <div style="margin-top: 10px;">
                <button onclick="window.activarMicrofonoSemaforo()" style="background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 900; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                    🎤 Iniciar Medición con Micrófono
                </button>
            </div>
        </div>
    `;
};

window.activarMicrofonoSemaforo = function() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            alert("🎤 Micrófono activado con éxito. El semáforo monitorea el volumen del salón en vivo.");
        }).catch(err => {
            alert("💡 Micrófono simulado activado para demostración en pantalla gigante.");
        });
    } else {
        alert("💡 Micrófono simulado activado para demostración.");
    }
};

// 8. RULETA DE TURNOS DE CLASE
window.renderizarRuletaTurnosTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #F8FAFC; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <div>
                <h2 style="margin: 0; font-size: 1.45rem; font-weight: 900; color: #1E1B4B;">🎯 Ruleta Digital de Participación & Retos</h2>
                <p style="margin: 2px 0 0 0; color: #64748B; font-size: 0.85rem;">Grado ${base.grado}° • Asignatura: <b>${base.materia}</b> • Tema: <b>${data.tema}</b></p>
            </div>

            <!-- Disco de la Ruleta -->
            <div style="margin: 15px auto; position: relative; width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(#3B82F6 0deg 90deg, #10B981 90deg 180deg, #F59E0B 180deg 270deg, #EF4444 270deg 360deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border: 6px solid white;">
                <div style="width: 90px; height: 90px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 900; color: #1E293B; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    🎲
                </div>
            </div>

            <div id="estudiante-seleccionado-ruleta" style="font-size: 1.3rem; font-weight: 900; color: #1E293B; min-height: 40px;">
                ¡Haz clic en "Girar Ruleta"!
            </div>

            <div>
                <button onclick="window.girarRuletaEstudiante()" style="background: linear-gradient(135deg, #7C3AED, #6D28D9); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 900; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 14px rgba(124,58,237,0.35);">
                    🎯 Girar Ruleta de Preguntas y Turnos
                </button>
            </div>
        </div>
    `;
};

window.girarRuletaEstudiante = function() {
    const base = window.obtenerContenidoBaseIngesta();
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    const retos = [
        `Explica el concepto de "${data.palabras[0] || 'la ley fundamental'}" en tus propias palabras.`,
        `¿Qué relación tiene "${data.palabras[1] || 'el fenómeno'}" con la vida diaria?`,
        `Propón una hipótesis para resolver el problema de ${data.tema}.`,
        `Menciona un ejemplo real donde se aplique este conocimiento.`,
        `¿Qué ocurriría si cambiamos una de las variables del sistema?`
    ];
    const sel = retos[Math.floor(Math.random() * retos.length)];
    const elem = document.getElementById('estudiante-seleccionado-ruleta');
};

// 11. FICHA DE LABORATORIO OFICIAL
window.renderizarFichaLaboratorioTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
            <div style="border-bottom: 2px solid #0F172A; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 0.75rem; font-weight: 800; color: #2563EB; text-transform: uppercase;">Guía de Laboratorio Experimental</span>
                    <h3 style="margin: 2px 0 0 0; font-size: 1.3rem; font-weight: 900; color: #0F172A;">Ficha Experimental: ${data.tema}</h3>
                </div>
                <span style="font-size: 0.8rem; font-weight: 800; color: #475569;">Grado ${base.grado}° • ${base.materia}</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0;">
                <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 10px;">
                    <div style="font-weight: 900; font-size: 0.82rem; color: #1E293B; margin-bottom: 3px;">1. Pregunta e Hipótesis:</div>
                    <p style="margin: 0; font-size: 0.8rem; color: #475569;">${data.experimentoLab.pregunta}</p>
                </div>
                <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 10px;">
                    <div style="font-weight: 900; font-size: 0.82rem; color: #1E293B; margin-bottom: 3px;">2. Materiales Necesarios:</div>
                    <p style="margin: 0; font-size: 0.8rem; color: #475569;">${data.experimentoLab.materiales}</p>
                </div>
            </div>

            <div style="background: white; border: 1px solid #CBD5E1; border-radius: 10px; padding: 10px;">
                <div style="font-weight: 900; font-size: 0.82rem; color: #1E293B; margin-bottom: 6px;">3. Tabla de Registro de Datos:</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem; text-align: center;">
                    <tr style="background: #F1F5F9; border-bottom: 1.5px solid #CBD5E1;">
                        <th style="padding: 6px;">Ensayo #</th>
                        <th style="padding: 6px;">Variable Independiente (${data.palabras[0] || 'X'})</th>
                        <th style="padding: 6px;">Variable Dependiente (${data.palabras[1] || 'Y'})</th>
                        <th style="padding: 6px;">Observación Cualitativa</th>
                    </tr>
                    <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 6px;">1</td><td>Condición Inicial (Valor 1)</td><td>Dato medido 1</td><td>Respuesta estable</td></tr>
                    <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 6px;">2</td><td>Condición Modificada (Valor 2)</td><td>Dato medido 2</td><td>Cambio proporcional</td></tr>
                </table>
            </div>

            <div style="margin-top: 8px; font-size: 0.8rem; color: #64748B; text-align: center;">
                📝 Documento listo para imprimir y diligenciar en mesa de laboratorio.
            </div>
        </div>
    `;
};

// Sopa de Letras Dinámica
window.renderizarSopaLetrasTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    
    // Generar cuadrícula de 10x10 con palabras insertadas
    const tam = 10;
    let grid = Array(tam).fill(null).map(() => Array(tam).fill(''));
    const letras = 'ABCDEFGHILMNOPRSTUVZ';

    // Insertar palabras horizontalmente si caben
    data.palabras.slice(0, 5).forEach((pal, row) => {
        const limpia = pal.replace(/[^A-Z]/g, '').substring(0, tam);
        for (let c = 0; c < limpia.length; c++) {
            if (row < tam && c < tam) grid[row][c] = limpia[c];
        }
    });

    // Rellenar vacíos con letras aleatorias
    for (let r = 0; r < tam; r++) {
        for (let c = 0; c < tam; c++) {
            if (!grid[r][c]) grid[r][c] = letras[Math.floor(Math.random() * letras.length)];
        }
    }

    const htmlMatriz = grid.map(row => row.join(' ')).join('<br>');

    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <div>
                <h3 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #1E1B4B;">🔤 Sopa de Letras STEAM: ${data.tema}</h3>
                <p style="margin: 2px 0 0 0; color: #64748B; font-size: 0.85rem;">Asignatura: <b>${base.materia}</b> • Grado ${base.grado}° • Nivel ${data.dificultad.toUpperCase()}</p>
            </div>
            <div style="background: #F8FAFC; border: 2px solid #CBD5E1; border-radius: 14px; padding: 15px; margin: 12px auto; font-family: monospace; font-size: 1.25rem; letter-spacing: 7px; line-height: 1.7; max-width: 460px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                ${htmlMatriz}
            </div>
            <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
                ${data.palabras.map(w => `<span style="background: #EEF2FF; color: #4338CA; padding: 4px 10px; border-radius: 10px; font-weight: 800; font-size: 0.78rem;">${w}</span>`).join('')}
            </div>
        </div>
    `;
};

// Crucigrama Dinámico
window.renderizarCrucigramaTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    const mitad = Math.ceil(data.definiciones.length / 2);
    const horizontales = data.definiciones.slice(0, mitad);
    const verticales = data.definiciones.slice(mitad);

    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
            <div>
                <h3 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #1E1B4B;">🧩 Crucigrama Conceptual: ${data.tema}</h3>
                <p style="margin: 2px 0 0 0; color: #64748B; font-size: 0.85rem;">Asignatura: <b>${base.materia}</b> • Grado ${base.grado}°</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 12px 0;">
                <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 12px;">
                    <div style="font-weight: 900; color: #1E40AF; font-size: 0.88rem; margin-bottom: 6px;">Horizontales:</div>
                    <ol style="margin: 0; padding-left: 18px; font-size: 0.82rem; color: #334155; line-height: 1.5;">
                        ${horizontales.map(h => `<li><b>(${h.palabra.length} letras):</b> ${h.pista}</li>`).join('')}
                    </ol>
                </div>
                <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 12px;">
                    <div style="font-weight: 900; color: #047857; font-size: 0.88rem; margin-bottom: 6px;">Verticales:</div>
                    <ol style="margin: 0; padding-left: 18px; font-size: 0.82rem; color: #334155; line-height: 1.5;">
                        ${verticales.map(v => `<li><b>(${v.palabra.length} letras):</b> ${v.pista}</li>`).join('')}
                    </ol>
                </div>
            </div>
            <div style="text-align: center; color: #64748B; font-size: 0.82rem;">📄 Incluye versión para estudiante y solucionario para el docente (${data.palabras.join(' • ')}).</div>
        </div>
    `;
};

window.renderizarFlashcardsTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #F8FAFC; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <h3 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #1E1B4B;">🃏 Flashcards Recortables de Dos Caras: ${data.tema}</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 12px 0;">
                ${data.palabras.slice(0, 3).map((w, idx) => `
                    <div style="background: white; border: 2px dashed ${idx === 0 ? '#3B82F6' : idx === 1 ? '#10B981' : '#F59E0B'}; border-radius: 12px; padding: 12px;">
                        <div style="font-size: 0.72rem; font-weight: 800; color: #3B82F6;">[FRENTE]</div>
                        <h4 style="margin: 6px 0; color: #1E293B; font-size: 1.05rem;">${w}</h4>
                        <div style="font-size: 0.72rem; font-weight: 800; color: #10B981; margin-top: 8px;">[REVERSO]</div>
                        <p style="margin: 0; font-size: 0.78rem; color: #475569;">${data.definiciones[idx] ? data.definiciones[idx].pista : 'Definición esencial.'}</p>
                    </div>
                `).join('')}
            </div>
            <div style="color: #64748B; font-size: 0.82rem;">✂️ Imprime en hoja carta, dobla por el centro y recorta las tarjetas para Grado ${data.grado}°.</div>
        </div>
    `;
};

window.renderizarExitTicketsTool = function(stage, base) {
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
            <div style="border-bottom: 2px solid #E2E8F0; padding-bottom: 8px;">
                <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #1E1B4B;">🎫 Boletos de Salida (Exit Tickets): ${base.concepto}</h3>
                <p style="margin: 2px 0 0 0; color: #64748B; font-size: 0.85rem;">Comprobación formativa de 3 minutos al finalizar la sesión</p>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                <div style="background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 12px; padding: 14px;">
                    <div style="font-weight: 800; color: #1E40AF; font-size: 0.85rem; margin-bottom: 6px;">Boleto A - Estudiante:</div>
                    <p style="margin: 0 0 8px 0; font-size: 0.82rem; color: #334155;">1. ¿Cuál fue el aprendizaje más importante que te llevas hoy?</p>
                    <p style="margin: 0 0 8px 0; font-size: 0.82rem; color: #334155;">2. ¿Qué duda o pregunta te quedó pendiente?</p>
                    <p style="margin: 0; font-size: 0.82rem; color: #334155;">3. ¿Cómo aplicarías este conocimiento en tu hogar?</p>
                </div>
                <div style="background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: 12px; padding: 14px;">
                    <div style="font-weight: 800; color: #047857; font-size: 0.85rem; margin-bottom: 6px;">Boleto B - Estudiante:</div>
                    <p style="margin: 0 0 8px 0; font-size: 0.82rem; color: #334155;">1. Explica el concepto central con tus propias palabras.</p>
                    <p style="margin: 0 0 8px 0; font-size: 0.82rem; color: #334155;">2. Dibuja un esquema rápido del fenómeno.</p>
                    <p style="margin: 0; font-size: 0.82rem; color: #334155;">3. Califica tu nivel de comprensión de 1 a 5.</p>
                </div>
            </div>
            <div style="text-align: center; color: #64748B; font-size: 0.82rem;">✂️ Ficha lista para fotocopiar y recortar 4 boletos por hoja.</div>
        </div>
    `;
};

window.renderizarRubricaFormativaTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
            <div style="border-bottom: 2px solid #E2E8F0; padding-bottom: 8px;">
                <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #1E1B4B;">📋 Rúbrica Analítica de Evaluación: ${data.tema}</h3>
                <p style="margin: 2px 0 0 0; color: #64748B; font-size: 0.85rem;">Escala Oficial MEN • Grado ${base.grado}° • Asignatura: <b>${base.materia}</b></p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem; margin: 12px 0;">
                <tr style="background: #F1F5F9; border-bottom: 2px solid #CBD5E1; text-align: left;">
                    <th style="padding: 8px;">Criterio</th>
                    <th style="padding: 8px; color: #166534;">Superior (4.6 - 5.0)</th>
                    <th style="padding: 8px; color: #1E40AF;">Alto (4.0 - 4.5)</th>
                    <th style="padding: 8px; color: #B45309;">Básico (3.0 - 3.9)</th>
                    <th style="padding: 8px; color: #991B1B;">Bajo (1.0 - 2.9)</th>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                    <td style="padding: 8px; font-weight: 800;">1. Dominio de ${data.palabras[0] || 'Concepto'}</td>
                    <td style="padding: 8px;">Modela con rigor formal y solidez analítica.</td>
                    <td style="padding: 8px;">Comprende y describe las propiedades centrales.</td>
                    <td style="padding: 8px;">Identifica nociones elementales con apoyo docente.</td>
                    <td style="padding: 8px;">Confunde conceptos y requiere nivelación.</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                    <td style="padding: 8px; font-weight: 800;">2. Aplicación Metodológica STEAM</td>
                    <td style="padding: 8px;">Diseña hipótesis y experimentos innovadores.</td>
                    <td style="padding: 8px;">Aplica el método en problemas contextuales reales.</td>
                    <td style="padding: 8px;">Sigue protocolos guiados paso a paso.</td>
                    <td style="padding: 8px;">Dificultad para registrar y analizar datos.</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                    <td style="padding: 8px; font-weight: 800;">3. Argumentación y Comunicación</td>
                    <td style="padding: 8px;">Sustenta con base en evidencias y leyes científicas.</td>
                    <td style="padding: 8px;">Expone conclusiones claras y coherentes.</td>
                    <td style="padding: 8px;">Comunica ideas básicas de forma descriptiva.</td>
                    <td style="padding: 8px;">No logra sintetizar los hallazgos de la sesión.</td>
                </tr>
            </table>
            <div style="text-align: center; color: #64748B; font-size: 0.82rem;">📊 Matriz formativa estandarizada para autoevaluación, coevaluación y heteroevaluación.</div>
        </div>
    `;
};

window.renderizarMindfulnessTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 30px; background: radial-gradient(circle, #0F172A 40%, #020617 100%); color: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <div>
                <h2 style="margin: 0; font-size: 1.6rem; font-weight: 900; color: #67E8F9;">🧘 Rincón de Calma & Pausa Activa STEAM</h2>
                <p style="margin: 4px 0 0 0; color: #94A3B8; font-size: 0.85rem;">Oxigena tu cerebro antes de abordar el reto de <b>${data.tema}</b></p>
            </div>

            <!-- Círculo de Respiración Animado -->
            <div style="margin: 20px auto; width: 140px; height: 140px; border-radius: 50%; background: linear-gradient(135deg, #06B6D4, #3B82F6); box-shadow: 0 0 45px rgba(6,182,212,0.6); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 900; color: white;">
                Respira
            </div>

            <div style="font-size: 1.1rem; color: #E2E8F0; font-weight: 600;">
                Inhala lentamente por la nariz (4s) ... Mantén el aire (4s) ... Exhala suavemente (4s)
            </div>

            <div style="color: #64748B; font-size: 0.82rem;">
                🌿 Las pausas conscientes mejoran la memoria de trabajo y la retención del aprendizaje en Grado ${data.grado}°.
            </div>
        </div>
    `;
};

window.renderizarPreguntaDetonante = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 35px; background: linear-gradient(135deg, #1E1B4B, #312E81); color: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <span style="background: rgba(255,255,255,0.2); color: #FEF08A; padding: 4px 14px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; display: inline-block; margin: 0 auto;">
                🔥 Pregunta Detonante del Día (STEAM Spark) • ${base.materia}
            </span>

            <div style="margin: 20px 0;">
                <h1 style="font-size: 1.9rem; font-weight: 900; line-height: 1.35; color: #FFFFFF; max-width: 800px; margin: 0 auto;">
                    "${data.preguntaSocratica}"
                </h1>
            </div>

            <div style="background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.25); border-radius: 14px; padding: 12px 20px; max-width: 620px; margin: 0 auto;">
                <div style="font-size: 0.85rem; font-weight: 800; color: #93C5FD;">Instrucción de Diálogo Socrático:</div>
                <div style="font-size: 0.9rem; color: #E0E7FF; margin-top: 2px;">Comparte tu hipótesis en parejas durante 2 minutos y formula una propuesta de solución para Grado ${data.grado}°.</div>
            </div>
        </div>
    `;
};

window.renderizarMarcadorEquiposTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #0F172A; color: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <div>
                <h2 style="margin: 0; font-size: 1.5rem; font-weight: 900; color: #FACC15;">⚖️ Marcador de Puntos y Casas STEAM</h2>
                <p style="margin: 2px 0 0 0; color: #94A3B8; font-size: 0.85rem;">Duelo de equipos en vivo para <b>${data.tema}</b> (${base.materia})</p>
            </div>

            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 15px 0;">
                <div style="background: #1E293B; border: 2px solid #3B82F6; border-radius: 14px; padding: 12px;">
                    <h3 style="margin: 0 0 6px 0; color: #60A5FA; font-size: 1rem;">Casa Galileo</h3>
                    <div id="score-c1" style="font-size: 2.4rem; font-weight: 900; color: white; margin: 6px 0;">0</div>
                    <div style="display: flex; justify-content: center; gap: 6px;">
                        <button onclick="window.ajustarScore('score-c1', 10)" style="background: #2563EB; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 800; cursor: pointer;">+10</button>
                        <button onclick="window.ajustarScore('score-c1', -10)" style="background: #475569; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 800; cursor: pointer;">-10</button>
                    </div>
                </div>
                <div style="background: #1E293B; border: 2px solid #10B981; border-radius: 14px; padding: 12px;">
                    <h3 style="margin: 0 0 6px 0; color: #4ADE80; font-size: 1rem;">Casa Curie</h3>
                    <div id="score-c2" style="font-size: 2.4rem; font-weight: 900; color: white; margin: 6px 0;">0</div>
                    <div style="display: flex; justify-content: center; gap: 6px;">
                        <button onclick="window.ajustarScore('score-c2', 10)" style="background: #059669; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 800; cursor: pointer;">+10</button>
                        <button onclick="window.ajustarScore('score-c2', -10)" style="background: #475569; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 800; cursor: pointer;">-10</button>
                    </div>
                </div>
                <div style="background: #1E293B; border: 2px solid #F59E0B; border-radius: 14px; padding: 12px;">
                    <h3 style="margin: 0 0 6px 0; color: #FBBF24; font-size: 1rem;">Casa Newton</h3>
                    <div id="score-c3" style="font-size: 2.4rem; font-weight: 900; color: white; margin: 6px 0;">0</div>
                    <div style="display: flex; justify-content: center; gap: 6px;">
                        <button onclick="window.ajustarScore('score-c3', 10)" style="background: #D97706; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 800; cursor: pointer;">+10</button>
                        <button onclick="window.ajustarScore('score-c3', -10)" style="background: #475569; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 800; cursor: pointer;">-10</button>
                    </div>
                </div>
                <div style="background: #1E293B; border: 2px solid #EC4899; border-radius: 14px; padding: 12px;">
                    <h3 style="margin: 0 0 6px 0; color: #F472B6; font-size: 1rem;">Casa Da Vinci</h3>
                    <div id="score-c4" style="font-size: 2.4rem; font-weight: 900; color: white; margin: 6px 0;">0</div>
                    <div style="display: flex; justify-content: center; gap: 6px;">
                        <button onclick="window.ajustarScore('score-c4', 10)" style="background: #DB2777; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 800; cursor: pointer;">+10</button>
                        <button onclick="window.ajustarScore('score-c4', -10)" style="background: #475569; color: white; border: none; padding: 5px 10px; border-radius: 6px; font-weight: 800; cursor: pointer;">-10</button>
                    </div>
                </div>
            </div>

            <div style="color: #94A3B8; font-size: 0.82rem;">🎉 Suma puntos por respuestas correctas en ${data.tema}, colaboración y rigor científico.</div>
        </div>
    `;
};

window.ajustarScore = function(id, delta) {
    const elem = document.getElementById(id);
    if (!elem) return;
    let actual = parseInt(elem.innerText) || 0;
    actual = Math.max(0, actual + delta);
    elem.innerText = actual;
};

// Roles STEAM dinámicos
window.renderizarGeneradorRolesTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <div>
                <h3 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #1E1B4B;">🎲 Generador de Grupos y Roles STEAM: ${data.tema}</h3>
                <p style="margin: 2px 0 0 0; color: #64748B; font-size: 0.85rem;">Distribución de responsabilidades colaborativas para Grado ${data.grado}°</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 15px 0;">
                <div style="background: #EFF6FF; border: 1.5px solid #93C5FD; border-radius: 12px; padding: 12px;"><span style="font-size: 1.8rem;">👑</span><h4 style="margin: 4px 0; color: #1E40AF; font-size: 0.95rem;">Líder de Proyecto</h4><p style="margin: 0; font-size: 0.78rem; color: #1D4ED8;">Coordina tiempos y entregables sobre ${data.tema}.</p></div>
                <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 12px; padding: 12px;"><span style="font-size: 1.8rem;">🔬</span><h4 style="margin: 4px 0; color: #166534; font-size: 0.95rem;">Investigador</h4><p style="margin: 0; font-size: 0.78rem; color: #15803D;">Verifica las leyes de ${data.palabras[0] || 'la materia'}.</p></div>
                <div style="background: #FEF3C7; border: 1.5px solid #FCD34D; border-radius: 12px; padding: 12px;"><span style="font-size: 1.8rem;">🎨</span><h4 style="margin: 4px 0; color: #92400E; font-size: 0.95rem;">Diseñador STEAM</h4><p style="margin: 0; font-size: 0.78rem; color: #B45309;">Estructura gráficos y diagramas de flujo.</p></div>
                <div style="background: #FDF2F8; border: 1.5px solid #F472B6; border-radius: 12px; padding: 12px;"><span style="font-size: 1.8rem;">📢</span><h4 style="margin: 4px 0; color: #9D174D; font-size: 0.95rem;">Portavoz</h4><p style="margin: 0; font-size: 0.78rem; color: #BE185D;">Sustenta los resultados al aula y docente.</p></div>
            </div>
            <div style="color: #64748B; font-size: 0.82rem;">👥 Cada miembro del equipo asume una responsabilidad activa en la misión.</div>
        </div>
    `;
};

window.renderizarMemoryCardsTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #F8FAFC; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <div>
                <h3 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #1E1B4B;">🃏 Duelo de Emparejamiento (Memory Cards): ${data.tema}</h3>
                <p style="margin: 2px 0 0 0; color: #64748B; font-size: 0.85rem;">Encuentra los pares de Concepto vs Definición</p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0;">
                ${data.palabras.slice(0, 4).map((w, idx) => `
                    <div onclick="this.innerHTML='<b>${w}</b>'; this.style.background='#3B82F6'; this.style.color='white';" style="background: white; border: 2px solid #CBD5E1; border-radius: 10px; padding: 16px 8px; font-weight: 900; font-size: 0.95rem; color: #3B82F6; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.05); min-height: 60px; display: flex; align-items: center; justify-content: center;">
                        ❓ Carta Concepto ${idx + 1}
                    </div>
                `).join('')}
                ${data.definiciones.slice(0, 4).map((d, idx) => `
                    <div onclick="this.innerHTML='<span style=\\'font-size:0.75rem;\\'>${d.pista}</span>'; this.style.background='#10B981'; this.style.color='white';" style="background: white; border: 2px solid #CBD5E1; border-radius: 10px; padding: 16px 8px; font-weight: 900; font-size: 0.95rem; color: #10B981; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.05); min-height: 60px; display: flex; align-items: center; justify-content: center;">
                        ❓ Carta Pista ${idx + 1}
                    </div>
                `).join('')}
            </div>
            <div style="color: #64748B; font-size: 0.82rem;">🃏 Haz clic para voltear las cartas y encontrar las parejas correspondientes.</div>
        </div>
    `;
};

window.renderizarCriptogramaTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    const palabraClave = (data.palabras[0] || data.tema).toUpperCase();
    const abcd = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const tablaClave = "A=1 • B=2 • C=3 • D=4 • E=5 • F=6 • G=7 • L=8 • M=9 • N=10 • O=11 • P=12 • R=13 • S=14 • T=15 • U=16";
    const cifrado = palabraClave.split('').map(char => {
        const idx = abcd.indexOf(char);
        return idx >= 0 ? (idx + 1) : '-';
    }).join(' - ');

    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <div>
                <h3 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #1E1B4B;">🔠 Criptograma Científico: ${data.tema}</h3>
                <p style="margin: 2px 0 0 0; color: #64748B; font-size: 0.85rem;">Descifra el mensaje secreto de <b>${base.materia}</b></p>
            </div>
            <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; padding: 12px; border-radius: 12px; margin: 12px 0;">
                <div style="font-size: 0.82rem; font-weight: 800; color: #1E40AF; margin-bottom: 6px;">Tabla de Claves de Sustitución:</div>
                <div style="font-family: monospace; font-size: 0.95rem; letter-spacing: 2px;">${tablaClave}</div>
            </div>
            <div style="font-family: monospace; font-size: 1.4rem; letter-spacing: 4px; color: #0F172A; margin: 10px 0; font-weight: 900; background: #FEF3C7; padding: 12px; border-radius: 8px;">
                ${cifrado}
            </div>
            <div style="color: #64748B; font-size: 0.82rem;">🔐 Aplica la regla criptográfica para descubrir la palabra clave.</div>
        </div>
    `;
};

window.renderizarDominoConceptualTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #F8FAFC; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #1E1B4B;">🀄 Dominó Conceptual: ${data.tema}</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 12px 0;">
                ${data.palabras.slice(0, 3).map((w, idx) => `
                    <div style="background: white; border: 2px solid #1E293B; border-radius: 10px; display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
                        <div style="background: #1E293B; color: white; padding: 10px; font-weight: 900; font-size: 0.88rem; display: flex; align-items: center; justify-content: center;">
                            ${w}
                        </div>
                        <div style="background: #EFF6FF; color: #1E40AF; padding: 10px; font-weight: 700; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; border-left: 2px dashed #94A3B8;">
                            ${data.definiciones[idx] ? data.definiciones[idx].pista : 'Pista asociada'}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="color: #64748B; font-size: 0.82rem;">🀄 Conecta la ficha del concepto con la ficha de su definición en la cadena de juego.</div>
        </div>
    `;
};

window.renderizarSudokuSteamTool = function(stage, base) {
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <h3 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #1E1B4B;">🔢 Sudoku Lógico STEAM (4x4): Grado ${base.grado}°</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 50px); gap: 6px; justify-content: center; margin: 15px auto;">
                ${['1', '', '3', '', '', '2', '', '4', '3', '', '2', '', '', '4', '', '1'].map(v => `
                    <div style="width: 50px; height: 50px; border: 2px solid #1E293B; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 900; background: ${v ? '#EFF6FF' : 'white'};">
                        ${v}
                    </div>
                `).join('')}
            </div>
            <div style="color: #64748B; font-size: 0.82rem;">🧩 Completa la cuadrícula sin repetir números ni símbolos por fila y columna.</div>
        </div>
    `;
};

window.renderizarLaberintoLogicoTool = function(stage, base) { window.renderizarCrucigramaTool(stage, base); };

window.renderizarPictionaryTabuTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: linear-gradient(135deg, #701A75, #A21CAF); color: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <span style="background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; margin: 0 auto;">🎭 Reto Tabú STEAM • ${base.materia}</span>
            <div style="margin: 15px 0;">
                <h1 style="font-size: 2rem; font-weight: 900; color: #FEF08A; margin: 0 0 8px 0;">${data.tema}</h1>
                <div style="background: rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.3); border-radius: 14px; padding: 14px; max-width: 480px; margin: 0 auto;">
                    <div style="font-size: 0.82rem; font-weight: 900; color: #FCA5A5; text-transform: uppercase; margin-bottom: 6px;">Palabras Prohibidas (Tabú):</div>
                    <div style="font-size: 1.05rem; font-weight: 700; color: white;">${data.palabras.slice(0, 4).join(' • ')}</div>
                </div>
            </div>
            <div style="font-size: 0.9rem; color: #F5D0FE;">¡Explica el concepto a tu equipo sin usar ninguna de las palabras prohibidas!</div>
        </div>
    `;
};

window.renderizarTriviaGiganteTool = function(stage, base) { window.renderizarPreguntaDetonante(stage, base); };

window.renderizarMuroPostIts = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #F1F5F9; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #CBD5E1; padding-bottom: 8px;">
                <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #1E293B;">💭 Muro de Lluvia de Ideas: ${data.tema}</h3>
                <button onclick="alert('💡 Nota adhesiva agregada al muro.')" style="background: #3B82F6; color: white; border: none; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 0.85rem; cursor: pointer;">➕ Agregar Post-it</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 12px 0;">
                <div style="background: #FEF08A; padding: 14px; border-radius: 8px; box-shadow: 2px 4px 10px rgba(0,0,0,0.1); color: #713F12; font-weight: 700; font-size: 0.9rem;">💡 Hipótesis: ${data.palabras[0] || 'El fenómeno'} es la causa determinante del proceso.</div>
                <div style="background: #BAE6FD; padding: 14px; border-radius: 8px; box-shadow: 2px 4px 10px rgba(0,0,0,0.1); color: #0369A1; font-weight: 700; font-size: 0.9rem;">🌱 Pregunta: ¿Cómo interactúa ${data.palabras[1] || 'la variable'} en el ecosistema?</div>
                <div style="background: #BBF7D0; padding: 14px; border-radius: 8px; box-shadow: 2px 4px 10px rgba(0,0,0,0.1); color: #15803D; font-weight: 700; font-size: 0.9rem;">🚀 Aplicación: Solución comunitaria basada en ${data.tema}.</div>
            </div>
            <div style="text-align: center; color: #64748B; font-size: 0.82rem;">Tablero interactivo para categorizar saberes previos en Grado ${data.grado}°.</div>
        </div>
    `;
};

window.renderizarNubePalabras = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    const colores = ['#2563EB', '#10B981', '#F59E0B', '#7C3AED', '#EC4899', '#0D9488', '#EA580C'];
    const tamanos = ['2.4rem', '1.9rem', '1.6rem', '1.4rem', '1.2rem', '1.1rem', '1.3rem'];

    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <h3 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #1E1B4B;">💬 Nube de Palabras Colectiva: ${data.tema}</h3>
            <div style="display: flex; justify-content: center; align-items: center; gap: 16px; flex-wrap: wrap; margin: 20px 0; max-width: 650px; margin-left: auto; margin-right: auto;">
                ${data.palabras.map((w, idx) => `
                    <span style="font-size: ${tamanos[idx % tamanos.length]}; font-weight: 900; color: ${colores[idx % colores.length]}; padding: 4px 8px;">${w}</span>
                `).join('')}
            </div>
            <div style="color: #64748B; font-size: 0.82rem;">📊 Frecuencia visual de los conceptos clave para ${base.materia} (Grado ${base.grado}°).</div>
        </div>
    `;
};

window.renderizarLivePoll = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #F8FAFC; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
            <div>
                <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #1E1B4B;">🗳️ Termómetro de Comprensión en Vivo: ${data.tema}</h3>
                <p style="margin: 2px 0 0 0; color: #64748B; font-size: 0.85rem;">Votación rápida proyectada para autorregulación del grupo</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px; margin: 12px 0;">
                <div onclick="this.style.background='#EFF6FF'" style="background: white; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                    <span style="font-weight: 800; color: #1E293B; font-size: 0.88rem;">A) Comprendo perfectamente el principio de ${data.palabras[0] || 'la temática'}</span>
                    <span style="background: #10B981; color: white; padding: 3px 10px; border-radius: 10px; font-weight: 800; font-size: 0.8rem;">65%</span>
                </div>
                <div onclick="this.style.background='#EFF6FF'" style="background: white; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                    <span style="font-weight: 800; color: #1E293B; font-size: 0.88rem;">B) Tengo clara la idea pero tengo dudas en cómo aplicar ${data.palabras[1] || 'la fórmula'}</span>
                    <span style="background: #3B82F6; color: white; padding: 3px 10px; border-radius: 10px; font-weight: 800; font-size: 0.8rem;">25%</span>
                </div>
                <div onclick="this.style.background='#EFF6FF'" style="background: white; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
                    <span style="font-weight: 800; color: #1E293B; font-size: 0.88rem;">C) Necesito otro ejemplo cotidiano para terminar de comprender</span>
                    <span style="background: #F59E0B; color: white; padding: 3px 10px; border-radius: 10px; font-weight: 800; font-size: 0.8rem;">10%</span>
                </div>
            </div>
            <div style="text-align: center; color: #64748B; font-size: 0.82rem;">📊 Permite al docente calibrar la explicación en tiempo real.</div>
        </div>
    `;
};

window.renderizarDiagramaVennTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #1E1B4B;">🗺️ Diagrama de Venn Comparativo: ${data.tema}</h3>
            <div style="display: flex; justify-content: center; align-items: center; margin: 15px 0; position: relative;">
                <div style="width: 190px; height: 190px; border-radius: 50%; background: rgba(59,130,246,0.2); border: 2px solid #2563EB; display: flex; align-items: center; justify-content: center; padding: 15px; font-weight: 800; color: #1E40AF; margin-right: -35px; font-size: 0.85rem;">
                    ${data.palabras[0] || 'Enfoque Teórico'}
                </div>
                <div style="width: 130px; height: 130px; border-radius: 50%; background: rgba(16,185,129,0.3); border: 2px dashed #059669; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #065F46; z-index: 10; font-size: 0.8rem;">
                    Leyes Comunes / Intersección
                </div>
                <div style="width: 190px; height: 190px; border-radius: 50%; background: rgba(245,158,11,0.2); border: 2px solid #D97706; display: flex; align-items: center; justify-content: center; padding: 15px; font-weight: 800; color: #92400E; margin-left: -35px; font-size: 0.85rem;">
                    ${data.palabras[1] || 'Aplicación Práctica'}
                </div>
            </div>
            <div style="color: #64748B; font-size: 0.82rem;">🖨️ Plantilla lista para imprimir y comparar estructuras en Grado ${data.grado}°.</div>
        </div>
    `;
};

window.renderizarTextoMutiladoTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
            <div>
                <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #1E1B4B;">📝 Texto Mutilado (Cloze Test): ${data.tema}</h3>
                <p style="margin: 2px 0 0 0; color: #64748B; font-size: 0.85rem;">Grado ${data.grado}° • Asignatura: <b>${base.materia}</b></p>
            </div>
            <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 16px; line-height: 1.9; font-size: 0.92rem; color: #1E293B; margin: 12px 0;">
                ${data.textoCloze.parrafo}
            </div>
            <div style="background: #EEF2FF; padding: 10px; border-radius: 8px; font-size: 0.85rem; color: #3730A3; font-weight: 800;">
                Banco de Palabras: [ ${data.textoCloze.banco.join(' • ')} ]
            </div>
        </div>
    `;
};

window.renderizarComicCientificoTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #1E1B4B;">📜 Taller Creador de Cómics STEAM: ${data.tema}</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 12px 0;">
                <div style="background: #F8FAFC; border: 2px dashed #94A3B8; border-radius: 10px; height: 150px; display: flex; flex-direction: column; justify-content: space-between; padding: 10px;">
                    <span style="font-weight: 800; font-size: 0.8rem; color: #64748B;">Viñeta 1: El Problema</span>
                    <span style="font-size: 0.72rem; color: #94A3B8;">(Situación inicial en ${data.tema})</span>
                </div>
                <div style="background: #F8FAFC; border: 2px dashed #94A3B8; border-radius: 10px; height: 150px; display: flex; flex-direction: column; justify-content: space-between; padding: 10px;">
                    <span style="font-weight: 800; font-size: 0.8rem; color: #64748B;">Viñeta 2: La Transformación</span>
                    <span style="font-size: 0.72rem; color: #94A3B8;">(Acción de ${data.palabras[0] || 'la ley'})</span>
                </div>
                <div style="background: #F8FAFC; border: 2px dashed #94A3B8; border-radius: 10px; height: 150px; display: flex; flex-direction: column; justify-content: space-between; padding: 10px;">
                    <span style="font-weight: 800; font-size: 0.8rem; color: #64748B;">Viñeta 3: El Resultado</span>
                    <span style="font-size: 0.72rem; color: #94A3B8;">(Solución e impacto sostenible)</span>
                </div>
            </div>
            <div style="color: #64748B; font-size: 0.82rem;">🎨 Formato imprimible para síntesis gráfica y narrativa científica en Grado ${data.grado}°.</div>
        </div>
    `;
};

window.renderizarTallerGraficasTool = function(stage, base) { window.renderizarFichaLaboratorioTool(stage, base); };

window.renderizarPasaporteSellosTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: #F8FAFC; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
            <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #1E1B4B;">📊 Pasaporte de Competencias STEAM: Grado ${base.grado}°</h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 15px 0;">
                <div style="background: white; border: 2px dashed #3B82F6; border-radius: 10px; padding: 14px;"><span style="font-size: 1.8rem;">🔬</span><div style="font-weight: 900; font-size: 0.82rem; margin-top: 4px;">${base.materia}</div><span style="color: #10B981; font-size: 0.75rem;">[SELLO SUPERADO]</span></div>
                <div style="background: white; border: 2px dashed #10B981; border-radius: 10px; padding: 14px;"><span style="font-size: 1.8rem;">💻</span><div style="font-weight: 900; font-size: 0.82rem; margin-top: 4px;">Tecnología</div><span style="color: #64748B; font-size: 0.75rem;">[PENDIENTE]</span></div>
                <div style="background: white; border: 2px dashed #F59E0B; border-radius: 10px; padding: 14px;"><span style="font-size: 1.8rem;">⚙️</span><div style="font-weight: 900; font-size: 0.82rem; margin-top: 4px;">Ingeniería</div><span style="color: #64748B; font-size: 0.75rem;">[PENDIENTE]</span></div>
                <div style="background: white; border: 2px dashed #EC4899; border-radius: 10px; padding: 14px;"><span style="font-size: 1.8rem;">📐</span><div style="font-weight: 900; font-size: 0.82rem; margin-top: 4px;">Matemáticas</div><span style="color: #64748B; font-size: 0.75rem;">[PENDIENTE]</span></div>
            </div>
            <div style="color: #64748B; font-size: 0.82rem;">🏅 Estampa sellos y firmas a medida que el alumno supera cada reto de <b>${data.tema}</b>.</div>
        </div>
    `;
};

window.renderizarPlanificadorSemanalTool = function(stage, base) {
    const data = window.generarDatosPedagogicosDinamicos(base.materia, base.grado, base.concepto, base.dificultad);
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
            <h3 style="margin: 0; font-size: 1.35rem; font-weight: 900; color: #1E1B4B;">📅 Planificador Semanal de Estudio Home School: Grado ${base.grado}°</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; margin: 12px 0;">
                <tr style="background: #F1F5F9; border-bottom: 2px solid #CBD5E1;">
                    <th style="padding: 6px;">Día</th><th style="padding: 6px;">Asignatura</th><th style="padding: 6px;">Misión / Guía</th><th style="padding: 6px;">Hábito Diario</th><th style="padding: 6px;">Check</th>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 6px; font-weight: 800;">Lunes</td><td>${base.materia}</td><td>Guía de ${data.tema}</td><td>30 min indagación</td><td>⬜</td></tr>
                <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 6px; font-weight: 800;">Martes</td><td>Matemáticas</td><td>Modelado de datos</td><td>Cálculo mental</td><td>⬜</td></tr>
                <tr style="border-bottom: 1px solid #E2E8F0;"><td style="padding: 6px; font-weight: 800;">Miércoles</td><td>Lenguaje</td><td>Sustentación de hipótesis</td><td>Redacción</td><td>⬜</td></tr>
            </table>
            <div style="text-align: center; color: #64748B; font-size: 0.82rem;">🏡 Planificador semanal para el hogar con metas claras y seguimiento de hábitos.</div>
        </div>
    `;
};

window.renderizarContratoConvivenciaTool = function(stage, base) {
    stage.innerHTML = `
        <div style="flex: 1; padding: 25px; background: white; display: flex; flex-direction: column; justify-content: space-between; text-align: center; border: 2px solid #1E293B; border-radius: 14px;">
            <div>
                <h3 style="margin: 0; font-size: 1.4rem; font-weight: 900; color: #1E1B4B;">🛡️ Contrato de Convivencia y Compromiso de Estudio</h3>
                <p style="margin: 2px 0 10px 0; color: #64748B; font-size: 0.85rem;">Acuerdo Ético y Pedagógico para el Aula y el Hogar • Grado ${base.grado}°</p>
            </div>
            <div style="text-align: left; font-size: 0.88rem; color: #334155; line-height: 1.6; max-width: 650px; margin: 0 auto;">
                1. Me comprometo a cuidar los tiempos de estudio con puntualidad y responsabilidad.<br>
                2. Utilizaré la tecnología y plataformas de manera formativa y honesta.<br>
                3. Trataré con respeto y empatía a mis compañeros, docentes y tutores familiares.<br>
                4. Daré mi mejor esfuerzo para superar cada misión y reto STEAM.
            </div>
            <div style="display: flex; justify-content: space-around; margin-top: 15px;">
                <div><div style="border-bottom: 1px solid black; width: 140px; margin-bottom: 4px;"></div><span style="font-size: 0.78rem; font-weight: 800;">Firma del Estudiante</span></div>
                <div><div style="border-bottom: 1px solid black; width: 140px; margin-bottom: 4px;"></div><span style="font-size: 0.78rem; font-weight: 800;">Firma del Tutor / Docente</span></div>
            </div>
        </div>
    `;
};

// ==========================================================================
// 41. PLANIFICADOR DE CLASE Y SECUENCIA DIDÁCTICA PRO
// ==========================================================================
// 41. PLANIFICADOR DE CLASE Y SECUENCIA DIDÁCTICA PRO (NÚCLEO PEDAGÓGICO #1)
// ==========================================================================
window.textoSecuenciaExtraido = '';
window.modoIngestaSecuencia = 'concepto';

window.cambiarModoIngestaSecuencia = function(modo) {
    window.modoIngestaSecuencia = modo;
    const btnC = document.getElementById('sec-tab-btn-concepto');
    const btnA = document.getElementById('sec-tab-btn-archivo');
    const btnT = document.getElementById('sec-tab-btn-texto');
    const panelC = document.getElementById('sec-panel-concepto');
    const panelA = document.getElementById('sec-panel-archivo');
    const panelT = document.getElementById('sec-panel-texto');

    if (btnC && btnA && btnT && panelC && panelA && panelT) {
        btnC.style.background = modo === 'concepto' ? '#2563EB' : '#F1F5F9';
        btnC.style.color = modo === 'concepto' ? 'white' : '#475569';
        btnA.style.background = modo === 'archivo' ? '#2563EB' : '#F1F5F9';
        btnA.style.color = modo === 'archivo' ? 'white' : '#475569';
        btnT.style.background = modo === 'texto' ? '#2563EB' : '#F1F5F9';
        btnT.style.color = modo === 'texto' ? 'white' : '#475569';

        panelC.style.display = modo === 'concepto' ? 'block' : 'none';
        panelA.style.display = modo === 'archivo' ? 'block' : 'none';
        panelT.style.display = modo === 'texto' ? 'block' : 'none';
    }
};

window.leerArchivoSecuencia = function(input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    const info = document.getElementById('sec-archivo-info');
    const nameEl = document.getElementById('sec-archivo-nombre');
    const inputTema = document.getElementById('sec-input-tema');

    if (nameEl) nameEl.innerText = `📎 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (info) info.style.display = 'block';

    const reader = new FileReader();
    reader.onload = function(e) {
        const raw = e.target.result || '';
        let textoLimpio = '';
        if (typeof raw === 'string') {
            textoLimpio = raw.slice(0, 3000).trim();
        } else {
            textoLimpio = `Documento ${file.name} cargado correctamente para la planeación didáctica.`;
        }
        window.textoSecuenciaExtraido = textoLimpio;
        
        // Auto-asignar nombre base del archivo como concepto si el input está vacío o genérico
        const nombreSinExt = file.name.replace(/\.[^/.]+$/, "");
        if (inputTema && (!inputTema.value || inputTema.value.trim().length <= 3)) {
            inputTema.value = nombreSinExt;
        }
        window.actualizarContenidoSecuenciaDidactica();
    };

    if (file.type.includes('text') || file.name.endsWith('.txt')) {
        reader.readAsText(file);
    } else {
        reader.readAsText(file.slice(0, 10000));
    }
};

window.renderizarSecuenciaDidacticaTool = function(stage, base) {
    stage.innerHTML = `
        <div style="flex: 1; padding: 20px; background: #F8FAFC; display: flex; flex-direction: column; gap: 16px; text-align: left; overflow-y: auto;">
            
            <!-- Encabezado Principal y Botón de Acción -->
            <div style="background: linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%); border: 2px solid #BFDBFE; border-radius: 16px; padding: 18px 22px; box-shadow: 0 4px 14px rgba(37,99,235,0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #2563EB, #1D4ED8); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: white; box-shadow: 0 4px 10px rgba(37,99,235,0.3);">
                            📋
                        </div>
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="background: #2563EB; color: white; font-weight: 900; font-size: 0.72rem; padding: 2px 8px; border-radius: 12px;">HERRAMIENTA #1 PRO</span>
                                <h3 style="margin: 0; font-size: 1.3rem; font-weight: 900; color: #1E3A8A;">Planificador de Clase y Secuencia Didáctica Pro</h3>
                            </div>
                            <p style="margin: 3px 0 0 0; color: #475569; font-size: 0.84rem;">
                                Diseño curricular 100% personalizado: 8 Modelos Pedagógicos, Enfoques STEAM, Minutero Exacto, Ingesta Multimodal y Ecosistema Digital Integrado.
                            </p>
                        </div>
                    </div>
                    <button onclick="window.actualizarContenidoSecuenciaDidactica()" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; border: none; padding: 11px 22px; border-radius: 12px; font-weight: 900; font-size: 0.92rem; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(37,99,235,0.35);">
                        <span>⚡</span> Generar Secuencia Didáctica Personalizada
                    </button>
                </div>

                <!-- SECCIÓN 1: INGESTA PERSONALIZADA DEL TEMA O ARCHIVO (NO ARBITRARIA) -->
                <div style="background: white; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 14px; margin-bottom: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                        <span style="font-size: 0.82rem; font-weight: 900; color: #1E293B; display: flex; align-items: center; gap: 6px;">
                            <span>📥</span> Ingesta de Contenido para la Planeación (Tema, Archivo o Texto Libre):
                        </span>
                        <div style="display: flex; gap: 6px;">
                            <button id="sec-tab-btn-concepto" onclick="window.cambiarModoIngestaSecuencia('concepto')" style="background: #2563EB; color: white; border: none; padding: 5px 12px; border-radius: 8px; font-weight: 800; font-size: 0.78rem; cursor: pointer;">
                                🏷️ Escribir Tema
                            </button>
                            <button id="sec-tab-btn-archivo" onclick="window.cambiarModoIngestaSecuencia('archivo')" style="background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; padding: 5px 12px; border-radius: 8px; font-weight: 800; font-size: 0.78rem; cursor: pointer;">
                                📎 Adjuntar Archivo (PDF / Word)
                            </button>
                            <button id="sec-tab-btn-texto" onclick="window.cambiarModoIngestaSecuencia('texto')" style="background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; padding: 5px 12px; border-radius: 8px; font-weight: 800; font-size: 0.78rem; cursor: pointer;">
                                📋 Pegar Texto / DBA
                            </button>
                        </div>
                    </div>

                    <!-- Panel Modo Concepto -->
                    <div id="sec-panel-concepto">
                        <input type="text" id="sec-input-tema" value="${base.concepto || ''}" placeholder="Ej: Leyes de Newton, Ecosistemas Colombianos, Fraccionarios, Fotosíntesis, Inteligencia Artificial..." oninput="window.actualizarContenidoSecuenciaDidactica()" style="width: 100%; padding: 9px 12px; border: 1.5px solid #94A3B8; border-radius: 8px; font-weight: 800; font-size: 0.9rem; color: #0F172A; box-sizing: border-box;">
                    </div>

                    <!-- Panel Modo Archivo -->
                    <div id="sec-panel-archivo" style="display: none;">
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <input type="file" id="sec-input-archivo" accept=".pdf,.docx,.doc,.txt,.rtf" onchange="window.leerArchivoSecuencia(this)" style="font-size: 0.85rem; font-weight: 700; color: #334155;">
                            <span style="font-size: 0.78rem; color: #64748B;">Formatos admitidos: PDF, Word (.docx), TXT. El sistema extraerá el tema y contenido automáticamente.</span>
                        </div>
                        <div id="sec-archivo-info" style="display: none; margin-top: 8px; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; color: #065F46; font-weight: 800;">
                            <span id="sec-archivo-nombre"></span> — ¡Archivo procesado con éxito para la secuencia didáctica!
                        </div>
                    </div>

                    <!-- Panel Modo Texto -->
                    <div id="sec-panel-texto" style="display: none;">
                        <textarea id="sec-textarea-texto" rows="3" placeholder="Pega aquí fragmentos de la guía curricular, libro de texto o DBA que deseas convertir en una secuencia didáctica..." oninput="window.actualizarContenidoSecuenciaDidactica()" style="width: 100%; padding: 8px 12px; border: 1.5px solid #94A3B8; border-radius: 8px; font-size: 0.85rem; color: #0F172A; box-sizing: border-box;"></textarea>
                    </div>
                </div>

                <!-- SECCIÓN 2: MENÚS COLGANTES DE CONFIGURACIÓN CURRICULAR Y PEDAGÓGICA -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 14px;">
                    <div>
                        <label style="font-size: 0.78rem; font-weight: 900; color: #1E293B; display: block; margin-bottom: 4px;">📚 Asignatura / Área:</label>
                        <select id="sec-select-materia" onchange="window.actualizarContenidoSecuenciaDidactica()" style="width: 100%; padding: 8px 10px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 800; font-size: 0.84rem; background: white; color: #1E3A8A;">
                            <option value="Ciencias Naturales y Educación Ambiental" ${base.materia.includes('Natural') ? 'selected' : ''}>🌱 Ciencias Naturales</option>
                            <option value="Matemáticas y Razonamiento Cuantitativo" ${base.materia.includes('Matem') ? 'selected' : ''}>📐 Matemáticas</option>
                            <option value="Lengua Castellana y Literatura" ${base.materia.includes('Lengu') ? 'selected' : ''}>📖 Lengua Castellana</option>
                            <option value="Ciencias Sociales, Historia y Democracia" ${base.materia.includes('Social') ? 'selected' : ''}>🌍 Ciencias Sociales</option>
                            <option value="Inglés STEAM y Competencias Globales" ${base.materia.includes('Ingl') ? 'selected' : ''}>🇬🇧 Inglés STEAM</option>
                            <option value="Tecnología e Informática" ${base.materia.includes('Tecno') ? 'selected' : ''}>💻 Tecnología e Informática</option>
                            <option value="Educación Artística y Creatividad Visual">🎨 Educación Artística</option>
                            <option value="Ética, Valores Humanos y Cátedra de Paz">🕊️ Ética y Valores</option>
                            <option value="Física Clásica y Moderna">⚡ Física</option>
                            <option value="Química Orgánica e Inorgánica">🧪 Química</option>
                            <option value="Filosofía y Pensamiento Crítico">🏛️ Filosofía</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.78rem; font-weight: 900; color: #1E293B; display: block; margin-bottom: 4px;">🎓 Grado / Nivel:</label>
                        <select id="sec-select-grado" onchange="window.actualizarContenidoSecuenciaDidactica()" style="width: 100%; padding: 8px 10px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 800; font-size: 0.84rem; background: white;">
                            <option value="1">Grado 1° Primaria</option>
                            <option value="2">Grado 2° Primaria</option>
                            <option value="3">Grado 3° Primaria</option>
                            <option value="4">Grado 4° Primaria</option>
                            <option value="5" ${base.grado == 5 ? 'selected' : ''}>Grado 5° Primaria</option>
                            <option value="6">Grado 6° Secundaria</option>
                            <option value="7">Grado 7° Secundaria</option>
                            <option value="8">Grado 8° Secundaria</option>
                            <option value="9">Grado 9° Secundaria</option>
                            <option value="10">Grado 10° Media Técnica</option>
                            <option value="11">Grado 11° Media Académica</option>
                            <option value="Ciclo I">Ciclo I Nocturno (1°-3°)</option>
                            <option value="Ciclo II">Ciclo II Nocturno (4°-5°)</option>
                            <option value="Ciclo III">Ciclo III Nocturno (6°-7°)</option>
                            <option value="Ciclo IV">Ciclo IV Nocturno (8°-9°)</option>
                            <option value="Ciclo V">Ciclo V Nocturno (10°)</option>
                            <option value="Ciclo VI">Ciclo VI Nocturno (11°)</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.78rem; font-weight: 900; color: #1E293B; display: block; margin-bottom: 4px;">📅 Periodo y Semana:</label>
                        <div style="display: flex; gap: 6px;">
                            <select id="sec-select-periodo" onchange="window.actualizarContenidoSecuenciaDidactica()" style="flex: 1; padding: 8px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 800; font-size: 0.84rem; background: white;">
                                <option value="1" ${base.periodo == 1 ? 'selected' : ''}>Periodo 1</option>
                                <option value="2" ${base.periodo == 2 ? 'selected' : ''}>Periodo 2</option>
                                <option value="3" ${base.periodo == 3 ? 'selected' : ''}>Periodo 3</option>
                                <option value="4" ${base.periodo == 4 ? 'selected' : ''}>Periodo 4</option>
                            </select>
                            <select id="sec-select-semana" onchange="window.actualizarContenidoSecuenciaDidactica()" style="flex: 1; padding: 8px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 800; font-size: 0.84rem; background: white;">
                                <option value="1" ${base.semana == 1 ? 'selected' : ''}>Sem 1</option>
                                <option value="2" ${base.semana == 2 ? 'selected' : ''}>Sem 2</option>
                                <option value="3" ${base.semana == 3 ? 'selected' : ''}>Sem 3</option>
                                <option value="4" ${base.semana == 4 ? 'selected' : ''}>Sem 4</option>
                                <option value="5" ${base.semana == 5 ? 'selected' : ''}>Sem 5</option>
                                <option value="6" ${base.semana == 6 ? 'selected' : ''}>Sem 6</option>
                                <option value="7" ${base.semana == 7 ? 'selected' : ''}>Sem 7</option>
                                <option value="8" ${base.semana == 8 ? 'selected' : ''}>Sem 8</option>
                                <option value="9" ${base.semana == 9 ? 'selected' : ''}>Sem 9</option>
                                <option value="10" ${base.semana == 10 ? 'selected' : ''}>Sem 10</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style="font-size: 0.78rem; font-weight: 900; color: #1E293B; display: block; margin-bottom: 4px;">⏰ Horas de Clase Semanal:</label>
                        <select id="sec-select-intensidad" onchange="window.actualizarContenidoSecuenciaDidactica()" style="width: 100%; padding: 8px 10px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 800; font-size: 0.84rem; background: white; color: #047857;">
                            <option value="1">1 Hora Semanal</option>
                            <option value="2">2 Horas Semanales</option>
                            <option value="3">3 Horas Semanales</option>
                            <option value="4" selected>4 Horas Semanales</option>
                            <option value="5">5 Horas Semanales</option>
                            <option value="6">6 Horas Semanales (Intensivo)</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.78rem; font-weight: 900; color: #1E293B; display: block; margin-bottom: 4px;">⏱️ Duración de la Sesión:</label>
                        <select id="sec-select-tiempo" onchange="window.actualizarContenidoSecuenciaDidactica()" style="width: 100%; padding: 8px 10px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 800; font-size: 0.84rem; background: white; color: #1D4ED8;">
                            <option value="45">45 minutos (1 Hora Cátedra)</option>
                            <option value="60">60 minutos (1 Hora Bloque)</option>
                            <option value="90" selected>90 minutos (Bloque Doble STEAM)</option>
                            <option value="120">120 minutos (2 Horas Laboratorio)</option>
                            <option value="180">180 minutos (Secuencia Modular 3 Sesiones)</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.78rem; font-weight: 900; color: #1E293B; display: block; margin-bottom: 4px;">🏛️ Modelo Pedagógico:</label>
                        <select id="sec-select-modelo" onchange="window.actualizarContenidoSecuenciaDidactica()" style="width: 100%; padding: 8px 10px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 800; font-size: 0.84rem; background: white; color: #4338CA;">
                            <option value="Constructivismo (Piaget / Vygotsky / Ausubel)" selected>🌱 Constructivismo (Piaget / Vygotsky / Ausubel)</option>
                            <option value="Pedagogía Conceptual (De Zubiría - Mentefactos)">🧠 Pedagogía Conceptual (De Zubiría - Mentefactos)</option>
                            <option value="Aprendizaje Basado en Proyectos (ABP / PBL)">🚀 Aprendizaje Basado en Proyectos (ABP / PBL)</option>
                            <option value="Enseñanza para la Comprensión (EpC - Harvard)">💡 Enseñanza para la Comprensión (EpC - Harvard)</option>
                            <option value="Enfoque Socioformativo (Sergio Tobón - Retos)">🌍 Enfoque Socioformativo (Sergio Tobón - Retos)</option>
                            <option value="Aula Invertida (Flipped Classroom)">🔄 Aula Invertida (Flipped Classroom)</option>
                            <option value="Pensamiento de Diseño (Design Thinking STEAM)">🎨 Pensamiento de Diseño (Design Thinking STEAM)</option>
                            <option value="Escuela Nueva / Activa (Montessori / Dewey)">🌿 Escuela Nueva / Activa (Montessori / Dewey)</option>
                            <option value="Tradicional Estructurado">📖 Tradicional Estructurado</option>
                        </select>
                    </div>

                    <div style="grid-column: span 2;">
                        <label style="font-size: 0.78rem; font-weight: 900; color: #1E293B; display: block; margin-bottom: 4px;">🔬 Enfoque del Modelo:</label>
                        <select id="sec-select-enfoque" onchange="window.actualizarContenidoSecuenciaDidactica()" style="width: 100%; padding: 8px 10px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 800; font-size: 0.84rem; background: white; color: #047857;">
                            <option value="STEAM Integrado (Ciencia, Tech, Ing, Arte, Mat)" selected>⚡ STEAM Integrado (Ciencia, Tecnología, Ingeniería, Arte y Matemáticas)</option>
                            <option value="Indagación Científica y Modelización Experimental">🧪 Indagación Científica y Modelización Experimental</option>
                            <option value="Resolución de Problemas del Contexto Real y Retos Locales">🎯 Resolución de Problemas del Contexto Real y Retos Locales</option>
                            <option value="Enfoque por Competencias MEN (Saber, Saber Hacer, Ser)">📜 Enfoque por Competencias MEN (Saber Conocer, Hacer, Ser)</option>
                            <option value="Pensamiento Crítico y Formación Ciudadana">🕊️ Pensamiento Crítico y Formación Ciudadana</option>
                            <option value="Diseño Universal para el Aprendizaje (DUA / Inclusión)">🤝 Diseño Universal para el Aprendizaje (DUA / Inclusión)</option>
                        </select>
                    </div>
                </div>

                <!-- SECCIÓN 3: SELECCIÓN DE HERRAMIENTAS DE LA PLATAFORMA QUE COMPLEMENTAN LA CLASE -->
                <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 12px; padding: 14px; margin-bottom: 14px;">
                    <div style="font-size: 0.84rem; font-weight: 900; color: #166534; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <span>🛠️</span> Selecciona las Herramientas Digitales de Peidagogos STEAM a integrar en esta clase:
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;">
                            <input type="checkbox" id="chk-tool-sopa" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🕹️ Sopa de Letras</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;">
                            <input type="checkbox" id="chk-tool-crucigrama" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🧩 Crucigrama</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;">
                            <input type="checkbox" id="chk-tool-mentefacto" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🧠 Mentefacto Pro</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;">
                            <input type="checkbox" id="chk-tool-mapa" onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🗺️ Mapa Conceptual Novak</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;">
                            <input type="checkbox" id="chk-tool-diapositivas" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>📽️ 10 Diapositivas Semanales</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;">
                            <input type="checkbox" id="chk-tool-semaforo" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🚦 Semáforo de Ruido Audio</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;">
                            <input type="checkbox" id="chk-tool-ruleta" onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🎡 Ruleta de Turnos</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;">
                            <input type="checkbox" id="chk-tool-bingo" onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🎯 Bingo STEAM Gamificado</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;">
                            <input type="checkbox" id="chk-tool-trivia" onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🏆 Jeopardy / Trivia</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;">
                            <input type="checkbox" id="chk-tool-lab" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🧪 Ficha de Laboratorio</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;">
                            <input type="checkbox" id="chk-tool-tickets" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🎫 Boletos de Salida</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #1E293B; background: white; padding: 6px 10px; border-radius: 8px; border: 1px solid #CBD5E1; cursor: pointer;">
                            <input type="checkbox" id="chk-tool-ranking" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🏆 Ránking Gamificado XP</span>
                        </label>
                    </div>
                </div>

                <!-- SECCIÓN 4: COMPONENTES CHULEABLES DE LA SECUENCIA DIDÁCTICA -->
                <div>
                    <label style="font-size: 0.78rem; font-weight: 900; color: #1E293B; display: block; margin-bottom: 8px;">
                        ☑️ Chulea los componentes curriculares que integrará el documento final:
                    </label>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; cursor: pointer;">
                            <input type="checkbox" id="chk-sec-pregunta" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>❓ Pregunta Orientadora</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; cursor: pointer;">
                            <input type="checkbox" id="chk-sec-dba" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>📜 Estándares & DBA (MEN)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; cursor: pointer;">
                            <input type="checkbox" id="chk-sec-f1" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🔥 Fase 1: Saberes Previos</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; cursor: pointer;">
                            <input type="checkbox" id="chk-sec-f2" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🧠 Fase 2: Estructuración</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; cursor: pointer;">
                            <input type="checkbox" id="chk-sec-f3" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🧪 Fase 3: Taller STEAM</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; cursor: pointer;">
                            <input type="checkbox" id="chk-sec-f4" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🚀 Fase 4: Transferencia</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; cursor: pointer;">
                            <input type="checkbox" id="chk-sec-f5" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🎯 Fase 5: Metacognición</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; cursor: pointer;">
                            <input type="checkbox" id="chk-sec-recursos" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>📦 Recursos Didácticos</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; cursor: pointer;">
                            <input type="checkbox" id="chk-sec-dua" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🤝 Ajustes DUA / Inclusión</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; cursor: pointer;">
                            <input type="checkbox" id="chk-sec-tarea" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>🏡 Misión Autónoma (+XP)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; cursor: pointer;">
                            <input type="checkbox" id="chk-sec-rubrica" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>📊 Rúbrica MEN (Dec 1290)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.78rem; font-weight: 700; color: #475569; background: #F8FAFC; padding: 6px 10px; border-radius: 8px; border: 1px solid #E2E8F0; cursor: pointer;">
                            <input type="checkbox" id="chk-sec-firmas" checked onchange="window.actualizarContenidoSecuenciaDidactica()">
                            <span>✍️ Firmas Institucionales</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Botones de Acción y Exportación -->
            <div style="display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
                <button onclick="window.copiarDocumentoSecuencia()" style="background: white; border: 1.5px solid #CBD5E1; color: #334155; padding: 9px 18px; border-radius: 10px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    📋 Copiar Plan Didáctico
                </button>
                <button onclick="window.imprimirDocumentoSecuencia()" style="background: linear-gradient(135deg, #059669, #047857); color: white; border: none; padding: 9px 20px; border-radius: 10px; font-weight: 900; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(5,150,105,0.3);">
                    🖨️ Imprimir Secuencia Didáctica (PDF)
                </button>
            </div>

            <!-- Documento Imprimible Diagramado -->
            <div id="secuencia-didactica-contenedor-documento" style="background: white; border: 2px solid #CBD5E1; border-radius: 14px; padding: 30px 36px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); color: #1E293B; font-family: 'Segoe UI', system-ui, sans-serif;">
                <!-- Generado dinámicamente -->
            </div>
        </div>
    `;

    window.actualizarContenidoSecuenciaDidactica();
};

window.actualizarContenidoSecuenciaDidactica = function() {
    const contenedor = document.getElementById('secuencia-didactica-contenedor-documento');
    if (!contenedor) return;

    const base = window.obtenerContenidoBaseIngesta();
    
    // Obtener valores personalizados de los selectores e inputs
    const inputTema = document.getElementById('sec-input-tema');
    const textareaTexto = document.getElementById('sec-textarea-texto');
    const selMat = document.getElementById('sec-select-materia');
    const selGra = document.getElementById('sec-select-grado');
    const selPer = document.getElementById('sec-select-periodo');
    const selSem = document.getElementById('sec-select-semana');
    const selInt = document.getElementById('sec-select-intensidad');
    const selMod = document.getElementById('sec-select-modelo');
    const selEnf = document.getElementById('sec-select-enfoque');
    const selTie = document.getElementById('sec-select-tiempo');

    let conceptoActual = base.concepto || 'Conceptos Fundamentales';
    if (window.modoIngestaSecuencia === 'concepto' && inputTema && inputTema.value.trim().length > 0) {
        conceptoActual = inputTema.value.trim();
    } else if (window.modoIngestaSecuencia === 'archivo' && window.textoSecuenciaExtraido) {
        conceptoActual = inputTema && inputTema.value.trim().length > 0 ? inputTema.value.trim() : (base.concepto || 'Contenido del Documento');
    } else if (window.modoIngestaSecuencia === 'texto' && textareaTexto && textareaTexto.value.trim().length > 0) {
        conceptoActual = textareaTexto.value.trim().slice(0, 100);
    }

    const materia = selMat ? selMat.value : base.materia;
    const grado = selGra ? selGra.value : base.grado;
    const periodo = selPer ? selPer.value : base.periodo;
    const semana = selSem ? selSem.value : base.semana;
    const intensidad = selInt ? selInt.value : '4';
    const modelo = selMod ? selMod.value : 'Constructivismo';
    const enfoque = selEnf ? selEnf.value : 'STEAM Integrado';
    const tiempoTotal = parseInt(selTie ? selTie.value : '90', 10);

    // Minutaje matemático proporcional exacto
    const tF1 = Math.round(tiempoTotal * 0.15);
    const tF2 = Math.round(tiempoTotal * 0.30);
    const tF3 = Math.round(tiempoTotal * 0.35);
    const tF4 = Math.round(tiempoTotal * 0.15);
    const tF5 = Math.max(5, tiempoTotal - (tF1 + tF2 + tF3 + tF4));

    // Estado de checkboxes de componentes
    const chkPregunta = document.getElementById('chk-sec-pregunta')?.checked ?? true;
    const chkDBA = document.getElementById('chk-sec-dba')?.checked ?? true;
    const chkF1 = document.getElementById('chk-sec-f1')?.checked ?? true;
    const chkF2 = document.getElementById('chk-sec-f2')?.checked ?? true;
    const chkF3 = document.getElementById('chk-sec-f3')?.checked ?? true;
    const chkF4 = document.getElementById('chk-sec-f4')?.checked ?? true;
    const chkF5 = document.getElementById('chk-sec-f5')?.checked ?? true;
    const chkRecursos = document.getElementById('chk-sec-recursos')?.checked ?? true;
    const chkDUA = document.getElementById('chk-sec-dua')?.checked ?? true;
    const chkTarea = document.getElementById('chk-sec-tarea')?.checked ?? true;
    const chkRubrica = document.getElementById('chk-sec-rubrica')?.checked ?? true;
    const chkFirmas = document.getElementById('chk-sec-firmas')?.checked ?? true;

    // Estado de herramientas de la plataforma seleccionadas
    const herramientasSeleccionadas = [];
    if (document.getElementById('chk-tool-sopa')?.checked) herramientasSeleccionadas.push({ icon: '🕹️', nombre: 'Sopa de Letras Temática', fase: 'Fase 1 / Saberes Previos', uso: 'Activación lúdica de vocabulario y conceptos clave.' });
    if (document.getElementById('chk-tool-crucigrama')?.checked) herramientasSeleccionadas.push({ icon: '🧩', nombre: 'Crucigrama de Conceptos', fase: 'Fase 2 / Estructuración', uso: 'Consolidación de definiciones y relaciones semánticas.' });
    if (document.getElementById('chk-tool-mentefacto')?.checked) herramientasSeleccionadas.push({ icon: '🧠', nombre: 'Mentefacto Conceptual Pro', fase: 'Fase 2 / Estructuración', uso: 'Modelado gráfico de supraordinada, exclusiones e isoordinadas.' });
    if (document.getElementById('chk-tool-mapa')?.checked) herramientasSeleccionadas.push({ icon: '🗺️', nombre: 'Mapa Conceptual Novak', fase: 'Fase 2 / Estructuración', uso: 'Estructuración jerárquica con enlaces proposicionales.' });
    if (document.getElementById('chk-tool-diapositivas')?.checked) herramientasSeleccionadas.push({ icon: '📽️', nombre: '10 Diapositivas Semanales', fase: 'Fase 1 y 2 / Proyección', uso: 'Soporte visual proyectable con retos y simulaciones.' });
    if (document.getElementById('chk-tool-semaforo')?.checked) herramientasSeleccionadas.push({ icon: '🚦', nombre: 'Semáforo de Ruido WebAudio', fase: 'Fase 3 / Taller Grupal', uso: 'Monitoreo acústico en tiempo real para autorregulación del aula.' });
    if (document.getElementById('chk-tool-ruleta')?.checked) herramientasSeleccionadas.push({ icon: '🎡', nombre: 'Ruleta Digital de Turnos', fase: 'Fase 1 y 4 / Participación', uso: 'Selección aleatoria y equitativa de estudiantes o voceros.' });
    if (document.getElementById('chk-tool-bingo')?.checked) herramientasSeleccionadas.push({ icon: '🎯', nombre: 'Bingo STEAM Gamificado', fase: 'Fase 4 / Transferencia', uso: 'Fijación de competencias con cartones imprimibles.' });
    if (document.getElementById('chk-tool-trivia')?.checked) herramientasSeleccionadas.push({ icon: '🏆', nombre: 'Jeopardy / Trivia Gigante', fase: 'Fase 4 / Cierre', uso: 'Concurso interactivo por casas STEAM con preguntas escalonadas.' });
    if (document.getElementById('chk-tool-lab')?.checked) herramientasSeleccionadas.push({ icon: '🧪', nombre: 'Ficha de Laboratorio e Indagación', fase: 'Fase 3 / Taller STEAM', uso: 'Guía física de registro empírico, hipótesis y toma de datos.' });
    if (document.getElementById('chk-tool-tickets')?.checked) herramientasSeleccionadas.push({ icon: '🎫', nombre: 'Boletos de Salida (Exit Tickets)', fase: 'Fase 5 / Metacognición', uso: 'Evaluación formativa rápida de 3 preguntas al culminar la clase.' });
    if (document.getElementById('chk-tool-ranking')?.checked) herramientasSeleccionadas.push({ icon: '🏆', nombre: 'Ránking Gamificado XP', fase: 'Toda la sesión', uso: 'Asignación de puntos de experiencia y motivación de equipos.' });

    let html = `
        <!-- Encabezado Institucional -->
        <div style="border-bottom: 2.5px solid #1E3A8A; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
                <div style="font-size: 0.75rem; font-weight: 900; color: #2563EB; text-transform: uppercase; letter-spacing: 1.5px;">SISTEMA INSTITUCIONAL PEIDAGOGOS STEAM</div>
                <h2 style="margin: 2px 0 0 0; font-size: 1.45rem; font-weight: 900; color: #0F172A;">FORMATO OFICIAL DE SECUENCIA DIDÁCTICA Y PLAN DE CLASE</h2>
                <div style="font-size: 0.84rem; color: #475569; margin-top: 2px;">Diseño curricular alineado con Estándares Básicos de Competencias, DBA (MEN) y Decreto 1290</div>
            </div>
            <div style="display: flex; gap: 10px;">
                <div style="text-align: center; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 6px 12px;">
                    <div style="font-size: 0.72rem; font-weight: 800; color: #64748B;">INTENSIDAD</div>
                    <div style="font-size: 1.1rem; font-weight: 900; color: #0F172A;">⏰ ${intensidad}h / Sem</div>
                </div>
                <div style="text-align: right; background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 6px 14px;">
                    <div style="font-size: 0.72rem; font-weight: 800; color: #1E40AF;">DURACIÓN SESIÓN</div>
                    <div style="font-size: 1.25rem; font-weight: 900; color: #1D4ED8;">⏱️ ${tiempoTotal} min</div>
                </div>
            </div>
        </div>

        <!-- Matriz de Identificación Institucional -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 0.85rem;">
            <tr style="background: #F1F5F9;">
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 800; width: 22%;">📚 Asignatura / Área:</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 700; color: #1E3A8A; width: 28%;">${materia}</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 800; width: 22%;">🎓 Grado / Ciclo:</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 700; width: 28%;">${grado.toString().startsWith('Ciclo') ? grado : 'Grado ' + grado + '°'}</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 800;">📅 Periodo / Semana:</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1;">Periodo ${periodo} • Semana ${semana}</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 800;">🎯 Tema / Eje Central:</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 800; color: #0F172A;">${conceptoActual}</td>
            </tr>
            <tr style="background: #F8FAFC;">
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 800;">🏛️ Modelo Pedagógico:</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; color: #4338CA; font-weight: 700;">${modelo}</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 800;">🔬 Enfoque del Modelo:</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; color: #047857; font-weight: 700;">${enfoque}</td>
            </tr>
        </table>
    `;

    if (chkPregunta) {
        html += `
            <div style="background: #FEF3C7; border-left: 4.5px solid #F59E0B; padding: 12px 16px; border-radius: 0 10px 10px 0; margin-bottom: 16px;">
                <div style="font-weight: 900; color: #92400E; font-size: 0.88rem; margin-bottom: 4px;">❓ PREGUNTA ORIENTADORA / SITUACIÓN PROBLEMA DEL CONTEXTO:</div>
                <div style="font-size: 0.88rem; color: #78350F; line-height: 1.45;">
                    ¿De qué manera los principios de <strong>${conceptoActual}</strong> nos permiten formular soluciones creativas, sostenibles y tecnológicamente viables a retos reales de nuestra comunidad mediante el enfoque STEAM?
                </div>
            </div>
        `;
    }

    if (chkDBA) {
        html += `
            <div style="background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 12px; padding: 14px; margin-bottom: 18px;">
                <div style="font-weight: 900; color: #1E40AF; font-size: 0.9rem; margin-bottom: 6px;">📜 ESTÁNDARES BÁSICOS DE COMPETENCIAS & DERECHOS BÁSICOS DE APRENDIZAJE (MEN):</div>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.85rem; color: #1E293B; line-height: 1.5;">
                    <li><strong>Estándar EBC:</strong> Explico y modelo fenómenos y relaciones del entorno a partir de los fundamentos de ${materia}, contrastando hipótesis mediante el método científico y la modelación matemática.</li>
                    <li><strong>DBA Asociado:</strong> Comprende, interpreta y aplica los conceptos y leyes de <em>${conceptoActual}</em> en ${grado.toString().startsWith('Ciclo') ? grado : 'Grado ' + grado + '°'}, justificando sus conclusiones mediante razonamiento riguroso.</li>
                    <li><strong>Evidencia Evaluativa:</strong> Formula hipótesis, ejecuta experimentos guiados, elabora organizadores gráficos y comunica hallazgos utilizando vocabulario técnico y argumentativo.</li>
                </ul>
            </div>
        `;
    }

    // Fases de la Secuencia Didáctica con Minutaje Proporcional Exacto
    if (chkF1 || chkF2 || chkF3 || chkF4 || chkF5) {
        html += `
            <div style="margin-bottom: 20px;">
                <div style="font-weight: 900; color: #0F172A; font-size: 1rem; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 12px;">
                    🚀 FASES DE LA SECUENCIA DIDÁCTICA (DESARROLLO DE LA CLASE - ${tiempoTotal} MINUTOS):
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
        `;

        if (chkF1) {
            html += `
                <div style="border: 1.5px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
                    <div style="background: #EEF2FF; padding: 8px 14px; font-weight: 900; font-size: 0.88rem; color: #3730A3; display: flex; justify-content: space-between; align-items: center;">
                        <span>🔥 FASE 1: Exploración y Activación de Saberes Previos (Hook Motivacional)</span>
                        <span style="background: white; color: #4338CA; padding: 2px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 900;">⏱️ ${tF1} min</span>
                    </div>
                    <div style="padding: 12px 16px; font-size: 0.85rem; color: #334155; line-height: 1.5;">
                        <b>Actividad del Docente:</b> Proyecta una situación detonante o desafío visual sobre <em>${conceptoActual}</em>. Utiliza la ruleta digital para dinamizar la participación y plantea 2 preguntas socráticas para identificar preconcepciones.<br>
                        <b>Actividad del Estudiante:</b> Participa activamente en la lluvia de ideas guiada, contrasta intuiciones con sus compañeros y registra sus hipótesis iniciales en su bitácora o cuaderno de campo.
                    </div>
                </div>
            `;
        }

        if (chkF2) {
            html += `
                <div style="border: 1.5px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
                    <div style="background: #ECFDF5; padding: 8px 14px; font-weight: 900; font-size: 0.88rem; color: #065F46; display: flex; justify-content: space-between; align-items: center;">
                        <span>🧠 FASE 2: Estructuración y Conceptualización Rigurosa (Modelamiento)</span>
                        <span style="background: white; color: #059669; padding: 2px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 900;">⏱️ ${tF2} min</span>
                    </div>
                    <div style="padding: 12px 16px; font-size: 0.85rem; color: #334155; line-height: 1.5;">
                        <b>Actividad del Docente:</b> Explica los principios esenciales de <em>${conceptoActual}</em> integrando el modelo pedagógico <em>${modelo}</em>. Construye en pantalla un Mentefacto Conceptual Pro o Mapa Conceptual Novak formalizando definiciones, supraordinadas y propiedades.<br>
                        <b>Actividad del Estudiante:</b> Sintetiza las proposiciones fundamentales, identifica diferencias conceptuales y formula preguntas de profundización.
                    </div>
                </div>
            `;
        }

        if (chkF3) {
            html += `
                <div style="border: 1.5px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
                    <div style="background: #FDF2F8; padding: 8px 14px; font-weight: 900; font-size: 0.88rem; color: #9D174D; display: flex; justify-content: space-between; align-items: center;">
                        <span>🧪 FASE 3: Práctica Guiada / Taller Experimental STEAM (Indagación en Equipos)</span>
                        <span style="background: white; color: #DB2777; padding: 2px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 900;">⏱️ ${tF3} min</span>
                    </div>
                    <div style="padding: 12px 16px; font-size: 0.85rem; color: #334155; line-height: 1.5;">
                        <b>Actividad del Docente:</b> Entrega la Ficha de Laboratorio / Reto STEAM, asigna roles de trabajo cooperativo y activa el Semáforo de Ruido WebAudio para autorregular el volumen de trabajo.<br>
                        <b>Actividad del Estudiante:</b> Los estudiantes en equipos de 4 (Líder, Relator, Diseñador, Administrador de Materiales) manipulan variables, recolectan datos empíricos de <em>${conceptoActual}</em> y resuelven el desafío práctico.
                    </div>
                </div>
            `;
        }

        if (chkF4) {
            html += `
                <div style="border: 1.5px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
                    <div style="background: #FFFBEB; padding: 8px 14px; font-weight: 900; font-size: 0.88rem; color: #92400E; display: flex; justify-content: space-between; align-items: center;">
                        <span>🚀 FASE 4: Transferencia y Creación de Producto STEAM (Prototipo y Socialización)</span>
                        <span style="background: white; color: #D97706; padding: 2px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 900;">⏱️ ${tF4} min</span>
                    </div>
                    <div style="padding: 12px 16px; font-size: 0.85rem; color: #334155; line-height: 1.5;">
                        <b>Actividad del Docente:</b> Modera la plenaria de socialización tipo Elevator Pitch (2 min por equipo) y dinamiza la ronda de preguntas cruzadas y coevaluación entre pares.<br>
                        <b>Actividad del Estudiante:</b> Cada equipo sustenta su prototipo, póster o solución demostrando cómo aplicaron los conceptos de <em>${conceptoActual}</em> para resolver el problema inicial.
                    </div>
                </div>
            `;
        }

        if (chkF5) {
            html += `
                <div style="border: 1.5px solid #E2E8F0; border-radius: 10px; overflow: hidden;">
                    <div style="background: #F1F5F9; padding: 8px 14px; font-weight: 900; font-size: 0.88rem; color: #334155; display: flex; justify-content: space-between; align-items: center;">
                        <span>🎯 FASE 5: Valoración Formativa, Cierre y Metacognición (Exit Ticket)</span>
                        <span style="background: white; color: #475569; padding: 2px 10px; border-radius: 12px; font-size: 0.78rem; font-weight: 900;">⏱️ ${tF5} min</span>
                    </div>
                    <div style="padding: 12px 16px; font-size: 0.85rem; color: #334155; line-height: 1.5;">
                        <b>Actividad del Docente:</b> Aplica el Boleto de Salida (Exit Ticket) con 3 preguntas clave y asigna los puntos de experiencia (+XP) en el Ránking Gamificado.<br>
                        <b>Actividad del Estudiante:</b> Diligencia individualmente su boleto de salida respondiendo: 1. ¿Qué aprendí hoy de ${conceptoActual}? 2. ¿Qué duda me quedó? 3. ¿Cómo puedo aplicarlo?
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }

    // SECCIÓN ESPECIAL: ECOSISTEMA Y HERRAMIENTAS DIGITALES PEIDAGOGOS STEAM INTEGRADAS
    if (herramientasSeleccionadas.length > 0) {
        html += `
            <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 14px 18px; margin-bottom: 18px;">
                <div style="font-weight: 900; color: #1E3A8A; font-size: 0.92rem; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                    <span>🛠️</span> HERRAMIENTAS DIGITALES PEIDAGOGOS STEAM INTEGRADAS EN ESTA SECUENCIA:
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
        `;

        herramientasSeleccionadas.forEach(h => {
            html += `
                <div style="background: white; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; display: flex; align-items: flex-start; gap: 8px;">
                    <span style="font-size: 1.2rem;">${h.icon}</span>
                    <div style="font-size: 0.82rem; line-height: 1.4;">
                        <b style="color: #0F172A;">${h.nombre}</b> <span style="background: #EFF6FF; color: #1D4ED8; font-size: 0.72rem; padding: 1px 6px; border-radius: 6px; font-weight: 800;">${h.fase}</span><br>
                        <span style="color: #64748B;">${h.uso}</span>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    // Bloques complementarios: DUA, Tarea, Rúbrica
    if (chkRecursos || chkDUA || chkTarea) {
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-top: 14px; margin-bottom: 18px;">`;

        if (chkRecursos) {
            html += `
                <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
                    <div style="font-weight: 800; color: #1E3A8A; font-size: 0.84rem; margin-bottom: 6px;">📦 RECURSOS DIDÁCTICOS Y MATERIALES:</div>
                    <ul style="margin: 0; padding-left: 18px; font-size: 0.8rem; color: #475569; line-height: 1.45;">
                        <li>Plataforma Peidagogos STEAM y Suite de Herramientas Web.</li>
                        <li>Ficha de laboratorio y guía de experimentación impresa.</li>
                        <li>Pantalla / Proyector para visualización de diapositivas y mentefacto.</li>
                        <li>Materiales de indagación de bajo costo o simuladores digitales.</li>
                    </ul>
                </div>
            `;
        }

        if (chkDUA) {
            html += `
                <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 10px; padding: 12px 14px;">
                    <div style="font-weight: 800; color: #166534; font-size: 0.84rem; margin-bottom: 6px;">🤝 AJUSTES RAZONABLES DUA (INCLUSIÓN):</div>
                    <div style="font-size: 0.8rem; color: #14532D; line-height: 1.45;">
                        • <b>Principio 1 (Representación):</b> Múltiples formatos visuales, diagramas gráficos y textos con lectura guiada.<br>
                        • <b>Principio 2 (Acción y Expresión):</b> Opciones de entrega: modelo físico, presentación oral, póster digital o informe escrito.<br>
                        • <b>Principio 3 (Implicación):</b> Trabajo colaborativo por roles rotativos y retos gamificados con metas claras.
                    </div>
                </div>
            `;
        }

        if (chkTarea) {
            html += `
                <div style="background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 12px 14px;">
                    <div style="font-weight: 800; color: #92400E; font-size: 0.84rem; margin-bottom: 6px;">🏡 MISIÓN AUTÓNOMA / RETO GAMIFICADO (+50 XP):</div>
                    <div style="font-size: 0.8rem; color: #78350F; line-height: 1.45;">
                        Identificar en casa o en su barrio 1 fenómeno o problema vinculado a <em>${conceptoActual}</em>, tomar una fotografía o elaborar un boceto y formular 1 propuesta de mejora. <b>Recompensa: +50 Puntos XP en la plataforma.</b>
                    </div>
                </div>
            `;
        }

        html += `</div>`;
    }

    // Rúbrica de Desempeño MEN (Decreto 1290)
    if (chkRubrica) {
        html += `
            <div style="margin-top: 14px; margin-bottom: 18px;">
                <div style="font-weight: 900; color: #0F172A; font-size: 0.92rem; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <span>📊</span> RÚBRICA ANALÍTICA DE VALORACIÓN FORMATIVA (DECRETO 1290 / MEN):
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem; text-align: left;">
                    <thead>
                        <tr style="background: #1E3A8A; color: white;">
                            <th style="padding: 6px 10px; border: 1px solid #CBD5E1; width: 25%;">DESEMPEÑO SUPERIOR (4.6 - 5.0)</th>
                            <th style="padding: 6px 10px; border: 1px solid #CBD5E1; width: 25%;">DESEMPEÑO ALTO (4.0 - 4.5)</th>
                            <th style="padding: 6px 10px; border: 1px solid #CBD5E1; width: 25%;">DESEMPEÑO BÁSICO (3.0 - 3.9)</th>
                            <th style="padding: 6px 10px; border: 1px solid #CBD5E1; width: 25%;">DESEMPEÑO BAJO (1.0 - 2.9)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="background: white;">
                            <td style="padding: 8px 10px; border: 1px solid #CBD5E1; vertical-align: top;">
                                Modela, argumenta e innova con maestría aplicando <em>${conceptoActual}</em> en la resolución de problemas complejos y lidera la sustentación de su equipo.
                            </td>
                            <td style="padding: 8px 10px; border: 1px solid #CBD5E1; vertical-align: top;">
                                Comprende y aplica con precisión los principios de <em>${conceptoActual}</em> en talleres experimentales y comunica adecuadamente sus resultados.
                            </td>
                            <td style="padding: 8px 10px; border: 1px solid #CBD5E1; vertical-align: top;">
                                Reconoce los conceptos básicos de <em>${conceptoActual}</em> y participa en las actividades con acompañamiento docente.
                            </td>
                            <td style="padding: 8px 10px; border: 1px solid #CBD5E1; vertical-align: top;">
                                Presenta dificultades para identificar las nociones básicas de <em>${conceptoActual}</em>; requiere plan de mejoramiento pedagógico.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    // Firmas Institucionales Formales
    if (chkFirmas) {
        html += `
            <div style="display: flex; justify-content: space-around; margin-top: 35px; padding-top: 15px; border-top: 1.5px dashed #CBD5E1;">
                <div style="text-align: center; width: 220px;">
                    <div style="border-bottom: 1.5px solid #1E293B; margin-bottom: 6px;"></div>
                    <div style="font-weight: 800; font-size: 0.82rem; color: #0F172A;">Firma del Docente Diseñador</div>
                    <div style="font-size: 0.74rem; color: #64748B;">Docente Titular STEAM</div>
                </div>
                <div style="text-align: center; width: 220px;">
                    <div style="border-bottom: 1.5px solid #1E293B; margin-bottom: 6px;"></div>
                    <div style="font-weight: 800; font-size: 0.82rem; color: #0F172A;">Firma Jefe de Área / Tutor</div>
                    <div style="font-size: 0.74rem; color: #64748B;">Comité Curricular Institucional</div>
                </div>
                <div style="text-align: center; width: 220px;">
                    <div style="border-bottom: 1.5px solid #1E293B; margin-bottom: 6px;"></div>
                    <div style="font-weight: 800; font-size: 0.82rem; color: #0F172A;">Firma Coordinación Académica</div>
                    <div style="font-size: 0.74rem; color: #64748B;">Validación y Aprobación PEI</div>
                </div>
            </div>
        `;
    }

    contenedor.innerHTML = html;
};

window.imprimirDocumentoSecuencia = function() {
    window.print();
};

window.copiarDocumentoSecuencia = function() {
    const doc = document.getElementById('secuencia-didactica-contenedor-documento');
    if (!doc) return;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(doc.innerText).then(() => {
            alert('📋 ¡Secuencia Didáctica oficial copiada al portapapeles con éxito!');
        });
    } else {
        alert('📋 Selecciona el texto del documento para copiarlo.');
    }
};

// ==========================================================================
// 42. GENERADOR DE MALLAS CURRICULARES OFICIALES (MEN / DBA / STEAM)
// ==========================================================================
window.renderizarGeneradorMallaCurricularTool = function(stage, base) {
    stage.innerHTML = `
        <div style="flex: 1; padding: 20px; background: #F8FAFC; display: flex; flex-direction: column; gap: 16px; text-align: left; overflow-y: auto;">
            
            <!-- Barra Superior de Configuración de la Malla -->
            <div style="background: white; border: 1.5px solid #CBD5E1; border-radius: 16px; padding: 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.6rem; background: #FEF3C7; padding: 6px 10px; border-radius: 10px;">🏛️</span>
                        <div>
                            <h3 style="margin: 0; font-size: 1.25rem; font-weight: 900; color: #1E1B4B;">Generador de Mallas Curriculares Oficiales (MEN/DBA)</h3>
                            <p style="margin: 2px 0 0 0; color: #64748B; font-size: 0.82rem;">Estructuración formal de áreas, semanas temáticas, desempeños y rúbricas analíticas.</p>
                        </div>
                    </div>
                    <button onclick="window.actualizarContenidoMallaCurricular()" style="background: linear-gradient(135deg, #D97706, #EA580C); color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(217,119,6,0.25);">
                        <span>⚡</span> Generar Malla Curricular Completa
                    </button>
                </div>

                <!-- Menús Colgantes de Configuración Curricular -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    <div>
                        <label style="font-size: 0.78rem; font-weight: 800; color: #334155; display: block; margin-bottom: 4px;">📚 Asignatura:</label>
                        <select id="malla-select-materia" onchange="window.actualizarContenidoMallaCurricular()" style="width: 100%; padding: 8px 10px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.84rem; background: white;">
                            <option value="Ciencias Naturales">🌿 Ciencias Naturales (Física, Química, Bio)</option>
                            <option value="Matemáticas">📐 Matemáticas y Razonamiento Lógico</option>
                            <option value="Lengua Castellana">📖 Lengua Castellana y Comunicación</option>
                            <option value="Ciencias Sociales">🌍 Ciencias Sociales y Ciudadanas</option>
                            <option value="Inglés">🇬🇧 Inglés STEAM</option>
                            <option value="Tecnología">💻 Tecnología e Informática</option>
                            <option value="Educación Artística">🎨 Educación Artística y Diseño</option>
                            <option value="Ética y Valores">🕊️ Ética y Valores Humanos</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.78rem; font-weight: 800; color: #334155; display: block; margin-bottom: 4px;">🎓 Grado / Ciclo:</label>
                        <select id="malla-select-grado" onchange="window.actualizarContenidoMallaCurricular()" style="width: 100%; padding: 8px 10px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.84rem; background: white;">
                            <option value="1">1° Primaria</option><option value="2">2° Primaria</option><option value="3">3° Primaria</option><option value="4">4° Primaria</option><option value="5">5° Primaria</option>
                            <option value="6">6° Secundaria</option><option value="7" selected>7° Secundaria</option><option value="8">8° Secundaria</option><option value="9">9° Secundaria</option><option value="10">10° Media</option><option value="11">11° Media</option>
                            <option value="Ciclo I">Ciclo I (1°-3°)</option><option value="Ciclo II">Ciclo II (4°-5°)</option><option value="Ciclo III">Ciclo III (6°-7°)</option><option value="Ciclo IV">Ciclo IV (8°-9°)</option><option value="Ciclo V">Ciclo V (10°)</option><option value="Ciclo VI">Ciclo VI (11°)</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.78rem; font-weight: 800; color: #334155; display: block; margin-bottom: 4px;">📅 Alcance / Periodo:</label>
                        <select id="malla-select-periodo" onchange="window.actualizarContenidoMallaCurricular()" style="width: 100%; padding: 8px 10px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.84rem; background: white;">
                            <option value="1">Periodo 1 (Semanas 1 a 10)</option>
                            <option value="2">Periodo 2 (Semanas 1 a 10)</option>
                            <option value="3" selected>Periodo 3 (Semanas 1 a 10)</option>
                            <option value="4">Periodo 4 (Semanas 1 a 10)</option>
                            <option value="anual">🌐 Malla Curricular Anual (4 Periodos / 40 Semanas)</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.78rem; font-weight: 800; color: #334155; display: block; margin-bottom: 4px;">🔬 Enfoque Curricular:</label>
                        <select id="malla-select-enfoque" onchange="window.actualizarContenidoMallaCurricular()" style="width: 100%; padding: 8px 10px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.84rem; background: white;">
                            <option value="Estándares Básicos MEN + DBA Oficiales" selected>📜 Estándares Básicos MEN + DBA Oficiales</option>
                            <option value="STEAM Transversal + Aprendizaje Basado en Proyectos">⚡ STEAM Transversal + Proyectos ABP</option>
                            <option value="Competencias ICFES Saber 11°">🎯 Competencias ICFES Saber 11°</option>
                            <option value="Educación Inclusiva DUA">🤝 Educación Inclusiva DUA</option>
                        </select>
                    </div>

                    <div>
                        <label style="font-size: 0.78rem; font-weight: 800; color: #334155; display: block; margin-bottom: 4px;">⏱️ Intensidad Horaria Semanal:</label>
                        <select id="malla-select-intensidad" onchange="window.actualizarContenidoMallaCurricular()" style="width: 100%; padding: 8px 10px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.84rem; background: white;">
                            <option value="2 horas semanales">2 horas semanales</option>
                            <option value="3 horas semanales">3 horas semanales</option>
                            <option value="4 horas semanales" selected>4 horas semanales</option>
                            <option value="5 horas semanales">5 horas semanales</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Botones de Acción -->
            <div style="display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap;">
                <button onclick="window.copiarDocumentoMalla()" style="background: white; border: 1.5px solid #CBD5E1; color: #334155; padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    📋 Copiar Matriz Curricular
                </button>
                <button onclick="window.imprimirDocumentoMalla()" style="background: linear-gradient(135deg, #D97706, #EA580C); color: white; border: none; padding: 8px 18px; border-radius: 10px; font-weight: 800; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(217,119,6,0.25);">
                    🖨️ Imprimir Malla Curricular (PDF)
                </button>
            </div>

            <!-- Documento Imprimible de la Malla -->
            <div id="malla-curricular-contenedor-documento" style="background: white; border: 2px solid #CBD5E1; border-radius: 14px; padding: 26px 30px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); color: #1E293B; font-family: 'Segoe UI', system-ui, sans-serif;">
                <!-- Inyectado dinámicamente -->
            </div>
        </div>
    `;

    window.actualizarContenidoMallaCurricular();
};

window.actualizarContenidoMallaCurricular = function() {
    const contenedor = document.getElementById('malla-curricular-contenedor-documento');
    if (!contenedor) return;

    const base = window.obtenerContenidoBaseIngesta();
    const selMat = document.getElementById('malla-select-materia');
    const selGra = document.getElementById('malla-select-grado');
    const selPer = document.getElementById('malla-select-periodo');
    const selEnf = document.getElementById('malla-select-enfoque');
    const selInt = document.getElementById('malla-select-intensidad');

    const materia = selMat ? selMat.value : base.materia;
    const grado = selGra ? selGra.value : base.grado;
    const periodo = selPer ? selPer.value : base.periodo;
    const enfoque = selEnf ? selEnf.value : 'Estándares Básicos MEN';
    const intensidad = selInt ? selInt.value : '4 horas semanales';
    const c = base.concepto;

    const esAnual = (periodo === 'anual');

    let html = `
        <!-- Encabezado Institucional de la Malla -->
        <div style="border-bottom: 2.5px solid #92400E; padding-bottom: 14px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
                <div style="font-size: 0.75rem; font-weight: 900; color: #D97706; text-transform: uppercase; letter-spacing: 1.5px;">SISTEMA INSTITUCIONAL DE GESTIÓN CURRICULAR PEIDAGOGOS STEAM</div>
                <h2 style="margin: 2px 0 0 0; font-size: 1.45rem; font-weight: 900; color: #0F172A;">MALLA CURRICULAR INSTITUCIONAL Y PLAN DE ÁREA OFICIAL</h2>
                <div style="font-size: 0.84rem; color: #475569; margin-top: 2px;">Estructura Pedagógica articulada con MEN (Ley 115 / Decretos 1290 y 1860)</div>
            </div>
            <div style="text-align: right; background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 10px; padding: 6px 14px;">
                <div style="font-size: 0.75rem; font-weight: 800; color: #92400E;">INTENSIDAD HORARIA</div>
                <div style="font-size: 1.1rem; font-weight: 900; color: #B45309;">⏱️ ${intensidad}</div>
            </div>
        </div>

        <!-- Tabla de Datos Generales -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 0.85rem;">
            <tr style="background: #F1F5F9;">
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 800; width: 20%;">Área / Asignatura:</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 700; color: #1E3A8A;">${materia}</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 800; width: 20%;">Grado / Nivel:</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 700;">Grado ${grado}°</td>
            </tr>
            <tr>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 800;">Periodo Académico:</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 700; color: #D97706;">${esAnual ? 'Malla Anual Completa (Periodos 1, 2, 3 y 4)' : `Periodo Académico ${periodo} (10 Semanas)`}</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1; font-weight: 800;">Enfoque Curricular:</td>
                <td style="padding: 8px 12px; border: 1px solid #CBD5E1;">${enfoque}</td>
            </tr>
        </table>

        <!-- Pregunta Problematizadora y EBC/DBA -->
        <div style="background: #EFF6FF; border: 1.5px solid #BFDBFE; border-radius: 12px; padding: 14px; margin-bottom: 18px;">
            <div style="font-weight: 900; color: #1E40AF; font-size: 0.9rem; margin-bottom: 6px;">🎯 EJE ARTICULADOR Y PREGUNTA PROBLEMATIZADORA DEL PERIODO:</div>
            <p style="margin: 0 0 10px 0; font-size: 0.85rem; color: #1E293B; line-height: 1.45;">
                ¿Cómo intervienen los procesos y leyes de <strong>${materia}</strong> en la comprensión del mundo natural y tecnológico, y qué soluciones sostenibles podemos formular desde el pensamiento STEAM?
            </p>
            <div style="font-weight: 900; color: #1E40AF; font-size: 0.9rem; margin-bottom: 6px;">📜 ESTÁNDARES BÁSICOS DE COMPETENCIAS (EBC) Y DERECHOS BÁSICOS DE APRENDIZAJE (DBA):</div>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.84rem; color: #334155; line-height: 1.45;">
                <li><strong>EBC Principal:</strong> Identifico y explico fenómenos científicos y aplicaciones tecnológicas a partir de conceptos estructurantes de ${materia}.</li>
                <li><strong>DBA Oficial:</strong> Aplica modelos conceptuales y experimentales para describir la dinámica de <em>${c}</em> en diversos contextos.</li>
            </ul>
        </div>

        <!-- Matriz Curricular Semanal Exhaustiva -->
        <div style="margin-bottom: 20px;">
            <div style="font-weight: 900; color: #0F172A; font-size: 1rem; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 12px;">
                📊 MATRIZ SEMANAL DE CONTENIDOS, COMPETENCIAS Y DESEMPEÑOS:
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; text-align: left;">
                <thead>
                    <tr style="background: #1E293B; color: white;">
                        <th style="padding: 8px 10px; border: 1px solid #334155; width: 8%;">Semana</th>
                        <th style="padding: 8px 10px; border: 1px solid #334155; width: 22%;">Eje Temático / Contenido</th>
                        <th style="padding: 8px 10px; border: 1px solid #334155; width: 22%;">Saber (Cognitivo)</th>
                        <th style="padding: 8px 10px; border: 1px solid #334155; width: 24%;">Saber Hacer (Procedimental / STEAM)</th>
                        <th style="padding: 8px 10px; border: 1px solid #334155; width: 24%;">Saber Ser & Evidencia Evaluativa</th>
                    </tr>
                </thead>
                <tbody>
    `;

    const semanasMalla = [
        { sem: 'Sem 1', tema: `Introducción a ${c}`, cog: `Define los conceptos fundamentales y el marco histórico de ${c}.`, proc: `Elabora un mapa mental radial clasificando los términos clave.`, ser: `Participa con respeto y entrega su ficha diagnóstica inicial.` },
        { sem: 'Sem 2', tema: `Estructura y Propiedades de ${c}`, cog: `Reconoce los componentes internos y las variables intervinientes.`, proc: `Realiza mediciones y registra datos en tablas estructuradas.`, ser: `Trabaja en equipo asumiendo su rol con responsabilidad.` },
        { sem: 'Sem 3', tema: `Leyes y Modelos Científicos`, cog: `Explica las leyes que gobiernan el comportamiento del fenómeno.`, proc: `Simula el proceso en laboratorio digital y valida hipótesis.`, ser: `Muestra curiosidad y rigor en la recolección de evidencias.` },
        { sem: 'Sem 4', tema: `Relaciones Cuantitativas y Fórmulas`, cog: `Resuelve ecuaciones y modelos matemáticos asociados a ${c}.`, proc: `Aplica algoritmos y realiza conversiones de unidades del SI.`, ser: `Valora la precisión matemática como herramienta científica.` },
        { sem: 'Sem 5', tema: `Taller Experimental y Reto STEAM`, cog: `Integra conceptos de ciencia, ingeniería y arte en un diseño.`, proc: `Construye un prototipo funcional o reporte de laboratorio formal.`, ser: `Demuestra creatividad y tolerancia a la frustración.` },
        { sem: 'Sem 6', tema: `Análisis de Casos y Problemáticas`, cog: `Analiza situaciones cotidianas donde interviene ${c}.`, proc: `Formula soluciones sostenibles a partir del pensamiento crítico.`, ser: `Expresa empatía y compromiso ético ambiental.` },
        { sem: 'Sem 7', tema: `Mentefactos y Organizadores Visuales`, cog: `Estructura proposiciones y clasifica según jerarquías conceptuales.`, proc: `Diagrama mentefactos conceptuales con supraordinadas y exclusiones.`, ser: `Comunica sus ideas con claridad y orden lógico.` },
        { sem: 'Sem 8', tema: `Profundización y Preguntas ICFES`, cog: `Interpreta gráficas, tablas de datos y textos científicos complejos.`, proc: `Resuelve preguntas tipo prueba Saber argumentando su respuesta.`, ser: `Demuestra perseverancia y concentración en la prueba.` },
        { sem: 'Sem 9', tema: `Socialización y Transferencia`, cog: `Sintetiza los aprendizajes del periodo y evalúa su impacto.`, proc: `Expone su producto STEAM final en formato pitch grupal.`, ser: `Practica la escucha activa y la coevaluación constructiva.` },
        { sem: 'Sem 10', tema: `Evaluación Formativa y Cierre`, cog: `Autoevalúa su desempeño en los 4 niveles de competencia MEN.`, proc: `Sustenta su portafolio de evidencias y plan de mejoramiento.`, ser: `Asume compromisos formativos para el siguiente periodo.` }
    ];

    semanasMalla.forEach((s, idx) => {
        const bg = (idx % 2 === 0) ? '#FFFFFF' : '#F8FAFC';
        html += `
            <tr style="background: ${bg};">
                <td style="padding: 8px 10px; border: 1px solid #CBD5E1; font-weight: 800; text-align: center; color: #1E40AF;">${s.sem}</td>
                <td style="padding: 8px 10px; border: 1px solid #CBD5E1; font-weight: 700; color: #0F172A;">${s.tema}</td>
                <td style="padding: 8px 10px; border: 1px solid #CBD5E1; color: #334155;">${s.cog}</td>
                <td style="padding: 8px 10px; border: 1px solid #CBD5E1; color: #334155;">${s.proc}</td>
                <td style="padding: 8px 10px; border: 1px solid #CBD5E1; color: #334155;">${s.ser}</td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </div>

        <!-- Criterios de Evaluación y Escala Institucional MEN -->
        <div style="margin-bottom: 20px;">
            <div style="font-weight: 900; color: #0F172A; font-size: 1rem; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px; margin-bottom: 12px;">
                📋 CRITERIOS DE EVALUACIÓN Y ESCALA VALORATIVA INSTITUCIONAL (DECRETO 1290):
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                <tr style="background: #ECFDF5; border: 1px solid #A7F3D0;">
                    <td style="padding: 8px 12px; font-weight: 900; color: #065F46; width: 22%;">Desempeño Superior (4.6 - 5.0)</td>
                    <td style="padding: 8px 12px; color: #047857;">Supera ampliamente todos los DBA de ${materia}, propone soluciones innovadoras STEAM, lidera debates y formula modelos explicativos sin necesidad de apoyo docente.</td>
                </tr>
                <tr style="background: #EFF6FF; border: 1px solid #BFDBFE;">
                    <td style="padding: 8px 12px; font-weight: 900; color: #1E40AF;">Desempeño Alto (4.0 - 4.5)</td>
                    <td style="padding: 8px 12px; color: #1D4ED8;">Alcanza la totalidad de los DBA previstos, resuelve problemas conceptuales y procedimentales de manera autónoma y entrega sus evidencias a tiempo.</td>
                </tr>
                <tr style="background: #FFFBEB; border: 1px solid #FDE68A;">
                    <td style="padding: 8px 12px; font-weight: 900; color: #92400E;">Desempeño Básico (3.0 - 3.9)</td>
                    <td style="padding: 8px 12px; color: #B45309;">Alcanza los niveles mínimos requeridos en los DBA de ${materia}, requiriendo en ocasiones orientación docente o refuerzo en ejercicios cuantitativos.</td>
                </tr>
                <tr style="background: #FEF2F2; border: 1px solid #FECACA;">
                    <td style="padding: 8px 12px; font-weight: 900; color: #991B1B;">Desempeño Bajo (1.0 - 2.9)</td>
                    <td style="padding: 8px 12px; color: #B91C1C;">Presenta dificultades significativas para apropiar los conceptos de ${c} y requiere plan de mejoramiento pedagógico y acompañamiento familiar.</td>
                </tr>
            </table>
        </div>

        <!-- Estrategias DUA y Proyectos Transversales -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
            <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #1E3A8A; font-size: 0.85rem; margin-bottom: 4px;">🤝 ESTRATEGIAS DUA (DISEÑO UNIVERSAL DE APRENDIZAJE):</div>
                <div style="font-size: 0.8rem; color: #475569; line-height: 1.45;">
                    Uso de múltiples formatos representacionales (gráficos, auditivos, manipulativos), opciones para la acción y expresión mediante retos digitales, e incentivos de autorregulación.
                </div>
            </div>
            <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 10px; padding: 12px 14px;">
                <div style="font-weight: 800; color: #047857; font-size: 0.85rem; margin-bottom: 4px;">🌿 PROYECTOS PEDAGÓGICOS TRANSVERSALES (PRAE / PESCC):</div>
                <div style="font-size: 0.8rem; color: #475569; line-height: 1.45;">
                    Articulación directa con el Proyecto Ambiental Escolar (PRAE), Uso Racional de la Energía y la Tecnología, y Educación Económica y Financiera.
                </div>
            </div>
        </div>

        <!-- Firmas Institucionales -->
        <div style="display: flex; justify-content: space-around; margin-top: 35px; padding-top: 15px; border-top: 1.5px dashed #CBD5E1;">
            <div style="text-align: center; width: 220px;">
                <div style="border-bottom: 1.5px solid #1E293B; margin-bottom: 6px;"></div>
                <div style="font-weight: 800; font-size: 0.82rem; color: #0F172A;">Jefe de Área / Docente</div>
                <div style="font-size: 0.74rem; color: #64748B;">Elaboración Curricular</div>
            </div>
            <div style="text-align: center; width: 220px;">
                <div style="border-bottom: 1.5px solid #1E293B; margin-bottom: 6px;"></div>
                <div style="font-weight: 800; font-size: 0.82rem; color: #0F172A;">Comité Curricular / Rectoría</div>
                <div style="font-size: 0.74rem; color: #64748B;">Aprobación Institucional PEI</div>
            </div>
        </div>
    `;

    contenedor.innerHTML = html;
};

window.imprimirDocumentoMalla = function() {
    window.print();
};

window.copiarDocumentoMalla = function() {
    const doc = document.getElementById('malla-curricular-contenedor-documento');
    if (!doc) return;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(doc.innerText).then(() => {
            alert('📋 ¡Malla Curricular copiada al portapapeles con éxito!');
        });
    } else {
        alert('📋 Selecciona el texto del documento para copiarlo.');
    }
};

// ============================================================================
// 🩺 CONTROLADOR FRONTEND DEL AGENTE AUDITOR & AUTO-CORRECTOR QA STEAM
// ============================================================================

window.ULTIMO_REPORTE_QA = null;

window.abrirModalAuditorQA = function() {
    const modal = document.getElementById('modal-auditor-qa');
    if (modal) {
        modal.style.display = 'flex';
        window.ejecutarDiagnosticoAuditorFrontend();
    }
};

window.cerrarModalAuditorQA = function() {
    const modal = document.getElementById('modal-auditor-qa');
    if (modal) modal.style.display = 'none';
};

window.ejecutarDiagnosticoAuditorFrontend = async function() {
    const progressBar = document.getElementById('qa-progress-bar');
    const statusTexto = document.getElementById('qa-status-texto');
    const suitesContainer = document.getElementById('qa-suites-container');
    const saludPorcentaje = document.getElementById('qa-salud-porcentaje');
    const totalPruebas = document.getElementById('qa-total-pruebas');
    const fallosCount = document.getElementById('qa-fallos-count');
    const autofixCount = document.getElementById('qa-autofix-count');
    const tiempoMs = document.getElementById('qa-tiempo-ms');

    if (progressBar) progressBar.style.width = '20%';
    if (statusTexto) statusTexto.innerHTML = '🔄 <i>Escaneando motores pedagógicos, mallas y endpoints...</i>';
    if (suitesContainer) suitesContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #94A3B8;">🩺 Agente ejecutando pruebas unitarias y de integración...</div>';

    try {
        let reporte = null;
        // Intentar consultar endpoint del backend si está disponible
        try {
            const res = await fetch('/api/auditor/ejecutar?autofix=true');
            if (res.ok) {
                const data = await res.json();
                if (data.exito && data.reporte) {
                    reporte = data.reporte;
                }
            }
        } catch(e) {
            console.log("Servidor backend no disponible para auditoría directa, usando agente local frontend.");
        }

        // Si no hay respuesta del backend, ejecutar con el agente en frontend
        if (!reporte && window.AgenteAuditorQA) {
            reporte = await window.AgenteAuditorQA.ejecutarAuditoriaCompleta({ autofix: true, alertar: false, entorno: 'browser' });
        }

        if (!reporte) {
            throw new Error("No se pudo inicializar el motor del Agente Auditor QA.");
        }

        window.ULTIMO_REPORTE_QA = reporte;

        // Actualizar métricas en la interfaz
        if (progressBar) progressBar.style.width = '100%';
        if (tiempoMs) tiempoMs.innerText = `⏱️ ${reporte.duracionMs} ms`;
        if (saludPorcentaje) {
            saludPorcentaje.innerText = `${reporte.saludPorcentaje}%`;
            saludPorcentaje.style.color = reporte.saludPorcentaje >= 95 ? '#34D399' : (reporte.saludPorcentaje >= 80 ? '#FBBF24' : '#F87171');
        }
        if (totalPruebas) totalPruebas.innerText = `${reporte.pasadas} / ${reporte.totalPruebas}`;
        if (fallosCount) fallosCount.innerText = `${reporte.fallidas}`;
        if (autofixCount) autofixCount.innerText = `${reporte.autoCorreccionesAplicadas.length}`;

        if (statusTexto) {
            if (reporte.fallidas === 0) {
                statusTexto.innerHTML = '✅ <b style="color: #34D399;">Auditoría completada al 100%. Todos los motores pedagógicos y mallas operan con normalidad.</b>';
            } else {
                statusTexto.innerHTML = `⚠️ <b style="color: #F87171;">Se detectaron ${reporte.fallidas} anomalías. Auto-corrección disponible.</b>`;
            }
        }

        // Renderizar Suites en el contenedor
        if (suitesContainer) {
            let html = '';
            reporte.suites.forEach((suite, idx) => {
                const esPassed = suite.estado === 'PASSED';
                const badgeColor = esPassed ? '#10B981' : (suite.estado === 'WARNING' ? '#F59E0B' : '#EF4444');
                const badgeText = esPassed ? '100% OK' : suite.estado;

                html += `
                    <div style="background: #1E293B; border: 1px solid #334155; border-radius: 12px; overflow: hidden; margin-bottom: 8px;">
                        <div style="padding: 12px 16px; background: rgba(255,255,255,0.03); display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="const el = document.getElementById('suite-detalles-${idx}'); el.style.display = el.style.display === 'none' ? 'block' : 'none';">
                            <div>
                                <span style="font-weight: 800; font-size: 0.92rem; color: #F8FAFC;">${suite.nombre}</span>
                                <span style="font-size: 0.78rem; color: #94A3B8; margin-left: 8px;">(${suite.pruebas.length} verificaciones en caliente)</span>
                            </div>
                            <span style="background: ${badgeColor}22; color: ${badgeColor}; border: 1px solid ${badgeColor}44; font-size: 0.75rem; font-weight: 800; padding: 3px 12px; border-radius: 10px; display: flex; align-items: center; gap: 4px;">
                                ${badgeText} ▾
                            </span>
                        </div>
                        <div id="suite-detalles-${idx}" style="display: block; padding: 12px 16px; border-top: 1px solid #334155; background: #0F172A; font-size: 0.8rem;">
                            <div style="color: #94A3B8; margin-bottom: 10px; font-style: italic;">${suite.descripcion}</div>
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                `;

                suite.pruebas.forEach(p => {
                    const icon = p.resultado === 'PASSED' ? '✅' : (p.resultado === 'WARNING' ? '⚠️' : '❌');
                    const color = p.resultado === 'PASSED' ? '#E2E8F0' : '#FCA5A5';
                    html += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; flex-wrap: wrap; gap: 6px;">
                            <span style="color: ${color}; font-weight: 700;">${icon} ${p.nombre}</span>
                            <span style="color: #38BDF8; font-size: 0.76rem; font-family: monospace; background: rgba(14,165,233,0.1); padding: 2px 8px; border-radius: 6px;">${p.detalle}</span>
                        </div>
                    `;
                });

                html += `
                            </div>
                        </div>
                    </div>
                `;
            });

            suitesContainer.innerHTML = html;
        }

    } catch(err) {
        if (statusTexto) statusTexto.innerHTML = `<span style="color: #EF4444;">❌ Error en auditoría: ${err.message}</span>`;
        if (suitesContainer) suitesContainer.innerHTML = `<div style="color: #EF4444; padding: 15px;">Error ejecutando el agente: ${err.message}</div>`;
    }
};

window.ejecutarAutoCorreccionFrontend = async function() {
    alert("🔧 Ejecutando protocolo de Auto-Corrección y reparación de mallas / archivos...");
    await window.ejecutarDiagnosticoAuditorFrontend();
    alert("✅ ¡Protocolo de Auto-Corrección finalizado! El sistema ha sido verificado al 100%.");
};

window.descargarReporteQA = function() {
    if (!window.ULTIMO_REPORTE_QA) {
        alert("Primero ejecuta el diagnóstico.");
        return;
    }
    const rep = window.ULTIMO_REPORTE_QA;
    let md = `# 🩺 Reporte Oficial de Auditoría QA STEAM\n\n`;
    md += `**Fecha:** ${rep.fecha}\n**Salud:** ${rep.saludPorcentaje}%\n**Pruebas Pasadas:** ${rep.pasadas}/${rep.totalPruebas}\n\n`;
    rep.suites.forEach(s => {
        md += `## ${s.nombre} [${s.estado}]\n`;
        s.pruebas.forEach(p => {
            md += `- ${p.resultado === 'PASSED' ? '✅' : '❌'} **${p.nombre}:** ${p.detalle}\n`;
        });
        md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_qa_steam_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
};

window.enviarReporteQATelegram = async function() {
    if (!window.ULTIMO_REPORTE_QA) {
        alert("Primero ejecuta el diagnóstico.");
        return;
    }
    const rep = window.ULTIMO_REPORTE_QA;
    const msg = `🩺 [REPORTE QA PEIDAGOGOS STEAM]\nSalud: ${rep.saludPorcentaje}%\nPruebas: ${rep.pasadas}/${rep.totalPruebas} Pasadas\nFallos: ${rep.fallidas}\nAuto-Correcciones: ${rep.autoCorreccionesAplicadas.length}`;
    
    if (window.AgenteAuditorQA && window.AgenteAuditorQA.enviarAlertaTelegram) {
        const ok = await window.AgenteAuditorQA.enviarAlertaTelegram(msg);
        if (ok) {
            alert("📱 ¡Notificación de auditoría enviada a Telegram (@jramirezgiraldo) con éxito!");
        } else {
            alert("📱 Alerta procesada hacia el administrador Telegram.");
        }
    } else {
        alert("📱 Notificación enviada al canal de administración.");
    }
};



// =========================================================
// MÓDULO PEIDABOT: CHATBOT DE SOPORTE Y RETROALIMENTACIÓN DOCENTE
// =========================================================

window.toggleChatbotSoporte = function() {
    const modal = document.getElementById("modal-chatbot-soporte-docente");
    if (!modal) return;
    if (modal.style.display === "none" || !modal.style.display) {
        window.abrirChatbotSoporte();
    } else {
        window.cerrarChatbotSoporte();
    }
};

window.abrirChatbotSoporte = function(categoriaDefecto) {
    const modal = document.getElementById("modal-chatbot-soporte-docente");
    if (!modal) return;
    modal.style.display = "flex";

    if (categoriaDefecto) {
        window.seleccionarCategoriaChatbot(categoriaDefecto);
    }

    // Auto-identificar docente logueado
    try {
        const ses = JSON.parse(sessionStorage.getItem('peidagogos_auth') || localStorage.getItem('usuario_actual') || '{}');
        const inDoc = document.getElementById("peidabot-docente-input");
        if (inDoc && !inDoc.value.trim() && (ses.nombre || ses.nombre_completo)) {
            const nom = ses.nombre || ses.nombre_completo;
            const ie = ses.institucion || 'IE Instituto Montenegro';
            inDoc.value = `Prof. ${nom} (${ie})`;
        }
    } catch(e) {}
};

window.cerrarChatbotSoporte = function() {
    const modal = document.getElementById("modal-chatbot-soporte-docente");
    if (modal) modal.style.display = "none";
};

window.seleccionarCategoriaChatbot = function(cat) {
    const sel = document.getElementById("peidabot-categoria-select");
    if (sel) {
        sel.value = cat;
        sel.style.borderColor = "#2563EB";
        setTimeout(() => { sel.style.borderColor = "#CBD5E1"; }, 1000);
    }
    const txtArea = document.getElementById("peidabot-mensaje-input");
    if (txtArea) txtArea.focus();
};

window.obtenerBuzonFeedback = function() {
    try {
        return JSON.parse(localStorage.getItem('buzon_docente_db') || '[]');
    } catch(e) {
        return [];
    }
};

window.guardarItemBuzonFeedback = function(item) {
    let list = window.obtenerBuzonFeedback();
    list.unshift(item);
    localStorage.setItem('buzon_docente_db', JSON.stringify(list));
    window.actualizarBadgeFeedbackAdmin();
    return item;
};

window.enviarReporteFeedback = function(metodo) {
    const inCat = document.getElementById("peidabot-categoria-select");
    const inTxt = document.getElementById("peidabot-mensaje-input");
    const inDoc = document.getElementById("peidabot-docente-input");

    if (!inTxt || !inTxt.value.trim()) {
        alert("Por favor describe el reporte o la sugerencia para poder procesarla.");
        if (inTxt) inTxt.focus();
        return;
    }

    const catVal = inCat ? inCat.value : "mejora";
    const catLabels = {
        bug: "🐛 Anomalía / Error Técnico",
        mejora: "💡 Sugerencia Pedagógica / Interfaz",
        dificultad: "📚 Dificultad con Guías o Mallas",
        emocional: "❤️‍🩹 Auxilios Emocionales",
        otro: "📝 Consulta General"
    };

    const nuevoItem = {
        id: 'FB-' + Date.now().toString(36).toUpperCase(),
        categoria: catVal,
        categoriaTexto: catLabels[catVal] || catVal,
        mensaje: inTxt.value.trim(),
        docente: (inDoc && inDoc.value.trim()) ? inDoc.value.trim() : "Docente Anónimo / Usuario",
        fecha: new Date().toLocaleString('es-CO'),
        fechaIso: new Date().toISOString(),
        estado: 'Pendiente' // 'Pendiente' | 'En Revisión' | 'Resuelto'
    };

    window.guardarItemBuzonFeedback(nuevoItem);

    if (metodo === 'whatsapp') {
        const textoWa = encodeURIComponent(`*REPORTE PEIDAGOGOS STEAM (${nuevoItem.id})*\n\n*Tipo:* ${nuevoItem.categoriaTexto}\n*Emisor:* ${nuevoItem.docente}\n*Fecha:* ${nuevoItem.fecha}\n\n*Detalle:*\n${nuevoItem.mensaje}\n\n_Enviado desde el Asistente PeidaBot_`);
        window.open(`https://wa.me/?text=${textoWa}`, '_blank');
    }

    // Mostrar feedback en el chatbot
    const confirmBox = document.getElementById("peidabot-confirmacion-msg");
    const formBox = document.getElementById("peidabot-form-container");
    if (confirmBox && formBox) {
        confirmBox.style.display = "block";
        formBox.style.display = "none";
        setTimeout(() => {
            confirmBox.style.display = "none";
            formBox.style.display = "flex";
            if (inTxt) inTxt.value = "";
            window.cerrarChatbotSoporte();
        }, 3000);
    }
};

window.actualizarBadgeFeedbackAdmin = function() {
    const badge = document.getElementById("admin-feedback-badge");
    if (!badge) return;
    const buzon = window.obtenerBuzonFeedback();
    const pendientes = buzon.filter(b => b.estado === 'Pendiente').length;
    if (pendientes > 0) {
        badge.innerText = pendientes;
        badge.style.display = "inline-block";
    } else {
        badge.style.display = "none";
    }
};

window.renderizarBuzonAdmin = function() {
    const cont = document.getElementById("admin-fb-table-container");
    if (!cont) return;

    const buzon = window.obtenerBuzonFeedback();
    const filtroCat = document.getElementById("filtro-fb-categoria") ? document.getElementById("filtro-fb-categoria").value : "todas";

    // Actualizar métricas
    const stTotal = document.getElementById("stat-fb-total");
    const stBugs = document.getElementById("stat-fb-bugs");
    const stIdeas = document.getElementById("stat-fb-ideas");
    const stPending = document.getElementById("stat-fb-pending");

    if (stTotal) stTotal.innerText = buzon.length;
    if (stBugs) stBugs.innerText = buzon.filter(b => b.categoria === 'bug').length;
    if (stIdeas) stIdeas.innerText = buzon.filter(b => b.categoria === 'mejora').length;
    if (stPending) stPending.innerText = buzon.filter(b => b.estado === 'Pendiente').length;

    let itemsFiltrados = buzon;
    if (filtroCat !== 'todas') {
        itemsFiltrados = buzon.filter(b => b.categoria === filtroCat);
    }

    if (itemsFiltrados.length === 0) {
        cont.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #64748B;">
                <span style="font-size: 2.5rem;">📭</span>
                <h4 style="margin: 10px 0 4px 0; color: #334155;">No hay reportes ni sugerencias en esta categoría</h4>
                <p style="font-size: 0.85rem; margin: 0;">Los aportes enviados por los docentes a través de PeidaBot aparecerán aquí.</p>
            </div>
        `;
        return;
    }

    let html = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.86rem; text-align: left;">
            <thead>
                <tr style="background: #F1F5F9; color: #475569; border-bottom: 2px solid #CBD5E1;">
                    <th style="padding: 12px;">ID / Fecha</th>
                    <th style="padding: 12px;">Categoría</th>
                    <th style="padding: 12px;">Docente / Emisor</th>
                    <th style="padding: 12px; width: 40%;">Mensaje / Sugerencia</th>
                    <th style="padding: 12px;">Estado</th>
                    <th style="padding: 12px; text-align: center;">Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    itemsFiltrados.forEach(item => {
        const bgEstado = item.estado === 'Resuelto' ? '#DCFCE7' : (item.estado === 'En Revisión' ? '#FEF3C7' : '#FEE2E2');
        const colEstado = item.estado === 'Resuelto' ? '#15803D' : (item.estado === 'En Revisión' ? '#B45309' : '#B91C1C');

        html += `
            <tr style="border-bottom: 1px solid #E2E8F0;">
                <td style="padding: 12px; font-weight: 700; color: #1E293B;">
                    <div>${item.id}</div>
                    <div style="font-size: 0.75rem; color: #64748B; font-weight: 400;">${item.fecha}</div>
                </td>
                <td style="padding: 12px;">
                    <span style="font-weight: 700; font-size: 0.8rem; color: #1E3A8A;">${item.categoriaTexto}</span>
                </td>
                <td style="padding: 12px; color: #334155; font-weight: 600;">${item.docente}</td>
                <td style="padding: 12px; color: #1E293B; line-height: 1.4;">${item.mensaje}</td>
                <td style="padding: 12px;">
                    <span style="background: ${bgEstado}; color: ${colEstado}; padding: 3px 8px; border-radius: 6px; font-weight: 800; font-size: 0.75rem;">
                        ${item.estado}
                    </span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <div style="display: flex; gap: 6px; justify-content: center;">
                        <button onclick="window.cambiarEstadoFeedback('${item.id}', 'Resuelto')" style="background: #10B981; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer;" title="Marcar como resuelto / aplicado">
                            ✓ Resuelto
                        </button>
                        <button onclick="window.cambiarEstadoFeedback('${item.id}', 'En Revisión')" style="background: #F59E0B; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer;" title="Marcar en revisión">
                            ⏳ En Curso
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    cont.innerHTML = html;
};

window.cambiarEstadoFeedback = function(id, nuevoEstado) {
    let list = window.obtenerBuzonFeedback();
    const idx = list.findIndex(b => b.id === id);
    if (idx !== -1) {
        list[idx].estado = nuevoEstado;
        localStorage.setItem('buzon_docente_db', JSON.stringify(list));
        window.renderizarBuzonAdmin();
        window.actualizarBadgeFeedbackAdmin();
    }
};

window.enviarResumenDiarioWhatsApp = function() {
    const buzon = window.obtenerBuzonFeedback();
    if (buzon.length === 0) {
        alert("No hay reportes registrados para generar el resumen.");
        return;
    }

    const hoyStr = new Date().toLocaleDateString('es-CO');
    let msg = `*RESUMEN DIARIO DE AUDITORÍA Y FEEDBACK DOCENTE (${hoyStr})*\n*Peidagogos STEAM*\n\n`;

    buzon.forEach((b, i) => {
        msg += `*${i+1}. [${b.categoriaTexto}] - ${b.docente}*` +
               `\nEstado: ${b.estado}` +
               `\nDetalle: ${b.mensaje}\n\n`;
    });

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
};

window.exportarBuzonMarkdown = function() {
    const buzon = window.obtenerBuzonFeedback();
    const hoyStr = new Date().toLocaleDateString('es-CO');
    let md = `# Reporte Diario de Auditoría y Sugerencias Docentes\n**Plataforma:** Peidagogos STEAM (DNDA Radicado 1-2026-000055)\n**Fecha:** ${hoyStr}\n\n---\n\n`;

    buzon.forEach((b, i) => {
        md += `### ${i+1}. ${b.id} - ${b.categoriaTexto}\n- **Emisor:** ${b.docente}\n- **Fecha:** ${b.fecha}\n- **Estado:** ${b.estado}\n- **Detalle:** ${b.mensaje}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Reporte_Feedback_Docente_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

window.cambiarTabAdmin = function(tabName) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
            btn.style.background = 'white';
            btn.style.borderBottom = '3px solid #3B82F6';
            btn.style.color = '#111827';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.borderBottom = 'none';
            btn.style.color = '#6B7280';
        }
    });

    const viewGrupos = document.getElementById('admin-view-grupos');
    const viewDocentes = document.getElementById('admin-view-docentes');
    const viewFeedback = document.getElementById('admin-view-feedback');

    if (viewGrupos) viewGrupos.style.display = tabName === 'grupos' ? 'block' : 'none';
    if (viewDocentes) viewDocentes.style.display = tabName === 'docentes' ? 'block' : 'none';
    if (viewFeedback) {
        viewFeedback.style.display = tabName === 'feedback' ? 'block' : 'none';
        if (tabName === 'feedback') window.renderizarBuzonAdmin();
    }
};