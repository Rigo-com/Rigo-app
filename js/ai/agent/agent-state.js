// =====================================
// RIGO AI
// AGENT STATE
// =====================================

import { AGENT_MANAGER_CONFIG }
from "./agent-config.js";

const agentDiagnostics = Object.seal({
  created:0,
  initialized:0,
  running:0,
  failed:0,
  terminated:0,
  tasksExecuted:0,
  retries:0,
  queued:0,
  aborted:0,
  eventsEmitted:0,
  eventsFailed:0,
  recovered:0,
  recoveryDeferred:0,
  recoveryRejected:0,
  memorySaved:0,
  memoryFailed:0
});

const guardedDiagnostics = new Proxy(
  agentDiagnostics,
  {
    set(target,key,value){
      if(
        !AGENT_MANAGER_CONFIG.ENABLE_AGENT_DIAGNOSTICS &&
        Number(value) !== 0
      ){
        return true;
      }

      return Reflect.set(target,key,value);
    }
  }
);

export const agentManagerState =
Object.seal({

  initialized:false,

  initializing:false,

  shuttingDown:false,

  startupPromise:null,

  agents:
  new Map(),

  activeAgents:
  new Set(),

  failedAgents:
  new Set(),

  executionLocks:
  new Map(),

  executionPromises:
  new Set(),

  taskQueue:
  [],

  queueProcessing:
  false,

  healthcheckTimer:
  null,

  diagnostics:guardedDiagnostics,

  lastAgentCreatedAt:
  null

});
