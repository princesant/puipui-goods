import { esc } from '../utils.js';
import { FAQS } from '../data/content.js';
import { SITE } from '../data/site.js';
import { icon } from '../ui/icons.js';

const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '-');

export default function faq() {
  return {
    title: 'FAQs',
    html: `
    <section class="contact-hero contact-hero--lilac">
      <div class="container">
        <p class="sticker sticker--tilt">${icon.info} Help centre</p>
        <h1 class="display">Questions? <em>Answers.</em></h1>
        <p class="lede">Everything about orders, delivery, returns and our products. Can’t find it? <a href="#/contact">Message us</a>.</p>
        <div class="faq-search">
          ${icon.search}
          <label class="sr-only" for="faq-q">Search FAQs</label>
          <input id="faq-q" type="search" placeholder="Search e.g. ‘returns’ or ‘COD’" autocomplete="off">
        </div>
      </div>
    </section>
    <section class="container faq">
      <nav class="faq__nav" aria-label="FAQ topics">
        ${FAQS.map((g) => `<a href="#faq-${slug(g.topic)}" class="pill">${g.topic}</a>`).join('')}
      </nav>
      <div class="faq__groups">
        ${FAQS.map(
          (g) => `<div class="faq__group" id="faq-${slug(g.topic)}" data-group>
            <h2 class="h3">${g.topic}</h2>
            <div class="accordion">${g.items.map(([q, a]) => `<details data-q="${esc((q + ' ' + a).toLowerCase())}"><summary>${esc(q)} ${icon.plus}</summary><div><p>${esc(a)}</p></div></details>`).join('')}</div>
          </div>`,
        ).join('')}
        <p class="faq__none" hidden>No questions match that search. <a href="#/contact">Ask us directly</a>.</p>
        <div class="faq__cta">
          <div><h2 class="h3">Still curious?</h2><p>Our team is in store ${esc(SITE.hours)} and on Instagram most evenings.</p></div>
          <a class="btn btn--primary" href="#/contact">Contact us</a>
        </div>
      </div>
    </section>`,
    mount(root) {
      const input = root.querySelector('#faq-q');
      input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        let shown = 0;
        root.querySelectorAll('[data-group]').forEach((g) => {
          let any = false;
          g.querySelectorAll('details').forEach((d) => {
            const hit = !q || d.dataset.q.includes(q);
            d.hidden = !hit;
            d.open = Boolean(q && hit);
            if (hit) any = true;
          });
          g.hidden = !any;
          if (any) shown++;
        });
        root.querySelector('.faq__none').hidden = shown > 0;
      });
    },
  };
}
