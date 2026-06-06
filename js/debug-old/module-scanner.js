// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

const modules = [

  "../ai/ai-kernel/index.js",

  "../ai/context/index.js",

  "../ai/tools/index.js",

  "../ai/agent/index.js",

  "../ai/planner-engine/index.js",

  "../ai/workflow-engine/index.js"

];



export async function runModuleScanner(){

  const results = [];

  for(
    const modulePath
    of modules
  ){

    try{

      await import(modulePath);

      results.push({
        module: modulePath,
        status: "PASS"
      });

    }

    catch(error){

  results.push({

    module: modulePath,

    status: "FAIL",

    name: error?.name,

    message: error?.message,

    source:
    error?.sourceURL ||
    error?.fileName ||
    error?.url

  });

}

  }

  return results;

}



export default
runModuleScanner;
