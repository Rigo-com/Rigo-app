import assert from "node:assert/strict";

import ServiceManager from "../js/services/service-manager.js";
import AgentManager from "../js/ai/agent/index.js";

const memories = [];
const events = [];

await ServiceManager.register("memory",async () => ({
  create:async entry => {
    memories.push(entry);
    return entry;
  }
}));

await ServiceManager.register("events",async () => ({
  emit:async (name,payload) => {
    events.push({name,payload});
    return true;
  }
}));

assert.equal(await AgentManager.register({id:"before-init"}),false);
await AgentManager.initialize();

const order = [];
await AgentManager.register({
  id:"runtime-agent",
  execute:async ({sequence,signal}) => {
    order.push(`start-${sequence}`);
    await new Promise((resolve,reject) => {
      const timer = setTimeout(resolve,15);
      signal?.addEventListener("abort",() => {
        clearTimeout(timer);
        reject(new Error("AGENT ABORTED"));
      },{once:true});
    });
    order.push(`end-${sequence}`);
    return sequence;
  }
});

const first = AgentManager.execute("runtime-agent",{sequence:1});
const second = AgentManager.execute("runtime-agent",{sequence:2});
assert.deepEqual(await Promise.all([first,second]),[1,2]);
assert.deepEqual(order,["start-1","end-1","start-2","end-2"]);
assert.equal(memories.length,2);
assert.equal(memories[0].content.outcome.success,true);
assert.equal(AgentManager.snapshot().executions,0);

const active = AgentManager.execute("runtime-agent",{sequence:3});
await new Promise(resolve => setTimeout(resolve,5));
await AgentManager.shutdown();
await assert.rejects(() => active,/AGENT ABORTED|AGENT TERMINATED/);
assert.equal(AgentManager.snapshot().executions,0);
assert.equal(AgentManager.snapshot().totalAgents,0);
await assert.rejects(
  () => AgentManager.process({}),
  /NOT INITIALIZED|SHUTDOWN/
);

await AgentManager.initialize();
assert.equal(await AgentManager.register({id:"restarted"})?.then(Boolean),true);
assert.equal(AgentManager.diagnostics().diagnostics.initialized,1);
assert.ok(events.length > 0);

await AgentManager.reset();
assert.ok(
  Object.values(AgentManager.diagnostics().diagnostics)
  .every(value => value === 0)
);
await AgentManager.shutdown();

console.log("Agent Manager runtime checks passed.");
