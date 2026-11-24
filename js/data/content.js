// Editorial content: routines, FAQs and curated Instagram tiles.
// All copy is sample content for the demo storefront.

export const ROUTINES = [
  {
    slug: 'glass-skin',
    name: 'Glass skin',
    blurb: 'Hydrate in layers for a clear, lit-from-within finish.',
    tint: '#FFE4EF',
    steps: [
      { label: 'Cleanse', id: 'green-tea-gel-cleanser' },
      { label: 'Tone', id: 'rice-water-glow-toner' },
      { label: 'Treat', id: 'ceramide-dew-serum' },
      { label: 'Protect', id: 'sun-mochi-airy-sunscreen' },
    ],
  },
  {
    slug: 'calm-clear',
    name: 'Calm & clear',
    blurb: 'Clear pores and soothe breakouts without stripping.',
    tint: '#E3F4EC',
    steps: [
      { label: 'Cleanse', id: 'mung-bean-pore-cleanser' },
      { label: 'Treat', id: 'niacinamide-clarifying-serum' },
      { label: 'Soothe', id: 'cica-calm-sheet-mask' },
      { label: 'Moisturise', id: 'cloud-milk-barrier-cream' },
    ],
  },
  {
    slug: 'peachy-day',
    name: 'Peachy day look',
    blurb: 'Soft-focus base, warm eyes and a juicy lip in ten minutes.',
    tint: '#FFE8DC',
    steps: [
      { label: 'Base', id: 'cloud-cushion-foundation' },
      { label: 'Eyes', id: 'peach-fuzz-eyeshadow-palette' },
      { label: 'Cheeks', id: 'cheek-bubble-blush-stick' },
      { label: 'Lips', id: 'jelly-glass-lip-tint' },
    ],
  },
];

export const FAQS = [
  {
    topic: 'Orders',
    items: [
      ['How do I place an order?', 'Add products to your bag, open the bag and choose Checkout. You will receive an order confirmation by email and SMS once your order is placed. (In this demo store, no real orders are placed.)'],
      ['Can I change or cancel my order?', 'Message us on Instagram or email within two hours of ordering and we will do our best to update it before it is packed.'],
      ['Do you sell wholesale?', 'Yes — we supply salons, boutiques and resellers across the North East. Use the Contact page and choose “Wholesale enquiry”.'],
    ],
  },
  {
    topic: 'Shipping',
    items: [
      ['Where do you deliver?', 'We ship across India. Orders within Mizoram usually arrive in 1–3 working days and the rest of India in 3–7 working days.'],
      ['How much is shipping?', 'Standard delivery is ₹79, and free on orders over ₹999. Express delivery is ₹149. Pick-up from our Aizawl, Lunglei or Siaha stores is always free.'],
      ['How do I track my parcel?', 'Once your order ships you will receive a tracking link by SMS and email.'],
    ],
  },
  {
    topic: 'Returns',
    items: [
      ['What is your return policy?', 'Unopened products can be returned within 7 days of delivery. For hygiene reasons we cannot accept opened cosmetics unless they arrived damaged.'],
      ['My product arrived damaged', 'We are so sorry! Send us a photo within 48 hours of delivery and we will replace it free of charge.'],
    ],
  },
  {
    topic: 'Products',
    items: [
      ['Are your products authentic?', 'Every product is sourced from brands or their authorised distributors, and arrives sealed. We never sell testers or decants.'],
      ['Can you help me choose products for my skin?', 'Absolutely. Send us a DM on Instagram with your skin type and concerns, or visit any of our stores for a free consultation.'],
      ['Do you patch test?', 'We always recommend patch testing new skincare on your inner arm for 24 hours before applying to your face.'],
    ],
  },
  {
    topic: 'Payments',
    items: [
      ['Which payment methods do you accept?', 'The live store would accept UPI, cards, net banking and cash on delivery through a secure payment partner. This demo storefront does not take any payments.'],
      ['Is cash on delivery available?', 'Cash on delivery would be available on orders up to ₹5,000 in most PIN codes.'],
    ],
  },
];

// Curated tiles for the Instagram section (used when no live feed is configured).
export const INSTAGRAM_TILES = [
  { product: 'peach-fuzz-eyeshadow-palette', caption: 'Peach Fuzz palette swatches', kind: 'reel', view: 'texture' },
  { product: 'cloud-milk-barrier-cream', caption: 'Restocked: Cloud Milk', kind: 'post', view: 'hero' },
  { product: 'jelly-glass-lip-tint', caption: 'Five jelly tints, one wall', kind: 'reel', view: 'flatlay' },
  { product: 'sun-mochi-airy-sunscreen', caption: 'No white cast test', kind: 'reel', view: 'texture' },
  { product: 'glass-skin-starter-kit', caption: 'Gift wrapping season', kind: 'post', view: 'flatlay' },
  { product: 'ceramide-dew-serum', caption: 'Night routine, part 1', kind: 'reel', view: 'hero' },
];
