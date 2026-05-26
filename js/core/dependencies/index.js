// =====================================
// RIGO AI
// DEPENDENCY INDEX
// SAFE DEPENDENCY COMPOSITION LAYER
// =====================================



// =====================================
// DEPENDENCY FILES
// =====================================

import "./dependency-system.js";



// =====================================
// HELPERS
// =====================================

function getDependencyContainer(){

  try{

    if(
      typeof window ===
      "undefined"
    ){

      return null;

    }

    if(
      typeof window.Container ===
      "undefined"
    ){

      return null;

    }

    return window.Container;

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

  return typeof value ===
  "function";

}



// =====================================
// DEPENDENCY API
// =====================================

const DependencySystem =
Object.freeze({



  container(){

    return getDependencyContainer();

  },



  resolve(key){

    const container =
      getDependencyContainer();

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



  register(...args){

    const container =
      getDependencyContainer();

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



  diagnostics(){

    const container =
      getDependencyContainer();

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
// GLOBAL EXPORTS
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
