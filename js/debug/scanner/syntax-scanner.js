// =====================================
// RIGO AI
// SYNTAX SCANNER
// =====================================

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

  return {

    ...syntaxScannerState

  };

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
