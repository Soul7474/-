/* Ocultos: las salas que no salen en ningún plano, y el desorden de las que sí.
   #pozo        un pozo sin fondo que se genera mientras bajas.
   #habitacion  un informe sobre ti, escrito con lo que el navegador ya sabe (nada sale de él).
   #ellos       lo que dejaron los que entraron antes, desde 1998. Uno está escribiendo ahora.
   #espejo      todo al revés, menos lo que te mira.
   #nadie       una página blanca en la que no hay nadie. Salvo tú. Y debajo.
   #volcado     el volcado de estacion09.img, con cosas escritas entre los bytes.
   Además: el archivo cambia de orden cada vez, las cosas están un poco torcidas y, a veces,
   la flecha de volver no te lleva a donde esperabas. Todo respeta «calma» y movimiento reducido. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const calm = () => document.body.classList.contains('quiet') || reduce.matches;
  const page = () => document.body.dataset.page || 'inicio';
  const say = (text, key, urgent) => window.EstacionVigilia?.say(text, key, urgent);
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const rand = (a, b) => a + Math.random() * (b - a);
  function el(tag, text, className) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; }
  const RUNES = { a: 'ᚨ', b: 'ᛒ', c: 'ᚲ', k: 'ᚲ', q: 'ᚲ', d: 'ᛞ', e: 'ᛖ', f: 'ᚠ', g: 'ᚷ', h: 'ᚺ', i: 'ᛁ', j: 'ᛃ', y: 'ᛃ', l: 'ᛚ', m: 'ᛗ', n: 'ᚾ', ñ: 'ᚾ', o: 'ᛟ', p: 'ᛈ', r: 'ᚱ', s: 'ᛊ', t: 'ᛏ', u: 'ᚢ', v: 'ᚹ', w: 'ᚹ', x: 'ᛉ', z: 'ᛉ', ' ': '᛫' };
  const plain = char => char.toLocaleLowerCase('es').normalize('NFD').replace(/[̀-̂̄-ͯ]/g, '').normalize('NFC');
  const rune = char => RUNES[plain(char)] ?? char;
  const runify = (text, share = 1) => [...text].map(char => Math.random() < share ? rune(char) : char).join('');
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };
  const clearAll = () => { timers.forEach(clearTimeout); timers.clear(); };

  // What the browser already knows. Read here, never sent anywhere.
  const trace = () => { try { return JSON.parse(localStorage.getItem('estacion09-rastro')) || {}; } catch { return {}; } };
  const guests = () => { try { const value = JSON.parse(localStorage.getItem('estacion09-v1'))?.guests; return Array.isArray(value) ? value : []; } catch { return []; } };
  const alias = () => { const last = guests().at(-1)?.alias; return typeof last === 'string' && !/^(anónimo|operador_09)$/i.test(last) ? last.slice(0, 32) : ''; };
  const city = () => { try { return (Intl.DateTimeFormat().resolvedOptions().timeZone || '').split('/').pop().replace(/_/g, ' '); } catch { return ''; } };
  const touch = matchMedia('(pointer: coarse)').matches;
  const hhmm = (date = new Date()) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const stamp = date => date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + hhmm(date);
  let lastMove = performance.now();
  for (const type of ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart']) addEventListener(type, () => { lastMove = performance.now(); }, { passive: true });

  // ==== El pozo ====================================================================================
  const shaft = $('#pozo-shaft');
  const depthLabel = $('#pozo-depth');
  const METRE = 37; // pixels per metre
  const pozoLines = [
    'sigue bajando', 'no mires arriba', 'aquí estuvo el operador 09', 'las paredes son blandas aquí', 'alguien ha arañado un nombre. no es el tuyo. todavía',
    'ya no se oye la estación', '¿cuánto llevas bajando?', 'esto no sale en los planos', 'no hay fondo. hay más.', 'la cámara 09 también graba aquí',
    'huele a cinta quemada', 'si subes ahora, no estarás donde estabas', 'te estás acostumbrando', 'el pozo te cuenta', '1998 1998 1998 1998 1998',
    'VUELVE', 'no', 'uno de nosotros bajó en 2004. todavía escribe.', 'encontramos un zapato a 400 metros', 'no apagues la pantalla. aquí abajo es lo único que da luz',
    'respira por la nariz', 'cuenta tus dedos', 'aquí abajo tu reflejo llega tarde', 'eso que oyes es tu corazón. casi siempre.', 'hay alguien bajando detrás de ti, al mismo ritmo',
    'no te pares', 'para', 'ya casi', 'mentira', 'las letras se gastan aquí abajo', '¿quién te dijo que esto era una web?', 'no grites. el eco tarda en volver.',
    'ESTO NO ES UN JUEGO', 'te hemos guardado sitio', 'aquí abajo nadie firma', 'el busto también bajó', 'sube sube sube sube sube sube sube'
  ];
  const pozoImages = ['assets/cutouts/sewn-eye.png', 'assets/cutouts/revelation.png', 'images/6ae30bc87f2537c40cdb09d3b63bc07f.jpg', 'images/91bcc74e941fa720f84af443207553f6.jpg', 'images/ce8ad4bddf1ece13035ca941dcff674f.jpg', 'images/4580f857040ef0339156318493389d7c.jpg', 'assets/cutouts/presence-hand.png'];
  const fonts = ["'Courier New',monospace", "'Times New Roman',serif", 'Georgia,serif', 'Arial,sans-serif'];
  const pozoState = { placed333: false, placed999: false, black: false };
  function personalLine() {
    const visits = trace().visits || [];
    const options = [`${hhmm()} y sigues bajando.`, touch ? 'el móvil está caliente. es tu mano.' : 'tienes la mano en el ratón. no la quites.'];
    if (visits.length > 1) options.push(`viniste por primera vez el ${new Date(visits[0]).toLocaleDateString('es-ES')}. ya estabas bajando.`);
    if (alias()) options.push(`${alias().toLocaleLowerCase('es')} estuvo aquí`, `${alias().toLocaleLowerCase('es')} ${alias().toLocaleLowerCase('es')} ${alias().toLocaleLowerCase('es')}`);
    if (city()) options.push(`${city().toLocaleLowerCase('es')} queda muy arriba`);
    return pick(options);
  }
  function pozoBlock() {
    const generated = shaft.offsetHeight / METRE;
    const deep = Math.min(.85, generated / 1800);
    const block = el('div', undefined, 'pozo-block');
    block.style.marginTop = Math.round(rand(20, 360)) + 'px';
    block.style.marginLeft = Math.round(rand(0, 62)) + '%';
    if (!pozoState.placed333 && generated > 333) {
      pozoState.placed333 = true; block.classList.add('pozo-sign');
      const link = el('a', 'sube a tu habitación', 'hidden-door'); link.href = '#habitacion';
      block.append('aquí abajo ya no llega la señal. si quieres, ', link, '.');
      shaft.append(block); return;
    }
    if (!pozoState.placed999 && generated > 999) {
      pozoState.placed999 = true; block.classList.add('pozo-face');
      const face = el('img'); face.src = 'assets/cutouts/presence-face.png'; face.alt = '';
      const link = el('a', 'los demás también bajaron', 'hidden-door'); link.href = '#ellos';
      const note = el('p'); note.append(link, '.');
      block.append(face, note); block.style.marginLeft = '10%'; shaft.append(block); return;
    }
    const kind = Math.random();
    if (kind < .55) {
      const line = el('p', runify(pick(pozoLines), deep * .7));
      Object.assign(line.style, { fontFamily: pick(fonts), fontSize: Math.round(rand(9, Math.random() < .1 ? 64 : 26)) + 'px', opacity: rand(.18, .9).toFixed(2), letterSpacing: rand(0, .5).toFixed(2) + 'em' });
      if (Math.random() < .25) line.style.rotate = rand(-8, 8).toFixed(1) + 'deg';
      if (Math.random() < .1) line.style.transform = 'scaleX(-1)';
      if (Math.random() < .12) line.style.fontStyle = 'italic';
      block.append(line);
    } else if (kind < .68) {
      block.append(el('p', runify(pick(pozoLines)), 'pozo-runes'));
    } else if (kind < .8) {
      const image = el('img', undefined, 'pozo-image'); image.src = pick(pozoImages); image.alt = ''; image.loading = 'lazy';
      image.style.width = Math.round(rand(50, 220)) + 'px'; image.style.opacity = rand(.12, .5).toFixed(2); image.style.rotate = rand(-12, 12).toFixed(1) + 'deg';
      block.append(image);
    } else if (kind < .9) {
      block.append(el('p', runify(personalLine(), deep * .5), 'pozo-personal'));
    } else {
      block.append(el('p', Array(Math.ceil(rand(3, 30))).fill('sigue bajando').join(' '), 'pozo-mumble'));
    }
    shaft.append(block);
  }
  function fillPozo() {
    let guard = 0;
    while (document.documentElement.scrollHeight - (scrollY + innerHeight) < 1800 && shaft.childElementCount < 4000 && guard++ < 60) pozoBlock();
  }
  function pozoScroll() {
    if (page() !== 'pozo') return;
    fillPozo();
    const depth = Math.max(0, Math.floor(scrollY / METRE));
    depthLabel.textContent = `-${depth} m`;
    if (depth >= 666 && !pozoState.black) { pozoState.black = true; blackout(); }
  }
  function blackout() {
    say('aquí.', null, true);
    if (calm()) return;
    const dark = el('div', undefined, 'pozo-black'); dark.append(el('p', 'AQUÍ'));
    document.body.append(dark);
    window.EstacionInterior?.fear?.(.95);
    setTimeout(() => dark.classList.add('out'), 3200);
    setTimeout(() => dark.remove(), 4600);
  }
  addEventListener('scroll', pozoScroll, { passive: true });
  const pozo = {
    enter() {
      shaft.replaceChildren(); Object.assign(pozoState, { placed333: false, placed999: false });
      depthLabel.textContent = '-0 m'; requestAnimationFrame(fillPozo);
      later(() => say('no hay fondo.', 'pozo-1'), 4000);
    },
    leave() { shaft.replaceChildren(); }
  };

  // ==== La habitación ==============================================================================
  let liveTimer = 0;
  const habitacion = {
    async enter() {
      const report = $('#informe'); const live = $('#informe-vivo'); report.textContent = ''; live.textContent = '';
      const visits = trace().visits || [];
      const now = new Date(); const hour = now.getHours();
      let battery = null;
      try { if (navigator.getBattery) battery = await navigator.getBattery(); } catch {}
      if (page() !== 'habitacion') return;
      const lines = [
        'INFORME DE PRESENCIA · NODO 009 · NO AUTORIZADO',
        '',
        `sujeto ............ ${alias() ? `dice llamarse «${alias()}»` : 'sin nombre'}`,
        `primer acceso ..... ${visits[0] ? stamp(new Date(visits[0])) : 'ahora'}`,
        `accesos ........... ${Math.max(1, visits.length)}`,
        `hora local ........ ${hhmm(now)}${city() ? ` · ${city()}` : ''}`,
        `luz ............... ${hour < 7 || hour >= 21 ? 'apagada. solo la pantalla le ilumina la cara.' : 'hay luz fuera. no le sirve.'}`,
        `pantalla .......... ${screen.width}×${screen.height} · ${innerHeight > innerWidth ? 'en vertical, muy cerca' : 'en horizontal'}`,
        `manos ............. ${touch ? 'sostiene el aparato. el pulgar no se está quieto.' : 'una en el ratón. la otra no sabemos.'}`,
        `idioma ............ ${navigator.language || '—'}`,
        `oscuridad ......... ${matchMedia('(prefers-color-scheme: dark)').matches ? 'la prefiere. lo sabíamos.' : 'no la prefiere. da igual.'}`,
        ...(battery ? [`batería ........... ${Math.round(battery.level * 100)} % · ${battery.charging ? 'enchufado. no piensa irse.' : 'sin enchufar. ¿cuánto aguantará?'}`] : []),
        `hilos ............. ${navigator.hardwareConcurrency || '?'} pensando a la vez. ninguno es suyo.`,
        '',
        'nota: el sujeto cree que esto lo ha escrito alguien.',
        '      se está escribiendo ahora.'
      ];
      const text = lines.join('\n');
      if (calm()) { report.textContent = text; startLive(); return; }
      let i = 0;
      (function type() {
        if (page() !== 'habitacion') return;
        i = Math.min(text.length, i + 2); report.textContent = text.slice(0, i) + (i < text.length ? '▌' : '');
        if (i < text.length) later(type, text[i - 1] === '\n' ? 140 : 16); else startLive();
      })();
      later(() => say('no hace falta que mires a tu alrededor.', 'hab-1', true), 9000);
    },
    leave() { clearInterval(liveTimer); }
  };
  function startLive() {
    clearInterval(liveTimer);
    const live = $('#informe-vivo');
    const draw = () => {
      const seconds = Math.floor(performance.now() / 1000); const still = Math.floor((performance.now() - lastMove) / 1000);
      live.textContent = `en el nodo ........ ${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}\nquieto desde ...... ${still < 2 ? 'se acaba de mover' : `hace ${still} s`}\nestado ............ ${still > 20 ? 'quieto. muy bien.' : 'nervioso'}`;
      $('#hab-clock').textContent = new Date().toLocaleTimeString('es-ES', { hour12: false });
    };
    draw(); liveTimer = setInterval(draw, 1000);
  }

  // ==== Los demás ==================================================================================
  const days = n => new Date(Date.now() - n * 86400000);
  const minutes = n => new Date(Date.now() - n * 60000);
  function othersEntries() {
    return [
      { alias: 'kain_', date: new Date('1998-11-18T02:14:00'), text: 'entré por un enlace de un foro de radioaficionados. la cámara del pasillo B se ha movido cuando he escrito esto.' },
      { alias: 'm.r.', date: new Date('1999-02-02T03:31:00'), text: '¿alguien sabe qué es la sala 0? el ordenador se me ha reiniciado dos veces' },
      { alias: 'm.r.', date: new Date('1999-02-02T03:33:00'), text: 'ya no hace falta que contestéis', cls: 'faded' },
      { alias: 'lucia_88', date: new Date('2001-06-30T23:58:00'), text: 'la estatua no estaba de cara a la pared. estaba de cara a mí.' },
      { alias: '████████', date: new Date('2003-10-13T04:02:00'), text: '███ ██ ████ █████ no ██████ ████ ██ pasillo ███ ████ ██ ████', cls: 'redacted' },
      { alias: 'ANONIMO', date: new Date('2004-01-01T00:40:00'), text: 'BAJÉ AL ', link: ['POZO', '#pozo'], after: '. 400 METROS. DEJÉ UN ZAPATO PARA SABER VOLVER' },
      { alias: 'ANONIMO', date: new Date('2004-01-01T05:12:00'), text: 'no está el zapato' },
      { alias: 'dnz', date: new Date('2007-08-19T01:20:00'), text: 'si cierras la pestaña, el título sigue cambiando. lo he visto en el portátil de mi hermana. ella nunca ha entrado.' },
      { alias: 'sinnombre', date: new Date('2009-12-12T03:03:00'), text: 'ᚾᛟ᛫ᛚᛖᚨᛊ᛫ᛖᛊᛏᛟ', cls: 'runic' },
      { alias: 'papá de iker', date: new Date('2011-03-03T22:10:00'), text: 'mi hijo dice que en esta web hay una señora que le habla. he entrado yo y no he visto nada. ¿por qué sale mi nombre en el registro?' },
      { alias: 'test', date: new Date('2013-05-21T12:00:00'), text: 'test' },
      { alias: 'test', date: new Date('2013-05-21T12:00:01'), text: 'test' },
      { alias: 'test', date: new Date('2013-05-21T12:00:02'), text: 'por qué no puedo borrar esto', cls: 'struck' },
      { alias: 'operador_10', date: new Date('2016-12-24T03:33:00'), text: 'turno de noche. todo en orden. todo en orden. todo en orden. todo en orden. todo en orden.' },
      { alias: 'x', date: new Date('2019-09-09T02:22:00'), text: 'el cursor que te sigue no es un efecto. mueve el ratón rápido y mira cuál de los dos se queda quieto.' },
      { alias: 'nieve', date: new Date('2021-04-17T04:44:00'), text: 'llevo una hora mirando el ojo de la pestaña. parpadea cuando parpadeo yo.' },
      { alias: 'rec', date: new Date('2024-02-29T03:33:00'), text: 'ya está. ya lo he dicho. ahora dejadme salir.', cls: 'struck' },
      { alias: '', date: new Date('2025-07-07T07:07:00'), text: '' , cls: 'empty' },
      { alias: 'invitado', date: days(3), text: `alguien ha entrado desde ${city() || 'tu ciudad'}. no ha dicho nada.` },
      { alias: 'sin_remitente', date: minutes(7), text: `hay uno nuevo. ${touch ? 'desde un móvil' : 'desde un ordenador'}. ${alias() ? `dice llamarse ${alias()}.` : 'no ha firmado.'}` }
    ];
  }
  const ellos = {
    enter() {
      const wall = $('#ellos-wall'); wall.replaceChildren();
      for (const entry of othersEntries()) {
        const article = el('article', undefined, 'otro ' + (entry.cls || ''));
        const head = el('div', undefined, 'otro-head'); head.append(el('span', entry.alias || ' '), el('time', stamp(entry.date)));
        const body = el('p', entry.text);
        if (entry.link) { const link = el('a', entry.link[0], 'hidden-door'); link.href = entry.link[1]; body.append(link, entry.after || ''); }
        article.append(head, body);
        Object.assign(article.style, { rotate: rand(-2.6, 2.6).toFixed(1) + 'deg', marginLeft: Math.round(rand(0, 26)) + '%', fontFamily: pick(fonts), fontSize: Math.round(rand(11, 15)) + 'px', width: Math.round(rand(55, 92)) + '%' });
        wall.append(article);
      }
      // Someone is typing, now.
      const live = el('article', undefined, 'otro typing'); const head = el('div', undefined, 'otro-head'); head.append(el('span', 'sin_remitente'), el('time', 'ahora'));
      const body = el('p'); live.append(head, body); wall.append(live);
      const lines = ['te veo leer esto.', ' baja un poco más.', ' estoy detrás de'];
      let line = 0, char = 0;
      later(function type() {
        if (page() !== 'ellos') return;
        if (line >= lines.length) { live.classList.add('stopped'); return; }
        body.textContent += lines[line][char++];
        if (char >= lines[line].length) { line++; char = 0; later(type, 2600); } else later(type, rand(60, 220));
      }, 3500);
    },
    leave() {}
  };

  // ==== El espejo ==================================================================================
  const face = $('.espejo-face');
  const look = { x: 0, y: 0 };
  addEventListener('pointermove', event => { look.x = event.clientX / innerWidth - .5; look.y = event.clientY / innerHeight - .5; }, { passive: true });
  let mirrorFrame = 0; let mirrorPos = { x: 0, y: 0 };
  const espejo = {
    enter() {
      document.querySelectorAll('.espejo-line.late').forEach(line => line.classList.remove('shown'));
      document.querySelectorAll('.espejo-line.late').forEach((line, i) => later(() => line.classList.add('shown'), calm() ? 0 : 4500 + i * 3800));
      later(() => say('¿has levantado la mano?', 'espejo-1'), 7000);
      cancelAnimationFrame(mirrorFrame);
      (function follow() {
        if (page() !== 'espejo') return;
        mirrorFrame = requestAnimationFrame(follow);
        if (calm()) return;
        mirrorPos.x += (look.x * 60 - mirrorPos.x) * .03; mirrorPos.y += (look.y * 40 - mirrorPos.y) * .03;
        face.style.translate = `${mirrorPos.x}px ${mirrorPos.y}px`;
      })();
    },
    leave() { cancelAnimationFrame(mirrorFrame); }
  };

  // ==== Nadie ======================================================================================
  const nadie = {
    enter() {
      const view = $('#view-nadie'); view.scrollTop = 0;
      $('.nadie-2').hidden = true; $('.nadie-3').hidden = true; $('.nadie-long').hidden = true;
      later(() => { $('.nadie-2').hidden = false; }, calm() ? 0 : 11000);
      later(() => { $('.nadie-3').hidden = false; $('.nadie-long').hidden = false; }, calm() ? 0 : 22000);
    },
    leave() {}
  };
  $('#view-nadie')?.addEventListener('scroll', event => {
    const view = event.currentTarget;
    if (view.scrollTop > view.scrollHeight - view.clientHeight * 1.6) say('te dije que no miraras.', 'nadie-1', true);
  }, { passive: true });

  // ==== El volcado ===================================================================================
  const dump = $('#volcado-dump');
  const words = ['SACAME', 'NO ES UN JUEGO', 'AYUDA', 'OPERADOR_09', 'TE VEO', '1998', 'ESTOY AQUI', 'NO SUBAS', 'DETRAS', 'SIGUE', 'NO CIERRES', 'HAY DOS', 'TU NO', 'ABRE LA PUERTA', 'ECO ECO ECO'];
  let offset = 0;
  function asciiOnly(text) { return text.normalize('NFD').replace(/[^\x20-\x7e]/g, '').toUpperCase(); }
  function personalWords() {
    const own = [];
    if (alias()) own.push(asciiOnly(alias()));
    const last = guests().at(-1)?.message; if (typeof last === 'string' && last.trim()) own.push(asciiOnly(last).slice(0, 16));
    return own.filter(Boolean);
  }
  function dumpLine() {
    const bytes = Array.from({ length: 16 }, () => Math.random() < .35 ? 0 : Math.floor(Math.random() * 256));
    if (Math.random() < .11) {
      const word = pick(Math.random() < .25 && personalWords().length ? personalWords() : words).slice(0, 16);
      const start = Math.floor(Math.random() * (17 - word.length));
      [...word].forEach((char, i) => { bytes[start + i] = char.charCodeAt(0); });
    }
    const corrupt = offset > 0x30000;
    const hex = bytes.map(byte => corrupt && Math.random() < .3 ? rune('abcdefghilmnoprstu'[byte % 18]) + ' ' : byte.toString(16).padStart(2, '0'));
    const ascii = bytes.map(byte => byte >= 32 && byte < 127 ? String.fromCharCode(byte) : '.').join('');
    const line = `${offset.toString(16).padStart(8, '0')}  ${hex.slice(0, 8).join(' ')}  ${hex.slice(8).join(' ')}  |${ascii}|\n`;
    offset += 16;
    if (offset === 0x18000) return line + '\n-- SECTOR DAÑADO · LO QUE SIGUE NO ES PARTE DEL ARCHIVO --\n\n';
    return line;
  }
  function fillDump() {
    if (page() !== 'volcado') return;
    let guard = 0;
    while (document.documentElement.scrollHeight - (scrollY + innerHeight) < 2000 && guard++ < 40) {
      let chunk = ''; for (let i = 0; i < 40; i++) chunk += dumpLine();
      dump.append(chunk);
    }
  }
  addEventListener('scroll', fillDump, { passive: true });
  const volcado = {
    enter() { dump.textContent = ''; offset = 0; requestAnimationFrame(fillDump); later(() => say('no todo esto son datos.', 'volcado-1'), 6000); },
    leave() { dump.textContent = ''; }
  };

  // ==== Desorden en las salas de siempre ================================================================
  // The archive is never in the same order twice ("Los archivos no están ordenados. Algunos no quieren
  // estarlo."), and things sit slightly crooked, differently each time you come in.
  function disorder() {
    if (page() === 'archivo') {
      const list = $('#archive-list');
      if (list) [...list.children].sort(() => Math.random() - .5).forEach(row => list.append(row));
    }
    const view = $(`#view-${page()}`); if (!view) return;
    view.querySelectorAll('.file-row, .page-intro h1, .drift, .way-back, .guest-entry, .transmission, .bottom-note, .archive-foot, .gate-section, .statue-note').forEach(node => {
      node.style.translate = `${Math.round(rand(-22, 22))}px ${Math.round(rand(-6, 10))}px`;
      node.style.rotate = rand(-1.4, 1.4).toFixed(2) + 'deg';
    });
  }
  // Once in a while, the arrow back does not take you back.
  let detours = 0; try { detours = Number(sessionStorage.getItem('estacion09-desvios')) || 0; } catch {}
  const opened = performance.now();
  document.addEventListener('click', event => {
    const back = event.target.closest('.way-back, .return-threshold');
    if (!back || navigator.webdriver || detours >= 2 || performance.now() - opened < 60000 || Math.random() > .14) return;
    event.preventDefault();
    detours++; try { sessionStorage.setItem('estacion09-desvios', String(detours)); } catch {}
    location.hash = pick(['pozo', 'nadie', 'espejo', 'volcado', 'habitacion']);
    setTimeout(() => say('ese no era el camino.', null, true), 1200);
  }, true);

  // ==== Rutas ==========================================================================================
  const pages = { pozo, habitacion, ellos, espejo, nadie, volcado };
  let current = null;
  function onRoute() {
    const name = page();
    if (name !== current) { clearAll(); pages[current]?.leave?.(); current = name; pages[name]?.enter?.(); }
    disorder();
  }
  addEventListener('hashchange', onRoute);
  onRoute();

  try { console.log('%cfrecuencias: ᛈᛟᛉᛟ · ᚺᚨᛒᛁᛏᚨᚲᛁᛟᚾ · ᛖᛚᛚᛟᛊ · ᛖᛊᛈᛖᛃᛟ · ᚾᚨᛞᛁᛖ · ᚹᛟᛚᚲᚨᛞᛟ', 'font:13px monospace;color:#aaa;background:#000;padding:4px 10px;letter-spacing:3px'); } catch {}
})();
