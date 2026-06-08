// =====================================
// RIGO AI
// APPLICATION ENTRY POINT
// =====================================

import {
  Bootstrap
}
from "./index.js";

alert("INDEX IMPORTED");

async function startApplication(){

  try{

    alert("BOOT START");

    await Bootstrap.boot();

    alert("BOOT SUCCESS");

  }
  catch(error){

    alert("BOOT FAILED");

    console.error(
      "RIGO startup failed:",
      error
    );

    document.body.innerHTML =
    `<pre>${error?.stack || error}</pre>`;

  }

}

startApplication();
