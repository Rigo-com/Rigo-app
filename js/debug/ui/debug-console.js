// =====================================
// RIGO AI
// DEBUG CONSOLE
// =====================================

const consoleState =
Object.seal({

  logs:[],

  maxLogs:
  1000

});



// =====================================
// LOG
// =====================================

function addLog(

  level,

  message,

  data = null

){

  consoleState
  .logs
  .push({

    level,

    message,

    data,

    timestamp:
    Date.now()

  });

  if(

    consoleState
    .logs
    .length >

    consoleState
    .maxLogs

  ){

    consoleState
    .logs
    .shift();

  }

  return true;

}



// =====================================
// GET LOGS
// =====================================

function getLogs(){

  return [

    ...consoleState
    .logs

  ];

}



// =====================================
// CLEAR
// =====================================

function clearLogs(){

  consoleState
  .logs
  .length = 0;

  return true;

}



// =====================================
// API
// =====================================

export const DebugConsole =
Object.freeze({

  log:
  addLog,

  getLogs,

  clear:
  clearLogs

});



export default
DebugConsole;
