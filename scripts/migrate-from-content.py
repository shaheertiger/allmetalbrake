#!/usr/bin/env python3
"""One-shot migration: the old allmetalbrake.com content (src/content/*, src/data/*.ts, read from a
checkout of the pre-migration tree) into the enthusiastreview.com JSON schema (docs/content-schema.md).

    python3 scripts/migrate-from-content.py <old-tree>

Writes src/data/guides/*.json, src/data/products/*.json, brands.json, compares.json, glossary.json
and catalog.json. Text is carried over word for word; only its container changes (Markdown
sub-headings, lists and tables inside a section become ordered `blocks`).
"""
import json, re, sys, glob, os, collections

OLD = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')

def load(p):
    return json.load(open(os.path.join(OLD, p)))

def slugify(s):
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', s.lower().replace('&', 'and')))

# ------------------------------------------------------------------ URL rewrites
# Old site pages whose URL changes to the enthusiastreview.com one.
URL_MAP = {
    '/affiliate-disclosure/': '/disclosure/',
    '/privacy-policy/': '/privacy/',
    '/how-we-test/': '/how-we-review/',
    '/editorial-policy/': '/how-we-review/',
    '/terms/': '/about/',
    '/guides/': '/best-of/',
    '/reviews/': '/best-of/',
    '/sitemap/': '/best-of/',
}

def fix_links(t):
    def rep(m):
        url = m.group(2)
        url = URL_MAP.get(url, url)
        # /compare/x-vs-y/ stays: pairs are written in the order the old site used.
        return f'[{m.group(1)}]({url})'
    t = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', rep, t)
    # Markdown italics (*x* or _x_) are not part of the schema; keep the words.
    t = re.sub(r'(?<![*\w])\*(?!\*)([^*\n]+?)\*(?!\*)', r'\1', t)
    t = re.sub(r'(?<![\w])_([^_\n]+?)_(?![\w])', r'\1', t)
    return t.strip()

# ------------------------------------------------------------------ Markdown → blocks
def parse_table(lines):
    rows = [[c.strip() for c in l.strip().strip('|').split('|')] for l in lines if l.strip()]
    rows = [r for r in rows if not all(re.fullmatch(r':?-{2,}:?', c) for c in r)]
    head, body = rows[0], rows[1:]
    return {'head': [re.sub(r'\*\*([^*]+)\*\*', r'\1', fix_links(h)) for h in head], 'rows': [[fix_links(c) for c in r] for r in body]}

def blocks_of(md):
    """Ordered blocks from a Markdown body."""
    out = []
    lines = md.replace('\r', '').split('\n')
    i = 0
    para = []
    def flush():
        if para:
            text = fix_links(' '.join(x.strip() for x in para))
            if text:
                out.append({'p': text})
            para.clear()
    while i < len(lines):
        l = lines[i]
        s = l.strip()
        if not s:
            flush(); i += 1; continue
        m = re.match(r'^(#{2,6})\s+(.*)$', s)
        if m:
            flush(); out.append({'h3': re.sub(r'\*\*([^*]+)\*\*', r'\1', fix_links(m.group(2)))}); i += 1; continue
        if s.startswith('|'):
            flush(); tl = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                tl.append(lines[i]); i += 1
            out.append({'table': parse_table(tl)}); continue
        lm = re.match(r'^([-*+]|\d+[.)])\s+(.*)$', s)
        if lm:
            flush(); kind = 'ol' if lm.group(1)[0].isdigit() else 'ul'; items = []
            while i < len(lines):
                s2 = lines[i].strip()
                m2 = re.match(r'^([-*+]|\d+[.)])\s+(.*)$', s2)
                if m2:
                    items.append(m2.group(2)); i += 1
                elif s2 and items and lines[i].startswith((' ', '\t')):
                    items[-1] += ' ' + s2; i += 1
                else:
                    break
            out.append({kind: [fix_links(x) for x in items]}); continue
        if s.startswith('>'):
            flush(); para.append(s.lstrip('> ').strip()); flush(); i += 1; continue
        para.append(s); i += 1
    flush()
    return out

def paras(md):
    """A plain list of paragraphs (for fields the schema keeps as string[]): lists become one
    paragraph per item, tables a sentence per row, sub-headings bold lead-ins."""
    res = []
    for b in blocks_of(md):
        if 'p' in b: res.append(b['p'])
        elif 'h3' in b: res.append(f"**{b['h3']}**")
        elif 'ul' in b or 'ol' in b:
            items = b.get('ul') or b.get('ol')
            res.extend(items)
        elif 'table' in b:
            h = b['table']['head']
            for r in b['table']['rows']:
                res.append('; '.join(f'{k}: {v}' if k else v for k, v in zip(h, r)) + '.')
    # Merge a bold lead-in with the paragraph after it.
    merged = []
    for p in res:
        if merged and re.fullmatch(r'\*\*[^*]+\*\*', merged[-1]):
            merged[-1] = f'{merged[-1]} {p}'
        else:
            merged.append(p)
    return merged

