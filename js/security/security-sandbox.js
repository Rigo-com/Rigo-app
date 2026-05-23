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

  ENABLE_ASYNC_EXECUTION:true

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

  blockedExecutions:0

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

  const source =
  safeString(

    callback
    .toString()

  );

  if(

    SANDBOX_CONFIG
    .ENABLE_EVAL_BLOCKING

    &&

    source.includes(
      "eval("
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

    source.includes(
      "Function("
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

      }

    }

  };

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

    return deepFreezeSecurity({

      success:false,

      blocked:true

    });

  }

  const executionId =
  generateSecureRandomId();

  const startedAt =
  Date.now();

  const timeoutController =
  createSandboxTimeout(
    options.timeout
  );

  sandboxState
  .activeExecutions
  .set(
    executionId,

    {

      startedAt

    }

  );

  let completed =
  false;

  try{

    const executionPromise =
    Promise.resolve()
    .then(() => {

      return callback();

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

    return deepFreezeSecurity({

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

    return deepFreezeSecurity({

      success:false,

      executionId,

      duration:

        Date.now() -
        startedAt,

      timedOut

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
    .blockedExecutions

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
