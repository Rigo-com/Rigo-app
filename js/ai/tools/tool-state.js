// =====================================
// RIGO AI
// TOOL EXECUTOR STATE 
// =====================================

export const toolExecutorState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  startupPromise:null,

  queueProcessorPromise:null,

  processing:false,

  tools:
  new Map(),

  toolIndex:
  new Map(),

  executionQueue:[],

  activeExecutions:
  new Map(),

  executionHistory:[],

  permissionCache:
  new Map(),

  disabledTools:
  new Set(),

  circuitBreakers:
  new Map(),

  diagnostics:
  object.seal({
    registered:0,

    executed:0,

    failed:0,

    retries:0,

    rejected:0,

    queued:0,

    timedOut:0,

    cancelled:0,

    sandboxed:0,

    disabled:0,

    enabled:0

  }),

  lastExecutionAt:null

});
