// =====================================
// RIGO AI
// WORKFLOW ENGINE
// ENTERPRISE AUTONOMOUS RUNTIME FINAL
// =====================================



// =====================================
// WORKFLOW CONFIG
// =====================================

const WORKFLOW_ENGINE_CONFIG =
Object.freeze({

  ENABLE_WORKFLOW_EVENTS:true,

  ENABLE_PERSISTENCE:true,

  ENABLE_RECOVERY:true,

  ENABLE_RETRIES:true,

  ENABLE_CONDITIONALS:true,

  ENABLE_PARALLEL_EXECUTION:true,

  ENABLE_DIAGNOSTICS:true,

  MAX_WORKFLOWS:
  1000,

  MAX_STEPS:
  500,

  MAX_RETRIES:
  3,

  MAX_CONCURRENT_WORKFLOWS:
  50,

  WORKFLOW_TIMEOUT:
  600000

});



// =====================================
// WORKFLOW STATES
// =====================================

const WORKFLOW_STATES =
Object.freeze({

  CREATED:"created",

  READY:"ready",

  RUNNING:"running",

  PAUSED:"paused",

  COMPLETED:"completed",

  FAILED:"failed",

  TERMINATED:"terminated"

});



// =====================================
// STEP STATES
// =====================================

const WORKFLOW_STEP_STATES =
Object.freeze({

  PENDING:"pending",

  RUNNING:"running",

  COMPLETED:"completed",

  FAILED:"failed",

  SKIPPED:"skipped"

});



// =====================================
// WORKFLOW EVENTS
// =====================================

const WORKFLOW_EVENTS =
Object.freeze({

  CREATED:
  "workflow.created",

  STARTED:
  "workflow.started",

  STEP_STARTED:
  "workflow.step.started",

  STEP_COMPLETED:
  "workflow.step.completed",

  STEP_FAILED:
  "workflow.step.failed",

  COMPLETED:
  "workflow.completed",

  FAILED:
  "workflow.failed",

  TERMINATED:
  "workflow.terminated"

});



// =====================================
// WORKFLOW STATE
// =====================================

const workflowEngineState =
Object.seal({

  initialized:false,

  workflows:
  new Map(),

  activeWorkflows:
  new Set(),

  completedWorkflows:
  new Set(),

  failedWorkflows:
  new Set(),

  diagnostics:{

    created:0,

    started:0,

    completed:0,

    failed:0,

    terminated:0,

    executedSteps:0

  },

  lastWorkflowAt:null

});



// =====================================
// HELPERS
// =====================================

function normalizeWorkflowId(
  workflowId
){

  return String(
    workflowId || ""
  )
  .trim()
  .toLowerCase();

}



