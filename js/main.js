// =====================================
// RIGO AI
// APPLICATION ENTRY POINT
// =====================================

import Bootstrap
from "./bootstrap/index.js";

async function startApplication(){
  const started =
  await Bootstrap.boot();

  if(started === false){
    throw new Error(
      "RIGO BOOTSTRAP FAILED"
    );
  }

  return true;
}

const applicationReady =
startApplication()
.catch((error) => {
  console.error(
    "RIGO startup failed:",
    error
  );

  if(
    typeof document !==
    "undefined"
  ){
    document.body.innerHTML =
    `<pre>${error?.stack || error}</pre>`;
  }

  throw error;
});

export {
  startApplication,
  applicationReady
};

export default
applicationReady;
