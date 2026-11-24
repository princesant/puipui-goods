// Persistent chrome: announcement bar, header, mobile menu and footer.
import { $, esc } from '../utils.js';
import { icon } from './icons.js';
import { CATEGORIES, PRODUCTS, byId } from '../data/products.js';
import { SITE } from '../data/site.js';
import { cartCount, getState } from '../store.js';
import { productArt } from '../art.js';

export const logo = (cls = '') => `<a href="#/" class="logo ${cls}" aria-label="Puipui Goods home">
  <span class="logo__word">pui<span>pui</span></span><span class="logo__goods">goods</span>
  <svg class="logo__spark" viewBox="-12 -12 24 24" aria-hidden="true"><path d="M0-12C1.6-3.4 3.4-1.6 12 0 3.4 1.6 1.6 3.4 0 12-1.6 3.4-3.4 1.6-12 0-3.4-1.6-1.6-3.4 0-12Z"/></svg>
</a>`;

const NAV = [
  { href: '#/shop/bestsellers', label: 'Bestsellers' },
  { href: '#/shop/skincare', label: 'Skincare' },
  { href: '#/shop/makeup', label: 'Makeup' },
  { href: '#/shop/lips', label: 'Lips' },
  { href: '#/about', label: 'Our story' },
];

export function renderAnnouncement() {
  const msgs = [
    `Free delivery on orders over ₹${SITE.freeShippingThreshold}`,
    'Shipping pan-India from Aizawl',
    'Visit us in Aizawl · Lunglei · Siaha',
    'Wholesale & retail',
    'Every product sealed & authentic',
  ];
  const row = msgs.map((m) => `<span>${esc(m)}</span><i aria-hidden="true">✦</i>`).join('');
  $('#announce').innerHTML = `<div class="announce__track" aria-label="${esc(msgs.join('. '))}"><div class="announce__row" aria-hidden="true">${row}${row}</div></div>`;
}

export function renderHeader() {
  const featured = byId('peach-fuzz-eyeshadow-palette');
  $('#site-header').innerHTML = `
  <div class="header__inner">
    <button class="icon-btn header__menu" data-action="open-menu" aria-label="Open menu">${icon.menu}</button>
    ${logo()}
    <nav class="header__nav" aria-label="Main">
      <div class="nav-item nav-item--mega">
        <a href="#/shop" class="nav-link">Shop ${icon.chevron}</a>
        <div class="mega" role="group" aria-label="Shop categories">
          <div class="mega__cols">
            <div>
              <p class="mega__title">Categories</p>
              ${CATEGORIES.map((c) => `<a href="#/shop/${c.slug}" class="mega__link"><i style="background:${c.tint}"></i>${c.name}</a>`).join('')}
            </div>
            <div>
              <p class="mega__title">Edits</p>
              <a href="#/shop/new" class="mega__link">New in</a>
              <a href="#/shop/bestsellers" class="mega__link">Bestsellers</a>
              <a href="#/shop/under-499" class="mega__link">Under ₹499</a>
              <a href="#/shop/sale" class="mega__link">On sale</a>
              <a href="#/shop" class="mega__link mega__link--all">Shop all ${icon.arrow}</a>
            </div>
          </div>
          <a class="mega__feature" href="#/product/${featured.id}">
            <span class="mega__art">${productArt(featured, { view: 'flatlay' })}</span>
            <span class="mega__kicker">Just landed</span>
            <span class="mega__name">${esc(featured.name)}</span>
          </a>
        </div>
      </div>
      ${NAV.map((n) => `<a href="${n.href}" class="nav-link">${n.label}</a>`).join('')}
    </nav>
    <div class="header__actions">
      <button class="icon-btn" data-action="open-search" aria-label="Search">${icon.search}</button>
      <a class="icon-btn header__wish" href="#/wishlist" aria-label="Wishlist">${icon.heart}<span class="dot-count" data-wish-count hidden></span></a>
      <button class="icon-btn header__bag" data-action="open-cart" aria-label="Open bag" data-bag-target>${icon.bag}<span class="dot-count" data-bag-count hidden></span></button>
    </div>
  </div>`;
  updateCounts();
}

