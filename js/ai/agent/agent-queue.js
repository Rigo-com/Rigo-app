// =====================================
// RIGO AI
// AGENT QUEUE
// TASK QUEUE SYSTEM
// =====================================

import {
  agentManagerState
}
from "./agent-state.js";

import {
  executeAgentTask
}
from "./agent-executor.js";



// =====================================
// PROCESS QUEUE
// =====================================

export async function
processAgentQueue(){

  if(
    agentManagerState
    .queueProcessing
  ){

    return false;

  }

  agentManagerState
  .queueProcessing =
  true;

  try{

    while(

      agentManagerState
      .taskQueue
      .length > 0

    ){

      const queuedTask =

        agentManagerState
        .taskQueue
        .shift();

      if(!queuedTask){

        continue;

      }

      try{

        await executeAgentTask(

          queuedTask.agentId,

          queuedTask.task

        );

      }

      catch(error){}

    }

  }

  finally{

    agentManagerState
    .queueProcessing =
    false;

  }

  return true;

}
