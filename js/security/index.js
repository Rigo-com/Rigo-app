export * from "./security-types.js";
export * from "./security-errors.js";
export * from "./security-sanitize.js";
export * from "./security-validator.js";
export * from "./security-url.js";
export * from "./security-freeze.js";
export * from "./security-policy.js";
export * from "./security-monitor.js";
export * from "./security-report.js";
export * from "./security-sandbox.js";
export * from "./security-runtime.js";
export * from "./security-core.js";
export * from "./security-state.js";

import SecuritySanitize from "./security-sanitize.js";
import SecurityValidator from "./security-validator.js";
import SecurityURL from "./security-url.js";
import SecurityFreeze from "./security-freeze.js";
import SecurityPolicy from "./security-policy.js";
import SecurityMonitor from "./security-monitor.js";
import SecurityReport from "./security-report.js";
import SecuritySandbox from "./security-sandbox.js";
import SecurityRuntime from "./security-runtime.js";
import SecurityCore from "./security-core.js";
import SecurityState, { securityState } from "./security-state.js";
import { SECURITY_SEVERITY, SECURITY_STATUS } from "./security-types.js";

async function initializeSecurity(){
  if(securityState.initialized) return true;
  SecurityState.update({ initialized:true, status:SECURITY_STATUS.DISABLED, lastError:null });
  return true;
}

async function bootSecurity(){
  if(securityState.booted) return true;
  try{
    await initializeSecurity();
    SecurityState.update({ booted:true, status:SECURITY_STATUS.ACTIVE, startedAt:Date.now(), stoppedAt:null, lastError:null });
    SecurityMonitor.record("security.runtime.started", {}, SECURITY_SEVERITY.INFO);
    return true;
  }
  catch(error){
    SecurityState.update({ booted:false, status:SECURITY_STATUS.FAILED, lastError:String(error?.message || error) });
    return false;
  }
}

async function shutdownSecurity(){
  if(!securityState.booted){
    SecurityState.update({ initialized:false, status:SECURITY_STATUS.DISABLED });
    return true;
  }
  SecurityMonitor.record("security.runtime.stopped", {}, SECURITY_SEVERITY.INFO);
  SecurityState.update({ initialized:false, booted:false, status:SECURITY_STATUS.DISABLED, stoppedAt:Date.now() });
  return true;
}

async function resetSecurity(){
  await shutdownSecurity();
  SecurityMonitor.clear();
  SecurityState.reset();
  return true;
}

function createSecuritySnapshot(){
  return Object.freeze({
    state:SecurityState.snapshot(),
    metrics:SecurityMonitor.metrics(),
    summary:SecurityReport.summary(),
    timestamp:Date.now()
  });
}

const Security = Object.freeze({
  id:"security",
  priority:5,
  Sanitize:SecuritySanitize,
  Validator:SecurityValidator,
  URL:SecurityURL,
  Freeze:SecurityFreeze,
  Policy:SecurityPolicy,
  Monitor:SecurityMonitor,
  Report:SecurityReport,
  Sandbox:SecuritySandbox,
  Runtime:SecurityRuntime,
  Core:SecurityCore,
  initialize:initializeSecurity,
  boot:bootSecurity,
  shutdown:shutdownSecurity,
  reset:resetSecurity,
  snapshot:createSecuritySnapshot
});

export { initializeSecurity, bootSecurity, shutdownSecurity, resetSecurity, createSecuritySnapshot, Security };
export default Security;
