// =====================================
// RIGO AI
// APPLICATION ENTRY POINT
// =====================================

alert("MAIN FILE LOADED");

document.body.insertAdjacentHTML(
  "afterbegin",
  "<div style='position:fixed;top:20px;left:20px;z-index:999999;color:red;background:white;padding:10px'>MAIN UPDATED</div>"
);

import {
  Bootstrap,
  Admin
}
from "./index.js";

async function startApplication(){

  try{

    await Bootstrap.boot();

    alert("BOOT DONE");

    await Admin.boot();

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
