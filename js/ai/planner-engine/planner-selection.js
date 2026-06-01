// =====================================
// RIGO AI
// PLANNER SELECTION
// =====================================

import {
  getRegisteredTools
}
from "./planner-tools.js";



// =====================================
// TOOL SELECTION
// =====================================

export async function selectToolsForGoal(
  goal
){

  try{

    const normalizedGoal =
    String(goal)
    .toLowerCase();

    const tools =
    await getRegisteredTools();

    return tools
    .filter((tool) => {

      const toolName =
      String(
        tool.name || ""
      )
      .toLowerCase();

      const toolDescription =
      String(
        tool.description || ""
      )
      .toLowerCase();

      return (

        normalizedGoal
        .includes(toolName)

        ||

        normalizedGoal
        .includes(
          toolDescription
        )

      );

    })

    .map((tool) => {

      return tool.id;

    });

  }

  catch(error){

    return [];

  }

}
