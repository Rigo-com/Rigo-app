// =====================================
// RIGO AI
// STUDIO ADMIN AGENT LOADER
// =====================================

import Admin
from "../../../index.js";



// =====================================
// GET ADMIN
// =====================================

function getAdmin(){

  if(
    typeof window !== "undefined" &&
    window.Admin
  ){

    return window.Admin;

  }

  return Admin || null;

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

    return {

      ok:false,

      error:
      "ADMIN_API_NOT_AVAILABLE"

    };

  }

  try{

    const state =
    typeof admin.snapshot === "function"
    ? admin.snapshot()
    : null;

    const initialized =
    Boolean(
      state?.initialized ||
      state?.state?.initialized ||
      state?.runtime?.initialized
    );

    const booted =
    Boolean(
      state?.booted ||
      state?.state?.booted ||
      state?.runtime?.booted
    );

    if(
      !initialized &&
      typeof admin.initialize === "function"
    ){

      const initializedResult =
      await admin.initialize();

      if(
        initializedResult === false
      ){

        throw new Error(
          "ADMIN_INITIALIZATION_FAILED"
        );

      }

    }

    if(
      !booted &&
      typeof admin.boot === "function"
    ){

      const bootResult =
      await admin.boot();

      if(
        bootResult === false
      ){

        throw new Error(
          "ADMIN_BOOT_FAILED"
        );

      }

    }

    if(
      typeof window !== "undefined"
    ){

      window.Admin =
      admin;

    }

    return {

      ok:true,

      admin

    };

  }
  catch(error){

    return {

      ok:false,

      error:
      error?.message ||
      String(error)

    };

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

      available:false,

      status:
      "missing"

    };

  }

  if(
    typeof admin.command !== "function"
  ){

    return {

      available:false,

      status:
      "command-unavailable"

    };

  }

  return {

    available:true,

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

  const readiness =
  await ensureAdminReady();

  if(
    !readiness.ok
  ){

    return {

      ok:false,

      error:
      readiness.error

    };

  }

  const admin =
  readiness.admin;

  if(
    typeof admin.command !== "function"
  ){

    return {

      ok:false,

      error:
      "ADMIN_COMMAND_API_NOT_AVAILABLE"

    };

  }

  return admin.command(
    input
  );

}



// =====================================
// EXPORTS
// =====================================

export {

  getAdmin,

  ensureAdminReady,

  getAdminStatus,

  executeAdminCommand

};

export default {

  getAdmin,

  ensureAdminReady,

  getAdminStatus,

  executeAdminCommand

};
