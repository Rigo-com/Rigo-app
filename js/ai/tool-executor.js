// =====================================
// RIGO AI
// TOOL EXECUTOR
// ENTERPRISE AI EXECUTION FINAL
// =====================================



// =====================================
// TOOL CONFIG
// =====================================

const TOOL_EXECUTOR_CONFIG =
Object.freeze({

  ENABLE_TOOL_EVENTS:true,

  ENABLE_TOOL_DIAGNOSTICS:true,

  ENABLE_TOOL_TIMEOUTS:true,

  ENABLE_TOOL_RETRIES:true,

  ENABLE_TOOL_PERMISSIONS:true,

  ENABLE_SANDBOX_MODE:true,

  ENABLE_EXECUTION_QUEUE:true,

  MAX_TOOLS:
  1000,

  MAX_QUEUE_SIZE:
  5000,

  MAX_RETRIES:
  3,

  EXECUTION_TIMEOUT:
  30000

});



// =====================================
// TOOL STATES
// =====================================

const TOOL_STATES =
Object.freeze({

  REGISTERED:"registered",

  READY:"ready",

  RUNNING:"running",

  FAILED:"failed",

  DISABLED:"disabled"

});



// =====================================
// TOOL EVENTS
// =====================================

const TOOL_EVENTS =
Object.freeze({

  REGISTERED:
  "tool.registered",

  EXECUTION_STARTED:
  "tool.execution.started",

  EXECUTION_COMPLETED:
  "tool.execution.completed",

  EXECUTION_FAILED:
  "tool.execution.failed",

  EXECUTION_TIMEOUT:
  "tool.execution.timeout",

  DISABLED:
  "tool.disabled"

});



// =====================================
// TOOL STATE
// =====================================

const toolExecutorState =
Object.seal({

  initialized:false,

  tools:
  new Map(),

  executionQueue:[],

  activeExecutions:
  new Map(),

  disabledTools:
  new Set(),

  diagnostics:{

    registered:0,

    executed:0,

    failed:0,

    retries:0,

    timeouts:0,

    queueProcessed:0

  },

  lastExecutionAt:null

});



// =====================================
// HELPERS
// =====================================

function normalizeToolName(
  toolName
){

  return String(
    toolName || ""
  )
  .trim()
  .toLowerCase();

}



