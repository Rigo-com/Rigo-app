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

  MAX_PARALLEL_STEPS:
  10,

  WORKFLOW_TIMEOUT:
  600000,

  RETRY_DELAY:
  500,

  MAX_CONTEXT_SIZE:
  100000,

  MAX_EXECUTION_HISTORY:
  500

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

  initializing:false,

  workflows:
  new Map(),

  activeWorkflows:
  new Set(),

  executionLocks:
  new Set(),

  executionHistory:[],

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

    executedSteps:0,

    retries:0,

    rejected:0

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



function cloneWorkflowObject(
  value
){

  try{

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  }

  catch(error){

    return {};
  }

}



function cloneWorkflowDiagnostics(){

  return freezeWorkflowObject({

    ...workflowEngineState
    .diagnostics

  });

}



function createWorkflowId(){

  try{

    if(
      typeof createMemoryId ===
      "function"
    ){

      return createMemoryId();

    }

  }

  catch(error){}

  return (

    "workflow_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



function delayWorkflowExecution(
  duration
){

  return new Promise((resolve) => {

    setTimeout(
      resolve,
      duration
    );

  });

}



function serializeWorkflowContext(
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



function isWorkflowContextValid(
  value
){

  const serialized =
  serializeWorkflowContext(
    value
  );

  return (

    serialized.length <=

    WORKFLOW_ENGINE_CONFIG
    .MAX_CONTEXT_SIZE

  );

}



function trimWorkflowHistory(){

  while(

    workflowEngineState
    .executionHistory
    .length >

    WORKFLOW_ENGINE_CONFIG
    .MAX_EXECUTION_HISTORY

  ){

    workflowEngineState
    .executionHistory
    .shift();

  }

  return true;

}



function createWorkflowSnapshot(){

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

    history:

      workflowEngineState
      .executionHistory
      .length,

    timestamp:
    Date.now()

  });

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



async function executeWithWorkflowTimeout(
  callback,
  timeout
){

  let timeoutId = null;

  try{

    const timeoutPromise =
    new Promise((_,reject) => {

      timeoutId =
      setTimeout(() => {

        reject(

          new Error(
            "WORKFLOW STEP TIMEOUT"
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



// =====================================
// SAFE STEP EXECUTION
// =====================================

async function safelyExecuteStep(
  step,
  payload
){

  if(
    typeof step.execute !==
    "function"
  ){

    return true;

  }

  return executeWithWorkflowTimeout(

    () => {

      return step.execute(
        payload
      );

    },

    WORKFLOW_ENGINE_CONFIG
    .WORKFLOW_TIMEOUT

  );

}



// =====================================
// WORKFLOW OBJECT
// =====================================

function createWorkflowObject(
  config = {}
){

  const steps =

    Array.isArray(
      config.steps
    )

    ? config.steps
    .slice(

      0,

      WORKFLOW_ENGINE_CONFIG
      .MAX_STEPS

    )

    : [];

  return {

    id:
    normalizeWorkflowId(

      config.id ||

      createWorkflowId()

    ),

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
    steps.map((step) => {

      return {

        id:

          normalizeWorkflowId(

            step.id ||

            createWorkflowId()

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

    }),

    metadata:
    cloneWorkflowObject(

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
    !workflow.id
  ){

    return false;

  }

  if(

    workflowEngineState
    .workflows
    .has(workflow.id)

  ){

    return false;

  }

  const readyWorkflow =
  freezeWorkflowObject({

    ...workflow,

    state:
    WORKFLOW_STATES
    .READY

  });

  workflowEngineState
  .workflows
  .set(
    workflow.id,
    readyWorkflow
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

  return readyWorkflow;

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

    return Boolean(

      await step.condition(

        cloneWorkflowObject(
          context
        )

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
  originalStep,
  context = {}
){

  const step = {

    ...cloneWorkflowObject(
      originalStep
    )

  };

  const validCondition =
  await validateStepCondition(

    step,

    context

  );

  if(!validCondition){

    return freezeWorkflowObject({

      ...step,

      state:
      WORKFLOW_STEP_STATES
      .SKIPPED

    });

  }

  let attempts = 0;

  while(

    attempts <

    WORKFLOW_ENGINE_CONFIG
    .MAX_RETRIES

  ){

    attempts++;

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

      await safelyExecuteStep(

        step,

        {

          workflow:

            cloneWorkflowObject(
              workflow
            ),

          step:
          cloneWorkflowObject(
            step
          ),

          context:
          cloneWorkflowObject(
            context
          ),

          tools:

            typeof ToolExecutor !==
            "undefined"

            ? ToolExecutor

            : null,

          agents:

            typeof AgentManager !==
            "undefined"

            ? AgentManager

            : null,

          state:

            typeof StateManager !==
            "undefined"

            ? StateManager

            : null,

          memory:

            typeof MemorySystem !==
            "undefined"

            ? MemorySystem

            : null,

          contexts:

            typeof ContextManager !==
            "undefined"

            ? ContextManager

            : null

        }

      );

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

      return freezeWorkflowObject({

        ...step,

        retries:
        attempts - 1,

        state:
        WORKFLOW_STEP_STATES
        .COMPLETED

      });

    }

    catch(error){

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

        attempts >=

        WORKFLOW_ENGINE_CONFIG
        .MAX_RETRIES

      ){

        return freezeWorkflowObject({

          ...step,

          retries:
          attempts,

          state:
          WORKFLOW_STEP_STATES
          .FAILED

        });

      }

      workflowEngineState
      .diagnostics
      .retries++;

      await delayWorkflowExecution(

        WORKFLOW_ENGINE_CONFIG
        .RETRY_DELAY

      );

    }

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

  const limitedSteps =
  steps.slice(

    0,

    WORKFLOW_ENGINE_CONFIG
    .MAX_PARALLEL_STEPS

  );

  const executions =
  limitedSteps.map((step) => {

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

      &&

      result.value
      ?.state ===

      WORKFLOW_STEP_STATES
      .COMPLETED

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

  if(
    !normalizedId
  ){

    return false;

  }

  if(

    workflowEngineState
    .executionLocks
    .has(
      normalizedId
    )

  ){

    return false;

  }

  if(
    !isWorkflowContextValid(
      context
    )
  ){

    workflowEngineState
    .diagnostics
    .rejected++;

    return false;

  }

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

  workflowEngineState
  .executionLocks
  .add(
    normalizedId
  );

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

  let attempts = 0;

  try{

    while(

      attempts <

      WORKFLOW_ENGINE_CONFIG
      .MAX_RETRIES

    ){

      attempts++;

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

        for(
          const step
          of sequentialSteps
        ){

          const result =
          await executeWorkflowStep(

            workflow,

            step,

            context

          );

          if(

            result.state !==
            WORKFLOW_STEP_STATES
            .COMPLETED

          ){

            throw new Error(
              "WORKFLOW STEP FAILED"
            );

          }

        }

        workflowEngineState
        .completedWorkflows
        .add(
          normalizedId
        );

        workflowEngineState
        .failedWorkflows
        .delete(
          normalizedId
        );

        workflowEngineState
        .executionHistory
        .push({

          workflowId:
          normalizedId,

          success:true,

          timestamp:
          Date.now()

        });

        trimWorkflowHistory();

        workflowEngineState
        .diagnostics
        .completed++;

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

        workflowEngineState
        .diagnostics
        .failed++;

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

          attempts >=

          WORKFLOW_ENGINE_CONFIG
          .MAX_RETRIES

        ){

          workflowEngineState
          .failedWorkflows
          .add(
            normalizedId
          );

          workflowEngineState
          .executionHistory
          .push({

            workflowId:
            normalizedId,

            success:false,

            error:
            String(error),

            timestamp:
            Date.now()

          });

          trimWorkflowHistory();

          return false;

        }

        workflowEngineState
        .diagnostics
        .retries++;

        await delayWorkflowExecution(

          WORKFLOW_ENGINE_CONFIG
          .RETRY_DELAY

        );

      }

    }

  }

  finally{

    workflowEngineState
    .activeWorkflows
    .delete(
      normalizedId
    );

    workflowEngineState
    .executionLocks
    .delete(
      normalizedId
    );

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

  if(
    !normalizedId
  ){

    return false;

  }

  const workflow =

    workflowEngineState
    .workflows
    .get(
      normalizedId
    );

  if(!workflow){

    return false;

  }

  workflowEngineState
  .activeWorkflows
  .delete(
    normalizedId
  );

  workflowEngineState
  .executionLocks
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
// HEALTH REPORT
// =====================================

function getWorkflowHealthReport(){

  return freezeWorkflowObject({

    initialized:
    workflowEngineState
    .initialized,

    healthy:

      workflowEngineState
      .activeWorkflows
      .size <=

      WORKFLOW_ENGINE_CONFIG
      .MAX_CONCURRENT_WORKFLOWS,

    workflows:

      workflowEngineState
      .workflows
      .size,

    activeWorkflows:

      workflowEngineState
      .activeWorkflows
      .size,

    diagnostics:
    cloneWorkflowDiagnostics(),

    timestamp:
    Date.now()

  });

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

    history:

      workflowEngineState
      .executionHistory
      .length,

    diagnostics:
    cloneWorkflowDiagnostics(),

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
  .executionLocks
  .clear();

  workflowEngineState
  .executionHistory =
  [];

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

    executedSteps:0,

    retries:0,

    rejected:0

  };

  workflowEngineState
  .lastWorkflowAt =
  null;

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

  if(
    workflowEngineState
    .initializing
  ){

    return false;

  }

  workflowEngineState
  .initializing =
  true;

  try{

    workflowEngineState
    .initialized =
    true;

    if(
      typeof registerModule ===
      "function"
    ){

      await registerModule(

        "workflow-engine",

        async () => WorkflowEngine

      );

    }

    return true;

  }

  catch(error){

    workflowEngineState
    .initialized =
    false;

    return false;

  }

  finally{

    workflowEngineState
    .initializing =
    false;

  }

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

  health:
  getWorkflowHealthReport,

  snapshot:
  createWorkflowSnapshot,

  reset:
  resetWorkflowEngine

});
