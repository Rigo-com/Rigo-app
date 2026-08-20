// =====================================
// RIGO AI
// AUTH CONFIG
// =====================================

export const AUTH_RUNTIME_CONFIG =
(typeof deepFreeze === "function"
? deepFreeze
: Object.freeze)({
  STORAGE_KEY:"rigo_auth_session",
  SESSION_DURATION:1000 * 60 * 60 * 24 * 7,
  PERSIST_ACROSS_BROWSER_RESTART:false,
  MIN_PASSWORD_LENGTH:8,
  MAX_LOGIN_ATTEMPTS:5,
  LOGIN_BLOCK_DURATION:1000 * 60 * 15,
  ENABLE_EVENTS:true,
  ENABLE_DIAGNOSTICS:true,
  ENABLE_SESSION_MONITORING:true,
  ENABLE_TOKEN_VALIDATION:true,
  ENABLE_ACTIVITY_TRACKING:true,
  SESSION_CHECK_INTERVAL:60000
});

export const AUTH_RUNTIME_EVENTS = Object.freeze({LOGIN:"auth.login",LOGOUT:"auth.logout",REGISTER:"auth.register",SESSION_RESTORED:"auth.session.restored",SESSION_EXPIRED:"auth.session.expired",SESSION_CLEARED:"auth.session.cleared",LOGIN_BLOCKED:"auth.login.blocked",TOKEN_INVALID:"auth.token.invalid",AUTH_ERROR:"auth.error"});
export const VALID_AUTH_STATE_KEYS = Object.freeze(new Set(["initialized","initializing","authenticated","loading","user","token","sessionExpiresAt","lastActivityAt","error"]));
