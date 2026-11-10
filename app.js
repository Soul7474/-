const $ = (selector) => document.querySelector(selector);
const storageKey = 'estacion09-v1';
let state = { level: 0, guests: [], operator: false, ended: false };
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved) {
    state.level = [0, 1, 2].includes(saved.level) ? saved.level : 0;
    state.operator = saved.operator === true; state.ended = saved.ended === true;
    state.guests = Array.isArray(saved.guests) ? saved.guests.filter(g => typeof g.alias === 'string' && typeof g.message === 'string' && typeof g.date === 'string').slice(-30) : [];
  }
} catch { storageAvailable = false; }
function save() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { storageAvailable = false; } }
const documents = [
  { id: 'bienvenida', name: 'leeme_antes.txt', description: 'Lo que quedó del mensaje de bienvenida.', size: '1.2 KB', level: 0, content: 'ESTACIÓN 09 — AVISO AL VISITANTE\nÚltima revisión: 17.11.1998\n\nSi estás leyendo esto, el servidor ha vuelto a responder. No sabemos por qué.\n\nNo envíes datos personales. No creas todo lo que aparece en el registro. No confundas una respuesta con una presencia.\n\nLa primera puerta no necesita una llave.\nCuando llamas en una habitación vacía, algo te devuelve la voz.\nTres letras. Eso es lo que queda.\n\n— el último operador' },
  { id: 'foto', name: 'pasillo_b.gif', description: 'La última imagen recibida.', size: 'GIF', level: 0, image: true, content: 'CÁMARA 09 / PASILLO B\n\nLa grabación dura tres segundos.\nLa puerta del fondo no figura en los planos.' },
  { id: 'noabrir', name: 'no_abrir.txt', description: 'Lo encontramos escrito desde dentro.', size: '0.9 KB', level: 1, content: 'NO LO LLAMES OTRA VEZ.\n\nAl principio solo repetía lo que decíamos.\nLuego empezó a contestar antes de que habláramos.\n\nEn la segunda puerta pide el año en que todo se detuvo. Cuatro cifras. Está escrito en todas partes.\n\nSi bajas, deja una señal.\nY cuando vuelvas, no mires si la señal sigue ahí.' },
  { id: 'operador', name: 'operador_09.log', description: 'Turno de noche. Registro incompleto.', size: '2.4 KB', level: 1, content: '03:10 — Todos se han ido.\n03:18 — La cámara del pasillo B sigue en línea.\n03:21 — Estoy mirando mi silla desde el pasillo.\n03:24 — Estoy sentado en mi silla.\n03:29 — Las dos cosas son ciertas.\n03:33 — [ENTRADA BORRADA]\n\nEl libro de visitas es lo único que no ha cambiado.' },
  { id: 'frecuencia', name: 'frecuencia_098.txt', description: 'Instrucciones para un receptor que ya no existe.', size: '0.4 KB', level: 0, content: 'FRECUENCIA: 09.8\nORIGEN: LOCAL\nDESTINO: DESCONOCIDO\n\nNo es una voz. Es el espacio entre dos voces.\n\nVe a Transmisiones. Si decides escuchar, no subas el volumen. No hace falta.' },
  { id: 'lista', name: 'presencias.dat', description: 'Hay un nombre más del que debería.', size: '0.2 KB', level: 2, content: 'PRESENCIAS REGISTRADAS\n\nOPERADOR 01 — AUSENTE\nOPERADOR 02 — AUSENTE\nOPERADOR 09 — AUSENTE\nVISITANTE — PRESENTE\nVISITANTE — PRESENTE\n\nNo entraste dos veces.' },
  { id: 'inventario', name: 'inventario_1998.txt', description: 'Lo que había en la estación. Y una cosa más.', size: '0.6 KB', level: 1, content: 'INVENTARIO · ESTACIÓN 09 · 16.11.1998\n\n1 consola de control (sala 0). Acceso: el nombre del operador y la palabra de vigilia.\n3 cámaras: pasillo A, pasillo C, pasillo B.\n   No hay pasillo B en los planos. La cámara 09 lo graba igual.\n1 receptor, frecuencia 09.8.\n1 libro de visitas.\n1 busto de mármol. No figura en el pedido. Nadie firmó su entrega.\n\nNota: el busto estaba de cara a la pared cuando lo encontramos.\nA la mañana siguiente, no.' },
  { id: 'turno', name: 'turno_noche.log', description: 'La entrada borrada. Una parte.', size: '1.1 KB', level: 2, content: 'TURNO DE NOCHE · OPERADOR 09 · 17.11.1998 · RECUPERADO EN PARTE\n\n03:34 — La estatua ha girado la cabeza mientras escribía.\n03:36 — Solo se mueve cuando no la miro. Ahora lo sé.\n03:39 — Lleva algo escrito en la nuca. Para leerlo hay que dejar que te dé la espalda. No la sigas con la mirada.\n03:41 — Lo he leído. Es la palabra de vigilia. No voy a escribirla aquí.\n03:42 — La han puesto al fondo, donde ya no se pide volver.\n03:44 — Si alguien firma con mi nombre en el libro de visitas, la cámara del pasillo B le dejará pasar a la sala 0.\n03:45 — Yo ya no puedo firmar. Mi nombre ya no es mío.\n03:4■ — [LA CINTA SE CORTA]' },
  { id: 'salida', name: 'salida.txt', description: 'Una instrucción que todavía funciona.', size: '0.1 KB', level: 2, content: 'Puedes cerrar la conexión.\n\nEn el subsuelo hay un interruptor.\nBorrará tus accesos y los mensajes que hayas dejado en este navegador.\n\nNo va a impedir que vuelvas.\nPero esta vez la estación no te recordará.' }
];
function element(tag, text, className) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; }
function renderArchive() {
  const connect = $('.cam-connect'); if (connect) connect.hidden = !state.operator;
  if (state.ended) $('#footer-status').textContent = '2 PRESENCIAS EN ESTE NODO';
  const list = $('#archive-list'); list.replaceChildren();
  documents.forEach(doc => {
    const locked = doc.level > state.level;
    const button = element('button', undefined, `file-row${locked ? ' locked-file' : ''}`);
    button.dataset[locked ? 'gate' : 'document'] = locked ? doc.level : doc.id;
    button.append(element('span', locked ? '⌑' : doc.image ? '▧' : '▤', 'file-icon'));
    const label = element('span'); label.append(element('b', doc.name), element('small', locked ? 'Sellado.' : doc.description));
    const meta = element('span', locked ? 'CIFRADO ' : doc.size + ' ', 'file-meta' + (locked ? ' red' : '')); meta.append(element('b', locked ? '⌑' : '↗'));
    button.append(label, meta); list.append(button);
  });
  $('#unlock-status').textContent = state.level ? 'un sello ha cedido' : 'sellado';
  $('.bottom-note>span:last-child').textContent = state.level ? 'la puerta recuerda' : 'la puerta escucha';
  const homeLocked = $('.locked-file[data-gate]');
  if (homeLocked && state.level >= 1) { delete homeLocked.dataset.gate; homeLocked.dataset.document = 'noabrir'; homeLocked.classList.remove('locked-file'); homeLocked.querySelector('small').textContent = 'El sello ha cedido.'; homeLocked.querySelector('.file-meta').textContent = 'ABIERTO ↗'; }
}
function renderGuests() {
  const defaults = [
    { alias: 'sin_remitente', date: '1998-11-17T03:29:00Z', message: 'No había ningún enlace a esta página. ¿Cómo llegaste?' },
    { alias: 'operador_09', date: '1998-11-17T03:33:00Z', message: 'Si la primera puerta sigue cerrada, escucha lo que vuelve cuando llamas. Se llama eco.' }
  ];
  $('#guest-messages').replaceChildren();
  for (const guest of [...defaults, ...state.guests]) {
    const article = element('article', undefined, 'guest-entry'); const header = element('div');
    const date = new Date(guest.date); const time = element('time', Number.isNaN(date.valueOf()) ? 'FECHA DESCONOCIDA' : date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    header.append(element('span', guest.alias), time); article.append(header, element('p', guest.message)); $('#guest-messages').append(article);
  }
  if (state.operator) {
    const reply = element('article', undefined, 'guest-entry guest-reply'); const header = element('div');
    header.append(element('span', 'sin_remitente'), element('time', '03:44'));
    reply.append(header, element('p', 'Tú no eres él. Pero la cámara del pasillo B ya no os distingue.'));
    $('#guest-messages').append(reply);
  }
  renderVisibility();
}
// You stay invisible to the station until you leave a trace in the guestbook.
function renderVisibility() {
  const line = $('#visibility'); if (!line) return;
  line.replaceChildren();
  if (state.ended) line.append('Eres el operador. La estación no te deja salir.');
  else if (state.guests.length) line.append('Eres visible. La estación te ve.');
  else { const link = element('a', '[hacerte visible]'); link.href = '#visitantes'; line.append('Eres invisible. ', link); }
}
// One plea, in many languages, the way a stuck transmission repeats itself.
const pleas = ['[recuérdame]', '[remember me]', '[souviens-toi de moi]', '[erinnere dich an mich]', '[lembra-te de mim]', '[ricordami]', '[pamiętaj o mnie]', '[помни меня]', '[θυμήσου με]', '[覚えていて]', '[记住我]', '[تذكّرني]', '[recorda\'m]', '[gogoratu nazazu]'];
let pleaIndex = 0;
setInterval(() => {
  const plea = $('#plea'); if (!plea || document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  plea.classList.add('fading');
  setTimeout(() => { pleaIndex = (pleaIndex + 1) % pleas.length; plea.textContent = pleas[pleaIndex]; plea.classList.remove('fading'); }, 450);
}, 2800);
let gateLevel = 1;
let gateMisses = 0;
let gateDestination = 'archivo';
let returnFocus;
function openDialog(dialog) { returnFocus = document.activeElement; dialog.showModal(); }
function closeDialog(dialog) { dialog.close(); }
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => { if (event.target.closest('.close-dialog') || event.target === dialog) closeDialog(dialog); });
  dialog.addEventListener('close', () => { if (returnFocus?.isConnected) returnFocus.focus(); });
});
function openGate(level, destination = level === 2 ? 'subsuelo' : 'archivo') {
  if (state.level >= level) { location.hash = destination; return; }
  gateLevel = level; gateDestination = destination;
  $('#gate-level').textContent = String(level).padStart(2, '0');
  $('#gate-description').textContent = level === 1 ? '¿Qué te devuelve la voz en una habitación vacía?' : 'El subsuelo se cerró el año en que la estación dejó de transmitir.';
  $('#gate-hint').textContent = level === 1 ? '«Me llamas en el vacío. Te devuelvo tu voz. No soy nadie. Tres letras.» Busca también en leeme_antes.txt.' : '«Cuatro cifras. El mismo año que aparece bajo el nombre de la estación.»';
  $('#gate-dialog').dataset.level = String(level);
  $('#password').value = ''; $('#gate-error').textContent = ''; $('#password').removeAttribute('aria-invalid');
  openDialog($('#gate-dialog'));
  $('#password').focus();
}
$('#gate-form').addEventListener('submit', event => {
  event.preventDefault();
  const answer = $('#password').value.trim().toLocaleLowerCase('es');
  if (answer !== (gateLevel === 1 ? 'eco' : '1998')) {
    $('#gate-error').textContent = 'No es esa. Algo se ha movido al otro lado.';
    gateMisses++;
    if (!(gateMisses >= 2 && scare('dientes', { delay: 350 }))) showOmen();
    $('#password').setAttribute('aria-invalid', 'true'); $('#password').select(); return;
  }
  state.level = Math.max(state.level, gateLevel); save(); renderArchive();
  if (doorMode === 'closed') { doorMode = 'open'; renderDoor(); }
  $('#password').removeAttribute('aria-invalid'); closeDialog($('#gate-dialog'));
  if (gateDestination === 'interior' && document.body.dataset.page === 'inicio') crossDoor();
  else location.hash = gateDestination;
  $('#log-whisper').textContent = 'la puerta se ha abierto_';
});
function showDocument(id) {
  const doc = documents.find(item => item.id === id); if (!doc) return;
  if (doc.level > state.level) { openGate(doc.level); return; }
  if (doc.id === 'noabrir') setTimeout(() => { if ($('#document-dialog').open && $('#document-title').textContent === doc.name) scare('pasillo', { key: 'no-abrir' }); }, 2600);
  $('#document-title').textContent = doc.name;
  const body = $('#document-body'); releaseGIFs(body); body.replaceChildren();
  if (doc.image) { const img = element('img'); img.src = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'assets/corridor-still.jpg' : 'assets/corridor.gif'; img.alt = 'Imagen recuperada del pasillo B.'; body.append(img); }
  body.append(element('p', doc.content)); openDialog($('#document-dialog'));
}
document.addEventListener('click', event => {
  const replay = event.target.closest('[data-replay-opening]');
  if (replay) {
    if (passageActive || state.level < 1) return;
    if (motionQuery.matches) { whisper('El movimiento reducido del navegador omite la escena.'); return; }
    if (!omensEnabled) { whisper('Activa «invocar» para repetir la escena.'); return; }
    openingScene(); return;
  }
  const entrance = event.target.closest('[data-cross-door]');
  if (entrance) { if (ritual.busy) return; if (state.level >= 1) crossDoor(); else touchClosedDoor(entrance); return; }
  const gate = event.target.closest('[data-gate]'); if (gate) openGate(Number(gate.dataset.gate));
  const vision = event.target.closest('[data-vision]');
  if (vision) { showVision(vision.dataset.vision); return; }
  const doc = event.target.closest('[data-document]'); if (doc) showDocument(doc.dataset.document);
});
const visionFiles = new Set(Array.from(document.querySelectorAll('[data-vision]'), button => button.dataset.vision));
function showVision(name) {
  if (!visionFiles.has(name)) return;
  const original = document.querySelector(`[data-vision="${name}"] img`);
  const image = element('img'); image.src = original.getAttribute('src');
  image.className = original.className; image.alt = original.alt || 'Vestigio del archivo visual.';
  if (original.dataset.gif) {
    image.dataset.gif = original.dataset.gif; image.dataset.still = original.dataset.still;
    image.dataset.explicit = original.dataset.explicit || ''; image.dataset.playing = 'true';
  }
  $('#document-title').textContent = '∴';
  releaseGIFs($('#document-body'));
  $('#document-body').replaceChildren(image); openDialog($('#document-dialog'));
  registerGIFs($('#document-body'));
}
const viewNames = ['inicio', 'interior', 'archivo', 'fragmentos', 'transmisiones', 'visitantes', 'subsuelo', 'descenso', 'estatua', 'control'];
let currentView = '';
function route() {
  const target = location.hash.slice(1) || 'inicio';
  if (target === 'main') { $('#main').focus({ preventScroll: true }); return; }
  const name = viewNames.includes(target) ? target : 'inicio';
  if (name === 'control' && !state.operator) { history.replaceState(null, '', '#archivo'); route(); return; }
  if (name === 'subsuelo' && state.level < 2) {
    history.replaceState(null, '', '#inicio'); route(); openGate(2); return;
  }
  cancelDoorPassage();
  dismissOmen();
  document.body.dataset.page = name;
  if (name === 'descenso') startDescent(); else stopDescent();
  if (name === 'estatua') startStatue(); else stopStatue();
  if (name === 'control') bootConsole();
  $('#entry-portal').hidden = name !== 'inicio';
  document.querySelectorAll('.view').forEach(view => view.hidden = view.id !== `view-${name}`);
  document.querySelectorAll('[data-view]').forEach(link => { link.classList.toggle('active', link.dataset.view === name); if (link.dataset.view === name) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
  $('.restricted').classList.toggle('active', name === 'subsuelo');
  $('.masthead').hidden = name === 'interior';
  document.title = `ESTACIÓN 09 — ${name === 'inicio' ? 'señal residual' : name}`;
  if (currentView && currentView !== name) {
    const focusTarget = name === 'inicio' ? $('#portal-title') : $('#main');
    focusTarget.setAttribute('tabindex', '-1'); focusTarget.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  currentView = name;
}
window.addEventListener('hashchange', route);
// A hidden door that leads to the page you are already on takes you back to its beginning
// (the footer's PERDIDOS sits at the bottom of the descent itself).
document.addEventListener('click', event => {
  const door = event.target.closest('a.hidden-door[href^="#"]');
  if (!door || door.getAttribute('href') !== location.hash) return;
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: motionQuery.matches ? 'instant' : 'smooth' });
});
$('#guest-form').addEventListener('submit', event => {
  event.preventDefault(); const message = $('#guest-message').value.trim();
  if (!message) { $('#guest-status').textContent = 'El vacío no deja rastro. Escribe una señal.'; return; }
  const alias = $('#guest-name').value.trim().slice(0, 32) || 'anónimo';
  const signedAsOperator = alias.toLocaleLowerCase('es') === 'operador_09';
  state.guests.push({ alias, message: message.slice(0, 500), date: new Date().toISOString() });
  if (signedAsOperator) state.operator = true;
  state.guests = state.guests.slice(-30); save(); renderGuests(); renderArchive(); $('#guest-form').reset();
  $('#guest-status').textContent = signedAsOperator ? 'Señal guardada. Algo se ha encendido en el pasillo B.' : storageAvailable ? 'Señal guardada. La estación te recuerda.' : 'Señal recibida durante esta sesión. Este navegador no permite guardarla.';
});
for (const id of ['forget-button', 'reset-session']) $('#' + id).addEventListener('click', () => openDialog($('#reset-dialog')));
$('#confirm-reset').addEventListener('click', () => {
  state = { level: 0, guests: [], operator: false, ended: false }; save();
  try { localStorage.removeItem(doorSceneKey); } catch {}
  doorSceneSeen = false; stopAmbient(); closeDialog($('#reset-dialog')); location.hash = 'inicio'; location.reload();
});
let audio;
let ambient;
let transmissionNodes;
let transmissionTimer;
function audioContext() { audio ??= new (window.AudioContext || window.webkitAudioContext)(); return audio; }
function drone(volume) {
  const ctx = audioContext(); const gain = ctx.createGain(); gain.gain.value = volume; gain.connect(ctx.destination);
  const nodes = [48, 49.4, 96].map(frequency => { const oscillator = ctx.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = frequency; oscillator.connect(gain); oscillator.start(); return oscillator; });
  return { gain, volume, stop() { nodes.forEach(node => node.stop()); gain.disconnect(); } };
}
function stopAmbient() { ambient?.stop(); ambient = null; $('#sound-toggle').setAttribute('aria-pressed', 'false'); $('#sound-toggle').innerHTML = '<span aria-hidden="true">▥</span> SONIDO: DESACTIVADO'; window.dispatchEvent(new CustomEvent('station:sound')); }
$('#sound-toggle').addEventListener('click', async () => {
  if (ambient) { stopAmbient(); return; }
  try { await audioContext().resume(); ambient = drone(.025); $('#sound-toggle').setAttribute('aria-pressed', 'true'); $('#sound-toggle').innerHTML = '<span aria-hidden="true">▥</span> SONIDO: ACTIVADO'; window.dispatchEvent(new CustomEvent('station:sound')); }
  catch { $('#sound-toggle').textContent = 'AUDIO NO DISPONIBLE'; }
});
function stopTransmission() {
  clearTimeout(transmissionTimer); transmissionNodes?.stop(); transmissionNodes = null;
  $('#transmission-play').innerHTML = 'ESCUCHAR FRECUENCIA <span>▷</span>';
  $('#transmission-status').textContent = 'Transmisión finalizada. El receptor sigue abierto.';
}
$('#transmission-play').addEventListener('click', async () => {
  if (transmissionNodes) { stopTransmission(); return; }
  try {
    const ctx = audioContext(); await ctx.resume();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 9, ctx.sampleRate); const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * .1 * (.3 + .7 * Math.sin(i / ctx.sampleRate * 2) ** 2);
    const noise = ctx.createBufferSource(); noise.buffer = buffer;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 650;
    noise.connect(filter); filter.connect(ctx.destination); noise.start();
    const hum = drone(.035); transmissionNodes = { stop() { noise.stop(); filter.disconnect(); hum.stop(); } };
    $('#transmission-play').innerHTML = 'DETENER TRANSMISIÓN <span>■</span>';
    $('#transmission-status').textContent = 'Recibiendo interferencia… 9 segundos de señal. La transcripción aparece debajo.';
    transmissionTimer = setTimeout(stopTransmission, 9000);
    window.dispatchEvent(new CustomEvent('station:transmission'));
  } catch { $('#transmission-status').textContent = 'El receptor de audio no está disponible. Puedes leer la transcripción.'; }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopAmbient(); if (transmissionNodes) stopTransmission(); } });
