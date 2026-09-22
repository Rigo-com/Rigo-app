import { apiState } from "./api-state.js";
import {
  executeRequest,
  get,
  post,
  put,
  patch,
  remove,
  abortRequest,
  abortAllRequests
} from "./api-request.js";
import { uploadFile } from "./api-upload.js";
import {
  getAPIStatus,
  getAPIDiagnostics,
  createAPISnapshot,
  getAPIHealth
} from "./api-diagnostics.js";
import APIEvents from "./api-events.js";
import Analytics from "../services/analytics/index.js";

const analyticsUnsubscribers = [];

function detachAnalyticsListeners(){
  while(analyticsUnsubscribers.length){
    const unsubscribe = analyticsUnsubscribers.pop();
    try{ unsubscribe(); }catch{}
  }
}

function attachAnalyticsListeners(){
  detachAnalyticsListeners();

  const trackedEvents = [
    APIEvents.types.REQUEST_STARTED,
    APIEvents.types.REQUEST_SUCCESS,
    APIEvents.types.REQUEST_FAILED,
    APIEvents.types.REQUEST_ABORTED,
    APIEvents.types.UPLOAD_STARTED,
    APIEvents.types.UPLOAD_COMPLETED,
    APIEvents.types.UPLOAD_FAILED
  ];

  for(const eventType of trackedEvents){
    const unsubscribe = APIEvents.on(eventType, event => {
      Analytics.track(eventType, {
        requestId:event.requestId ?? null,
        uploadId:event.id ?? null,
        method:event.method ?? null,
        endpoint:event.endpoint ?? null,
        status:event.status ?? null,
        attempt:event.attempt ?? null,
        code:event.code ?? null
      });
    });
    analyticsUnsubscribers.push(unsubscribe);
  }
}

async function initializeAPIRuntime(){
  if(apiState.initialized) return true;

  if(typeof fetch !== "function") return false;

  Analytics.initialize();
  attachAnalyticsListeners();

  apiState.initialized = true;
  return true;
}

async function resetAPIRuntime(){
  abortAllRequests();
  detachAnalyticsListeners();

  apiState.pendingRequests = 0;
  apiState.activeRequests.clear();
  apiState.abortControllers.clear();
  apiState.uploads.clear();
  apiState.lastRequestAt = null;
  apiState.lastError = null;
  apiState.diagnostics = {
    requests:0,
    successful:0,
    failed:0,
    aborted:0,
    uploads:0,
    uploadFailures:0,
    retries:0
  };

  return true;
}

async function shutdownAPIRuntime(){
  await resetAPIRuntime();
  apiState.initialized = false;
  return true;
}

const APIRuntime = Object.freeze({
  initialize:initializeAPIRuntime,
  shutdown:shutdownAPIRuntime,
  reset:resetAPIRuntime,
  request:executeRequest,
  get,
  post,
  put,
  patch,
  delete:remove,
  upload:uploadFile,
  abort:abortRequest,
  abortAll:abortAllRequests,
  status:getAPIStatus,
  diagnostics:getAPIDiagnostics,
  snapshot:createAPISnapshot,
  health:getAPIHealth,
  events:APIEvents
});

export {
  initializeAPIRuntime,
  shutdownAPIRuntime,
  resetAPIRuntime,
  APIRuntime
};

export default APIRuntime;
