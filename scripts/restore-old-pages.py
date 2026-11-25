#!/usr/bin/env python3
"""One-shot restore: pages that were live on allmetalbrake.com earlier in 2026 and later 301'd to the
home page, rebuilt from their old rendered HTML into the shared JSON schema (docs/content-schema.md).

    python3 scripts/restore-old-pages.py <restore-src.json> <old-build-root>

<restore-src.json> maps each slug to the commit whose build holds it; <old-build-root>/old-<sha7>/dist
is that commit's `astro build` output. Writes src/data/guides/<slug>.json for every page. The words
are the old page's own; only the container changes. Template chrome (menus, ads, tables of contents,
newsletter boxes, author boxes, related-link cards) is left out because the new template adds its own.
"""
import json, os, re, sys
from bs4 import BeautifulSoup, NavigableString, Tag, Comment

SRC = json.load(open(sys.argv[1]))
ROOT = sys.argv[2]
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'guides')
SITE = 'https://www.allmetalbrake.com'

existing = {f[:-5] for f in os.listdir(OUT) if f.endswith('.json')}
live = existing | set(SRC)
STATIC = {'/', '/best-of/', '/gear/', '/compare/', '/glossary/', '/brands/', '/tools/', '/about/', '/how-we-review/', '/disclosure/', '/privacy/', '/contact/',
          '/tools/generator-wattage-calculator/', '/tools/power-station-runtime-calculator/'}
URL_MAP = {'/affiliate-disclosure/': '/disclosure/', '/privacy-policy/': '/privacy/', '/how-we-test/': '/how-we-review/', '/editorial-policy/': '/how-we-review/',
           '/terms/': '/about/', '/guides/': '/best-of/', '/reviews/': '/best-of/', '/sitemap/': '/best-of/'}
gear = set()
for f in os.listdir(os.path.join(OUT, '..', 'products')):
    for p in json.load(open(os.path.join(OUT, '..', 'products', f))):
        gear.add(p['id'])
terms = {t['id'] for t in json.load(open(os.path.join(OUT, '..', 'glossary.json')))}

def internal(href):
    """The new path for an internal link, or None if nothing lives there now."""
    h = href.replace(SITE, '').replace('https://allmetalbrake.com', '')
    if h.startswith(('http', 'mailto:', 'tel:', '#')) or not h.startswith('/'):
        return None
    h = h.split('#')[0].split('?')[0]
    h = re.sub(r'\.html$', '/', h)
    if not h.endswith('/'): h += '/'
    h = URL_MAP.get(h, h)
    parts = h.strip('/').split('/')
    if h in STATIC: return h
    if len(parts) == 1 and parts[0] in live: return h
    if len(parts) == 2 and parts[0] == 'gear' and parts[1] in gear: return h
    if len(parts) == 2 and parts[0] == 'glossary' and parts[1] in terms: return h
    return None

SKIP_CLASS = re.compile(r'(^|\s)(qp-ad|top-ad|adsbygoogle|toc|sidebar[\w-]*|related-guides|newsletter|author-box|share|breadcrumbs?|promo-bar|sr-only|byline[\w-]*|fixed|sticky[\w-]*)(\s|$)')
BLOCK = {'p', 'ul', 'ol', 'table', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'section', 'aside', 'figure', 'details', 'blockquote', 'dl', 'article', 'header', 'footer', 'nav', 'form'}

def clean(t):
    t = t.replace(' ', ' ')
    t = re.sub(r'\s+', ' ', t).strip()
    return re.sub(r'\s+([,.;:!?)])', r'\1', t)

def inline(el):
    """Inline HTML → schema text: [anchor](/path/) links and **bold**."""
    if isinstance(el, Comment):
        return ''
    if isinstance(el, NavigableString):
        return str(el).replace('[', '(').replace(']', ')')
    if not isinstance(el, Tag) or el.name in ('script', 'style', 'svg', 'img', 'button', 'noscript'):
        return ''
    inner = ''.join(inline(c) for c in el.children)
    if el.name == 'a' and el.get('href'):
        text = clean(inner)
        if not text: return ''
        href = el['href']
        if 'amazon.' in href or href.startswith('http') and 'allmetalbrake.com' not in href:
            return f'[{text}]({href})'
        new = internal(href)
        return f'[{text}]({new})' if new else text
    if el.name in ('strong', 'b'):
        t = clean(inner)
        return f' **{t}** ' if t and '](' not in t else inner
    if el.name == 'br':
        return ' '
    return inner

