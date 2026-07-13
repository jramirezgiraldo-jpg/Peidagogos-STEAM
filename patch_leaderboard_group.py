import io
import re

# PATCH login.html
with io.open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove the button from the main instititutions view
target_tabs = '''<button onclick="abrirRankingGlobal()" style="padding: 15px 30px; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 900; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); margin-left: auto;">🏆 Ver Clasificación Global</button>'''
if target_tabs in html:
    html = html.replace(target_tabs, '')

# 2. Add the button inside the group view header
old_header = '''                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                <h4 id="admin-titulo-grupo-actual" style="font-weight: 800; font-size: 1.2rem; color: #111827;">Grupo...</h4>
                                <button onclick="volverAGrupos()" style="padding: 8px 16px; background: #E5E7EB; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">← Volver a Instituciones</button>
                            </div>'''

new_header = '''                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                                <h4 id="admin-titulo-grupo-actual" style="font-weight: 800; font-size: 1.2rem; color: #111827;">Grupo...</h4>
                                <div style="display: flex; gap: 10px;">
                                    <button onclick="abrirRankingGrupo()" style="padding: 8px 16px; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 900; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.4); animation: pulse 2s infinite;">🏆 Puntuación del Grupo</button>
                                    <button onclick="volverAGrupos()" style="padding: 8px 16px; background: #E5E7EB; color: #374151; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">← Volver a Instituciones</button>
                                </div>
                            </div>
                            <style>@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }</style>'''

if old_header in html:
    html = html.replace(old_header, new_header)

with io.open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)

# PATCH app.js
with io.open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Change window.abrirRankingGlobal to window.abrirRankingGrupo and filter by group
old_abrir = '''window.abrirRankingGlobal = async function() {'''
new_abrir = '''window.abrirRankingGrupo = async function() {'''

if old_abrir in js:
    js = js.replace(old_abrir, new_abrir)
    
old_fetch = '''        const res = await fetch('/api/estudiantes');
        if (!res.ok) throw new Error("Error fetching estudiantes");
        let estudiantes = await res.json();
        
        // Calculate XP for each student'''
new_fetch = '''        const res = await fetch('/api/estudiantes');
        if (!res.ok) throw new Error("Error fetching estudiantes");
        let estudiantes = await res.json();
        
        // Filtrar por el grupo actual
        if (window.gradoActualPlaneacion) {
            estudiantes = estudiantes.filter(e => e.grupo === window.gradoActualPlaneacion);
        }
        
        // Calculate XP for each student'''

if old_fetch in js:
    js = js.replace(old_fetch, new_fetch)

# Also update the modal title to indicate it's for the group
old_title = '''<p style="color: #93C5FD; margin: 5px 0 0 0; font-weight: 600;">Clasificación de Estudiantes (XP)</p>'''
new_title = '''<p id="ranking-modal-subtitle" style="color: #93C5FD; margin: 5px 0 0 0; font-weight: 600;">Clasificación de Estudiantes (XP)</p>'''
if old_title in html:
    with io.open('login.html', 'r', encoding='utf-8') as f:
        html = f.read()
    html = html.replace(old_title, new_title)
    with io.open('login.html', 'w', encoding='utf-8') as f:
        f.write(html)

old_modal = '''modal.style.display = 'flex';'''
new_modal = '''        const subtitle = document.getElementById('ranking-modal-subtitle');
        if (subtitle && window.gradoActualPlaneacion) {
            subtitle.innerText = "Clasificación del Grupo: " + window.gradoActualPlaneacion;
        }
        modal.style.display = 'flex';'''
        
if old_modal in js:
    js = js.replace(old_modal, new_modal)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