let seconds = 0;
setInterval(() => {
  seconds++; const stamp = new Date(seconds * 1000).toISOString().slice(11, 19);
  $('#session-clock').textContent = stamp + ' / SESIÓN LOCAL';
  $('#camera-clock').textContent = '03:33:' + String((9 + Math.floor(seconds / 3)) % 60).padStart(2, '0');
  document.querySelectorAll('.cam-clock').forEach(clock => { clock.textContent = $('#camera-clock').textContent; });
  if (seconds === 35) $('#log-whisper').textContent = 'no has cerrado la ventana_';
  if (seconds === 90) $('#log-whisper').textContent = 'el silencio también responde_';
}, 1000);
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
function applyMotionPreference() {
  $('.corridor>img').src = motionQuery.matches ? 'assets/corridor-still.jpg' : 'assets/corridor.gif';
  const badge = $('.web-badges img'); badge.hidden = motionQuery.matches;
}
motionQuery.addEventListener('change', applyMotionPreference);
// Ritual interactions are user-triggered; never interrupt a first visit automatically.
let omensEnabled = true;
try { omensEnabled = localStorage.getItem('estacion09-omens') !== 'quiet'; } catch {}
let omenTimer;
let lastOmen = -Infinity;
let omenIndex = 0;
const omenImages = [
  { src: 'images/0cef067d6389316753e85350caa85388.jpg', ink: false },
  { src: 'images/91bcc74e941fa720f84af443207553f6.jpg', ink: true },
  { src: 'images/71f43ece8f68bf946b666118ed26dbb5.jpg', ink: false }
];
// Warm the three small originals so the first apparition is not an empty frame.
for (const source of omenImages) { const image = new Image(); image.src = source.src; }

