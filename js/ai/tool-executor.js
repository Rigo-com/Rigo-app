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
  30000,

  RETRY_DELAY:
  500,

  MAX_PAYLOAD_SIZE:
  100000,

  MAX_CONCURRENT_EXECUTIONS:
  50,

  MAX_EXECUTION_HISTORY:
  500

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

  initializing:false,

  processingQueue:false,

  tools:
  new Map(),

  executionQueue:[],

  activeExecutions:
  new Map(),

  executionHistory:[],

  disabledTools:
  new Set(),

  diagnostics:{

    registered:0,

    executed:0,

    failed:0,

    retries:0,

    timeouts:0,

    executionsProcessed:0,

    rejected:0

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



function cloneToolObject(
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

    return null;

  }

}



function cloneToolDiagnostics(){

  return freezeToolObject({

    ...toolExecutorState
    .diagnostics

  });

}



function createToolId(){

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

    "tool_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

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



function delayExecution(
  duration
){

  return new Promise((resolve) => {

    setTimeout(
      resolve,
      duration
    );

  });

}



function serializeToolPayload(
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



function isPayloadValid(
  value
){

  const serialized =
  serializeToolPayload(
    value
  );

  return (

    serialized.length <=

    TOOL_EXECUTOR_CONFIG
    .MAX_PAYLOAD_SIZE

  );

}



function trimExecutionHistory(){

  if(

    toolExecutorState
    .executionHistory
    .length >

    TOOL_EXECUTOR_CONFIG
    .MAX_EXECUTION_HISTORY

  ){

    toolExecutorState
    .executionHistory
    .shift();

  }

  return true;

}



function createToolExecutorSnapshot(){

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

    history:

      toolExecutorState
      .executionHistory
      .length,

    disabledTools:

      toolExecutorState
      .disabledTools
      .size,

    timestamp:
    Date.now()

  });

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



// =====================================
// TOOL OBJECT
// =====================================

function createToolObject(
  config = {}
){

  return freezeToolObject({

    id:
    normalizeToolName(

      config.id ||

      createToolId()

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

      ? freezeToolObject([
          ...config.permissions
        ])

      : [],

    execute:
    config.execute,



    // ================================
    // FUTURE SANDBOX ISOLATION LAYER
    // ================================

    sandboxed:

      config.sandboxed !==
      false,

    timeout:

      Number(
        config.timeout
      )

      ||

      TOOL_EXECUTOR_CONFIG
      .EXECUTION_TIMEOUT,

    createdAt:
    Date.now()

  });

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

  return tool;

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

  let timeoutId = null;

  try{

    const timeoutPromise =
    new Promise((_,reject) => {

      timeoutId =
      setTimeout(() => {

        reject(

          new Error(
            "TOOL EXECUTION TIMEOUT"
          )

        );

      },timeout);

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
// NORMALIZE RESULT
// =====================================

function normalizeToolResult(
  result
){

  try{

    return freezeToolObject({

      success:true,

      result:
      cloneToolObject(

        result === undefined

        ? null

        : result

      ),

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

  if(

    toolExecutorState
    .activeExecutions
    .size >=

    TOOL_EXECUTOR_CONFIG
    .MAX_CONCURRENT_EXECUTIONS

  ){

    return false;

  }

  if(
    !isPayloadValid(
      payload
    )
  ){

    toolExecutorState
    .diagnostics
    .rejected++;

    return false;

  }

  const validPermissions =
  validateToolPermissions(

    tool,

    context

  );

  if(!validPermissions){

    toolExecutorState
    .diagnostics
    .rejected++;

    return false;

  }

  const executionId =
  createToolExecutionId();

  toolExecutorState
  .activeExecutions
  .set(

    executionId,

    freezeToolObject({

      toolId:
      normalizedId,

      startedAt:
      Date.now()

    })

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

  let attempts = 0;

  try{

    while(

      attempts <

      TOOL_EXECUTOR_CONFIG
      .MAX_RETRIES

    ){

      try{

        const result =
        await executeWithTimeout(

          () => {

            return tool.execute({

              payload:
              cloneToolObject(
                payload
              ),

              context:
              cloneToolObject(
                context
              ),

              sandboxed:
              tool.sandboxed,

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

        toolExecutorState
        .executionHistory
        .push({

          toolId:
          normalizedId,

          executionId,

          success:true,

          timestamp:
          Date.now()

        });

        trimExecutionHistory();

        toolExecutorState
        .diagnostics
        .executed++;

        toolExecutorState
        .lastExecutionAt =
        Date.now();

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

        attempts++;

        toolExecutorState
        .diagnostics
        .failed++;

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

          attempts >=

          TOOL_EXECUTOR_CONFIG
          .MAX_RETRIES

        ){

          toolExecutorState
          .executionHistory
          .push({

            toolId:
            normalizedId,

            executionId,

            success:false,

            error:
            String(error),

            timestamp:
            Date.now()

          });

          trimExecutionHistory();

          return freezeToolObject({

            success:false,

            error:
            String(error),

            timestamp:
            Date.now()

          });

        }

        toolExecutorState
        .diagnostics
        .retries++;

        await delayExecution(

          TOOL_EXECUTOR_CONFIG
          .RETRY_DELAY

        );

      }

    }

  }

  finally{

    toolExecutorState
    .activeExecutions
    .delete(
      executionId
    );

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

  if(
    !isPayloadValid(
      payload
    )
  ){

    toolExecutorState
    .diagnostics
    .rejected++;

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

    payload:
    cloneToolObject(
      payload
    ),

    context:
    cloneToolObject(
      context
    ),

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

  if(
    toolExecutorState
    .processingQueue
  ){

    return false;

  }

  toolExecutorState
  .processingQueue =
  true;

  try{

    while(

      toolExecutorState
      .executionQueue
      .length > 0

    ){

      if(

        toolExecutorState
        .activeExecutions
        .size >=

        TOOL_EXECUTOR_CONFIG
        .MAX_CONCURRENT_EXECUTIONS

      ){

        await delayExecution(
          50
        );

        continue;

      }

      const queuedTask =

        toolExecutorState
        .executionQueue
        .shift();

      if(!queuedTask){

        continue;

      }

      toolExecutorState
      .diagnostics
      .executionsProcessed++;

      await executeTool(

        queuedTask.toolId,

        queuedTask.payload,

        queuedTask.context

      );

    }

    return true;

  }

  finally{

    toolExecutorState
    .processingQueue =
    false;

  }

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
// HEALTH REPORT
// =====================================

function getToolExecutorHealthReport(){

  return freezeToolObject({

    initialized:
    toolExecutorState
    .initialized,

    healthy:

      toolExecutorState
      .activeExecutions
      .size <=

      TOOL_EXECUTOR_CONFIG
      .MAX_CONCURRENT_EXECUTIONS,

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

    diagnostics:
    cloneToolDiagnostics(),

    timestamp:
    Date.now()

  });

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

    history:

      toolExecutorState
      .executionHistory
      .length,

    diagnostics:
    cloneToolDiagnostics(),

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
  .executionQueue =
  [];

  toolExecutorState
  .activeExecutions
  .clear();

  toolExecutorState
  .executionHistory =
  [];

  toolExecutorState
  .disabledTools
  .clear();

  toolExecutorState
  .processingQueue =
  false;

  toolExecutorState
  .diagnostics = {

    registered:0,

    executed:0,

    failed:0,

    retries:0,

    timeouts:0,

    executionsProcessed:0,

    rejected:0

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

  if(
    toolExecutorState
    .initializing
  ){

    return false;

  }

  toolExecutorState
  .initializing =
  true;

  try{

    toolExecutorState
    .initialized =
    true;



    // ================================
    // MODULE REGISTRATION
    // ================================

    if(
      typeof registerModule ===
      "function"
    ){

      await registerModule(

        "tool-executor",

        async () => ToolExecutor

      );

    }

    return true;

  }

  finally{

    toolExecutorState
    .initializing =
    false;

  }

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

  health:
  getToolExecutorHealthReport,

  snapshot:
  createToolExecutorSnapshot,

  reset:
  resetToolExecutor

});
