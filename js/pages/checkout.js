// DEMO CHECKOUT. Nothing here talks to a payment provider or a server, and
// no card / UPI / bank details are ever requested. In a live store, the
// "Place order" step would hand off to a PCI-compliant payment gateway.
import { money } from '../utils.js';
import { SITE } from '../data/site.js';
import { totals, clearCart, saveOrder } from '../store.js';
import { bagLine, summaryRows } from '../ui/cart.js';
import { icon } from '../ui/icons.js';
import { logo } from '../ui/layout.js';
import { save, dbEnabled } from '../db.js';

const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const PAYMENTS = [
  { id: 'upi', name: 'UPI', note: 'GPay, PhonePe, Paytm & more' },
  { id: 'card', name: 'Credit / debit card', note: 'Visa, Mastercard, RuPay' },
  { id: 'cod', name: 'Cash on delivery', note: 'Pay when your parcel arrives' },
];

const field = (id, label, attrs = '', hint = '') =>
  `<div class="field"><label for="co-${id}">${label}</label><input id="co-${id}" name="${id}" ${attrs}>${hint ? `<p class="field__hint">${hint}</p>` : ''}<p class="field__error" id="co-${id}-err"></p></div>`;

function shippingOptions(selected, t) {
  return Object.entries(SITE.shipping)
    .map(([id, m]) => {
      const price = id === 'standard' && t.subtotal - t.discount >= SITE.freeShippingThreshold ? 0 : m.price;
      return `<label class="option ${selected === id ? 'is-on' : ''}"><input type="radio" name="shipping" value="${id}" ${selected === id ? 'checked' : ''}>
        <span class="option__dot"></span><span class="option__text"><strong>${m.label}</strong><small>${m.eta}${id === 'pickup' ? ' · Aizawl, Lunglei or Siaha' : ''}</small></span>
        <span class="option__price">${price === 0 ? 'Free' : money(price)}</span></label>`;
    })
    .join('');
}

function sidebar(t, method) {
  const tt = totals({ shippingMethod: method });
  return `<h2 class="h3">In your bag</h2>
    <ul class="lines lines--compact">${tt.lines.map((l) => bagLine(l, { compact: true })).join('')}</ul>
    ${summaryRows(tt)}
    <a class="btn btn--link btn--sm" href="#/cart">Edit bag</a>`;
}

