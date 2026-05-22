// =====================================
// RIGO AI
// PLANNER ENGINE
// SELF ORCHESTRATING AI FINAL
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

  MAX_PLANS:
  1000,

  MAX_GOALS:
  500,

  MAX_PLAN_STEPS:
  200,

  MAX_RETRIES:
  3,

  MAX_PARALLEL_PLANS:
  50

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
  "planner.failed"

});



// =====================================
// PLANNER STATE
// =====================================

const plannerEngineState =
Object.seal({

  initialized:false,

  plans:
  new Map(),

  activePlans:
  new Set(),

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

    replans:0

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

  visited.add(
    value
  );

  Object.freeze(
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

  return value;

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

      {

        source:"planner-engine",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function createPlannerId(){

  return (

    "plan_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

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

      ? config.selectedTools

      : [],

    steps:[],

    context:

      freezePlannerObject(

        config.context ||
        {}

      ),

    metadata:

      freezePlannerObject(

        config.metadata ||
        {}

      ),

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
  .map((segment,index) => {

    return {

      id:
      createMemoryId(),

      order:
      index + 1,

      objective:
      segment.trim(),

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

  if(
    typeof ToolExecutor ===
    "undefined"
  ){

    return [];
  }

  try{

    const tools = [

      ...toolExecutorState
      .tools
      .values()

    ];

    return tools
    .filter((tool) => {

      return String(goal)
      .toLowerCase()
      .includes(

        tool.name
        .toLowerCase()

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

  if(
    typeof AgentManager ===
    "undefined"
  ){

    return null;

  }

  try{

    const agents = [

      ...agentManagerState
      .agents
      .values()

    ];

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
    .plans
    .size >=

    PLANNER_ENGINE_CONFIG
    .MAX_PLANS

  ){

    return false;

  }

  const plan =
  createPlanObject(
    config
  );

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
  .lastPlanAt =
  Date.now();

  await emitPlannerEvent(

    PLAN_EVENTS
    .CREATED,

    {

      planId:
      plan.id

    }

  );

  try{

    plan.state =
    PLAN_STATES
    .ANALYZING;

    const decomposedSteps =
    decomposeGoal(
      plan.goal
    );

    plan.steps =
    decomposedSteps.map((step) => {

      return {

        ...step,

        retries:0,

        assignedTool:null,

        assignedAgent:null,

        parallel:false

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
        plan.id

      }

    );



    // ================================
    // TOOL SELECTION
    // ================================

    plan.selectedTools =
    selectToolsForGoal(
      plan.goal
    );



    // ================================
    // AGENT ASSIGNMENT
    // ================================

    plan.assignedAgent =
    assignAgentToPlan();



    // ================================
    // STEP ENRICHMENT
    // ================================

    plan.steps =
    plan.steps.map((step) => {

      return {

        ...step,

        assignedTool:

          plan.selectedTools[0]

          || null,

        assignedAgent:

          plan.assignedAgent,

        state:

          PLAN_STEP_STATES
          .READY

      };

    });

    plan.state =
    PLAN_STATES
    .PLANNED;

    plan.updatedAt =
    Date.now();

    plannerEngineState
    .diagnostics
    .generated++;

    await emitPlannerEvent(

      PLAN_EVENTS
      .GENERATED,

      {

        planId:
        plan.id

      }

    );

    return freezePlannerObject(
      plan
    );

  }

  catch(error){

    plan.state =
    PLAN_STATES
    .FAILED;

    plannerEngineState
    .diagnostics
    .failed++;

    await emitPlannerEvent(

      PLAN_EVENTS
      .FAILED,

      {

        planId:
        plan.id,

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
  step
){

  step.state =
  PLAN_STEP_STATES
  .RUNNING;

  try{

    if(
      step.assignedTool
    ){

      await ToolExecutor
      .execute(

        step.assignedTool,

        {

          objective:
          step.objective

        },

        {

          source:
          "planner-engine"

        }

      );

    }

    step.state =
    PLAN_STEP_STATES
    .COMPLETED;

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

    return true;

  }

  catch(error){

    step.retries++;

    step.state =
    PLAN_STEP_STATES
    .FAILED;

    if(

      PLANNER_ENGINE_CONFIG
      .ENABLE_REPLANNING &&

      step.retries <

      PLANNER_ENGINE_CONFIG
      .MAX_RETRIES

    ){

      plannerEngineState
      .diagnostics
      .replans++;

      return executePlanStep(
        plan,
        step
      );

    }

    return false;

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

    return false;

  }

  plan.state =
  PLAN_STATES
  .EXECUTING;

  plan.updatedAt =
  Date.now();

  plannerEngineState
  .activePlans
  .add(
    normalizedId
  );

  plannerEngineState
  .diagnostics
  .executed++;

  await emitPlannerEvent(

    PLAN_EVENTS
    .EXECUTION_STARTED,

    {

      planId:
      normalizedId

    }

  );

  try{

    for(
      const step
      of plan.steps
    ){

      const success =
      await executePlanStep(
        plan,
        step
      );

      if(!success){

        throw new Error(
          "PLAN STEP FAILED"
        );

      }

    }

    plan.state =
    PLAN_STATES
    .COMPLETED;

    plan.updatedAt =
    Date.now();

    plannerEngineState
    .completedPlans
    .add(
      normalizedId
    );

    plannerEngineState
    .activePlans
    .delete(
      normalizedId
    );

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

    plan.retries++;

    plan.state =
    PLAN_STATES
    .FAILED;

    plan.updatedAt =
    Date.now();

    plannerEngineState
    .failedPlans
    .add(
      normalizedId
    );

    plannerEngineState
    .activePlans
    .delete(
      normalizedId
    );

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

      PLANNER_ENGINE_CONFIG
      .ENABLE_REPLANNING &&

      plan.retries <

      PLANNER_ENGINE_CONFIG
      .MAX_RETRIES

    ){

      plannerEngineState
      .diagnostics
      .replans++;

      return executePlan(
        normalizedId
      );

    }

    return false;

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

  plan.state =
  PLAN_STATES
  .TERMINATED;

  plan.updatedAt =
  Date.now();

  plannerEngineState
  .activePlans
  .delete(
    normalizedId
  );

  await emitPlannerEvent(

    PLAN_EVENTS
    .FAILED,

    {

      planId:
      normalizedId,

      terminated:true

    }

  );

  return true;

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

    diagnostics:

      plannerEngineState
      .diagnostics,

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

    replans:0

  };

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

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const PlannerEngine =
Object.freeze({

  initialize:
  initializePlannerEngine,

  generate:
  generateExecutionPlan,

  execute:
  executePlan,

  terminate:
  terminatePlan,

  diagnostics:
  getPlannerDiagnostics,

  reset:
  resetPlannerEngine

});
