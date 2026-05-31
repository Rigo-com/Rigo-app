// =====================================
// RIGO AI
// AGENT STATE
// =====================================

export const agentManagerState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  startupPromise:null,

  agents:
  new Map(),

  activeAgents:
  new Set(),

  failedAgents:
  new Set(),

  executionLocks:
  new Map(),

  taskQueue:
  [],

  queueProcessing:
  false,

  healthcheckTimer:
  null,

  diagnostics:{

    created:0,

    initialized:0,

    running:0,

    failed:0,

    terminated:0,

    tasksExecuted:0,

    retries:0,

    queued:0,

    aborted:0

  },

  lastAgentCreatedAt:
  null

});
