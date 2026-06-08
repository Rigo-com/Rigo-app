// =====================================
// RIGO AI
// NETWORK MONITOR
// =====================================

const networkMonitorState =
Object.seal({

  active:
  false,

  online:
  navigator.onLine,

  events:[],

  lastEvent:
  null,

  diagnostics:{

    online:0,

    offline:0

  }

});



// =====================================
// RECORD EVENT
// =====================================

function recordNetworkEvent(
  type
){

  const event = {

    type,

    timestamp:
    Date.now()

  };

  networkMonitorState
  .events
  .push(event);

  networkMonitorState
  .lastEvent =
  event;

  if(
    type === "online"
  ){

    networkMonitorState
    .diagnostics
    .online++;

  }

  if(
    type === "offline"
  ){

    networkMonitorState
    .diagnostics
    .offline++;

  }

  return event;

}



// =====================================
// ONLINE
// =====================================

function handleOnline(){

  networkMonitorState
  .online =
  true;

  recordNetworkEvent(
    "online"
  );

}



// =====================================
// OFFLINE
// =====================================

function handleOffline(){

  networkMonitorState
  .online =
  false;

  recordNetworkEvent(
    "offline"
  );

}



// =====================================
// START
// =====================================

function startNetworkMonitor(){

  if(
    networkMonitorState
    .active
  ){

    return true;

  }

  window.addEventListener(
    "online",
    handleOnline
  );

  window.addEventListener(
    "offline",
    handleOffline
  );

  networkMonitorState
  .active =
  true;

  recordNetworkEvent(

  networkMonitorState
  .online

  ?

  "online"

  :

  "offline"

);
  
  return true;

}



// =====================================
// STOP
// =====================================

function stopNetworkMonitor(){

  window.removeEventListener(
    "online",
    handleOnline
  );

  window.removeEventListener(
    "offline",
    handleOffline
  );

  networkMonitorState
  .active =
  false;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return Object.freeze({

    active:
    networkMonitorState
    .active,

    online:
    networkMonitorState
    .online,

    events:

    networkMonitorState
    .events
    .length,

    lastEvent:
    networkMonitorState
    .lastEvent,

    diagnostics:

    structuredClone(

      networkMonitorState
      .diagnostics

    )

  });

}



// =====================================
// API
// =====================================

export const NetworkMonitor =
Object.freeze({

  start:
  startNetworkMonitor,

  stop:
  stopNetworkMonitor,

  snapshot

});



export default
NetworkMonitor;
