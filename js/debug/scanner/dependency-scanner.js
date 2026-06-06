// =====================================
// RIGO AI
// DEPENDENCY SCANNER
// =====================================

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

  return {

    ...dependencyScannerState

  };

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
