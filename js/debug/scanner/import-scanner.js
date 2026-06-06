// =====================================
// RIGO AI
// IMPORT SCANNER
// =====================================

const importScannerState =
Object.seal({

  scanned: 0,

  passed: 0,

  failed: 0,

  lastScan: null

});



// =====================================
// SCAN IMPORT
// =====================================

async function scanImport(
  modulePath
){

  const result = {

    module:
    modulePath,

    status:
    "UNKNOWN",

    issues: [],

    timestamp:
    Date.now()

  };

  try{

    const importedModule =
    await import(
      modulePath
    );

    if(
      !importedModule
    ){

      result.status =
      "FAIL";

      result.issues.push({

        type:
        "EMPTY_MODULE",

        message:
        "Module returned undefined."

      });

      importScannerState
      .failed++;

    }

    else{

      result.status =
      "PASS";

      result.exports =
      Object.keys(
        importedModule
      );

      importScannerState
      .passed++;

    }

  }

  catch(error){

    result.status =
    "FAIL";

    result.issues.push({

      type:
      error?.name ||
      "IMPORT_ERROR",

      message:
      error?.message,

      stack:
      error?.stack

    });

    importScannerState
    .failed++;

  }

  importScannerState
  .scanned++;

  importScannerState
  .lastScan =
  Date.now();

  return result;

}



// =====================================
// SCAN MANY
// =====================================

async function scanImports(
  modules = []
){

  const results = [];

  for(
    const modulePath
    of modules
  ){

    results.push(

      await scanImport(
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

    ...importScannerState

  };

}



// =====================================
// API
// =====================================

export const ImportScanner =
Object.freeze({

  scan:
  scanImport,

  scanMany:
  scanImports,

  snapshot

});



export default
ImportScanner;
