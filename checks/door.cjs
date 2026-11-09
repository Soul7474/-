/* Regression for returning visitors whose access predates the ritual animation. */
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
    const errors = [];
    async function visitor(options = {}, quiet = false) {
      const page = await browser.newPage(options);
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(quiet => {
        if (!localStorage.getItem('estacion09-v1')) localStorage.setItem('estacion09-v1', JSON.stringify({ level: 1, guests: [{ alias: 'test', message: 'Una visita anterior.', date: '2026-11-09T12:00:00Z' }] }));
        if (quiet && !localStorage.getItem('estacion09-omens')) localStorage.setItem('estacion09-omens', 'quiet');
      }, quiet);
      await page.goto(base); return page;
    }
    const page = await visitor();
    assert.equal(await page.locator('[data-replay-opening]').isVisible(), true);
    await page.locator('.threshold-enter').click();
    await page.locator('#door-passage').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#door-passage .door-stage').getAttribute('data-door'), 'closed', 'old access must not skip the full opening');
    await page.waitForURL('**/#interior', { timeout: 30000 });
    assert.equal(await page.evaluate(() => localStorage.getItem('estacion09-door-scene-v1')), 'seen');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('estacion09-v1')).guests.length), 1);
    await page.reload(); await page.locator('.return-threshold').click();
    await page.locator('.threshold-enter').click();
    await page.locator('#door-passage').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#door-passage .door-stage').getAttribute('data-door'), 'open', 'repeat entries may use the short passage');
    await page.keyboard.press('Escape');
    await page.locator('[data-replay-opening]').click();
    await page.locator('#door-passage').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#door-passage .door-stage').getAttribute('data-door'), 'closed');
    await page.keyboard.press('Escape');
    const reduced = await visitor({ reducedMotion: 'reduce' });
    await reduced.locator('.threshold-enter').click(); await reduced.waitForURL('**/#interior');
    assert.equal(await reduced.locator('#door-passage').isVisible(), false);
    assert.equal(await reduced.evaluate(() => localStorage.getItem('estacion09-door-scene-v1')), null);
    await reduced.locator('.return-threshold').click(); await reduced.locator('[data-replay-opening]').click();
    assert.match(await reduced.locator('#door-whisper').textContent(), /movimiento reducido/);
    const quiet = await visitor({}, true);
    await quiet.locator('.threshold-enter').click(); await quiet.waitForURL('**/#interior');
    assert.equal(await quiet.locator('#door-passage').isVisible(), false);
    await quiet.locator('.return-threshold').click(); await quiet.locator('[data-replay-opening]').click();
    assert.match(await quiet.locator('#door-whisper').textContent(), /invocar/);
    await quiet.locator('#omens-toggle').click(); await quiet.locator('[data-replay-opening]').click();
    await quiet.locator('#door-passage').waitFor({ state: 'visible' });
    await quiet.keyboard.press('Escape');
    assert.equal(await quiet.evaluate(() => localStorage.getItem('estacion09-door-scene-v1')), null, 'cancelled scenes must not be marked seen');
    await quiet.locator('.threshold-enter').click();
    await quiet.locator('#door-passage').waitFor({ state: 'visible' });
    assert.equal(await quiet.locator('#door-passage .door-stage').getAttribute('data-door'), 'closed');
    await quiet.keyboard.press('Escape');
    await quiet.setViewportSize({ width: 390, height: 844 });
    assert.equal(await quiet.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.goto(base + '/#interior'); await page.locator('#forget-button').click(); await page.locator('#confirm-reset').click();
    await page.waitForURL('**/#inicio'); await page.waitForLoadState();
    assert.equal(await page.evaluate(() => localStorage.getItem('estacion09-door-scene-v1')), null);
    assert.deepEqual(errors, []);
    console.log('PASS: old access sees full scene; progress preserved; seen persists; replay works; cancellation retries; calm and reduced motion respected; mobile and reset.');
  } finally {
    await browser?.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
