(() => {
  'use strict';
  const store = window.OccultStore;
  if (!store) return;
  const $ = selector => document.querySelector(selector);
  const main = $('#content');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const spheres = ['Umbral', 'Luna', 'Mercurio', 'Venus', 'Sol', 'Marte', 'Júpiter', 'Saturno'];
  const questions = ['¿Sabes por qué has entrado? (sí / no)', '¿Alguien sabe que estás aquí? (sí / no)', 'Escribe una palabra que no hayas dicho nunca en voz alta.', '¿Qué dejarías atrás? (una palabra)', '¿Quieres ver? (sí / no)', '¿Quién abrió la puerta primero? (una palabra)', '¿Cuántas veces has estado aquí? (un número)', '¿Puedes salir? (sí / no)'];
  const texts = ['Como es arriba, es abajo.', 'Los labios de la sabiduría están cerrados,\nsalvo para los oídos del entendimiento.', 'La palabra permanece.', 'Puedes dejar una cosa.', 'Conócete a ti mismo.', 'Queda una marca.', 'El registro está completo.', 'La puerta permanece abierta.'];
  let current = -1;
  let timers = [];
  let idleTimer;
  let logTimer;
  let loadTimer;
  let lastReturnDetail = -1;
  let tabWasHidden = false;
  let lines = [];
  const route = number => `/gate/${String(number).padStart(2, '0')}.html`;
  const el = (tag, text, cls) => { const item = document.createElement(tag); if (text !== undefined) item.textContent = text; if (cls) item.className = cls; return item; };
  const time = stamp => new Date(stamp ?? Date.now()).toLocaleTimeString('es-ES', { hour12: false });
  function go(path, replace = false) { history[replace ? 'replaceState' : 'pushState'](null, '', path); render(); $('#main').focus({ preventScroll: true }); window.scrollTo(0, 0); }
  const captions = ['se abre cuando uno escucha', 'lo de arriba también mira', 'la palabra vuelve a quien la dice', 'lo que se deja atrás sigue aquí', 'quien ve, ya no puede no ver', 'el orden permanece', 'la cuenta no coincide', 'se acaba cuando siete son uno'];
  function artwork(number) {
    if (number !== 7) return window.renderSigil(number);
    const image = el('img'); image.src = '/assets/still-here.gif'; image.alt = 'Emisión del nodo 009'; image.className = 'saturn-art'; image.width = 88; image.height = 31;
    if (!reduce.matches) return image;
    // Freeze a locally decoded frame; no animated image is displayed in reduced motion.
    const still = el('canvas'); still.className = 'saturn-art'; still.setAttribute('role', 'img'); still.setAttribute('aria-label', image.alt);
    image.onload = () => { still.width = image.naturalWidth; still.height = image.naturalHeight; still.getContext('2d')?.drawImage(image, 0, 0); };
    return still;
  }
  function symbol(number) {
    const figure = el('figure'); figure.id = 'gate-symbol';
    figure.append(artwork(number), el('figcaption', captions[number], 'cap'));
    return figure;
  }
  function doorArtwork() {
    const figure = el('figure');
    const image = el('img'); image.src = '/assets/door-009.png'; image.alt = 'Puerta de acceso'; image.className = 'door-art'; image.width = 1448; image.height = 1086;
    figure.append(image, el('figcaption', captions[0], 'cap')); return figure;
  }
  function cleanTimers() { timers.forEach(clearTimeout); timers = []; clearTimeout(idleTimer); clearTimeout(logTimer); }
  function nav() {
    const area = $('#navigation'); area.replaceChildren();
    area.hidden = !store.state.opened || (current < 0 && location.pathname !== '/rastro.html');
    if (area.hidden) return;
    const menu = el('nav'); menu.setAttribute('aria-label', 'puertas');
    const links = [];
    for (let i = 0; i <= store.state.gate; i++) {
      const link = el('a', i === 0 ? 'Home' : `Gate ${String(i).padStart(2, '0')}`); link.href = route(i);
      if (current === i) link.setAttribute('aria-current', 'page'); links.push(link);
    }
    if (store.state.gate >= 3) {
      const link = el('a', 'Deja un rastro'); link.href = '/rastro.html';
      if (location.pathname === '/rastro.html') link.setAttribute('aria-current', 'page'); links.push(link);
    }
    links.forEach((link, index) => { if (index) menu.append(document.createTextNode(' | ')); menu.append(link); });
    area.append(menu);
  }
  function footer() {
    const footer = $('#footer'); footer.replaceChildren();
    const identity = el('p', undefined, 'node-line');
    identity.append(document.createTextNode('nodo 009 · '), el('span', 'visitante nº ' + String(store.state.displayVisitorNo || store.state.visitorNo).padStart(6, '0'), 'visitor-number'), document.createTextNode(' · 1 presencia en este nodo'));
    footer.append(identity, el('p', 'visita ' + time(store.state.lastVisit), 'visit-time'));
    if (store.state.answers.g01 === 'sí') footer.append(el('p', 'visita ' + time(store.state.lastVisit + 17 * 60000), 'visit-time'));
    if (store.state.returningDay && store.state.visits > 1) footer.append(el('p', 'ya estuviste aquí'));
    const actions = el('div', undefined, 'footer-actions');
    const forget = el('button', 'olvidar esta visita'); forget.type = 'button'; forget.id = 'forget-button';
    forget.setAttribute('aria-label', 'OLVIDAR ESTA VISITA');
    forget.addEventListener('click', () => { sound.stop(); store.forget(); go('/', true); }); actions.append(forget);
    if (store.state.opened && (current >= 0 || location.pathname === '/rastro.html')) sound.controls(actions);
    footer.append(actions);
  }
  function addLog(text) {
    lines.push({ stamp: Date.now(), text }); lines = lines.slice(-4);
    const area = $('#activity'); area.replaceChildren();
    if (!store.state.opened) return;
    const list = el('ol');
    for (const line of lines) { const item = el('li'); item.append(el('time', time(line.stamp), 'log-time'), document.createTextNode(line.text)); list.append(item); }
    area.append(list);
  }
  function entry() {
    const section = el('section'); section.dataset.door = 'closed';
    section.append(el('h1', '⌈ UMBRAL ⌋'), el('p', texts[0], 'quote'), doorArtwork(), el('p', 'Powered by NOTEPAD.EXE', 'powered'));
    const form = el('form'); form.id = 'gate-form';
    const label = el('label', 'palabra de acceso'); label.htmlFor = 'password';
    const input = el('input'); input.id = 'password'; input.type = 'password'; input.required = true; input.autocomplete = 'off'; input.setAttribute('aria-describedby', 'gate-error');
    const submit = el('button', 'ABRIR LA PUERTA'); submit.type = 'submit';
    const error = el('p', '', 'error'); error.id = 'gate-error'; error.setAttribute('role', 'status');
    form.append(label, input, submit, error); section.append(form); main.append(section);
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (input.value.trim().toLowerCase() !== 'eco') { error.textContent = 'No es la palabra.'; input.setAttribute('aria-invalid', 'true'); return; }
      store.state.opened = true; store.save(); go(route(0));
    });
  }
  function gate(number) {
    main.append(el('h1', `⌈ GATE ${String(number).padStart(2, '0')} ⌋`), el('p', spheres[number], 'sphere'));
    let text = number === 1 && store.state.answers.g00 === 'sí' ? 'Los labios están cerrados.' : texts[number];
    if (number === 7 && store.state.answers.g05) text = store.state.answers.g05;
    if (number === 0 && store.state.returned && store.state.returnVariation === 0) text = 'Como es abajo, es arriba.';
    const paragraph = el('p', text, 'quote'); paragraph.id = 'gate-text';
    main.append(paragraph, symbol(number), el('p', 'Powered by NOTEPAD.EXE', 'powered'));
    if (number === 0 && store.state.returned && store.state.returnVariation === 1) $('#gate-symbol').style.transform = 'rotate(180deg)';
    const form = el('form'); form.id = 'answer-form';
    const label = el('label', questions[number]); label.htmlFor = 'answer';
    const input = el('input'); input.id = 'answer'; input.name = 'answer'; input.required = true; input.autocomplete = 'off'; input.maxLength = 64;
    input.type = number === 6 ? 'number' : 'text'; if (number === 6) { input.min = '0'; input.max = '999999'; input.step = '1'; }
    input.setAttribute('aria-describedby', 'answer-status');
    const button = el('button', '[ responder ]'); button.type = 'submit';
    const status = el('p', '', 'error'); status.id = 'answer-status'; status.setAttribute('role', 'status');
    form.append(label, input, button, status); main.append(form);
    form.addEventListener('submit', event => {
      event.preventDefault(); let value = input.value.trim();
      if ([0, 1, 4, 7].includes(number)) {
        value = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (!['si', 'no'].includes(value)) { status.textContent = 'sí / no'; return; }
        value = value === 'si' ? 'sí' : 'no';
      } else if (number === 6) {
        if (!/^\d+$/.test(value) || Number(value) > 999999) { status.textContent = 'Un número.'; return; }
      } else if (!value || /\s/.test(value)) { status.textContent = 'Una palabra.'; return; }
      store.state.answers['g' + String(number).padStart(2, '0')] = value;
      store.state.gate = Math.max(store.state.gate, Math.min(7, number + 1));
      if (number === 6 && Number(value) !== store.state.visits) store.state.displayVisitorNo = store.differentNumber(store.state.visitorNo);
      if (number === 6 && Number(value) === store.state.visits) delete store.state.displayVisitorNo;
      store.save();
      if (number === 7) { render(); return; }
      if (number === 4 && value === 'sí') sound.start();
      go(route(number + 1));
    });
    if (number === 7 && store.state.answers.g07) {
      form.hidden = true;
      const exit = el('button', '[ salir ]', 'exit'); exit.id = 'exit-button'; exit.type = 'button';
      exit.addEventListener('click', () => { store.returnToZero(); go(route(0)); }); main.append(exit);
    }
    footer(); startReactivity(number);
  }
  function render() {
    document.dispatchEvent(new Event('occult:render'));
    cleanTimers(); clearTimeout(loadTimer); document.body.classList.remove('waiting');
    main.replaceChildren(); $('#activity').replaceChildren(); lines = [];
    const match = location.pathname.match(/^\/gate\/(0[0-7])\.html$/);
    current = match ? Number(match[1]) : -1;
    if (location.pathname === '/rastro.html') {
      if (!store.state.opened) { go('/', true); return; }
      if (store.state.gate < 3) { go(route(store.state.gate), true); return; }
      nav(); footer(); renderRastro(); return;
    }
    if (current >= 0 && (!store.state.opened || current > store.state.gate)) { go(store.state.opened ? route(store.state.gate) : '/', true); return; }
    nav(); footer();
    document.title = current >= 0 ? `gate ${String(current).padStart(2, '0')} · occult` : 'occult';
    if (current < 0) { sound.stop(); $('#navigation').hidden = true; entry(); return; }
    addLog('sesión iniciada'); addLog('lectura registrada');
    if (store.state.answers.g02) addLog('otro: ' + store.state.answers.g02);
    else addLog('acceso registrado');
    if (current === 5 && store.state.answers.g04 === 'no' && !reduce.matches) {
      const loading = el('div', undefined, 'loading'); loading.setAttribute('aria-label', 'cargando'); loading.append(el('span', '_', 'cursor')); main.append(loading);
      document.body.classList.add('waiting');
      loadTimer = setTimeout(() => { document.body.classList.remove('waiting'); main.replaceChildren(); gate(5); }, 3000 + Math.random() * 3000);
    } else gate(current);
  }
  // Independent enhancements share the same static shell.
  function armIdle() {
    clearTimeout(idleTimer);
    if (reduce.matches || current < 0 || document.hidden) return;
    idleTimer = setTimeout(() => { const mark = $('#gate-symbol'); if (mark) mark.style.translate = '2px 0'; }, 45000);
  }
  function planLog() {
    clearTimeout(logTimer);
    if (reduce.matches || current < 0 || document.hidden) return;
    logTimer = setTimeout(() => {
      const entries = ['sesión mantenida', 'lectura registrada', 'acceso sin autorizar: tolerado'];
      addLog(entries[Math.floor(Math.random() * entries.length)]); planLog();
    }, 20000 + Math.random() * 20000);
  }
  function startReactivity(number) {
    if (reduce.matches) return;
    armIdle(); planLog();
    if (number >= 6) timers.push(setTimeout(() => {
      const text = $('#gate-text'); if (!text || document.hidden) return;
      const before = text.textContent; text.textContent = before.replace(/\S+$/, '_');
      timers.push(setTimeout(() => { if (text.isConnected) text.textContent = before.replace(/\S+$/, number === 6 ? 'pendiente.' : 'cerrada.'); }, 500));
    }, 10000 + Math.random() * 10000));
  }
  for (const event of ['pointermove', 'pointerdown', 'touchstart', 'keydown']) document.addEventListener(event, armIdle, { passive: true });
  document.addEventListener('visibilitychange', () => {
    sound.visibility();
    if (document.hidden) { tabWasHidden = true; cleanTimers(); return; }
    if (tabWasHidden && !reduce.matches && current >= 0) {
      const detail = lastReturnDetail === 0 ? 1 : 0; lastReturnDetail = detail;
      if (detail === 0) addLog('lectura reanudada');
      else { const text = $('#gate-text'); if (text) text.textContent = text.textContent.replace('permanece', 'continúa'); addLog('sesión mantenida'); }
    }
    tabWasHidden = false; armIdle(); planLog();
  });
  reduce.addEventListener('change', () => { cleanTimers(); render(); });
  function renderRastro() {
    document.title = 'deja un rastro · occult';
    main.append(el('h1', 'deja un rastro'));
    const previous = [
      ['1998-01-17', 'sur', 'llegué por la puerta equivocada'],
      ['1998-03-02', 'nadir', 'la segunda pregunta no tiene respuesta'],
      ['1998-05-11', 'cal', 'la fecha era otra'],
      ['1998-07-23', 'piedra', 'dejé una palabra'],
      ['1998-09-01', 'limo', 'no había índice'],
      ['1998-11-17', 'hilo', 'el orden permanece'],
      ['1999-01-04', 'cero', 'volví por el mismo enlace'],
      ['1999-02-28', 'sal', 'nadie había firmado'],
      ['1999-06-12', 'este', 'la cuenta no coincide'],
      ['1999-10-09', 'umbral', 'queda una pregunta']
    ];
    if (store.state.answers.g03) previous.push(['1999-11-17', 'otro', store.state.answers.g03]);
    for (const trace of store.traces) previous.push([new Date(trace.date).toLocaleDateString('es-ES'), 'visitante', trace.message]);
    const table = el('table'); const caption = el('caption', 'rastros'); caption.className = 'sr-only'; table.append(caption);
    const tbody = el('tbody');
    for (const [date, alias, message] of previous) {
      const row = el('tr'); row.append(el('td', date + '\n' + alias), el('td', message)); tbody.append(row);
    }
    table.append(tbody); main.append(table);
    const form = el('form'); const label = el('label', '[ deja tu rastro ]'); label.htmlFor = 'trace';
    const input = el('input'); input.id = 'trace'; input.maxLength = 200; input.required = true;
    const button = el('button', '[ dejar ]'); button.type = 'submit';
    form.append(label, input, button); main.append(form);
    form.addEventListener('submit', event => { event.preventDefault(); if (!input.value.trim()) return; store.addTrace(input.value.trim()); go('/rastro.html', true); });
  }
  const sound = (() => {
    let ctx, oscillator, gain, timer, resumeTimer;
    let active = false;
    function update() {
      const status = $('#sound-status'); if (status) status.textContent = active ? 'sonido: activado' : 'sonido: desactivado';
      const button = $('#sound-button'); if (button) button.setAttribute('aria-pressed', String(active));
    }
    function stop() {
      clearTimeout(timer); clearTimeout(resumeTimer);
      oscillator?.stop(); oscillator = null; gain?.disconnect(); gain = null;
      if (ctx) { ctx.close().catch(() => {}); ctx = null; }
      active = false; update();
    }
    function gap() {
      clearTimeout(timer); if (!active) return;
      timer = setTimeout(() => {
        if (!active || document.hidden) return;
        gain.gain.value = 0;
        resumeTimer = setTimeout(() => { if (active && !document.hidden) gain.gain.value = .02; gap(); }, 1000 + Math.random() * 2000);
      }, 40000 + Math.random() * 50000);
    }
    async function start() {
      if (!store.state.opened || active) return;
      try {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) throw new Error('audio');
        const next = new Context(); ctx = next; await next.resume();
        if (ctx !== next || !store.state.opened) { await next.close(); return; }
        oscillator = next.createOscillator(); gain = next.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = 52; gain.gain.value = .02;
        oscillator.connect(gain); gain.connect(next.destination); oscillator.start(); active = true; update(); gap();
      } catch { stop(); const status = $('#sound-status'); if (status) status.textContent = 'sonido: no disponible'; }
    }
    function controls(footer) {
      const row = el('span', undefined, 'sound-controls'); const status = el('span', active ? 'sonido: activado' : 'sonido: desactivado'); status.id = 'sound-status'; status.setAttribute('role', 'status');
      const button = el('button', '[ sonido ]'); button.type = 'button'; button.id = 'sound-button'; button.setAttribute('aria-pressed', String(active)); button.addEventListener('click', () => active ? stop() : start());
      row.append(status, button); footer.append(row);
    }
    function visibility() { if (gain) gain.gain.value = document.hidden ? 0 : .02; if (document.hidden) { clearTimeout(timer); clearTimeout(resumeTimer); } else gap(); }
    window.addEventListener('pagehide', stop);
    return { start, stop, controls, visibility };
  })();
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && (/^\/gate\/0[0-7]\.html$/.test(url.pathname) || url.pathname === '/rastro.html' || url.pathname === '/')) { event.preventDefault(); go(url.pathname); }
  });
  window.addEventListener('popstate', render);
  render();
})();
