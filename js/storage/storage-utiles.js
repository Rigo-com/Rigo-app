// =====================================
// HOST OBJECT DETECTION
// =====================================

function isHostStorageObject(
  value
){

  if(
    !value ||
    typeof value !==
    "object"
  ){

    return false;

  }

  return (

    value instanceof Element ||

    value instanceof Node ||

    value instanceof Window ||

    value instanceof Document

  );

}



// =====================================
// SAFE JSON PARSE
// =====================================

function safeJSONParse(
  value,
  fallback = null
){

  if(
    typeof value !==
    "string"
  ){

    return fallback;

  }

  if(
    value.length <= 0
  ){

    return fallback;

  }

  try{

    return JSON.parse(
      value
    );

  }

  catch(error){

    return fallback;

  }

}



// =====================================
// SAFE SERIALIZE
// =====================================

function safeStorageSerialize(
  value
){

  try{

    const visited =
    new WeakSet();

    const serialized =
    JSON.stringify(

      value,

      (_,nestedValue) => {

        if(
          typeof nestedValue ===
          "function"
        ){

          return undefined;

        }

        if(
          isHostStorageObject(
            nestedValue
          )
        ){

          return undefined;

        }

        if(

          nestedValue &&

          typeof nestedValue ===
          "object"

        ){

          if(
            visited.has(
              nestedValue
            )
          ){

            return "[Circular]";
          }

          visited.add(
            nestedValue
          );

        }

        return nestedValue;

      }

    );

    if(
      typeof serialized !==
      "string"
    ){

      return null;

    }

    if(

      serialized.length >

      STORAGE_RUNTIME_CONFIG
      .MAX_STORAGE_SIZE

    ){

      return null;

    }

    return serialized;

  }

  catch(error){

    return null;

  }

}



// =====================================
// SAFE DEEP CLONE
// =====================================

function deepClone(data){

  if(
    isHostStorageObject(
      data
    )
  ){

    return null;

  }

  if(
    typeof structuredClone ===
    "function"
  ){

    try{

      return structuredClone(
        data
      );

    }

    catch(error){}

  }

  try{

    const serialized =
    safeStorageSerialize(
      data
    );

    if(!serialized){

      return null;

    }

    return safeJSONParse(
      serialized,
      null
    );

  }

  catch(cloneError){

    return null;

  }

}
