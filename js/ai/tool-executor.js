// =====================================
// RIGO AI
// TOOL EXECUTOR
// ENTERPRISE EXECUTION ENGINE
// FINAL STABLE EDITION
// =====================================



// =====================================
// TOOL CONFIG
// =====================================

const TOOL_EXECUTOR_CONFIG =
Object.freeze({

  ENABLE_TOOL_EVENTS:true,

  ENABLE_TOOL_TIMEOUTS:true,

  ENABLE_TOOL_RETRIES:true,

  ENABLE_TOOL_QUEUE:true,

  ENABLE_TOOL_SANDBOX:true,

  ENABLE_PRIORITY_QUEUE:true,

  ENABLE_CIRCUIT_BREAKER:true,

  ENABLE_PERMISSION_CACHE:true,

  ENABLE_EXECUTION_HISTORY:true,

  MAX_TOOLS:1000,

  MAX_QUEUE_SIZE:5000,

  MAX_CONCURRENT_EXECUTIONS:50,

  MAX_RETRIES:3,

  EXECUTION_TIMEOUT:30000,

  RETRY_DELAY:500,

  MAX_HISTORY:500,

  MAX_PAYLOAD_SIZE:100000,

  CIRCUIT_BREAKER_THRESHOLD:5,

  CIRCUIT_BREAKER_RESET:
  1000 * 30

});



// =====================================
// TOOL PRIORITIES
// =====================================

const TOOL_PRIORITIES =
Object.freeze({

  LOW:1,

  NORMAL:5,

  HIGH:10,

  CRITICAL:20

});



// =====================================
// TOOL STATE
// =====================================

const toolExecutorState =
Object.seal({

  initialized:false,

  initializing:false,

  startupPromise:null,

  processing:false,

  tools:
  new Map(),

  toolIndex:
  new Map(),

  executionQueue:[],

  activeExecutions:
  new Map(),

  executionHistory:[],

  permissionCache:
  new Map(),

  disabledTools:
  new Set(),

  circuitBreakers:
  new Map(),

  diagnostics:{

    registered:0,

    executed:0,

    failed:0,

    retries:0,

    rejected:0,

    queued:0,

    timedOut:0,

    cancelled:0,

    sandboxed:0

  },

  lastExecutionAt:null

});



// =====================================
// HELPERS
// =====================================

function normalizeToolName(
  value
){

  return String(
    value || ""
  )
  .trim()
  .toLowerCase();

}



