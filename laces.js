// Laces, drawn from the same geometry as the app (Shared/LacesView.swift, 200 x 200 space):
// a baseball whose red seams are its eyebrows.
(function () {
  const INK = '#0A1410', SEAM = '#E23D28', GOLD = '#F5C518', BLUSH = 'rgba(232,107,89,.55)';

  // (inner end, outer end) brow offsets per mood; positive = lower.
  const BROW = { idle: [0, 0], ready: [10, -6], contact: [6, 2], hit: [-8, -2], homeRun: [-12, -6],
                 strike: [-10, 8], wink: [-6, -2], sleep: [4, 6], giggle: [-8, -2] };

  const bez = (a, b, c, d, t) => {
    const u = 1 - t;
    return [u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0],
            u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1]];
  };
  const tan = (a, b, c, d, t) => {
    const u = 1 - t;
    return [3*u*u*(b[0]-a[0]) + 6*u*t*(c[0]-b[0]) + 3*t*t*(d[0]-c[0]),
            3*u*u*(b[1]-a[1]) + 6*u*t*(c[1]-b[1]) + 3*t*t*(d[1]-c[1])];
  };
  const f = n => +n.toFixed(2);

  function seam(s, din, dout) {
    const p0 = [100 + s*16, 66 + din], c1 = [p0[0] + s*12, p0[1] - 10];
    const p1 = [100 + s*46, 54 + dout], c2 = [p1[0] - s*8, p1[1] - 4];
    const c3 = [p1[0] + s*8, p1[1] + 4], c4 = [100 + s*76, 86], p2 = [100 + s*70, 128];
    const line = `M${f(p0[0])} ${f(p0[1])}C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p1[0])} ${f(p1[1])}` +
                 `C${f(c3[0])} ${f(c3[1])} ${f(c4[0])} ${f(c4[1])} ${f(p2[0])} ${f(p2[1])}`;
    let st = '';
    for (const [a, b, c, d] of [[p0, c1, c2, p1], [p1, c3, c4, p2]]) {
      for (let i = 1; i <= 4; i++) {
        const t = i / 5, p = bez(a, b, c, d, t), g = tan(a, b, c, d, t);
        const len = Math.max(0.001, Math.hypot(g[0], g[1]));
        const n = [-g[1] / len, g[0] / len], bk = [-g[0] / len * 3, -g[1] / len * 3];
        st += `M${f(p[0] - n[0]*6 + bk[0])} ${f(p[1] - n[1]*6 + bk[1])}L${f(p[0])} ${f(p[1])}` +
              `L${f(p[0] + n[0]*6 + bk[0])} ${f(p[1] + n[1]*6 + bk[1])}`;
      }
    }
    return `<path d="${line}" stroke="${SEAM}" stroke-width="4.5" stroke-linecap="round" fill="none"/>` +
           `<path d="${st}" stroke="${SEAM}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  }

  function star(cx, cy, r, fill) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      d += (i ? 'L' : 'M') + f(cx + rr * Math.cos(a)) + ' ' + f(cy + rr * Math.sin(a));
    }
    return `<path d="${d}Z" fill="${fill}"/>`;
  }

  const stroke = (d, w = 5) => `<path d="${d}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;

  function eyes(mood, gx, gy, blink) {
    let out = '';
    for (const x of [76, 124]) {
      const y = 100;
      switch (mood) {
        case 'idle': case 'ready': {
          const h = 17 * (mood === 'ready' ? 0.72 : 1) * (blink ? 0.12 : 1);
          out += `<ellipse cx="${f(x + gx*4)}" cy="${f(y + 2 + gy*4)}" rx="6.5" ry="${f(h/2)}" fill="${INK}"/>`;
          break;
        }
        case 'wink':
          out += x < 100 ? `<ellipse cx="${x}" cy="${y + 2}" rx="6.5" ry="8.5" fill="${INK}"/>`
                         : stroke(`M${x-10} ${y+3}Q${x} ${y-8} ${x+10} ${y+3}`);
          break;
        case 'sleep': out += stroke(`M${x-9} ${y+1}Q${x} ${y+9} ${x+9} ${y+1}`, 4.5); break;
        case 'hit': case 'giggle': out += stroke(`M${x-11} ${y+4}Q${x} ${y-12} ${x+11} ${y+4}`); break;
        case 'contact': {
          const s = x < 100 ? 1 : -1;
          out += stroke(`M${x-10*s} ${y-9}L${x+8*s} ${y}L${x-10*s} ${y+9}`);
          break;
        }
        case 'homeRun': out += star(x, y, 15, GOLD); break;
        case 'strike': {
          let d = '';
          for (let i = 0; i <= 40; i++) {
            const a = i * 0.45, r = 1 + i * 0.3;
            d += (i ? 'L' : 'M') + f(x + r*Math.cos(a)) + ' ' + f(y + r*Math.sin(a));
          }
          out += stroke(d, 3);
          break;
        }
      }
    }
    return out;
  }

  function mouth(mood) {
    switch (mood) {
      case 'idle': return stroke('M88 128Q100 140 112 128', 4.5);
      case 'ready': return stroke('M90 130L110 130', 4.5);
      case 'hit': case 'giggle':
        return `<path d="M84 124Q100 150 116 124Z" fill="${INK}"/><ellipse cx="100" cy="136.5" rx="8" ry="3.5" fill="${SEAM}"/>`;
      case 'homeRun':
        return `<ellipse cx="100" cy="134" rx="15" ry="14" fill="${INK}"/><ellipse cx="100" cy="141" rx="9" ry="5" fill="${SEAM}"/>`;
      case 'contact':
        return `<rect x="86" y="126" width="28" height="10" rx="4" fill="#fff" stroke="${INK}" stroke-width="3.5"/>` +
               `<path d="M95 126V136M105 126V136" stroke="${INK}" stroke-width="2"/>`;
      case 'strike': return stroke('M86 132Q91 126 96 132Q101 138 106 132Q111 126 116 132', 4);
      case 'sleep': return `<ellipse cx="100" cy="130.5" rx="4" ry="3.5" fill="${INK}"/>`;
      case 'wink': return stroke('M86 126Q102 140 114 124', 4.5);
    }
    return '';
  }

  // One frame of Laces as SVG markup.
  function svg(mood = 'idle', opts = {}) {
    const [din, dout] = BROW[mood] || [0, 0];
    const gx = opts.gx || 0, gy = opts.gy || 0, id = opts.id || 'l';
    let back = '';
    if (mood === 'homeRun') {
      for (const [x, y, r] of [[22, 40, 11], [176, 34, 9], [182, 118, 7], [18, 132, 8], [150, 8, 6]]) back += star(x, y, r, GOLD);
    }
    if (mood === 'contact') {
      let d = '';
      for (let i = 0; i < 10; i++) {
        const a = i * Math.PI / 5 + 0.2;
        d += `M${f(100 + Math.cos(a)*92)} ${f(100 + Math.sin(a)*92)}L${f(100 + Math.cos(a)*112)} ${f(100 + Math.sin(a)*112)}`;
      }
      back += `<path d="${d}" stroke="#EFEBDF" stroke-width="5" stroke-linecap="round"/>`;
    }
    const cheeks = ['hit', 'homeRun', 'wink', 'giggle'].includes(mood)
      ? `<ellipse cx="60" cy="120" rx="9" ry="5" fill="${BLUSH}"/><ellipse cx="140" cy="120" rx="9" ry="5" fill="${BLUSH}"/>` : '';
    const z = mood === 'sleep'
      ? `<g fill="#EFEBDF" font-family="ui-rounded, system-ui, sans-serif" font-weight="900"><text x="150" y="40" font-size="22">z</text><text x="168" y="22" font-size="15">z</text></g>` : '';
    return `<svg viewBox="-16 -16 232 232" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><radialGradient id="${id}g" cx="76" cy="64" r="150" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFFDF5"/><stop offset=".5" stop-color="#EFEBDF"/><stop offset="1" stop-color="#D6D1BF"/>
      </radialGradient></defs>
      ${opts.shadow === false ? '' : '<ellipse cx="100" cy="188" rx="46" ry="6" fill="rgba(0,0,0,.35)"/>'}
      ${back}
      <circle cx="100" cy="100" r="80" fill="url(#${id}g)" stroke="${INK}" stroke-width="5"/>
      ${seam(-1, din, dout)}${seam(1, din, dout)}
      ${eyes(mood, gx, gy, opts.blink)}${mouth(mood)}${cheeks}${z}
    </svg>`;
  }

  window.Laces = { svg };
})();
