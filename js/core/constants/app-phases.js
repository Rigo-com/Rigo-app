// =====================================
// RIGO AI
// APP PHASES
// =====================================



const APP_PHASES =
Object.freeze({

  IDLE:
  "idle",

  PREINIT:
  "preinit",

  INITIALIZING:
  "initializing",

  BOOTING:
  "booting",

  READY:
  "ready",

  RECOVERING:
  "recovering",

  SHUTTING_DOWN:
  "shutting_down",

  ERROR:
  "error"

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

    "APP_PHASES",

    {

      value:
      APP_PHASES,

      writable:false,

      configurable:false

    }

  );

}
