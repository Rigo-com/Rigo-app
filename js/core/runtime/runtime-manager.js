// =====================================
// RIGO AI
// RUNTIME MANAGER
// =====================================



// =====================================
// RUNTIME CONFIG
// =====================================

const RUNTIME_MANAGER_CONFIG =
Object.freeze({

  ENABLE_RECOVERY:true,

  MAX_BOOT_RETRIES:3,

  MAX_RUNTIME_ERRORS:20,

  STARTUP_TIMEOUT:30000,

  SHUTDOWN_TIMEOUT:15000

});



// =====================================
// SAFE EVENT EMITTER
// =====================================

async function emitRuntimeEvent(
  event,
  payload = null
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(
      event,
      payload
    );

    return true;

  }

  catch(error){

    RuntimeHelpers
    ?.addError?.(error);

    return false;

  }

}



// =====================================
// EXECUTE WITH TIMEOUT
// =====================================

async function executeRuntimeOperation({

  operation,
  timeout,
  timeoutMessage

}){

  return Promise.race([

    Promise.resolve(
      operation?.()
    ),

    new Promise((_,reject) => {

      setTimeout(() => {

        reject(
          new Error(
            timeoutMessage
          )
        );

      },timeout);

    })

  ]);

}



// =====================================
// EXECUTE BOOT STEP
// =====================================

async function executeBootStep(
  step
){

  if(
    !RuntimeBootSequence
    ?.validate?.(step)
  ){

    return false;

  }

  try{

    const success =
    await executeRuntimeOperation({

      operation:
      step.initialize,

      timeout:
      step.timeout ||

      RUNTIME_MANAGER_CONFIG
      .STARTUP_TIMEOUT,

      timeoutMessage:
      `BOOT STEP TIMEOUT: ${step.name}`

    });

    if(!success){

      throw new Error(

        `BOOT STEP FAILED: ${step.name}`

      );

    }

    RuntimeState
    ?.incrementMetric?.(
      "synchronizedSystems"
    );

    return true;

  }

  catch(error){

    RuntimeHelpers
    ?.addError?.(error);

    safeLogError?.(

      "BOOT STEP FAILED",

      {

        step:
        step?.name,

        error:
        String(error)

      }

    );

    return false;

  }

}



// =====================================
// BOOT RUNTIME
// =====================================

async function bootRuntimeManager(){

  const snapshot =
  RuntimeState
  ?.get?.();

  if(
    snapshot?.booting
  ){

    return false;

  }

  RuntimeState
  ?.update?.(
    "booting",
    true
  );

  RuntimeState
  ?.update?.(
    "startedAt",
    Date.now()
  );

  RuntimeHelpers
  ?.setState?.(
    RUNTIME_STATES
    .BOOTING
  );

  RuntimeState
  ?.incrementMetric?.(
    "boots"
  );

  await emitRuntimeEvent(
    RUNTIME_EVENTS
    ?.BOOT_STARTED
  );

  try{

    const bootSequence =
    RuntimeBootSequence
    ?.create?.() || [];



    for(
      const step
      of bootSequence
    ){

      if(
        step?.enabled ===
        false
      ){

        continue;

      }

      const success =
      await executeBootStep(
        step
      );

      if(
        !success &&
        step?.critical
      ){

        throw new Error(

          `CRITICAL BOOT FAILURE: ${step.name}`

        );

      }

    }

    RuntimeState
    ?.update?.(
      "bootCompletedAt",
      Date.now()
    );

    RuntimeHelpers
    ?.setState?.(
      RUNTIME_STATES
      .READY
    );

    await emitRuntimeEvent(
      RUNTIME_EVENTS
      ?.BOOT_COMPLETED
    );

    return true;

  }

  catch(error){

    RuntimeHelpers
    ?.addError?.(error);

    RuntimeState
    ?.incrementMetric?.(
      "failures"
    );

    RuntimeHelpers
    ?.setState?.(
      RUNTIME_STATES
      ?.FAILED
    );

    const retries =

      snapshot?.bootRetries || 0;

    if(

      RUNTIME_MANAGER_CONFIG
      .ENABLE_RECOVERY &&

      retries <

      RUNTIME_MANAGER_CONFIG
      .MAX_BOOT_RETRIES

    ){

      RuntimeState
      ?.update?.(

        "bootRetries",
        retries + 1

      );

      return recoverRuntimeManager();

    }

    await emitRuntimeEvent(

      RUNTIME_EVENTS
      ?.BOOT_FAILED,

      {

        error:
        String(error)

      }

    );

    return false;

  }

  finally{

    RuntimeState
    ?.update?.(
      "booting",
      false
    );

  }

}