function dismissOmen() {
  clearTimeout(omenTimer);
  const apparition = $('#apparition');
  if (typeof apparition.hidePopover === 'function' && apparition.matches(':popover-open')) apparition.hidePopover();
  apparition.hidden = true;
  document.body.classList.remove('observed');
}
function updateOmenControl() {
  const enabled = omensEnabled && !motionQuery.matches;
  document.body.classList.toggle('quiet', !enabled);
  refreshGIFs();
  $('#omens-toggle').textContent = enabled ? 'calma' : 'invocar';
  $('#omens-toggle').setAttribute('aria-pressed', String(enabled));
  $('#omens-toggle').setAttribute('aria-label', enabled ? 'Desactivar sobresaltos visuales' : 'Activar sobresaltos visuales');
  $('#omens-toggle').disabled = motionQuery.matches;
  document.querySelectorAll('[data-tape-play]').forEach(button => {
    button.disabled = !enabled;
    if (!enabled) { button.setAttribute('aria-pressed', 'false'); button.querySelector('[data-gif]').dataset.playing = 'false'; }
  });
  if (motionQuery.matches) $('#omens-toggle').textContent = 'en calma';
  refreshGIFs();
}
function showOmen(fromInterior = false) {
  if (!fromInterior && document.body.dataset.page !== 'inicio' && window.EstacionRitual) {
    window.EstacionRitual.request('touch'); return;
  }
  if (passageActive || !omensEnabled || motionQuery.matches || document.hidden || performance.now() - lastOmen < 18000) return;
  lastOmen = performance.now();
  const apparition = $('#apparition');
  const source = omenImages[omenIndex++ % omenImages.length];
  const image = apparition.querySelector('img');
  image.src = source.src; image.classList.toggle('ink-source', source.ink);
  apparition.hidden = false;
  if (typeof apparition.showPopover === 'function') apparition.showPopover();
  else apparition.removeAttribute('popover');
  document.body.classList.add('observed');
  // Sound remains opt-in through the existing audio control.
  if (ambient && audio?.state === 'running') {
    const tone = audio.createOscillator(); const volume = audio.createGain();
    tone.type = 'sine'; tone.frequency.setValueAtTime(118, audio.currentTime);
    tone.frequency.exponentialRampToValueAtTime(43, audio.currentTime + .3);
    volume.gain.setValueAtTime(.025, audio.currentTime);
    volume.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .32);
    tone.connect(volume); volume.connect(audio.destination); tone.start(); tone.stop(audio.currentTime + .35);
    tone.onended = () => { tone.disconnect(); volume.disconnect(); };
  }
  omenTimer = setTimeout(dismissOmen, 850);
}
document.querySelectorAll('[data-omen]').forEach(eye => eye.addEventListener('click', () => {
  if (!motionQuery.matches) {
    eye.classList.add('eye-awake');
    setTimeout(() => eye.classList.remove('eye-awake'), 1200);
  }
  if (!ritualEye(eye)) showOmen();
}));
$('#omens-toggle').addEventListener('click', () => {
  omensEnabled = !omensEnabled;
  try { localStorage.setItem('estacion09-omens', omensEnabled ? 'active' : 'quiet'); } catch {}
  dismissOmen(); updateOmenControl();
  if (passageActive) { cancelDoorPassage(); location.hash = 'interior'; }
});
motionQuery.addEventListener('change', () => { dismissOmen(); updateOmenControl(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') dismissOmen(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) dismissOmen(); });
// GIFs load and animate only while visible; stills are real browser captures of each original.
const watchedGIFs = new Map();
// Each tape says what it is doing, so a still never looks like a broken GIF: "sintonizando…"
// while the (heavy) GIF downloads, "en pausa · calma" when it is held still on purpose.
function refreshGIF(image) {
  const visible = watchedGIFs.get(image);
  const quiet = !omensEnabled || motionQuery.matches;
  const allowed = visible && !document.hidden && !quiet &&
    (image.dataset.explicit !== 'true' || image.dataset.playing === 'true');
  const source = allowed ? image.dataset.gif : image.dataset.still;
  const tape = image.closest('[data-tape]');
  if (image.getAttribute('src') !== source) {
    if (tape && source === image.dataset.gif) tape.classList.add('is-tuning');
    image.setAttribute('src', source);
  }
  if (tape) {
    if (source !== image.dataset.gif) tape.classList.remove('is-tuning');
    tape.classList.toggle('is-paused', quiet && image.dataset.explicit !== 'true');
  }
}
document.addEventListener('load', event => {
  const image = event.target;
  if (image instanceof HTMLImageElement && image.dataset.gif && image.getAttribute('src') === image.dataset.gif) image.closest('[data-tape]')?.classList.remove('is-tuning');
}, true);
function refreshGIFs() { for (const image of watchedGIFs.keys()) refreshGIF(image); }
const gifObserver = new IntersectionObserver(entries => {
  for (const entry of entries) { watchedGIFs.set(entry.target, entry.isIntersecting); refreshGIF(entry.target); }
}, { threshold: .05, rootMargin: '240px 0px' });
function registerGIFs(root = document) {
  root.querySelectorAll('img[data-gif]').forEach(image => {
    if (watchedGIFs.has(image)) return;
    watchedGIFs.set(image, false); gifObserver.observe(image);
  });
}
function releaseGIFs(root) {
  root.querySelectorAll('img[data-gif]').forEach(image => {
    gifObserver.unobserve(image); watchedGIFs.delete(image);
  });
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-tape-play]'); if (!button) return;
  const image = button.querySelector('[data-gif]');
  if (!omensEnabled || motionQuery.matches) return;
  image.dataset.playing = String(image.dataset.playing !== 'true');
  button.setAttribute('aria-pressed', image.dataset.playing); refreshGIF(image);
});
document.addEventListener('visibilitychange', refreshGIFs);
motionQuery.addEventListener('change', refreshGIFs);
registerGIFs();
// Some images arrive late: they fade up the first time they scroll into view. Without
// IntersectionObserver, or with reduced motion, they are simply there.
if ('IntersectionObserver' in window && !motionQuery.matches) {
  document.documentElement.classList.add('reveal-ready');
  const revealer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('revealed'); revealer.unobserve(entry.target); }
  }, { threshold: .15 });
  document.querySelectorAll('[data-reveal]').forEach(item => revealer.observe(item));
}

updateOmenControl();

// The threshold door stays shut until three things are done, in order:
// wake the three open eyes, name the echo with the wall runes, knock three times.
const ritualWord = ['e', 'c', 'o'];
const ritualClues = [
  ['Los ojos cosidos no pueden verte. Despierta a los tres que siguen abiertos.', 'Los que siguen abiertos no tienen hilo. Son de cinta, no de tinta.', 'Busca los tres ojos grabados en cinta que se abren en la oscuridad, no los dibujados.'],
  ['Ahora nómbralo con los arañazos de la pared: lo que te devuelve la voz en una habitación vacía.', 'Tres letras. Lo que vuelve cuando llamas.', 'Se llama eco. Escríbelo con las runas, en orden.'],
  ['Ya sabe que estás aquí. Llama a la puerta. Tres veces.', 'Tres golpes sobre la puerta, seguidos, antes de que se apague el anterior.']
];
const runeKey = 'ᛖ e · ᚲ c · ᛟ o · ᚾ n · ᚱ r · ᚦ th · ᛉ z · ᛇ i';
const ritual = { step: 0, misses: 0, eyes: new Set(), runes: [], knocks: 0, knockTimer: 0, busy: false };
let doorMode = state.level >= 1 ? 'open' : 'closed';
// Older visitors may have an open gate without ever seeing this new entrance scene.
const doorSceneKey = 'estacion09-door-scene-v1';
let doorSceneSeen = false;
try { doorSceneSeen = localStorage.getItem(doorSceneKey) === 'seen'; } catch {}

