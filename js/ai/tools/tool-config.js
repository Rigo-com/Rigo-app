// =====================================
// RIGO AI
// TOOL EXECUTOR CONFIG
// =====================================



// =====================================
// TOOL CONFIG
// =====================================

export const TOOL_EXECUTOR_CONFIG =
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

export const TOOL_PRIORITIES =
Object.freeze({

  LOW:1,

  NORMAL:5,

  HIGH:10,

  CRITICAL:20

});



// =====================================
// EXECUTION STATES
// =====================================

export const TOOL_EXECUTION_STATES =
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

export const TOOL_EVENTS =
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
