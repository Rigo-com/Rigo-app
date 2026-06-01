// =====================================
// RIGO AI
// AI KERNEL EVENTS
// =====================================

import {
  freezeKernelObject
}
from "./kernel-utils.js";



// =====================================
// SAFE LOG
// =====================================

export async function logKernelError(
  message,
  metadata = {}
){

  try{

    if(
      typeof logDiagnosticError ===
      "function"
    ){

      await logDiagnosticError(
        message,
        metadata
      );

      return;

    }

    console.error(
      message,
      metadata
    );

  }

  catch(error){

    console.error(
      error
    );

  }

}



// =====================================
// EMIT EVENT
// =====================================

export async function emitKernelEvent(
  eventName,
  payload = {}
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      freezeKernelObject({

        source:
        "ai-kernel",

        timestamp:
        Date.now(),

        ...payload

      })

    );

    return true;

  }

  catch(error){

    return false;

  }

}
