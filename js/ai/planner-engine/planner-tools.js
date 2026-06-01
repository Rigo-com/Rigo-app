// =====================================
// RIGO AI
// PLANNER TOOLS
// =====================================

import ServiceManager
from "../../services/service-manager.js";



// =====================================
// REGISTERED TOOLS
// =====================================

export async function getRegisteredTools(){

  try{

    const tools =
    await ServiceManager.resolve(
      "tools"
    );

    if(
      !tools
    ){

      return [];

    }

    if(
      typeof tools.list !==
      "function"
    ){

      return [];

    }

    return await tools.list();

  }

  catch(error){

    return [];

  }

}
