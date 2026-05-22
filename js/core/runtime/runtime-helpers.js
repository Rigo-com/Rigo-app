// =====================================
// RIGO AI
// RUNTIME HELPERS
// =====================================

function freezeRuntimeObject(
  value,
  visited = new WeakSet()
){

  if(

    !value ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    if(

      nestedValue &&

      typeof nestedValue ===
      "object"

    ){

      freezeRuntimeObject(
        nestedValue,
        visited
      );

    }

  });

  return value;

}



function setRuntimeState(
  runtimeState
){

  runtimeManagerState
  .runtimeState =
  runtimeState;

  return true;

}



function addRuntimeError(
  error
){

  runtimeManagerState
  .runtimeErrors
  .push({

    error:
    String(error),

    timestamp:
    Date.now()

  });

  if(

    runtimeManagerState
    .runtimeErrors
    .length >

    RUNTIME_MANAGER_CONFIG
    .MAX_RUNTIME_ERRORS

  ){

    runtimeManagerState
    .runtimeErrors
    .shift();

  }

  return true;

}