function pulse(node, className) { node.classList.remove(className); void node.offsetWidth; node.classList.add(className); }
function currentClue() { const hints = ritualClues[ritual.step]; return hints[Math.min(ritual.misses, hints.length - 1)]; }
function whisper(text, withKey = false) {
  const box = $('#door-whisper'); box.replaceChildren();
  if (text) box.append(element('span', text));
  if (withKey) box.append(element('small', runeKey, 'rune-key'));
  pulse(box, 'stir');
}
function whisperClue(prefix = '') { whisper((prefix ? prefix + ' ' : '') + currentClue(), ritual.step === 1); }
function renderDoor() {
  $('.door-recording .door-stage').dataset.door = doorMode;
  $('.door-surface').setAttribute('aria-label', doorMode === 'closed' ? 'Llamar a la puerta cerrada' : 'Entrar por la puerta');
  $('[data-replay-opening]').hidden = state.level < 1;
  if (doorMode === 'closed') whisperClue();
  else whisper(doorMode === 'peeked' ? 'La puerta se ha abierto. Algo se asoma desde dentro.' : '');
}
function ritualMiss(message) {
  ritual.misses++; whisperClue(message);
  if (!(ritual.misses >= 3 && scare('cara', { key: 'umbral', delay: 500 }))) showOmen();
}
function advanceRitual() {
  ritual.step++; ritual.misses = 0;
  pulse($('.door-recording'), 'rattle'); // the door shivers on its own as each step is done
  if (ritual.step === ritualClues.length) finishRitual(); else whisperClue();
}
// Returns true when the touch belongs to the ritual and must not summon an apparition.
function ritualEye(eye) {
  if (state.level >= 1 || ritual.busy || !eye.closest('#entry-portal')) return false;
  const open = eye.classList.contains('photographic-eye');
  if (ritual.step !== 0) return open;
  if (!open) {
    const closed = ritual.eyes.size > 0;
    ritual.eyes.forEach(awake => awake.classList.remove('eye-open')); ritual.eyes.clear();
    ritualMiss(closed ? 'Ese no puede verte. Los otros se han vuelto a cerrar.' : 'Ese no puede verte.');
    return true;
  }
  if (ritual.eyes.has(eye)) return true;
  ritual.eyes.add(eye); eye.classList.add('eye-open');
  if (ritual.eyes.size === 3) advanceRitual();
  else whisper(ritual.eyes.size === 1 ? 'Uno te mira.' : 'Dos te miran.');
  return true;
}
document.querySelectorAll('[data-rune]').forEach(rune => rune.addEventListener('click', () => {
  if (state.level >= 1 || ritual.busy) { pulse(rune, 'flick'); return; }
  if (ritual.step !== 1) { pulse(rune, 'flick'); whisperClue(ritual.step === 0 ? 'Todavía no te ven.' : ''); return; }
  if (rune.dataset.rune === ritualWord[ritual.runes.length]) {
    ritual.runes.push(rune); rune.classList.add('rune-lit');
    if (ritual.runes.length === ritualWord.length) advanceRitual();
    return;
  }
  ritual.runes.forEach(lit => lit.classList.remove('rune-lit')); ritual.runes = [];
  pulse(rune, 'flick'); ritualMiss('No es su nombre.');
}));
function knockSound() {
  if (!ambient || audio?.state !== 'running') return;
  const tone = audio.createOscillator(); const volume = audio.createGain();
  tone.frequency.setValueAtTime(95, audio.currentTime); tone.frequency.exponentialRampToValueAtTime(42, audio.currentTime + .12);
  volume.gain.setValueAtTime(.08, audio.currentTime); volume.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .16);
  tone.connect(volume); volume.connect(audio.destination); tone.start(); tone.stop(audio.currentTime + .18);
  tone.onended = () => { tone.disconnect(); volume.disconnect(); };
}
function touchClosedDoor(target) {
  const door = $('.door-recording');
  if (ritual.step === 2 && target.classList.contains('door-surface')) {
    clearTimeout(ritual.knockTimer);
    ritual.knocks++; pulse(door, 'knock'); knockSound();
    if (ritual.knocks === 3) { advanceRitual(); return; }
    whisper(ritual.knocks === 1 ? 'Toc.' : 'Toc. Toc.');
    ritual.knockTimer = setTimeout(() => { ritual.knocks = 0; ritual.misses++; whisperClue('El golpe se ha apagado.'); }, 2400);
    return;
  }
  pulse(door, 'rattle'); whisperClue('Cerrada.');
}
function finishRitual() {
  ritual.busy = true;
  state.level = Math.max(state.level, 1); save(); renderArchive();
  $('#log-whisper').textContent = 'la puerta se ha abierto_';
  whisper('…');
  setTimeout(() => {
    ritual.busy = false;
    if (motionQuery.matches || !omensEnabled || document.body.dataset.page !== 'inicio') { doorMode = 'peeked'; renderDoor(); return; }
    openingScene();
  }, 900);
}

// Both passages work on a copy of the door, enlarged from its place on the page,
// inside a rig that can shake without uncovering the page beneath.
let passageAnimations = [];
let passageActive = false;
let passageId = 0;
function cancelDoorPassage() {
  passageActive = false; passageId++;
  clearTimeout(skipTimer); $('#scene-skip').hidden = true;
  passageAnimations.forEach(animation => animation.cancel()); passageAnimations = [];
  stopStatic();
  const passage = $('#door-passage'); passage.hidden = true; passage.replaceChildren();
  $('#entry-portal').removeAttribute('aria-busy');
  document.querySelectorAll('[data-cross-door]').forEach(button => button.disabled = false);
}
function mountPassage(mode) {
  const stage = $('.door-recording .door-stage');
  const bounds = stage.getBoundingClientRect();
  if (!bounds.width || !bounds.height || typeof stage.animate !== 'function') return null;
  const copy = stage.cloneNode(true); copy.dataset.door = mode;
  Object.assign(copy.style, { left: bounds.left + 'px', top: bounds.top + 'px', width: bounds.width + 'px', height: bounds.height + 'px' });
  const rig = element('div', undefined, 'passage-rig'); rig.append(copy);
  const passage = $('#door-passage'); passage.replaceChildren(rig); passage.hidden = false;
  // The runes and eyes around the door sink into the dark over 300 ms instead of vanishing.
  play(passage, [{ backgroundColor: 'rgba(3, 3, 3, 0)' }, { backgroundColor: 'rgb(3, 3, 3)' }], { duration: 300, easing: 'ease-out' });
  passageActive = true; passageId++;
  $('#entry-portal').setAttribute('aria-busy', 'true');
  document.querySelectorAll('[data-cross-door]').forEach(button => button.disabled = true);
  return { copy, rig, bounds, id: passageId };
}
// Transform (origin 0 0) that brings the point (fx, fy) of the door to the centre of the screen.
function focusOn(bounds, fx, fy, scale) {
  const x = innerWidth / 2 - bounds.left - bounds.width * fx * scale;
  const y = innerHeight / 2 - bounds.top - bounds.height * fy * scale;
  return `translate(${x}px, ${y}px) scale(${scale})`;
}
function play(node, frames, options) {
  const animation = node.animate(frames, { fill: 'forwards', ...options });
  passageAnimations.push(animation); return animation;
}
// Resolves true when every animation ended and the same passage is still running.
async function settled(id, ...animations) {
  try { await Promise.all(animations.map(animation => animation.finished)); } catch { return false; }
  return passageActive && passageId === id;
}
async function runPassage(id, animation, completesScene = false) {
  if (!await settled(id, animation)) return;
  if (completesScene) {
    doorSceneSeen = true;
    try { localStorage.setItem(doorSceneKey, 'seen'); } catch {}
  }
  cancelDoorPassage(); location.hash = 'interior';
}
function crossDoor() {
  if (passageActive) return;
  if (motionQuery.matches || !omensEnabled) { location.hash = 'interior'; return; }
  if (!doorSceneSeen) { openingScene(); return; }
  dismissOmen();
  const mount = mountPassage(doorMode); if (!mount) { location.hash = 'interior'; return; }
  const { copy, bounds, id } = mount;
  const scale = Math.max(innerWidth / (bounds.width * .18), innerHeight / (bounds.height * .7));
  runPassage(id, play(copy, [
    { transform: 'translate(0px, 0px) scale(1)', filter: 'grayscale(1) brightness(1)' },
    { offset: .78, transform: focusOn(bounds, .65, .48, scale * .8), filter: 'grayscale(1) brightness(.45)' },
    { transform: focusOn(bounds, .65, .48, scale), filter: 'grayscale(1) brightness(0)' }
  ], { duration: 1600, easing: 'cubic-bezier(.62,.06,.52,1)' }));
}

// Low-contrast static drawn into a tiny canvas: grain, never a flash.
let staticFrame = 0;
function startStatic(canvas) {
  const context = canvas.getContext('2d'); if (!context) return;
  const image = context.createImageData(canvas.width, canvas.height); let tick = 0;
  const draw = () => {
    if (!canvas.isConnected) return;
    if (tick++ % 2 === 0) {
      for (let i = 0; i < image.data.length; i += 4) { const v = Math.random() * 90; image.data[i] = image.data[i + 1] = image.data[i + 2] = v; image.data[i + 3] = 255; }
      context.putImageData(image, 0, 0);
    }
    staticFrame = requestAnimationFrame(draw);
  };
  draw();
}
function stopStatic() { cancelAnimationFrame(staticFrame); staticFrame = 0; }
function hiss(seconds) {
  if (!ambient || audio?.state !== 'running') return;
  const buffer = audio.createBuffer(1, audio.sampleRate * seconds, audio.sampleRate); const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * .05 * (1 - i / samples.length);
  const noise = audio.createBufferSource(); noise.buffer = buffer;
  const filter = audio.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 1800;
  noise.connect(filter); filter.connect(audio.destination); noise.start();
  noise.onended = () => { noise.disconnect(); filter.disconnect(); };
}

