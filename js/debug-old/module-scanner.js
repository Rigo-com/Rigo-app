export default async function runModuleScanner(){

  const MODULES = [

  "../ai/index.js",
  "../api/index.js",
  "../auth/index.js",
  "../bootstrap/index.js",
  "../chat/index.js",
  "../communication/index.js",
  "../core/index.js",
  "../memory/index.js",
  "../search/index.js",
  "../security/index.js",
  "../services/index.js",
  "../settings/index.js",
  "../shared/index.js",
  "../storage/index.js",
  "../ui/index.js",
  "../voice/index.js",
  "../index.js"

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
