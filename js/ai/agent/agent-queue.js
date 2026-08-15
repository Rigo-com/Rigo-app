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

      const availableTaskIndex =
      agentManagerState
      .taskQueue
      .findIndex((queuedTask) => {

        return !agentManagerState
        .executionLocks
        .has(
          queuedTask.agentId
        );

      });

      if(availableTaskIndex < 0){
        break;
      }

      const [queuedTask] =
      agentManagerState
      .taskQueue
      .splice(
        availableTaskIndex,
        1
      );

      if(!queuedTask){

        continue;

      }

      try{

        const result =
        await executeAgentTask(

          queuedTask.agentId,

          queuedTask.task

        );

        queuedTask.resolve(
          result
        );

      }

      catch(error){
        queuedTask.reject(error);
      }

    }

  }

  finally{

    agentManagerState
    .queueProcessing =
    false;

  }

  return true;

}
