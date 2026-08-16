import assert from "node:assert/strict";
import { authRuntimeState } from "../js/auth/auth-state.js";
import Settings, { SETTINGS_DEFAULTS } from "../js/settings/index.js";

const values = new Map();
globalThis.localStorage = {
  get length(){ return values.size; }, key:index => [...values.keys()][index] ?? null,
  getItem:key => values.has(key) ? values.get(key) : null,
  setItem:(key, value) => values.set(key, String(value)), removeItem:key => values.delete(key)
};
authRuntimeState.user = { id:"settings-test-user" };

Settings.reset();
assert.equal(Settings.initialize(), true);
assert.equal(Settings.boot(), true);
assert.equal(Settings.snapshot().initialized, true);

assert.equal(Settings.update({ ui:{ compactMode:true } }), true);
let current = Settings.getSettings();
assert.equal(current.ui.compactMode, true);
assert.equal(current.ui.theme, SETTINGS_DEFAULTS.ui.theme);
assert.equal(current.ui.animations, SETTINGS_DEFAULTS.ui.animations);

assert.equal(Settings.update({ search:{ resultLimit:"invalid" }, unknown:{ injected:true }, __proto__:{ polluted:true } }), true);
current = Settings.getSettings();
assert.equal(current.search.resultLimit, SETTINGS_DEFAULTS.search.resultLimit);
assert.equal(current.unknown, undefined);
assert.equal({}.polluted, undefined);
assert.equal(current.version, "1.0.0");

assert.equal(Settings.save(), true);
Settings.reset();
assert.equal(Settings.initialize(), true);
assert.equal(Settings.getSettings().ui.compactMode, true);
assert.equal(Settings.getSettings().version, "1.0.0");
assert.equal(Settings.shutdown(), true);
assert.equal(Settings.snapshot().initialized, false);
console.log("Settings runtime checks passed.");
