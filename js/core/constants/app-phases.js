// =====================================
// RIGO AI
// APP PHASES
// =====================================

const APP_PHASES =
Object.freeze({

  IDLE:"idle",

  PREINIT:"preinit",

  INITIALIZING:"initializing",

  BOOTING:"booting",

  READY:"ready",

  RECOVERING:"recovering",

  SHUTTING_DOWN:"shutting_down",

  ERROR:"error"

});



// =====================================
// GLOBAL EXPORT
// =====================================

if(
  typeof window !==
  "undefined"
){

  window.APP_PHASES =
  APP_PHASES;

}
