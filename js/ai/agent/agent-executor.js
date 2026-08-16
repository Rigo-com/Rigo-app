// =====================================
// RIGO AI
// AGENT EXECUTOR
// AGENT EXECUTION ENGINE
// =====================================

import {
  AGENT_MANAGER_CONFIG
}
from "./agent-config.js";

import {
  AGENT_STATES,
  AGENT_EVENTS
}
from "./agent-constants.js";

import {
  agentManagerState
}
from "./agent-state.js";

import {
  normalizeAgentId,
  cloneAgentObject,
  trimAgentTasks
}
from "./agent-utils.js";

import {
  emitAgentEvent
}
from "./agent-events.js";

import {
  acquireAgentLock,
  releaseAgentLock
}
from "./agent-locks.js";

import {
  processAgentQueue
}
from "./agent-queue.js";

import {
  setAgentState
}
from "./agent-registry.js";

import { persistAgentTask }
from "./agent-memory.js";



// =====================================
// EXECUTE TASK
// =====================================

async function runAgentTask(
  agentId,
  task = {}
){

  if(
    !agentManagerState.initialized ||
    agentManagerState.shuttingDown
  ){
    throw new Error(
      agentManagerState.shuttingDown
      ? "AGENT MANAGER SHUTDOWN"
      : "AGENT MANAGER NOT INITIALIZED"
    );
  }

  const normalizedId =
  normalizeAgentId(
    agentId
  );

  const agent =
  agentManagerState
  .agents
  .get(
    normalizedId
  );

  if(!agent){

    throw new Error(
      "AGENT NOT FOUND"
    );

  }

  if(

    agent.state ===
    AGENT_STATES
    .TERMINATED

  ){

    throw new Error(
      "AGENT TERMINATED"
    );

  }

  if(
    agent.state ===
    AGENT_STATES.PAUSED
  ){
    throw new Error("AGENT PAUSED");
  }

  if(
    agent.state ===
    AGENT_STATES.FAILED
  ){
    throw new Error("AGENT FAILED");
  }

  if(

    !acquireAgentLock(
      normalizedId
    )

  ){

    if(

      !AGENT_MANAGER_CONFIG
      .ENABLE_AGENT_QUEUE

    ){

      throw new Error(
        "AGENT LOCKED"
      );

    }

    if(

      agentManagerState
      .taskQueue
      .length >=

      AGENT_MANAGER_CONFIG
      .MAX_QUEUE_SIZE

    ){

      throw new Error(
        "QUEUE FULL"
      );

    }

    const queuedPromise =
    new Promise((resolve,reject) => {

      agentManagerState
      .taskQueue
      .push({

        agentId:
        normalizedId,

        task:
        cloneAgentObject(task),

        resolve,

        reject,

        queuedAt:
        Date.now()

      });

    });

    agentManagerState
    .diagnostics
    .queued++;

    await emitAgentEvent(

      AGENT_EVENTS
      .TASK_QUEUED,

      {
        agentId:
        normalizedId,

        queueSize:
        agentManagerState
        .taskQueue
        .length
      }

    );

    processAgentQueue()
    .catch(() => {});

    return queuedPromise;

  }

  const controller =

    AGENT_MANAGER_CONFIG
    .ENABLE_AGENT_ABORT

    ?

    new AbortController()

    :

    null;

  agent.runtime.running =
  true;

  agent.runtime.controller =
  controller;

  agent.runtime.lastTaskAt =
  Date.now();

  agentManagerState
  .activeAgents
  .add(
    normalizedId
  );

  await setAgentState(

    agent,

    AGENT_STATES
    .RUNNING

  );

  await emitAgentEvent(

    AGENT_EVENTS
    .TASK_STARTED,

    {
      agentId:
      normalizedId
    }

  );

  agentManagerState
  .diagnostics
  .running++;

  let timeoutId =
  null;

  try{

    const result =
    await Promise.race([

      (async () => {

        if(
          typeof agent.execute ===
          "function"
        ){

          return await agent.execute({

            ...cloneAgentObject(task),

            signal:
            controller
            ?.signal || null

          });

        }

        return {

          success:true,

          simulated:true

        };

      })(),

      new Promise((_, reject) => {

        timeoutId =
        setTimeout(() => {

          controller
          ?.abort();

          reject(

            new Error(
              "TASK TIMEOUT"
            )

          );

        },

        AGENT_MANAGER_CONFIG
        .TASK_TIMEOUT);

      })

    ]);

    if(
      agent.state ===
      AGENT_STATES.TERMINATED
    ){
      throw new Error(
        "AGENT TERMINATED"
      );
    }

    agent.tasks =
    trimAgentTasks(

      [

        ...agent.tasks,

        {

          success:true,

          completedAt:
          Date.now()

        }

      ],

      AGENT_MANAGER_CONFIG
      .MAX_AGENT_TASKS

    );

    agent.retries = 0;

    agent.runtime
    .recoveryAttempts = 0;

    agent.runtime
    .lastError = null;

    agentManagerState
    .diagnostics
    .tasksExecuted++;

    if(
      agent.state !==
      AGENT_STATES.PAUSED
    ){
      await setAgentState(

        agent,

        AGENT_STATES
        .READY

      );
    }

    await emitAgentEvent(

      AGENT_EVENTS
      .TASK_COMPLETED,

      {
        agentId:
        normalizedId
      }

    );

    await persistAgentTask(
      agent,
      cloneAgentObject(task),
      {
        success:true,
        result:cloneAgentObject(result)
      }
    );

    return result;

    }

  catch(error){

    if(
      agent.state ===
      AGENT_STATES.TERMINATED
    ){

      if(controller?.signal.aborted){

        agentManagerState
        .diagnostics
        .aborted++;

        await emitAgentEvent(

          AGENT_EVENTS
          .TASK_ABORTED,

          {
            agentId:
            normalizedId,

            error:
            String(error)
          }

        );

      }

      throw error;

    }

    agent.retries++;

    agent.runtime
    .lastFailureAt =
    Date.now();

    agent.runtime
    .lastError =
    String(error);

    agentManagerState
    .diagnostics
    .failed++;

    agentManagerState
    .diagnostics
    .retries++;

    if(controller?.signal.aborted){

      agentManagerState
      .diagnostics
      .aborted++;

      await emitAgentEvent(

        AGENT_EVENTS
        .TASK_ABORTED,

        {
          agentId:
          normalizedId,

          error:
          String(error)
        }

      );

    }

    if(

      agent.retries >=

      AGENT_MANAGER_CONFIG
      .MAX_AGENT_RETRIES

    ){

      await setAgentState(

        agent,

        AGENT_STATES
        .FAILED

      );

      agentManagerState
      .failedAgents
      .add(
        normalizedId
      );

      await emitAgentEvent(

        AGENT_EVENTS
        .FAILED,

        {
          agentId:
          normalizedId,

          error:
          String(error)
        }

      );

    }

    else{

      await setAgentState(

        agent,

        AGENT_STATES
        .READY

      );

    }

    await emitAgentEvent(

      AGENT_EVENTS
      .TASK_FAILED,

      {

        agentId:
        normalizedId,

        error:
        String(error)

      }

    );

    await persistAgentTask(
      agent,
      cloneAgentObject(task),
      {
        success:false,
        error:String(error)
      }
    );

    throw error;

  }

  finally{

    if(timeoutId){
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    releaseAgentLock(
      normalizedId
    );

    agent.runtime.running =
    false;

    agent.runtime.controller =
    null;

    agentManagerState
    .activeAgents
    .delete(
      normalizedId
    );

    processAgentQueue()
    .catch(() => {});

  }

}



export function executeAgentTask(
  agentId,
  task = {}
){
  const execution = runAgentTask(
    agentId,
    task
  );

  agentManagerState
  .executionPromises
  .add(execution);

  execution.finally(() => {
    agentManagerState
    .executionPromises
    .delete(execution);
  }).catch(() => {});

  return execution;
}



// =====================================
// RECOVER AGENT
// =====================================

export async function recoverAgent(
  agentId,
  options = {}
){

  const agent =
  agentManagerState
  .agents
  .get(
    normalizeAgentId(
      agentId
    )
  );

  if(!agent){

    return false;

  }

  if(
    !AGENT_MANAGER_CONFIG
    .ENABLE_AGENT_RECOVERY ||
    agent.state !==
    AGENT_STATES.FAILED
  ){
    return false;
  }

  const now =
  Number(options.now) ||
  Date.now();

  if(
    agent.runtime
    .recoveryAttempts >=
    AGENT_MANAGER_CONFIG
    .MAX_AGENT_RECOVERY_ATTEMPTS
  ){

    agentManagerState
    .diagnostics
    .recoveryRejected++;

    return false;

  }

  const recoveryReference =
  Math.max(
    Number(
      agent.runtime.lastFailureAt
    ) || 0,
    Number(
      agent.runtime.lastRecoveryAt
    ) || 0
  );

  if(
    !options.force &&
    now - recoveryReference <
    AGENT_MANAGER_CONFIG
    .AGENT_RECOVERY_COOLDOWN
  ){

    agentManagerState
    .diagnostics
    .recoveryDeferred++;

    return false;

  }

  agent.retries = 0;

  agent.runtime
  .recoveryAttempts++;

  agent.runtime
  .lastRecoveryAt =
  now;

  await setAgentState(

    agent,

    AGENT_STATES
    .READY

  );

  agentManagerState
  .failedAgents
  .delete(
    agent.id
  );

  agentManagerState
  .diagnostics
  .recovered++;

  await emitAgentEvent(

    AGENT_EVENTS
    .RECOVERED,

    {
      agentId:
      agent.id,

      recoveryAttempts:
      agent.runtime
      .recoveryAttempts
    }

  );

  return true;

}



// =====================================
// PAUSE AGENT
// =====================================

export async function pauseAgent(
  agentId
){

  const agent =
  agentManagerState
  .agents
  .get(
    normalizeAgentId(
      agentId
    )
  );

  if(!agent){

    return false;

  }

  if(
    agent.state === AGENT_STATES.TERMINATED ||
    agent.state === AGENT_STATES.FAILED
  ){
    return false;
  }

  if(
    agent.state === AGENT_STATES.PAUSED
  ){
    return true;
  }

  return setAgentState(
    agent,
    AGENT_STATES.PAUSED
  );

}



// =====================================
// RESUME AGENT
// =====================================

export async function resumeAgent(
  agentId
){

  const agent =
  agentManagerState
  .agents
  .get(
    normalizeAgentId(
      agentId
    )
  );

  if(!agent){

    return false;

  }

  if(
    agent.state !==
    AGENT_STATES.PAUSED
  ){
    return false;
  }

  return setAgentState(
    agent,
    agent.runtime.running
    ? AGENT_STATES.RUNNING
    : AGENT_STATES.READY
  );

}



// =====================================
// TERMINATE AGENT
// =====================================

export async function terminateAgent(
  agentId
){

  const normalizedId =
  normalizeAgentId(
    agentId
  );

  const agent =
  agentManagerState
  .agents
  .get(
    normalizedId
  );

  if(!agent){

    return false;

  }

  if(
    agent.state ===
    AGENT_STATES.TERMINATED
  ){
    return true;
  }

  const wasRunning =
  agent.runtime.running;

  try{

    agent.runtime
    .controller
    ?.abort();

  }

  catch(error){}

  await setAgentState(

    agent,

    AGENT_STATES
    .TERMINATED

  );

  if(!wasRunning){

    agent.runtime.running =
    false;

    agent.runtime.controller =
    null;

    releaseAgentLock(
      normalizedId
    );

    agentManagerState
    .activeAgents
    .delete(
      normalizedId
    );

  }

  const queuedTasks =
  agentManagerState
  .taskQueue
  .filter((queuedTask) => {
    return queuedTask.agentId === normalizedId;
  });

  agentManagerState
  .taskQueue =
  agentManagerState
  .taskQueue
  .filter((queuedTask) => {
    return queuedTask.agentId !== normalizedId;
  });

  queuedTasks
  .forEach((queuedTask) => {
    queuedTask.reject(
      new Error("AGENT TERMINATED")
    );
  });

  agentManagerState
  .failedAgents
  .delete(
    normalizedId
  );

  agentManagerState
  .diagnostics
  .terminated++;

  await emitAgentEvent(

    AGENT_EVENTS
    .TERMINATED,

    {
      agentId:
      normalizedId
    }

  );

  return true;

}



// =====================================
// PROCESS REQUEST
// =====================================

export async function processAgentRequest(
  payload = {}
){

  if(
    !agentManagerState.initialized ||
    agentManagerState.shuttingDown
  ){
    throw new Error(
      agentManagerState.shuttingDown
      ? "AGENT MANAGER SHUTDOWN"
      : "AGENT MANAGER NOT INITIALIZED"
    );
  }

  const targetAgent =

    payload.agentId

    ?

    agentManagerState
    .agents
    .get(
      normalizeAgentId(
        payload.agentId
      )
    )

    :

    [...agentManagerState.agents.values()]
    .find((agent) => {

      return (

        agent.state !==
        AGENT_STATES.TERMINATED

      );

    });

  if(!targetAgent){

    throw new Error(
      "NO AVAILABLE AGENT"
    );

  }

  return executeAgentTask(
    targetAgent.id,
    payload
  );

}
