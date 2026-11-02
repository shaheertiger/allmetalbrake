#!/usr/bin/env node
// Turns a content spec (JSON) into a canonical .astro article page.
//
//   node scripts/scaffold-article.mjs spec.json
//
// The writer produces prose as structured JSON; this file owns every piece of
// markup, so pages come out identical in shape to the hand-written ones and
// `format-audit` passes by construction. See .claude/skills/daily-publish/SKILL.md
// for the spec fields and an example.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { AUTHORS, authorForPath } from '../src/data/authors.ts';

const PAGES_DIR = join(import.meta.dirname, '..', 'src', 'pages');
const q = (s) => JSON.stringify(s);
const indent = (json, n) => JSON.stringify(json, null, 2).replace(/\n/g, '\n' + ' '.repeat(n));

function renderBlocks(blocks) {
  return blocks.map((b) => {
    if (b.type === 'p') return `          <p>\n            ${b.text}\n          </p>\n`;
    if (b.type === 'h3') return `          <h3 class="text-2xl font-bold text-gray-900 mt-10 mb-4">${b.text}</h3>\n`;
    if (b.type === 'callout') return `          <div class="bg-gray-900 text-white rounded-2xl p-6 lg:p-8 my-8">
            <p class="text-xs font-black uppercase tracking-widest text-[#38BDF8] mb-3">${b.kicker}</p>
            <p class="text-xl font-bold text-white mb-3">${b.headline}</p>
            <p class="text-gray-300 leading-relaxed m-0">${b.body}</p>
          </div>\n`;
    if (b.type === 'stats') return `          <div class="bg-gray-900 text-white rounded-2xl p-6 lg:p-8 my-8">
            <p class="text-xs font-black uppercase tracking-widest text-[#38BDF8] mb-4">${b.kicker}</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
${b.stats.map((s, i) => `              <div>
                <p class="text-3xl font-black ${i % 2 ? 'text-[#38BDF8]' : 'text-white'}">${s.value}</p>
                <p class="text-gray-400 text-xs mt-1">${s.label}</p>
              </div>`).join('\n')}
            </div>
          </div>\n`;
    if (b.type === 'table') return `          <div class="overflow-hidden border border-gray-200 rounded-2xl my-8">
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
${b.headers.map((h) => `                    <th class="px-4 py-4 font-bold text-gray-600 text-sm">${h}</th>`).join('\n')}
                  </tr>
                </thead>
                <tbody>
${b.rows.map((row, i) => `                  <tr class="${i % 2 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-100">
${row.map((cell, j) => `                    <td class="px-4 py-4 ${j === 0 ? 'font-black text-gray-900' : 'text-gray-700'}">${cell}</td>`).join('\n')}
                  </tr>`).join('\n')}
                </tbody>
              </table>
            </div>
          </div>\n`;
    throw new Error(`Unknown block type: ${b.type}`);
  }).join('\n');
}

