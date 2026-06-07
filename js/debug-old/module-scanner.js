export default async function runModuleScanner(){

  const modules = [

  "../bootstrap/bootstrap-config.js",
  "../bootstrap/bootstrap-diagnostics.js",
  "../bootstrap/bootstrap-lifecycle.js",
  "../bootstrap/bootstrap-manager.js",
  "../bootstrap/bootstrap-registry.js",
  "../bootstrap/bootstrap-setup.js",
  "../bootstrap/bootstrap-state.js",
  "../bootstrap/index.js"

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
