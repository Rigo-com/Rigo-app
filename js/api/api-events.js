// =====================================
// RIGO AI
// API EVENTS
// =====================================

const API_EVENTS = Object.freeze({

  REQUEST_STARTED:
  "api.request.started",

  REQUEST_SUCCESS:
  "api.request.success",

  REQUEST_FAILED:
  "api.request.failed",

  REQUEST_ABORTED:
  "api.request.aborted",

  UPLOAD_STARTED:
  "api.upload.started",

  UPLOAD_COMPLETED:
  "api.upload.completed",

  UPLOAD_FAILED:
  "api.upload.failed"

});

const listeners = new Map();

function onAPIEvent(event, listener){
  if(!Object.values(API_EVENTS).includes(event)) throw new TypeError(`Unknown API event: ${event}`);
  if(typeof listener !== "function") throw new TypeError("API event listener must be a function");
  if(!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(listener);
  return () => offAPIEvent(event, listener);
}

function offAPIEvent(event, listener){
  const eventListeners = listeners.get(event);
  if(!eventListeners) return false;
  const removed = eventListeners.delete(listener);
  if(eventListeners.size === 0) listeners.delete(event);
  return removed;
}

function emitAPIEvent(event, detail = {}){
  const payload = Object.freeze({ event, timestamp:Date.now(), ...detail });
  for(const listener of listeners.get(event) || []){
    try{ listener(payload); } catch(error){ queueMicrotask(() => console.error("API event listener failed", error)); }
  }
  return payload;
}

function resetAPIEvents(){ listeners.clear(); }

const APIEvents = Object.freeze({ types:API_EVENTS, on:onAPIEvent, off:offAPIEvent, emit:emitAPIEvent, reset:resetAPIEvents });

export { API_EVENTS, APIEvents, onAPIEvent, offAPIEvent, emitAPIEvent, resetAPIEvents };
export default APIEvents;
