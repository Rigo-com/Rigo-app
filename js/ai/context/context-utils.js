// =====================================
// RIGO AI
// CONTEXT UTILS
// =====================================



export function normalizeContextId(
  value
){

  return String(
    value || ""
  )
  .trim()
  .toLowerCase();

}



export function createContextId(){

  return (

    "ctx_" +

    Date.now() +

    "_" +

    Math.random()
    .toString(36)
    .slice(2,10)

  );

}



export function safeClone(
  value
){

  try{

    if(
      typeof structuredClone ===
      "function"
    ){

      return structuredClone(
        value
      );

    }

  }

  catch(error){}

  try{

    return JSON.parse(
      JSON.stringify(value)
    );

  }

  catch(error){

    return null;

  }

}



export function freezeContextObject(
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

    value instanceof WeakSet

  ){

    return value;

  }

  visited.add(value);

  Object.values(value)
  .forEach((nestedValue) => {

    freezeContextObject(
      nestedValue,
      visited
    );

  });

  return Object.freeze(
    value
  );

}



export function serializeContext(
  value
){

  try{

    return JSON.stringify(
      value
    );

  }

  catch(error){

    return "";

  }

}



export function estimateTokens(
  value
){

  try{

    return Math.ceil(

      serializeContext(value)
      .length / 4

    );

  }

  catch(error){

    return 0;

  }

}



export function createCompressionPreview(
  serialized,
  length = 500
){

  return String(
    serialized || ""
  )
  .slice(
    0,
    length
  );

}



export function hashContextContent(
  value
){

  try{

    return btoa(
      encodeURIComponent(
        serializeContext(value)
      )
    )
    .slice(
      0,
      128
    );

  }

  catch(error){

    return String(
      Date.now()
    );

  }

}



export function createSearchableText(
  value
){

  return serializeContext(
    value
  )
  .slice(
    0,
    50000
  )
  .toLowerCase();

}
