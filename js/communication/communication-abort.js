import { CommunicationState } from "./communication-state.js";
import { COMMUNICATION_EVENTS, COMMUNICATION_LIMITS } from "./communication-config.js";
import { emit } from "./communication-events.js";

function createAbortController(requestId){
  if(!requestId) return null;
  const existing = CommunicationState.getAbortController(requestId);
  if(existing) return existing;
  if(CommunicationState.getAbortControllerCount() >= COMMUNICATION_LIMITS.MAX_ABORT_CONTROLLERS) return null;
  const controller = new AbortController();
  return CommunicationState.registerAbortController(requestId, controller) ? controller : null;
}

const getController = requestId => CommunicationState.getAbortController(requestId);
function abortRequest(requestId){
  const controller = getController(requestId);
  if(!controller) return false;
  try { controller.abort(); } catch { return false; }
  CommunicationState.removeAbortController(requestId);
  CommunicationState.unregisterRequest(requestId);
  CommunicationState.setProcessing(CommunicationState.snapshot().activeRequests > 0);
  CommunicationState.incrementAborted();
  emit(COMMUNICATION_EVENTS.REQUEST_ABORTED, { requestId });
  return true;
}

function abortAllRequests(){
  for(const [requestId] of CommunicationState.getAbortControllers()) abortRequest(requestId);
  return true;
}
const cleanupAbortController = requestId => CommunicationState.removeAbortController(requestId);
const getStatus = () => Object.freeze({ activeControllers:CommunicationState.getAbortControllerCount() });
const CommunicationAbort = Object.freeze({ createAbortController, getController, abortRequest, abortAllRequests, cleanupAbortController, status:getStatus });
export { createAbortController, getController, abortRequest, abortAllRequests, cleanupAbortController, getStatus, CommunicationAbort };
export default CommunicationAbort;
