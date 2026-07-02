// =====================================
// RIGO AI
// ADMIN AGENT PERMISSIONS
// =====================================

const adminAgentPermissions =
Object.seal({

  // ===================================
  // PROJECT
  // ===================================

  readProject:
  true,

  scanProject:
  true,

  searchProject:
  true,



  // ===================================
  // FILES
  // ===================================

  readFiles:
  true,

  createFiles:
  true,

  updateFiles:
  true,

  deleteFiles:
  true,

  renameFiles:
  true,



  // ===================================
  // CODE
  // ===================================

  generateCode:
  true,

  modifyCode:
  true,

  refactorCode:
  true,

  repairCode:
  true,



  // ===================================
  // SYSTEMS
  // ===================================

  registerSystems:
  true,

  unregisterSystems:
  true,

  restartSystems:
  true,



  // ===================================
  // CONTAINER
  // ===================================

  accessContainer:
  true,

  registerServices:
  true,

  removeServices:
  true,



  // ===================================
  // DEBUG
  // ===================================

  accessDebug:
  true,

  runDiagnostics:
  true,

  createReports:
  true,



  // ===================================
  // MEMORY
  // ===================================

  accessMemory:
  true,

  updateMemory:
  true,



  // ===================================
  // AI
  // ===================================

  accessAI:
  true,

  useTools:
  true,



  // ===================================
  // SAFETY
  // ===================================

  requireApproval:
  true,

  allowExecution:
  false,

  allowDeleteExecution:
  false,

  allowWriteExecution:
  false

});



// =====================================
// HELPERS
// =====================================

function hasPermission(
  permission
){

  return Boolean(

    adminAgentPermissions[
      permission
    ]

  );

}



function setPermission(
  permission,
  value
){

  if(

    !Object.prototype
    .hasOwnProperty
    .call(
      adminAgentPermissions,
      permission
    )

  ){

    return false;

  }

  adminAgentPermissions[
    permission
  ] =
  Boolean(value);

  return true;

}



function requireApproval(){

  return adminAgentPermissions
  .requireApproval;

}



function allowExecution(){

  return adminAgentPermissions
  .allowExecution;

}



function allowWriteExecution(){

  return adminAgentPermissions
  .allowWriteExecution;

}



function allowDeleteExecution(){

  return adminAgentPermissions
  .allowDeleteExecution;

}



function createPermissionsSnapshot(){

  return {

    ...adminAgentPermissions

  };

}



// =====================================
// API
// =====================================

const AdminAgentPermissions =
Object.freeze({

  permissions:
  adminAgentPermissions,

  has:
  hasPermission,

  set:
  setPermission,

  requireApproval,

  allowExecution,

  allowWriteExecution,

  allowDeleteExecution,

  snapshot:
  createPermissionsSnapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  adminAgentPermissions,

  hasPermission,

  setPermission,

  requireApproval,

  allowExecution,

  allowWriteExecution,

  allowDeleteExecution,

  createPermissionsSnapshot,

  AdminAgentPermissions

};

export default
AdminAgentPermissions;
