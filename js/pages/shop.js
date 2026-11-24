// Collection listing with filters, sort and active-filter chips.
// Filter state lives in the URL query so links are shareable; changes use
// history.replaceState and re-render only the results, not the whole page.
import { esc, plural, buildHash } from '../utils.js';
import { productArt } from '../art.js';
import { CATEGORIES, CONCERNS, SKIN_TYPES, isOnSale, inStock } from '../data/products.js';
import { COLLECTIONS, getCollection, productsIn } from '../data/collections.js';
import { productCard } from '../ui/card.js';
import { icon } from '../ui/icons.js';
import { reveal } from '../ui/feedback.js';
import notFound from './notfound.js';

const PRICE_BANDS = [
  { slug: 'u500', name: 'Under ₹500', test: (p) => p.price < 500 },
  { slug: '500-1000', name: '₹500 – ₹1,000', test: (p) => p.price >= 500 && p.price <= 1000 },
  { slug: 'o1000', name: 'Over ₹1,000', test: (p) => p.price > 1000 },
];

const SORTS = [
  { slug: 'featured', name: 'Featured' },
  { slug: 'best', name: 'Best rated' },
  { slug: 'new', name: 'Newest' },
  { slug: 'price-asc', name: 'Price: low to high' },
  { slug: 'price-desc', name: 'Price: high to low' },
];

const list = (q, key) => (q.get(key) || '').split(',').filter(Boolean);

function readState(query) {
  return {
    category: list(query, 'category'),
    concern: list(query, 'concern'),
    skin: list(query, 'skin'),
    price: list(query, 'price'),
    sale: query.get('sale') === '1',
    instock: query.get('instock') === '1',
    sort: query.get('sort') || 'featured',
  };
}

function toQuery(s) {
  const q = new URLSearchParams();
  ['category', 'concern', 'skin', 'price'].forEach((k) => s[k].length && q.set(k, s[k].join(',')));
  if (s.sale) q.set('sale', '1');
  if (s.instock) q.set('instock', '1');
  if (s.sort !== 'featured') q.set('sort', s.sort);
  return q;
}

export function applyFilters(products, s) {
  let out = products.filter(
    (p) =>
      (!s.category.length || s.category.includes(p.category)) &&
      (!s.concern.length || s.concern.some((c) => p.concerns.includes(c))) &&
      (!s.skin.length || s.skin.some((k) => p.skin.includes(k) || p.skin.includes('all'))) &&
      (!s.price.length || s.price.some((b) => PRICE_BANDS.find((x) => x.slug === b)?.test(p))) &&
      (!s.sale || isOnSale(p)) &&
      (!s.instock || inStock(p)),
  );
  const by = {
    best: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    new: (a, b) => a.added - b.added,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    featured: (a, b) => b.badges.length - a.badges.length || b.reviewCount - a.reviewCount,
  }[s.sort];
  out = [...out].sort(by);
  // Sold-out items always sink to the bottom.
  return out.sort((a, b) => (b.stock > 0) - (a.stock > 0));
}

const LABELS = {
  category: (v) => CATEGORIES.find((c) => c.slug === v)?.name,
  concern: (v) => CONCERNS.find((c) => c.slug === v)?.name,
  skin: (v) => SKIN_TYPES.find((c) => c.slug === v)?.name,
  price: (v) => PRICE_BANDS.find((c) => c.slug === v)?.name,
};

function group(key, title, options, s, base, open = true) {
  const counts = (slug) =>
    base.filter((p) =>
      key === 'category' ? p.category === slug : key === 'concern' ? p.concerns.includes(slug) : key === 'skin' ? p.skin.includes(slug) || p.skin.includes('all') : PRICE_BANDS.find((b) => b.slug === slug).test(p),
    ).length;
  return `<details class="fgroup" ${open ? 'open' : ''}>
    <summary>${title}${icon.chevron}</summary>
    <div class="fgroup__opts">
      ${options
        .map((o) => {
          const n = counts(o.slug);
          return `<label class="check ${n === 0 ? 'is-empty' : ''}"><input type="checkbox" name="${key}" value="${o.slug}" ${s[key].includes(o.slug) ? 'checked' : ''}><span class="check__box">${icon.check}</span>${o.name}<em>${n}</em></label>`;
        })
        .join('')}
    </div>
  </details>`;
}

