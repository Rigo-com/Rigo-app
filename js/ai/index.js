// =====================================
// RIGO AI
// AI INDEX
// ENTERPRISE AI EXPORTS
// =====================================



// =====================================
// AI MODULES
// =====================================

const AIModules =
Object.freeze({

  kernel:
  AIKernel,

  context:
  ContextManager,

  tools:
  ToolExecutor,

  workflows:
  WorkflowEngine,

  planner:
  PlannerEngine

});



// =====================================
// VALIDATION
// =====================================

function validateAISubsystems(){

  return (

    typeof AIKernel !==
    "undefined"

    &&

    typeof ContextManager !==
    "undefined"

    &&

    typeof ToolExecutor !==
    "undefined"

    &&

    typeof WorkflowEngine !==
    "undefined"

    &&

    typeof PlannerEngine !==
    "undefined"

  );

}



// =====================================
// INITIALIZE AI STACK
// =====================================

async function initializeAIStack(){

  if(
    !validateAISubsystems()
  ){

    return false;

  }

  try{

    await ContextManager
    .initialize();

    await ToolExecutor
    .initialize();

    await WorkflowEngine
    .initialize();

    await PlannerEngine
    .initialize();

    await AIKernel
    .initialize();

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// RESET AI STACK
// =====================================

async function resetAIStack(){

  try{

    await AIKernel
    .reset();

    await PlannerEngine
    .reset();

    await WorkflowEngine
    .reset();

    await ToolExecutor
    .reset();

    await ContextManager
    .reset();

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// SHUTDOWN AI STACK
// =====================================

async function shutdownAIStack(){

  try{

    await AIKernel
    .shutdown();

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// AI HEALTH REPORT
// =====================================

function getAIStackHealthReport(){

  return Object.freeze({

    valid:
    validateAISubsystems(),

    kernel:

      typeof AIKernel
      ?.health ===
      "function"

      ? AIKernel
        .health()

      : null,

    context:

      typeof ContextManager
      ?.diagnostics ===
      "function"

      ? ContextManager
        .diagnostics()

      : null,

    tools:

      typeof ToolExecutor
      ?.diagnostics ===
      "function"

      ? ToolExecutor
        .diagnostics()

      : null,

    workflows:

      typeof WorkflowEngine
      ?.diagnostics ===
      "function"

      ? WorkflowEngine
        .diagnostics()

      : null,

    planner:

      typeof PlannerEngine
      ?.diagnostics ===
      "function"

      ? PlannerEngine
        .diagnostics()

      : null,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const AI =
Object.freeze({

  modules:
  AIModules,

  initialize:
  initializeAIStack,

  reset:
  resetAIStack,

  shutdown:
  shutdownAIStack,

  health:
  getAIStackHealthReport

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.AI =
  AI;

  window.AIKernel =
  AIKernel;

  window.ContextManager =
  ContextManager;

  window.ToolExecutor =
  ToolExecutor;

  window.WorkflowEngine =
  WorkflowEngine;

  window.PlannerEngine =
  PlannerEngine;

}
