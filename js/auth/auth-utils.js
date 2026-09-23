import{sharedDeepClone as deepClone,sharedDeepFreeze as deepFreeze,createUniqueId as createSharedUniqueId}from "../shared/utils.js";
export function getSafeErrorMessage(error){if(error instanceof Error)return error.message||"UNKNOWN_ERROR";return String(error||"UNKNOWN_ERROR");}
export function safeCloneAuth(value){return value===undefined?undefined:deepClone(value);}
export function freezeAuthObject(value){return deepFreeze(value);}
export function isBrowserEnvironment(){return typeof window!=="undefined"&&typeof localStorage!=="undefined";}
export function isStorageAvailable(){try{if(!isBrowserEnvironment())return false;const testKey="__rigo_test__";localStorage.setItem(testKey,"1");localStorage.removeItem(testKey);return true;}catch{return false;}}
export function createUniqueId(prefix="id"){return createSharedUniqueId(prefix);}
export function createSecureToken(){if(typeof crypto!=="undefined"&&typeof crypto.getRandomValues==="function"){const array=new Uint8Array(32);crypto.getRandomValues(array);return Array.from(array).map(byte=>byte.toString(16).padStart(2,"0")).join("");}return createUniqueId("token");}