// =====================================
// RIGO AI
// BOOTSTRAP REGISTRY
// =====================================

import {
  bootstrapState
}
from "./bootstrap-state.js";



// =====================================
// REGISTER
// =====================================

export function registerBootstrapSystem(
  system
){

  if(
    !system ||
    typeof system !==
    "object"
  ){

    return false;

  }

  const id =
  String(
    system.id || ""
  )
  .trim()
  .toLowerCase();

  if(!id){

    return false;

  }

  bootstrapState
  .registeredSystems
  .set(

    id,

    Object.freeze({

      id,

      priority:
      Number(
        system.priority || 0
      ),

      initialize:
      system.initialize || null,

      boot:
      system.boot || null,

      shutdown:
      system.shutdown || null,

      reset:
      system.reset || null,

      snapshot:
      system.snapshot || null

    })

  );

  return true;

}



// =====================================
// REMOVE
// =====================================

export function removeBootstrapSystem(
  systemId
){

  return bootstrapState
  .registeredSystems
  .delete(

    String(
      systemId || ""
    )
    .trim()
    .toLowerCase()

  );

}



// =====================================
// GET
// =====================================

export function getBootstrapSystem(
  systemId
){

  return bootstrapState
  .registeredSystems
  .get(

    String(
      systemId || ""
    )
    .trim()
    .toLowerCase()

  ) || null;

}



// =====================================
// LIST
// =====================================

export function listBootstrapSystems(){

  return [

    ...bootstrapState
    .registeredSystems
    .values()

  ]
  .sort((a,b) => {

    return (
      a.priority -
      b.priority
    );

  });

}
