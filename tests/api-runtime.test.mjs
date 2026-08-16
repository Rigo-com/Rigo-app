import assert from "node:assert/strict";
import API, { apiState, API_CONFIG } from "../js/api/index.js";
import { APITimeoutError, APIAbortError, APIRequestError } from "../js/api/api-errors.js";

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), { status, headers:{ "content-type":"application/json" } });

await API.reset();
assert.equal(await API.initialize(), true);
assert.equal(API.id, "api");

let attempts = 0;
globalThis.fetch = async () => {
  attempts += 1;
  return attempts === 1 ? jsonResponse({ retry:true }, 503) : jsonResponse({ ok:true });
};
assert.deepEqual(await API.runtime.get("/retry", { retries:2, retryDelay:0 }), { ok:true });
assert.equal(attempts, 2);
assert.equal(apiState.diagnostics.retries, 1);

apiState.pendingRequests = API_CONFIG.MAX_CONCURRENT_REQUESTS;
await assert.rejects(() => API.runtime.get("/busy"), error => error instanceof APIRequestError && error.code === "CONCURRENCY_LIMIT");
apiState.pendingRequests = 0;

globalThis.fetch = (_url, { signal }) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once:true }));
await assert.rejects(() => API.runtime.get("/timeout", { timeout:5, retries:1 }), APITimeoutError);

const external = new AbortController();
const aborted = API.runtime.get("/abort", { signal:external.signal, retries:1 });
external.abort();
await assert.rejects(() => aborted, APIAbortError);
assert.equal(apiState.pendingRequests, 0);
assert.equal(apiState.activeRequests.size, 0);
assert.equal(apiState.abortControllers.size, 0);

await API.shutdown();
console.log("API runtime tests passed");

