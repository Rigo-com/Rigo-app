// =====================================
// RIGO AI
// HEALTH MANAGER
// =====================================



// =====================================
// IMPORTS
// =====================================

import HealthState
from "./health-state.js";

import HealthMonitor
from "./health-monitor.js";

import { HEALTH_CONFIG }
from "./health-config.js";



// =====================================
// INTERNAL STATE
// =====================================

const healthManagerState =
Object.seal({

  initialized:false,

  monitoring:false,

  intervalId:null

});



// =====================================
// INITIALIZE
// =====================================

async function initializeHealth(){

  if(
    healthManagerState
    .initialized
  ){

    return true;

  }

  healthManagerState
  .initialized =
  true;

  return true;

}



// =====================================
// START MONITORING
// =====================================

async function startMonitoring(
  interval = HEALTH_CONFIG.CHECK_INTERVAL
){

  if(
    healthManagerState
    .monitoring
  ){

    return true;

  }

  await initializeHealth();

  healthManagerState
  .monitoring =
  true;

  await HealthMonitor
  .runHealthCheck();

  healthManagerState
  .intervalId =
  setInterval(() => {

    HealthMonitor
    .runHealthCheck()
    .catch(() => {});

  }, interval);

  return true;

}



// =====================================
// STOP MONITORING
// =====================================

async function stopMonitoring(){

  if(
    healthManagerState
    .intervalId
  ){

    clearInterval(

      healthManagerState
      .intervalId

    );

  }

  healthManagerState
  .intervalId =
  null;

  healthManagerState
  .monitoring =
  false;

  return true;

}



// =====================================
// CHECK
// =====================================

async function checkHealth(){

  return HealthMonitor
  .runHealthCheck();

}



// =====================================
// RESET
// =====================================

async function resetHealth(){

  await stopMonitoring();

  HealthState
  .reset();

  healthManagerState
  .initialized =
  false;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function createHealthSnapshot(){

  const health =
  HealthState.snapshot();

  return Object.freeze({

    manager:{

      initialized:
      healthManagerState
      .initialized,

      monitoring:
      healthManagerState
      .monitoring

    },

    healthy:
    health.status === "healthy",

    health,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const HealthManager =
Object.freeze({

  initialize:
  initializeHealth,

  start:
  startMonitoring,

  stop:
  stopMonitoring,

  check:
  checkHealth,

  reset:
  resetHealth,

  snapshot:
  createHealthSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initializeHealth,

  startMonitoring,

  stopMonitoring,

  checkHealth,

  resetHealth,

  createHealthSnapshot,

  HealthManager

};

export default
HealthManager;
