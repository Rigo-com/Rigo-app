import assert from "node:assert/strict";
import {analyzeArchitecture} from "../js/admin/admin-agent/subagents/architecture-agent/architecture-agent.js";
const project={ready:true,files:[{path:"js/core/index.js"},{path:"js/ui/index.js"},{path:"js/bootstrap/index.js"},{path:"js/admin/index.js"},{path:"js/ai/index.js"},{path:"js/memory/index.js"},{path:"js/communication/index.js"}],exports:[{file:"js/core/index.js",name:"Core"}],relationships:[{from:"js/core/index.js",to:"js/ui/index.js",type:"import"},{from:"js/ui/index.js",to:"js/core/index.js",type:"import"}]};
const report=analyzeArchitecture(project);assert.equal(report.ok,false);assert.equal(report.violations.length,1);assert.equal(report.violations[0].code,"FORWARD_LAYER_DEPENDENCY");assert.equal(report.violations[0].from,"js/core/index.js");assert.ok(report.score<100);
const clean=analyzeArchitecture({...project,relationships:[{from:"js/ui/index.js",to:"js/core/index.js",type:"import"}]});assert.equal(clean.violations.length,0);
console.log("Admin Architecture Agent tests passed");