export default function checkout() {
  const t = totals();
  if (!t.lines.length) {
    return {
      title: 'Checkout',
      html: `<section class="container page-pad"><div class="empty empty--page"><div class="empty__blob">${icon.bag}</div><h1 class="display display--sm">Nothing to check out</h1><p>Your bag is empty. Let’s find you something lovely.</p><a class="btn btn--primary" href="#/shop">Shop now</a></div></section>`,
    };
  }
  let method = 'standard';

  return {
    title: 'Checkout',
    html: `
    <section class="checkout container page-pad">
      <div class="demo-banner" role="note">
        <span class="demo-banner__icon">${icon.info}</span>
        <div><strong>Demo checkout — no real payment.</strong> This is a prototype storefront. No money is taken and nothing will ship. ${
          dbEnabled()
            ? 'A test copy of the order (first name, city, items and totals only — never your email, phone or address) is saved to the shop’s database.'
            : 'Nothing you type leaves this browser.'
        } Please don’t enter real card or bank details anywhere.</div>
      </div>
      <div class="checkout__grid">
        <form class="checkout__form" data-checkout novalidate>
          <div class="checkout__brand">${logo('logo--sm')}<span>${icon.lock} Secure checkout (demo)</span></div>
          <ol class="steps-bar" aria-label="Checkout steps"><li class="is-on">Details</li><li>Delivery</li><li>Payment</li></ol>

          <fieldset class="co-block">
            <legend class="h3"><span>1</span> Contact</legend>
            <div class="row">
              ${field('email', 'Email', 'type="email" autocomplete="email" required placeholder="you@example.com"', 'For your order updates')}
              ${field('phone', 'Mobile number', 'type="tel" inputmode="numeric" autocomplete="tel-national" required placeholder="10-digit mobile" maxlength="10"', 'For delivery partner calls')}
            </div>
          </fieldset>

          <fieldset class="co-block">
            <legend class="h3"><span>2</span> Delivery address</legend>
            ${field('name', 'Full name', 'autocomplete="name" required')}
            ${field('address1', 'House / flat, street', 'autocomplete="address-line1" required')}
            ${field('address2', 'Locality / landmark <span class="muted">(optional)</span>', 'autocomplete="address-line2"')}
            <div class="row row--3">
              ${field('city', 'City', 'autocomplete="address-level2" required')}
              <div class="field"><label for="co-state">State</label><div class="select select--block"><select id="co-state" name="state" autocomplete="address-level1" required>${STATES.map((s) => `<option ${s === 'Mizoram' ? 'selected' : ''}>${s}</option>`).join('')}</select>${icon.chevron}</div></div>
              ${field('pin', 'PIN code', 'inputmode="numeric" autocomplete="postal-code" required maxlength="6"')}
            </div>
          </fieldset>

          <fieldset class="co-block">
            <legend class="h3"><span>3</span> Delivery method</legend>
            <div class="options" data-shipping>${shippingOptions(method, t)}</div>
          </fieldset>

          <fieldset class="co-block">
            <legend class="h3"><span>4</span> Payment <span class="tag tag--demo">Demo</span></legend>
            <div class="options">
              ${PAYMENTS.map((pm, i) => `<label class="option ${i === 0 ? 'is-on' : ''}"><input type="radio" name="payment" value="${pm.id}" ${i === 0 ? 'checked' : ''}><span class="option__dot"></span><span class="option__text"><strong>${pm.name}</strong><small>${pm.note}</small></span></label>`).join('')}
            </div>
            <div class="pay-placeholder">
              ${icon.lock}
              <p><strong>Payment details are not collected in this demo.</strong> In the live store, this step opens a secure payment partner’s window for UPI or card details — they never touch Puipui Goods’ servers.</p>
            </div>
            <label class="check check--inline"><input type="checkbox" name="gift"><span class="check__box">${icon.check}</span>Add free gift wrap &amp; a handwritten note</label>
          </fieldset>

          <div class="checkout__submit">
            <button class="btn btn--primary btn--lg btn--block" type="submit" data-place>Place demo order · <span data-total>${money(t.total)}</span></button>
            <p class="muted small">By placing this demo order you agree that nothing is charged and nothing is shipped.</p>
          </div>
        </form>

        <aside class="checkout__side"><div class="summary-card" data-side>${sidebar(t, method)}</div></aside>
      </div>
    </section>`,

    mount(root) {
      const form = root.querySelector('[data-checkout]');
      const side = root.querySelector('[data-side]');

      const refresh = () => {
        const tt = totals({ shippingMethod: method });
        side.innerHTML = sidebar(tt, method);
        root.querySelector('[data-total]').textContent = money(tt.total);
      };

      form.addEventListener('change', (e) => {
        if (e.target.name === 'shipping') method = e.target.value;
        if (e.target.type === 'radio') {
          form.querySelectorAll(`input[name="${e.target.name}"]`).forEach((r) => r.closest('.option').classList.toggle('is-on', r.checked));
          refresh();
        }
        if (e.target.closest('.co-block')) updateSteps();
      });

      const updateSteps = () => {
        const steps = root.querySelectorAll('.steps-bar li');
        const filled = ['email', 'phone', 'name', 'address1', 'city', 'pin'].every((k) => form[k].value.trim());
        steps[1].classList.toggle('is-on', filled);
        steps[2].classList.toggle('is-on', filled);
      };
      form.addEventListener('input', updateSteps);

      const rules = {
        email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address',
        phone: (v) => /^[6-9]\d{9}$/.test(v) || 'Enter a 10-digit Indian mobile number',
        name: (v) => v.length > 1 || 'Enter your full name',
        address1: (v) => v.length > 3 || 'Enter your address',
        city: (v) => v.length > 1 || 'Enter your city',
        pin: (v) => /^[1-9]\d{5}$/.test(v) || 'Enter a valid 6-digit PIN code',
      };

      const validate = () => {
        let firstBad = null;
        for (const [k, rule] of Object.entries(rules)) {
          const input = form[k];
          const res = rule(input.value.trim());
          const err = root.querySelector(`#co-${k}-err`);
          const bad = res !== true;
          input.closest('.field').classList.toggle('has-error', bad);
          input.setAttribute('aria-invalid', bad);
          if (bad) input.setAttribute('aria-describedby', `co-${k}-err`);
          else input.removeAttribute('aria-describedby');
          err.textContent = bad ? res : '';
          if (bad && !firstBad) firstBad = input;
        }
        return firstBad;
      };
      form.addEventListener('focusout', (e) => {
        const k = e.target.name;
        if (rules[k] && e.target.value) {
          const res = rules[k](e.target.value.trim());
          e.target.closest('.field').classList.toggle('has-error', res !== true);
          root.querySelector(`#co-${k}-err`).textContent = res === true ? '' : res;
        }
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const bad = validate();
        if (bad) {
          bad.focus();
          bad.scrollIntoView({ block: 'center', behavior: 'smooth' });
          return;
        }
        const btn = root.querySelector('[data-place]');
        btn.disabled = true;
        btn.classList.add('is-loading');
        btn.innerHTML = '<span class="spinner"></span> Placing demo order…';

        const tt = totals({ shippingMethod: method });
        const id = `PUI-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        // Keep only what the confirmation page needs — no contact or address details.
        const orderRecord = {
          id,
          date: new Date().toISOString(),
          firstName: form.name.value.trim().split(/\s+/)[0],
          city: form.city.value.trim(),
          state: form.state.value,
          shipping: method,
          payment: form.payment.value,
          gift: form.gift.checked,
          items: tt.lines.map((l) => ({ id: l.id, shade: l.shade, qty: l.qty, total: l.total })),
          subtotal: tt.subtotal,
          discount: tt.discount,
          shippingCost: tt.shipping,
          total: tt.total,
        };
        const { id: ref, date: _placedAt, ...rest } = orderRecord;
        const remote = save('orders', { ref, demo: true, ...rest }).catch((err) => console.warn('[puipui] Order not saved to Firestore', err));
        // Never hold the shopper on a slow or offline connection for more than 6 s.
        const capped = Promise.race([remote, new Promise((r) => setTimeout(r, 6000))]);
        const minWait = new Promise((r) => setTimeout(r, 900));
        Promise.all([capped, minWait]).then(() => {
          saveOrder(orderRecord);
          clearCart();
          location.hash = `#/order/${id}`;
        });
      });
    },
  };
}
