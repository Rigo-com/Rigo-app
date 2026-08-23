import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import Debug from "../js/debug/index.js";
import DebugAgent,{analyzeDebugSnapshot} from "../js/admin/admin-agent/subagents/debug-agent/debug-agent.js";

const setupSource=await readFile(new URL("../js/core/modules/module-setup.js",import.meta.url),"utf8");
const bootstrapSource=await readFile(new URL("../js/bootstrap/bootstrap-setup.js",import.meta.url),"utf8");
const adminSource=await readFile(new URL("../js/admin/index.js",import.meta.url),"utf8");
const panelSource=await readFile(new URL("../js/admin/admin-debug-panel.js",import.meta.url),"utf8");
const debugPage=await readFile(new URL("../debug.html",import.meta.url),"utf8");

for(const field of ["id","priority","initialize","boot","shutdown","reset","snapshot"]){
  assert.equal(typeof Debug[field],field==="id"?"string":field==="priority"?"number":"function",`Debug contract missing ${field}`);
}

assert.equal(Debug.priority,-100);
assert.doesNotMatch(setupSource,/registerModule\(\s*"debug"/);
assert.match(bootstrapSource,/import Debug from "\.\.\/debug\/index\.js"/);
assert.match(bootstrapSource,/registerDebugSystem/);
assert.match(bootstrapSource,/priority:-100/);
assert.match(bootstrapSource,/await Debug\.attach/);
assert.match(bootstrapSource,/await Debug\.audit/);
assert.match(adminSource,/SERVER_ADMIN_ACCESS_REQUIRED/);
assert.match(adminSource,/\/api\/admin-session/);
assert.match(adminSource,/async function debug/);
assert.match(panelSource,/Deep Audit/);
assert.match(panelSource,/Admin\.debug/);
assert.match(debugPage,/visibility:hidden/);
assert.match(debugPage,/\/api\/admin-session/);

Debug.initialize();
const initial=Debug.snapshot();
assert.equal(initial.system.initialized,true);
assert.equal(typeof initial.diagnostics.healthScore,"number");
assert.equal(typeof Debug.attach,"function");
assert.equal(typeof Debug.audit,"function");
assert.equal(typeof Debug.wiring,"function");

const syntaxPass=Debug.scanner.syntax.scan("return 1;");
assert.equal(syntaxPass.status,"PASS");
const circularPass=Debug.scanner.circular.scan({a:["b"],b:[]});
assert.equal(circularPass.status,"PASS");

const analyzed=analyzeDebugSnapshot({
  diagnostics:{healthScore:90,errors:1,warnings:2,critical:0},
  runtime:{runtimeErrors:1,promiseRejections:0,crashes:0},
  syntax:{failed:0},
  circular:{circularFound:0},
  dependency:{failed:0},
  audit:{missingModules:[],suspiciousModules:[],moduleStates:{shared:"active"}},
  services:{services:3,diagnostics:{healthy:3,warning:0,critical:0,offline:0}},
  events:{totalEvents:10,health:100}
});
assert.equal(analyzed.healthScore,90);
assert.equal(analyzed.telemetry.services,3);
assert.deepEqual(analyzed.wiring.missingModules,[]);

assert.equal(DebugAgent.id,"debug-agent");
assert.equal(typeof DebugAgent.capture,"function");
assert.equal(typeof DebugAgent.scan,"function");
assert.equal(typeof DebugAgent.report,"function");
assert.equal(typeof DebugAgent.errors,"function");

console.log("Unified early admin debug runtime checks passed.");
