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

  const value =
  String(
    serialized || ""
  );

  const maxLength =
  Math.max(
    0,
    Number(length) || 0
  );

  if(value.length <= maxLength){
    return value;
  }

  if(maxLength <= 5){
    return value.slice(0,maxLength);
  }

  const available =
  maxLength - 3;

  const headLength =
  Math.ceil(available / 2);

  const tailLength =
  Math.floor(available / 2);

  return (
    value.slice(0,headLength) +
    "..." +
    value.slice(-tailLength)
  );

}



export function hashContextContent(
  value
){

  const serialized =
  serializeContext(
    value
  );

  let first =
  2166136261;

  let second =
  2246822507;

  for(
    let index = 0;
    index < serialized.length;
    index++
  ){

    const code =
    serialized
    .charCodeAt(index);

    first =
    Math.imul(
      first ^ code,
      16777619
    );

    second =
    Math.imul(
      second ^ code,
      3266489909
    );

  }

  return (
    (first >>> 0)
    .toString(16)
    .padStart(8,"0") +
    (second >>> 0)
    .toString(16)
    .padStart(8,"0")
  );

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
