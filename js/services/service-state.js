// =====================================
// RIGO AI
// SERVICE STATE
// RUNTIME STATE ONLY
// =====================================



// =====================================
// INTERNAL STATE
// =====================================

const serviceState =
Object.seal({

  initialized:false,

  synchronized:false,

  booted:false,

  startedAt:null,

  stoppedAt:null,

  diagnostics:
  Object.seal({

    registered:0,

    started:0,

    failed:0

  })

});



// =====================================
// SNAPSHOT
// =====================================

function createServiceStateSnapshot(){

  return Object.freeze({

    initialized:
    serviceState
    .initialized,

    synchronized:
    serviceState
    .synchronized,

    booted:
    serviceState
    .booted,

    startedAt:
    serviceState
    .startedAt,

    stoppedAt:
    serviceState
    .stoppedAt,

    diagnostics:
    {

      ...serviceState
      .diagnostics

    },

    timestamp:
    Date.now()

  });

}



// =====================================
// RESET
// =====================================

function resetServiceState(){

  serviceState
  .initialized =
  false;

  serviceState
  .synchronized =
  false;

  serviceState
  .booted =
  false;

  serviceState
  .startedAt =
  null;

  serviceState
  .stoppedAt =
  null;

  serviceState
  .diagnostics
  .registered = 0;

  serviceState
  .diagnostics
  .started = 0;

  serviceState
  .diagnostics
  .failed = 0;

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  serviceState,

  createServiceStateSnapshot,

  resetServiceState

};

export default
serviceState;
