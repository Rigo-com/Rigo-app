// =====================================
// RIGO AI
// APP ENVIRONMENT
// =====================================



// =====================================
// VALIDATE APP
// =====================================

function validateAppEnvironment(){

  if(
    typeof window ===
    "undefined"
  ){

    return false;

  }

  if(
    typeof document ===
    "undefined"
  ){

    return false;

  }

  return true;

}
