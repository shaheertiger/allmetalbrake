/** Small HTML helpers shared by build.js and seo.js. No dependencies. */

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', deg: '°', times: '×', frac12: '½',
};

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z][a-z0-9]*);/gi, (m, name) => ENTITIES[name] !== undefined ? ENTITIES[name] : m);
}

/** Visible text of an HTML fragment, whitespace collapsed. */
function textOf(fragment) {
  return decodeEntities(
    fragment
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}

/**
 * innerHTML of every `<div>` whose class list contains `cls`, found by walking
 * div tags so nested divs are kept intact.
 */
function divsByClass(html, cls) {
  const out = [];
  const open = new RegExp(`<div\\b[^>]*class\\s*=\\s*["'][^"']*\\b${cls}\\b[^"']*["'][^>]*>`, 'gi');
  let o;
  while ((o = open.exec(html)) !== null) {
    const start = o.index + o[0].length;
    const tag = /<(\/?)div\b[^>]*>/gi;
    tag.lastIndex = start;
    let depth = 1;
    let m;
    let end = html.length;
    while ((m = tag.exec(html)) !== null) {
      depth += m[1] === '/' ? -1 : 1;
      if (depth === 0) { end = m.index; break; }
    }
    out.push(html.slice(start, end));
  }
  return out;
}

module.exports = { decodeEntities, textOf, divsByClass };
