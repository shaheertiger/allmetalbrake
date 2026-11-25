/**
 * Site-specific old-URL rules, run first by middleware.js (which is shared with the sister sites).
 * allmetalbrake.com has none here: every old URL 301s in vercel.json.
 */

/** A Response for an old URL, or undefined to carry on. */
export function legacyRoute(_pathname, _method) {
  return undefined;
}
