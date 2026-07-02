// =====================================
// RIGO AI
// APPLICATION ENTRY POINT
// =====================================
alert("MAIN FILE LOADED");


import {
  Bootstrap
}
from "./index.js";


async function startApplication(){

  try{

    await Bootstrap.boot();

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
