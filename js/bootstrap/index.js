// =====================================
// RIGO AI
// BOOTSTRAP INDEX
// CENTRAL EXPORTS
// =====================================



// =====================================
// VALIDATION
// =====================================

function validateBootstrapLayer(){

  return (

    typeof BootstrapManager !==
    "undefined"

    &&

    typeof BootstrapManager
    .boot ===
    "function"

    &&

    typeof BootstrapManager
    .recover ===
    "function"

    &&

    typeof BootstrapManager
    .shutdown ===
    "function"

    &&

    typeof BootstrapManager
    .diagnostics ===
    "function"

  );

}



// =====================================
// SAFE ACCESS
// =====================================

function getBootstrapManager(){

  if(
    !validateBootstrapLayer()
  ){

    return null;

  }

  return BootstrapManager;

}



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.BootstrapManager =
  BootstrapManager;

  window.getBootstrapManager =
  getBootstrapManager;

  window.validateBootstrapLayer =
  validateBootstrapLayer;

}
