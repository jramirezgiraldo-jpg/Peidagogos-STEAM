import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace handleLogin completely to match exact requirements
new_handle_login = '''
    handleLogin(e) {
        if(e) { e.preventDefault(); }
        console.log("Intento de ingreso detectado");
        
        const user = document.getElementById('login-username').value.trim();
        const pass = document.getElementById('login-password').value.trim();
        console.log("Valores capturados:", user, pass);

        // Admin Auth mock (Hardcoded temporal)
        if((user === "jramirezgiraldo" || user === "jramriezgiraldo") && pass === "Biol2008%") {
            alert("Bienvenido, Administrador");
            this.setSession({ role: 'admin', name: 'Administrador' });
            this.navigate('view-admin');
            return;
        }

        // Student Auth mock
        const estudiantes = JSON.parse(localStorage.getItem('estudiantes') || '[]');
        const student = estudiantes.find(s => s.documento === user);
        
        if(student && pass === student.documento) {
            alert("Bienvenido Estudiante: " + student.nombres);
            this.setSession({ role: 'student', ...student });
            this.renderStudentDashboard();
            this.navigate('view-student');
        } else {
            alert("Usuario o clave incorrecta");
        }
    },
'''

js = re.sub(r'(?s)    handleLogin\(e\) \{.*?\},(\n\n\s+handleRegister)', new_handle_login.strip() + r',\1', js, count=1)

with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
