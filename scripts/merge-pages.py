#!/usr/bin/env python3
"""Merge pages that compete for the same search into one kept page.

  python3 scripts/merge-pages.py            # apply MERGES below
  python3 scripts/merge-pages.py --dry

For each merge: fold the named sections of the dropped page into the kept page
(before its Common Mistakes block, with a contents entry), delete the dropped page,
301 it (slash, no-slash and .html forms) in vercel.json, repoint any existing
redirect that targeted it, and rewrite every internal link on the site to the kept
URL so nothing hops through a redirect. See docs/ranking-method.md, section 1a.
"""
import json, os, re, sys, glob

DRY = '--dry' in sys.argv
PAGES = 'src/pages'

# (dropped slug, kept slug, [section ids to fold into the kept page])
MERGES = [
    ('best-asphalt-sealer', 'best-asphalt-driveway-sealer-reviews', ['coal-tar']),
    ('blacktop-driveway-sealer', 'best-asphalt-driveway-sealer-reviews', ['worth-it']),
    ('best-polymeric-sand-for-pavers', 'best-polymeric-sand', ['old-patio']),
]
# Old redirects that pointed at a loosely related page; send them to the closest one.
RETARGET = {
    '/how-to-seal-an-asphalt-driveway': '/how-to-seal-a-driveway/',
}

def read(p): return open(p, encoding='utf-8').read()
def write(p, s):
    if not DRY: open(p, 'w', encoding='utf-8').write(s)

def extract_div(s, div_id):
    m = re.search(r'\n([ \t]*)<div id="%s"[^>]*>' % re.escape(div_id), s)
    if not m: raise SystemExit(f'section #{div_id} not found')
    i, depth = m.end(), 1
    tag = re.compile(r'<(/?)div\b[^>]*>')
    while depth:
        t = tag.search(s, i)
        if t.group(1): depth -= 1
        elif not t.group(0).endswith('/>'): depth += 1
        i = t.end()
    return s[m.start() + 1:i]

def toc_label(src, div_id):
    m = re.search(r'href="#%s"[^>]*>.*?<span>(.*?)</span></a>' % re.escape(div_id), src)
    return m.group(1) if m else div_id.replace('-', ' ').title()

def fold(kept_src, dropped_src, ids):
    for div_id in ids:
        if f'id="{div_id}"' in kept_src: raise SystemExit(f'#{div_id} already on kept page')
        block = extract_div(dropped_src, div_id)
        kept_src = kept_src.replace('        <!-- Common Mistakes -->', block + '\n\n        <!-- Common Mistakes -->', 1)
        # contents entry, just before the mistakes entry
        m = re.search(r'\n([ \t]*)<a href="#mistakes"[^\n]*\n', kept_src)
        if m:
            entry = re.sub(r'href="#mistakes"', f'href="#{div_id}"', m.group(0))
            entry = re.sub(r'<span>[^<]*</span></a>', f'<span>{toc_label(dropped_src, div_id)}</span></a>', entry)
            kept_src = kept_src[:m.start()] + entry + kept_src[m.start():]
    return kept_src

def renumber_toc(s):
    n = [0]
    def r(m):
        n[0] += 1
        return f'{m.group(1)}{n[0]}.</span>'
    return re.sub(r'(<span class="w-6 shrink-0 text-gray-400 font-semibold">)\d+\.</span>', r, s)

def main():
    link_map = {}
    for dropped, kept, ids in MERGES:
        dp, kp = f'{PAGES}/{dropped}.astro', f'{PAGES}/{kept}.astro'
        if not os.path.exists(dp):
            print(f'skip {dropped}: already merged'); link_map[dropped] = kept; continue
        ks = renumber_toc(fold(read(kp), read(dp), ids))
        write(kp, ks)
        if not DRY: os.remove(dp)
        link_map[dropped] = kept
        print(f'merged /{dropped}/ -> /{kept}/ (folded: {", ".join(ids)})')

    # vercel.json redirects
    vj = json.loads(read('vercel.json'))
    reds = vj['redirects']
    for r in reds:
        d = r['destination'].strip('/')
        if d in link_map: r['destination'] = f'/{link_map[d]}/'
        base = re.sub(r'(\.html|/)$', '', r['source'])
        if base in RETARGET: r['destination'] = RETARGET[base]
    have = {r['source'] for r in reds}
    for dropped, kept in link_map.items():
        for src in (f'/{dropped}/', f'/{dropped}', f'/{dropped}.html'):
            if src not in have:
                reds.append({'source': src, 'destination': f'/{kept}/', 'permanent': True})
    write('vercel.json', json.dumps(vj, indent=2) + '\n')

    # internal links everywhere
    files = glob.glob(f'{PAGES}/**/*.astro', recursive=True) + glob.glob('src/data/*.ts') + \
            glob.glob('src/components/*') + glob.glob('src/layouts/*') + ['src/data/llms-full-intro.md']
    for f in files:
        s = o = read(f)
        for dropped, kept in link_map.items():
            s = s.replace(f'/{dropped}/', f'/{kept}/')
            s = re.sub(rf"l\('{dropped}',[^\n]*\n", '', s)  # nav.ts entries
        slug = os.path.basename(f)[:-6] if f.startswith(PAGES) else None
        if slug:
            # unwrap body links a page now makes to itself
            s = re.sub(rf'<a href="/{slug}/"[^>]*>(.*?)</a>', r'\1', s)
        if s != o:
            write(f, s); print('relinked', f)

    # sitemap priority list
    s = read('astro.config.mjs')
    for dropped in link_map:
        s = re.sub(rf"\n  '{dropped}',", '', s)
    write('astro.config.mjs', s)

if __name__ == '__main__':
    main()
