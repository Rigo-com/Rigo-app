// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

const modules = [

  "./core/index.js",
  "./ai/index.js",
  "./api/index.js",
  "./auth/index.js",
  "./chat/index.js",
  "./communication/index.js",
  "./memory/index.js",
  "./search/index.js",
  "./services/index.js",
  "./settings/index.js",
  "./shared/index.js",
  "./storage/index.js",
  "./ui/index.js",
  "./voice/index.js"

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
