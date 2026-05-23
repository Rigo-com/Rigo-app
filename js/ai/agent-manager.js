// =====================================
// RIGO AI
// AGENT MANAGER
// ENTERPRISE AI RUNTIME FINAL
// =====================================



// =====================================
// AGENT CONFIG
// =====================================

const AGENT_MANAGER_CONFIG =
Object.freeze({

  ENABLE_AGENT_EVENTS:true,

  ENABLE_AGENT_MEMORY:true,

  ENABLE_AGENT_DIAGNOSTICS:true,

  ENABLE_AGENT_RECOVERY:true,

  ENABLE_AGENT_HEALTHCHECKS:true,

  ENABLE_AGENT_STATE_SYNC:true,

  MAX_AGENTS:
  500,

  MAX_AGENT_TASKS:
  1000,

  MAX_AGENT_RETRIES:
  3,

  AGENT_HEALTHCHECK_INTERVAL:
  30000

});



// =====================================
// AGENT STATES
// =====================================

const AGENT_STATES =
Object.freeze({

  IDLE:"idle",

  INITIALIZING:"initializing",

  READY:"ready",

  RUNNING:"running",

  PAUSED:"paused",

  FAILED:"failed",

  TERMINATED:"terminated"

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

  initialized:false,

  initializing:false,

  agents:
  new Map(),

  activeAgents:
  new Set(),

  failedAgents:
  new Set(),

  executionLocks:
  new Set(),

  healthcheckTimer:null,

  diagnostics:{

    created:0,

    initialized:0,

    running:0,

    failed:0,

    terminated:0,

    tasksExecuted:0,

    retries:0

  },

  lastAgentCreatedAt:null

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

  visited.add(
    value
  );

  Object.freeze(
    value
  );

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

  return value;

}



function cloneAgentDiagnostics(){

  return freezeAgentObject({

    ...agentManagerState
    .diagnostics

  });

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

      {

        source:"agent-manager",

        ...payload

      }

    );

    return true;

  }

  catch(error){

    return false;

  }

}



// =====================================
// AGENT OBJECT
// =====================================

function createAgentObject(
  config = {}
){

  const agentId =
  normalizeAgentId(

    config.id ||

    createMemoryId()

  );

  return freezeAgentObject({

    id:
    agentId,

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

      freezeAgentObject(

        config.metadata ||
        {}

      )

  });

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

  return agent;

}



// =====================================
// UPDATE AGENT STATE
// =====================================

async function updateAgentState(
  agentId,
  newState
){

  const normalizedId =
  normalizeAgentId(
    agentId
  );

  const existingAgent =

    agentManagerState
    .agents
    .get(
      normalizedId
    );

  if(!existingAgent){

    return false;

  }

  const updatedAgent =
  freezeAgentObject({

    ...existingAgent,

    state:
    newState,

    updatedAt:
    Date.now()

  });

  agentManagerState
  .agents
  .set(
    normalizedId,
    updatedAgent
  );

  if(
    newState ===
    AGENT_STATES.READY
  ){

    agentManagerState
    .activeAgents
    .add(
      normalizedId
    );

    agentManagerState
    .failedAgents
    .delete(
      normalizedId
    );

  }

  else if(
    newState ===
    AGENT_STATES.FAILED
  ){

    agentManagerState
    .failedAgents
    .add(
      normalizedId
    );

    agentManagerState
    .activeAgents
    .delete(
      normalizedId
    );

    agentManagerState
    .diagnostics
    .failed++;

  }

  else if(
    newState ===
    AGENT_STATES.TERMINATED
  ){

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

  }

  await emitAgentEvent(

    AGENT_EVENTS
    .STATE_CHANGED,

    {

      agentId:
      normalizedId,

      state:
      newState

    }

  );

  return true;

}



// =====================================
// INITIALIZE AGENT
// =====================================

