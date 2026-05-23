// =====================================
// RIGO AI
// SECURITY FREEZE
// ENTERPRISE IMMUTABLE RUNTIME LAYER
// =====================================



// =====================================
// HOST OBJECT CHECK
// =====================================

function isHostObject(
  value
){

  if(
    !value
  ){

    return false;

  }

  return (

    value instanceof
    Element

    ||

    value instanceof
    EventTarget

    ||

    value instanceof
    Blob

    ||

    value instanceof
    File

    ||

    value instanceof
    Response

    ||

    value instanceof
    Request

    ||

    value instanceof
    Headers

  );

}



// =====================================
// SAFE FREEZE VALUE
// =====================================

function safeFreezeValue(
  value,
  visited
){

  try{

    return deepFreezeSecurity(
      value,
      visited
    );

  }

  catch(error){

    logSecurityEvent(

      "FREEZE_VALUE_FAILED",

      {

        error:
        String(error)

      }

    );

    return null;

  }

}



// =====================================
// DEEP FREEZE
// =====================================

function deepFreezeSecurity(
  object,
  visited = new WeakMap()
){

  if(
    !object ||
    typeof object !==
    "object"
  ){

    return object;

  }

  if(
    isHostObject(object)
  ){

    return object;

  }

  if(
    Object.isFrozen(
      object
    )
  ){

    return object;

  }

  const cached =
  visited.get(object);

  if(cached){

    if(
      cached.state ===
      FREEZE_STATES.FROZEN
    ){

      return cached.value;

    }

    return cached.clone;

  }

  const clone =

    Array.isArray(object)

    ?

    []

    :

    Object.create(
      Object.getPrototypeOf(
        object
      )
    );

  visited.set(object,{

    clone,

    state:
    FREEZE_STATES.PENDING

  });

  let freezeSucceeded =
  false;

  try{

    Reflect
    .ownKeys(object)
    .forEach((key) => {

      try{

        const descriptor =

          Object
          .getOwnPropertyDescriptor(
            object,
            key
          );

        if(
          !descriptor
        ){

          return;
        }



        // ============================
        // BLOCK ACCESSORS
        // ============================

        if(
          descriptor.get ||
          descriptor.set
        ){

          logSecurityEvent(

            "FREEZE_ACCESSOR_SKIPPED",

            {

              key:
              typeof key ===
              "symbol"

              ?

              "[SYMBOL_KEY]"

              :

              String(key)

            }

          );

          return;
        }

        descriptor.value =
        safeFreezeValue(

          descriptor.value,

          visited

        );

        if(
          descriptor.writable !==
          undefined
        ){

          descriptor.writable =
          false;

          descriptor.configurable =
          false;

        }

        Object.defineProperty(

          clone,

          key,

          descriptor

        );

      }

      catch(error){

        logSecurityEvent(

          "FREEZE_PROPERTY_FAILED",

          {

            key:
            typeof key ===
            "symbol"

            ?

            "[SYMBOL_KEY]"

            :

            String(key)

          }

        );

      }

    });

    const frozen =
    Object.freeze(
      clone
    );

    visited.set(object,{

      value:frozen,

      state:
      FREEZE_STATES.FROZEN

    });

    freezeSucceeded =
    true;

    return frozen;

  }

  finally{

    if(!freezeSucceeded){

      visited.delete(
        object
      );

    }

  }

}



// =====================================
// IMMUTABLE CHECK
// =====================================

function isDeepFrozen(
  object,
  visited = new WeakSet()
){

  if(

    !object ||

    typeof object !==
    "object"

  ){

    return true;

  }

  if(
    visited.has(object)
  ){

    return true;

  }

  visited.add(
    object
  );

  if(
    !Object.isFrozen(
      object
    )
  ){

    return false;

  }

  return Reflect
  .ownKeys(object)
  .every((key) => {

    return isDeepFrozen(

      object[key],

      visited

    );

  });

}



// =====================================
// PUBLIC API
// =====================================

const SecurityFreeze =
Object.freeze({

  deepFreeze:
  deepFreezeSecurity,

  isFrozen:
  isDeepFrozen

});
