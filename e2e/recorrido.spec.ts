import { expect, test, type Page } from '@playwright/test';

/**
 * El recorrido completo, en el navegador y contra el build.
 * Cada bloque es lo que haría una persona: no se tocan estados internos.
 */

const ADMIN_PASSWORD = 'complyo-dev';

async function entrarEnAdmin(page: Page, ruta = '/admin/leads') {
  await page.goto(ruta);
  const password = page.getByPlaceholder('Contraseña');
  if (await password.count()) {
    await password.fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
  }
}

test.describe('Track B — cumplimiento', () => {
  test('landing, diagnóstico, informe y PDF', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('desactivar');
    await page.getByRole('link', { name: 'Ver mi exposición' }).click();
    await expect(page).toHaveURL(/\/diagnostico/);

    const siguiente = () => page.getByRole('button', { name: 'Siguiente' }).click();

    await page.getByRole('checkbox', { name: 'Alemania' }).click();
    await page.getByRole('checkbox', { name: 'Francia' }).click();
    await siguiente();
    await page.getByRole('checkbox', { name: 'Amazon EU' }).click();
    await siguiente();
    await page.getByRole('checkbox', { name: 'Electrónica de consumo' }).click();
    await siguiente();
    await page.getByRole('checkbox', { name: 'Papel y cartón' }).click();
    await siguiente();
    await page.getByRole('radio', { name: /No, vendo desde fuera/ }).click();
    await siguiente();
    await page.getByRole('radio', { name: /Más de 10.000/ }).click();
    await siguiente();
    await page.getByPlaceholder('tu@empresa.com').fill('cliente@ejemplo.invalid');
    await page.getByPlaceholder(/Nombre de tu empresa/).fill('Tienda Prueba SL');
    await siguiente();

    // La pantalla 8 resume lo respondido antes de generar nada.
    await expect(page.locator('body')).toContainText('Revisa antes de generar');
    await expect(page.locator('body')).toContainText('Alemania, Francia');

    await page.getByRole('button', { name: 'Generar mi informe' }).click();
    await expect(page).toHaveURL(/\/informe\//);

    const informe = page.locator('body');
    await expect(informe).toContainText(/INFORME-\d{8}-[A-Z0-9]{4}/);
    for (const seccion of [
      'Situación actual, país por país',
      'Qué falta y qué norma lo exige',
      'Qué pasa si no se arregla',
      'Qué cuesta y en cuánto tiempo se resuelve',
      'Resolverlo',
    ]) {
      await expect(informe).toContainText(seccion);
    }

    // El guardarraíl: con datos de ejemplo, todo va marcado.
    await expect(informe).toContainText('PENDIENTE DE VERIFICACIÓN');
    await expect(informe).toContainText('no constituye asesoramiento jurídico');

    const descarga = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar en PDF' }).click();
    const fichero = await descarga;
    expect(fichero.suggestedFilename()).toMatch(/^complyo-informe-\d{8}-[a-z0-9]{4}\.pdf$/);
  });

  test('el diagnóstico no deja avanzar sin responder', async ({ page }) => {
    await page.goto('/diagnostico');
    await expect(page.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Atrás' })).toBeDisabled();
    await page.getByRole('checkbox', { name: 'España' }).click();
    await expect(page.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(page.getByRole('button', { name: 'Atrás' })).toBeEnabled();
  });
});

test.describe('Track A — apelaciones', () => {
  test('clasifica el caso y guarda el lead', async ({ page }) => {
    await page.goto('/appeals');

    // Mientras no haya casos cerrados, no se publica ninguna tasa de éxito.
    await expect(page.locator('body')).toContainText('No publico tasa de éxito');

    await page.getByPlaceholder('tu@empresa.com').fill('vendedor@ejemplo.invalid');
    await page.getByLabel(/Nombre de tu tienda/).fill('Tienda Suspendida');
    await page
      .locator('textarea')
      .fill(
        'Your Amazon seller account has been deactivated because your Order Defect Rate is above the target. Please send a Plan of Action.',
      );

    await expect(page.locator('body')).toContainText('Order Defect Rate');
    await expect(page.locator('body')).toContainText('orientativo');

    await page.getByRole('button', { name: /Analizar mi caso/ }).click();
    await expect(page.locator('body')).toContainText('Recibido');
  });
});

test.describe('Panel interno', () => {
  test('el portero rechaza una contraseña incorrecta', async ({ page }) => {
    await page.goto('/admin');
    await page.getByPlaceholder('Contraseña').fill('lo-que-sea');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.locator('body')).toContainText('Contraseña incorrecta');
  });

  test('leads: filtros, estado, ingresos y notas', async ({ page }) => {
    // Se generan los dos leads por la vía normal, no tocando el almacenamiento.
    await page.goto('/appeals');
    await page.getByPlaceholder('tu@empresa.com').fill('apelacion@ejemplo.invalid');
    await page.getByLabel(/Nombre de tu tienda/).fill('Tienda A');
    await page.locator('textarea').fill('Intellectual property complaint from a rights owner.');
    await page.getByRole('button', { name: /Analizar mi caso/ }).click();
    await expect(page.locator('body')).toContainText('Recibido');

    await entrarEnAdmin(page);
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('body')).toContainText('apelacion@ejemplo.invalid');

    // Filtro por tipo.
    await page.locator('select').first().selectOption('complyo');
    await expect(page.locator('body')).not.toContainText('apelacion@ejemplo.invalid');
    await page.locator('select').first().selectOption('');

    // Búsqueda.
    await page.getByRole('textbox').first().fill('apelacion');
    await expect(page.locator('body')).toContainText('apelacion@ejemplo.invalid');
    await page.getByRole('textbox').first().fill('');

    // Estado e ingreso.
    await page.getByLabel('Estado de apelacion@ejemplo.invalid').selectOption('convertido');
    await page.getByLabel('Ingreso de apelacion@ejemplo.invalid').fill('1500');
    await page.keyboard.press('Tab');
    await expect(page.locator('body')).toContainText('1500 $');

    // Notas.
    await page.getByRole('button', { name: /Notas \(0\)/ }).first().click();
    await page.getByPlaceholder('Nueva nota…').fill('Primer contacto.');
    await page.getByRole('button', { name: 'Añadir' }).click();
    await expect(page.locator('body')).toContainText('Primer contacto.');
  });

  test('rellenar reglas: valida, avisa y guarda', async ({ page }) => {
    await entrarEnAdmin(page, '/admin/fill-rules');

    await page.getByRole('button', { name: 'Validar' }).click();
    await expect(page.locator('body')).toContainText('No se puede guardar');

    await page.getByLabel(/Nombre del registro/).fill('Registro de prueba');
    await page.getByLabel(/Periodicidad/).fill('anual');
    await page.getByLabel(/Datos que exige/).fill('Número de identificación fiscal');
    await page.getByLabel(/Consecuencia/).fill('Consecuencia documentada en la fuente.');
    await page
      .getByLabel(/URL de la fuente/)
      .fill('https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32025R0040');

    await page.getByRole('button', { name: 'Validar' }).click();
    // Es válida, pero avisa de que sigue sin verificar: eso no bloquea.
    await expect(page.locator('body')).toContainText('Avisos');

    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.locator('body')).toContainText('Guardada la obligación');

    await page.goto('/admin/rules-status');
    await expect(page.locator('body')).toContainText('de 18 obligaciones completas');
    await expect(page.locator('body')).toContainText('Registro de prueba');
  });

  test('prospección alterna A y B y registra la variante', async ({ page }) => {
    await entrarEnAdmin(page, '/prospeccion');

    await expect(page.locator('body')).toContainText('Variante A — desactivación del listing');
    await expect(page.locator('body')).toContainText('Variante B — sanción económica');

    await page.getByPlaceholder(/B0XXXXXXXX/).fill('B0PRUEBA01');
    await page.getByRole('button', { name: /Registrar prospecto \(A\)/ }).click();
    await expect(page.locator('body')).toContainText('con variante A');

    await page.getByPlaceholder(/B0XXXXXXXX/).fill('B0PRUEBA02');
    await page.getByRole('button', { name: /Registrar prospecto \(B\)/ }).click();
    await expect(page.locator('body')).toContainText('A = 1, B = 1');

    await page.getByLabel('Respondió B0PRUEBA02').check();

    // El panel A/B recoge lo anterior y avisa de que la muestra es corta.
    await page.goto('/admin/ab');
    await expect(page.locator('body')).toContainText('Muestra corta');
    await expect(page.locator('body')).not.toContainText('significativ');
  });

  test('el Plan of Action puntúa, avisa de lo que falta y genera el documento', async ({ page }) => {
    await entrarEnAdmin(page, '/admin/poa');

    await expect(page.locator('body')).toContainText('Le falta');
    await expect(page.locator('body')).toContainText('Al menos una causa raíz');

    await page.getByLabel('Nombre del vendedor').fill('Tienda Prueba');
    await page.getByLabel(/Motivo, tal y como/).fill('Order Defect Rate');
    await page
      .getByLabel(/Causa raíz/)
      .fill('El control de calidad de salida no cubría los envíos directos del proveedor.');

    await page.getByRole('button', { name: 'Añadir corrección' }).click();
    await page.getByPlaceholder('Qué has corregido').fill('Cambio de proveedor');
    await page.getByPlaceholder(/Prueba: URL/).fill('Contrato firmado el 1 de septiembre');
    await page.locator('input[type="date"]').first().fill('2026-09-01');

    await page.getByRole('button', { name: 'Añadir medida' }).click();
    await page.getByPlaceholder('La medida').fill('Inspección del 100 % de las entradas');
    await page.getByPlaceholder(/Cómo se implementa/).fill('Checklist diario del almacén');

    await expect(page.locator('body')).toContainText('Las tres partes están');
    await expect(page.locator('pre')).toContainText('# Plan of Action — Tienda Prueba');
    await expect(page.locator('pre')).toContainText('1. Causa raíz');

    // La puntuación mide lo completo que está el plan, y se dice así.
    await expect(page.locator('body')).toContainText('no la probabilidad de que te');

    await page.getByRole('button', { name: 'Texto plano' }).click();
    await expect(page.locator('pre')).not.toContainText('**');

    await page.getByRole('button', { name: 'JSON' }).click();
    await expect(page.locator('pre')).toContainText('"suspensionType"');

    const descarga = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar' }).click();
    expect((await descarga).suggestedFilename()).toBe('poa-tienda-prueba.json');
  });

  test('la sesión se cierra al salir', async ({ page }) => {
    await entrarEnAdmin(page);
    await expect(page.locator('body')).toContainText('operador (local)');
    await page.getByRole('button', { name: 'Salir' }).click();
    await expect(page.getByPlaceholder('Contraseña')).toBeVisible();
  });
});
