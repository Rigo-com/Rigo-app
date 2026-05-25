// =====================================
// RIGO AI
// SECURITY EXECUTION GUARD
// ENTERPRISE GUARDED EXECUTION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// EXECUTION CONFIG
// =====================================

const EXECUTION_GUARD_CONFIG =
Object.freeze({

  DEFAULT_TIMEOUT:
  5000,

  MAX_TIMEOUT:
  30000,

  MAX_CONCURRENT_EXECUTIONS:
  10,

  MAX_SOURCE_LENGTH:
  50000,

  ENABLE_SOURCE_VALIDATION:
  true,

  ENABLE_RESULT_FREEZE:
  true,

  ENABLE_ASYNC_EXECUTION:
  true,

  ENABLE_FUNCTION_BLOCKING:
  true,

  ENABLE_EVAL_BLOCKING:
  true,

  ENABLE_GLOBAL_BLOCKING:
  true

});



// =====================================
// EXECUTION STATE
// =====================================

const executionGuardState =
Object.seal({

  activeExecutions:
  new Map(),

  completedExecutions:
  0,

  failedExecutions:
  0,

  timeoutExecutions:
  0,

  blockedExecutions:
  0,

  abortedExecutions:
  0,

  lastExecutionAt:
  null

});



// =====================================
// BLOCKED SOURCE PATTERNS
// =====================================

const BLOCKED_EXECUTION_PATTERNS =
Object.freeze([

  "eval(",

  "globalThis.eval",

  "Function(",

  "new Function",

  "document.cookie",

  "localStorage",

  "sessionStorage",

  "indexedDB",

  "window.location",

  "while(true)",

  "for(;;)",

  "globalThis",

  "window.",

  "document.",

  "self.",

  "importScripts"

]);



// =====================================
// SAFE LOG
// =====================================

