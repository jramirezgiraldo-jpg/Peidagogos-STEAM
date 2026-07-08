document.addEventListener("DOMContentLoaded", function() {
    const btnShowReg = document.getElementById("btn-show-register");
    const btnCancelReg = document.getElementById("btn-cancel-register");
    const loginView = document.getElementById("login-screen-container");
    const regView = document.getElementById("register-screen-container");
    const dashboardView = document.getElementById("dashboard-screen-container");

    if (btnShowReg) {
        btnShowReg.addEventListener("click", function(e) {
            e.preventDefault();
            loginView.style.display = "none";
            regView.style.display = "flex";
        });
    }

    if (btnCancelReg) {
        btnCancelReg.addEventListener("click", function(e) {
            e.preventDefault();
            regView.style.display = "none";
            loginView.style.display = "grid";
        });
    }

    const loginBtn = document.getElementById("btn-login-core");
    const errorMsg = document.getElementById("login-error-msg");

    if (loginBtn) {
        loginBtn.addEventListener("click", async function(e) {
            e.preventDefault();
            const user = document.getElementById("admin-user") ? document.getElementById("admin-user").value.trim() : "";
            const pass = document.getElementById("admin-pass") ? document.getElementById("admin-pass").value.trim() : "";
            
            // 1. Acceso Maestro (Profesor)
            if (user === "jramirezgiraldo" && pass === "Biol2008%") {
                if (loginView) loginView.style.display = "none";
                if (dashboardView) dashboardView.style.display = "block";
                if (errorMsg) errorMsg.style.display = "none";
                return;
            }

            // 2. Acceso Estudiante (Validación en Python)
            if (!user || !pass) {
                if (errorMsg) { errorMsg.style.display = "block"; errorMsg.innerText = "Ingresa documento en ambos campos."; }
                return;
            }

            loginBtn.innerText = "Verificando...";
            
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuario: user, clave: pass })
                });
                const data = await res.json();
                
                if (data.status === 'success') {
                    // Entrada permitida
                    if (loginView) loginView.style.display = "none";
                    if (dashboardView) dashboardView.style.display = "block";
                    if (errorMsg) errorMsg.style.display = "none";
                    console.log("Ingreso exitoso: " + data.nombre);
                } else {
                    // Entrada rechazada
                    if (errorMsg) { errorMsg.style.display = "block"; errorMsg.innerText = "Credenciales incorrectas o estudiante no registrado."; }
                }
            } catch (err) {
                console.error(err);
                if (errorMsg) { errorMsg.style.display = "block"; errorMsg.innerText = "Error conectando al servidor."; }
            } finally {
                loginBtn.innerText = "Iniciar Sesión";
            }
        });
    }

    const btnSubmit = document.getElementById("btn-submit-register");
    if (btnSubmit) {
        btnSubmit.addEventListener("click", function(e) {
            e.preventDefault();
            
            const doc = document.getElementById("reg-documento") ? document.getElementById("reg-documento").value.trim() : "";
            const ap = document.getElementById("reg-apellidos") ? document.getElementById("reg-apellidos").value.trim() : "";
            const nom = document.getElementById("reg-nombre") ? document.getElementById("reg-nombre").value.trim() : "";
            const ed = document.getElementById("reg-edad") ? document.getElementById("reg-edad").value.trim() : "";
            const gen = document.getElementById("reg-genero") ? document.getElementById("reg-genero").value : "";
            const gra = document.getElementById("reg-grado") ? document.getElementById("reg-grado").value : "";

            if (!doc || !ap || !nom || !ed || !gen || !gra) {
                alert("⚠️ Por favor, completa todos los campos.");
                return;
            }

            btnSubmit.innerText = "Guardando...";
            btnSubmit.disabled = true;

            fetch("/api/registro-estudiante", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
            })
            .then(function(response) {
                if (response.ok) {
                    alert("✅ Estudiante registrado exitosamente.");
                    // Resetear formulario y volver
                    document.getElementById("register-screen-container").style.display = "none";
                    document.getElementById("login-screen-container").style.display = "grid";
                    document.getElementById("reg-documento").value = "";
                    document.getElementById("reg-apellidos").value = "";
                    document.getElementById("reg-nombre").value = "";
                    document.getElementById("reg-edad").value = "";
                    document.getElementById("reg-genero").value = "";
                    document.getElementById("reg-grado").value = "";
                } else {
                    alert("❌ Error interno del servidor al guardar.");
                }
                btnSubmit.innerText = "Crear Estudiante";
                btnSubmit.disabled = false;
            })
            .catch(function(error) {
                alert("❌ Error de red. ¿Está ejecutándose el servidor Python?");
                btnSubmit.innerText = "Crear Estudiante";
                btnSubmit.disabled = false;
            });
        });
    }
});