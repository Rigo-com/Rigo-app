import assert from "node:assert/strict";
import { authRuntimeState } from "../js/auth/auth-state.js";
import Storage, { STORAGE_EVENTS, STORAGE_LIMITS } from "../js/storage/index.js";

const values = new Map();
globalThis.localStorage = {
  get length(){ return values.size; },
  key:index => [...values.keys()][index] ?? null,
  getItem:key => values.has(key) ? values.get(key) : null,
  setItem:(key, value) => values.set(key, String(value)),
  removeItem:key => values.delete(key),
  clear:() => values.clear()
};
authRuntimeState.user = { id:"storage-test-user" };

await Storage.reset();
let initializedEvents = 0;
Storage.on(STORAGE_EVENTS.INITIALIZED, () => initializedEvents++);
assert.equal(await Storage.initialize(), true);
assert.equal(await Storage.boot(), true);
assert.equal(initializedEvents, 1);
assert.equal(Storage.save("profile", { name:"RIGO" }), true);
assert.deepEqual(Storage.load("profile"), { name:"RIGO" });
assert.equal(Storage.snapshot().diagnostics.saves, 1);
assert.equal(Storage.snapshot().activeOperations, 0);

const oversized = "x".repeat(STORAGE_LIMITS.MAX_STORAGE_SIZE + 1);
assert.equal(Storage.save("too-large", oversized), false);
assert.equal(Storage.snapshot().healthy, false);

Storage.queueSave("queued", { ready:true });
assert.equal(Storage.flushQueue(), true);
assert.deepEqual(Storage.load("queued"), { ready:true });
assert.equal(Storage.snapshot().queue.empty, true);

await Storage.shutdown();
assert.equal(Storage.snapshot().initialized, false);
assert.equal(Storage.snapshot().listeners, 0);
console.log("Storage runtime checks passed.");
