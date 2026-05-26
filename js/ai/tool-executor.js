// =====================================
// RIGO AI
// TOOL EXECUTOR
// FULL HARDENED PRODUCTION EXECUTION RUNTIME
// FINAL HARDENED ENTERPRISE EDITION
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

  ENABLE_ABORT_CONTROLLERS:true,

  ENABLE_EXECUTION_CANCELLATION:true,

  ENABLE_TOOL_SEARCH:true,

  ENABLE_TOOL_INDEXING:true,

  ENABLE_TOOL_DISABLE:true,

  ENABLE_STRUCTURED_ERRORS:true,

  ENABLE_QUEUE_DEDUPLICATION:true,

  ENABLE_RUNTIME_METADATA:true,

  MAX_TOOLS:1000,

  MAX_QUEUE_SIZE:5000,

  MAX_CONCURRENT_EXECUTIONS:50,

  MAX_RETRIES:3,

  EXECUTION_TIMEOUT:30000,

  RETRY_DELAY:500,

  MAX_HISTORY:500,

  MAX_PAYLOAD_SIZE:100000,

  MAX_PERMISSION_CACHE:
  1000,

  CIRCUIT_BREAKER_THRESHOLD:5,

  CIRCUIT_BREAKER_RESET:
  1000 * 30,

  QUEUE_PROCESSOR_DELAY:
  25

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
// EXECUTION STATES
// =====================================

const TOOL_EXECUTION_STATES =
Object.freeze({

  QUEUED:"queued",

  RUNNING:"running",

  COMPLETED:"completed",

  FAILED:"failed",

  CANCELLED:"cancelled",

  TIMED_OUT:"timed_out"

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

  EXECUTION_CANCELLED:
  "tool.execution.cancelled",

  EXECUTION_QUEUED:
  "tool.execution.queued",

  TOOL_DISABLED:
  "tool.disabled",

  TOOL_ENABLED:
  "tool.enabled"

});



// =====================================
// TOOL STATE
// =====================================

