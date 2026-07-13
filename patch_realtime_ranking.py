import io
import re

# 1. ACTUALIZAR RANKING.HTML
ranking_html = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Salón de la Fama - Peidagogos STEAM</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background: #F3F4F6; /* Fondo claro */
            color: #111827; /* Texto oscuro */
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .header {
            background: white;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 10;
            border-bottom: 4px solid #3B82F6;
        }
        .title-container {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .logo {
            font-size: 2.5rem;
            font-weight: 900;
            color: #1D4ED8;
            letter-spacing: -1px;
        }
        .logo span {
            color: #10B981;
        }
        .trophy {
            font-size: 3rem;
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        h1 { margin: 0; font-weight: 900; font-size: 2rem; color: #1F2937; }
        h2 { margin: 5px 0 0 0; color: #6B7280; font-weight: 600; font-size: 1.2rem; }
        
        .table-container {
            flex: 1;
            padding: 40px;
            overflow-y: auto;
        }
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 10px;
            max-width: 1200px;
            margin: 0 auto;
        }
        th {
            padding: 15px 25px;
            text-align: left;
            color: #6B7280;
            font-weight: 800;
            font-size: 1.1rem;
            border-bottom: 2px solid #E5E7EB;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        th.center { text-align: center; }
        th.right { text-align: right; }
        
        td {
            padding: 20px 25px;
            background: white;
            font-size: 1.3rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        td.rank { text-align: center; font-weight: 900; border-radius: 12px 0 0 12px; font-size: 1.8rem; color: #9CA3AF; }
        td.name { font-weight: bold; color: #374151; }
        td.group { text-align: center; }
        td.xp { text-align: right; font-weight: 900; color: #10B981; font-size: 1.6rem; border-radius: 0 12px 12px 0; }
        
        tr { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        tr:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        
        .gold td { background: linear-gradient(90deg, #FFFBEB, white); border-top: 1px solid #FDE68A; border-bottom: 1px solid #FDE68A; }
        .gold td.rank { border-left: 6px solid #F59E0B; }
        .gold td.name { color: #D97706; }
        
        .silver td { background: linear-gradient(90deg, #F3F4F6, white); border-top: 1px solid #E5E7EB; border-bottom: 1px solid #E5E7EB; }
        .silver td.rank { border-left: 6px solid #9CA3AF; }
        
        .bronze td { background: linear-gradient(90deg, #FEF3C7, white); border-top: 1px solid #FDE68A; border-bottom: 1px solid #FDE68A; }
        .bronze td.rank { border-left: 6px solid #B45309; }
        .bronze td.name { color: #B45309; }
        
        .badge {
            background: #E0E7FF;
            color: #4338CA;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 1rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Peidagogos<span>STEAM</span></div>
        <div class="title-container">
            <span class="trophy">🏆</span>
            <div style="text-align: right;">
                <h1>SALÓN DE LA FAMA</h1>
                <h2 id="subtitle">Clasificación Global - Periodo 3</h2>
            </div>
        </div>
    </div>
    
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th class="center" style="width: 80px;">Pos</th>
                    <th>Estudiante</th>
                    <th class="center">Grupo</th>
                    <th class="right">Puntos XP (P3)</th>
                </tr>
            </thead>
            <tbody id="ranking-body">
                <tr><td colspan="4" style="text-align: center; padding: 50px;">Cargando clasificaciones... ⏳</td></tr>
            </tbody>
        </table>
    </div>

    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const grupoActual = urlParams.get('grupo');

        if (grupoActual) {
            document.getElementById('subtitle').innerText = "Clasificación del Grupo: " + grupoActual + " (Periodo 3)";
        }

        async function cargarRanking() {
            try {
                const res = await fetch('/api/estudiantes');
                if (!res.ok) return;
                let estudiantes = await res.json();
                
                if (grupoActual) {
                    estudiantes = estudiantes.filter(e => e.grupo === grupoActual);
                }
                
                const estudiantesConXP = estudiantes.map(est => {
                    let xpTotal = 0;
                    // Solo calculamos el Periodo 3
                    const prefix = `prog_${est.documento}_`;
                    const suffix = `_p3`;
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        if (k.startsWith(prefix) && k.endsWith(suffix)) {
                            let maxSemanaUnlocked = parseInt(localStorage.getItem(k));
                            if (!isNaN(maxSemanaUnlocked) && maxSemanaUnlocked > 1) {
                                xpTotal += (maxSemanaUnlocked - 1) * 100;
                            }
                        }
                    }
                    return { ...est, xp: xpTotal };
                });
                
                estudiantesConXP.sort((a, b) => b.xp - a.xp);
                
                const tbody = document.getElementById('ranking-body');
                tbody.innerHTML = '';
                
                if (estudiantesConXP.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 50px; color: #9CA3AF; background: white;">No hay estudiantes registrados en este grupo.</td></tr>';
                    return;
                }
                
                estudiantesConXP.forEach((est, index) => {
                    let medalla = '';
                    let rowClass = '';
                    
                    if (index === 0) { medalla = '🥇'; rowClass = 'gold'; }
                    else if (index === 1) { medalla = '🥈'; rowClass = 'silver'; }
                    else if (index === 2) { medalla = '🥉'; rowClass = 'bronze'; }
                    else { medalla = `${index + 1}`; }
                    
                    const tr = document.createElement('tr');
                    if(rowClass) tr.className = rowClass;
                    
                    tr.innerHTML = `
                        <td class="rank">${medalla}</td>
                        <td class="name">
                            ${est.nombre} ${est.apellidos}
                            <div style="font-size: 0.9rem; color: #9CA3AF; font-weight: normal; margin-top: 4px;">ID: ${est.documento}</div>
                        </td>
                        <td class="group"><span class="badge">${est.grupo || 'N/A'}</span></td>
                        <td class="xp">${est.xp} <span style="font-size: 0.9rem; color: #6B7280;">XP</span></td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (e) {
                console.error(e);
            }
        }

        // Cargar inmediatamente
        cargarRanking();
        
        // Magia en Tiempo Real pura: se dispara al instante si otra pestaña modifica localStorage
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('prog_')) {
                cargarRanking();
            }
        });
    </script>
</body>
</html>
"""
with io.open('ranking.html', 'w', encoding='utf-8') as f:
    f.write(ranking_html)


# 2. BLOQUEAR PERIODOS EN LOGIN.HTML
with io.open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Admin select
old_admin_select = '''                                    <select id="select-planeacion-periodo" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #D1D5DB; font-weight: bold; cursor: pointer;" onchange="actualizarVisualizadorPlaneacion()">
                                        <option value="1">Periodo 1</option>
                                        <option value="2">Periodo 2</option>
                                        <option value="3">Periodo 3</option>
                                        <option value="4">Periodo 4</option>
                                    </select>'''
new_admin_select = '''                                    <select id="select-planeacion-periodo" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #D1D5DB; font-weight: bold; cursor: pointer;" onchange="actualizarVisualizadorPlaneacion()">
                                        <option value="1" disabled>Periodo 1 (Bloqueado)</option>
                                        <option value="2" disabled>Periodo 2 (Bloqueado)</option>
                                        <option value="3" selected>Periodo 3</option>
                                        <option value="4" disabled>Periodo 4 (Bloqueado)</option>
                                    </select>'''
if old_admin_select in html:
    html = html.replace(old_admin_select, new_admin_select)

# Student select
old_student_select = '''                                <select id="student-select-periodo" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #D1D5DB; margin-top: 5px; font-weight: bold; background: white;" onchange="actualizarPlaneacionEstudiante()">
                                    <option value="1">Periodo 1</option>
                                    <option value="2">Periodo 2</option>
                                    <option value="3">Periodo 3</option>
                                    <option value="4">Periodo 4</option>
                                </select>'''
new_student_select = '''                                <select id="student-select-periodo" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #D1D5DB; margin-top: 5px; font-weight: bold; background: white;" onchange="actualizarPlaneacionEstudiante()">
                                    <option value="1" disabled>Periodo 1 (Bloqueado)</option>
                                    <option value="2" disabled>Periodo 2 (Bloqueado)</option>
                                    <option value="3" selected>Periodo 3</option>
                                    <option value="4" disabled>Periodo 4 (Bloqueado)</option>
                                </select>'''
if old_student_select in html:
    html = html.replace(old_student_select, new_student_select)

with io.open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)


# 3. ACTUALIZAR APP.JS
with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Cambiar reset a '3' en estudiante
old_reset_est = '''    document.getElementById("student-select-periodo").value = "1";
    document.getElementById("student-select-semana").value = "1";'''
new_reset_est = '''    document.getElementById("student-select-periodo").value = "3";
    document.getElementById("student-select-semana").value = "1";'''
if old_reset_est in js:
    js = js.replace(old_reset_est, new_reset_est)

# Cambiar reset a '3' en admin
old_reset_adm = '''        document.getElementById('select-planeacion-periodo').value = '1';
        document.getElementById('select-planeacion-semana').value = '1';'''
new_reset_adm = '''        document.getElementById('select-planeacion-periodo').value = '3';
        document.getElementById('select-planeacion-semana').value = '1';'''
if old_reset_adm in js:
    js = js.replace(old_reset_adm, new_reset_adm)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
