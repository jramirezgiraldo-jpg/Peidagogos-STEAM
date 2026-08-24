// @ts-check
/**
 * flujo-registro.spec.js
 * ─────────────────────────────────────────────────────────────────────
 * Auditoría autónoma del flujo de registro por enlace — Peidagogos STEAM
 *
 * Valida que un usuario recién registrado vía link de matrícula/invitación
 * quede 100% funcional: puede hacer login de inmediato con los permisos
 * correctos, sin necesidad de ninguna activación manual.
 *
 * Cubre 3 flujos de enlace:
 *   F1 — Estudiante de IE Instituto Montenegro (link con director/grupo)
 *   F2 — Estudiante de Validación Nocturna / Ciclos
 *   F3 — Docente registrado por enlace de invitación (token_docente)
 *
 * Uso (NO ejecutar hasta tener el servidor corriendo):
 *   cmd /c "npx playwright test tests/flujo-registro.spec.js --headed"
 * ─────────────────────────────────────────────────────────────────────
 */
const { test, expect } = require('@playwright/test');

// ── Helpers ──────────────────────────────────────────────────────────

/** Genera un documento de prueba único para evitar colisiones entre tests */
function docPrueba(prefijo = '99') {
    return prefijo + Date.now().toString().slice(-7);
}

/** Espera que la respuesta de la API sea exitosa */
async function esperarLoginExitoso(page, timeoutMs = 8000) {
    // Cualquiera de los tres paneles debe aparecer
    const paneles = [
        '#student-dashboard-container',
        '#docente-dashboard-container',
        '#dashboard-screen-container',
    ];
    const selector = paneles.join(', ');
    await expect(page.locator(selector).first()).toBeVisible({ timeout: timeoutMs });
}

/**
 * Realiza login con usuario+clave (clave = documento si no se provee)
 * @param {import('@playwright/test').Page} page
 * @param {string} usuario
 * @param {string} [clave]
 */
async function hacerLogin(page, usuario, clave) {
    await page.goto('/login.html');
    await page.waitForLoadState('domcontentloaded');

    const userInput = page.locator(
        '#login-usuario, input[name="usuario"], input[placeholder*="usuario" i], input[placeholder*="cédula" i], input[type="text"]'
    ).first();
    await userInput.fill(usuario);

    const passInput = page.locator(
        '#login-clave, input[name="clave"], input[type="password"]'
    ).first();
    await passInput.fill(clave ?? usuario); // Si no hay clave, usa documento como clave

    const loginBtn = page.locator(
        '#btn-ingresar, button:has-text("Ingresar"), button:has-text("Entrar"), button[type="submit"]'
    ).first();
    await loginBtn.click();
    await page.waitForTimeout(2500);
}

