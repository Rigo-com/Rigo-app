// =====================================
// RIGO AI
// STATE INDEX
// =====================================

import AppState
from "./app-state.js";

import StateManager
from "./state-manager.js";



const State =
Object.freeze({

  app:
  AppState,

  manager:
  StateManager

});



export default
State;
