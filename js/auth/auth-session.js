// =====================================
// RIGO AI
// AUTH SESSION
// =====================================

import { AUTH_RUNTIME_CONFIG } from "./auth-config.js";
import { authRuntimeState } from "./auth-state.js";
import { validateToken, validateAuthSession } from "./auth-validation.js";

function getSessionStorage(){
  if(typeof window === "undefined"){return null;}
  return AUTH_RUNTIME_CONFIG.PERSIST_ACROSS_BROWSER_RESTART ? window.localStorage : window.sessionStorage;
}

export function createAuthSession({user=null,token=null}={}){
  if(!validateToken(token)){return null;}
  const now=Date.now();
  return {user,token,expiresAt:now+AUTH_RUNTIME_CONFIG.SESSION_DURATION,createdAt:now};
}

export function saveAuthSession(session){
  try{
    const storage=getSessionStorage();
    if(!storage||!validateAuthSession(session)){return false;}
    storage.setItem(AUTH_RUNTIME_CONFIG.STORAGE_KEY,JSON.stringify(session));
    return true;
  }catch{return false;}
}

export function loadAuthSession(){
  try{
    const storage=getSessionStorage();
    if(!storage){return null;}
    const raw=storage.getItem(AUTH_RUNTIME_CONFIG.STORAGE_KEY);
    if(!raw){return null;}
    const parsed=JSON.parse(raw);
    if(!validateAuthSession(parsed)){clearAuthSession();return null;}
    return parsed;
  }catch{clearAuthSession();return null;}
}

export function clearAuthSession(){
  try{
    if(typeof window === "undefined"){return false;}
    window.localStorage?.removeItem(AUTH_RUNTIME_CONFIG.STORAGE_KEY);
    window.sessionStorage?.removeItem(AUTH_RUNTIME_CONFIG.STORAGE_KEY);
    return true;
  }catch{return false;}
}

export function isSessionExpired(session){return !session||Date.now()>=session.expiresAt;}
export function updateLastActivity(){authRuntimeState.lastActivityAt=Date.now();return true;}
export function isLoginBlocked(){return Boolean(authRuntimeState.loginBlockedUntil&&Date.now()<authRuntimeState.loginBlockedUntil);}
export function registerFailedLogin(){authRuntimeState.failedLoginAttempts++;if(authRuntimeState.failedLoginAttempts>=AUTH_RUNTIME_CONFIG.MAX_LOGIN_ATTEMPTS){authRuntimeState.loginBlockedUntil=Date.now()+AUTH_RUNTIME_CONFIG.LOGIN_BLOCK_DURATION;}}
