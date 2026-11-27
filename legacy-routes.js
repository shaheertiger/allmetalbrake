/**
 * Site-specific old-URL rules, run first by middleware.js (which is shared with the sister sites).
 * Most old URLs 301 in vercel.json.
 *
 * Before this site, the domain hosted a metal-brake machinery catalog. Its /products/... and
 * /news/... URLs are still in Bing's index (docs/what-works.md rule A4) and have no equivalent
 * here, so they answer 410 Gone (dropped from the index faster than a 404) instead of being
 * rebuilt or redirected.
 */

const GONE = /^\/(products|news)(\/|$)/i;

const GONE_HTML =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex">' +
  '<title>Page removed</title></head><body><h1>This page has been permanently removed</h1>' +
  '<p><a href="https://www.allmetalbrake.com/">Go to the home page</a></p></body></html>';

/** A Response for an old URL, or undefined to carry on. */
export function legacyRoute(pathname, method) {
  if (GONE.test(pathname)) {
    return new Response(method === 'HEAD' ? null : GONE_HTML, {
      status: 410,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
  return undefined;
}
