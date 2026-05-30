// =====================================
// RIGO AI
// EVENT STATE
// =====================================

const systemEventsState =
Object.seal({

  initialized:
  false,

  processingQueue:
  false,

  scheduledQueue:
  false,

  totalEvents:
  0,

  failedEvents:
  0,

  activeEvents:
  0,

  queuedEvents:
  0,

  listeners:
  new Map(),

  onceListeners:
  new Map(),

  wildcardListeners:
  new Set(),

  middleware:
  new Set(),

  eventHistory:
  new Map(),

  throttledEvents:
  new Map(),

  eventQueue:
  [],

  diagnostics:{

    emitted:
    0,

    completed:
    0,

    failed:
    0,

    retries:
    0,

    cancelled:
    0,

    queueProcessed:
    0

  },

  lastEventAt:
  null

});

export {

  systemEventsState

};
