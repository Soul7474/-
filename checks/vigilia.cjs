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

    // First the intrusion: a terminal that reads only what the browser already knows, a huge local
    // address, then a hard cut to the 403. No permission is asked for and nothing is requested.
    const outside = [];
    page.on('request', request => { if (!request.url().startsWith(base) && !request.url().startsWith('data:')) outside.push(request.url()); });
    assert.equal(await page.locator('#intrusion').isVisible(), true);
    assert.equal(await page.title(), 'conexión entrante…');
    await page.waitForFunction(() => /sistema[\s\S]*copiando \/Fotos/.test(document.querySelector('.intrusion-log').textContent), null, { timeout: 8000 });
    await page.locator('#intrusion.big-phase').waitFor({ timeout: 8000 });
    assert.match(await page.locator('.intrusion-ip').textContent(), /^192\.168\.1\.\d{1,3}$/);
    await page.locator('#intrusion').waitFor({ state: 'hidden', timeout: 6000 });
    assert.deepEqual(outside, [], 'the intrusion requests nothing outside the site');

    // The server refuses you, then notices you; "irse" answers "no." and lets you in anyway.
    assert.equal(await page.title(), '403 Forbidden');
    assert.equal(await page.locator('.forbidden-choices').isHidden(), true);
    await page.locator('.forbidden-choices').waitFor({ state: 'visible', timeout: 12000 });
    assert.match(await page.locator('#forbidden-whisper').textContent(), /ya te hemos visto/);
    await page.locator('#listen-no').click();
    assert.equal((await page.locator('#forbidden-whisper').textContent()).trim(), 'no.');
    await page.locator('#listen-cover').waitFor({ state: 'hidden', timeout: 5000 });
    assert.match(await page.title(), /^[ᚠ-ᛪ᛫]+$/);
    // The choice asked for full screen; there is no menu and no site name, only a way back.
    assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), true, 'full screen after choosing');
    await page.evaluate(() => document.exitFullscreen());
    assert.equal(await page.locator('.main-nav').isVisible(), false);

    // The favicon is a drawn eye; the first whisper starts in runes and ends in Spanish.
    assert.match(await page.locator('link[rel="icon"]').getAttribute('href'), /^data:image\/png/);
    await page.waitForFunction(() => /[ᚠ-ᛪ]/.test(document.querySelector('.susurro').textContent), null, { timeout: 15000 });
    await page.waitForFunction(() => /^[^ᚠ-ᛪ]{4,}$/.test(document.querySelector(".susurro").textContent), null, { timeout: 8000 });

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
    // Escape skips the intrusion.
    await still.locator('#intrusion').waitFor({ state: 'visible', timeout: 2000 });
    await still.keyboard.press('Escape');
    assert.equal(await still.locator('#intrusion').isHidden(), true);
    await still.locator('.forbidden-choices').waitFor({ state: 'visible', timeout: 2000 });
    await still.locator('#listen-yes').click();
    await still.locator('#listen-cover').waitFor({ state: 'hidden', timeout: 3000 });
    await still.waitForFunction(() => document.querySelector('.susurro').textContent.length > 5, null, { timeout: 15000 });
    assert.doesNotMatch(await still.locator('.susurro').textContent(), /[ᚠ-ᛪ]/);
    assert.equal(await still.locator('.ghost-cursor').isVisible(), false);

    // With a simulated clock: the camera turns to "behind you", the dark closes in when you keep
    // still and lets go when you move, the guestbook answers, and it knows the name you signed with.
    const timed = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    timed.on('pageerror', error => errors.push(error.message));
    await timed.clock.install();
    await timed.addInitScript(() => { sessionStorage.setItem('estacion09-escuchado', '1'); localStorage.setItem('estacion09-v1', JSON.stringify({ level: 2, guests: [{ alias: 'Lucía', message: 'hola', date: '2026-11-10T10:00:00Z' }] })); localStorage.setItem('estacion09-door-scene-v1', 'seen'); });
    await timed.goto(base + '/#archivo');
    await timed.clock.runFor(46000);
    assert.equal(await timed.locator('.cam-monitor').getAttribute('data-tape'), 'CAM_10 · DETRÁS DE TI · EN DIRECTO');
    await timed.clock.runFor(8000);
    assert.equal(await timed.locator('.cam-monitor').getAttribute('data-tape'), 'CAM_09 · PASILLO B · EN DIRECTO');
    await timed.clock.runFor(16000);
    assert.match(await timed.locator('.creep').getAttribute('class'), /closing/);
    assert.match(await timed.locator('.susurro').textContent(), /[lᛚ][uᚢ][cᚲ][íᛁ][aᚨ]/);
    await timed.mouse.move(300, 300); await timed.clock.runFor(300);
    assert.doesNotMatch(await timed.locator('.creep').getAttribute('class'), /closing/);
    await timed.clock.runFor(45000);
    assert.equal(await timed.locator('#footer-status').textContent(), '2 PRESENCIAS EN ESTE NODO');
    // Your cursor disappears for a few seconds and comes back.
    await timed.evaluate(() => new MutationObserver(() => { if (document.body.classList.contains('cursor-lost')) window.cursorWasLost = true; }).observe(document.body, { attributes: true, attributeFilter: ['class'] }));
    for (let i = 0; i < 25 && !(await timed.evaluate(() => window.cursorWasLost === true)); i++) { await timed.mouse.move(400 + (i % 7) * 20, 300); await timed.clock.runFor(10000); }
    assert.ok(await timed.evaluate(() => window.cursorWasLost === true), 'the cursor is lost at some point');
    await timed.clock.runFor(8000);
    assert.equal(await timed.evaluate(() => document.body.classList.contains('cursor-lost')), false);
    await timed.goto(base + '/#visitantes');
    await timed.fill('#guest-message', 'he oído algo detrás de la puerta');
    await timed.locator('#guest-form [type="submit"]').click();
    await timed.clock.runFor(8000);
    assert.match(await timed.locator('.guest-reply').last().textContent(), /he oído algo detrás de la puerta.*Lo leí antes de que lo enviaras/);

    assert.deepEqual(errors, []);
    console.log('PASS: intrusion (local only, skippable), 403 cover and refusal, runic whispers, drawn favicon, visit log, rune key, rewritten document, archive title, trace survives reset, reduced motion, CAM_10, the dark that comes when you keep still, two presences, guestbook reply, your alias, full screen, no menu, lost cursor.');
  } finally {
    await browser?.close(); server.closeAllConnections(); server.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
