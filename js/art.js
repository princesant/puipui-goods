// Illustrated product "photography". Every product gets a consistent studio
// render built from its `art` palette, in three views:
//   hero    — product on a soft podium (cards, gallery image 1)
//   texture — a swatch/dollop of the formula with a mini product
//   flatlay — product laid on a coloured set with props
// If a product has an `image` URL, real photography is used instead.

import { esc, hashStr, rng } from './utils.js';

let uid = 0;

/* ---------- colour helpers ---------- */
const hexToRgb = (h) => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbToHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
export const mix = (a, b, t) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
};
const light = (c, t) => mix(c, '#ffffff', t);
const dark = (c, t) => mix(c, '#2b1330', t);

/* ---------- per-SVG gradient registry ---------- */
function kit(id) {
  const defs = [];
  let n = 0;
  const next = () => `${id}-${n++}`;
  return {
    defs,
    /** Horizontal shading that makes a flat shape read as a cylinder. */
    cyl(color, gloss = 0.5) {
      const g = next();
      defs.push(`<linearGradient id="${g}" x1="0" x2="1">
        <stop offset="0" stop-color="${dark(color, 0.1)}"/>
        <stop offset=".16" stop-color="${light(color, gloss * 0.6)}"/>
        <stop offset=".4" stop-color="${color}"/>
        <stop offset=".82" stop-color="${dark(color, 0.1)}"/>
        <stop offset="1" stop-color="${dark(color, 0.22)}"/></linearGradient>`);
      return `url(#${g})`;
    },
    vert(top, bottom) {
      const g = next();
      defs.push(`<linearGradient id="${g}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`);
      return `url(#${g})`;
    },
    radial(inner, outer, cx = 0.35, cy = 0.3) {
      const g = next();
      defs.push(`<radialGradient id="${g}" cx="${cx}" cy="${cy}" r=".8"><stop offset="0" stop-color="${inner}"/><stop offset="1" stop-color="${outer}"/></radialGradient>`);
      return `url(#${g})`;
    },
  };
}

const sparkle = (x, y, s, fill, o = 1) =>
  `<path transform="translate(${x} ${y}) scale(${s})" opacity="${o}" fill="${fill}" d="M0-12C1.6-3.4 3.4-1.6 12 0 3.4 1.6 1.6 3.4 0 12-1.6 3.4-3.4 1.6-12 0-3.4-1.6-1.6-3.4 0-12Z"/>`;

const shine = (x, y, w, h, o = 0.45) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="#fff" opacity="${o}"/>`;

function labelText(a, brand, x, y, { size = 22, brandSize = 9, gap = 22, maxWidth = 150 } = {}) {
  const word = esc(a.word || '');
  const fs = Math.min(size, (maxWidth / Math.max(word.length, 4)) * 1.9);
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="${brandSize}" font-weight="700" letter-spacing="2.6" fill="${a.ink}" opacity=".75">${esc(brand).toUpperCase()}</text>
  ${word ? `<text x="${x}" y="${y + gap}" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-weight="500" font-size="${fs}" fill="${a.ink}">${word}</text>` : ''}`;
}

