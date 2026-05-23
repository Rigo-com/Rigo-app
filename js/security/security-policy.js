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

  ENABLE_RUNTIME_LOCKS:true

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

    allowWorkers:false

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

  if(

    !Object.values(
      SECURITY_LEVELS
    )
    .includes(level)

  ){

    return false;

  }

  securityPolicyState
  .activeLevel =
  level;

  securityPolicyState
  .lastUpdatedAt =
  Date.now();

  logSecurityEvent(

    "SECURITY LEVEL CHANGED",

    { level }

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
  safeString(feature)
  .toLowerCase();

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
  safeString(feature)
  .toLowerCase();

  if(!normalized){

    return false;

  }

  securityPolicyState
  .blockedFeatures
  .add(normalized);

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
  safeString(feature)
  .toLowerCase();

  if(!normalized){

    return false;

  }

  securityPolicyState
  .trustedFeatures
  .add(normalized);

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
  safeString(lockName);

  if(!normalized){

    return false;

  }

  securityPolicyState
  .runtimeLocks
  .add(normalized);

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

    safeString(
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

    "frame-ancestors 'none'"

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

  return policy.join("; ");

}



// =====================================
// VALIDATE RUNTIME EXECUTION
// =====================================

function validateRuntimeExecution(
  type
){

  const activePolicy =
  getActiveSecurityPolicy();

  switch(type){

    case "eval":

      return activePolicy
      .allowEval;

    case "inline-script":

      return activePolicy
      .allowInlineScripts;

    case "worker":

      return activePolicy
      .allowWorkers;

    default:

      return false;

  }

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
