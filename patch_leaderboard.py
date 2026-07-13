import io

# PATCH login.html
with io.open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

target_tabs = '''                            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                                <button onclick="mostrarGruposInstitucion('montenegro')" style="padding: 15px 30px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1rem;">IE Instituto Montenegro</button>
                                <button onclick="mostrarGruposInstitucion('ramon_messa')" style="padding: 15px 30px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1rem;">IE Ramon Messa</button>
                            </div>'''
new_tabs = '''                            <div style="display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
                                <button onclick="mostrarGruposInstitucion('montenegro')" style="padding: 15px 30px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 6px rgba(59,130,246,0.3);">🏫 IE Instituto Montenegro</button>
                                <button onclick="mostrarGruposInstitucion('ramon_messa')" style="padding: 15px 30px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 6px rgba(59,130,246,0.3);">🏫 IE Ramon Messa</button>
                                <button onclick="abrirRankingGlobal()" style="padding: 15px 30px; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 900; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); margin-left: auto;">🏆 Ver Clasificación Global</button>
                            </div>'''

if target_tabs in html:
    html = html.replace(target_tabs, new_tabs)

# Add Modal HTML
modal_html = '''
    <!-- Modal Ranking Global -->
    <div id="modal-ranking-global" style="display: none; position: fixed; inset: 0; background: rgba(17, 24, 39, 0.85); backdrop-filter: blur(10px); align-items: center; justify-content: center; z-index: 2000; padding: 20px;">
        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; max-width: 800px; width: 100%; max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); display: flex; flex-direction: column;">
            
            <div style="background: linear-gradient(90deg, #1E3A8A, #3B82F6); padding: 25px 30px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-size: 2.5rem;">🏆</span>
                    <div>
                        <h2 style="color: white; margin: 0; font-weight: 900; font-size: 1.8rem; letter-spacing: 1px;">Salón de la Fama</h2>
                        <p style="color: #93C5FD; margin: 5px 0 0 0; font-weight: 600;">Clasificación de Estudiantes (XP)</p>
                    </div>
                </div>
                <button onclick="cerrarRankingGlobal()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; font-weight: bold; transition: background 0.2s;">✕</button>
            </div>
            
            <div style="padding: 20px; background: rgba(255, 255, 255, 0.95); flex: 1; overflow-y: auto;">
                <table style="width: 100%; border-collapse: separate; border-spacing: 0 10px;">
                    <thead>
                        <tr>
                            <th style="padding: 10px 15px; text-align: center; color: #6B7280; font-weight: 800; border-bottom: 2px solid #E5E7EB; width: 60px;">Pos</th>
                            <th style="padding: 10px 15px; text-align: left; color: #6B7280; font-weight: 800; border-bottom: 2px solid #E5E7EB;">Estudiante</th>
                            <th style="padding: 10px 15px; text-align: center; color: #6B7280; font-weight: 800; border-bottom: 2px solid #E5E7EB;">Grupo</th>
                            <th style="padding: 10px 15px; text-align: right; color: #6B7280; font-weight: 800; border-bottom: 2px solid #E5E7EB;">Puntos XP</th>
                        </tr>
                    </thead>
                    <tbody id="tabla-ranking-body">
                        <!-- Inyectado por JS -->
                    </tbody>
                </table>
            </div>
            
        </div>
    </div>
</body>'''

html = html.replace('</body>', modal_html)

with io.open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)


# PATCH app.js
with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

js_ranking = '''
// ==========================================
// RANKING Y GAMIFICACIÓN (ADMIN)
// ==========================================
window.abrirRankingGlobal = async function() {
    try {
        const modal = document.getElementById('modal-ranking-global');
        if (!modal) return;
        
        const tbody = document.getElementById('tabla-ranking-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 40px; font-weight: bold; color: #6B7280;">Calculando puntajes... ⏳</td></tr>';
        }
        
        modal.style.display = 'flex';
        
        // Fetch students
        const res = await fetch('/api/estudiantes');
        if (!res.ok) throw new Error("Error fetching estudiantes");
        let estudiantes = await res.json();
        
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
'''

js = js + '\n' + js_ranking

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
