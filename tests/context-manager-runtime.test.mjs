import assert from "node:assert/strict";

import ContextManager from "../js/ai/context/index.js";
import { contextManagerState }
from "../js/ai/context/context-state.js";
import { CONTEXT_MANAGER_CONFIG }
from "../js/ai/context/context-config.js";

await ContextManager.initialize();
assert.equal(ContextManager.health().healthy,true);

const first = await ContextManager.register({
  id:"first",
  namespace:"conversation:one",
  type:"session",
  priority:5,
  content:{message:"weather in erbil"}
});

assert.equal(first.id,"first");
assert.equal(
  await ContextManager.register({
    namespace:"conversation:one",
    type:"session",
    content:{message:"weather in erbil"}
  }),
  false
);

await ContextManager.register({
  id:"isolated",
  namespace:"conversation:two",
  content:{message:"weather in baghdad"}
});

const injected = await ContextManager.inject({
  id:"request-1",
  input:{message:"weather"},
  metadata:{namespace:"conversation:one"},
  runtime:{marker:true}
});

assert.equal(injected.runtime.marker,true);
assert.equal(injected.metadata.contextWindow.totalContexts,1);
assert.equal(injected.metadata.contextWindow.contexts[0].id,"first");

await ContextManager.buildWindow("weather",{namespace:"conversation:one"});
await ContextManager.buildWindow("weather",{namespace:"conversation:one"});
assert.ok(ContextManager.diagnostics().diagnostics.cacheHits >= 1);

await ContextManager.update("first",{
  content:{message:"updated forecast"}
});
const updated = await ContextManager.buildWindow("updated",{namespace:"conversation:one"});
assert.equal(updated.contexts[0].content.message,"updated forecast");

await ContextManager.reset();
const tokenBlock = (prefix,count) =>
  Array.from({length:count},(_,index) => `${prefix}${index}`).join(" ");

await ContextManager.register({id:"index-a",content:tokenBlock("alpha",3000)});
await ContextManager.register({id:"index-b",content:tokenBlock("beta",3000)});
assert.ok(contextManagerState.indexes.size <= CONTEXT_MANAGER_CONFIG.MAX_INDEX_SIZE);

await ContextManager.reset();
await ContextManager.register({
  id:"expired",
  content:"old",
  createdAt:1,
  updatedAt:1
});
assert.equal(await ContextManager.evictExpired(Date.now()),1);
assert.equal(ContextManager.snapshot().contexts,0);

const shuttingDown = ContextManager.shutdown();
assert.equal(await ContextManager.register({content:"blocked"}),false);
await shuttingDown;
assert.equal(ContextManager.health().healthy,false);

await ContextManager.initialize();
assert.equal(ContextManager.health().healthy,true);
assert.equal(ContextManager.snapshot().contexts,0);
await ContextManager.shutdown();

console.log("Context Manager runtime checks passed.");
