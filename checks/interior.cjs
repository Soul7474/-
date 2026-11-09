/* Optional browser regression: needs Playwright + Chromium, no production dependencies. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { existsSync, mkdirSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const captures = join(tmpdir(), 'estacion09-check');
mkdirSync(captures, { recursive: true });
(async () => {
  const { server } = await import('../server.mjs');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [], missing = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
    await page.addInitScript(() => {
      window.bufferStarts = 0;
      const start = AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start = function (...args) { window.bufferStarts++; return start.apply(this, args); };
    });
    await page.goto(base + '/#interior');
    await page.locator('.inner-relic').evaluate(img => img.decode());
    const navigation = () => page.locator('.chamber-door').evaluateAll(items => items.map(item => {
      const box = item.getBoundingClientRect(); return [box.x, box.y, box.width, box.height];
    }));
    const originalNavigation = await navigation();
    const originalPosition = await page.locator('.sentinel-presence').evaluate(el => el.getBoundingClientRect().x);
    assert.equal(await page.evaluate(() => EstacionInterior.sound()), null);
    await page.locator('[data-memory="witness"]').click();
    await page.locator('#memory-dialog').waitFor({ state: 'visible' });
    await page.locator('[data-memory-close]').click();
    await page.waitForFunction(() => document.querySelector('.chamber-space').dataset.haunting === '1');
    assert.notEqual(await page.locator('.sentinel-presence').evaluate(el => el.getBoundingClientRect().x), originalPosition);
    assert.deepEqual(await navigation(), originalNavigation, 'navigation must never move with the figures');
    for (const mark of ['touch', 'absence']) {
      await page.locator(`[data-memory="${mark}"]`).click();
      await page.locator('[data-memory-close]').click();
    }
    await page.waitForFunction(() => document.querySelector('.chamber-space').dataset.interference === 'peek', null, { timeout: 5000 });
    assert.equal(await page.locator('#apparition').isVisible(), false, 'the room intrusion stays inside the television');
    await page.screenshot({ path: join(captures, 'interior-apparition.png') });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('.chamber-space').dataset.interference);
    await page.locator('.sentinel-presence').click(); await page.locator('.sentinel-presence').click();
    await page.waitForTimeout(3200);
    assert.equal(await page.locator('#apparition').isVisible(), false, 'Escape must cancel pending apparitions');
    await page.screenshot({ path: join(captures, 'living-interior.png') });
    // A visual clue can be obtained with sound off and without waiting for audio.
    await page.locator('.voice-door').click();
    await page.locator('.signal-reveal').click();
    await page.locator('.signal-word').waitFor({ state: 'visible' });
    assert.match(await page.locator('.signal-word').textContent(), /UMBRA/);
    assert.equal(await page.evaluate(() => EstacionInterior.sound()), null);
    await page.screenshot({ path: join(captures, 'visual-clue.png') });
    await page.locator('[data-view="interior"]').click();
    await page.locator('[data-memory="seal"]').click();
    for (const sign of ['absence', 'touch', 'witness']) await page.locator(`[data-sign="${sign}"]`).click();
    assert.match(await page.locator('.seal-status').textContent(), /No responde/);
    for (const sign of ['witness', 'touch', 'absence']) await page.locator(`[data-sign="${sign}"]`).click();
    await page.locator('.sealed-fragment').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.fragment-date').textContent(), 'MCMXCVIII');
    await page.screenshot({ path: join(captures, 'sealed-fragment.png') });
    await page.locator('[data-memory-close]').click();
    await page.reload(); await page.locator('[data-memory="seal"]').click();
    assert.equal(await page.locator('.sealed-fragment').isVisible(), true);
    await page.locator('.fragment-below').click();
    await page.locator('#password').fill('1998');
    await page.locator('#gate-form').evaluate(form => form.requestSubmit());
    await page.locator('#view-subsuelo').waitFor({ state: 'visible' });
    // Confirm the alternate spoken-word path independently.
    await page.evaluate(() => sessionStorage.removeItem('estacion09-interior'));
    await page.goto(base + '/#interior'); await page.reload(); await page.locator('[data-memory="seal"]').click();
    await page.locator('#seal-word').fill('umbra');
    await page.locator('.seal-form').evaluate(form => form.requestSubmit());
    assert.equal(await page.locator('.sealed-fragment').isVisible(), true);
    await page.locator('[data-memory-close]').click();
    // No audio context is created by inspecting images; sound only follows explicit enable.
    await page.reload();
    await page.evaluate(() => sessionStorage.setItem('estacion09-interior', JSON.stringify({ visits: 0, unlocked: true })));
    await page.reload();
    await page.locator('#sound-toggle').click();
    await page.waitForFunction(() => Boolean(EstacionInterior.sound()));
    const before = await page.evaluate(() => bufferStarts);
    await page.locator('[data-memory="touch"]').click(); await page.locator('[data-memory-close]').click();
    await page.waitForFunction(count => bufferStarts > count, before, { timeout: 5000 });
    await page.locator('#sound-toggle').click();
    const muted = await page.evaluate(() => bufferStarts);
    await page.locator('[data-memory="touch"]').click(); await page.locator('[data-memory-close]').click();
    assert.equal(await page.evaluate(() => bufferStarts), muted);
    for (let i = 0; i < 7; i++) {
      await page.locator('[data-memory="touch"]').click(); await page.locator('[data-memory-close]').click();
    }
    await page.waitForFunction(() => document.querySelector('.chamber-space').dataset.haunting === '3');
    assert.deepEqual(await navigation(), originalNavigation);
    await page.screenshot({ path: join(captures, 'room-final-stage.png') });
    // Calm freezes actor mutations and all pending phenomena.
    await page.locator('#omens-toggle').click();
    await page.locator('[data-memory="witness"]').click(); await page.locator('[data-memory-close]').click();
    assert.equal(await page.locator('.chamber-space').getAttribute('data-haunting'), '0');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('#omens-toggle').disabled);
    assert.equal(await page.locator('.chamber-space').getAttribute('data-haunting'), '0');
    await page.locator('.voice-door').click(); await page.locator('.signal-reveal').click();
    assert.match(await page.locator('.signal-word').textContent(), /UMBRA/);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => !document.querySelector('#omens-toggle').disabled);
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 }); await page.goto(base + '/#interior');
      await page.locator('[data-memory="seal"]').click();
      assert.equal(await page.locator('#memory-dialog').evaluate(el => el.scrollWidth > innerWidth), false);
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: join(captures, 'living-mobile.png'), fullPage: true });
    await page.locator('#forget-button').click(); await page.locator('#confirm-reset').click();
    await page.waitForURL('**/#inicio'); await page.waitForLoadState();
    assert.equal(await page.evaluate(() => sessionStorage.getItem('estacion09-interior')), null);
    assert.deepEqual(errors, []); assert.deepEqual(missing, []);
    console.log('PASS: mutations, fixed navigation, contextual intrusion, finite escalation, Escape, visual clue, both seal solutions, persistence, subsoil, opt-in sound, calm, reduced motion, mobile, reset.');
  } finally {
    await browser?.close(); server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
