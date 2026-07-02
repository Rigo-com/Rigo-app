// =====================================
// RIGO AI
// PROJECT PROVIDER MANAGER
// PRIVATE ADMIN PROJECT AGENT
// =====================================

const providerManagerState =
Object.seal({

  activeProvider:
  null,

  providers:
  new Map(),

  initialized:
  false,

  lastError:
  null

});

function initialize(){

  providerManagerState
  .initialized =
  true;

  return true;

}

function registerProvider(
  provider
){

  if(
    !provider ||
    !provider.id
  ){

    return false;

  }

  providerManagerState
  .providers
  .set(
    provider.id,
    provider
  );

  if(
    !providerManagerState
    .activeProvider
  ){

    providerManagerState
    .activeProvider =
    provider.id;

  }

  return true;

}

function setActiveProvider(
  providerId
){

  if(
    !providerManagerState
    .providers
    .has(
      providerId
    )
  ){

    return false;

  }

  providerManagerState
  .activeProvider =
  providerId;

  return true;

}

function getActiveProvider(){

  if(
    !providerManagerState
    .activeProvider
  ){

    return null;

  }

  return providerManagerState
  .providers
  .get(
    providerManagerState
    .activeProvider
  ) || null;

}

async function scanProject(){

  const provider =
  getActiveProvider();

  if(
    !provider ||
    typeof provider.scanProject !== "function"
  ){

    return {

      ok:
      false,

      error:
      "NO_ACTIVE_PROJECT_PROVIDER"

    };

  }

  return provider
  .scanProject();

}

function snapshot(){

  return {

    initialized:
    providerManagerState
    .initialized,

    activeProvider:
    providerManagerState
    .activeProvider,

    providers:
    [
      ...providerManagerState
      .providers
      .keys()
    ],

    lastError:
    providerManagerState
    .lastError

  };

}

const ProjectProviderManager =
Object.freeze({

  initialize,

  register:
  registerProvider,

  setActive:
  setActiveProvider,

  getActive:
  getActiveProvider,

  scanProject,

  snapshot

});

export {

  initialize,

  registerProvider,

  setActiveProvider,

  getActiveProvider,

  scanProject,

  snapshot,

  ProjectProviderManager

};

export default
ProjectProviderManager;
