/**
 * Vercel Routing Middleware: serves the Markdown copy of each page, written into
 * dist/ by scripts/build-markdown.mjs, with the headers AI agents expect.
 *
 *   GET /some-page.md                          -> Markdown of /some-page/
 *   GET /some-page/ + Accept: text/markdown    -> Markdown of /some-page/ (q-values respected)
 *   GET /some-page/ from an AI bot (GPTBot...)  -> Markdown, unless its Accept ranks HTML higher
 *   GET /some-page/ + Accept: application/json -> 406 (neither HTML nor Markdown is acceptable)
 *   GET /api/md/some-page                      -> Markdown of /some-page/, always
 *   GET /api/md/_catalog                       -> JSON list of every Markdown page
 *
 * Everything else passes through to the static HTML, which gets a Link header pointing
 * at its Markdown twin. Browsers, curl and link previews (a wildcard Accept, or none)
 * always get HTML. Negotiation and bot detection come from @dualmark/core, so the
 * behaviour matches the AEO spec (https://dualmark.dev/docs/spec/overview).
 */

import { AEO_SPEC_VERSION, detectAIBot, negotiateFormat } from '@dualmark/core';
import { next } from '@vercel/functions';

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!_astro/|_vercel/|images/).*)'],
};

// Marks the middleware's own request for the static .md file so it isn't handled twice.
const INTERNAL = 'x-markdown-internal';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Content-Type',
};

/** Files that describe the whole site, advertised on every HTML page. */
const DESCRIBED_BY = ['/llms.txt', '/llms-full.txt', '/ai.txt'].map((p) => `<${p}>; rel="describedby"; type="text/plain"`);

/**
 * Picks the format for a page request: 'markdown', 'html', or null when the Accept
 * header rules out both (the caller answers 406). Known AI bots get Markdown first
 * when their Accept doesn't prefer HTML (e.g. a bare GPTBot request with Accept: *\/*).
 */
export function chooseFormat(accept, userAgent) {
  const isBot = detectAIBot(userAgent).isBot;
  return { isBot, format: negotiateFormat(accept, isBot ? ['markdown', 'html'] : ['html', 'markdown']) };
}

/** /some-page/ -> /some-page.md ; / -> /index.md */
function markdownPath(pathname) {
  const p = pathname.replace(/\.md$/, '').replace(/\/+$/, '');
  return p === '' || p === '/index' ? '/index.md' : `${p}.md`;
}

/** Pages whose HTML may be swapped for Markdown: no file extension, not an endpoint. */
function isContentRoute(pathname) {
  return !/\.[a-z0-9]+$/i.test(pathname) && !/^\/(api|_[^/]*|\.well-known)(\/|$)/.test(pathname);
}

function respond(request, body, { status = 200, contentType = 'text/markdown; charset=utf-8', canonical, lastModified, byUserAgent = false } = {}) {
  const headers = new Headers({
    ...CORS,
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'X-AEO-Version': AEO_SPEC_VERSION,
    // The same URL can answer in HTML or Markdown, so caches must key on Accept
    // (and on User-Agent when an AI bot got Markdown because of who it is).
    Vary: byUserAgent ? 'Accept, User-Agent' : 'Accept',
    'X-Markdown-Tokens': String(Math.ceil(body.length / 4)),
    'X-Robots-Tag': 'noindex, follow',
    'Cache-Control': status === 200 ? 'public, s-maxage=3600, stale-while-revalidate=86400' : 'public, s-maxage=300',
  });
  if (canonical) {
    headers.set('Content-Location', canonical);
    headers.set('Link', `<${canonical}>; rel="canonical"`);
  }
  if (lastModified) headers.set('Last-Modified', lastModified);
  return new Response(request.method === 'HEAD' ? null : body, { status, headers });
}

function notFound(request, pathname) {
  const origin = new URL(request.url).origin;
  const body = `# Page not found\n\n> There is no Markdown page at ${pathname}.\n\nEvery page on this site is listed in ${origin}/llms.txt and ${origin}/api/md/_catalog.\n`;
  return respond(request, body, { status: 404 });
}

/** 406 for a page request whose Accept allows neither HTML nor Markdown. */
function notAcceptable(request, pathname) {
  const body = `Not Acceptable. ${pathname} is available as text/html or text/markdown (${markdownPath(pathname)}).\n`;
  return new Response(request.method === 'HEAD' ? null : body, {
    status: 406,
    headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff', Vary: 'Accept', Link: alternateLink(pathname) },
  });
}

function alternateLink(pathname) {
  return `<${markdownPath(pathname)}>; rel="alternate"; type="text/markdown"`;
}

/** Lets the static HTML through, adding a Link header that advertises its Markdown twin. */
function passHtml(pathname) {
  return next({ headers: { Link: [alternateLink(pathname), ...DESCRIBED_BY].join(', ') } });
}

async function fetchInternal(request, path) {
  return fetch(new URL(path, request.url), { headers: { [INTERNAL]: '1' } });
}

async function serveMarkdown(request, pathname, { negotiated = false, byUserAgent = false } = {}) {
  const res = await fetchInternal(request, markdownPath(pathname));
  if (!res.ok) return negotiated ? undefined : notFound(request, pathname);
  const body = await res.text();
  const canonical = body.match(/^Canonical: (\S+)$/m)?.[1];
  const updated = body.match(/^Last updated: (\d{4}-\d{2}-\d{2})$/m)?.[1];
  return respond(request, body, {
    canonical,
    lastModified: updated ? new Date(`${updated}T00:00:00Z`).toUTCString() : undefined,
    byUserAgent,
  });
}

export default async function middleware(request) {
  if (request.headers.get(INTERNAL)) return;
  const { pathname } = new URL(request.url);
  const { method } = request;

  const direct = pathname.startsWith('/api/md/') || pathname === '/api/md';
  const suffix = !direct && pathname.endsWith('.md');

  if (!direct && !suffix) {
    // Only page routes are negotiated; assets, endpoints and non-GET requests pass through.
    if (!isContentRoute(pathname) || (method !== 'GET' && method !== 'HEAD')) return;
    const { isBot, format } = chooseFormat(request.headers.get('accept'), request.headers.get('user-agent'));
    if (format === null) return notAcceptable(request, pathname);
    if (format === 'markdown') {
      const md = await serveMarkdown(request, pathname, { negotiated: true, byUserAgent: isBot });
      if (md) return md;
    }
    return passHtml(pathname);
  }

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
  if (method !== 'GET' && method !== 'HEAD') {
    return new Response('Method not allowed\n', { status: 405, headers: { ...CORS, Allow: 'GET, HEAD, OPTIONS' } });
  }

  if (direct) {
    const rest = pathname.replace(/^\/api\/md\/?/, '');
    if (rest.replace(/\/+$/, '') === '_catalog') {
      const res = await fetchInternal(request, '/md-catalog.json');
      if (!res.ok) return notFound(request, pathname);
      return respond(request, await res.text(), { contentType: 'application/json; charset=utf-8' });
    }
    return serveMarkdown(request, `/${rest}`);
  }
  return serveMarkdown(request, pathname);
}
