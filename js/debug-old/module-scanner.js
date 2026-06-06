// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

const modules = [

  "../core/app/app-dom.js",
  "../core/app/app-manager.js",
  "../core/app/app-recovery.js",
  "../core/app/app-state.js",
  "../core/app/application-runtime.js"

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
