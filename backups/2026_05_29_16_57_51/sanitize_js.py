import re

# 1. Nuke and rewrite js/app.js
new_js = '''document.addEventListener("DOMContentLoaded", function() {
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
'''
with open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(new_js)


# 2. Strip inline script from index.html (the one added in the previous prompt)
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# The previous prompt ended with:
# <script>
# document.addEventListener('DOMContentLoaded', function() {
# ...
# </script>
# We need to remove it so it doesn't conflict.

html = re.sub(r'<script>\s*document\.addEventListener.*?</script>', '', html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
