/* Interior only. Entrance code lives in app.js and is owned independently. */
(() => {
  'use strict';
  const station = window.EstacionInterior;
  if (!station) return;
  const $ = selector => document.querySelector(selector);
  const chamber = $('.chamber-space');
  const dialog = $('#memory-dialog');
  const body = $('#memory-content');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'estacion09-interior';
  let memory = { visits: 0, unlocked: false };
  try {
    const value = JSON.parse(sessionStorage.getItem(key));
    if (value) memory = { visits: Number.isSafeInteger(value.visits) ? Math.max(0, value.visits) : 0, unlocked: value.unlocked === true };
  } catch {}
  const save = () => { try { sessionStorage.setItem(key, JSON.stringify(memory)); } catch {} };
  const active = () => station.view() !== 'inicio';
  const allowed = () => active() && station.effects() && !reduce.matches;
  const visibleDialog = () => Boolean(document.querySelector('dialog[open]'));
  const marks = {
    witness: { image: 'assets/cutouts/sewn-eye.png', sign: '⊙', label: 'Un ojo cosido. Debajo se repite la marca del ojo.', ink: false },
    touch: { image: 'images/6365f1e87b51c001864bd43957d3e17e.jpg', sign: '⋔', label: 'Una mano con un ojo; la marca de los dedos se repite debajo.', ink: true },
    absence: { image: 'images/4580f857040ef0339156318493389d7c.jpg', sign: '☾', label: 'Una figura alargada con una luna vacía en la cabeza.', ink: true }
  };
  let opener;
  let inspected = false;
  let sequence = [];
  let pending = null;
  let lastApparition = -Infinity;
  let touches = 0;
  let hushUntil = 0;
  let soundTimer;
  let signalTimer;
  let signalHideTimer;
  const sounds = new Set();
  function applyMemory() {
    chamber.dataset.haunting = allowed() ? String(memory.visits % 4) : '0';
    $('.mark-seal').dataset.open = String(memory.unlocked);
    $('.mark-seal').setAttribute('aria-label', memory.unlocked ? 'Abrir el fragmento del sello' : 'Examinar el sello cerrado');
  }
  function clearPending() { clearTimeout(pending); pending = null; }
  function stopSounds() {
    clearTimeout(soundTimer);
    for (const sound of sounds) sound.stop();
    sounds.clear();
  }
  function noise(kind = 'tape') {
    const ctx = station.sound();
    if (!ctx || !allowed() || performance.now() < hushUntil) return;
    const duration = kind === 'knock' ? .65 : 1.5;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      data[i] = (Math.random() * 2 - 1) * (kind === 'knock' ? Math.exp(-t * 19) + .45 * Math.exp(-Math.abs(t - .27) * 55) : .4 + .3 * Math.sin(t * 8));
    }
    const source = ctx.createBufferSource(); source.buffer = buffer;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = kind === 'knock' ? 170 : 720;
    const gain = ctx.createGain(); const now = ctx.currentTime;
    gain.gain.setValueAtTime(.001, now); gain.gain.linearRampToValueAtTime(kind === 'knock' ? .045 : .018, now + .025);
    gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    source.connect(filter); filter.connect(gain);
    const pan = ctx.createStereoPanner?.();
    if (pan) { pan.pan.value = Math.random() < .5 ? -.7 : .7; gain.connect(pan); pan.connect(ctx.destination); }
    else gain.connect(ctx.destination);
    source.start(); source.stop(now + duration);
    const record = { stop() { try { source.stop(); } catch {} } }; sounds.add(record);
    source.onended = () => { sounds.delete(record); source.disconnect(); filter.disconnect(); gain.disconnect(); pan?.disconnect(); };
  }
  function planSound() {
    clearTimeout(soundTimer);
    if (!allowed() || !station.sound()) return;
    soundTimer = setTimeout(() => {
      if (allowed() && !visibleDialog()) noise(Math.random() < .5 ? 'knock' : 'tape');
      planSound();
    }, 16000 + Math.random() * 15000);
  }
  function request(cause) {
    if (!allowed() || visibleDialog() || pending || performance.now() < hushUntil || performance.now() - lastApparition < 48000) return;
    if (cause === 'touch' && ++touches % 2 !== 0) { noise('tape'); return; }
    pending = setTimeout(() => {
      pending = null;
      if (!allowed() || visibleDialog() || performance.now() < hushUntil) return;
      lastApparition = performance.now();
      station.apparition(); noise('knock');
    }, 1300 + Math.random() * 1700);
  }
  window.EstacionRitual = Object.freeze({ request });
  function afterInspection() {
    if (!active()) return;
    memory.visits++; save(); applyMemory();
    if (allowed()) noise(memory.visits % 2 ? 'tape' : 'knock');
    if (memory.visits % 3 === 0) request('return');
  }
  $('#document-dialog').addEventListener('close', afterInspection);
  function clearBody() { body.replaceChildren(); }
  function node(tag, text, cls) {
    const item = document.createElement(tag); if (text !== undefined) item.textContent = text; if (cls) item.className = cls; return item;
  }
  function image(src, label, cls) { const item = node('img', undefined, cls); item.src = src; item.alt = label; return item; }
  function openMemory() {
    clearPending(); opener = document.activeElement; inspected = true;
    dialog.showModal();
  }
  function inspectMark(name) {
    if (!marks[name]) return;
    clearBody(); const mark = marks[name];
    const field = node('div', undefined, 'memory-image');
    field.append(image(mark.image, mark.label, mark.ink ? 'ink-source' : ''));
    const sign = node('span', mark.sign, 'hidden-inscription'); sign.setAttribute('aria-hidden', 'true'); field.append(sign);
    body.append(field); openMemory();
  }
  function fragment() {
    clearBody();
    const field = node('div', undefined, 'sealed-fragment');
    field.append(image('images/0cef067d6389316753e85350caa85388.jpg', 'Una multitud permanece mirando desde el fondo.', 'fragment-crowd'));
    field.append(image('assets/cutouts/sentinel.png', 'La figura del ojo ya no está sola.', 'fragment-presence'));
    const date = node('p', 'MCMXCVIII', 'fragment-date'); date.setAttribute('aria-label', 'Mil novecientos noventa y ocho, en números romanos'); field.append(date);
    body.append(field);
    const below = node('button', '☾', 'fragment-below'); below.type = 'button'; below.setAttribute('aria-label', 'Acercarse a la puerta del subsuelo');
    below.addEventListener('click', () => { dialog.close(); station.subsoil(); }); body.append(below);
  }
  function openSeal() {
    clearBody(); sequence = [];
    if (memory.unlocked) { fragment(); openMemory(); return; }
    const form = node('form', undefined, 'seal-form');
    const choices = node('div', undefined, 'seal-choices');
    const impression = node('output', '', 'seal-impression'); impression.setAttribute('aria-live', 'polite');
    const status = node('p', '', 'seal-status'); status.setAttribute('role', 'status');
    function unlock() { memory.unlocked = true; save(); applyMemory(); noise('tape'); fragment(); }
    for (const [id, text] of [['absence', '☾'], ['witness', '⊙'], ['touch', '⋔']]) {
      const button = node('button', text); button.type = 'button'; button.dataset.sign = id;
      button.setAttribute('aria-label', { absence: 'Luna', witness: 'Ojo', touch: 'Mano' }[id]);
      button.addEventListener('click', () => {
        if (sequence.length === 3) { sequence = []; status.textContent = ''; }
        sequence.push(id); impression.textContent = sequence.map(name => marks[name].sign).join('  ');
        if (sequence.length === 3) {
          if (sequence.join() === 'witness,touch,absence') unlock();
          else { status.textContent = 'No responde.'; noise('tape'); }
        }
      }); choices.append(button);
    }
    const label = node('label', 'lo que queda'); label.htmlFor = 'seal-word';
    const input = node('input'); input.id = 'seal-word'; input.autocomplete = 'off'; input.spellcheck = false; input.maxLength = 40; input.setAttribute('aria-describedby', 'seal-word-status');
    status.id = 'seal-word-status';
    const submit = node('button', '↵', 'seal-submit'); submit.type = 'submit'; submit.setAttribute('aria-label', 'Pronunciar la palabra');
    const hint = node('details', undefined, 'seal-hint'); hint.append(node('summary', 'una grieta'), node('p', 'lo que mira · lo que toca · lo que falta. Una voz deja otra entrada.'));
    form.append(choices, impression, label, input, submit, status, hint);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (input.value.trim().toLowerCase() === 'umbra') unlock();
      else { status.textContent = 'No responde.'; input.setAttribute('aria-invalid', 'true'); noise('tape'); }
    });
    body.append(form); openMemory();
  }
  document.querySelectorAll('[data-memory]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.memory === 'seal') openSeal(); else inspectMark(button.dataset.memory);
  }));
  dialog.addEventListener('click', event => { if (event.target === dialog || event.target.closest('[data-memory-close]')) dialog.close(); });
  dialog.addEventListener('close', () => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    if (inspected) { inspected = false; afterInspection(); }
  });
  const signal = $('.signal-word');
  function endSignal() { clearTimeout(signalTimer); clearTimeout(signalHideTimer); signal.hidden = true; signal.textContent = ''; $('.haunted-screen').classList.remove('tuned'); }
  function tune() {
    endSignal(); clearPending();
    const reveal = () => {
      if (station.view() !== 'transmisiones' || document.hidden) return;
      signal.textContent = '⊙  ·  ⋔  ·  ☾\nUMBRA'; signal.hidden = false;
      $('.haunted-screen').classList.add('tuned');
      signalHideTimer = setTimeout(endSignal, reduce.matches ? 14000 : 9000);
    };
    if (reduce.matches || !station.effects()) reveal(); else signalTimer = setTimeout(reveal, 1600);
  }
  $('.signal-reveal').addEventListener('click', tune);
  window.addEventListener('station:transmission', tune);
  // Parallax: the presences shift a little with the pointer, or with the phone's tilt where the
  // browser reports it without asking; the sentinel and the moon figure turn slightly to follow.
  // Only CSS variables change; the doors are not part of it. Off with calma or reduced motion.
  let tiltFrame = 0;
  let tilt = { x: 0, y: 0 };
  function setTilt(x, y) {
    tilt = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
    if (tiltFrame) return;
    tiltFrame = requestAnimationFrame(() => {
      tiltFrame = 0; const on = allowed();
      chamber.style.setProperty('--px', on ? tilt.x.toFixed(3) : '0');
      chamber.style.setProperty('--py', on ? tilt.y.toFixed(3) : '0');
    });
  }
  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'mouse' && allowed()) setTilt(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1);
  }, { passive: true });
  window.addEventListener('deviceorientation', event => {
    if (allowed() && event.gamma !== null && event.beta !== null) setTilt(event.gamma / 25, (event.beta - 40) / 25);
  }, { passive: true });
  function environmentChanged() {
    setTilt(0, 0);
    clearPending(); stopSounds(); applyMemory();
    if (!active() || document.hidden) endSignal();
    planSound();
  }
  window.addEventListener('hashchange', () => { if (dialog.open) dialog.close(); endSignal(); environmentChanged(); });
  window.addEventListener('station:sound', environmentChanged);
  $('#omens-toggle').addEventListener('click', environmentChanged);
  reduce.addEventListener('change', environmentChanged);
  document.addEventListener('visibilitychange', environmentChanged);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    hushUntil = performance.now() + 20000; clearPending(); stopSounds(); endSignal();
  });
  $('#confirm-reset').addEventListener('click', () => { try { sessionStorage.removeItem(key); } catch {} });
  environmentChanged();
})();
