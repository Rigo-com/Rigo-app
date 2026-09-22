function isObject(value){return value!==null&&typeof value==="object"&&!Array.isArray(value);}
function isString(value){return typeof value==="string";}
function isValidKey(key){return isString(key)&&key.trim().length>0;}
function deepClone(value){try{return typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));}catch{return null;}}
function serialize(value){try{return JSON.stringify(value);}catch{return null;}}
function deserialize(value){try{return JSON.parse(value);}catch{return null;}}
function getSerializedSize(value){const serialized=serialize(value);return serialized?serialized.length:0;}
const StorageUtils=Object.freeze({isObject,isString,isValidKey,deepClone,serialize,deserialize,getSerializedSize});
export {isObject,isString,isValidKey,deepClone,serialize,deserialize,getSerializedSize,StorageUtils};
export default StorageUtils;