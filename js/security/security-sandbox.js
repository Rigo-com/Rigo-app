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

  MAX_SCOPE_KEYS:
  100,

  ENABLE_SOURCE_VALIDATION:
  true,

  ENABLE_RESULT_FREEZE:
  true,

  ENABLE_ASYNC_EXECUTION:
  true,

  ENABLE_SCOPE_FREEZE:
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

  totalExecutions:
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

  "Function(",

  "new Function",

  "document.cookie",

  "localStorage",

  "sessionStorage",

  "indexedDB",

  "window.location",

  "importScripts",

  "XMLHttpRequest",

  "fetch(",

  "WebSocket",

  "navigator.",

  "globalThis.",

  "window.",

  "document.",

  "self."

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
// NORMALIZE SOURCE
// =====================================

function normalizeSandboxSource(
  source
){

  try{

    return String(
      source || ""
    )
    .normalize("NFKC")
    .trim();

  }

  catch(error){

    return "";

  }

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

    return normalizeSandboxSource(
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

      "SANDBOX_EXECUTION_BLOCKED"

    );

    return false;

  }

  return true;

}



// =====================================
// CREATE EXECUTION SCOPE
// =====================================

function createSandboxScope(
  scope = {}
){

  if(

    !scope ||

    typeof scope !==
    "object"

  ){

    return Object.freeze({});

  }

  const entries =
  Object.entries(scope)
  .slice(

    0,

    SANDBOX_CONFIG
    .MAX_SCOPE_KEYS

  );

  const cleanScope =
  Object.create(null);

  entries.forEach(([key,value]) => {

    cleanScope[key] = value;

  });

  if(

    SANDBOX_CONFIG
    .ENABLE_SCOPE_FREEZE

    &&

    typeof deepFreezeSecurity ===
    "function"

  ){

    return deepFreezeSecurity(
      cleanScope
    );

  }

  return Object.freeze(
    cleanScope
  );

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

      normalizeSandboxSource(
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
// EXECUTE SANDBOX TASK
// =====================================

async function executeSandboxTask(
  callback,
  context
){

  if(
    context.signal.aborted
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
      context
    );

  }

  return await callback(
    context
  );

}



// =====================================
// EXECUTE IN SANDBOX
// =====================================

async function executeInSandbox(
  callback,
  options = {}
){

  sandboxState
  .totalExecutions++;

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

  const executionContext =
  Object.freeze({

    signal:
    controller.signal,

    scope:
    createSandboxScope(
      options.scope
    ),

    executionId

  });

  sandboxState
  .activeExecutions
  .set(

    executionId,

    {

      startedAt,

      timeout:

        options.timeout ||

        SANDBOX_CONFIG
        .DEFAULT_TIMEOUT

    }

  );

  try{

    const executionPromise =
    Promise.resolve()
    .then(() => {

      return executeSandboxTask(

        callback,

        executionContext

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
    normalizeSandboxSource(
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

      "SANDBOX_EXECUTION_FAILED",

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

    totalExecutions:

      sandboxState
      .totalExecutions,

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
  .totalExecutions =
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
// EXPORTS
// =====================================

export {

  SANDBOX_CONFIG,

  sandboxState,

  BLOCKED_SANDBOX_PATTERNS,

  logSandboxEvent,

  normalizeSandboxSource,

  validateSandboxCallback,

  getSandboxSource,

  validateSandboxSource,

  validateSandboxExecution,

  createSandboxScope,

  createSandboxTimeout,

  createSandboxExecutionResult,

  executeSandboxTask,

  executeInSandbox,

  getSandboxDiagnostics,

  resetSandboxState,

  SecuritySandbox

};



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

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
