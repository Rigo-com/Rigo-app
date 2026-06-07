export default async function runModuleScanner(){

  const modules = [

  "../core/constants/index.js",
  "../core/config/index.js",
  "../core/container/index.js",
  "../core/events/index.js",
  "../core/state/index.js",
  "../core/modules/index.js",
  "../core/runtime/index.js",
  "../core/lifecycle/index.js",
  "../core/health/index.js",
  "../core/app/index.js",
  "../core/index.js"

];

  const results = [];

  for(const modulePath of modules){

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
        null

      });

    }

  }

  return results;

}
