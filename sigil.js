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
    const defs = node('defs', {});
    const engraving = node('filter', { id: 'engrave', x: '-10%', y: '-10%', width: '120%', height: '120%' });
    engraving.append(
      node('feTurbulence', { type: 'fractalNoise', baseFrequency: .035, numOctaves: 2, seed: 7, result: 'warp' }),
      node('feDisplacementMap', { in: 'SourceGraphic', in2: 'warp', scale: 4, result: 'wobbly' }),
      node('feTurbulence', { type: 'fractalNoise', baseFrequency: .9, numOctaves: 1, seed: 2, result: 'grain' }),
      node('feColorMatrix', { in: 'grain', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 -3.6', result: 'holes' }),
      node('feComposite', { in: 'wobbly', in2: 'holes', operator: 'in' })
    );
    defs.append(engraving, node('path', { id: 'sigil-ring-path', d: 'M200 4a196 196 0 1 1 0 392a196 196 0 1 1 0-392' }));
    svg.append(defs);
    const lines = node('g', { fill: 'none', stroke: '#e8e8e8', 'stroke-width': 1.2, filter: 'url(#engrave)' });
    lines.append(node('circle', { cx: 200, cy: 200, r: 185, 'stroke-dasharray': '2 5' }));
    for (const radius of [150, 128]) lines.append(node('circle', { cx: 200, cy: 200, r: radius }));
    for (let tick = 0; tick < 49; tick++) {
      const angle = (-90 + tick * 360 / 49) * Math.PI / 180;
      const point = radius => [200 + radius * Math.cos(angle), 200 + radius * Math.sin(angle)].map(value => value.toFixed(2)).join(' ');
      lines.append(node('path', { d: `M${point(147)}L${point(153)}`, class: 'tick' }));
    }
    const ring = node('text', { fill: '#bdbdbd', stroke: 'none', 'font-size': 9, 'letter-spacing': '.3em', class: 'sigil-inscription' });
    const inscription = node('textPath', { href: '#sigil-ring-path' });
    inscription.textContent = 'SOLVE ET COAGULA · VISITA INTERIORA TERRAE · '.repeat(4);
    ring.append(inscription); lines.append(ring);
    if (index === 0) lines.append(node('circle', { cx: 200, cy: 200, r: 3, fill: '#e8e8e8' }));
    else {
      const points = Array.from({ length: 7 }, (_, step) => position(step * 2 % 7, 120).map(value => value.toFixed(2)).join(',')).join(' ');
      lines.append(node('polygon', { points, 'stroke-width': 1.5, class: 'heptagram', opacity: .5 }));
      const serpent = Array.from({ length: 180 }, (_, point) => {
        const angle = point * 2 * Math.PI / 180;
        const radius = 64 + 9 * Math.sin(7 * angle);
        return `${point ? 'L' : 'M'}${(200 + radius * Math.cos(angle)).toFixed(2)} ${(200 + radius * Math.sin(angle)).toFixed(2)}`;
      }).join(' ') + ' Z';
      lines.append(node('path', { d: serpent, 'stroke-width': 2.6, class: 'serpent' }));
    }
    svg.append(lines);
    for (let i = 0; i < 7; i++) {
      const [x, y] = position(i, 170);
      const active = index === i + 1;
      const glyph = node('text', { x, y, fill: '#e8e8e8', stroke: 'none', 'font-size': active ? 40 : 30, opacity: active ? 1 : .55, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: active ? 'planet selected' : 'planet' });
      glyph.textContent = planets[i]; lines.append(glyph);
    }
    return svg;
  };
})();
