// =====================================
// RIGO AI
// APP PHASES
// =====================================



// =====================================
// APP PHASES
// =====================================

const APP_PHASES =
Object.freeze(
Object.seal({

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

}));



// =====================================
// VALIDATION
// =====================================

function isValidAppPhase(
  phase
){

  return Object.values(
    APP_PHASES
  )
  .includes(
    String(phase)
  );

}



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

  Object.defineProperty(

    window,

    "isValidAppPhase",

    {

      value:
      isValidAppPhase,

      writable:false,

      configurable:false

    }

  );

}
