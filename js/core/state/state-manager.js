// =====================================
// RIGO AI
// STATE MANAGER
// =====================================



// =====================================
// IMPORTS
// =====================================

import STATE_MANAGER_CONFIG
from "./state-config.js";

import {

  cloneStateValue,

  createImmutableState,

  normalizeStatePath

}
from "./state-utils.js";

import {

  storeStateHistory,

  getStateHistory,

  clearStateHistory

}
from "./state-history.js";

import {

  createStateSnapshot,

  getStateSnapshots,

  clearStateSnapshots

}
from "./state-snapshots.js";

import {

  subscribeToState,

  unsubscribeFromState,

  notifyStateSubscribers

}
from "./state-subscribers.js";

import {

  useStateMiddleware,

  executeStateMiddleware

}
from "./state-middleware.js";

import {

  runStateTransaction

}
from "./state-transactions.js";



// =====================================
// EVENTS
// =====================================

const STATE_EVENTS =
Object.freeze({

  INITIALIZED:
  "state.initialized",

  UPDATED:
  "state.updated",

  RESET:
  "state.reset",

  REMOVED:
  "state.removed",

  ROLLBACK:
  "state.rollback",

  SNAPSHOT:
  "state.snapshot"

});



// =====================================
// STATE
// =====================================

const stateManagerState =
Object.seal({

  initialized:false,

  version:1,

  currentState:{},

  subscribers:
  new Set(),

  middleware:
  new Set(),

  history:[],

  snapshots:[],

  activeTransaction:false,

  diagnostics:{

    updates:0,

    removals:0,

    rollbacks:0,

    snapshots:0,

    transactions:0,

    subscribers:0

  },

  lastUpdatedAt:null

});



// =====================================
// GET
// =====================================

function getStateValue(
  path = ""
){

  if(!path){

    return createImmutableState(
      stateManagerState
      .currentState
    );

  }

  const segments =
  normalizeStatePath(path)
  .split(".");

  let currentValue =
  stateManagerState
  .currentState;

  for(
    const segment
    of segments
  ){

    if(
      !currentValue ||
      typeof currentValue !==
      "object"
    ){

      return undefined;

    }

    currentValue =
    currentValue[
      segment
    ];

  }

  return createImmutableState(
    currentValue
  );

}



function getFullState(){

  return getStateValue();

}



function hasStateValue(
  path
){

  return (
    getStateValue(path)
    !== undefined
  );

}



// =====================================
// INTERNAL
// =====================================

function setNestedStateValue(
  target,
  path,
  value
){

  const segments =
  normalizeStatePath(path)
  .split(".");

  const stateCopy =
  cloneStateValue(target);

  let current =
  stateCopy;

  for(
    let i = 0;
    i < segments.length - 1;
    i++
  ){

    const segment =
    segments[i];

    if(
      !current[segment] ||
      typeof current[
        segment
      ] !== "object"
    ){

      current[segment] =
      {};

    }

    current =
    current[segment];

  }

  current[
    segments[
      segments.length - 1
    ]
  ] = value;

  return stateCopy;

}



async function applyStateUpdate(
  nextState,
  context
){

  const middlewareSuccess =
  await executeStateMiddleware(
    stateManagerState,
    context
  );

  if(
    !middlewareSuccess
  ){

    return false;

  }

  storeStateHistory(
    stateManagerState
  );

  stateManagerState
  .currentState =
  nextState;

  stateManagerState
  .version++;

  stateManagerState
  .lastUpdatedAt =
  Date.now();

  createStateSnapshot(
    stateManagerState
  );

  await notifyStateSubscribers(

    stateManagerState,

    context

  );

  return true;

}



// =====================================
// UPDATE
// =====================================

async function updateState(
  path,
  value,
  metadata = {}
){

  const normalizedPath =
  normalizeStatePath(path);

  if(!normalizedPath){

    return false;

  }

  const nextState =
  setNestedStateValue(

    stateManagerState
    .currentState,

    normalizedPath,

    value

  );

  const updated =
  await applyStateUpdate(

    nextState,

    {

      path:
      normalizedPath,

      value,

      metadata,

      timestamp:
      Date.now()

    }

  );

  if(updated){

    stateManagerState
    .diagnostics
    .updates++;

  }

  return updated;

}



// =====================================
// REMOVE
// =====================================

async function removeStateValue(
  path
){

  const normalizedPath =
  normalizeStatePath(path);

  if(!normalizedPath){

    return false;

  }

  const stateCopy =
  cloneStateValue(

    stateManagerState
    .currentState

  );

  const segments =
  normalizedPath
  .split(".");

  let current =
  stateCopy;

  for(
    let i = 0;
    i < segments.length - 1;
    i++
  ){

    current =
    current?.[
      segments[i]
    ];

    if(!current){

      return false;

    }

  }

  delete current[
    segments[
      segments.length - 1
    ]
  ];

  return applyStateUpdate(

    stateCopy,

    {

      path:
      normalizedPath,

      timestamp:
      Date.now()

    }

  );

}



// =====================================
// RESET
// =====================================

async function resetStateManager(){

  stateManagerState
  .currentState = {};

  stateManagerState
  .version = 1;

  stateManagerState
  .lastUpdatedAt = null;

  clearStateHistory(
    stateManagerState
  );

  clearStateSnapshots(
    stateManagerState
  );

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeStateManager(){

  if(
    stateManagerState
    .initialized
  ){

    return true;

  }

  stateManagerState
  .initialized =
  true;

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getStateDiagnostics(){

  return createImmutableState({

    initialized:
    stateManagerState
    .initialized,

    version:
    stateManagerState
    .version,

    subscribers:
    stateManagerState
    .subscribers
    .size,

    middleware:
    stateManagerState
    .middleware
    .size,

    history:
    stateManagerState
    .history
    .length,

    snapshots:
    stateManagerState
    .snapshots
    .length,

    activeTransaction:
    stateManagerState
    .activeTransaction,

    diagnostics:
    stateManagerState
    .diagnostics,

    lastUpdatedAt:
    stateManagerState
    .lastUpdatedAt

  });

}



// =====================================
// API
// =====================================

const StateManager =
Object.freeze({

  initialize:
  initializeStateManager,

  get:
  getStateValue,

  getAll:
  getFullState,

  has:
  hasStateValue,

  update:
  updateState,

  remove:
  removeStateValue,

  reset:
  resetStateManager,

  snapshot(){

    return createStateSnapshot(
      stateManagerState
    );

  },

  history(){

    return getStateHistory(
      stateManagerState
    );

  },

  snapshots(){

    return getStateSnapshots(
      stateManagerState
    );

  },

  transaction(
    callback
  ){

    return runStateTransaction(

      stateManagerState,

      callback,

      {

        get:
        getStateValue,

        set:
        updateState,

        remove:
        removeStateValue

      }

    );

  },

  subscribe(
    subscriber
  ){

    return subscribeToState(
      stateManagerState,
      subscriber
    );

  },

  unsubscribe(
    subscriber
  ){

    return unsubscribeFromState(
      stateManagerState,
      subscriber
    );

  },

  use(
    middleware
  ){

    return useStateMiddleware(
      stateManagerState,
      middleware
    );

  },

  diagnostics:
  getStateDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export default
StateManager;
