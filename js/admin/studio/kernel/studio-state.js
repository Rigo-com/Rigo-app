// =====================================
// RIGO AI
// RIGO STUDIO STATE
// STUDIO KERNEL STATE
// =====================================

const studioState =
Object.seal({

  id:
  "rigo-studio",

  initialized:
  false,

  booted:
  false,

  active:
  false,

  mounted:
  false,

  currentView:
  "mission-control",

  currentPlugin:
  "dashboard",

  workspace:
  Object.seal({

    activePanel:
    "main",

    activeTab:
    null,

    tabs:
    [],

    panels:
    []

  }),

  plugins:
  [],

  commands:
  [],

  events:
  [],

  notifications:
  [],

  logs:
  [],

  diagnostics:
  Object.seal({

    boots:
    0,

    events:
    0,

    commands:
    0,

    plugins:
    0,

    notifications:
    0,

    errors:
    0

  }),

  lastError:
  null

});

function logStudio(
  type,
  message,
  payload = null
){

  const entry = {

    type,
    message,
    payload,
    timestamp:
    Date.now()

  };

  studioState
  .logs
  .push(entry);

  if(
    studioState
    .logs
    .length > 300
  ){

    studioState
    .logs
    .shift();

  }

  return entry;

}

function setInitialized(
  value
){

  studioState
  .initialized =
  Boolean(value);

  return true;

}

function setBooted(
  value
){

  studioState
  .booted =
  Boolean(value);

  studioState
  .active =
  Boolean(value);

  if(
    value
  ){

    studioState
    .diagnostics
    .boots +=
    1;

  }

  return true;

}

function setMounted(
  value
){

  studioState
  .mounted =
  Boolean(value);

  return true;

}

function setCurrentView(
  view
){

  studioState
  .currentView =
  String(
    view || "mission-control"
  );

  return true;

}

function setCurrentPlugin(
  pluginId
){

  studioState
  .currentPlugin =
  String(
    pluginId || "dashboard"
  );

  return true;

}

function addEvent(
  event
){

  studioState
  .events
  .push(event);

  studioState
  .diagnostics
  .events +=
  1;

  if(
    studioState
    .events
    .length > 500
  ){

    studioState
    .events
    .shift();

  }

  return event;

}

function addCommand(
  command
){

  studioState
  .commands
  .push(command);

  studioState
  .diagnostics
  .commands =
  studioState
  .commands
  .length;

  return command;

}

function addPlugin(
  plugin
){

  studioState
  .plugins
  .push(plugin);

  studioState
  .diagnostics
  .plugins =
  studioState
  .plugins
  .length;

  return plugin;

}

function addNotification(
  notification
){

  studioState
  .notifications
  .push(notification);

  studioState
  .diagnostics
  .notifications =
  studioState
  .notifications
  .length;

  return notification;

}

function setError(
  error
){

  studioState
  .lastError =
  error;

  studioState
  .diagnostics
  .errors +=
  1;

  logStudio(
    "error",
    error?.message || String(error),
    error
  );

  return true;

}

function snapshot(){

  return {

    id:
    studioState
    .id,

    initialized:
    studioState
    .initialized,

    booted:
    studioState
    .booted,

    active:
    studioState
    .active,

    mounted:
    studioState
    .mounted,

    currentView:
    studioState
    .currentView,

    currentPlugin:
    studioState
    .currentPlugin,

    workspace:
    {

      activePanel:
      studioState
      .workspace
      .activePanel,

      activeTab:
      studioState
      .workspace
      .activeTab,

      tabs:
      [
        ...studioState
        .workspace
        .tabs
      ],

      panels:
      [
        ...studioState
        .workspace
        .panels
      ]

    },

    plugins:
    [
      ...studioState
      .plugins
    ],

    commands:
    [
      ...studioState
      .commands
    ],

    events:
    [
      ...studioState
      .events
    ],

    notifications:
    [
      ...studioState
      .notifications
    ],

    logs:
    [
      ...studioState
      .logs
    ],

    diagnostics:
    {
      ...studioState
      .diagnostics
    },

    lastError:
    studioState
    .lastError

  };

}

function reset(){

  studioState
  .initialized =
  false;

  studioState
  .booted =
  false;

  studioState
  .active =
  false;

  studioState
  .mounted =
  false;

  studioState
  .currentView =
  "mission-control";

  studioState
  .currentPlugin =
  "dashboard";

  studioState
  .workspace
  .activePanel =
  "main";

  studioState
  .workspace
  .activeTab =
  null;

  studioState
  .workspace
  .tabs =
  [];

  studioState
  .workspace
  .panels =
  [];

  studioState
  .plugins =
  [];

  studioState
  .commands =
  [];

  studioState
  .events =
  [];

  studioState
  .notifications =
  [];

  studioState
  .logs =
  [];

  studioState
  .diagnostics
  .boots =
  0;

  studioState
  .diagnostics
  .events =
  0;

  studioState
  .diagnostics
  .commands =
  0;

  studioState
  .diagnostics
  .plugins =
  0;

  studioState
  .diagnostics
  .notifications =
  0;

  studioState
  .diagnostics
  .errors =
  0;

  studioState
  .lastError =
  null;

  return true;

}

const StudioState =
Object.freeze({

  state:
  studioState,

  log:
  logStudio,

  setInitialized,

  setBooted,

  setMounted,

  setCurrentView,

  setCurrentPlugin,

  addEvent,

  addCommand,

  addPlugin,

  addNotification,

  setError,

  snapshot,

  reset

});

export {

  studioState,

  logStudio,

  setInitialized,

  setBooted,

  setMounted,

  setCurrentView,

  setCurrentPlugin,

  addEvent,

  addCommand,

  addPlugin,

  addNotification,

  setError,

  snapshot,

  reset,

  StudioState

};

export default
StudioState;
