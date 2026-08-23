import assert from "node:assert/strict";
import Communication, { COMMUNICATION_LIMITS } from "../js/communication/index.js";

Communication.reset();
assert.equal(Communication.initialize(),true);
assert.equal(Communication.health.status().initialized,true);
assert.equal(Communication.health.isHealthy(),true);

let started = 0;
let completed = 0;
const onStarted = () => { started++; };
const onCompleted = () => { completed++; };
assert.equal(Communication.events.on(Communication.config.events.REQUEST_STARTED,onStarted),true);
assert.equal(Communication.events.on(Communication.config.events.REQUEST_COMPLETED,onCompleted),true);

const requestId = Communication.helpers.createCommunicationId("request");
assert.equal(Communication.helpers.isValidRequestId(requestId),true);
assert.equal(Communication.helpers.isValidPayload({ ok:true }),true);
assert.equal(Communication.core.startRequest(requestId,{ method:"GET" }),true);
assert.equal(Communication.core.startRequest(requestId,{ method:"GET" }),false);
assert.equal(Communication.core.completeRequest(requestId),true);
assert.equal(started,1);
assert.equal(completed,1);

for(let index = 0; index < COMMUNICATION_LIMITS.MAX_ACTIVE_REQUESTS; index++){
  assert.equal(Communication.core.startRequest(`limit-${index}`,{ index }),true);
}
assert.equal(Communication.core.startRequest("overflow",{}),false);
assert.equal(Communication.snapshot().activeRequests,COMMUNICATION_LIMITS.MAX_ACTIVE_REQUESTS);

const controller = Communication.abort.createAbortController("limit-0");
assert.ok(controller);
assert.equal(Communication.abort.abortRequest("limit-0"),true);
assert.equal(controller.signal.aborted,true);
assert.equal(Communication.snapshot().activeRequests,COMMUNICATION_LIMITS.MAX_ACTIVE_REQUESTS - 1);

const hash = Communication.helpers.createMessageHash(" Hello RIGO ");
assert.equal(hash,"hello rigo");
assert.equal(Communication.storage.registerHash(hash),true);
assert.equal(Communication.storage.hasHash(hash),true);
assert.equal(Communication.storage.setCache("cache-key",{ ok:true }),true);
assert.deepEqual(Communication.storage.getCache("cache-key"),{ ok:true });
assert.equal(Communication.storage.getCache("missing"),null);
assert.ok(Communication.state.diagnostics().cacheHits >= 1);
assert.ok(Communication.state.diagnostics().cacheMisses >= 1);

const encoder = new TextEncoder();
const response = {
  body:new ReadableStream({
    start(stream){
      stream.enqueue(encoder.encode("RIGO "));
      stream.enqueue(encoder.encode("stream"));
      stream.close();
    }
  })
};
const chunks = [];
assert.equal(await Communication.stream.processStream(response,{
  requestId:"stream-test",
  timeout:1000,
  onChunk:chunk => chunks.push(chunk)
}),true);
assert.equal(chunks.join(""),"RIGO stream");
assert.equal(Communication.stream.active(),0);
assert.equal(Communication.snapshot().streaming,false);
assert.equal(Communication.snapshot().diagnostics.streams,1);

const report = Communication.health.report();
assert.ok(report.health);
assert.ok(report.diagnostics);
assert.ok(report.snapshot);

Communication.events.off(Communication.config.events.REQUEST_STARTED,onStarted);
Communication.events.off(Communication.config.events.REQUEST_COMPLETED,onCompleted);
assert.equal(Communication.shutdown(),true);
assert.equal(Communication.snapshot().initialized,false);
assert.equal(Communication.snapshot().activeRequests,0);
assert.equal(Communication.snapshot().abortControllers,0);
assert.equal(Communication.storage.getStorageStats().cache,0);

console.log("Communication runtime checks passed.");
