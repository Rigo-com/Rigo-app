// =====================================
// RIGO AI
// AI RUNTIME ORCHESTRATOR
// FULL PRODUCTION BOOTSTRAP INDEX
// FINAL INTEGRATED VERSION
// =====================================



// =====================================
// IMPORTS
// =====================================

import "../kernel/ai-kernel.js";
import "../contexts/context-manager.js";
import "../agents/agent-manager.js";
import "../tools/tool-executor.js";
import "../workflows/workflow-engine.js";
import "../planner/planner-engine.js";



// =====================================
// AI STACK STATES
// =====================================

const AI_STACK_STATES =
Object.freeze({

  IDLE:
  "idle",

  BOOTING:
  "booting",

  READY:
  "ready",

  FAILED:
  "failed",

  RESETTING:
  "resetting",

  SHUTTING_DOWN:
  "shutting_down"

});



// =====================================
// AI RUNTIME STATE
// =====================================

const aiRuntimeState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  startupPromise:null,

  state:
  AI_STACK_STATES
  .IDLE,

  initializedSystems:
  new Set(),

  failedSystems:
  new Set(),

  diagnostics:{

    bootAttempts:0,

    successfulBoots:0,

    failedBoots:0,

    shutdowns:0,

    resets:0

  },

  startupStartedAt:null,

  startupCompletedAt:null,

  lastError:null

});



// =====================================
// SAFE FREEZE
// =====================================

function freezeAIObject(
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

  if(

    value instanceof Map ||

    value instanceof Set ||

    value instanceof WeakMap ||

    value instanceof WeakSet ||

    value instanceof AbortController ||

    value instanceof AbortSignal

  ){

    return value;

  }

  visited.add(value);

  Object.values(value)
  .forEach((nested) => {

    if(

      nested &&

      typeof nested ===
      "object"

    ){

      freezeAIObject(
        nested,
        visited
      );

    }

  });

  return Object.freeze(
    value
  );

}



// =====================================
// SAFE CLONE
// =====================================

function cloneAIObject(
  value
){

  try{

    if(
      typeof structuredClone ===
      "function"
    ){

      return structuredClone(
        value
      );

    }

  }

  catch(error){}

  try{

    if(
      Array.isArray(value)
    ){

      return [
        ...value
      ];

    }

    if(

      value &&

      typeof value ===
      "object"

    ){

      return {
        ...value
      };

    }

    return value;

  }

  catch(error){

    return null;

  }

}



// =====================================
// MODULES
// =====================================

const AIModules =
Object.freeze({

  kernel:
  AIKernel,

  context:
  ContextManager,

  agents:
  AgentManager,

  tools:
  ToolExecutor,

  workflows:
  WorkflowEngine,

  planner:
  PlannerEngine

});



// =====================================
// KERNEL SYSTEM REGISTRATION
// =====================================

function registerKernelSystems(){

  if(
    typeof AIKernel?.registerSystem !==
    "function"
  ){

    return false;

  }

  AIKernel.registerSystem(
    "contexts",
    ContextManager
  );

  AIKernel.registerSystem(
    "agents",
    AgentManager
  );

  AIKernel.registerSystem(
    "tools",
    ToolExecutor
  );

  AIKernel.registerSystem(
    "workflows",
    WorkflowEngine
  );

  AIKernel.registerSystem(
    "planner",
    PlannerEngine
  );

  return true;

}



// =====================================
// VALIDATION
// =====================================

function validateSubsystem(
  system
){

  return (

    system

    &&

    typeof system.initialize ===
    "function"

    &&

    typeof system.health ===
    "function"

    &&

    typeof system.reset ===
    "function"

  );

}



function validateAISubsystems(){

  return (

    validateSubsystem(
      ContextManager
    )

    &&

    validateSubsystem(
      AgentManager
    )

    &&

    validateSubsystem(
      ToolExecutor
    )

    &&

    validateSubsystem(
      WorkflowEngine
    )

    &&

    validateSubsystem(
      PlannerEngine
    )

    &&

    validateSubsystem(
      AIKernel
    )

  );

}



// =====================================
// DEPENDENCY VALIDATION
// =====================================

function validateAIDependencies(){

  return (

    typeof ContextManager !==
    "undefined"

    &&

    typeof AgentManager !==
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

    &&

    typeof AIKernel !==
    "undefined"

  );

}



