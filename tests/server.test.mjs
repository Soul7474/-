import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { server } from '../server.mjs';
let base;
before(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); });
test('serves the Spanish station and its working client scripts', async () => {
  const page = await fetch(base);
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-type'), /text\/html/);
  const html = await page.text();
  assert.match(html, /lang="es"/);
  assert.match(html, /id="gate-form"/);
  assert.match(html, /data-door="closed"/);
  assert.match(html, /id="door-whisper"/);
  for (const rune of ['e', 'c', 'o']) assert.match(html, new RegExp(`data-rune="${rune}"`));
  for (const path of ['/app.js', '/style.css', '/interior.js', '/interior.css']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    assert.ok((await response.text()).length > 1000);
  }
});
test('serves real GIF images, a reduced-motion image and a favicon', async () => {
  for (const path of ['/assets/corridor.gif', '/assets/still-here.gif']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/gif');
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.match(bytes.subarray(0, 6).toString(), /GIF8[79]a/);
    assert.ok(bytes.includes(Buffer.from('NETSCAPE2.0')));
  }
  assert.equal((await fetch(base + '/assets/corridor-still.jpg')).status, 200);
  assert.equal((await fetch(base + '/assets/sigil.svg')).status, 200);
  const artwork = await fetch(base + '/assets/wired-memory.svg');
  assert.equal(artwork.status, 200);
  assert.match(artwork.headers.get('content-type'), /image\/svg\+xml/);
  assert.match(await artwork.text(), /<svg/);
  const seal = await fetch(base + '/assets/threshold-seal.svg');
  assert.equal(seal.status, 200);
  assert.match(await seal.text(), /<svg/);
  const door = await fetch(base + '/assets/door-009.png');
  assert.equal(door.status, 200);
  assert.equal(door.headers.get('content-type'), 'image/png');
  const image = Buffer.from(await door.arrayBuffer());
  assert.equal(image.subarray(1, 4).toString(), 'PNG');
  const presence = await fetch(base + '/assets/presence.png');
  assert.equal(presence.status, 200);
  assert.equal(presence.headers.get('content-type'), 'image/png');
  for (const path of ['/assets/inner-relic.png', '/assets/echo-form.svg', '/assets/trace-form.svg', '/assets/door-shut.svg', '/assets/cutouts/presence-face.png', '/assets/cutouts/presence-hand.png', '/images/c2f15d46dadaea0d78573a3436c1f21d.png', '/images/2483130d0df7e07e5d073b244c4f0aad.png']) {
    assert.equal((await fetch(base + path)).status, 200, path);
  }
});
test('returns a real 404 for missing files and blocks source/configuration exposure', async () => {
  for (const path of ['/no-existe', '/package.json', '/server.mjs', '/.git/config', '/%2e%2e%2fREADME.md', '/%ZZ']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 404, path);
  }
});
test('HEAD returns resource headers without a body', async () => {
  const response = await fetch(base, { method: 'HEAD' });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.equal(await response.text(), '');
});

test('serves supplied originals unchanged and transparent cutout PNGs', async () => {
  const originals = await readdir(new URL('../images/', import.meta.url));
  assert.equal(originals.length, 17);
  for (const name of originals) {
    const response = await fetch(base + '/images/' + name);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), name.endsWith('.png') ? 'image/png' : 'image/jpeg');
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(new URL('../images/' + name, import.meta.url)));
  }
  for (const name of ['sentinel', 'revelation', 'sewn-eye', 'presence-face', 'presence-hand']) {
    const response = await fetch(base + '/assets/cutouts/' + name + '.png');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/png');
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    assert.equal(bytes[25], 6, 'PNG has RGBA channels');
  }
});

test('serves the seven uploaded tapes unchanged with their still alternatives', async () => {
  const names = await readdir(new URL('../gifs/', import.meta.url));
  assert.equal(names.length, 7);
  for (const name of names) {
    const response = await fetch(base + '/gifs/' + encodeURIComponent(name));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/gif');
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.deepEqual(bytes, await readFile(new URL('../gifs/' + name, import.meta.url)));
  }
  for (let i = 0; i < 7; i++) {
    const response = await fetch(base + '/assets/gif-stills/' + i + '.png');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'image/png');
    assert.equal(Buffer.from(await response.arrayBuffer()).subarray(1, 4).toString(), 'PNG');
  }
});
