// =====================================
// RIGO AI
// STUDIO ADMIN AGENT LOADER
// =====================================

function getAdmin(){

  return window?.Admin || null;

}



function getAdminStatus(){

  const admin =
  getAdmin();

  if(
    !admin
  ){

    return {
      available:false,
      status:"missing"
    };

  }

  if(
    typeof admin.command !== "function"
  ){

    return {
      available:false,
      status:"command-unavailable"
    };

  }

  return {
    available:true,
    status:"connected"
  };

}



async function executeAdminCommand(
  input
){

  const admin =
  getAdmin();

  if(
    !admin ||
    typeof admin.command !== "function"
  ){

    return {
      ok:false,
      error:"ADMIN_COMMAND_API_NOT_AVAILABLE"
    };

  }

  return admin.command(
    input
  );

}



export {

  getAdmin,

  getAdminStatus,

  executeAdminCommand

};

export default {
  getAdmin,
  getAdminStatus,
  executeAdminCommand
};
