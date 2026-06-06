// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

const modules = [

  "../ai/tools/tool-config.js",
  "../ai/tools/tool-constants.js",
  "../ai/tools/tool-state.js",
  "../ai/tools/tool-utils.js",
  "../ai/tools/tool-events.js",
  "../ai/tools/tool-registry.js",
  "../ai/tools/tool-index.js",
  "../ai/tools/tool-reset.js",
  "../ai/tools/tool-queue.js",
  "../ai/tools/tool-executor.js",
  "../ai/tools/tool-diagnostics.js",
  "../ai/tools/tool-lifecycle.js"

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
