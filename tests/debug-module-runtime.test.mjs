import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const debugSource = await readFile(new URL("../js/debug/index.js", import.meta.url), "utf8");
const setupSource = await readFile(new URL("../js/core/modules/module-setup.js", import.meta.url), "utf8");

for(const field of ["id", "priority", "initialize", "boot", "shutdown", "reset", "snapshot"]){
  assert.match(debugSource, new RegExp(`${field}:`), `Debug contract is missing ${field}`);
}

assert.match(debugSource, /if\s*\(debugState\.running\)\s*return true/);
assert.match(debugSource, /if\s*\(!debugState\.running\)\s*return true/);
assert.match(setupSource, /import Debug[\s\S]*from "\.\.\/\.\.\/debug\/index\.js"/);
assert.match(setupSource, /registerModule\(\s*"debug",\s*Debug/);
assert.match(setupSource, /dependencies:\s*\[\s*"security"\s*\]/);

console.log("Debug module runtime wiring checks passed.");
