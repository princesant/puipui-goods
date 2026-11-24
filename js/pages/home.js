import { esc, money, stars, reducedMotion } from '../utils.js';
import { productArt } from '../art.js';
import { PRODUCTS, CATEGORIES, CONCERNS, byId } from '../data/products.js';
import { productsIn } from '../data/collections.js';
import { ROUTINES } from '../data/content.js';
import { FEEDBACK } from '../data/reviews.js';
import { SITE } from '../data/site.js';
import { productCard, priceTag } from '../ui/card.js';
import { icon } from '../ui/icons.js';
import { instagramSection, hydrateInstagram } from '../ui/instagram.js';
import { toast } from '../ui/feedback.js';
import { save } from '../db.js';

const CONCERN_TINTS = ['#FFE4EF', '#E3F4EC', '#EEE6FF', '#FFF0C9', '#FFE8DC', '#F3EEF5', '#FFE4EF', '#FFF0C9'];

function hero() {
  const a = byId('cloud-milk-barrier-cream');
  const b = byId('jelly-glass-lip-tint');
  const c = byId('sun-mochi-airy-sunscreen');
  return `<section class="hero">
    <div class="hero__inner container">
      <div class="hero__copy">
        <p class="sticker sticker--tilt">${icon.sparkle} Picked with love in Aizawl</p>
        <h1 class="hero__title">Little goods,<br><em>big</em> glow<span class="hero__dot">.</span></h1>
        <p class="hero__lede">The skincare and makeup we’ve tried, tested and fallen for — from our counters in Mizoram to your doorstep, anywhere in India.</p>
        <div class="hero__ctas">
          <a class="btn btn--primary btn--lg" href="#/shop/bestsellers">Shop bestsellers ${icon.arrow}</a>
          <a class="btn btn--ghost btn--lg" href="#routines">Build a routine</a>
        </div>
        <ul class="hero__proof">
          <li><strong>${SITE.instagram.followers}+</strong><span>community on Instagram</span></li>
          <li><strong>3</strong><span>stores across Mizoram</span></li>
          <li><strong>Pan-India</strong><span>delivery, free over ₹${SITE.freeShippingThreshold}</span></li>
        </ul>
      </div>
      <div class="hero__stage" data-parallax aria-hidden="true">
        <div class="hero__blob"></div>
        <div class="hero__ring">
          <svg viewBox="0 0 200 200"><defs><path id="ring" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0"/></defs>
          <text><textPath href="#ring">sealed &amp; authentic ✦ shipped pan-India ✦ wholesale &amp; retail ✦ </textPath></text></svg>
          <span>${icon.sparkle}</span>
        </div>
        <a class="hero__item hero__item--1" data-depth="18" href="#/product/${a.id}" tabindex="-1">${productArt(a)}</a>
        <a class="hero__item hero__item--2" data-depth="34" href="#/product/${b.id}" tabindex="-1">${productArt(b, { view: 'flatlay' })}</a>
        <a class="hero__item hero__item--3" data-depth="26" href="#/product/${c.id}" tabindex="-1">${productArt(c)}</a>
        <a class="hero__tag" data-depth="40" href="#/product/${a.id}" tabindex="-1">
          <span class="hero__tag-k">No.1 bestseller</span>
          <span class="hero__tag-n">${esc(a.name)}</span>
          ${stars(a.rating, { count: a.reviewCount, size: 'rating--sm' })}
          <span class="hero__tag-p">${money(a.price)}</span>
        </a>
      </div>
    </div>
  </section>`;
}

