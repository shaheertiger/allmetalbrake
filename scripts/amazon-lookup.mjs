#!/usr/bin/env node
// Read-only Amazon lookup: search by exact model, or get items by ASIN, and print
// title, ASIN, real star rating and review count. Used to verify a product before it
// goes on a page and to fill ratings with real figures.
//   node --env-file-if-exists=.env scripts/amazon-lookup.mjs search "GE GTE18GTNRWW" ...
//   node --env-file-if-exists=.env scripts/amazon-lookup.mjs get B0... B0...
import { ApiClient, TypedDefaultApi, SearchItemsRequestContent, GetItemsRequestContent } from 'amazon-creators-api';
for (const n of Object.keys(process.env).filter((k) => k.startsWith('AMAZON_CREATORS_'))) {
  process.env[n] = process.env[n].trim().replace(/^<(.*)>$/, '$1').trim();
}
const client = new ApiClient();
client.credentialId = process.env.AMAZON_CREATORS_CLIENT_ID;
client.credentialSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET;
client.version = process.env.AMAZON_CREATORS_VERSION || '3.1';
client.marketplace = process.env.AMAZON_CREATORS_MARKETPLACE || 'www.amazon.com';
const api = new TypedDefaultApi(client);
const RES = ['itemInfo.title', 'itemInfo.features', 'customerReviews.count', 'customerReviews.starRating', 'images.primary.large'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const row = (it) => ({
  asin: it.asin, title: it.itemInfo?.title?.displayValue,
  rating: it.customerReviews?.starRating?.value ?? null, count: it.customerReviews?.count ?? null,
  image: it.images?.primary?.large?.url, features: (it.itemInfo?.features?.displayValues || []).slice(0, 6),
});
const [mode, ...args] = process.argv.slice(2);
const out = [];
if (mode === 'search') {
  for (const q of args) {
    const req = new SearchItemsRequestContent();
    req.keywords = q; req.partnerTag = process.env.AMAZON_CREATORS_PARTNER_TAG; req.resources = RES; req.itemCount = 5;
    try { out.push({ query: q, items: ((await api.searchItems(client.marketplace, req))?.searchResult?.items || []).map(row) }); }
    catch (e) { out.push({ query: q, error: String(e.message || e).slice(0, 200) }); }
    await sleep(1100);
  }
} else if (mode === 'get') {
  for (let i = 0; i < args.length; i += 10) {
    const req = new GetItemsRequestContent();
    req.itemIds = args.slice(i, i + 10); req.partnerTag = process.env.AMAZON_CREATORS_PARTNER_TAG; req.resources = RES;
    try { out.push(...((await api.getItems(client.marketplace, req))?.itemsResult?.items || []).map(row)); }
    catch (e) { out.push({ ids: req.itemIds, error: String(e.message || e).slice(0, 200) }); }
    await sleep(1100);
  }
}
console.log(JSON.stringify(out, null, 1));
