import { esc, money, stars, formatDate } from '../utils.js';
import { productArt, ART_VIEWS } from '../art.js';
import { PRODUCTS, byId, categoryName, CONCERNS, isOnSale } from '../data/products.js';
import { SITE } from '../data/site.js';
import { sampleReviews, ratingBreakdown } from '../data/reviews.js';
import { productCard, badgeList, priceTag } from '../ui/card.js';
import { icon } from '../ui/icons.js';
import { toast } from '../ui/feedback.js';
import { isWished, addRecent, addReview, userReviews, getState } from '../store.js';
import notFound from './notfound.js';
import { save, fetchReviews, dbEnabled } from '../db.js';

const VIEW_LABEL = { hero: 'Product', texture: 'Texture', flatlay: 'Styled' };

function gallery(p, shade) {
  return `<div class="gallery">
    <div class="gallery__stage" data-stage tabindex="0" aria-label="Product images, swipe or use the thumbnails">
      ${ART_VIEWS.map((v, i) => `<figure class="gallery__slide" data-slide="${i}">${productArt(p, { view: v, shade })}</figure>`).join('')}
    </div>
    <div class="gallery__thumbs" role="tablist" aria-label="Choose image">
      ${ART_VIEWS.map((v, i) => `<button class="gallery__thumb ${i === 0 ? 'is-active' : ''}" data-thumb="${i}" role="tab" aria-selected="${i === 0}" aria-label="${VIEW_LABEL[v]} image">${productArt(p, { view: v, shade })}</button>`).join('')}
    </div>
    <span class="gallery__badges">${badgeList(p)}</span>
  </div>`;
}

function deliveryEstimate(pin) {
  if (!/^[1-9]\d{5}$/.test(pin)) return { ok: false, text: 'Please enter a valid 6-digit PIN code.' };
  const zone = pin.slice(0, 3);
  if (zone === '796') return { ok: true, text: 'Mizoram — usually 1–3 working days. Free pick-up in Aizawl, Lunglei & Siaha.' };
  if (/^7[89]/.test(pin)) return { ok: true, text: 'North East — usually 3–5 working days.' };
  return { ok: true, text: 'Rest of India — usually 4–7 working days. Cash on delivery available.' };
}

function reviewTag(r) {
  if (r.mine) return '<span class="tag">Your review</span>';
  if (r.community) return '<span class="tag tag--ok">Customer review</span>';
  return SITE.demoMode ? '<span class="tag">Sample review</span>' : `<span class="tag tag--ok">${icon.check} Verified purchase</span>`;
}

function reviewCard(r) {
  return `<article class="review">
    <header>${stars(r.rating, { size: 'rating--sm' })}<span class="review__date">${formatDate(r.date)}</span></header>
    <h3>${esc(r.title)}</h3>
    <p>${esc(r.body)}</p>
    <footer><span class="review__avatar">${esc(r.name[0])}</span><strong>${esc(r.name)}</strong>${r.place ? `<span>${esc(r.place)}</span>` : ''}${reviewTag(r)}${r.shade ? `<span class="muted">Shade: ${esc(r.shade)}</span>` : ''}</footer>
  </article>`;
}

