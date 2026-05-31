// =====================================
// RIGO AI
// SECURITY SANITIZE
// PURE SANITIZATION LAYER
// =====================================



// =====================================
// CONFIG
// =====================================

const SECURITY_SANITIZE_CONFIG =
Object.freeze({

  MAX_DEPTH:
  10,

  MAX_STRING_LENGTH:
  50000,

  MAX_ARRAY_LENGTH:
  5000,

  MAX_OBJECT_KEYS:
  1000

});



// =====================================
// HELPERS
// =====================================

function isPlainObject(
  value
){

  if(

    value === null ||

    typeof value !==
    "object"

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



function sanitizeString(
  value
){

  if(
    value == null
  ){

    return "";

  }

  let sanitized = "";

  try{

    sanitized =
    String(value);

  }

  catch{

    return "";

  }

  try{

    sanitized =
    sanitized.normalize(
      "NFKC"
    );

  }

  catch{}

  sanitized =
  sanitized

  .replace(
    /[\u0000-\u001F\u007F]/g,
    ""
  )

  .replace(
    /[\u202A-\u202E]/g,
    ""
  )

  .trim();

  if(

    sanitized.length >

    SECURITY_SANITIZE_CONFIG
    .MAX_STRING_LENGTH

  ){

    sanitized =
    sanitized.slice(

      0,

      SECURITY_SANITIZE_CONFIG
      .MAX_STRING_LENGTH

    );

  }

  return sanitized;

}



// =====================================
// INTERNAL SANITIZER
// =====================================

function sanitizeInternal(
  value,
  depth,
  visited
){

  if(

    depth >

    SECURITY_SANITIZE_CONFIG
    .MAX_DEPTH

  ){

    return null;

  }



  // ================================
  // NULL
  // ================================

  if(
    value == null
  ){

    return null;

  }



  // ================================
  // STRING
  // ================================

  if(
    typeof value ===
    "string"
  ){

    return sanitizeString(
      value
    );

  }



  // ================================
  // NUMBER
  // ================================

  if(
    typeof value ===
    "number"
  ){

    return Number.isFinite(
      value
    )
      ? value
      : 0;

  }



  // ================================
  // BOOLEAN
  // ================================

  if(
    typeof value ===
    "boolean"
  ){

    return value;

  }



  // ================================
  // BIGINT
  // ================================

  if(
    typeof value ===
    "bigint"
  ){

    return value.toString();

  }



  // ================================
  // DATE
  // ================================

  if(
    value instanceof Date
  ){

    const timestamp =
    value.getTime();

    if(
      Number.isNaN(
        timestamp
      )
    ){

      return null;

    }

    return new Date(
      timestamp
    );

  }



  // ================================
  // ERROR
  // ================================

  if(
    value instanceof Error
  ){

    return {

      name:
      sanitizeString(
        value.name
      ),

      message:
      sanitizeString(
        value.message
      )

    };

  }



  // ================================
  // CIRCULAR
  // ================================

  if(
    visited.has(value)
  ){

    return visited.get(
      value
    );

  }



  // ================================
  // ARRAY
  // ================================

  if(
    Array.isArray(value)
  ){

    const sanitized =
    [];

    visited.set(
      value,
      sanitized
    );

    value

    .slice(

      0,

      SECURITY_SANITIZE_CONFIG
      .MAX_ARRAY_LENGTH

    )

    .forEach((item) => {

      sanitized.push(

        sanitizeInternal(

          item,

          depth + 1,

          visited

        )

      );

    });

    return sanitized;

  }



  // ================================
  // OBJECT
  // ================================

  if(
    isPlainObject(
      value
    )
  ){

    const sanitized =
    Object.create(null);

    visited.set(
      value,
      sanitized
    );

    Object.keys(value)

    .slice(

      0,

      SECURITY_SANITIZE_CONFIG
      .MAX_OBJECT_KEYS

    )

    .forEach((key) => {

      if(

        key ===
        "__proto__"

        ||

        key ===
        "prototype"

        ||

        key ===
        "constructor"

      ){

        return;

      }

      sanitized[key] =

      sanitizeInternal(

        value[key],

        depth + 1,

        visited

      );

    });

    return sanitized;

  }



  // ================================
  // UNSUPPORTED
  // ================================

  return null;

}



// =====================================
// ARRAY
// =====================================

function sanitizeArray(
  value
){

  return sanitizeInternal(

    value,

    0,

    new WeakMap()

  );

}



// =====================================
// OBJECT
// =====================================

function sanitizeObject(
  value
){

  return sanitizeInternal(

    value,

    0,

    new WeakMap()

  );

}



// =====================================
// VALUE
// =====================================

function sanitizeValue(
  value
){

  return sanitizeInternal(

    value,

    0,

    new WeakMap()

  );

}



// =====================================
// PUBLIC API
// =====================================

const SecuritySanitize =
Object.freeze({

  string:
  sanitizeString,

  array:
  sanitizeArray,

  object:
  sanitizeObject,

  value:
  sanitizeValue

});



// =====================================
// EXPORTS
// =====================================

export {

  SECURITY_SANITIZE_CONFIG,

  sanitizeString,

  sanitizeArray,

  sanitizeObject,

  sanitizeValue,

  SecuritySanitize

};