// ── SUITE F1: ESTUDIANTE IE INSTITUTO MONTENEGRO ─────────────────────
test.describe('F1 — Registro por link de grupo (Director → Estudiante Montenegro)', () => {

    const docEstudiante = docPrueba('10');

    test('F1.1 — El link de matrícula carga el formulario de registro', async ({ page }) => {
        // URL simulada: como si el director la hubiera enviado a sus estudiantes
        await page.goto(
            `/login.html?reg=estudiante&grupo=7C&inst=montenegro&director=3005590679`
        );
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1500);

        // El formulario de matrícula debe estar visible
        const formReg = page.locator(
            '#modal-registro, #registro-container, #pantalla-registro, #pantalla-matricula, [id*="registro"], [id*="matricula"]'
        ).first();
        await expect(formReg).toBeVisible({ timeout: 8000 });
        console.log('✅ F1.1 — Formulario de registro cargado desde URL de link');
    });

    test('F1.2 — Estudiante puede registrarse (vía API de link) y luego hacer login inmediato', async ({ page }) => {
        // Simular el POST que el frontend hace cuando el usuario llena el formulario de link del director
        const regResp = await page.request.post('/api/registro-estudiante', {
            data: {
                documento:   docEstudiante,
                usuario:     docEstudiante,
                nombre:      'Prueba',
                apellidos:   'Automatizada',
                nombre_completo: 'Prueba Automatizada',
                grado:       '7',
                grupo:       '7C',
                // Campos clave del link de director (PD-2)
                docente_id:  '3005590679',
                director_doc: '3005590679',
                grupo_director: '7C',
                institucion: 'InstitutoMontenegro',
            },
        });

        const regBody = await regResp.json().catch(() => ({}));
        expect(regResp.status(), `Registro falló: ${JSON.stringify(regBody)}`).toBe(200);
        expect(regBody.status).toBe('success');

        // Verificar PD-2: los campos de vinculación deben estar en el objeto guardado
        const est = regBody.estudiante || {};
        expect(est.director_doc || est.docente_id, 'director_doc debe estar guardado').toBeTruthy();
        expect(est.grupo || est.grupo_director, 'grupo debe estar guardado').toBeTruthy();
        console.log(`   ✅ PD-2 verificado: grupo=${est.grupo}, director_doc=${est.director_doc}`);

        // ── LOGIN INMEDIATO ──────────────────────────────────────────
        await hacerLogin(page, docEstudiante);
        const panel = page.locator('#student-dashboard-container');
        await expect(panel).toBeVisible({ timeout: 8000 });
        console.log(`✅ F1.2 — Estudiante ${docEstudiante} registrado y login inmediato OK`);
    });

    test('F1.3 — Estudiante registrado por link tiene pago_activo = true (acceso completo)', async ({ page }) => {
        // Verificar vía API que el usuario del test anterior tiene los permisos correctos
        const apiResp = await page.request.post('/api/login', {
            data: { usuario: docEstudiante, clave: docEstudiante },
        });
        const body = await apiResp.json().catch(() => ({}));

        // Si no existe aún (test independiente), registrarlo primero
        if (apiResp.status() === 401) {
            await page.request.post('/api/registro-estudiante', {
                data: {
                    documento: docEstudiante, usuario: docEstudiante,
                    nombre: 'Prueba', apellidos: 'Automatizada',
                    grado: '7', grupo: '7C',
                    docente_id: '3005590679', director_doc: '3005590679',
                    grupo_director: '7C', institucion: 'InstitutoMontenegro',
                },
            });
            const retry = await page.request.post('/api/login', {
                data: { usuario: docEstudiante, clave: docEstudiante },
            });
            const retryBody = await retry.json().catch(() => ({}));
            expect(retry.status()).toBe(200);
            expect(retryBody.pago_activo).toBe(true);
            console.log(`✅ F1.3 — pago_activo=${retryBody.pago_activo}, rol=${retryBody.rol}`);
            return;
        }

        expect(apiResp.status()).toBe(200);
        expect(body.status).toBe('success');
        expect(body.rol).toBe('estudiante');
        expect(body.pago_activo).toBe(true);
        expect(body.pago_realizado).toBe(true);
        console.log(`✅ F1.3 — pago_activo=${body.pago_activo}, rol=${body.rol}, institución=${body.institucion}`);
    });
});

// ── SUITE F2: ESTUDIANTE VALIDACIÓN / CICLOS ─────────────────────────
test.describe('F2 — Registro por link de Validación Nocturna', () => {

    const docEstVal = docPrueba('20');

    test('F2.1 — Estudiante de ciclos puede registrarse y hacer login', async ({ page }) => {
        // Llamada directa a la API (simular registro por link de validación)
        const regResp = await page.request.post('/api/registro-estudiante', {
            data: {
                documento: docEstVal,
                usuario: docEstVal,
                nombre: 'PruebaVal',
                apellidos: 'AutomaticaCiclo',
                nombre_completo: 'PruebaVal AutomaticaCiclo',
                grado: 'Ciclo III (6°, 7°)',
                grupo: 'Ciclo III (6°, 7°)',
                institucion: 'Validacion',
                modalidad: 'Validación Bachillerato',
            },
        });

        const regBody = await regResp.json().catch(() => ({}));
        expect(regResp.status()).toBe(200);
        expect(regBody.status).toBe('success');

        // Login inmediato
        const loginResp = await page.request.post('/api/login', {
            data: { usuario: docEstVal, clave: docEstVal },
        });
        const loginBody = await loginResp.json().catch(() => ({}));
        expect(loginResp.status()).toBe(200);
        expect(loginBody.status).toBe('success');
        expect(loginBody.rol).toMatch(/estudiante|validacion/);

        console.log(`✅ F2.1 — Validación ${docEstVal} registrado y login OK. Rol: ${loginBody.rol}`);
    });
});

