import re

with open(r'd:\Peidagogos_Oficial\app.js', 'r', encoding='utf-8') as f:
    app = f.read()

target = """            <button onclick="window.abrirConfiguracionJuegoIA('${tool.id}')" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; border: none; padding: 11px 16px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                <span>⚡</span> Configurar y Generar IA
            </button>"""

replacement = """            ${tool.caja && tool.caja.includes('Caja 1') ? `
            <button onclick="window.abrirConfiguracionJuegoIA('${tool.id}')" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; border: none; padding: 11px 16px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">
                <span>⚡</span> Configurar y Generar IA
            </button>
            ` : `
            <button onclick="window.abrirVisorHerramienta('${tool.id}', true)" style="background: linear-gradient(135deg, #10B981, #059669); color: white; border: none; padding: 11px 16px; border-radius: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(16,185,129,0.25);">
                <span>▶</span> Abrir Herramienta
            </button>
            `}"""

app = app.replace(target, replacement)

with open(r'd:\Peidagogos_Oficial\app.js', 'w', encoding='utf-8') as f:
    f.write(app)

print('Patched button in app.js')
