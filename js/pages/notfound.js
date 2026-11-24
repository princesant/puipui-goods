import { icon } from '../ui/icons.js';

export default function notFound() {
  return {
    title: 'Page not found',
    html: `<section class="container page-pad"><div class="empty empty--page">
      <div class="empty__blob empty__blob--big">404</div>
      <h1 class="display display--sm">This page wandered off</h1>
      <p>It might have sold out, moved shelves or never existed. Let’s get you somewhere lovely.</p>
      <div class="hero__ctas hero__ctas--center"><a class="btn btn--primary" href="#/">Back home</a><a class="btn btn--ghost" href="#/shop">${icon.bag} Shop all</a></div>
    </div></section>`,
  };
}
