// =====================================
// SAFE JSON PARSE
// =====================================

function safeJSONParse(
  value,
  fallback = null
){

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

    const serialized =
    JSON.stringify(
      value
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

    return JSON.parse(
      JSON.stringify(data)
    );

  }

  catch(cloneError){

    return null;

  }

}
