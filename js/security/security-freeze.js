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
  10000,

  ENABLE_LOGS:
  true

});



// =====================================
// FREEZE STATE
// =====================================

const securityFreezeState =
Object.seal({

  frozenObjects:0,

  frozenArrays:0,

  frozenMaps:0,

  frozenSets:0,

  skippedObjects:0,

  failedFreezes:0,

  lastFrozenAt:null

});



// =====================================
// SAFE LOG
// =====================================

function freezeSecurityLog(
  message,
  metadata = null
){

  if(
    !SECURITY_FREEZE_CONFIG
    .ENABLE_LOGS
  ){

    return;
  }

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

    value instanceof URL

    ||

    value instanceof Map

    ||

    value instanceof Set

    ||

    ArrayBuffer.isView(
      value
    )

  );

}



// =====================================
// SAFE CLONE
// =====================================

function createSafeClone(
  value
){

  if(
    Array.isArray(value)
  ){

    securityFreezeState
    .frozenArrays++;

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

    securityFreezeState
    .frozenMaps++;

    return new Map();

  }

  if(
    value instanceof Set
  ){

    securityFreezeState
    .frozenSets++;

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

  securityFreezeState
  .frozenObjects++;

  return Object.create(

    Object.getPrototypeOf(
      value
    )

  );

}



// =====================================
// SAFE FREEZE CHILD
// =====================================

function safeFreezeChild(
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

    securityFreezeState
    .failedFreezes++;

    freezeSecurityLog(

      "FREEZE_CHILD_FAILED",

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
  descriptor,
  value
){

  return {

    enumerable:
    descriptor.enumerable ===
    true,

    configurable:
    false,

    writable:
    false,

    value

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
    Object.isFrozen(
      object
    )
  ){

    return object;

  }

  if(
    isHostObject(object)
  ){

    securityFreezeState
    .skippedObjects++;

    return object;

  }

  if(
    visited.has(object)
  ){

    return visited.get(
      object
    );

  }

  if(

    state.depth >

    SECURITY_FREEZE_CONFIG
    .MAX_DEPTH

  ){

    securityFreezeState
    .skippedObjects++;

    return object;

  }

  state.nodes++;

  if(

    state.nodes >

    SECURITY_FREEZE_CONFIG
    .MAX_NODES

  ){

    securityFreezeState
    .skippedObjects++;

    return object;

  }

  securityFreezeState
  .lastFrozenAt =
  Date.now();

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

        safeFreezeChild(

          key,

          visited,

          {

            depth:
            state.depth + 1,

            nodes:
            state.nodes

          }

        ),

        safeFreezeChild(

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

        safeFreezeChild(

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
  // OBJECT PROPERTIES
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

      if(!descriptor){

        return;
      }

      if(
        descriptor.get ||
        descriptor.set
      ){

        return;
      }

      const frozenValue =
      safeFreezeChild(

        descriptor.value,

        visited,

        {

          depth:
          state.depth + 1,

          nodes:
          state.nodes

        }

      );

      Object.defineProperty(

        clone,

        key,

        createSafeDescriptor(

          descriptor,

          frozenValue

        )

      );

    }

    catch(error){

      securityFreezeState
      .failedFreezes++;

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

      if(
        !descriptor
      ){

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
// DIAGNOSTICS
// =====================================

function getSecurityFreezeDiagnostics(){

  return Object.freeze({

    frozenObjects:
    securityFreezeState
    .frozenObjects,

    frozenArrays:
    securityFreezeState
    .frozenArrays,

    frozenMaps:
    securityFreezeState
    .frozenMaps,

    frozenSets:
    securityFreezeState
    .frozenSets,

    skippedObjects:
    securityFreezeState
    .skippedObjects,

    failedFreezes:
    securityFreezeState
    .failedFreezes,

    lastFrozenAt:
    securityFreezeState
    .lastFrozenAt

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
  isDeepFrozen,

  diagnostics:
  getSecurityFreezeDiagnostics

});



// =====================================
// EXPORTS
// =====================================

export {

  SECURITY_FREEZE_CONFIG,

  securityFreezeState,

  freezeSecurityLog,

  isHostObject,

  isSpecialObject,

  createSafeClone,

  safeFreezeChild,

  createSafeDescriptor,

  deepFreezeSecurity,

  isDeepFrozen,

  getSecurityFreezeDiagnostics,

  SecurityFreeze

};



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

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
