document.addEventListener('DOMContentLoaded', function() {
    const btnShowReg = document.getElementById('btn-show-register');
    const btnCancelReg = document.getElementById('btn-cancel-register');
    const loginView = document.getElementById('login-screen-container');
    const regView = document.getElementById('register-screen-container');
    const dashboardView = document.getElementById('dashboard-screen-container'); // NUEVO
    const feedback = document.getElementById('reg-feedback-msg');

    const loginBtn = document.getElementById('btn-login-core');
    const userField = document.getElementById('admin-user');
    const passField = document.getElementById('admin-pass');
    const errorMsg = document.getElementById('login-error-msg');

    if (btnShowReg && loginView && regView) {
        btnShowReg.addEventListener('click', function(e) {
            e.preventDefault();
            loginView.style.display = 'none';
            regView.style.display = 'flex';
            const btnSubmitReg = document.getElementById('btn-submit-register');
    const feedbackMsg = document.getElementById('reg-feedback-msg'); // Mensaje en pantalla
    
    if (btnSubmitReg) {
        btnSubmitReg.addEventListener('click', async function(e) {
            e.preventDefault();
            const doc = document.getElementById('reg-documento') ? document.getElementById('reg-documento').value.trim() : '';
            const ap = document.getElementById('reg-apellidos') ? document.getElementById('reg-apellidos').value.trim() : '';
            const nom = document.getElementById('reg-nombre') ? document.getElementById('reg-nombre').value.trim() : '';
            const ed = document.getElementById('reg-edad') ? document.getElementById('reg-edad').value.trim() : '';
            const gen = document.getElementById('reg-genero') ? document.getElementById('reg-genero').value : '';
            const gra = document.getElementById('reg-grado') ? document.getElementById('reg-grado').value : '';

            if (!doc || !ap || !nom || !ed || !gen || !gra) {
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '⚠️ Completa todos los campos, incluyendo el documento.'; }
                return;
            }

            btnSubmitReg.innerText = 'Guardando...';
            btnSubmitReg.disabled = true;

            try {
                const response = await fetch('/api/registro-estudiante', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
                });
                
                if (response.ok) {
                    if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#10B981'; feedbackMsg.innerText = '✅ Estudiante guardado con éxito.'; }
                    setTimeout(() => {
                        document.getElementById('register-screen-container').style.display = 'none';
                        document.getElementById('login-screen-container').style.display = 'grid';
                        btnSubmitReg.innerText = 'Crear Estudiante';
                        btnSubmitReg.disabled = false;
                        if(feedbackMsg) feedbackMsg.style.display = 'none';
                        document.querySelectorAll('#register-screen-container input, #register-screen-container select').forEach(el => el.value = '');
                    }, 2000);
                } else {
                    throw new Error('Fallo en el servidor');
                }
            } catch (error) {
                console.error(error);
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '❌ Error de conexión con el motor Python.'; }
                btnSubmitReg.innerText = 'Crear Estudiante';
                btnSubmitReg.disabled = false;
            }
        });
    }\n});
    }

    if (btnCancelReg && loginView && regView) {
        btnCancelReg.addEventListener('click', function(e) {
            e.preventDefault();
            regView.style.display = 'none';
            loginView.style.display = 'grid';
            if (feedback) feedback.style.display = 'none';
            const btnSubmitReg = document.getElementById('btn-submit-register');
    const feedbackMsg = document.getElementById('reg-feedback-msg'); // Mensaje en pantalla
    
    if (btnSubmitReg) {
        btnSubmitReg.addEventListener('click', async function(e) {
            e.preventDefault();
            const doc = document.getElementById('reg-documento') ? document.getElementById('reg-documento').value.trim() : '';
            const ap = document.getElementById('reg-apellidos') ? document.getElementById('reg-apellidos').value.trim() : '';
            const nom = document.getElementById('reg-nombre') ? document.getElementById('reg-nombre').value.trim() : '';
            const ed = document.getElementById('reg-edad') ? document.getElementById('reg-edad').value.trim() : '';
            const gen = document.getElementById('reg-genero') ? document.getElementById('reg-genero').value : '';
            const gra = document.getElementById('reg-grado') ? document.getElementById('reg-grado').value : '';

            if (!doc || !ap || !nom || !ed || !gen || !gra) {
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '⚠️ Completa todos los campos, incluyendo el documento.'; }
                return;
            }

            btnSubmitReg.innerText = 'Guardando...';
            btnSubmitReg.disabled = true;

            try {
                const response = await fetch('/api/registro-estudiante', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
                });
                
                if (response.ok) {
                    if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#10B981'; feedbackMsg.innerText = '✅ Estudiante guardado con éxito.'; }
                    setTimeout(() => {
                        document.getElementById('register-screen-container').style.display = 'none';
                        document.getElementById('login-screen-container').style.display = 'grid';
                        btnSubmitReg.innerText = 'Crear Estudiante';
                        btnSubmitReg.disabled = false;
                        if(feedbackMsg) feedbackMsg.style.display = 'none';
                        document.querySelectorAll('#register-screen-container input, #register-screen-container select').forEach(el => el.value = '');
                    }, 2000);
                } else {
                    throw new Error('Fallo en el servidor');
                }
            } catch (error) {
                console.error(error);
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '❌ Error de conexión con el motor Python.'; }
                btnSubmitReg.innerText = 'Crear Estudiante';
                btnSubmitReg.disabled = false;
            }
        });
    }\n});
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const username = userField ? userField.value.trim() : '';
            const password = passField ? passField.value.trim() : '';
            
            if (username === 'jramirezgiraldo' && password === 'Biol2008%') {
                if (loginView) loginView.style.display = 'none';
                if (dashboardView) {
                    dashboardView.style.display = 'block'; // ENCIENDE EL DASHBOARD
                } else {
                    console.error("ERROR: No se encontró el id 'dashboard-screen-container' en el HTML.");
                }
            } else {
                if (errorMsg) {
                    errorMsg.style.display = 'block';
                    errorMsg.innerText = 'Usuario o clave incorrecta.';
                }
            }
            const btnSubmitReg = document.getElementById('btn-submit-register');
    const feedbackMsg = document.getElementById('reg-feedback-msg'); // Mensaje en pantalla
    
    if (btnSubmitReg) {
        btnSubmitReg.addEventListener('click', async function(e) {
            e.preventDefault();
            const doc = document.getElementById('reg-documento') ? document.getElementById('reg-documento').value.trim() : '';
            const ap = document.getElementById('reg-apellidos') ? document.getElementById('reg-apellidos').value.trim() : '';
            const nom = document.getElementById('reg-nombre') ? document.getElementById('reg-nombre').value.trim() : '';
            const ed = document.getElementById('reg-edad') ? document.getElementById('reg-edad').value.trim() : '';
            const gen = document.getElementById('reg-genero') ? document.getElementById('reg-genero').value : '';
            const gra = document.getElementById('reg-grado') ? document.getElementById('reg-grado').value : '';

            if (!doc || !ap || !nom || !ed || !gen || !gra) {
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '⚠️ Completa todos los campos, incluyendo el documento.'; }
                return;
            }

            btnSubmitReg.innerText = 'Guardando...';
            btnSubmitReg.disabled = true;

            try {
                const response = await fetch('/api/registro-estudiante', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
                });
                
                if (response.ok) {
                    if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#10B981'; feedbackMsg.innerText = '✅ Estudiante guardado con éxito.'; }
                    setTimeout(() => {
                        document.getElementById('register-screen-container').style.display = 'none';
                        document.getElementById('login-screen-container').style.display = 'grid';
                        btnSubmitReg.innerText = 'Crear Estudiante';
                        btnSubmitReg.disabled = false;
                        if(feedbackMsg) feedbackMsg.style.display = 'none';
                        document.querySelectorAll('#register-screen-container input, #register-screen-container select').forEach(el => el.value = '');
                    }, 2000);
                } else {
                    throw new Error('Fallo en el servidor');
                }
            } catch (error) {
                console.error(error);
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '❌ Error de conexión con el motor Python.'; }
                btnSubmitReg.innerText = 'Crear Estudiante';
                btnSubmitReg.disabled = false;
            }
        });
    }\n});
    }

    if (btnSubmitReg) {
        btnSubmitReg.addEventListener('click', function(e) {
            e.preventDefault();
            const doc = document.getElementById('reg-documento') ? document.getElementById('reg-documento').value.trim() : '';
            const ap = document.getElementById('reg-apellidos').value.trim();
            const nom = document.getElementById('reg-nombre').value.trim();
            const ed = document.getElementById('reg-edad').value.trim();
            const gen = document.getElementById('reg-genero').value;
            const gra = document.getElementById('reg-grado').value;

            if (!doc || !ap || !nom || !ed || !gen || !gra) {
                alert('⚠️ Por favor, completa todos los campos, incluyendo el Documento.');
                return;
            }

            // Petición al servidor Python
            fetch('/api/registro-estudiante', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
            })
            .then(res => {
                if (res.ok) {
                    alert('✅ ¡Estudiante ' + nom + ' ' + ap + ' registrado exitosamente!');
                    // Limpiar campos
                    document.querySelectorAll('#register-screen-container input, #register-screen-container select').forEach(el => el.value = '');
                    regView.style.display = 'none';
                    loginView.style.display = 'grid';
                } else {
                    alert('❌ Error del servidor al registrar.');
                }
            })
            .catch(err => {
                console.error(err);
                alert('❌ El servidor Python no responde o está apagado.');
                const btnSubmitReg = document.getElementById('btn-submit-register');
    const feedbackMsg = document.getElementById('reg-feedback-msg'); // Mensaje en pantalla
    
    if (btnSubmitReg) {
        btnSubmitReg.addEventListener('click', async function(e) {
            e.preventDefault();
            const doc = document.getElementById('reg-documento') ? document.getElementById('reg-documento').value.trim() : '';
            const ap = document.getElementById('reg-apellidos') ? document.getElementById('reg-apellidos').value.trim() : '';
            const nom = document.getElementById('reg-nombre') ? document.getElementById('reg-nombre').value.trim() : '';
            const ed = document.getElementById('reg-edad') ? document.getElementById('reg-edad').value.trim() : '';
            const gen = document.getElementById('reg-genero') ? document.getElementById('reg-genero').value : '';
            const gra = document.getElementById('reg-grado') ? document.getElementById('reg-grado').value : '';

            if (!doc || !ap || !nom || !ed || !gen || !gra) {
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '⚠️ Completa todos los campos, incluyendo el documento.'; }
                return;
            }

            btnSubmitReg.innerText = 'Guardando...';
            btnSubmitReg.disabled = true;

            try {
                const response = await fetch('/api/registro-estudiante', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
                });
                
                if (response.ok) {
                    if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#10B981'; feedbackMsg.innerText = '✅ Estudiante guardado con éxito.'; }
                    setTimeout(() => {
                        document.getElementById('register-screen-container').style.display = 'none';
                        document.getElementById('login-screen-container').style.display = 'grid';
                        btnSubmitReg.innerText = 'Crear Estudiante';
                        btnSubmitReg.disabled = false;
                        if(feedbackMsg) feedbackMsg.style.display = 'none';
                        document.querySelectorAll('#register-screen-container input, #register-screen-container select').forEach(el => el.value = '');
                    }, 2000);
                } else {
                    throw new Error('Fallo en el servidor');
                }
            } catch (error) {
                console.error(error);
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '❌ Error de conexión con el motor Python.'; }
                btnSubmitReg.innerText = 'Crear Estudiante';
                btnSubmitReg.disabled = false;
            }
        });
    }\n});
            const btnSubmitReg = document.getElementById('btn-submit-register');
    const feedbackMsg = document.getElementById('reg-feedback-msg'); // Mensaje en pantalla
    
    if (btnSubmitReg) {
        btnSubmitReg.addEventListener('click', async function(e) {
            e.preventDefault();
            const doc = document.getElementById('reg-documento') ? document.getElementById('reg-documento').value.trim() : '';
            const ap = document.getElementById('reg-apellidos') ? document.getElementById('reg-apellidos').value.trim() : '';
            const nom = document.getElementById('reg-nombre') ? document.getElementById('reg-nombre').value.trim() : '';
            const ed = document.getElementById('reg-edad') ? document.getElementById('reg-edad').value.trim() : '';
            const gen = document.getElementById('reg-genero') ? document.getElementById('reg-genero').value : '';
            const gra = document.getElementById('reg-grado') ? document.getElementById('reg-grado').value : '';

            if (!doc || !ap || !nom || !ed || !gen || !gra) {
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '⚠️ Completa todos los campos, incluyendo el documento.'; }
                return;
            }

            btnSubmitReg.innerText = 'Guardando...';
            btnSubmitReg.disabled = true;

            try {
                const response = await fetch('/api/registro-estudiante', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
                });
                
                if (response.ok) {
                    if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#10B981'; feedbackMsg.innerText = '✅ Estudiante guardado con éxito.'; }
                    setTimeout(() => {
                        document.getElementById('register-screen-container').style.display = 'none';
                        document.getElementById('login-screen-container').style.display = 'grid';
                        btnSubmitReg.innerText = 'Crear Estudiante';
                        btnSubmitReg.disabled = false;
                        if(feedbackMsg) feedbackMsg.style.display = 'none';
                        document.querySelectorAll('#register-screen-container input, #register-screen-container select').forEach(el => el.value = '');
                    }, 2000);
                } else {
                    throw new Error('Fallo en el servidor');
                }
            } catch (error) {
                console.error(error);
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '❌ Error de conexión con el motor Python.'; }
                btnSubmitReg.innerText = 'Crear Estudiante';
                btnSubmitReg.disabled = false;
            }
        });
    }\n});
    }

    const btnSubmitReg = document.getElementById('btn-submit-register');
    const feedbackMsg = document.getElementById('reg-feedback-msg'); // Mensaje en pantalla
    
    if (btnSubmitReg) {
        btnSubmitReg.addEventListener('click', async function(e) {
            e.preventDefault();
            const doc = document.getElementById('reg-documento') ? document.getElementById('reg-documento').value.trim() : '';
            const ap = document.getElementById('reg-apellidos') ? document.getElementById('reg-apellidos').value.trim() : '';
            const nom = document.getElementById('reg-nombre') ? document.getElementById('reg-nombre').value.trim() : '';
            const ed = document.getElementById('reg-edad') ? document.getElementById('reg-edad').value.trim() : '';
            const gen = document.getElementById('reg-genero') ? document.getElementById('reg-genero').value : '';
            const gra = document.getElementById('reg-grado') ? document.getElementById('reg-grado').value : '';

            if (!doc || !ap || !nom || !ed || !gen || !gra) {
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '⚠️ Completa todos los campos, incluyendo el documento.'; }
                return;
            }

            btnSubmitReg.innerText = 'Guardando...';
            btnSubmitReg.disabled = true;

            try {
                const response = await fetch('/api/registro-estudiante', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documento: doc, apellidos: ap, nombre: nom, edad: ed, genero: gen, grado: gra })
                });
                
                if (response.ok) {
                    if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#10B981'; feedbackMsg.innerText = '✅ Estudiante guardado con éxito.'; }
                    setTimeout(() => {
                        document.getElementById('register-screen-container').style.display = 'none';
                        document.getElementById('login-screen-container').style.display = 'grid';
                        btnSubmitReg.innerText = 'Crear Estudiante';
                        btnSubmitReg.disabled = false;
                        if(feedbackMsg) feedbackMsg.style.display = 'none';
                        document.querySelectorAll('#register-screen-container input, #register-screen-container select').forEach(el => el.value = '');
                    }, 2000);
                } else {
                    throw new Error('Fallo en el servidor');
                }
            } catch (error) {
                console.error(error);
                if(feedbackMsg) { feedbackMsg.style.display = 'block'; feedbackMsg.style.color = '#e74c3c'; feedbackMsg.innerText = '❌ Error de conexión con el motor Python.'; }
                btnSubmitReg.innerText = 'Crear Estudiante';
                btnSubmitReg.disabled = false;
            }
        });
    }\n});
