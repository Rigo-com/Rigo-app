// =====================================
// RIGO AI
// LOGGER
// =====================================

const logs = [];



function writeLog(

  level,

  message,

  data = null

){

  const entry = {

    level,

    message,

    data,

    timestamp:
    Date.now()

  };

  logs.push(
    entry
  );

  return entry;

}



function getLogs(){

  return [...logs];

}



function clearLogs(){

  logs.length = 0;

  return true;

}



export const Logger =
Object.freeze({

  info:
  (message,data)=>

  writeLog(
    "info",
    message,
    data
  ),

  warn:
  (message,data)=>

  writeLog(
    "warn",
    message,
    data
  ),

  error:
  (message,data)=>

  writeLog(
    "error",
    message,
    data
  ),

  getLogs,

  clear:
  clearLogs

});

export default
Logger;
