import io
import re

# 1. MOVER EL BOTÓN EN LOGIN.HTML
with io.open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remover botón del grupo
old_group_header = '''                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                                <h4 id="admin-titulo-grupo-actual" style="font-weight: 800; font-size: 1.2rem; color: #111827;">Grupo...</h4>
                                <div style="display: flex; gap: 10px;">
                                    <button onclick="abrirRankingEnNuevaPestana()" style="padding: 8px 16px; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 900; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4); animation: pulse 2s infinite;">🏆 Puntuación del Grupo</button>
                                    <button onclick="volverAGrupos()" style="padding: 8px 16px; background: #E5E7EB; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">← Volver a Instituciones</button>
                                </div>
                            </div>'''

new_group_header = '''                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                                <h4 id="admin-titulo-grupo-actual" style="font-weight: 800; font-size: 1.2rem; color: #111827;">Grupo...</h4>
                                <div style="display: flex; gap: 10px;">
                                    <button onclick="volverAGrupos()" style="padding: 8px 16px; background: #E5E7EB; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">← Volver a Instituciones</button>
                                </div>
                            </div>'''

if old_group_header in html:
    html = html.replace(old_group_header, new_group_header)

# Insertar botón en asignatura
old_subject_header = '''                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                <h4 id="admin-titulo-planeacion-actual" style="font-weight: 800; font-size: 1.2rem; color: #111827;">Asignatura...</h4>
                                <button onclick="volverAGrupo()" style="padding: 8px 16px; background: #E5E7EB; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">← Volver al Grupo</button>
                            </div>'''

new_subject_header = '''                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                                <h4 id="admin-titulo-planeacion-actual" style="font-weight: 800; font-size: 1.2rem; color: #111827;">Asignatura...</h4>
                                <div style="display: flex; gap: 10px;">
                                    <button onclick="abrirRankingEnNuevaPestana()" style="padding: 8px 16px; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 900; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4); animation: pulse 2s infinite;">🏆 Puntuación de Asignatura</button>
                                    <button onclick="volverAGrupo()" style="padding: 8px 16px; background: #E5E7EB; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">← Volver al Grupo</button>
                                </div>
                            </div>'''

if old_subject_header in html:
    html = html.replace(old_subject_header, new_subject_header)

with io.open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)


# 2. ACTUALIZAR APP.JS PARA MANDAR LA ASIGNATURA
with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_abrir = '''window.abrirRankingEnNuevaPestana = function() {
    if (window.gradoActualPlaneacion) {
        window.open('ranking.html?grupo=' + encodeURIComponent(window.gradoActualPlaneacion), '_blank');
    }
};'''

new_abrir = '''window.abrirRankingEnNuevaPestana = function() {
    if (window.gradoActualPlaneacion && window.asignaturaActualPlaneacion) {
        window.open('ranking.html?grupo=' + encodeURIComponent(window.gradoActualPlaneacion) + '&asignatura=' + encodeURIComponent(window.asignaturaActualPlaneacion), '_blank');
    } else if (window.gradoActualPlaneacion) {
        window.open('ranking.html?grupo=' + encodeURIComponent(window.gradoActualPlaneacion), '_blank');
    }
};'''

if old_abrir in js:
    js = js.replace(old_abrir, new_abrir)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)


# 3. ACTUALIZAR RANKING.HTML PARA MOSTRAR ASIGNATURA Y FILTRAR PUNTOS
with io.open('ranking.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_subtitle = '''        const urlParams = new URLSearchParams(window.location.search);
        const grupoActual = urlParams.get('grupo');

        if (grupoActual) {
            document.getElementById('subtitle').innerText = "Clasificación del Grupo: " + grupoActual + " (Periodo 3)";
        }'''

new_subtitle = '''        const urlParams = new URLSearchParams(window.location.search);
        const grupoActual = urlParams.get('grupo');
        const asignaturaActual = urlParams.get('asignatura');

        if (grupoActual && asignaturaActual) {
            const asigName = asignaturaActual.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
            document.getElementById('subtitle').innerText = `Clasificación del Grupo: ${grupoActual} - ${asigName} (Periodo 3)`;
        } else if (grupoActual) {
            document.getElementById('subtitle').innerText = "Clasificación del Grupo: " + grupoActual + " (Periodo 3)";
        }'''

if old_subtitle in html:
    html = html.replace(old_subtitle, new_subtitle)

old_calc = '''                    // Solo calculamos el Periodo 3
                    const prefix = `prog_${est.documento}_`;
                    const suffix = `_p3`;'''

new_calc = '''                    // Calculamos por asignatura y periodo 3
                    let prefix = `prog_${est.documento}_`;
                    if (asignaturaActual) {
                        prefix = `prog_${est.documento}_${asignaturaActual}_`;
                    }
                    const suffix = `_p3`;'''

if old_calc in html:
    html = html.replace(old_calc, new_calc)
    
old_penalty = '''            // Registrar penalidad localmente
            const key = `penalty_${grupoActual}_p3`;'''

new_penalty = '''            // Registrar penalidad localmente por asignatura
            let key = `penalty_${grupoActual}_p3`;
            if (asignaturaActual) {
                key = `penalty_${grupoActual}_${asignaturaActual}_p3`;
            }'''
            
if old_penalty in html:
    html = html.replace(old_penalty, new_penalty)
    
old_get_penalty = '''                // Obtener penalidad grupal total
                const penaltyKey = `penalty_${grupoActual}_p3`;'''
new_get_penalty = '''                // Obtener penalidad grupal total por asignatura
                let penaltyKey = `penalty_${grupoActual}_p3`;
                if (asignaturaActual) {
                    penaltyKey = `penalty_${grupoActual}_${asignaturaActual}_p3`;
                }'''
                
if old_get_penalty in html:
    html = html.replace(old_get_penalty, new_get_penalty)

with io.open('ranking.html', 'w', encoding='utf-8') as f:
    f.write(html)