export function render(spec) {
  // Visible byline is written literally (the word-count gate reads page text);
  // it follows the same routing as the schema and meta author.
  const a = AUTHORS[authorForPath(`/${spec.slug}/`)];
  const byline = { name: a.name, role: a.role.replace(/&/g, '&amp;') };
  const tocItems = [...spec.toc.map(([a, l]) => [a, l]), ['mistakes', 'Common Mistakes'], ['faq', 'FAQ']];
  const toc = tocItems.map(([a, l], i) =>
    `          <a href="#${a}" class="text-sm text-gray-600 hover:text-[#1E90FF] no-underline py-1 font-medium">${i + 1}. ${l}</a>`
  ).join('\n');

  const sections = spec.sections.map((s, i) =>
`        <div id="${s.anchor}" class="scroll-mt-24">
          <h2 class="text-3xl font-black text-gray-900 mt-16 mb-6">
            ${i + 1}. ${s.heading}
          </h2>

${renderBlocks(s.blocks)}        </div>
`).join('\n');

  const faqSchema = indent(spec.faq.map(([name, text]) => ({
    '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text },
  })), 6);

  const faqHtml = spec.faq.map(([question, answer]) =>
`            <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 class="text-lg font-bold text-gray-900 mb-2">${question}</h3>
              <p class="text-gray-700 text-sm leading-relaxed">
                ${answer}
              </p>
            </div>
`).join('\n');

  const mistakesHtml = spec.mistakes.map(([heading, body]) =>
`            <div class="bg-red-50 border border-red-100 rounded-2xl p-6">
              <h3 class="text-lg font-bold text-red-900 mt-0 mb-2">${heading}</h3>
              <p class="text-gray-700 text-sm m-0">
                ${body}
              </p>
            </div>`).join('\n');

  const relatedHtml = spec.related.map(({ url, color, kicker, name, blurb }) =>
`            <a href="${url}" class="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow no-underline group">
              <p class="${color} font-black text-xs uppercase tracking-widest mb-2">${kicker}</p>
              <h3 class="text-gray-900 font-bold text-lg group-hover:text-[#1E90FF] transition-colors">${name}</h3>
              <p class="text-gray-500 text-sm mt-2">${blurb}</p>
            </a>`).join('\n');

  const closing = spec.closing.map((t) =>
    `          <p class="text-gray-300 leading-relaxed mb-4">\n            ${t}\n          </p>`).join('\n');

  const n = spec.sections.length;

  return `---
import Layout from "../layouts/Layout.astro";
import MoreInCategory from "../components/MoreInCategory.astro";
import AuthorBio from "../components/AuthorBio.astro";
import { authorSchema, authorName } from "../data/authors";
import AuthorAvatar from "../components/AuthorAvatar.astro";
import TrustBadge from "../components/TrustBadge.astro";
import SocialProof from "../components/SocialProof.astro";
import TopPick from "../components/TopPick.astro";
import { pageDates } from "../data/dates";

const moreInCategory = ${indent(spec.moreInCategory, 0)};
const dates = pageDates(Astro.url.pathname, { published: ${q(spec.published)}, modified: ${q(spec.published)} });
const title = ${q(spec.title)};
const description =
  ${q(spec.description)};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.allmetalbrake.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Guides",
          item: "https://www.allmetalbrake.com/best-of/",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: ${q(spec.crumb)},
          item: "https://www.allmetalbrake.com/${spec.slug}/",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: ${faqSchema},
    },
    {
      "@type": "Article",
      headline: title,
      description: description,
      author: authorSchema(Astro.url.pathname),
      datePublished: dates.published,
      dateModified: dates.modified,
      publisher: { "@type": "Organization", name: "All Metal Brake" },
    },
  ],
};
---

<Layout
  title={title}
  description={description}
  ogType="article"
  article={{
    publishedTime: dates.published,
    modifiedTime: dates.modified,
    author: authorName(Astro.url.pathname),
    section: ${q(spec.section)},
    tags: ${indent(spec.tags, 4)},
  }}
  jsonLd={schema}
  stickyCta={{
    text: ${q(spec.ctaText)},
    link: ${q(spec.ctaLink)},
  }}
>
  <article class="relative overflow-hidden">
    <!-- Hero -->
    <div class="bg-gray-900 py-16 lg:py-24 relative overflow-hidden">
      <div class="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <div class="flex justify-center mb-6">
          <TrustBadge />
        </div>
        <div class="flex justify-center gap-3 mb-6">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF4500]/20 text-[#FF4500] text-xs font-black uppercase tracking-widest border border-[#FF4500]/30">
            ${spec.kicker}
          </span>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-widest border border-green-500/20">
            Field Tested
          </span>
        </div>
        <h1 class="text-4xl lg:text-6xl font-black text-white leading-tight mb-8">
          ${spec.h1}
        </h1>
        <p class="text-xl text-gray-300 leading-relaxed mb-8 max-w-3xl mx-auto">
          ${spec.heroLede}
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#${spec.toc[0][0]}"
            class="px-8 py-4 bg-[#FF4500] hover:bg-[#E63E00] text-white font-black rounded-xl shadow-lg transition-all no-underline"
          >
            ${spec.cta1}
          </a>
          <a
            href="#faq"
            class="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 no-underline"
          >
            Jump to the FAQ
          </a>
        </div>
      </div>
    </div>

    <!-- Author & Meta -->
    <div class="max-w-3xl mx-auto px-4 pt-12">
      <div class="flex items-center gap-6 border-b border-gray-100 pb-8">
        <div class="flex items-center gap-3">
          <AuthorAvatar size={48} />
          <div>
            <p class="text-sm font-bold text-gray-900">${byline.name}</p>
            <p class="text-xs text-gray-500 uppercase tracking-widest">${byline.role}</p>
          </div>
        </div>
        <div class="h-10 w-px bg-gray-200 hidden sm:block"></div>
        <div class="hidden sm:block">
          <p class="text-sm font-bold text-gray-900">Last Updated</p>
          <p class="text-xs text-gray-500">{dates.display}</p>
        </div>
        <div class="hidden sm:block ml-auto">
          <SocialProof users=${q(spec.social)} />
        </div>
      </div>
    </div>

    <!-- Table of Contents -->
    <div class="max-w-3xl mx-auto px-4 py-10">
      <div class="bg-gray-50 border border-gray-200 rounded-2xl p-6 lg:p-8">
        <h2 class="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          In This Guide
        </h2>
        <nav class="grid grid-cols-1 sm:grid-cols-2 gap-2">
${toc}
        </nav>
      </div>
    </div>

    <!-- Body -->
    <div class="max-w-3xl mx-auto px-4 pb-16 lg:pb-24">
      <div class="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed">
        <p class="text-2xl font-medium text-gray-900 mb-8 italic">
          ${spec.lede}
        </p>

        <TopPick />

${sections}
        <!-- Common Mistakes -->
        <div id="mistakes" class="scroll-mt-24 mt-16">
          <h2 class="text-3xl font-black text-gray-900 mb-6">
            ${n + 1}. Common Mistakes to Avoid
          </h2>

          <div class="space-y-6 my-8">
${mistakesHtml}
          </div>
        </div>

        <!-- FAQ -->
        <div id="faq" class="scroll-mt-24 mt-16">
          <h2 class="text-3xl font-black text-gray-900 mb-6">
            ${n + 2}. Frequently Asked Questions
          </h2>

          <div class="space-y-6">
${faqHtml}
          </div>
        </div>

        <!-- Related Guides -->
        <div class="mt-16">
          <h2 class="text-3xl font-black text-gray-900 mb-6">${spec.relatedHeading}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
${relatedHtml}
          </div>
        </div>

        <!-- Closing -->
        <div class="mt-16 bg-gray-900 text-white rounded-2xl p-8">
          <h2 class="text-2xl font-black text-white mb-4">The Bottom Line</h2>
${closing}
        </div>

        <MoreInCategory category=${q(spec.section)} links={moreInCategory} />

        <AuthorBio />
      </div>
    </div>
  </article>
</Layout>
`;
}

if (import.meta.filename === process.argv[1]) {
  const specPath = process.argv[2];
  if (!specPath) {
    console.error('Usage: node scripts/scaffold-article.mjs <spec.json>');
    process.exit(1);
  }
  const spec = JSON.parse(readFileSync(specPath, 'utf8'));
  const out = join(PAGES_DIR, `${spec.slug}.astro`);
  if (existsSync(out) && !process.argv.includes('--force')) {
    console.error(`Refusing to overwrite existing page: ${spec.slug}.astro (pass --force to replace)`);
    process.exit(1);
  }
  writeFileSync(out, render(spec));
  console.log(`Wrote src/pages/${spec.slug}.astro`);
}