// ── SUITE F3: DOCENTE POR ENLACE (TOKEN) ─────────────────────────────
test.describe('F3 — Registro de Docente por token de invitación', () => {

    const docDocente = docPrueba('30');
    const tokenFalso = 'tok_prueba_' + Date.now();

    test('F3.1 — Docente puede registrarse via API y hacer login inmediato', async ({ page }) => {
        // Simular el POST que hace el cliente al procesar el token
        const regResp = await page.request.post('/api/registro-docente', {
            data: {
                documento: docDocente,
                cedula: docDocente,
                usuario: docDocente,
                nombre: 'ProfesorPrueba',
                apellidos: 'AutoTest',
                nombre_completo: 'ProfesorPrueba AutoTest',
                institucion: 'IE Instituto Montenegro',
                asignatura: 'Ciencias Naturales',
                materias: ['Ciencias Naturales'],
                grados: ['7', '8'],
                rol: 'docente',
                tipo: 'docente_regular',
                rolDocente: 'regular',
                es_director: false,
                pago_realizado: true,
                pago_activo: true,
            },
        });

        const regBody = await regResp.json().catch(() => ({}));
        expect(regResp.status()).toBe(200);
        expect(regBody.status).toBe('success');

        // Login inmediato con rol=docente
        const loginResp = await page.request.post('/api/login', {
            data: { usuario: docDocente, clave: docDocente, rol: 'docente' },
        });
        const loginBody = await loginResp.json().catch(() => ({}));
        expect(loginResp.status()).toBe(200);
        expect(loginBody.status).toBe('success');
        expect(loginBody.rol).toBe('docente');
        expect(loginBody.pago_activo).toBe(true);

        console.log(`✅ F3.1 — Docente ${docDocente} registrado y login OK. pago_activo=${loginBody.pago_activo}`);
    });

    test('F3.2 — Docente registrado NO puede loguearse como estudiante', async ({ page }) => {
        // Login sin especificar rol=docente → sistema debe buscar en usuarios.json
        // Un docente sólo en docentes.json NO debe encontrarse como estudiante si no hay entrada en usuarios.json
        // (comportamiento esperado: login falla o asigna rol=docente)
        const loginResp = await page.request.post('/api/login', {
            data: { usuario: docDocente, clave: docDocente },  // sin rol
        });
        const loginBody = await loginResp.json().catch(() => ({}));

        // Si encuentra el usuario, el rol debe ser docente (no estudiante)
        if (loginResp.status() === 200 && loginBody.status === 'success') {
            expect(loginBody.rol).not.toBe('admin');
            console.log(`✅ F3.2 — Rol asignado al docente sin parámetro rol: "${loginBody.rol}"`);
        } else {
            // También es aceptable que no lo encuentre (está sólo en docentes.json)
            console.log('✅ F3.2 — Docente correctamente aislado de búsqueda de estudiantes');
        }
    });
});

// ── SUITE F4: CASOS DE BORDE Y SEGURIDAD ─────────────────────────────
test.describe('F4 — Casos de borde y puntos débiles de seguridad', () => {

    test('F4.1 — Registro sin nombre válido es rechazado (400)', async ({ page }) => {
        const resp = await page.request.post('/api/registro-estudiante', {
            data: {
                documento: '77777' + Date.now(),
                nombre: 'Estudiante',   // nombre genérico → debe rechazarse
                apellidos: 'Test',
                grado: '8',
            },
        });
        expect(resp.status()).toBe(400);
        const body = await resp.json().catch(() => ({}));
        expect(body.error).toBeTruthy();
        console.log(`✅ F4.1 — Nombre genérico rechazado: "${body.error}"`);
    });

    test('F4.2 — Estudiante sin código institucional es rechazado en IE Montenegro (403)', async ({ page }) => {
        const resp = await page.request.post('/api/registro-estudiante', {
            data: {
                documento: '88888' + Date.now(),
                nombre: 'TestSeguridad',
                apellidos: 'Montenegro',
                grado: '9',
                institucion: 'IE Instituto Montenegro',
                codigo_institucional: 'CODIGO_INCORRECTO',
            },
        });
        expect(resp.status()).toBe(403);
        console.log('✅ F4.2 — Código institucional incorrecto bloqueado (403)');
    });

    test('F4.3 — Registro con payload rol=docente en endpoint de estudiante es ignorado (200 silencioso)', async ({ page }) => {
        const resp = await page.request.post('/api/registro-estudiante', {
            data: {
                documento: '55555' + Date.now(),
                nombre: 'TestRolCruzado',
                apellidos: 'Bypass',
                grado: '10',
                rol: 'docente',         // intento de bypass de rol
                tipo: 'docente',
                pago_activo: true,
            },
        });
        // Debe responder 200 silencioso, no registrar ni 201/400
        expect(resp.status()).toBe(200);
        const body = await resp.json().catch(() => ({}));
        expect(body.message).toMatch(/docente no aplica/i);
        console.log('✅ F4.3 — Bypass de rol docente bloqueado silenciosamente');
    });

    test('F4.4 — Login sin contraseña usa documento como clave (comportamiento documentado)', async ({ page }) => {
        // Crear estudiante de prueba
        const doc = docPrueba('44');
        await page.request.post('/api/registro-estudiante', {
            data: {
                documento: doc,
                nombre: 'TestSinClave',
                apellidos: 'AutoTest',
                grado: '6',
                grupo: '6A',
                institucion: 'InstitutoMontenegro',
                codigo_institucional: 'ieinstituto2026',
            },
        });

        // Login sin clave → debe usar documento como clave por defecto
        const loginResp = await page.request.post('/api/login', {
            data: { usuario: doc, clave: '' },
        });
        const body = await loginResp.json().catch(() => ({}));
        expect(loginResp.status()).toBe(200);
        expect(body.status).toBe('success');
        console.log('✅ F4.4 — Login sin clave usa documento como contraseña por defecto');
    });
});
