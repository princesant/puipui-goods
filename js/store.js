// App state: bag, wishlist, recently viewed, promo, user reviews and demo orders.
// Persisted to localStorage; components subscribe to changes.

import { storage } from './utils.js';
import { byId } from './data/products.js';
import { SITE } from './data/site.js';

const KEY = 'puipui:state:v1';
const initial = { cart: [], wishlist: [], recent: [], promo: null, reviews: {}, orders: [] };

let state = { ...initial, ...storage.get(KEY, {}) };
const listeners = new Set();

function commit(next, change = 'update') {
  state = { ...state, ...next };
  storage.set(KEY, state);
  listeners.forEach((fn) => fn(state, change));
}

export const getState = () => state;
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ---------- bag ---------- */
const lineKey = (id, shade) => `${id}::${shade ?? ''}`;

export function addToCart(id, { shade = null, qty = 1 } = {}) {
  const p = byId(id);
  if (!p || p.stock <= 0) return false;
  const chosenShade = shade ?? p.shades?.[0]?.name ?? null;
  const key = lineKey(id, chosenShade);
  const cart = [...state.cart];
  const line = cart.find((l) => l.key === key);
  if (line) line.qty = Math.min(p.stock, line.qty + qty);
  else cart.push({ key, id, shade: chosenShade, qty: Math.min(p.stock, qty) });
  commit({ cart }, 'cart:add');
  return true;
}

export function setQty(key, qty) {
  const cart = state.cart
    .map((l) => (l.key === key ? { ...l, qty: Math.max(0, Math.min(byId(l.id)?.stock ?? 99, qty)) } : l))
    .filter((l) => l.qty > 0);
  commit({ cart }, 'cart:qty');
}

export const removeLine = (key) => commit({ cart: state.cart.filter((l) => l.key !== key) }, 'cart:remove');
export const clearCart = () => commit({ cart: [], promo: null }, 'cart:clear');

export function cartLines() {
  return state.cart
    .map((l) => {
      const p = byId(l.id);
      if (!p) return null;
      const shadeObj = p.shades?.find((s) => s.name === l.shade);
      return { ...l, product: p, shadeHex: shadeObj?.hex ?? null, total: p.price * l.qty };
    })
    .filter(Boolean);
}

export const cartCount = () => state.cart.reduce((n, l) => n + l.qty, 0);

/** Price breakdown for the bag and checkout. */
export function totals({ shippingMethod = 'standard' } = {}) {
  const lines = cartLines();
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const savings = lines.reduce((s, l) => s + (l.product.compareAt ? (l.product.compareAt - l.product.price) * l.qty : 0), 0);
  let discount = 0;
  const promo = state.promo && SITE.promoCodes[state.promo];
  if (promo && (!promo.min || subtotal >= promo.min)) {
    discount = promo.type === 'percent' ? Math.round((subtotal * promo.value) / 100) : promo.value;
  }
  const method = SITE.shipping[shippingMethod] ?? SITE.shipping.standard;
  const freeShip = subtotal - discount >= SITE.freeShippingThreshold;
  const shipping = subtotal === 0 ? 0 : shippingMethod === 'standard' && freeShip ? 0 : method.price;
  return {
    lines,
    subtotal,
    savings,
    discount,
    promo: promo ? { code: state.promo, ...promo, applied: discount > 0 } : null,
    shipping,
    total: Math.max(0, subtotal - discount + shipping),
    toFreeShipping: Math.max(0, SITE.freeShippingThreshold - (subtotal - discount)),
  };
}

export function applyPromo(code) {
  const c = String(code || '').trim().toUpperCase();
  if (!SITE.promoCodes[c]) return { ok: false, message: 'That code isn’t valid. Try PUIPUI10.' };
  commit({ promo: c }, 'cart:promo');
  const promo = SITE.promoCodes[c];
  const { subtotal } = totals();
  if (promo.min && subtotal < promo.min) return { ok: true, message: `Code saved — it applies once your bag reaches ₹${promo.min.toLocaleString('en-IN')}.` };
  return { ok: true, message: `${c} applied: ${promo.label}.` };
}
export const removePromo = () => commit({ promo: null }, 'cart:promo');

/* ---------- wishlist & recently viewed ---------- */
export const isWished = (id) => state.wishlist.includes(id);
export function toggleWish(id) {
  const wished = isWished(id);
  commit({ wishlist: wished ? state.wishlist.filter((x) => x !== id) : [id, ...state.wishlist] }, 'wish');
  return !wished;
}
export function addRecent(id) {
  const recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 8);
  state = { ...state, recent };
  storage.set(KEY, state); // silent — no re-render needed
}

/* ---------- reviews written in this browser ---------- */
export function addReview(id, review) {
  const reviews = { ...state.reviews, [id]: [{ ...review, id: `u-${Date.now()}`, date: new Date().toISOString(), mine: true }, ...(state.reviews[id] ?? [])] };
  commit({ reviews }, 'review');
}
export const userReviews = (id) => state.reviews[id] ?? [];

/* ---------- demo orders ---------- */
// Only non-sensitive details are kept so the confirmation page can render.
export function saveOrder(order) {
  commit({ orders: [order, ...state.orders].slice(0, 5) }, 'order');
}
export const getOrder = (id) => state.orders.find((o) => o.id === id);
