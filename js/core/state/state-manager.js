// =====================================
// RIGO AI
// STATE MANAGER
// =====================================



// =====================================
// CONFIG
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

  ENABLE_TRANSACTIONS:true,

  ENABLE_ROLLBACKS:true

});



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
// CLONE
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
// FREEZE
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

  visited.add(value);

  Object.freeze(value);

  Object.values(value)
  .forEach((nestedValue) => {

    freezeStateObject(
      nestedValue,
      visited
    );

  });

  return value;

}



function createImmutableState(
  value
){

  return freezeStateObject(
    cloneStateValue(value)
  );

}



// =====================================
// PATH
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
// SET NESTED
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
  .push(snapshot);

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
  .add(middleware);

  return true;

}



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
      await middleware(context);

      if(
        result === false
      ){

        return false;

      }

    }

    catch(error){}

  }

  return true;

}



// =====================================
// SUBSCRIBERS
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
  .add(subscriber);

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
    .delete(subscriber);

  stateManagerState
  .diagnostics
  .subscribers =

    stateManagerState
    .subscribers
    .size;

  return removed;

}



async function notifyStateSubscribers(
  context
){

  for(

    const subscriber

    of

    stateManagerState
    .subscribers

  ){

    try{

      await subscriber(

        createImmutableState(
          context
        )

      );

    }

    catch(error){}

  }

  return true;

}



// =====================================
// INTERNAL UPDATE
// =====================================

async function applyStateUpdate(
  nextState,
  context,
  eventName
){

  const middlewareSuccess =
  await executeStateMiddleware(
    context
  );

  if(!middlewareSuccess){

    return false;

  }

  storeStateHistory(
    stateManagerState
    .currentState
  );

  stateManagerState
  .currentState =
  nextState;

  stateManagerState
  .version++;

  stateManagerState
  .lastUpdatedAt =
  Date.now();

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
      eventName,
      context
    );

  }

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

  const context = {

    path:
    normalizedPath,

    value:
    createImmutableState(
      value
    ),

    metadata:
    cloneStateValue(
      metadata
    ),

    timestamp:
    Date.now()

  };

  const updated =
  await applyStateUpdate(

    nextState,
    context,
    STATE_EVENTS.UPDATED

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

    if(
      !current
    ){

      return false;

    }

  }

  delete current[
    segments[
      segments.length - 1
    ]
  ];

  const removed =
  await applyStateUpdate(

    stateCopy,

    {
      path:
      normalizedPath,

      timestamp:
      Date.now()
    },

    STATE_EVENTS.REMOVED

  );

  if(removed){

    stateManagerState
    .diagnostics
    .removals++;

  }

  return removed;

}



// =====================================
// RESET
// =====================================

async function resetStateManager(){

  const reset =
  await applyStateUpdate(

    {},

    {
      timestamp:
      Date.now()
    },

    STATE_EVENTS.RESET

  );

  return reset;

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

  const rollbackTarget =

    version == null

    ?

    history[
      history.length - 1
    ]

    :

    history.find((entry) => {

      return (
        entry.version ===
        version
      );

    });

  if(!rollbackTarget){

    return false;

  }

  const rollbacked =
  await applyStateUpdate(

    cloneStateValue(
      rollbackTarget.state
    ),

    {

      rollbackVersion:
      rollbackTarget
      .version,

      timestamp:
      Date.now()

    },

    STATE_EVENTS.ROLLBACK

  );

  if(rollbacked){

    stateManagerState
    .diagnostics
    .rollbacks++;

  }

  return rollbacked;

}



// =====================================
// TRANSACTION
// =====================================

async function runStateTransaction(
  callback
){

  if(
    typeof callback !==
    "function"
  ){

    return false;

  }

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

      get:
      getStateValue,

      set:
      updateState,

      remove:
      removeStateValue

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

  rollback:
  rollbackState,

  snapshot:
  createStateSnapshot,

  history(){

    return createImmutableState(
      stateManagerState
      .history
    );

  },

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



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.StateManager =
  StateManager;

  window.STATE_EVENTS =
  STATE_EVENTS;

  window.STATE_MANAGER_CONFIG =
  STATE_MANAGER_CONFIG;

}
