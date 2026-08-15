// =====================================
// RIGO AI
// TOOL INDEX
// =====================================
 
import {
  toolExecutorState
}
from "./tool-state.js";

import {
  normalizeToolName,
  cloneToolObject,
  freezeToolObject
}
from "./tool-utils.js";



// =====================================
// INDEX TOOL
// =====================================

export function indexTool(
  tool
){

  const tokens = [

    tool.id,

    tool.name,

    tool.description

  ]
  .join(" ")
  .toLowerCase()
  .split(/\s+/)
  .filter(Boolean);

  tokens.forEach((token) => {

    if(

      !toolExecutorState
      .toolIndex
      .has(token)

    ){

      toolExecutorState
      .toolIndex
      .set(
        token,
        new Set()
      );

    }

    toolExecutorState
    .toolIndex
    .get(token)
    .add(tool.id);

  });

  return true;

}



// =====================================
// REMOVE TOOL INDEX
// =====================================

export function removeToolIndex(
  toolId
){

  toolExecutorState
  .toolIndex
  .forEach((set,key) => {

    set.delete(toolId);

    if(
      set.size <= 0
    ){

      toolExecutorState
      .toolIndex
      .delete(key);

    }

  });

  return true;

}



// =====================================
// SEARCH TOOLS
// =====================================

export function searchTools(
  query = ""
){

  const normalized =
  normalizeToolName(
    query
  );

  const matchedIds =
  new Set();

  normalized
  .split(/\s+/)
  .forEach((token) => {

    const indexed =
    toolExecutorState
    .toolIndex
    .get(token);

    if(indexed){

      indexed.forEach((id) => {

        matchedIds.add(id);

      });

    }

  });

  return freezeToolObject(

    [...matchedIds]
    .map((id) => {

      const tool =
      toolExecutorState
      .tools
      .get(id);

      return tool
      ? cloneToolObject(tool)
      : null;

    })
    .filter(Boolean)

  );

}
