// Small, dependency-free helpers shared across the app.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ESC[ch]);

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const money = (n) => inr.format(Math.round(n));

export function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/** FNV-1a string hash — stable seeds for generated art and sample reviews. */
export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 seeded PRNG. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function stars(rating, { count = null, size = '' } = {}) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  const label = `Rated ${r.toFixed(1)} out of 5${count != null ? `, ${count} reviews` : ''}`;
  return `<span class="rating ${size}"><span class="stars" style="--r:${r}" role="img" aria-label="${label}"></span>${
    count != null ? `<span class="rating__count">${r.toFixed(1)} <span>(${count})</span></span>` : ''
  }</span>`;
}

/** Parse "#/shop/skincare?sort=new" → { path: ['shop','skincare'], query: URLSearchParams } */
export function parseHash(hash = location.hash) {
  const raw = hash.replace(/^#\/?/, '');
  const [pathPart, queryPart = ''] = raw.split('?');
  const path = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
  return { path, query: new URLSearchParams(queryPart) };
}

export function buildHash(path, query) {
  const qs = query && [...query.keys()].length ? `?${query.toString()}` : '';
  return `#/${path.map(encodeURIComponent).join('/')}${qs}`;
}

export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Safe localStorage wrapper — the store must work in private windows too. */
export const storage = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — state lives in memory only */
    }
  },
};
