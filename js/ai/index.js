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

const WEATHER_TOOL =
"weather";

const AI_CHAT_ENDPOINT =
"/api/ai-chat";

const WEATHER_ENDPOINT =
"/api/weather";

const aiRuntimeState = Object.seal({
  initialized:false,
  initializing:false,
  shuttingDown:false,
  startupPromise:null,
  shutdownPromise:null,
  startedAt:null,
  lastError:null
});


function createConversationNamespace(
  metadata = {}
){

  const userId =
  String(
    metadata.userId ||
    "anonymous"
  );

  const conversationId =
  String(
    metadata.conversationId ||
    "default"
  );

  return (
    `chat:${userId}:${conversationId}`
  )
  .trim()
  .toLowerCase();

}


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


function serializeMemoryResults(
  results = []
){

  return results
  .map((entry) => {
    const memory =
    entry?.memory || entry;

    return String(
      memory?.content || ""
    )
    .trim();
  })
  .filter(Boolean)
  .join("\n");

}


async function buildLongTermMemoryContext(
  message
){

  try{
    const memory =
    await ServiceManager.resolve(
      "memory"
    );

    if(!memory?.search){
      return "";
    }

    const results =
    await memory.search(
      message,
      {limit:5}
    ) || [];

    await memory.clearContext?.();

    for(const entry of results){
      const selectedMemory =
      entry?.memory || entry;

      await memory.addContext?.({
        id:selectedMemory?.id,
        type:selectedMemory?.type,
        content:selectedMemory?.content,
        score:Number(entry?.score) || 0,
        retrievedAt:Date.now()
      });
    }

    const workingSet =
    memory.getContext?.() ||
    results;

    return serializeMemoryResults(
      workingSet
    );
  }
  catch(error){
    return "";
  }

}


async function rememberAssistantExchange({
  message,
  assistant,
  metadata = {}
}){

  try{
    const memory =
    await ServiceManager.resolve(
      "memory"
    );

    if(!memory?.create){
      return false;
    }

    const tags = [
      "rigo-main-assistant"
    ];

    if(metadata.conversationId){
      tags.push(
        `conversation:${String(metadata.conversationId)}`
      );
    }

    return Boolean(
      await memory.create(
        JSON.stringify({
          user:message,
          assistant
        }),
        {
          type:"conversation",
          priority:"normal",
          tags
        }
      )
    );
  }
  catch(error){
    return false;
  }

}


function needsWeather(
  message
){

  return /(طقس|الجو|درجة\s*الحرارة|حرارة\s*اليوم|مطر|تمطر|weather|forecast|temperature|rain)/i
  .test(
    String(message || "")
  );

}


async function executeWeatherTool({
  payload = {}
} = {}){

  const latitude =
  Number(
    payload.latitude ??
    payload.lat
  );

  const longitude =
  Number(
    payload.longitude ??
    payload.lon
  );

  if(
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ){

    throw new Error(
      "WEATHER_COORDINATES_REQUIRED"
    );

  }

  const response =
  await API.runtime.get(
    `${WEATHER_ENDPOINT}?lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`,
    {
      retries:2
    }
  );

  const data =
  response?.data || {};

  if(data?.ok === false){
    throw new Error(
      data?.error ||
      "WEATHER_FAILED"
    );
  }

  return data;

}


async function ensureAITools(){

  if(
    !ToolExecutor.get(
      WEATHER_TOOL
    )
  ){

    const tool =
    await ToolExecutor.register({
      id:
      WEATHER_TOOL,
      name:
      "Weather",
      description:
      "Gets live weather and a short forecast for geographic coordinates.",
      permissions:[
        "network",
        "location"
      ],
      execute:
      executeWeatherTool
    });

    if(!tool){
      throw new Error(
        "WEATHER_TOOL_REGISTRATION_FAILED"
      );
    }

  }

  return true;

}


