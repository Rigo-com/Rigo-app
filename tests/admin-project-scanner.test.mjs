import assert from "node:assert/strict";
import { analyzeProject } from "../api/admin-project-scan.js";

const files=[
  {path:"js/admin/index.js",name:"index.js",size:50},
  {path:"js/admin/runtime.js",name:"runtime.js",size:50},
  {path:"js/core/index.js",name:"index.js",size:50}
];
const result=analyzeProject(files,{
  "js/admin/index.js":'import Runtime from "./runtime.js"; export { Runtime };',
  "js/admin/runtime.js":'export default function boot(){}',
  "js/core/index.js":'export const Core = {};'
});
assert.equal(result.diagnostics.files,3);
assert.equal(result.diagnostics.analyzedFiles,3);
assert.equal(result.imports[0].resolved,"js/admin/runtime.js");
assert.ok(result.exports.some(item=>item.name==="Core"));
assert.ok(result.systems.some(item=>item.id==="admin"));
assert.ok(result.relationships.some(item=>item.to==="js/admin/runtime.js"));

globalThis.window={Admin:{runtime:{registry:{get(id){assert.equal(id,"admin-agent");return{snapshot(){return{providers:{github:{lastScanAt:Date.now(),lastError:null}},privateSubagents:{project:{index:{ready:true,files,folders:[],systems:result.systems,agents:[{}],imports:result.imports,exports:result.exports,relationships:result.relationships}}}};}};}}}}};
const dashboard=await import("../js/admin/studio/pages/dashboard/dashboard-loader.js");
assert.equal(dashboard.getProjectIndex().files.length,3);
const data=await dashboard.loadDashboardData();
assert.equal(data.files,3);
assert.equal(data.github.connected,true);
assert.equal(data.projectReady,true);
console.log("Admin project scanner and dashboard tests passed");
