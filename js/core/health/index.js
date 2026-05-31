// =====================================
// RIGO AI
// HEALTH INDEX
// ENTRY POINT
// =====================================



// =====================================
// IMPORTS
// =====================================

import HealthConfig
from "./health-config.js";

import HealthState
from "./health-state.js";

import HealthMonitor
from "./health-monitor.js";

import HealthManager
from "./health-manager.js";



// =====================================
// SHORTCUTS
// =====================================

async function initializeHealth(){

  return HealthManager
  .initialize();

}



async function startHealthMonitoring(){

  return HealthManager
  .start();

}



async function stopHealthMonitoring(){

  return HealthManager
  .stop();

}



async function checkHealth(){

  return HealthManager
  .check();

}



async function resetHealth(){

  return HealthManager
  .reset();

}



// =====================================
// SNAPSHOT
// =====================================

function createHealthSystemSnapshot(){

  return Object.freeze({

    health:
    HealthManager
    .snapshot(),

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const Health =
Object.freeze({

  config:
  HealthConfig,

  state:
  HealthState,

  monitor:
  HealthMonitor,

  manager:
  HealthManager,

  initialize:
  initializeHealth,

  start:
  startHealthMonitoring,

  stop:
  stopHealthMonitoring,

  check:
  checkHealth,

  reset:
  resetHealth,

  snapshot:
  createHealthSystemSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  HealthConfig,

  HealthState,

  HealthMonitor,

  HealthManager,

  initializeHealth,

  startHealthMonitoring,

  stopHealthMonitoring,

  checkHealth,

  resetHealth,

  createHealthSystemSnapshot,

  Health

};

export default
Health;