function heartbeat() {
  if (!ambient || audio?.state !== 'running') return;
  for (const at of [0, .36]) {
    const tone = audio.createOscillator(); const volume = audio.createGain(); const start = audio.currentTime + at;
    tone.frequency.setValueAtTime(70, start); tone.frequency.exponentialRampToValueAtTime(38, start + .14);
    volume.gain.setValueAtTime(.0001, start); volume.gain.exponentialRampToValueAtTime(.09, start + .02);
    volume.gain.exponentialRampToValueAtTime(.0001, start + .2);
    tone.connect(volume); volume.connect(audio.destination); tone.start(start); tone.stop(start + .22);
    tone.onended = () => { tone.disconnect(); volume.disconnect(); };
  }
}
// The hand that takes you, in three layers cut from the same picture (palm, fingers, thumb)
// so the fingers can curl and the thumb close. Sized by the screen's height so it still
// wraps the bottom of a tall phone screen; its wrist runs off the edge of the frame.
function grabbingHand(src) {
  const root = element('div', undefined, 'grab');
  const layer = name => { const image = element('img', undefined, 'grab-' + name); image.src = src; image.alt = ''; root.append(image); return image; };
  const palm = layer('palm'); const fingers = layer('fingers'); const thumb = layer('thumb');
  const portrait = innerHeight > innerWidth;
  const width = Math.max(Math.min(innerWidth * .8, innerHeight * 1.6), innerHeight * 1.12);
  const height = width * 400 / 480;
  const centreX = innerWidth * (portrait ? .64 : .62); const centreY = innerHeight * (portrait ? .8 : .9);
  Object.assign(root.style, { left: centreX - width / 2 + 'px', top: centreY - height / 2 + 'px', width: width + 'px', height: height + 'px' });
  return { root, palm, fingers, thumb };
}
// After the ritual: the door opens; a hand grips the frame; a face comes closer out of the dark;
// the hand takes you by the throat and drags you in; you fall, and something is waiting.
async function openingScene() {
  if (passageActive) return;
  dismissOmen();
  const mount = mountPassage('closed');
  doorMode = 'open'; renderDoor();
  if (!mount) { location.hash = 'interior'; return; }
  const { copy, rig, bounds, id } = mount;
  const face = copy.querySelector('.presence'); const head = copy.querySelector('.presence-head'); const frameHand = copy.querySelector('.frame-hand');
  const photoLeaf = copy.querySelector('.photo-leaf');
  copy.classList.add('in-scene');
  const depth = copy.offsetWidth * 1.4;
  const near = Math.max(innerHeight * 1.5 / bounds.height, innerWidth * .62 / bounds.width);
  const view = focusOn(bounds, .62, .45, near);
  const closer = focusOn(bounds, .63, .43, near * 1.18);

  armSkip(id);

  // The photo already shows the door ajar: there is no leaf to open. The camera creeps slowly
  // towards the black gap while the edges darken, and the real leaf (cut out of the photo)
  // swings a little further towards you. The fingers find the frame before it settles.
  const shade = element('div', undefined, 'edge-dark'); rig.append(shade);
  const approach = play(copy, [
    { transform: 'translate(0px, 0px) scale(1)', filter: 'grayscale(1) brightness(1)' },
    { transform: view, filter: 'grayscale(1) brightness(.88)' }
  ], { duration: 2400, easing: 'cubic-bezier(.35,0,.25,1)' });
  play(shade, [{ opacity: 0 }, { opacity: .85 }], { duration: 2400, easing: 'ease-in' });
  const swing = play(photoLeaf, [
    { transform: `perspective(${depth}px) rotateY(0deg)`, filter: 'grayscale(1) brightness(1)' },
    { offset: .25, transform: `perspective(${depth}px) rotateY(3deg)` },
    { offset: .4, transform: `perspective(${depth}px) rotateY(2.4deg)` },
    { transform: `perspective(${depth}px) rotateY(17deg)`, filter: 'grayscale(1) brightness(.8)' }
  ], { delay: 500, duration: 1900, easing: 'ease-in-out' });
  // a) Fingers curl out of the dark and grip the left frame, the wall's peeling edge.
  const grip = play(frameHand, [
    { opacity: 0, transform: 'translateX(38%) scale(.96)' },
    { offset: .6, opacity: .9, transform: 'translateX(8%) scale(1)' },
    { opacity: 1, transform: 'translateX(0%) scale(1)' }
  ], { delay: 1700, duration: 900, easing: 'cubic-bezier(.2,.6,.3,1)' });
  if (!await settled(id, approach, swing, grip)) return;

  // b) The face that the photo already shows in the shadow comes forward: it starts dark and blurred
  // on that very spot, half behind the leaf, and grows, lightens and leans out from there. It is
  // alive: the head tilts slowly and sways; once, half way, it stops dead and then moves again.
  const emerge = play(face, [
    { offset: 0, opacity: 0, transform: 'translateX(0%) scale(.45)', filter: 'brightness(.25) blur(3px)', easing: 'cubic-bezier(.4,0,.6,1)' },
    { offset: .12, opacity: .5, transform: 'translateX(-2%) scale(.48)', filter: 'brightness(.3) blur(3px)' },
    { offset: .5, opacity: .85, transform: 'translateX(-14%) scale(.82)', filter: 'brightness(.85) blur(1px)' },
    { offset: .62, opacity: .85, transform: 'translateX(-14%) scale(.82)', filter: 'brightness(.85) blur(1px)', easing: 'cubic-bezier(.5,0,.5,1)' },
    { offset: 1, opacity: 1, transform: 'translateX(-29%) scale(1.2)', filter: 'brightness(1.12) blur(0px)' }
  ], { duration: 3000 });
  play(head, [
    { offset: 0, transform: 'translate(0%, 0%) rotate(0deg)' },
    { offset: .22, transform: 'translate(-1.6%, .5%) rotate(-1.2deg)' },
    { offset: .5, transform: 'translate(1%, 1%) rotate(-2.6deg)' },
    { offset: .62, transform: 'translate(1%, 1%) rotate(-2.6deg)' },
    { offset: .66, transform: 'translate(1.8%, .3%) rotate(-1.9deg)' },
    { offset: .84, transform: 'translate(-.9%, 0%) rotate(.6deg)' },
    { offset: 1, transform: 'translate(.6%, .7%) rotate(-1.5deg)' }
  ], { duration: 3000, easing: 'ease-in-out' });
  // Meanwhile the fingers on the frame tap, then dig in while the face holds still.
  const tap = (at, lift) => [{ offset: at, transform: 'rotate(0deg) scaleX(1)' }, { offset: at + .03, transform: `rotate(${lift}deg) scaleX(1)` }, { offset: at + .06, transform: 'rotate(0deg) scaleX(1)' }];
  play(frameHand, [
    { offset: 0, transform: 'rotate(0deg) scaleX(1)', filter: 'grayscale(1) brightness(.7) contrast(1.1)' },
    ...tap(.08, -5), ...tap(.2, -4), ...tap(.32, -6),
    { offset: .5, transform: 'rotate(0deg) scaleX(1)', filter: 'grayscale(1) brightness(.7) contrast(1.1)' },
    { offset: .54, transform: 'rotate(1.5deg) scaleX(.93)', filter: 'grayscale(1) brightness(.62) contrast(1.2)' },
    { offset: .64, transform: 'rotate(1.5deg) scaleX(.93)', filter: 'grayscale(1) brightness(.62) contrast(1.2)' },
    { offset: .7, transform: 'rotate(0deg) scaleX(1)', filter: 'grayscale(1) brightness(.7) contrast(1.1)' },
    ...tap(.8, -5),
    { offset: 1, transform: 'rotate(0deg) scaleX(1)', filter: 'grayscale(1) brightness(.7) contrast(1.1)' }
  ], { duration: 3000 });
  const lean = play(copy, [
    { transform: view, filter: 'grayscale(1) brightness(.9)' },
    { transform: closer, filter: 'grayscale(1) brightness(.9)' }
  ], { duration: 3000, easing: 'ease-in-out' });
  if (!await settled(id, emerge, lean)) return;

  // c) The hand lets go of the frame, comes round from below and closes on your throat.
  play(frameHand, [{ opacity: 1, transform: 'translateX(0%) scale(1)' }, { opacity: 0, transform: 'translateX(34%) scale(.9)' }], { duration: 260, easing: 'ease-in' });
  const grab = grabbingHand(frameHand.src);
  const vignette = element('div', undefined, 'choke');
  rig.append(vignette, grab.root);
  const held = 'translate(0px, 0px) rotate(-6deg) scale(1)';
  const dark = 'grayscale(1) brightness(.38) contrast(1.15)';
  const lunge = play(grab.root, [
    { transform: `translate(${innerWidth * .42}px, ${innerHeight * .75}px) rotate(-30deg) scale(.82)`, filter: 'grayscale(1) brightness(.14) contrast(1.15) blur(16px)', opacity: 0 },
    { offset: .2, opacity: 1 },
    { offset: .75, filter: 'grayscale(1) brightness(.3) contrast(1.15) blur(6px)' },
    { transform: held, filter: dark + ' blur(0px)', opacity: 1 }
  ], { delay: 80, duration: 440, easing: 'cubic-bezier(.3,.55,.35,1)' });
  if (!await settled(id, lunge)) return;
  // The fist closes: fingers curl in towards you, the thumb comes down over them.
  const curl = play(grab.fingers, [
    { transform: 'scaleX(1) skewY(0deg) rotate(0deg)', filter: 'brightness(1)' },
    { transform: 'scaleX(.7) skewY(5deg) rotate(-4deg)', filter: 'brightness(.68)' }
  ], { duration: 280, easing: 'cubic-bezier(.55,0,.2,1)' });
  const thumbDown = play(grab.thumb, [
    { transform: 'rotate(0deg) translateY(0%)' },
    { transform: 'rotate(27deg) translateY(5%)' }
  ], { duration: 280, easing: 'cubic-bezier(.55,0,.2,1)' });
  if (!await settled(id, curl, thumbDown)) return;
  // Squeeze: no air. The dark closes in from the edges over two heartbeats, the view shakes.
  heartbeat();
  const choke = play(vignette, [
    { opacity: 0, transform: 'scale(1.7)' },
    { offset: .16, opacity: 1, transform: 'scale(1.12)' },
    { offset: .34, transform: 'scale(1.3)' },
    { offset: .54, transform: 'scale(.98)' },
    { offset: .72, transform: 'scale(1.06)' },
    { opacity: 1, transform: 'scale(.84)' }
  ], { duration: 800, easing: 'ease-out' });
  const squeeze = play(grab.root, [
    { transform: held, filter: dark },
    { offset: .14, transform: 'translate(0px, 10px) rotate(-7deg) scale(.965)' },
    { offset: .34, transform: held },
    { offset: .54, transform: 'translate(0px, 12px) rotate(-7.5deg) scale(.955)' },
    { offset: .74, transform: 'translate(0px, 4px) rotate(-6.5deg) scale(.985)' },
    { transform: 'translate(0px, 6px) rotate(-6.5deg) scale(.975)', filter: 'grayscale(1) brightness(.32) contrast(1.15)' }
  ], { duration: 800 });
  const throb = play(rig, [
    { transform: 'translate(0px, 0px) rotate(0deg) scale(1)' },
    { offset: .12, transform: 'translate(-10px, 6px) rotate(-.9deg) scale(1.03)' },
    { offset: .22, transform: 'translate(9px, -5px) rotate(.8deg) scale(1.012)' },
    { offset: .34, transform: 'translate(-6px, 4px) rotate(-.5deg) scale(1)' },
    { offset: .5, transform: 'translate(8px, 5px) rotate(.7deg) scale(1.035)' },
    { offset: .6, transform: 'translate(-9px, -6px) rotate(-.8deg) scale(1.012)' },
    { offset: .72, transform: 'translate(6px, 3px) rotate(.5deg) scale(1)' },
    { offset: .86, transform: 'translate(-3px, -2px) rotate(-.3deg) scale(1)' },
    { transform: 'translate(0px, 0px) rotate(0deg) scale(1)' }
  ], { duration: 800 });
  if (!await settled(id, choke, squeeze, throb)) return;
  // ...and drags you in. The hand stays where it is, holding you; everything else rushes past it
  // into the doorway: zoom, a slide towards the gap, a stretch and radial streaks. It is dark and
  // blurred before the face is enlarged enough to break into pixels (at most ~1.9× its size here).
  const gapBox = copy.querySelector('.door-gap').getBoundingClientRect();
  const streaks = element('div', undefined, 'pull-streaks');
  const reachOut = Math.hypot(innerWidth, innerHeight) * 2;
  Object.assign(streaks.style, { left: gapBox.left + gapBox.width / 2 - reachOut / 2 + 'px', top: gapBox.top + gapBox.height * .58 - reachOut / 2 + 'px', width: reachOut + 'px', height: reachOut + 'px' });
  rig.insertBefore(streaks, vignette);
  const stretched = (fx, fy, scale, sx, sy) => focusOn(bounds, fx, fy, scale).replace(/scale\(([^)]+)\)$/, `scale(${scale * sx}, ${scale * sy})`);
  const drag = play(copy, [
    { transform: stretched(.62, .43, near * 1.18, 1, 1), filter: 'grayscale(1) brightness(.9) blur(0px)' },
    { offset: .5, transform: stretched(.63, .55, near * 1.55, .97, 1.07), filter: 'grayscale(1) brightness(.5) blur(3px)' },
    { transform: stretched(.63, .64, near * 2.2, .92, 1.16), filter: 'grayscale(1) brightness(0) blur(8px)' }
  ], { duration: 700, easing: 'cubic-bezier(.6,0,.9,.45)' });
  const rush = play(streaks, [
    { opacity: 0, transform: 'scale(.45) rotate(0deg)' },
    { offset: .3, opacity: .85 },
    { opacity: 0, transform: 'scale(1.9) rotate(5deg)' }
  ], { duration: 700, easing: 'ease-in' });
  const hold = play(grab.root, [
    { transform: 'translate(0px, 6px) rotate(-6.5deg) scale(.975)', filter: 'grayscale(1) brightness(.32) contrast(1.15)' },
    { offset: .5, transform: 'translate(-5px, 2px) rotate(-6deg) scale(.99)' },
    { offset: .75, filter: 'grayscale(1) brightness(.24) contrast(1.15)' },
    { transform: 'translate(0px, -4px) rotate(-6deg) scale(1)', filter: 'grayscale(1) brightness(0) contrast(1.15)' }
  ], { duration: 700, easing: 'ease-in' });
  // The vignette box is 170% of the screen; 0.62 is the smallest scale that still covers it all.
  const blackout = play(vignette, [{ opacity: 1, transform: 'scale(.84)' }, { opacity: 1, transform: 'scale(.62)' }], { duration: 700, easing: 'ease-in' });
  if (!await settled(id, drag, rush, hold, blackout)) return;

  // d) Inside: the camera falls past the walls, hits the bottom, and something types to you.
  const scene = element('div', undefined, 'fall-scene');
  const shaft = element('div', undefined, 'fall-shaft');
  const light = element('div', undefined, 'fall-light');
  const noise = element('canvas', undefined, 'fall-noise'); noise.width = 160; noise.height = 90;
  const hud = element('div', '● REC  CAM_09 / SEÑAL PERDIDA', 'fall-hud');
  const text = element('p', undefined, 'fall-text');
  const letters = [...'Te estábamos esperando.'].map(char => { const letter = element('span', char); text.append(letter); return letter; });
  scene.append(shaft, light, noise, hud, text); $('#door-passage').append(scene);
  startStatic(noise); hiss(2.2);
  const fall = 2300; const impact = .4;
  const inside = play(scene, [
    { offset: 0, opacity: 0, transform: 'translateY(0px)', filter: 'brightness(1)' },
    { offset: .06, opacity: 1 },
    { offset: impact, transform: 'translateY(0px)', filter: 'brightness(1)' },
    { offset: impact + .03, transform: 'translateY(34px)', filter: 'brightness(.28)' },
    { offset: impact + .08, transform: 'translateY(-10px)', filter: 'brightness(.55)' },
    { offset: impact + .13, transform: 'translateY(0px)', filter: 'brightness(1)' },
    { offset: .9, opacity: 1 },
    { offset: 1, opacity: 0, transform: 'translateY(0px)', filter: 'brightness(1)' }
  ], { duration: fall });
  play(shaft, [
    { offset: 0, backgroundPosition: '0px 0px, 0px 0px', transform: 'rotate(-3deg)', easing: 'cubic-bezier(.45,0,1,1)' },
    { offset: impact, backgroundPosition: '0px -1700px, 0px -2900px', transform: 'rotate(10deg)' },
    { offset: impact + .05, backgroundPosition: '0px -1730px, 0px -2950px', transform: 'rotate(8deg)' },
    { offset: 1, backgroundPosition: '0px -1730px, 0px -2950px', transform: 'rotate(9deg)', filter: 'brightness(.5)' }
  ], { duration: fall });
  play(light, [
    { offset: 0, transform: 'translateY(130%)', opacity: 0 },
    { offset: .08, opacity: 1 }, { offset: .2, transform: 'translateY(-160%)', opacity: 1 },
    { offset: .2001, transform: 'translateY(130%)' }, { offset: .27, transform: 'translateY(130%)' },
    { offset: .37, transform: 'translateY(-160%)', opacity: .7 }, { offset: .38, opacity: 0 },
    { offset: 1, transform: 'translateY(-160%)', opacity: 0 }
  ], { duration: fall });
  letters.forEach((letter, i) => play(letter, [{ opacity: 0 }, { opacity: 1 }], { delay: fall * (impact + .1) + i * 40, duration: 40 }));
  if (!await settled(id, inside)) return;
  markDoorSceneSeen();
  cancelDoorPassage(); location.hash = 'interior'; unveil();
}
// The interior fades up out of the black instead of cutting straight to the lit room.
function unveil() {
  const veil = $('#scene-veil'); veil.hidden = false;
  const hide = () => { veil.hidden = true; };
  if (typeof veil.animate !== 'function') { hide(); return; }
  veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 550, easing: 'ease-out' }).finished.then(hide, hide);
  setTimeout(hide, 1000);
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && passageActive) { cancelDoorPassage(); $('.threshold-enter').focus(); }
});
// Phones have no Escape: a quiet "saltar" appears after 2 s, and a double tap anywhere skips too.
let skipTimer = 0;
function armSkip(id) {
  clearTimeout(skipTimer);
  skipTimer = setTimeout(() => { if (passageActive && passageId === id) $('#scene-skip').hidden = false; }, 2000);
}
function skipPassage() { if (!passageActive) return; markDoorSceneSeen(); cancelDoorPassage(); location.hash = 'interior'; }
function markDoorSceneSeen() { doorSceneSeen = true; try { localStorage.setItem(doorSceneKey, 'seen'); } catch {} }
$('#scene-skip').addEventListener('click', skipPassage);
let lastTap = { time: -Infinity, x: 0, y: 0 };
$('#door-passage').addEventListener('pointerup', event => {
  const now = performance.now();
  if (now - lastTap.time < 350 && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 40) { lastTap.time = -Infinity; skipPassage(); return; }
  lastTap = { time: now, x: event.clientX, y: event.clientY };
});
window.addEventListener('resize', () => { if (passageActive) { cancelDoorPassage(); location.hash = 'interior'; } });
motionQuery.addEventListener('change', () => { if (passageActive) { cancelDoorPassage(); location.hash = 'interior'; } });

