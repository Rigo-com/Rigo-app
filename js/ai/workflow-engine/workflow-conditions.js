// =====================================
// RIGO AI
// WORKFLOW CONDITIONS
// =====================================

import {
  WORKFLOW_ENGINE_CONFIG
}
from "./workflow-config.js";

import {
  cloneWorkflowObject
}
from "./workflow-utils.js";



// =====================================
// VALIDATE CONDITION
// =====================================

export async function validateStepCondition(
  step,
  context = {}
){

  if(
    !WORKFLOW_ENGINE_CONFIG
    .ENABLE_CONDITIONALS
  ){

    return true;

  }

  if(
    typeof step.condition !==
    "function"
  ){

    return true;

  }

  try{

    return Boolean(

      await step.condition(

        cloneWorkflowObject(
          context
        )

      )

    );

  }

  catch(error){

    return false;

  }

}
