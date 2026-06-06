// =====================================
// RIGO AI
// MODULE SCANNER
// =====================================

const modules = [

  "./debug/diagnostics/diagnostics-state.js",
  "./debug/scanner/module-scanner.js",
  "./debug/monitor/memory-monitor.js",
  "./debug/reporter/report-builder.js",
  "./debug/ui/debug-dashboard.js"

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
