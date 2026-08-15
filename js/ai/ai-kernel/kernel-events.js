// =====================================
// RIGO AI
// AI KERNEL EVENTS
// =====================================

import {
  freezeKernelObject
}
from "./kernel-utils.js";

import ServiceManager
from "../../services/service-manager.js";



// =====================================
// SAFE LOG
// =====================================

export async function logKernelError(
  message,
  metadata = {}
){

  try{

    const events =
    await ServiceManager.resolve(
      "events"
    );

    if(events?.emit){
      await events.emit(
        "ai.kernel.error",
        freezeKernelObject({
          source:"ai-kernel",
          timestamp:Date.now(),
          message,
          ...metadata
        })
      );
      return true;
    }

    console.error(
      message,
      metadata
    );

    return false;

  }

  catch(error){

    console.error(
      error
    );

    return false;

  }

}



// =====================================
// EMIT EVENT
// =====================================

export async function emitKernelEvent(
  eventName,
  payload = {}
){

  try{

    const events =
    await ServiceManager.resolve(
      "events"
    );

    if(!events?.emit){
      return false;
    }

    const emitted =
    await events.emit(

      eventName,

      freezeKernelObject({

        source:
        "ai-kernel",

        timestamp:
        Date.now(),

        ...payload

      })

    );

    return Boolean(emitted);

  }

  catch(error){

    return false;

  }

}
