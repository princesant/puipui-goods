// Sample reviews for the demo store. Names, places and text are fictional.
// Reviews are picked deterministically per product so they stay stable.
import { hashStr, rng } from '../utils.js';

const PEOPLE = [
  ['Lalremruati K.', 'Aizawl'], ['Mapuii H.', 'Lunglei'], ['Zoremsangi R.', 'Aizawl'], ['Priya S.', 'Bengaluru'],
  ['Nunui T.', 'Siaha'], ['Ananya B.', 'Guwahati'], ['Rosy L.', 'Shillong'], ['Tetei V.', 'Champhai'],
  ['Sneha M.', 'Pune'], ['Jenny Z.', 'Aizawl'], ['Ruth L.', 'Imphal'], ['Kimi P.', 'Kohima'],
  ['Aditi R.', 'Delhi'], ['Mesepuii C.', 'Lunglei'], ['Ishita D.', 'Kolkata'], ['Hmingthansangi F.', 'Kolasib'],
];

const POOLS = {
  skincare: [
    ['Holy grail status', 'I have tried so many and this is the one I keep coming back to. My skin feels calm and bouncy the next morning.'],
    ['Gentle and effective', 'My sensitive skin did not react at all, and after two weeks the texture is noticeably smoother.'],
    ['Perfect for humid weather', 'Lightweight enough for Aizawl summers, never sticky, layers well under sunscreen.'],
    ['Lovely, but give it time', 'Took about three weeks to see a real difference, but now I am hooked. Packaging is so cute too.'],
    ['Fast delivery, sealed product', 'Arrived in four days to Guwahati, properly sealed with a sweet handwritten note.'],
    ['Repurchasing!', 'On my third bottle now. My sister stole my last one so I had to buy two this time.'],
    ['Good, not magic', 'Does exactly what it says. Not a miracle, but a reliable everyday step.'],
  ],
  makeup: [
    ['Blends like butter', 'The pigment is buildable and it never looks patchy. Lasted through a full wedding day.'],
    ['Shade match is spot on', 'The team helped me pick my shade over Instagram DM and it is perfect.'],
    ['My everyday go-to', 'Quick, easy, natural looking. I get compliments every time I wear it.'],
    ['Beautiful but sells out', 'Gorgeous product — just wish it stayed in stock longer!'],
    ['Wears well in humidity', 'No creasing or melting even on a rainy, muggy day. Very impressed.'],
    ['Cute and functional', 'Looks adorable on my vanity and actually performs. Win-win.'],
  ],
  lips: [
    ['Obsessed with this shade', 'The colour is so flattering and it fades evenly into a soft stain.'],
    ['Not sticky at all', 'I usually hate glossy lips because of the stickiness but this is comfortable all day.'],
    ['Bought every colour', 'Started with one and now I own the full set. No regrets.'],
    ['Soft lips by morning', 'My lips used to peel all winter. Not anymore.'],
    ['Smells amazing', 'The scent is so sweet and subtle. It is the little things.'],
  ],
  body: [
    ['Smells like a dream', 'The scent lingers softly without being overpowering. My whole room smells lovely.'],
    ['Absorbs instantly', 'No greasy residue, I can get dressed straight away.'],
    ['Gifted and loved', 'Bought one for my mum and she has asked for a backup already.'],
    ['Great value', 'Big bottle, lasts ages, works beautifully.'],
  ],
  tools: [
    ['So soft', 'Feels luxurious and makes my base look airbrushed.'],
    ['Easy to clean', 'Washes well and keeps its shape. Great quality for the price.'],
    ['Better than pricier ones', 'Honestly performs better than the expensive one I used before.'],
  ],
  sets: [
    ['Best gift ever', 'Gave this for a birthday and she was thrilled. The wrapping is gorgeous.'],
    ['Great way to try everything', 'Perfect introduction to the brand. Now I know what to repurchase.'],
    ['Worth every rupee', 'Saves money compared to buying separately, and the box is keepsake-worthy.'],
  ],
};

export function sampleReviews(product, count = 4) {
  const rand = rng(hashStr(product.id));
  const pool = [...(POOLS[product.category] ?? POOLS.skincare)];
  const out = [];
  const now = new Date('2026-11-20').getTime();
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const [title, body] = pool.splice(Math.floor(rand() * pool.length), 1)[0];
    const [name, place] = PEOPLE[Math.floor(rand() * PEOPLE.length)];
    const rating = rand() < 0.72 ? 5 : rand() < 0.8 ? 4 : 3;
    const shade = product.shades ? product.shades[Math.floor(rand() * product.shades.length)].name : null;
    out.push({
      id: `${product.id}-${i}`,
      name,
      place,
      rating,
      title,
      body,
      shade,
      date: new Date(now - Math.floor(rand() * 200) * 86400000).toISOString(),
      helpful: Math.floor(rand() * 40),
    });
  }
  return out.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/** Approximate star distribution matching the product's average rating. */
export function ratingBreakdown(product) {
  const r = product.rating;
  const five = Math.round(Math.min(92, Math.max(40, (r - 3.6) * 60)));
  const four = Math.round((100 - five) * 0.62);
  const three = Math.round((100 - five - four) * 0.6);
  const two = Math.round((100 - five - four - three) * 0.6);
  const one = Math.max(0, 100 - five - four - three - two);
  return [five, four, three, two, one];
}

// Homepage "Feedback wall" — echoes the Feedback highlights on Instagram.
export const FEEDBACK = [
  { name: 'Lalremruati K.', place: 'Aizawl', text: 'The Cloud Milk cream saved my skin this winter. And the store staff are the sweetest — they remembered my name on my second visit!', product: 'cloud-milk-barrier-cream' },
  { name: 'Ananya B.', place: 'Guwahati', text: 'Ordered on Monday, got it Thursday, packed so beautifully I filmed the unboxing. Jelly tint in Fig Jam is my new signature.', product: 'jelly-glass-lip-tint' },
  { name: 'Mapuii H.', place: 'Lunglei', text: 'Finally a sunscreen with no white cast that I don’t mind reapplying. Bought three for my sisters.', product: 'sun-mochi-airy-sunscreen' },
  { name: 'Priya S.', place: 'Bengaluru', text: 'Found them through a reel and now they’re my go-to for K-beauty finds. Prices are honest and products are always sealed.', product: 'peach-fuzz-eyeshadow-palette' },
  { name: 'Tetei V.', place: 'Champhai', text: 'The Glass Skin kit was the best birthday present I’ve ever given. The handwritten card made my friend cry (happy tears).', product: 'glass-skin-starter-kit' },
  { name: 'Rosy L.', place: 'Shillong', text: 'They helped me build a routine for my acne over DMs, step by step. My skin has never been this calm.', product: 'niacinamide-clarifying-serum' },
];
