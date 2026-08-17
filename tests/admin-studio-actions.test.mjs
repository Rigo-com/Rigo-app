import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const workspace=await readFile(new URL("../js/admin/studio/workspace/index.js",import.meta.url),"utf8");
for(const page of ["CodeMapPage","MemoryPage","ExtensionsPage","SettingsPage"]){assert.match(workspace,new RegExp(`WorkspaceManager\\.register\\(${page}\\)`));}
const pages={
  code:await readFile(new URL("../js/admin/studio/pages/code-map-page.js",import.meta.url),"utf8"),
  memory:await readFile(new URL("../js/admin/studio/pages/memory-page.js",import.meta.url),"utf8"),
  extensions:await readFile(new URL("../js/admin/studio/pages/extensions-page.js",import.meta.url),"utf8"),
  settings:await readFile(new URL("../js/admin/studio/pages/settings-page.js",import.meta.url),"utf8")
};
assert.match(pages.code,/Analyze Architecture/);assert.match(pages.code,/Architecture Findings/);
assert.match(pages.memory,/Run Maintenance/);assert.match(pages.memory,/Memory\.maintenance\(\)/);
assert.match(pages.extensions,/Git Diff/);assert.match(pages.extensions,/Test Failures/);assert.match(pages.extensions,/executeAdminCommand\(command\)/);
assert.match(pages.settings,/\/api\/admin-session/);assert.match(pages.settings,/Auth\.logout\(\)/);
assert.equal(Object.values(pages).some(page=>page.includes("JSON.stringify(state.result")),false);

const dashboard=await readFile(new URL("../js/admin/studio/pages/dashboard/index.js",import.meta.url),"utf8");
assert.match(dashboard,/admin\.command\("scan project"\)/);
assert.equal(dashboard.includes("Project scan API is not available."),false);

const scanApi=await readFile(new URL("../api/admin-project-scan.js",import.meta.url),"utf8");
assert.match(scanApi,/response\.status===401/);
assert.match(scanApi,/catch\{return readRaw\(entry\.path\);\}/);

console.log("Admin Studio action wiring tests passed.");
