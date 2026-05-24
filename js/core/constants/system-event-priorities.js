// =====================================
// RIGO AI
// SYSTEM EVENT PRIORITIES
// =====================================



const SYSTEM_EVENT_PRIORITIES =
Object.freeze({



  // ===================================
  // PRIORITIES
  // ===================================

  LOW:
  1,

  NORMAL:
  5,

  HIGH:
  10,

  CRITICAL:
  20

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

    "SYSTEM_EVENT_PRIORITIES",

    {

      value:
      SYSTEM_EVENT_PRIORITIES,

      writable:false,

      configurable:false

    }

  );

}
