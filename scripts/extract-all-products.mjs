import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const PAGES_DIR = join(import.meta.dirname, "..", "src", "pages");
const SKIP_FILES = new Set([
  "best-exterior-caulk.astro",
  "best-ice-melt-for-concrete.astro",
  "best-fence-stain.astro",
  "best-driveway-cleaner.astro",
  "best-oil-stain-remover-for-concrete.astro",
  "best-paver-sealer.astro",
  "best-polymeric-sand.astro",
  "best-surface-cleaner-for-pressure-washer.astro",
  "best-mens-back-shavers.astro", // different card layout, out of scope
]);

const files = readdirSync(PAGES_DIR).filter((f) => f.endsWith(".astro"));
const allProducts = [];
const byFile = {};

for (const file of files) {
  if (SKIP_FILES.has(file)) continue;
  const src = readFileSync(join(PAGES_DIR, file), "utf-8");
  if (!src.includes("const PRODUCTS = [")) continue;

  // Only look inside the PRODUCTS array block, not later id="..." usages elsewhere in the page
  const arrStart = src.indexOf("const PRODUCTS = [");
  const arrEnd = src.indexOf("\n];", arrStart);
  const block = src.slice(arrStart, arrEnd === -1 ? undefined : arrEnd);

  // Hand-written pages use bare keys (id: "..."); scaffold-roundup.mjs emits JSON
  // with quoted keys ("id": "..."). Accept both, and unescape the string value.
  const field = (key) => new RegExp(`^\\s*"?${key}"?: ("(?:[^"\\\\]|\\\\.)*")`, "gm");
  const ids = [...block.matchAll(field("id"))].map((m) => JSON.parse(m[1]));
  const names = [...block.matchAll(field("name"))].map((m) => JSON.parse(m[1]));

  if (ids.length !== names.length) {
    console.warn(`MISMATCH in ${file}: ${ids.length} ids vs ${names.length} names`);
    continue;
  }

  byFile[file] = ids.length;
  for (let i = 0; i < ids.length; i++) {
    allProducts.push({ id: ids[i], name: names[i], file });
  }
}

writeFileSync(
  join(import.meta.dirname, "all-products.json"),
  JSON.stringify(allProducts, null, 2)
);

console.log(`Extracted ${allProducts.length} products across ${Object.keys(byFile).length} files`);
console.log(JSON.stringify(byFile, null, 2));
