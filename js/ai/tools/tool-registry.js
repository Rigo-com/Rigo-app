// =====================================
// RIGO AI
// TOOL REGISTRY
// TOOL MANAGEMENT LAYER
// =====================================

import {
  TOOL_EXECUTOR_CONFIG
}
from "./tool-config.js";

import {
  TOOL_PRIORITIES,
  TOOL_EVENTS
}
from "./tool-constants.js";

import {
  toolExecutorState
}
from "./tool-state.js";

import {
  normalizeToolName,
  cloneToolObject,
  freezeToolObject
}
from "./tool-utils.js";

import {
  indexTool,
  removeToolIndex
}
from "./tool-index.js";

import {
  emitToolEvent
}
from "./tool-events.js";



// =====================================
// TOOL OBJECT
// =====================================

export function createToolObject(
  config = {}
){

  const requestedTimeout =
  Number(config.timeout);

  const timeout =
  Number.isFinite(requestedTimeout) &&
  requestedTimeout > 0
  ? Math.floor(requestedTimeout)
  : TOOL_EXECUTOR_CONFIG.EXECUTION_TIMEOUT;

  const requestedRetries =
  Number(config.retries);

  const retries =
  Number.isFinite(requestedRetries)
  ? Math.min(
      Math.max(
        Math.floor(requestedRetries),
        1
      ),
      TOOL_EXECUTOR_CONFIG.MAX_RETRIES
    )
  : TOOL_EXECUTOR_CONFIG.MAX_RETRIES;

  const runtime = {

    executions:0,

    failures:0,

    lastExecutedAt:null,

    updatedAt:
    Date.now()

  };

  return {

    ...freezeToolObject({

      id:
      normalizeToolName(

        config.id ||

        config.name ||

        "tool"

      ),

      name:
      String(
        config.name ||
        "tool"
      ),

      description:
      String(
        config.description ||
        ""
      ),

      permissions:

        Array.isArray(
          config.permissions
        )

        ? [...config.permissions]

        : [],

      priority:

        Number(
          config.priority
        )

        ||

        TOOL_PRIORITIES
        .NORMAL,

      timeout:
      timeout,

      retries:
      retries,

      sandboxed:
      config.sandboxed !==
      false,

      execute:
      config.execute,

      enabled:true,

      createdAt:
      Date.now()

    }),

    runtime

  };

}



// =====================================
// REGISTER TOOL
// =====================================

export async function registerTool(
  config = {}
){

  if(
    toolExecutorState
    .shuttingDown
  ){

    return false;

  }

  if(

    toolExecutorState
    .tools
    .size >=

    TOOL_EXECUTOR_CONFIG
    .MAX_TOOLS

  ){

    return false;

  }

  if(
    typeof config.execute !==
    "function"
  ){

    return false;

  }

  const tool =
  createToolObject(
    config
  );

  if(

    toolExecutorState
    .tools
    .has(tool.id)

  ){

    return false;

  }

  toolExecutorState
  .tools
  .set(
    tool.id,
    tool
  );

  indexTool(tool);

  toolExecutorState
  .diagnostics
  .registered++;

  await emitToolEvent(

    TOOL_EVENTS
    .REGISTERED,

    {
      toolId:
      tool.id
    }

  );

  return freezeToolObject(
    cloneToolObject(tool)
  );

}



// =====================================
// GET TOOL
// =====================================

export function getRegisteredTool(
  toolId
){

  return toolExecutorState
  .tools
  .get(
    normalizeToolName(
      toolId
    )
  );

}


export function getTool(
  toolId
){

  const tool =
  getRegisteredTool(toolId);

  if(!tool){
    return null;
  }

  return freezeToolObject(
    cloneToolObject(tool)
  );

}



// =====================================
// REMOVE TOOL
// =====================================

export async function removeTool(
  toolId
){

  const normalizedId =
  normalizeToolName(
    toolId
  );

  removeToolIndex(
    normalizedId
  );

  toolExecutorState
  .disabledTools
  .delete(normalizedId);

  toolExecutorState
  .circuitBreakers
  .delete(normalizedId);

  for(const cacheKey of toolExecutorState.permissionCache.keys()){
    if(cacheKey.startsWith(`${normalizedId}::`)){
      toolExecutorState.permissionCache.delete(cacheKey);
    }
  }

  return toolExecutorState
  .tools
  .delete(
    normalizedId
  );

}



// =====================================
// DISABLE TOOL
// =====================================

export async function disableTool(
  toolId
){

  if(!TOOL_EXECUTOR_CONFIG.ENABLE_TOOL_DISABLE){
    return false;
  }

  const normalizedId =
  normalizeToolName(
    toolId
  );

  if(!toolExecutorState.tools.has(normalizedId)){
    return false;
  }

  toolExecutorState
  .disabledTools
  .add(
    normalizedId
  );

  toolExecutorState
  .diagnostics
  .disabled++;

  await emitToolEvent(

    TOOL_EVENTS
    .TOOL_DISABLED,

    {
      toolId:
      normalizedId
    }

  );

  return true;

}



// =====================================
// ENABLE TOOL
// =====================================

export async function enableTool(
  toolId
){

  if(!TOOL_EXECUTOR_CONFIG.ENABLE_TOOL_DISABLE){
    return false;
  }

  const normalizedId =
  normalizeToolName(
    toolId
  );

  if(!toolExecutorState.tools.has(normalizedId)){
    return false;
  }

  toolExecutorState
  .disabledTools
  .delete(
    normalizedId
  );

  toolExecutorState
  .diagnostics
  .enabled++;

  await emitToolEvent(

    TOOL_EVENTS
    .TOOL_ENABLED,

    {
      toolId:
      normalizedId
    }

  );

  return true;

}



// =====================================
// LIST TOOLS
// =====================================

export function listTools(){

  return freezeToolObject([

    ...toolExecutorState
    .tools
    .values()

  ]
  .map((tool) => {
    return cloneToolObject(tool);
  }));

}
