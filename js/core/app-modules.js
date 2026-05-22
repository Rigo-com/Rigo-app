// =====================================
// MODULE REGISTRY
// =====================================

function registerAppModule(
  moduleName
){

  const normalizedName =
  String(
    moduleName || ""
  )
  .trim();

  if(!normalizedName){

    return false;

  }

  appState.activeModules
  .add(
    normalizedName
  );

  return true;

}



function markModuleFailed(
  moduleName
){

  const normalizedName =
  String(
    moduleName || ""
  )
  .trim();

  if(!normalizedName){

    return false;

  }

  appState.failedModules
  .add(
    normalizedName
  );

  return true;

}
