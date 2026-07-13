import io
import re

with io.open('ranking.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Ajustar CSS (Quitar borde azul inferior del header anterior y asegurar body correcto)
old_css_header = '''        .header {
            background: white;
            padding: 20px 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 10;
            border-bottom: 4px solid #3B82F6;
        }'''
new_css_header = '''        .header {
            background: white;
            padding: 20px 40px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 10;
        }'''
if old_css_header in html:
    html = html.replace(old_css_header, new_css_header)

# 2. Reemplazar toda la estructura del body (desde <body> hasta <script>)
body_pattern = r'<body>(.*?)<script>'
new_body = '''<body>
    <div style="display: flex; height: 100vh;">
        <!-- SIDEBAR IZQUIERDO -->
        <div style="width: 320px; min-width: 320px; background: white; border-right: 4px solid #3B82F6; display: flex; flex-direction: column; padding: 40px 20px; box-shadow: 4px 0 15px rgba(0,0,0,0.05); z-index: 20;">
            <!-- Logo más grande -->
            <div style="text-align: center; margin-bottom: 50px;">
                <img src="logo-peidagogos.png" alt="Peidagogos STEAM" style="width: 100%; max-width: 280px; height: auto; object-fit: contain;">
            </div>
            
            <!-- Controles de Ruido -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <h3 style="margin: 0; color: #1F2937; font-size: 1.3rem; text-align: center; border-bottom: 2px solid #E5E7EB; padding-bottom: 15px;">Control de Clima de Aula</h3>
                
                <button id="btn-mic" onclick="toggleMic()" style="background: #10B981; color: white; border: none; padding: 18px; border-radius: 12px; font-weight: 900; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.2s; box-shadow: 0 4px 6px rgba(16,185,129,0.3);">
                    🎙️ Activar Micrófono
                </button>
                
                <div style="background: #F9FAFB; padding: 20px; border-radius: 12px; border: 1px solid #E5E7EB; display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; font-size: 1rem; font-weight: bold; color: #6B7280;">
                        <span>Ruido: <span id="noise-value" style="color: #374151;">0</span>%</span>
                        <span>Límite: <span id="threshold-value" style="color: #EF4444;">70</span>%</span>
                    </div>
                    <div style="height: 25px; background: #E5E7EB; border-radius: 12px; overflow: hidden; position: relative; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                        <div id="noise-bar" style="height: 100%; width: 0%; background: #10B981; transition: width 0.1s, background-color 0.2s;"></div>
                        <div id="threshold-marker" style="position: absolute; top: 0; bottom: 0; left: 70%; width: 4px; background: #EF4444; z-index: 10;"></div>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; align-items: center; background: #F9FAFB; padding: 20px; border-radius: 12px; border: 1px solid #E5E7EB;">
                    <label for="threshold-slider" style="font-size: 1rem; font-weight: bold; color: #6B7280; margin-bottom: 15px;">Ajustar Límite de Tolerancia</label>
                    <input type="range" id="threshold-slider" min="10" max="100" value="70" oninput="updateThreshold(this.value)" style="width: 100%; cursor: pointer;">
                </div>
                
                <div id="penalty-alert" style="color: #EF4444; font-weight: 900; font-size: 1.2rem; opacity: 0; transition: opacity 0.3s; background: #FEE2E2; padding: 15px; border-radius: 12px; border: 2px solid #EF4444; text-align: center; margin-top: 20px;">
                    🚨 ¡RUIDO EXCEDIDO!<br>-10 XP (TODO EL GRUPO)
                </div>
            </div>
        </div>

        <!-- CONTENIDO PRINCIPAL (DERECHA) -->
        <div style="flex: 1; display: flex; flex-direction: column; background: #F3F4F6;">
            <div class="header">
                <div class="title-container">
                    <span class="trophy">🏆</span>
                    <div>
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
        </div>
    </div>
    
    <script>'''

html = re.sub(body_pattern, new_body, html, flags=re.DOTALL)

with io.open('ranking.html', 'w', encoding='utf-8') as f:
    f.write(html)
