// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

const modules = [

  "../ai/index.js",

  "../api/index.js",

  "../auth/index.js",

  "../bootstrap/index.js",

  "../chat/index.js",

  "../communication/index.js",

  "../core/index.js",

  "../debug/index.js",

  "../memory/index.js",

  "../search/index.js",

  "../security/index.js",

  "../services/index.js",

  "../settings/index.js",

  "../shared/index.js",

  "../storage/index.js",

  "../ui/index.js",

  "../voice/index.js"

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
