import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_dashboard = '''
        <!-- DASHBOARD ADMIN RECREADO -->
        <div id="dashboard-view" style="display: none; height: 100vh; overflow-y: auto; background-color: #F8FAFC;">
            <!-- Header Superior -->
            <header style="background: white; border-bottom: 1px solid #E5E7EB; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 900; font-size: 1.4rem; color: #111827;">
                    Peidagogos <span style="color: #3B82F6; font-weight: 300;">Local Science Lab</span>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="background: #F3F4F6; padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 700; color: #374151;">
                        Administrador Maestro ADMINISTRADOR
                    </div>
                    <button onclick="location.reload()" style="background: #EF4444; color: white; border: none; padding: 8px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: Inter, sans-serif;">Cerrar Sesi&oacute;n</button>
                </div>
            </header>

            <!-- Contenedor Central -->
            <div style="padding: 40px 30px; max-width: 1200px; margin: 0 auto;">
                <div style="background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); overflow: hidden;">
                    
                    <!-- Cabecera Oscura -->
                    <div style="background: #111827; padding: 35px 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 1.6rem; font-weight: 900; letter-spacing: 0.5px;">INSTITUCI&Oacute;N EDUCATIVA RAM&Oacute;N MESSA LONDO&Ntilde;O</h1>
                        <p style="color: #22D3EE; margin: 8px 0 0 0; font-weight: 600; font-size: 1.1rem;">Panel de Control Docente - Hub de Administraci&oacute;n</p>
                    </div>

                    <!-- PestaÃ±as de Grado -->
                    <div style="display: flex; border-bottom: 1px solid #E5E7EB; background: white; padding: 0 20px;">
                        <button class="tab-grado active">Grado 6&deg;</button>
                        <button class="tab-grado">Grado 7&deg;</button>
                        <button class="tab-grado">Grado 8&deg;</button>
                        <button class="tab-grado">Grado 9&deg;</button>
                        <button class="tab-grado">Grado 10&deg;</button>
                        <button class="tab-grado">Grado 11&deg;</button>
                    </div>

                    <!-- Fila ProducciÃ³n PedagÃ³gica -->
                    <div style="background: #F9FAFB; padding: 20px 30px; display: flex; gap: 15px; align-items: center; border-bottom: 1px solid #E5E7EB;">
                        <select id="periodo-select" style="padding: 12px; border-radius: 8px; border: 1px solid #D1D5DB; background: white; font-weight: 600; font-family: Inter, sans-serif; outline: none;">
                            <option value="1">Periodo 1</option>
                            <option value="2">Periodo 2</option>
                            <option value="3">Periodo 3</option>
                            <option value="4">Periodo 4</option>
                        </select>
                        <select id="semana-select" style="padding: 12px; border-radius: 8px; border: 1px solid #D1D5DB; background: white; font-weight: 600; font-family: Inter, sans-serif; outline: none;">
                            <option value="1">Semana 1 (Exploraci&oacute;n)</option>
                            <option value="2">Semana 2 (Indagaci&oacute;n)</option>
                            <option value="3">Semana 3 (Transferencia)</option>
                            <option value="4">Semana 4 (Metacognici&oacute;n)</option>
                            <option value="5">Semana 5 (Exploraci&oacute;n)</option>
                            <option value="6">Semana 6 (Indagaci&oacute;n)</option>
                            <option value="7">Semana 7 (Transferencia)</option>
                            <option value="8">Semana 8 (Metacognici&oacute;n)</option>
                        </select>
                        <button id="btn-generar-lote" style="background: #3B82F6; color: white; border: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: Inter, sans-serif; transition: background 0.2s;">
                            &#128640; Generar Gu&iacute;as del Grado
                        </button>
                    </div>

                    <!-- Fila de GamificaciÃ³n -->
                    <div style="padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E5E7EB; background: white;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="font-weight: 800; font-size: 0.9rem; color: #4B5563; letter-spacing: 0.5px;">ACCI&Oacute;N GRUPAL:</span>
                            <button style="background: #10B981; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: Inter, sans-serif;">+1 al Grupo</button>
                            <button style="background: #059669; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: Inter, sans-serif;">+5 al Grupo</button>
                            <button style="background: #EF4444; color: white; border: none; padding: 10px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: Inter, sans-serif;">-5 al Grupo</button>
                        </div>
                        <button style="background: #1F2937; color: white; border: none; padding: 12px 25px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: Inter, sans-serif;">
                            &#127942; ABRIR LEADERBOARD
                        </button>
                    </div>

                    <!-- Tabla de Estudiantes -->
                    <div style="padding: 30px; overflow-x: auto; background: white;">
                        <table style="width: 100%; text-align: left; border-collapse: collapse;">
                            <thead>
                                <tr style="border-bottom: 2px solid #E5E7EB; color: #6B7280; font-size: 0.8rem; font-weight: 800; letter-spacing: 1px;">
                                    <th style="padding: 15px 15px;">DOCUMENTO</th>
                                    <th style="padding: 15px 15px;">ESTUDIANTE</th>
                                    <th style="padding: 15px 15px;">XP TOTAL</th>
                                    <th style="padding: 15px 15px;">M&Eacute;RITO (+)</th>
                                    <th style="padding: 15px 15px;">PENALIZACI&Oacute;N R&Aacute;PIDA (-5)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colspan="5" style="text-align: center; padding: 60px 20px; color: #9CA3AF; font-style: italic; font-size: 1.1rem;">
                                        No hay estudiantes registrados en este grado.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
'''

html = re.sub(r'(?s)<!-- DASHBOARD ADMIN RECREADO -->.*?</div>\n        </div>\n', new_dashboard.strip() + '\n', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)


with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Append specific CSS for the dashboard tabs
if '.tab-grado' not in css:
    css += '''
/* === ADMIN HUB TABS === */
.tab-grado {
    background: transparent;
    border: none;
    padding: 15px 25px;
    font-size: 1rem;
    font-weight: 600;
    color: #6B7280;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
    font-family: 'Inter', system-ui, sans-serif;
}

.tab-grado:hover {
    color: #111827;
}

.tab-grado.active {
    color: #06B6D4;
    border-bottom-color: #06B6D4;
}

#btn-generar-lote:hover {
    background: #2563EB !important;
}
'''
    with open('css/styles.css', 'w', encoding='utf-8') as f:
        f.write(css)

