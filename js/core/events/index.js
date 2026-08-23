// =====================================
// RIGO AI
// EVENTS INDEX
// =====================================

import SystemEvents
from "./event-manager.js";

import AppEvents
from "./event-app.js";

export * from "./event-types.js";
export * from "./event-manager.js";
export * from "./event-app.js";

function initialize(){
  return SystemEvents.initialize();
}

const boot = initialize;

function shutdown(){
  return true;
}

function reset(){
  return SystemEvents.reset();
}

function snapshot(){
  return Object.freeze({
    system:SystemEvents.diagnostics(),
    timestamp:Date.now()
  });
}

const Events =
Object.freeze({
  ...SystemEvents,
  id:"core-events",
  priority:15,
  app:AppEvents,
  initialize,
  boot,
  shutdown,
  reset,
  snapshot
});

export {
  SystemEvents,
  AppEvents,
  Events
};

export default Events;
