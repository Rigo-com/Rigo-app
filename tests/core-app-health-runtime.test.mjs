import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import Config from "../js/core/config/index.js";
import Container from "../js/core/container/index.js";
import Events from "../js/core/events/index.js";
import State from "../js/core/state/index.js";
import CanonicalAppState from "../js/core/app/app-state.js";
import HealthState from "../js/core/health/health-state.js";
import { HEALTH_CONFIG } from "../js/core/health/health-config.js";
import LifecycleState, { lifecycleState } from "../js/core/lifecycle/lifecycle-state.js";

// Config lifecycle and snapshot.
Config.reset();
assert.equal(Config.initialize(), true);
assert.equal(Config.snapshot().initialized, true);
Config.set("runtimeTest", true);
assert.equal(Config.get("runtimeTest"), true);
assert.equal(Config.snapshot().values.runtimeTest, true);

// Container registry, resolution, and snapshot.
Container.clear();
await Container.register({
  name:"runtime-test-service",
  factory:async() => ({ ready:true })
});
assert.equal(Container.has("runtime-test-service"), true);
const service = await Container.resolve("runtime-test-service");
assert.equal(service.ready, true);
assert.equal(Container.snapshot().services, 1);

// Events lifecycle and diagnostics.
Events.reset();
assert.equal(Events.initialize(), true);
let received = false;
Events.on("core.runtime.test", () => { received = true; });
await Events.emit("core.runtime.test", { ok:true });
await new Promise(resolve => setTimeout(resolve, 20));
assert.equal(received, true);
assert.equal(Events.snapshot().system.initialized, true);

// Canonical app state + StateManager synchronization.
CanonicalAppState.reset();
await State.reset();
assert.equal(await State.initialize(), true);
CanonicalAppState.setInitialized(true);
CanonicalAppState.setReady(true);
await new Promise(resolve => setTimeout(resolve, 20));
const stateSnapshot = State.snapshot();
assert.equal(stateSnapshot.app.initialized, true);
assert.equal(stateSnapshot.app.ready, true);
assert.equal(stateSnapshot.state.app.initialized, true);
assert.equal(stateSnapshot.state.app.ready, true);
assert.equal(stateSnapshot.observerRegistered, true);
assert.ok(State.events.INITIALIZED);
assert.ok(State.events.UPDATED);

// Health limits.
HealthState.reset();
for(let index = 0; index < HEALTH_CONFIG.MAX_WARNINGS + 5; index++) HealthState.addWarning(`warning-${index}`);
for(let index = 0; index < HEALTH_CONFIG.MAX_ERRORS + 5; index++) HealthState.addError(`error-${index}`);
for(let index = 0; index < HEALTH_CONFIG.MAX_HISTORY + 5; index++) HealthState.addHistoryEntry({ index });

const health = HealthState.snapshot();
assert.equal(health.warnings.length, HEALTH_CONFIG.MAX_WARNINGS);
assert.equal(health.errors.length, HEALTH_CONFIG.MAX_ERRORS);
assert.equal(health.history.length, HEALTH_CONFIG.MAX_HISTORY);
assert.equal(health.warnings[0], "warning-5");
assert.equal(health.errors[0], "error-5");
assert.equal(health.history[0].index, 5);

// Lifecycle operation tracking.
LifecycleState.reset();
assert.equal(LifecycleState.isBusy(), false);
lifecycleState.startupPromise = Promise.resolve(true);
assert.equal(LifecycleState.isBusy(), true);
assert.equal(LifecycleState.snapshot().operations.starting, true);
LifecycleState.reset();

// Static integration guards.
const applicationSource = await readFile(new URL("../js/core/app/application-runtime.js", import.meta.url), "utf8");
const recoverySource = await readFile(new URL("../js/core/app/app-recovery.js", import.meta.url), "utf8");
const coreSource = await readFile(new URL("../js/core/index.js", import.meta.url), "utf8");
assert.match(applicationSource, /import Config/);
assert.match(applicationSource, /import Events/);
assert.match(applicationSource, /import State/);
assert.match(applicationSource, /runtimeOperations\.shutdown/);
assert.doesNotMatch(applicationSource, /if\s*\(\s*!AppState\.state\.booted\s*\)\s*\{\s*return true/);
assert.match(recoverySource, /import RuntimeManager/);
assert.match(recoverySource, /import ModuleRuntime/);
assert.doesNotMatch(recoverySource, /typeof RuntimeManager/);
assert.match(coreSource, /State\.snapshot/);
assert.match(coreSource, /Container\.snapshot/);

await State.shutdown();
Events.reset();
Container.clear();
Config.reset();
CanonicalAppState.reset();

console.log("Core runtime checks passed.");
