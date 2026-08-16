// =====================================
// RIGO AI
// MEMORY SECURITY
// SECURITY LAYER
// =====================================



// =====================================
// BLOCKED KEYS
// =====================================

const BLOCKED_KEYS =
Object.freeze([

  "__proto__",

  "prototype",

  "constructor"

]);



// =====================================
// HELPERS
// =====================================

function isObject(
  value
){

  return (

    value !== null

    &&

    typeof value ===
    "object"

  );

}



// =====================================
// SANITIZE
// =====================================

function sanitizeMemory(
  memory
){

  if(
    Array.isArray(
      memory
    )
  ){
    return memory.map((value) => {
      return isObject(value)
      ? sanitizeMemory(value)
      : value;
    });
  }

  if(
    !isObject(
      memory
    )
  ){

    return {};
  }

  const sanitized =
  {};

  for(
    const [

      key,

      value

    ]

    of Object.entries(
      memory
    )
  ){

    if(
      BLOCKED_KEYS
      .includes(
        key
      )
    ){
      continue;
    }

    if(
      isObject(
        value
      )
    ){

      sanitized[key] =

        sanitizeMemory(
          value
        );

      continue;

    }

    sanitized[key] =
    value;

  }

  return sanitized;

}



// =====================================
// SANITIZE COLLECTION
// =====================================

function sanitizeMemories(
  memories = []
){

  if(
    !Array.isArray(
      memories
    )
  ){
    return [];
  }

  return memories.map(
    sanitizeMemory
  );

}



// =====================================
// INTEGRITY
// =====================================

function verifyIntegrity(
  memory
){

  try{

    sanitizeMemory(
      memory
    );

    return true;

  }

  catch{

    return false;

  }

}



// =====================================
// SAFE EXPORT
// =====================================

function createSafeExport(
  data
){

  return JSON.stringify(

    sanitizeMemory(
      data
    ),

    null,

    2

  );

}



// =====================================
// SAFE IMPORT
// =====================================

function createSafeImport(
  rawData
){

  try{

    const parsed =

      JSON.parse(
        rawData
      );

    return sanitizeMemory(
      parsed
    );

  }

  catch{

    return null;

  }

}



// =====================================
// PUBLIC API
// =====================================

const MemorySecurity =
Object.freeze({

  sanitizeMemory,

  sanitizeMemories,

  verifyIntegrity,

  createSafeExport,

  createSafeImport

});



// =====================================
// EXPORTS
// =====================================

export {

  BLOCKED_KEYS,

  sanitizeMemory,

  sanitizeMemories,

  verifyIntegrity,

  createSafeExport,

  createSafeImport,

  MemorySecurity

};

export default
MemorySecurity;
