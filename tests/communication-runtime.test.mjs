import assert from "node:assert/strict";
import Communication, { COMMUNICATION_LIMITS } from "../js/communication/index.js";

Communication.reset();
assert.equal(Communication.initialize(), true);
for(let index = 0; index < COMMUNICATION_LIMITS.MAX_ACTIVE_REQUESTS; index++){
  assert.equal(Communication.core.startRequest(`request-${index}`, { index }), true);
}
assert.equal(Communication.core.startRequest("overflow", {}), false);
assert.equal(Communication.snapshot().processing, true);
assert.equal(Communication.snapshot().activeRequests, COMMUNICATION_LIMITS.MAX_ACTIVE_REQUESTS);

const controller = Communication.abort.createAbortController("request-0");
assert.ok(controller);
assert.equal(Communication.abort.abortRequest("request-0"), true);
assert.equal(controller.signal.aborted, true);
assert.equal(Communication.snapshot().activeRequests, COMMUNICATION_LIMITS.MAX_ACTIVE_REQUESTS - 1);

const encoder = new TextEncoder();
const response = { body:new ReadableStream({ start(stream){ stream.enqueue(encoder.encode("RIGO ")); stream.enqueue(encoder.encode("stream")); stream.close(); } }) };
const chunks = [];
assert.equal(await Communication.stream.processStream(response, { onChunk:chunk => chunks.push(chunk) }), true);
assert.equal(chunks.join(""), "RIGO stream");
assert.equal(Communication.snapshot().activeStreams, 0);
assert.equal(Communication.snapshot().streaming, false);
assert.equal(Communication.snapshot().diagnostics.streams, 1);

assert.equal(Communication.shutdown(), true);
assert.equal(Communication.snapshot().initialized, false);
assert.equal(Communication.snapshot().activeRequests, 0);
assert.equal(Communication.snapshot().abortControllers, 0);
console.log("Communication runtime checks passed.");