def text_of(el):
    return clean(inline(el)).replace('** **', ' ')

def skip(el):
    if not isinstance(el, Tag): return False
    if el.name in ('script', 'style', 'svg', 'img', 'nav', 'button', 'noscript', 'form', 'iframe', 'figcaption', 'ins'): return True
    cls = ' '.join(el.get('class') or [])
    return bool(SKIP_CLASS.search(cls))

def table_of(t):
    rows = []
    for tr in t.find_all('tr'):
        cells = [text_of(c) for c in tr.find_all(['th', 'td'])]
        if any(cells): rows.append(cells)
    if not rows: return None
    head, body = rows[0], rows[1:]
    if not body: return None
    w = len(head)
    body = [(r + [''] * w)[:w] for r in body]
    return {'head': [re.sub(r'\*\*', '', h) for h in head], 'rows': body}

def walk(el, out):
    """Block elements in document order → [{'h2'|'h3'|'p'|'ul'|'ol'|'table'|'qa': ...}]."""
    for c in el.children:
        if isinstance(c, Comment):
            continue
        if isinstance(c, NavigableString):
            t = clean(str(c))
            if t and len(t) > 1: out.append({'p': t})
            continue
        if not isinstance(c, Tag) or skip(c): continue
        cls = ' '.join(c.get('class') or [])
        name = c.name
        if name in ('h1',): continue
        if name == 'h2':
            out.append({'h2': text_of(c)}); continue
        if 'product-label' in cls:
            out.append({'label': clean(c.get_text(' '))}); continue
        if name in ('h3', 'h4', 'h5', 'h6') or 'faq-question' in cls:
            t = text_of(c).replace('**', '').strip()
            if t: out.append({'h3': t})
            continue
        if name == 'summary':
            out.append({'h3': text_of(c).replace('**', '').strip()}); continue
        if name == 'p':
            t = text_of(c)
            if t: out.append({'p': t})
            continue
        if name in ('ul', 'ol'):
            items = [text_of(li) for li in c.find_all('li', recursive=False)]
            items = [i for i in items if i]
            if items: out.append({name: items})
            continue
        if name == 'dl':
            rows = [[text_of(dt), text_of(dt.find_next_sibling('dd'))] for dt in c.find_all('dt')]
            if rows: out.append({'ul': [f'**{k.rstrip(":")}:** {v}' for k, v in rows]})
            continue
        if name == 'table':
            t = table_of(c)
            if t: out.append({'table': t})
            continue
        if name == 'a':
            href = c.get('href', '')
            t = clean(c.get_text(' '))
            if 'amazon.' in href and t:
                out.append({'p': f'[Check price on Amazon]({href})'})
            elif t and internal(href):
                out.append({'p': f'[{t}]({internal(href)})'})
            continue
        if name == 'figure':
            continue
        # Containers: a box of only inline content is one paragraph; otherwise recurse.
        if not any(isinstance(x, Tag) and x.name in BLOCK for x in c.descendants):
            t = text_of(c)
            if t and len(t) > 1: out.append({'p': t})
            continue
        walk(c, out)

def strip_num(h):
    return re.sub(r'^\d+\.\s+', '', h).strip()

