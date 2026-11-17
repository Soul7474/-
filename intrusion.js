/* Intrusión: lo primero que ve quien abre el enlace, una vez por sesión, antes del 403 blanco.
   Una terminal finge que la estación ha entrado en el dispositivo: lo «identifica» con lo que el
   propio navegador ya sabe (sistema, navegador, pantalla, gráfica, núcleos, idioma, zona horaria,
   batería, hora), «copia» carpetas, enseña una dirección enorme y corta de golpe al 403 en blanco.
   Es teatro: no se pide ningún permiso, no se lee ningún archivo y no sale nada del navegador.
   La dirección es de red local inventada (192.168.1.x). No imita avisos de ningún sistema,
   antivirus ni autoridad, y no pide nada. Escape o «›» la saltan; con movimiento reducido es
   estática y breve. Un toque durante la intrusión pide pantalla completa (los navegadores solo
   lo permiten tras un gesto). */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const rand = (a, b) => Math.floor(a + Math.random() * (b - a + 1));

  function device() {
    const ua = navigator.userAgent;
    const os = /iPhone/.test(ua) ? `iPhone · iOS ${(ua.match(/OS (\d+)_/) || [])[1] || ''}`.trim()
      : /iPad/.test(ua) ? `iPad · iPadOS ${(ua.match(/OS (\d+)_/) || [])[1] || ''}`.trim()
      : /Android (\d+)/.test(ua) ? `Android ${ua.match(/Android (\d+)/)[1]}`
      : /Windows NT 10/.test(ua) ? 'Windows 10/11' : /Windows/.test(ua) ? 'Windows'
      : /Mac OS X/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'desconocido';
    const browser = /Edg\/(\d+)/.test(ua) ? `Edge ${ua.match(/Edg\/(\d+)/)[1]}`
      : /OPR\/(\d+)/.test(ua) ? `Opera ${ua.match(/OPR\/(\d+)/)[1]}`
      : /CriOS\/(\d+)/.test(ua) ? `Chrome ${ua.match(/CriOS\/(\d+)/)[1]}`
      : /Firefox\/(\d+)/.test(ua) ? `Firefox ${ua.match(/Firefox\/(\d+)/)[1]}`
      : /Chrome\/(\d+)/.test(ua) ? `Chrome ${ua.match(/Chrome\/(\d+)/)[1]}`
      : /Version\/(\d+).*Safari/.test(ua) ? `Safari ${ua.match(/Version\/(\d+)/)[1]}` : 'desconocido';
    let gpu = '';
    try {
      const gl = document.createElement('canvas').getContext('webgl');
      const info = gl?.getExtension('WEBGL_debug_renderer_info');
      const raw = gl ? String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER)) : '';
      const known = raw.match(/(NVIDIA GeForce[^,(]*|GeForce[^,(]*|AMD Radeon[^,(]*|Radeon[^,(]*|Intel\(R\)[^,(]*|Intel [^,(]*|Apple [^,(]*|Apple GPU|Mali[^,(]*|Adreno[^,(]*)/);
      gpu = (known ? known[0] : raw.replace(/^ANGLE \(/, '').replace(/\(.*$/, '')).replace(/[,)]+$/, '').trim().slice(0, 42);
    } catch {}
    let zone = ''; try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch {}
    return { os, browser, gpu, zone, touch: matchMedia('(pointer: coarse)').matches };
  }

  function run(done) {
    const box = document.getElementById('intrusion');
    if (!box) { done(); return; }
    const log = box.querySelector('.intrusion-log');
    const big = box.querySelector('.intrusion-big');
    const timers = [];
    let finished = false; let pulled = false;
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const info = device();
    const ip = `192.168.1.${rand(23, 214)}`;
    const port = pick([445, 3389, 5900, 8009, 1900]);
    const session = Math.random().toString(16).slice(2, 10).toUpperCase();
    const now = () => new Date().toLocaleTimeString('es-ES', { hour12: false });
    const title = document.title;

    // A tick for each line, if the browser lets audio play already (most will not before a touch).
    let ctx = null;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    function tick(high = false) {
      if (!ctx || ctx.state !== 'running') return;
      const t = ctx.currentTime, tone = ctx.createOscillator(), level = ctx.createGain();
      tone.type = 'square'; tone.frequency.value = high ? 1480 : 820 + Math.random() * 300;
      level.gain.setValueAtTime(.025, t); level.gain.exponentialRampToValueAtTime(.0001, t + .03);
      tone.connect(level); level.connect(ctx.destination); tone.start(t); tone.stop(t + .04);
      tone.onended = () => { tone.disconnect(); level.disconnect(); };
    }
    function line(text, cls = '') {
      const row = document.createElement('p'); row.textContent = text; if (cls) row.className = cls;
      log.append(row); log.scrollTop = log.scrollHeight; tick(cls === 'warn');
      return row;
    }
    function bar(label, target, ms, start) {
      let row = null;
      const draw = value => { const full = Math.round(value / 10); row.textContent = `[!] copiando ${label.padEnd(16, ' ')} ${'▓'.repeat(full)}${'░'.repeat(10 - full)} ${String(value).padStart(3, ' ')} %`; };
      at(start, () => { row = line('', 'warn'); draw(0); });
      const steps = 12;
      for (let i = 1; i <= steps; i++) at(start + (ms / steps) * i, () => { if (!row) return; draw(Math.round(target * i / steps)); if (i % 3 === 0) tick(true); });
    }

    // Lines of the "scan". Everything here was already in the browser; nothing is asked for.
    const lines = [
      [`[*] sesión ${session} · conexión entrante`, ''],
      [`[*] origen ${ip}:${port} → nodo 009`, ''],
      ['[+] handshake ............................ OK', 'ok'],
      ['[*] identificando dispositivo', ''],
      [`    sistema ......... ${info.os}`, 'data'],
      [`    navegador ....... ${info.browser}`, 'data'],
      [`    pantalla ........ ${screen.width}×${screen.height} @ ${Math.round((devicePixelRatio || 1) * 10) / 10}x`, 'data'],
      ...(info.gpu ? [[`    gráfica ......... ${info.gpu}`, 'data']] : []),
      ...(navigator.hardwareConcurrency ? [[`    núcleos ......... ${navigator.hardwareConcurrency}${navigator.deviceMemory ? `   memoria ..... ${navigator.deviceMemory} GB` : ''}`, 'data']] : []),
      [`    idioma .......... ${navigator.language || '—'}${info.zone ? `   zona ..... ${info.zone}` : ''}`, 'data'],
      [`    hora local ...... ${now()}`, 'data'],
      [`    entrada ......... ${info.touch ? 'pantalla táctil · lo tienes en la mano' : 'teclado y ratón'}`, 'data'],
      ['[*] solicitando cámara .................. ya la teníamos', 'warn'],
      ['[*] solicitando micrófono ............... abierto', 'warn']
    ];
    const speed = 150;
    const started = performance.now();
    lines.forEach(([text, cls], i) => at(500 + i * speed, () => line(text, cls)));
    let t = 500 + lines.length * speed + 150;
    // Battery, when the browser gives it, arrives a little late, like a real answer.
    const batteryAt = t - 100;
    if (navigator.getBattery) navigator.getBattery().then(battery => { if (!finished) at(Math.max(0, batteryAt - (performance.now() - started)), () => line(`    batería ......... ${Math.round(battery.level * 100)} % · ${battery.charging ? 'enchufado' : 'sin cargador'}`, 'data')); }).catch(() => {});
    bar('/Fotos', rand(57, 79), 1500, t); t += 260;
    bar('/Documentos', 100, 1100, t); t += 260;
    bar(info.touch ? '/Conversaciones' : '/Escritorio', rand(81, 94), 1400, t); t += 1500;
    at(t, () => line('[*] subiendo a nodo009 ......................', 'warn')); t += 500;
    at(t, () => line('[!] no cierres esta ventana', 'red')); t += 650;
    at(t, () => line('[!] no cierres esta ventana', 'red')); t += 450;

    // The address, enormous.
    at(t, () => {
      box.classList.add('big-phase');
      big.querySelector('.intrusion-ip').textContent = ip;
      big.querySelector('.intrusion-sub').textContent = 'te estamos viendo';
      document.title = ip;
      window.EstacionInterior?.fear?.(.6);
    });
    t += 2300;
    at(t, () => { big.querySelector('.intrusion-sub').textContent = 'dispositivo · 009'; box.classList.add('glitch'); });
    t += 900;
    at(t, finish);

    function finish() {
      if (finished) return; finished = true;
      timers.forEach(clearTimeout);
      box.hidden = true; box.classList.remove('big-phase', 'glitch');
      document.removeEventListener('keydown', onKey, true);
      document.title = title;
      try { ctx?.close(); } catch {}
      done();
    }
    function onKey(event) { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); finish(); } }

    box.hidden = false;
    document.title = 'conexión entrante…';
    if (reduce.matches) {
      // Static and short: everything at once, then the address, then the 403.
      timers.forEach(clearTimeout); timers.length = 0;
      lines.forEach(([text, cls]) => line(text, cls));
      line(`[!] copiando /Fotos            ▓▓▓▓▓▓▓░░░  71 %`, 'warn');
      big.querySelector('.intrusion-ip').textContent = ip;
      big.querySelector('.intrusion-sub').textContent = 'te estamos viendo';
      at(2600, () => box.classList.add('big-phase'));
      at(4600, finish);
    }
    document.addEventListener('keydown', onKey, true);
    box.querySelector('.intrusion-skip').addEventListener('click', event => { event.stopPropagation(); finish(); }, { once: true });
    // A touch during the intrusion: full screen, and it answers.
    box.addEventListener('pointerdown', event => {
      if (event.target.closest('.intrusion-skip')) return;
      try { ctx?.resume(); } catch {}
      if (pulled) return; pulled = true;
      const root = document.documentElement;
      if (typeof root.requestFullscreen === 'function' && !document.fullscreenElement) root.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
      if (!box.classList.contains('big-phase')) line('[!] interacción detectada. no toques nada.', 'red');
    });
  }

  window.EstacionIntrusion = Object.freeze({ run });
})();
