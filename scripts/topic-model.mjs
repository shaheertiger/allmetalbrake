// Topical similarity between pages, for choosing and checking internal links.
// Each page becomes a weighted bag of words from its slug, title, tags and meta
// description; pages are compared by TF-IDF cosine similarity. Cheap, and good
// enough to tell that water-heater-leaking belongs with the water heater guides
// and that a Ryobi review has nothing to do with back shavers.
import { loadPages, isPillar } from './cluster-report.mjs';

const STOP = new Set(('a an the and or of to in on for with without from by at as is are be was it its this that these those ' +
  'you your we our us i my me how what when why which who where do does did can could should would will vs versus ' +
  'best top review reviews reviewed guide guides tested ranked rated our honest pick picks buy buying buyer buyers ' +
  'real really actually worth need needs much many more most less than then there here not no yes one two three ' +
  'first ever every all any each per get got make makes made use uses using used work works help helps whats ' +
  'about after before into over under out up down off just only also too very so if but ' +
  // Size and age words join unrelated topics (small bugs, small generators).
  'small large big new old good bad').split(' '));

// Very light stemming: plurals and a few common endings, so "sealers" meets "sealer".
const stem = (w) => w
  .replace(/ies$/, 'y')
  .replace(/(ss)$/, '$1')
  .replace(/([^s])s$/, '$1')
  .replace(/ing$/, '');

export const words = (text = '') => text.toLowerCase()
  .replace(/&[a-z]+;/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ')
  .split(' ')
  .filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w))
  .map(stem);

const str = (m) => (m ? JSON.parse(`"${m[1]}"`) : '');

export function pageMeta(slug, source) {
  // Most pages declare `const title = "…"`; a few set it straight on <Layout>.
  const title = str(source.match(/const title =\s*\n?\s*"((?:[^"\\]|\\.)*)"/)
    || source.match(/<Layout[\s\S]*?\btitle="((?:[^"\\]|\\.)*)"/));
  const description = str(source.match(/const description =\s*\n?\s*"((?:[^"\\]|\\.)*)"/)
    || source.match(/<Layout[\s\S]*?\bdescription="((?:[^"\\]|\\.)*)"/));
  const tagBlock = source.match(/tags:\s*\[([\s\S]*?)\]/);
  const tags = tagBlock ? [...tagBlock[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]) : [];
  const section = str(source.match(/section:\s*"((?:[^"\\]|\\.)*)"/));
  return { slug, title, description, tags, section, pillar: isPillar(slug) };
}

export function buildModel(pages = loadPages()) {
  const metas = pages.map(({ slug, source }) => pageMeta(slug, source)).filter((m) => m.title);
  const bags = new Map();
  for (const m of metas) {
    const bag = new Map();
    const add = (list, weight) => { for (const w of list) bag.set(w, (bag.get(w) || 0) + weight); };
    add(words(m.slug.replace(/-/g, ' ')), 3);
    add(words(m.title.split(/[:?]/)[0]), 2);
    add(words(m.tags.slice(0, 4).join(' ')), 1.5);
    add(words(m.title), 1);
    add(words(m.description), 0.5);
    bags.set(m.slug, bag);
  }
  const df = new Map();
  for (const bag of bags.values()) for (const w of bag.keys()) df.set(w, (df.get(w) || 0) + 1);
  const N = bags.size;
  const vectors = new Map();
  for (const [slug, bag] of bags) {
    const v = new Map();
    let norm = 0;
    for (const [w, tf] of bag) {
      const x = (1 + Math.log(tf)) * Math.log(N / df.get(w));
      v.set(w, x);
      norm += x * x;
    }
    norm = Math.sqrt(norm) || 1;
    for (const [w, x] of v) v.set(w, x / norm);
    vectors.set(slug, v);
  }
  const sim = (a, b) => {
    const va = vectors.get(a), vb = vectors.get(b);
    if (!va || !vb) return 0;
    const [small, big] = va.size < vb.size ? [va, vb] : [vb, va];
    let s = 0;
    for (const [w, x] of small) { const y = big.get(w); if (y) s += x * y; }
    return s;
  };
  // How many distinct topic words two pages share. One shared word is often an
  // accident of wording ("cleaner" in deck and carpet cleaners); two rarely is.
  const shared = (a, b) => {
    const va = vectors.get(a), vb = vectors.get(b);
    if (!va || !vb) return 0;
    let n = 0;
    for (const w of va.keys()) if (vb.has(w)) n++;
    return n;
  };
  const meta = new Map(metas.map((m) => [m.slug, m]));
  const nearest = (slug, filter = () => true, n = 10) => [...vectors.keys()]
    .filter((o) => o !== slug && filter(o))
    .map((o) => [o, sim(slug, o)])
    .sort((x, y) => y[1] - x[1])
    .slice(0, n);
  return { meta, sim, shared, nearest };
}
