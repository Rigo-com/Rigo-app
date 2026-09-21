import assert from "node:assert/strict";
import Search, { SEARCH_LIMITS } from "../js/search/index.js";

Search.reset();
assert.equal(Search.initialize(), true);
assert.equal(Search.boot(), true);

const items = Array.from(
  { length:150 },
  (_, index) => ({ id:`item-${index}`, content:`RIGO result ${index}` })
);

let results = await Search.search("RIGO", { items, limit:500 });
assert.equal(results.length, SEARCH_LIMITS.MAX_RESULTS);
assert.equal(Search.snapshot().diagnostics.cacheMisses, 1);

results[0].item.content = "mutated";
const cached = await Search.search("RIGO", { items, limit:500 });
assert.notEqual(cached[0].item.content, "mutated");
assert.equal(Search.snapshot().diagnostics.cacheHits, 1);

const scopedItems = [
  { id:"shared", content:"RIGO private result" }
];

const scopeA = await Search.search("private", {
  items:scopedItems,
  cacheScope:"user-a"
});

const scopeB = await Search.search("private", {
  items:scopedItems,
  cacheScope:"user-b"
});

assert.equal(scopeA.length, 1);
assert.equal(scopeB.length, 1);
assert.equal(Search.snapshot().diagnostics.cacheMisses, 3);

const fuzzyItems = [
  { id:"fuzzy-1", content:"I need a restaurant recommendation in Erbil" },
  { id:"fuzzy-2", content:"Weather forecast for Erbil" }
];

const fuzzyResults = await Search.search("resturant", {
  items:fuzzyItems,
  cacheScope:"fuzzy-test"
});

assert.equal(fuzzyResults[0]?.item?.id, "fuzzy-1");

assert.deepEqual(
  await Search.search(
    "x".repeat(SEARCH_LIMITS.MAX_QUERY_LENGTH + 1),
    { items }
  ),
  []
);

let providerAborted = false;

assert.deepEqual(
  await Search.search("timeout", {
    semanticProvider:(_, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => {
        providerAborted = true;
        reject(new DOMException("Search aborted", "AbortError"));
      });
    }),
    timeout:5
  }),
  []
);

assert.equal(providerAborted, true);
assert.equal(Search.snapshot().activeSearches, 0);
assert.equal(Search.snapshot().healthy, false);

const controller = new AbortController();

assert.deepEqual(
  await Search.search("cancelled", {
    semanticProvider:(_, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => {
        reject(new DOMException("Search aborted", "AbortError"));
      });
    }),
    signal:controller.signal,
    timeout:1000
  }),
  []
);

controller.abort();
assert.equal(Search.snapshot().activeSearches, 0);

assert.equal(Search.shutdown(), true);
assert.equal(Search.snapshot().health.initialized, false);
assert.equal(Search.snapshot().storage.cache, 0);

console.log("Search runtime checks passed.");
