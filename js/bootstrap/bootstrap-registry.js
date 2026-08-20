// =====================================
// RIGO AI
// BOOTSTRAP REGISTRY
// =====================================

import {
  bootstrapState
}
from "./bootstrap-state.js";



// =====================================
// CONTRACT
// =====================================

const REQUIRED_SYSTEM_METHODS =
Object.freeze([
  "initialize",
  "boot",
  "shutdown",
  "reset",
  "snapshot"
]);



function normalizeSystemId(
  value
){

  return String(
    value || ""
  )
  .trim()
  .toLowerCase();

}



function validateBootstrapSystem(
  system
){

  if(
    !system ||
    typeof system !== "object"
  ){

    return false;

  }

  const id =
  normalizeSystemId(
    system.id
  );

  if(!id){

    return false;

  }

  const priority =
  Number(
    system.priority
  );

  if(
    !Number.isFinite(
      priority
    )
  ){

    return false;

  }

  return REQUIRED_SYSTEM_METHODS
  .every((method) => {

    return typeof system[method] ===
    "function";

  });

}



// =====================================
// REGISTER
// =====================================

export function registerBootstrapSystem(
  system
){

  if(
    !validateBootstrapSystem(
      system
    )
  ){

    return false;

  }

  const id =
  normalizeSystemId(
    system.id
  );

  bootstrapState
  .registeredSystems
  .set(

    id,

    Object.freeze({

      id,

      priority:
      Number(
        system.priority
      ),

      initialize:
      system.initialize,

      boot:
      system.boot,

      shutdown:
      system.shutdown,

      reset:
      system.reset,

      snapshot:
      system.snapshot

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

    normalizeSystemId(
      systemId
    )

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

    normalizeSystemId(
      systemId
    )

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



// =====================================
// EXPORTS
// =====================================

export {
  REQUIRED_SYSTEM_METHODS,
  normalizeSystemId,
  validateBootstrapSystem
};