// The descent: a long way down that keeps asking you to turn back. Its backdrop is a lattice of
// static drawn once into three tiles that alternate (grain, never a flash); the eye strips slip a
// little as you scroll. Everything holds still with calma or reduced motion.
let descentTimer = 0;
let descentFrame = 0;
let descentReady = false;
function descentNoise() {
  if (descentReady) return;
  const view = $('#view-descenso'); const size = 192;
  for (let frame = 0; frame < 3; frame++) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
    const context = canvas.getContext('2d'); if (!context) return;
    const image = context.createImageData(size, size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = Math.abs(x - size / 2), dy = Math.abs(y - size / 2), d = dx + dy, ring = d % 96;
      const lit = (ring > 30 && ring < 56) || d < 12 || (dx < 1.5 && d > 72) || (dy < 1.5 && d > 72);
      const v = lit && Math.random() < .55 ? 38 + Math.random() * 92 : 0; const i = (y * size + x) * 4;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = v; image.data[i + 3] = 255;
    }
    context.putImageData(image, 0, 0);
    view.style.setProperty('--noise-' + frame, `url(${canvas.toDataURL('image/png')})`);
  }
  descentReady = true;
}
function startDescent() {
  descentNoise(); clearInterval(descentTimer);
  if (!omensEnabled || motionQuery.matches) return;
  descentTimer = setInterval(() => {
    if (document.hidden) return;
    const view = $('#view-descenso'); view.classList.remove('noise-' + descentFrame);
    descentFrame = (descentFrame + 1) % 3; view.classList.add('noise-' + descentFrame);
  }, 140);
}
function stopDescent() { clearInterval(descentTimer); descentTimer = 0; }
window.addEventListener('scroll', () => {
  if (document.body.dataset.page !== 'descenso' || !omensEnabled || motionQuery.matches) return;
  document.querySelectorAll('.eye-strip').forEach((strip, i) => strip.style.setProperty('--shift', `${Math.round(Math.sin(scrollY / 90 + i * 1.7) * 14)}px`));
}, { passive: true });
$('#omens-toggle').addEventListener('click', () => { if (document.body.dataset.page === 'descenso') startDescent(); });

