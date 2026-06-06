// =====================================
// RIGO AI
// DIAGNOSTICS STORAGE
// =====================================

import {
  diagnosticsState
}
from "./diagnostics-state.js";



// =====================================
// STORAGE KEY
// =====================================

const STORAGE_KEY =
"rigo-diagnostics";



// =====================================
// SAVE
// =====================================

function saveDiagnostics(){

  try{

    const data = {

      healthScore:
      diagnosticsState
      .healthScore,

      diagnostics:
      diagnosticsState
      .diagnostics,

      errors:
      diagnosticsState
      .errors,

      warnings:
      diagnosticsState
      .warnings,

      criticalIssues:
      diagnosticsState
      .criticalIssues,

      timestamp:
      Date.now()

    };

    localStorage
    .setItem(

      STORAGE_KEY,

      JSON.stringify(
        data
      )

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// LOAD
// =====================================

function loadDiagnostics(){

  try{

    const raw =

      localStorage
      .getItem(
        STORAGE_KEY
      );

    if(
      !raw
    ){

      return null;

    }

    return JSON.parse(
      raw
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// CLEAR
// =====================================

function clearDiagnostics(){

  try{

    localStorage
    .removeItem(
      STORAGE_KEY
    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// EXPORTS
// =====================================

export {

  saveDiagnostics,

  loadDiagnostics,

  clearDiagnostics

};

export default
Object.freeze({

  saveDiagnostics,

  loadDiagnostics,

  clearDiagnostics

});
