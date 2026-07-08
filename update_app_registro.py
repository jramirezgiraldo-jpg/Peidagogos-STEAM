with open('app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the registration block
old_reg = '''                    document.getElementById("login-screen-container").style.display = "grid";
                    document.getElementById("reg-documento").value = "";
                    document.getElementById("reg-apellidos").value = "";
                    document.getElementById("reg-nombre").value = "";
                    document.getElementById("reg-edad").value = "";
                    document.getElementById("reg-genero").value = "";
                    document.getElementById("reg-grado").value = "";
                } else {'''

new_reg = '''                    document.getElementById("login-screen-container").style.display = "grid";
                    document.getElementById("reg-documento").value = "";
                    document.getElementById("reg-apellidos").value = "";
                    document.getElementById("reg-nombre").value = "";
                    document.getElementById("reg-edad").value = "";
                    document.getElementById("reg-genero").value = "";
                    document.getElementById("reg-grado").value = "";
                    
                    // Actualizar dinámicamente la tabla del admin
                    if (typeof cargarEstudiantesAdmin === 'function') {
                        cargarEstudiantesAdmin();
                    }
                } else {'''

js = js.replace(old_reg, new_reg)

# Replace the login block
old_login = '''            const user = document.getElementById("admin-user") ? document.getElementById("admin-user").value.trim() : "";
            const pass = document.getElementById("admin-pass") ? document.getElementById("admin-pass").value.trim() : "";'''

new_login = '''            const user = document.getElementById("admin-user") ? String(document.getElementById("admin-user").value).trim() : "";
            const pass = document.getElementById("admin-pass") ? String(document.getElementById("admin-pass").value).trim() : "";'''

js = js.replace(old_login, new_login)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js)
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