def one(md):
    return ' '.join(paras(md))

def first_sentence(t):
    plain = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', t).replace('**', '')
    m = re.match(r'(.+?[.!?])(\s|$)', plain)
    return (m.group(1) if m else plain).strip()

def cap(s):
    return s[:1].upper() + s[1:] if s else s

# ------------------------------------------------------------------ products
SUFFIXES = [' Dual Fuel Inverter Generator', ' Dual Fuel Portable Generator', ' Inverter Generator', ' Portable Generator', ' Standby Generator', ' Generator',
  ' Portable Power Station', ' Expandable Power Station', ' Lithium Power Station', ' Compact Power Station', ' Power Station',
  ' Manual Transfer Switch Kit', ' Transfer Switch Kit', ' Transfer Switch', ' Power Inlet Box', ' Whole House Surge Protector', ' Surge Protector',
  ' Surge Protective Device', ' Surge Device', ' Fuel Transfer Pump', ' Emergency Crank Weather Radio', ' Battery Backup', ' Solar Panel', ' Power Bank', ' Propane Heater', ' Lantern', ' Weather Alert Radio', ' Radio']

def short_name(name):
    n = re.sub(r'\s*\([^)]*\)\s*$', '', name)
    n = re.sub(r'\s+with\s+.*$', '', n, flags=re.I).strip()
    for s in SUFFIXES:
        if n.endswith(s) and len(n) - len(s) > 8:
            n = n[:-len(s)]; break
    if len(n) > 32:
        words = n.split(' ')
        model = [w for w in words[1:] if re.search(r'\d', w) and not re.search(r'-Watt$|^\d[\d,]*W$', w, re.I)]
        if model: n = ' '.join([words[0]] + model)
    return n

asins = load('src/data/product-asins.json')
images = load('src/data/product-images.json')
quarantine = load('src/data/asin-quarantine.json') if os.path.exists(os.path.join(OLD, 'src/data/asin-quarantine.json')) else {}

products, by_cat = {}, collections.defaultdict(list)
brand_names = {}
for f in sorted(glob.glob(os.path.join(OLD, 'src/content/products/*.json'))):
    for p in json.load(open(f)):
        key = slugify(p['brand'])
        brand_names[key] = p['brand']
        specs = p['specs']
        order = [k for k in p.get('keySpecs', []) if k in specs] + [k for k in specs if k not in p.get('keySpecs', [])]
        sh = short_name(p['name'])
        q = {
            'id': p['slug'],
            'name': p['name'],
            'short': sh,
            'brand': key,
            'category': p['category'],
            **({'released': str(p['released'])} if p.get('released') else {}),
            'tier': int(p['priceTier']),
            'amazon': p['amazonQuery'],
            **({'asin': p['asin']} if p.get('asin') else ({'asin': asins[p['slug']]} if p['slug'] in asins and p['slug'] not in quarantine else {})),
            **({'image': images[p['slug']].replace('._SL160_.', '._SL500_.')} if p['slug'] in images else {}),
            'description': fix_links(p['summary']),
            'quick': fix_links(f"{p['atAGlance'].rstrip('.')}. {p['summary']}" if p.get('atAGlance') else p['summary']),
            'bestFor': fix_links(p['bestFor']).rstrip('.'),
            'skipIf': fix_links(p['skipIf']).rstrip('.'),
            'specs': [[k, str(specs[k])] for k in order],
            'score': {'overall': int(p['score']), 'parts': [[s['label'], int(s['value'])] for s in p['scores']]},
            'verdict': paras(p['verdict']),
            'pros': [fix_links(x) for x in p['pros']],
            'cons': [fix_links(x) for x in p['cons']],
            'faqs': [{'q': f['q'], 'a': one(f['a'])} for f in p['faqs']],
        }
        products[q['id']] = q
        by_cat[q['category']].append(q)

os.makedirs(os.path.join(OUT, 'products'), exist_ok=True)
for cat, lst in by_cat.items():
    json.dump(lst, open(os.path.join(OUT, 'products', f'{cat}.json'), 'w'), indent=2, ensure_ascii=False)

# ------------------------------------------------------------------ guides
arts = [json.load(open(f)) for f in sorted(glob.glob(os.path.join(OLD, 'src/content/articles/*.json')))]
slugs = {a['slug'] for a in arts}
ranking_src = open(os.path.join(OLD, 'src/data/ranking.ts')).read()

