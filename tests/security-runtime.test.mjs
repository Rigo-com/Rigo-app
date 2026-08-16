import assert from "node:assert/strict";
import Security, { SecurityMonitor, SECURITY_STATUS } from "../js/security/index.js";

await Security.reset();
assert.equal((await Security.initialize()), true);
assert.equal((await Security.boot()), true);
assert.equal((await Security.boot()), true);

let snapshot = Security.snapshot();
assert.equal(snapshot.state.initialized, true);
assert.equal(snapshot.state.booted, true);
assert.equal(snapshot.state.status, SECURITY_STATUS.ACTIVE);
assert.equal(snapshot.metrics.totalEvents, 1);

const details = { nested:{ allowed:true } };
const event = SecurityMonitor.record("security.test", details);
details.nested.allowed = false;
assert.equal(event.details.nested.allowed, true);
assert.equal(Object.isFrozen(event.details), true);
assert.equal(Object.isFrozen(event.details.nested), true);

await Security.shutdown();
snapshot = Security.snapshot();
assert.equal(snapshot.state.booted, false);
assert.equal(snapshot.state.initialized, false);
assert.equal(snapshot.state.status, SECURITY_STATUS.DISABLED);

await Security.reset();
assert.equal(Security.snapshot().metrics.totalEvents, 0);
console.log("Security runtime checks passed.");
