// =====================================
// RIGO AI
// SECURITY POLICY ENGINE
// ENTERPRISE SECURITY POLICY LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// SECURITY LEVELS
// =====================================

const SECURITY_LEVELS =
Object.freeze({

  LOW:
  "low",

  MEDIUM:
  "medium",

  HIGH:
  "high",

  STRICT:
  "strict"

});



// =====================================
// POLICY CONFIG
// =====================================

const SECURITY_POLICY_CONFIG =
Object.freeze({

  DEFAULT_LEVEL:
  SECURITY_LEVELS.HIGH,

  ENABLE_IFRAME_BLOCKING:
  true,

  ENABLE_WORKER_RESTRICTIONS:
  true,

  ENABLE_INLINE_SCRIPT_BLOCKING:
  true,

  ENABLE_DYNAMIC_EVAL_BLOCKING:
  true,

  ENABLE_PERMISSION_VALIDATION:
  true,

  ENABLE_RUNTIME_LOCKS:
  true,

  MAX_RUNTIME_LOCKS:
  500,

  MAX_FEATURES:
  1000,

  MAX_FEATURE_NAME_LENGTH:
  200

});



// =====================================
// POLICY STATE
// =====================================

const securityPolicyState =
Object.seal({

  initialized:
  false,

  activeLevel:

    SECURITY_POLICY_CONFIG
    .DEFAULT_LEVEL,

  blockedActions:
  0,

  runtimeLocks:
  new Set(),

  trustedFeatures:
  new Set(),

  blockedFeatures:
  new Set(),

  lastUpdatedAt:
  null

});



// =====================================
// NORMALIZE FEATURE
// =====================================

function normalizePolicyFeature(
  value
){

  try{

    return String(
      value || ""
    )
    .trim()
    .toLowerCase()
    .slice(

      0,

      SECURITY_POLICY_CONFIG
      .MAX_FEATURE_NAME_LENGTH

    );

  }

  catch(error){

    return "";

  }

}



// =====================================
// SAFE LOG
// =====================================

function logPolicyEvent(
  message,
  metadata = null
){

  try{

    if(
      typeof logSecurityEvent ===
      "function"
    ){

      logSecurityEvent(
        message,
        metadata
      );

    }

  }

  catch(error){}

}



// =====================================
// ENFORCE LIMITS
// =====================================

function enforcePolicyLimits(){

  while(

    securityPolicyState
    .runtimeLocks
    .size >

    SECURITY_POLICY_CONFIG
    .MAX_RUNTIME_LOCKS

  ){

    const first =

      securityPolicyState
      .runtimeLocks
      .values()
      .next()
      .value;

    securityPolicyState
    .runtimeLocks
    .delete(first);

  }

  while(

    securityPolicyState
    .trustedFeatures
    .size >

    SECURITY_POLICY_CONFIG
    .MAX_FEATURES

  ){

    const first =

      securityPolicyState
      .trustedFeatures
      .values()
      .next()
      .value;

    securityPolicyState
    .trustedFeatures
    .delete(first);

  }

  while(

    securityPolicyState
    .blockedFeatures
    .size >

    SECURITY_POLICY_CONFIG
    .MAX_FEATURES

  ){

    const first =

      securityPolicyState
      .blockedFeatures
      .values()
      .next()
      .value;

    securityPolicyState
    .blockedFeatures
    .delete(first);

  }

}



// =====================================
// POLICY RULES
// =====================================

const SECURITY_POLICY_RULES =
Object.freeze({

  [SECURITY_LEVELS.LOW]:{

    allowEval:
    true,

    allowInlineScripts:
    true,

    allowWorkers:
    true,

    allowDynamicImport:
    true,

    allowRemoteScripts:
    true

  },



  [SECURITY_LEVELS.MEDIUM]:{

    allowEval:
    false,

    allowInlineScripts:
    false,

    allowWorkers:
    true,

    allowDynamicImport:
    false,

    allowRemoteScripts:
    false

  },



  [SECURITY_LEVELS.HIGH]:{

    allowEval:
    false,

    allowInlineScripts:
    false,

    allowWorkers:
    false,

    allowDynamicImport:
    false,

    allowRemoteScripts:
    false

  },



  [SECURITY_LEVELS.STRICT]:{

    allowEval:
    false,

    allowInlineScripts:
    false,

    allowWorkers:
    false,

    allowDynamicImport:
    false,

    allowRemoteScripts:
    false

  }

});



