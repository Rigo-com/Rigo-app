// =====================================
// RIGO AI
// AGENT UTILS
// =====================================



// =====================================
// NORMALIZE AGENT ID
// =====================================

export function normalizeAgentId(
  agentId
){

  return String(
    agentId || ""
  )
  .trim()
  .toLowerCase();

}



// =====================================
// CLONE OBJECT
// =====================================

export function cloneAgentObject(
  value,
  visited = new WeakMap()
){

  if(
    !value ||
    typeof value !== "object"
  ){
    return value;
  }

  if(
    value instanceof AbortController ||
    value instanceof AbortSignal
  ){
    return value;
  }

  if(visited.has(value)){
    return visited.get(value);
  }

  if(Array.isArray(value)){

    const clone = [];
    visited.set(value,clone);

    value.forEach((item) => {
      clone.push(
        cloneAgentObject(
          item,
          visited
        )
      );
    });

    return clone;

  }

  if(value instanceof Date){
    return new Date(value.getTime());
  }

  if(value instanceof Map){

    const clone = new Map();
    visited.set(value,clone);

    value.forEach((item,key) => {
      clone.set(
        cloneAgentObject(key,visited),
        cloneAgentObject(item,visited)
      );
    });

    return clone;

  }

  if(value instanceof Set){

    const clone = new Set();
    visited.set(value,clone);

    value.forEach((item) => {
      clone.add(
        cloneAgentObject(item,visited)
      );
    });

    return clone;

  }

  const clone = {};
  visited.set(value,clone);

  Object.entries(value)
  .forEach(([key,item]) => {
    clone[key] =
    cloneAgentObject(
      item,
      visited
    );
  });

  return clone;


}



// =====================================
// FREEZE OBJECT
// =====================================

export function freezeAgentObject(
  value,
  visited = new WeakSet()
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return value;

  }

  if(

    value instanceof Map ||

    value instanceof Set ||

    value instanceof WeakMap ||

    value instanceof WeakSet ||

    value instanceof AbortController ||

    value instanceof AbortSignal

  ){

    return value;

  }

  visited.add(value);

  Object.values(value)
  .forEach((nestedValue) => {

    if(
      nestedValue &&
      typeof nestedValue ===
      "object"
    ){

      freezeAgentObject(
        nestedValue,
        visited
      );

    }

  });

  return Object.freeze(
    value
  );

}



// =====================================
// CREATE AGENT ID
// =====================================

export function createAgentId(){

  try{

    if(

      typeof crypto !==
      "undefined"

      &&

      typeof crypto
      .randomUUID ===
      "function"

    ){

      return (
        "agent_" +
        crypto.randomUUID()
      );

    }

  }

  catch(error){}

  return (

    "agent_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



// =====================================
// TRIM TASKS
// =====================================

export function trimAgentTasks(
  tasks = [],
  maxTasks = 1000
){

  if(
    tasks.length <=
    maxTasks
  ){

    return tasks;

  }

  return tasks.slice(

    tasks.length -
    maxTasks

  );

}
