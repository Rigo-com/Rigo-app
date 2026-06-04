// =====================================
// RIGO AI
// COMMUNICATION INDEX
// PUBLIC ENTRY POINT
// =====================================

export {

  COMMUNICATION_LIMITS,

  COMMUNICATION_TIMERS,

  COMMUNICATION_FEATURES,

  COMMUNICATION_EVENTS,

  CommunicationConfig

}
from "./communication-config.js";



export {

  communicationState,

  setInitialized,

  setProcessing,

  setStreaming,

  setHealthy,

  registerRequest,

  unregisterRequest,

  getRequest,

  registerAbortController,

  getAbortController,

  removeAbortController,

  getAbortControllers,

  getAbortControllerCount,

  incrementRequests,

  incrementCompleted,

  incrementFailed,

  incrementAborted,

  incrementStreams,

  incrementRetries,

  incrementCacheHits,

  incrementCacheMisses,

  getCommunicationSnapshot,

  getCommunicationDiagnostics,

  resetCommunicationState,

  CommunicationState

}
from "./communication-state.js";



export {

  initialize,

  destroy,

  startRequest,

  completeRequest,

  failRequest,

  health,

  CommunicationCore

}
from "./communication-core.js";



export {

  registerHash,

  hasHash,

  clearHashes,

  setCache,

  getCache,

  removeCache,

  clearCache,

  cleanupExpiredHashes,

  cleanupExpiredCache,

  getStorageStats,

  resetStorage,

  CommunicationStorage

}
from "./communication-storage.js";



export {

  processStream,

  cancelStream,

  CommunicationStream

}
from "./communication-stream.js";



export {

  createAbortController,

  getController,

  abortRequest,

  abortAllRequests,

  cleanupAbortController,

  getStatus,

  CommunicationAbort

}
from "./communication-abort.js";



export {

  getHealthStatus,

  getDiagnostics,

  getHealthReport,

  isHealthy,

  CommunicationHealth

}
from "./communication-health.js";



export {

  on,

  off,

  once,

  emit,

  clear,

  listenerCount,

  CommunicationEvents

}
from "./communication-events.js";



export {

  createCommunicationId,

  waitCommunication,

  createMessageHash,

  isValidRequestId,

  isValidPayload,

  isValidUrl,

  isSuccessResponse,

  normalizeError,

  CommunicationHelpers

}
from "./communication-helpers.js";



// =====================================
// DEFAULT EXPORT
// =====================================

import CommunicationConfig
from "./communication-config.js";

import CommunicationState
from "./communication-state.js";

import CommunicationCore
from "./communication-core.js";

import CommunicationStorage
from "./communication-storage.js";

import CommunicationStream
from "./communication-stream.js";

import CommunicationAbort
from "./communication-abort.js";

import CommunicationHealth
from "./communication-health.js";

import CommunicationEvents
from "./communication-events.js";

import CommunicationHelpers
from "./communication-helpers.js";



const Communication =
Object.freeze({

  config:
  CommunicationConfig,

  state:
  CommunicationState,

  core:
  CommunicationCore,

  storage:
  CommunicationStorage,

  stream:
  CommunicationStream,

  abort:
  CommunicationAbort,

  health:
  CommunicationHealth,

  events:
  CommunicationEvents,

  helpers:
  CommunicationHelpers

});



export default
Communication;
