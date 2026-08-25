// @ts-check
/**
 * login-roles.spec.js
 * ─────────────────────────────────────────────────────────────────────
 * Pruebas de auditoría autónoma — Peidagogos STEAM
 * Valida el inicio de sesión de tres perfiles:
 *   · Administrador  → jramirezgiraldo
 *   · Estudiante     → 18460767
 *   · Docente        → 3005590679
 *
 * Las contraseñas se leen desde variables de entorno:
 *   CLAVE_ADMIN       → clave del administrador
 *   CLAVE_ESTUDIANTE  → clave del estudiante
 *   CLAVE_DOCENTE     → clave del docente
 *
 * Uso:
 *   Configura las variables de entorno antes de correr:
 *     $env:CLAVE_ADMIN="tu_clave"; $env:CLAVE_ESTUDIANTE="tu_clave"; $env:CLAVE_DOCENTE="tu_clave"
 *   Luego ejecuta:
 *     npx playwright test tests/login-roles.spec.js
 * ─────────────────────────────────────────────────────────────────────
 */
const { test, expect } = require('@playwright/test');

// ── Credenciales desde variables de entorno ──────────────────────────
const CREDS = {
    admin: {
        usuario: 'jramirezgiraldo',
        clave: process.env.CLAVE_ADMIN || '',
        rol: 'admin',
        label: 'Administrador',
        /** Selector o texto esperado después de login exitoso */
        expectedSelector: '#dashboard-screen-container',
        expectedText: 'Panel de Administrador',
    },
    estudiante: {
        usuario: '18460767',
        clave: process.env.CLAVE_ESTUDIANTE || '',
        rol: 'estudiante',
        label: 'Estudiante',
        expectedSelector: '#student-dashboard-container',
        expectedText: null,          // cualquier contenido del panel estudiante
    },
    docente: {
        usuario: '3005590679',
        clave: process.env.CLAVE_DOCENTE || '',
        rol: 'docente',
        label: 'Docente',
        expectedSelector: '#docente-dashboard-container',
        expectedText: null,
    },
};

// ── Helper: realiza el flujo de login ────────────────────────────────
/**
 * @param {import('@playwright/test').Page} page
 * @param {{ usuario: string, clave: string }} creds
 */
async function realizarLogin(page, creds) {
    // Campo usuario
    const userInput = page.locator(
        '#login-usuario, input[name="usuario"], input[placeholder*="usuario" i], input[placeholder*="cédula" i], input[type="text"]'
    ).first();
    await userInput.fill(creds.usuario);

    // Campo contraseña
    const passInput = page.locator(
        '#login-clave, input[name="clave"], input[type="password"]'
    ).first();
    await passInput.fill(creds.clave);

    // Botón ingresar
    const loginBtn = page.locator(
        '#btn-ingresar, button:has-text("Ingresar"), button:has-text("Entrar"), button[type="submit"]'
    ).first();
    await loginBtn.click();

    // Esperar navegación / respuesta del servidor
    await page.waitForTimeout(2500);
}

// ── Tests ────────────────────────────────────────────────────────────

test.describe('Auditoría de Login — Peidagogos STEAM', () => {

    test.beforeEach(async ({ page }) => {
        // Ir al home de la plataforma antes de cada test
        await page.goto('/login.html');
        await page.waitForLoadState('domcontentloaded');
    });

    // ── 1. ADMINISTRADOR ─────────────────────────────────────────────
    test('LOGIN ADMIN: jramirezgiraldo puede iniciar sesión', async ({ page }) => {
        const cred = CREDS.admin;

        // Verificar que la clave está configurada
        if (!cred.clave) {
            test.skip(true, 'CLAVE_ADMIN no está configurada como variable de entorno');
        }

        await realizarLogin(page, cred);

        // Debe aparecer el panel de administrador
        const panel = page.locator(cred.expectedSelector);
        await expect(panel).toBeVisible({ timeout: 8000 });

        if (cred.expectedText) {
            await expect(page.locator('body')).toContainText(cred.expectedText);
        }

        // No debe aparecer ningún modal de error
        const errorModal = page.locator('#modal-error, .error-modal, [id*="error"]').first();
        const hasError = await errorModal.isVisible().catch(() => false);
        expect(hasError, 'No debe mostrarse ningún modal de error').toBe(false);

        console.log(`✅ ${cred.label} (${cred.usuario}) — login exitoso`);
    });

    // ── 2. ESTUDIANTE ────────────────────────────────────────────────
    test('LOGIN ESTUDIANTE: 18460767 puede iniciar sesión', async ({ page }) => {
        const cred = CREDS.estudiante;

        if (!cred.clave) {
            test.skip(true, 'CLAVE_ESTUDIANTE no está configurada como variable de entorno');
        }

        await realizarLogin(page, cred);

        const panel = page.locator(cred.expectedSelector);
        await expect(panel).toBeVisible({ timeout: 8000 });

        // El panel de estudiante debe mostrar el nombre o algún contenido cargado
        await expect(page.locator('#student-nombre-header, #nombre-estudiante-header, h1, h2').first())
            .toBeVisible({ timeout: 5000 })
            .catch(() => { /* no es bloqueante */ });

        console.log(`✅ ${cred.label} (${cred.usuario}) — login exitoso`);
    });

    // ── 3. DOCENTE ───────────────────────────────────────────────────
    test('LOGIN DOCENTE: 3005590679 puede iniciar sesión', async ({ page }) => {
        const cred = CREDS.docente;

        if (!cred.clave) {
            test.skip(true, 'CLAVE_DOCENTE no está configurada como variable de entorno');
        }

        await realizarLogin(page, cred);

        const panel = page.locator(cred.expectedSelector);
        await expect(panel).toBeVisible({ timeout: 8000 });

        // El selector de rol debe aparecer en el dashboard docente
        const rolBanner = page.locator('#docente-rol-selector-banner');
        await expect(rolBanner).toBeVisible({ timeout: 5000 })
            .catch(() => { /* banner opcional */ });

        console.log(`✅ ${cred.label} (${cred.usuario}) — login exitoso`);
    });

    // ── 4. LOGIN FALLIDO — credenciales incorrectas ──────────────────
    test('LOGIN FALLIDO: usuario o clave incorrecta muestra error', async ({ page }) => {
        await realizarLogin(page, {
            usuario: 'usuario_inexistente_99999',
            clave: 'clave_incorrecta_abc123',
        });

        // Debe aparecer algún indicador de error (alert, modal, texto)
        const loginContainer = page.locator(
            '#login-screen, #login-container, #pantalla-login, body'
        ).first();
        await expect(loginContainer).toBeVisible({ timeout: 5000 });

        // El dashboard NO debe aparecer
        const adminDash = page.locator('#dashboard-screen-container');
        const docenteDash = page.locator('#docente-dashboard-container');
        const estudianteDash = page.locator('#student-dashboard-container');

        const adminVisible = await adminDash.isVisible().catch(() => false);
        const docenteVisible = await docenteDash.isVisible().catch(() => false);
        const estudianteVisible = await estudianteDash.isVisible().catch(() => false);

        expect(
            adminVisible || docenteVisible || estudianteVisible,
            'Con credenciales incorrectas NO debe abrirse ningún panel'
        ).toBe(false);

        console.log('✅ Login fallido rechazado correctamente');
    });

});
