// =====================================
// RIGO AI
// SECURITY FREEZE
// ENTERPRISE IMMUTABLE RUNTIME LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// FREEZE CONFIG
// =====================================

const SECURITY_FREEZE_CONFIG =
Object.freeze({

  MAX_DEPTH:
  15,

  MAX_NODES:
  10000

});



// =====================================
// SAFE LOG
// =====================================

function freezeSecurityLog(
  message,
  metadata = null
){

  try{

    if(
      typeof logSecurityEvent ===
      "function"
    ){

      logSecurityEvent(
        message,
        metadata
      );

    }

  }

  catch(error){}

}



// =====================================
// SPECIAL OBJECT CHECK
// =====================================

function isSpecialObject(
  value
){

  return (

    value instanceof Date

    ||

    value instanceof RegExp

    ||

    value instanceof Map

    ||

    value instanceof Set

    ||

    value instanceof URL

    ||

    ArrayBuffer.isView(
      value
    )

  );

}



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

      ||

      (
        typeof Window !==
        "undefined"

        &&

        value instanceof
        Window
      )

      ||

      (
        typeof Document !==
        "undefined"

        &&

        value instanceof
        Document
      )

      ||

      (
        typeof Navigator !==
        "undefined"

        &&

        value instanceof
        Navigator
      )

    );

  }

  catch(error){

    return false;

  }

}



// =====================================
// CREATE SAFE CLONE
// =====================================

function createSafeClone(
  value
){

  if(
    Array.isArray(value)
  ){

    return [];
  }

  if(
    value instanceof Date
  ){

    return new Date(
      value.getTime()
    );

  }

  if(
    value instanceof RegExp
  ){

    return new RegExp(
      value.source,
      value.flags
    );

  }

  if(
    value instanceof URL
  ){

    return new URL(
      value.href
    );

  }

  if(
    value instanceof Map
  ){

    return new Map();

  }

  if(
    value instanceof Set
  ){

    return new Set();

  }

  if(
    ArrayBuffer.isView(
      value
    )
  ){

    return new value.constructor(
      value
    );

  }

  return Object.create(null);

}



// =====================================
// SAFE FREEZE VALUE
// =====================================

function safeFreezeValue(
  value,
  visited,
  state
){

  try{

    return deepFreezeSecurity(

      value,

      visited,

      state

    );

  }

  catch(error){

    freezeSecurityLog(

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
    descriptor.enumerable ===
    true,

    configurable:
    false

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

    enumerable:
    false,

    value:
    null,

    writable:
    false

  };

}



// =====================================
// DEEP FREEZE
// =====================================

function deepFreezeSecurity(
  object,
  visited = new WeakMap(),
  state = {

    depth:0,

    nodes:0

  }

){

  if(

    !object ||

    typeof object !==
    "object"

  ){

    return object;

  }

  if(
    state.depth >

    SECURITY_FREEZE_CONFIG
    .MAX_DEPTH
  ){

    return null;

  }

  state.nodes++;

  if(

    state.nodes >

    SECURITY_FREEZE_CONFIG
    .MAX_NODES

  ){

    return null;

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
  createSafeClone(
    object
  );

  visited.set(
    object,
    clone
  );



  // ===================================
  // MAP
  // ===================================

  if(
    object instanceof Map
  ){

    object.forEach((value,key) => {

      clone.set(

        safeFreezeValue(

          key,

          visited,

          {

            depth:
            state.depth + 1,

            nodes:
            state.nodes

          }

        ),

        safeFreezeValue(

          value,

          visited,

          {

            depth:
            state.depth + 1,

            nodes:
            state.nodes

          }

        )

      );

    });

    return Object.freeze(
      clone
    );

  }



  // ===================================
  // SET
  // ===================================

  if(
    object instanceof Set
  ){

    object.forEach((value) => {

      clone.add(

        safeFreezeValue(

          value,

          visited,

          {

            depth:
            state.depth + 1,

            nodes:
            state.nodes

          }

        )

      );

    });

    return Object.freeze(
      clone
    );

  }



  // ===================================
  // SPECIAL OBJECTS
  // ===================================

  if(
    isSpecialObject(
      object
    )
  ){

    return Object.freeze(
      clone
    );

  }



  // ===================================
  // DESCRIPTORS
  // ===================================

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



      // ===============================
      // ACCESSORS
      // ===============================

      if(
        descriptor.get ||
        descriptor.set
      ){

        safeDescriptor.value =
        null;

      }



      // ===============================
      // VALUES
      // ===============================

      else{

        safeDescriptor.value =
        safeFreezeValue(

          descriptor.value,

          visited,

          {

            depth:
            state.depth + 1,

            nodes:
            state.nodes

          }

        );

      }

      Object.defineProperty(

        clone,

        key,

        safeDescriptor

      );

    }

    catch(error){

      freezeSecurityLog(

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

      const descriptor =

        Object
        .getOwnPropertyDescriptor(
          object,
          key
        );

      if(!descriptor){

        return false;

      }

      if(
        descriptor.get ||
        descriptor.set
      ){

        return true;

      }

      return isDeepFrozen(

        descriptor.value,

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



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "SecurityFreeze",

    {

      value:
      SecurityFreeze,

      writable:
      false,

      configurable:
      false

    }

  );

}
