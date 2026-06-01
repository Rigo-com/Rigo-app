// =====================================
// RIGO AI
// AI KERNEL REQUESTS
// =====================================

import {
  AI_KERNEL_CONFIG
}
from "./kernel-config.js";

import {
  aiKernelState
}
from "./kernel-state.js";

import {
  cloneKernelObject,
  createKernelRequestId
}
from "./kernel-utils.js";



// =====================================
// SET STATE
// =====================================

export function setKernelState(
  state
){

  aiKernelState.state =
  state;

  return true;

}



// =====================================
// VALIDATE PAYLOAD
// =====================================

export function validateKernelPayload(
  payload
){

  return (

    payload &&

    typeof payload ===
    "object"

  );

}



// =====================================
// CREATE REQUEST
// =====================================

export function createKernelRequest(
  payload = {}
){

  const controller =

    AI_KERNEL_CONFIG
    .ENABLE_ABORT_CONTROLLER

    ?

    new AbortController()

    :

    null;

  return {

    id:
    createKernelRequestId(),

    type:
    String(
      payload.type ||
      "generic"
    ),

    input:
    cloneKernelObject(
      payload.input || {}
    ),

    metadata:
    cloneKernelObject(
      payload.metadata || {}
    ),

    runtime:{

      retries:0,

      contextInjected:false,

      startedAt:null,

      completedAt:null,

      queuedAt:null,

      controller,

      signal:
      controller?.signal || null

    },

    priority:

      Number.isFinite(
        payload.priority
      )

      ?

      payload.priority

      :

      1,

    createdAt:
    Date.now()

  };

}
