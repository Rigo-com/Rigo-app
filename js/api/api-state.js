// =====================================
// RIGO AI
// API STATE
// =====================================

const apiRuntimeState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  startupPromise:null,

  status:"idle",

  pendingRequests:0,

  lastError:null,

  lastRequestAt:null,

  activeRequests:
  new Map(),

  abortControllers:
  new Map(),

  uploads:
  new Map(),

  requestQueue:[],

  processingQueue:false,

  diagnostics:{

    requests:0,

    successful:0,

    failed:0,

    aborted:0,

    uploads:0,

    retries:0,

    queued:0

  }

});

export {

  apiRuntimeState

};
