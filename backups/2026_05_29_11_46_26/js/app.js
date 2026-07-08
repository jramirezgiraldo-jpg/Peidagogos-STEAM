document.addEventListener("DOMContentLoaded", function() {
    const btnShowReg = document.getElementById("btn-show-register");
    const btnCancelReg = document.getElementById("btn-cancel-register");
    const btnSubmitReg = document.getElementById("btn-submit-register");
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
    if (loginBtn) {
        loginBtn.addEventListener("click", function(e) {
            e.preventDefault();
            const user = document.getElementById("admin-user").value.trim();
            const pass = document.getElementById("admin-pass").value.trim();
            if (user === "jramirezgiraldo" && pass === "Biol2008%") {
                loginView.style.display = "none";
                dashboardView.style.display = "block";
            } else {
                document.getElementById("login-error-msg").style.display = "block";
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