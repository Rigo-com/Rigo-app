// =====================================
// RIGO AI
// AGENT MANAGER
// ENTERPRISE AGENT ORCHESTRATOR
// FINAL HARDENED ARCHITECTURE
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

  MAX_AGENTS:
  500,

  MAX_AGENT_TASKS:
  1000,

  MAX_AGENT_RETRIES:
  3,

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

  healthcheckTimer:
  null,

  diagnostics:{

    created:0,

    initialized:0,

    running:0,

    failed:0,

    terminated:0,

    tasksExecuted:0,

    retries:0

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

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

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

  return {

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
