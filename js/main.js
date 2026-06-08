alert("MAIN OK");

import {
  Bootstrap
}
from "./index.js";

alert("INDEX OK");

async function startApplication(){

  try{

    alert("BOOT START");

    await Bootstrap.boot();

    alert("BOOT SUCCESS");

  }
  catch(error){

    alert(
      "BOOT FAILED"
    );

    console.error(
      error
    );

    document.body.innerHTML =
    `<pre>${error?.stack || error}</pre>`;

  }

}

startApplication();

// =====================================
// RIGO AI
// APPLICATION ENTRY POINT
// =====================================

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
