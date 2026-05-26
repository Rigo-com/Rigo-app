// =====================================
// RIGO AI
// PLANNER ENGINE
// FULL HARDENED PRODUCTION ORCHESTRATION RUNTIME
// FINAL ENTERPRISE EDITION
// =====================================



// =====================================
// PLANNER CONFIG
// =====================================

const PLANNER_ENGINE_CONFIG =
Object.freeze({

  ENABLE_DYNAMIC_PLANNING:true,

  ENABLE_GOAL_DECOMPOSITION:true,

  ENABLE_REPLANNING:true,

  ENABLE_AGENT_ASSIGNMENT:true,

  ENABLE_TOOL_SELECTION:true,

  ENABLE_ADAPTIVE_STRATEGIES:true,

  ENABLE_PLAN_MEMORY:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_PLAN_ABORT:true,

  ENABLE_PLAN_QUEUE:true,

  ENABLE_AUTO_QUEUE_DRAIN:true,

  ENABLE_EXECUTION_HISTORY:true,

  ENABLE_RUNTIME_SYNC:true,

  MAX_PLANS:1000,

  MAX_PLAN_STEPS:200,

  MAX_RETRIES:3,

  MAX_PARALLEL_PLANS:50,

  MAX_QUEUE_SIZE:500,

  MAX_CONTEXT_SIZE:100000,

  PLAN_TIMEOUT:300000,

  RETRY_DELAY:500,

  MAX_EXECUTION_HISTORY:500

});



// =====================================
// PLAN STATES
// =====================================

const PLAN_STATES =
Object.freeze({

  CREATED:"created",

  ANALYZING:"analyzing",

  PLANNED:"planned",

  EXECUTING:"executing",

  COMPLETED:"completed",

  FAILED:"failed",

  TERMINATED:"terminated"

});



// =====================================
// PLAN STEP STATES
// =====================================

const PLAN_STEP_STATES =
Object.freeze({

  PENDING:"pending",

  READY:"ready",

  RUNNING:"running",

  COMPLETED:"completed",

  FAILED:"failed",

  SKIPPED:"skipped"

});



// =====================================
// PLAN EVENTS
// =====================================

const PLAN_EVENTS =
Object.freeze({

  CREATED:
  "planner.plan.created",

  ANALYZED:
  "planner.plan.analyzed",

  GENERATED:
  "planner.plan.generated",

  EXECUTION_STARTED:
  "planner.execution.started",

  STEP_COMPLETED:
  "planner.step.completed",

  COMPLETED:
  "planner.completed",

  FAILED:
  "planner.failed",

  TERMINATED:
  "planner.terminated"

});



// =====================================
// PLANNER STATE
// =====================================

const plannerEngineState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  startupPromise:null,

  plans:
  new Map(),

  activePlans:
  new Set(),

  queuedPlans:
  new Set(),

  executionLocks:
  new Set(),

  executionQueue:
  [],

  executionHistory:[],

  completedPlans:
  new Set(),

  failedPlans:
  new Set(),

  diagnostics:{

    created:0,

    analyzed:0,

    generated:0,

    executed:0,

    completed:0,

    failed:0,

    replans:0,

    rejected:0,

    queued:0,

    terminated:0

  },

  lastPlanAt:null

});



// =====================================
// HELPERS
// =====================================

function normalizePlanId(
  planId
){

  return String(
    planId || ""
  )
  .trim()
  .toLowerCase();

}



function freezePlannerObject(
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
  .forEach((nestedValue) => {

    freezePlannerObject(
      nestedValue,
      visited
    );

  });

  return Object.freeze(
    value
  );

}



function clonePlannerObject(
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

    return {};

  }

}



function clonePlannerDiagnostics(){

  return freezePlannerObject({

    ...plannerEngineState
    .diagnostics

  });

}



