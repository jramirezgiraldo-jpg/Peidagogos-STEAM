import io

with io.open('login.html', 'r', encoding='utf-8') as f:
    html = f.read()

# First replace <div style="padding: 40px 30px; max-width: 1200px; margin: 0 auto;">
# with <div id="student-main-content" style="padding: 40px 30px; max-width: 1200px; margin: 0 auto;">
html = html.replace('<div style="padding: 40px 30px; max-width: 1200px; margin: 0 auto;">',
                    '<div id="student-main-content" style="padding: 40px 30px; max-width: 1200px; margin: 0 auto;">')


nuevo_contenedor = """
            <!-- Vista de Asignatura Específica (Gamificada) -->
            <div id="student-subject-view-container" style="display: none; padding: 40px 30px; max-width: 1200px; margin: 0 auto;">
                <button onclick="volverAlGridEstudiante()" style="background: none; border: none; color: #3B82F6; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; margin-bottom: 20px;">
                    &larr; Volver a Mis Asignaturas
                </button>
                <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <h2 id="student-subject-title" style="font-weight: 900; color: #111827; margin-bottom: 20px; font-size: 2rem; border-left: 5px solid #10B981; padding-left: 15px;">Materia</h2>
                    
                    <div style="background: #F3F4F6; padding: 20px; border-radius: 12px; margin-bottom: 30px; display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                        <div>
                            <label style="font-weight: bold; color: #374151; display: block; margin-bottom: 5px;">Periodo:</label>
                            <select id="student-select-periodo" style="padding: 10px; border-radius: 8px; border: 1px solid #D1D5DB; font-weight: bold;">
                                <option value="1">Periodo 1</option>
                                <option value="2">Periodo 2</option>
                                <option value="3">Periodo 3</option>
                                <option value="4">Periodo 4</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-weight: bold; color: #374151; display: block; margin-bottom: 5px;">Semana:</label>
                            <select id="student-select-semana" style="padding: 10px; border-radius: 8px; border: 1px solid #D1D5DB; font-weight: bold;">
                                <option value="1">Semana 1</option><option value="2">Semana 2</option><option value="3">Semana 3</option><option value="4">Semana 4</option>
                                <option value="5">Semana 5</option><option value="6">Semana 6</option><option value="7">Semana 7</option><option value="8">Semana 8</option>
                            </select>
                        </div>
                    </div>

                    <div id="student-quest-container" style="border: 2px dashed #3B82F6; padding: 25px; border-radius: 12px; background: #EFF6FF;">
                        <h3 style="font-weight: 800; color: #1D4ED8; margin-bottom: 15px;">&iexcl;Personaliza tu Aventura de Aprendizaje!</h3>
                        <p style="color: #1E3A8A; margin-bottom: 20px;">Antes de acceder a la gu&iacute;a de esta semana, configura los par&aacute;metros de tu misi&oacute;n.</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                            <div>
                                <label style="font-weight: bold; color: #111827;">Men&uacute; 1: Tu Rol</label>
                                <select id="student-quest-rol" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #93C5FD; margin-top: 5px;">
                                    <option value="">Seleccionar...</option>
                                    <option value="cientifico">Cient&iacute;fico</option>
                                    <option value="detective">Detective</option>
                                    <option value="ingeniero">Ingeniero</option>
                                    <option value="explorador">Explorador</option>
                                    <option value="analista">Analista de Datos</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-weight: bold; color: #111827;">Men&uacute; 2: Ambiente de Trabajo</label>
                                <select id="student-quest-ambiente" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #93C5FD; margin-top: 5px;">
                                    <option value="">Seleccionar...</option>
                                    <option value="laboratorio">Laboratorio de Bioespectroscop&iacute;a</option>
                                    <option value="virtual">Entorno Virtual</option>
                                    <option value="campo">Misi&oacute;n de Campo</option>
                                    <option value="simulacion">Simulaci&oacute;n Te&oacute;rica</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-weight: bold; color: #111827;">Men&uacute; 3: Nivel de Desaf&iacute;o</label>
                                <select id="student-quest-nivel" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #93C5FD; margin-top: 5px;">
                                    <option value="">Seleccionar...</option>
                                    <option value="basico">Explorador (B&aacute;sico)</option>
                                    <option value="intermedio">Analista (Intermedio)</option>
                                    <option value="avanzado">Experto (Avanzado)</option>
                                    <option value="reto">Maestro (Reto Total)</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-weight: bold; color: #111827;">Men&uacute; 4: Enfoque de la Tarea</label>
                                <select id="student-quest-enfoque" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid #93C5FD; margin-top: 5px;">
                                    <option value="">Seleccionar...</option>
                                    <option value="problemas">Resoluci&oacute;n de problemas</option>
                                    <option value="conceptualizacion">Conceptualizaci&oacute;n</option>
                                    <option value="experimentacion">Experimentaci&oacute;n</option>
                                    <option value="critico">An&aacute;lisis Cr&iacute;tico</option>
                                </select>
                            </div>
                        </div>

                        <div style="margin-top: 30px; text-align: center;">
                            <button id="student-btn-ingresar-guia" onclick="ingresarAGuia()" style="background: #10B981; color: white; padding: 15px 40px; border-radius: 30px; border: none; font-weight: 800; font-size: 1.1rem; cursor: pointer; box-shadow: 0 4px 15px rgba(16,185,129,0.3); transition: transform 0.2s;">
                                Ingresar a la Gu&iacute;a Personalizada
                            </button>
                        </div>
                    </div>
                    
                    <div id="student-guide-content" style="display: none; margin-top: 30px; padding: 25px; border-radius: 12px; background: #F8FAFC; border: 1px solid #E5E7EB;">
                        <div id="student-guide-inner-content"></div>
                        <button onclick="cerrarGuia()" style="margin-top: 20px; background: none; border: 1px solid #EF4444; color: #EF4444; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">Cerrar Gu&iacute;a</button>
                    </div>
                </div>
            </div>
"""

# Inject before </div> <!-- fin student-dashboard-container -->
html = html.replace('</div> <!-- fin student-dashboard-container -->', nuevo_contenedor + '\n        </div> <!-- fin student-dashboard-container -->')

with io.open('login.html', 'w', encoding='utf-8') as f:
    f.write(html)
