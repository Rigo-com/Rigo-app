const MAX_NETWORK_EVENTS=250;
const networkMonitorState=Object.seal({
  active:false,
  online:typeof navigator!=="undefined"?Boolean(navigator.onLine):true,
  events:[],
  lastEvent:null,
  diagnostics:{online:0,offline:0}
});

function recordNetworkEvent(type){
  const event={type,timestamp:Date.now()};
  networkMonitorState.events.push(event);
  if(networkMonitorState.events.length>MAX_NETWORK_EVENTS){
    networkMonitorState.events.splice(0,networkMonitorState.events.length-MAX_NETWORK_EVENTS);
  }
  networkMonitorState.lastEvent=event;
  if(type==="online")networkMonitorState.diagnostics.online++;
  if(type==="offline")networkMonitorState.diagnostics.offline++;
  return event;
}

function handleOnline(){networkMonitorState.online=true;recordNetworkEvent("online");}
function handleOffline(){networkMonitorState.online=false;recordNetworkEvent("offline");}

function startNetworkMonitor(){
  if(networkMonitorState.active)return true;
  if(typeof navigator!=="undefined")networkMonitorState.online=Boolean(navigator.onLine);
  if(typeof window!=="undefined"&&typeof window.addEventListener==="function"){
    window.addEventListener("online",handleOnline);
    window.addEventListener("offline",handleOffline);
    networkMonitorState.active=true;
    recordNetworkEvent(networkMonitorState.online?"online":"offline");
  }
  return true;
}

function stopNetworkMonitor(){
  if(typeof window!=="undefined"&&typeof window.removeEventListener==="function"){
    window.removeEventListener("online",handleOnline);
    window.removeEventListener("offline",handleOffline);
  }
  networkMonitorState.active=false;
  return true;
}

function snapshot(){
  return Object.freeze({
    active:networkMonitorState.active,
    online:networkMonitorState.online,
    events:networkMonitorState.events.length,
    recentEvents:[...networkMonitorState.events].slice(-25),
    lastEvent:networkMonitorState.lastEvent,
    diagnostics:{...networkMonitorState.diagnostics},
    timestamp:Date.now()
  });
}

export const NetworkMonitor=Object.freeze({start:startNetworkMonitor,stop:stopNetworkMonitor,snapshot});
export default NetworkMonitor;
