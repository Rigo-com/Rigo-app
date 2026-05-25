// =====================================
// RIGO AI
// AGENT MANAGER
// ENTERPRISE AGENT ORCHESTRATOR
// FULL HARDENED PRODUCTION ARCHITECTURE
// =====================================



// =====================================
// AGENT CONFIG
// =====================================

const AGENT_MANAGER_CONFIG =
Object.freeze({

  ENABLE_AGENT_EVENTS:
  true,

  ENABLE_AGENT_MEMORY:
  true,

  ENABLE_AGENT_DIAGNOSTICS:
  true,

  ENABLE_AGENT_RECOVERY:
  true,

  ENABLE_AGENT_HEALTHCHECKS:
  true,

  ENABLE_AGENT_STATE_SYNC:
  true,

  ENABLE_AGENT_QUEUE:
  true,

  ENABLE_AGENT_ABORT:
  true,

  MAX_AGENTS:
  500,

  MAX_AGENT_TASKS:
  1000,

  MAX_AGENT_RETRIES:
  3,

  MAX_QUEUE_SIZE:
  1000,

  TASK_TIMEOUT:
  60000,

  AGENT_HEALTHCHECK_INTERVAL:
  30000

});



// =====================================
// AGENT STATES
// =====================================

const AGENT_STATES =
Object.freeze({

  IDLE:
  "idle",

  INITIALIZING:
  "initializing",

  READY:
  "ready",

  RUNNING:
  "running",

  PAUSED:
  "paused",

  FAILED:
  "failed",

  TERMINATED:
  "terminated"

});



// =====================================
// AGENT EVENTS
// =====================================

const AGENT_EVENTS =
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



// =====================================
// AGENT STATE
// =====================================

const agentManagerState =
Object.seal({

  initialized:
  false,

  initializing:
  false,

  shuttingDown:
  false,

  startupPromise:
  null,

  memoryInitialized:
  false,

  agents:
  new Map(),

  activeAgents:
  new Set(),

  failedAgents:
  new Set(),

  executionLocks:
  new Map(),

  taskQueue:
  [],

  healthcheckTimer:
  null,

  diagnostics:{

    created:0,

    initialized:0,

    running:0,

    failed:0,

    terminated:0,

    tasksExecuted:0,

    retries:0,

    queued:0,

    aborted:0

  },

  lastAgentCreatedAt:
  null

});



// =====================================
// HELPERS
// =====================================

function normalizeAgentId(
  agentId
){

  return String(
    agentId || ""
  )
  .trim()
  .toLowerCase();

}



function freezeAgentObject(
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

    value instanceof AbortSignal

  ){

    return value;

  }

  visited.add(value);

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezeAgentObject(
        nestedValue,
        visited
      );

    }

  });

  return Object.freeze(
    value
  );

}



function cloneAgentObject(
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

    return {};

  }

}