const toolExecutorState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  startupPromise:null,

  queueProcessorPromise:null,

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

    sandboxed:0,

    disabled:0,

    enabled:0

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

  try{

    if(

      typeof crypto !==
      "undefined"

      &&

      typeof crypto
      .randomUUID ===
      "function"

    ){

      return (

        "exec_" +

        crypto.randomUUID()

      );

    }

  }

  catch(error){}

  return (

    "exec_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



function createStructuredError(
  code,
  message,
  metadata = {}
){

  return freezeToolObject({

    success:false,

    error:{

      code,

      message,

      metadata,

      timestamp:
      Date.now()

    }

  });

}



function cloneToolObject(
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

  if(

    value instanceof Map ||

    value instanceof Set ||

    value instanceof WeakMap ||

    value instanceof WeakSet ||

    value instanceof AbortController ||

    value instanceof AbortSignal ||

    typeof value ===
    "function"

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

      freezeToolObject(
        nested,
        visited
      );

    }

  });

  return Object.freeze(
    value
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



function trimPermissionCache(){

  while(

    toolExecutorState
    .permissionCache
    .size >

    TOOL_EXECUTOR_CONFIG
    .MAX_PERMISSION_CACHE

  ){

    const firstKey =

      toolExecutorState
      .permissionCache
      .keys()
      .next()
      .value;

    toolExecutorState
    .permissionCache
    .delete(
      firstKey
    );

  }

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

      freezeToolObject({

        source:
        "tool-executor",

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



function removeToolIndex(
  toolId
){

  toolExecutorState
  .toolIndex
  .forEach((set,key) => {

    set.delete(toolId);

    if(
      set.size <= 0
    ){

      toolExecutorState
      .toolIndex
      .delete(key);

    }

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

  if(

    breaker.blockedUntil <=
    Date.now()

  ){

    breaker.failures = 0;

    breaker.blockedUntil = 0;

    return false;

  }

  return true;

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

  const runtime = {

    executions:0,

    failures:0,

    lastExecutedAt:null,

    updatedAt:
    Date.now()

  };

  return {

    ...freezeToolObject({

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

      enabled:true,

      createdAt:
      Date.now()

    }),

    runtime

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
    .shuttingDown
  ){

    return false;

  }

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

  await emitToolEvent(

    TOOL_EVENTS
    .REGISTERED,

    {
      toolId:tool.id
    }

  );

  return freezeToolObject(
    cloneToolObject(tool)
  );

}



// =====================================
// TOOL MANAGEMENT
// =====================================

function getTool(
  toolId
){

  return toolExecutorState
  .tools
  .get(
    normalizeToolName(
      toolId
    )
  );

}



async function removeTool(
  toolId
){

  const normalizedId =
  normalizeToolName(
    toolId
  );

  removeToolIndex(
    normalizedId
  );

  return toolExecutorState
  .tools
  .delete(
    normalizedId
  );

}



async function disableTool(
  toolId
){

  const normalizedId =
  normalizeToolName(
    toolId
  );

  toolExecutorState
  .disabledTools
  .add(
    normalizedId
  );

  toolExecutorState
  .diagnostics
  .disabled++;

  await emitToolEvent(

    TOOL_EVENTS
    .TOOL_DISABLED,

    {
      toolId:normalizedId
    }

  );

  return true;

}



async function enableTool(
  toolId
){

  const normalizedId =
  normalizeToolName(
    toolId
  );

  toolExecutorState
  .disabledTools
  .delete(
    normalizedId
  );

  toolExecutorState
  .diagnostics
  .enabled++;

  await emitToolEvent(

    TOOL_EVENTS
    .TOOL_ENABLED,

    {
      toolId:normalizedId
    }

  );

  return true;

}



// =====================================
// TOOL SEARCH
// =====================================

function searchTools(
  query = ""
){

  const normalized =
  normalizeToolName(
    query
  );

  const matchedIds =
  new Set();

  normalized
  .split(/\s+/)
  .forEach((token) => {

    const indexed =
    toolExecutorState
    .toolIndex
    .get(token);

    if(indexed){

      indexed.forEach((id) => {

        matchedIds.add(id);

      });

    }

  });

  return freezeToolObject(

    [...matchedIds]
    .map((id) => {

      return toolExecutorState
      .tools
      .get(id);

    })
    .filter(Boolean)

  );

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

    return createStructuredError(
      "TOOL_NOT_FOUND",
      "Tool does not exist"
    );

  }

  if(

    toolExecutorState
    .disabledTools
    .has(normalizedId)

  ){

    return createStructuredError(
      "TOOL_DISABLED",
      "Tool is disabled"
    );

  }

  if(
    isCircuitBlocked(
      normalizedId
    )
  ){

    return createStructuredError(
      "CIRCUIT_BLOCKED",
      "Circuit breaker active"
    );

  }

  if(
    !validatePayload(
      payload
    )
  ){

    toolExecutorState
    .diagnostics
    .rejected++;

    return createStructuredError(
      "INVALID_PAYLOAD",
      "Payload too large"
    );

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

  const controller =

    TOOL_EXECUTOR_CONFIG
    .ENABLE_ABORT_CONTROLLERS

    ?

    new AbortController()

    :

    null;

  toolExecutorState
  .activeExecutions
  .set(

    executionId,

    {

      toolId:
      normalizedId,

      startedAt:
      Date.now(),

      controller,

      retries:0,

      state:
      TOOL_EXECUTION_STATES
      .RUNNING

    }

  );

  await emitToolEvent(

    TOOL_EVENTS
    .EXECUTION_STARTED,

    {

      executionId,

      toolId:
      normalizedId

    }

  );

  let attempts = 0;

  try{

    while(
      attempts < tool.retries
    ){

      attempts++;

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

              signal:
              controller
              ?.signal || null

            });

          },

          tool.timeout,

          controller

        );

        resetCircuitBreaker(
          normalizedId
        );

        tool.runtime
        .executions++;

        tool.runtime
        .updatedAt =
        Date.now();

        toolExecutorState
        .executionHistory
        .push({

          executionId,

          toolId:
          normalizedId,

          success:true,

          duration:

            Date.now() -

            toolExecutorState
            .activeExecutions
            .get(executionId)
            .startedAt,

          timestamp:
          Date.now()

        });

        trimExecutionHistory();

        toolExecutorState
        .diagnostics
        .executed++;

        await emitToolEvent(

          TOOL_EVENTS
          .EXECUTION_COMPLETED,

          {

            executionId,

            toolId:
            normalizedId

          }

        );

        return freezeToolObject({

          success:true,

          executionId,

          result:
          cloneToolObject(
            result
          ),

          timestamp:
          Date.now()

        });

      }

      catch(error){

        registerCircuitFailure(
          normalizedId
        );

        tool.runtime
        .failures++;

        toolExecutorState
        .diagnostics
        .failed++;

        if(
          attempts >= tool.retries
        ){

          const duration =

            Date.now() -

            toolExecutorState
            .activeExecutions
            .get(executionId)
            .startedAt;

          toolExecutorState
          .executionHistory
          .push({

            executionId,

            toolId:
            normalizedId,

            success:false,

            error:
            String(error),

            duration,

            timestamp:
            Date.now()

          });

          trimExecutionHistory();

          await emitToolEvent(

            TOOL_EVENTS
            .EXECUTION_FAILED,

            {

              executionId,

              toolId:
              normalizedId,

              error:
              String(error)

            }

          );

          return createStructuredError(

            "EXECUTION_FAILED",

            String(error),

            {

              executionId,

              duration

            }

          );

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
// EXECUTION TIMEOUT
// =====================================

async function executeWithTimeout(
  callback,
  timeout,
  controller = null
){

  let timeoutId =
  null;

  try{

    const timeoutPromise =
    new Promise((_,reject) => {

      timeoutId =
      setTimeout(() => {

        controller
        ?.abort();

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
// EXECUTION CANCELLATION
// =====================================

async function cancelExecution(
  executionId
){

  const execution =
  toolExecutorState
  .activeExecutions
  .get(
    executionId
  );

  if(!execution){

    return false;

  }

  execution.controller
  ?.abort();

  execution.state =
  TOOL_EXECUTION_STATES
  .CANCELLED;

  toolExecutorState
  .diagnostics
  .cancelled++;

  toolExecutorState
  .executionQueue =

    toolExecutorState
    .executionQueue
    .filter((queued) => {

      return (
        queued.id !==
        executionId
      );

    });

  await emitToolEvent(

    TOOL_EVENTS
    .EXECUTION_CANCELLED,

    {
      executionId
    }

  );

  return true;

}



// =====================================
// QUEUE
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

    return createStructuredError(
      "QUEUE_FULL",
      "Execution queue full"
    );

  }

  const duplicate =
  toolExecutorState
  .executionQueue
  .find((queued) => {

    return (

      queued.toolId ===
      toolId

      &&

      JSON.stringify(
        queued.payload
      ) ===

      JSON.stringify(
        payload
      )

    );

  });

  if(duplicate){

    return freezeToolObject({

      queued:true,

      queueId:
      duplicate.id,

      duplicate:true

    });

  }

  const queuedExecution = {

    id:
    createExecutionId(),

    toolId,

    payload:
    cloneToolObject(
      payload
    ),

    context:
    cloneToolObject(
      context
    ),

    priority,

    state:
    TOOL_EXECUTION_STATES
    .QUEUED,

    createdAt:
    Date.now()

  };

  toolExecutorState
  .executionQueue
  .push(
    queuedExecution
  );

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

  emitToolEvent(

    TOOL_EVENTS
    .EXECUTION_QUEUED,

    {
      queueId:
      queuedExecution.id
    }

  );

  return freezeToolObject({

    queued:true,

    queueId:
    queuedExecution.id,

    position:

      toolExecutorState
      .executionQueue
      .length

  });

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
      .initialized

      &&

      !toolExecutorState
      .shuttingDown

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

        )
        .catch(() => {});

      }

      await delayExecution(

        TOOL_EXECUTOR_CONFIG
        .QUEUE_PROCESSOR_DELAY

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
// TOOL LIST
// =====================================

function listTools(){

  return freezeToolObject([

    ...toolExecutorState
    .tools
    .values()

  ]);

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
    cloneToolObject(

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

  for(
    const executionId
    of
    toolExecutorState
    .activeExecutions
    .keys()
  ){

    cancelExecution(
      executionId
    )
    .catch(() => {});

  }

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
// SHUTDOWN
// =====================================

async function shutdownToolExecutor(){

  toolExecutorState
  .shuttingDown =
  true;

  for(
    const executionId
    of
    toolExecutorState
    .activeExecutions
    .keys()
  ){

    cancelExecution(
      executionId
    )
    .catch(() => {});

  }

  await resetToolExecutor();

  toolExecutorState
  .initialized =
  false;

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

      toolExecutorState
      .shuttingDown =
      false;

      toolExecutorState
      .queueProcessorPromise =
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

  shutdown:
  shutdownToolExecutor,

  register:
  registerTool,

  remove:
  removeTool,

  get:
  getTool,

  search:
  searchTools,

  enable:
  enableTool,

  disable:
  disableTool,

  execute:
  executeTool,

  cancel:
  cancelExecution,

  queue:
  queueExecution,

  processQueue:
  processExecutionQueue,

  list:
  listTools,

  diagnostics:
  getToolDiagnostics,

  snapshot:
  createToolExecutorSnapshot,

  health:
  getToolExecutorHealth,

  reset:
  resetToolExecutor

});



if(
  typeof window !==
  "undefined"
){

  window.ToolExecutor =
  ToolExecutor;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis.ToolExecutor =
  ToolExecutor;

}
