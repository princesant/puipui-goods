import { esc, plural } from '../utils.js';
import { search } from '../ui/search.js';
import { productCard } from '../ui/card.js';
import { icon } from '../ui/icons.js';
import { productsIn } from '../data/collections.js';

export default function searchPage({ query }) {
  const q = (query.get('q') || '').trim();
  const found = q ? search(q) : [];
  const fallback = productsIn('bestsellers').slice(0, 4);
  return {
    title: q ? `Search: ${q}` : 'Search',
    html: `<section class="container page-pad">
      <form class="search-page__bar" data-search-page role="search">
        ${icon.search}
        <label class="sr-only" for="sp-q">Search products</label>
        <input id="sp-q" name="q" type="search" value="${esc(q)}" placeholder="Search products, brands, concerns">
        <button class="btn btn--primary btn--sm">Search</button>
      </form>
      ${
        q
          ? `<h1 class="display display--sm">${found.length ? `${plural(found.length, 'result')} for <em>“${esc(q)}”</em>` : `No results for <em>“${esc(q)}”</em>`}</h1>`
          : '<h1 class="display display--sm">What are you looking for?</h1>'
      }
      ${
        found.length
          ? `<div class="grid grid--4">${found.map((p) => `<div class="reveal">${productCard(p)}</div>`).join('')}</div>`
          : `<p class="lede">Try a product type (“toner”), a concern (“acne”) or a shade (“lychee”). Or start with these favourites:</p>
             <div class="grid grid--4">${fallback.map((p) => `<div class="reveal">${productCard(p)}</div>`).join('')}</div>`
      }
    </section>`,
    mount(root) {
      root.querySelector('[data-search-page]').addEventListener('submit', (e) => {
        e.preventDefault();
        const v = e.currentTarget.q.value.trim();
        location.hash = `#/search?q=${encodeURIComponent(v)}`;
      });
    },
  };
}
