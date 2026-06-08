// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

import Diagnostics
from "../diagnostics/index.js";


const moduleScannerState =
Object.seal({

  scanned: 0,

  passed: 0,

  failed: 0,

  lastScan: null

});



// =====================================
// SCAN MODULE
// =====================================

async function scanModule(
  modulePath
){

  const result = {

    module:
    modulePath,

    status:
    "UNKNOWN",

    error:
    null,

    timestamp:
    Date.now()

  };

  try{

    await import(
      modulePath
    );

    result.status =
    "PASS";

    moduleScannerState
    .passed++;

    Diagnostics.recordEvent(
  "module:passed",
  {
    module:
    modulePath
  }
);
    
  }

  catch(error){

    result.status =
    "FAIL";

    result.error = {

      name:
      error?.name,

      message:
      error?.message,

      stack:
      error?.stack

    };

    moduleScannerState
    .failed++;

    Diagnostics.addError(
  error?.message ||
  `Module Scan Failed: ${modulePath}`
);

Diagnostics.recordEvent(
  "module:failed",
  {
    module:
    modulePath,

    error:
    error?.message
  }
);
    
  }

  moduleScannerState
  .scanned++;

  moduleScannerState
  .lastScan =
  Date.now();

  return result;

}



// =====================================
// SCAN MANY
// =====================================

async function scanModules(
  modules = []
){

  const results = [];

  for(
    const modulePath
    of modules
  ){

    results.push(

      await scanModule(
        modulePath
      )

    );

  }

  return results;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return Object.freeze({

  scanned:
  moduleScannerState
  .scanned,

  passed:
  moduleScannerState
  .passed,

  failed:
  moduleScannerState
  .failed,

  lastScan:
  moduleScannerState
  .lastScan,

  successRate:

    moduleScannerState.scanned > 0

    ?

    Math.round(

      (
        moduleScannerState.passed /
        moduleScannerState.scanned
      ) * 100

    )

    :

    0,

  timestamp:
  Date.now()

});



// =====================================
// API
// =====================================

export const ModuleScanner =
Object.freeze({

  scan:
  scanModule,

  scanMany:
  scanModules,

  snapshot

});



export default
ModuleScanner;
