import { PRODUCTS, CATEGORIES, isOnSale } from './products.js';

// A collection is a named, pre-filtered slice of the catalogue.
const curated = [
  { slug: 'all', name: 'Shop all', blurb: 'Every little good we stock, in one place.', tint: '#FFF3F8', filter: () => true },
  {
    slug: 'bestsellers',
    name: 'Bestsellers',
    blurb: 'The ones our community restocks again and again.',
    tint: '#FFE4EF',
    filter: (p) => p.badges.includes('bestseller'),
  },
  {
    slug: 'new',
    name: 'New in',
    blurb: 'Fresh arrivals, straight off the boat and onto our shelves.',
    tint: '#EEE6FF',
    filter: (p) => p.added <= 6 || p.badges.includes('new'),
  },
  {
    slug: 'under-499',
    name: 'Under ₹499',
    blurb: 'Little treats that don’t need a second thought.',
    tint: '#FFF0C9',
    filter: (p) => p.price <= 499,
  },
  { slug: 'sale', name: 'On sale', blurb: 'Soft prices on favourites, while they last.', tint: '#FFE8DC', filter: isOnSale },
];

export const COLLECTIONS = [
  ...curated,
  ...CATEGORIES.map((c) => ({ ...c, filter: (p) => p.category === c.slug, isCategory: true })),
];

export const getCollection = (slug) => COLLECTIONS.find((c) => c.slug === slug);
export const productsIn = (slug) => {
  const c = getCollection(slug);
  return c ? PRODUCTS.filter(c.filter) : [];
};
