import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const page=await readFile(new URL("../js/admin/studio/pages/project-page.js",import.meta.url),"utf8");
assert.match(page,/id:"project",title:"Project"/);
assert.match(page,/Project Files/);
assert.match(page,/Project Folders/);
assert.match(page,/Search \$\{state\.view\}/);
assert.match(page,/Project scan completed/);
assert.equal(page.includes("JSON.stringify(state.result"),false);
const workspace=await readFile(new URL("../js/admin/studio/workspace/index.js",import.meta.url),"utf8");
assert.match(workspace,/WorkspaceManager\.register\(ProjectPage\)/);
console.log("Admin Project page tests passed.");
