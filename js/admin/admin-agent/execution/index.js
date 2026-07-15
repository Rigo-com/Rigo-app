// =====================================
// RIGO AI
// EXECUTION
// ROOT API
// =====================================

import ExecutionBuilder
from "./execution-builder.js";

import ExecutionEngine
from "./execution-engine.js";



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  ExecutionBuilder
  .initialize();

  ExecutionEngine
  .initialize();

  return true;

}



// =====================================
// CREATE PLAN
// =====================================

function createPlan(
  options
){

  return ExecutionBuilder
  .createPlan(
    options
  );

}



// =====================================
// EXECUTE
// =====================================

async function execute(
  plan
){

  return ExecutionEngine
  .executePlan(
    plan
  );

}



// =====================================
// REGISTER
// =====================================

function registerHandler(
  type,
  handler
){

  return ExecutionEngine
  .registerHandler(
    type,
    handler
  );

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    builder:
    ExecutionBuilder
    .snapshot(),

    engine:
    ExecutionEngine
    .snapshot()

  };

}



// =====================================
// API
// =====================================

const Execution =
Object.freeze({

  initialize,

  createPlan,

  execute,

  registerHandler,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  createPlan,

  execute,

  registerHandler,

  snapshot,

  Execution

};

export default
Execution;
