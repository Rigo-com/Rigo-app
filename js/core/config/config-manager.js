// =====================================
// RIGO AI
// CONFIG MANAGER
// =====================================

import ConfigTypes
from "./config-types.js";

const {
  CONFIG_DEFAULTS
} = ConfigTypes;

const configState =
Object.seal({
  initialized:false,
  values:new Map(
    Object.entries(
      CONFIG_DEFAULTS
    )
  )
});

function initialize(){
  configState.initialized = true;
  return true;
}

const boot = initialize;

function shutdown(){
  configState.initialized = false;
  return true;
}

function get(
  key,
  fallback = null
){
  if(!key){
    return fallback;
  }

  return configState.values.has(key)
    ? configState.values.get(key)
    : fallback;
}

function set(
  key,
  value
){
  if(!key){
    throw new Error(
      "INVALID_CONFIG_KEY"
    );
  }

  configState.values.set(
    key,
    value
  );

  return value;
}

function has(
  key
){
  return configState.values.has(key);
}

function remove(
  key
){
  return configState.values.delete(key);
}

function reset(){
  configState.values.clear();

  for(
    const [key,value]
    of Object.entries(CONFIG_DEFAULTS)
  ){
    configState.values.set(
      key,
      value
    );
  }

  configState.initialized = false;
  return true;
}

function all(){
  return Object.freeze(
    Object.fromEntries(
      configState.values
    )
  );
}

function snapshot(){
  return Object.freeze({
    initialized:configState.initialized,
    values:all(),
    timestamp:Date.now()
  });
}

const RIGOConfig =
Object.freeze({
  initialize,
  boot,
  shutdown,
  get,
  set,
  has,
  remove,
  reset,
  all,
  snapshot
});

export {
  configState,
  initialize,
  boot,
  shutdown,
  get,
  set,
  has,
  remove,
  reset,
  all,
  snapshot,
  RIGOConfig
};

export default
RIGOConfig;
