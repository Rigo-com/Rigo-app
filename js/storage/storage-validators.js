// =====================================
// VALIDATION LIMITS
// =====================================

const STORAGE_VALIDATION_LIMITS =
Object.freeze({

  MAX_CHAT_TITLE_LENGTH:
  200,

  MAX_CHAT_MESSAGES:
  1000,

  MAX_MEMORY_KEYS:
  1000,

  MAX_MEMORY_DEPTH:
  10,

  MAX_STRING_LENGTH:
  50000,

  MAX_TIMESTAMP:
  9999999999999

});



// =====================================
// PLAIN OBJECT VALIDATION
// =====================================

function isPlainStorageObject(
  value
){

  if(
    !value ||

    typeof value !==
    "object"
  ){

    return false;

  }

  if(
    Array.isArray(value)
  ){

    return false;

  }

  const prototype =
  Object.getPrototypeOf(
    value
  );

  return (

    prototype ===
    Object.prototype

    ||

    prototype === null

  );

}



// =====================================
// SAFE TIMESTAMP VALIDATION
// =====================================

function isValidTimestamp(
  value
){

  return (

    typeof value ===
    "number"

    &&

    Number.isFinite(
      value
    )

    &&

    value > 0

    &&

    value <=

    STORAGE_VALIDATION_LIMITS
    .MAX_TIMESTAMP

  );

}



// =====================================
// MEMORY DEPTH VALIDATION
// =====================================

function validateMemoryDepth(
  value,
  depth = 0,
  visited = new WeakSet()
){

  if(

    depth >

    STORAGE_VALIDATION_LIMITS
    .MAX_MEMORY_DEPTH

  ){

    return false;

  }

  if(
    value == null
  ){

    return true;

  }

  if(
    typeof value ===
    "string"
  ){

    return (

      value.length <=

      STORAGE_VALIDATION_LIMITS
      .MAX_STRING_LENGTH

    );

  }

  if(
    typeof value !==
    "object"
  ){

    return true;

  }

  if(
    Array.isArray(value)
  ){

    return value.every((item) => {

      return validateMemoryDepth(

        item,

        depth + 1,

        visited

      );

    });

  }

  if(
    visited.has(value)
  ){

    return false;

  }

  visited.add(value);

  const keys =
  Object.keys(value);

  const polluted =
  keys.some((key) => {

    return (

      key === "__proto__"

      ||

      key === "prototype"

      ||

      key === "constructor"

    );

  });

  if(
    polluted
  ){

    return false;

  }

  return keys.every((key) => {

    return validateMemoryDepth(

      value[key],

      depth + 1,

      visited

    );

  });

}



// =====================================
// VALIDATE CHAT
// =====================================

function validateChatObject(
  chat
){

  if(
    !isPlainStorageObject(
      chat
    )
  ){

    return false;

  }

  if(
    typeof chat.id !==
    "string"
  ){

    return false;

  }

  const normalizedId =
  chat.id.trim();

  if(
    normalizedId.length <= 0
  ){

    return false;

  }

  if(
    typeof chat.title !==
    "string"
  ){

    return false;

  }

  const normalizedTitle =
  chat.title.trim();

  if(
    normalizedTitle.length <= 0
  ){

    return false;

  }

  if(

    normalizedTitle.length >

    STORAGE_VALIDATION_LIMITS
    .MAX_CHAT_TITLE_LENGTH

  ){

    return false;

  }

  if(
    !Array.isArray(
      chat.messages
    )
  ){

    return false;

  }

  if(

    chat.messages.length >

    STORAGE_VALIDATION_LIMITS
    .MAX_CHAT_MESSAGES

  ){

    return false;

  }

  if(

    typeof validateMessageObject ===
    "function"

    &&

    !chat.messages.every(
      validateMessageObject
    )

  ){

    return false;

  }

  if(
    !isValidTimestamp(
      chat.createdAt
    )
  ){

    return false;

  }

  if(
    !isValidTimestamp(
      chat.updatedAt
    )
  ){

    return false;

  }

  return true;

}



// =====================================
// VALIDATE MEMORY
// =====================================

function validateMemoryObject(
  memory
){

  if(
    !isPlainStorageObject(
      memory
    )
  ){

    return false;

  }

  const keys =
  Object.keys(memory);

  if(

    keys.length >

    STORAGE_VALIDATION_LIMITS
    .MAX_MEMORY_KEYS

  ){

    return false;

  }

  return validateMemoryDepth(
    memory
  );

}
