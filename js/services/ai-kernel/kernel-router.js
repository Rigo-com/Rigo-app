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

import {
  recoverAIKernel
}
from "./kernel-recovery.js";



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
  getAIService(
    "planner"
  );

  const workflows =
  getAIService(
    "workflows"
  );

  const tools =
  getAIService(
    "tools"
  );

  const agents =
  getAIService(
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

    return tools
    .execute(request);

  }

  if(
    agents?.process
  ){

    aiKernelState
    .diagnostics
    .routedToAgents++;

    return agents
    .process(request);

  }

  throw new Error(
    "NO AVAILABLE REQUEST ROUTER"
  );

}
