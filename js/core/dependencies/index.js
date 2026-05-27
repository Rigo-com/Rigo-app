// =====================================
// RIGO AI
// DEPENDENCY INDEX
// LEGACY COMPATIBILITY LAYER
// FINAL HARDENED EDITION
// =====================================



// =====================================
// DEPENDENCY FILES
// =====================================

import "./dependency-system.js";



// =====================================
// INTERNAL HELPERS
// =====================================

function getContainer(){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    return (
      window.RIGOContainer ||
      null
    );

  }

  catch(error){

    console.warn(

      "[DependencySystem] Failed resolving container",

      error

    );

    return null;

  }

}



function isFunction(value){

  return (
    typeof value ===
    "function"
  );

}



// =====================================
// LEGACY ADAPTER API
// =====================================

const DependencySystem =
Object.freeze({



  // ===================================
  // CONTAINER ACCESS
  // ===================================

  container(){

    return getContainer();

  },



  // ===================================
  // RESOLUTION
  // ===================================

  resolve(key){

    const container =
      getContainer();

    if(
      !container
    ){

      return null;

    }

    if(
      !isFunction(
        container.resolve
      )
    ){

      return null;

    }

    return container.resolve(
      key
    );

  },



  // ===================================
  // REGISTRATION
  // ===================================

  register(...args){

    const container =
      getContainer();

    if(
      !container
    ){

      return false;

    }

    if(
      !isFunction(
        container.register
      )
    ){

      return false;

    }

    return container.register(
      ...args
    );

  },



  // ===================================
  // DIAGNOSTICS
  // ===================================

  diagnostics(){

    const container =
      getContainer();

    if(
      !container
    ){

      return null;

    }

    if(
      !isFunction(
        container.diagnostics
      )
    ){

      return null;

    }

    return container.diagnostics();

  }

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "DependencySystem",

    {

      value:
      DependencySystem,

      writable:
      false,

      configurable:
      false

    }

  );

}
