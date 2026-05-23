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

  try{

    return (

      (
        typeof Element !==
        "undefined"

        &&

        value instanceof
        Element
      )

      ||

      (
        typeof EventTarget !==
        "undefined"

        &&

        value instanceof
        EventTarget
      )

      ||

      (
        typeof Blob !==
        "undefined"

        &&

        value instanceof
        Blob
      )

      ||

      (
        typeof File !==
        "undefined"

        &&

        value instanceof
        File
      )

      ||

      (
        typeof Response !==
        "undefined"

        &&

        value instanceof
        Response
      )

      ||

      (
        typeof Request !==
        "undefined"

        &&

        value instanceof
        Request
      )

      ||

      (
        typeof Headers !==
        "undefined"

        &&

        value instanceof
        Headers
      )

    );

  }

  catch(error){

    return false;

  }

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

    return value;

  }

}



// =====================================
// SAFE DESCRIPTOR
// =====================================

function createSafeDescriptor(
  descriptor
){

  const safeDescriptor = {

    enumerable:
    descriptor.enumerable === true,

    configurable:false

  };

  if(
    "value" in descriptor
  ){

    safeDescriptor.value =
    descriptor.value;

    safeDescriptor.writable =
    false;

    return safeDescriptor;

  }

  return {

    ...safeDescriptor,

    value:
    ACCESSOR_BLOCKED_MARKER,

    writable:false

  };

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

    return cached;
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

  visited.set(
    object,
    clone
  );

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

      const safeDescriptor =
      createSafeDescriptor(
        descriptor
      );



      // ============================
      // ACCESSORS
      // ============================

      if(
        descriptor.get ||
        descriptor.set
      ){

        logSecurityEvent(

          "FREEZE_ACCESSOR_BLOCKED",

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



      // ============================
      // VALUES
      // ============================

      else{

        safeDescriptor.value =
        safeFreezeValue(

          descriptor.value,

          visited

        );

      }

      Object.defineProperty(

        clone,

        key,

        safeDescriptor

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

  return Object.freeze(
    clone
  );

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

    try{

      return isDeepFrozen(

        object[key],

        visited

      );

    }

    catch(error){

      return false;

    }

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
