// Thin Firestore layer. The Firebase SDK is loaded lazily from Google's CDN
// only when a config is present, so the store still works without it.
//
// Collections (see firestore.rules for the allowed fields):
//   reviews     public read, validated create
//   orders      create only — demo orders, no contact or payment details
//   newsletter  create only
//   messages    create only — contact form

import { FIREBASE_CONFIG } from './data/firebase-config.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
let ready = null;

export const dbEnabled = () => Boolean(FIREBASE_CONFIG && FIREBASE_CONFIG.projectId);

function connect() {
  if (!dbEnabled()) return Promise.resolve(null);
  ready ??= Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-firestore.js`)])
    .then(([{ initializeApp }, fs]) => ({ fs, db: fs.getFirestore(initializeApp(FIREBASE_CONFIG)) }))
    .catch((err) => {
      console.warn('[puipui] Firebase unavailable, falling back to local storage.', err);
      return null;
    });
  return ready;
}

/** Add a document with a server timestamp. Resolves to the new id, or null if the DB is off/unreachable. */
export async function save(collectionName, data) {
  const conn = await connect();
  if (!conn) return null;
  const { fs, db } = conn;
  const write = fs.addDoc(fs.collection(db, collectionName), { ...data, createdAt: fs.serverTimestamp() });
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore write timed out')), 8000));
  const ref = await Promise.race([write, timeout]);
  return ref.id;
}

/** Published reviews for one product, newest first. */
export async function fetchReviews(productId) {
  const conn = await connect();
  if (!conn) return [];
  const { fs, db } = conn;
  const snap = await fs.getDocs(fs.query(fs.collection(db, 'reviews'), fs.where('productId', '==', productId), fs.limit(50)));
  return snap.docs
    .map((d) => {
      const r = d.data();
      return { ...r, id: d.id, date: r.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(), community: true };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
