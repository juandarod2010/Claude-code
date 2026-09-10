import { defineConfig, devices } from '@playwright/test';

/**
 * Recorrido de extremo a extremo.
 *
 * Levanta la aplicación de verdad y la recorre en un navegador de verdad. Es lo
 * que cubre las pantallas: los tests de Vitest cubren la lógica, y una cobertura
 * de renderizado no habría detectado ninguno de los fallos que sí detectó esto
 * (el guion largo que las fuentes del PDF se comían, el 404 del favicon, la
 * sesión que no se cerraba).
 *
 * Primera vez: `npx playwright install chromium`.
 * Si ya tienes un Chromium en otro sitio, exporta PLAYWRIGHT_CHROMIUM_PATH.
 */
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? 'line' : 'list',
  timeout: 45_000,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    ...(chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {}),
  },
  webServer: {
    // Se prueba el build, no el servidor de desarrollo: es lo que se despliega.
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
