import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const page=await readFile(new URL("../js/admin/studio/pages/system-center-page.js",import.meta.url),"utf8");
assert.match(page,/id:"code",title:"System Center"/);
assert.match(page,/Detected Systems/);
assert.match(page,/Code Analysis/);
assert.match(page,/Test Workflows/);
assert.match(page,/Test workflow started successfully/);
assert.match(page,/scrollIntoView/);
assert.equal(page.includes("JSON.stringify(state.result"),false);
const workspace=await readFile(new URL("../js/admin/studio/workspace/index.js",import.meta.url),"utf8");
assert.match(workspace,/WorkspaceManager\.register\(SystemCenterPage\)/);
console.log("Admin System Center page tests passed.");
