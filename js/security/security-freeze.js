// =====================================
// RIGO AI
// SECURITY FREEZE
// IMMUTABILITY LAYER
// =====================================



// =====================================
// HELPERS
// =====================================

function isObjectLike(
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
// SAFE FREEZE
// =====================================

function safeFreeze(
  value
){

  if(
    !isObjectLike(
      value
    )
  ){

    return value;

  }

  try{

    return Object.freeze(
      value
    );

  }

  catch{

    return value;

  }

}



// =====================================
// DEEP FREEZE
// =====================================

function deepFreeze(
  value,
  visited = new WeakSet()
){

  if(
    !isObjectLike(
      value
    )
  ){

    return value;

  }

  if(
    visited.has(
      value
    )
  ){

    return value;

  }

  visited.add(
    value
  );

  Reflect
  .ownKeys(value)
  .forEach((key) => {

    deepFreeze(

      value[key],

      visited

    );

  });

  return safeFreeze(
    value
  );

}



// =====================================
// IMMUTABLE COPY
// =====================================

function immutableCopy(
  value
){

  if(
    !isObjectLike(
      value
    )
  ){

    return value;

  }

  try{

    const cloned =

    structuredClone(
      value
    );

    return deepFreeze(
      cloned
    );

  }

  catch{

    return deepFreeze(
      value
    );

  }

}



// =====================================
// FROZEN CHECK
// =====================================

function isFrozen(
  value
){

  if(
    !isObjectLike(
      value
    )
  ){

    return false;

  }

  return Object.isFrozen(
    value
  );

}



// =====================================
// PUBLIC API
// =====================================

const SecurityFreeze =
Object.freeze({

  freeze:
  safeFreeze,

  deepFreeze,

  immutableCopy,

  isFrozen

});



// =====================================
// EXPORTS
// =====================================

export {

  safeFreeze,

  deepFreeze,

  immutableCopy,

  isFrozen,

  SecurityFreeze

};
