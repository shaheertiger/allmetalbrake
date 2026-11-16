#!/usr/bin/env python3
"""Apply rewritten snippets and de-template article pages.

  python3 scripts/apply-snippets.py snippets.json [--dry]

snippets.json maps slug -> {type, title, description, h1, topic, method}. For each
page it sets the <title>/meta description consts, the editorial H1, the one-line
method note under the byline (replacing the sentence that used to be identical on
every page), drops "N." prefixes from H2s, names the mistakes section after the
page's topic, and syncs the page's card description on /best-of/.
See docs/ranking-method.md, sections 1c and 3.
"""
import html, json, re, sys

DRY = '--dry' in sys.argv
data = json.load(open([a for a in sys.argv[1:] if a.endswith('.json')][0]))
SHARED = ('We judge every product on its spec sheet, its label and what owners report over time, '
          'not on the marketing. No paid placements, and commission never sets a ranking.')

def js(s):  # a JS double-quoted string literal
    return json.dumps(s, ensure_ascii=False)

changed = 0
for slug, d in data.items():
    p = f'src/pages/{slug}.astro'
    try:
        s = o = open(p, encoding='utf-8').read()
    except FileNotFoundError:
        print('missing page', slug); continue
    s = re.sub(r'const title = (?:"[^"\n]*"|`[^`\n]*`);', lambda m: f'const title = {js(d["title"])};', s, count=1)
    s = re.sub(r'const description =(\s*)"[^"\n]*";', lambda m: f'const description ={m.group(1)}{js(d["description"])};', s, count=1)
    # editorial H1 (first <h1> after data-hero)
    i = s.find('<header data-hero')
    if i >= 0:
        m = re.compile(r'(<h1[^>]*>)(.*?)(</h1>)', re.S).search(s, i)
        if m:
            inner = m.group(2)
            indent = re.match(r'\s*', inner).group(0) or ''
            tail = re.search(r'\s*$', inner).group(0)
            s = s[:m.start(2)] + indent + html.escape(d['h1'], quote=False) + tail + s[m.end(2):]
    # page-specific method note
    method = d['method'].strip()
    if not method.endswith('.'): method += '.'
    s = s.replace(SHARED, html.escape(method, quote=False) + ' No paid placements.')
    # H2s: no "N." prefixes; a page-specific mistakes heading
    s = re.sub(r'(<h2[^>]*>\s*)\d{1,2}\.\s+', r'\1', s)
    s = re.sub(r'(<h2[^>]*>\s*)Common Mistakes to Avoid(\s*</h2>)',
               lambda m: f'{m.group(1)}Common Mistakes With {html.escape(d["topic"], quote=False)}{m.group(2)}', s)
    if s != o:
        changed += 1
        if not DRY: open(p, 'w', encoding='utf-8').write(s)

# /best-of/ cards carry the page's own description, so no card makes a claim the page does not
p = 'src/pages/best-of.astro'
s = o = open(p, encoding='utf-8').read()
Q = r"'(?:[^'\\]|\\.)*'"
def card(m):
    slug = m.group(4)
    if slug not in data: return m.group(0)
    desc = data[slug]['description'].replace('\\', '\\\\').replace("'", "\\'")
    return f"{m.group(1)}description: '{desc}',{m.group(3)}url: '/{slug}/'"
s = re.sub(rf"(\{{ title: {Q}, )description: ({Q}),( badge: {Q}, )url: '/([a-z0-9-]+)/'", card, s)
if s != o and not DRY: open(p, 'w', encoding='utf-8').write(s)
print(f'{changed} pages updated; best-of {"updated" if s != o else "unchanged"}')