/* ---------- shapes (drawn around x=200, resting on y≈402) ---------- */
const SHAPES = {
  jar(a, k, p) {
    const s = a.small ? 0.78 : 1;
    return `<g transform="translate(${200 - 200 * s} ${402 - 402 * s}) scale(${s})">
      <rect x="100" y="268" width="200" height="134" rx="30" fill="${k.cyl(a.body)}"/>
      <rect x="106" y="260" width="188" height="16" rx="7" fill="${dark(a.body, 0.12)}"/>
      <rect x="94" y="192" width="212" height="76" rx="24" fill="${k.cyl(a.cap, 0.7)}"/>
      ${shine(112, 202, 176, 7, 0.35)}
      ${shine(116, 284, 11, 96, 0.5)}
      ${labelText(a, p.brand, 200, 320, { size: 26, gap: 30 })}
    </g>`;
  },
  tube(a, k, p) {
    return `<g>
      <rect x="132" y="92" width="136" height="24" rx="5" fill="${dark(a.body, 0.08)}"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${140 + i * 16}" y="96" width="2" height="16" fill="${dark(a.body, 0.18)}" opacity=".5"/>`).join('')}
      <path d="M138 112H262L249 338Q200 352 151 338Z" fill="${k.cyl(a.body)}"/>
      <path d="M151 336Q200 350 249 336L242 356H158Z" fill="${dark(a.body, 0.1)}"/>
      <rect x="158" y="352" width="84" height="50" rx="12" fill="${k.cyl(a.cap, 0.7)}"/>
      ${shine(150, 130, 10, 180, 0.45)}
      ${labelText(a, p.brand, 200, 200, { size: 26, gap: 32, maxWidth: 104 })}
      <rect x="178" y="262" width="44" height="3" rx="1.5" fill="${a.ink}" opacity=".35"/>
    </g>`;
  },
  pump(a, k, p) {
    return `<g>
      <rect x="164" y="128" width="72" height="26" rx="9" fill="${k.cyl(a.cap, 0.7)}"/>
      <rect x="226" y="134" width="46" height="11" rx="5" fill="${dark(a.cap, 0.08)}"/>
      <rect x="192" y="152" width="16" height="30" fill="${dark(a.cap, 0.15)}"/>
      <rect x="174" y="178" width="52" height="38" rx="9" fill="${k.cyl(a.cap, 0.7)}"/>
      <rect x="136" y="210" width="128" height="192" rx="36" fill="${k.cyl(a.body)}"/>
      <rect x="152" y="258" width="96" height="100" rx="12" fill="${a.label}" opacity=".9"/>
      ${shine(148, 228, 10, 150, 0.5)}
      ${labelText(a, p.brand, 200, 296, { size: 22, gap: 28, maxWidth: 88 })}
    </g>`;
  },
  dropper(a, k, p) {
    return `<g>
      <rect x="176" y="116" width="48" height="96" rx="24" fill="${k.cyl(a.cap, 0.8)}"/>
      <rect x="164" y="204" width="72" height="48" rx="8" fill="${k.cyl(dark(a.cap, 0.08), 0.6)}"/>
      <rect x="148" y="244" width="104" height="158" rx="26" fill="${k.cyl(a.body)}" opacity=".95"/>
      <rect x="156" y="300" width="88" height="94" rx="20" fill="${a.fill}" opacity=".7"/>
      <rect x="148" y="288" width="104" height="60" fill="${a.label}" opacity=".92"/>
      ${shine(158, 256, 9, 132, 0.6)}
      ${labelText(a, p.brand, 200, 308, { size: 22, gap: 26, maxWidth: 92 })}
    </g>`;
  },
  toner(a, k, p) {
    return `<g>
      <rect x="162" y="110" width="76" height="66" rx="12" fill="${k.cyl(a.cap, 0.7)}"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${168 + i * 12}" y="116" width="2" height="54" fill="${dark(a.cap, 0.15)}" opacity=".4"/>`).join('')}
      <rect x="170" y="172" width="60" height="10" fill="${dark(a.body, 0.14)}"/>
      <rect x="144" y="178" width="112" height="224" rx="22" fill="${k.cyl(a.body)}"/>
      <rect x="158" y="236" width="84" height="116" rx="8" fill="${a.label}" opacity=".95"/>
      ${shine(154, 196, 10, 190, 0.5)}
      ${labelText(a, p.brand, 200, 280, { size: 24, gap: 30, maxWidth: 80 })}
    </g>`;
  },
  compact(a, k, p) {
    return `<g>
      <path d="M80 312V346A120 40 0 0 0 320 346V312Z" fill="${k.cyl(a.body)}"/>
      <ellipse cx="200" cy="346" rx="120" ry="40" fill="none"/>
      <rect x="80" y="318" width="240" height="6" fill="${dark(a.body, 0.12)}" opacity=".6"/>
      <ellipse cx="200" cy="312" rx="120" ry="40" fill="${k.radial(light(a.cap, 0.5), a.cap === '#FFFFFF' ? '#F1E6EA' : dark(a.cap, 0.05))}"/>
      <ellipse cx="200" cy="312" rx="52" ry="17" fill="none" stroke="${a.ink}" stroke-opacity=".18" stroke-width="2"/>
      <ellipse cx="168" cy="300" rx="52" ry="10" fill="#fff" opacity=".45"/>
      <g transform="translate(200 316) scale(1 .5)">
        <text text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="26" fill="${a.ink}" opacity=".8">${esc(a.word)}</text>
      </g>
      <circle cx="200" cy="230" r="0" fill="none"/>
    </g>`;
  },
  palette(a, k, p) {
    const pans = a.pans ?? [a.fill, light(a.fill, 0.3), dark(a.fill, 0.2)];
    const cells = pans.slice(0, 9).map((c, i) => {
      const x = 112 + (i % 3) * 62, y = 204 + Math.floor(i / 3) * 62;
      return `<rect x="${x}" y="${y}" width="52" height="52" rx="11" fill="${k.radial(light(c, 0.25), c, 0.3, 0.25)}"/>
        <ellipse cx="${x + 18}" cy="${y + 14}" rx="10" ry="5" fill="#fff" opacity="${i % 4 === 1 ? 0.55 : 0.18}"/>`;
    });
    return `<g transform="rotate(-7 200 290)">
      <rect x="88" y="146" width="224" height="264" rx="22" fill="${k.vert(light(a.body, 0.4), dark(a.body, 0.06))}"/>
      <rect x="88" y="146" width="224" height="264" rx="22" fill="none" stroke="${dark(a.body, 0.12)}" stroke-width="2"/>
      <text x="200" y="182" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="20" fill="${a.ink}">${esc(a.word)}</text>
      <rect x="102" y="194" width="196" height="196" rx="14" fill="${dark(a.body, 0.07)}"/>
      ${cells.join('')}
    </g>`;
  },
  lipstick(a, k) {
    return `<g>
      <path d="M180 220V158Q186 130 220 112V220Z" fill="${k.cyl(a.fill, 0.6)}"/>
      ${shine(186, 160, 7, 52, 0.4)}
      <rect x="174" y="214" width="52" height="54" rx="4" fill="${k.cyl(a.cap, 0.8)}"/>
      <rect x="166" y="262" width="68" height="140" rx="8" fill="${k.cyl(a.body, 0.35)}"/>
      <rect x="166" y="262" width="68" height="10" fill="${k.cyl(a.cap, 0.8)}"/>
      ${shine(174, 282, 7, 104, 0.25)}
      <text transform="translate(206 340) rotate(-90)" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="20" fill="${a.ink}">${esc(a.word)}</text>
    </g>`;
  },
  tint(a, k) {
    return `<g>
      <rect x="172" y="96" width="56" height="138" rx="16" fill="${k.cyl(a.cap, 0.7)}"/>
      ${shine(180, 108, 7, 110, 0.4)}
      <rect x="168" y="226" width="64" height="176" rx="20" fill="${light(a.body, 0.2)}" opacity=".7"/>
      <rect x="176" y="234" width="48" height="160" rx="15" fill="${k.cyl(a.fill, 0.55)}"/>
      ${shine(182, 246, 7, 130, 0.55)}
      <text transform="translate(206 314) rotate(-90)" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="19" fill="#fff" opacity=".95">${esc(a.word)}</text>
    </g>`;
  },
  stick(a, k) {
    return `<g>
      <rect x="162" y="150" width="76" height="116" rx="34" fill="${k.cyl(a.fill, 0.6)}"/>
      <rect x="162" y="244" width="76" height="158" rx="20" fill="${k.cyl(a.body)}"/>
      <rect x="162" y="244" width="76" height="8" fill="${dark(a.body, 0.12)}"/>
      ${shine(172, 162, 8, 80, 0.45)}${shine(172, 264, 8, 120, 0.5)}
      <text transform="translate(206 330) rotate(-90)" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="22" fill="${a.ink}">${esc(a.word)}</text>
    </g>`;
  },
  mask(a, k, p) {
    const zig = Array.from({ length: 11 }, (_, i) => `L${118 + i * 16.4 + 8.2} ${i % 2 ? 128 : 122}`).join('');
    return `<g>
      <path d="M118 128${zig}L282 128V388Q282 402 268 402H132Q118 402 118 388Z" fill="${k.vert(light(a.body, 0.25), a.body)}"/>
      <rect x="118" y="146" width="164" height="2" fill="#fff" opacity=".6"/>
      <circle cx="200" cy="240" r="56" fill="${a.fill}"/>
      <path d="M178 236q8 8 16 0M206 236q8 8 16 0" stroke="${a.ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="174" cy="256" rx="9" ry="5" fill="#FF9CC4" opacity=".7"/><ellipse cx="226" cy="256" rx="9" ry="5" fill="#FF9CC4" opacity=".7"/>
      <path d="M194 262q6 5 12 0" stroke="${a.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${labelText(a, p.brand, 200, 330, { size: 26, gap: 30, maxWidth: 140 })}
      ${shine(128, 160, 8, 210, 0.35)}
    </g>`;
  },
  mist(a, k, p) {
    return `<g>
      <rect x="180" y="134" width="40" height="48" rx="10" fill="${k.cyl(a.cap, 0.7)}"/>
      <circle cx="214" cy="150" r="4" fill="${dark(a.cap, 0.3)}"/>
      <rect x="174" y="176" width="52" height="38" rx="9" fill="${k.cyl(a.cap, 0.7)}"/>
      <rect x="144" y="206" width="112" height="196" rx="50" fill="${k.cyl(a.body)}"/>
      ${shine(158, 230, 10, 140, 0.5)}
      ${labelText(a, p.brand, 200, 290, { size: 22, gap: 28, maxWidth: 90 })}
    </g>`;
  },
  sponge(a, k) {
    return `<g>
      <path transform="translate(54 30) rotate(14 200 300)" d="M200 196C236 196 262 270 262 320 262 362 236 392 200 392 164 392 138 362 138 320 138 270 164 196 200 196Z" fill="${k.radial(light(a.cap, 0.4), dark(a.cap, 0.08))}"/>
      <path d="M200 150C246 150 282 248 282 314 282 368 246 402 200 402 154 402 118 368 118 314 118 248 154 150 200 150Z" fill="${k.radial(light(a.body, 0.45), dark(a.body, 0.06))}"/>
      <ellipse cx="168" cy="228" rx="16" ry="30" fill="#fff" opacity=".35" transform="rotate(18 168 228)"/>
    </g>`;
  },
  brush(a, k) {
    return `<g transform="rotate(-24 200 300)">
      <path d="M178 196C162 150 170 106 200 90 230 106 238 150 222 196Z" fill="${k.vert(light(a.fill, 0.2), a.body)}"/>
      <rect x="176" y="190" width="48" height="62" rx="8" fill="${k.cyl(a.cap, 0.9)}"/>
      <rect x="182" y="246" width="36" height="168" rx="18" fill="${k.cyl(a.body, 0.7)}"/>
      ${shine(188, 256, 6, 140, 0.5)}
    </g>`;
  },
  box(a, k, p) {
    return `<g>
      <rect x="98" y="236" width="204" height="166" rx="10" fill="${k.cyl(a.body, 0.3)}"/>
      <rect x="86" y="204" width="228" height="48" rx="10" fill="${k.cyl(light(a.body, 0.12), 0.3)}"/>
      <rect x="188" y="204" width="24" height="198" fill="${k.cyl(a.cap, 0.4)}"/>
      <path d="M200 204C170 162 136 170 148 194 156 210 186 208 200 204Z" fill="${a.cap}" stroke="${dark(a.cap, 0.1)}" stroke-width="1.5"/>
      <path d="M200 204C230 162 264 170 252 194 244 210 214 208 200 204Z" fill="${a.cap}" stroke="${dark(a.cap, 0.1)}" stroke-width="1.5"/>
      <circle cx="200" cy="204" r="11" fill="${dark(a.cap, 0.06)}"/>
      <g transform="rotate(-8 140 330)">
        <rect x="112" y="300" width="64" height="40" rx="6" fill="#fff"/>
        <text x="144" y="325" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-size="13" fill="${dark(a.body, 0.3)}">${esc(a.word)}</text>
      </g>
    </g>`;
  },
};

/* ---------- scenes ---------- */
function heroScene(a, k, rand) {
  const sparkles = Array.from({ length: 3 }, () =>
    sparkle(60 + rand() * 280, 60 + rand() * 120, 0.6 + rand() * 0.9, '#fff', 0.9),
  ).join('');
  return {
    back: `<rect width="400" height="500" fill="${k.vert(light(a.bg, 0.35), a.bg)}"/>
      <circle cx="200" cy="268" r="156" fill="${light(a.bg, 0.55)}"/>
      <circle cx="${rand() > 0.5 ? 318 : 82}" cy="${110 + rand() * 40}" r="${26 + rand() * 18}" fill="${a.accent}" opacity=".55"/>
      ${sparkles}
      <ellipse cx="200" cy="420" rx="128" ry="16" fill="#2b1330" opacity=".08"/>
      <ellipse cx="200" cy="406" rx="96" ry="9" fill="#2b1330" opacity=".12"/>`,
    transform: '',
  };
}

function textureScene(a, k, rand, p) {
  const isColour = ['makeup', 'lips'].includes(p.category) && p.category !== 'tools';
  const c = a.swatch;
  const smear = isColour
    ? `<path d="M70 250C120 200 210 190 330 236" stroke="${c}" stroke-width="58" stroke-linecap="round" fill="none" opacity=".95"/>
       <path d="M96 318C150 286 230 280 312 306" stroke="${light(c, 0.15)}" stroke-width="34" stroke-linecap="round" fill="none" opacity=".8"/>
       <path d="M90 240C140 214 210 208 300 228" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".35"/>`
    : `<path d="M110 270C96 200 170 168 236 178 312 190 336 262 300 310 262 360 150 356 110 270Z" fill="${k.radial('#ffffff', c, 0.4, 0.35)}" stroke="${dark(c, 0.06)}" stroke-width="1.5"/>
       <path d="M150 230C176 206 224 204 252 220" stroke="#fff" stroke-width="10" stroke-linecap="round" fill="none" opacity=".8"/>
       <path d="M236 178C250 160 270 156 282 168" stroke="${k.radial('#ffffff', c)}" stroke-width="16" stroke-linecap="round" fill="none"/>`;
  const drops = Array.from({ length: 4 }, () => {
    const x = 60 + rand() * 280, y = 360 + rand() * 90, r = 4 + rand() * 7;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${isColour ? c : '#fff'}" opacity=".7"/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 3}" fill="#fff" opacity=".8"/>`;
  }).join('');
  return {
    back: `<rect width="400" height="500" fill="${k.vert(light(a.accent, 0.55), light(a.bg, 0.1))}"/>${smear}${drops}`,
    transform: 'translate(250 330) scale(.36) translate(-200 -260)',
    over: true,
  };
}

