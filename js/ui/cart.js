// Bag drawer + shared bag line / summary markup (reused on the bag page and checkout).
import { $, esc, money } from '../utils.js';
import { icon } from './icons.js';
import { productArt } from '../art.js';
import { SITE } from '../data/site.js';
import { PRODUCTS } from '../data/products.js';
import { totals, getState } from '../store.js';

export function freeShipBar(t) {
  const pct = Math.min(100, ((SITE.freeShippingThreshold - t.toFreeShipping) / SITE.freeShippingThreshold) * 100);
  return `<div class="shipbar ${t.toFreeShipping === 0 ? 'is-done' : ''}">
    <p>${
      t.toFreeShipping === 0
        ? `${icon.truck}<span>You’ve unlocked <strong>free delivery</strong>!</span>`
        : `${icon.truck}<span>You’re <strong>${money(t.toFreeShipping)}</strong> away from free delivery</span>`
    }</p>
    <div class="shipbar__track"><span style="width:${pct}%"></span></div>
  </div>`;
}

export function bagLine(l, { compact = false } = {}) {
  const p = l.product;
  return `<li class="line ${compact ? 'line--compact' : ''}" data-key="${esc(l.key)}">
    <a class="line__art" href="#/product/${p.id}" tabindex="-1" aria-hidden="true">${productArt(p, { shade: l.shadeHex })}</a>
    <div class="line__info">
      <p class="line__brand">${esc(p.brand)}</p>
      <a class="line__name" href="#/product/${p.id}">${esc(p.name)}</a>
      <p class="line__meta">${l.shade ? `<i style="background:${l.shadeHex}"></i>${esc(l.shade)} · ` : ''}${esc(p.size)}</p>
      ${
        compact
          ? `<p class="line__meta">Qty ${l.qty}</p>`
          : `<div class="line__row">
        <div class="qty" role="group" aria-label="Quantity for ${esc(p.name)}">
          <button data-action="qty" data-key="${esc(l.key)}" data-delta="-1" aria-label="Decrease quantity">${icon.minus}</button>
          <output aria-live="polite">${l.qty}</output>
          <button data-action="qty" data-key="${esc(l.key)}" data-delta="1" aria-label="Increase quantity" ${l.qty >= p.stock ? 'disabled' : ''}>${icon.plus}</button>
        </div>
        <button class="line__remove" data-action="remove" data-key="${esc(l.key)}" aria-label="Remove ${esc(p.name)}">Remove</button>
      </div>`
      }
    </div>
    <p class="line__price">${money(l.total)}${p.compareAt ? `<s>${money(p.compareAt * l.qty)}</s>` : ''}</p>
  </li>`;
}

export function summaryRows(t, { shippingLabel = 'Delivery' } = {}) {
  return `<dl class="summary">
    <div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>
    ${t.discount ? `<div class="summary__discount"><dt>Promo ${esc(t.promo.code)}</dt><dd>−${money(t.discount)}</dd></div>` : ''}
    <div><dt>${shippingLabel}</dt><dd>${t.subtotal === 0 ? '—' : t.shipping === 0 ? '<span class="free">Free</span>' : money(t.shipping)}</dd></div>
    <div class="summary__total"><dt>Total <small>incl. GST</small></dt><dd>${money(t.total)}</dd></div>
    ${t.savings ? `<p class="summary__savings">${icon.sparkle} You’re saving ${money(t.savings + t.discount)} today</p>` : ''}
  </dl>`;
}

export function promoForm(t) {
  return `<form class="promo" data-form="promo">
    ${
      t.promo
        ? `<p class="promo__applied">${icon.check}<span><strong>${esc(t.promo.code)}</strong> ${t.promo.applied ? 'applied' : 'saved — spend more to unlock'}</span><button type="button" data-action="remove-promo">Remove</button></p>`
        : `<input name="code" placeholder="Promo code" autocomplete="off" aria-label="Promo code">
           <button class="btn btn--ghost btn--sm" type="submit">Apply</button>`
    }
    ${SITE.demoMode && !t.promo ? '<p class="promo__hint">Demo codes: <button type="button" data-action="fill-promo" data-code="PUIPUI10">PUIPUI10</button> <button type="button" data-action="fill-promo" data-code="GLOWUP">GLOWUP</button></p>' : ''}
  </form>`;
}

export function renderCartDrawer() {
  const t = totals();
  const el = $('#cart-panel');
  const count = t.lines.reduce((n, l) => n + l.qty, 0);
  const suggestions = PRODUCTS.filter((p) => p.price <= 549 && p.stock > 0 && !getState().cart.some((l) => l.id === p.id)).slice(0, 6);

  el.innerHTML = `
    <div class="panel__head">
      <h2 class="panel__title">Your bag <span>${count}</span></h2>
      <button class="icon-btn" data-action="close-panel" aria-label="Close bag">${icon.close}</button>
    </div>
    ${
      t.lines.length === 0
        ? `<div class="panel__body bag-empty">
            <div class="bag-empty__blob">${icon.bag}</div>
            <h3>Your bag is feeling light</h3>
            <p>Let’s fix that — our bestsellers are a lovely place to start.</p>
            <a class="btn btn--primary" href="#/shop/bestsellers">Shop bestsellers</a>
          </div>`
        : `<div class="panel__body">
            ${freeShipBar(t)}
            <ul class="lines">${t.lines.map((l) => bagLine(l)).join('')}</ul>
            ${
              suggestions.length
                ? `<div class="addons"><p class="addons__title">Little add-ons</p><div class="addons__row">${suggestions
                    .map(
                      (p) => `<div class="addon"><a href="#/product/${p.id}" class="addon__art">${productArt(p)}</a><p>${esc(p.name)}</p><button class="addon__btn" data-action="add" data-id="${p.id}" aria-label="Add ${esc(p.name)}">${money(p.price)} ${icon.plus}</button></div>`,
                    )
                    .join('')}</div></div>`
                : ''
            }
            <div class="panel__promo">${promoForm(t)}</div>
          </div>
          <div class="panel__foot">
            ${summaryRows(t)}
            <a class="btn btn--primary btn--block" href="#/checkout" data-action="close-panel-nav">Checkout · ${money(t.total)}</a>
            <div class="panel__foot-row">
              <a class="btn btn--link btn--sm" href="#/cart" data-action="close-panel-nav">View full bag</a>
              ${SITE.demoMode ? `<span class="demo-pill">${icon.info} Demo — no payment taken</span>` : ''}
            </div>
          </div>`
    }`;
}
