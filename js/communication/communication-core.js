import { COMMUNICATION_EVENTS, COMMUNICATION_LIMITS } from "./communication-config.js";
import { emit } from "./communication-events.js";
import { CommunicationState } from "./communication-state.js";

function initialize(){
  if(CommunicationState.snapshot().initialized) return true;
  CommunicationState.setInitialized(true);
  CommunicationState.setHealthy(true);
  emit(COMMUNICATION_EVENTS.INITIALIZED);
  return true;
}

function destroy(){
  emit(COMMUNICATION_EVENTS.DESTROYED);
  CommunicationState.reset();
  return true;
}

function startRequest(requestId, payload = {}){
  const state = CommunicationState.snapshot();
  if(!requestId || state.activeRequests >= COMMUNICATION_LIMITS.MAX_ACTIVE_REQUESTS) return false;
  if(!CommunicationState.registerRequest(requestId, payload)) return false;
  CommunicationState.setProcessing(true);
  CommunicationState.incrementRequests();
  emit(COMMUNICATION_EVENTS.REQUEST_STARTED, { requestId, payload });
  return true;
}

function finishRequest(requestId){
  const removed = CommunicationState.unregisterRequest(requestId);
  CommunicationState.setProcessing(CommunicationState.snapshot().activeRequests > 0);
  return removed;
}

function completeRequest(requestId){
  if(!finishRequest(requestId)) return false;
  CommunicationState.incrementCompleted();
  CommunicationState.setHealthy(true);
  emit(COMMUNICATION_EVENTS.REQUEST_COMPLETED, { requestId });
  return true;
}

function failRequest(requestId, error = null){
  if(!finishRequest(requestId)) return false;
  CommunicationState.incrementFailed();
  CommunicationState.setHealthy(false);
  emit(COMMUNICATION_EVENTS.REQUEST_FAILED, { requestId, error });
  return true;
}

const health = () => Object.freeze({ ...CommunicationState.snapshot(), diagnostics:CommunicationState.diagnostics() });
const CommunicationCore = Object.freeze({ initialize, destroy, startRequest, completeRequest, failRequest, health });
export { initialize, destroy, startRequest, completeRequest, failRequest, health, CommunicationCore };
export default CommunicationCore;
