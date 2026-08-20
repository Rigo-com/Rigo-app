// =====================================
// RIGO AI
// API STATE
// =====================================

const apiState =
Object.seal({

  initialized:false,

  pendingRequests:0,

  activeRequests:
  new Map(),

  abortControllers:
  new Map(),

  uploads:
  new Map(),

  lastRequestAt:null,

  lastError:null,

  diagnostics:{

    requests:0,

    successful:0,

    failed:0,

    aborted:0,

    uploads:0,

    uploadFailures:0,

    retries:0

  }

});

export {

  apiState

};
