// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

const modules = [

  "./core/index.js",

  "./core/app/index.js",
  "./core/state/index.js",
  "./core/events/index.js",
  "./core/modules/index.js",
  "./core/container/index.js",

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
