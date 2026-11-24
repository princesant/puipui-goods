// Store-wide settings. Facts marked (IG) come from the public @puipuii_goods
// Instagram bio; everything else is sample content to replace before launch.

export const SITE = {
  name: 'Puipui Goods',
  tagline: 'Skincare & cosmetics, picked with love in Aizawl',
  // Set to false once real products, reviews and payments are connected.
  demoMode: true,
  currency: 'INR',
  freeShippingThreshold: 999,
  shipping: {
    standard: { label: 'Standard delivery', price: 79, eta: '3–7 working days' },
    express: { label: 'Express delivery', price: 149, eta: '1–3 working days' },
    pickup: { label: 'Pick up in store', price: 0, eta: 'Ready in 2 hours' },
  },
  // Demo-only promo codes, shown in the cart so testers can try them.
  promoCodes: {
    PUIPUI10: { type: 'percent', value: 10, label: '10% off your order' },
    GLOWUP: { type: 'flat', value: 150, label: '₹150 off orders over ₹1,499', min: 1499 },
  },
  hours: '10 a.m. – 7 p.m.', // (IG) — confirm days of operation before launch
  stores: [
    // (IG) store towns. Street addresses are placeholders.
    { town: 'Aizawl', note: 'Flagship store', address: 'Store address to be added, Aizawl, Mizoram', tag: 'Flagship' },
    { town: 'Lunglei', note: 'Neighbourhood store', address: 'Store address to be added, Lunglei, Mizoram', tag: 'Store' },
    { town: 'Siaha', note: 'Neighbourhood store', address: 'Store address to be added, Siaha, Mizoram', tag: 'Store' },
  ],
  mapUrl: 'https://maps.app.goo.gl/pH6HnvYJAK6cVvvE7', // (IG) bio link
  email: 'hello@puipuigoods.example', // placeholder domain
  instagram: {
    handle: 'puipuii_goods',
    url: 'https://www.instagram.com/puipuii_goods/',
    followers: '82K', // (IG) 82.2K at time of build
    // Optional: a JSON endpoint returning [{ image, permalink, caption }] —
    // e.g. your own serverless proxy for the Instagram Graph API. Leave empty
    // to show the curated tiles in js/data/instagram.js.
    feedEndpoint: '',
  },
};
