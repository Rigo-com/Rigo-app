import assert from "node:assert/strict";
import API, { apiState, API_CONFIG } from "../js/api/index.js";
import { APITimeoutError, APIAbortError, APIRequestError } from "../js/api/api-errors.js";
import { File } from "node:buffer";

const jsonResponse = (body, status = 200) => new Response(JSON.stringify(body), { status, headers:{ "content-type":"application/json" } });

await API.reset();
assert.equal(await API.initialize(), true);
assert.equal(API.id, "api");
assert.equal(API.runtime.health().healthy, true);

const events = [];
const stopStarted = API.events.on(API.events.types.REQUEST_STARTED, event => events.push(event));
const stopSuccess = API.events.on(API.events.types.REQUEST_SUCCESS, event => events.push(event));

let attempts = 0;
globalThis.fetch = async () => {
  attempts += 1;
  return attempts === 1 ? jsonResponse({ retry:true }, 503) : jsonResponse({ ok:true });
};
assert.deepEqual(await API.runtime.get("/retry", { retries:2, retryDelay:0 }), { ok:true });
assert.equal(attempts, 2);
assert.equal(apiState.diagnostics.retries, 1);
assert.equal(events.filter(event => event.event === API.events.types.REQUEST_STARTED).length, 1);
assert.equal(events.filter(event => event.event === API.events.types.REQUEST_SUCCESS).length, 1);
stopStarted();
stopSuccess();

const uploadEvents = [];
const stopUploadStarted = API.events.on(API.events.types.UPLOAD_STARTED, event => uploadEvents.push(event));
const stopUploadCompleted = API.events.on(API.events.types.UPLOAD_COMPLETED, event => uploadEvents.push(event));
let uploadedBody = null;
globalThis.fetch = async (_url, options) => {
  uploadedBody = options.body;
  assert.equal(options.method, "POST");
  assert.equal(options.headers["content-type"], undefined);
  return jsonResponse({ uploaded:true });
};
const originalFile = globalThis.File;
globalThis.File = File;
const uploadResult = await API.runtime.upload(new File(["hello"], "hello.txt", { type:"text/plain" }), { endpoint:"/upload-test", metadata:{ scope:"test" } });
assert.deepEqual(uploadResult, { uploaded:true });
assert.equal(uploadedBody instanceof FormData, true);
assert.equal(uploadedBody.get("file").name, "hello.txt");
assert.equal(uploadedBody.get("metadata"), '{"scope":"test"}');
assert.equal(apiState.uploads.size, 0);
assert.equal(apiState.diagnostics.uploads, 1);
assert.deepEqual(uploadEvents.map(event => event.event), [API.events.types.UPLOAD_STARTED, API.events.types.UPLOAD_COMPLETED]);
await API.runtime.upload(new File(["x"], "x.txt"));
assert.equal(apiState.diagnostics.uploads, 2);
globalThis.File = originalFile;
stopUploadStarted();
stopUploadCompleted();

apiState.pendingRequests = API_CONFIG.MAX_CONCURRENT_REQUESTS;
await assert.rejects(() => API.runtime.get("/busy"), error => error instanceof APIRequestError && error.code === "CONCURRENCY_LIMIT");
apiState.pendingRequests = 0;

globalThis.fetch = (_url, { signal }) => new Promise((_, reject) => signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once:true }));
await assert.rejects(() => API.runtime.get("/timeout", { timeout:5, retries:1 }), APITimeoutError);
assert.equal(API.runtime.health().healthy, false);
assert.equal(API.runtime.health().reason, "last-request-failed");

const external = new AbortController();
const aborted = API.runtime.get("/abort", { signal:external.signal, retries:1 });
external.abort();
await assert.rejects(() => aborted, APIAbortError);
assert.equal(apiState.pendingRequests, 0);
assert.equal(apiState.activeRequests.size, 0);
assert.equal(apiState.abortControllers.size, 0);

await API.shutdown();
console.log("API runtime tests passed");
