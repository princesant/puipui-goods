// About page. The story copy is placeholder narrative for the demo — replace
// with Puipui Goods' real history before launch.
import { productArt } from '../art.js';
import { byId } from '../data/products.js';
import { SITE } from '../data/site.js';
import { icon } from '../ui/icons.js';
import { instagramSection, hydrateInstagram } from '../ui/instagram.js';

export default function about() {
  const a = byId('cloud-milk-barrier-cream');
  const b = byId('peach-fuzz-eyeshadow-palette');
  const c = byId('jelly-glass-lip-tint');
  const values = [
    [icon.shield, 'Only the real thing', 'Every product comes sealed from the brand or an authorised distributor. No testers, no decants, no grey market.'],
    [icon.chat, 'Advice, not upselling', 'We’ll happily talk you out of something that isn’t right for your skin. Ask us anything — in store or in the DMs.'],
    [icon.store, 'Rooted in Mizoram', 'From our first counter in Aizawl to stores in Lunglei and Siaha, we grew one neighbour at a time.'],
    [icon.truck, 'Open to all of India', 'Retail and wholesale, from the hills of the North East to every PIN code we can reach.'],
  ];
  return {
    title: 'Our story',
    html: `
    <section class="about-hero">
      <div class="container about-hero__inner">
        <div class="reveal">
          <p class="sticker sticker--tilt">${icon.sparkle} Our story</p>
          <h1 class="display">A little shop with<br>a very <em>pink</em> heart.</h1>
          <p class="lede">Puipui Goods started with a simple wish: make good skincare and makeup easy to find, honest to buy, and fun to talk about — right here in Mizoram.</p>
        </div>
        <div class="about-hero__collage" aria-hidden="true">
          <span class="c1">${productArt(a, { view: 'flatlay' })}</span>
          <span class="c2">${productArt(b)}</span>
          <span class="c3">${productArt(c, { view: 'texture' })}</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container about-story">
        <div class="about-story__col reveal">
          <h2 class="h2">From one counter to three stores</h2>
          <p>What began as a single shelf of K-beauty favourites in Aizawl has grown into three bright little stores in Aizawl, Lunglei and Siaha — and an online community of ${SITE.instagram.followers}+ people who swap routines, swatch shades and cheer each other on.</p>
          <p>We still unpack every delivery ourselves, test what we stock, and pack every parcel by hand. The pink tissue and handwritten notes? That’s just how we like to say thank you.</p>
        </div>
        <ul class="stats reveal">
          <li><strong>${SITE.instagram.followers}+</strong><span>friends on Instagram</span></li>
          <li><strong>3</strong><span>stores across Mizoram</span></li>
          <li><strong>Pan-India</strong><span>delivery from Aizawl</span></li>
          <li><strong>10–7</strong><span>open every working day</span></li>
        </ul>
      </div>
    </section>

    <section class="section values-wrap">
      <div class="container">
        <div class="section__head reveal"><div><p class="kicker">What we believe</p><h2 class="h2">Small shop, big promises</h2></div></div>
        <div class="values">${values.map(([ic, t, d]) => `<div class="value reveal"><span class="promise__icon">${ic}</span><h3 class="h3">${t}</h3><p>${d}</p></div>`).join('')}</div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="wholesale reveal">
          <div>
            <p class="kicker">For salons, boutiques & resellers</p>
            <h2 class="h2">Wholesale with Puipui</h2>
            <p>Stock the brands your customers ask for. We offer tiered pricing, mixed-brand cartons and quick dispatch across the North East and beyond.</p>
          </div>
          <a class="btn btn--primary btn--lg" href="#/contact?topic=wholesale">Make a wholesale enquiry ${icon.arrow}</a>
        </div>
      </div>
    </section>

    ${instagramSection({ title: 'Say hi on Instagram' })}`,
    mount(root) {
      hydrateInstagram(root);
    },
  };
}