function logExecutionGuard(
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
// VALIDATE CALLBACK
// =====================================

function validateExecutionCallback(
  callback
){

  return (
    typeof callback ===
    "function"
  );

}



// =====================================
// GET SOURCE
// =====================================

function getExecutionSource(
  callback
){

  try{

    return safeString(
      callback.toString()
    );

  }

  catch(error){

    return "";

  }

}



// =====================================
// VALIDATE SOURCE
// =====================================

function validateExecutionSource(
  source
){

  if(
    typeof source !==
    "string"
  ){

    return false;

  }

  if(!source){

    return false;

  }

  if(

    source.length >

    EXECUTION_GUARD_CONFIG
    .MAX_SOURCE_LENGTH

  ){

    return false;

  }

  const normalized =
  source.toLowerCase();

  return !BLOCKED_EXECUTION_PATTERNS
  .some((pattern) => {

    return normalized.includes(

      pattern.toLowerCase()

    );

  });

}



// =====================================
// VALIDATE EXECUTION
// =====================================

function validateExecution(
  callback
){

  if(
    !validateExecutionCallback(
      callback
    )
  ){

    return false;

  }

  if(

    !EXECUTION_GUARD_CONFIG
    .ENABLE_SOURCE_VALIDATION

  ){

    return true;

  }

  const source =
  getExecutionSource(
    callback
  );

  const valid =
  validateExecutionSource(
    source
  );

  if(!valid){

    executionGuardState
    .blockedExecutions++;

    logExecutionGuard(

      "EXECUTION BLOCKED"

    );

    return false;

  }

  return true;

}



// =====================================
// CREATE TIMEOUT
// =====================================

function createExecutionTimeout(
  timeout,
  controller
){

  const normalizedTimeout =

    Number.isFinite(
      timeout
    )

    &&

    timeout > 0

    ?

    Math.min(

      timeout,

      EXECUTION_GUARD_CONFIG
      .MAX_TIMEOUT

    )

    :

    EXECUTION_GUARD_CONFIG
    .DEFAULT_TIMEOUT;

  let timeoutId =
  null;

  const promise =
  new Promise((_,reject) => {

    timeoutId =
    setTimeout(() => {

      try{

        controller.abort();

      }

      catch(error){}

      reject(

        new Error(
          "EXECUTION_TIMEOUT"
        )

      );

    },

    normalizedTimeout);

  });

  return {

    promise,

    clear(){

      if(timeoutId){

        clearTimeout(
          timeoutId
        );

        timeoutId =
        null;

      }

    }

  };

}



// =====================================
// CREATE RESULT
// =====================================

function createExecutionResult(
  payload = {}
){

  const result = {

    success:
    Boolean(
      payload.success
    ),

    blocked:
    Boolean(
      payload.blocked
    ),

    timedOut:
    Boolean(
      payload.timedOut
    ),

    aborted:
    Boolean(
      payload.aborted
    ),

    executionId:
    payload.executionId ||
    null,

    duration:

      Number.isFinite(
        payload.duration
      )

      ?

      payload.duration

      :

      0,

    result:
    payload.result,

    error:

      payload.error

      ?

      safeString(
        payload.error
      )

      :

      null

  };

  if(

    EXECUTION_GUARD_CONFIG
    .ENABLE_RESULT_FREEZE

    &&

    typeof deepFreezeSecurity ===
    "function"

  ){

    return deepFreezeSecurity(
      result
    );

  }

  return Object.freeze(
    result
  );

}



// =====================================
// EXECUTE
// =====================================

async function executeGuarded(
  callback,
  options = {}
){

  if(
    !validateExecution(
      callback
    )
  ){

    return createExecutionResult({

      success:false,

      blocked:true

    });

  }

  if(

    executionGuardState
    .activeExecutions
    .size >=

    EXECUTION_GUARD_CONFIG
    .MAX_CONCURRENT_EXECUTIONS

  ){

    executionGuardState
    .blockedExecutions++;

    return createExecutionResult({

      success:false,

      blocked:true,

      error:
      "MAX_CONCURRENT_EXECUTIONS"

    });

  }

  const executionId =

    typeof createUniqueId ===
    "function"

    ?

    createUniqueId(
      "execution"
    )

    :

    `execution_${Date.now()}`;

  const startedAt =
  Date.now();

  executionGuardState
  .lastExecutionAt =
  startedAt;

  const controller =
  new AbortController();

  const timeoutController =
  createExecutionTimeout(

    options.timeout,

    controller

  );

  executionGuardState
  .activeExecutions
  .set(

    executionId,

    {

      startedAt,

      controller,

      timeout:

        options.timeout ||

        EXECUTION_GUARD_CONFIG
        .DEFAULT_TIMEOUT

    }

  );

  try{

    const executionPromise =
    Promise.resolve()
    .then(async() => {

      if(
        controller.signal.aborted
      ){

        throw new Error(
          "EXECUTION_ABORTED"
        );

      }

      if(

        !EXECUTION_GUARD_CONFIG
        .ENABLE_ASYNC_EXECUTION

      ){

        return callback(
          controller.signal
        );

      }

      return await callback(
        controller.signal
      );

    });

    const result =
    await Promise.race([

      executionPromise,

      timeoutController
      .promise

    ]);

    executionGuardState
    .completedExecutions++;

    return createExecutionResult({

      success:true,

      executionId,

      duration:

        Date.now() -
        startedAt,

      result

    });

  }

  catch(error){

    const message =
    safeString(
      error?.message
    );

    const timedOut =

      message ===
      "EXECUTION_TIMEOUT";

    const aborted =

      message ===
      "EXECUTION_ABORTED";

    if(
      timedOut
    ){

      executionGuardState
      .timeoutExecutions++;

    }

    else if(
      aborted
    ){

      executionGuardState
      .abortedExecutions++;

    }

    else{

      executionGuardState
      .failedExecutions++;

    }

    logExecutionGuard(

      "EXECUTION FAILED",

      {

        executionId,

        timedOut,

        aborted

      }

    );

    return createExecutionResult({

      success:false,

      executionId,

      duration:

        Date.now() -
        startedAt,

      timedOut,

      aborted,

      error:
      message

    });

  }

  finally{

    timeoutController
    .clear();

    executionGuardState
    .activeExecutions
    .delete(
      executionId
    );

  }

}



// =====================================
// DIAGNOSTICS
// =====================================

function getExecutionDiagnostics(){

  return Object.freeze({

    activeExecutions:

      executionGuardState
      .activeExecutions
      .size,

    completedExecutions:

      executionGuardState
      .completedExecutions,

    failedExecutions:

      executionGuardState
      .failedExecutions,

    timeoutExecutions:

      executionGuardState
      .timeoutExecutions,

    blockedExecutions:

      executionGuardState
      .blockedExecutions,

    abortedExecutions:

      executionGuardState
      .abortedExecutions,

    lastExecutionAt:

      executionGuardState
      .lastExecutionAt

  });

}



// =====================================
// RESET
// =====================================

function resetExecutionGuard(){

  executionGuardState
  .activeExecutions
  .forEach((execution) => {

    try{

      execution
      .controller
      ?.abort();

    }

    catch(error){}

  });

  executionGuardState
  .activeExecutions
  .clear();

  executionGuardState
  .completedExecutions =
  0;

  executionGuardState
  .failedExecutions =
  0;

  executionGuardState
  .timeoutExecutions =
  0;

  executionGuardState
  .blockedExecutions =
  0;

  executionGuardState
  .abortedExecutions =
  0;

  executionGuardState
  .lastExecutionAt =
  null;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SecurityExecutionGuard =
Object.freeze({

  execute:
  executeGuarded,

  diagnostics:
  getExecutionDiagnostics,

  reset:
  resetExecutionGuard

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

    "SecurityExecutionGuard",

    {

      value:
      SecurityExecutionGuard,

      writable:
      false,

      configurable:
      false

    }

  );

}
