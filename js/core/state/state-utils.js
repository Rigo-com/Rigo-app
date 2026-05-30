// =====================================
// RIGO AI
// STATE UTILS
// =====================================



// =====================================
// CLONE
// =====================================

function cloneStateValue(
  value,
  visited = new WeakMap()
){

  if(

    value === null ||

    typeof value !==
    "object"

  ){

    return value;

  }

  if(
    visited.has(value)
  ){

    return visited.get(
      value
    );

  }

  if(
    value instanceof Date
  ){

    return new Date(
      value.getTime()
    );

  }

  if(
    value instanceof RegExp
  ){

    return new RegExp(
      value
    );

  }

  if(
    value instanceof Set
  ){

    return new Set(
      [...value]
    );

  }

  if(
    value instanceof Map
  ){

    return new Map(
      [...value]
    );

  }

  const clone =

    Array.isArray(value)

    ? []

    : {};

  visited.set(
    value,
    clone
  );

  Object.keys(value)
  .forEach((key) => {

    clone[key] =
    cloneStateValue(
      value[key],
      visited
    );

  });

  return clone;

}



// =====================================
// FREEZE
// =====================================

function freezeStateObject(
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

    value instanceof Promise ||

    value instanceof Date ||

    value instanceof RegExp ||

    value instanceof Map ||

    value instanceof Set ||

    (
      typeof HTMLElement !==
      "undefined" &&

      value instanceof HTMLElement
    )

  ){

    return value;

  }

  visited.add(
    value
  );

  Object.freeze(
    value
  );

  Object.values(value)
  .forEach((nestedValue) => {

    freezeStateObject(
      nestedValue,
      visited
    );

  });

  return value;

}



// =====================================
// IMMUTABLE
// =====================================

function createImmutableState(
  value
){

  return freezeStateObject(
    cloneStateValue(value)
  );

}



// =====================================
// PATH
// =====================================

function normalizeStatePath(
  path
){

  return String(
    path || ""
  )
  .trim();

}



// =====================================
// EXPORTS
// =====================================

export {

  cloneStateValue,

  freezeStateObject,

  createImmutableState,

  normalizeStatePath

};
