// =====================================
// RIGO AI
// EXECUTION BUILDER
// =====================================

import ExecutionPlan
from "./execution-plan.js";



// =====================================
// INTERNAL STATE
// =====================================

const executionBuilderState =
Object.seal({

  initialized:
  false,

  planCounter:
  0,

  operationCounter:
  0

});



// =====================================
// INITIALIZE
// =====================================

function initialize(){

  if(
    executionBuilderState
    .initialized
  ){

    return true;

  }

  executionBuilderState
  .initialized =
  true;

  return true;

}



// =====================================
// IDS
// =====================================

function createPlanId(){

  executionBuilderState
  .planCounter += 1;

  return (
    "PLAN-" +
    String(
      executionBuilderState
      .planCounter
    )
    .padStart(
      6,
      "0"
    )
  );

}



function createOperationId(){

  executionBuilderState
  .operationCounter += 1;

  return (
    "OP-" +
    String(
      executionBuilderState
      .operationCounter
    )
    .padStart(
      6,
      "0"
    )
  );

}


// =====================================
// CREATE PLAN
// =====================================

function createPlan(
  options = {}
){

  initialize();

  const plan =
  ExecutionPlan
  .create({

    ...options,

    id:
    createPlanId()

  });

  return plan;

}

// =====================================
// CREATE NODE
// =====================================

function createOperation(

  type,

  payload = {},

  options = {}

){

  return ExecutionPlan
  .createNode({

    id:
    createOperationId(),

    type,

    title:
    options.title ||
    type,

    description:
    options.description || "",

    payload

  });

}


// =====================================
// ADD NODE
// =====================================

function addOperation(

  plan,

  operation

){

  if(
    !plan ||
    !operation
  ){

    return false;

  }

  plan
  .graph
  .nodes[
    operation.id
  ] =
  operation;

  plan
  .graph
  .roots
  .push(
    operation.id
  );

  plan
  .graph
  .leaves
  .push(
    operation.id
  );

  plan
  .metadata
  .updatedAt =
  Date.now();

  return operation;

}

// =====================================
// LINK
// =====================================

function linkOperations(

  plan,

  parentId,

  childId

){

  const parent =
  plan
  ?.graph
  ?.nodes[
    parentId
  ];

  const child =
  plan
  ?.graph
  ?.nodes[
    childId
  ];

  if(
    !parent ||
    !child
  ){

    return false;

  }

  if(
    !parent
    .children
    .includes(
      childId
    )
  ){

    parent
    .children
    .push(
      childId
    );

  }

  if(
    !child
    .parents
    .includes(
      parentId
    )
  ){

    child
    .parents
    .push(
      parentId
    );

  }

  plan.graph.roots =
  plan.graph.roots
  .filter(
    id =>
    id !== childId
  );

  plan.graph.leaves =
  plan.graph.leaves
  .filter(
    id =>
    id !== parentId
  );

  return true;

}


// =====================================
// BUILD CREATE FILE PLAN
// =====================================

function buildCreateFilePlan(
  options = {}
){

  const plan =
  createPlan({

    title:
    options.title ||
    "Create File",

    description:
    options.description ||
    ""

  });

  const operation =
  createOperation(

    ExecutionPlan
    .OperationTypes
    .CREATE_FILE,

    {

      path:
      options.path,

      content:
      options.content || ""

    }

  );

  addOperation(

    plan,

    operation

  );

  return plan;

}



// =====================================
// BUILD UPDATE FILE PLAN
// =====================================

function buildUpdateFilePlan(
  options = {}
){

  const plan =
  createPlan({

    title:
    options.title ||
    "Update File"

  });

  addOperation(

    plan,

    createOperation(

      ExecutionPlan
      .OperationTypes
      .UPDATE_FILE,

      {

        path:
        options.path,

        content:
        options.content || ""

      }

    )

  );

  return plan;

}



// =====================================
// BUILD DELETE FILE PLAN
// =====================================

function buildDeleteFilePlan(
  options = {}
){

  const plan =
  createPlan({

    title:
    options.title ||
    "Delete File"

  });

  addOperation(

    plan,

    createOperation(

      ExecutionPlan
      .OperationTypes
      .DELETE_FILE,

      {

        path:
        options.path

      }

    )

  );

  return plan;

}



// =====================================
// BUILD MOVE FILE PLAN
// =====================================

function buildMoveFilePlan(
  options = {}
){

  const plan =
  createPlan({

    title:
    options.title ||
    "Move File"

  });

  addOperation(

    plan,

    createOperation(

      ExecutionPlan
      .OperationTypes
      .MOVE_FILE,

      {

        sourcePath:
        options.sourcePath,

        destinationPath:
        options.destinationPath

      }

    )

  );

  return plan;

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(){

  return {

    initialized:
    executionBuilderState
    .initialized,

    plans:
    executionBuilderState
    .planCounter,

    operations:
    executionBuilderState
    .operationCounter

  };

}



// =====================================
// API
// =====================================

const ExecutionBuilder =
Object.freeze({

  initialize,

  createPlan,

  createOperation,

  addOperation,

  linkOperations,

  buildCreateFilePlan,

  buildUpdateFilePlan,

  buildDeleteFilePlan,

  buildMoveFilePlan,

  snapshot

});



// =====================================
// EXPORTS
// =====================================

export {

  initialize,

  createPlan,

  createOperation,

  addOperation,

  linkOperations,

  buildCreateFilePlan,

  buildUpdateFilePlan,

  buildDeleteFilePlan,

  buildMoveFilePlan,

  snapshot,

  ExecutionBuilder

};

export default
ExecutionBuilder;
