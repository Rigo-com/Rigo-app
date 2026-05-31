// =====================================
// RIGO AI
// CORE INDEX
// ENTRY POINT
// =====================================



// =====================================
// IMPORTS
// =====================================

import Constants
from "./constants/index.js";

import Config
from "./config/index.js";

import Container
from "./container/index.js";

import Events
from "./events/index.js";

import State
from "./state/index.js";

import Modules
from "./modules/index.js";

import Runtime
from "./runtime/index.js";

import Lifecycle
from "./lifecycle/index.js";

import Health
from "./health/index.js";

import App
from "./app/index.js";



// =====================================
// INITIALIZATION
// =====================================

async function initializeCore(){

  return App
  .initialize();

}



// =====================================
// BOOT
// =====================================

async function bootCore(){

  return App
  .start();

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownCore(){

  if(
    typeof App.shutdown ===
    "function"
  ){

    await App.shutdown();

  }

  return true;

}



// =====================================
// RESET
// =====================================

async function resetCore(){

  if(
    typeof App.reset ===
    "function"
  ){

    await App.reset();

  }

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createCoreSnapshot(){

  return Object.freeze({

    constants:
    Constants,

    config:
    Config,

    container:

      Container.snapshot
      ?.() ||

      null,

    events:

      Events.snapshot
      ?.() ||

      null,

    state:

      State.snapshot
      ?.() ||

      null,

    modules:

      Modules.snapshot
      ?.() ||

      null,

    runtime:

      Runtime.snapshot
      ?.() ||

      null,

    lifecycle:

      Lifecycle.snapshot
      ?.() ||

      null,

    health:

      Health.snapshot
      ?.() ||

      null,

    app:

      App.snapshot
      ?.() ||

      null,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const Core =
Object.freeze({

  constants:
  Constants,

  config:
  Config,

  container:
  Container,

  events:
  Events,

  state:
  State,

  modules:
  Modules,

  runtime:
  Runtime,

  lifecycle:
  Lifecycle,

  health:
  Health,

  app:
  App,

  initialize:
  initializeCore,

  boot:
  bootCore,

  shutdown:
  shutdownCore,

  reset:
  resetCore,

  snapshot:
  createCoreSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  Constants,

  Config,

  Container,

  Events,

  State,

  Modules,

  Runtime,

  Lifecycle,

  Health,

  App,

  initializeCore,

  bootCore,

  shutdownCore,

  resetCore,

  createCoreSnapshot,

  Core

};

export default
Core;
