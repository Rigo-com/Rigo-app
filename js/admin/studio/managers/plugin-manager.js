// =====================================
// RIGO AI
// RIGO STUDIO
// PLUGIN MANAGER
// =====================================

import StudioState
from "../kernel/studio-state.js";

import StudioEvents
from "../kernel/studio-events.js";



const pluginRegistry =
Object.seal({

  plugins:
  new Map(),

  active:
  null

});



// =====================================
// REGISTER
// =====================================

function registerPlugin(
  plugin
){

  if(
    !plugin ||
    !plugin.id
  ){

    return false;

  }

  pluginRegistry
  .plugins
  .set(
    plugin.id,
    plugin
  );

  StudioState
  .addPlugin({

    id:
    plugin.id,

    title:
    plugin.title ||
    plugin.id

  });

  StudioState
  .log(
    "plugin",
    `REGISTERED ${plugin.id}`
  );

  return true;

}



// =====================================
// GET
// =====================================

function getPlugin(
  pluginId
){

  return pluginRegistry
  .plugins
  .get(
    pluginId
  ) || null;

}



// =====================================
// LIST
// =====================================

function listPlugins(){

  return [

    ...pluginRegistry
    .plugins
    .values()

  ];

}



// =====================================
// ACTIVATE
// =====================================

async function activatePlugin(
  pluginId
){

  const plugin =
  getPlugin(
    pluginId
  );

  if(
    !plugin
  ){

    return false;

  }

  if(
    typeof plugin
    .activate ===
    "function"
  ){

    await plugin
    .activate();

  }

  pluginRegistry
  .active =
  plugin.id;

  StudioState
  .setCurrentPlugin(
    plugin.id
  );

  await StudioEvents
  .emit(
    "plugin:activated",
    plugin
  );

  return true;

}



// =====================================
// DEACTIVATE
// =====================================

async function deactivatePlugin(){

  if(
    !pluginRegistry
    .active
  ){

    return true;

  }

  const plugin =
  getPlugin(
    pluginRegistry
    .active
  );

  if(
    plugin &&
    typeof plugin
    .deactivate ===
    "function"
  ){

    await plugin
    .deactivate();

  }

  await StudioEvents
  .emit(
    "plugin:deactivated",
    plugin
  );

  pluginRegistry
  .active =
  null;

  return true;

}



// =====================================
// CLEAR
// =====================================

function clear(){

  pluginRegistry
  .plugins
  .clear();

  pluginRegistry
  .active =
  null;

  return true;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    active:
    pluginRegistry
    .active,

    plugins:
    [

      ...pluginRegistry
      .plugins
      .keys()

    ]

  };

}



// =====================================
// API
// =====================================

const PluginManager =
Object.freeze({

  register:
  registerPlugin,

  get:
  getPlugin,

  list:
  listPlugins,

  activate:
  activatePlugin,

  deactivate:
  deactivatePlugin,

  clear,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  registerPlugin,

  getPlugin,

  listPlugins,

  activatePlugin,

  deactivatePlugin,

  clear,

  snapshot,

  PluginManager

};

export default
PluginManager;
