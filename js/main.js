// =====================================
// RIGO AI
// APPLICATION ENTRY POINT
// =====================================

import BootstrapManager
from "./bootstrap/index.js";



// =====================================
// STARTUP
// =====================================

async function startApplication(){

  try{

    console.log(
      "RIGO BOOTING..."
    );

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



// =====================================
// BOOT
// =====================================

void startApplication();
