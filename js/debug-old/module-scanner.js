// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

const modules = [

  "../core/runtime/runtime-boot-sequence.js",

  "../core/runtime/runtime-config.js",

  "../core/runtime/runtime-helpers.js",

  "../core/runtime/runtime-manager.js",

  "../core/runtime/runtime-state.js"

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
