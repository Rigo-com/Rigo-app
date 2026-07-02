// =====================================
// RIGO AI
// APPLICATION ENTRY POINT
// ADMIN DIRECT TEST
// =====================================

alert("MAIN FILE LOADED");

import {
  Admin
}
from "./index.js";

async function startApplication(){

  try{

    alert("BEFORE ADMIN BOOT");

    await Admin.boot();

    alert("AFTER ADMIN BOOT");

  }
  catch(error){

    alert(
      error?.message || String(error)
    );

    document.body.innerHTML =
    `<pre>${error?.stack || error}</pre>`;

  }

}

startApplication();