function flatlayScene(a, k, rand) {
  const props = Array.from({ length: 6 }, (_, i) => {
    const x = 30 + rand() * 340, y = 30 + rand() * 440, r = 10 + rand() * 26;
    return i % 2
      ? `<ellipse cx="${x}" cy="${y}" rx="${r * 1.4}" ry="${r * 0.7}" transform="rotate(${rand() * 180} ${x} ${y})" fill="${light(a.accent, 0.2)}" opacity=".9"/>`
      : `<circle cx="${x}" cy="${y}" r="${r}" fill="${light(a.bg, 0.5)}"/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 4}" fill="#fff" opacity=".7"/>`;
  }).join('');
  return {
    back: `<rect width="400" height="500" fill="${a.accent}"/>
      <rect x="-60" y="300" width="560" height="260" fill="${light(a.accent, 0.35)}" transform="rotate(-12 200 400)"/>${props}`,
    transform: 'translate(200 260) rotate(-16) scale(.92) translate(-200 -260)',
  };
}

/**
 * Render a product image.
 * @param {object} p product
 * @param {{view?: 'hero'|'texture'|'flatlay', shade?: string, className?: string}} opts
 */
export function productArt(p, { view = 'hero', shade = null, className = '' } = {}) {
  if (p.image && view === 'hero') {
    return `<img class="art ${className}" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`;
  }
  const id = `art${++uid}`;
  const k = kit(id);
  const a = { ...p.art };
  if (shade) {
    a.fill = shade;
    a.swatch = shade;
    if (p.art.shape === 'compact') a.swatch = shade;
  }
  const rand = rng(hashStr(p.id + view));
  const scene = view === 'texture' ? textureScene(a, k, rand, p) : view === 'flatlay' ? flatlayScene(a, k, rand) : heroScene(a, k, rand);
  const draw = SHAPES[a.shape] ?? SHAPES.jar;
  const product = draw(a, k, p);
  const shadow = `<filter id="${id}-sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="${view === 'flatlay' ? 12 : 0}" dy="${view === 'flatlay' ? 16 : 10}" stdDeviation="${view === 'flatlay' ? 10 : 12}" flood-color="#2b1330" flood-opacity="${view === 'flatlay' ? 0.22 : 0.14}"/></filter>`;
  const label = `${p.name}${view === 'texture' ? ' — texture' : view === 'flatlay' ? ' — styled' : ''}`;
  return `<svg class="art ${className}" viewBox="0 0 400 500" role="img" aria-label="${esc(label)}" preserveAspectRatio="xMidYMid slice">
    <defs>${shadow}${k.defs.join('')}</defs>
    ${scene.back}
    <g filter="url(#${id}-sh)" ${scene.transform ? `transform="${scene.transform}"` : ''}>${product}</g>
  </svg>`;
}

export const ART_VIEWS = ['hero', 'texture', 'flatlay'];
