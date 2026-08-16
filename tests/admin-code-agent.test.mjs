import assert from "node:assert/strict";
import { analyzeFileContent } from "../js/admin/admin-agent/subagents/code-agent/code-agent.js";
import CodeIndex from "../js/admin/admin-agent/subagents/code-agent/code-index.js";

const project={ready:true,files:[{path:"js/a.js",size:100},{path:"js/b.js",size:0}],imports:[{file:"js/a.js",specifier:"./b.js",resolved:"js/b.js"}],exports:[{file:"js/a.js",name:"run"}],relationships:[{from:"js/a.js",to:"js/b.js",type:"import"}]};
CodeIndex.setProject(project);
let snapshot=CodeIndex.snapshot();
assert.equal(snapshot.files.length,2);
assert.equal(snapshot.analyses[0].dependencies[0],"js/b.js");
assert.equal(snapshot.analyses[1].issues[0].code,"EMPTY_FILE");
const analysis=analyzeFileContent("js/a.js",'import x from "./b.js";\nexport function run(){}\n// TODO test',project);
assert.equal(analysis.lines,3);
assert.deepEqual(analysis.imports,["./b.js"]);
assert.deepEqual(analysis.exports,["run"]);
assert.equal(analysis.issues[0].code,"DEVELOPMENT_MARKER");
CodeIndex.setFileAnalysis(analysis);
assert.equal(CodeIndex.search("TODO").length,1);
console.log("Admin Code Agent tests passed");
