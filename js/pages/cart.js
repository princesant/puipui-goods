import { plural } from '../utils.js';
import { PRODUCTS } from '../data/products.js';
import { SITE } from '../data/site.js';
import { totals, subscribe, getState } from '../store.js';
import { bagLine, summaryRows, promoForm, freeShipBar } from '../ui/cart.js';
import { productCard } from '../ui/card.js';
import { icon } from '../ui/icons.js';
import { reveal } from '../ui/feedback.js';

function body() {
  const t = totals();
  const count = t.lines.reduce((n, l) => n + l.qty, 0);
  if (!t.lines.length) {
    const picks = PRODUCTS.filter((p) => p.badges.includes('bestseller')).slice(0, 4);
    return `<div class="empty empty--page">
      <div class="empty__blob">${icon.bag}</div>
      <h1 class="display display--sm">Your bag is empty</h1>
      <p>Nothing here yet — but our bestsellers are only a tap away.</p>
      <a class="btn btn--primary" href="#/shop">Start shopping</a>
    </div>
    <div class="section__head"><div><p class="kicker">Most loved</p><h2 class="h2">Start with a bestseller</h2></div></div>
    <div class="grid grid--4">${picks.map((p) => `<div class="reveal">${productCard(p)}</div>`).join('')}</div>`;
  }
  const inBag = new Set(getState().cart.map((l) => l.id));
  const upsell = PRODUCTS.filter((p) => !inBag.has(p.id) && p.stock > 0).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
  return `<div class="bag">
    <div class="bag__main">
      <h1 class="display display--sm">Your bag <span class="muted">(${plural(count, 'item')})</span></h1>
      ${freeShipBar(t)}
      <ul class="lines lines--page">${t.lines.map((l) => bagLine(l)).join('')}</ul>
      <a class="btn btn--link" href="#/shop">${icon.arrowLeft} Continue shopping</a>
    </div>
    <aside class="bag__side">
      <div class="summary-card">
        <h2 class="h3">Order summary</h2>
        ${promoForm(t)}
        ${summaryRows(t)}
        <a class="btn btn--primary btn--block btn--lg" href="#/checkout">${icon.lock} Checkout securely</a>
        ${SITE.demoMode ? `<p class="demo-note">${icon.info} This is a demo checkout. No payment will be taken.</p>` : ''}
        <ul class="mini-promises"><li>${icon.truck} Ships from Aizawl in 24h</li><li>${icon.shield} Sealed & authentic</li><li>${icon.gift} Free gift wrap on request</li></ul>
      </div>
    </aside>
  </div>
  <div class="section__head"><div><p class="kicker">Before you go</p><h2 class="h2">Others also added</h2></div></div>
  <div class="grid grid--4">${upsell.map((p) => `<div class="reveal">${productCard(p)}</div>`).join('')}</div>`;
}

export default function cart() {
  return {
    title: 'Your bag',
    html: `<section class="container page-pad" data-bag-page>${body()}</section>`,
    mount(root) {
      const host = root.querySelector('[data-bag-page]');
      return subscribe((_, change) => {
        if (!change.startsWith('cart')) return;
        host.innerHTML = body();
        reveal(host);
      });
    },
  };
}
