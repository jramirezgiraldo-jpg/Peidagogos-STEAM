import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Modify button
old_btn = '<button style="background: transparent; color: #374151; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-weight: 500; cursor: pointer; text-align: left;">👤 Nuevo Usuario</button>'
new_btn = '<button id="btn-show-register" style="background: transparent; color: #374151; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-weight: 500; cursor: pointer; text-align: left;">👤 Nuevo Usuario</button>'
html = html.replace(old_btn, new_btn)

# Insert register container
register_html = '''
<div id="register-screen-container" style="display: none; height: 100vh; background-color: #f3f4f6; justify-content: center; align-items: center; padding: 20px;">
    <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 500px; display: flex; flex-direction: column; gap: 15px;">
        
        <div style="text-align: center; margin-bottom: 10px;">
            <h2 style="font-size: 1.8rem; font-weight: 800; color: #111827; margin: 0;">Registro de Estudiante</h2>
            <p style="color: #6B7280; font-size: 0.95rem; margin-top: 5px;">Completa los datos para crear un perfil acad&eacute;mico.</p>
        </div>

        <input type="text" id="reg-apellidos" placeholder="Apellidos" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-family: inherit;">
        <input type="text" id="reg-nombre" placeholder="Nombres" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-family: inherit;">
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <input type="number" id="reg-edad" placeholder="Edad" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-family: inherit;">
            <select id="reg-genero" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-family: inherit; background: white;">
                <option value="">G&eacute;nero...</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="Otro">Otro</option>
            </select>
        </div>

        <select id="reg-grado" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-family: inherit; background: white;">
            <option value="">Selecciona el Grado a cursar...</option>
            <option value="6">Grado 6&deg;</option>
            <option value="7">Grado 7&deg;</option>
            <option value="8">Grado 8&deg;</option>
            <option value="9">Grado 9&deg;</option>
            <option value="10">Grado 10&deg;</option>
            <option value="11">Grado 11&deg;</option>
        </select>

        <button id="btn-submit-register" style="background-color: #10B981; color: white; padding: 14px; border: none; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: 0.3s; margin-top: 10px;">Crear Estudiante</button>
        <button id="btn-cancel-register" style="background-color: transparent; color: #6B7280; padding: 10px; border: none; font-weight: 500; cursor: pointer; text-decoration: underline;">Volver al Acceso Principal</button>
        
        <div id="reg-feedback-msg" style="text-align: center; font-size: 0.9rem; display: none; font-weight: bold;"></div>
    </div>
</div>
'''

html = html.replace('<!-- DASHBOARD ADMIN RECREADO -->', register_html + '\n        <!-- DASHBOARD ADMIN RECREADO -->')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Update app.js
with open('js/app.js', 'a', encoding='utf-8') as f:
    f.write('''\n\n// --- LÓGICA DEL MÓDULO DE REGISTRO SPA ---
document.addEventListener('DOMContentLoaded', () => {
    const btnShowReg = document.getElementById('btn-show-register');
    const btnCancelReg = document.getElementById('btn-cancel-register');
    const btnSubmitReg = document.getElementById('btn-submit-register');
    const loginView = document.getElementById('login-screen-container');
    const regView = document.getElementById('register-screen-container');
    const feedback = document.getElementById('reg-feedback-msg');

    // 1. Ocultar Login y Mostrar Registro
    if (btnShowReg) {
        btnShowReg.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.style.display = 'none';
            regView.style.display = 'flex';
        });
    }

    // 2. Ocultar Registro y Mostrar Login (Volver)
    if (btnCancelReg) {
        btnCancelReg.addEventListener('click', (e) => {
            e.preventDefault();
            regView.style.display = 'none';
            loginView.style.display = 'grid'; // Grid porque es 50/50
            feedback.style.display = 'none';
        });
    }

    // 3. Procesar Formulario
    if (btnSubmitReg) {
        btnSubmitReg.addEventListener('click', (e) => {
            e.preventDefault();
            const ap = document.getElementById('reg-apellidos').value.trim();
            const nom = document.getElementById('reg-nombre').value.trim();
            const ed = document.getElementById('reg-edad').value.trim();
            const gen = document.getElementById('reg-genero').value;
            const gra = document.getElementById('reg-grado').value;

            if (!ap || !nom || !ed || !gen || !gra) {
                feedback.style.color = '#e74c3c';
                feedback.style.display = 'block';
                feedback.innerHTML = '⚠️ Todos los campos son obligatorios.';
                return;
            }

            feedback.style.color = '#3B82F6';
            feedback.style.display = 'block';
            feedback.innerHTML = '⏳ Registrando en la base de datos...';

            // Conexión con el backend de Python
            fetch('/api/registro-estudiante', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
            })
            .then(res => {
                if (res.ok) {
                    feedback.style.color = '#10B981';
                    feedback.innerHTML = '✅ ¡Estudiante registrado exitosamente!';
                    setTimeout(() => {
                        document.querySelectorAll('#register-screen-container input, #register-screen-container select').forEach(el => el.value = '');
                        regView.style.display = 'none';
                        loginView.style.display = 'grid';
                        feedback.style.display = 'none';
                    }, 2500);
                } else {
                    throw new Error('Error de servidor');
                }
            })
            .catch(err => {
                console.error(err);
                feedback.style.color = '#e74c3c';
                feedback.innerHTML = '❌ Error de red o servidor no responde.';
            });
        });
    }
});
''')
