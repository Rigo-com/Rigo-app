import assert from "node:assert/strict";
import Auth, { authRuntimeState } from "../js/auth/index.js";

let requests = 0;
globalThis.fetch = async() => {
  requests++;
  return { ok:false, status:401, text:async() => JSON.stringify({ error:"INVALID_CREDENTIALS" }) };
};

await Auth.reset();
const initialized = await Promise.all([Auth.initialize(), Auth.initialize(), Auth.initialize()]);
assert.deepEqual(initialized, [true, true, true]);
assert.equal(requests, 2);
assert.equal(Auth.snapshot().initialized, true);
assert.equal(Auth.snapshot().authenticated, false);

for(let attempt = 0; attempt < 5; attempt++) assert.equal(await Auth.login({ email:"test@example.com", password:"wrong-password" }), false);
assert.equal(authRuntimeState.failedLoginAttempts, 5);
const requestsBeforeBlock = requests;
assert.equal(await Auth.login({ email:"test@example.com", password:"wrong-password" }), false);
assert.equal(requests, requestsBeforeBlock);
assert.equal(authRuntimeState.error, "LOGIN_BLOCKED");
assert.equal(authRuntimeState.diagnostics.blocked, 1);

authRuntimeState.token = "secret-token-that-must-never-leak";
assert.equal(Auth.snapshot().token, "[REDACTED]");
await Auth.shutdown();
assert.equal(Auth.snapshot().initialized, false);
console.log("Auth runtime checks passed.");
