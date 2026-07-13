import io

# 1. Crear el nuevo archivo ranking.html
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
            background: #0f172a;
            color: white;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(90deg, #1E3A8A, #3B82F6);
            padding: 30px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
            z-index: 10;
        }
        .title-container {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .trophy {
            font-size: 4rem;
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        h1 { margin: 0; font-weight: 900; font-size: 2.5rem; letter-spacing: 2px; }
        h2 { margin: 5px 0 0 0; color: #93C5FD; font-weight: 600; font-size: 1.5rem; }
        
        .table-container {
            flex: 1;
            padding: 40px;
            overflow-y: auto;
            background: rgba(255, 255, 255, 0.03);
        }
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 15px;
            max-width: 1200px;
            margin: 0 auto;
        }
        th {
            padding: 15px 25px;
            text-align: left;
            color: #9CA3AF;
            font-weight: 800;
            font-size: 1.2rem;
            border-bottom: 2px solid #374151;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        th.center { text-align: center; }
        th.right { text-align: right; }
        
        td {
            padding: 20px 25px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            font-size: 1.4rem;
        }
        td.rank { text-align: center; font-weight: 900; border-radius: 12px 0 0 12px; font-size: 2rem; }
        td.name { font-weight: bold; color: white; }
        td.group { text-align: center; }
        td.xp { text-align: right; font-weight: 900; color: #10B981; font-size: 1.8rem; border-radius: 0 12px 12px 0; }
        
        tr { transition: transform 0.3s ease; }
        tr:hover { transform: scale(1.02); }
        
        .gold td { background: linear-gradient(90deg, rgba(245, 158, 11, 0.2), rgba(255,255,255,0.05)); border-left: 6px solid #F59E0B; }
        .gold td.name { color: #FCD34D; }
        
        .silver td { background: linear-gradient(90deg, rgba(156, 163, 175, 0.2), rgba(255,255,255,0.05)); border-left: 6px solid #9CA3AF; }
        .silver td.name { color: #E5E7EB; }
        
        .bronze td { background: linear-gradient(90deg, rgba(180, 83, 9, 0.2), rgba(255,255,255,0.05)); border-left: 6px solid #B45309; }
        .bronze td.name { color: #FDBA74; }
        
        .badge {
            background: rgba(59, 130, 246, 0.2);
            color: #93C5FD;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 1.1rem;
            border: 1px solid rgba(59, 130, 246, 0.5);
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title-container">
            <span class="trophy">🏆</span>
            <div>
                <h1>SALÓN DE LA FAMA</h1>
                <h2 id="subtitle">Clasificación Global</h2>
            </div>
        </div>
        <div style="text-align: right;">
            <div style="font-size: 1rem; color: #93C5FD;">Actualización Automática</div>
            <div style="font-size: 1.5rem; font-weight: bold;" id="clock">--:--</div>
        </div>
    </div>
    
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th class="center" style="width: 80px;">Posición</th>
                    <th>Estudiante</th>
                    <th class="center">Grupo</th>
                    <th class="right">Puntos XP</th>
                </tr>
            </thead>
            <tbody id="ranking-body">
                <tr><td colspan="4" style="text-align: center; padding: 50px;">Cargando clasificaciones... ⏳</td></tr>
            </tbody>
        </table>
    </div>

    <script>
        // Reloj
        setInterval(() => {
            const now = new Date();
            document.getElementById('clock').innerText = now.toLocaleTimeString();
        }, 1000);

        // Obtener parámetro de grupo
        const urlParams = new URLSearchParams(window.location.search);
        const grupoActual = urlParams.get('grupo');

        if (grupoActual) {
            document.getElementById('subtitle').innerText = "Clasificación del Grupo: " + grupoActual;
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
                    return { ...est, xp: xpTotal };
                });
                
                estudiantesConXP.sort((a, b) => b.xp - a.xp);
                
                const tbody = document.getElementById('ranking-body');
                tbody.innerHTML = '';
                
                if (estudiantesConXP.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 50px; color: #9CA3AF;">No hay estudiantes registrados en este grupo.</td></tr>';
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
                            <div style="font-size: 1rem; color: #9CA3AF; font-weight: normal; margin-top: 5px;">ID: ${est.documento}</div>
                        </td>
                        <td class="group"><span class="badge">${est.grupo || 'N/A'}</span></td>
                        <td class="xp">${est.xp} <span style="font-size: 1rem; color: #6B7280;">XP</span></td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (e) {
                console.error(e);
            }
        }

        // Cargar inmediatamente y luego cada 5 segundos
        cargarRanking();
        setInterval(cargarRanking, 5000);
    </script>
</body>
</html>
"""

with io.open('ranking.html', 'w', encoding='utf-8') as f:
    f.write(ranking_html)


# 2. Modificar login.html para apuntar a la nueva pestaña y quitar el modal viejo
with io.open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Quitar el onclick viejo y poner window.open
old_btn = '''<button onclick="abrirRankingGrupo()" style="padding: 8px 16px; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 900; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4); animation: pulse 2s infinite;">🏆 Puntuación del Grupo</button>'''
new_btn = '''<button onclick="abrirRankingEnNuevaPestana()" style="padding: 8px 16px; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 900; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4); animation: pulse 2s infinite;">🏆 Puntuación del Grupo</button>'''
if old_btn in html:
    html = html.replace(old_btn, new_btn)

# Remover modal HTML. Simplemente busco la porción y la elimino.
# Como el modal puede ser grande, buscaré marcadores.
import re
html = re.sub(r'<!-- Modal Ranking Global -->.*?</div>\s*</div>', '', html, flags=re.DOTALL)

with io.open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)


# 3. Modificar app.js para añadir abrirRankingEnNuevaPestana()
with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

js += '''
window.abrirRankingEnNuevaPestana = function() {
    if (window.gradoActualPlaneacion) {
        window.open('ranking.html?grupo=' + encodeURIComponent(window.gradoActualPlaneacion), '_blank');
    }
};
'''
with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