function freezeWorkflowObject(
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

      freezeWorkflowObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



async function emitWorkflowEvent(
  eventName,
  payload = {}
){

  if(

    !WORKFLOW_ENGINE_CONFIG
    .ENABLE_WORKFLOW_EVENTS

  ){

    return false;

  }

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

        source:"workflow-engine",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// WORKFLOW OBJECT
// =====================================

function createWorkflowObject(
  config = {}
){

  const workflowId =
  normalizeWorkflowId(

    config.id ||

    createMemoryId()

  );

  return {

    id:
    workflowId,

    name:

      String(
        config.name ||
        "workflow"
      ),

    description:

      String(
        config.description ||
        ""
      ),

    state:
    WORKFLOW_STATES
    .CREATED,

    retries:0,

    steps:

      Array.isArray(
        config.steps
      )

      ? config.steps.map((step) => {

          return {

            id:

              normalizeWorkflowId(

                step.id ||

                createMemoryId()

              ),

            name:

              String(
                step.name ||
                "step"
              ),

            type:

              String(
                step.type ||
                "generic"
              ),

            condition:
            step.condition,

            execute:
            step.execute,

            parallel:
            step.parallel ===
            true,

            state:

              WORKFLOW_STEP_STATES
              .PENDING,

            retries:0,

            createdAt:
            Date.now()

          };

        })

      : [],

    metadata:

      freezeWorkflowObject(

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
// REGISTER WORKFLOW
// =====================================

async function registerWorkflow(
  config = {}
){

  if(

    workflowEngineState
    .workflows
    .size >=

    WORKFLOW_ENGINE_CONFIG
    .MAX_WORKFLOWS

  ){

    return false;

  }

  const workflow =
  createWorkflowObject(
    config
  );

  if(

    workflowEngineState
    .workflows
    .has(workflow.id)

  ){

    return false;

  }

  workflow.state =
  WORKFLOW_STATES
  .READY;

  workflowEngineState
  .workflows
  .set(
    workflow.id,
    workflow
  );

  workflowEngineState
  .diagnostics
  .created++;

  workflowEngineState
  .lastWorkflowAt =
  Date.now();

  await emitWorkflowEvent(

    WORKFLOW_EVENTS
    .CREATED,

    {

      workflowId:
      workflow.id

    }

  );

  return freezeWorkflowObject(
    workflow
  );

}



// =====================================
// CONDITIONAL EXECUTION
// =====================================

async function validateStepCondition(
  step,
  context = {}
){

  if(

    !WORKFLOW_ENGINE_CONFIG
    .ENABLE_CONDITIONALS

  ){

    return true;

  }

  if(
    typeof step.condition !==
    "function"
  ){

    return true;

  }

  try{

    return await step.condition(
      freezeWorkflowObject(
        context
      )
    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// STEP EXECUTION
// =====================================

async function executeWorkflowStep(
  workflow,
  step,
  context = {}
){

  const validCondition =
  await validateStepCondition(

    step,

    context

  );

  if(!validCondition){

    step.state =
    WORKFLOW_STEP_STATES
    .SKIPPED;

    return true;

  }

  step.state =
  WORKFLOW_STEP_STATES
  .RUNNING;

  await emitWorkflowEvent(

    WORKFLOW_EVENTS
    .STEP_STARTED,

    {

      workflowId:
      workflow.id,

      stepId:
      step.id

    }

  );

  try{

    if(
      typeof step.execute ===
      "function"
    ){

      await Promise.race([

        Promise.resolve(

          step.execute({

            workflow,

            step,

            context,

            tools:
            ToolExecutor,

            agents:
            AgentManager,

            state:
            StateManager,

            memory:

              typeof MemorySystem !==
              "undefined"

              ? MemorySystem

              : null,

            contexts:
            ContextManager

          })

        ),

        new Promise((_,reject) => {

          setTimeout(() => {

            reject(

              new Error(
                "WORKFLOW STEP TIMEOUT"
              )

            );

          },

          WORKFLOW_ENGINE_CONFIG
          .WORKFLOW_TIMEOUT);

        })

      ]);

    }

    step.state =
    WORKFLOW_STEP_STATES
    .COMPLETED;

    workflowEngineState
    .diagnostics
    .executedSteps++;

    await emitWorkflowEvent(

      WORKFLOW_EVENTS
      .STEP_COMPLETED,

      {

        workflowId:
        workflow.id,

        stepId:
        step.id

      }

    );

    return true;

  }

  catch(error){

    step.retries++;

    step.state =
    WORKFLOW_STEP_STATES
    .FAILED;

    await emitWorkflowEvent(

      WORKFLOW_EVENTS
      .STEP_FAILED,

      {

        workflowId:
        workflow.id,

        stepId:
        step.id,

        error:
        String(error)

      }

    );

    if(

      WORKFLOW_ENGINE_CONFIG
      .ENABLE_RETRIES &&

      step.retries <

      WORKFLOW_ENGINE_CONFIG
      .MAX_RETRIES

    ){

      return executeWorkflowStep(

        workflow,

        step,

        context

      );

    }

    return false;

  }

}



// =====================================
// PARALLEL EXECUTION
// =====================================

async function executeParallelSteps(
  workflow,
  steps = [],
  context = {}
){

  const executions =
  steps.map((step) => {

    return executeWorkflowStep(

      workflow,

      step,

      context

    );

  });

  const results =
  await Promise.allSettled(
    executions
  );

  return results.every((result) => {

    return (
      result.status ===
      "fulfilled"
    );

  });

}



// =====================================
// EXECUTE WORKFLOW
// =====================================

async function executeWorkflow(
  workflowId,
  context = {}
){

  const normalizedId =
  normalizeWorkflowId(
    workflowId
  );

  const workflow =

    workflowEngineState
    .workflows
    .get(
      normalizedId
    );

  if(!workflow){

    return false;

  }

  if(

    workflowEngineState
    .activeWorkflows
    .size >=

    WORKFLOW_ENGINE_CONFIG
    .MAX_CONCURRENT_WORKFLOWS

  ){

    return false;

  }

  workflow.state =
  WORKFLOW_STATES
  .RUNNING;

  workflow.updatedAt =
  Date.now();

  workflowEngineState
  .activeWorkflows
  .add(
    normalizedId
  );

  workflowEngineState
  .diagnostics
  .started++;

  await emitWorkflowEvent(

    WORKFLOW_EVENTS
    .STARTED,

    {

      workflowId:
      normalizedId

    }

  );

  try{

    const parallelSteps =
    workflow.steps.filter((step) => {

      return (
        step.parallel ===
        true
      );

    });

    const sequentialSteps =
    workflow.steps.filter((step) => {

      return (
        step.parallel !==
        true
      );

    });



    // ================================
    // PARALLEL STEPS
    // ================================

    if(
      parallelSteps.length > 0
    ){

      const parallelSuccess =
      await executeParallelSteps(

        workflow,

        parallelSteps,

        context

      );

      if(!parallelSuccess){

        throw new Error(
          "PARALLEL EXECUTION FAILED"
        );

      }

    }



    // ================================
    // SEQUENTIAL STEPS
    // ================================

    for(
      const step
      of sequentialSteps
    ){

      const success =
      await executeWorkflowStep(

        workflow,

        step,

        context

      );

      if(!success){

        throw new Error(
          "WORKFLOW STEP FAILED"
        );

      }

    }

    workflow.state =
    WORKFLOW_STATES
    .COMPLETED;

    workflow.updatedAt =
    Date.now();

    workflowEngineState
    .completedWorkflows
    .add(
      normalizedId
    );

    workflowEngineState
    .diagnostics
    .completed++;

    workflowEngineState
    .activeWorkflows
    .delete(
      normalizedId
    );

    await emitWorkflowEvent(

      WORKFLOW_EVENTS
      .COMPLETED,

      {

        workflowId:
        normalizedId

      }

    );

    return true;

  }

  catch(error){

    workflow.retries++;

    workflow.state =
    WORKFLOW_STATES
    .FAILED;

    workflow.updatedAt =
    Date.now();

    workflowEngineState
    .failedWorkflows
    .add(
      normalizedId
    );

    workflowEngineState
    .diagnostics
    .failed++;

    workflowEngineState
    .activeWorkflows
    .delete(
      normalizedId
    );

    await emitWorkflowEvent(

      WORKFLOW_EVENTS
      .FAILED,

      {

        workflowId:
        normalizedId,

        error:
        String(error)

      }

    );

    if(

      WORKFLOW_ENGINE_CONFIG
      .ENABLE_RECOVERY &&

      workflow.retries <

      WORKFLOW_ENGINE_CONFIG
      .MAX_RETRIES

    ){

      return executeWorkflow(

        normalizedId,

        context

      );

    }

    return false;

  }

}



// =====================================
// TERMINATE WORKFLOW
// =====================================

async function terminateWorkflow(
  workflowId
){

  const normalizedId =
  normalizeWorkflowId(
    workflowId
  );

  const workflow =

    workflowEngineState
    .workflows
    .get(
      normalizedId
    );

  if(!workflow){

    return false;

  }

  workflow.state =
  WORKFLOW_STATES
  .TERMINATED;

  workflow.updatedAt =
  Date.now();

  workflowEngineState
  .activeWorkflows
  .delete(
    normalizedId
  );

  workflowEngineState
  .diagnostics
  .terminated++;

  await emitWorkflowEvent(

    WORKFLOW_EVENTS
    .TERMINATED,

    {

      workflowId:
      normalizedId

    }

  );

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getWorkflowDiagnostics(){

  return freezeWorkflowObject({

    initialized:
    workflowEngineState
    .initialized,

    workflows:

      workflowEngineState
      .workflows
      .size,

    activeWorkflows:

      workflowEngineState
      .activeWorkflows
      .size,

    completedWorkflows:

      workflowEngineState
      .completedWorkflows
      .size,

    failedWorkflows:

      workflowEngineState
      .failedWorkflows
      .size,

    diagnostics:

      workflowEngineState
      .diagnostics,

    lastWorkflowAt:

      workflowEngineState
      .lastWorkflowAt

  });

}



// =====================================
// RESET
// =====================================

async function resetWorkflowEngine(){

  workflowEngineState
  .workflows
  .clear();

  workflowEngineState
  .activeWorkflows
  .clear();

  workflowEngineState
  .completedWorkflows
  .clear();

  workflowEngineState
  .failedWorkflows
  .clear();

  workflowEngineState
  .diagnostics = {

    created:0,

    started:0,

    completed:0,

    failed:0,

    terminated:0,

    executedSteps:0

  };

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeWorkflowEngine(){

  if(
    workflowEngineState
    .initialized
  ){

    return true;

  }

  workflowEngineState
  .initialized =
  true;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const WorkflowEngine =
Object.freeze({

  initialize:
  initializeWorkflowEngine,

  register:
  registerWorkflow,

  execute:
  executeWorkflow,

  terminate:
  terminateWorkflow,

  diagnostics:
  getWorkflowDiagnostics,

  reset:
  resetWorkflowEngine

});