CHROME = re.compile(r'^(table of contents|on this page|contents|related( \w+)* guides|more( in| \w+)*( guides)?|about the author|why you can trust|get our newsletter|key numbers|categories|popular|company|our picks|share|you might also like|keep reading|in this guide)\b', re.I)
CATS = [
    ('driveway', r'driveway|asphalt|blacktop|sealcoat|concrete|paver|polymeric|brick|stone|granite|marble|stamped|efflorescence|silane|siloxane|coal-tar|crack-filler|ice-melt|sealer'),
    ('garage-floor', r'garage|epoxy|polyaspartic|polyurea|flake|acid-etching'),
    ('basement', r'basement|mold|dehumidifier|sump|crawl|hydrostatic|waterproof|cinder|rmr-141|bleach|vinegar'),
    ('deck-exterior', r'deck|stain|teak|cedar|redwood|fence|caulk|spackle|putty|plywood|flex-seal|polyurethane'),
    ('yard', r'mower|trimmer|weed|lawn|yard|zero-turn'),
    ('tools', r'drill|impact|saw|shop-vac|ryobi|rockwell|tools'),
    ('sleep', r'mattress'),
    ('home-kitchen', r'microwave|blender|washer|dryer|air-conditioner|refrigerator|lunch-box|water-filter|reverse-osmosis|shower-head|water-pump|pressure-washer'),
    ('home-systems', r'flooring|hardwood|vinyl|laminate|ceiling|paint'),
]
def category(slug):
    for k, rx in CATS:
        if re.search(rx, slug): return k
    return 'home-systems'

def kind(slug):
    if slug.startswith(('how-', 'when-', 'what-temperature')) or 'how-to' in slug: return 'howto'
    if '-vs-' in slug: return 'versus'
    if re.search(r'peeling|turning-white|not-|problem', slug): return 'fix'
    return 'explainer'

def first_sentence(t):
    plain = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', t).replace('**', '')
    m = re.match(r'(.+?[.!?])(\s|$)', plain)
    return (m.group(1) if m else plain).strip()

def plain(t):
    return re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', t).replace('**', '').strip()

# The old pages that claimed lab testing never ran one: those sentences are dropped, not republished.
CLAIM = re.compile(r"\b(we tested|we've tested|we have tested|in our tests?|in our testing|our testing|our test (panels?|slabs?|decks?|boards?)|our benchmarks?|we benchmarked|we measured|our measurements|tested in our lab|our lab|after testing (each|them|all|every)|our (test|lab) results?)\b", re.I)
HONEST = re.compile(r"\b(not|never|haven't|didn't)\b[^.]{0,40}\b(test|tested|lab-tested)", re.I)
def scrub(t):
    if not isinstance(t, str): return t
    parts = re.split(r'(?<=[.!?])\s+(?=[A-Z"“(\[])', t)
    keep = [x for x in parts if not (CLAIM.search(x) and not HONEST.search(x))]
    return ' '.join(keep).strip()
def scrub_all(o):
    if isinstance(o, str): return scrub(o)
    if isinstance(o, list): return [y for y in (scrub_all(x) for x in o) if y not in ('', None, [])]
    if isinstance(o, dict): return {k: (scrub_all(v) if k not in ('slug', 'title', 'h1', 'query', 'kind', 'type', 'category') else v) for k, v in o.items()}
    return o
TESTING_SECTION = re.compile(r'^how we (tested|test|evaluated)|^our testing|^testing (method|methodology)', re.I)

# Built around a lab test that never happened: rankings and numbers come from it, so these stay
# redirected (vercel.json) instead of being republished.
EXCLUDE = ["best-brush-for-water-based-polyurethane", "best-concrete-countertop-sealer", "best-paver-sealer-for-pool-deck", "best-paver-sealer-natural-look", "best-paver-sealers-for-a-wet-look", "best-stone-sealers-reviews", "best-teak-sealer-reviews", "best-water-based-polyurethane-for-floors"]

