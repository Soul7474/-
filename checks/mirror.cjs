const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { existsSync, mkdirSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
(async () => {
  const { server } = await import('../server.mjs');
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const captures = join(tmpdir(), 'estacion09-check'); mkdirSync(captures, { recursive: true });
  let browser;
  try {
    browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox', '--use-fake-device-for-media-stream'] });
    const context = await browser.newContext({ permissions: ['camera'], viewport: { width: 1280, height: 900 } });
    const page = await context.newPage(); const errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push({ url: request.url(), method: request.method() }));
    await page.addInitScript(() => {
      window.cameraCalls = []; window.cameraStreams = [];
      const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async constraints => { cameraCalls.push(constraints); const stream = await original(constraints); cameraStreams.push(stream); return stream; };
    });
    await page.goto(base + '/mirror.html');
    assert.equal(await page.evaluate(() => cameraCalls.length), 0, 'never request camera on load');
    await page.locator('#enable-camera').click();
    await page.waitForFunction(() => document.body.dataset.mode === 'live');
    assert.equal(await page.evaluate(() => cameraCalls[0].audio), false);
    assert.equal(await page.evaluate(() => document.querySelector('video').srcObject.getAudioTracks().length), 0);
    await page.screenshot({ path: join(captures, 'mirror-local-fake-camera.png') });
    await page.locator('#stop-camera').click();
    assert.equal(await page.evaluate(() => cameraStreams.every(s => s.getTracks().every(t => t.readyState === 'ended'))), true);
    assert.equal(await page.locator('video').evaluate(v => v.srcObject), null);
    await page.locator('#enable-camera').click(); await page.waitForFunction(() => document.body.dataset.mode === 'live');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => cameraStreams.every(s => s.getTracks().every(t => t.readyState === 'ended'))), true);
    await page.locator('#enable-camera').click(); await page.waitForFunction(() => document.body.dataset.mode === 'live');
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    assert.equal(await page.evaluate(() => cameraStreams.every(s => s.getTracks().every(t => t.readyState === 'ended'))), true);
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { value: false, configurable: true }); });
    await page.locator('#enable-camera').click(); await page.waitForFunction(() => document.body.dataset.mode === 'live');
    await page.evaluate(() => dispatchEvent(new Event('pagehide')));
    assert.equal(await page.evaluate(() => cameraStreams.every(s => s.getTracks().every(t => t.readyState === 'ended'))), true);
    // Permission rejection and absent-device paths use actual browser-like exceptions.
    const denial = await context.newPage(); denial.on('pageerror', e => errors.push(e.message));
    await denial.addInitScript(() => {
      window.cameraAttempts = 0;
      navigator.mediaDevices.getUserMedia = async () => { cameraAttempts++; throw new DOMException('Permission denied', 'NotAllowedError'); };
    });
    await denial.goto(base + '/mirror.html'); await denial.locator('#enable-camera').click();
    await denial.waitForFunction(() => document.body.dataset.mode === 'fiction');
    assert.match(await denial.locator('#camera-status').textContent(), /No se ha accedido/);
    assert.match(await denial.locator('#receiver-state').textContent(), /sin cámara/);
    assert.equal(await denial.evaluate(() => cameraAttempts), 1);
    await denial.locator('#without-camera').click(); assert.equal(await denial.evaluate(() => cameraAttempts), 1);
    await denial.screenshot({ path: join(captures, 'mirror-fiction.png') });
    await denial.locator('#quiet-mirror').click(); assert.equal(await denial.locator('body').getAttribute('data-quiet'), 'true');
    await denial.emulateMedia({ reducedMotion: 'reduce' });
    await denial.waitForFunction(() => document.querySelector('#quiet-mirror').disabled);
    for (const width of [320, 390, 768]) { await denial.setViewportSize({ width, height: 844 }); assert.equal(await denial.evaluate(() => document.documentElement.scrollWidth > innerWidth), false); }
    await denial.setViewportSize({ width: 390, height: 844 }); await denial.screenshot({ path: join(captures, 'mirror-mobile.png'), fullPage: true });
    // A permission grant arriving after cancellation must be shut down immediately.
    const late = await context.newPage(); late.on('pageerror', e => errors.push(e.message));
    await late.addInitScript(() => {
      const native = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
      navigator.mediaDevices.getUserMedia = async options => {
        const stream = await native(options); window.lateStream = stream;
        return new Promise(resolve => { window.releasePermission = () => resolve(stream); });
      };
    });
    await late.goto(base + '/mirror.html'); await late.locator('#enable-camera').click();
    await late.waitForFunction(() => typeof releasePermission === 'function');
    await late.locator('#cancel-camera').click(); await late.evaluate(() => releasePermission());
    await late.waitForFunction(() => lateStream.getTracks().every(t => t.readyState === 'ended'));
    assert.equal(await late.locator('body').getAttribute('data-mode'), 'idle');
    assert.equal(await late.locator('video').evaluate(v => v.srcObject), null);
    assert.equal(requests.every(r => r.method === 'GET' && r.url.startsWith(base)), true, 'no media uploads or third-party requests');
    assert.deepEqual(errors, []);
    console.log('PASS: explicit permission, local fake-camera video, audio disabled, stop, Escape, visibility, pagehide, refusal, fictional fallback, calm, reduced motion, mobile, late permission cleanup, no uploads.');
  } finally { await browser?.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
