import assert from "node:assert/strict";

import { bootstrapState }
from "../js/bootstrap/bootstrap-state.js";
import { registerBootstrapSystem }
from "../js/bootstrap/bootstrap-registry.js";
import {
  bootBootstrapSystems,
  shutdownBootstrapSystems,
  recoverBootstrapSystems,
  resetBootstrapSystems
}
from "../js/bootstrap/bootstrap-lifecycle.js";

await resetBootstrapSystems();
bootstrapState.registeredSystems.clear();

const order = [];
for(const [id,priority] of [["core",0],["ai",10],["ui",20]]){
  registerBootstrapSystem({
    id,
    priority,
    initialize:async () => {
      order.push(`initialize-${id}`);
      return true;
    },
    boot:async () => {
      order.push(`boot-${id}`);
      return true;
    },
    shutdown:async () => {
      order.push(`shutdown-${id}`);
      return true;
    }
  });
}

assert.deepEqual(
  await Promise.all([
    bootBootstrapSystems(),
    bootBootstrapSystems(),
    bootBootstrapSystems()
  ]),
  [true,true,true]
);
assert.equal(bootstrapState.initialized,true);
assert.deepEqual([...bootstrapState.initializedSystems],["core","ai","ui"]);

await shutdownBootstrapSystems();
assert.deepEqual(
  order.slice(-3),
  ["shutdown-ui","shutdown-ai","shutdown-core"]
);
assert.equal(bootstrapState.initializedSystems.size,0);

await resetBootstrapSystems();
bootstrapState.registeredSystems.clear();
order.length = 0;

registerBootstrapSystem({
  id:"stable",
  priority:0,
  initialize:async () => {
    order.push("initialize-stable");
    return true;
  },
  shutdown:async () => {
    order.push("shutdown-stable");
    return true;
  }
});

let fail = true;
registerBootstrapSystem({
  id:"recoverable",
  priority:10,
  initialize:async () => {
    order.push("initialize-recoverable");
    if(fail){
      throw new Error("EXPECTED BOOT FAILURE");
    }
    return true;
  },
  shutdown:async () => {
    order.push("shutdown-recoverable");
    return true;
  }
});

assert.equal(await bootBootstrapSystems(),false);
assert.equal(bootstrapState.state,"failed");
assert.equal(bootstrapState.initializedSystems.size,0);
assert.ok(order.includes("shutdown-stable"));

fail = false;
assert.equal(await recoverBootstrapSystems(),true);
assert.equal(bootstrapState.state,"ready");
assert.equal(bootstrapState.recoveryAttempts,0);

await resetBootstrapSystems();
assert.equal(bootstrapState.state,"idle");
assert.ok(
  Object.values(bootstrapState.diagnostics)
  .every(value => value === 0)
);

console.log("Bootstrap runtime checks passed.");
