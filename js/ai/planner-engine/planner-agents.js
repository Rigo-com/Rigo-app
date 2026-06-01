// =====================================
// RIGO AI
// PLANNER AGENTS
// =====================================

import ServiceManager
from "../../services/service-manager.js";



// =====================================
// AVAILABLE AGENTS
// =====================================

export async function getAvailableAgents(){

  try{

    const agents =
    await ServiceManager.resolve(
      "agents"
    );

    if(
      !agents
    ){

      return [];

    }

    if(
      typeof agents.list !==
      "function"
    ){

      return [];

    }

    return await agents.list();

  }

  catch(error){

    return [];

  }

}



// =====================================
// ASSIGN AGENT
// =====================================

export async function assignAgentToPlan(){

  try{

    const agents =
    await getAvailableAgents();

    const availableAgent =
    agents.find((agent) => {

      return (
        agent.state ===
        "ready"
      );

    });

    return availableAgent

      ? availableAgent.id

      : null;

  }

  catch(error){

    return null;

  }

}
