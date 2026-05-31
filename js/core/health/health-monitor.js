// =====================================
// RIGO AI
// HEALTH MONITOR
// =====================================



// =====================================
// IMPORTS
// =====================================

import {

  HEALTH_STATES,

  HEALTH_THRESHOLDS

}
from "./health-config.js";

import HealthState
from "./health-state.js";



// =====================================
// HELPERS
// =====================================

function calculateHealthStatus(
  score
){

  if(
    score >=
    HEALTH_THRESHOLDS
    .HEALTHY_SCORE
  ){

    return HEALTH_STATES
    .HEALTHY;

  }

  if(
    score >=
    HEALTH_THRESHOLDS
    .WARNING_SCORE
  ){

    return HEALTH_STATES
    .WARNING;

  }

  return HEALTH_STATES
  .CRITICAL;

}



// =====================================
// RUNTIME CHECK
// =====================================

async function checkRuntime(){

  try{

    const runtimeModule =
    await import(
      "../runtime/index.js"
    );

    const runtime =

      runtimeModule.default ||
      runtimeModule.Runtime;

    if(
      !runtime
    ){

      return {

        score:0,

        warning:
        "Runtime unavailable"

      };

    }

    const snapshot =
    runtime.snapshot();

    if(
      snapshot?.runtime?.booted
    ){

      return {

        score:100

      };

    }

    return {

      score:50,

      warning:
      "Runtime not booted"

    };

  }

  catch{

    return {

      score:0,

      warning:
      "Runtime check failed"

    };

  }

}



// =====================================
// MODULES CHECK
// =====================================

async function checkModules(){

  try{

    const modulesModule =
    await import(
      "../modules/index.js"
    );

    const modules =

      modulesModule.default ||
      modulesModule.Modules;

    if(
      !modules
    ){

      return {

        score:0,

        warning:
        "Modules unavailable"

      };

    }

    const snapshot =
    modules.snapshot();

    const failedModules =

      snapshot
      ?.registry
      ?.failedModules
      ?.length || 0;

    if(
      failedModules <= 0
    ){

      return {

        score:100

      };

    }

    return {

      score:
      Math.max(
        0,
        100 -
        (failedModules * 10)
      ),

      warning:
      `${failedModules} failed modules`

    };

  }

  catch{

    return {

      score:0,

      warning:
      "Modules check failed"

    };

  }

}



// =====================================
// LIFECYCLE CHECK
// =====================================

async function checkLifecycle(){

  try{

    const lifecycleModule =
    await import(
      "../lifecycle/index.js"
    );

    const lifecycle =

      lifecycleModule.default ||
      lifecycleModule.Lifecycle;

    if(
      !lifecycle
    ){

      return {

        score:0,

        warning:
        "Lifecycle unavailable"

      };

    }

    const snapshot =
    lifecycle.snapshot();

    if(
      snapshot
      ?.lifecycle
      ?.running
    ){

      return {

        score:100

      };

    }

    return {

      score:50,

      warning:
      "Lifecycle not running"

    };

  }

  catch{

    return {

      score:0,

      warning:
      "Lifecycle check failed"

    };

  }

}



// =====================================
// HEALTH CHECK
// =====================================

async function runHealthCheck(){

  const warnings =
  [];

  const runtime =
  await checkRuntime();

  const modules =
  await checkModules();

  const lifecycle =
  await checkLifecycle();

  if(
    runtime.warning
  ){

    warnings.push(
      runtime.warning
    );

  }

  if(
    modules.warning
  ){

    warnings.push(
      modules.warning
    );

  }

  if(
    lifecycle.warning
  ){

    warnings.push(
      lifecycle.warning
    );

  }

  const score =
  Math.floor(

    (

      runtime.score +

      modules.score +

      lifecycle.score

    ) / 3

  );

  const status =
  calculateHealthStatus(
    score
  );

  HealthState
  .update({

    status,

    score,

    warnings,

    lastCheckAt:
    Date.now()

  });

  HealthState
  .addHistoryEntry({

    status,

    score

  });

  return HealthState
  .snapshot();

}



// =====================================
// PUBLIC API
// =====================================

const HealthMonitor =
Object.freeze({

  checkRuntime,

  checkModules,

  checkLifecycle,

  runHealthCheck

});



// =====================================
// EXPORTS
// =====================================

export {

  checkRuntime,

  checkModules,

  checkLifecycle,

  runHealthCheck,

  HealthMonitor

};

export default
HealthMonitor;
