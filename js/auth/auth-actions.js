import { authRuntimeState, updateAuthRuntimeState, resetAuthRuntimeState } from "./auth-state.js";
import { validateEmail, validatePassword } from "./auth-validation.js";
import { getSafeErrorMessage, safeCloneAuth } from "./auth-utils.js";
import { isLoginBlocked, registerFailedLogin } from "./auth-session.js";

const AUTH_ENDPOINT = "/api/neon-auth";
const extractUser = payload => payload?.user || payload?.data?.user || payload?.data?.session?.user || null;
const extractSession = payload => payload?.session || payload?.data?.session || payload?.data?.session?.session || null;
const extractError = (payload, fallback) => payload?.error?.message || payload?.error || payload?.message || fallback;
function expiresAtValue(session){
  const raw = session?.expiresAt || session?.expires_at || null;
  if(!raw) return null;
  const value = typeof raw === "number" ? raw : Date.parse(raw);
  return Number.isFinite(value) ? value : null;
}

async function authRequest(action, { method="GET", body=null } = {}){
  const options = { method, credentials:"same-origin", headers:{ Accept:"application/json" } };
  if(body !== null){ options.headers["Content-Type"] = "application/json"; options.body = JSON.stringify(body); }
  const response = await fetch(`${AUTH_ENDPOINT}?action=${encodeURIComponent(action)}`, options);
  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = null; }
  return { response, payload };
}

function clearAuthenticatedState(error = null){
  updateAuthRuntimeState({ authenticated:false, user:null, token:null, sessionExpiresAt:null, lastActivityAt:null, error });
}

async function applyServerSession(payload){
  const user = extractUser(payload);
  const session = extractSession(payload);
  if(!user?.id){ clearAuthenticatedState(); return false; }
  const normalizedUser = { ...user, id:String(user.id), email:String(user.email || "").trim().toLowerCase(), role:payload?.role === "admin" ? "admin" : "user" };
  updateAuthRuntimeState({ authenticated:true, user:safeCloneAuth(normalizedUser), token:null, sessionExpiresAt:expiresAtValue(session), lastActivityAt:Date.now(), error:null });
  authRuntimeState.failedLoginAttempts = 0;
  authRuntimeState.loginBlockedUntil = null;
  return true;
}

async function restoreAuthSession(){
  updateAuthRuntimeState({ loading:true, error:null });
  try{
    const { response, payload } = await authRequest("session");
    if(!response.ok){ clearAuthenticatedState(); return false; }
    const restored = await applyServerSession(payload);
    if(restored) authRuntimeState.diagnostics.restored++;
    return restored;
  }
  catch(error){
    authRuntimeState.diagnostics.errors++;
    clearAuthenticatedState(getSafeErrorMessage(error));
    return false;
  }
  finally { updateAuthRuntimeState({ loading:false }); }
}

async function login({ email="", password="", staySignedIn=false } = {}){
  updateAuthRuntimeState({ loading:true, error:null });
  try{
    if(isLoginBlocked()){
      authRuntimeState.diagnostics.blocked++;
      throw new Error("LOGIN_BLOCKED");
    }
    if(!validateEmail(email)) throw new Error("INVALID_EMAIL");
    if(!validatePassword(password)) throw new Error("INVALID_PASSWORD");
    const { response, payload } = await authRequest("login", { method:"POST", body:{ email:String(email).trim().toLowerCase(), password, staySignedIn:Boolean(staySignedIn) } });
    if(!response.ok) throw new Error(extractError(payload, "INVALID_CREDENTIALS"));
    if(!await restoreAuthSession()) throw new Error("SESSION_RESTORE_FAILED");
    authRuntimeState.diagnostics.logins++;
    return true;
  }
  catch(error){
    if(getSafeErrorMessage(error) !== "LOGIN_BLOCKED") registerFailedLogin();
    authRuntimeState.diagnostics.errors++;
    clearAuthenticatedState(getSafeErrorMessage(error));
    return false;
  }
  finally { updateAuthRuntimeState({ loading:false }); }
}

async function register({ name="", email="", password="", staySignedIn=false } = {}){
  updateAuthRuntimeState({ loading:true, error:null });
  try{
    if(!validateEmail(email)) throw new Error("INVALID_EMAIL");
    if(!validatePassword(password)) throw new Error("INVALID_PASSWORD");
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(name || "").trim() || normalizedEmail.split("@")[0] || "RIGO User";
    const { response, payload } = await authRequest("register", { method:"POST", body:{ name:normalizedName, email:normalizedEmail, password, staySignedIn:Boolean(staySignedIn) } });
    if(!response.ok) throw new Error(extractError(payload, "REGISTRATION_FAILED"));
    if(!await restoreAuthSession()) throw new Error("SESSION_RESTORE_FAILED");
    authRuntimeState.diagnostics.registrations++;
    return true;
  }
  catch(error){ authRuntimeState.diagnostics.errors++; clearAuthenticatedState(getSafeErrorMessage(error)); return false; }
  finally { updateAuthRuntimeState({ loading:false }); }
}

async function logout(){
  updateAuthRuntimeState({ loading:true, error:null });
  try{
    const { response } = await authRequest("logout", { method:"POST", body:{} });
    if(!response.ok) throw new Error("LOGOUT_FAILED");
    const logouts = authRuntimeState.diagnostics.logouts + 1;
    resetAuthRuntimeState();
    authRuntimeState.diagnostics.logouts = logouts;
    return true;
  }
  catch(error){ authRuntimeState.diagnostics.errors++; clearAuthenticatedState(getSafeErrorMessage(error)); return false; }
  finally { updateAuthRuntimeState({ loading:false }); }
}

export { AUTH_ENDPOINT, authRequest, applyServerSession, restoreAuthSession, login, register, logout };