function freezeToolObject(
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

      freezeToolObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



async function emitToolEvent(
  eventName,
  payload = {}
){

  if(

    !TOOL_EXECUTOR_CONFIG
    .ENABLE_TOOL_EVENTS

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

        source:"tool-executor",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



function createToolExecutionId(){

  return (

    "tool_exec_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// TOOL OBJECT
// =====================================

function createToolObject(
  config = {}
){

  return {

    id:
    normalizeToolName(

      config.id ||

      createMemoryId()

    ),

    name:

      String(
        config.name ||
        "tool"
      ),

    description:

      String(
        config.description ||
        ""
      ),

    permissions:

      Array.isArray(
        config.permissions
      )

      ? config.permissions

      : [],

    execute:
    config.execute,

    timeout:

      Number(
        config.timeout
      )

      ||

      TOOL_EXECUTOR_CONFIG
      .EXECUTION_TIMEOUT,

    retries:0,

    state:
    TOOL_STATES
    .REGISTERED,

    createdAt:
    Date.now()

  };

}



// =====================================
// REGISTER TOOL
// =====================================

async function registerTool(
  config = {}
){

  if(

    toolExecutorState
    .tools
    .size >=

    TOOL_EXECUTOR_CONFIG
    .MAX_TOOLS

  ){

    return false;

  }

  if(
    typeof config.execute !==
    "function"
  ){

    return false;

  }

  const tool =
  createToolObject(
    config
  );

  if(

    toolExecutorState
    .tools
    .has(tool.id)

  ){

    return false;

  }

  tool.state =
  TOOL_STATES.READY;

  toolExecutorState
  .tools
  .set(
    tool.id,
    tool
  );

  toolExecutorState
  .diagnostics
  .registered++;

  await emitToolEvent(

    TOOL_EVENTS
    .REGISTERED,

    {

      toolId:
      tool.id

    }

  );

  return freezeToolObject(
    tool
  );

}



// =====================================
// TOOL PERMISSIONS
// =====================================

function validateToolPermissions(
  tool,
  context = {}
){

  if(

    !TOOL_EXECUTOR_CONFIG
    .ENABLE_TOOL_PERMISSIONS

  ){

    return true;

  }

  if(
    tool.permissions.length <= 0
  ){

    return true;

  }

  const grantedPermissions =

    Array.isArray(
      context.permissions
    )

    ? context.permissions

    : [];

  return tool.permissions
  .every((permission) => {

    return grantedPermissions
    .includes(
      permission
    );

  });

}



// =====================================
// TIMEOUT WRAPPER
// =====================================

async function executeWithTimeout(
  callback,
  timeout
){

  return Promise.race([

    Promise.resolve()
    .then(callback),

    new Promise((_,reject) => {

      setTimeout(() => {

        reject(

          new Error(
            "TOOL EXECUTION TIMEOUT"
          )

        );

      },timeout);

    })

  ]);

}



// =====================================
// NORMALIZE RESULT
// =====================================

function normalizeToolResult(
  result
){

  try{

    return freezeToolObject({

      success:true,

      result:

        result === undefined

        ? null

        : result,

      timestamp:
      Date.now()

    });

  }

  catch(error){

    return freezeToolObject({

      success:false,

      error:
      String(error),

      timestamp:
      Date.now()

    });

  }

}



// =====================================
// EXECUTE TOOL
// =====================================

async function executeTool(
  toolId,
  payload = {},
  context = {}
){

  const normalizedId =
  normalizeToolName(
    toolId
  );

  const tool =

    toolExecutorState
    .tools
    .get(
      normalizedId
    );

  if(!tool){

    return false;

  }

  if(

    toolExecutorState
    .disabledTools
    .has(
      normalizedId
    )

  ){

    return false;

  }

  const validPermissions =
  validateToolPermissions(

    tool,

    context

  );

  if(!validPermissions){

    return false;

  }

  const executionId =
  createToolExecutionId();

  tool.state =
  TOOL_STATES.RUNNING;

  toolExecutorState
  .activeExecutions
  .set(

    executionId,

    {

      toolId:
      normalizedId,

      startedAt:
      Date.now()

    }

  );

  await emitToolEvent(

    TOOL_EVENTS
    .EXECUTION_STARTED,

    {

      toolId:
      normalizedId,

      executionId

    }

  );

  try{

    const result =
    await executeWithTimeout(

      () => {

        return tool.execute({

          payload:

            freezeToolObject(
              payload
            ),

          context:

            freezeToolObject(
              context
            ),

          state:
          StateManager,

          memory:

            typeof MemorySystem !==
            "undefined"

            ? MemorySystem

            : null,

          agent:
          AgentManager,

          diagnostics:
          diagnosticsState

        });

      },

      tool.timeout

    );

    tool.state =
    TOOL_STATES.READY;

    toolExecutorState
    .diagnostics
    .executed++;

    toolExecutorState
    .diagnostics
    .queueProcessed++;

    toolExecutorState
    .lastExecutionAt =
    Date.now();

    toolExecutorState
    .activeExecutions
    .delete(
      executionId
    );

    await emitToolEvent(

      TOOL_EVENTS
      .EXECUTION_COMPLETED,

      {

        toolId:
        normalizedId,

        executionId

      }

    );

    return normalizeToolResult(
      result
    );

  }

  catch(error){

    tool.retries++;

    tool.state =
    TOOL_STATES
    .FAILED;

    toolExecutorState
    .diagnostics
    .failed++;

    toolExecutorState
    .activeExecutions
    .delete(
      executionId
    );

    if(

      String(error)
      .includes(
        "TIMEOUT"
      )

    ){

      toolExecutorState
      .diagnostics
      .timeouts++;

      await emitToolEvent(

        TOOL_EVENTS
        .EXECUTION_TIMEOUT,

        {

          toolId:
          normalizedId,

          executionId

        }

      );

    }

    await emitToolEvent(

      TOOL_EVENTS
      .EXECUTION_FAILED,

      {

        toolId:
        normalizedId,

        executionId,

        error:
        String(error)

      }

    );

    if(

      TOOL_EXECUTOR_CONFIG
      .ENABLE_TOOL_RETRIES &&

      tool.retries <

      TOOL_EXECUTOR_CONFIG
      .MAX_RETRIES

    ){

      toolExecutorState
      .diagnostics
      .retries++;

      return executeTool(

        normalizedId,

        payload,

        context

      );

    }

    return normalizeToolResult({

      error:
      String(error)

    });

  }

}



// =====================================
// QUEUE EXECUTION
// =====================================

async function queueToolExecution(
  toolId,
  payload = {},
  context = {}
){

  if(

    toolExecutorState
    .executionQueue
    .length >=

    TOOL_EXECUTOR_CONFIG
    .MAX_QUEUE_SIZE

  ){

    return false;

  }

  const queuedTask =
  freezeToolObject({

    id:
    createToolExecutionId(),

    toolId:
    normalizeToolName(
      toolId
    ),

    payload,

    context,

    createdAt:
    Date.now()

  });

  toolExecutorState
  .executionQueue
  .push(
    queuedTask
  );

  return true;

}



// =====================================
// PROCESS QUEUE
// =====================================

async function processExecutionQueue(){

  while(

    toolExecutorState
    .executionQueue
    .length > 0

  ){

    const queuedTask =

      toolExecutorState
      .executionQueue
      .shift();

    if(!queuedTask){

      continue;

    }

    await executeTool(

      queuedTask.toolId,

      queuedTask.payload,

      queuedTask.context

    );

  }

  return true;

}



// =====================================
// DISABLE TOOL
// =====================================

async function disableTool(
  toolId
){

  const normalizedId =
  normalizeToolName(
    toolId
  );

  if(

    !toolExecutorState
    .tools
    .has(
      normalizedId
    )

  ){

    return false;

  }

  toolExecutorState
  .disabledTools
  .add(
    normalizedId
  );

  const tool =

    toolExecutorState
    .tools
    .get(
      normalizedId
    );

  tool.state =
  TOOL_STATES
  .DISABLED;

  await emitToolEvent(

    TOOL_EVENTS
    .DISABLED,

    {

      toolId:
      normalizedId

    }

  );

  return true;

}



// =====================================
// DIAGNOSTICS
// =====================================

function getToolExecutorDiagnostics(){

  return freezeToolObject({

    initialized:
    toolExecutorState
    .initialized,

    tools:

      toolExecutorState
      .tools
      .size,

    queueSize:

      toolExecutorState
      .executionQueue
      .length,

    activeExecutions:

      toolExecutorState
      .activeExecutions
      .size,

    disabledTools:

      toolExecutorState
      .disabledTools
      .size,

    diagnostics:

      toolExecutorState
      .diagnostics,

    lastExecutionAt:

      toolExecutorState
      .lastExecutionAt

  });

}



// =====================================
// RESET
// =====================================

async function resetToolExecutor(){

  toolExecutorState
  .tools
  .clear();

  toolExecutorState
  .executionQueue = [];

  toolExecutorState
  .activeExecutions
  .clear();

  toolExecutorState
  .disabledTools
  .clear();

  toolExecutorState
  .diagnostics = {

    registered:0,

    executed:0,

    failed:0,

    retries:0,

    timeouts:0,

    queueProcessed:0

  };

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeToolExecutor(){

  if(
    toolExecutorState
    .initialized
  ){

    return true;

  }

  toolExecutorState
  .initialized =
  true;

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const ToolExecutor =
Object.freeze({

  initialize:
  initializeToolExecutor,

  register:
  registerTool,

  execute:
  executeTool,

  queue:
  queueToolExecution,

  processQueue:
  processExecutionQueue,

  disable:
  disableTool,

  diagnostics:
  getToolExecutorDiagnostics,

  reset:
  resetToolExecutor

});
