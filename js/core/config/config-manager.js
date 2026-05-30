// =====================================
// RIGO AI
// CONFIG MANAGER
// =====================================



// =====================================
// IMPORTS
// =====================================

import {
  CONFIG_DEFAULTS
}
from "./config-types.js";



// =====================================
// CONFIG STATE
// =====================================

const configState =
Object.seal({

  values:
  new Map(
    Object.entries(
      CONFIG_DEFAULTS
    )
  )

});



// =====================================
// CONFIG API
// =====================================

function get(
  key,
  fallback = null
){

  if(
    !key
  ){

    return fallback;

  }

  return configState
  .values
  .has(
    key
  )

    ?

    configState
    .values
    .get(
      key
    )

    :

    fallback;

}



function set(
  key,
  value
){

  if(
    !key
  ){

    throw new Error(
      "INVALID_CONFIG_KEY"
    );

  }

  configState
  .values
  .set(
    key,
    value
  );

  return value;

}



function has(
  key
){

  return configState
  .values
  .has(
    key
  );

}



function remove(
  key
){

  return configState
  .values
  .delete(
    key
  );

}



function reset(){

  configState
  .values
  .clear();

  for(
    const [
      key,
      value
    ]
    of Object.entries(
      CONFIG_DEFAULTS
    )
  ){

    configState
    .values
    .set(
      key,
      value
    );

  }

  return true;

}



function all(){

  return Object.freeze(
    Object.fromEntries(
      configState
      .values
    )
  );

}



// =====================================
// PUBLIC API
// =====================================

const RIGOConfig =
Object.freeze({

  get,

  set,

  has,

  remove,

  reset,

  all

});



// =====================================
// EXPORTS
// =====================================

export {

  RIGOConfig

};

export default
RIGOConfig;
