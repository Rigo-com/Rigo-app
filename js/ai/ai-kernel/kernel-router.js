// =====================================
// RIGO AI
// AI KERNEL ROUTER
// =====================================

import { AI_KERNEL_CONFIG }
from "./kernel-config.js";

import { AI_KERNEL_STATES, AI_KERNEL_EVENTS }
from "./kernel-constants.js";

import { aiKernelState }
from "./kernel-state.js";

import { createTimeoutPromise }
from "./kernel-utils.js";

import { shouldRecoverKernel, recoverAIKernel }
from "./kernel-recovery.js";

import { emitKernelEvent }
from "./kernel-events.js";

import { getAIService }
from "./kernel-services.js";

import { incrementKernelMetric }
from "./kernel-metrics.js";

import {
  setKernelState,
  validateKernelPayload,
  createKernelRequest
}
from "./kernel-request.js";



async function injectRequestContext(request){
  if(!AI_KERNEL_CONFIG.ENABLE_CONTEXT_INJECTION){
    return request;
  }

  const contexts = await getAIService("contexts");
  if(typeof contexts?.inject !== "function"){
    return request;
  }

  const injected = await contexts.inject(request);
  request.runtime.contextInjected = true;
  return injected || request;
}



export async function routeKernelRequest(request){
  if(!AI_KERNEL_CONFIG.ENABLE_REQUEST_ROUTING){
    throw new Error("REQUEST ROUTING DISABLED");
  }

  const routedRequest = await injectRequestContext(request);
  const requestType = String(routedRequest.type || "").toLowerCase();

  if(requestType.includes("plan") && AI_KERNEL_CONFIG.ENABLE_PLANNER_ROUTING){
    const planner = await getAIService("planner");
    if(planner?.process){
      incrementKernelMetric("routedToPlanner");
      return planner.process(routedRequest);
    }
  }

  if(requestType.includes("workflow") && AI_KERNEL_CONFIG.ENABLE_WORKFLOW_ROUTING){
    const workflows = await getAIService("workflows");
    if(workflows?.process){
      incrementKernelMetric("routedToWorkflow");
      return workflows.process(routedRequest);
    }
  }

  if(requestType.includes("tool")){
    const tools = await getAIService("tools");
    if(tools?.execute){
      const toolId = routedRequest.metadata?.toolId ||
        routedRequest.input?.toolId || routedRequest.input?.tool || "";

      if(!toolId){
        throw new Error("TOOL_ID_REQUIRED");
      }

      incrementKernelMetric("routedToTools");
      return tools.execute(
        toolId,
        routedRequest.input?.payload || routedRequest.input || {},
        {
          requestId:routedRequest.id,
          metadata:routedRequest.metadata || {},
          signal:routedRequest.runtime?.signal || null
        }
      );
    }
  }

  const agents = await getAIService("agents");
  if(agents?.process){
    incrementKernelMetric("routedToAgents");
    return agents.process({
      agentId:routedRequest.metadata?.agentId || routedRequest.input?.agentId || null,
      requestId:routedRequest.id,
      type:routedRequest.type,
      input:routedRequest.input || {},
      metadata:routedRequest.metadata || {},
      signal:routedRequest.runtime?.signal || null
    });
  }

  throw new Error("NO AVAILABLE REQUEST ROUTER");
}



async function runKernelRequest(request){
  request.runtime.startedAt = Date.now();
  aiKernelState.activeRequests.set(request.id, request);
  incrementKernelMetric("requests");
  aiKernelState.lastRequestAt = Date.now();

  await emitKernelEvent(AI_KERNEL_EVENTS.REQUEST_RECEIVED, {requestId:request.id});

  try{
    setKernelState(AI_KERNEL_STATES.PROCESSING);

    const result = await createTimeoutPromise(
      AI_KERNEL_CONFIG.REQUEST_TIMEOUT,
      () => routeKernelRequest(request),
      request.runtime.controller
    );

    request.runtime.completedAt = Date.now();
    aiKernelState.completedRequests.push({id:request.id, completedAt:request.runtime.completedAt});
    incrementKernelMetric("completed");
    await emitKernelEvent(AI_KERNEL_EVENTS.REQUEST_COMPLETED, {requestId:request.id});
    return result;
  }
  catch(error){
    const aborted = Boolean(request.runtime.controller?.signal?.aborted);
    aiKernelState.failedRequests.push({
      id:request.id,
      error:String(error),
      failedAt:Date.now(),
      aborted
    });

    incrementKernelMetric("failed");
    if(aborted){
      incrementKernelMetric("aborted");
      await emitKernelEvent(AI_KERNEL_EVENTS.REQUEST_ABORTED, {requestId:request.id});
    }

    if(
      AI_KERNEL_CONFIG.ENABLE_RECOVERY &&
      shouldRecoverKernel(error) &&
      aiKernelState.recoveryAttempts < AI_KERNEL_CONFIG.MAX_RECOVERY_ATTEMPTS
    ){
      recoverAIKernel().catch(() => {});
    }

    await emitKernelEvent(AI_KERNEL_EVENTS.REQUEST_FAILED, {
      requestId:request.id,
      error:String(error)
    });
    throw error;
  }
  finally{
    aiKernelState.activeRequests.delete(request.id);
    if(!aiKernelState.shuttingDown && aiKernelState.activeRequests.size <= 0){
      setKernelState(AI_KERNEL_STATES.READY);
    }
    drainKernelQueue();
  }
}



export function executeKernelRequest(request){
  const execution = runKernelRequest(request);
  aiKernelState.executionPromises.set(request.id, execution);
  execution.finally(() => {
    aiKernelState.executionPromises.delete(request.id);
  }).catch(() => {});
  return execution;
}



export function drainKernelQueue(){
  if(aiKernelState.queueProcessing || aiKernelState.shuttingDown){
    return false;
  }

  aiKernelState.queueProcessing = true;

  try{
    while(
      aiKernelState.requestQueue.length > 0 &&
      aiKernelState.activeRequests.size < AI_KERNEL_CONFIG.MAX_CONCURRENT_REQUESTS &&
      !aiKernelState.shuttingDown
    ){
      const entry = aiKernelState.requestQueue.shift();
      executeKernelRequest(entry.request).then(entry.resolve, entry.reject);
    }
  }
  finally{
    aiKernelState.queueProcessing = false;
  }

  return true;
}



export async function processKernelRequest(payload = {}){
  if(!aiKernelState.initialized || aiKernelState.shuttingDown){
    throw new Error(aiKernelState.shuttingDown ? "KERNEL SHUTDOWN ACTIVE" : "KERNEL NOT INITIALIZED");
  }

  if(!validateKernelPayload(payload)){
    throw new Error("INVALID REQUEST PAYLOAD");
  }

  const request = createKernelRequest(payload);
  if(aiKernelState.activeRequests.size < AI_KERNEL_CONFIG.MAX_CONCURRENT_REQUESTS){
    return executeKernelRequest(request);
  }

  if(!AI_KERNEL_CONFIG.ENABLE_REQUEST_QUEUE){
    throw new Error("MAX CONCURRENT REQUESTS REACHED");
  }

  if(aiKernelState.requestQueue.length >= AI_KERNEL_CONFIG.MAX_QUEUE_SIZE){
    throw new Error("REQUEST QUEUE FULL");
  }

  request.runtime.queuedAt = Date.now();
  incrementKernelMetric("queued");
  await emitKernelEvent(AI_KERNEL_EVENTS.REQUEST_QUEUED, {requestId:request.id});

  return new Promise((resolve, reject) => {
    aiKernelState.requestQueue.push({request, resolve, reject});
  });
}
