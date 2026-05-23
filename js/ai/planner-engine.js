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

  initializing:false,

  plans:
  new Map(),

  activePlans:
  new Set(),

  executionLocks:
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



function getRegisteredTools(){

  try{

    if(
      typeof ToolExecutor ===
      "undefined"
    ){

      return [];
    }

    return [

      ...toolExecutorState
      .tools
      .values()

    ];

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

    return [

      ...agentManagerState
      .agents
      .values()

    ];

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

  return freezePlannerObject({

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

      ? freezePlannerObject([
          ...config.selectedTools
        ])

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

  });

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

    return freezePlannerObject({

      id:
      createMemoryId(),

      order:
      index + 1,

      objective:
      segment.trim(),

      state:

        PLAN_STEP_STATES
        .PENDING

    });

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
    .plans
    .size >=

    PLANNER_ENGINE_CONFIG
    .MAX_PLANS

  ){

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

      return freezePlannerObject({

        ...step,

        retries:0,

        assignedTool:

          selectedTools[0]

          || null,

        assignedAgent,

        parallel:false,

        state:

          PLAN_STEP_STATES
          .READY

      });

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

    const finalizedPlan =
    freezePlannerObject({

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

    });

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

    return finalizedPlan;

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

  let attempts = 0;

  while(

    attempts <

    PLANNER_ENGINE_CONFIG
    .MAX_RETRIES

  ){

    attempts++;

    try{

      if(
        originalStep.assignedTool
      ){

        await ToolExecutor
        .execute(

          originalStep
          .assignedTool,

          {

            objective:
            originalStep
            .objective

          },

          {

            source:
            "planner-engine"

          }

        );

      }

      await emitPlannerEvent(

        PLAN_EVENTS
        .STEP_COMPLETED,

        {

          planId:
          plan.id,

          stepId:
          originalStep.id

        }

      );

      return freezePlannerObject({

        ...originalStep,

        retries:
        attempts - 1,

        state:
        PLAN_STEP_STATES
        .COMPLETED

      });

    }

    catch(error){

      if(

        attempts >=

        PLANNER_ENGINE_CONFIG
        .MAX_RETRIES

      ){

        return freezePlannerObject({

          ...originalStep,

          retries:
          attempts,

          state:
          PLAN_STEP_STATES
          .FAILED

        });

      }

      plannerEngineState
      .diagnostics
      .replans++;

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

        for(
          const step
          of originalPlan.steps
        ){

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

        const completedPlan =
        freezePlannerObject({

          ...originalPlan,

          retries:
          attempts - 1,

          state:
          PLAN_STATES
          .COMPLETED,

          steps:
          completedSteps,

          updatedAt:
          Date.now()

        });

        plannerEngineState
        .plans
        .set(
          normalizedId,
          completedPlan
        );

        plannerEngineState
        .completedPlans
        .add(
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

          const failedPlan =
          freezePlannerObject({

            ...originalPlan,

            retries:
            attempts,

            state:
            PLAN_STATES
            .FAILED,

            updatedAt:
            Date.now()

          });

          plannerEngineState
          .plans
          .set(
            normalizedId,
            failedPlan
          );

          plannerEngineState
          .failedPlans
          .add(
            normalizedId
          );

          return false;

        }

        plannerEngineState
        .diagnostics
        .replans++;

      }

    }

  }

  finally{

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

  const terminatedPlan =
  freezePlannerObject({

    ...plan,

    state:
    PLAN_STATES
    .TERMINATED,

    updatedAt:
    Date.now()

  });

  plannerEngineState
  .plans
  .set(
    normalizedId,
    terminatedPlan
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

    return true;

  }

  finally{

    plannerEngineState
    .initializing =
    false;

  }

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
