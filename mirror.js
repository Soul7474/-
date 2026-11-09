(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const video = $('#reflection');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let quiet = false;
  try { quiet = localStorage.getItem('estacion09-omens') === 'quiet'; } catch {}
  let stream = null;
  let generation = 0;
  let effectTimer;
  let effectEnd;
  function calmUI() {
    const enabled = quiet || reduce.matches;
    document.body.dataset.quiet = String(enabled);
    $('#quiet-mirror').setAttribute('aria-pressed', String(enabled));
    $('#quiet-mirror').textContent = enabled ? 'invocar' : 'calma';
    $('#quiet-mirror').disabled = reduce.matches;
    if (reduce.matches) $('#quiet-mirror').textContent = 'en calma';
    if (enabled) clearEffect();
  }
  function clearEffect() {
    clearTimeout(effectTimer); clearTimeout(effectEnd);
    delete document.body.dataset.haunted;
  }
  function planEffect() {
    clearEffect();
    if (quiet || reduce.matches || document.hidden) return;
    effectTimer = setTimeout(() => {
      if (quiet || reduce.matches || document.hidden || !['live', 'fiction'].includes(document.body.dataset.mode)) return;
      document.body.dataset.haunted = 'true';
      effectEnd = setTimeout(() => { delete document.body.dataset.haunted; }, 1300);
    }, 8500);
  }
  function stopTracks() {
    generation++; clearEffect();
    const current = stream; stream = null;
    if (current) current.getTracks().forEach(track => track.stop());
    video.pause(); video.srcObject = null; video.hidden = true;
  }
  function state(mode, text) {
    document.body.dataset.mode = mode;
    $('#camera-status').textContent = text;
    $('#enable-camera').disabled = mode === 'pending' || mode === 'live';
    $('#stop-camera').hidden = mode !== 'live';
    $('#cancel-camera').hidden = mode !== 'pending';
    $('#dead-signal').hidden = mode !== 'fiction';
  }
  function closed(message = 'La cámara está apagada.') {
    stopTracks(); state('idle', message);
    $('#receiver-state').textContent = 'cámara apagada';
    $('#presence-line').textContent = '';
  }
  function fiction(message) {
    stopTracks(); state('fiction', message);
    $('#receiver-state').textContent = 'señal ficticia · sin cámara';
    $('#presence-line').textContent = 'la señal no venía de tu cámara.';
    planEffect();
  }
  async function enableCamera() {
    if (document.hidden || ['pending', 'live'].includes(document.body.dataset.mode)) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      fiction('Cámara no disponible. Se necesita HTTPS o localhost. Puedes continuar sin cámara.'); return;
    }
    stopTracks(); const request = generation;
    state('pending', 'El navegador te pedirá permiso. Puedes rechazarlo o cancelar.');
    $('#receiver-state').textContent = 'esperando permiso';
    $('#presence-line').textContent = '';
    try {
      const incoming = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15, max: 24 } } });
      if (request !== generation || document.hidden) { incoming.getTracks().forEach(track => track.stop()); return; }
      stream = incoming; video.srcObject = incoming; video.hidden = false;
      await video.play();
      if (request !== generation || document.hidden) return;
      state('live', 'Cámara activa solo en este dispositivo. Puedes apagarla en cualquier momento.');
      $('#receiver-state').textContent = 'cámara activa · espejo local';
      $('#presence-line').textContent = 'el otro lado te devuelve la mirada.';
      incoming.getVideoTracks().forEach(track => track.addEventListener('ended', () => {
        if (stream === incoming) fiction('La cámara se ha desconectado. Esta emisión es ficticia.');
      }));
      planEffect();
    } catch (error) {
      if (request !== generation) return;
      const message = error.name === 'NotAllowedError' ? 'No se ha accedido a la cámara. Esta emisión es ficticia.'
        : error.name === 'NotFoundError' ? 'No hay una cámara disponible. Esta emisión es ficticia.'
        : error.name === 'NotReadableError' ? 'La cámara no está disponible o está ocupada. Esta emisión es ficticia.'
        : 'No se pudo abrir la cámara. Esta emisión es ficticia.';
      fiction(message);
    }
  }
  $('#enable-camera').addEventListener('click', enableCamera);
  $('#without-camera').addEventListener('click', () => fiction('Modo sin cámara. Esta emisión es ficticia.'));
  $('#stop-camera').addEventListener('click', () => closed('Cámara apagada. La imagen no se ha grabado ni enviado.'));
  $('#cancel-camera').addEventListener('click', () => closed('Solicitud cancelada. La cámara permanece apagada.'));
  $('#leave-mirror').addEventListener('click', () => closed());
  $('#quiet-mirror').addEventListener('click', () => {
    quiet = !quiet; try { localStorage.setItem('estacion09-omens', quiet ? 'quiet' : 'active'); } catch {}
    calmUI(); if (!quiet && ['live', 'fiction'].includes(document.body.dataset.mode)) planEffect();
  });
  reduce.addEventListener('change', calmUI);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closed('Espejo cerrado. Cámara apagada.'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) closed('La cámara se apagó al ocultar esta página.'); });
  window.addEventListener('pagehide', () => closed());
  calmUI();
})();
