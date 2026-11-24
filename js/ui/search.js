// Instant search: a weighted match across name, brand, type, category,
// concerns and shades, plus the overlay UI.
import { $, esc, money, debounce } from '../utils.js';
import { icon } from './icons.js';
import { productArt } from '../art.js';
import { PRODUCTS, CATEGORIES, CONCERNS, categoryName } from '../data/products.js';

const norm = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s₹]/g, ' ');

const INDEX = PRODUCTS.map((p) => ({
  p,
  name: norm(p.name),
  brand: norm(p.brand),
  meta: norm([p.type, categoryName(p.category), ...p.concerns.map((c) => CONCERNS.find((x) => x.slug === c)?.name ?? c), ...(p.shades ?? []).map((s) => s.name), p.short].join(' ')),
}));

export function search(query) {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return INDEX.map((row) => {
    let score = 0;
    for (const t of terms) {
      let hit = 0;
      if (row.name.includes(t)) hit = row.name.startsWith(t) || row.name.includes(` ${t}`) ? 10 : 6;
      else if (row.brand.includes(t)) hit = 5;
      else if (row.meta.includes(t)) hit = 3;
      else if (t.length > 3 && t.endsWith('s') && (row.name + row.meta).includes(t.slice(0, -1))) hit = 1; // "serums" → "serum"
      if (!hit) return null; // every term must match something
      score += hit;
    }
    return { p: row.p, score: score + row.p.rating };
  })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.p);
}

const POPULAR = ['sunscreen', 'lip tint', 'serum', 'acne', 'palette', 'gift'];

export function renderSearchPanel() {
  $('#search-panel').innerHTML = `
    <div class="search">
      <form class="search__bar" role="search" data-form="search">
        ${icon.search}
        <label class="sr-only" for="search-input">Search products</label>
        <input id="search-input" name="q" type="search" placeholder="Search sunscreen, tints, ‘acne’…" autocomplete="off" data-autofocus>
        <button type="button" class="icon-btn" data-action="close-panel" aria-label="Close search">${icon.close}</button>
      </form>
      <div class="search__body" data-search-results aria-live="polite"></div>
    </div>`;
  const input = $('#search-input');
  const results = $('[data-search-results]');
  const draw = () => {
    const q = input.value.trim();
    results.innerHTML = q ? resultsMarkup(q) : idleMarkup();
  };
  input.addEventListener('input', debounce(draw, 90));
  draw();
}

function idleMarkup() {
  return `<p class="search__label">Popular right now</p>
    <div class="chips">${POPULAR.map((t) => `<button class="chip" data-action="search-term" data-term="${t}">${t}</button>`).join('')}</div>
    <p class="search__label">Browse</p>
    <div class="chips">${CATEGORIES.map((c) => `<a class="chip chip--soft" href="#/shop/${c.slug}" style="--chip:${c.tint}">${c.name}</a>`).join('')}</div>`;
}

function resultsMarkup(q) {
  const found = search(q);
  if (!found.length) {
    return `<div class="search__empty"><p>No matches for “${esc(q)}”.</p><p>Try “cream”, “lip” or a concern like “dryness”.</p></div>`;
  }
  return `<p class="search__label">${found.length} result${found.length === 1 ? '' : 's'}</p>
    <ul class="search__list">${found
      .slice(0, 6)
      .map(
        (p) => `<li><a href="#/product/${p.id}" class="search__hit">
          <span class="search__art">${productArt(p)}</span>
          <span><small>${esc(p.brand)}</small>${highlight(p.name, q)}<em>${money(p.price)}</em></span>
        </a></li>`,
      )
      .join('')}</ul>
    <a class="btn btn--ghost btn--block" href="#/search?q=${encodeURIComponent(q)}">See all results ${icon.arrow}</a>`;
}

function highlight(text, q) {
  let out = esc(text);
  for (const t of q.split(/\s+/).filter((w) => w.length > 1)) {
    out = out.replace(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>');
  }
  return `<strong>${out}</strong>`;
}
