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
    "../voice/index.js"

  ];

  const results = [];

  for(const modulePath of MODULES){

    try{

      const mod =
      await import(
        modulePath
      );

      results.push({

        module:
        modulePath,

        status:
        "PASS",

        hasDefault:
        "default" in mod,

        exports:
        Object.keys(mod)

      });

    }

    catch(error){

      results.push({

        module:
        modulePath,

        status:
        "FAIL",

        name:
        error?.name || null,

        message:
        error?.message || null,

        source:
        error?.sourceURL ||
        error?.fileName ||
        null

      });

    }

  }

  return results;

}