function filtersMarkup(s, base, collection) {
  return `<form class="filters" data-filters>
    ${collection.isCategory ? '' : group('category', 'Category', CATEGORIES, s, base)}
    ${group('concern', 'Skin concern', CONCERNS, s, base)}
    ${group('skin', 'Skin type', SKIN_TYPES.filter((x) => x.slug !== 'all'), s, base, false)}
    ${group('price', 'Price', PRICE_BANDS, s, base)}
    <div class="fgroup fgroup--toggles">
      <label class="switch"><input type="checkbox" name="sale" ${s.sale ? 'checked' : ''}><span></span>On sale</label>
      <label class="switch"><input type="checkbox" name="instock" ${s.instock ? 'checked' : ''}><span></span>In stock only</label>
    </div>
  </form>`;
}

function chips(s) {
  const out = [];
  ['category', 'concern', 'skin', 'price'].forEach((k) => s[k].forEach((v) => out.push(`<button class="chip chip--active" data-remove="${k}:${v}">${esc(LABELS[k](v))} ${icon.close}</button>`)));
  if (s.sale) out.push(`<button class="chip chip--active" data-remove="sale">On sale ${icon.close}</button>`);
  if (s.instock) out.push(`<button class="chip chip--active" data-remove="instock">In stock ${icon.close}</button>`);
  if (out.length) out.push('<button class="chip chip--clear" data-clear>Clear all</button>');
  return out.join('');
}

function resultsMarkup(products) {
  if (!products.length) {
    return `<div class="empty"><div class="empty__blob">${icon.search}</div><h3 class="h3">Nothing matches — yet</h3><p>Try removing a filter or two.</p><button class="btn btn--ghost" data-clear>Clear filters</button></div>`;
  }
  return `<div class="grid">${products.map((p) => `<div class="reveal">${productCard(p)}</div>`).join('')}</div>`;
}

