// =====================================
// RIGO AI
// EVENTS INDEX
// =====================================



const Events =
Object.freeze({

  System:
  SystemEvents,

  App:
  AppEvents,

  EVENTS:
  APP_EVENTS

});



if(
  typeof window !==
  "undefined"
){

  window.Events =
  Events;

}
