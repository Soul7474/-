const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
(async () => {
  const { server } = await import('../server.mjs');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
    const page = await browser.newPage(); const errors = [], missing = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) missing.push(r.url()); });
    await page.addInitScript(() => {
      if (!localStorage.getItem('estacion09-v1')) localStorage.setItem('estacion09-v1', JSON.stringify({ level: 1, guests: [{ alias: 'test', message: 'Mi señal.', date: '2026-11-09' }] }));
      localStorage.setItem('estacion09-omens', 'quiet');
    });
    await page.goto(base); await page.locator('.threshold-enter').click();
    await page.waitForURL('**/#interior');
    assert.equal(await page.locator('.shell a[href="#inicio"]').count(), 0);
    assert.equal(await page.locator('.return-threshold').count(), 0);
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      for (const view of ['archivo', 'fragmentos', 'transmisiones', 'visitantes']) {
        await page.locator('.relic-door').click();
        await page.locator(`[data-view="${view}"]`).click();
        await page.locator(`#view-${view}`).waitFor({ state: 'visible' });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${view} at ${width}`);
        await page.locator(`#view-${view} .route-thread a[href="#interior"]`).click();
        await page.locator('#view-interior').waitFor({ state: 'visible' });
      }
    }
    await page.locator('.relic-door').click();
    await page.locator('.identity').click();
    assert.equal(await page.locator('#entry-portal').isVisible(), false);
    await page.goto(base + '/#subsuelo');
    await page.locator('#gate-dialog').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#entry-portal').isVisible(), false, 'a locked interior route must not send visitors to the door');
    await page.keyboard.press('Escape');
    await page.reload();
    await page.locator('#entry-portal').waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('estacion09-v1')).guests.length), 1, 'reload must preserve local data');
    await page.locator('.threshold-enter').click(); await page.waitForURL('**/#interior');
    await page.locator('#forget-button').click(); await page.locator('#confirm-reset').click();
    await page.locator('#view-interior').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#entry-portal').isVisible(), false);
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('estacion09-v1'))), { level: 0, guests: [] });
    assert.equal(await page.evaluate(() => sessionStorage.getItem('estacion09-interior')), null);
    await page.locator('.below-door').click(); await page.locator('#password').fill('1998');
    await page.locator('#gate-form').evaluate(form => form.requestSubmit());
    await page.locator('#view-subsuelo').waitFor({ state: 'visible' });
    await page.locator('#view-subsuelo .route-thread a[href="#interior"]').click();
    await page.locator('#view-interior').waitFor({ state: 'visible' });
    assert.deepEqual(errors, []); assert.deepEqual(missing, []);
    console.log('PASS: no site links to the door; every section returns inside; locked route stays inside; reload returns to entry preserving data; reset stays inside; 16 responsive routes; no errors/404.');
  } finally { await browser?.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
