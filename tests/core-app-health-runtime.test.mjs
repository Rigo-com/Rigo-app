import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import HealthState from "../js/core/health/health-state.js";
import { HEALTH_CONFIG } from "../js/core/health/health-config.js";
import LifecycleState, { lifecycleState } from "../js/core/lifecycle/lifecycle-state.js";

HealthState.reset();
for (let index = 0; index < HEALTH_CONFIG.MAX_WARNINGS + 5; index++) HealthState.addWarning(`warning-${index}`);
for (let index = 0; index < HEALTH_CONFIG.MAX_ERRORS + 5; index++) HealthState.addError(`error-${index}`);
for (let index = 0; index < HEALTH_CONFIG.MAX_HISTORY + 5; index++) HealthState.addHistoryEntry({ index });

const health = HealthState.snapshot();
assert.equal(health.warnings.length, HEALTH_CONFIG.MAX_WARNINGS);
assert.equal(health.errors.length, HEALTH_CONFIG.MAX_ERRORS);
assert.equal(health.history.length, HEALTH_CONFIG.MAX_HISTORY);
assert.equal(health.warnings[0], "warning-5");
assert.equal(health.errors[0], "error-5");
assert.equal(health.history[0].index, 5);

LifecycleState.reset();
assert.equal(LifecycleState.isBusy(), false);
lifecycleState.startupPromise = Promise.resolve(true);
assert.equal(LifecycleState.isBusy(), true);
assert.equal(LifecycleState.snapshot().operations.starting, true);
LifecycleState.reset();

const applicationSource = await readFile(new URL("../js/core/app/application-runtime.js", import.meta.url), "utf8");
const recoverySource = await readFile(new URL("../js/core/app/app-recovery.js", import.meta.url), "utf8");
assert.match(applicationSource, /runtimeOperations\.shutdown/);
assert.doesNotMatch(applicationSource, /if\s*\(\s*!AppState\.state\.booted\s*\)\s*\{\s*return true/);
assert.match(recoverySource, /import RuntimeManager/);
assert.match(recoverySource, /import ModuleRuntime/);
assert.doesNotMatch(recoverySource, /typeof RuntimeManager/);

console.log("Core app, lifecycle, and health runtime checks passed.");
