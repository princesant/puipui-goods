import { esc } from '../utils.js';
import { SITE } from '../data/site.js';
import { icon } from '../ui/icons.js';
import { save, dbEnabled } from '../db.js';

const TOPICS = [
  ['order', 'An existing order'],
  ['product', 'Product advice'],
  ['wholesale', 'Wholesale enquiry'],
  ['store', 'Store visit'],
  ['other', 'Something else'],
];

export default function contact({ query }) {
  const topic = query.get('topic') || 'product';
  return {
    title: 'Contact & stores',
    html: `
    <section class="contact-hero">
      <div class="container">
        <p class="sticker sticker--tilt">${icon.chat} We reply within a day</p>
        <h1 class="display">Let’s talk <em>skin</em>.</h1>
        <p class="lede">Questions about an order, a shade match or wholesale? Send us a note, DM us on Instagram or drop by a store.</p>
      </div>
    </section>
    <section class="container contact">
      <form class="contact__form" data-contact novalidate>
        <h2 class="h3">Send a message</h2>
        <div class="row">
          <div class="field"><label for="c-name">Your name</label><input id="c-name" name="name" autocomplete="name" required><p class="field__error"></p></div>
          <div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" autocomplete="email" required><p class="field__error"></p></div>
        </div>
        <fieldset class="topics"><legend>What’s it about?</legend>
          <div class="chips">${TOPICS.map(([v, l]) => `<label class="chip-radio"><input type="radio" name="topic" value="${v}" ${v === topic ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
        </fieldset>
        <div class="field"><label for="c-msg">Message</label><textarea id="c-msg" name="message" rows="5" required placeholder="Tell us a little about your skin, your order number, or your shop…"></textarea><p class="field__error"></p></div>
        <button class="btn btn--primary btn--lg">Send message ${icon.arrow}</button>
        <p class="muted small">${dbEnabled() ? 'We only use your details to reply to this message.' : 'Demo form: messages aren’t sent or stored anywhere.'}</p>
        <p class="field__error" data-send-error role="alert"></p>
        <div class="contact__done" hidden role="status">
          <div class="confirm__burst">${icon.check}</div>
          <h3 class="h3">Message received!</h3>
          <p>${dbEnabled() ? 'Thanks for writing in — we usually reply within one working day. In the meantime, say hi on Instagram!' : 'In the live store our team would reply within one working day. For now, why not say hi on Instagram?'}</p>
          <a class="btn btn--insta" href="${SITE.instagram.url}" target="_blank" rel="noopener">${icon.instagram} @${SITE.instagram.handle}</a>
        </div>
      </form>

      <aside class="contact__side">
        <a class="contact__card contact__card--insta" href="${SITE.instagram.url}" target="_blank" rel="noopener">
          ${icon.instagram}<div><strong>DM us on Instagram</strong><span>@${SITE.instagram.handle} — fastest for shade help</span></div>${icon.arrow}
        </a>
        <a class="contact__card" href="mailto:${SITE.email}">
          ${icon.mail}<div><strong>Email</strong><span>${esc(SITE.email)}</span></div>${icon.arrow}
        </a>
        <div class="contact__card">${icon.clock}<div><strong>Opening hours</strong><span>${esc(SITE.hours)}</span></div></div>
      </aside>
    </section>

    <section class="section">
      <div class="container">
        <div class="section__head reveal"><div><p class="kicker">Visit us</p><h2 class="h2">Our stores</h2></div></div>
        <div class="stores">
          ${SITE.stores
            .map(
              (s, i) => `<article class="store reveal" style="--tint:${['#FFE4EF', '#EEE6FF', '#FFE8DC'][i]}">
            <div class="store__map" aria-hidden="true"><svg viewBox="0 0 300 160"><path d="M0 110C60 90 80 130 140 110S240 60 300 80" stroke="#fff" stroke-width="14" fill="none" opacity=".8"/><path d="M60 0C70 50 120 70 110 160" stroke="#fff" stroke-width="9" fill="none" opacity=".6"/><path d="M220 0C200 40 240 90 210 160" stroke="#fff" stroke-width="6" fill="none" opacity=".5"/></svg><span class="store__pin">${icon.pin}</span></div>
            <div class="store__body">
              <span class="store-chip__tag">${s.tag}</span>
              <h3 class="h3">${s.town}</h3>
              <p>${esc(s.address)}</p>
              <p class="muted small">${icon.clock} ${esc(SITE.hours)}</p>
              <a class="btn btn--link" href="${SITE.mapUrl}" target="_blank" rel="noopener">Get directions ${icon.arrow}</a>
            </div>
          </article>`,
            )
            .join('')}
        </div>
      </div>
    </section>`,
    mount(root) {
      const form = root.querySelector('[data-contact]');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const checks = {
          name: (v) => v.length > 1 || 'Please tell us your name',
          email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email',
          message: (v) => v.length > 9 || 'A few more words, please (10+ characters)',
        };
        let first = null;
        for (const [k, rule] of Object.entries(checks)) {
          const el = form[k];
          const res = rule(el.value.trim());
          const f = el.closest('.field');
          f.classList.toggle('has-error', res !== true);
          f.querySelector('.field__error').textContent = res === true ? '' : res;
          el.setAttribute('aria-invalid', res !== true);
          if (res !== true && !first) first = el;
        }
        if (first) return first.focus();
        const btn = form.querySelector('button.btn--primary');
        const err = form.querySelector('[data-send-error]');
        btn.disabled = true;
        err.textContent = '';
        try {
          await save('messages', {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            topic: form.topic.value,
            message: form.message.value.trim(),
          });
          form.classList.add('is-sent');
          form.querySelector('.contact__done').hidden = false;
        } catch {
          err.textContent = 'Sorry, your message didn’t send. Please try again or DM us on Instagram.';
        } finally {
          btn.disabled = false;
        }
      });
    },
  };
}