// =====================================
// RECOVERY
// =====================================

async function recoverRuntimeManager(){

  const snapshot =
  RuntimeState
  ?.get?.();

  if(
    snapshot?.recovering
  ){

    return false;

  }

  RuntimeState
  ?.update?.(
    "recovering",
    true
  );

  RuntimeState
  ?.update?.(
    "lastRecoveryAt",
    Date.now()
  );

  RuntimeHelpers
  ?.setState?.(
    RUNTIME_STATES
    ?.RECOVERING
  );

  RuntimeState
  ?.incrementMetric?.(
    "recoveries"
  );

  await emitRuntimeEvent(
    RUNTIME_EVENTS
    ?.RECOVERY_STARTED
  );

  try{

    await shutdownRuntimeManager();

    const rebooted =
    await bootRuntimeManager();

    if(!rebooted){

      throw new Error(
        "RUNTIME RECOVERY FAILED"
      );

    }

    await emitRuntimeEvent(
      RUNTIME_EVENTS
      ?.RECOVERY_COMPLETED
    );

    return true;

  }

  catch(error){

    RuntimeHelpers
    ?.addError?.(error);

    RuntimeState
    ?.incrementMetric?.(
      "failures"
    );

    return false;

  }

  finally{

    RuntimeState
    ?.update?.(
      "recovering",
      false
    );

  }

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownRuntimeManager(){

  const snapshot =
  RuntimeState
  ?.get?.();

  if(
    snapshot?.shuttingDown
  ){

    return false;

  }

  RuntimeState
  ?.update?.(
    "shuttingDown",
    true
  );

  RuntimeState
  ?.update?.(
    "lastShutdownAt",
    Date.now()
  );

  RuntimeHelpers
  ?.setState?.(
    RUNTIME_STATES
    ?.SHUTTING_DOWN
  );

  RuntimeState
  ?.incrementMetric?.(
    "shutdowns"
  );

  await emitRuntimeEvent(
    RUNTIME_EVENTS
    ?.SHUTDOWN_STARTED
  );

  try{

    RuntimeHelpers
    ?.setState?.(
      RUNTIME_STATES
      ?.IDLE
    );

    await emitRuntimeEvent(
      RUNTIME_EVENTS
      ?.SHUTDOWN_COMPLETED
    );

    return true;

  }

  catch(error){

    RuntimeHelpers
    ?.addError?.(error);

    RuntimeHelpers
    ?.setState?.(
      RUNTIME_STATES
      ?.FAILED
    );

    return false;

  }

  finally{

    RuntimeState
    ?.update?.(
      "shuttingDown",
      false
    );

  }

}



// =====================================
// HEALTH REPORT
// =====================================

function getRuntimeHealthReport(){

  return RuntimeHelpers
  ?.diagnostics?.();

}



// =====================================
// INITIALIZE
// =====================================

async function initializeRuntimeManager(){

  const snapshot =
  RuntimeState
  ?.get?.();

  if(
    snapshot?.initialized
  ){

    return true;

  }

  RuntimeState
  ?.update?.(
    "initialized",
    true
  );

  await emitRuntimeEvent(
    RUNTIME_EVENTS
    ?.INITIALIZED
  );

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const RuntimeManager =
Object.freeze({

  initialize:
  initializeRuntimeManager,

  boot:
  bootRuntimeManager,

  recover:
  recoverRuntimeManager,

  shutdown:
  shutdownRuntimeManager,

  health:
  getRuntimeHealthReport

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.RuntimeManager =
  RuntimeManager;

}
