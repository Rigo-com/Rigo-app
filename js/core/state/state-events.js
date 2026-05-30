// =====================================
// RIGO AI
// STATE EVENTS
// =====================================



// =====================================
// EVENTS
// =====================================

const STATE_EVENTS =
Object.freeze({

  INITIALIZED:
  "state.initialized",

  UPDATED:
  "state.updated",

  RESET:
  "state.reset",

  REMOVED:
  "state.removed",

  ROLLBACK:
  "state.rollback",

  SNAPSHOT:
  "state.snapshot",

  TRANSACTION_START:
  "state.transaction.start",

  TRANSACTION_END:
  "state.transaction.end"

});



// =====================================
// EXPORTS
// =====================================

export default
STATE_EVENTS;
