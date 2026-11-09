(() => {
  'use strict';
  const store = window.OccultStore;
  if (!store) return;
  const $ = selector => document.querySelector(selector);
  const main = $('#main');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const spheres = ['Umbral', 'Luna', 'Mercurio', 'Venus', 'Sol', 'Marte', 'Júpiter', 'Saturno'];
  const questions = ['¿Sabes por qué has entrado? (sí / no)', '¿Alguien sabe que estás aquí? (sí / no)', 'Escribe una palabra que no hayas dicho nunca en voz alta.', '¿Qué dejarías atrás? (una palabra)', '¿Quieres ver? (sí / no)', '¿Quién abrió la puerta primero? (una palabra)', '¿Cuántas veces has estado aquí? (un número)', '¿Puedes salir? (sí / no)'];
  const texts = ['Como es arriba, es abajo.', 'Los labios de la sabiduría están cerrados,\nsalvo para los oídos del entendimiento.', 'La palabra permanece.', 'Puedes dejar una cosa.', 'Conócete a ti mismo.', 'Queda una marca.', 'El registro está completo.', 'La puerta permanece abierta.'];
  let current = -1;
  let timers = [];
  let idleTimer;
  let logTimer;
  let lastReturnDetail = -1;
  let tabWasHidden = false;
  let lines = [];
  const route = number => `/gate/${String(number).padStart(2, '0')}.html`;
  const el = (tag, text, cls) => { const item = document.createElement(tag); if (text !== undefined) item.textContent = text; if (cls) item.className = cls; return item; };
  const time = stamp => new Date(stamp ?? Date.now()).toLocaleTimeString('es-ES', { hour12: false });
  function go(path, replace = false) { history[replace ? 'replaceState' : 'pushState'](null, '', path); render(); main.focus({ preventScroll: true }); window.scrollTo(0, 0); }
  function symbol(number) {
    const shapes = [
      '<path d="M25 12h70v96H25zM40 25h40v83M65 67h4"/>',
      '<path d="M80 17a44 44 0 1 0 0 86 49 49 0 0 1 0-86Z"/>',
      '<circle cx="60" cy="53" r="25"/><path d="M37 12a23 23 0 0 0 46 0M60 78v30M45 96h30"/>',
      '<circle cx="60" cy="43" r="27"/><path d="M60 70v39M44 94h32"/>',
      '<circle cx="60" cy="60" r="40"/><circle cx="60" cy="60" r="4"/>',
      '<circle cx="47" cy="72" r="27"/><path d="M66 53 103 16M78 16h25v25"/>',
      '<path d="M40 24q37 3 0 48h43M77 20v88"/>',
      '<path d="M43 12v62m-18-43h37M43 57q44-35 34 11t11 30"/>'
    ];
    const figure = el('figure'); figure.id = 'gate-symbol';
    figure.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="Símbolo de ${spheres[number]}"><g fill="none" stroke="currentColor" stroke-width="1.5">${shapes[number]}</g></svg>`;
    return figure;
  }
  function cleanTimers() { timers.forEach(clearTimeout); timers = []; clearTimeout(idleTimer); clearTimeout(logTimer); }
  function nav() {
    const header = $('#navigation'); header.replaceChildren(); header.hidden = !store.state.opened;
    if (header.hidden) return;
    const menu = el('nav'); menu.setAttribute('aria-label', 'puertas');
    for (let i = 0; i <= store.state.gate; i++) {
      const link = el('a', `[ gate ${String(i).padStart(2, '0')} ]`); link.href = route(i);
      if (current === i) link.setAttribute('aria-current', 'page'); menu.append(link);
    }
    if (store.state.gate >= 3) { const link = el('a', '[ deja un rastro ]'); link.href = '/rastro.html'; menu.append(link); }
    header.append(menu);
  }
  function footer() {
    const footer = $('#footer'); footer.replaceChildren(el('hr'));
    footer.append(el('p', 'visitante nº ' + String(store.state.displayVisitorNo || store.state.visitorNo).padStart(6, '0'), 'visitor-number'));
    footer.append(el('p', 'visita ' + time(store.state.lastVisit)));
    if (store.state.answers.g01 === 'sí') footer.append(el('p', 'visita ' + time(store.state.lastVisit + 17 * 60000)));
    if (store.state.returningDay && store.state.visits > 1) footer.append(el('p', 'ya estuviste aquí'));
    footer.append(el('p', 'hecho a mano con el bloc de notas. optimizado para nadie.'));
    const forget = el('button', 'OLVIDAR ESTA VISITA'); forget.type = 'button'; forget.id = 'forget-button';
    forget.addEventListener('click', () => { sound.stop(); store.forget(); go('/', true); }); footer.append(forget);
    if (store.state.opened) sound.controls(footer);
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
    section.append(el('h1', '⌈ UMBRAL ⌋'), el('p', texts[0]));
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
    main.append(el('h1', `⌈ GATE ${String(number).padStart(2, '0')} ⌋ ${spheres[number]}`), symbol(number));
    let text = number === 1 && store.state.answers.g00 === 'sí' ? 'Los labios están cerrados.' : texts[number];
    if (number === 7 && store.state.answers.g05) text = store.state.answers.g05;
    if (number === 0 && store.state.returned && store.state.returnVariation === 0) text = 'Como es abajo, es arriba.';
    const paragraph = el('p', text); paragraph.id = 'gate-text'; main.append(paragraph);
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
    cleanTimers(); main.replaceChildren(); $('#activity').replaceChildren(); lines = [];
    const match = location.pathname.match(/^\/gate\/([0-7]{2})\.html$/);
    current = match ? Number(match[1]) : -1;
    if (location.pathname === '/rastro.html') {
      if (!store.state.opened) { go('/', true); return; }
      if (store.state.gate < 3) { go(route(store.state.gate), true); return; }
      nav(); footer(); renderRastro(); return;
    }
    if (current >= 0 && (!store.state.opened || current > store.state.gate)) { go(store.state.opened ? route(store.state.gate) : '/', true); return; }
    nav(); footer();
    document.title = current >= 0 ? `gate ${String(current).padStart(2, '0')} · occult` : 'occult';
    if (current < 0) { $('#navigation').hidden = true; entry(); return; }
    addLog('sesión iniciada'); addLog('lectura registrada');
    if (store.state.answers.g02) addLog('otro: ' + store.state.answers.g02);
    else addLog('acceso registrado');
    if (current === 5 && store.state.answers.g04 === 'no' && !reduce.matches) {
      const loading = el('div', undefined, 'loading'); loading.setAttribute('aria-label', 'cargando'); loading.append(el('span', '_', 'cursor')); main.append(loading);
      timers.push(setTimeout(() => { main.replaceChildren(); gate(5); }, 3000 + Math.random() * 3000));
    } else gate(current);
  }
  // The next commits supply these independent modules.
  function startReactivity() {}
  function renderRastro() {}
  const sound = { stop() {}, start() {}, controls() {} };
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && (/^\/gate\/[0-7]{2}\.html$/.test(url.pathname) || url.pathname === '/rastro.html' || url.pathname === '/')) { event.preventDefault(); go(url.pathname); }
  });
  window.addEventListener('popstate', render);
  render();
})();