function reviewsBlock(p) {
  const mine = userReviews(p.id);
  const sample = sampleReviews(p, 4);
  const all = [...mine, ...sample];
  const breakdown = ratingBreakdown(p);
  return `<section class="section reviews" id="reviews" aria-labelledby="reviews-title">
    <div class="container reviews__inner">
      <div class="reviews__summary">
        <h2 id="reviews-title" class="h2">Reviews</h2>
        <p class="reviews__score">${p.rating.toFixed(1)}</p>
        ${stars(p.rating, { size: 'rating--lg' })}
        <p class="muted">Based on ${p.reviewCount + mine.length} reviews</p>
        <ul class="bars">${breakdown.map((pct, i) => `<li><span>${5 - i}★</span><span class="bars__track"><span style="width:${pct}%"></span></span><span>${pct}%</span></li>`).join('')}</ul>
        <button class="btn btn--ghost btn--block" data-write-review>${icon.sparkle} Write a review</button>
        ${SITE.demoMode ? '<p class="muted small">Reviews shown are sample content for this demo store.</p>' : ''}
      </div>
      <div class="reviews__list">
        <form class="review-form" data-review-form hidden novalidate>
          <h3 class="h3">Share your thoughts</h3>
          <fieldset class="star-input"><legend>Your rating</legend>
            ${[5, 4, 3, 2, 1].map((n) => `<input type="radio" id="star-${n}" name="rating" value="${n}" ${n === 5 ? 'checked' : ''}><label for="star-${n}" aria-label="${n} stars">★</label>`).join('')}
          </fieldset>
          <div class="field"><label for="rv-title">Headline</label><input id="rv-title" name="title" required maxlength="80" placeholder="Sum it up in a few words"></div>
          <div class="field"><label for="rv-body">Review</label><textarea id="rv-body" name="body" required rows="4" maxlength="800" placeholder="How did it feel, look and last?"></textarea></div>
          <div class="field"><label for="rv-name">First name</label><input id="rv-name" name="name" required maxlength="30" autocomplete="given-name"></div>
          <p class="muted small">${dbEnabled() ? 'Your review and first name will be shown publicly on this page.' : 'Demo: your review is saved only in this browser.'}</p>
          <p class="field__error" data-review-error role="alert"></p>
          <div class="review-form__actions"><button type="button" class="btn btn--link" data-cancel-review>Cancel</button><button class="btn btn--primary">Post review</button></div>
        </form>
        <div data-community-reviews></div>
        ${all.map(reviewCard).join('')}
      </div>
    </div>
  </section>`;
}

