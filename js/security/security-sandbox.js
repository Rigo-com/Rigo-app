// =====================================
// RIGO AI
// SECURITY SANDBOX
// ENTERPRISE ISOLATED EXECUTION LAYER
// =====================================



// =====================================
// SANDBOX CONFIG
// =====================================

const SANDBOX_CONFIG =
Object.freeze({

  DEFAULT_TIMEOUT:5000,

  MAX_TIMEOUT:30000,

  ENABLE_EVAL_BLOCKING:true,

  ENABLE_FUNCTION_BLOCKING:true,

  ENABLE_ASYNC_EXECUTION:true,

  ENABLE_RESULT_FREEZE:true,

  ENABLE_SOURCE_VALIDATION:true,

  MAX_SOURCE_LENGTH:50000

});



// =====================================
// SANDBOX STATE
// =====================================

const sandboxState =
Object.seal({

  activeExecutions:
  new Map(),

  completedExecutions:0,

  failedExecutions:0,

  timeoutExecutions:0,

  blockedExecutions:0,

  lastExecutionAt:null

});



// =====================================
// VALIDATE SANDBOX CALLBACK
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
// GET SANDBOX SOURCE
// =====================================

function getSandboxSource(
  callback
){

  try{

    return safeString(

      callback
      .toString()

    );

  }

  catch(error){

    return "";

  }

}



// =====================================
// VALIDATE SANDBOX EXECUTION
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

  if(!source){

    return false;

  }

  if(

    source.length >

    SANDBOX_CONFIG
    .MAX_SOURCE_LENGTH

  ){

    sandboxState
    .blockedExecutions++;

    logSecurityEvent(

      "SANDBOX SOURCE TOO LARGE"

    );

    return false;

  }

  if(

    SANDBOX_CONFIG
    .ENABLE_EVAL_BLOCKING

    &&

    (

      source.includes(
        "eval("
      )

      ||

      source.includes(
        "globalThis.eval"
      )

    )

  ){

    sandboxState
    .blockedExecutions++;

    logSecurityEvent(

      "SANDBOX EVAL BLOCKED"

    );

    return false;

  }

  if(

    SANDBOX_CONFIG
    .ENABLE_FUNCTION_BLOCKING

    &&

    (

      source.includes(
        "Function("
      )

      ||

      source.includes(
        "new Function"
      )

    )

  ){

    sandboxState
    .blockedExecutions++;

    logSecurityEvent(

      "SANDBOX FUNCTION BLOCKED"

    );

    return false;

  }

  return true;

}



// =====================================
// CREATE SANDBOX TIMEOUT
// =====================================

function createSandboxTimeout(
  timeout
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

        timeoutId = null;

      }

    }

  };

}



// =====================================
// CREATE EXECUTION RESULT
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

    executionId:
    payload.executionId || null,

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
      ? safeString(
          payload.error
        )
      : null

  };

  if(

    SANDBOX_CONFIG
    .ENABLE_RESULT_FREEZE

  ){

    return deepFreezeSecurity(
      result
    );

  }

  return result;

}



// =====================================
// SANDBOX EXECUTION
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

  const executionId =

    typeof generateSecureRandomId ===
    "function"

    ?

    generateSecureRandomId()

    :

    `sandbox_${Date.now()}`;

  const startedAt =
  Date.now();

  sandboxState
  .lastExecutionAt =
  startedAt;

  const timeoutController =
  createSandboxTimeout(
    options.timeout
  );

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

  let completed =
  false;

  try{

    const executionPromise =
    Promise.resolve()
    .then(async() => {

      if(

        !SANDBOX_CONFIG
        .ENABLE_ASYNC_EXECUTION

      ){

        return callback();

      }

      return await callback();

    });

    const result =
    await Promise.race([

      executionPromise,

      timeoutController
      .promise

    ]);

    completed = true;

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

    const timedOut =

      error?.message ===
      "SANDBOX_TIMEOUT";

    if(
      timedOut
    ){

      sandboxState
      .timeoutExecutions++;

    }

    else{

      sandboxState
      .failedExecutions++;

    }

    logSecurityEvent(

      "SANDBOX EXECUTION FAILED",

      {

        executionId,

        timedOut,

        message:

          safeString(
            error?.message
          )

      }

    );

    return createSandboxExecutionResult({

      success:false,

      executionId,

      duration:

        Date.now() -
        startedAt,

      timedOut,

      error:
      error?.message

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

    if(!completed){

      logSecurityEvent(

        "SANDBOX EXECUTION INCOMPLETE",

        {

          executionId

        }

      );

    }

  }

}



// =====================================
// SANDBOX DIAGNOSTICS
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

    lastExecutionAt:
    sandboxState
    .lastExecutionAt

  });

}



// =====================================
// RESET SANDBOX
// =====================================

function resetSandboxState(){

  sandboxState
  .activeExecutions
  .clear();

  sandboxState
  .completedExecutions = 0;

  sandboxState
  .failedExecutions = 0;

  sandboxState
  .timeoutExecutions = 0;

  sandboxState
  .blockedExecutions = 0;

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
