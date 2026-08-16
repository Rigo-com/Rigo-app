import assert from "node:assert/strict";
import { authRuntimeState } from "../js/auth/auth-state.js";
import Memory from "../js/memory/index.js";

const values = new Map();
globalThis.localStorage = {
  get length(){ return values.size; }, key:index => [...values.keys()][index] ?? null,
  getItem:key => values.has(key) ? values.get(key) : null,
  setItem:(key, value) => values.set(key, String(value)), removeItem:key => values.delete(key)
};
globalThis.window = { localStorage:globalThis.localStorage };
globalThis.fetch = async() => ({ ok:false, status:404, text:async() => JSON.stringify({ error:"NOT_FOUND" }) });
authRuntimeState.authenticated = true;
authRuntimeState.user = { id:"memory-test-user" };

await Memory.shutdown();
const initialized = await Promise.all([Memory.initialize(), Memory.initialize(), Memory.initialize()]);
assert.deepEqual(initialized, [true, true, true]);
assert.equal(Memory.snapshot().memory.initialized, true);
assert.equal(Memory.snapshot().scheduler.cleanup, true);

const created = Memory.create("RIGO memory runtime test", { tags:["runtime"] });
assert.ok(created?.id);
assert.equal(Memory.search("runtime").length, 1);
assert.equal(Memory.snapshot().memory.memories, 1);

await Memory.shutdown();
assert.equal(Memory.snapshot().memory.initialized, false);
assert.equal(Memory.snapshot().scheduler.cleanup, false);
assert.equal(Memory.snapshot().scheduler.summary, false);
console.log("Memory runtime checks passed.");
