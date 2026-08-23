import re

with open(r'd:\Peidagogos_Oficial\login.html', 'r', encoding='utf-8') as f:
    html = f.read()

nav_tabs_target = """            <button id="btn-tab-estudiante-malla" onclick="cambiarTabEstudiante('malla')" style="background: white; color: #475569; border: 1.5px solid #CBD5E1; padding: 12px 22px; border-radius: 10px; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s;">
                <span>📚</span> Mi Malla Curricular DBA (Estándares Oficiales)
            </button>
        </div>"""

nav_tabs_replacement = """            <button id="btn-tab-estudiante-malla" onclick="cambiarTabEstudiante('malla')" style="background: white; color: #475569; border: 1.5px solid #CBD5E1; padding: 12px 22px; border-radius: 10px; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s;">
                <span>📚</span> Mi Malla Curricular DBA (Estándares Oficiales)
            </button>
            <button id="btn-tab-estudiante-inbox" onclick="cambiarTabEstudiante('inbox')" style="background: white; color: #475569; border: 1.5px solid #CBD5E1; padding: 12px 22px; border-radius: 10px; font-weight: 800; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; position: relative;">
                <span>📬</span> Buzón de Actividades
                <span id="student-inbox-badge" style="display: none; position: absolute; top: -8px; right: -8px; background: #EF4444; color: white; font-size: 0.75rem; font-weight: bold; border-radius: 50%; width: 22px; height: 22px; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">0</span>
            </button>
        </div>
        
        <!-- Vista Inbox -->
        <div id="vista-estudiante-inbox" style="display: none;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #1E293B; font-weight: 900; font-size: 1.6rem; display: flex; align-items: center; gap: 10px;">
                    <span>📬</span> Buzón de Actividades Asignadas
                </h2>
                <button onclick="window.renderizarInboxEstudiante()" style="background: #E2E8F0; border: none; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer;">🔄 Actualizar</button>
            </div>
            <div id="inbox-estudiante-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
                <!-- Inyectado por JS -->
            </div>
        </div>"""

html = html.replace(nav_tabs_target, nav_tabs_replacement)

with open(r'd:\Peidagogos_Oficial\login.html', 'w', encoding='utf-8') as f:
    f.write(html)
    
print('login.html patched for inbox html.')
