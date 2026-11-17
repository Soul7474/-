/* The hidden rooms: each opens, says what it should, and can be reached from somewhere. */
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
    for (const options of [{ viewport: { width: 1280, height: 800 } }, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]) {
      const page = await browser.newPage(options);
      page.on('pageerror', error => errors.push(error.message));
      await page.clock.install();
      await page.addInitScript(() => { sessionStorage.setItem('estacion09-escuchado', '1'); localStorage.setItem('estacion09-v1', JSON.stringify({ level: 2, guests: [{ alias: 'Lucía', message: 'he oído algo', date: '2026-11-10T10:00:00Z' }] })); localStorage.setItem('estacion09-door-scene-v1', 'seen'); });
      await page.goto(base + '/#interior');
      // Ways in, scattered.
      for (const [from, to] of [['#view-interior', 'habitacion'], ['#view-estatua', 'pozo'], ['#view-descenso', 'espejo'], ['#view-visitantes', 'ellos'], ['footer', 'nadie'], ['#view-fragmentos', 'volcado']]) assert.equal(await page.locator(`${from} a[href="#${to}"]`).count(), 1, `${from} → ${to}`);
      assert.equal(await page.locator('.main-nav').isVisible(), false);

      await page.goto(base + '/#pozo'); await page.clock.runFor(500);
      assert.equal(await page.title(), 'ᛈᛟᛉᛟ');
      assert.ok(await page.locator('.pozo-block').count() > 5, 'the well fills');
      for (let i = 0; i < 30; i++) { await page.evaluate(() => window.scrollBy(0, 1200)); await page.clock.runFor(100); }
      assert.ok(await page.evaluate(() => document.documentElement.scrollHeight > 36000), 'it keeps going');
      assert.equal(await page.locator('#pozo-shaft a[href="#habitacion"]').count(), 1);
      assert.match(await page.locator('#pozo-depth').textContent(), /^-\d+ m$/);

      await page.goto(base + '/#habitacion'); await page.clock.runFor(12000);
      assert.match(await page.locator('#informe').textContent(), /dice llamarse «Lucía»[\s\S]*se está escribiendo ahora/);
      assert.match(await page.locator('#informe-vivo').textContent(), /quieto desde/);

      await page.goto(base + '/#ellos'); await page.clock.runFor(20000);
      assert.ok(await page.locator('.otro').count() >= 20);
      assert.match(await page.locator('#ellos-wall').textContent(), /dice llamarse Lucía/);
      assert.match(await page.locator('.otro.typing').textContent(), /te veo leer esto/);

      await page.goto(base + '/#espejo'); await page.clock.runFor(16000);
      assert.equal(await page.locator('.espejo-line.late.shown').count(), 3);

      await page.goto(base + '/#nadie'); await page.clock.runFor(23000);
      assert.equal(await page.locator('.nadie-long').isHidden(), false);

      await page.goto(base + '/#volcado'); await page.clock.runFor(500);
      assert.match(await page.locator('#volcado-dump').textContent(), /^00000000  /);

      // The archive changes order between visits.
      const order = async () => { await page.goto(base + '/#interior'); await page.clock.runFor(200); await page.goto(base + '/#archivo'); await page.clock.runFor(200); return page.locator('#archive-list .file-row b').allTextContents(); };
      const first = await order(); let shuffled = false;
      for (let i = 0; i < 5 && !shuffled; i++) shuffled = (await order()).join() !== first.join();
      assert.ok(shuffled, 'the archive is never in the same order');
      await page.close();
    }
    assert.deepEqual(errors, []);
    console.log('PASS: ways in, no menu, endless well with its sign, report about you, the others and the one typing, mirror, nobody, dump, shuffled archive; desktop and mobile.');
  } finally {
    await browser?.close(); server.closeAllConnections(); server.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
