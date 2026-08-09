// =====================================
// RIGO AI
// STORAGE USER SCOPE
// =====================================

import { AUTH_RUNTIME_CONFIG }
from "../auth/auth-config.js";

const USER_SCOPE_PREFIX =
"rigo.user";

function readAuthSession(){
  if(typeof window === "undefined"){
    return null;
  }

  const key =
  AUTH_RUNTIME_CONFIG.STORAGE_KEY;

  const candidates = [
    window.localStorage?.getItem(key),
    window.sessionStorage?.getItem(key)
  ];

  for(const raw of candidates){
    if(!raw){
      continue;
    }

    try{
      const session = JSON.parse(raw);
      if(session?.user?.email){
        return session;
      }
    }
    catch{}
  }

  return null;
}

function normalizeUserIdentity(value){
  return String(value || "")
  .trim()
  .toLowerCase();
}

function getCurrentUserIdentity(){
  const session =
  readAuthSession();

  return normalizeUserIdentity(
    session?.user?.email
  );
}

function requireCurrentUserIdentity(){
  const identity =
  getCurrentUserIdentity();

  if(!identity){
    throw new Error(
      "STORAGE_USER_IDENTITY_REQUIRED"
    );
  }

  return identity;
}

function getCurrentUserNamespace(){
  const identity =
  requireCurrentUserIdentity();

  return `${USER_SCOPE_PREFIX}.${encodeURIComponent(identity)}`;
}

function scopeStorageKey(key){
  const normalizedKey =
  String(key || "").trim();

  if(!normalizedKey){
    return "";
  }

  return `${getCurrentUserNamespace()}.${normalizedKey}`;
}

function isCurrentUserScopedKey(key){
  try{
    return String(key || "")
    .startsWith(
      `${getCurrentUserNamespace()}.`
    );
  }
  catch{
    return false;
  }
}

const StorageScope =
Object.freeze({
  getCurrentUserIdentity,
  requireCurrentUserIdentity,
  getCurrentUserNamespace,
  scopeStorageKey,
  isCurrentUserScopedKey
});

export {
  USER_SCOPE_PREFIX,
  getCurrentUserIdentity,
  requireCurrentUserIdentity,
  getCurrentUserNamespace,
  scopeStorageKey,
  isCurrentUserScopedKey,
  StorageScope
};

export default StorageScope;
