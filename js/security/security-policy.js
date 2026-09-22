import { PolicyError } from "./security-errors.js";
import { SECURITY_ACTIONS } from "./security-types.js";

const POLICY_KEYS = Object.freeze([
  "allowHTTP",
  "allowUnsafeURLs",
  "allowPrototypeMutation",
  "allowUnknownObjects",
  "allowUnsafeContent"
]);

const DEFAULT_SECURITY_POLICY = Object.freeze({
  allowHTTP:false,
  allowUnsafeURLs:false,
  allowPrototypeMutation:false,
  allowUnknownObjects:false,
  allowUnsafeContent:false
});

function validatePolicy(policy){
  if(!policy || typeof policy !== "object" || Array.isArray(policy)){
    throw new PolicyError("Invalid policy");
  }

  for(const key of POLICY_KEYS){
    if(typeof policy[key] !== "boolean"){
      throw new PolicyError(`Policy field must be boolean: ${key}`);
    }
  }

  for(const key of Object.keys(policy)){
    if(!POLICY_KEYS.includes(key)){
      throw new PolicyError(`Unknown policy field: ${key}`);
    }
  }

  return true;
}

function createPolicy(overrides = {}){
  if(!overrides || typeof overrides !== "object" || Array.isArray(overrides)){
    throw new PolicyError("Invalid policy overrides");
  }

  for(const key of Object.keys(overrides)){
    if(!POLICY_KEYS.includes(key)){
      throw new PolicyError(`Unknown policy field: ${key}`);
    }
    if(typeof overrides[key] !== "boolean"){
      throw new PolicyError(`Policy field must be boolean: ${key}`);
    }
  }

  const policy = Object.freeze({
    ...DEFAULT_SECURITY_POLICY,
    ...overrides
  });

  validatePolicy(policy);
  return policy;
}

function checkPolicy(condition, message = "Security policy check failed"){
  if(condition) return true;
  throw new PolicyError(message);
}

function enforcePolicy(policy, context = {}){
  validatePolicy(policy);

  if(!context || typeof context !== "object" || Array.isArray(context)){
    throw new PolicyError("Invalid policy context");
  }

  if(context.protocol === "http:" && !policy.allowHTTP){
    throw new PolicyError("HTTP protocol is blocked");
  }
  if(context.unsafeURL === true && !policy.allowUnsafeURLs){
    throw new PolicyError("Unsafe URL detected");
  }
  if(context.prototypeMutation === true && !policy.allowPrototypeMutation){
    throw new PolicyError("Prototype mutation blocked");
  }
  if(context.unknownObject === true && !policy.allowUnknownObjects){
    throw new PolicyError("Unknown object blocked");
  }
  if(context.unsafeContent === true && !policy.allowUnsafeContent){
    throw new PolicyError("Unsafe content blocked");
  }

  return SECURITY_ACTIONS.ALLOW;
}

const SecurityPolicy = Object.freeze({
  create:createPolicy,
  check:checkPolicy,
  enforce:enforcePolicy,
  validate:validatePolicy
});

export {
  POLICY_KEYS,
  DEFAULT_SECURITY_POLICY,
  createPolicy,
  checkPolicy,
  enforcePolicy,
  validatePolicy,
  SecurityPolicy
};

export default SecurityPolicy;
