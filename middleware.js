/**
 * Vercel Routing Middleware (copied from enthusiastreview.com).
 *
 * Dualmark / AEO (https://dualmark.dev, AEO spec 1.0): every page has a Markdown twin,
 * written into dist/ by scripts/build-markdown.mjs.
 *   GET /best/x.md                            -> Markdown of /best/x/
 *   GET /best/x/ + Accept: text/markdown      -> Markdown (q-values respected)
 *   GET /best/x/ from a known AI bot          -> Markdown, unless its Accept prefers HTML
 *   GET /best/x/ + Accept: application/json   -> 406 Not Acceptable
 *   GET /api/md/best/x                        -> Markdown of /best/x/, always
 *   GET /api/md/_catalog                      -> JSON list of every Markdown page
 * HTML responses get Vary: Accept and a Link header pointing at their Markdown twin.
 * Browsers, curl and link previews (wildcard or missing Accept) always get HTML.
 * Old URLs are 301'd in vercel.json, which runs before this.
 */
import { AEO_SPEC_VERSION, detectAIBot, negotiateFormat } from '@dualmark/core';
import { next } from '@vercel/functions';

export const config = {
  runtime: 'nodejs',
  // Everything except build assets and static files (but .md files are included).
  matcher: ['/((?!_astro/|_vercel/|.*\\.(?:css|js|mjs|png|jpe?g|gif|webp|avif|svg|ico|woff2?|txt|xml|json|map)$).*)'],
};

// Marks the middleware's own request for a static .md file so it isn't handled twice.
const INTERNAL = 'x-markdown-internal';
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS', 'Access-Control-Allow-Headers': 'Accept, Content-Type' };
const DESCRIBED_BY = ['/llms.txt', '/llms-full.txt', '/ai.txt'].map((p) => `<${p}>; rel="describedby"; type="text/plain"`);

/** /best/x/ -> /best/x.md ; / -> /index.md */
function markdownPath(pathname) {
  const p = pathname.replace(/\.md$/, '').replace(/\/+$/, '');
  return p === '' || p === '/index' ? '/index.md' : `${p}.md`;
}
const isContentRoute = (pathname) => !/\.[a-z0-9]+$/i.test(pathname) && !/^\/(api|_[^/]*|\.well-known)(\/|$)/.test(pathname);
const alternateLink = (pathname) => `<${markdownPath(pathname)}>; rel="alternate"; type="text/markdown"`;

function respond(request, body, { status = 200, contentType = 'text/markdown; charset=utf-8', canonical, lastModified, byUserAgent = false } = {}) {
  const headers = new Headers({
    ...CORS,
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'X-AEO-Version': AEO_SPEC_VERSION,
    Vary: byUserAgent ? 'Accept, User-Agent' : 'Accept',
    'X-Markdown-Tokens': String(Math.max(1, Math.ceil(body.length / 4))),
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
  return respond(request, `# Page not found\n\n> There is no Markdown page at ${pathname}.\n\nEvery page is listed in ${origin}/llms.txt and ${origin}/api/md/_catalog.\n`, { status: 404 });
}

function notAcceptable(request, pathname) {
  return new Response(request.method === 'HEAD' ? null : 'Not Acceptable\n\nSupported types: text/html, text/markdown\n', {
    status: 406,
    headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff', Vary: 'Accept', Link: alternateLink(pathname) },
  });
}

const fetchInternal = (request, path) => fetch(new URL(path, request.url), { headers: { [INTERNAL]: '1' } });

async function serveMarkdown(request, pathname, { negotiated = false, byUserAgent = false } = {}) {
  const res = await fetchInternal(request, markdownPath(pathname));
  if (!res.ok) return negotiated ? undefined : notFound(request, pathname);
  const body = await res.text();
  const canonical = body.match(/^Canonical: (\S+)$/m)?.[1];
  const updated = body.match(/^Last updated: (\d{4}-\d{2}-\d{2})$/m)?.[1];
  return respond(request, body, { canonical, lastModified: updated ? new Date(`${updated}T00:00:00Z`).toUTCString() : undefined, byUserAgent });
}

export default async function middleware(request) {
  if (request.headers.get(INTERNAL)) return next();
  const { pathname } = new URL(request.url);
  const { method } = request;

  const direct = pathname === '/api/md' || pathname.startsWith('/api/md/');
  const suffix = !direct && pathname.endsWith('.md');

  if (!direct && !suffix) {
    if (!isContentRoute(pathname) || (method !== 'GET' && method !== 'HEAD')) return next();
    const accept = request.headers.get('accept') ?? '';
    const isBot = detectAIBot(request.headers.get('user-agent') ?? '').isBot;
    // AI bots get Markdown first unless their Accept ranks HTML higher; people get HTML first.
    const format = negotiateFormat(accept, isBot ? ['markdown', 'html'] : ['html', 'markdown']);
    if (format === null) return notAcceptable(request, pathname);
    if (format === 'markdown') {
      const md = await serveMarkdown(request, pathname, { negotiated: true, byUserAgent: isBot });
      if (md) return md;
    }
    return next({ headers: { Link: [alternateLink(pathname), ...DESCRIBED_BY].join(', '), Vary: 'Accept, User-Agent' } });
  }

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
  if (method !== 'GET' && method !== 'HEAD') return new Response('Method not allowed\n', { status: 405, headers: { ...CORS, Allow: 'GET, HEAD, OPTIONS' } });

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
