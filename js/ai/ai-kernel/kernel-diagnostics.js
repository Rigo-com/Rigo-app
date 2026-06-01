// =====================================
// RIGO AI
// AI KERNEL DIAGNOSTICS
// =====================================

import {
  aiKernelState
}
from "./kernel-state.js";

import {
  freezeKernelObject,
  cloneKernelObject
}
from "./kernel-utils.js";



// =====================================
// GET STATE
// =====================================

export function
getAIKernelState(){

  return freezeKernelObject({

    initialized:
    aiKernelState
    .initialized,

    initializing:
    aiKernelState
    .initializing,

    recovering:
    aiKernelState
    .recovering,

    shuttingDown:
    aiKernelState
    .shuttingDown,

    state:
    aiKernelState
    .state,

    activeRequests:

      aiKernelState
      .activeRequests
      .size,

    queuedRequests:

      aiKernelState
      .requestQueue
      .length,

    synchronizedSystems:[

      ...aiKernelState
      .synchronizedSystems

    ],

    failedSystems:[

      ...aiKernelState
      .failedSystems

    ],

    diagnostics:
    cloneKernelObject(

      aiKernelState
      .diagnostics

    )

  });

}



// =====================================
// GET DIAGNOSTICS
// =====================================

export function
getAIKernelDiagnostics(){

  return freezeKernelObject({

    uptime:

      aiKernelState
      .startedAt

      ?

      Date.now() -

      aiKernelState
      .startedAt

      :

      0,

    state:
    aiKernelState
    .state,

    activeRequests:

      aiKernelState
      .activeRequests
      .size,

    queuedRequests:

      aiKernelState
      .requestQueue
      .length,

    completedRequests:

      aiKernelState
      .completedRequests
      .length,

    failedRequests:

      aiKernelState
      .failedRequests
      .length,

    diagnostics:
    cloneKernelObject(

      aiKernelState
      .diagnostics

    )

  });

}
