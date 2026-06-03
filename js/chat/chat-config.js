// =====================================
// RIGO AI
// CHAT CONFIG
// FOUNDATION LAYER
// =====================================



// =====================================
// CHAT LIMITS
// =====================================

const CHAT_LIMITS =
Object.freeze({

  MAX_MESSAGES:
  1000,

  MAX_QUEUE_SIZE:
  100,

  MAX_RETRIES:
  3,

  MAX_MESSAGE_LENGTH:
  50000,

  MAX_STREAM_BUFFER_SIZE:
  10000,

  MAX_STREAM_HISTORY:
  100

});



// =====================================
// CHAT TIMERS
// =====================================

const CHAT_TIMERS =
Object.freeze({

  RETRY_DELAY:
  1000,

  SAVE_DEBOUNCE:
  300,

  STREAM_TIMEOUT:
  60000,

  STREAM_FLUSH_INTERVAL:
  16

});



// =====================================
// CHAT FEATURES
// =====================================

const CHAT_FEATURES =
Object.freeze({

  ENABLE_EVENTS:
  true,

  ENABLE_STREAMING:
  true,

  ENABLE_MARKDOWN:
  true,

  ENABLE_DIAGNOSTICS:
  true,

  ENABLE_RUNTIME_SYNC:
  true,

  ENABLE_GENERATION_TRACKING:
  true

});



// =====================================
// CHAT EVENTS
// =====================================

const CHAT_EVENTS =
Object.freeze({

  CHAT_INITIALIZED:
  "chat.initialized",

  CHAT_DESTROYED:
  "chat.destroyed",

  CHAT_RESET:
  "chat.reset",

  STATE_CHANGED:
  "chat.state.changed",

  MESSAGE_CREATED:
  "chat.message.created",

  MESSAGE_UPDATED:
  "chat.message.updated",

  MESSAGE_DELETED:
  "chat.message.deleted",

  MESSAGE_SENT:
  "chat.message.sent",

  MESSAGE_FAILED:
  "chat.message.failed",

  MESSAGE_RETRY:
  "chat.message.retry",

  GENERATION_STARTED:
  "chat.generation.started",

  GENERATION_COMPLETED:
  "chat.generation.completed",

  GENERATION_ABORTED:
  "chat.generation.aborted",

  STREAM_STARTED:
  "chat.stream.started",

  STREAM_UPDATED:
  "chat.stream.updated",

  STREAM_COMPLETED:
  "chat.stream.completed",

  STREAM_ABORTED:
  "chat.stream.aborted",

  QUEUE_ENQUEUED:
  "chat.queue.enqueued",

  QUEUE_DEQUEUED:
  "chat.queue.dequeued",

  QUEUE_CLEARED:
  "chat.queue.cleared"

});



// =====================================
// PUBLIC API
// =====================================

const ChatConfig =
Object.freeze({

  limits:
  CHAT_LIMITS,

  timers:
  CHAT_TIMERS,

  features:
  CHAT_FEATURES,

  events:
  CHAT_EVENTS

});



// =====================================
// EXPORTS
// =====================================

export {

  CHAT_LIMITS,

  CHAT_TIMERS,

  CHAT_FEATURES,

  CHAT_EVENTS,

  ChatConfig

};

export default
ChatConfig;
