(() => {
  'use strict';
  const ns = 'http://www.w3.org/2000/svg';
  const planets = ['☽', '☿', '♀', '☉', '♂', '♃', '♄'];
  const names = ['Luna', 'Mercurio', 'Venus', 'Sol', 'Marte', 'Júpiter', 'Saturno'];
  function node(name, attributes) {
    const element = document.createElementNS(ns, name);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
    return element;
  }
  function position(index, radius) {
    const angle = (-90 + index * 360 / 7) * Math.PI / 180;
    return [200 + radius * Math.cos(angle), 200 + radius * Math.sin(angle)];
  }
  window.renderSigil = function renderSigil(gateIndex) {
    const index = Math.max(0, Math.min(7, Math.trunc(gateIndex) || 0));
    const svg = node('svg', { viewBox: '0 0 400 400', class: 'sigil', role: 'img', 'aria-label': index ? `Sigilo de ${names[index - 1]}` : 'Sigilo del umbral' });
    const lines = node('g', { fill: 'none', stroke: '#e8e8e8', 'stroke-width': 1.2 });
    lines.append(node('circle', { cx: 200, cy: 200, r: 185, 'stroke-dasharray': '2 5' }));
    for (const radius of [150, 128]) lines.append(node('circle', { cx: 200, cy: 200, r: radius }));
    if (index === 0) lines.append(node('circle', { cx: 200, cy: 200, r: 3, fill: '#e8e8e8' }));
    else {
      const points = Array.from({ length: 7 }, (_, step) => position(step * 2 % 7, 120).map(value => value.toFixed(2)).join(',')).join(' ');
      lines.append(node('polygon', { points, 'stroke-width': 1.5, class: 'heptagram' }));
    }
    svg.append(lines);
    for (let i = 0; i < 7; i++) {
      const [x, y] = position(i, 170);
      const active = index === i + 1;
      const glyph = node('text', { x, y, fill: '#e8e8e8', stroke: 'none', 'font-size': active ? 34 : 26, opacity: active ? 1 : .4, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: active ? 'planet selected' : 'planet' });
      glyph.textContent = planets[i]; svg.append(glyph);
    }
    return svg;
  };
})();
