// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

const modules = [

  "../debug/index.js",

  "../debug/diagnostics/index.js",

  "../debug/scanner/index.js",

  "../debug/monitor/index.js",

  "../debug/reporter/index.js",

  "../debug/ui/index.js"

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
