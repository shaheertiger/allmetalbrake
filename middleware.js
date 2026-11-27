// Vercel Routing Middleware (framework-agnostic; runs before the static files).
//
// The domain used to host a metal-brake machinery site whose /products/... and
// /news/... URLs are still in Bing's index. They have no equivalent on this site,
// so answer 410 Gone (faster de-indexing than a 404) instead of rebuilding them.
// See docs/WHAT-WORKS.md rule A4.

export const config = {
  matcher: ['/products', '/products/:path*', '/news', '/news/:path*'],
};

export default function middleware() {
  return new Response(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page removed</title></head>' +
      '<body><h1>This page has been permanently removed</h1><p><a href="https://www.allmetalbrake.com/">Go to the home page</a></p></body></html>',
    {
      status: 410,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
