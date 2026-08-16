export * from "./communication-config.js";
export * from "./communication-state.js";
export * from "./communication-core.js";
export * from "./communication-storage.js";
export * from "./communication-stream.js";
export * from "./communication-abort.js";
export * from "./communication-health.js";
export * from "./communication-events.js";
export * from "./communication-helpers.js";

import CommunicationConfig from "./communication-config.js";
import CommunicationState from "./communication-state.js";
import CommunicationCore from "./communication-core.js";
import CommunicationStorage from "./communication-storage.js";
import CommunicationStream from "./communication-stream.js";
import CommunicationAbort from "./communication-abort.js";
import CommunicationHealth from "./communication-health.js";
import CommunicationEvents from "./communication-events.js";
import CommunicationHelpers from "./communication-helpers.js";

const initialize = () => CommunicationCore.initialize();
const boot = initialize;
function shutdown(){
  CommunicationAbort.abortAllRequests();
  CommunicationStorage.resetStorage();
  CommunicationEvents.clear();
  return CommunicationCore.destroy();
}
const reset = shutdown;
const snapshot = () => Object.freeze({
  ...CommunicationCore.health(),
  health:CommunicationHealth.status(),
  storage:CommunicationStorage.getStorageStats(),
  activeStreams:CommunicationStream.active(),
  timestamp:Date.now()
});

const Communication = Object.freeze({
  id:"communication", priority:50,
  config:CommunicationConfig, state:CommunicationState, core:CommunicationCore,
  storage:CommunicationStorage, stream:CommunicationStream, abort:CommunicationAbort,
  health:CommunicationHealth, events:CommunicationEvents, helpers:CommunicationHelpers,
  initialize, boot, shutdown, reset, snapshot
});
export { Communication };
export default Communication;