export default function product({ params }) {
  const p = byId(params[0]);
  if (!p) return notFound();
  let shade = p.shades?.[0] ?? null;
  const soldOut = p.stock === 0;
  const related = PRODUCTS.filter((x) => x.id !== p.id && (x.category === p.category || x.concerns.some((c) => p.concerns.includes(c)))).sort((a, b) => b.rating - a.rating).slice(0, 4);
  const recent = getState().recent.filter((id) => id !== p.id).map(byId).filter(Boolean).slice(0, 4);
  addRecent(p.id);

  const concernNames = p.concerns.map((c) => CONCERNS.find((x) => x.slug === c)?.name).filter(Boolean);

  return {
    title: p.name,
    html: `
    <div class="container">
      <nav class="crumbs crumbs--pad" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span><a href="#/shop/${p.category}">${categoryName(p.category)}</a><span>/</span><span aria-current="page">${esc(p.name)}</span></nav>
    </div>
    <section class="container pdp">
      <div class="pdp__gallery" data-gallery>${gallery(p, shade?.hex)}</div>
      <div class="pdp__info">
        <p class="pdp__brand">${esc(p.brand)} · ${esc(p.type)}</p>
        <h1 class="pdp__title">${esc(p.name)}</h1>
        <a href="#reviews" class="pdp__rating">${stars(p.rating, { count: p.reviewCount })}</a>
        <div class="pdp__price">${priceTag(p, 'price--lg')}${isOnSale(p) ? `<span class="badge badge--sale">Save ${money(p.compareAt - p.price)}</span>` : ''}</div>
        <p class="muted small">Inclusive of all taxes · ${esc(p.size)}</p>
        <p class="pdp__short">${esc(p.short)}</p>

        ${
          p.shades
            ? `<fieldset class="shades"><legend>Shade: <strong data-shade-name>${esc(shade.name)}</strong></legend>
              <div class="shades__row">${p.shades.map((s, i) => `<label class="shade" title="${esc(s.name)}"><input type="radio" name="shade" value="${esc(s.name)}" data-hex="${s.hex}" ${i === 0 ? 'checked' : ''}><span style="background:${s.hex}"></span><span class="sr-only">${esc(s.name)}</span></label>`).join('')}</div>
            </fieldset>`
            : ''
        }

        <div class="buy" data-buy>
          <div class="qty qty--lg" role="group" aria-label="Quantity">
            <button data-step="-1" aria-label="Decrease quantity" ${soldOut ? 'disabled' : ''}>${icon.minus}</button>
            <output data-qty>1</output>
            <button data-step="1" aria-label="Increase quantity" ${soldOut ? 'disabled' : ''}>${icon.plus}</button>
          </div>
          ${
            soldOut
              ? `<button class="btn btn--primary btn--lg buy__add" disabled>Sold out</button>`
              : `<button class="btn btn--primary btn--lg buy__add" data-action="add" data-id="${p.id}" data-shade="${esc(shade?.name ?? '')}" data-qty="1" data-open-cart>${icon.bag} Add to bag · <span data-buy-total>${money(p.price)}</span></button>`
          }
          <button class="icon-btn icon-btn--outline buy__wish ${isWished(p.id) ? 'is-on' : ''}" data-action="wish" data-id="${p.id}" aria-pressed="${isWished(p.id)}" aria-label="Save to wishlist">${icon.heart}</button>
        </div>
        ${soldOut ? `<p class="stock stock--out">${icon.info} Sold out — restocks usually land within two weeks. Follow us on Instagram for alerts.</p>` : p.stock <= 5 ? `<p class="stock stock--low">${icon.sparkle} Hurry, only ${p.stock} left in stock</p>` : `<p class="stock">${icon.check} In stock and ready to ship from Aizawl</p>`}

        <ul class="pdp__highlights">${p.highlights.map((h) => `<li>${icon.sparkle}${esc(h)}</li>`).join('')}</ul>

        <form class="pin" data-pin novalidate>
          <label for="pin-input">${icon.truck} Check delivery</label>
          <div class="pin__row"><input id="pin-input" inputmode="numeric" maxlength="6" placeholder="Enter PIN code" autocomplete="postal-code"><button class="btn btn--ghost btn--sm">Check</button></div>
          <p class="pin__msg" role="status"></p>
        </form>

        <div class="accordion">
          <details open><summary>Details ${icon.plus}</summary><div><p>${esc(p.description)}</p>${concernNames.length ? `<p class="muted small">Good for: ${concernNames.join(', ')}</p>` : ''}</div></details>
          <details><summary>How to use ${icon.plus}</summary><div><p>${esc(p.howTo)}</p></div></details>
          <details><summary>Ingredients ${icon.plus}</summary><div><p class="small">${esc(p.ingredients)}</p><p class="muted small">Ingredient lists may change; please check the packaging before use.</p></div></details>
          <details><summary>Shipping & returns ${icon.plus}</summary><div><p>Free standard delivery over ₹${SITE.freeShippingThreshold}. Unopened products can be returned within 7 days. Damaged on arrival? We’ll replace it, no fuss.</p></div></details>
        </div>
      </div>
    </section>

    ${reviewsBlock(p)}

    <section class="section"><div class="container">
      <div class="section__head"><div><p class="kicker">Pairs beautifully with</p><h2 class="h2">You might also love</h2></div></div>
      <div class="grid grid--4">${related.map((x) => `<div class="reveal">${productCard(x)}</div>`).join('')}</div>
    </div></section>

    ${
      recent.length
        ? `<section class="section section--tight"><div class="container">
        <div class="section__head"><div><p class="kicker">Picking up where you left off</p><h2 class="h2">Recently viewed</h2></div></div>
        <div class="grid grid--4">${recent.map((x) => `<div class="reveal">${productCard(x)}</div>`).join('')}</div>
      </div></section>`
        : ''
    }

    <div class="sticky-buy" data-sticky-buy aria-hidden="true">
      <span class="sticky-buy__art">${productArt(p, { shade: shade?.hex })}</span>
      <span class="sticky-buy__info"><strong>${esc(p.name)}</strong>${priceTag(p, 'price--sm')}</span>
      ${soldOut ? '' : `<button class="btn btn--primary btn--sm" data-action="add" data-id="${p.id}" data-shade="${esc(shade?.name ?? '')}" data-open-cart tabindex="-1">Add to bag</button>`}
    </div>`,

    mount(root) {
      let qty = 1;
      const addBtns = root.querySelectorAll(`[data-action="add"][data-id="${p.id}"]`);
      const qtyOut = root.querySelector('[data-qty]');
      const totalOut = root.querySelector('[data-buy-total]');

      root.querySelectorAll('[data-step]').forEach((b) =>
        b.addEventListener('click', () => {
          qty = Math.max(1, Math.min(p.stock, qty + Number(b.dataset.step)));
          qtyOut.textContent = qty;
          if (totalOut) totalOut.textContent = money(p.price * qty);
          addBtns.forEach((btn) => (btn.dataset.qty = qty));
        }),
      );

      // Gallery: thumbnails scroll the stage; scrolling the stage updates thumbs.
      const wireGallery = () => {
        const stage = root.querySelector('[data-stage]');
        const thumbs = [...root.querySelectorAll('[data-thumb]')];
        thumbs.forEach((t) => t.addEventListener('click', () => stage.scrollTo({ left: stage.clientWidth * Number(t.dataset.thumb), behavior: 'smooth' })));
        stage.addEventListener(
          'scroll',
          () => {
            const i = Math.round(stage.scrollLeft / stage.clientWidth);
            thumbs.forEach((t, n) => {
              t.classList.toggle('is-active', n === i);
              t.setAttribute('aria-selected', n === i);
            });
          },
          { passive: true },
        );
        stage.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') stage.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * stage.clientWidth, behavior: 'smooth' });
        });
      };
      wireGallery();

      // Shade swatches recolour the product renders.
      root.querySelectorAll('input[name="shade"]').forEach((input) =>
        input.addEventListener('change', () => {
          shade = p.shades.find((s) => s.name === input.value);
          root.querySelector('[data-shade-name]').textContent = shade.name;
          const stage = root.querySelector('[data-stage]');
          const at = stage.scrollLeft;
          root.querySelector('[data-gallery]').innerHTML = gallery(p, shade.hex);
          root.querySelector('[data-stage]').scrollLeft = at;
          root.querySelector('.sticky-buy__art').innerHTML = productArt(p, { shade: shade.hex });
          wireGallery();
          addBtns.forEach((btn) => (btn.dataset.shade = shade.name));
        }),
      );

      // Delivery estimate (illustrative zones only).
      root.querySelector('[data-pin]').addEventListener('submit', (e) => {
        e.preventDefault();
        const input = root.querySelector('#pin-input');
        const res = deliveryEstimate(input.value.trim());
        const msg = root.querySelector('.pin__msg');
        msg.textContent = res.text;
        msg.classList.toggle('is-error', !res.ok);
      });

      // Review form (stored locally).
      const form = root.querySelector('[data-review-form]');
      root.querySelector('[data-write-review]').addEventListener('click', () => {
        form.hidden = false;
        form.querySelector('#rv-title').focus();
      });
      root.querySelector('[data-cancel-review]').addEventListener('click', () => (form.hidden = true));
      const community = root.querySelector('[data-community-reviews]');
      fetchReviews(p.id)
        .then((list) => {
          if (list.length && community.isConnected) community.innerHTML = list.map(reviewCard).join('');
        })
        .catch((err) => console.warn('[puipui] Could not load reviews', err));

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const missing = ['title', 'body', 'name'].filter((k) => !String(fd.get(k)).trim());
        form.querySelectorAll('.field').forEach((f) => f.classList.remove('has-error'));
        if (missing.length) {
          missing.forEach((k) => form.querySelector(`[name="${k}"]`).closest('.field').classList.add('has-error'));
          form.querySelector(`[name="${missing[0]}"]`).focus();
          return;
        }
        const review = { rating: Number(fd.get('rating')), title: fd.get('title').trim(), body: fd.get('body').trim(), name: fd.get('name').trim() };

        if (!dbEnabled()) {
          addReview(p.id, { ...review, place: '' });
          toast('Thanks! Your review is live (in this browser).');
          const y = window.scrollY;
          dispatchEvent(new HashChangeEvent('hashchange'));
          requestAnimationFrame(() => window.scrollTo(0, y));
          return;
        }

        const btn = form.querySelector('button.btn--primary');
        const err = form.querySelector('[data-review-error]');
        btn.disabled = true;
        err.textContent = '';
        try {
          await save('reviews', { productId: p.id, ...review });
          community.insertAdjacentHTML('afterbegin', reviewCard({ ...review, date: new Date().toISOString(), mine: true }));
          form.reset();
          form.hidden = true;
          toast('Thanks! Your review is now live.');
        } catch {
          err.textContent = 'Sorry, your review didn’t post. Please try again.';
        } finally {
          btn.disabled = false;
        }
      });

      // Sticky add-to-bag once the main button scrolls away.
      const buy = root.querySelector('[data-buy]');
      const sticky = root.querySelector('[data-sticky-buy]');
      let ticking = false;
      let shown = false;
      const check = () => {
        ticking = false;
        const show = buy.getBoundingClientRect().bottom < 0;
        if (show === shown) return;
        shown = show;
        sticky.classList.toggle('is-on', show);
        sticky.setAttribute('aria-hidden', !show);
        sticky.querySelector('button')?.setAttribute('tabindex', show ? '0' : '-1');
      };
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(check);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    },
  };
}
