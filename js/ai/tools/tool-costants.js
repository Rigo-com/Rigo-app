// =====================================
// RIGO AI
// TOOL CONSTANTS
// =====================================

export const TOOL_PRIORITIES =
Object.freeze({

  LOW:1,

  NORMAL:5,

  HIGH:10,

  CRITICAL:20

});



export const TOOL_EXECUTION_STATES =
Object.freeze({

  QUEUED:"queued",

  RUNNING:"running",

  COMPLETED:"completed",

  FAILED:"failed",

  CANCELLED:"cancelled",

  TIMED_OUT:"timed_out"

});



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
