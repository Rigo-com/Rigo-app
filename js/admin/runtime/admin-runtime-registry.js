// =====================================
// RIGO AI
// ADMIN RUNTIME REGISTRY
// =====================================

import AdminRuntimeState
from "./admin-runtime-state.js";



const runtimeRegistry =
Object.seal({

  modules:
  new Map()

});



// =====================================
// REGISTER
// =====================================

function registerModule(
  module
){

  if(
    !module ||
    typeof module !== "object"
  ){

    return false;

  }

  const id =
  String(
    module.id || ""
  )
  .trim()
  .toLowerCase();

  if(
    !id
  ){

    return false;

  }

  runtimeRegistry
  .modules
  .set(

    id,

    Object.freeze({

      id,

      priority:
      Number(
        module.priority || 0
      ),

      initialize:
      module.initialize || null,

      boot:
      module.boot || null,

      shutdown:
      module.shutdown || null,

      reset:
      module.reset || null,

      snapshot:
      module.snapshot || null

    })

  );

  AdminRuntimeState
  .log(
    "registry",
    `REGISTERED MODULE ${id}`
  );

  return true;

}



// =====================================
// REMOVE
// =====================================

function removeModule(
  moduleId
){

  return runtimeRegistry
  .modules
  .delete(

    String(
      moduleId || ""
    )
    .trim()
    .toLowerCase()

  );

}



// =====================================
// GET
// =====================================

function getModule(
  moduleId
){

  return runtimeRegistry
  .modules
  .get(

    String(
      moduleId || ""
    )
    .trim()
    .toLowerCase()

  ) || null;

}



// =====================================
// LIST
// =====================================

function listModules(){

  return [

    ...runtimeRegistry
    .modules
    .values()

  ]
  .sort((a,b)=>{

    return (
      a.priority -
      b.priority
    );

  });

}



// =====================================
// CLEAR
// =====================================

function clearModules(){

  runtimeRegistry
  .modules
  .clear();

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    modules:

    listModules()

    .map(

      module => ({

        id:
        module.id,

        priority:
        module.priority

      })

    )

  };

}



// =====================================
// API
// =====================================

const AdminRuntimeRegistry =
Object.freeze({

  register:
  registerModule,

  remove:
  removeModule,

  get:
  getModule,

  list:
  listModules,

  clear:
  clearModules,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  registerModule,

  removeModule,

  getModule,

  listModules,

  clearModules,

  snapshot,

  AdminRuntimeRegistry

};

export default
AdminRuntimeRegistry;
