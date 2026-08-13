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

        asignaturas.forEach(asig => {
            const card = document.createElement("div");
            card.style.cssText = "background: white; border-radius: 16px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.06); transition: transform 0.2s, box-shadow 0.2s; border-top: 5px solid #10B981; display: flex; flex-direction: column; justify-content: space-between; height: 190px;";
            card.onmouseover = () => { card.style.transform = "translateY(-5px)"; card.style.boxShadow = "0 12px 20px rgba(0,0,0,0.12)"; };
            card.onmouseout = () => { card.style.transform = "none"; card.style.boxShadow = "0 4px 15px rgba(0,0,0,0.06)"; };

            card.innerHTML = `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 2.2rem;">🔬</span>
                        <span style="background: #ECFDF5; color: #047857; font-weight: 800; font-size: 0.8rem; padding: 3px 10px; border-radius: 12px; border: 1px solid #A7F3D0;">Activa</span>
                    </div>
                    <h3 style="margin: 0; font-size: 1.35rem; color: #111827; font-weight: 800;">${asig}</h3>
                    <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #6B7280;">${gradoCiclo} • STEAM 2026</p>
                </div>
                <button style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 12px; border-radius: 10px; font-weight: 800; cursor: pointer; width: 100%; font-family: Inter, sans-serif; box-shadow: 0 4px 10px rgba(16,185,129,0.25); display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="abrirAsignaturaEstudiante('${asig}', '${gradoCiclo}')">
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

document.addEventListener("DOMContentLoaded", function() {
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
                    if (loginBtn) loginBtn.click();
                }
            });
        }
    });

    // Función de búsqueda flexible y tolerante de estudiante
    function buscarEstudianteFlexible(queryDoc, lista) {
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
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", async function(e) {
            e.preventDefault();
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

            loginBtn.innerText = "Verificando...";
            loginBtn.disabled = true;
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
                
                // Si la API no respondió éxito, verificar si el estudiante está en localStorage o usuarios.json con búsqueda flexible
                if (!data || data.status !== 'success') {
                    let localUsers = JSON.parse(localStorage.getItem('usuarios_db') || '[]');
                    let localEst = buscarEstudianteFlexible(normUser, localUsers);

                    // Si no está aún en localStorage, consultar directamente usuarios.json
                    if (!localEst) {
                        try {
                            const uRes = await fetch('usuarios.json?t=' + Date.now());
                            if (uRes.ok) {
                                const uData = await uRes.json();
                                if (Array.isArray(uData)) {
                                    localEst = buscarEstudianteFlexible(normUser, uData);
                                    if (localEst) {
                                        localUsers.push(localEst);
                                        localStorage.setItem('usuarios_db', JSON.stringify(localUsers));
                                    }
                                }
                            }
                        } catch(e) {}
                    }

                    if (localEst) {
                        data = {
                            status: 'success',
                            usuario: localEst.documento || rawUser,
                            nombre: `${localEst.nombre || ''} ${localEst.apellidos || ''}`.trim() || rawUser,
                            rol: (localEst.institucion === 'Validacion' || String(localEst.grupo || '').toLowerCase().includes('ciclo') || String(localEst.grado || '').toLowerCase().includes('ciclo')) ? 'validacion' : 'estudiante',
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
                    usuario_actual = data.usuario; // Guardar ID del usuario actual

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
                        cargarDatosAdmin();
                    } else if (data.rol === 'docente') {
                        if (typeof mostrarVista === 'function') mostrarVista('docente-dashboard-container');
                        else if (docenteDashboardView) docenteDashboardView.style.display = "block";
                        const dHeader = document.getElementById("docente-nombre-header");
                        if (dHeader) dHeader.innerText = data.nombre;
                        cargarEstudiantesDocente(data.usuario);
                    } else if (data.rol === 'homeschool_tutor') {
                        if (typeof mostrarVista === 'function') mostrarVista('tutor-dashboard-container');
                        const tutorView = document.getElementById("tutor-dashboard-container");
                        if (tutorView) tutorView.style.display = "block";
                        const tHeader = document.getElementById("tutor-nombre-header");
                        if (tHeader) tHeader.innerText = data.nombre;
                        cargarEstudiantesTutor(data.usuario);
                    } else { // Estudiante regular o Validación
                        window.inicializarPanelEstudiante(data);
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
                loginBtn.innerText = "Iniciar Sesión";
                loginBtn.disabled = false;
            }
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

}); // Fin DOMContentLoaded

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
        const monto = (curUser.rol === 'validacion' || curUser.institucion === 'Validacion') ? 60000 : 50000;
        const concepto = (curUser.rol === 'validacion' || curUser.institucion === 'Validacion') 
            ? 'Suscripción Completa Validación' 
            : 'Suscripción Completa Home School';
        
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
                <button onclick="abrirPasarelaPago({ concepto: 'Matrícula Oficial y Solución de Guías', documento: '${doc}', monto: 50000, rol: '${user ? user.rol : 'estudiante'}', callback: () => location.reload() })" style="background: linear-gradient(135deg, #009EE3, #007EB5); color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(0,158,227,0.35); font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                    <span>💳</span> Pagar Matrícula ($50.000 COP con Mercado Pago)
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

window.validarPermisoResolucionEstudiante = function() {
    const user = window.usuarioEstudianteActual || JSON.parse(localStorage.getItem('usuario_sesion') || '{}');
    const doc = String(user.documento || user.usuario || 'EST').trim();
    const esInstitucional = (user.institucion === 'IE Instituto Montenegro' || user.codigo_institucional === 'ieinstituto2026');
    const estaPagado = (user.pago_realizado === true || user.pago_activo === true || esInstitucional);

    if (!estaPagado) {
        abrirPasarelaPago({
            concepto: 'Matrícula Oficial y Solución de Guías',
            documento: doc,
            monto: 50000,
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
        materias = ["Ciencias Naturales", "Matemáticas", "Lenguaje", "Ciencias Sociales", "Inglés"];
    } else {
        const gNum = parseInt(grado);
        if (gNum >= 1 && gNum <= 5) {
            materias = ["Ciencias Naturales", "Matemáticas", "Lengua Castellana", "Ciencias Sociales", "Inglés", "Educación Artística"];
        } else if (gNum >= 6 && gNum <= 9) {
            materias = ["Ciencias Naturales", "Física", "Química", "Matemáticas", "Lengua Castellana", "Ciencias Sociales", "Inglés", "Educación Artística", "Tecnología"];
        } else if (gNum >= 10 && gNum <= 11) {
            materias = ["Física", "Química", "Matemáticas", "Lengua Castellana", "Filosofía", "Ciencias Sociales", "Inglés", "Turismo y Emprendimiento"];
        } else {
            materias = ["Ciencias Naturales", "Matemáticas", "Lengua Castellana", "Ciencias Sociales", "Inglés"];
        }
    }

    preview.innerHTML = `<strong>Materias asignadas (${materias.length}):</strong><br><span style="color: #1E40AF;">${materias.join(" • ")}</span>`;
    window.materiasTutorSeleccionadas = materias;
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

    const materias = window.materiasTutorSeleccionadas || ["Ciencias Naturales", "Matemáticas", "Lengua Castellana", "Ciencias Sociales", "Inglés"];

    // Abrir pasarela de pago para este estudiante
    abrirPasarelaPago({
        concepto: `Matrícula Home School - Grado ${grado} (${nom} ${ape})`,
        documento: doc,
        monto: 50000,
        rol: 'homeschool_tutor',
        callback: async () => {
            // Registrar estudiante con pago_realizado: true
            const payload = {
                documento: doc,
                tipo_documento: tipoDoc,
                nombre: nom,
                apellidos: ape,
                edad: edad,
                genero: gen,
                grado: grado,
                grupo: `HS-${grado}`,
                institucion: 'HomeSchool',
                asignatura: materias.join(', '),
                materias: materias,
                docente_id: usuario_actual || 'TUTOR-HS',
                pago_realizado: true
            };

            try {
                const res = await fetch("/api/registro-estudiante", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                    alert(`🎉 ¡Matrícula y pago completados con éxito para ${nom} ${ape}!`);
                    // Limpiar formulario
                    document.getElementById("tutor-reg-doc").value = "";
                    document.getElementById("tutor-reg-nom").value = "";
                    document.getElementById("tutor-reg-ape").value = "";
                    document.getElementById("tutor-reg-edad").value = "";
                    document.getElementById("tutor-reg-gen").value = "";
                    document.getElementById("tutor-reg-grado").value = "";
                    document.getElementById("tutor-materias-preview").innerHTML = "Selecciona un grado para ver las materias asignadas.";
                    
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
    } else {
        malla = window.mallaNaturales;
        nombreMateria = "Ciencias Naturales";
        iconoMateria = "🌿";
        colorTema = "#2563EB";
        colorFondo = "#EFF6FF";
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
    const selectGrado = document.getElementById('select-estudiante-malla-grado');
    const container = document.getElementById('estudiante-malla-detalle-container');
    if (!container) return;

    const grado = selectGrado ? selectGrado.value : 'Ciclo VI';
    const materia = window.materiaEstudianteMallaActual || 'Naturales';

    container.innerHTML = window.generarHTMLDetalleMallaDBA(grado, materia, 'estudiante');
};

