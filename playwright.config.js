// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright Config — Peidagogos STEAM
 * Documentación: https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
    testDir: './tests',
    fullyParallel: false,       // login tests run sequentially to avoid session conflicts
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,                 // single worker for auth tests
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ],
    use: {
        // Base URL — change to production URL when ready
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
        locale: 'es-CO',
        timezoneId: 'America/Bogota',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    // NO webServer block — start your server manually before running tests
});
