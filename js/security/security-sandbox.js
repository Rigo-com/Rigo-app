import { SandboxError } from "./security-errors.js";

const SECURITY_SANDBOX_CONFIG = Object.freeze({
  MAX_CODE_LENGTH:100000,
  BLOCKED_PATTERNS:Object.freeze([
    /\beval\s*\(/i,
    /\bFunction\s*\(/i,
    /\bAsyncFunction\b/i,
    /\bGeneratorFunction\b/i,
    /\bAsyncGeneratorFunction\b/i,
    /\bsetTimeout\s*\(/i,
    /\bsetInterval\s*\(/i,
    /\bsetImmediate\s*\(/i,
    /\bimport\s*\(/i,
    /\brequire\s*\(/i,
    /\bglobalThis\b/i,
    /\bwindow\b/i,
    /\bdocument\b/i,
    /\bprocess\b/i,
    /\bglobal\b/i,
    /\bmodule\b/i,
    /\bexports\b/i,
    /\b__dirname\b/i,
    /\b__filename\b/i,
    /\bWebAssembly\b/i,
    /\bSharedArrayBuffer\b/i,
    /\bAtomics\b/i,
    /\bfetch\s*\(/i,
    /\bXMLHttpRequest\b/i,
    /\bWebSocket\b/i
  ])
});

function normalizeCode(code){
  if(typeof code !== "string"){
    throw new SandboxError("Sandbox code must be a string");
  }

  if(code.length > SECURITY_SANDBOX_CONFIG.MAX_CODE_LENGTH){
    throw new SandboxError("Sandbox code exceeds maximum length");
  }

  return code;
}

function isSafeCode(code){
  try{
    const normalized = normalizeCode(code);
    return !SECURITY_SANDBOX_CONFIG.BLOCKED_PATTERNS.some(pattern => pattern.test(normalized));
  }catch{
    return false;
  }
}

/*
 * This module is a static gate, not a JavaScript execution sandbox.
 * Untrusted code must never be executed in the application context.
 */
function validateExecution(code){
  normalizeCode(code);

  if(!isSafeCode(code)){
    throw new SandboxError("Unsafe code detected");
  }

  return true;
}

function createRestrictedScope(scope = {}){
  if(!scope || typeof scope !== "object" || Array.isArray(scope)){
    throw new SandboxError("Invalid sandbox scope");
  }

  const blockedKeys = new Set([
    "window","document","globalThis","global","process",
    "require","module","exports","eval","Function",
    "WebAssembly","SharedArrayBuffer","Atomics","fetch",
    "XMLHttpRequest","WebSocket"
  ]);

  const restricted = Object.create(null);

  for(const [key, value] of Object.entries(scope)){
    if(blockedKeys.has(key)) continue;
    restricted[key] = value;
  }

  return Object.freeze(restricted);
}

function createContext(scope = {}){
  return Object.freeze({
    createdAt:Date.now(),
    scope:createRestrictedScope(scope)
  });
}

const SecuritySandbox = Object.freeze({
  isSafeCode,
  validateExecution,
  createRestrictedScope,
  createContext
});

export {
  SECURITY_SANDBOX_CONFIG,
  normalizeCode,
  isSafeCode,
  validateExecution,
  createRestrictedScope,
  createContext,
  SecuritySandbox
};

export default SecuritySandbox;
