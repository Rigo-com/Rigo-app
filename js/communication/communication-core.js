// =====================================
// RIGO AI
// COMMUNICATION CORE
// ORCHESTRATION LAYER
// =====================================

import {
  COMMUNICATION_EVENTS
}
from "./communication-config.js";

import {
  emit
}
from "./communication-events.js";

import {
  CommunicationState
}
from "./communication-state.js";



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    CommunicationState
    .snapshot()
    .initialized
  ){
    return true;
  }

  CommunicationState
  .setInitialized(
    true
  );

  emit(
    COMMUNICATION_EVENTS
    .INITIALIZED
  );

  return true;

}



// =====================================
// DESTROY
// =====================================

function destroy(){

  CommunicationState
  .reset();

  emit(
    COMMUNICATION_EVENTS
    .DESTROYED
  );

  return true;

}



// =====================================
// REQUESTS
// =====================================

function startRequest(
  requestId,
  payload = {}
){

  CommunicationState
  .registerRequest(
    requestId,
    payload
  );

  CommunicationState
  .incrementRequests();

  emit(

    COMMUNICATION_EVENTS
    .REQUEST_STARTED,

    {

      requestId,

      payload

    }

  );

  return true;

}



function completeRequest(
  requestId
){

  CommunicationState
  .unregisterRequest(
    requestId
  );

  CommunicationState
  .incrementCompleted();

  emit(

    COMMUNICATION_EVENTS
    .REQUEST_COMPLETED,

    {

      requestId

    }

  );

  return true;

}



function failRequest(
  requestId,
  error = null
){

  CommunicationState
  .unregisterRequest(
    requestId
  );

  CommunicationState
  .incrementFailed();

  emit(

    COMMUNICATION_EVENTS
    .REQUEST_FAILED,

    {

      requestId,

      error

    }

  );

  return true;

}



// =====================================
// HEALTH
// =====================================

function health(){

  return Object.freeze({

    ...CommunicationState
    .snapshot(),

    diagnostics:

    CommunicationState
    .diagnostics()

  });

}



// =====================================
// PUBLIC API
// =====================================

const CommunicationCore =
Object.freeze({

  initialize,

  destroy,

  startRequest,

  completeRequest,

  failRequest,

  health

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  destroy,

  startRequest,

  completeRequest,

  failRequest,

  health,

  CommunicationCore

};

export default
CommunicationCore;
