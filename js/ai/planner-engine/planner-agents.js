// =====================================
// RIGO AI
// PLANNER AGENTS
// =====================================



// =====================================
// AVAILABLE AGENTS
// =====================================

export function getAvailableAgents(){

  try{

    if(
      typeof AgentManager ===
      "undefined"
    ){

      return [];

    }

    if(
      typeof AgentManager.list !==
      "function"
    ){

      return [];

    }

    return AgentManager
    .list();

  }

  catch(error){

    return [];

  }

}



// =====================================
// ASSIGN AGENT
// =====================================

export function assignAgentToPlan(){

  try{

    const agents =
    getAvailableAgents();

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
