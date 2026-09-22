const SHARED_UTILS_CONFIG=Object.freeze({MAX_TIMEOUT:60000,DEFAULT_DELAY:0});
function wait(milliseconds){
  if(!Number.isFinite(milliseconds)) return Promise.resolve();
  const safeTimeout=Math.min(SHARED_UTILS_CONFIG.MAX_TIMEOUT,Math.max(0,Math.trunc(milliseconds)));
  return new Promise(resolve=>setTimeout(resolve,safeTimeout));
}
function safeTrim(value){return value==null?"":String(value).trim();}
function isPlainObject(value){
  if(!value||typeof value!=="object") return false;
  const prototype=Object.getPrototypeOf(value);
  return prototype===Object.prototype||prototype===null;
}
async function safeExecute(callback,fallback=null){
  if(typeof callback!=="function") return fallback;
  try{return await callback();}catch(error){try{console.error(error);}catch{}return fallback;}
}
function sharedDeepFreeze(object,visited=new WeakSet()){
  if(!object||(typeof object!=="object"&&typeof object!=="function")) return object;
  if(visited.has(object)||Object.isFrozen(object)) return object;
  visited.add(object);
  Reflect.ownKeys(object).forEach(key=>{try{const value=object[key];if(value&&(typeof value==="object"||typeof value==="function"))sharedDeepFreeze(value,visited);}catch{}});
  return Object.freeze(object);
}
function sharedDeepClone(value){
  if(typeof value==="undefined") return undefined;
  try{if(typeof structuredClone==="function")return structuredClone(value);}catch{}
  try{return JSON.parse(JSON.stringify(value));}catch(error){safeExecute(()=>console.error("SHARED_DEEP_CLONE_FAILED",error));return null;}
}
function createUniqueId(prefix="id"){
  const safePrefix=safeTrim(prefix)||"id";
  try{if(typeof crypto!=="undefined"&&typeof crypto.randomUUID==="function")return safePrefix+"_"+crypto.randomUUID();}catch{}
  return safePrefix+"_"+Date.now()+"_"+Math.random().toString(36).slice(2,10);
}
const SharedUtils=Object.freeze({wait,safeTrim,isPlainObject,safeExecute,deepFreeze:sharedDeepFreeze,deepClone:sharedDeepClone,createUniqueId});
export{wait,safeTrim,isPlainObject,safeExecute,sharedDeepFreeze,sharedDeepClone,createUniqueId,SharedUtils};
export default SharedUtils;