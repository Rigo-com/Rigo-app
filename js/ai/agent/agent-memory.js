// =====================================
// RIGO AI
// AGENT MEMORY
// =====================================

import { AGENT_MANAGER_CONFIG }
from "./agent-config.js";

import { agentManagerState }
from "./agent-state.js";

import ServiceManager
from "../../services/service-manager.js";

export async function persistAgentTask(
  agent,
  task,
  outcome
){
  if(!AGENT_MANAGER_CONFIG.ENABLE_AGENT_MEMORY){
    return false;
  }

  try{
    const memory = await ServiceManager.resolve("memory");
    if(typeof memory?.create !== "function"){
      agentManagerState.diagnostics.memoryFailed++;
      return false;
    }

    await memory.create({
      type:"agent-task",
      namespace:`agent:${agent.id}`,
      content:{
        agentId:agent.id,
        task,
        outcome,
        timestamp:Date.now()
      }
    });

    agentManagerState.diagnostics.memorySaved++;
    return true;
  }
  catch(error){
    agentManagerState.diagnostics.memoryFailed++;
    return false;
  }
}
