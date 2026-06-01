// =====================================
// RIGO AI
// WORKFLOW STATE
// =====================================

export const workflowEngineState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  startupPromise:null,

  workflows:
  new Map(),

  activeWorkflows:
  new Set(),

  executionLocks:
  new Set(),

  executionQueue:
  [],

  queuedWorkflowIds:
  new Set(),

  executionHistory:[],

  completedWorkflows:
  new Set(),

  failedWorkflows:
  new Set(),

  diagnostics:{

    created:0,

    started:0,

    completed:0,

    failed:0,

    terminated:0,

    executedSteps:0,

    retries:0,

    queued:0,

    rejected:0

  },

  lastWorkflowAt:null

});
