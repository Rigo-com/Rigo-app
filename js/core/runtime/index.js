// =====================================
// RIGO AI
// RUNTIME INDEX
// =====================================



const Runtime =
Object.freeze({

  Manager:
  RuntimeManager,

  State:
  RuntimeState,

  Helpers:
  RuntimeHelpers,

  BootSequence:
  RuntimeBootSequence,

  Language:
  LanguageRuntime,

  Files:
  FileRuntime,

  Analytics:
  AnalyticsRuntime

});



if(
  typeof window !==
  "undefined"
){

  window.Runtime =
  Runtime;

}
