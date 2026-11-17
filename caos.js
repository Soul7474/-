/* Caos: nada en su sitio.
   - Fotos repartidas por toda la pantalla, distintas cada vez que entras en una sala: torcidas,
     cortadas, invertidas, medio fuera, algunas a la deriva muy despacio, alguna por delante.
   - Los vídeos y las imágenes dejan de ser rectángulos: bordes rotos, fundidos, torcidos.
   - Los títulos se escriben medio en runas, distinto cada vez; el archivo se desparrama.
   Con «calma» o movimiento reducido no hay deriva, pero el desorden sigue (es estático). */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const calm = () => document.body.classList.contains('quiet') || reduce.matches;
  const page = () => document.body.dataset.page || 'inicio';
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const wide = () => innerWidth > 760;

  // The scream image (dientes) and the face stay out, so the scares keep their weight.
  const pool = [
    'images/08fe20c9273df37c67b19fc5ad0369e8.png', 'images/0cef067d6389316753e85350caa85388.jpg', 'images/2483130d0df7e07e5d073b244c4f0aad.png',
    'images/2ce73613d01a7712d49bed29d90d0f45.jpg', 'images/3e0d7102c286a0afe144cd9858fbc4d3.jpg', 'images/4580f857040ef0339156318493389d7c.jpg',
    'images/495cd049144e95534f4a5b1121846380.jpg', 'images/5b1e40efde8af5a36118f25d87504663.png', 'images/6365f1e87b51c001864bd43957d3e17e.jpg',
    'images/6ae30bc87f2537c40cdb09d3b63bc07f.jpg', 'images/8ea51e04dca5ab2b5ab2a49c5aedab1c.jpg', 'images/8f0201d49a7c7816a5ed7256f6f4bee1.jpg',
    'images/91bcc74e941fa720f84af443207553f6.jpg', 'images/bdd5c1dd86d84a0fc78f47a880610902.jpg', 'images/ce8ad4bddf1ece13035ca941dcff674f.jpg',
    'assets/cutouts/revelation.png', 'assets/cutouts/sewn-eye.png', 'assets/cutouts/presence-hand.png', 'assets/cutouts/sentinel.png',
    'images/1fcd456cf85d8e9552e51348c9b2329f-Photoroom.png', 'images/2b44b4f573b1804269248319d29d2d82-Photoroom.png', 'images/47777b90c8030217e6dab7591869335a-Photoroom.png',
    'images/b90c6e0aedd2ea5ed4e573dea625b538-Photoroom.png', 'images/92c3c0a262c17ce734e0ce3ea7b85657.jpg', 'images/ac4bdf9ff2c705b72486c6131bc5c492.jpg',
    'assets/gif-stills/0.png', 'assets/gif-stills/1.png', 'assets/gif-stills/2.png', 'assets/gif-stills/3.png', 'assets/gif-stills/4.png', 'assets/gif-stills/5.png', 'assets/gif-stills/6.png'
  ];
  const quiet = new Set(['inicio', 'nadie']);
  // Moving pictures: at most one per room, so the page does not get heavy.
  const moving = ['images/d1ceba2760062a42ff49068ffdbcfcca.gif', 'images/kamluve-kam.gif', 'gifs/giphy%20(5).gif', 'gifs/giphy%20(6).gif', 'gifs/giphy.gif'];

  const back = document.createElement('div'); back.className = 'caos-layer'; back.setAttribute('aria-hidden', 'true');
  const front = document.createElement('div'); front.className = 'caos-layer front'; front.setAttribute('aria-hidden', 'true');
  document.body.append(back, front);

  function shot(layer, options = {}) {
    const image = document.createElement('img'); image.alt = ''; image.decoding = 'async'; image.loading = 'lazy';
    image.src = options.src || pick(pool);
    image.className = `caos-shot torn-${Math.floor(Math.random() * 5)}${Math.random() < .35 ? ' inv' : ''}${Math.random() < .2 ? ' soft' : ''}${Math.random() < .5 ? ' feather' : ''}`;
    const size = options.size ?? rand(wide() ? 9 : 22, wide() ? 34 : 62);
    Object.assign(image.style, {
      width: size + 'vw', left: rand(-12, 96 - size * .4) + 'vw', top: rand(-10, 92) + 'vh',
      rotate: rand(-24, 24).toFixed(1) + 'deg', opacity: (options.opacity ?? rand(.1, .42)).toFixed(2),
      mixBlendMode: pick(['screen', 'screen', 'lighten', 'difference', 'luminosity'])
    });
    if (Math.random() < .2) image.style.transform = 'scaleX(-1)';
    if (!calm() && Math.random() < .55) {
      image.classList.add('moving');
      image.style.setProperty('--dx', rand(-9, 9).toFixed(1) + 'vw'); image.style.setProperty('--dy', rand(-7, 7).toFixed(1) + 'vh');
      image.style.setProperty('--t', rand(28, 80).toFixed(0) + 's');
    }
    layer.append(image);
  }
  function scatterShots() {
    back.replaceChildren(); front.replaceChildren();
    if (quiet.has(page())) return;
    const interior = page() === 'interior';
    const count = interior ? 3 : wide() ? 9 : 6;
    for (let i = 0; i < count; i++) shot(back, interior ? { opacity: rand(.06, .16) } : {});
    if (!interior && Math.random() < .75) shot(back, { src: pick(moving), opacity: rand(.18, .4), size: rand(wide() ? 18 : 40, wide() ? 36 : 70) });
    // In the interior, the crouching thing is somewhere else every time. Sometimes it is not there.
    const crouch = $('.chamber-crouch');
    if (crouch) {
      crouch.hidden = !interior || Math.random() < .45;
      const corner = pick([{ left: '3%', bottom: '4%' }, { right: '4%', bottom: '3%' }, { left: '38%', bottom: '1%' }, { right: '30%', top: '58%' }]);
      Object.assign(crouch.style, { left: 'auto', right: 'auto', top: 'auto', bottom: 'auto', ...corner, transform: Math.random() < .5 ? 'scaleX(-1)' : 'none' });
    }
    // One or two in front of everything, barely there.
    for (let i = 0; i < (wide() ? 2 : 1); i++) shot(front, { opacity: rand(.05, .11), size: rand(30, 70) });
  }

  // No more rectangles: media frames get torn edges and sit crooked, differently each time.
  const media = '.corridor, .hero > figure, .archive-transmission, .haunted-screen, .visitor-screen, .unstable-tape, .wired-art, .hab-cam, .memory-fragment, .tape-wall > *, .vestige-wall > *, .archive-talisman, .visitor-talisman, .abstract-form';
  function tear(view) {
    view.querySelectorAll(media).forEach(node => {
      node.classList.remove('torn-0', 'torn-1', 'torn-2', 'torn-3', 'torn-4');
      node.classList.add('torn-' + Math.floor(Math.random() * 5), 'caos-media');
      node.style.rotate = rand(-7, 7).toFixed(1) + 'deg';
      node.style.marginLeft = (wide() ? rand(-4, 34) : rand(-6, 10)).toFixed(1) + '%';
      if (Math.random() < .3) node.style.transform = `skewX(${rand(-5, 5).toFixed(1)}deg)`;
    });
  }

  // Titles half in runes, never the same twice.
  const RUNES = { a: 'ᚨ', b: 'ᛒ', c: 'ᚲ', d: 'ᛞ', e: 'ᛖ', f: 'ᚠ', g: 'ᚷ', h: 'ᚺ', i: 'ᛁ', j: 'ᛃ', l: 'ᛚ', m: 'ᛗ', n: 'ᚾ', o: 'ᛟ', p: 'ᛈ', q: 'ᚲ', r: 'ᚱ', s: 'ᛊ', t: 'ᛏ', u: 'ᚢ', v: 'ᚹ', y: 'ᛃ', z: 'ᛉ' };
  const rune = char => RUNES[char.toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '')] ?? char;
  function haunt(view) {
    view.querySelectorAll('.page-intro h1, .ellos-title, .volcado-head').forEach(title => {
      if (!title.dataset.plain) title.dataset.plain = title.innerHTML;
      if (title.dataset.finished) return; // a sentence the station has already finished stays as it is
      title.innerHTML = title.dataset.plain;
      const share = rand(.18, .42);
      const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = [...node.textContent].map(char => Math.random() < share ? rune(char) : char).join('');
      title.style.marginLeft = (wide() ? rand(0, 46) : rand(0, 14)).toFixed(1) + '%';
      title.style.letterSpacing = rand(.02, .4).toFixed(2) + 'em';
    });
  }

  // The archive spills across the screen.
  function spill() {
    document.querySelectorAll('#archive-list .file-row').forEach(row => {
      row.style.marginLeft = (wide() ? rand(0, 52) : rand(0, 22)).toFixed(1) + '%';
      row.style.fontSize = rand(.8, 1.35).toFixed(2) + 'em';
      row.style.opacity = rand(.55, 1).toFixed(2);
    });
  }
  const list = $('#archive-list');
  if (list) new MutationObserver(spill).observe(list, { childList: true });

  function onRoute() {
    scatterShots();
    const view = $(`#view-${page()}`); if (!view) return;
    tear(view); haunt(view); spill();
  }
  addEventListener('hashchange', onRoute);
  let lastWide = wide();
  addEventListener('resize', () => { if (wide() !== lastWide) { lastWide = wide(); onRoute(); } });
  onRoute();
})();