function stories() {
  const picks = { skincare: 'ceramide-dew-serum', makeup: 'peach-fuzz-eyeshadow-palette', lips: 'jelly-glass-lip-tint', body: 'camellia-hair-mist', tools: 'puff-cloud-sponge-duo', sets: 'glass-skin-starter-kit' };
  const extra = [
    { href: '#/shop/new', name: 'New in', p: byId('overnight-retinal-cream') },
    { href: '#/shop/sale', name: 'On sale', p: byId('vitamin-c-bright-drops') },
  ];
  const items = [
    ...extra.slice(0, 1),
    ...CATEGORIES.map((c) => ({ href: `#/shop/${c.slug}`, name: c.name, p: byId(picks[c.slug]) })),
    extra[1],
  ];
  return `<section class="stories" aria-label="Shop by category">
    <div class="container"><div class="stories__row">
      ${items
        .map(
          (s, i) => `<a class="story reveal" href="${s.href}">
            <span class="story__ring ${i === 0 ? 'is-new' : ''}"><span class="story__img">${productArt(s.p)}</span></span>
            <span class="story__name">${s.name}</span></a>`,
        )
        .join('')}
    </div></div>
  </section>`;
}

function rail({ id, kicker, title, href, products }) {
  return `<section class="section" aria-labelledby="${id}">
    <div class="container">
      <div class="section__head reveal">
        <div><p class="kicker">${kicker}</p><h2 id="${id}" class="h2">${title}</h2></div>
        <div class="section__tools">
          <a class="btn btn--link" href="${href}">View all ${icon.arrow}</a>
          <div class="rail-nav"><button class="icon-btn icon-btn--soft" data-rail="${id}" data-dir="-1" aria-label="Scroll back">${icon.arrowLeft}</button><button class="icon-btn icon-btn--soft" data-rail="${id}" data-dir="1" aria-label="Scroll forward">${icon.arrow}</button></div>
        </div>
      </div>
    </div>
    <div class="rail" data-rail-track="${id}">
      ${products.map((p) => `<div class="rail__item reveal">${productCard(p)}</div>`).join('')}
    </div>
  </section>`;
}

