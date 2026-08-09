// =====================================
// RIGO AI
// STORAGE USER SCOPE
// NEON AUTH RUNTIME IDENTITY
// =====================================

import {
  authRuntimeState
}
from "../auth/auth-state.js";

const USER_SCOPE_PREFIX=
"rigo.user";

function normalizeUserIdentity(value){
  return String(value||"")
  .trim()
  .toLowerCase();
}

function getCurrentUserIdentity(){
  const user=
  authRuntimeState?.user;

  return normalizeUserIdentity(
    user?.id||user?.email
  );
}

function requireCurrentUserIdentity(){
  const identity=
  getCurrentUserIdentity();

  if(!identity){
    throw new Error(
      "STORAGE_USER_IDENTITY_REQUIRED"
    );
  }

  return identity;
}

function getCurrentUserNamespace(){
  const identity=
  requireCurrentUserIdentity();

  return `${USER_SCOPE_PREFIX}.${encodeURIComponent(identity)}`;
}

function scopeStorageKey(key){
  const normalizedKey=
  String(key||"").trim();

  if(!normalizedKey){
    return "";
  }

  return `${getCurrentUserNamespace()}.${normalizedKey}`;
}

function isCurrentUserScopedKey(key){
  try{
    return String(key||"").startsWith(`${getCurrentUserNamespace()}.`);
  }
  catch{
    return false;
  }
}

const StorageScope=Object.freeze({
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