async function buildLiveToolContext(
  input = {}
){

  const message =
  String(
    input.message || ""
  );

  if(!needsWeather(message)){
    return "";
  }

  const location =
  input.location || {};

  const latitude =
  Number(
    location.latitude ??
    location.lat
  );

  const longitude =
  Number(
    location.longitude ??
    location.lon
  );

  if(
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ){

    return (
      "WEATHER TOOL STATUS: location coordinates are unavailable. " +
      "Ask the user to allow location access or provide a city."
    );

  }

  const execution =
  await ToolExecutor.execute(
    WEATHER_TOOL,
    {
      latitude,
      longitude
    },
    {
      source:
      "rigo-main-assistant"
    }
  );

  if(
    !execution?.success
  ){

    return (
      "WEATHER TOOL STATUS: unavailable because " +
      String(
        execution?.error?.message ||
        execution?.message ||
        execution?.code ||
        "WEATHER_TOOL_FAILED"
      )
    );

  }

  return (
    "LIVE WEATHER TOOL RESULT " +
    `(source: ${execution.result?.source || "weather"}):\n` +
    JSON.stringify(
      execution.result
    )
  );

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

  const namespace =
  createConversationNamespace(
    input.metadata || {}
  );

  const contextWindow =
  task.metadata?.contextWindow ||
  await ContextManager.buildWindow(
    message,
    {
      maxTokens:4000,
      namespace
    }
  );

  const managedContext =
  serializeContextWindow(
    contextWindow
  );

  const longTermMemory =
  await buildLongTermMemoryContext(
    message
  );

  const liveToolContext =
  await buildLiveToolContext(
    input
  );

  const contextParts = [
    String(
      input.context ||
      "You are the main user-facing RIGO AI assistant. Use live tool results when provided."
    )
  ];

  if(managedContext){
    contextParts.push(
      `RIGO MANAGED CONTEXT:\n${managedContext}`
    );
  }

  if(longTermMemory){
    contextParts.push(
      `RIGO LONG-TERM MEMORY:\n${longTermMemory}`
    );
  }

  if(liveToolContext){
    contextParts.push(
      liveToolContext
    );
  }

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
      context:
      contextParts.join("\n\n")
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

  await ContextManager.register({
    namespace,
    type:"session",
    priority:5,
    content:{
      user:message,
      assistant:
      result.message.trim()
    },
    metadata:{
      userId:
      input.metadata?.userId ||
      null,
      conversationId:
      input.metadata?.conversationId ||
      null,
      source:
      MAIN_ASSISTANT_AGENT
    }
  });

  await rememberAssistantExchange({
    message,
    assistant:
    result.message.trim(),
    metadata:
    input.metadata || {}
  });

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

  if(aiRuntimeState.initialized && !aiRuntimeState.shuttingDown){
    return true;
  }

  if(aiRuntimeState.startupPromise){
    return aiRuntimeState.startupPromise;
  }

  if(aiRuntimeState.shutdownPromise){
    await aiRuntimeState.shutdownPromise;
  }

  aiRuntimeState.initializing = true;
  aiRuntimeState.shuttingDown = false;

  const startup = Promise.resolve()
  .then(async () => {

    try{

      await registerAIServices();

      await AIKernel.initialize();

      await ensureAITools();
      await ensureMainAssistantAgent();

      aiRuntimeState.initialized = true;
      aiRuntimeState.startedAt = Date.now();
      aiRuntimeState.lastError = null;

      return true;

    }
    catch(error){

      aiRuntimeState.initialized = false;
      aiRuntimeState.lastError = String(error);

      await Promise.allSettled([
        AIKernel.shutdown(),
        WorkflowEngine.shutdown(),
        PlannerEngine.shutdown(),
        AgentManager.shutdown(),
        ToolExecutor.shutdown(),
        ContextManager.shutdown()
      ]);

      throw error;

    }
    finally{

      aiRuntimeState.initializing = false;
      aiRuntimeState.startupPromise = null;

    }

  });

  aiRuntimeState.startupPromise = startup;

  return startup;

}


async function shutdown(){

  if(aiRuntimeState.shutdownPromise){
    return aiRuntimeState.shutdownPromise;
  }

  if(aiRuntimeState.startupPromise){
    await aiRuntimeState.startupPromise;
  }

  aiRuntimeState.shuttingDown = true;

  const shutdownOperation = (async () => {

    try{

      await AIKernel.shutdown();

      await WorkflowEngine.shutdown();
      await PlannerEngine.shutdown();
      await AgentManager.shutdown();
      await ToolExecutor.shutdown();
      await ContextManager.shutdown();

      return true;

    }
    finally{

      aiRuntimeState.initialized = false;
      aiRuntimeState.shuttingDown = false;
      aiRuntimeState.shutdownPromise = null;
      aiRuntimeState.startedAt = null;

    }

  })();

  aiRuntimeState.shutdownPromise = shutdownOperation;

  return shutdownOperation;

}


async function reset(){

  if(aiRuntimeState.startupPromise){
    await aiRuntimeState.startupPromise;
  }

  await shutdown();

  aiRuntimeState.shuttingDown = true;

  try{

    if(typeof AIKernel.destroy === "function"){
      await AIKernel.destroy();
    }

    await WorkflowEngine.reset();
    await PlannerEngine.reset();
    await AgentManager.reset();
    await ToolExecutor.reset();
    await ContextManager.reset();

    aiRuntimeState.initialized = false;
    aiRuntimeState.startedAt = null;
    aiRuntimeState.lastError = null;

    return true;

  }
  finally{
    aiRuntimeState.shuttingDown = false;
  }

}


// =====================================
// USER-FACING PROCESSING
// =====================================

async function process(
  payload = {}
){

  if(aiRuntimeState.shuttingDown){
    throw new Error("AI LAYER SHUTDOWN ACTIVE");
  }

  if(!aiRuntimeState.initialized){
    await initialize();
  }

  await ensureAITools();
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
    lifecycle:{
      initialized:aiRuntimeState.initialized,
      initializing:aiRuntimeState.initializing,
      shuttingDown:aiRuntimeState.shuttingDown,
      uptime:aiRuntimeState.startedAt
        ? Date.now() - aiRuntimeState.startedAt
        : 0,
      lastError:aiRuntimeState.lastError
    },
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
    lifecycle:{
      initialized:aiRuntimeState.initialized,
      initializing:aiRuntimeState.initializing,
      shuttingDown:aiRuntimeState.shuttingDown
    },
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
  ensureTools:ensureAITools,
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
