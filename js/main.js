// App entry: hash router, global event delegation and persistent chrome.
import { $, parseHash, reducedMotion } from './utils.js';
import { addToCart, toggleWish, setQty, removeLine, applyPromo, removePromo, subscribe, getState } from './store.js';
import { byId } from './data/products.js';
import { renderAnnouncement, renderHeader, renderMenu, renderFooter, updateCounts } from './ui/layout.js';
import { renderCartDrawer } from './ui/cart.js';
import { renderSearchPanel } from './ui/search.js';
import { initPanels, registerPanel, openPanel, closePanel, isOpen } from './ui/panels.js';
import { toast, reveal, flyToBag } from './ui/feedback.js';

import home from './pages/home.js';
import shop from './pages/shop.js';
import product from './pages/product.js';
import searchPage from './pages/search.js';
import cart from './pages/cart.js';
import checkout from './pages/checkout.js';
import order from './pages/order.js';
import wishlist from './pages/wishlist.js';
import about from './pages/about.js';
import contact from './pages/contact.js';
import faq from './pages/faq.js';
import notFound from './pages/notfound.js';

const ROUTES = { '': home, shop, product, search: searchPage, cart, checkout, order, wishlist, about, contact, faq };

const main = $('#main');
let cleanup = null;
let lastRoute = null;

function render() {
  const { path, query } = parseHash();
  const [name = '', ...params] = path;
  const page = ROUTES[name] ?? notFound;

  // Shop filter changes update the URL with replaceState and never reach here,
  // so every hashchange is a real navigation.
  const routeKey = `${name}/${params.join('/')}`;
  const samePage = routeKey === lastRoute;
  lastRoute = routeKey;

  if (typeof cleanup === 'function') cleanup();
  const view = page({ params, query });
  document.title = view.title ? `${view.title} · Puipui Goods` : 'Puipui Goods — Skincare & cosmetics from Aizawl';
  main.innerHTML = view.html;
  main.dataset.page = name || 'home';
  cleanup = view.mount?.(main) ?? null;

  if (!samePage) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!reducedMotion()) {
      main.classList.remove('page-in');
      void main.offsetWidth;
      main.classList.add('page-in');
    }
    main.focus({ preventScroll: true });
  }
  document.querySelectorAll('.nav-link').forEach((a) => a.classList.toggle('is-active', location.hash.split('?')[0] === a.getAttribute('href')));
  reveal(main);
}

/* ---------- global interactions ---------- */
function onClick(e) {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action, id } = el.dataset;

  switch (action) {
    case 'add': {
      e.preventDefault();
      const p = byId(id);
      const shade = el.dataset.shade || null;
      const qty = Number(el.dataset.qty || 1);
      if (addToCart(id, { shade, qty })) {
        const colour = p.shades?.find((s) => s.name === shade)?.hex ?? p.art.cap;
        flyToBag(el, colour);
        if (el.dataset.openCart !== undefined) setTimeout(() => openPanel('cart', el), 420);
        else toast(`${p.name} added to your bag`, { action: 'View bag', href: '#/cart' });
      }
      break;
    }
    case 'add-many': {
      const ids = el.dataset.ids.split(',');
      ids.forEach((pid) => addToCart(pid));
      flyToBag(el);
      setTimeout(() => openPanel('cart', el), 420);
      break;
    }
    case 'wish': {
      e.preventDefault();
      const on = toggleWish(id);
      document.querySelectorAll(`[data-action="wish"][data-id="${id}"]`).forEach((b) => {
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on);
        b.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 320 });
      });
      toast(on ? 'Saved to your wishlist' : 'Removed from your wishlist', on ? { action: 'View', href: '#/wishlist' } : {});
      break;
    }
    case 'open-cart':
      openPanel('cart', el);
      break;
    case 'open-menu':
      openPanel('menu', el);
      break;
    case 'open-search':
      openPanel('search', el);
      break;
    case 'close-panel':
      closePanel();
      break;
    case 'close-panel-nav':
      closePanel({ restore: false });
      break;
    case 'qty': {
      const line = getState().cart.find((l) => l.key === el.dataset.key);
      if (line) setQty(line.key, line.qty + Number(el.dataset.delta));
      break;
    }
    case 'remove':
      removeLine(el.dataset.key);
      toast('Removed from your bag');
      break;
    case 'remove-promo':
      removePromo();
      break;
    case 'fill-promo': {
      const res = applyPromo(el.dataset.code);
      toast(res.message);
      break;
    }
    case 'search-term': {
      const input = $('#search-input');
      input.value = el.dataset.term;
      input.dispatchEvent(new Event('input'));
      input.focus();
      break;
    }
  }
}

function onSubmit(e) {
  const form = e.target.closest('[data-form]');
  if (!form) return;
  if (form.dataset.form === 'promo') {
    e.preventDefault();
    const res = applyPromo(new FormData(form).get('code'));
    toast(res.message, { tone: res.ok ? 'default' : 'error' });
  } else if (form.dataset.form === 'search') {
    e.preventDefault();
    const q = new FormData(form).get('q').trim();
    if (q) {
      closePanel({ restore: false });
      location.hash = `#/search?q=${encodeURIComponent(q)}`;
    }
  }
}

/* ---------- boot ---------- */
function boot() {
  renderAnnouncement();
  renderHeader();
  renderFooter();
  renderMenu();
  renderSearchPanel();
  renderCartDrawer();

  initPanels();
  registerPanel('cart', $('#cart-panel'));
  registerPanel('menu', $('#menu-panel'));
  registerPanel('search', $('#search-panel'), {
    onOpen: () => {
      const input = $('#search-input');
      input.select();
    },
  });

  subscribe((state, change) => {
    updateCounts();
    if (change.startsWith('cart')) renderCartDrawer();
  });

  document.addEventListener('click', onClick);
  document.addEventListener('submit', onSubmit);
  window.addEventListener('hashchange', (e) => {
    // In-page anchors (e.g. #routines, #main) scroll instead of routing.
    if (location.hash.length > 1 && !location.hash.startsWith('#/')) {
      const target = document.getElementById(location.hash.slice(1));
      const prev = e.oldURL.includes('#') ? e.oldURL.slice(e.oldURL.indexOf('#')) : '#/';
      history.replaceState(null, '', prev);
      if (target) {
        target.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
        if (target.tabIndex >= -1 && target.id === 'main') target.focus({ preventScroll: true });
      }
      return;
    }
    if (isOpen('menu') || isOpen('search')) closePanel({ restore: false });
    if (isOpen('cart')) closePanel({ restore: false });
    render();
  });

  // Header gains a soft shadow once the page scrolls.
  const header = $('#site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Keyboard shortcut: "/" opens search.
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      openPanel('search');
    }
  });

  $('#scrim').innerHTML = '';
  render();
}

boot();
