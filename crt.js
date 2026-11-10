(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pending = new Set();
  let running = false;
  let clone;
  let blurred;
  const random = (min, max) => min + Math.random() * (max - min);
  function later(action, delay) {
    const timer = setTimeout(() => { pending.delete(timer); action(); }, delay);
    pending.add(timer);
  }
  function clearFrame() {
    clone?.remove(); clone = undefined;
    blurred?.classList.remove('bloom'); blurred = undefined;
    const bar = document.querySelector('.bar-top'); if (bar) bar.style.removeProperty('opacity');
  }
  function screen() {
    let content = document.querySelector('#screen');
    if (!content) {
      const main = document.querySelector('main'); if (!main) return;
      content = document.createElement('div'); content.id = 'screen';
      content.append(...main.childNodes); main.append(content);
    }
    return content;
  }
  function slice() {
    const source = screen(); if (!source) return;
    const rect = source.getBoundingClientRect();
    if (!rect.height || rect.bottom <= 0 || rect.top >= innerHeight) return;
    clone?.remove();
    clone = source.cloneNode(true); clone.id = 'screen-glitch';
    clone.setAttribute('aria-hidden', 'true'); clone.inert = true;
    // The visual copy must never duplicate form IDs, focus targets or labels.
    clone.querySelectorAll('[id], [name], [for], [autofocus]').forEach(item => {
      for (const attribute of ['id', 'name', 'for', 'autofocus']) item.removeAttribute(attribute);
    });
    const start = Math.max(0, -rect.top) / rect.height * 100;
    const end = Math.min(rect.height, innerHeight - rect.top) / rect.height * 100;
    const height = Math.min(random(8, 25), end - start);
    const top = random(start, Math.max(start, end - height));
    Object.assign(clone.style, {
      top: `${rect.top}px`, left: `${rect.left}px`, width: `${rect.width}px`,
      clipPath: `inset(${top}% 0 ${100 - top - height}% 0)`,
      transform: `translateX(${(Math.random() < .5 ? -1 : 1) * random(12, 40)}px)`
    });
    document.body.append(clone);
    later(() => { clone?.remove(); clone = undefined; }, random(120, 260));
  }
  function bloom() {
    const candidates = [...(screen()?.querySelectorAll('h1,h2,p') || [])].filter(item => {
      const rect = item.getBoundingClientRect(); return item.textContent.trim() && rect.bottom > 0 && rect.top < innerHeight;
    });
    if (!candidates.length) return;
    blurred?.classList.remove('bloom');
    blurred = candidates[Math.floor(Math.random() * candidates.length)]; blurred.classList.add('bloom');
    later(() => { blurred?.classList.remove('bloom'); blurred = undefined; }, random(150, 300));
  }
  function bar() {
    const top = document.querySelector('.bar-top'); if (!top) return;
    top.style.opacity = '.6'; later(() => top.style.removeProperty('opacity'), 100);
  }
  function repeat(action, min, max) {
    later(() => {
      if (!running) return;
      if (!document.body.classList.contains('waiting')) action();
      repeat(action, min, max);
    }, random(min, max));
  }
  function stop() { running = false; pending.forEach(clearTimeout); pending.clear(); clearFrame(); }
  function start() {
    if (running || reduced.matches || document.hidden) return;
    running = true; repeat(slice, 6000, 15000); repeat(bloom, 8000, 20000); repeat(bar, 5000, 12000);
  }
  reduced.addEventListener('change', () => { stop(); start(); });
  document.addEventListener('visibilitychange', () => { stop(); start(); });
  document.addEventListener('occult:render', () => { stop(); start(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') clearFrame(); });
  window.addEventListener('scroll', () => { clone?.remove(); clone = undefined; }, { passive: true });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', start);
  start();
})();
