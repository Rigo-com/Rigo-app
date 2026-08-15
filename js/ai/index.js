// =====================================
// RIGO AI
// MAIN AI ENTRY POINT
// =====================================

import AIKernel
from "./ai-kernel/index.js";

import ContextManager
from "./context/index.js";

import ToolExecutor
from "./tools/index.js";

import AgentManager
from "./agent/index.js";

import PlannerEngine
from "./planner-engine/index.js";

import WorkflowEngine
from "./workflow-engine/index.js";

import ServiceManager
from "../services/service-manager.js";

import API
from "../api/index.js";


const MAIN_ASSISTANT_AGENT =
"rigo-main-assistant";

const AI_CHAT_ENDPOINT =
"/api/ai-chat";


function serializeContextWindow(
  contextWindow
){

  const contexts =
  contextWindow?.contexts || [];

  if(!contexts.length){
    return "";
  }

  return contexts
  .map((context) => {

    try{
      return JSON.stringify(
        context.content
      );
    }
    catch(error){
      return String(
        context.content || ""
      );
    }

  })
  .filter(Boolean)
  .join("\n");

}


async function executeMainAssistant(
  task = {}
){

  const input =
  task.input || task;

  const message =
  String(
    input.message || ""
  )
  .trim();

  if(!message){
    throw new Error(
      "RIGO_AI_MESSAGE_REQUIRED"
    );
  }

  const contextWindow =
  await ContextManager
  .buildWindow(
    message,
    {
      maxTokens:4000
    }
  );

  const managedContext =
  serializeContextWindow(
    contextWindow
  );

  const baseContext =
  String(
    input.context ||
    "You are the main user-facing RIGO AI assistant."
  );

  const context =
  managedContext
  ? `${baseContext}\n\nRIGO MANAGED CONTEXT:\n${managedContext}`
  : baseContext;

  const response =
  await API.runtime.post(
    AI_CHAT_ENDPOINT,
    JSON.stringify({
      message,
      messages:
      Array.isArray(input.messages)
      ? input.messages
      : [],
      maxTokens:
      Number(input.maxTokens) ||
      4000,
      context
    }),
    {
      headers:{
        "Content-Type":"application/json",
        "Accept":"application/json"
      },
      retries:2
    }
  );

  const result =
  response?.data || {};

  if(result?.ok === false){
    throw new Error(
      result?.error ||
      "RIGO_AI_REQUEST_FAILED"
    );
  }

  if(
    typeof result?.message !==
    "string" ||
    !result.message.trim()
  ){
    throw new Error(
      "RIGO_AI_EMPTY_RESPONSE"
    );
  }

  return {
    message:
    result.message.trim(),
    requestId:
    response.requestId || null,
    contextWindow
  };

}


async function ensureMainAssistantAgent(){

  if(
    AgentManager.get(
      MAIN_ASSISTANT_AGENT
    )
  ){
    return true;
  }

  const agent =
  await AgentManager.register({
    id:
    MAIN_ASSISTANT_AGENT,
    name:
    "RIGO Main Assistant",
    description:
    "Primary user-facing RIGO AI assistant",
    capabilities:[
      "chat",
      "context",
      "memory",
      "tools"
    ],
    execute:
    executeMainAssistant
  });

  return Boolean(agent);

}


// =====================================
// SERVICE REGISTRATION
// =====================================

async function registerAIServices(){

  const services = [
    ["contexts",ContextManager],
    ["tools",ToolExecutor],
    ["agents",AgentManager],
    ["planner",PlannerEngine],
    ["workflows",WorkflowEngine]
  ];

  for(const [name,service] of services){

    if(ServiceManager.has(name)){
      continue;
    }

    await ServiceManager.register(
      name,
      async () => service
    );

  }

  return true;

}


// =====================================
// LIFECYCLE
// =====================================

async function initialize(){

  await registerAIServices();

  // The kernel owns synchronization/initialization of all
  // registered AI subsystems through the central container.
  await AIKernel.initialize();

  await ensureMainAssistantAgent();

  return true;

}


async function shutdown(){

  await WorkflowEngine.shutdown();
  await PlannerEngine.shutdown();
  await AgentManager.shutdown();
  await ToolExecutor.shutdown();
  await ContextManager.shutdown();
  await AIKernel.shutdown();

  return true;

}


async function reset(){

  await WorkflowEngine.reset();
  await PlannerEngine.reset();
  await AgentManager.reset();
  await ToolExecutor.reset();
  await ContextManager.reset();

  if(typeof AIKernel.destroy === "function"){
    await AIKernel.destroy();
  }

  return true;

}


// =====================================
// USER-FACING PROCESSING
// =====================================

async function process(
  payload = {}
){

  await ensureMainAssistantAgent();

  return AIKernel.process({
    type:
    "agent:main-assistant",
    input:
    payload,
    metadata:{
      ...(payload.metadata || {}),
      agentId:
      MAIN_ASSISTANT_AGENT
    }
  });

}


// =====================================
// DIAGNOSTICS
// =====================================

function diagnostics(){

  return Object.freeze({
    kernel:AIKernel.diagnostics(),
    context:ContextManager.diagnostics(),
    tools:ToolExecutor.diagnostics(),
    agents:AgentManager.diagnostics(),
    planner:PlannerEngine.diagnostics(),
    workflow:WorkflowEngine.diagnostics(),
    timestamp:Date.now()
  });

}


function snapshot(){

  return Object.freeze({
    kernel:AIKernel.state(),
    context:ContextManager.snapshot(),
    tools:ToolExecutor.snapshot(),
    agents:AgentManager.snapshot(),
    planner:PlannerEngine.snapshot(),
    workflow:WorkflowEngine.snapshot(),
    timestamp:Date.now()
  });

}


// =====================================
// AI API
// =====================================

export const AI =
Object.freeze({
  initialize,
  shutdown,
  reset,
  process,
  diagnostics,
  snapshot,
  registerServices:registerAIServices,
  ensureMainAssistantAgent,
  AIKernel,
  ContextManager,
  ToolExecutor,
  AgentManager,
  PlannerEngine,
  WorkflowEngine
});


if(typeof window !== "undefined"){
  window.AI = AI;
}

if(typeof globalThis !== "undefined"){
  globalThis.AI = AI;
}

export default AI;
