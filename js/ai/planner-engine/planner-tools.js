// =====================================
// RIGO AI
// PLANNER TOOLS
// =====================================



// =====================================
// REGISTERED TOOLS
// =====================================

export function getRegisteredTools(){

  try{

    if(
      typeof ToolExecutor ===
      "undefined"
    ){

      return [];

    }

    if(
      typeof ToolExecutor.list !==
      "function"
    ){

      return [];

    }

    return ToolExecutor
    .list();

  }

  catch(error){

    return [];

  }

}
