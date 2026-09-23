import{sharedDeepClone as deepClone,sharedDeepFreeze as deepFreeze,createUniqueId as createSharedUniqueId}from "../shared/utils.js";
export function getSafeErrorMessage(error){if(error instanceof Error)return error.message||"UNKNOWN_ERROR";return String(error||"UNKNOWN_ERROR");}
export function safeCloneAuth(value){return value===undefined?undefined:deepClone(value);}
export function freezeAuthObject(value){return deepFreeze(value);}
export function isBrowserEnvironment(){return typeof window!=="undefined"&&typeof localStorage!=="undefined";}
export function createUniqueId(prefix="id"){return createSharedUniqueId(prefix);}
