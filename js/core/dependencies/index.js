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
      typeof globalThis ===
      "undefined"
    ){

      return null;

    }

    return (
      globalThis.RIGOContainer ||
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



function isFunction(
  value
){

  return (
    typeof value ===
    "function"
  );

}



// =====================================
// LEGACY ADAPTER API
// =====================================

const RIGODependencyRuntime =
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

  resolve(
    key
  ){

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

  register(
    ...args
  ){

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

    return container
    .diagnostics();

  }

});



// =====================================
// EXPORTS
// =====================================

export {

  getContainer,

  RIGODependencyRuntime

};

export default
RIGODependencyRuntime;



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof globalThis !==
  "undefined"
){

  Object.defineProperty(

    globalThis,

    "RIGODependencyRuntime",

    {

      value:
      RIGODependencyRuntime,

      writable:false,

      configurable:false

    }

  );



  // ===================================
  // LEGACY ALIAS
  // ===================================

  Object.defineProperty(

    globalThis,

    "DependencySystem",

    {

      value:
      RIGODependencyRuntime,

      writable:false,

      configurable:false

    }

  );

}