report = []
for slug, (sha, _path) in sorted(SRC.items()):
    if slug in EXCLUDE: continue
    f = os.path.join(ROOT, f'old-{sha[:7]}', 'dist', slug, 'index.html')
    soup = BeautifulSoup(open(f, encoding='utf-8').read(), 'lxml')
    title = clean(soup.title.get_text()) if soup.title else slug
    title = re.sub(r'\s*[|–—]\s*(Home Fix Reviews|All Metal Brake|AllMetalBrake)\s*$', '', title)
    desc_el = soup.find('meta', attrs={'name': 'description'})
    desc = clean(desc_el['content']) if desc_el else ''
    h1 = clean(soup.find('h1').get_text()) if soup.find('h1') else title
    pub = mod = None
    for s in soup.find_all('script', type='application/ld+json'):
        for m in re.finditer(r'"date(Published|Modified)"\s*:\s*"(\d{4}-\d{2}-\d{2})', s.get_text()):
            if m.group(1) == 'Published' and not pub: pub = m.group(2)
            if m.group(1) == 'Modified' and not mod: mod = m.group(2)
    container = soup.select_one('.article-content') or soup.select_one('.prose') or soup.find('main')
    blocks = []
    # Lede paragraph(s) printed between the H1 and the body (second template).
    head = soup.find('h1')
    if head and not container.find('h1'):
        for p in head.find_all_next('p', limit=3):
            if p.find_parent(class_=re.compile('prose|article-content')) or p.find_parent('footer'): break
            t = text_of(p)
            if t and len(t) > 60: blocks.append({'p': t})
    walk(container, blocks)
    UI = re.compile(r'^(on amazon|our #\d+ pick|jump to review|see it on amazon|check price|photo: amazon\.com|\[check price on amazon\]\([^)]*\)\s*on amazon)$', re.I)
    tidy, label = [], None
    for b in blocks:
        if 'label' in b:
            label = b['label']; continue
        if 'h3' in b and label:
            b = {'h3': f"{label}: {b['h3']}" if not b['h3'].lower().startswith(label.lower()) else b['h3']}
            label = None
        if 'p' in b:
            t = re.sub(r'\s*↓\s*Jump to Review', '', b['p']).strip()
            if not t or UI.match(t): continue
            b = {'p': t}
        if 'ol' in b or 'ul' in b:
            k = 'ol' if 'ol' in b else 'ul'
            b = {k: [re.sub(r'\s*↓\s*Jump to Review', '', x).strip() for x in b[k]]}
        # Two Amazon buttons in a row (image link + CTA) become one.
        if tidy and 'p' in b and 'p' in tidy[-1] and b['p'].startswith('[Check price on Amazon]') and tidy[-1]['p'].startswith('[Check price on Amazon]'):
            continue
        tidy.append(b)
    blocks = tidy

    # Split into intro + sections at the H2s.
    intro, sections, cur = [], [], None
    for b in blocks:
        if 'h2' in b:
            cur = {'h': strip_num(b['h2']), 'items': []}
            sections.append(cur)
        elif cur is None:
            intro.append(b)
        else:
            cur['items'].append(b)

    quick = None
    faqs, mistakes, bottom, kept = [], [], None, []
    def pairs(items):
        out, q, a = [], None, []
        for it in items:
            if 'h3' in it:
                if q and a: out.append((q, ' '.join(a)))
                q, a = it['h3'], []
            elif q is not None:
                if 'p' in it: a.append(it['p'])
                elif 'ul' in it or 'ol' in it: a.append(' '.join((it.get('ul') or it.get('ol'))))
        if q and a: out.append((q, ' '.join(a)))
        return out
    for s in sections:
        h = s['h']
        if CHROME.search(h) or not s['items']:
            continue
        if re.search(r'frequently asked|^faqs?$|questions', h, re.I) and any('h3' in i for i in s['items']):
            faqs += [{'q': q, 'a': a} for q, a in pairs(s['items'])]; continue
        if re.search(r'^common mistakes|mistakes to avoid', h, re.I):
            mistakes += [[q, a] for q, a in pairs(s['items'])]; continue
        if re.search(r'^(the )?bottom line|^final (verdict|thoughts)|^conclusion', h, re.I):
            bottom = ' '.join(i['p'] for i in s['items'] if 'p' in i); continue
        if re.search(r'short answer', h, re.I):
            ps = [i['p'] for i in s['items'] if 'p' in i]
            if ps and not quick: quick = ps[0]
            rest = [i for i in s['items'] if not ('p' in i and i['p'] == quick)]
            if rest: kept.append({'h': f'{h1} at a Glance', 'items': rest})
            continue
        if TESTING_SECTION.search(h):
            continue
        if re.search(r'^our top picks$', h, re.I):
            items = [i for i in s['items'] if not ('p' in i and i['p'].startswith('[Check price on Amazon]'))]
            if any('table' in i for i in items):
                items = [i for i in items if 'table' in i]  # the cards only repeat the table, minus product names
            kept.append({'h': f'{h1} at a Glance', 'items': items}); continue
        kept.append(s)

    # A "The short answer:" callout anywhere becomes the quick answer.
    for s in [{'items': intro}] + kept:
        for i in list(s['items']):
            if 'p' in i and re.match(r'^\W*\**\s*(⚡\s*)?(the )?short answer\s*:?\**\s*:?', i['p'], re.I):
                t = re.sub(r'^\W*\**\s*(⚡\s*)?(the )?short answer\s*:?\**\s*:?\s*', '', i['p'], flags=re.I).strip()
                if t and not quick: quick = t
                s['items'].remove(i)

    intro_ps = [i['p'] for i in intro if 'p' in i]
    if not quick:
        quick = intro_ps[0] if intro_ps else first_sentence(desc)
    if quick in intro_ps and len(intro_ps) > 1:
        pass
    def to_blocks(items):
        out = []
        for i in items:
            if 'h3' in i: out.append({'h3': i['h3']})
            elif 'p' in i: out.append({'p': i['p']})
            elif 'ul' in i: out.append({'ul': i['ul']})
            elif 'ol' in i: out.append({'ol': i['ol']})
            elif 'table' in i: out.append({'table': i['table']})
        return out
    secs = [{'h': s['h'], 'blocks': to_blocks(s['items'])} for s in kept]
    secs = [s for s in secs if s['blocks']]
    if not bottom:
        bottom = first_sentence(desc)
    related = []
    for a in soup.find_all('a', href=True):
        p = internal(a['href'])
        if p and p.strip('/') in live and p.strip('/') != slug and '/' not in p.strip('/'):
            if p.strip('/') not in related: related.append(p.strip('/'))
    g = {
        'slug': slug,
        'type': 'article',
        'kind': kind(slug),
        'category': category(slug),
        'title': title,
        'h1': re.sub(r'\s*\(\d{4}\)\s*$', '', h1),
        'query': re.sub(r'^(the )?\d+\s+', '', h1.lower()).split(':')[0].strip(),
        'description': desc,
        'dek': first_sentence(desc),
        'intro': [p for p in intro_ps if p != quick] or intro_ps,
        'quickAnswer': plain(quick) if len(plain(quick)) < 700 else first_sentence(plain(quick)),
        'sections': secs,
        **({'mistakes': mistakes} if mistakes else {}),
        'bottomLine': bottom,
        'faqs': faqs,
        'sources': [],
        'related': related[:3],
        **({'published': pub} if pub else {}),
        **({'updated': mod or pub} if (mod or pub) else {}),
    }
    g['sections'] = [x for x in g['sections'] if not TESTING_SECTION.search(x['h'])]
    g = scrub_all(g)
    g['sections'] = [x for x in g['sections'] if x.get('blocks')]
    g['faqs'] = [f for f in g['faqs'] if f.get('q') and f.get('a')]
    g['mistakes'] = [m for m in g.get('mistakes', []) if len(m) == 2] or g.pop('mistakes', None) or []
    if not g['mistakes']: g.pop('mistakes')
    for k in ('intro', 'quickAnswer', 'bottomLine', 'description', 'dek'):
        if not g.get(k): g[k] = g['dek'] if k != 'intro' else [g['quickAnswer']]
    json.dump(g, open(os.path.join(OUT, f'{slug}.json'), 'w'), indent=2, ensure_ascii=False)
    words = len(json.dumps(g).split())
    report.append((slug, len(secs), len(faqs), len(mistakes), words))

for r in report: print(*r)
print(len(report), 'pages restored')
