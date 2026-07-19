// =====================================
// RIGO AI
// STUDIO ADMIN AGENT LOADER
// =====================================

import Admin
from "../../../index.js";



// =====================================
// RESULT HELPERS
// =====================================

function success(
  data = {}
){

  return {

    ok:
    true,

    ...data

  };

}



function failure(
  error
){

  return {

    ok:
    false,

    error:
    String(
      error ||
      "UNKNOWN_ADMIN_ERROR"
    )

  };

}



// =====================================
// STATE HELPERS
// =====================================

function isInitialized(
  snapshot = {}
){

  return Boolean(

    snapshot.initialized ||

    snapshot.state
    ?.initialized ||

    snapshot.runtime
    ?.initialized

  );

}



function isBooted(
  snapshot = {}
){

  return Boolean(

    snapshot.booted ||

    snapshot.state
    ?.booted ||

    snapshot.runtime
    ?.booted

  );

}



// =====================================
// ADMIN METHOD CALL
// =====================================

async function callAdminMethod(
  admin,
  method
){

  const handler =
  admin?.[
    method
  ];

  if(
    typeof handler !==
    "function"
  ){

    return true;

  }

  const result =
  await handler.call(
    admin
  );

  if(
    result === false
  ){

    throw new Error(
      `ADMIN_${method.toUpperCase()}_FAILED`
    );

  }

  return true;

}



// =====================================
// GET ADMIN SNAPSHOT
// =====================================

function getAdminSnapshot(
  admin
){

  if(
    typeof admin?.snapshot !==
    "function"
  ){

    return {};

  }

  try{

    return (
      admin.snapshot() ||
      {}
    );

  }
  catch{

    return {};

  }

}



// =====================================
// GET ADMIN
// =====================================

function getAdmin(){

  if(
    typeof window !==
    "undefined"
    &&
    window.Admin
  ){

    return window.Admin;

  }

  return Admin || null;

}



// =====================================
// PUBLISH ADMIN
// =====================================

function publishAdmin(
  admin
){

  if(
    typeof window ===
    "undefined"
  ){

    return false;

  }

  window.Admin =
  admin;

  return true;

}



// =====================================
// ENSURE ADMIN READY
// =====================================

async function ensureAdminReady(){

  const admin =
  getAdmin();

  if(
    !admin
  ){

    return failure(
      "ADMIN_API_NOT_AVAILABLE"
    );

  }

  try{

    let snapshot =
    getAdminSnapshot(
      admin
    );

    if(
      !isInitialized(
        snapshot
      )
    ){

      await callAdminMethod(
        admin,
        "initialize"
      );

      snapshot =
      getAdminSnapshot(
        admin
      );

    }

    if(
      !isBooted(
        snapshot
      )
    ){

      await callAdminMethod(
        admin,
        "boot"
      );

    }

    publishAdmin(
      admin
    );

    return success({

      admin

    });

  }
  catch(error){

    return failure(

      error?.message ||

      String(
        error
      )

    );

  }

}



// =====================================
// STATUS
// =====================================

function getAdminStatus(){

  const admin =
  getAdmin();

  if(
    !admin
  ){

    return {

      available:
      false,

      status:
      "missing"

    };

  }

  if(
    typeof admin.command !==
    "function"
  ){

    return {

      available:
      false,

      status:
      "command-unavailable"

    };

  }

  return {

    available:
    true,

    status:
    "connected"

  };

}



// =====================================
// EXECUTE COMMAND
// =====================================

async function executeAdminCommand(
  input
){

  const command =
  String(
    input || ""
  )
  .trim();

  if(
    !command
  ){

    return failure(
      "ADMIN_COMMAND_REQUIRED"
    );

  }

  const readiness =
  await ensureAdminReady();

  if(
    !readiness.ok
  ){

    return readiness;

  }

  const admin =
  readiness.admin;

  if(
    typeof admin.command !==
    "function"
  ){

    return failure(
      "ADMIN_COMMAND_API_NOT_AVAILABLE"
    );

  }

  try{

    return await admin.command(
      command
    );

  }
  catch(error){

    return failure(

      error?.message ||

      String(
        error
      )

    );

  }

}



// =====================================
// API
// =====================================

const AdminAgentLoader =
Object.freeze({

  getAdmin,

  ensureAdminReady,

  getAdminStatus,

  executeAdminCommand

});



// =====================================
// EXPORTS
// =====================================

export {

  getAdmin,

  ensureAdminReady,

  getAdminStatus,

  executeAdminCommand,

  AdminAgentLoader

};

export default
AdminAgentLoader;
