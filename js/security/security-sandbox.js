// =====================================
// RIGO AI
// SECURITY SANDBOX
// ENTERPRISE GUARDED EXECUTION LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// SANDBOX CONFIG
// =====================================

const SANDBOX_CONFIG =
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
// SANDBOX STATE
// =====================================

const sandboxState =
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

const BLOCKED_SANDBOX_PATTERNS =
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

function logSandboxEvent(
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

function validateSandboxCallback(
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

function getSandboxSource(
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

function validateSandboxSource(
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

    SANDBOX_CONFIG
    .MAX_SOURCE_LENGTH

  ){

    return false;

  }

  const normalized =
  source.toLowerCase();

  return !BLOCKED_SANDBOX_PATTERNS
  .some((pattern) => {

    return normalized.includes(

      pattern.toLowerCase()

    );

  });

}



// =====================================
// VALIDATE EXECUTION
// =====================================

function validateSandboxExecution(
  callback
){

  if(
    !validateSandboxCallback(
      callback
    )
  ){

    return false;

  }

  if(

    !SANDBOX_CONFIG
    .ENABLE_SOURCE_VALIDATION

  ){

    return true;

  }

  const source =
  getSandboxSource(
    callback
  );

  const valid =
  validateSandboxSource(
    source
  );

  if(!valid){

    sandboxState
    .blockedExecutions++;

    logSandboxEvent(
      "SANDBOX EXECUTION BLOCKED"
    );

    return false;

  }

  return true;

}



// =====================================
// CREATE TIMEOUT
// =====================================

function createSandboxTimeout(
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

      SANDBOX_CONFIG
      .MAX_TIMEOUT

    )

    :

    SANDBOX_CONFIG
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
          "SANDBOX_TIMEOUT"
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

function createSandboxExecutionResult(
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

    SANDBOX_CONFIG
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
// EXECUTE IN SANDBOX
// =====================================

async function executeInSandbox(
  callback,
  options = {}
){

  if(
    !validateSandboxExecution(
      callback
    )
  ){

    return createSandboxExecutionResult({

      success:false,

      blocked:true

    });

  }

  if(

    sandboxState
    .activeExecutions
    .size >=

    SANDBOX_CONFIG
    .MAX_CONCURRENT_EXECUTIONS

  ){

    sandboxState
    .blockedExecutions++;

    return createSandboxExecutionResult({

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
      "sandbox"
    )

    :

    `sandbox_${Date.now()}`;

  const startedAt =
  Date.now();

  sandboxState
  .lastExecutionAt =
  startedAt;

  const controller =
  new AbortController();

  const timeoutController =
  createSandboxTimeout(

    options.timeout,

    controller

  );

  sandboxState
  .activeExecutions
  .set(

    executionId,

    {

      startedAt,

      controller,

      timeout:

        options.timeout ||

        SANDBOX_CONFIG
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
          "SANDBOX_ABORTED"
        );

      }

      if(

        !SANDBOX_CONFIG
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

    sandboxState
    .completedExecutions++;

    return createSandboxExecutionResult({

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
      "SANDBOX_TIMEOUT";

    const aborted =

      message ===
      "SANDBOX_ABORTED";

    if(
      timedOut
    ){

      sandboxState
      .timeoutExecutions++;

    }

    else if(
      aborted
    ){

      sandboxState
      .abortedExecutions++;

    }

    else{

      sandboxState
      .failedExecutions++;

    }

    logSandboxEvent(

      "SANDBOX EXECUTION FAILED",

      {

        executionId,

        timedOut,

        aborted

      }

    );

    return createSandboxExecutionResult({

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

    sandboxState
    .activeExecutions
    .delete(
      executionId
    );

  }

}



// =====================================
// DIAGNOSTICS
// =====================================

function getSandboxDiagnostics(){

  return Object.freeze({

    activeExecutions:

      sandboxState
      .activeExecutions
      .size,

    completedExecutions:

      sandboxState
      .completedExecutions,

    failedExecutions:

      sandboxState
      .failedExecutions,

    timeoutExecutions:

      sandboxState
      .timeoutExecutions,

    blockedExecutions:

      sandboxState
      .blockedExecutions,

    abortedExecutions:

      sandboxState
      .abortedExecutions,

    lastExecutionAt:

      sandboxState
      .lastExecutionAt

  });

}



// =====================================
// RESET
// =====================================

function resetSandboxState(){

  sandboxState
  .activeExecutions
  .forEach((execution) => {

    try{

      execution
      .controller
      ?.abort();

    }

    catch(error){}

  });

  sandboxState
  .activeExecutions
  .clear();

  sandboxState
  .completedExecutions =
  0;

  sandboxState
  .failedExecutions =
  0;

  sandboxState
  .timeoutExecutions =
  0;

  sandboxState
  .blockedExecutions =
  0;

  sandboxState
  .abortedExecutions =
  0;

  sandboxState
  .lastExecutionAt =
  null;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SecuritySandbox =
Object.freeze({

  execute:
  executeInSandbox,

  diagnostics:
  getSandboxDiagnostics,

  reset:
  resetSandboxState

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

    "SecuritySandbox",

    {

      value:
      SecuritySandbox,

      writable:
      false,

      configurable:
      false

    }

  );

}
