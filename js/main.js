// =====================================
// RIGO AI
// APPLICATION ENTRY POINT
// =====================================



import {
  Bootstrap
}
from "./index.js";

alert("MAIN JS LOADED");


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
