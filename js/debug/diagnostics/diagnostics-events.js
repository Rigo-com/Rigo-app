// =====================================
// RIGO AI
// DIAGNOSTICS EVENTS
// DEBUG EVENT BUS
// =====================================



// =====================================
// EVENT TYPES
// =====================================

const DiagnosticsEvents =
Object.freeze({

  INITIALIZED:
  "diagnostics:initialized",

  STARTED:
  "diagnostics:started",

  STOPPED:
  "diagnostics:stopped",

  SCAN_STARTED:
  "diagnostics:scan-started",

  SCAN_COMPLETED:
  "diagnostics:scan-completed",

  MODULE_FAILED:
  "diagnostics:module-failed",

  MODULE_PASSED:
  "diagnostics:module-passed",

  WARNING:
  "diagnostics:warning",

  ERROR:
  "diagnostics:error",

  CRITICAL:
  "diagnostics:critical",

  REPORT_CREATED:
  "diagnostics:report-created",

  DASHBOARD_OPENED:
  "diagnostics:dashboard-opened",

  DASHBOARD_CLOSED:
  "diagnostics:dashboard-closed"

});



// =====================================
// LISTENERS
// =====================================

const listeners =
new Map();



// =====================================
// SUBSCRIBE
// =====================================

function on(
  event,
  callback
){

  if(
    typeof callback !==
    "function"
  ){

    return false;

  }

  if(
    !listeners.has(
      event
    )
  ){

    listeners.set(
      event,
      new Set()
    );

  }

  listeners
  .get(event)
  .add(callback);

  return true;

}



// =====================================
// UNSUBSCRIBE
// =====================================

function off(
  event,
  callback
){

  const eventListeners =
  listeners.get(
    event
  );

  if(
    !eventListeners
  ){

    return false;

  }

  return eventListeners
  .delete(
    callback
  );

}



// =====================================
// EMIT
// =====================================

function emit(
  event,
  payload = null
){

  const eventListeners =
  listeners.get(
    event
  );

  if(
    !eventListeners
  ){

    return false;

  }

  for(
    const listener
    of eventListeners
  ){

    try{

      listener(
        payload
      );

    }

    catch(error){

      console.error(
        "[DEBUG EVENT ERROR]",
        error
      );

    }

  }

  return true;

}



// =====================================
// CLEAR
// =====================================

function clear(){

  listeners.clear();

  return true;

}



// =====================================
// EXPORTS
// =====================================

export {

  DiagnosticsEvents,

  on,

  off,

  emit,

  clear

};

export default
Object.freeze({

  DiagnosticsEvents,

  on,

  off,

  emit,

  clear

});
