import {
  Bootstrap
}
from "./index.js";



async function startApplication(){

  document.body.innerHTML =
    "<h1>BOOT STARTED</h1>";

  try{

    const systems =
      Bootstrap.list();

    document.body.innerHTML =
      `<pre>
REGISTERED SYSTEMS:

${
  JSON.stringify(
    systems,
    null,
    2
  )
}
      </pre>`;

    await Bootstrap.boot();

    document.body.innerHTML +=
      "<hr><h1>BOOT SUCCESS</h1>";

  }
  catch(error){

    document.body.innerHTML =
      `<pre>
BOOT FAILED

${
  error?.stack ||
  error?.message ||
  String(error)
}
      </pre>`;

  }

}



startApplication();