def ranking_for(cat):
    m = re.search(r"\n  '?" + re.escape(cat) + r"'?: \[\n(.*?)\n  \],", ranking_src, re.S)
    if not m: return None
    return [[a, b] for a, b in re.findall(r"\['([^']+)', '((?:[^'\\]|\\.)*)'\]", m.group(1).replace("\\'", "’"))]

def category_of(a):
    if a['hub'] in by_cat: return a['hub']
    if a.get('topic'): return a['topic']
    c = collections.Counter(products[pk['product']]['category'] for pk in a.get('picks', []) if pk['product'] in products)
    if c: return c.most_common(1)[0][0]
    return a['hub']

def article_kind(slug):
    if slug.startswith('how-') or slug.startswith('when-') or 'how-to' in slug: return 'howto'
    if '-vs-' in slug: return 'versus'
    return 'explainer'

GEAR = re.compile(r'\]\(/gear/([a-z0-9-]+)/\)')
guides = []
for a in arts:
    cat = category_of(a)
    intro = paras(a['intro'])
    g = {
        'slug': a['slug'],
        'type': 'roundup' if a['kind'] == 'roundup' else 'brand' if a['kind'] == 'review' else 'article',
    }
    if g['type'] == 'article': g['kind'] = article_kind(a['slug'])
    g['category'] = cat
    if g['type'] == 'brand':
        top = products.get(a['picks'][0]['product']) if a.get('picks') else None
        g['brand'] = slugify(a['brand']) if a.get('brand') else (top['brand'] if top else None)
    g.update({
        'title': a['title'],
        'h1': a['h1'],
        'query': a['keyword'].lower(),
        'keywords': a.get('keywords', []),
        'description': a['metaDescription'],
        'dek': first_sentence(a['metaDescription']),
        'intro': intro,
        'quickAnswer': cap(fix_links(a.get('quickAnswer') or first_sentence(intro[0]))),
    })
    if a.get('picks'):
        g['picks'] = [{
            'id': pk['product'], 'label': pk['award'], 'writeup': paras(pk['body']),
            'pros': [fix_links(x) for x in pk.get('pros', [])], 'cons': [fix_links(x) for x in pk.get('cons', [])],
        } for pk in a['picks'] if pk['product'] in products]
        # Table columns: the key specs most picks share.
        cnt = collections.Counter(k for pk in g['picks'] for k, _ in products[pk['id']]['specs'][:4])
        g['tableSpecs'] = [k for k, n in cnt.most_common() if n >= 2][:4] or [k for k, _ in products[g['picks'][0]['id']]['specs'][:3]]
        crit = ranking_for(cat) or ranking_for(products[g['picks'][0]['id']]['category']) or []
        g['ranking'] = {
            'intro': "These rankings are built from manufacturer spec sheets and owner's manuals, EPA and CARB listings, UL and safety certifications, published warranty terms and owner reports. We have not bench-tested these products; the AMB Score is a research score.",
            'criteria': crit,
            'why': f"The {products[g['picks'][0]['id']]['name']} ranks first because it scores highest on these criteria for the most buyers.",
        }
    g['sections'] = [{'h': fix_links(s['heading']), 'blocks': blocks_of(s['body'])} for s in a['sections']]
    # The template already opens with "<H1>: The Short Answer" (the quick answer). An old
    # "Short Answer" section becomes "<H1> at a Glance", minus any paragraph repeating the quick answer.
    for sec in g['sections']:
        if re.search(r'short answer', sec['h'], re.I):
            sec['h'] = f"{g['h1']} at a Glance"
            qa = re.sub(r'\W+', ' ', g['quickAnswer']).strip().lower()
            sec['blocks'] = [b for b in sec['blocks'] if not ('p' in b and re.sub(r'\W+', ' ', b['p']).strip().lower() == qa)] or sec['blocks']
    if a.get('mistakes'): g['mistakes'] = [[m['title'], one(m['body'])] for m in a['mistakes']]
    g['bottomLine'] = one(a['bottomLine'])
    g['faqs'] = [{'q': f['q'], 'a': one(f['a'])} for f in a['faqs']]
    ids = [pk['id'] for pk in g.get('picks', [])]
    linked = list(dict.fromkeys(GEAR.findall(json.dumps(a))))
    g['sources'] = [f"{brand_names[products[i]['brand']]} spec sheet and manual: {products[i]['name']}" for i in (ids or linked)[:8] if i in products]
    if g['type'] == 'article' and linked:
        g['products'] = [i for i in linked if i in products][:6]
    g['related'] = [r for r in a.get('related', []) if r in slugs and r != a['slug']]
    g['published'] = a['published']
    g['updated'] = a['updated']
    guides.append(g)

os.makedirs(os.path.join(OUT, 'guides'), exist_ok=True)
for g in guides:
    json.dump(g, open(os.path.join(OUT, 'guides', f"{g['slug']}.json"), 'w'), indent=2, ensure_ascii=False)

