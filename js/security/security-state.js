import { SECURITY_STATUS } from "./security-types.js";

const securityState = Object.seal({
  initialized:false,
  booted:false,
  status:SECURITY_STATUS.DISABLED,
  startedAt:null,
  stoppedAt:null,
  lastError:null
});

function updateSecurityState(updates = {}){
  Object.assign(securityState, updates);
  return true;
}

function resetSecurityState(){
  Object.assign(securityState, {
    initialized:false,
    booted:false,
    status:SECURITY_STATUS.DISABLED,
    startedAt:null,
    stoppedAt:null,
    lastError:null
  });
  return true;
}

function createSecurityStateSnapshot(){
  return Object.freeze({ ...securityState });
}

const SecurityState = Object.freeze({
  update:updateSecurityState,
  reset:resetSecurityState,
  snapshot:createSecurityStateSnapshot
});

export { securityState, updateSecurityState, resetSecurityState, createSecurityStateSnapshot, SecurityState };
export default SecurityState;
