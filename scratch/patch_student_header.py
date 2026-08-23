import re

with open(r'd:\Peidagogos_Oficial\login.html', 'r', encoding='utf-8') as f:
    html = f.read()

target = """    <!-- Header Superior Siempre Visible -->
    <header style="background: white; border-bottom: 1px solid #E5E7EB; padding: 12px 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-weight: 800; color: #1E293B; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                <span id="header-student-avatar" style="font-size: 1.6rem; background: #EEF2FF; padding: 4px 8px; border-radius: 50%; border: 1px solid #C7D2FE; display: inline-block;">🚀</span> 
                <span id="header-student-name">Estudiante</span>
            </div>
            <div style="background: #E0E7FF; color: #4338CA; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 0.9rem; display: flex; align-items: center; gap: 4px;">
                🎓 <span id="header-student-grade">Ciclo VI</span>
            </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            
            <!-- Indicador de Tiempo de Clase Activa -->
            <div id="indicador-tiempo-clase-box" style="background: #FEF3C7; border: 1.5px solid #FDE68A; color: #92400E; padding: 6px 14px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;" title="Tiempo de clase transcurrido">
                <span>⏱️</span> <span id="txt-tiempo-clase-transcurrido">Clase: 00:00 / 45 min</span>
            </div>

            <!-- Botón Perfil -->
            <button onclick="abrirModalPerfilEstudiante()" style="background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; border: none; padding: 8px 14px; border-radius: 10px; font-weight: 800; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(99,102,241,0.25); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
                🎨 Mi Perfil
            </button>

            <!-- Puntos XP -->
            <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 8px 16px; border-radius: 20px; font-size: 0.95rem; font-weight: 800; color: white; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); display: flex; align-items: center; gap: 6px;">
                🌟 <span id="student-score-display">0</span> XP
            </div>

            <!-- BOTÓN OFICIAL: GUARDAR PROGRESO Y FINALIZAR CLASE (CONTROL ANTI-EVASIÓN) -->
            <button id="btn-guardar-progreso-finalizar-clase" onclick="window.intentarGuardarProgresoYFinalizarClase()" style="background: linear-gradient(135deg, #2563EB, #1D4ED8); color: white; border: none; padding: 8px 18px; border-radius: 10px; font-weight: 900; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 10px rgba(37,99,235,0.3); transition: 0.2s;">
                <span>💾</span> Guardar Progreso & Salir
            </button>
        </div>
    </header>
    <!-- Hero Banner -->
    <div style="background: linear-gradient(135deg, #1E40AF, #2563EB, #3B82F6); padding: 35px 30px; display: flex; align-items: center; justify-content: flex-start; gap: 25px; border-bottom: 5px solid #60A5FA; flex-wrap: wrap;">
        <div style="background: white; padding: 10px; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center;">
            <img src="logo-peidagogos.png" alt="Peidagogos STEAM" style="height: 80px; width: auto; object-fit: contain;">
        </div>
        <div onclick="abrirModalPerfilEstudiante()" style="cursor: pointer; position: relative; font-size: 3.2rem; background: white; width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.2); border: 3px solid #FCD34D; transition: transform 0.2s;" title="Haz clic para personalizar tu avatar y nombre" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
            <span id="student-avatar-hero">🚀</span>
            <div style="position: absolute; bottom: -2px; right: -2px; background: #F59E0B; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">✏️</div>
        </div>
        <div style="text-align: left; flex: 1; min-width: 250px;">
            <h1 id="student-welcome-name" style="color: white; margin: 0; font-size: 2.2rem; font-weight: 900; letter-spacing: -0.5px;">¡Hola, Estudiante!</h1>
            <p id="student-welcome-subtitle" style="color: #DBEAFE; margin: 6px 0 0 0; font-weight: 500; font-size: 1.1rem;">Bienvenido a tu panel de aprendizaje STEAM. Elige una asignatura para comenzar.</p>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 14px;">
                <div id="student-grade-badge" style="display: inline-block; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255,255,255,0.4); padding: 5px 14px; border-radius: 20px; color: white; font-weight: bold; font-size: 0.9rem; letter-spacing: 0.5px;">
                    🎓 Grado / Ciclo
                </div>
                <button onclick="abrirModalPerfilEstudiante()" style="background: #F59E0B; color: #78350F; border: none; padding: 5px 14px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; cursor: pointer; box-shadow: 0 2px 8px rgba(245,158,11,0.3); display: flex; align-items: center; gap: 5px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    ✏️ Personalizar Nombre y Avatar
                </button>
            </div>

            <!-- Barra de Progreso de Nivel y Puntos Acumulados del Estudiante -->
            <div style="margin-top: 15px; background: rgba(15, 23, 42, 0.45); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 14px; padding: 12px 18px; max-width: 550px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                    <span id="student-xp-level-name" style="color: #FDE047; font-weight: 800; font-size: 0.92rem; letter-spacing: 0.3px;">🌱 Nivel 1: Novato STEAM</span>
                    <span id="student-xp-progress-text" style="color: #F8FAFC; font-weight: 700; font-size: 0.85rem;">0 / 300 XP (0%)</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.2); height: 12px; border-radius: 10px; overflow: hidden; position: relative; border: 1px solid rgba(255, 255, 255, 0.3);">
                    <div id="student-xp-progress-bar" style="background: linear-gradient(90deg, #10B981, #34D399, #38BDF8); height: 100%; width: 10%; border-radius: 10px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px rgba(52, 211, 153, 0.6);"></div>
                </div>
            </div>
        </div>
    </div>"""

