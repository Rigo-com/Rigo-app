// =====================================
// RIGO AI
// AGENT LOCKS
// EXECUTION LOCK SYSTEM
// =====================================

import {
  agentManagerState
}
from "./agent-state.js";



// =====================================
// ACQUIRE LOCK
// =====================================

export function acquireAgentLock(
  agentId
){

  if(

    agentManagerState
    .executionLocks
    .has(agentId)

  ){

    return false;

  }

  agentManagerState
  .executionLocks
  .set(
    agentId,
    true
  );

  return true;

}



// =====================================
// RELEASE LOCK
// =====================================

export function releaseAgentLock(
  agentId
){

  agentManagerState
  .executionLocks
  .delete(
    agentId
  );

  return true;

}
