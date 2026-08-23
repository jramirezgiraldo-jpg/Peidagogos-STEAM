import re

with open(r'd:\Peidagogos_Oficial\login.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = """            <div id="vista-cajas-hub" style="display: flex; flex-direction: column; gap: 18px;">"""

replacement = """            <div id="vista-cajas-hub" style="display: flex; flex-direction: column; gap: 18px;">
                <!-- Botón de Cerrar para el Hub -->
                <div style="display: flex; justify-content: flex-end;">
                    <button onclick="window.cerrarCajaHerramientas()" style="background: #F1F5F9; color: #475569; border: 1px solid #CBD5E1; padding: 8px 16px; border-radius: 10px; font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: 0.2s;" onmouseover="this.style.background='#E2E8F0'; this.style.color='#1E293B';" onmouseout="this.style.background='#F1F5F9'; this.style.color='#475569';">
                        ✖ Cerrar Ventana
                    </button>
                </div>"""

html = html.replace(target, replacement)

with open(r'd:\Peidagogos_Oficial\login.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Close button added")
