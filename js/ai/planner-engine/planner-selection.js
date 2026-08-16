// =====================================
// RIGO AI
// PLANNER SELECTION
// =====================================

import {
  getRegisteredTools
}
from "./planner-tools.js";


const TOOL_INTENTS =
Object.freeze({

  weather:[
    "weather",
    "forecast",
    "temperature",
    "rain",
    "snow",
    "طقس",
    "الجو",
    "حرارة",
    "درجة الحرارة",
    "مطر",
    "تمطر",
    "ثلج"
  ]

});


function normalizeText(
  value
){

  return String(value || "")
  .toLowerCase()
  .replace(/\s+/g," ")
  .trim();

}


function getToolTerms(
  tool = {}
){

  const toolId =
  normalizeText(tool.id);

  const aliases =
  TOOL_INTENTS[toolId] || [];

  return [
    tool.id,
    tool.name,
    tool.description,
    ...(Array.isArray(tool.keywords) ? tool.keywords : []),
    ...aliases
  ]
  .map(normalizeText)
  .filter(Boolean);

}


function scoreToolForGoal(
  tool,
  goal
){

  const normalizedGoal =
  normalizeText(goal);

  if(!normalizedGoal){
    return 0;
  }

  let score = 0;

  for(
    const term
    of getToolTerms(tool)
  ){

    if(
      normalizedGoal === term
    ){
      score += 10;
      continue;
    }

    if(
      normalizedGoal.includes(term)
    ){
      score +=
      term.length > 4
      ? 5
      : 3;
    }

  }

  return score;

}


// =====================================
// TOOL SELECTION
// =====================================

export async function selectToolsForGoal(
  goal
){

  try{

    const tools =
    await getRegisteredTools();

    return tools
    .map((tool) => ({
      id:tool.id,
      score:
      scoreToolForGoal(
        tool,
        goal
      )
    }))
    .filter((tool) => {
      return tool.score > 0;
    })
    .sort((a,b) => {
      return b.score - a.score;
    })
    .map((tool) => {
      return tool.id;
    });

  }
  catch(error){
    return [];
  }

}
