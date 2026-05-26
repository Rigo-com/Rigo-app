// =====================================
// RIGO AI
// SYSTEM EVENT PRIORITIES
// =====================================



// =====================================
// PRIORITIES
// =====================================

const SYSTEM_EVENT_PRIORITIES =
Object.freeze(
Object.seal({

  BACKGROUND:
  0,

  LOW:
  10,

  NORMAL:
  50,

  HIGH:
  100,

  CRITICAL:
  1000

}));



// =====================================
// VALIDATION
// =====================================

function isValidSystemEventPriority(
  priority
){

  return Object.values(
    SYSTEM_EVENT_PRIORITIES
  )
  .includes(
    Number(priority)
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

    "SYSTEM_EVENT_PRIORITIES",

    {

      value:
      SYSTEM_EVENT_PRIORITIES,

      writable:false,

      configurable:false

    }

  );

  Object.defineProperty(

    window,

    "isValidSystemEventPriority",

    {

      value:
      isValidSystemEventPriority,

      writable:false,

      configurable:false

    }

  );

}
