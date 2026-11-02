import { ApiClient, TypedDefaultApi, GetItemsRequestContent } from "amazon-creators-api";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// Credentials pasted from a "<your-id-here>" template keep the angle brackets, and
// Amazon then rejects them with a 401. Strip brackets and stray whitespace up front.
for (const name of Object.keys(process.env).filter((k) => k.startsWith("AMAZON_CREATORS_"))) {
  process.env[name] = process.env[name].trim().replace(/^<(.*)>$/, "$1").trim();
}

// One-time/manual data-refresh script, NOT run automatically during `npm run build`.
// Requires AMAZON_CREATORS_CLIENT_ID, AMAZON_CREATORS_CLIENT_SECRET, and
// AMAZON_CREATORS_PARTNER_TAG as environment variables — never hardcode credentials here.
// Output (src/data/product-images.json) is committed to the repo and read statically
// by pages at build time, so the build itself never needs network access or the secret.

const ASINS_PATH = join(import.meta.dirname, "product-image-asins.json");
const OUTPUT_PATH = join(import.meta.dirname, "..", "src", "data", "product-images.json");
const BATCH_SIZE = 10; // GetItems allows up to 10 ASINs per request

const requiredEnvVars = ["AMAZON_CREATORS_CLIENT_ID", "AMAZON_CREATORS_CLIENT_SECRET", "AMAZON_CREATORS_PARTNER_TAG"];
for (const name of requiredEnvVars) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

const client = new ApiClient();
client.credentialId = process.env.AMAZON_CREATORS_CLIENT_ID;
client.credentialSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET;
client.version = process.env.AMAZON_CREATORS_VERSION || "3.1";
client.marketplace = process.env.AMAZON_CREATORS_MARKETPLACE || "www.amazon.com";
const api = new TypedDefaultApi(client);

const productToAsin = JSON.parse(readFileSync(ASINS_PATH, "utf-8"));
const entries = Object.entries(productToAsin);
const images = {};

for (let i = 0; i < entries.length; i += BATCH_SIZE) {
  const batch = entries.slice(i, i + BATCH_SIZE);
  const req = new GetItemsRequestContent(
    process.env.AMAZON_CREATORS_PARTNER_TAG,
    batch.map(([, asin]) => asin)
  );
  req.resources = ["images.primary.medium"];

  try {
    const result = await api.getItems(client.marketplace, req);
    const itemsByAsin = Object.fromEntries((result?.itemsResult?.items || []).map((item) => [item.asin, item]));
    for (const [productId, asin] of batch) {
      const url = itemsByAsin[asin]?.images?.primary?.medium?.url;
      if (url) {
        images[productId] = url;
      } else {
        console.warn(`No image found for ${productId} (${asin})`);
      }
    }
  } catch (err) {
    console.error(`Batch starting at index ${i} failed:`, err?.message || err);
  }

  if (i + BATCH_SIZE < entries.length) {
    await new Promise((r) => setTimeout(r, 500));
  }
}

writeFileSync(OUTPUT_PATH, JSON.stringify(images, null, 2) + "\n");
console.log(`Wrote ${Object.keys(images).length}/${entries.length} product images to ${OUTPUT_PATH}`);
