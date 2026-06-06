// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

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

  return {

    ...moduleScannerState

  };

}



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
