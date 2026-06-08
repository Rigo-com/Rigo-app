// =====================================
// RIGO AI
// SYNTAX SCANNER
// =====================================

import Diagnostics
from "../diagnostics/index.js";



const syntaxScannerState =
Object.seal({

  scanned: 0,

  passed: 0,

  failed: 0,

  lastScan: null

});



// =====================================
// SCAN SYNTAX
// =====================================

function scanSyntax(
  sourceCode = ""
){

  const result = {

    status:
    "PASS",

    issues: [],

    timestamp:
    Date.now()

  };

  try{

    new Function(
      sourceCode
    );

    syntaxScannerState
    .passed++;

    Diagnostics.recordEvent(
    "syntax:passed"
  );
    
  }

  catch(error){

    result.status =
    "FAIL";

    result.issues.push({

      type:
      error?.name,

      message:
      error?.message,

      stack:
      error?.stack

    });

    syntaxScannerState
    .failed++;

    Diagnostics.addError(
  error?.message ||
  "Syntax Error"
);

Diagnostics.recordEvent(
  "syntax:failed",
  {

    type:
    error?.name,

    message:
    error?.message

  }
);
    
  }

  syntaxScannerState
  .scanned++;

  syntaxScannerState
  .lastScan =
  Date.now();

  return result;

}



// =====================================
// SCAN MANY
// =====================================

function scanMultipleSyntax(

  files = []

){

  const results = [];

  for(
    const sourceCode
    of files
  ){

    results.push(

      scanSyntax(
        sourceCode
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
    syntaxScannerState
    .scanned,

    passed:
    syntaxScannerState
    .passed,

    failed:
    syntaxScannerState
    .failed,

    lastScan:
    syntaxScannerState
    .lastScan,

    successRate:

      syntaxScannerState.scanned > 0

      ?

      Math.round(

        (
          syntaxScannerState.passed /
          syntaxScannerState.scanned
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

export const SyntaxScanner =
Object.freeze({

  scan:
  scanSyntax,

  scanMany:
  scanMultipleSyntax,

  snapshot

});



export default
SyntaxScanner;
