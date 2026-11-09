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
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/#interior');
    assert.equal(await page.locator('.path-invitation').getAttribute('class').then(s => s.includes('relic-door')), true);
    const positions = () => page.locator('.chamber-door').evaluateAll(items => items.map(item => { const r = item.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }));
    const before = await positions();
    await page.locator('.relic-door').click();
    assert.equal(await page.locator('#view-archivo .route-thread a[href="#transmisiones"]').isVisible(), false);
    await page.locator('#archive-list [data-document="bienvenida"]').click();
    await page.locator('#document-dialog .close-dialog').click();
    await page.locator('#view-archivo .route-thread a[href="#transmisiones"]').waitFor({ state: 'visible' });
    await page.locator('#view-archivo .route-thread a[href="#transmisiones"]').click();
    await page.locator('.signal-reveal').click();
    await page.locator('.signal-word').waitFor({ state: 'visible' });
    await page.locator('#view-transmisiones .route-thread button').click();
    await page.waitForURL('**/#interior');
    await page.locator('#memory-dialog').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#seal-word').isVisible(), true);
    await page.locator('#seal-word').fill('umbra');
    await page.locator('.seal-form').evaluate(form => form.requestSubmit());
    await page.locator('.sealed-fragment').waitFor({ state: 'visible' });
    await page.locator('[data-memory-close]').click();
    assert.equal(await page.locator('.below-door').evaluate(el => el.classList.contains('path-invitation')), true);
    assert.deepEqual(await positions(), before, 'guidance must not move the access points');
    await page.reload();
    assert.equal(await page.locator('.chamber-space').getAttribute('data-thread'), 'open');
    for (let i = 0; i < 6; i++) { await page.locator('[data-memory="touch"]').click(); await page.locator('[data-memory-close]').click(); }
    await page.waitForFunction(() => document.querySelector('.chamber-space').dataset.haunting === '3');
    await page.locator('[data-memory="touch"]').click(); await page.locator('[data-memory-close]').click();
    assert.equal(await page.locator('.chamber-space').getAttribute('data-haunting'), '3');
    await page.locator('#omens-toggle').click();
    assert.equal(await page.locator('.chamber-space').getAttribute('data-haunting'), '0');
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      for (const view of ['interior', 'archivo', 'transmisiones', 'visitantes']) {
        await page.goto(base + '/#' + view);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      }
    }
    await page.locator('#forget-button').click(); await page.locator('#confirm-reset').click();
    await page.waitForURL('**/#inicio'); await page.waitForLoadState();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('estacion09-interior')), null);
    assert.deepEqual(errors, []);
    console.log('PASS: discovery, reading-to-signal link, return-to-seal, unlock, fixed access points, persisted thread, finite presences, calm, mobile, reset.');
  } finally { await browser?.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