// =====================================
// SYSTEM INITIALIZATION
// =====================================

async function initializeAISystem(
  name,
  system
){

  try{

    const result =
    await system.initialize();

    if(
      result !== false
    ){

      aiRuntimeState
      .initializedSystems
      .add(name);

      aiRuntimeState
      .failedSystems
      .delete(name);

      return true;

    }

    aiRuntimeState
    .failedSystems
    .add(name);

    return false;

  }

  catch(error){

    aiRuntimeState
    .failedSystems
    .add(name);

    aiRuntimeState
    .lastError =
    String(error);

    return false;

  }

}



// =====================================
// INITIALIZE AI STACK
// =====================================

async function initializeAIStack(){

  if(
    aiRuntimeState
    .initialized
  ){

    return true;

  }

  if(
    aiRuntimeState
    .startupPromise
  ){

    return aiRuntimeState
    .startupPromise;

  }

  aiRuntimeState
  .startupPromise =

  (async() => {

    if(
      aiRuntimeState
      .initializing
    ){

      return false;

    }

    aiRuntimeState
    .initializing =
    true;

    aiRuntimeState
    .state =
    AI_STACK_STATES
    .BOOTING;

    aiRuntimeState
    .startupStartedAt =
    Date.now();

    aiRuntimeState
    .diagnostics
    .bootAttempts++;

    try{

      if(
        !validateAIDependencies()
      ){

        throw new Error(
          "AI DEPENDENCIES INVALID"
        );

      }

      if(
        !validateAISubsystems()
      ){

        throw new Error(
          "AI SUBSYSTEMS INVALID"
        );

      }

      registerKernelSystems();

      const initializationPipeline = [

        [
          "context",
          ContextManager
        ],

        [
          "agents",
          AgentManager
        ],

        [
          "tools",
          ToolExecutor
        ],

        [
          "workflows",
          WorkflowEngine
        ],

        [
          "planner",
          PlannerEngine
        ],

        [
          "kernel",
          AIKernel
        ]

      ];

      for(
        const [
          name,
          system
        ]

        of initializationPipeline
      ){

        const success =
        await initializeAISystem(

          name,
          system

        );

        if(!success){

          throw new Error(

            "FAILED TO INITIALIZE " +

            name

          );

        }

      }

      aiRuntimeState
      .initialized =
      true;

      aiRuntimeState
      .state =
      AI_STACK_STATES
      .READY;

      aiRuntimeState
      .startupCompletedAt =
      Date.now();

      aiRuntimeState
      .diagnostics
      .successfulBoots++;

      return true;

    }

    catch(error){

      aiRuntimeState
      .initialized =
      false;

      aiRuntimeState
      .state =
      AI_STACK_STATES
      .FAILED;

      aiRuntimeState
      .lastError =
      String(error);

      aiRuntimeState
      .diagnostics
      .failedBoots++;

      console.error(
        "AI STACK INITIALIZATION FAILED",
        error
      );

      return false;

    }

    finally{

      aiRuntimeState
      .initializing =
      false;

      aiRuntimeState
      .startupPromise =
      null;

    }

  })();

  return aiRuntimeState
  .startupPromise;

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownAIStack(){

  if(
    aiRuntimeState
    .shuttingDown
  ){

    return false;

  }

  aiRuntimeState
  .shuttingDown =
  true;

  aiRuntimeState
  .state =
  AI_STACK_STATES
  .SHUTTING_DOWN;

  try{

    const shutdownPipeline = [

      AIKernel,

      PlannerEngine,

      WorkflowEngine,

      ToolExecutor,

      AgentManager,

      ContextManager

    ];

    for(
      const system
      of shutdownPipeline
    ){

      try{

        if(
          typeof system.shutdown ===
          "function"
        ){

          await system.shutdown();

        }

      }

      catch(error){

        console.error(
          "SYSTEM SHUTDOWN FAILED",
          error
        );

      }

    }

    aiRuntimeState
    .initialized =
    false;

    aiRuntimeState
    .initializedSystems
    .clear();

    aiRuntimeState
    .failedSystems
    .clear();

    aiRuntimeState
    .diagnostics
    .shutdowns++;

    aiRuntimeState
    .state =
    AI_STACK_STATES
    .IDLE;

    return true;

  }

  finally{

    aiRuntimeState
    .shuttingDown =
    false;

  }

}



// =====================================
// RESET
// =====================================

async function resetAIStack(){

  aiRuntimeState
  .state =
  AI_STACK_STATES
  .RESETTING;

  try{

    await shutdownAIStack();

    const resetPipeline = [

      AIKernel,

      PlannerEngine,

      WorkflowEngine,

      ToolExecutor,

      AgentManager,

      ContextManager

    ];

    for(
      const system
      of resetPipeline
    ){

      try{

        if(
          typeof system.reset ===
          "function"
        ){

          await system.reset();

        }

      }

      catch(error){

        console.error(
          "SYSTEM RESET FAILED",
          error
        );

      }

    }

    aiRuntimeState
    .diagnostics
    .resets++;

    aiRuntimeState
    .state =
    AI_STACK_STATES
    .IDLE;

    return true;

  }

  catch(error){

    aiRuntimeState
    .state =
    AI_STACK_STATES
    .FAILED;

    aiRuntimeState
    .lastError =
    String(error);

    return false;

  }

}



// =====================================
// SNAPSHOT
// =====================================

function createAIStackSnapshot(){

  return freezeAIObject({

    initialized:
    aiRuntimeState
    .initialized,

    state:
    aiRuntimeState
    .state,

    initializedSystems:[

      ...aiRuntimeState
      .initializedSystems

    ],

    failedSystems:[

      ...aiRuntimeState
      .failedSystems

    ],

    timestamp:
    Date.now()

  });

}



// =====================================
// HEALTH REPORT
// =====================================

function getAIStackHealthReport(){

  return freezeAIObject({

    initialized:
    aiRuntimeState
    .initialized,

    state:
    aiRuntimeState
    .state,

    valid:
    validateAISubsystems(),

    dependencies:
    validateAIDependencies(),

    systems:{

      kernel:
      AIKernel
      ?.health?.(),

      context:
      ContextManager
      ?.health?.(),

      agents:
      AgentManager
      ?.health?.(),

      tools:
      ToolExecutor
      ?.health?.(),

      workflows:
      WorkflowEngine
      ?.health?.(),

      planner:
      PlannerEngine
      ?.health?.()

    },

    initializedSystems:[

      ...aiRuntimeState
      .initializedSystems

    ],

    failedSystems:[

      ...aiRuntimeState
      .failedSystems

    ],

    diagnostics:
    cloneAIObject(

      aiRuntimeState
      .diagnostics

    ),

    startupDuration:

      aiRuntimeState
      .startupCompletedAt

      &&

      aiRuntimeState
      .startupStartedAt

      ?

      aiRuntimeState
      .startupCompletedAt -

      aiRuntimeState
      .startupStartedAt

      :

      null,

    lastError:
    aiRuntimeState
    .lastError,

    timestamp:
    Date.now()

  });

}



// =====================================
// PUBLIC API
// =====================================

const AI =
freezeAIObject({

  modules:
  AIModules,

  initialize:
  initializeAIStack,

  shutdown:
  shutdownAIStack,

  reset:
  resetAIStack,

  snapshot:
  createAIStackSnapshot,

  health:
  getAIStackHealthReport

});



// =====================================
// AUTO INITIALIZATION
// =====================================

initializeAIStack()
.catch((error) => {

  console.error(
    "AI STACK AUTO INIT FAILED",
    error
  );

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

  window.AgentManager =
  AgentManager;

  window.ToolExecutor =
  ToolExecutor;

  window.WorkflowEngine =
  WorkflowEngine;

  window.PlannerEngine =
  PlannerEngine;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis.AI =
  AI;

  globalThis.AIKernel =
  AIKernel;

  globalThis.ContextManager =
  ContextManager;

  globalThis.AgentManager =
  AgentManager;

  globalThis.ToolExecutor =
  ToolExecutor;

  globalThis.WorkflowEngine =
  WorkflowEngine;

  globalThis.PlannerEngine =
  PlannerEngine;

}



// =====================================
// MODULE EXPORTS
// =====================================

export {

  AI,

  AIKernel,

  ContextManager,

  AgentManager,

  ToolExecutor,

  WorkflowEngine,

  PlannerEngine

};

export default AI;