export function updateCounts() {
  const n = cartCount();
  const w = getState().wishlist.length;
  document.querySelectorAll('[data-bag-count]').forEach((el) => {
    el.textContent = n;
    el.hidden = n === 0;
  });
  document.querySelectorAll('[data-wish-count]').forEach((el) => {
    el.textContent = w;
    el.hidden = w === 0;
  });
  const bag = document.querySelector('.header__bag');
  if (bag) bag.setAttribute('aria-label', `Open bag, ${n} item${n === 1 ? '' : 's'}`);
}

export function renderMenu() {
  $('#menu-panel').innerHTML = `
    <div class="panel__head">
      ${logo('logo--sm')}
      <button class="icon-btn" data-action="close-panel" aria-label="Close menu">${icon.close}</button>
    </div>
    <div class="panel__body menu">
      <nav aria-label="Mobile">
        <p class="menu__label">Shop by category</p>
        <div class="menu__bubbles">
          ${CATEGORIES.map((c) => `<a href="#/shop/${c.slug}" class="menu__bubble"><span style="background:${c.tint}">${productArt(firstOf(c.slug), {})}</span>${c.name}</a>`).join('')}
        </div>
        <p class="menu__label">Edits</p>
        <a class="menu__link" href="#/shop/new">New in ${icon.arrow}</a>
        <a class="menu__link" href="#/shop/bestsellers">Bestsellers ${icon.arrow}</a>
        <a class="menu__link" href="#/shop/under-499">Under ₹499 ${icon.arrow}</a>
        <a class="menu__link" href="#/shop">Shop all ${icon.arrow}</a>
        <p class="menu__label">Puipui</p>
        <a class="menu__link" href="#/about">Our story ${icon.arrow}</a>
        <a class="menu__link" href="#/faq">FAQs ${icon.arrow}</a>
        <a class="menu__link" href="#/contact">Contact & stores ${icon.arrow}</a>
        <a class="menu__link" href="#/wishlist">Wishlist ${icon.arrow}</a>
      </nav>
      <a class="menu__insta" href="${SITE.instagram.url}" target="_blank" rel="noopener">${icon.instagram}<span>@${SITE.instagram.handle}<small>${SITE.instagram.followers}+ followers</small></span></a>
    </div>`;
}

const firstOf = (cat) => PRODUCTS.find((p) => p.category === cat);

export function renderFooter() {
  $('#site-footer').innerHTML = `
  <div class="footer__wave" aria-hidden="true"></div>
  <div class="footer__inner container">
    <div class="footer__brand">
      ${logo('logo--light')}
      <p>${esc(SITE.tagline)}. Shipping happy skin across India since day one.</p>
      <a class="footer__insta" href="${SITE.instagram.url}" target="_blank" rel="noopener">${icon.instagram} @${SITE.instagram.handle}</a>
    </div>
    <div class="footer__cols">
      <div>
        <p class="footer__title">Shop</p>
        ${CATEGORIES.map((c) => `<a href="#/shop/${c.slug}">${c.name}</a>`).join('')}
      </div>
      <div>
        <p class="footer__title">Help</p>
        <a href="#/faq">FAQs</a>
        <a href="#/faq">Shipping & returns</a>
        <a href="#/contact">Contact us</a>
        <a href="#/contact?topic=wholesale">Wholesale</a>
      </div>
      <div>
        <p class="footer__title">Visit</p>
        ${SITE.stores.map((s) => `<a href="#/contact">${s.town}</a>`).join('')}
        <span class="footer__muted">${esc(SITE.hours)}</span>
      </div>
    </div>
  </div>
  <div class="footer__base container">
    <span>© ${new Date().getFullYear()} Puipui Goods</span>
    ${SITE.demoMode ? '<span class="footer__demo">Concept storefront — sample products, prices and reviews. Checkout is a demo; no payments are processed.</span>' : ''}
    <span class="footer__pay" aria-label="Accepted payment methods in the live store">UPI · Cards · Net banking · COD</span>
  </div>`;
}
