import assert from "node:assert/strict";

import ServiceManager from "../js/services/service-manager.js";
import AIKernel from "../js/ai/ai-kernel/index.js";
import { performKernelHealthCheck }
from "../js/ai/ai-kernel/kernel-health.js";
import { recoverAIKernel }
from "../js/ai/ai-kernel/kernel-recovery.js";

const blockers = [];
let blocking = false;

const agents = {
  initialize:async () => true,
  process:({input,signal}) => {
    if(!blocking){
      return input.value;
    }

    return new Promise((resolve,reject) => {
      const entry = {resolve,reject,value:input.value};
      blockers.push(entry);
      signal?.addEventListener(
        "abort",
        () => reject(new Error("ABORTED BY KERNEL")),
        {once:true}
      );
    });
  }
};

const services = {
  planner:{initialize:async () => true,process:async request => request},
  workflows:{initialize:async () => true,process:async request => request},
  tools:{initialize:async () => true,execute:async () => true},
  agents,
  contexts:{initialize:async () => true,inject:async request => request},
  memory:{search:async () => [],create:async () => true},
  events:{emit:async () => true}
};

for(const [name,service] of Object.entries(services)){
  await ServiceManager.register(name,async () => service);
}

await AIKernel.initialize();
assert.equal((await performKernelHealthCheck()).healthy,true);

blocking = true;
const active = Array.from({length:200},(_,index) => {
  return AIKernel.process({type:"agent",input:{value:index}});
});

await new Promise(resolve => setTimeout(resolve,10));
const queued = AIKernel.process({type:"agent",input:{value:"queued"}});
await new Promise(resolve => setTimeout(resolve,10));
assert.equal(AIKernel.state().queuedRequests,1);

for(const entry of blockers.splice(0,200)){
  entry.resolve(entry.value);
}

assert.deepEqual(await Promise.all(active),Array.from({length:200},(_,index) => index));
await new Promise(resolve => setTimeout(resolve,10));
assert.equal(blockers.length,1);
blockers.shift().resolve("queued");
assert.equal(await queued,"queued");
assert.equal(AIKernel.state().queuedRequests,0);

assert.equal(await recoverAIKernel(),true);
assert.equal(await recoverAIKernel(),false);

const pending = AIKernel.process({type:"agent",input:{value:"shutdown"}});
await new Promise(resolve => setTimeout(resolve,10));
await AIKernel.shutdown();
await assert.rejects(() => pending,/ABORTED BY KERNEL/);
assert.equal((await performKernelHealthCheck()).healthy,false);
assert.equal(AIKernel.state().executions,0);

blocking = false;
await AIKernel.initialize();
assert.equal(await AIKernel.process({type:"agent",input:{value:"restarted"}}),"restarted");
assert.equal((await performKernelHealthCheck()).healthy,true);

const beforeDestroy = AIKernel.diagnostics().diagnostics;
assert.equal(beforeDestroy.queued,1);
assert.ok(beforeDestroy.aborted >= 1);

await AIKernel.destroy();
assert.ok(Object.values(AIKernel.diagnostics().diagnostics).every(value => value === 0));
console.log("AI Kernel runtime checks passed.");
