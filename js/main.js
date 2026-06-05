// =====================================
// RIGO AI
// APPLICATION ENTRY POINT
// =====================================

import BootstrapManager
from "./bootstrap/index.js";



async function startApplication(){

  try{

    const booted =
    await BootstrapManager
    .boot();

    if(
      !booted
    ){

      throw new Error(
        "APPLICATION BOOT FAILED"
      );

    }

    console.log(
      "RIGO READY"
    );

  }

  catch(error){

    console.error(
      "RIGO STARTUP ERROR",
      error
    );

  }

}



startApplication();
