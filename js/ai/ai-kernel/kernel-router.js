// =====================================
// RIGO AI
// AI KERNEL ROUTER
// =====================================

import {
  AI_KERNEL_CONFIG
}
from "./kernel-config.js";

import {
  AI_KERNEL_STATES,
  AI_KERNEL_EVENTS
}
from "./kernel-constants.js";

import {
  aiKernelState
}
from "./kernel-state.js";

import {
  createTimeoutPromise
}
from "./kernel-utils.js";

import {
  shouldRecoverKernel,
  recoverAIKernel
}
from "./kernel-recovery.js";

import {
  emitKernelEvent
}
from "./kernel-events.js";

import {
  getAIService
}
from "./kernel-services.js";

import {
  setKernelState,
  validateKernelPayload,
  createKernelRequest
}
from "./kernel-request.js";


// =====================================
// ROUTE REQUEST
// =====================================

export async function
routeKernelRequest(
  request
){

  const requestType =
  String(
    request.type || ""
  )
  .toLowerCase();

  const planner =
  await getAIService(
    "planner"
  );

  const workflows =
  await getAIService(
    "workflows"
  );

  const tools =
  await getAIService(
    "tools"
  );

  const agents =
  await getAIService(
    "agents"
  );

  if(
    requestType.includes(
      "plan"
    )
    &&
    planner?.process
  ){

    aiKernelState
    .diagnostics
    .routedToPlanner++;

    return planner
    .process(request);

  }

  if(
    requestType.includes(
      "workflow"
    )
    &&
    workflows?.process
  ){

    aiKernelState
    .diagnostics
    .routedToWorkflow++;

    return workflows
    .process(request);

  }

  if(
    requestType.includes(
      "tool"
    )
    &&
    tools?.execute
  ){

    aiKernelState
    .diagnostics
    .routedToTools++;

    const toolId =
    request.metadata?.toolId ||
    request.input?.toolId ||
    request.input?.tool ||
    "";

    if(!toolId){
      throw new Error(
        "TOOL_ID_REQUIRED"
      );
    }

    return tools
    .execute(
      toolId,
      request.input?.payload ||
      request.input || {},
      {
        requestId:
        request.id,
        metadata:
        request.metadata || {},
        signal:
        request.runtime?.signal || null
      }
    );

  }

  if(
    agents?.process
  ){

    aiKernelState
    .diagnostics
    .routedToAgents++;

    const agentId =
    request.metadata?.agentId ||
    request.input?.agentId ||
    null;

    return agents
    .process({
      agentId,
      requestId:
      request.id,
      type:
      request.type,
      input:
      request.input || {},
      metadata:
      request.metadata || {},
      signal:
      request.runtime?.signal || null
    });

  }

  throw new Error(
    "NO AVAILABLE REQUEST ROUTER"
  );

}


// =====================================
// EXECUTE REQUEST
// =====================================

export async function
executeKernelRequest(
  request
){

  request.runtime.startedAt =
  Date.now();

  aiKernelState
  .activeRequests
  .set(
    request.id,
    request
  );

  aiKernelState
  .diagnostics
  .requests++;

  aiKernelState
  .lastRequestAt =
  Date.now();

  await emitKernelEvent(

    AI_KERNEL_EVENTS
    .REQUEST_RECEIVED,

    {
      requestId:
      request.id
    }

  );

  try{

    setKernelState(

      AI_KERNEL_STATES
      .PROCESSING

    );

    const result =
    await createTimeoutPromise(

      AI_KERNEL_CONFIG
      .REQUEST_TIMEOUT,

      async () => {

        return await routeKernelRequest(
          request
        );

      }

    );

    request.runtime
    .completedAt =
    Date.now();

    aiKernelState
    .completedRequests
    .push({

      id:
      request.id,

      completedAt:
      Date.now()

    });

    aiKernelState
    .diagnostics
    .completed++;

    await emitKernelEvent(

      AI_KERNEL_EVENTS
      .REQUEST_COMPLETED,

      {
        requestId:
        request.id
      }

    );

    return result;

  }

  catch(error){

    aiKernelState
    .failedRequests
    .push({

      id:
      request.id,

      error:
      String(error),

      failedAt:
      Date.now()

    });

    aiKernelState
    .diagnostics
    .failed++;

    if(

      AI_KERNEL_CONFIG
      .ENABLE_RECOVERY

      &&

      shouldRecoverKernel(
        error
      )

      &&

      aiKernelState
      .recoveryAttempts <

      AI_KERNEL_CONFIG
      .MAX_RECOVERY_ATTEMPTS

    ){

      recoverAIKernel()
      .catch(() => {});

    }

    await emitKernelEvent(

      AI_KERNEL_EVENTS
      .REQUEST_FAILED,

      {

        requestId:
        request.id,

        error:
        String(error)

      }

    );

    throw error;

  }

  finally{

    aiKernelState
    .activeRequests
    .delete(
      request.id
    );

    if(

      aiKernelState
      .requestQueue
      .length > 0

      &&

      aiKernelState
      .activeRequests
      .size <

      AI_KERNEL_CONFIG
      .MAX_CONCURRENT_REQUESTS

    ){

      const queuedRequest =

      aiKernelState
      .requestQueue
      .shift();

      executeKernelRequest(
        queuedRequest
      )
      .catch(() => {});

    }

    if(

      aiKernelState
      .activeRequests
      .size <= 0

    ){

      setKernelState(

        AI_KERNEL_STATES
        .READY

      );

    }

  }

}


// =====================================
// PROCESS REQUEST
// =====================================

export async function
processKernelRequest(
  payload = {}
){

  if(
    aiKernelState
    .shuttingDown
  ){

    throw new Error(
      "KERNEL SHUTDOWN ACTIVE"
    );

  }

  if(
    !validateKernelPayload(
      payload
    )
  ){

    throw new Error(
      "INVALID REQUEST PAYLOAD"
    );

  }

  const request =
  createKernelRequest(
    payload
  );

  if(

    aiKernelState
    .activeRequests
    .size >=

    AI_KERNEL_CONFIG
    .MAX_CONCURRENT_REQUESTS

  ){

    if(

      !AI_KERNEL_CONFIG
      .ENABLE_REQUEST_QUEUE

    ){

      throw new Error(

        "MAX CONCURRENT REQUESTS REACHED"

      );

    }

    if(

      aiKernelState
      .requestQueue
      .length >=

      AI_KERNEL_CONFIG
      .MAX_QUEUE_SIZE

    ){

      throw new Error(
        "REQUEST QUEUE FULL"
      );

    }

    request.runtime
    .queuedAt =
    Date.now();

    aiKernelState
    .requestQueue
    .push(
      request
    );

    aiKernelState
    .diagnostics
    .queued++;

    await emitKernelEvent(

      AI_KERNEL_EVENTS
      .REQUEST_QUEUED,

      {
        requestId:
        request.id
      }

    );

    return {

      queued:true,

      requestId:
      request.id

    };

  }

  return executeKernelRequest(
    request
  );

}
