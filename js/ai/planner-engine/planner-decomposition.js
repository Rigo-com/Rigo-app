// =====================================
// RIGO AI
// PLANNER DECOMPOSITION
// =====================================

import {
  PLANNER_ENGINE_CONFIG
}
from "./planner-config.js";

import {
  createPlannerId
}
from "./planner-utils.js";

import {
  PLAN_STEP_STATES
}
from "./planner-constants.js";



// =====================================
// GOAL DECOMPOSITION
// =====================================

export function decomposeGoal(
  goal
){

  const normalizedGoal =
  String(goal || "")
  .trim();

  if(!normalizedGoal){

    return [];

  }

  const segments =
  PLANNER_ENGINE_CONFIG.ENABLE_GOAL_DECOMPOSITION
  ? normalizedGoal.split(".")
  : [normalizedGoal];

  return segments

  .slice(

    0,

    PLANNER_ENGINE_CONFIG
    .MAX_PLAN_STEPS

  )

  .map((segment,index) => {

    return {

      id:
      createPlannerId(),

      order:
      index + 1,

      objective:
      segment.trim(),

      executable:true,

      dependencies:[],

      parallel:false,

      retries:0,

      result:null,

      error:null,

      assignedTool:null,

      assignedAgent:null,

      state:
      PLAN_STEP_STATES.PENDING

    };

  })

  .filter((step) => {

    return (
      step.objective.length > 0
    );

  });

}
