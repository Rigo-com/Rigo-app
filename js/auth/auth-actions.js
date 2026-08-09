// =====================================
// RIGO AI
// AUTH ACTIONS
// =====================================
import {AUTH_RUNTIME_CONFIG} from "./auth-config.js";
import {authRuntimeState,updateAuthRuntimeState,resetAuthRuntimeState} from "./auth-state.js";
import {validateEmail,validatePassword} from "./auth-validation.js";
import {createAuthSession,saveAuthSession,loadAuthSession,clearAuthSession,isSessionExpired,isLoginBlocked,registerFailedLogin} from "./auth-session.js";
import {createUniqueId,createSecureToken,getSafeErrorMessage,safeCloneAuth} from "./auth-utils.js";

function isConfiguredAdminEmail(email){
  const normalized=String(email||"").trim().toLowerCase();
  return AUTH_RUNTIME_CONFIG.ADMIN_EMAILS.map(value=>String(value).trim().toLowerCase()).includes(normalized);
}

async function verifyAdminOnServer({email,password,staySignedIn}){
  if(typeof window==="undefined")return false;
  const response=await fetch("/api/admin-session",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password,staySignedIn:Boolean(staySignedIn)})});
  const result=await response.json().catch(()=>({}));
  if(!response.ok||!result?.admin){throw new Error(result?.error||"ADMIN_ACCESS_DENIED");}
  return true;
}

async function clearServerAdminSession(){
  if(typeof window==="undefined")return true;
  try{await fetch("/api/admin-session",{method:"DELETE",credentials:"same-origin"});}catch{}
  return true;
}

export async function restoreAuthSession(){
  updateAuthRuntimeState({loading:true,error:null});
  try{
    const session=loadAuthSession();
    if(isSessionExpired(session)){clearAuthSession();resetAuthRuntimeState();return false;}
    if(!session){resetAuthRuntimeState();return false;}
    const user={...session.user,role:"user"};
    updateAuthRuntimeState({authenticated:true,user:safeCloneAuth(user),token:session.token,sessionExpiresAt:session.expiresAt,lastActivityAt:Date.now()});
    authRuntimeState.diagnostics.restored++;
    return true;
  }catch{authRuntimeState.diagnostics.errors++;resetAuthRuntimeState();return false;}
  finally{updateAuthRuntimeState({initialized:true,loading:false});}
}

export async function login({email="",password="",staySignedIn=false}={}){
  updateAuthRuntimeState({loading:true,error:null});
  try{
    if(isLoginBlocked())throw new Error("LOGIN_BLOCKED");
    if(!validateEmail(email)){registerFailedLogin();throw new Error("INVALID_EMAIL");}
    if(!validatePassword(password)){registerFailedLogin();throw new Error("INVALID_PASSWORD");}

    const normalizedEmail=String(email).trim().toLowerCase();
    if(isConfiguredAdminEmail(normalizedEmail)){
      await verifyAdminOnServer({email:normalizedEmail,password,staySignedIn});
    }

    const user={id:createUniqueId("user"),email:normalizedEmail,role:"user"};
    const token=createSecureToken();
    const session=createAuthSession({user,token,persistent:Boolean(staySignedIn)});
    if(!saveAuthSession(session))throw new Error("SESSION_SAVE_FAILED");

    authRuntimeState.failedLoginAttempts=0;
    authRuntimeState.loginBlockedUntil=null;
    updateAuthRuntimeState({authenticated:true,user:safeCloneAuth(user),token,sessionExpiresAt:session.expiresAt,lastActivityAt:Date.now()});
    authRuntimeState.diagnostics.logins++;
    return true;
  }catch(error){
    authRuntimeState.diagnostics.errors++;
    resetAuthRuntimeState();
    updateAuthRuntimeState({error:getSafeErrorMessage(error)});
    return false;
  }finally{updateAuthRuntimeState({loading:false});}
}

export async function register({email="",password="",staySignedIn=false}={}){
  if(isConfiguredAdminEmail(email)){
    updateAuthRuntimeState({error:"ADMIN_ACCOUNT_CANNOT_BE_REGISTERED"});
    return false;
  }
  const success=await login({email,password,staySignedIn});
  if(success)authRuntimeState.diagnostics.registrations++;
  return success;
}

export async function logout(){
  updateAuthRuntimeState({loading:true,error:null});
  try{
    await clearServerAdminSession();
    clearAuthSession();
    resetAuthRuntimeState();
    authRuntimeState.failedLoginAttempts=0;
    authRuntimeState.loginBlockedUntil=null;
    authRuntimeState.diagnostics.logouts++;
    return true;
  }catch{authRuntimeState.diagnostics.errors++;return false;}
  finally{updateAuthRuntimeState({loading:false});}
}
