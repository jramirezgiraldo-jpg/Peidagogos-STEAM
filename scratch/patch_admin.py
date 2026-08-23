import re

with open(r'd:\Peidagogos_Oficial\login.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove white header in admin
target_header = """    <header style="background: white; border-bottom: 1px solid #E5E7EB; padding: 12px 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100;">
        <div style="font-weight: 800; color: #1E293B; font-size: 1.1rem;">
            👤 <span id="admin-name-header">Juan Felipe</span>
        </div>
        <div>
            <button onclick="window.cerrarSesion()" style="background: #EF4444; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: Inter, sans-serif;">Cerrar Sesión</button>
        </div>
    </header>"""

replacement_header = """    <!-- Header Integrado -->
    <header style="display: none;"><span id="admin-name-header"></span></header>"""

html = html.replace(target_header, replacement_header)

# And add the Cerrar Sesion button to the Hero Banner
target_hero = """            <!-- Cabecera Azul Claro -->
            <div style="background: #3B82F6; padding: 20px 30px; display: flex; align-items: center; justify-content: flex-start; gap: 20px;">
                <img src="logo-peidagogos.png" alt="Peidagogos STEAM" style="height: 180px; width: auto; object-fit: contain;">
                <div style="text-align: left;">
                    <h1 style="color: white; margin: 0; font-size: 2.2rem; font-weight: 900; letter-spacing: 0.5px;">Hola Juan Felipe Ramirez Giraldo</h1>
                    <p style="color: #EFF6FF; margin: 8px 0 0 0; font-weight: 600; font-size: 1.3rem;">panel de administrador</p>
                </div>
            </div>"""

replacement_hero = """            <!-- Cabecera Azul Claro -->
            <div style="background: linear-gradient(135deg, #1E40AF, #2563EB, #3B82F6); border-bottom: 5px solid #60A5FA; padding: 25px 30px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="background: white; padding: 10px; border-radius: 16px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center;">
                        <img src="logo-peidagogos.png" alt="Peidagogos STEAM" style="height: 60px; width: auto; object-fit: contain;">
                    </div>
                    <div style="text-align: left;">
                        <h1 style="color: white; margin: 0; font-size: 2.2rem; font-weight: 900; letter-spacing: 0.5px;">Hola Juan Felipe Ramirez Giraldo</h1>
                        <p style="color: #EFF6FF; margin: 8px 0 0 0; font-weight: 600; font-size: 1.3rem;">Panel de Administrador</p>
                    </div>
                </div>
                <div>
                    <button onclick="window.cerrarSesion()" style="background: #EF4444; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(239,68,68,0.3); transition: 0.2s;" onmouseover="this.style.background='#DC2626'" onmouseout="this.style.background='#EF4444'">
                        <span>🚪</span> Cerrar Sesión
                    </button>
                </div>
            </div>"""

html = html.replace(target_hero, replacement_hero)

# 2. Add Role to Admin Invite
target_invite = """                            <input type="text" id="admin-inv-ie-select" placeholder="Escribe el nombre de la institución..." value="" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.9rem; box-sizing: border-box; background: white;">

                        </div>"""

replacement_invite = """                            <input type="text" id="admin-inv-ie-select" placeholder="Escribe el nombre de la institución..." value="" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.9rem; box-sizing: border-box; background: white; margin-bottom: 12px;">

                            <label style="display: block; font-weight: 800; color: #1E293B; font-size: 0.88rem; margin-bottom: 5px;">
                                👨‍🏫 Tipo de Rol a Asignar:
                            </label>
                            <select id="admin-inv-rol-select" style="width: 100%; padding: 10px 12px; border: 1.5px solid #CBD5E1; border-radius: 8px; font-weight: 700; font-size: 0.9rem; box-sizing: border-box; background: white;">
                                <option value="director">Director de Grupo (Crea y administra grupos)</option>
                                <option value="regular">Docente Regular (Dicta clases en varios grupos)</option>
                            </select>
                        </div>"""

html = html.replace(target_invite, replacement_invite)

with open(r'd:\Peidagogos_Oficial\login.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("login.html admin patched")