function routines() {
  return `<section class="section routines" id="routines" aria-labelledby="routines-title">
    <div class="container">
      <div class="section__head reveal">
        <div><p class="kicker">Routine builder</p><h2 id="routines-title" class="h2">Four steps to <em>your</em> kind of glow</h2></div>
      </div>
      <div class="tabs" role="tablist" aria-label="Routines">
        ${ROUTINES.map((r, i) => `<button role="tab" class="tab ${i === 0 ? 'is-active' : ''}" id="tab-${r.slug}" aria-controls="panel-${r.slug}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-routine="${r.slug}">${r.name}</button>`).join('')}
      </div>
      ${ROUTINES.map((r, i) => {
        const items = r.steps.map((s) => ({ ...s, p: byId(s.id) }));
        const total = items.reduce((n, s) => n + s.p.price, 0);
        return `<div class="routine" role="tabpanel" id="panel-${r.slug}" aria-labelledby="tab-${r.slug}" ${i === 0 ? '' : 'hidden'} style="--tint:${r.tint}">
          <div class="routine__intro">
            <h3 class="h3">${r.name}</h3>
            <p>${r.blurb}</p>
            <p class="routine__total">Full routine <strong>${money(total)}</strong></p>
            <button class="btn btn--primary" data-action="add-many" data-ids="${items.filter((s) => s.p.stock > 0).map((s) => s.id).join(',')}">${icon.bag} Add routine to bag</button>
          </div>
          <ol class="routine__steps">
            ${items
              .map(
                (s, n) => `<li class="step">
                  <a href="#/product/${s.p.id}" class="step__art">${productArt(s.p)}</a>
                  <span class="step__num">${String(n + 1).padStart(2, '0')} · ${s.label}</span>
                  <a href="#/product/${s.p.id}" class="step__name">${esc(s.p.name)}</a>
                  ${priceTag(s.p, 'price--sm')}
                </li>`,
              )
              .join('')}
          </ol>
        </div>`;
      }).join('')}
    </div>
  </section>`;
}

function concerns() {
  return `<section class="section" aria-labelledby="concern-title">
    <div class="container">
      <div class="section__head reveal"><div><p class="kicker">Shop by concern</p><h2 id="concern-title" class="h2">What’s your skin telling you?</h2></div></div>
      <div class="concerns">
        ${CONCERNS.map((c, i) => {
          const count = PRODUCTS.filter((p) => p.concerns.includes(c.slug)).length;
          return `<a class="concern reveal" href="#/shop/all?concern=${c.slug}" style="--tint:${CONCERN_TINTS[i]}">
            <span class="concern__name">${c.name}</span><span class="concern__count">${count} products ${icon.arrow}</span></a>`;
        }).join('')}
      </div>
    </div>
  </section>`;
}

function feature() {
  const kit = byId('glass-skin-starter-kit');
  return `<section class="section">
    <div class="container">
      <div class="feature reveal">
        <div class="feature__art">${productArt(kit, { view: 'flatlay' })}<span class="feature__stamp">Save<br><strong>${money(kit.compareAt - kit.price)}</strong></span></div>
        <div class="feature__copy">
          <p class="kicker kicker--light">The gifting edit</p>
          <h2 class="h2">The Glass Skin Starter Kit</h2>
          <p>Our four most-restocked heroes — toner, serum, cream and sunscreen — in a pink keepsake box with a handwritten note. Only ${kit.stock} left this week.</p>
          <div class="feature__price">${priceTag(kit, 'price--lg price--light')}</div>
          <div class="hero__ctas">
            <button class="btn btn--light" data-action="add" data-id="${kit.id}" data-open-cart>${icon.gift} Add to bag</button>
            <a class="btn btn--outline-light" href="#/shop/sets">All gift sets</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function feedbackWall() {
  return `<section class="section feedback" aria-labelledby="fb-title">
    <div class="container">
      <div class="section__head reveal">
        <div><p class="kicker">Feedback ✦</p><h2 id="fb-title" class="h2">Love notes from our community</h2></div>
        ${SITE.demoMode ? '<p class="muted small">Sample testimonials for this demo.</p>' : ''}
      </div>
      <div class="fb-grid">
        ${FEEDBACK.map((f, i) => {
          const p = byId(f.product);
          return `<figure class="fb reveal" style="--rot:${[-1.5, 1, -0.5, 1.5, -1, 0.5][i]}deg">
            ${stars(5, { size: 'rating--sm' })}
            <blockquote>“${esc(f.text)}”</blockquote>
            <figcaption><span class="fb__avatar">${esc(f.name[0])}</span><span><strong>${esc(f.name)}</strong>${esc(f.place)}</span>
              <a class="fb__product" href="#/product/${p.id}"><span>${productArt(p)}</span>${esc(p.name)}</a></figcaption>
          </figure>`;
        }).join('')}
      </div>
    </div>
  </section>`;
}

function promises() {
  const items = [
    [icon.shield, 'Sealed & authentic', 'Sourced from brands and authorised distributors only.'],
    [icon.truck, 'Pan-India delivery', `Free over ₹${SITE.freeShippingThreshold}. Mizoram in 1–3 days.`],
    [icon.chat, 'Real skin advice', 'DM us or drop by a store for a free consultation.'],
    [icon.gift, 'Wrapped with love', 'Every order packed by hand, with a little note.'],
  ];
  return `<section class="promises"><div class="container promises__row">
    ${items.map(([ic, t, d]) => `<div class="promise reveal"><span class="promise__icon">${ic}</span><div><strong>${t}</strong><p>${d}</p></div></div>`).join('')}
  </div></section>`;
}

function storesBlock() {
  return `<section class="section visit" aria-labelledby="visit-title">
    <div class="container visit__inner">
      <div class="visit__copy reveal">
        <p class="kicker">Come say hello</p>
        <h2 id="visit-title" class="h2">Three little stores,<br>one big pink welcome.</h2>
        <p>Swatch everything, ask us anything, and leave with a routine that fits. Open ${esc(SITE.hours)} — no appointment needed.</p>
        <a class="btn btn--primary" href="#/contact">${icon.pin} Find a store</a>
      </div>
      <ul class="visit__stores">
        ${SITE.stores.map((s, i) => `<li class="store-chip reveal" style="--i:${i}"><span class="store-chip__tag">${s.tag}</span><strong>${s.town}</strong><span>${icon.clock} 10 a.m. – 7 p.m.</span></li>`).join('')}
      </ul>
    </div>
  </section>`;
}

function newsletter() {
  return `<section class="section">
    <div class="container">
      <div class="club reveal">
        <div class="club__copy">
          <p class="sticker">${icon.sparkle} The Pui Club</p>
          <h2 class="h2">Early drops, restock alerts &amp; 10% off your first order.</h2>
          <p>One cheerful email a fortnight. Unsubscribe whenever you like.</p>
        </div>
        <form class="club__form" data-newsletter novalidate>
          <label class="sr-only" for="club-email">Email address</label>
          <input id="club-email" type="email" name="email" placeholder="you@example.com" required autocomplete="email">
          <button class="btn btn--primary" type="submit">Join the club</button>
          <p class="club__msg" role="status"></p>
        </form>
      </div>
    </div>
  </section>`;
}

export default function home() {
  const bestsellers = productsIn('bestsellers');
  const fresh = [...PRODUCTS].sort((a, b) => a.added - b.added).slice(0, 8);
  return {
    title: '',
    html: [
      hero(),
      stories(),
      rail({ id: 'best', kicker: 'Most loved', title: 'Bestsellers on repeat', href: '#/shop/bestsellers', products: bestsellers }),
      promises(),
      routines(),
      feature(),
      concerns(),
      rail({ id: 'fresh', kicker: 'Just landed', title: 'New in store', href: '#/shop/new', products: fresh }),
      feedbackWall(),
      storesBlock(),
      instagramSection(),
      newsletter(),
    ].join(''),
    mount(root) {
      // Rails: arrow buttons scroll by roughly one viewport of cards.
      root.querySelectorAll('[data-rail]').forEach((btn) =>
        btn.addEventListener('click', () => {
          const track = root.querySelector(`[data-rail-track="${btn.dataset.rail}"]`);
          track.scrollBy({ left: Number(btn.dataset.dir) * track.clientWidth * 0.8, behavior: 'smooth' });
        }),
      );

      // Routine tabs with arrow-key support.
      const tabs = [...root.querySelectorAll('[data-routine]')];
      const select = (tab) => {
        tabs.forEach((t) => {
          const on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on);
          t.tabIndex = on ? 0 : -1;
          root.querySelector(`#panel-${t.dataset.routine}`).hidden = !on;
        });
      };
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => select(t));
        t.addEventListener('keydown', (e) => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
          select(next);
          next.focus();
        });
      });

      // Newsletter: saved to Firestore when connected, otherwise demo only.
      root.querySelector('[data-newsletter]').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const msg = form.querySelector('.club__msg');
        const btn = form.querySelector('button');
        const email = form.email.value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          msg.textContent = 'Please enter a valid email address.';
          form.email.focus();
          return;
        }
        btn.disabled = true;
        try {
          const id = await save('newsletter', { email });
          msg.textContent = id ? 'You’re in! Watch your inbox for early drops.' : 'You’re in! (Demo — no email was stored or sent.)';
          form.classList.add('is-done');
          form.reset();
          toast('Welcome to the Pui Club ✦');
        } catch {
          msg.textContent = 'Sorry, that didn’t go through. Please try again in a moment.';
        } finally {
          btn.disabled = false;
        }
      });

      // Gentle pointer parallax on the hero stage.
      const stage = root.querySelector('[data-parallax]');
      let onMove = null;
      if (stage && !reducedMotion() && matchMedia('(pointer:fine)').matches) {
        const layers = [...stage.querySelectorAll('[data-depth]')];
        onMove = (e) => {
          const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
          layers.forEach((l) => {
            l.style.setProperty('--px', `${x * l.dataset.depth}px`);
            l.style.setProperty('--py', `${y * l.dataset.depth}px`);
          });
        };
        window.addEventListener('pointermove', onMove, { passive: true });
      }

      hydrateInstagram(root);
      return () => onMove && window.removeEventListener('pointermove', onMove);
    },
  };
}
