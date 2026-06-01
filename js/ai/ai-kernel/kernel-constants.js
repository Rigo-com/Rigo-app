// =====================================
// RIGO AI
// AI KERNEL CONSTANTS
// =====================================

export const AI_KERNEL_STATES =
Object.freeze({

  IDLE:
  "idle",

  INITIALIZING:
  "initializing",

  READY:
  "ready",

  PROCESSING:
  "processing",

  RECOVERING:
  "recovering",

  FAILED:
  "failed",

  SHUTDOWN:
  "shutdown"

});



export const AI_KERNEL_EVENTS =
Object.freeze({

  INITIALIZED:
  "ai.kernel.initialized",

  REQUEST_RECEIVED:
  "ai.kernel.request.received",

  REQUEST_ROUTED:
  "ai.kernel.request.routed",

  REQUEST_COMPLETED:
  "ai.kernel.request.completed",

  REQUEST_FAILED:
  "ai.kernel.request.failed",

  REQUEST_ABORTED:
  "ai.kernel.request.aborted",

  REQUEST_QUEUED:
  "ai.kernel.request.queued",

  RECOVERY_STARTED:
  "ai.kernel.recovery.started",

  RECOVERY_COMPLETED:
  "ai.kernel.recovery.completed",

  HEALTH_CHECK:
  "ai.kernel.health.check",

  SHUTDOWN:
  "ai.kernel.shutdown"

});
