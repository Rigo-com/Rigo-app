// =====================================
// RIGO AI
// STATE MANAGER
// ENTERPRISE KERNEL FINAL
// =====================================



// =====================================
// STATE CONFIG
// =====================================

const STATE_MANAGER_CONFIG =
Object.freeze({

  MAX_HISTORY:
  500,

  MAX_SNAPSHOTS:
  100,

  MAX_SUBSCRIBERS:
  500,

  ENABLE_HISTORY:true,

  ENABLE_SNAPSHOTS:true,

  ENABLE_MIDDLEWARE:true,

  ENABLE_PERSISTENCE:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_TRANSACTIONS:true,

  ENABLE_ROLLBACKS:true

});



// =====================================
// STATE EVENTS
// =====================================

const STATE_EVENTS =
Object.freeze({

  INITIALIZED:
  "state.initialized",

  UPDATED:
  "state.updated",

  RESET:
  "state.reset",

  ROLLBACK:
  "state.rollback",

  SNAPSHOT:
  "state.snapshot",

  TRANSACTION_START:
  "state.transaction.start",

  TRANSACTION_END:
  "state.transaction.end"

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

  transactionQueue:[],

  diagnostics:{

    updates:0,

    rollbacks:0,

    snapshots:0,

    transactions:0,

    subscribers:0

  },

  lastUpdatedAt:null

});



// =====================================
// SAFE CLONE
// =====================================

function cloneStateValue(
  value,
  visited = new WeakMap()
){

  if(

    value === null ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return visited.get(
      value
    );

  }

  const clone =

    Array.isArray(value)

    ? []

    : {};

  visited.set(
    value,
    clone
  );

  Object.keys(value)
  .forEach((key) => {

    clone[key] =
    cloneStateValue(

      value[key],
      visited

    );

  });

  return clone;

}



// =====================================
// DEEP FREEZE
// =====================================

function freezeStateObject(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezeStateObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



// =====================================
// IMMUTABLE STATE
// =====================================

function createImmutableState(
  value
){

  return freezeStateObject(

    cloneStateValue(
      value
    )

  );

}



// =====================================
// STATE PATH
// =====================================

function normalizeStatePath(
  path
){

  return String(
    path || ""
  )
  .trim();

}



// =====================================
// GET STATE VALUE
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

  const normalizedPath =
  normalizeStatePath(
    path
  );

  const segments =
  normalizedPath.split(
    "."
  );

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



// =====================================
// SET STATE VALUE
// =====================================

function setNestedStateValue(
  target,
  path,
  value
){

  const segments =
  normalizeStatePath(
    path
  )
  .split(".");

  const stateCopy =
  cloneStateValue(
    target
  );

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



// =====================================
// HISTORY
// =====================================

function storeStateHistory(
  stateSnapshot
){

  if(

    !STATE_MANAGER_CONFIG
    .ENABLE_HISTORY

  ){

    return false;

  }

  stateManagerState
  .history
  .push({

    version:
    stateManagerState
    .version,

    state:
    createImmutableState(
      stateSnapshot
    ),

    timestamp:
    Date.now()

  });

  if(

    stateManagerState
    .history
    .length >

    STATE_MANAGER_CONFIG
    .MAX_HISTORY

  ){

    stateManagerState
    .history
    .shift();

  }

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createStateSnapshot(){

  const snapshot =
  createImmutableState({

    version:
    stateManagerState
    .version,

    state:

      stateManagerState
      .currentState,

    timestamp:
    Date.now()

  });

  stateManagerState
  .snapshots
  .push(
    snapshot
  );

  if(

    stateManagerState
    .snapshots
    .length >

    STATE_MANAGER_CONFIG
    .MAX_SNAPSHOTS

  ){

    stateManagerState
    .snapshots
    .shift();

  }

  stateManagerState
  .diagnostics
  .snapshots++;

  return snapshot;

}



// =====================================
// MIDDLEWARE
// =====================================

function useStateMiddleware(
  middleware
){

  if(
    typeof middleware !==
    "function"
  ){

    return false;

  }

  stateManagerState
  .middleware
  .add(
    middleware
  );

  return true;

}



// =====================================
// EXECUTE MIDDLEWARE
// =====================================

async function executeStateMiddleware(
  context
){

  if(

    !STATE_MANAGER_CONFIG
    .ENABLE_MIDDLEWARE

  ){

    return true;

  }

  for(

    const middleware

    of

    stateManagerState
    .middleware

  ){

    try{

      const result =
      await middleware(
        context
      );

      if(
        result === false
      ){

        return false;

      }

    }

    catch(error){

      if(

        typeof logDiagnosticError ===
        "function"

      ){

        logDiagnosticError(

          "STATE MIDDLEWARE FAILED",

          {

            error:
            String(error)

          }

        );

      }

    }

  }

  return true;

}



// =====================================
// SUBSCRIPTIONS
// =====================================

function subscribeToState(
  subscriber
){

  if(
    typeof subscriber !==
    "function"
  ){

    return false;

  }

  if(

    stateManagerState
    .subscribers
    .size >=

    STATE_MANAGER_CONFIG
    .MAX_SUBSCRIBERS

  ){

    return false;

  }

  stateManagerState
  .subscribers
  .add(
    subscriber
  );

  stateManagerState
  .diagnostics
  .subscribers =

    stateManagerState
    .subscribers
    .size;

  return true;

}



function unsubscribeFromState(
  subscriber
){

  const removed =

    stateManagerState
    .subscribers
    .delete(
      subscriber
    );

  stateManagerState
  .diagnostics
  .subscribers =

    stateManagerState
    .subscribers
    .size;

  return removed;

}



// =====================================
// NOTIFY
// =====================================

async function notifyStateSubscribers(
  context
){

  const subscribers = [

    ...stateManagerState
    .subscribers

  ];

  for(
    const subscriber
    of subscribers
  ){

    try{

      await subscriber(
        createImmutableState(
          context
        )
      );

    }

    catch(error){

      if(

        typeof logDiagnosticError ===
        "function"

      ){

        logDiagnosticError(

          "STATE SUBSCRIBER FAILED",

          {

            error:
            String(error)

          }

        );

      }

    }

  }

  return true;

}



// =====================================
// UPDATE STATE
// =====================================

async function updateState(
  path,
  value,
  metadata = {}
){

  const previousState =
  createImmutableState(

    stateManagerState
    .currentState

  );

  const nextState =
  setNestedStateValue(

    stateManagerState
    .currentState,

    path,

    value

  );

  const context = {

    path:
    normalizeStatePath(
      path
    ),

    previousState,

    nextState:
    createImmutableState(
      nextState
    ),

    metadata:
    cloneStateValue(
      metadata
    ),

    timestamp:
    Date.now()

  };

  const middlewareSuccess =
  await executeStateMiddleware(
    context
  );

  if(!middlewareSuccess){

    return false;

  }

  storeStateHistory(
    previousState
  );

  stateManagerState
  .currentState =
  nextState;

  stateManagerState
  .version++;

  stateManagerState
  .lastUpdatedAt =
  Date.now();

  stateManagerState
  .diagnostics
  .updates++;

  if(

    STATE_MANAGER_CONFIG
    .ENABLE_SNAPSHOTS

  ){

    createStateSnapshot();

  }

  await notifyStateSubscribers(
    context
  );

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      STATE_EVENTS.UPDATED,

      {

        path,

        metadata

      }

    );

  }

  return true;

}



// =====================================
// RESET STATE
// =====================================

async function resetStateManager(){

  storeStateHistory(

    stateManagerState
    .currentState

  );

  stateManagerState
  .currentState =
  {};

  stateManagerState
  .version++;

  stateManagerState
  .lastUpdatedAt =
  Date.now();

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(
      STATE_EVENTS.RESET
    );

  }

  return true;

}