# ------------------------------------------------------------------ brands
brand_review = {g['brand']: g['slug'] for g in guides if g['type'] == 'brand' and g.get('brand')}
brands = {}
for key, name in sorted(brand_names.items()):
    lst = sorted([p for p in products.values() if p['brand'] == key], key=lambda p: -p['score']['overall'])
    cats = []
    for p in lst:
        c = p['category']
        if c not in cats: cats.append(c)
    brands[key] = {'name': name, 'blurb': '', **({'review': brand_review[key]} if key in brand_review else {})}
json.dump(brands, open(os.path.join(OUT, 'brands.json'), 'w'), indent=2, ensure_ascii=False)

# ------------------------------------------------------------------ compares
pairs = re.findall(r"\['([a-z0-9-]+)', '([a-z0-9-]+)'\]", open(os.path.join(OLD, 'src/data/compares.ts')).read())
compares = []
def lc(s): return s[:1].lower() + s[1:] if s else s
for x, y in pairs:
    if x not in products or y not in products: continue
    a, b = sorted([products[x], products[y]], key=lambda p: p['id'])
    sa, sb = a['short'], b['short']
    ka, kb = dict(a['specs']), dict(b['specs'])
    differ = [k for k in ka if k in kb and ka[k] != kb[k]][:4]
    win = None if a['score']['overall'] == b['score']['overall'] else (a if a['score']['overall'] > b['score']['overall'] else b)
    h = f'{sa} vs {sb}'
    title = next((t for t in [f'{h} (2026): Which Should You Buy?', f'{h} (2026): Which to Buy?', f'{h} (2026): Which Wins?', f'{h} (2026)', h] if len(t) <= 62), h)
    lead = (f'The {sa} and {sb} tie at {a["score"]["overall"]}/100 on our AMB Score.' if not win
            else f'The {win["short"]} scores higher, {win["score"]["overall"]} to {(b if win is a else a)["score"]["overall"]}/100.')
    desc = lead
    for e in [f'Pick the {sa} for {lc(a["bestFor"])}.', f'Pick the {sb} for {lc(b["bestFor"])}.', 'Specs side by side and who should buy each.']:
        if len(f'{desc} {e}') <= 158: desc = f'{desc} {e}'
    compares.append({
        'a': a['id'], 'b': b['id'],
        'title': title,
        'description': desc,
        'quick': f'Pick the {sa} if you want {lc(a["bestFor"])}. Pick the {sb} if you want {lc(b["bestFor"])}.',
        'differ': [[f'How does the {k.lower() if not re.search(r"[A-Z]{2}", k) else k} compare?', f'The {sa} lists {ka[k]}; the {sb} lists {kb[k]}.'] for k in differ],
        'buyA': [cap(a['bestFor'])] + a['pros'][:2],
        'buyB': [cap(b['bestFor'])] + b['pros'][:2],
    })
json.dump(compares, open(os.path.join(OUT, 'compares.json'), 'w'), indent=2, ensure_ascii=False)

# ------------------------------------------------------------------ glossary
gsrc = open(os.path.join(OLD, 'src/data/glossary.ts')).read()
consts = {k: v for k, v in re.findall(r"const (\w+) = \{ title: '[^']*', url: '([^']+)' \};", gsrc)}
terms = []
for m in re.finditer(r"\{\s*slug: '([^']+)',\s*term: '((?:[^'\\]|\\.)*)',\s*short: '((?:[^'\\]|\\.)*)',\s*body: `(.*?)`,\s*related: \[(.*?)\],?\s*\}", gsrc, re.S):
    slug, term, short, body, rel = m.groups()
    term = term.replace("\\'", "'"); short = short.replace("\\'", "'")
    urls = [consts.get(n) for n in re.findall(r'\b([A-Z]{2,})\b', rel)] + re.findall(r"url: '([^']+)'", rel)
    urls = [u for u in urls if u]
    terms.append({
        'id': slug,
        'term': term,
        'title': f'What Is {term}? Backup Power Glossary',
        'short': fix_links(short),
        'body': paras(body.replace('\\`', '`')),
        'related': [u.split('/')[2] for u in urls if u.startswith('/glossary/')],
        'guides': [u.strip('/') for u in urls if u.strip('/') in slugs],
    })
json.dump(terms, open(os.path.join(OUT, 'glossary.json'), 'w'), indent=2, ensure_ascii=False)
json.dump({}, open(os.path.join(OUT, 'catalog.json'), 'w'))

print(f'{len(products)} products in {len(by_cat)} categories, {len(guides)} guides, {len(brands)} brands, {len(compares)} compares, {len(terms)} glossary terms')
cats = collections.Counter(g['category'] for g in guides)
print('guide categories:', dict(cats))
