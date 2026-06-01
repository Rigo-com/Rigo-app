// =====================================
// RIGO AI
// PLANNER STATE
// =====================================

export const plannerEngineState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  startupPromise:null,

  plans:
  new Map(),

  activePlans:
  new Set(),

  queuedPlans:
  new Set(),

  executionLocks:
  new Set(),

  executionQueue:
  [],

  executionHistory:[],

  completedPlans:
  new Set(),

  failedPlans:
  new Set(),

  diagnostics:
  Object.seal({

    created:0,

    analyzed:0,

    generated:0,

    executed:0,

    completed:0,

    failed:0,

    replans:0,

    rejected:0,

    queued:0,

    terminated:0

  }),

  lastPlanAt:null

});
