/* Vigilia: la estación se da cuenta de que estás.
   Todo ocurre en este navegador. No se envía nada a ninguna parte: las visitas se guardan en
   localStorage («estacion09-rastro») y el resto son reacciones a lo que ya hace la página
   (hora local, cambio de pestaña, inactividad, copiar, el puntero saliendo de la ventana).
   Los textos son susurros que aparecen escritos en runas y se «traducen» solos, letra a letra.
   Con movimiento reducido no hay animaciones; con «calma» tampoco hay cursor fantasma ni ecos. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const calm = () => document.body.classList.contains('quiet') || reduce.matches;
  const page = () => document.body.dataset.page || 'inicio';
  const screaming = () => { try { return Boolean(document.querySelector('#screamer:popover-open')); } catch { return !$('#screamer')?.hidden; } };
  const busy = () => !$('#listen-cover')?.hidden || !$('#door-passage')?.hidden || screaming();
  const started = performance.now();

  // ---- Rastro: tus visitas, guardadas aquí mismo --------------------------------------------
  const TRACE = 'estacion09-rastro';
  let trace = { visits: [], last: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(TRACE));
    if (saved && Array.isArray(saved.visits)) trace = { visits: saved.visits.filter(Number.isFinite).slice(-40), last: Number.isFinite(saved.last) ? saved.last : 0 };
  } catch {}
  const now = Date.now();
  const away = trace.last ? now - trace.last : 0;
  // A visit is a new arrival after half an hour without the page open.
  if (!trace.visits.length || away > 30 * 60 * 1000) trace.visits.push(now);
  const saveTrace = () => { trace.last = Date.now(); try { localStorage.setItem(TRACE, JSON.stringify(trace)); } catch {} };
  saveTrace(); setInterval(saveTrace, 20000);
  const visits = trace.visits.length;

  // ---- Futhark: lo mismo que enseña abecedario.txt -------------------------------------------
  const RUNES = { a: 'ᚨ', b: 'ᛒ', c: 'ᚲ', k: 'ᚲ', q: 'ᚲ', d: 'ᛞ', e: 'ᛖ', f: 'ᚠ', g: 'ᚷ', h: 'ᚺ', i: 'ᛁ', j: 'ᛃ', y: 'ᛃ', l: 'ᛚ', m: 'ᛗ', n: 'ᚾ', ñ: 'ᚾ', o: 'ᛟ', p: 'ᛈ', r: 'ᚱ', s: 'ᛊ', t: 'ᛏ', u: 'ᚢ', v: 'ᚹ', w: 'ᚹ', x: 'ᛉ', z: 'ᛉ', ' ': '᛫' };
  const rune = char => RUNES[char.toLocaleLowerCase('es').normalize('NFD').replace(/[̀-̂̄-ͯ]/g, '').normalize('NFC')] ?? char;

  // ---- Susurros ------------------------------------------------------------------------------
  const line = document.createElement('p');
  line.className = 'susurro'; line.setAttribute('role', 'status'); line.setAttribute('aria-live', 'polite');
  document.body.append(line);
  const queue = [];
  let speaking = false;
  let lastSpoke = -Infinity;
  const said = new Set();
  try { JSON.parse(sessionStorage.getItem('estacion09-dicho') || '[]').forEach(key => said.add(key)); } catch {}
  const remember = key => { said.add(key); try { sessionStorage.setItem('estacion09-dicho', JSON.stringify([...said])); } catch {} };

  // say(text, key): each key is said once per session; without a key it may repeat.
  function say(text, key = null, { urgent = false } = {}) {
    if (key && said.has(key)) return;
    if (key) remember(key);
    if (urgent) queue.unshift(text); else if (queue.length < 3) queue.push(text);
    pump();
  }
  function pump() {
    if (speaking || !queue.length) return;
    if (busy() || document.hidden) { setTimeout(pump, 1500); return; }
    const wait = 6500 - (performance.now() - lastSpoke);
    if (wait > 0) { setTimeout(pump, wait); return; }
    speak(queue.shift());
  }
  function speak(text) {
    speaking = true; lastSpoke = performance.now();
    line.classList.remove('fading'); line.classList.add('shown');
    const finish = () => setTimeout(() => {
      line.classList.add('fading');
      setTimeout(() => { line.classList.remove('shown', 'fading'); line.textContent = ''; speaking = false; lastSpoke = performance.now(); pump(); }, 1300);
    }, 3600 + text.length * 45);
    if (reduce.matches) { line.textContent = text; finish(); return; }
    // First the runes, then each one turns into its letter, in no particular order.
    const shown = [...text].map(rune);
    const order = shown.map((_, i) => i).sort(() => Math.random() - .5);
    line.textContent = shown.join('');
    let step = 0;
    setTimeout(function decode() {
      const batch = Math.max(1, Math.round(text.length / 26));
      for (let k = 0; k < batch && step < order.length; k++, step++) shown[order[step]] = text[order[step]];
      line.textContent = shown.join('');
      if (step < order.length) setTimeout(decode, 55); else finish();
    }, 900);
  }

  // ---- Lo que sabe de ti ----------------------------------------------------------------------
  const clock = new Date();
  const hhmm = clock.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  const hour = clock.getHours();
  const timeLine = hour < 6 ? `son las ${hhmm}. a esta hora no debería haber nadie.`
    : hour < 13 ? `${hhmm}. es de día ahí fuera. aquí no.`
    : hour < 21 ? `${hhmm}. aquí siempre son las 03:33.`
    : `${hhmm}. ya casi es la hora.`;
  const days = Math.floor(away / 86400000);
  const visitLine = visits <= 1 ? 'nadie te ha dado esta dirección.'
    : days >= 1 && visits === 2 ? `has vuelto. ${days === 1 ? 'ayer' : `hace ${days} días`} cerraste la ventana. no sirvió.`
    : visits === 2 ? 'has vuelto.'
    : `${visits}.ª vez. ya no hace falta que llames.`;
  const touch = matchMedia('(pointer: coarse)').matches;
  const deviceLine = touch ? 'lo tienes muy cerca de la cara.' : 'no te acerques tanto a la pantalla.';

  let resetLine = false;
  try { resetLine = sessionStorage.getItem('estacion09-borrado') === '1'; sessionStorage.removeItem('estacion09-borrado'); } catch {}
  if (resetLine) setTimeout(() => say('has borrado tu rastro. nosotros no.', null, { urgent: true }), 2500);

  // The opening lines wait for the 403 cover and the door scene to be out of the way.
  setTimeout(() => say(timeLine, 'hora'), 9000);
  setTimeout(() => say(visitLine, 'visitas'), 26000);
  setTimeout(() => say(deviceLine, 'aparato'), 70000);

  // ---- Inactividad -----------------------------------------------------------------------------
  let idleSince = performance.now();
  const stillLines = [[35000, '¿sigues ahí?', 'quieto-1'], [75000, 'te oigo respirar.', 'quieto-2'], [140000, 'no pasa nada. nosotros también esperamos.', 'quieto-3']];
  const stir = () => { idleSince = performance.now(); };
  for (const type of ['pointermove', 'pointerdown', 'keydown', 'scroll', 'wheel']) addEventListener(type, stir, { passive: true });
  setInterval(() => {
    if (document.hidden || busy()) return;
    const idle = performance.now() - idleSince;
    for (const [after, text, key] of stillLines) if (idle > after) say(text, key);
  }, 2000);

  // ---- Lo que haces ----------------------------------------------------------------------------
  let lastLeave = -Infinity;
  document.documentElement.addEventListener('mouseleave', event => {
    if (event.clientY > 0 || performance.now() - lastLeave < 60000 || performance.now() - started < 8000) return;
    lastLeave = performance.now(); eyeWide(2500);
    say(['no te vayas.', 'todavía no.', 'la puerta está detrás de ti.'][Math.floor(Math.random() * 3)], null, { urgent: true });
  });
  document.addEventListener('copy', () => say('eso no es tuyo.', 'copiar', { urgent: true }));
  document.addEventListener('contextmenu', () => say('¿qué buscas?', 'menu'));
  addEventListener('keydown', event => {
    const key = event.key.toLowerCase();
    if (key === 'f12' || ((event.ctrlKey || event.metaKey) && (key === 'u' || (event.shiftKey && ['i', 'j', 'c'].includes(key))))) say('no vas a encontrar nada ahí dentro.', 'codigo', { urgent: true });
  });
  let widest = innerWidth;
  addEventListener('resize', () => {
    if (innerWidth < widest * .7 && finePointer.matches) say('no hace falta que la hagas más pequeña. te seguimos viendo.', 'encoger');
    widest = Math.max(widest, innerWidth);
  });
  const placeLines = {
    archivo: ['esto no estaba indexado.', 'lugar-archivo'],
    visitantes: ['no firmes con tu nombre de verdad.', 'lugar-huellas'],
    transmisiones: ['baja el volumen. no hace falta que lo oigas para que te oiga.', 'lugar-voces'],
    estatua: ['no la mires tanto.', 'lugar-estatua'],
    interior: ['ya estás dentro. eso no se deshace.', 'lugar-dentro']
  };
  addEventListener('hashchange', () => { const place = placeLines[page()]; if (place) setTimeout(() => say(...place), 2500); });
  document.getElementById('confirm-reset')?.addEventListener('click', () => { try { sessionStorage.setItem('estacion09-borrado', '1'); } catch {} });

  // Something in the console, for whoever looks there.
  try {
    console.log('%cᛃᚨ᛫ᛖᛊᛏᚨᛊ᛫ᛞᛖᚾᛏᚱᛟ', 'font:20px monospace;color:#ddd;background:#000;padding:8px 14px;letter-spacing:6px');
    console.log('%csi estás leyendo esto, ya has mirado demasiado.', 'font:12px monospace;color:#888');
  } catch {}

  // ---- La pestaña --------------------------------------------------------------------------------
  const leavingTitles = ['¿adónde vas?', 'vuelve', 'sigo aquí', '(1) estación 09', 'no he cerrado la puerta'];
  let savedTitle = ''; let titleTimer = 0; let hiddenAt = 0; let returns = 0;
  // When you come back, one small thing you already read has changed. Only one, each time.
  const mutations = [
    ['.header-message', 'Este lugar ya no existe. <span>¿Por qué has vuelto?</span>'],
    ['.sidebar-note p', 'Ya no es la primera vez<br>que estás aquí.'],
    ['.system-box small', 'quedas tú.'],
    ['.sidebar-foot', 'hecho a mano, al otro lado de la red.<br>optimizado para ti.'],
    ['.archive-foot', 'FIN DEL ÍNDICE RECUPERABLE · <span id="unlock-status">sabe que lo has leído</span>'],
    ['.statue-note', 'INV. 1998-114 · busto · mármol · procedencia: —<br>estado: <span id="statue-state">esperando</span>']
  ];
  document.addEventListener('visibilitychange', () => {
    clearInterval(titleTimer);
    if (document.hidden) {
      hiddenAt = performance.now(); savedTitle = document.title; let i = 0;
      document.title = leavingTitles[0]; eyeWide(Infinity);
      titleTimer = setInterval(() => { document.title = leavingTitles[++i % leavingTitles.length]; }, 2600);
      return;
    }
    eyeWide(1800);
    if (!savedTitle) return;
    const back = 'te he visto volver';
    document.title = back;
    setTimeout(() => { if (document.title === back) document.title = savedTitle; }, 3500);
    if (performance.now() - hiddenAt < 3000) return;
    returns++;
    const mutation = mutations.find(([selector, html]) => { const node = $(selector); return node && node.innerHTML !== html; });
    if (mutation) $(mutation[0]).innerHTML = mutation[1];
    say(returns === 1 ? '¿dónde estabas?' : returns === 2 ? 'otra vez.' : 'siempre vuelves.', null, { urgent: true });
  });

  // ---- Favicon: un ojo que parpadea, y que se queda abierto cuando no miras ------------------------
  const icon = document.querySelector('link[rel="icon"]');
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 32;
  const ink = canvas.getContext('2d');
  let wideUntil = 0;
  function drawEye(openness, wide) {
    if (!ink || !icon) return;
    ink.clearRect(0, 0, 32, 32); ink.fillStyle = '#000'; ink.fillRect(0, 0, 32, 32);
    ink.strokeStyle = '#ddd'; ink.lineWidth = 1.6;
    const lid = 11 * openness;
    ink.beginPath(); ink.moveTo(2, 16); ink.quadraticCurveTo(16, 16 - lid * 2, 30, 16); ink.quadraticCurveTo(16, 16 + lid * 2, 2, 16); ink.closePath(); ink.stroke();
    if (openness > .2) {
      ink.save(); ink.clip();
      ink.fillStyle = '#ddd'; ink.beginPath(); ink.arc(16, 16, wide ? 7 : 6, 0, Math.PI * 2); ink.fill();
      ink.fillStyle = '#000'; ink.beginPath(); ink.arc(16, 16, wide ? 1.6 : 3, 0, Math.PI * 2); ink.fill();
      ink.restore();
    }
    icon.type = 'image/png'; icon.href = canvas.toDataURL('image/png');
  }
  function eyeWide(ms) { wideUntil = ms === Infinity ? Infinity : performance.now() + ms; drawEye(1, true); if (ms !== Infinity) setTimeout(() => { if (performance.now() >= wideUntil) drawEye(1, false); }, ms + 50); }
  drawEye(1, false);
  (function blink() {
    setTimeout(() => {
      if (!reduce.matches && performance.now() > wideUntil) {
        drawEye(.35, false); setTimeout(() => drawEye(0, false), 60);
        setTimeout(() => { if (performance.now() > wideUntil) drawEye(1, false); }, 190);
      }
      blink();
    }, 3500 + Math.random() * 6000);
  })();

  // ---- Lo que cambia mientras lees ------------------------------------------------------------------
  // A document left open changes one sentence, without warning. Read it again.
  const rewrites = {
    'leeme_antes.txt': ['No sabemos por qué.', 'Ahora sabemos por qué.'],
    'operador_09.log': ['03:10 — Todos se han ido.', '03:10 — Todos se han ido. Menos tú.'],
    'presencias.dat': ['No entraste dos veces.', 'No entraste solo.'],
    'frecuencia_098.txt': ['No hace falta.', 'Ya te oye.'],
    'inventario_1998.txt': ['A la mañana siguiente, no.', 'Ahora está de cara a ti.'],
    'no_abrir.txt': ['no mires si la señal sigue ahí.', 'no mires detrás de ti.']
  };
  const documentDialog = $('#document-dialog');
  let rewriteTimer = 0;
  if (documentDialog) new MutationObserver(() => {
    clearTimeout(rewriteTimer);
    if (!documentDialog.open) return;
    const name = $('#document-title')?.textContent; const swap = rewrites[name]; if (!swap) return;
    rewriteTimer = setTimeout(() => {
      const text = documentDialog.querySelector('#document-body > p');
      if (documentDialog.open && $('#document-title').textContent === name && text?.textContent.includes(swap[0])) text.textContent = text.textContent.replace(swap[0], swap[1]);
    }, 8000 + Math.random() * 4000);
  }).observe(documentDialog, { attributes: true, attributeFilter: ['open'] });

  // Scroll down the archive and come back up: the title has finished its sentence.
  let archiveDepth = 0;
  addEventListener('scroll', () => {
    if (page() !== 'archivo') { archiveDepth = 0; return; }
    archiveDepth = Math.max(archiveDepth, scrollY);
    const title = $('#view-archivo .page-intro h1');
    if (archiveDepth > 650 && scrollY < 80 && title && !title.dataset.finished) { title.dataset.finished = '1'; title.innerHTML = 'Lo que queda <em>de ti.</em>'; }
  }, { passive: true });

  // The guestbook reads you while you write.
  $('#guest-message')?.addEventListener('input', () => say('te leemos mientras escribes.', 'escribir'), { once: true });
  $('#guest-name')?.addEventListener('change', event => {
    const alias = event.target.value.trim().toLocaleLowerCase('es');
    if (alias && alias !== 'operador_09' && alias !== 'anónimo') say('ese no es tu nombre.', 'alias', { urgent: true });
  });

  // ---- Alguien más en la pantalla ------------------------------------------------------------------
  // With a mouse: a second, fainter cursor follows yours, late. Now and then it lets you go and
  // rests on a link, as if someone else were choosing. On a touch screen: sometimes, a moment after
  // you touch, a faint ring answers in the mirrored place. Never with calma or reduced motion.
  const ghost = document.createElement('span'); ghost.className = 'ghost-cursor'; ghost.setAttribute('aria-hidden', 'true');
  document.body.append(ghost);
  const pointer = { x: innerWidth / 2, y: innerHeight / 2, seen: false };
  const shade = { x: innerWidth / 2, y: innerHeight + 40, target: null, until: 0 };
  addEventListener('pointermove', event => { if (event.pointerType === 'mouse') { pointer.x = event.clientX; pointer.y = event.clientY; pointer.seen = true; } }, { passive: true });
  let nextWander = performance.now() + 45000;
  (function follow() {
    requestAnimationFrame(follow);
    const allowed = finePointer.matches && pointer.seen && !calm() && !busy() && !document.hidden && performance.now() - started > 25000 && page() !== 'inicio';
    ghost.classList.toggle('present', allowed);
    if (!allowed) return;
    const t = performance.now();
    if (t > nextWander && !shade.target) {
      const links = [...document.querySelectorAll('main a, main button, .main-nav a')].filter(node => { const box = node.getBoundingClientRect(); return box.width && box.top > 0 && box.bottom < innerHeight; });
      if (links.length) { shade.target = links[Math.floor(Math.random() * links.length)]; shade.until = t + 3200; }
      nextWander = t + 40000 + Math.random() * 40000;
    }
    let tx = pointer.x, ty = pointer.y, rate = .035;
    if (shade.target) {
      const box = shade.target.getBoundingClientRect(); tx = box.left + box.width / 2; ty = box.top + box.height / 2; rate = .05;
      if (t > shade.until || !shade.target.isConnected) shade.target = null;
    } else {
      // It stops a little short of you, never on top.
      const dx = tx - shade.x, dy = ty - shade.y, d = Math.hypot(dx, dy);
      if (d < 46) { tx = shade.x; ty = shade.y; }
    }
    shade.x += (tx - shade.x) * rate; shade.y += (ty - shade.y) * rate;
    ghost.style.translate = `${shade.x}px ${shade.y}px`;
  })();
  let lastEcho = -Infinity;
  addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || calm() || busy() || performance.now() - started < 20000 || performance.now() - lastEcho < 40000 || Math.random() > .22) return;
    lastEcho = performance.now();
    const x = innerWidth - event.clientX, y = event.clientY + (Math.random() * 80 - 40);
    setTimeout(() => {
      if (calm() || busy()) return;
      const ring = document.createElement('span'); ring.className = 'touch-echo'; ring.setAttribute('aria-hidden', 'true');
      ring.style.left = x + 'px'; ring.style.top = y + 'px'; document.body.append(ring);
      setTimeout(() => ring.remove(), 1400);
    }, 900);
  }, { passive: true });
})();
