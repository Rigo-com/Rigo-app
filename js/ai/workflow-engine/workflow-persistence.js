// =====================================
// RIGO AI
// WORKFLOW PERSISTENCE
// =====================================

import {
  WORKFLOW_ENGINE_CONFIG
}
from "./workflow-config.js";

import ServiceManager
from "../../services/service-manager.js";


export async function persistWorkflow(
  workflow
){

  if(
    !WORKFLOW_ENGINE_CONFIG.ENABLE_PERSISTENCE ||
    !workflow
  ){
    return false;
  }

  try{

    const memory =
    await ServiceManager.resolve("memory");

    if(typeof memory?.create !== "function"){
      return false;
    }

    const snapshot = {
      workflowId:workflow.id,
      name:workflow.name,
      description:workflow.description,
      state:workflow.state,
      retries:workflow.retries,
      metadata:workflow.metadata || {},
      createdAt:workflow.createdAt,
      updatedAt:workflow.updatedAt,
      steps:(workflow.steps || []).map((step) => ({
        id:step.id,
        name:step.name,
        type:step.type,
        objective:step.objective,
        assignedTool:step.assignedTool,
        assignedAgent:step.assignedAgent,
        parallel:step.parallel === true,
        state:step.state,
        retries:step.retries,
        result:step.result,
        error:step.error
      }))
    };

    return Boolean(
      await memory.create(
        JSON.stringify(snapshot),
        {
          type:"system",
          priority:
          workflow.state === "completed"
          ? "normal"
          : "high",
          tags:[
            "workflow-engine",
            `workflow:${workflow.id}`,
            `state:${workflow.state}`
          ]
        }
      )
    );

  }
  catch(error){
    return false;
  }

}
