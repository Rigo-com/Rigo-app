import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const projectAgent = await readFile(
  new URL("../js/admin/admin-agent/subagents/project-agent/project-agent.js",import.meta.url),
  "utf8"
);
const bootBody = projectAgent.match(/async function boot\(\)\{([\s\S]*?)\/\/ =====================================\n\/\/ SCAN/)?.[1] || "";
assert.equal(bootBody.includes("await scan()"),false,"Project scans must be user initiated");

const bootstrap = await readFile(new URL("../js/bootstrap/bootstrap-setup.js",import.meta.url),"utf8");
assert.equal(bootstrap.includes('from "../admin/index.js"'),false,"Admin must not be a static startup dependency");
assert.match(bootstrap,/import\("\.\.\/admin\/index\.js"\)/);

const main = await readFile(new URL("../js/main.js",import.meta.url),"utf8");
assert.equal(main.includes("await AccountSync.sync()"),false);
assert.equal(main.includes("await applyAdminUIAccess()"),false);

console.log("Startup performance checks passed.");