async function emitPlannerEvent(
  eventName,
  payload = {}
){

  if(
    typeof emitSystemEvent !==
    "function"
  ){

    return false;

  }

  try{

    await emitSystemEvent(

      eventName,

      freezePlannerObject({

        source:
        "planner-engine",

        timestamp:
        Date.now(),

        ...payload

      })

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function createPlannerId(){

  try{

    if(

      typeof crypto !==
      "undefined"

      &&

      typeof crypto
      .randomUUID ===
      "function"

    ){

      return crypto
      .randomUUID();

    }

  }

  catch(error){}

  return (

    "plan_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



function delayPlannerExecution(
  duration
){

  return new Promise((resolve) => {

    setTimeout(
      resolve,
      duration
    );

  });

}



function serializePlannerContext(
  value
){

  try{

    return JSON.stringify(
      value
    );

  }

  catch(error){

    return "";

  }

}



function isPlannerContextValid(
  value
){

  const serialized =
  serializePlannerContext(
    value
  );

  return (

    serialized.length <=

    PLANNER_ENGINE_CONFIG
    .MAX_CONTEXT_SIZE

  );

}



function trimPlannerHistory(){

  while(

    plannerEngineState
    .executionHistory
    .length >

    PLANNER_ENGINE_CONFIG
    .MAX_EXECUTION_HISTORY

  ){

    plannerEngineState
    .executionHistory
    .shift();

  }

  return true;

}



function getRegisteredTools(){

  try{

    if(
      typeof ToolExecutor ===
      "undefined"
    ){

      return [];
    }

    if(
      typeof ToolExecutor.list !==
      "function"
    ){

      return [];
    }

    return ToolExecutor
    .list();

  }

  catch(error){

    return [];

  }

}



function getAvailableAgents(){

  try{

    if(
      typeof AgentManager ===
      "undefined"
    ){

      return [];
    }

    if(
      typeof AgentManager.list !==
      "function"
    ){

      return [];
    }

    return AgentManager
    .list();

  }

  catch(error){

    return [];

  }

}



function createPlanRuntime(){

  return {

    running:false,

    startedAt:null,

    completedAt:null,

    controller:

      PLANNER_ENGINE_CONFIG
      .ENABLE_PLAN_ABORT

      ?

      new AbortController()

      :

      null

  };

}



// =====================================
// PLAN OBJECT
// =====================================

function createPlanObject(
  config = {}
){

  return {

    id:
    normalizePlanId(

      config.id ||

      createPlannerId()

    ),

    goal:
    String(
      config.goal || ""
    ),

    description:
    String(
      config.description || ""
    ),

    priority:
    Number(
      config.priority
    ) || 1,

    retries:0,

    state:
    PLAN_STATES.CREATED,

    strategy:
    String(
      config.strategy ||
      "adaptive"
    ),

    assignedAgent:
    config.assignedAgent ||
    null,

    selectedTools:

      Array.isArray(
        config.selectedTools
      )

      ?

      clonePlannerObject(
        config.selectedTools
      )

      :

      [],

    steps:[],

    context:
    clonePlannerObject(
      config.context || {}
    ),

    metadata:
    clonePlannerObject(
      config.metadata || {}
    ),

    runtime:
    createPlanRuntime(),

    createdAt:
    Date.now(),

    updatedAt:
    Date.now()

  };

}



// =====================================
// GOAL DECOMPOSITION
// =====================================

function decomposeGoal(
  goal
){

  const normalizedGoal =
  String(goal || "")
  .trim();

  if(!normalizedGoal){

    return [];

  }

  return normalizedGoal

  .split(".")

  .slice(

    0,

    PLANNER_ENGINE_CONFIG
    .MAX_PLAN_STEPS

  )

  .map((segment,index) => {

    return {

      id:
      createPlannerId(),

      order:
      index + 1,

      objective:
      segment.trim(),

      executable:true,

      dependencies:[],

      parallel:false,

      retries:0,

      result:null,

      error:null,

      assignedTool:null,

      assignedAgent:null,

      state:
      PLAN_STEP_STATES.PENDING

    };

  })

  .filter((step) => {

    return (
      step.objective.length > 0
    );

  });

}



// =====================================
// TOOL SELECTION
// =====================================

function selectToolsForGoal(
  goal
){

  try{

    const normalizedGoal =
    String(goal)
    .toLowerCase();

    return getRegisteredTools()

    .filter((tool) => {

      const toolName =
      String(
        tool.name || ""
      )
      .toLowerCase();

      const toolDescription =
      String(
        tool.description || ""
      )
      .toLowerCase();

      return (

        normalizedGoal
        .includes(toolName)

        ||

        normalizedGoal
        .includes(
          toolDescription
        )

      );

    })

    .map((tool) => {

      return tool.id;

    });

  }

  catch(error){

    return [];

  }

}



// =====================================
// AGENT ASSIGNMENT
// =====================================

function assignAgentToPlan(){

  try{

    const agents =
    getAvailableAgents();

    const availableAgent =
    agents.find((agent) => {

      return (
        agent.state ===
        "ready"
      );

    });

    return availableAgent

      ? availableAgent.id

      : null;

  }

  catch(error){

    return null;

  }

}



// =====================================
// VALIDATE STEP
// =====================================

function validatePlanStep(
  step
){

  if(
    !step
  ){

    return false;

  }

  if(
    !step.id
  ){

    return false;

  }

  if(
    !step.objective
  ){

    return false;

  }

  return true;

}



// =====================================
// GENERATE PLAN
// =====================================

async function generateExecutionPlan(
  config = {}
){

  if(
    plannerEngineState
    .shuttingDown
  ){

    return false;

  }

  if(

    plannerEngineState
    .plans
    .size >=

    PLANNER_ENGINE_CONFIG
    .MAX_PLANS

  ){

    plannerEngineState
    .diagnostics
    .rejected++;

    return false;

  }

  if(
    !isPlannerContextValid(
      config.context || {}
    )
  ){

    plannerEngineState
    .diagnostics
    .rejected++;

    return false;

  }

  const plan =
  createPlanObject(
    config
  );

  const steps =
  decomposeGoal(
    plan.goal
  );

  const tools =
  selectToolsForGoal(
    plan.goal
  );

  const assignedAgent =
  assignAgentToPlan();

  plan.steps =
  steps

  .filter(validatePlanStep)

  .map((step) => {

    return {

      ...step,

      assignedTool:
      tools[0] || null,

      assignedAgent,

      state:
      PLAN_STEP_STATES.READY

    };

  });

  plan.selectedTools =
  tools;

  plan.assignedAgent =
  assignedAgent;

  plan.state =
  PLAN_STATES.PLANNED;

  plannerEngineState
  .plans
  .set(
    plan.id,
    plan
  );

  plannerEngineState
  .diagnostics
  .created++;

  plannerEngineState
  .diagnostics
  .generated++;

  plannerEngineState
  .lastPlanAt =
  Date.now();

  await emitPlannerEvent(

    PLAN_EVENTS
    .GENERATED,

    {

      planId:
      plan.id

    }

  );

  return freezePlannerObject(
    clonePlannerObject(plan)
  );

}



// =====================================
// EXECUTE STEP
// =====================================

async function executePlanStep(
  plan,
  step
){

  let attempts = 0;

  while(

    attempts <

    PLANNER_ENGINE_CONFIG
    .MAX_RETRIES

  ){

    attempts++;

    try{

      if(
        step.assignedTool
      ){

        if(
          typeof ToolExecutor ===
          "undefined"
        ){

          throw new Error(
            "TOOL EXECUTOR UNAVAILABLE"
          );

        }

        if(
          typeof ToolExecutor.execute !==
          "function"
        ){

          throw new Error(
            "INVALID TOOL EXECUTOR"
          );

        }

        const result =
        await ToolExecutor.execute(

          step.assignedTool,

          {

            objective:
            step.objective,

            signal:

              plan.runtime
              .controller
              ?.signal || null

          },

          {

            source:
            "planner-engine"

          }

        );

        if(
          !result
        ){

          throw new Error(
            "INVALID TOOL RESULT"
          );

        }

        return {

          ...step,

          result,

          retries:
          attempts - 1,

          state:
          PLAN_STEP_STATES
          .COMPLETED

        };

      }

      return {

        ...step,

        retries:
        attempts - 1,

        state:
        PLAN_STEP_STATES
        .COMPLETED

      };

    }

    catch(error){

      if(

        attempts >=

        PLANNER_ENGINE_CONFIG
        .MAX_RETRIES

      ){

        return {

          ...step,

          error:
          String(error),

          retries:
          attempts,

          state:
          PLAN_STEP_STATES
          .FAILED

        };

      }

      plannerEngineState
      .diagnostics
      .replans++;

      await delayPlannerExecution(

        PLANNER_ENGINE_CONFIG
        .RETRY_DELAY

      );

    }

  }

}



// =====================================
// DRAIN QUEUE
// =====================================

async function drainPlannerQueue(){

  if(
    !PLANNER_ENGINE_CONFIG
    .ENABLE_AUTO_QUEUE_DRAIN
  ){

    return false;

  }

  if(

    plannerEngineState
    .executionQueue
    .length <= 0

  ){

    return false;

  }

  if(

    plannerEngineState
    .activePlans
    .size >=

    PLANNER_ENGINE_CONFIG
    .MAX_PARALLEL_PLANS

  ){

    return false;

  }

  const queuedPlan =
  plannerEngineState
  .executionQueue
  .shift();

  plannerEngineState
  .queuedPlans
  .delete(
    queuedPlan
  );

  executePlan(
    queuedPlan
  )
  .catch(() => {});

  return true;

}



// =====================================
// EXECUTE PLAN
// =====================================

async function executePlan(
  planId
){

  const normalizedId =
  normalizePlanId(
    planId
  );

  if(

    plannerEngineState
    .executionLocks
    .has(
      normalizedId
    )

  ){

    return false;

  }

  const plan =
  plannerEngineState
  .plans
  .get(
    normalizedId
  );

  if(!plan){

    return false;

  }

  if(

    plannerEngineState
    .activePlans
    .size >=

    PLANNER_ENGINE_CONFIG
    .MAX_PARALLEL_PLANS

  ){

    if(

      !plannerEngineState
      .queuedPlans
      .has(
        normalizedId
      )

    ){

      plannerEngineState
      .queuedPlans
      .add(
        normalizedId
      );

      plannerEngineState
      .executionQueue
      .push(
        normalizedId
      );
    }

    plannerEngineState
    .diagnostics
    .queued++;

    return {
      queued:true
    };

  }

  plannerEngineState
  .executionLocks
  .add(
    normalizedId
  );

  plannerEngineState
  .activePlans
  .add(
    normalizedId
  );

  plan.runtime.running =
  true;

  plan.runtime.startedAt =
  Date.now();

  plan.state =
  PLAN_STATES
  .EXECUTING;

  plannerEngineState
  .diagnostics
  .executed++;

  try{

    const completedSteps = [];

    for(
      const step
      of plan.steps
    ){

      const result =
      await executePlanStep(
        plan,
        step
      );

      completedSteps.push(
        result
      );

      if(

        result.state !==
        PLAN_STEP_STATES
        .COMPLETED

      ){

        throw new Error(
          "PLAN STEP FAILED"
        );

      }

    }

    plan.steps =
    completedSteps;

    plan.state =
    PLAN_STATES
    .COMPLETED;

    plan.runtime.running =
    false;

    plan.runtime.completedAt =
    Date.now();

    plannerEngineState
    .completedPlans
    .add(
      normalizedId
    );

    plannerEngineState
    .diagnostics
    .completed++;

    plannerEngineState
    .executionHistory
    .push({

      planId:
      normalizedId,

      success:true,

      completedAt:
      Date.now()

    });

    trimPlannerHistory();

    await emitPlannerEvent(

      PLAN_EVENTS
      .COMPLETED,

      {

        planId:
        normalizedId

      }

    );

    return true;

  }

  catch(error){

    plan.state =
    PLAN_STATES
    .FAILED;

    plan.runtime.running =
    false;

    plannerEngineState
    .failedPlans
    .add(
      normalizedId
    );

    plannerEngineState
    .diagnostics
    .failed++;

    plannerEngineState
    .executionHistory
    .push({

      planId:
      normalizedId,

      success:false,

      error:
      String(error),

      failedAt:
      Date.now()

    });

    trimPlannerHistory();

    await emitPlannerEvent(

      PLAN_EVENTS
      .FAILED,

      {

        planId:
        normalizedId,

        error:
        String(error)

      }

    );

    return false;

  }

  finally{

    plan.runtime.running =
    false;

    plan.runtime.controller =
    null;

    plannerEngineState
    .activePlans
    .delete(
      normalizedId
    );

    plannerEngineState
    .executionLocks
    .delete(
      normalizedId
    );

    drainPlannerQueue()
    .catch(() => {});

  }

}



// =====================================
// TERMINATE PLAN
// =====================================

async function terminatePlan(
  planId
){

  const normalizedId =
  normalizePlanId(
    planId
  );

  const plan =
  plannerEngineState
  .plans
  .get(
    normalizedId
  );

  if(!plan){

    return false;

  }

  plan.runtime
  .controller
  ?.abort();

  plannerEngineState
  .executionQueue =

    plannerEngineState
    .executionQueue
    .filter((id) => {

      return (
        id !== normalizedId
      );

    });

  plannerEngineState
  .queuedPlans
  .delete(
    normalizedId
  );

  plannerEngineState
  .activePlans
  .delete(
    normalizedId
  );

  plannerEngineState
  .executionLocks
  .delete(
    normalizedId
  );

  plan.runtime.running =
  false;

  plan.state =
  PLAN_STATES
  .TERMINATED;

  plannerEngineState
  .diagnostics
  .terminated++;

  await emitPlannerEvent(

    PLAN_EVENTS
    .TERMINATED,

    {

      planId:
      normalizedId

    }

  );

  return true;

}



// =====================================
// GET PLAN
// =====================================

function getPlan(
  planId
){

  const plan =
  plannerEngineState
  .plans
  .get(
    normalizePlanId(
      planId
    )
  );

  if(!plan){

    return null;

  }

  return freezePlannerObject(
    clonePlannerObject(plan)
  );

}



// =====================================
// LIST PLANS
// =====================================

function listPlans(){

  return freezePlannerObject(

    [

      ...plannerEngineState
      .plans
      .values()

    ]

    .map((plan) => {

      return clonePlannerObject(
        plan
      );

    })

  );

}



// =====================================
// REMOVE PLAN
// =====================================

async function removePlan(
  planId
){

  const normalizedId =
  normalizePlanId(
    planId
  );

  plannerEngineState
  .queuedPlans
  .delete(
    normalizedId
  );

  plannerEngineState
  .activePlans
  .delete(
    normalizedId
  );

  plannerEngineState
  .executionLocks
  .delete(
    normalizedId
  );

  return plannerEngineState
  .plans
  .delete(
    normalizedId
  );

}



// =====================================
// PROCESS REQUEST
// =====================================

async function processPlannerRequest(
  payload = {}
){

  const plan =
  await generateExecutionPlan(
    payload
  );

  if(!plan){

    return false;

  }

  await executePlan(
    plan.id
  );

  return getPlan(
    plan.id
  );

}



// =====================================
// SNAPSHOT
// =====================================

function createPlannerSnapshot(){

  return freezePlannerObject({

    initialized:
    plannerEngineState
    .initialized,

    plans:
    plannerEngineState
    .plans
    .size,

    activePlans:
    plannerEngineState
    .activePlans
    .size,

    completedPlans:
    plannerEngineState
    .completedPlans
    .size,

    failedPlans:
    plannerEngineState
    .failedPlans
    .size,

    queue:
    plannerEngineState
    .executionQueue
    .length,

    timestamp:
    Date.now()

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function getPlannerDiagnostics(){

  return freezePlannerObject({

    initialized:
    plannerEngineState
    .initialized,

    plans:
    plannerEngineState
    .plans
    .size,

    activePlans:
    plannerEngineState
    .activePlans
    .size,

    queue:
    plannerEngineState
    .executionQueue
    .length,

    diagnostics:
    clonePlannerDiagnostics(),

    timestamp:
    Date.now()

  });

}



// =====================================
// RESET
// =====================================

async function resetPlannerEngine(){

  for(
    const planId
    of
    plannerEngineState
    .activePlans
  ){

    await terminatePlan(
      planId
    );

  }

  plannerEngineState
  .plans
  .clear();

  plannerEngineState
  .activePlans
  .clear();

  plannerEngineState
  .queuedPlans
  .clear();

  plannerEngineState
  .executionLocks
  .clear();

  plannerEngineState
  .executionQueue =
  [];

  plannerEngineState
  .executionHistory =
  [];

  plannerEngineState
  .completedPlans
  .clear();

  plannerEngineState
  .failedPlans
  .clear();

  return true;

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownPlannerEngine(){

  plannerEngineState
  .shuttingDown =
  true;

  await resetPlannerEngine();

  plannerEngineState
  .initialized =
  false;

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializePlannerEngine(){

  if(
    plannerEngineState
    .initialized
  ){

    return true;

  }

  plannerEngineState
  .initialized =
  true;

  plannerEngineState
  .shuttingDown =
  false;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const PlannerEngine =
Object.freeze({

  initialize:
  initializePlannerEngine,

  shutdown:
  shutdownPlannerEngine,

  generate:
  generateExecutionPlan,

  execute:
  executePlan,

  terminate:
  terminatePlan,

  process:
  processPlannerRequest,

  get:
  getPlan,

  list:
  listPlans,

  remove:
  removePlan,

  diagnostics:
  getPlannerDiagnostics,

  snapshot:
  createPlannerSnapshot,

  reset:
  resetPlannerEngine

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.PlannerEngine =
  PlannerEngine;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis.PlannerEngine =
  PlannerEngine;

}
