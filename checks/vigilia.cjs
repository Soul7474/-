/* The station notices you: 403 cover, whispers in runes, your own visits, things that change. */
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
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);

    // The server refuses you, then notices you; "irse" answers "no." and lets you in anyway.
    assert.equal(await page.title(), '403 Forbidden');
    assert.equal(await page.locator('.forbidden-choices').isHidden(), true);
    await page.locator('.forbidden-choices').waitFor({ state: 'visible', timeout: 12000 });
    assert.match(await page.locator('#forbidden-whisper').textContent(), /ya te hemos visto/);
    await page.locator('#listen-no').click();
    assert.equal((await page.locator('#forbidden-whisper').textContent()).trim(), 'no.');
    await page.locator('#listen-cover').waitFor({ state: 'hidden', timeout: 5000 });
    assert.match(await page.title(), /ESTACIÓN 09/);

    // The favicon is a drawn eye; the first whisper starts in runes and ends in Spanish.
    assert.match(await page.locator('link[rel="icon"]').getAttribute('href'), /^data:image\/png/);
    await page.waitForFunction(() => /[ᚠ-ᛪ]/.test(document.querySelector('.susurro').textContent), null, { timeout: 15000 });
    await page.waitForFunction(() => /\d\d:\d\d\./.test(document.querySelector('.susurro').textContent), null, { timeout: 8000 });

    // Your own visits are in the archive, in a log that says you are reading it.
    await page.evaluate(() => { localStorage.setItem('estacion09-v1', JSON.stringify({ level: 2, guests: [] })); localStorage.setItem('estacion09-door-scene-v1', 'seen'); });
    await page.goto(base + '/#archivo');
    await page.locator('[data-document="intruso"]').click();
    assert.match(await page.locator('#document-body').textContent(), /acceso 001 · sin credenciales[\s\S]*sigue aquí/);
    await page.keyboard.press('Escape');
    await page.locator('[data-document="abecedario"]').click();
    assert.match(await page.locator('#document-body').textContent(), /ᛁ i/);
    await page.keyboard.press('Escape');

    // A document left open rewrites one sentence.
    await page.locator('#archive-list [data-document="bienvenida"]').click();
    await page.waitForFunction(() => document.querySelector('#document-body').textContent.includes('Ahora sabemos por qué.'), null, { timeout: 15000 });
    await page.keyboard.press('Escape');

    // Down the archive and back up: the title finishes its sentence.
    await page.evaluate(() => window.scrollTo(0, 2000)); await page.waitForTimeout(150);
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(150);
    assert.match(await page.locator('#view-archivo .page-intro h1').textContent(), /de ti/);

    // Erasing your trace erases it from the station, not from what watches.
    await page.locator('#forget-button').click(); await page.locator('#confirm-reset').click();
    await page.waitForLoadState('load');
    await page.waitForFunction(() => document.querySelector('.susurro').textContent.includes('nosotros no.'), null, { timeout: 20000 });
    assert.ok(JSON.parse(await page.evaluate(() => localStorage.getItem('estacion09-rastro'))).visits.length >= 1);

    // Reduced motion: no slow fade, whispers in plain letters.
    const still = await browser.newPage({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    still.on('pageerror', error => errors.push(error.message));
    await still.goto(base);
    await still.locator('.forbidden-choices').waitFor({ state: 'visible', timeout: 2000 });
    await still.locator('#listen-yes').click();
    await still.locator('#listen-cover').waitFor({ state: 'hidden', timeout: 3000 });
    await still.waitForFunction(() => document.querySelector('.susurro').textContent.length > 5, null, { timeout: 15000 });
    assert.doesNotMatch(await still.locator('.susurro').textContent(), /[ᚠ-ᛪ]/);
    assert.equal(await still.locator('.ghost-cursor').isVisible(), false);

    assert.deepEqual(errors, []);
    console.log('PASS: 403 cover and refusal, runic whispers, drawn favicon, visit log, rune key, rewritten document, archive title, trace survives reset, reduced motion.');
  } finally {
    await browser?.close(); server.closeAllConnections(); server.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
