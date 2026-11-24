// Instagram section. Shows curated tiles by default; if SITE.instagram.feedEndpoint
// is set, it fetches [{ image, permalink, caption }] and swaps in live posts.
import { esc } from '../utils.js';
import { productArt } from '../art.js';
import { byId } from '../data/products.js';
import { SITE } from '../data/site.js';
import { INSTAGRAM_TILES } from '../data/content.js';
import { icon } from './icons.js';

const ig = SITE.instagram;

function tile({ href, art, caption, kind }) {
  return `<a class="ig__tile reveal" href="${esc(href)}" target="_blank" rel="noopener" aria-label="${esc(caption)} — open on Instagram">
    ${art}
    ${kind === 'reel' ? `<span class="ig__kind" aria-hidden="true">${icon.play}</span>` : ''}
    <span class="ig__cap"><span>${icon.instagram}</span>${esc(caption)}</span>
  </a>`;
}

export function instagramSection({ title = 'Follow the glow', compact = false } = {}) {
  const tiles = INSTAGRAM_TILES.map((t) => {
    const p = byId(t.product);
    return tile({ href: ig.url, art: productArt(p, { view: t.view }), caption: t.caption, kind: t.kind });
  }).join('');
  return `<section class="section ig ${compact ? 'ig--compact' : ''}" aria-labelledby="ig-title">
    <div class="container">
      <div class="ig__head reveal">
        <div class="ig__profile">
          <span class="ig__avatar"><span class="logo__word">pui<span>pui</span></span></span>
          <div>
            <h2 id="ig-title" class="h2">${esc(title)}</h2>
            <p class="muted">@${ig.handle} · ${ig.followers}+ followers · new drops, swatches and store tours</p>
          </div>
        </div>
        <a class="btn btn--insta" href="${ig.url}" target="_blank" rel="noopener">${icon.instagram} Follow on Instagram</a>
      </div>
      <div class="ig__grid" data-ig-grid>${tiles}</div>
    </div>
  </section>`;
}

/** Swap in live posts when an endpoint is configured. Fails quietly to curated tiles. */
export async function hydrateInstagram(root) {
  if (!ig.feedEndpoint) return;
  const grid = root.querySelector('[data-ig-grid]');
  if (!grid) return;
  try {
    const res = await fetch(ig.feedEndpoint, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(res.statusText);
    const posts = (await res.json()).slice(0, 6);
    if (!posts.length) return;
    grid.innerHTML = posts
      .map((p) =>
        tile({
          href: p.permalink,
          art: `<img src="${esc(p.image)}" alt="" loading="lazy">`,
          caption: (p.caption || 'View on Instagram').slice(0, 60),
          kind: p.type === 'VIDEO' ? 'reel' : 'post',
        }),
      )
      .join('');
    grid.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  } catch {
    /* keep curated tiles */
  }
}
