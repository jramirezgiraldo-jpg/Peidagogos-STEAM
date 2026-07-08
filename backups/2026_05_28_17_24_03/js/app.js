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
});
