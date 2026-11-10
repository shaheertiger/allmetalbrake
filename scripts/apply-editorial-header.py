#!/usr/bin/env python3
"""Rewrite each article's hero, byline and table of contents into the editorial
header: a light band with kicker + updated date, a dark H1, the lede, a
"Written by" byline, the How-We-Pick strip, and a collapsible numbered
"In This Guide" box.

  python3 scripts/apply-editorial-header.py [--dry] [page.astro ...]

Idempotent: pages that already carry `data-hero` are skipped. The text of the
H1, lede, byline and contents is carried over unchanged.
"""
import re, sys, glob, html, os

DRY = '--dry' in sys.argv
files = [a for a in sys.argv[1:] if a.endswith('.astro')] or sorted(glob.glob('src/pages/*.astro'))

HERO_START = re.compile(r'\n([ \t]*)(?:<!-- Hero[^>]*-->\s*\n[ \t]*)?<div class="[^"]*(?:bg-gray-900[^"]*\bpy-16\b|from-gray-900|bg-\[#0F172A\])')
TAG = re.compile(r'<[^>]+>')

def text(s):
    return re.sub(r'\s+', ' ', TAG.sub('', s)).strip()

def find_region(s):
    art = s.find('<article')
    m = HERO_START.search(s, art if art >= 0 else 0)
    if not m:
        return None
    start = m.start() + 1
    toc = s.find('In This Guide', start)
    if toc < 0:
        return None
    nav_end = s.find('</nav>', toc)
    m2 = re.compile(r'</nav>\s*</div>\s*</div>\n').match(s, nav_end)
    if not m2:
        return None
    return start, m2.end(), m.group(1)

def build(region, indent):
    pre_h1, h1_and_after = region.split('<h1', 1)
    kicker = re.search(r'<span[^>]*>\s*([^<]+?)\s*</span>', pre_h1)
    kicker = kicker.group(1).strip() if kicker else 'Buyer&#39;s Guide'
    h1 = re.search(r'^[^>]*>(.*?)</h1>', h1_and_after, re.S).group(1)
    h1 = text(h1)
    after_h1 = h1_and_after.split('</h1>', 1)[1]
    hero_part = re.split(r'<!-- Author|AuthorAvatar', after_h1)[0]
    lede = re.search(r'<p[^>]*>(.*?)</p>', hero_part, re.S)
    lede = re.sub(r'\s+', ' ', lede.group(1)).strip() if lede else ''
    by = re.search(r'<p class="text-sm font-bold text-gray-900">\s*([^<]+?)\s*</p>\s*<p class="text-xs text-gray-500 uppercase tracking-widest">\s*([^<]+?)\s*</p>', region)
    name, role = (by.group(1), by.group(2)) if by else ('{authorName(Astro.url.pathname)}', 'Home Improvement Editor')
    nav = region[region.find('In This Guide'):]
    items = re.findall(r'<a\s+href="#([^"]+)"[^>]*>\s*(?:\d+\.\s*)?(.*?)\s*</a>', nav, re.S)
    items = [(a, re.sub(r'\s+', ' ', l)) for a, l in items]
    author_slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    author_href = f'/authors/{author_slug}/' if os.path.exists(f'src/pages/authors/{author_slug}.astro') else '/about/'
    i = indent
    toc_links = '\n'.join(
        f'{i}          <a href="#{a}" class="flex items-baseline gap-3 py-2.5 border-t border-gray-100 text-[15px] text-gray-700 hover:text-[#1E90FF] no-underline"><span class="w-6 shrink-0 text-gray-400 font-semibold">{n}.</span><span>{l}</span></a>'
        for n, (a, l) in enumerate(items, 1))
    return f'''{i}<!-- Hero Section -->
{i}<header data-hero class="bg-[#F4F6F8] border-b border-gray-200">
{i}  <div class="max-w-3xl mx-auto px-4 pt-10 pb-8 lg:pt-14 lg:pb-10">
{i}    <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-widest m-0 mb-4">
{i}      <span class="text-[#D93A00]">{kicker}</span>
{i}      <span class="text-gray-300" aria-hidden="true">&bull;</span>
{i}      <span class="text-gray-500">Updated {{dates.display}}</span>
{i}    </p>
{i}    <h1 class="text-[2.1rem] leading-[1.15] sm:text-5xl font-black tracking-tight text-gray-900 m-0">
{i}      {h1}
{i}    </h1>
{i}    <p class="text-lg lg:text-xl text-gray-600 leading-relaxed mt-5 mb-0">
{i}      {lede}
{i}    </p>
{i}    <!-- Author & Meta -->
{i}    <div class="flex items-center gap-3 mt-7">
{i}      <AuthorAvatar size={{40}} />
{i}      <div class="min-w-0">
{i}        <p class="text-sm text-gray-600 m-0">Written by <a href="{author_href}" class="font-bold text-gray-900 no-underline hover:underline">{name}</a></p>
{i}        <p class="text-xs text-gray-500 m-0">{role} &middot; Updated {{dates.display}}</p>
{i}      </div>
{i}      <SocialProof users="" />
{i}    </div>
{i}    <div class="flex items-center gap-4 mt-6">
{i}      <TrustBadge />
{i}      <span class="flex-1 h-px bg-gray-300"></span>
{i}    </div>
{i}    <p class="text-sm text-gray-600 leading-relaxed mt-3 mb-0">
{i}      We judge every product on its spec sheet, its label and what owners report over time, not on the marketing. No paid placements, and commission never sets a ranking. <a href="/how-we-test/" class="font-bold text-gray-900 underline">Read how we pick</a>
{i}    </p>
{i}  </div>
{i}</header>

{i}<!-- Table of Contents -->
{i}<div class="max-w-3xl mx-auto px-4 pt-8">
{i}  <details open class="group bg-white border border-gray-200 rounded-2xl px-5 pt-4 pb-2">
{i}    <summary class="flex items-center gap-3 pb-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
{i}      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" /></svg>
{i}      <span class="font-bold text-gray-900">In This Guide</span>
{i}      <span class="text-xs font-semibold text-gray-400">{len(items)} sections</span>
{i}      <svg class="w-5 h-5 ml-auto text-gray-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 15l6-6 6 6" /></svg>
{i}    </summary>
{i}    <nav class="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
{toc_links}
{i}    </nav>
{i}  </details>
{i}</div>
'''

KNOWN = {'TrustBadge', 'AuthorAvatar', 'SocialProof'}
changed, skipped = 0, []
for f in files:
    s = open(f).read()
    if 'data-hero' in s or 'In This Guide' not in s:
        continue
    r = find_region(s)
    if not r:
        skipped.append((f, 'region not found')); continue
    a, b, indent = r
    region = s[a:b]
    if region.count('<div') != region.count('</div>'):
        skipped.append((f, 'unbalanced divs')); continue
    extra = set(re.findall(r'<([A-Z]\w+)', region)) - KNOWN
    if extra or '<img' in region:
        skipped.append((f, f'extra content {extra or "img"}')); continue
    new = build(region, indent)
    if DRY:
        changed += 1; continue
    s = s[:a] + new + s[b:]
    for comp in ('TrustBadge', 'AuthorAvatar', 'SocialProof'):
        if f'import {comp} ' not in s:
            s = s.replace('import Layout from "../layouts/Layout.astro";',
                          f'import Layout from "../layouts/Layout.astro";\nimport {comp} from "../components/{comp}.astro";', 1)
    open(f, 'w').write(s)
    changed += 1
print(f'{"would change" if DRY else "changed"}: {changed}')
for f, why in skipped:
    print('SKIP', f, why)
