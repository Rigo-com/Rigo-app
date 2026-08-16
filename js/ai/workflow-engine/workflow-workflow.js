// =====================================
// RIGO AI
// WORKFLOW DEFINITION
// =====================================

import {
  WORKFLOW_ENGINE_CONFIG
}
from "./workflow-config.js";

import {
  WORKFLOW_STATES,
  WORKFLOW_STEP_STATES
}
from "./workflow-constants.js";

import {
  normalizeWorkflowId,
  createWorkflowId,
  cloneWorkflowObject
}
from "./workflow-utils.js";


// =====================================
// CREATE WORKFLOW
// =====================================

export function createWorkflowObject(
  config = {}
){

  const runtime = {
    running:false,
    startedAt:null,
    completedAt:null,
    controller:
      WORKFLOW_ENGINE_CONFIG
      .ENABLE_ABORT_CONTROLLERS
      ? new AbortController()
      : null
  };

  const workflow = {
    id:
    normalizeWorkflowId(
      config.id ||
      createWorkflowId()
    ),
    name:
    String(
      config.name ||
      "workflow"
    ),
    description:
    String(
      config.description ||
      ""
    ),
    state:
    WORKFLOW_STATES
    .CREATED,
    retries:0,
    metadata:
    cloneWorkflowObject(
      config.metadata || {}
    ),
    createdAt:
    Date.now(),
    updatedAt:
    Date.now(),
    runtime,
    steps:[]
  };

  const steps =
    Array.isArray(config.steps)
    ? config.steps.slice(
        0,
        WORKFLOW_ENGINE_CONFIG
        .MAX_STEPS
      )
    : [];

  workflow.steps =
  steps.map((step) => {

    const assignedTool =
    step.assignedTool ||
    step.tool ||
    null;

    const assignedAgent =
    step.assignedAgent ||
    step.agent ||
    null;

    return {
      id:
      normalizeWorkflowId(
        step.id ||
        createWorkflowId()
      ),
      name:
      String(
        step.name ||
        "step"
      ),
      type:
      String(
        step.type ||
        (
          assignedTool
          ? "tool"
          : assignedAgent
            ? "agent"
            : "generic"
        )
      ),
      objective:
      String(
        step.objective ||
        step.name ||
        ""
      ),
      assignedTool:
      assignedTool
      ? String(assignedTool)
      : null,
      assignedAgent:
      assignedAgent
      ? String(assignedAgent)
      : null,
      input:
      cloneWorkflowObject(
        step.input || {}
      ),
      metadata:
      cloneWorkflowObject(
        step.metadata || {}
      ),
      condition:
      step.condition,
      execute:
        typeof step.execute ===
        "function"
        ? step.execute
        : null,
      parallel:
      step.parallel === true,
      state:
      WORKFLOW_STEP_STATES
      .PENDING,
      retries:0,
      result:null,
      error:null,
      createdAt:
      Date.now()
    };

  });

  return workflow;

}
