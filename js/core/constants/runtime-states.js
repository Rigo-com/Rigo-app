// =====================================
// RIGO AI
// RUNTIME STATES
// =====================================



const RUNTIME_STATES =
Object.freeze({

  IDLE:
  "idle",

  BOOTING:
  "booting",

  READY:
  "ready",

  RECOVERING:
  "recovering",

  SHUTTING_DOWN:
  "shutting_down",

  FAILED:
  "failed"

});



// =====================================
// GLOBAL EXPORTS
// =====================================

if(
  typeof window !==
  "undefined"
){

  Object.defineProperty(

    window,

    "RUNTIME_STATES",

    {

      value:
      RUNTIME_STATES,

      writable:false,

      configurable:false

    }

  );

}