// =====================================
// ROLLBACK
// =====================================

async function rollbackState(
  version = null
){

  if(

    !STATE_MANAGER_CONFIG
    .ENABLE_ROLLBACKS

  ){

    return false;

  }

  const history =

    stateManagerState
    .history;

  if(
    history.length <= 0
  ){

    return false;

  }

  let rollbackTarget =
  null;

  if(
    version == null
  ){

    rollbackTarget =

      history[
        history.length - 1
      ];

  }

  else{

    rollbackTarget =
    history.find((entry) => {

      return (
        entry.version ===
        version
      );

    });

  }

  if(!rollbackTarget){

    return false;

  }

  stateManagerState
  .currentState =

    cloneStateValue(
      rollbackTarget.state
    );

  stateManagerState
  .version++;

  stateManagerState
  .diagnostics
  .rollbacks++;

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(

      STATE_EVENTS.ROLLBACK,

      {

        rollbackVersion:
        rollbackTarget
        .version

      }

    );

  }

  return true;

}



// =====================================
// TRANSACTION
// =====================================

async function runStateTransaction(
  callback
){

  if(

    !STATE_MANAGER_CONFIG
    .ENABLE_TRANSACTIONS

  ){

    return callback();

  }

  if(
    stateManagerState
    .activeTransaction
  ){

    return false;

  }

  stateManagerState
  .activeTransaction =
  true;

  stateManagerState
  .diagnostics
  .transactions++;

  try{

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        STATE_EVENTS
        .TRANSACTION_START

      );

    }

    const result =
    await callback({

      get:getStateValue,

      set:updateState

    });

    if(
      typeof emitSystemEvent ===
      "function"
    ){

      await emitSystemEvent(

        STATE_EVENTS
        .TRANSACTION_END

      );

    }

    return result;

  }

  finally{

    stateManagerState
    .activeTransaction =
    false;

  }

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

  if(
    typeof emitSystemEvent ===
    "function"
  ){

    await emitSystemEvent(
      STATE_EVENTS
      .INITIALIZED
    );

  }

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const StateManager =
Object.freeze({

  initialize:
  initializeStateManager,

  get:
  getStateValue,

  update:
  updateState,

  reset:
  resetStateManager,

  rollback:
  rollbackState,

  snapshot:
  createStateSnapshot,

  transaction:
  runStateTransaction,

  subscribe:
  subscribeToState,

  unsubscribe:
  unsubscribeFromState,

  use:
  useStateMiddleware,

  diagnostics:
  getStateDiagnostics

});
