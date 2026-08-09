// =====================================
// RIGO AI
// AUTH SESSION
// =====================================

import { AUTH_RUNTIME_CONFIG } from "./auth-config.js";
import { authRuntimeState } from "./auth-state.js";
import { validateToken, validateAuthSession } from "./auth-validation.js";

function local(){return typeof window!=="undefined"?window.localStorage:null;}
function temporary(){return typeof window!=="undefined"?window.sessionStorage:null;}

export function createAuthSession({user=null,token=null,persistent=false}={}){
  if(!validateToken(token)){return null;}
  const now=Date.now();
  return {user,token,persistent:Boolean(persistent),expiresAt:persistent?Number.MAX_SAFE_INTEGER:now+AUTH_RUNTIME_CONFIG.SESSION_DURATION,createdAt:now};
}
export function saveAuthSession(session){try{if(!validateAuthSession(session))return false;local()?.removeItem(AUTH_RUNTIME_CONFIG.STORAGE_KEY);temporary()?.removeItem(AUTH_RUNTIME_CONFIG.STORAGE_KEY);const storage=session.persistent?local():temporary();if(!storage)return false;storage.setItem(AUTH_RUNTIME_CONFIG.STORAGE_KEY,JSON.stringify(session));return true}catch{return false}}
export function loadAuthSession(){try{const raw=local()?.getItem(AUTH_RUNTIME_CONFIG.STORAGE_KEY)||temporary()?.getItem(AUTH_RUNTIME_CONFIG.STORAGE_KEY);if(!raw)return null;const parsed=JSON.parse(raw);if(!validateAuthSession(parsed)){clearAuthSession();return null}return parsed}catch{clearAuthSession();return null}}
export function clearAuthSession(){try{local()?.removeItem(AUTH_RUNTIME_CONFIG.STORAGE_KEY);temporary()?.removeItem(AUTH_RUNTIME_CONFIG.STORAGE_KEY);return true}catch{return false}}
export function isSessionExpired(session){return !session||Date.now()>=session.expiresAt;}
export function updateLastActivity(){authRuntimeState.lastActivityAt=Date.now();return true;}
export function isLoginBlocked(){return Boolean(authRuntimeState.loginBlockedUntil&&Date.now()<authRuntimeState.loginBlockedUntil);}
export function registerFailedLogin(){authRuntimeState.failedLoginAttempts++;if(authRuntimeState.failedLoginAttempts>=AUTH_RUNTIME_CONFIG.MAX_LOGIN_ATTEMPTS){authRuntimeState.loginBlockedUntil=Date.now()+AUTH_RUNTIME_CONFIG.LOGIN_BLOCK_DURATION;}}