async function initializeAgent(
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

  await updateAgentState(

    normalizedId,

    AGENT_STATES
    .INITIALIZING

  );

  try{

    if(

      AGENT_MANAGER_CONFIG
      .ENABLE_AGENT_MEMORY

    ){

      if(
        typeof MemorySystem !==
        "undefined"
      ){

        await MemorySystem
        ?.initialize?.();

      }

    }

    await updateAgentState(

      normalizedId,

      AGENT_STATES
      .READY

    );

    agentManagerState
    .diagnostics
    .initialized++;

    await emitAgentEvent(

      AGENT_EVENTS
      .INITIALIZED,

      {

        agentId:
        normalizedId

      }

    );

    return true;

  }

  catch(error){

    await updateAgentState(

      normalizedId,

      AGENT_STATES
      .FAILED

    );

    return false;

  }

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

  if(

    agentManagerState
    .executionLocks
    .has(
      normalizedId
    )

  ){

    return false;

  }

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

    agent.tasks.length >=

    AGENT_MANAGER_CONFIG
    .MAX_AGENT_TASKS

  ){

    return false;

  }

  agentManagerState
  .executionLocks
  .add(
    normalizedId
  );

  const taskObject =
  freezeAgentObject({

    id:createMemoryId(),

    type:

      String(
        task.type ||
        "generic"
      ),

    payload:

      freezeAgentObject(

        task.payload ||
        {}

      ),

    createdAt:
    Date.now()

  });

  const updatedAgent =
  freezeAgentObject({

    ...agent,

    tasks:[

      ...agent.tasks,

      taskObject

    ],

    updatedAt:
    Date.now()

  });

  agentManagerState
  .agents
  .set(
    normalizedId,
    updatedAgent
  );

  await updateAgentState(

    normalizedId,

    AGENT_STATES
    .RUNNING

  );

  await emitAgentEvent(

    AGENT_EVENTS
    .TASK_STARTED,

    {

      agentId:
      normalizedId,

      taskId:
      taskObject.id

    }

  );

  let attempts = 0;

  try{

    while(

      attempts <

      AGENT_MANAGER_CONFIG
      .MAX_AGENT_RETRIES

    ){

      attempts++;

      try{

        if(
          typeof task.execute ===
          "function"
        ){

          await task.execute({

            agent:
            updatedAgent,

            task:
            taskObject,

            state:
            StateManager,

            memory:
            typeof MemorySystem !==
            "undefined"

            ? MemorySystem

            : null

          });

        }

        agentManagerState
        .diagnostics
        .tasksExecuted++;

        await updateAgentState(

          normalizedId,

          AGENT_STATES
          .READY

        );

        await emitAgentEvent(

          AGENT_EVENTS
          .TASK_COMPLETED,

          {

            agentId:
            normalizedId,

            taskId:
            taskObject.id

          }

        );

        return true;

      }

      catch(error){

        if(

          attempts >=

          AGENT_MANAGER_CONFIG
          .MAX_AGENT_RETRIES

        ){

          await updateAgentState(

            normalizedId,

            AGENT_STATES
            .FAILED

          );

          await emitAgentEvent(

            AGENT_EVENTS
            .TASK_FAILED,

            {

              agentId:
              normalizedId,

              taskId:
              taskObject.id,

              error:
              String(error)

            }

          );

          return false;

        }

        agentManagerState
        .diagnostics
        .retries++;

      }

    }

  }

  finally{

    agentManagerState
    .executionLocks
    .delete(
      normalizedId
    );

    const currentAgent =

      agentManagerState
      .agents
      .get(
        normalizedId
      );

    if(

      currentAgent &&

      currentAgent.state ===
      AGENT_STATES.RUNNING

    ){

      await updateAgentState(

        normalizedId,

        AGENT_STATES
        .READY

      );

    }

  }

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

  await updateAgentState(

    normalizedId,

    AGENT_STATES
    .TERMINATED

  );

  agentManagerState
  .executionLocks
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
// HEALTHCHECKS
// =====================================

function runAgentHealthchecks(){

  if(

    !AGENT_MANAGER_CONFIG
    .ENABLE_AGENT_HEALTHCHECKS

  ){

    return false;

  }

  agentManagerState
  .agents
  .forEach((agent) => {

    if(
      agent.state ===
      AGENT_STATES.FAILED
    ){

      agentManagerState
      .failedAgents
      .add(
        agent.id
      );

    }

  });

  return true;

}



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

    runAgentHealthchecks();

  },

  AGENT_MANAGER_CONFIG
  .AGENT_HEALTHCHECK_INTERVAL);

  return true;

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

    lastAgentCreatedAt:

      agentManagerState
      .lastAgentCreatedAt

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

  if(
    agentManagerState
    .healthcheckTimer
  ){

    clearInterval(

      agentManagerState
      .healthcheckTimer

    );

    agentManagerState
    .healthcheckTimer =
    null;

  }

  agentManagerState
  .diagnostics = {

    created:0,

    initialized:0,

    running:0,

    failed:0,

    terminated:0,

    tasksExecuted:0,

    retries:0

  };

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

    return true;

  }

  finally{

    agentManagerState
    .initializing =
    false;

  }

}



// =====================================
// PUBLIC API
// =====================================

const AgentManager =
Object.freeze({

  initialize:
  initializeAgentManager,

  register:
  registerAgent,

  initializeAgent:
  initializeAgent,

  executeTask:
  executeAgentTask,

  terminate:
  terminateAgent,

  diagnostics:
  getAgentDiagnostics,

  reset:
  resetAgentManager

});
