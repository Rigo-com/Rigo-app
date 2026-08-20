import assert from "node:assert/strict";

import ServiceManager from "../js/services/service-manager.js";
import AI from "../js/ai/index.js";

await ServiceManager.register("memory",async () => ({
  search:async () => [],
  create:async () => true,
  clearContext:async () => true,
  addContext:async () => true,
  getContext:() => []
}));

await ServiceManager.register("events",async () => ({
  emit:async () => true
}));

assert.deepEqual(
  await Promise.all([
    AI.initialize(),
    AI.initialize(),
    AI.initialize()
  ]),
  [true,true,true]
);

let state = AI.snapshot();
assert.equal(state.lifecycle.initialized,true);
assert.equal(state.kernel.state,"ready");
assert.ok(AI.ToolExecutor.get("weather"));
assert.ok(AI.AgentManager.get("rigo-main-assistant"));
assert.equal(ServiceManager.has("contexts"),true);
assert.equal(ServiceManager.has("tools"),true);
assert.equal(ServiceManager.has("agents"),true);
assert.equal(ServiceManager.has("planner"),true);
assert.equal(ServiceManager.has("workflows"),true);
assert.equal(ServiceManager.has("ai"),true);
assert.equal(await ServiceManager.resolve("ai"),AI);
assert.equal(AI.id,"ai");
assert.equal(AI.priority,10);
assert.equal(AI.boot,AI.initialize);

await AI.shutdown();
state = AI.snapshot();
assert.equal(state.lifecycle.initialized,false);
assert.equal(state.kernel.state,"shutdown");

await AI.initialize();
state = AI.snapshot();
assert.equal(state.lifecycle.initialized,true);
assert.equal(state.kernel.state,"ready");
assert.ok(AI.ToolExecutor.get("weather"));
assert.ok(AI.AgentManager.get("rigo-main-assistant"));

await AI.reset();
state = AI.snapshot();
assert.equal(state.lifecycle.initialized,false);
assert.equal(state.kernel.state,"idle");
assert.equal(state.agents.totalAgents,0);
assert.equal(state.context.contexts,0);
assert.equal(state.tools.tools,0);

console.log("AI Layer runtime checks passed.");