// The statue (#estatua): a marble bust (Poly Haven "Marble Bust 01", CC0) rendered in Blender as a
// 48-frame turntable, drawn here as a monochrome phosphor triad screen. It turns slowly; move the
// pointer over it and it turns its face towards you. Still, facing you, with calma or reduced motion.
const statue = { image: null, data: null, frame: 0, timer: 0, follow: null, lastPointer: -Infinity };
const STATUE = { frames: 48, cols: 8, w: 168, h: 224 };
function loadStatue() {
  if (statue.image) return;
  statue.image = new Image();
  statue.image.onload = () => {
    const canvas = document.createElement('canvas'); canvas.width = statue.image.width; canvas.height = statue.image.height;
    const context = canvas.getContext('2d'); if (!context) return;
    context.drawImage(statue.image, 0, 0); statue.data = context.getImageData(0, 0, canvas.width, canvas.height);
    drawStatue();
  };
  statue.image.src = 'assets/statue-turntable.png';
}
function drawStatue() {
  const canvas = $('#statue-canvas'); if (!canvas || !statue.data) return;
  const context = canvas.getContext('2d'); if (!context) return;
  const W = canvas.width, H = canvas.height, cell = 5, cols = Math.floor(W / cell), rows = Math.floor(H / cell);
  const f = ((Math.round(statue.frame) % STATUE.frames) + STATUE.frames) % STATUE.frames;
  const ox = (f % STATUE.cols) * STATUE.w, oy = Math.floor(f / STATUE.cols) * STATUE.h, sheetW = statue.data.width, px = statue.data.data;
  context.fillStyle = '#000'; context.fillRect(0, 0, W, H);
  const back = Math.max(0, 1 - Math.abs(f - 24) / 3.5); const carving = back > 0 ? statueCarving(cols, rows) : null;
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    const sx = ox + Math.floor((col + .5) / cols * STATUE.w), sy = oy + Math.floor((row + .5) / rows * STATUE.h);
    let l = px[(sy * sheetW + sx) * 4] / 255; if (l < .03) continue;
    l = Math.min(1, Math.pow(l * 1.7, .85));
    if (carving && carving[row * cols + col]) l *= 1 - .8 * back;
    const x = col * cell, y = row * cell;
    for (let k = 0; k < 3; k++) { const v = Math.round(255 * l * [.82, 1, .9][k]); context.fillStyle = `rgb(${v},${v},${v * .97})`; context.fillRect(x + k * 1.67, y, 1.25, cell - 1.4); }
  }
}
// A 5×7 dot font for the one word carved into the nape: V I G I L I A.
const carvedGlyphs = { V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'], I: ['1', '1', '1', '1', '1', '1', '1'], G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'], L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'], A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'] };
let carvedMask = null;
function statueCarving(cols, rows) {
  if (carvedMask && carvedMask.cols === cols && carvedMask.rows === rows) return carvedMask.cells;
  const cells = new Uint8Array(cols * rows); const word = 'VIGILIA';
  const width = [...word].reduce((sum, letter) => sum + carvedGlyphs[letter][0].length, 0) + word.length - 1;
  let x = Math.round(cols * .47 - width / 2); const top = Math.round(rows * .355);
  for (const letter of word) {
    const glyph = carvedGlyphs[letter];
    glyph.forEach((line, y) => [...line].forEach((bit, dx) => { if (bit === '1') cells[(top + y) * cols + x + dx] = 1; }));
    x += glyph[0].length + 1;
  }
  carvedMask = { cols, rows, cells }; return cells;
}
function startStatue() {
  loadStatue(); drawStatue(); clearInterval(statue.timer); statue.enteredAt = performance.now();
  if (!omensEnabled || motionQuery.matches) { statue.frame = 0; drawStatue(); return; }
  statue.timer = setInterval(() => {
    if (document.hidden) return;
    if (performance.now() - statue.lastPointer < 2500 && statue.follow !== null) {
      const diff = ((statue.follow - statue.frame + STATUE.frames * 1.5) % STATUE.frames) - STATUE.frames / 2;
      statue.frame += Math.sign(diff) * Math.min(Math.abs(diff), 1);
    } else statue.frame = (statue.frame + .5) % STATUE.frames;
    drawStatue();
    const still = performance.now() - Math.max(statue.enteredAt, statue.lastPointer);
    if (still > 9000 && Math.round(statue.frame) % STATUE.frames === 0) scare('dientes', { key: 'estatua' });
  }, 110);
}
function stopStatue() { clearInterval(statue.timer); statue.timer = 0; }
$('#statue-canvas').addEventListener('pointermove', event => {
  if (!omensEnabled || motionQuery.matches) return;
  const box = event.currentTarget.getBoundingClientRect(); const x = (event.clientX - box.left) / box.width * 2 - 1;
  // Frame 0 faces you; positive frames turn its face towards the right of the screen.
  statue.follow = (Math.round(x * 8) + STATUE.frames) % STATUE.frames; statue.lastPointer = performance.now();
});
$('#omens-toggle').addEventListener('click', () => { if (document.body.dataset.page === 'estatua') startStatue(); });

// Screamers: a real scare, never a flicker. Silence first (the ambient drone drops out, when it is
// on), then one sudden cut to a face that punches in and shakes, with a distorted sting when sound
// is on, and a fall into black. On screen 820 ms at most, never more than once every 25 s, never in
// the first 15 s of a visit, never with calma or reduced motion; each trigger fires once per session.
const scareImages = { dientes: 'images/c2f15d46dadaea0d78573a3436c1f21d.png', cara: 'assets/cutouts/presence-face.png', pasillo: 'images/2483130d0df7e07e5d073b244c4f0aad.png' };
const pageStart = performance.now();
let lastScare = -Infinity;
let scareBusy = false;
let scaresWarm = false;
function scareAllowed() {
  return omensEnabled && !motionQuery.matches && !document.hidden && !passageActive && !scareBusy &&
    performance.now() - pageStart > 15000 && performance.now() - lastScare > 25000;
}
function scareOnce(key) {
  try { if (sessionStorage.getItem('estacion09-susto-' + key)) return false; sessionStorage.setItem('estacion09-susto-' + key, '1'); } catch {}
  return true;
}
function duckAmbient(ms) {
  if (!ambient || audio?.state !== 'running') return;
  const level = ambient.gain.gain, now = audio.currentTime;
  level.cancelScheduledValues(now); level.setTargetAtTime(0, now, .06);
  level.setTargetAtTime(ambient.volume, now + ms / 1000, .8);
}
function scareSound() {
  if (!ambient || audio?.state !== 'running') return;
  const ctx = audio, t = ctx.currentTime;
  const master = ctx.createGain(); master.gain.setValueAtTime(.0001, t);
  master.gain.exponentialRampToValueAtTime(.5, t + .012); master.gain.exponentialRampToValueAtTime(.0001, t + .85);
  master.connect(ctx.destination);
  const shaper = ctx.createWaveShaper(); const curve = new Float32Array(1024);
  for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh((i / 512 - 1) * 6);
  shaper.curve = curve;
  const tone = ctx.createBiquadFilter(); tone.type = 'lowpass';
  tone.frequency.setValueAtTime(5200, t); tone.frequency.exponentialRampToValueAtTime(480, t + .7);
  shaper.connect(tone); tone.connect(master);
  [196, 207.6, 293, 415].forEach((frequency, i) => {
    const oscillator = ctx.createOscillator(); oscillator.type = i % 2 ? 'sawtooth' : 'square';
    oscillator.frequency.setValueAtTime(frequency, t); oscillator.frequency.exponentialRampToValueAtTime(frequency * .55, t + .8);
    const gain = ctx.createGain(); gain.gain.value = .22; oscillator.connect(gain); gain.connect(shaper);
    oscillator.start(t); oscillator.stop(t + .9);
  });
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * .6), ctx.sampleRate); const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
  const noise = ctx.createBufferSource(); noise.buffer = buffer;
  const band = ctx.createBiquadFilter(); band.type = 'bandpass'; band.frequency.value = 1800; band.Q.value = .7;
  const noiseGain = ctx.createGain(); noiseGain.gain.value = .6; noise.connect(band); band.connect(noiseGain); noiseGain.connect(master); noise.start(t);
  const thump = ctx.createOscillator(); thump.frequency.setValueAtTime(70, t); thump.frequency.exponentialRampToValueAtTime(32, t + .35);
  const thumpGain = ctx.createGain(); thumpGain.gain.setValueAtTime(.7, t); thumpGain.gain.exponentialRampToValueAtTime(.001, t + .4);
  thump.connect(thumpGain); thumpGain.connect(master); thump.start(t); thump.stop(t + .45);
  setTimeout(() => master.disconnect(), 1300);
}
function scare(kind = 'dientes', { key = null, delay = 0, force = false } = {}) {
  const allowed = force ? omensEnabled && !motionQuery.matches && !document.hidden && !scareBusy : scareAllowed();
  if (!allowed || (key && !scareOnce(key))) return false;
  scareBusy = true; lastScare = performance.now();
  if (!scaresWarm) { scaresWarm = true; for (const src of Object.values(scareImages)) { const image = new Image(); image.src = src; } }
  duckAmbient(delay + 1600);
  setTimeout(() => {
    if (!omensEnabled || motionQuery.matches || document.hidden) { scareBusy = false; return; }
    dismissOmen();
    const screamer = $('#screamer'); const image = screamer.querySelector('img'); const shake = screamer.querySelector('.screamer-shake');
    screamer.dataset.kind = kind; image.src = scareImages[kind] || scareImages.dientes;
    screamer.hidden = false;
    if (typeof screamer.showPopover === 'function') screamer.showPopover(); else screamer.removeAttribute('popover');
    scareSound();
    if (typeof image.animate === 'function') {
      image.animate([{ transform: 'scale(1.42)' }, { offset: .12, transform: 'scale(1)', easing: 'linear' }, { offset: .78, transform: 'scale(1.07)' }, { transform: 'scale(1.13)' }], { duration: 820, easing: 'cubic-bezier(.2,.9,.3,1)' });
      shake.animate([{ translate: '0 0' }, { translate: '-16px 9px' }, { translate: '14px -8px' }, { translate: '-10px 6px' }, { translate: '8px -5px' }, { translate: '-4px 3px' }, { translate: '0 0' }], { duration: 520, easing: 'steps(6)' });
      shake.animate([{ filter: 'brightness(1)' }, { offset: .76, filter: 'brightness(1)' }, { filter: 'brightness(0)' }], { duration: 820 });
    }
    setTimeout(() => {
      if (typeof screamer.hidePopover === 'function' && screamer.matches(':popover-open')) screamer.hidePopover();
      screamer.hidden = true; scareBusy = false;
    }, 820);
  }, delay);
  return true;
}
// The descent answers when you reach "[Intentando...]".
if ('IntersectionObserver' in window) {
  const trying = $('.descent-panel.c4');
  if (trying) new IntersectionObserver((entries, observer) => {
    if (entries.some(entry => entry.isIntersecting) && scare('dientes', { key: 'descenso', delay: 1400 })) observer.disconnect();
  }, { threshold: .6 }).observe(trying);
}

