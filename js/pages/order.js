import { esc, money, formatDate, reducedMotion } from '../utils.js';
import { productArt } from '../art.js';
import { byId } from '../data/products.js';
import { SITE } from '../data/site.js';
import { getOrder } from '../store.js';
import { icon } from '../ui/icons.js';
import { instagramSection } from '../ui/instagram.js';

const PAY = { upi: 'UPI', card: 'Card', cod: 'Cash on delivery' };

export default function order({ params }) {
  const o = getOrder(params[0]);
  if (!o) {
    return {
      title: 'Order',
      html: `<section class="container page-pad"><div class="empty empty--page"><div class="empty__blob">${icon.info}</div><h1 class="display display--sm">We couldn’t find that order</h1><p>Demo orders are only stored in the browser that placed them.</p><a class="btn btn--primary" href="#/shop">Keep shopping</a></div></section>`,
    };
  }
  const method = SITE.shipping[o.shipping];
  return {
    title: 'Order confirmed',
    html: `
    <section class="container page-pad confirm">
      <div class="confirm__card">
        <div class="confirm__burst" aria-hidden="true">${icon.check}</div>
        <p class="tag tag--demo">Demo order — no payment taken, nothing will ship</p>
        <h1 class="display display--sm">Thank you, ${esc(o.firstName)}!</h1>
        <p class="lede">Your demo order <strong>${esc(o.id)}</strong> was placed on ${formatDate(o.date)}. In the live store you’d now get an email and SMS confirmation.</p>
        <div class="confirm__meta">
          <div><span>Delivery</span><strong>${esc(method.label)}</strong><small>${esc(method.eta)}${o.shipping === 'pickup' ? '' : ` to ${esc(o.city)}, ${esc(o.state)}`}</small></div>
          <div><span>Payment</span><strong>${PAY[o.payment]}</strong><small>Simulated — not charged</small></div>
          <div><span>Total</span><strong>${money(o.total)}</strong><small>${o.gift ? 'Gift wrapped ✦' : 'incl. GST'}</small></div>
        </div>
        <ul class="confirm__items">
          ${o.items
            .map((it) => {
              const p = byId(it.id);
              if (!p) return '';
              const hex = p.shades?.find((s) => s.name === it.shade)?.hex;
              return `<li><span class="confirm__art">${productArt(p, { shade: hex })}</span><span><strong>${esc(p.name)}</strong><small>${it.shade ? esc(it.shade) + ' · ' : ''}Qty ${it.qty}</small></span><span>${money(it.total)}</span></li>`;
            })
            .join('')}
        </ul>
        <ol class="timeline">
          <li class="is-done"><span></span>Order placed</li>
          <li><span></span>Packed with love in Aizawl</li>
          <li><span></span>Out for delivery</li>
          <li><span></span>Glow begins</li>
        </ol>
        <div class="hero__ctas hero__ctas--center">
          <a class="btn btn--primary" href="#/shop">Keep shopping</a>
          <a class="btn btn--ghost" href="${SITE.instagram.url}" target="_blank" rel="noopener">${icon.instagram} Tag us @${SITE.instagram.handle}</a>
        </div>
      </div>
    </section>
    ${instagramSection({ title: 'Show us your haul', compact: true })}`,
    mount(root) {
      if (reducedMotion()) return;
      const colours = ['#FF4F9A', '#FFB99A', '#CDB8FF', '#FFE07A', '#9ED8B9'];
      const host = document.createElement('div');
      host.className = 'confetti';
      host.setAttribute('aria-hidden', 'true');
      host.innerHTML = Array.from({ length: 60 }, (_, i) => `<i style="--x:${Math.random() * 100}vw;--d:${Math.random() * 0.8}s;--r:${Math.random() * 720 - 360}deg;--c:${colours[i % colours.length]};--s:${0.6 + Math.random()}"></i>`).join('');
      root.appendChild(host);
      const t = setTimeout(() => host.remove(), 4200);
      return () => {
        clearTimeout(t);
        host.remove();
      };
    },
  };
}
