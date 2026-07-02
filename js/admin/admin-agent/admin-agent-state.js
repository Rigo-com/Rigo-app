// =====================================
// RIGO AI
// ADMIN AGENT STATE
// =====================================

const adminAgentState =
Object.seal({

  id:
  "admin-agent",

  initialized:
  false,

  booted:
  false,

  active:
  false,

  busy:
  false,

  lastCommand:
  null,

  lastResult:
  null,

  lastError:
  null,

  pendingApprovals:
  [],

  pendingChanges:
  [],

  logs:
  [],

  diagnostics:
  Object.seal({

    commands:
    0,

    approvals:
    0,

    rejected:
    0,

    appliedChanges:
    0,

    failedChanges:
    0,

    errors:
    0

  })

});

function addAdminAgentLog(
  type,
  message,
  payload = null
){

  const log = {

    type,
    message,
    payload,
    timestamp:
    Date.now()

  };

  adminAgentState
  .logs
  .push(log);

  if(
    adminAgentState
    .logs
    .length > 200
  ){

    adminAgentState
    .logs
    .shift();

  }

  return log;

}

function setAdminAgentInitialized(
  value
){

  adminAgentState
  .initialized =
  Boolean(value);

  return true;

}

function setAdminAgentBooted(
  value
){

  adminAgentState
  .booted =
  Boolean(value);

  adminAgentState
  .active =
  Boolean(value);

  return true;

}

function setAdminAgentBusy(
  value
){

  adminAgentState
  .busy =
  Boolean(value);

  return true;

}

function setAdminAgentError(
  error
){

  adminAgentState
  .lastError =
  error;

  adminAgentState
  .diagnostics
  .errors +=
  1;

  addAdminAgentLog(
    "error",
    error?.message || String(error),
    error
  );

  return true;

}

function addPendingApproval(
  approval
){

  adminAgentState
  .pendingApprovals
  .push(approval);

  return approval;

}

function removePendingApproval(
  approvalId
){

  adminAgentState
  .pendingApprovals =
  adminAgentState
  .pendingApprovals
  .filter(
    approval =>
    approval.id !== approvalId
  );

  return true;

}

function addPendingChange(
  change
){

  adminAgentState
  .pendingChanges
  .push(change);

  return change;

}

function clearPendingChanges(){

  adminAgentState
  .pendingChanges =
  [];

  return true;

}

function createAdminAgentSnapshot(){

  return {

    id:
    adminAgentState
    .id,

    initialized:
    adminAgentState
    .initialized,

    booted:
    adminAgentState
    .booted,

    active:
    adminAgentState
    .active,

    busy:
    adminAgentState
    .busy,

    lastCommand:
    adminAgentState
    .lastCommand,

    lastResult:
    adminAgentState
    .lastResult,

    lastError:
    adminAgentState
    .lastError,

    pendingApprovals:
    [
      ...adminAgentState
      .pendingApprovals
    ],

    pendingChanges:
    [
      ...adminAgentState
      .pendingChanges
    ],

    diagnostics:
    {
      ...adminAgentState
      .diagnostics
    },

    logs:
    [
      ...adminAgentState
      .logs
    ]

  };

}

function resetAdminAgentState(){

  adminAgentState
  .initialized =
  false;

  adminAgentState
  .booted =
  false;

  adminAgentState
  .active =
  false;

  adminAgentState
  .busy =
  false;

  adminAgentState
  .lastCommand =
  null;

  adminAgentState
  .lastResult =
  null;

  adminAgentState
  .lastError =
  null;

  adminAgentState
  .pendingApprovals =
  [];

  adminAgentState
  .pendingChanges =
  [];

  adminAgentState
  .logs =
  [];

  adminAgentState
  .diagnostics
  .commands =
  0;

  adminAgentState
  .diagnostics
  .approvals =
  0;

  adminAgentState
  .diagnostics
  .rejected =
  0;

  adminAgentState
  .diagnostics
  .appliedChanges =
  0;

  adminAgentState
  .diagnostics
  .failedChanges =
  0;

  adminAgentState
  .diagnostics
  .errors =
  0;

  return true;

}

const AdminAgentState =
Object.freeze({

  state:
  adminAgentState,

  log:
  addAdminAgentLog,

  setInitialized:
  setAdminAgentInitialized,

  setBooted:
  setAdminAgentBooted,

  setBusy:
  setAdminAgentBusy,

  setError:
  setAdminAgentError,

  addPendingApproval,

  removePendingApproval,

  addPendingChange,

  clearPendingChanges,

  snapshot:
  createAdminAgentSnapshot,

  reset:
  resetAdminAgentState

});

export {

  adminAgentState,

  addAdminAgentLog,

  setAdminAgentInitialized,

  setAdminAgentBooted,

  setAdminAgentBusy,

  setAdminAgentError,

  addPendingApproval,

  removePendingApproval,

  addPendingChange,

  clearPendingChanges,

  createAdminAgentSnapshot,

  resetAdminAgentState,

  AdminAgentState

};

export default
AdminAgentState;
