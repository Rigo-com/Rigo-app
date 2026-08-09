// =====================================
// RIGO AI
// AUTH ACTIONS
// NEON AUTH CLIENT BRIDGE
// =====================================

import {
  authRuntimeState,
  updateAuthRuntimeState,
  resetAuthRuntimeState
}
from "./auth-state.js";

import {
  validateEmail,
  validatePassword
}
from "./auth-validation.js";

import {
  getSafeErrorMessage,
  safeCloneAuth
}
from "./auth-utils.js";

const AUTH_ENDPOINT="/api/neon-auth";

function extractUser(payload){
  return payload?.user||payload?.data?.user||payload?.data?.session?.user||null;
}

function extractSession(payload){
  return payload?.session||payload?.data?.session||payload?.data?.session?.session||null;
}

function extractError(payload,fallback){
  return payload?.error?.message||payload?.error||payload?.message||fallback;
}

function expiresAtValue(session){
  const raw=session?.expiresAt||session?.expires_at||null;
  if(!raw)return null;
  const value=typeof raw==="number"?raw:Date.parse(raw);
  return Number.isFinite(value)?value:null;
}

async function authRequest(action,{method="GET",body=null}={}){
  const url=`${AUTH_ENDPOINT}?action=${encodeURIComponent(action)}`;
  const options={
    method,
    credentials:"same-origin",
    headers:{Accept:"application/json"}
  };

  if(body!==null){
    options.headers["Content-Type"]="application/json";
    options.body=JSON.stringify(body);
  }

  const response=await fetch(url,options);
  const text=await response.text();
  let payload=null;
  try{payload=text?JSON.parse(text):null}catch{payload=null}

  return {response,payload,text};
}

async function applyServerSession(payload){
  const user=extractUser(payload);
  const session=extractSession(payload);

  if(!user?.id){
    resetAuthRuntimeState();
    return false;
  }

  const role=payload?.role==="admin"?"admin":"user";
  const normalizedUser={
    ...user,
    id:String(user.id),
    email:String(user.email||"").trim().toLowerCase(),
    role
  };

  updateAuthRuntimeState({
    authenticated:true,
    user:safeCloneAuth(normalizedUser),
    token:null,
    sessionExpiresAt:expiresAtValue(session),
    lastActivityAt:Date.now(),
    error:null
  });

  return true;
}

export async function restoreAuthSession(){
  updateAuthRuntimeState({loading:true,error:null});

  try{
    const {response,payload}=await authRequest("session");

    if(!response.ok){
      resetAuthRuntimeState();
      return false;
    }

    const restored=await applyServerSession(payload);
    if(restored)authRuntimeState.diagnostics.restored++;
    return restored;
  }
  catch(error){
    authRuntimeState.diagnostics.errors++;
    resetAuthRuntimeState();
    return false;
  }
  finally{
    updateAuthRuntimeState({initialized:true,loading:false});
  }
}

export async function login({email="",password="",staySignedIn=false}={}){
  updateAuthRuntimeState({loading:true,error:null});

  try{
    if(!validateEmail(email))throw new Error("INVALID_EMAIL");
    if(!validatePassword(password))throw new Error("INVALID_PASSWORD");

    const normalizedEmail=String(email).trim().toLowerCase();
    const {response,payload}=await authRequest("login",{
      method:"POST",
      body:{
        email:normalizedEmail,
        password,
        staySignedIn:Boolean(staySignedIn)
      }
    });

    if(!response.ok){
      throw new Error(extractError(payload,"INVALID_CREDENTIALS"));
    }

    const restored=await restoreAuthSession();
    if(!restored)throw new Error("SESSION_RESTORE_FAILED");

    authRuntimeState.diagnostics.logins++;
    return true;
  }
  catch(error){
    authRuntimeState.diagnostics.errors++;
    resetAuthRuntimeState();
    updateAuthRuntimeState({error:getSafeErrorMessage(error)});
    return false;
  }
  finally{
    updateAuthRuntimeState({loading:false});
  }
}

export async function register({name="",email="",password="",staySignedIn=false}={}){
  updateAuthRuntimeState({loading:true,error:null});

  try{
    if(!validateEmail(email))throw new Error("INVALID_EMAIL");
    if(!validatePassword(password))throw new Error("INVALID_PASSWORD");

    const normalizedEmail=String(email).trim().toLowerCase();
    const normalizedName=String(name||"").trim()||normalizedEmail.split("@")[0]||"RIGO User";

    const {response,payload}=await authRequest("register",{
      method:"POST",
      body:{
        name:normalizedName,
        email:normalizedEmail,
        password,
        staySignedIn:Boolean(staySignedIn)
      }
    });

    if(!response.ok){
      throw new Error(extractError(payload,"REGISTRATION_FAILED"));
    }

    const restored=await restoreAuthSession();
    if(!restored)throw new Error("SESSION_RESTORE_FAILED");

    authRuntimeState.diagnostics.registrations++;
    return true;
  }
  catch(error){
    authRuntimeState.diagnostics.errors++;
    resetAuthRuntimeState();
    updateAuthRuntimeState({error:getSafeErrorMessage(error)});
    return false;
  }
  finally{
    updateAuthRuntimeState({loading:false});
  }
}

export async function logout(){
  updateAuthRuntimeState({loading:true,error:null});

  try{
    await authRequest("logout",{method:"POST",body:{}});
    resetAuthRuntimeState();
    authRuntimeState.diagnostics.logouts++;
    return true;
  }
  catch{
    authRuntimeState.diagnostics.errors++;
    resetAuthRuntimeState();
    return false;
  }
  finally{
    updateAuthRuntimeState({loading:false});
  }
}
