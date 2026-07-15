// =====================================
// RIGO AI
// EXECUTION PLAN
// DATA MODEL
// =====================================



// =====================================
// PLAN STATUS
// =====================================

const ExecutionPlanStatus =
Object.freeze({

  DRAFT:
  "draft",

  PENDING:
  "pending",

  APPROVED:
  "approved",

  RUNNING:
  "running",

  COMPLETED:
  "completed",

  FAILED:
  "failed",

  CANCELLED:
  "cancelled",

  ROLLED_BACK:
  "rolled-back"

});



// =====================================
// OPERATION STATUS
// =====================================

const ExecutionOperationStatus =
Object.freeze({

  PENDING:
  "pending",

  APPROVED:
  "approved",

  RUNNING:
  "running",

  COMPLETED:
  "completed",

  FAILED:
  "failed",

  CANCELLED:
  "cancelled",

  SKIPPED:
  "skipped"

});



// =====================================
// OPERATION TYPES
// =====================================

const ExecutionOperationTypes =
Object.freeze({

  CREATE_FILE:
  "create-file",

  UPDATE_FILE:
  "update-file",

  DELETE_FILE:
  "delete-file",

  MOVE_FILE:
  "move-file",

  CREATE_FOLDER:
  "create-folder",

  DELETE_FOLDER:
  "delete-folder",

  MOVE_FOLDER:
  "move-folder",

  RENAME_FILE:
  "rename-file",

  UPDATE_IMPORT:
  "update-import",

  UPDATE_EXPORT:
  "update-export",

  PROJECT_SCAN:
  "project-scan",

  VALIDATION:
  "validation"

});



// =====================================
// GRAPH MODEL
// =====================================

function createExecutionGraph(){

  return {

    nodes:{},

    roots:[],

    leaves:[]

  };

}



// =====================================
// RISK MODEL
// =====================================

function createRiskModel(){

  return {

    level:
    "low",

    score:
    0,

    destructive:
    false,

    affectedFiles:
    0,

    affectedFolders:
    0,

    affectedSystems:
    0

  };

}



// =====================================
// VALIDATION MODEL
// =====================================

function createValidationModel(){

  return {

    required:
    true,

    passed:
    false,

    checks:[],

    errors:[],

    warnings:[]

  };

}



// =====================================
// ROLLBACK MODEL
// =====================================

function createRollbackModel(){

  return {

    enabled:
    true,

    snapshotId:
    null,

    completed:
    false

  };

}


// =====================================
// OPERATION NODE
// =====================================

function createOperationNode(
  options = {}
){

  return {

    id:
    options.id || null,

    type:
    options.type || null,

    title:
    options.title || "",

    description:
    options.description || "",

    status:
    ExecutionOperationStatus
    .PENDING,

    payload:
    options.payload || {},

    parents:
    [],

    children:
    [],

    result:
    null,

    error:
    null,

    startedAt:
    null,

    completedAt:
    null

  };

}



// =====================================
// EXECUTION PLAN
// =====================================

function createExecutionPlan(
  options = {}
){

  return {

    id:
    options.id || null,

    title:
    options.title || "",

    description:
    options.description || "",

    status:
    ExecutionPlanStatus
    .DRAFT,

    graph:
    createExecutionGraph(),

    risk:
    createRiskModel(),

    validation:
    createValidationModel(),

    rollback:
    createRollbackModel(),

    metadata:{

      source:
      options.source ||
      "admin-agent",

      author:
      options.author ||
      "admin",

      tags:
      [],

      createdAt:
      Date.now(),

      updatedAt:
      Date.now()

    },

    approval:{

      required:
      true,

      approved:
      false,

      approvedBy:
      null,

      approvedAt:
      null

    },

    execution:{

      started:
      false,

      startedAt:
      null,

      completed:
      false,

      completedAt:
      null

    },

    history:[],

    result:
    null,

    error:
    null

  };

}



// =====================================
// SNAPSHOT
// =====================================

function snapshot(
  plan
){

  return JSON.parse(
    JSON.stringify(
      plan
    )
  );

}



// =====================================
// CLONE
// =====================================

function clone(
  plan
){

  return snapshot(
    plan
  );

}



// =====================================
// API
// =====================================

const ExecutionPlan =
Object.freeze({

  Status:
  ExecutionPlanStatus,

  OperationStatus:
  ExecutionOperationStatus,

  OperationTypes:
  ExecutionOperationTypes,

  create:
  createExecutionPlan,

  createNode:
  createOperationNode,

  snapshot,

  clone

});



// =====================================
// EXPORTS
// =====================================

export {

  ExecutionPlanStatus,

  ExecutionOperationStatus,

  ExecutionOperationTypes,

  createExecutionGraph,

  createRiskModel,

  createValidationModel,

  createRollbackModel,

  createOperationNode,

  createExecutionPlan,

  snapshot,

  clone,

  ExecutionPlan

};

export default
ExecutionPlan;