// =====================================
// GET ACTIVE POLICY
// =====================================

function getActiveSecurityPolicy(){

  const policy =

    SECURITY_POLICY_RULES[
      securityPolicyState
      .activeLevel
    ];

  if(
    !policy
  ){

    return SECURITY_POLICY_RULES
    [SECURITY_LEVELS.HIGH];

  }

  return Object.freeze({

    ...policy

  });

}



// =====================================
// SET SECURITY LEVEL
// =====================================

function setSecurityLevel(
  level
){

  const normalizedLevel =
  normalizePolicyFeature(
    level
  );

  if(

    !Object.values(
      SECURITY_LEVELS
    )
    .includes(
      normalizedLevel
    )

  ){

    return false;

  }

  securityPolicyState
  .activeLevel =
  normalizedLevel;

  securityPolicyState
  .lastUpdatedAt =
  Date.now();

  logPolicyEvent(

    "SECURITY LEVEL CHANGED",

    {

      level:
      normalizedLevel

    }

  );

  return true;

}



// =====================================
// VALIDATE FEATURE ACCESS
// =====================================

function validateFeatureAccess(
  feature
){

  const normalized =
  normalizePolicyFeature(
    feature
  );

  if(!normalized){

    return false;

  }

  if(

    securityPolicyState
    .blockedFeatures
    .has(
      normalized
    )

  ){

    securityPolicyState
    .blockedActions++;

    logPolicyEvent(

      "FEATURE BLOCKED",

      {

        feature:
        normalized

      }

    );

    return false;

  }

  return true;

}



// =====================================
// BLOCK FEATURE
// =====================================

function blockSecurityFeature(
  feature
){

  const normalized =
  normalizePolicyFeature(
    feature
  );

  if(!normalized){

    return false;

  }

  securityPolicyState
  .blockedFeatures
  .add(
    normalized
  );

  securityPolicyState
  .trustedFeatures
  .delete(
    normalized
  );

  enforcePolicyLimits();

  securityPolicyState
  .lastUpdatedAt =
  Date.now();

  return true;

}



// =====================================
// TRUST FEATURE
// =====================================

function trustSecurityFeature(
  feature
){

  const normalized =
  normalizePolicyFeature(
    feature
  );

  if(!normalized){

    return false;

  }

  securityPolicyState
  .trustedFeatures
  .add(
    normalized
  );

  securityPolicyState
  .blockedFeatures
  .delete(
    normalized
  );

  enforcePolicyLimits();

  securityPolicyState
  .lastUpdatedAt =
  Date.now();

  return true;

}



// =====================================
// ADD RUNTIME LOCK
// =====================================

function addRuntimeLock(
  lockName
){

  if(

    !SECURITY_POLICY_CONFIG
    .ENABLE_RUNTIME_LOCKS

  ){

    return false;

  }

  const normalized =
  normalizePolicyFeature(
    lockName
  );

  if(!normalized){

    return false;

  }

  securityPolicyState
  .runtimeLocks
  .add(
    normalized
  );

  enforcePolicyLimits();

  securityPolicyState
  .lastUpdatedAt =
  Date.now();

  return true;

}



// =====================================
// REMOVE RUNTIME LOCK
// =====================================

function removeRuntimeLock(
  lockName
){

  const normalized =
  normalizePolicyFeature(
    lockName
  );

  if(!normalized){

    return false;

  }

  return securityPolicyState
  .runtimeLocks
  .delete(
    normalized
  );

}



// =====================================
// CHECK RUNTIME LOCK
// =====================================

