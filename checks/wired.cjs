const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { existsSync, mkdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
(async () => {
  const { server } = await import('../server.mjs');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 375, height: 812 } }); const errors = [], requests = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('request', r => requests.push(r.url()));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) errors.push(String(response.status()) + ' ' + response.url()); });
    await page.clock.install();
    await page.goto(base);
    assert.equal(await page.locator('#navigation').isVisible(), false);
    assert.equal(await page.locator('#sound-button').count(), 0);
    await page.locator('#password').fill('wrong'); await page.locator('#gate-form button').click(); assert.match(await page.locator('#gate-error').textContent(), /No es/);
    await page.locator('#password').fill('eco'); await page.locator('#password').press('Enter');
    await page.waitForURL('**/gate/00.html');
    assert.equal(await page.locator('#navigation nav a').count(), 1);
    await page.goto(base + '/gate/07.html'); await page.waitForURL('**/gate/00.html');
    async function answer(text) { await page.locator('#answer').fill(text); await page.locator('#answer-form button').click(); }
    await answer('sí'); await page.waitForURL('**/gate/01.html');
    assert.equal(await page.locator('#gate-text').textContent(), 'Los labios están cerrados.');
    await answer('sí'); await page.waitForURL('**/gate/02.html');
    assert.equal(await page.locator('#footer p').filter({ hasText: /^visita / }).count(), 2);
    await answer('<xss>'); await page.waitForURL('**/gate/03.html');
    assert.match(await page.locator('#activity').textContent(), /otro: <xss>/); assert.equal(await page.locator('xss').count(), 0);
    await answer('lastre'); await page.waitForURL('**/gate/04.html');
    await page.locator('a[href="/rastro.html"]').click();
    assert.equal(await page.locator('#screen tbody tr').count(), 11); assert.match(await page.locator('#screen tbody').textContent(), /otro.*lastre/s);
    await page.locator('#trace').fill('<img src=x onerror=alert(1)>'); await page.locator('form button').click();
    assert.equal(await page.locator('#screen tbody img').count(), 0); assert.equal(await page.locator('#screen tbody tr').count(), 12);
    await page.locator('a[href="/gate/04.html"]').click(); await answer('no');
    await page.waitForURL('**/gate/05.html'); assert.equal(await page.locator('.loading').count(), 1);
    assert.equal(await page.locator('#navigation').isVisible(), false); assert.equal(await page.locator('#footer').isVisible(), false);
    // Hiding the tab during the delay must not leave the gate stuck.
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    await page.clock.runFor(6100); await page.locator('#answer').waitFor();
    await answer('origen'); await page.waitForURL('**/gate/06.html');
    const correction = await page.locator('#gate-text').textContent();
    await page.clock.runFor(20500); assert.notEqual(await page.locator('#gate-text').textContent(), correction);
    const counter = await page.locator('.visitor-number').textContent();
    await answer('999999'); await page.waitForURL('**/gate/07.html');
    assert.notEqual(await page.locator('.visitor-number').textContent(), counter);
    assert.equal(await page.locator('#gate-text').textContent(), 'origen');
    await answer('no'); await page.locator('#exit-button').click(); await page.waitForURL('**/gate/00.html');
    const firstVariation = await page.evaluate(() => OccultStore.state.returnVariation);
    await page.locator('a[href="/gate/07.html"]').click(); await page.locator('#exit-button').click();
    assert.notEqual(await page.evaluate(() => OccultStore.state.returnVariation), firstVariation);
    await page.clock.runFor(46000); assert.match(await page.locator('#gate-symbol').getAttribute('style'), /2px/);
    assert.equal(await page.locator('#activity li').count(), 4);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    const log1 = await page.locator('#activity').textContent();
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    assert.notEqual(await page.locator('#activity').textContent(), log1);
    await page.locator('#sound-button').click(); await page.waitForFunction(() => document.querySelector('#sound-button').getAttribute('aria-pressed') === 'true');
    await page.locator('#sound-button').click();
    const captures = join(tmpdir(), 'estacion09-check'); mkdirSync(captures, { recursive: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: join(captures, 'wired-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 375, height: 812 }); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: join(captures, 'wired-mobile.png'), fullPage: true });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('a[href="/gate/05.html"]').click(); assert.equal(await page.locator('.loading').count(), 0);
    await page.locator('a[href="/gate/06.html"]').click(); const stable = await page.locator('#gate-text').textContent();
    await page.clock.runFor(60000); assert.equal(await page.locator('#gate-text').textContent(), stable); assert.equal(await page.locator('#gate-symbol').getAttribute('style'), null);
    await page.locator('#forget-button').click(); await page.waitForURL(base + '/');
    assert.equal(await page.evaluate(() => localStorage.getItem('occult_state')), null); assert.equal(await page.locator('#navigation').isVisible(), false);
    // No-storage operation must survive full, same-origin page navigation.
    const blocked = await browser.newPage(); blocked.on('pageerror', e => errors.push(e.message));
    await blocked.addInitScript(() => { for (const method of ['getItem', 'setItem', 'removeItem']) Storage.prototype[method] = () => { throw new DOMException('blocked', 'SecurityError'); }; });
    await blocked.goto(base); await blocked.locator('#password').fill('eco'); await blocked.locator('#gate-form button').click();
    await blocked.locator('#answer').fill('no'); await blocked.locator('#answer-form button').click();
    await blocked.goto(base + '/gate/01.html'); assert.match(await blocked.locator('#gate-text').textContent(), /sabiduría/);
    assert.equal(await blocked.evaluate(() => OccultStore.state.gate), 1);
    const returning = await browser.newPage();
    await returning.addInitScript(() => localStorage.setItem('occult_state', JSON.stringify({ firstVisit: Date.now()-172800000, lastVisit: Date.now()-86400000, visits: 3, gate: 1, answers: {}, visitorNo: 412, opened: true })));
    await returning.goto(base + '/gate/01.html');
    assert.equal(await returning.locator('.visitor-number').textContent(), 'visitante nº 000412');
    assert.match(await returning.locator('#footer').textContent(), /ya estuviste aquí/);
    assert.equal(await returning.evaluate(() => OccultStore.state.visits), 4);
    assert.deepEqual(errors, []); assert.equal(requests.every(url => url.startsWith(base)), true);
    // The v3 visual direction deliberately requires white glow, blur and CRT layers.
    const css = readFileSync(join(__dirname, '..', 'style.css'), 'utf8');
    assert.doesNotMatch(css, /box-shadow|border-radius|text-align:\s*left|#9bb59b|#8a1c1c/);
    for (const color of css.matchAll(/#([0-9a-f]{3,8})\b/gi)) {
      const value = color[1].toLowerCase();
      const channels = value.length === 3 ? [...value] : value.match(/.{2}/g);
      assert.ok(channels.every(channel => channel === channels[0]), 'monochrome CSS: ' + color[0]);
    }
    for (const color of css.matchAll(/rgba?\((\d+),(\d+),(\d+)/g)) assert.ok(color[1] === color[2] && color[2] === color[3]);
    await checkCRT(browser, base, captures, errors);
    console.log('PASS: monochrome CRT, sigils, reduced motion, mobile-first layout, access unchanged, sequential gates, direct URL guards, all answers, guestbook, local state, XSS escaping, delay, exit variations, reactivity, sound, mobile, reduced motion, no storage, no external resources.');
  } finally { await browser?.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });

async function checkCRT(browser, base, captures, errors) {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'no-preference' });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(String(response.status())); });
  await page.clock.install();
  await page.goto(base);
  assert.equal(await page.locator('.door-art').getAttribute('src'), '/assets/door-009.png');
  assert.equal(await page.locator('.door-art').evaluate(image => image.complete && image.naturalWidth > 0), true);
  assert.equal(await page.locator('#navigation').isVisible(), false);
  await page.screenshot({ path: join(captures, 'v3-entry-375.png'), fullPage: true });
  await page.locator('#password').fill('eco'); await page.locator('#password').press('Enter');
  await page.waitForURL('**/gate/00.html');
  assert.equal(await page.locator('.heptagram').count(), 0);
  assert.equal(await page.locator('.planet.selected').count(), 0);
  await page.locator('#answer').fill('no'); await page.locator('#answer-form button').click();
  await page.waitForURL('**/gate/01.html');
  assert.equal(await page.locator('.sigil').getAttribute('viewBox'), '0 0 400 400');
  assert.equal(await page.locator('.heptagram').count(), 1);
  assert.equal(await page.locator('.planet').count(), 7);
  assert.equal(await page.locator('.planet.selected').textContent(), '☽');
  assert.equal(await page.locator('.planet.selected').getAttribute('font-size'), '34');
  assert.equal(await page.locator('.cap').textContent(), 'lo de arriba también mira');
  assert.equal(await page.locator('body').evaluate(body => getComputedStyle(body).textAlign), 'center');
  assert.notEqual(await page.locator('h1').evaluate(title => getComputedStyle(title).textShadow), 'none');
  assert.equal(await page.evaluate(() => document.querySelector('#navigation').getBoundingClientRect().top > document.querySelector('#answer-form').getBoundingClientRect().bottom), true);
  for (const [layer, z] of [['.texture', '49'], ['.scan', '50'], ['.crt-bars', '51']]) {
    assert.equal(await page.locator(layer).getAttribute('aria-hidden'), 'true');
    assert.deepEqual(await page.locator(layer).evaluate(item => { const css = getComputedStyle(item); return [css.position, css.pointerEvents, css.zIndex]; }), ['fixed', 'none', z]);
  }
  for (const width of [375, 430, 1280]) {
    await page.setViewportSize({ width, height: width === 1280 ? 1000 : 812 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.ok(await page.locator('main').evaluate(main => main.getBoundingClientRect().width <= 640));
    await page.screenshot({ path: join(captures, `v3-luna-${width}.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => {
    window.crtEvents = [];
    new MutationObserver(records => {
      for (const record of records) {
        for (const item of record.addedNodes || []) if (item.id === 'screen-glitch') crtEvents.push({ type: 'slice-on', time: Date.now(), clip: item.style.clipPath, transform: item.style.transform, hidden: item.getAttribute('aria-hidden'), inert: item.inert, ids: item.querySelectorAll('[id]').length });
        for (const item of record.removedNodes || []) if (item.id === 'screen-glitch') crtEvents.push({ type: 'slice-off', time: Date.now() });
        if (record.type === 'attributes' && record.attributeName === 'class' && (record.target.classList.contains('bloom') || record.oldValue?.includes('bloom'))) crtEvents.push({ type: record.target.classList.contains('bloom') ? 'bloom-on' : 'bloom-off', time: Date.now() });
        if (record.type === 'attributes' && record.target.classList.contains('bar-top')) crtEvents.push({ type: record.target.style.opacity === '0.6' ? 'bar-on' : 'bar-off', time: Date.now() });
      }
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeOldValue: true, attributeFilter: ['class', 'style'] });
  });
  await page.clock.runFor(21000);
  const events = await page.evaluate(() => crtEvents);
  for (const type of ['slice', 'bloom', 'bar']) {
    const start = events.find(event => event.type === type + '-on');
    assert.ok(start, type + ' occurs on its own timer');
    const stop = events.find(event => event.type === type + '-off' && event.time > start.time);
    assert.ok(stop, type + ' ends');
    const duration = stop.time - start.time;
    const range = type === 'slice' ? [120, 261] : type === 'bloom' ? [150, 301] : [100, 101];
    assert.ok(duration >= range[0] && duration <= range[1], type + ' duration: ' + duration);
  }
  const slice = events.find(event => event.type === 'slice-on');
  assert.match(slice.clip, /inset/); assert.match(slice.transform, /translateX/);
  assert.equal(slice.hidden, 'true'); assert.equal(slice.inert, true); assert.equal(slice.ids, 0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.documentElement.dataset.crt === 'off');
  const before = await page.evaluate(() => crtEvents.filter(event => event.type.endsWith('-on')).length);
  await page.clock.runFor(60000);
  assert.equal(await page.evaluate(() => crtEvents.filter(event => event.type.endsWith('-on')).length), before);
  assert.equal(await page.locator('#screen-glitch,.bloom').count(), 0);
  assert.equal(await page.locator('.crt-bars').isVisible(), false);
  assert.equal(await page.locator('.bar-roll').evaluate(item => getComputedStyle(item).animationName), 'none');
  // Every generated sigil selects the requested sphere, including Saturn's reusable SVG.
  for (let gate = 0; gate <= 7; gate++) {
    const selection = await page.evaluate(gate => { const svg = renderSigil(gate); return [svg.querySelectorAll('.planet').length, svg.querySelectorAll('.planet.selected').length, svg.querySelector('.planet.selected')?.textContent]; }, gate);
    assert.equal(selection[0], 7); assert.equal(selection[1], gate ? 1 : 0);
    if (gate) assert.equal(selection[2], ['☽','☿','♀','☉','♂','♃','♄'][gate-1]);
  }
  await page.evaluate(() => { OccultStore.state.gate = 7; OccultStore.save(); });
  await page.goto(base + '/gate/07.html');
  await page.locator('canvas.saturn-art').waitFor();
  assert.equal(await page.locator('img.saturn-art').count(), 0);
  await page.waitForFunction(() => document.querySelector('canvas.saturn-art')?.width === 88);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('img.saturn-art').waitFor();
  assert.equal(await page.locator('img.saturn-art').getAttribute('src'), '/assets/still-here.gif');
  await page.locator('a[href="/rastro.html"]').click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: join(captures, 'v3-rastro-375.png'), fullPage: true });
  assert.deepEqual(errors, []);
}
