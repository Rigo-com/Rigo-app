// =====================================
// RIGO AI
// SECURITY POLICY ENGINE
// ENTERPRISE SECURITY POLICY LAYER
// =====================================



// =====================================
// SECURITY LEVELS
// =====================================

const SECURITY_LEVELS =
Object.freeze({

  LOW:"low",

  MEDIUM:"medium",

  HIGH:"high",

  STRICT:"strict"

});



// =====================================
// POLICY CONFIG
// =====================================

const SECURITY_POLICY_CONFIG =
Object.freeze({

  DEFAULT_LEVEL:
  SECURITY_LEVELS.HIGH,

  ENABLE_IFRAME_BLOCKING:true,

  ENABLE_WORKER_RESTRICTIONS:true,

  ENABLE_INLINE_SCRIPT_BLOCKING:true,

  ENABLE_DYNAMIC_EVAL_BLOCKING:true,

  ENABLE_PERMISSION_VALIDATION:true,

  ENABLE_RUNTIME_LOCKS:true,

  MAX_RUNTIME_LOCKS:500,

  MAX_FEATURES:1000

});



// =====================================
// POLICY STATE
// =====================================

const securityPolicyState =
Object.seal({

  initialized:false,

  activeLevel:

    SECURITY_POLICY_CONFIG
    .DEFAULT_LEVEL,

  blockedActions:0,

  runtimeLocks:
  new Set(),

  trustedFeatures:
  new Set(),

  blockedFeatures:
  new Set(),

  lastUpdatedAt:null

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
    .slice(0,200);

  }

  catch(error){

    return "";

  }

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

    allowEval:true,

    allowInlineScripts:true,

    allowWorkers:true

  },



  [SECURITY_LEVELS.MEDIUM]:{

    allowEval:false,

    allowInlineScripts:false,

    allowWorkers:true

  },



  [SECURITY_LEVELS.HIGH]:{

    allowEval:false,

    allowInlineScripts:false,

    allowWorkers:false

  },



  [SECURITY_LEVELS.STRICT]:{

    allowEval:false,

    allowInlineScripts:false,

    allowWorkers:false,

    allowDynamicImport:false,

    allowRemoteScripts:false

  }

});



// =====================================
// GET POLICY
// =====================================

function getActiveSecurityPolicy(){

  return (

    SECURITY_POLICY_RULES[
      securityPolicyState
      .activeLevel
    ]

    ||

    SECURITY_POLICY_RULES
    [SECURITY_LEVELS.HIGH]

  );

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

  logSecurityEvent(

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
    .has(normalized)

  ){

    securityPolicyState
    .blockedActions++;

    logSecurityEvent(

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
  .add(normalized);

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
  .add(normalized);

  enforcePolicyLimits();

  securityPolicyState
  .lastUpdatedAt =
  Date.now();

  return true;

}



// =====================================
// RUNTIME LOCK
// =====================================

function addRuntimeLock(
  lockName
){

  const normalized =
  normalizePolicyFeature(
    lockName
  );

  if(!normalized){

    return false;

  }

  securityPolicyState
  .runtimeLocks
  .add(normalized);

  enforcePolicyLimits();

  return true;

}



// =====================================
// REMOVE RUNTIME LOCK
// =====================================

function removeRuntimeLock(
  lockName
){

  return securityPolicyState
  .runtimeLocks
  .delete(

    normalizePolicyFeature(
      lockName
    )

  );

}



// =====================================
// CSP POLICY
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
// VALIDATE RUNTIME EXECUTION
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

    default:

      allowed = false;

  }

  if(!allowed){

    securityPolicyState
    .blockedActions++;

    logSecurityEvent(

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
// INITIALIZE POLICY ENGINE
// =====================================

function initializeSecurityPolicyEngine(){

  if(
    securityPolicyState
    .initialized
  ){

    return true;

  }

  securityPolicyState
  .initialized =
  true;

  securityPolicyState
  .lastUpdatedAt =
  Date.now();

  logSecurityEvent(
    "SECURITY POLICY READY"
  );

  return true;

}



// =====================================
// POLICY DIAGNOSTICS
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

  buildCSP:
  buildCSPPolicy,

  diagnostics:
  getSecurityPolicyDiagnostics

});
