// =====================================
// RIGO AI
// SECURITY VALIDATOR
// VALIDATION LAYER
// =====================================

import {

  ValidationError

}
from "./security-errors.js";



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



// =====================================
// STRING
// =====================================

function validateString(
  value,
  options = {}
){

  if(
    typeof value !==
    "string"
  ){

    throw new ValidationError(
      "Value must be a string"
    );

  }

  if(

    options.minLength != null

    &&

    value.length <
    options.minLength

  ){

    throw new ValidationError(
      "String is too short"
    );

  }

  if(

    options.maxLength != null

    &&

    value.length >
    options.maxLength

  ){

    throw new ValidationError(
      "String is too long"
    );

  }

  return true;

}



// =====================================
// NUMBER
// =====================================

function validateNumber(
  value,
  options = {}
){

  if(

    typeof value !==
    "number"

    ||

    !Number.isFinite(
      value
    )

  ){

    throw new ValidationError(
      "Value must be a valid number"
    );

  }

  if(

    options.min != null

    &&

    value < options.min

  ){

    throw new ValidationError(
      "Number is below minimum"
    );

  }

  if(

    options.max != null

    &&

    value > options.max

  ){

    throw new ValidationError(
      "Number exceeds maximum"
    );

  }

  return true;

}



// =====================================
// BOOLEAN
// =====================================

function validateBoolean(
  value
){

  if(
    typeof value !==
    "boolean"
  ){

    throw new ValidationError(
      "Value must be a boolean"
    );

  }

  return true;

}



// =====================================
// ARRAY
// =====================================

function validateArray(
  value,
  options = {}
){

  if(
    !Array.isArray(
      value
    )
  ){

    throw new ValidationError(
      "Value must be an array"
    );

  }

  if(

    options.minLength != null

    &&

    value.length <
    options.minLength

  ){

    throw new ValidationError(
      "Array is too small"
    );

  }

  if(

    options.maxLength != null

    &&

    value.length >
    options.maxLength

  ){

    throw new ValidationError(
      "Array is too large"
    );

  }

  return true;

}



// =====================================
// OBJECT
// =====================================

function validateObject(
  value
){

  if(
    !isPlainObject(
      value
    )
  ){

    throw new ValidationError(
      "Value must be a plain object"
    );

  }

  return true;

}



// =====================================
// SCHEMA
// =====================================

function validateSchema(
  value,
  schema = {}
){

  validateObject(
    schema
  );

  Object.entries(
    schema
  )
  .forEach(([

    key,

    expectedType

  ]) => {

    const currentValue =
    value?.[key];

    switch(
      expectedType
    ){

      case "string":

        validateString(
          currentValue
        );

        break;

      case "number":

        validateNumber(
          currentValue
        );

        break;

      case "boolean":

        validateBoolean(
          currentValue
        );

        break;

      case "array":

        validateArray(
          currentValue
        );

        break;

      case "object":

        validateObject(
          currentValue
        );

        break;

      default:

        throw new ValidationError(

          `Unsupported schema type: ${expectedType}`

        );

    }

  });

  return true;

}



// =====================================
// PUBLIC API
// =====================================

const SecurityValidator =
Object.freeze({

  string:
  validateString,

  number:
  validateNumber,

  boolean:
  validateBoolean,

  array:
  validateArray,

  object:
  validateObject,

  schema:
  validateSchema

});



// =====================================
// EXPORTS
// =====================================

export {

  validateString,

  validateNumber,

  validateBoolean,

  validateArray,

  validateObject,

  validateSchema,

  SecurityValidator

};
