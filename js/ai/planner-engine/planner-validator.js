// =====================================
// RIGO AI
// PLANNER VALIDATOR
// =====================================



// =====================================
// VALIDATE STEP
// =====================================

export function validatePlanStep(
  step
){

  if(
    !step
  ){

    return false;

  }

  if(
    !step.id
  ){

    return false;

  }

  if(
    !step.objective
  ){

    return false;

  }

  return true;

}