function createAgentId(){

  try{

    if(

      typeof crypto !==
      "undefined"

      &&

      typeof crypto
      .randomUUID ===
      "function"

    ){

      return crypto
      .randomUUID();

    }

  }

  catch(error){}

  return (

    "agent_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



async function emitAgentEvent(
  eventName,
  payload = {}
){

  if(

    !AGENT_MANAGER_CONFIG
    .ENABLE_AGENT_EVENTS

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

      freezeAgentObject({

        source:
        "agent-manager",

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



function trimAgentTasks(
  tasks = []
){

  if(

    tasks.length <=

    AGENT_MANAGER_CONFIG
    .MAX_AGENT_TASKS

  ){

    return tasks;

  }

  return tasks.slice(

    tasks.length -

    AGENT_MANAGER_CONFIG
    .MAX_AGENT_TASKS

  );

}



function cloneAgentDiagnostics(){

  return freezeAgentObject({

    ...agentManagerState
    .diagnostics

  });

}



// =====================================
// AGENT OBJECT
// =====================================

function createAgentObject(
  config = {}
){

  const runtime = {

    running:false,

    lastTaskAt:null,

    lastHealthcheckAt:null,

    controller:null

  };

  return {

    ...freezeAgentObject({

      id:
      normalizeAgentId(

        config.id ||

        createAgentId()

      ),

      name:
      String(
        config.name ||
        "agent"
      ),

      description:
      String(
        config.description ||
        ""
      ),

      capabilities:
      Array.isArray(
        config.capabilities
      )

      ?

      [
        ...config.capabilities
      ]

      :

      [],

      state:
      AGENT_STATES
      .IDLE,

      tasks:[],

      retries:0,

      createdAt:
      Date.now(),

      updatedAt:
      Date.now(),

      metadata:
      cloneAgentObject(
        config.metadata || {}
      )

    }),

    runtime

  };

}



// =====================================
// REGISTER AGENT
// =====================================

async function registerAgent(
  config = {}
){

  if(
    agentManagerState
    .shuttingDown
  ){

    return false;

  }

  if(

    agentManagerState
    .agents
    .size >=

    AGENT_MANAGER_CONFIG
    .MAX_AGENTS

  ){

    return false;

  }

  const agent =
  createAgentObject(
    config
  );

  if(

    agentManagerState
    .agents
    .has(agent.id)

  ){

    return false;

  }

  agentManagerState
  .agents
  .set(
    agent.id,
    agent
  );

  agentManagerState
  .diagnostics
  .created++;

  agentManagerState
  .lastAgentCreatedAt =
  Date.now();

  await emitAgentEvent(

    AGENT_EVENTS
    .CREATED,

    {

      agentId:
      agent.id

    }

  );

  return freezeAgentObject(
    cloneAgentObject(agent)
  );

}



// =====================================
// CHANGE STATE
// =====================================

async function setAgentState(
  agent,
  state
){

  agent.state =
  state;

  agent.updatedAt =
  Date.now();

  await emitAgentEvent(

    AGENT_EVENTS
    .STATE_CHANGED,

    {

      agentId:
      agent.id,

      state

    }

  );

  return true;

}



// =====================================
// LOCK
// =====================================

function acquireAgentLock(
  agentId
){

  if(

    agentManagerState
    .executionLocks
    .has(agentId)

  ){

    return false;

  }

  agentManagerState
  .executionLocks
  .set(
    agentId,
    true
  );

  return true;

}



function releaseAgentLock(
  agentId
){

  agentManagerState
  .executionLocks
  .delete(
    agentId
  );

}



// =====================================
// EXECUTE TASK
// =====================================

async function executeAgentTask(
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
        "AGENT TASK QUEUE FULL"
      );

    }

    agentManagerState
    .taskQueue
    .push({

      agentId:
      normalizedId,

      task

    });

    agentManagerState
    .diagnostics
    .queued++;

    await emitAgentEvent(

      AGENT_EVENTS
      .TASK_QUEUED,

      {

        agentId:
        normalizedId

      }

    );

    return {
      queued:true
    };

  }

  const controller =

    AGENT_MANAGER_CONFIG
    .ENABLE_AGENT_ABORT

    ?

    new AbortController()

    :

    null;

  agent.runtime
  .controller =
  controller;

  agent.runtime
  .running =
  true;

  agent.runtime
  .lastTaskAt =
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

  try{

    const taskResult =
    await Promise.race([

      (async () => {

        if(
          typeof agent.execute ===
          "function"
        ){

          return agent.execute({

            ...task,

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

        setTimeout(() => {

          controller
          ?.abort();

          reject(
            new Error(
              "AGENT TASK TIMEOUT"
            )
          );

        },
        AGENT_MANAGER_CONFIG
        .TASK_TIMEOUT);

      })

    ]);

    agent.tasks =
    trimAgentTasks([

      ...agent.tasks,

      {

        success:true,

        completedAt:
        Date.now()

      }

    ]);

    agent.runtime
    .running =
    false;

    agent.runtime
    .controller =
    null;

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

    return taskResult;

  }

  catch(error){

    agent.retries++;

    agentManagerState
    .diagnostics
    .failed++;

    agentManagerState
    .diagnostics
    .retries++;

    agent.tasks =
    trimAgentTasks([

      ...agent.tasks,

      {

        success:false,

        error:
        String(error),

        failedAt:
        Date.now()

      }

    ]);

    if(

      agent.retries >=

      AGENT_MANAGER_CONFIG
      .MAX_AGENT_RETRIES

    ){

      agentManagerState
      .failedAgents
      .add(
        normalizedId
      );

      await setAgentState(

        agent,

        AGENT_STATES
        .FAILED

      );

    }

    if(

      AGENT_MANAGER_CONFIG
      .ENABLE_AGENT_RECOVERY

    ){

      recoverAgent(
        normalizedId
      )
      .catch(() => {});

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

    releaseAgentLock(
      normalizedId
    );

    agent.runtime
    .running =
    false;

    agent.runtime
    .controller =
    null;

    agentManagerState
    .activeAgents
    .delete(
      normalizedId
    );

    if(

      agentManagerState
      .taskQueue
      .length > 0

    ){

      const queued =
      agentManagerState
      .taskQueue
      .shift();

      executeAgentTask(

        queued.agentId,

        queued.task

      )
      .catch(() => {});

    }

  }

}



// =====================================
// RECOVER AGENT
// =====================================

async function recoverAgent(
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

    agent.state !==
    AGENT_STATES
    .FAILED

  ){

    return true;

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
    normalizedId
  );

  return true;

}



// =====================================
// PAUSE AGENT
// =====================================

async function pauseAgent(
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

  await setAgentState(

    agent,

    AGENT_STATES
    .PAUSED

  );

  return true;

}



// =====================================
// RESUME AGENT
// =====================================

async function resumeAgent(
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

  await setAgentState(

    agent,

    AGENT_STATES
    .READY

  );

  return true;

}



// =====================================
// TERMINATE AGENT
// =====================================

async function terminateAgent(
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

  agent.runtime
  .controller
  ?.abort();

  await setAgentState(

    agent,

    AGENT_STATES
    .TERMINATED

  );

  agentManagerState
  .activeAgents
  .delete(
    normalizedId
  );

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
// HEALTH CHECKS
// =====================================

async function performAgentHealthchecks(){

  for(
    const [agentId, agent]
    of
    agentManagerState
    .agents
  ){

    agent.runtime
    .lastHealthcheckAt =
    Date.now();

    if(

      agent.state ===
      AGENT_STATES
      .FAILED

      &&

      AGENT_MANAGER_CONFIG
      .ENABLE_AGENT_RECOVERY

    ){

      recoverAgent(
        agentId
      )
      .catch(() => {});

    }

  }

  return true;

}



// =====================================
// START HEALTHCHECK LOOP
// =====================================

function startAgentHealthchecks(){

  if(
    agentManagerState
    .healthcheckTimer
  ){

    return true;

  }

  agentManagerState
  .healthcheckTimer =
  setInterval(() => {

    performAgentHealthchecks();

  },

  AGENT_MANAGER_CONFIG
  .AGENT_HEALTHCHECK_INTERVAL);

  return true;

}



// =====================================
// STOP HEALTHCHECK LOOP
// =====================================

function stopAgentHealthchecks(){

  if(
    !agentManagerState
    .healthcheckTimer
  ){

    return true;

  }

  clearInterval(
    agentManagerState
    .healthcheckTimer
  );

  agentManagerState
  .healthcheckTimer =
  null;

  return true;

}



// =====================================
// PROCESS
// =====================================

async function processAgentRequest(
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
      AGENT_STATES
      .TERMINATED
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



// =====================================
// SNAPSHOT
// =====================================

function createAgentSnapshot(){

  return freezeAgentObject({

    initialized:
    agentManagerState
    .initialized,

    totalAgents:

      agentManagerState
      .agents
      .size,

    activeAgents:

      agentManagerState
      .activeAgents
      .size,

    failedAgents:

      agentManagerState
      .failedAgents
      .size,

    queuedTasks:

      agentManagerState
      .taskQueue
      .length,

    timestamp:
    Date.now()

  });

}



// =====================================
// DIAGNOSTICS
// =====================================

function getAgentDiagnostics(){

  return freezeAgentObject({

    initialized:
    agentManagerState
    .initialized,

    agents:

      agentManagerState
      .agents
      .size,

    activeAgents:

      agentManagerState
      .activeAgents
      .size,

    failedAgents:

      agentManagerState
      .failedAgents
      .size,

    diagnostics:
    cloneAgentDiagnostics(),

    timestamp:
    Date.now()

  });

}



// =====================================
// RESET
// =====================================

async function resetAgentManager(){

  agentManagerState
  .agents
  .clear();

  agentManagerState
  .activeAgents
  .clear();

  agentManagerState
  .failedAgents
  .clear();

  agentManagerState
  .executionLocks
  .clear();

  agentManagerState
  .taskQueue =
  [];

  return true;

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdownAgentManager(){

  agentManagerState
  .shuttingDown =
  true;

  stopAgentHealthchecks();

  for(
    const [agentId]
    of
    agentManagerState
    .agents
  ){

    terminateAgent(
      agentId
    )
    .catch(() => {});

  }

  await resetAgentManager();

  agentManagerState
  .initialized =
  false;

  return true;

}



// =====================================
// INITIALIZE
// =====================================

async function initializeAgentManager(){

  if(
    agentManagerState
    .initialized
  ){

    return true;

  }

  if(
    agentManagerState
    .startupPromise
  ){

    return agentManagerState
    .startupPromise;

  }

  agentManagerState
  .startupPromise =

  (async () => {

    if(
      agentManagerState
      .initializing
    ){

      return false;

    }

    agentManagerState
    .initializing =
    true;

    try{

      startAgentHealthchecks();

      agentManagerState
      .initialized =
      true;

      agentManagerState
      .shuttingDown =
      false;

      agentManagerState
      .diagnostics
      .initialized++;

      if(
        typeof registerModule ===
        "function"
      ){

        await registerModule(

          "agent-manager",

          async () => AgentManager

        );

      }

      return true;

    }

    finally{

      agentManagerState
      .initializing =
      false;

      agentManagerState
      .startupPromise =
      null;

    }

  })();

  return agentManagerState
  .startupPromise;

}



// =====================================
// PUBLIC API
// =====================================

const AgentManager =
Object.freeze({

  initialize:
  initializeAgentManager,

  shutdown:
  shutdownAgentManager,

  register:
  registerAgent,

  process:
  processAgentRequest,

  execute:
  executeAgentTask,

  recover:
  recoverAgent,

  pause:
  pauseAgent,

  resume:
  resumeAgent,

  terminate:
  terminateAgent,

  diagnostics:
  getAgentDiagnostics,

  snapshot:
  createAgentSnapshot,

  reset:
  resetAgentManager

});



if(
  typeof window !==
  "undefined"
){

  window.AgentManager =
  AgentManager;

}



if(
  typeof globalThis !==
  "undefined"
){

  globalThis.AgentManager =
  AgentManager;

}
