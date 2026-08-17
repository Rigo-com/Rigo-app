import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {PAGE_CONFIGS} from "../js/admin/studio/pages/system-pages.js";

assert.deepEqual(PAGE_CONFIGS.map(page=>page.id),["code","architecture","memory","git","settings"]);
assert.ok(PAGE_CONFIGS.every(page=>page.actions.length>0));

const workspace=await readFile(new URL("../js/admin/studio/workspace/index.js",import.meta.url),"utf8");
assert.match(workspace,/for\(const page of SystemPages\)/);

const dashboard=await readFile(new URL("../js/admin/studio/pages/dashboard/index.js",import.meta.url),"utf8");
assert.match(dashboard,/admin\.command\("scan project"\)/);
assert.equal(dashboard.includes("Project scan API is not available."),false);

const scanApi=await readFile(new URL("../api/admin-project-scan.js",import.meta.url),"utf8");
assert.match(scanApi,/response\.status===401/);
assert.match(scanApi,/catch\{return readRaw\(entry\.path\);\}/);

console.log("Admin Studio action wiring tests passed.");
