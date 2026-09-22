import assert from "node:assert/strict";
import Security, {
  SecurityMonitor,
  SecurityPolicy,
  SecurityURL,
  SecurityFreeze,
  SecuritySandbox,
  SecuritySanitize,
  SecurityValidator,
  SECURITY_STATUS
} from "../js/security/index.js";

await Security.reset();
assert.equal(await Security.initialize(), true);
assert.equal(await Security.boot(), true);
assert.equal(await Security.boot(), true);

let snapshot = Security.snapshot();
assert.equal(snapshot.state.initialized, true);
assert.equal(snapshot.state.booted, true);
assert.equal(snapshot.state.status, SECURITY_STATUS.ACTIVE);
assert.equal(snapshot.metrics.totalEvents, 1);

// Monitor must keep immutable, sanitized event details.
const details = { nested:{ allowed:true }, secret:"\u0000safe" };
const event = SecurityMonitor.record("security.test", details);
details.nested.allowed = false;
assert.equal(event.details.nested.allowed, true);
assert.equal(event.details.secret, "safe");
assert.equal(Object.isFrozen(event.details), true);
assert.equal(Object.isFrozen(event.details.nested), true);

// Policy validation must be strict and reject malformed/unknown fields.
const defaultPolicy = SecurityPolicy.create();
assert.equal(SecurityPolicy.validate(defaultPolicy), true);
assert.throws(
  () => SecurityPolicy.create({ allowHTTP:"false" }),
  /boolean/
);
assert.throws(
  () => SecurityPolicy.create({ unknownFlag:true }),
  /Unknown policy field/
);
assert.throws(
  () => SecurityPolicy.validate({ ...defaultPolicy, allowHTTP:"false" }),
  /boolean/
);
assert.equal(
  SecurityPolicy.enforce(defaultPolicy, { protocol:"https:" }),
  "allow"
);
assert.throws(
  () => SecurityPolicy.enforce(defaultPolicy, { protocol:"http:" }),
  /HTTP protocol is blocked/
);
assert.throws(
  () => SecurityPolicy.enforce(defaultPolicy, { unsafeURL:true }),
  /Unsafe URL detected/
);
assert.throws(
  () => SecurityPolicy.enforce(defaultPolicy, { prototypeMutation:true }),
  /Prototype mutation blocked/
);
assert.throws(
  () => SecurityPolicy.enforce(defaultPolicy, { unknownObject:true }),
  /Unknown object blocked/
);
assert.throws(
  () => SecurityPolicy.enforce(defaultPolicy, { unsafeContent:true }),
  /Unsafe content blocked/
);

// URL layer must allow HTTPS and reject dangerous protocols.
assert.equal(SecurityURL.isSafe("https://rigo.example/path"), true);
assert.equal(SecurityURL.sanitize("https://rigo.example/path"), "https://rigo.example/path");
for(const url of [
  "javascript:alert(1)",
  "data:text/html,<script>alert(1)</script>",
  "vbscript:msgbox(1)",
  "file:///etc/passwd",
  "blob:https://rigo.example/id",
  "http://rigo.example"
]){
  assert.equal(SecurityURL.isSafe(url), false);
  assert.throws(() => SecurityURL.validate(url));
}

// Sanitizer must remove control chars, dangerous object keys, and non-finite numbers.
const sanitized = SecuritySanitize.value({
  text:"hello\u0000\u001bworld",
  nested:{ "__proto__":"blocked", constructor:"blocked", value:1 },
  infinity:Infinity,
  nan:NaN
});
assert.equal(sanitized.text, "helloworld");
assert.equal(sanitized.nested.constructor, undefined);
assert.equal(sanitized.nested.value, 1);
assert.equal(sanitized.infinity, 0);
assert.equal(sanitized.nan, 0);

const circular = { name:"loop" };
circular.self = circular;
const sanitizedCircular = SecuritySanitize.value(circular);
assert.equal(sanitizedCircular.self, sanitizedCircular);

// Freeze layer must never freeze the caller's input as a clone fallback.
const source = { nested:{ value:1 } };
const copy = SecurityFreeze.immutableCopy(source);
assert.notEqual(copy, source);
assert.equal(copy.nested.value, 1);
assert.equal(Object.isFrozen(copy), true);
assert.equal(Object.isFrozen(copy.nested), true);
assert.equal(Object.isFrozen(source), false);
assert.equal(Object.isFrozen(source.nested), false);
assert.throws(() => SecurityFreeze.immutableCopy({ fn(){} }), /could not clone/);
assert.equal(Object.isFrozen(source), false);

// Validator must enforce primitive types and schemas.
assert.equal(SecurityValidator.string("rigo", { minLength:2, maxLength:10 }), true);
assert.equal(SecurityValidator.number(10, { min:1, max:20 }), true);
assert.equal(SecurityValidator.boolean(true), true);
assert.equal(SecurityValidator.array([], { maxLength:2 }), true);
assert.equal(SecurityValidator.object({ ok:true }), true);
assert.equal(SecurityValidator.schema(
  { name:"Rigo", enabled:true, count:2 },
  { name:"string", enabled:"boolean", count:"number" }
), true);
assert.throws(() => SecurityValidator.string(10));
assert.throws(() => SecurityValidator.number(Infinity));
assert.throws(() => SecurityValidator.schema(
  { name:10 },
  { name:"string" }
));

// Sandbox is a static gate, not an execution engine.
assert.equal(SecuritySandbox.isSafeCode("const value = 1;"), true);
for(const code of [
  "eval('1')",
  "new Function('return 1')",
  "globalThis.process",
  "window.location",
  "document.cookie",
  "process.env",
  "require('fs')",
  "import('x')",
  "WebAssembly.instantiate(x)",
  "fetch('/secret')",
  "new WebSocket('wss://example.com')"
]){
  assert.equal(SecuritySandbox.isSafeCode(code), false);
  assert.throws(() => SecuritySandbox.validateExecution(code));
}
assert.throws(
  () => SecuritySandbox.validateExecution("x".repeat(100001)),
  /maximum length/
);
const scope = SecuritySandbox.createRestrictedScope({
  safeValue:42,
  process:{ secret:true },
  globalThis:{ secret:true }
});
assert.equal(scope.safeValue, 42);
assert.equal(scope.process, undefined);
assert.equal(scope.globalThis, undefined);
assert.equal(Object.getPrototypeOf(scope), null);

// Lifecycle and monitor reset.
await Security.shutdown();
snapshot = Security.snapshot();
assert.equal(snapshot.state.booted, false);
assert.equal(snapshot.state.initialized, false);
assert.equal(snapshot.state.status, SECURITY_STATUS.DISABLED);

await Security.reset();
assert.equal(Security.snapshot().metrics.totalEvents, 0);

console.log("Security runtime checks passed.");
