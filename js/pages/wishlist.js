import { plural } from '../utils.js';
import { byId } from '../data/products.js';
import { getState, subscribe } from '../store.js';
import { productCard } from '../ui/card.js';
import { icon } from '../ui/icons.js';
import { reveal } from '../ui/feedback.js';

function body() {
  const items = getState().wishlist.map(byId).filter(Boolean);
  if (!items.length) {
    return `<div class="empty empty--page"><div class="empty__blob">${icon.heart}</div><h1 class="display display--sm">Your wishlist is empty</h1><p>Tap the heart on anything you love and it’ll wait for you here.</p><a class="btn btn--primary" href="#/shop">Explore the shop</a></div>`;
  }
  return `<h1 class="display display--sm">Wishlist <span class="muted">(${plural(items.length, 'item')})</span></h1>
    <p class="lede">Saved in this browser — come back any time.</p>
    <div class="grid grid--4">${items.map((p) => `<div class="reveal">${productCard(p)}</div>`).join('')}</div>`;
}

export default function wishlist() {
  return {
    title: 'Wishlist',
    html: `<section class="container page-pad" data-wish-page>${body()}</section>`,
    mount(root) {
      const host = root.querySelector('[data-wish-page]');
      return subscribe((_, change) => {
        if (change !== 'wish') return;
        host.innerHTML = body();
        reveal(host);
      });
    },
  };
}
