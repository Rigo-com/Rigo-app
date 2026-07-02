// =====================================
// RIGO AI
// ADMIN ROOT API
// PRIVATE ADMIN SYSTEM
// =====================================

import AdminAgent
from "./admin-agent/index.js";



// =====================================
// INITIALIZE
// =====================================

async function initialize(){

  return AdminAgent
  .initialize();

}



// =====================================
// BOOT
// =====================================

async function boot(){

  return AdminAgent
  .boot();

}



// =====================================
// SHUTDOWN
// =====================================

async function shutdown(){

  return AdminAgent
  .shutdown();

}



// =====================================
// RESET
// =====================================

async function reset(){

  return AdminAgent
  .reset();

}



// =====================================
// COMMAND
// =====================================

async function command(
  input
){

  return AdminAgent
  .command(
    input
  );

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return AdminAgent
  .snapshot();

}



// =====================================
// API
// =====================================

const Admin =
Object.freeze({

  id:
  "admin",

  priority:
  30,

  initialize,

  boot,

  shutdown,

  reset,

  command,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  boot,

  shutdown,

  reset,

  command,

  snapshot,

  Admin

};

export default
Admin;
