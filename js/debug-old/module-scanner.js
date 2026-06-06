// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

const modules = [

  "../bootstrap/index.js",

  "../core/index.js",

  "../services/index.js",

  "../storage/index.js",

  "../memory/index.js",

  "../communication/index.js",

  "../chat/index.js",

  "../search/index.js",

  "../ui/index.js",

  "../app.js"

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
