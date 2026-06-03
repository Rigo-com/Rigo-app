// =====================================
// RIGO AI
// CHAT CONFIG
// =====================================

export const CHAT_RUNTIME_CONFIG =
(typeof deepFreeze === "function"
? deepFreeze
: Object.freeze)({

  MAX_QUEUE_SIZE:
  100,

  MAX_RETRIES:
  3,

  RETRY_DELAY:
  1000,

  SAVE_DEBOUNCE:
  300,

  ENABLE_EVENTS:true,

  ENABLE_DIAGNOSTICS:true,

  ENABLE_GENERATION_TRACKING:true,

  ENABLE_RUNTIME_SYNC:true,

  ENABLE_STREAMING:true,

  ENABLE_MARKDOWN:true

});



export const CHAT_RUNTIME_EVENTS =
Object.freeze({

  MESSAGE_CREATED:
  "chat.message.created",

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

  CHAT_RESET:
  "chat.reset"

});



export const VALID_CHAT_STATE_KEYS =
Object.freeze(
new Set([

  "initialized",

  "initializing",

  "destroyed",

  "generating",

  "streaming",

  "syncing",

  "processing",

  "rendering",

  "activeMessageId",

  "generationController"

]));
