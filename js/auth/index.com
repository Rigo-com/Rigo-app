// =====================================
// RIGO AI
// AUTH INDEX
// =====================================



// =====================================
// PUBLIC EXPORTS
// =====================================

const Auth =
Object.freeze({

  runtime:
  AuthRuntime

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.Auth =
  Auth;

}
