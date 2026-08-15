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



// =====================================
// EXECUTE TASK
// =====================================

export async function executeAgentTask(
  agentId,
  task = {}
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

    agentManagerState
    .diagnostics
    .tasksExecuted++;

    await setAgentState(

      agent,

      AGENT_STATES
      .READY

    );

    await emitAgentEvent(

      AGENT_EVENTS
      .TASK_COMPLETED,

      {
        agentId:
        normalizedId
      }

    );

    return result;

    }

  catch(error){

    agent.retries++;

    agentManagerState
    .diagnostics
    .failed++;

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



// =====================================
// RECOVER AGENT
// =====================================

export async function recoverAgent(
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

  agent.retries = 0;

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

  return setAgentState(
    agent,
    AGENT_STATES.READY
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

  return true;

}



// =====================================
// PROCESS REQUEST
// =====================================

export async function processAgentRequest(
  payload = {}
){

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