function hasRuntimeLock(
  lockName
){

  const normalized =
  normalizePolicyFeature(
    lockName
  );

  if(!normalized){

    return false;

  }

  return securityPolicyState
  .runtimeLocks
  .has(
    normalized
  );

}



// =====================================
// BUILD CSP
// =====================================

function buildCSPPolicy(){

  const policy = [

    "default-src 'self'",

    "object-src 'none'",

    "base-uri 'self'",

    "frame-ancestors 'none'",

    "form-action 'self'",

    "img-src 'self' data: blob:",

    "style-src 'self' 'unsafe-inline'"

  ];

  const activePolicy =
  getActiveSecurityPolicy();

  if(
    !activePolicy
    .allowInlineScripts
  ){

    policy.push(
      "script-src 'self'"
    );

  }

  if(
    !activePolicy
    .allowWorkers
  ){

    policy.push(
      "worker-src 'none'"
    );

  }

  return policy.join("; ");

}



// =====================================
// VALIDATE EXECUTION
// =====================================

function validateRuntimeExecution(
  type
){

  const normalizedType =
  normalizePolicyFeature(
    type
  );

  const activePolicy =
  getActiveSecurityPolicy();

  let allowed =
  false;

  switch(normalizedType){

    case "eval":

      allowed =
      activePolicy
      .allowEval;

      break;

    case "inline-script":

      allowed =
      activePolicy
      .allowInlineScripts;

      break;

    case "worker":

      allowed =
      activePolicy
      .allowWorkers;

      break;

    case "dynamic-import":

      allowed =
      activePolicy
      .allowDynamicImport;

      break;

    case "remote-script":

      allowed =
      activePolicy
      .allowRemoteScripts;

      break;

    default:

      allowed =
      false;

  }

  if(!allowed){

    securityPolicyState
    .blockedActions++;

    logPolicyEvent(

      "RUNTIME EXECUTION BLOCKED",

      {

        type:
        normalizedType

      }

    );

  }

  return allowed;

}



// =====================================
// INITIALIZE
// =====================================

function initializeSecurityPolicyEngine(){

  if(
    securityPolicyState
    .initialized
  ){

    return true;

  }

  try{

    securityPolicyState
    .initialized =
    true;

    securityPolicyState
    .lastUpdatedAt =
    Date.now();

    logPolicyEvent(
      "SECURITY POLICY READY"
    );

    return true;

  }

  catch(error){

    logPolicyEvent(

      "SECURITY POLICY INIT FAILED",

      {

        error:
        String(error)

      }

    );

    return false;

  }

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSecurityPolicyDiagnostics(){

  return Object.freeze({

    initialized:
    securityPolicyState
    .initialized,

    activeLevel:
    securityPolicyState
    .activeLevel,

    blockedActions:
    securityPolicyState
    .blockedActions,

    runtimeLocks:[

      ...securityPolicyState
      .runtimeLocks

    ],

    trustedFeatures:[

      ...securityPolicyState
      .trustedFeatures

    ],

    blockedFeatures:[

      ...securityPolicyState
      .blockedFeatures

    ],

    lastUpdatedAt:
    securityPolicyState
    .lastUpdatedAt

  });

}



// =====================================
// PUBLIC API
// =====================================

const SecurityPolicy =
Object.freeze({

  initialize:
  initializeSecurityPolicyEngine,

  setLevel:
  setSecurityLevel,

  getPolicy:
  getActiveSecurityPolicy,

  validateExecution:
  validateRuntimeExecution,

  validateFeature:
  validateFeatureAccess,

  blockFeature:
  blockSecurityFeature,

  trustFeature:
  trustSecurityFeature,

  addLock:
  addRuntimeLock,

  removeLock:
  removeRuntimeLock,

  hasLock:
  hasRuntimeLock,

  buildCSP:
  buildCSPPolicy,

  diagnostics:
  getSecurityPolicyDiagnostics

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "SecurityPolicy",

    {

      value:
      SecurityPolicy,

      writable:
      false,

      configurable:
      false

    }

  );

}