function createExecutionId(){

  return (

    "exec_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



function safeClone(
  value
){

  try{

    return JSON.parse(
      JSON.stringify(value)
    );

  }

  catch(error){

    return null;

  }

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

  visited.add(value);

  Object.freeze(value);

  Object.values(value)
  .forEach((nested) => {

    freezeToolObject(
      nested,
      visited
    );

  });

  return value;

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



function trimExecutionHistory(){

  while(

    toolExecutorState
    .executionHistory
    .length >

    TOOL_EXECUTOR_CONFIG
    .MAX_HISTORY

  ){

    toolExecutorState
    .executionHistory
    .shift();

  }

}



// =====================================
// PAYLOAD VALIDATION
// =====================================

function validatePayload(
  payload
){

  try{

    return (

      JSON.stringify(payload)
      .length <=

      TOOL_EXECUTOR_CONFIG
      .MAX_PAYLOAD_SIZE

    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// TOOL INDEXING
// =====================================

function indexTool(
  tool
){

  const tokens = [

    tool.id,

    tool.name,

    tool.description

  ]
  .join(" ")
  .toLowerCase()
  .split(/\s+/)
  .filter(Boolean);

  tokens.forEach((token) => {

    if(

      !toolExecutorState
      .toolIndex
      .has(token)

    ){

      toolExecutorState
      .toolIndex
      .set(
        token,
        new Set()
      );

    }

    toolExecutorState
    .toolIndex
    .get(token)
    .add(tool.id);

  });

}



// =====================================
// CIRCUIT BREAKER
// =====================================

function getCircuitBreaker(
  toolId
){

  if(

    !toolExecutorState
    .circuitBreakers
    .has(toolId)

  ){

    toolExecutorState
    .circuitBreakers
    .set(toolId,{

      failures:0,

      blockedUntil:0

    });

  }

  return toolExecutorState
  .circuitBreakers
  .get(toolId);

}



function isCircuitBlocked(
  toolId
){

  const breaker =
  getCircuitBreaker(
    toolId
  );

  return (

    breaker.blockedUntil >
    Date.now()

  );

}



function registerCircuitFailure(
  toolId
){

  const breaker =
  getCircuitBreaker(
    toolId
  );

  breaker.failures++;

  if(

    breaker.failures >=

    TOOL_EXECUTOR_CONFIG
    .CIRCUIT_BREAKER_THRESHOLD

  ){

    breaker.blockedUntil =

      Date.now() +

      TOOL_EXECUTOR_CONFIG
      .CIRCUIT_BREAKER_RESET;

  }

}



function resetCircuitBreaker(
  toolId
){

  const breaker =
  getCircuitBreaker(
    toolId
  );

  breaker.failures = 0;

  breaker.blockedUntil = 0;

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

      config.name ||

      "tool"

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

      ? [...config.permissions]

      : [],

    priority:

      Number(
        config.priority
      )

      ||

      TOOL_PRIORITIES
      .NORMAL,

    timeout:

      Number(
        config.timeout
      )

      ||

      TOOL_EXECUTOR_CONFIG
      .EXECUTION_TIMEOUT,

    retries:

      Number(
        config.retries
      )

      ||

      TOOL_EXECUTOR_CONFIG
      .MAX_RETRIES,

    sandboxed:
    config.sandboxed !==
    false,

    execute:
    config.execute,

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

  indexTool(tool);

  toolExecutorState
  .diagnostics
  .registered++;

  return tool;

}



// =====================================
// PERMISSION VALIDATION
// =====================================

function validatePermissions(
  tool,
  context = {}
){

  if(
    tool.permissions
    .length <= 0
  ){

    return true;

  }

  const cacheKey =

    tool.id +

    "::" +

    JSON.stringify(
      context.permissions || []
    );

  const cached =
  toolExecutorState
  .permissionCache
  .get(cacheKey);

  if(
    cached !== undefined
  ){

    return cached;
  }

  const granted =
  Array.isArray(
    context.permissions
  )

  ? context.permissions

  : [];

  const valid =
  tool.permissions.every((permission) => {

    return granted.includes(
      permission
    );

  });

  toolExecutorState
  .permissionCache
  .set(
    cacheKey,
    valid
  );

  return valid;

}



// =====================================
// TIMEOUT EXECUTION
// =====================================

async function executeWithTimeout(
  callback,
  timeout
){

  let timeoutId =
  null;

  try{

    const timeoutPromise =
    new Promise((_,reject) => {

      timeoutId =
      setTimeout(() => {

        reject(

          new Error(
            "TOOL_TIMEOUT"
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

    if(timeoutId){

      clearTimeout(
        timeoutId
      );

    }

  }

}



// =====================================
// EXECUTION
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
    .has(normalizedId)

  ){

    return false;

  }

  if(
    isCircuitBlocked(
      normalizedId
    )
  ){

    return false;

  }

  if(
    !validatePayload(
      payload
    )
  ){

    toolExecutorState
    .diagnostics
    .rejected++;

    return false;

  }

  if(
    !validatePermissions(
      tool,
      context
    )
  ){

    toolExecutorState
    .diagnostics
    .rejected++;

    return false;

  }

  if(

    toolExecutorState
    .activeExecutions
    .size >=

    TOOL_EXECUTOR_CONFIG
    .MAX_CONCURRENT_EXECUTIONS

  ){

    return queueExecution(

      normalizedId,

      payload,

      context,

      tool.priority

    );

  }

  const executionId =
  createExecutionId();

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

  let attempts = 0;

  try{

    while(
      attempts < tool.retries
    ){

      attempts++;

      try{

        let result = null;

        if(

          tool.sandboxed

          &&

          typeof SecuritySandbox !==
          "undefined"

        ){

          toolExecutorState
          .diagnostics
          .sandboxed++;

          const sandboxResult =
          await SecuritySandbox
          .execute(() => {

            return tool.execute({

              payload:
              safeClone(payload),

              context:
              safeClone(context)

            });

          },

          {

            timeout:
            tool.timeout

          });

          if(
            !sandboxResult.success
          ){

            throw new Error(

              sandboxResult.error ||

              "SANDBOX_EXECUTION_FAILED"

            );

          }

          result =
          sandboxResult.result;

        }

        else{

          result =
          await executeWithTimeout(

            () => {

              return tool.execute({

                payload:
                safeClone(payload),

                context:
                safeClone(context)

              });

            },

            tool.timeout

          );

        }

        resetCircuitBreaker(
          normalizedId
        );

        toolExecutorState
        .executionHistory
        .push({

          executionId,

          toolId:
          normalizedId,

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

        return freezeToolObject({

          success:true,

          executionId,

          result:
          safeClone(result),

          timestamp:
          Date.now()

        });

      }

      catch(error){

        registerCircuitFailure(
          normalizedId
        );

        toolExecutorState
        .diagnostics
        .failed++;

        if(

          String(error)
          .includes("TIMEOUT")

        ){

          toolExecutorState
          .diagnostics
          .timedOut++;

        }

        if(
          attempts >= tool.retries
        ){

          toolExecutorState
          .executionHistory
          .push({

            executionId,

            toolId:
            normalizedId,

            success:false,

            error:
            String(error),

            timestamp:
            Date.now()

          });

          trimExecutionHistory();

          return freezeToolObject({

            success:false,

            executionId,

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
// PRIORITY QUEUE
// =====================================

function queueExecution(
  toolId,
  payload,
  context,
  priority = 1
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

  toolExecutorState
  .executionQueue
  .push({

    id:
    createExecutionId(),

    toolId,

    payload:
    safeClone(payload),

    context:
    safeClone(context),

    priority,

    createdAt:
    Date.now()

  });

  toolExecutorState
  .executionQueue
  .sort((a,b) => {

    return (
      b.priority -
      a.priority
    );

  });

  toolExecutorState
  .diagnostics
  .queued++;

  return true;

}



// =====================================
// QUEUE PROCESSOR
// =====================================

async function processExecutionQueue(){

  if(
    toolExecutorState
    .processing
  ){

    return false;

  }

  toolExecutorState
  .processing =
  true;

  try{

    while(

      toolExecutorState
      .executionQueue
      .length > 0

    ){

      while(

        toolExecutorState
        .activeExecutions
        .size <

        TOOL_EXECUTOR_CONFIG
        .MAX_CONCURRENT_EXECUTIONS

        &&

        toolExecutorState
        .executionQueue
        .length > 0

      ){

        const queued =

          toolExecutorState
          .executionQueue
          .shift();

        executeTool(

          queued.toolId,

          queued.payload,

          queued.context

        );

      }

      await delayExecution(
        10
      );

    }

    return true;

  }

  finally{

    toolExecutorState
    .processing =
    false;

  }

}



// =====================================
// DIAGNOSTICS
// =====================================

function getToolDiagnostics(){

  return freezeToolObject({

    initialized:
    toolExecutorState
    .initialized,

    tools:

      toolExecutorState
      .tools
      .size,

    queue:

      toolExecutorState
      .executionQueue
      .length,

    active:

      toolExecutorState
      .activeExecutions
      .size,

    history:

      toolExecutorState
      .executionHistory
      .length,

    diagnostics:
    safeClone(

      toolExecutorState
      .diagnostics

    ),

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
  .toolIndex
  .clear();

  toolExecutorState
  .executionQueue = [];

  toolExecutorState
  .activeExecutions
  .clear();

  toolExecutorState
  .executionHistory = [];

  toolExecutorState
  .permissionCache
  .clear();

  toolExecutorState
  .disabledTools
  .clear();

  toolExecutorState
  .circuitBreakers
  .clear();

  toolExecutorState
  .processing = false;

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
    .startupPromise
  ){

    return toolExecutorState
    .startupPromise;

  }

  toolExecutorState
  .startupPromise =

  (async() => {

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

      processExecutionQueue();

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

      toolExecutorState
      .startupPromise =
      null;

    }

  })();

  return toolExecutorState
  .startupPromise;

}



// =====================================
// SNAPSHOT
// =====================================

function createToolExecutorSnapshot(){

  return freezeToolObject({

    initialized:
    toolExecutorState
    .initialized,

    tools:

      toolExecutorState
      .tools
      .size,

    queue:

      toolExecutorState
      .executionQueue
      .length,

    active:

      toolExecutorState
      .activeExecutions
      .size,

    timestamp:
    Date.now()

  });

}



// =====================================
// HEALTH
// =====================================

function getToolExecutorHealth(){

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

    diagnostics:
    getToolDiagnostics(),

    timestamp:
    Date.now()

  });

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
  queueExecution,

  processQueue:
  processExecutionQueue,

  diagnostics:
  getToolDiagnostics,

  snapshot:
  createToolExecutorSnapshot,

  health:
  getToolExecutorHealth,

  reset:
  resetToolExecutor

});
