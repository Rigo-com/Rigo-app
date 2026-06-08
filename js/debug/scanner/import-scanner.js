// =====================================
// RIGO AI
// IMPORT SCANNER
// =====================================

import Diagnostics
from "../diagnostics/index.js";


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

      Diagnostics.addWarning(
        `Empty Module: ${modulePath}`
    );

      Diagnostics.recordEvent(
        "import:empty-module",
    {
      module:
      modulePath
   }
);

      
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
      
      Diagnostics.recordEvent(
  "import:passed",
  {
    module:
    modulePath,

    exports:
    Object.keys(
      importedModule
    ).length
  }
);

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

    Diagnostics.addError(
  error?.message ||
  `Import Failed: ${modulePath}`
);

Diagnostics.recordEvent(
  "import:failed",
  {
    module:
    modulePath,

    error:
    error?.message
  }
);

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

  return Object.freeze({

    scanned:
    importScannerState
    .scanned,

    passed:
    importScannerState
    .passed,

    failed:
    importScannerState
    .failed,

    lastScan:
    importScannerState
    .lastScan,

    successRate:

      importScannerState.scanned > 0

      ?

      Math.round(

        (
          importScannerState.passed /
          importScannerState.scanned
        ) * 100

      )

      :

      0,

    timestamp:
    Date.now()

  });

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
