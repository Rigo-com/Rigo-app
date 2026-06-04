// =====================================
// RIGO AI
// COMMUNICATION STATE
// FOUNDATION STATE LAYER
// =====================================



// =====================================
// COMMUNICATION STATE
// =====================================

const communicationState =
Object.seal({

  initialized:false,

  processing:false,

  streaming:false,

  healthy:true,

  activeRequests:
  new Map(),

  abortControllers:
  new Map(),

  diagnostics:
  Object.seal({

    requests:0,

    completed:0,

    failed:0,

    aborted:0,

    streams:0,

    retries:0,

    cacheHits:0,

    cacheMisses:0

  })

});



// =====================================
// HELPERS
// =====================================

function createSnapshot(){

  return {

    initialized:
    communicationState
    .initialized,

    processing:
    communicationState
    .processing,

    streaming:
    communicationState
    .streaming,

    healthy:
    communicationState
    .healthy,

    activeRequests:

      communicationState
      .activeRequests
      .size,

    abortControllers:

      communicationState
      .abortControllers
      .size,

    diagnostics:{

      ...communicationState
      .diagnostics

    }

  };

}



// =====================================
// FLAGS
// =====================================

function setInitialized(
  value
){

  communicationState
  .initialized =
  Boolean(value);

}



function setProcessing(
  value
){

  communicationState
  .processing =
  Boolean(value);

}



function setStreaming(
  value
){

  communicationState
  .streaming =
  Boolean(value);

}



function setHealthy(
  value
){

  communicationState
  .healthy =
  Boolean(value);

}



// =====================================
// ACTIVE REQUESTS
// =====================================

function registerRequest(
  requestId,
  request
){

  if(
    !requestId
  ){
    return false;
  }

  communicationState
  .activeRequests
  .set(

    requestId,

    request ?? {}

  );

  return true;

}



function unregisterRequest(
  requestId
){

  return communicationState
  .activeRequests
  .delete(
    requestId
  );

}



function getRequest(
  requestId
){

  return (

    communicationState
    .activeRequests
    .get(
      requestId
    )

    ?? null

  );

}



// =====================================
// ABORT CONTROLLERS
// =====================================

function registerAbortController(
  requestId,
  controller
){

  if(
    !requestId
  ){
    return false;
  }

  communicationState
  .abortControllers
  .set(

    requestId,

    controller

  );

  return true;

}



function getAbortController(
  requestId
){

  return (

    communicationState
    .abortControllers
    .get(
      requestId
    )

    ?? null

  );

}



function removeAbortController(
  requestId
){

  return communicationState
  .abortControllers
  .delete(
    requestId
  );

}



// =====================================
// ABORT CONTROLLER READ API
// =====================================

function getAbortControllers(){

  return Array.from(

    communicationState
    .abortControllers
    .entries()

  );

}



function getAbortControllerCount(){

  return (

    communicationState
    .abortControllers
    .size

  );

}



// =====================================
// DIAGNOSTICS
// =====================================

function incrementRequests(){

  communicationState
  .diagnostics
  .requests++;

}



function incrementCompleted(){

  communicationState
  .diagnostics
  .completed++;

}



function incrementFailed(){

  communicationState
  .diagnostics
  .failed++;

}



function incrementAborted(){

  communicationState
  .diagnostics
  .aborted++;

}



function incrementStreams(){

  communicationState
  .diagnostics
  .streams++;

}



function incrementRetries(){

  communicationState
  .diagnostics
  .retries++;

}



function incrementCacheHits(){

  communicationState
  .diagnostics
  .cacheHits++;

}



function incrementCacheMisses(){

  communicationState
  .diagnostics
  .cacheMisses++;

}



// =====================================
// SNAPSHOT
// =====================================

function getCommunicationSnapshot(){

  return Object.freeze(
    createSnapshot()
  );

}



// =====================================
// DIAGNOSTICS SNAPSHOT
// =====================================

function getCommunicationDiagnostics(){

  return Object.freeze({

    ...communicationState
    .diagnostics

  });

}



// =====================================
// RESET
// =====================================

function resetCommunicationState(){

  communicationState
  .initialized = false;

  communicationState
  .processing = false;

  communicationState
  .streaming = false;

  communicationState
  .healthy = true;

  communicationState
  .activeRequests
  .clear();

  communicationState
  .abortControllers
  .clear();

  communicationState
  .diagnostics
  .requests = 0;

  communicationState
  .diagnostics
  .completed = 0;

  communicationState
  .diagnostics
  .failed = 0;

  communicationState
  .diagnostics
  .aborted = 0;

  communicationState
  .diagnostics
  .streams = 0;

  communicationState
  .diagnostics
  .retries = 0;

  communicationState
  .diagnostics
  .cacheHits = 0;

  communicationState
  .diagnostics
  .cacheMisses = 0;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const CommunicationState =
Object.freeze({

  setInitialized,

  setProcessing,

  setStreaming,

  setHealthy,

  registerRequest,

  unregisterRequest,

  getRequest,

  registerAbortController,

  getAbortController,

  removeAbortController,

  getAbortControllers,

  getAbortControllerCount,

  incrementRequests,

  incrementCompleted,

  incrementFailed,

  incrementAborted,

  incrementStreams,

  incrementRetries,

  incrementCacheHits,

  incrementCacheMisses,

  snapshot:
  getCommunicationSnapshot,

  diagnostics:
  getCommunicationDiagnostics,

  reset:
  resetCommunicationState

});



// =====================================
// EXPORTS
// =====================================

export {

  communicationState,

  setInitialized,

  setProcessing,

  setStreaming,

  setHealthy,

  registerRequest,

  unregisterRequest,

  getRequest,

  registerAbortController,

  getAbortController,

  removeAbortController,

  getAbortControllers,

  getAbortControllerCount,

  incrementRequests,

  incrementCompleted,

  incrementFailed,

  incrementAborted,

  incrementStreams,

  incrementRetries,

  incrementCacheHits,

  incrementCacheMisses,

  getCommunicationSnapshot,

  getCommunicationDiagnostics,

  resetCommunicationState,

  CommunicationState

};

export default
CommunicationState;
