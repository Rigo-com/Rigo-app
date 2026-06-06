// =====================================
// RIGO AI
// APPLICATION ENTRY POINT
// =====================================

import BootstrapManager
from "./bootstrap/index.js";

document.body.innerHTML += `
<h2 style="color:green">
MAIN FILE EXECUTED
</h2>
`;



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

  document.body.innerHTML = `
<pre style="
color:red;
padding:20px;
white-space:pre-wrap;
font-size:14px;
">
${error?.stack || error?.message || String(error)}
</pre>
`;

}

}



// =====================================
// BOOT
// =====================================

void startApplication();
