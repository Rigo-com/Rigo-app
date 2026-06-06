// =====================================
// RIGO AI
// RUNTIME SCANNER
// =====================================

const runtimeScannerState =
Object.seal({

  initialized:
  false,

  monitoring:
  false,

  runtimeErrors:
  [],

  promiseRejections:
  [],

  crashes:
  [],

  startedAt:
  null,

  lastError:
  null,

  diagnostics:{

    errors:0,

    rejections:0,

    crashes:0

  }

});



// =====================================
// ERROR HANDLER
// =====================================

function handleRuntimeError(
  event
){

  const error = {

    type:
    "runtime-error",

    message:
    event?.message,

    filename:
    event?.filename,

    line:
    event?.lineno,

    column:
    event?.colno,

    stack:
    event?.error?.stack,

    timestamp:
    Date.now()

  };

  runtimeScannerState
  .runtimeErrors
  .push(error);

  runtimeScannerState
  .lastError =
  error;

  runtimeScannerState
  .diagnostics
  .errors++;

}



// =====================================
// REJECTION HANDLER
// =====================================

function handlePromiseRejection(
  event
){

  const rejection = {

    type:
    "promise-rejection",

    reason:
    String(
      event?.reason
    ),

    stack:
    event?.reason
    ?.stack,

    timestamp:
    Date.now()

  };

  runtimeScannerState
  .promiseRejections
  .push(
    rejection
  );

  runtimeScannerState
  .lastError =
  rejection;

  runtimeScannerState
  .diagnostics
  .rejections++;

}



// =====================================
// START
// =====================================

function startRuntimeMonitoring(){

  if(
    runtimeScannerState
    .monitoring
  ){

    return true;

  }

  window.addEventListener(

    "error",

    handleRuntimeError

  );

  window.addEventListener(

    "unhandledrejection",

    handlePromiseRejection

  );

  runtimeScannerState
  .initialized =
  true;

  runtimeScannerState
  .monitoring =
  true;

  runtimeScannerState
  .startedAt =
  Date.now();

  return true;

}



// =====================================
// STOP
// =====================================

function stopRuntimeMonitoring(){

  if(
    !runtimeScannerState
    .monitoring
  ){

    return true;

  }

  window.removeEventListener(

    "error",

    handleRuntimeError

  );

  window.removeEventListener(

    "unhandledrejection",

    handlePromiseRejection

  );

  runtimeScannerState
  .monitoring =
  false;

  return true;

}



// =====================================
// REGISTER CRASH
// =====================================

function registerCrash(
  crash
){

  runtimeScannerState
  .crashes
  .push({

    ...crash,

    timestamp:
    Date.now()

  });

  runtimeScannerState
  .diagnostics
  .crashes++;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createRuntimeSnapshot(){

  return Object.freeze({

    initialized:
    runtimeScannerState
    .initialized,

    monitoring:
    runtimeScannerState
    .monitoring,

    runtimeErrors:

    runtimeScannerState
    .runtimeErrors
    .length,

    promiseRejections:

    runtimeScannerState
    .promiseRejections
    .length,

    crashes:

    runtimeScannerState
    .crashes
    .length,

    lastError:
    runtimeScannerState
    .lastError,

    diagnostics:

    structuredClone(

      runtimeScannerState
      .diagnostics

    ),

    timestamp:
    Date.now()

  });

}



// =====================================
// API
// =====================================

export const RuntimeScanner =
Object.freeze({

  start:
  startRuntimeMonitoring,

  stop:
  stopRuntimeMonitoring,

  registerCrash,

  snapshot:
  createRuntimeSnapshot

});



// =====================================
// EXPORTS
// =====================================

export default
RuntimeScanner;
