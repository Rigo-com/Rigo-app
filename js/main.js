// =====================================
// RIGO AI
// APPLICATION ENTRY POINT
// =====================================


import Bootstrap
from "./bootstrap/index.js";


async function startApplication(){

  try{

    const started =
    await Bootstrap
    .boot();

    if(
      started === false
    ){

      throw new Error(
        "RIGO BOOTSTRAP FAILED"
      );

    }

  }
  catch(error){

    console.error(
      "RIGO startup failed:",
      error
    );

    document.body.innerHTML =
    `<pre>${error?.stack || error}</pre>`;

  }

}

startApplication();
