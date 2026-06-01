// =====================================
// RIGO AI
// AI KERNEL SERVICES
// =====================================

import {
  aiKernelState
}
from "./kernel-state.js";

import {
  createTimeoutPromise
}
from "./kernel-utils.js";

import {
  logKernelError
}
from "./kernel-events.js";



// =====================================
// GET SERVICE
// =====================================

export function getAIService(
  serviceName
){

  try{

    if(
      typeof ServiceRegistry ===
      "undefined"
    ){

      return null;

    }

    if(
      typeof ServiceRegistry.get !==
      "function"
    ){

      return null;

    }

    return ServiceRegistry.get(
      serviceName
    );

  }

  catch(error){

    return null;

  }

}



// =====================================
// VALIDATE SYSTEMS
// =====================================

export function validateAISystems(){

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

  const contexts =
  getAIService(
    "contexts"
  );

  return (

    planner &&
    typeof planner.process ===
    "function"

    &&

    workflows &&
    typeof workflows.process ===
    "function"

    &&

    tools &&
    typeof tools.execute ===
    "function"

    &&

    agents &&
    typeof agents.process ===
    "function"

    &&

    contexts &&
    typeof contexts.initialize ===
    "function"

  );

}



// =====================================
// SYNCHRONIZE SYSTEMS
// =====================================

export async function
synchronizeAISystems(){

  const systems = [

    "planner",
    "workflows",
    "tools",
    "agents",
    "contexts"

  ];

  aiKernelState
  .failedSystems
  .clear();

  aiKernelState
  .synchronizedSystems
  .clear();

  for(
    const systemName
    of
    systems
  ){

    const system =
    getAIService(
      systemName
    );

    try{

      if(
        !system ||
        typeof system.initialize !==
        "function"
      ){

        aiKernelState
        .failedSystems
        .add(
          systemName
        );

        continue;

      }

      await createTimeoutPromise(

        15000,

        async () => {

          await system.initialize();

        }

      );

      aiKernelState
      .synchronizedSystems
      .add(
        systemName
      );

    }

    catch(error){

      aiKernelState
      .failedSystems
      .add(
        systemName
      );

      await logKernelError(

        "AI SYSTEM SYNC FAILED",

        {

          system:
          systemName,

          error:
          String(error)

        }

      );

    }

  }

  return (

    aiKernelState
    .failedSystems
    .size <= 0

  );

}
