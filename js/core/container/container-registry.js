// =====================================
// RIGO AI
// CONTAINER REGISTRY
// =====================================



// =====================================
// HELPERS
// =====================================

function normalizeServiceName(
  serviceName
){

  return String(
    serviceName || ""
  )
  .trim()
  .toLowerCase();

}



// =====================================
// REGISTRY API
// =====================================

function registerService(
  state,
  serviceName,
  definition
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(
    !normalizedName
  ){

    throw new Error(
      "INVALID_SERVICE_NAME"
    );

  }

  if(
    !definition
  ){

    throw new Error(
      "INVALID_SERVICE_DEFINITION"
    );

  }

  if(
    state.services.has(
      normalizedName
    )
  ){

    throw new Error(
      "SERVICE_ALREADY_REGISTERED"
    );

  }

  state.services.set(
    normalizedName,
    definition
  );

  return definition;

}



function removeService(
  state,
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(
    !normalizedName
  ){

    return false;

  }

  return state.services.delete(
    normalizedName
  );

}



function getService(
  state,
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(
    !normalizedName
  ){

    return null;

  }

  return (
    state.services.get(
      normalizedName
    ) || null
  );

}



function getServices(
  state
){

  return [

    ...state.services.keys()

  ];

}



function hasService(
  state,
  serviceName
){

  const normalizedName =
  normalizeServiceName(
    serviceName
  );

  if(
    !normalizedName
  ){

    return false;

  }

  return state.services.has(
    normalizedName
  );

}



// =====================================
// EXPORTS
// =====================================

export {

  normalizeServiceName,

  registerService,

  removeService,

  getService,

  getServices,

  hasService

};
