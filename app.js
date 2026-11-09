const $ = (selector) => document.querySelector(selector);
const storageKey = 'estacion09-v1';
let state = { level: 0, guests: [] };
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved) {
    state.level = [0, 1, 2].includes(saved.level) ? saved.level : 0;
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
  { id: 'salida', name: 'salida.txt', description: 'Una instrucción que todavía funciona.', size: '0.1 KB', level: 2, content: 'Puedes cerrar la conexión.\n\nEn el subsuelo hay un interruptor.\nBorrará tus accesos y los mensajes que hayas dejado en este navegador.\n\nNo va a impedir que vuelvas.\nPero esta vez la estación no te recordará.' }
];
function element(tag, text, className) { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; }
function renderArchive() {
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
}
let gateLevel = 1;
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
    showOmen();
    $('#password').setAttribute('aria-invalid', 'true'); $('#password').select(); return;
  }
  state.level = Math.max(state.level, gateLevel); save(); renderArchive();
  $('#password').removeAttribute('aria-invalid'); closeDialog($('#gate-dialog'));
  if (gateDestination === 'interior' && document.body.dataset.page === 'inicio') crossDoor();
  else location.hash = gateDestination;
  $('#log-whisper').textContent = 'la puerta se ha abierto_';
});
function showDocument(id) {
  const doc = documents.find(item => item.id === id); if (!doc) return;
  if (doc.level > state.level) { openGate(doc.level); return; }
  $('#document-title').textContent = doc.name;
  const body = $('#document-body'); releaseGIFs(body); body.replaceChildren();
  if (doc.image) { const img = element('img'); img.src = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'assets/corridor-still.jpg' : 'assets/corridor.gif'; img.alt = 'Imagen recuperada del pasillo B.'; body.append(img); }
  body.append(element('p', doc.content)); openDialog($('#document-dialog'));
}
document.addEventListener('click', event => {
  const entrance = event.target.closest('[data-cross-door]');
  if (entrance) { if (state.level >= 1) crossDoor(); else openGate(1, 'interior'); return; }
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
const viewNames = ['inicio', 'interior', 'archivo', 'fragmentos', 'transmisiones', 'visitantes', 'subsuelo'];
let currentView = '';
function route() {
  const target = location.hash.slice(1) || 'inicio';
  if (target === 'main') { $('#main').focus({ preventScroll: true }); return; }
  const name = viewNames.includes(target) ? target : 'inicio';
  if (name === 'subsuelo' && state.level < 2) {
    history.replaceState(null, '', '#inicio'); route(); openGate(2); return;
  }
  cancelDoorPassage();
  dismissOmen();
  document.body.dataset.page = name;
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
$('#guest-form').addEventListener('submit', event => {
  event.preventDefault(); const message = $('#guest-message').value.trim();
  if (!message) { $('#guest-status').textContent = 'El vacío no deja rastro. Escribe una señal.'; return; }
  state.guests.push({ alias: $('#guest-name').value.trim().slice(0, 32) || 'anónimo', message: message.slice(0, 500), date: new Date().toISOString() });
  state.guests = state.guests.slice(-30); save(); renderGuests(); $('#guest-form').reset();
  $('#guest-status').textContent = storageAvailable ? 'Señal guardada. La estación te recuerda.' : 'Señal recibida durante esta sesión. Este navegador no permite guardarla.';
});
for (const id of ['forget-button', 'reset-session']) $('#' + id).addEventListener('click', () => openDialog($('#reset-dialog')));
$('#confirm-reset').addEventListener('click', () => {
  state = { level: 0, guests: [] }; save(); stopAmbient(); closeDialog($('#reset-dialog')); location.hash = 'inicio'; location.reload();
});
let audio;
let ambient;
let transmissionNodes;
let transmissionTimer;
function audioContext() { audio ??= new (window.AudioContext || window.webkitAudioContext)(); return audio; }
function drone(volume) {
  const ctx = audioContext(); const gain = ctx.createGain(); gain.gain.value = volume; gain.connect(ctx.destination);
  const nodes = [48, 49.4, 96].map(frequency => { const oscillator = ctx.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = frequency; oscillator.connect(gain); oscillator.start(); return oscillator; });
  return { stop() { nodes.forEach(node => node.stop()); gain.disconnect(); } };
}
function stopAmbient() { ambient?.stop(); ambient = null; $('#sound-toggle').setAttribute('aria-pressed', 'false'); $('#sound-toggle').innerHTML = '<span aria-hidden="true">▥</span> SONIDO: DESACTIVADO'; }
$('#sound-toggle').addEventListener('click', async () => {
  if (ambient) { stopAmbient(); return; }
  try { await audioContext().resume(); ambient = drone(.025); $('#sound-toggle').setAttribute('aria-pressed', 'true'); $('#sound-toggle').innerHTML = '<span aria-hidden="true">▥</span> SONIDO: ACTIVADO'; }
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
  } catch { $('#transmission-status').textContent = 'El receptor de audio no está disponible. Puedes leer la transcripción.'; }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopAmbient(); if (transmissionNodes) stopTransmission(); } });
let seconds = 0;
setInterval(() => {
  seconds++; const stamp = new Date(seconds * 1000).toISOString().slice(11, 19);
  $('#session-clock').textContent = stamp + ' / SESIÓN LOCAL';
  $('#camera-clock').textContent = '03:33:' + String((9 + Math.floor(seconds / 3)) % 60).padStart(2, '0');
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
function showOmen() {
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
  showOmen();
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
function refreshGIF(image) {
  const visible = watchedGIFs.get(image);
  const allowed = visible && !document.hidden && omensEnabled && !motionQuery.matches &&
    (image.dataset.explicit !== 'true' || image.dataset.playing === 'true');
  const source = allowed ? image.dataset.gif : image.dataset.still;
  if (image.getAttribute('src') !== source) image.setAttribute('src', source);
}
function refreshGIFs() { for (const image of watchedGIFs.keys()) refreshGIF(image); }
const gifObserver = new IntersectionObserver(entries => {
  for (const entry of entries) { watchedGIFs.set(entry.target, entry.isIntersecting); refreshGIF(entry.target); }
}, { threshold: .05 });
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

updateOmenControl();

// Zoom around the actual dark opening of the existing photograph.
let passageAnimation = null;
let passageActive = false;
function cancelDoorPassage() {
  passageActive = false;
  passageAnimation?.cancel(); passageAnimation = null;
  $('#door-passage').hidden = true;
  $('#entry-portal').removeAttribute('aria-busy');
  document.querySelectorAll('[data-cross-door]').forEach(button => button.disabled = false);
}
async function crossDoor() {
  if (passageActive) return;
  if (motionQuery.matches || !omensEnabled) { location.hash = 'interior'; return; }
  dismissOmen();
  const original = $('.door-recording img');
  const bounds = original.getBoundingClientRect();
  if (!bounds.width || !bounds.height || typeof original.animate !== 'function') { location.hash = 'interior'; return; }
  const passage = $('#door-passage'); const image = passage.querySelector('img');
  passageActive = true; passage.hidden = false;
  $('#entry-portal').setAttribute('aria-busy', 'true');
  document.querySelectorAll('[data-cross-door]').forEach(button => button.disabled = true);
  Object.assign(image.style, { left: bounds.left + 'px', top: bounds.top + 'px', width: bounds.width + 'px', height: bounds.height + 'px', transformOrigin: '65% 48%' });
  const dx = innerWidth / 2 - (bounds.left + bounds.width * .65);
  const dy = innerHeight / 2 - (bounds.top + bounds.height * .48);
  const scale = Math.max(innerWidth / (bounds.width * .18), innerHeight / (bounds.height * .7));
  passageAnimation = image.animate([
    { transform: 'translate(0px, 0px) scale(1)', filter: 'grayscale(1) brightness(1)' },
    { offset: .78, transform: `translate(${dx}px, ${dy}px) scale(${scale * .8})`, filter: 'grayscale(1) brightness(.45)' },
    { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, filter: 'grayscale(1) brightness(0)' }
  ], { duration: 1600, easing: 'cubic-bezier(.62,.06,.52,1)', fill: 'forwards' });
  try { await passageAnimation.finished; } catch { return; }
  if (!passageActive) return;
  cancelDoorPassage(); location.hash = 'interior';
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && passageActive) { cancelDoorPassage(); $('.threshold-enter').focus(); }
});
window.addEventListener('resize', () => { if (passageActive) { cancelDoorPassage(); location.hash = 'interior'; } });
motionQuery.addEventListener('change', () => { if (passageActive) { cancelDoorPassage(); location.hash = 'interior'; } });

renderArchive(); renderGuests(); route(); applyMotionPreference();
