import assert from "node:assert/strict";
import Search, { SEARCH_LIMITS } from "../js/search/index.js";

Search.reset();
assert.equal(Search.initialize(), true);
assert.equal(Search.boot(), true);

const items = Array.from({ length:150 }, (_, index) => ({ id:`item-${index}`, content:`RIGO result ${index}` }));
let results = await Search.search("RIGO", { items, limit:500 });
assert.equal(results.length, SEARCH_LIMITS.MAX_RESULTS);
assert.equal(Search.snapshot().diagnostics.cacheMisses, 1);

results[0].item.content = "mutated";
const cached = await Search.search("RIGO", { items, limit:500 });
assert.notEqual(cached[0].item.content, "mutated");
assert.equal(Search.snapshot().diagnostics.cacheHits, 1);

assert.deepEqual(await Search.search("x".repeat(SEARCH_LIMITS.MAX_QUERY_LENGTH + 1), { items }), []);
assert.deepEqual(await Search.search("timeout", { semanticProvider:() => new Promise(() => {}), timeout:5 }), []);
assert.equal(Search.snapshot().activeSearches, 0);
assert.equal(Search.snapshot().healthy, false);

assert.equal(Search.shutdown(), true);
assert.equal(Search.snapshot().health.initialized, false);
assert.equal(Search.snapshot().storage.cache, 0);
console.log("Search runtime checks passed.");
