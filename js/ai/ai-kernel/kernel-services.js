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

import ServiceManager
from "../../services/service-manager.js";



// =====================================
// GET SERVICE
// =====================================

export async function getAIService(
  serviceName
){

  try{

    return await ServiceManager
    .resolve(
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

export async function
validateAISystems(){

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

  const contexts =
  await getAIService(
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
    await getAIService(
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
