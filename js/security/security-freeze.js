function isObjectLike(value){
  return value !== null && typeof value === "object";
}

function safeFreeze(value){
  if(!isObjectLike(value)) return value;

  try{
    return Object.freeze(value);
  }catch{
    return value;
  }
}

function deepFreeze(value, visited = new WeakSet()){
  if(!isObjectLike(value)) return value;
  if(visited.has(value)) return value;

  visited.add(value);

  for(const key of Reflect.ownKeys(value)){
    try{
      deepFreeze(value[key], visited);
    }catch{}
  }

  return safeFreeze(value);
}

function immutableCopy(value){
  if(!isObjectLike(value)) return value;

  if(typeof structuredClone !== "function"){
    throw new TypeError("structuredClone is required for immutableCopy");
  }

  let cloned;

  try{
    cloned = structuredClone(value);
  }catch(error){
    throw new TypeError(
      `immutableCopy could not clone value: ${error?.message || error}`,
      { cause:error }
    );
  }

  return deepFreeze(cloned);
}

function isFrozen(value){
  if(!isObjectLike(value)) return false;
  return Object.isFrozen(value);
}

const SecurityFreeze = Object.freeze({
  freeze:safeFreeze,
  deepFreeze,
  immutableCopy,
  isFrozen
});

export {
  safeFreeze,
  deepFreeze,
  immutableCopy,
  isFrozen,
  SecurityFreeze
};

export default SecurityFreeze;
