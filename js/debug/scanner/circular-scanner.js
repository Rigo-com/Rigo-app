// =====================================
// RIGO AI
// CIRCULAR SCANNER
// =====================================

const circularScannerState =
Object.seal({

  scanned: 0,

  circularFound: 0,

  passed: 0,

  failed: 0,

  lastScan: null

});



// =====================================
// DETECT CIRCULAR
// =====================================

function detectCircularDependencies(

  dependencyGraph = {}

){

  const visited =
  new Set();

  const recursionStack =
  new Set();

  const cycles = [];



  function walk(node){

    if(
      recursionStack
      .has(node)
    ){

      cycles.push(
        node
      );

      return true;

    }

    if(
      visited
      .has(node)
    ){

      return false;

    }

    visited.add(
      node
    );

    recursionStack.add(
      node
    );

    const dependencies =

      dependencyGraph[
        node
      ] || [];

    for(
      const dependency
      of dependencies
    ){

      walk(
        dependency
      );

    }

    recursionStack
    .delete(node);

    return false;

  }



  for(
    const node
    of Object.keys(
      dependencyGraph
    )
  ){

    walk(node);

  }

  return cycles;

}



// =====================================
// SCAN
// =====================================

function scanCircularDependencies(

  dependencyGraph = {}

){

  const cycles =

    detectCircularDependencies(
      dependencyGraph
    );

  circularScannerState
  .scanned++;

  circularScannerState
  .lastScan =
  Date.now();

  if(
    cycles.length
  ){

    circularScannerState
    .failed++;

    circularScannerState
    .circularFound +=
    cycles.length;

    return {

      status:
      "FAIL",

      cycles,

      timestamp:
      Date.now()

    };

  }

  circularScannerState
  .passed++;

  return {

    status:
    "PASS",

    cycles:[],

    timestamp:
    Date.now()

  };

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    ...circularScannerState

  };

}



// =====================================
// API
// =====================================

export const CircularScanner =
Object.freeze({

  scan:
  scanCircularDependencies,

  detect:
  detectCircularDependencies,

  snapshot

});



export default
CircularScanner;