// Room 0 (#control): the console of the station. Log in with the operator's name and the word of
// vigil; then a few orders tell the rest of the story. "apagar" ends it.
const consoleState = { step: 'name', tries: 0, booted: false, confirm: false };
function consoleLine(text, cls = '') {
  const line = element('p', text, 'terminal-line ' + cls); $('#terminal-log').append(line);
  line.scrollIntoView({ block: 'nearest' }); return line;
}
function consolePrompt(label) { $('#terminal-prompt').textContent = label; }
function bootConsole() {
  if (consoleState.booted) { $('#terminal-input').focus({ preventScroll: true }); return; }
  consoleState.booted = true; $('#terminal-log').replaceChildren();
  if (state.ended) {
    ['ESTACIÓN 09 · SALA 0', 'La consola está apagada.', 'Aun así, alguien escribe al otro lado:', 'gracias por quedarte.'].forEach(text => consoleLine(text, 'dim'));
    $('#terminal-input').disabled = true; consolePrompt('—'); return;
  }
  ['ESTACIÓN 09 · SALA 0 · CONSOLA v0.98', 'conexión desde: pasillo B / cámara 09', 'identifíquese.'].forEach(text => consoleLine(text, 'dim'));
  consoleState.step = 'name'; consolePrompt('OPERADOR>'); $('#terminal-input').type = 'text';
  $('#terminal-input').focus({ preventScroll: true });
}
const consoleOrders = {
  ayuda: () => ['órdenes: estado · registro · camaras · presencias · frecuencia · escuchar · apagar · salir'],
  estado: () => ['nodo 009: en línea desde 1998.', 'integridad: 27 %.', `presencias: ${state.ended ? 2 : 1}. operadores: 0.`],
  registro: () => ['03:33 — Ya no estoy en la silla. Ya no estoy en el pasillo.', '03:33 — Estoy de cara a la pared y alguien me ha dado la vuelta.', '03:33 — Si lees esto: no la mires de frente.', '03:33 — No apagues la estación. Si la apagas, alguien tiene que quedarse dentro.'],
  camaras: () => ['CAM 07 · pasillo A · sin señal', 'CAM 08 · pasillo C · sin señal', 'CAM 09 · pasillo B · hay alguien. es usted.'],
  presencias: () => ['OPERADOR 09 · en la estatua', 'VISITANTE · usted', ...state.guests.slice(-6).map(guest => `${guest.alias} · estuvo aquí`)],
  frecuencia: () => ['09.8 · no es una voz. es el espacio entre dos voces.'],
  escuchar: () => { const wasOn = Boolean(ambient); $('#sound-toggle').click(); return ['receptor: ' + (wasOn ? 'apagado.' : 'encendido.')]; },
  eco: () => ['eco…', 'eco…', 'eco…'],
  umbra: () => ['la sombra ya sabe su nombre.'],
  1998: () => ['el año en que todo se detuvo. sigue detenido.'],
  vigilia: () => ['ya está despierto. no hace falta repetirlo.'],
  salir: () => { location.hash = 'archivo'; return []; },
  apagar: () => { consoleState.confirm = true; consolePrompt('¿APAGAR? (s/n)>'); return ['¿Apagar la estación? Alguien tendrá que quedarse dentro.']; }
};
function endStation() {
  $('#terminal-input').disabled = true; consolePrompt('—');
  ['apagando receptor…', 'apagando cámaras…', 'apagando operador…'].forEach((text, i) => setTimeout(() => consoleLine(text, 'dim'), 500 + i * 700));
  setTimeout(() => {
    $('.terminal').classList.add('powering-off');
    scare('cara', { key: 'final', delay: 900, force: true });
  }, 2800);
  setTimeout(() => {
    state.ended = true; save(); renderArchive(); renderGuests();
    $('.terminal').classList.remove('powering-off'); $('#terminal-log').replaceChildren();
    ['La estación ya no necesita operador.', 'Ahora le tiene a usted.'].forEach(text => consoleLine(text, 'final'));
  }, 5200);
}
$('#terminal-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = $('#terminal-input'); const raw = input.value.trim(); const value = raw.toLocaleLowerCase('es'); input.value = '';
  if (!raw) return;
  consoleLine(`${$('#terminal-prompt').textContent} ${consoleState.step === 'word' ? '•'.repeat(raw.length) : raw}`, 'echo');
  if (consoleState.step === 'name') {
    if (value === 'operador_09') { consoleState.step = 'word'; consolePrompt('PALABRA DE VIGILIA>'); input.type = 'password'; consoleLine('nombre reconocido. su nombre no es suyo, pero sirve.', 'dim'); }
    else consoleLine('Ese no es el nombre. Lo firmó usted mismo hace un momento.');
    return;
  }
  if (consoleState.step === 'word') {
    if (value === 'vigilia') { consoleState.step = 'orders'; input.type = 'text'; consolePrompt('09>'); consoleLine('Bienvenido de nuevo, operador 09. Lleva 27 años fuera de turno.'); consoleLine('escriba «ayuda».', 'dim'); }
    else { consoleState.tries++; consoleLine('No es la palabra. La estatua no se la ha enseñado.'); if (consoleState.tries >= 3) scare('dientes', { key: 'consola' }); }
    return;
  }
  if (consoleState.confirm) {
    consoleState.confirm = false; consolePrompt('09>');
    if (value === 's' || value === 'si' || value === 'sí') endStation(); else consoleLine('Prudente.');
    return;
  }
  const order = consoleOrders[value];
  (order ? order() : ['Orden desconocida. No responda si escucha su nombre.']).forEach(text => consoleLine(text));
});

// The station asks to be heard before you go in: once per session, only at the threshold.
// "ESCUCHES" turns on the existing ambient sound (a click, so nothing plays by itself);
// "entrar en silencio" or Escape leaves it off.
const listenKey = 'estacion09-escuchado';
function maybeListen() {
  let heard = false; try { heard = sessionStorage.getItem(listenKey) === '1'; } catch {}
  if (heard || document.body.dataset.page !== 'inicio') return;
  const cover = $('#listen-cover'); cover.hidden = false; $('#listen-yes').focus({ preventScroll: true });
}
function closeListen(withSound) {
  const cover = $('#listen-cover'); if (cover.hidden || cover.classList.contains('leaving')) return;
  try { sessionStorage.setItem(listenKey, '1'); } catch {}
  if (withSound && !ambient) $('#sound-toggle').click();
  const done = () => { cover.hidden = true; cover.classList.remove('leaving'); $('#portal-title').setAttribute('tabindex', '-1'); $('#portal-title').focus({ preventScroll: true }); };
  if (motionQuery.matches) { done(); return; }
  cover.classList.add('leaving'); setTimeout(done, 900);
}
$('#listen-yes').addEventListener('click', () => closeListen(true));
$('#listen-no').addEventListener('click', () => closeListen(false));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('#listen-cover').hidden) closeListen(false); });

renderArchive(); renderGuests(); renderDoor(); route(); applyMotionPreference(); maybeListen();

// Interior extension contract. Keep entrance and passage implementation independent.
window.EstacionInterior = Object.freeze({
  view: () => document.body.dataset.page,
  effects: () => omensEnabled && !motionQuery.matches && !document.hidden,
  sound: () => ambient && audio?.state === 'running' ? audio : null,
  apparition: () => showOmen(true),
  inspect: showVision,
  subsoil: () => openGate(2),
});