export default function shop({ params, query }) {
  const slug = params[0] || 'all';
  const collection = getCollection(slug);
  if (!collection) return notFound();
  const base = productsIn(slug);
  let state = readState(query);
  const heroProducts = [...base].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 3);
  const siblings = COLLECTIONS.filter((c) => c.slug !== slug).slice(0, 11);

  return {
    title: collection.name,
    html: `
    <section class="collection-hero" style="--tint:${collection.tint}">
      <div class="container collection-hero__inner">
        <div>
          <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><a href="#/shop">Shop</a>${slug !== 'all' ? `<span>/</span><span aria-current="page">${esc(collection.name)}</span>` : ''}</nav>
          <h1 class="display">${esc(collection.name)}</h1>
          <p class="lede">${esc(collection.blurb)}</p>
          <p class="muted small">${plural(base.length, 'product')}</p>
        </div>
        <div class="collection-hero__art" aria-hidden="true">
          ${heroProducts.map((p, i) => `<span class="cart-${i}">${productArt(p, { view: i === 1 ? 'flatlay' : 'hero' })}</span>`).join('')}
        </div>
      </div>
      <div class="container"><div class="pills" role="navigation" aria-label="Other collections">${siblings.map((c) => `<a class="pill" href="#/shop/${c.slug}">${esc(c.name)}</a>`).join('')}</div></div>
    </section>
    <section class="container shop">
      <aside class="shop__side" aria-label="Filters">
        <p class="shop__side-title">${icon.filter} Filter</p>
        <div data-filter-host>${filtersMarkup(state, base, collection)}</div>
      </aside>
      <div class="shop__main">
        <div class="toolbar">
          <button class="btn btn--ghost btn--sm toolbar__filter" data-open-filters>${icon.filter} Filter <span data-filter-count></span></button>
          <p class="toolbar__count" data-count aria-live="polite"></p>
          <label class="select"><span class="sr-only">Sort by</span>
            <select data-sort>${SORTS.map((o) => `<option value="${o.slug}" ${state.sort === o.slug ? 'selected' : ''}>${o.name}</option>`).join('')}</select>${icon.chevron}
          </label>
        </div>
        <div class="chips chips--active" data-chips></div>
        <div data-results></div>
      </div>
    </section>
    <div class="sheet" data-sheet role="dialog" aria-modal="true" aria-label="Filters" hidden>
      <div class="sheet__scrim" data-close-sheet></div>
      <div class="sheet__panel">
        <div class="sheet__head"><h2 class="h3">Filter</h2><button class="icon-btn" data-close-sheet aria-label="Close filters">${icon.close}</button></div>
        <div class="sheet__body" data-sheet-host></div>
        <div class="sheet__foot"><button class="btn btn--ghost" data-clear>Clear</button><button class="btn btn--primary" data-close-sheet data-sheet-apply>Show results</button></div>
      </div>
    </div>`,
    mount(root) {
      const results = root.querySelector('[data-results]');
      const count = root.querySelector('[data-count]');
      const chipHost = root.querySelector('[data-chips]');
      const sheet = root.querySelector('[data-sheet]');
      const sheetHost = root.querySelector('[data-sheet-host]');
      const sideHost = root.querySelector('[data-filter-host]');

      const activeCount = () => ['category', 'concern', 'skin', 'price'].reduce((n, k) => n + state[k].length, 0) + state.sale + state.instock;

      const update = ({ redrawFilters = false } = {}) => {
        const found = applyFilters(base, state);
        results.innerHTML = resultsMarkup(found);
        count.textContent = plural(found.length, 'product');
        chipHost.innerHTML = chips(state);
        const n = activeCount();
        root.querySelector('[data-filter-count]').textContent = n ? `(${n})` : '';
        root.querySelector('[data-sheet-apply]').textContent = `Show ${plural(found.length, 'result')}`;
        if (redrawFilters) {
          sideHost.innerHTML = filtersMarkup(state, base, collection);
          if (!sheet.hidden) sheetHost.innerHTML = filtersMarkup(state, base, collection);
        }
        history.replaceState(null, '', buildHash(['shop', slug], toQuery(state)));
        reveal(results);
      };

      const fromForm = (form) => {
        const fd = new FormData(form);
        state = { ...state, category: fd.getAll('category'), concern: fd.getAll('concern'), skin: fd.getAll('skin'), price: fd.getAll('price'), sale: fd.has('sale'), instock: fd.has('instock') };
        update();
      };

      root.addEventListener('change', (e) => {
        const form = e.target.closest('[data-filters]');
        if (form) fromForm(form);
        if (e.target.matches('[data-sort]')) {
          state.sort = e.target.value;
          update();
        }
      });

      root.addEventListener('click', (e) => {
        const rm = e.target.closest('[data-remove]');
        if (rm) {
          const [k, v] = rm.dataset.remove.split(':');
          if (v) state[k] = state[k].filter((x) => x !== v);
          else state[k] = false;
          update({ redrawFilters: true });
        }
        if (e.target.closest('[data-clear]')) {
          state = { ...readState(new URLSearchParams()), sort: state.sort };
          update({ redrawFilters: true });
        }
        if (e.target.closest('[data-open-filters]')) {
          sheetHost.innerHTML = filtersMarkup(state, base, collection);
          sideHost.innerHTML = '';
          sheet.hidden = false;
          document.documentElement.classList.add('is-locked');
          requestAnimationFrame(() => {
            sheet.classList.add('is-open');
            sheet.querySelector('.sheet__head .icon-btn').focus({ preventScroll: true });
          });
        }
        if (e.target.closest('[data-close-sheet]')) closeSheet();
      });

      const closeSheet = () => {
        sheet.classList.remove('is-open');
        document.documentElement.classList.remove('is-locked');
        sideHost.innerHTML = filtersMarkup(state, base, collection);
        setTimeout(() => {
          sheet.hidden = true;
          sheetHost.innerHTML = '';
        }, 300);
        root.querySelector('[data-open-filters]').focus({ preventScroll: true });
      };
      const onKey = (e) => e.key === 'Escape' && !sheet.hidden && closeSheet();
      document.addEventListener('keydown', onKey);

      update();
      return () => {
        document.removeEventListener('keydown', onKey);
        document.documentElement.classList.remove('is-locked');
      };
    },
  };
}
