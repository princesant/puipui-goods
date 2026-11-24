# Puipui Goods — storefront concept

A front-end e-commerce site for **Puipui Goods** (skincare and cosmetics, Aizawl · Lunglei · Siaha, shipping across India), styled after the [@puipuii_goods](https://www.instagram.com/puipuii_goods/) Instagram look.

It uses plain HTML, CSS and JavaScript modules. There's no build step and no dependencies apart from Google Fonts.

## Run it

ES modules need a local server; opening `index.html` directly from disk won't work. From this folder, run:

```powershell
python -m http.server 5173
```

Then open http://localhost:5173. Any static server works, e.g. `npx serve`. To host it, upload the folder to any static host such as Netlify, Vercel, GitHub Pages or Cloudflare Pages. It uses hash routing (`#/shop`), so no server rewrites are needed.

## What's included

| Area | Route | Notes |
|---|---|---|
| Home | `#/` | Hero, category "story" bubbles, bestseller rail, routine builder (adds a whole routine to the bag), shop by concern, gift feature, feedback wall, stores, Instagram, newsletter |
| Collections | `#/shop`, `#/shop/<slug>` | Categories plus edits (`bestsellers`, `new`, `under-499`, `sale`). Filters (category, concern, skin type, price, sale, in stock), sorting and removable filter chips. Filters are kept in the URL, so filtered pages can be shared. Mobile uses a bottom sheet. |
| Product | `#/product/<id>` | Three-view gallery (swipe or thumbnails), shade swatches that recolour the product, quantity, wishlist, PIN-code delivery estimate, accordions, reviews (with a write-a-review form), related and recently viewed items, sticky mobile add-to-bag bar |
| Search | header icon or `/` key, `#/search?q=` | Instant weighted search across name, brand, type, concern and shade |
| Bag | drawer and `#/cart` | Free-delivery progress bar, quantity controls, promo codes (`PUIPUI10`, `GLOWUP`), add-ons |
| Checkout | `#/checkout` → `#/order/<id>` | **Demo only** (see below) |
| Wishlist | `#/wishlist` | |
| About, Contact, FAQs | `#/about`, `#/contact`, `#/faq` | Contact form with topic chips (`?topic=wholesale`). The FAQ page has live search. |

## Demo checkout: no real payments

- Checkout never asks for card, UPI or bank details. The payment step is a labelled placeholder.
- Banners on the bag, checkout and confirmation pages, plus a footer note, say that no payment is taken and nothing ships.
- "Place demo order" saves only a minimal record (first name, city, items and totals) in `localStorage` so the confirmation page can show it. If Firestore is connected, the same record goes to the `orders` collection. It never keeps email, phone or address.
- To go live, replace the `submit` handler in `js/pages/checkout.js` with a call to your backend. The backend should create the order and open a PCI-compliant payment gateway's hosted checkout. Card or UPI details should never touch your own code.

Set `demoMode: false` in `js/data/site.js` to hide all demo labels once real orders, payments and reviews are connected.

## What's real and what's sample content

**From the public Instagram bio:** store towns (Aizawl, Lunglei, Siaha), 10 a.m.–7 p.m. hours, pan-India shipping, wholesale and retail, the Google Maps link and the ~82K follower count. The brand colours and bubble-letter logo style are inspired by the profile. They are not the official logo file.

**Fictional:** every product, brand name (Puipui Lab, Kumo Kumo, Mochi Moon, Petal Theory, Hana & Haze), price, rating, ingredient list, review, testimonial, the About story and statistics, the email address (`.example` domain), store street addresses and the promo codes. Product images are illustrated SVG renders, not photographs.

**Before launch, replace:**
- [ ] `js/data/products.js`: real catalogue. Add `image: 'assets/products/xyz.jpg'` to any product to use a photo instead of the illustration.
- [ ] `js/data/site.js`: email, store addresses, opening days, shipping prices and promo codes
- [ ] `js/pages/about.js`: the real story
- [ ] `js/data/reviews.js`: real reviews from a reviews provider, or remove the sample ones
- [ ] Ingredient lists and product claims, which need checking against packaging and India's cosmetics labelling rules

## Instagram

`js/ui/instagram.js` shows curated tiles that link to the profile. Instagram doesn't allow a browser-only site to pull a feed directly. For a live feed, set `SITE.instagram.feedEndpoint` to a URL that returns JSON in this shape:

```json
[{ "image": "https://…", "permalink": "https://www.instagram.com/p/…", "caption": "…", "type": "IMAGE" }]
```

That URL could be your own small serverless proxy for the Instagram Graph API, or a feed widget service's JSON URL. The grid swaps in live posts automatically and falls back to the curated tiles if the request fails.

## Database (Firebase Firestore)

The site connects to Firestore once `js/data/firebase-config.js` holds your project's web config. Until then everything runs in the browser only.

| Collection | What's saved | Who can read it |
|---|---|---|
| `reviews` | product id, star rating, headline, review, first name | Everyone (shown on product pages) |
| `orders` | demo order ref, first name, city, state, delivery and payment choice, items and totals | Only you, in the Firebase console |
| `newsletter` | email | Only you |
| `messages` | contact form name, email, topic and message | Only you |

Demo orders never include email, phone, address or payment details.

**Set up**
1. In the [Firebase console](https://console.firebase.google.com/), create a project, then go to *Build → Firestore Database → Create database* (production mode, region `asia-south1` (Mumbai) is closest).
2. Go to *Project settings → General → Your apps* and add a **Web app**. Copy the `firebaseConfig` object into `js/data/firebase-config.js`.
3. Publish the security rules. Either paste `firestore.rules` into *Firestore → Rules → Publish*, or run:
   ```powershell
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules --project <your-project-id>
   ```
4. Commit and push. GitHub Pages redeploys automatically.

The web config isn't secret. The rules are what protect the data: every write is create-only and checked field by field, and nothing except reviews can be read from the site. Before a real launch, consider turning on [App Check](https://firebase.google.com/docs/app-check) to limit spam submissions, and moderating reviews.

## Code map

```
index.html            shell: header, main, footer, panels
css/base.css          design tokens (colours, type, radii, motion), reset, buttons, forms
css/components.css    header, mega menu, panels, cards, chips, bag lines, toasts, footer
css/pages.css         page sections
js/main.js            hash router + global click/submit delegation
js/store.js           bag, wishlist, promo, reviews, demo orders (localStorage, pub/sub)
js/db.js              Firestore layer (lazy-loads the Firebase SDK only when configured)
firestore.rules       Firestore security rules (create-only, validated)
js/art.js             SVG product renderer (hero / texture / flat-lay views)
js/data/              catalogue, collections, reviews, FAQs, routines, site settings
js/ui/                layout, product card, bag drawer, search, panels, Instagram, feedback
js/pages/             one module per route: returns { title, html, mount() }
```

To add a page, create `js/pages/x.js` and register it in `ROUTES` in `js/main.js`. To add a product, add an entry to `PRODUCTS` with an `art` palette. Shapes available: `jar, tube, pump, dropper, toner, compact, palette, lipstick, tint, stick, mask, mist, sponge, brush, box`.

## Accessibility and motion

The site has semantic landmarks, a skip link, visible focus styles, focus-trapped panels that close with Esc, ARIA tabs for routines, live regions for search and the bag, and form validation that points to each error. Animations are switched off when the visitor's system asks for reduced motion.