replacement = """    <!-- Header Integrado (Hero) -->
    <header style="background: linear-gradient(135deg, #1E40AF, #2563EB, #3B82F6); border-bottom: 5px solid #60A5FA; padding: 25px 30px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); position: sticky; top: 0; z-index: 100;">
        
        <div style="display: flex; align-items: center; gap: 20px;">
            <div style="background: white; padding: 8px; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center;">
                <img src="logo-peidagogos.png" alt="Peidagogos STEAM" style="height: 60px; width: auto; object-fit: contain;">
            </div>
            <div onclick="abrirModalPerfilEstudiante()" style="cursor: pointer; position: relative; font-size: 2.5rem; background: white; width: 70px; height: 70px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,0.2); border: 3px solid #FCD34D; transition: transform 0.2s;" title="Haz clic para personalizar tu avatar y nombre" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
                <span id="student-avatar-hero">🚀</span>
                <div style="position: absolute; bottom: -2px; right: -2px; background: #F59E0B; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">✏️</div>
            </div>
            
            <div style="text-align: left;">
                <h1 id="student-welcome-name" style="color: white; margin: 0; font-size: 1.8rem; font-weight: 900; letter-spacing: -0.5px;">¡Hola, Estudiante!</h1>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 6px;">
                    <div id="student-grade-badge" style="display: inline-block; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255,255,255,0.4); padding: 4px 12px; border-radius: 20px; color: white; font-weight: bold; font-size: 0.85rem; letter-spacing: 0.5px;">
                        🎓 Grado / Ciclo
                    </div>
                </div>
            </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; min-width: 300px;">
            <div style="display: flex; align-items: center; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
                <!-- Indicador de Tiempo de Clase Activa -->
                <div id="indicador-tiempo-clase-box" style="background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.4); color: white; padding: 6px 14px; border-radius: 12px; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;" title="Tiempo de clase transcurrido">
                    <span>⏱️</span> <span id="txt-tiempo-clase-transcurrido">Clase: 00:00 / 45 min</span>
                </div>

                <!-- Puntos XP -->
                <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 8px 16px; border-radius: 20px; font-size: 0.95rem; font-weight: 800; color: white; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); display: flex; align-items: center; gap: 6px;">
                    🌟 <span id="student-score-display">0</span> XP
                </div>

                <!-- BOTÓN OFICIAL: GUARDAR PROGRESO Y FINALIZAR CLASE -->
                <button id="btn-guardar-progreso-finalizar-clase" onclick="window.intentarGuardarProgresoYFinalizarClase()" style="background: #EF4444; color: white; border: none; padding: 8px 18px; border-radius: 10px; font-weight: 900; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 10px rgba(239,68,68,0.3); transition: 0.2s;" onmouseover="this.style.background='#DC2626'" onmouseout="this.style.background='#EF4444'">
                    <span>💾</span> Guardar & Salir
                </button>
            </div>

            <!-- Barra de Progreso de Nivel y Puntos Acumulados del Estudiante -->
            <div style="background: rgba(15, 23, 42, 0.45); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 14px; padding: 12px 18px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
                    <span id="student-xp-level-name" style="color: #FDE047; font-weight: 800; font-size: 0.92rem; letter-spacing: 0.3px;">🌱 Nivel 1: Novato STEAM</span>
                    <span id="student-xp-progress-text" style="color: #F8FAFC; font-weight: 700; font-size: 0.85rem;">0 / 300 XP (0%)</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.2); height: 12px; border-radius: 10px; overflow: hidden; position: relative; border: 1px solid rgba(255, 255, 255, 0.3);">
                    <div id="student-xp-progress-bar" style="background: linear-gradient(90deg, #10B981, #34D399, #38BDF8); height: 100%; width: 10%; border-radius: 10px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px rgba(52, 211, 153, 0.6);"></div>
                </div>
            </div>
        </div>
    </header>
    <div style="display:none;" id="header-student-avatar"></div><div style="display:none;" id="header-student-name"></div><div style="display:none;" id="header-student-grade"></div><!-- Para que JS no falle -->"""

html = html.replace(target, replacement)

with open(r'd:\Peidagogos_Oficial\login.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('student header replaced in login.html')
