// =====================================
// RIGO AI
// AGENT CONSTANTS
// =====================================

export const AGENT_STATES =
Object.freeze({

  IDLE:"idle",

  INITIALIZING:"initializing",

  READY:"ready",

  RUNNING:"running",

  PAUSED:"paused",

  FAILED:"failed",

  TERMINATED:"terminated"

});



export const AGENT_EVENTS =
Object.freeze({

  CREATED:
  "agent.created",

  INITIALIZED:
  "agent.initialized",

  READY:
  "agent.ready",

  TASK_STARTED:
  "agent.task.started",

  TASK_COMPLETED:
  "agent.task.completed",

  TASK_FAILED:
  "agent.task.failed",

  TASK_ABORTED:
  "agent.task.aborted",

  TASK_QUEUED:
  "agent.task.queued",

  STATE_CHANGED:
  "agent.state.changed",

  FAILED:
  "agent.failed",

  TERMINATED:
  "agent.terminated"

});
