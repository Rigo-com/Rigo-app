// =====================================
// RIGO AI
// COMMUNICATION ABORT
// ABORT CONTROLLER LAYER
// =====================================

import {

  registerAbortController,

  getAbortController,

  removeAbortController

}
from "./communication-state.js";

import {
  COMMUNICATION_EVENTS
}
from "./communication-config.js";

import {
  emit
}
from "../chat-events/chat-events.js";



// =====================================
// CREATE CONTROLLER
// =====================================

function createAbortController(
  requestId
){

  if(
    !requestId
  ){
    return null;
  }

  const controller =
  new AbortController();

  registerAbortController(

    requestId,

    controller

  );

  return controller;

}



// =====================================
// GET CONTROLLER
// =====================================

function getController(
  requestId
){

  return getAbortController(
    requestId
  );

}



// =====================================
// ABORT REQUEST
// =====================================

function abortRequest(
  requestId
){

  const controller =

    getAbortController(
      requestId
    );

  if(
    !controller
  ){
    return false;
  }

  try{

    controller.abort();

  }

  catch(error){

    return false;

  }

  removeAbortController(
    requestId
  );

  emit(

    COMMUNICATION_EVENTS
    .REQUEST_ABORTED,

    {

      requestId

    }

  );

  return true;

}



// =====================================
// ABORT ALL
// =====================================

function abortAllRequests(){

  const controllers =

    Array.from(

      communicationState
      .abortControllers
      .keys()

    );

  for(
    const requestId
    of controllers
  ){

    abortRequest(
      requestId
    );

  }

  return true;

}



// =====================================
// CLEANUP
// =====================================

function cleanupAbortController(
  requestId
){

  return removeAbortController(
    requestId
  );

}



// =====================================
// STATUS
// =====================================

function getStatus(){

  return Object.freeze({

    activeControllers:

      communicationState
      .abortControllers
      .size

  });

}



// =====================================
// PUBLIC API
// =====================================

const CommunicationAbort =
Object.freeze({

  createAbortController,

  getController,

  abortRequest,

  abortAllRequests,

  cleanupAbortController,

  status:
  getStatus

});



// =====================================
// EXPORTS
// =====================================

export {

  createAbortController,

  getController,

  abortRequest,

  abortAllRequests,

  cleanupAbortController,

  getStatus,

  CommunicationAbort

};

export default
CommunicationAbort;
