// =====================================
// RIGO AI
// DEPENDENCY SCANNER
// =====================================

import Diagnostics
from "../diagnostics/index.js";


const dependencyScannerState =
Object.seal({

  scanned: 0,

  passed: 0,

  failed: 0,

  lastScan: null

});



// =====================================
// CHECK DEPENDENCY
// =====================================

async function checkDependency(
  dependencyPath
){

  const result = {

    dependency:
    dependencyPath,

    status:
    "UNKNOWN",

    error:
    null,

    timestamp:
    Date.now()

  };

  try{

    await import(
      dependencyPath
    );

    result.status =
    "PASS";

    dependencyScannerState
    .passed++;

    Diagnostics.recordEvent(
  "dependency:passed",
  {
    dependency:
    dependencyPath
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

    dependencyScannerState
    .failed++;

    Diagnostics.addError(
  error?.message ||
  `Dependency Check Failed: ${dependencyPath}`
);

Diagnostics.recordEvent(
  "dependency:failed",
  {
    dependency:
    dependencyPath,

    error:
    error?.message
  }
);
    
  }

  dependencyScannerState
  .scanned++;

  dependencyScannerState
  .lastScan =
  Date.now();

  return result;

}



// =====================================
// CHECK MANY
// =====================================

async function checkDependencies(
  dependencies = []
){

  const results = [];

  for(
    const dependency
    of dependencies
  ){

    results.push(

      await checkDependency(
        dependency
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
    dependencyScannerState
    .scanned,

    passed:
    dependencyScannerState
    .passed,

    failed:
    dependencyScannerState
    .failed,

    lastScan:
    dependencyScannerState
    .lastScan,

    successRate:

      dependencyScannerState.scanned > 0

      ?

      Math.round(

        (
          dependencyScannerState.passed /
          dependencyScannerState.scanned
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

export const DependencyScanner =
Object.freeze({

  check:
  checkDependency,

  checkMany:
  checkDependencies,

  snapshot

});



export default
DependencyScanner;
