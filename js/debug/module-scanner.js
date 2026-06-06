// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

const modules = [

  "./core/app/application-runtime.js",
  "./core/state/state-transactions.js",
  "./core/events/event-queue.js",
  "./core/modules/module-runtime.js",
  "./core/container/container-resolution.js"

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

        module:
        modulePath,

        status:
        "FAIL",

        message:
        error?.message,

        stack:
        error?.stack

      });

    }

  }

  return results;

}



export default
runModuleScanner;
