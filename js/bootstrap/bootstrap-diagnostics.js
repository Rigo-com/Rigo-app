// =====================================
// RIGO AI
// BOOTSTRAP DIAGNOSTICS
// =====================================

import {
  bootstrapState
}
from "./bootstrap-state.js";



// =====================================
// DIAGNOSTICS
// =====================================

export function getBootstrapDiagnostics(){

  return Object.freeze({

    initialized:
    bootstrapState
    .initialized,

    booting:
    bootstrapState
    .booting,

    shuttingDown:
    bootstrapState
    .shuttingDown,

    recovering:
    bootstrapState
    .recovering,

    state:
    bootstrapState
    .state,



    initializedSystems:[

      ...bootstrapState
      .initializedSystems

    ],



    failedSystems:[

      ...bootstrapState
      .failedSystems

    ],



    registeredSystems:

      bootstrapState
      .registeredSystems
      .size,



    diagnostics:{

      ...bootstrapState
      .diagnostics

    },



    startedAt:
    bootstrapState
    .startedAt,



    completedAt:
    bootstrapState
    .completedAt,



    lastError:

      bootstrapState
      .lastError

      ?

      String(
        bootstrapState
        .lastError
      )

      :

      null,



    timestamp:
    Date.now()

  });

}



// =====================================
// SNAPSHOT
// =====================================

export function createBootstrapSnapshot(){

  return Object.freeze({

    ...getBootstrapDiagnostics()

  });

}
