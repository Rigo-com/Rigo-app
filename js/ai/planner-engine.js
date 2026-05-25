// =====================================
// RIGO AI
// PLANNER ENGINE
// FULL HARDENED PRODUCTION ORCHESTRATION RUNTIME
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

  ENABLE_PLAN_ABORT:
  true,

  ENABLE_PLAN_QUEUE:
  true,

  MAX_PLANS:
  1000,

  MAX_PLAN_STEPS:
  200,

  MAX_RETRIES:
  3,

  MAX_PARALLEL_PLANS:
  50,

  MAX_QUEUE_SIZE:
  500,

  MAX_CONTEXT_SIZE:
  100000,

  PLAN_TIMEOUT:
  300000,

  RETRY_DELAY:
  500,

  MAX_EXECUTION_HISTORY:
  500

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

  visited.add(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezePlannerObject(
        nestedValue,
        visited
      );

    }

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

    history:

      plannerEngineState
      .executionHistory
      .length,

    queue:

      plannerEngineState
      .executionQueue
      .length,

    timestamp:
    Date.now()

  });

}



async function executeWithPlanTimeout(
  callback,
  timeout,
  controller = null
){

  let timeoutId = null;

  try{

    const timeoutPromise =
    new Promise((_,reject) => {

      timeoutId =
      setTimeout(() => {

        controller
        ?.abort();

        reject(

          new Error(
            "PLAN EXECUTION TIMEOUT"
          )

        );

      },

      timeout);

    });

    return await Promise.race([

      Promise.resolve()
      .then(callback),

      timeoutPromise

    ]);

  }

  finally{

    if(
      timeoutId
    ){

      clearTimeout(
        timeoutId
      );

    }

  }

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



// =====================================
// PLAN OBJECT
// =====================================

function createPlanObject(
  config = {}
){

  const runtime = {

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

  return {

    ...freezePlannerObject({

      id:
      normalizePlanId(

        config.id ||

        createPlannerId()

      ),

      goal:

        String(
          config.goal ||
          ""
        ),

      description:

        String(
          config.description ||
          ""
        ),

      priority:

        Number(
          config.priority
        )

        || 1,

      retries:0,

      state:
      PLAN_STATES
      .CREATED,

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

        : [],

      steps:[],

      context:
      clonePlannerObject(
        config.context || {}
      ),

      metadata:
      clonePlannerObject(
        config.metadata || {}
      ),

      createdAt:
      Date.now(),

      updatedAt:
      Date.now()

    }),

    runtime

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

      state:

        PLAN_STEP_STATES
        .PENDING

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
        AGENT_STATES.READY
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

  const basePlan =
  createPlanObject(
    config
  );

  if(

    plannerEngineState
    .plans
    .has(
      basePlan.id
    )

  ){

    plannerEngineState
    .diagnostics
    .rejected++;

    return false;

  }

  plannerEngineState
  .diagnostics
  .created++;

  plannerEngineState
  .lastPlanAt =
  Date.now();

  await emitPlannerEvent(

    PLAN_EVENTS
    .CREATED,

    {

      planId:
      basePlan.id

    }

  );

  try{

    const decomposedSteps =
    decomposeGoal(
      basePlan.goal
    );

    const selectedTools =
    selectToolsForGoal(
      basePlan.goal
    );

    const assignedAgent =
    assignAgentToPlan();

    const enrichedSteps =
    decomposedSteps.map((step) => {

      return {

        ...step,

        retries:0,

        assignedTool:

          selectedTools[0]

          || null,

        assignedAgent,

        state:

          PLAN_STEP_STATES
          .READY

      };

    });

    plannerEngineState
    .diagnostics
    .analyzed++;

    await emitPlannerEvent(

      PLAN_EVENTS
      .ANALYZED,

      {

        planId:
        basePlan.id

      }

    );

    const finalizedPlan = {

      ...basePlan,

      state:
      PLAN_STATES
      .PLANNED,

      selectedTools,

      assignedAgent,

      steps:
      enrichedSteps,

      updatedAt:
      Date.now()

    };

    plannerEngineState
    .plans
    .set(
      finalizedPlan.id,
      finalizedPlan
    );

    plannerEngineState
    .diagnostics
    .generated++;

    await emitPlannerEvent(

      PLAN_EVENTS
      .GENERATED,

      {

        planId:
        finalizedPlan.id

      }

    );

    return freezePlannerObject(
      clonePlannerObject(
        finalizedPlan
      )
    );

  }

  catch(error){

    await emitPlannerEvent(

      PLAN_EVENTS
      .FAILED,

      {

        planId:
        basePlan.id,

        error:
        String(error)

      }

    );

    return false;

  }

}



// =====================================
// EXECUTE PLAN STEP
// =====================================

async function executePlanStep(
  plan,
  originalStep
){

  const step = {

    ...clonePlannerObject(
      originalStep
    )

  };

  let attempts = 0;

  while(

    attempts <

    PLANNER_ENGINE_CONFIG
    .MAX_RETRIES

  ){

    attempts++;

    try{

      if(

        plan.runtime
        .controller
        ?.signal
        ?.aborted

      ){

        throw new Error(
          "PLAN ABORTED"
        );

      }

      if(

        step.executable ===
        true

        &&

        !step.assignedTool

      ){

        throw new Error(
          "NO TOOL ASSIGNED"
        );

      }

      if(
        step.assignedTool
      ){

        const result =
        await ToolExecutor
        .execute(

          step
          .assignedTool,

          {

            objective:
            step
            .objective,

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
          !result ||
          result.success !==
          true
        ){

          throw new Error(
            "PLAN TOOL EXECUTION FAILED"
          );

        }

      }

      await emitPlannerEvent(

        PLAN_EVENTS
        .STEP_COMPLETED,

        {

          planId:
          plan.id,

          stepId:
          step.id

        }

      );

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

  const originalPlan =

    plannerEngineState
    .plans
    .get(
      normalizedId
    );

  if(!originalPlan){

    plannerEngineState
    .diagnostics
    .rejected++;

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

      plannerEngineState
      .executionQueue
      .length >=

      PLANNER_ENGINE_CONFIG
      .MAX_QUEUE_SIZE

    ){

      plannerEngineState
      .diagnostics
      .rejected++;

      return false;

    }

    plannerEngineState
    .executionQueue
    .push(
      normalizedId
    );

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

  plannerEngineState
  .diagnostics
  .executed++;

  originalPlan.runtime
  .running =
  true;

  originalPlan.runtime
  .startedAt =
  Date.now();

  originalPlan.state =
  PLAN_STATES
  .EXECUTING;

  await emitPlannerEvent(

    PLAN_EVENTS
    .EXECUTION_STARTED,

    {

      planId:
      normalizedId

    }

  );

  let attempts = 0;

  try{

    while(

      attempts <

      PLANNER_ENGINE_CONFIG
      .MAX_RETRIES

    ){

      attempts++;

      try{

        const completedSteps = [];

        await executeWithPlanTimeout(

          async () => {

            for(
              const step
              of originalPlan.steps
            ){

              if(

                originalPlan
                .runtime
                .controller
                ?.signal
                ?.aborted

              ){

                throw new Error(
                  "PLAN TERMINATED"
                );

              }

              const result =
              await executePlanStep(
                originalPlan,
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

          },

          PLANNER_ENGINE_CONFIG
          .PLAN_TIMEOUT,

          originalPlan.runtime
          .controller

        );

        originalPlan.runtime
        .running =
        false;

        originalPlan.runtime
        .completedAt =
        Date.now();

        originalPlan.state =
        PLAN_STATES
        .COMPLETED;

        originalPlan.steps =
        completedSteps;

        plannerEngineState
        .completedPlans
        .add(
          normalizedId
        );

        plannerEngineState
        .executionHistory
        .push({

          planId:
          normalizedId,

          success:true,

          timestamp:
          Date.now()

        });

        trimPlannerHistory();

        plannerEngineState
        .diagnostics
        .completed++;

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

        plannerEngineState
        .diagnostics
        .failed++;

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

        if(

          attempts >=

          PLANNER_ENGINE_CONFIG
          .MAX_RETRIES

        ){

          originalPlan.state =
          PLAN_STATES
          .FAILED;

          originalPlan.retries =
          attempts;

          plannerEngineState
          .failedPlans
          .add(
            normalizedId
          );

          plannerEngineState
          .executionHistory
          .push({

            planId:
            normalizedId,

            success:false,

            error:
            String(error),

            timestamp:
            Date.now()

          });

          trimPlannerHistory();

          return false;

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

  finally{

    originalPlan.runtime
    .running =
    false;

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

    if(

      plannerEngineState
      .executionQueue
      .length > 0

    ){

      const queuedPlan =
      plannerEngineState
      .executionQueue
      .shift();

      executePlan(
        queuedPlan
      )
      .catch(() => {});

    }

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

  plan.runtime
  .running =
  false;

  plan.state =
  PLAN_STATES
  .TERMINATED;

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

  plannerEngineState
  .diagnostics
  .terminated++;

  await emitPlannerEvent(

    PLAN_EVENTS
    .TERMINATED,

    {

      planId:
      normalizedId,

      terminated:true

    }

  );

  return true;

}



// =====================================
// HEALTH REPORT
// =====================================

function getPlannerHealthReport(){

  return freezePlannerObject({

    initialized:
    plannerEngineState
    .initialized,

    healthy:

      plannerEngineState
      .activePlans
      .size <=

      PLANNER_ENGINE_CONFIG
      .MAX_PARALLEL_PLANS,

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

    completedPlans:

      plannerEngineState
      .completedPlans
      .size,

    failedPlans:

      plannerEngineState
      .failedPlans
      .size,

    history:

      plannerEngineState
      .executionHistory
      .length,

    queue:

      plannerEngineState
      .executionQueue
      .length,

    diagnostics:
    clonePlannerDiagnostics(),

    lastPlanAt:

      plannerEngineState
      .lastPlanAt

  });

}



// =====================================
// RESET
// =====================================

async function resetPlannerEngine(){

  plannerEngineState
  .plans
  .clear();

  plannerEngineState
  .activePlans
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

  plannerEngineState
  .diagnostics = {

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

  };

  return true;

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownPlannerEngine(){

  plannerEngineState
  .shuttingDown =
  true;

  for(
    const planId
    of
    plannerEngineState
    .activePlans
  ){

    terminatePlan(
      planId
    )
    .catch(() => {});

  }

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

  if(
    plannerEngineState
    .startupPromise
  ){

    return plannerEngineState
    .startupPromise;

  }

  plannerEngineState
  .startupPromise =

  (async () => {

    if(
      plannerEngineState
      .initializing
    ){

      return false;

    }

    plannerEngineState
    .initializing =
    true;

    try{

      plannerEngineState
      .initialized =
      true;

      plannerEngineState
      .shuttingDown =
      false;

      if(
        typeof registerModule ===
        "function"
      ){

        await registerModule(

          "planner-engine",

          async () => PlannerEngine

        );

      }

      return true;

    }

    finally{

      plannerEngineState
      .initializing =
      false;

      plannerEngineState
      .startupPromise =
      null;

    }

  })();

  return plannerEngineState
  .startupPromise;

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

  diagnostics:
  getPlannerDiagnostics,

  health:
  getPlannerHealthReport,

  snapshot:
  createPlannerSnapshot,

  reset:
  resetPlannerEngine

});



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
