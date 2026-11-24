import { productArt } from '../art.js';
import { esc, money, stars } from '../utils.js';
import { isOnSale } from '../data/products.js';
import { isWished } from '../store.js';
import { icon } from './icons.js';

const BADGE = { bestseller: 'Bestseller', new: 'New', limited: 'Limited' };

export function badgeList(p) {
  const out = p.badges.map((b) => `<span class="badge badge--${b}">${BADGE[b]}</span>`);
  if (isOnSale(p)) out.push(`<span class="badge badge--sale">−${Math.round((1 - p.price / p.compareAt) * 100)}%</span>`);
  if (p.stock === 0) out.unshift('<span class="badge badge--out">Sold out</span>');
  else if (p.stock <= 5) out.push(`<span class="badge badge--low">Only ${p.stock} left</span>`);
  return out.slice(0, 2).join('');
}

export function priceTag(p, cls = '') {
  return `<span class="price ${cls}"><span class="price__now">${money(p.price)}</span>${
    isOnSale(p) ? `<s class="price__was" aria-label="Was ${money(p.compareAt)}">${money(p.compareAt)}</s>` : ''
  }</span>`;
}

/** Product card used across grids and carousels. */
export function productCard(p, { size = '' } = {}) {
  const wished = isWished(p.id);
  const soldOut = p.stock === 0;
  return `<article class="card ${size}" data-product="${p.id}">
    <a class="card__media" href="#/product/${p.id}" aria-label="${esc(p.name)}" style="--tint:${p.art.bg}">
      ${productArt(p, { className: 'card__art' })}
      <span class="card__alt" aria-hidden="true">${productArt(p, { view: 'texture', className: 'card__art' })}</span>
      <span class="card__badges">${badgeList(p)}</span>
    </a>
    <button class="card__wish ${wished ? 'is-on' : ''}" data-action="wish" data-id="${p.id}" aria-pressed="${wished}" aria-label="${wished ? 'Remove from' : 'Save to'} wishlist: ${esc(p.name)}">${icon.heart}</button>
    <div class="card__body">
      <p class="card__brand">${esc(p.brand)}</p>
      <h3 class="card__title"><a href="#/product/${p.id}">${esc(p.name)}</a></h3>
      ${stars(p.rating, { count: p.reviewCount, size: 'rating--sm' })}
      <div class="card__foot">
        ${priceTag(p)}
        ${
          soldOut
            ? '<span class="card__sold">Sold out</span>'
            : `<button class="card__add" data-action="add" data-id="${p.id}" aria-label="Add ${esc(p.name)} to bag">${icon.plus}<span>Add</span></button>`
        }
      </div>
      ${p.shades ? `<div class="card__shades" aria-label="${p.shades.length} shades">${p.shades.slice(0, 5).map((s) => `<i style="background:${s.hex}" title="${esc(s.name)}"></i>`).join('')}</div>` : ''}
    </div>
  </article>`;
}
