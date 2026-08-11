import crypto from "node:crypto";

const COOKIE_NAME = "rigo_admin_session";
const ADMIN_EMAIL = String(process.env.RIGO_ADMIN_EMAIL || "azizo436618@gmail.com").trim().toLowerCase();
const ADMIN_PASSWORD = String(process.env.RIGO_ADMIN_PASSWORD || "");
const SESSION_SECRET = String(process.env.RIGO_ADMIN_SESSION_SECRET || process.env.OPENROUTER_API_KEY || "");
const PERSISTENT_MAX_AGE = 60 * 60 * 24 * 400;

function normalizeEmail(value){return String(value || "").trim().toLowerCase();}
function encode(value){return Buffer.from(value,"utf8").toString("base64url");}
function decode(value){return Buffer.from(value,"base64url").toString("utf8");}
function sign(value){return crypto.createHmac("sha256",SESSION_SECRET).update(value).digest("base64url");}
function safeEqual(a,b){const left=Buffer.from(String(a));const right=Buffer.from(String(b));if(left.length!==right.length)return false;return crypto.timingSafeEqual(left,right);}
function parseCookies(request){const raw=String(request.headers?.cookie || "");const result={};for(const part of raw.split(";")){const index=part.indexOf("=");if(index<0)continue;const key=part.slice(0,index).trim();const value=part.slice(index+1).trim();if(key)result[key]=decodeURIComponent(value);}return result;}
function buildSession(email,persistent){return {email:normalizeEmail(email),role:"admin",persistent:Boolean(persistent),issuedAt:Date.now()};}
function createToken(session){if(!SESSION_SECRET)throw new Error("ADMIN_SESSION_SECRET_NOT_CONFIGURED");const payload=encode(JSON.stringify(session));return `${payload}.${sign(payload)}`;}
function verifyToken(token){try{if(!SESSION_SECRET||!token)return null;const [payload,signature]=String(token).split(".");if(!payload||!signature||!safeEqual(signature,sign(payload)))return null;const session=JSON.parse(decode(payload));if(session?.role!=="admin"||normalizeEmail(session?.email)!==ADMIN_EMAIL)return null;return session;}catch{return null;}}
function cookieHeader(token,persistent){const parts=[`${COOKIE_NAME}=${encodeURIComponent(token)}`,"Path=/","HttpOnly","Secure","SameSite=Strict"];if(persistent)parts.push(`Max-Age=${PERSISTENT_MAX_AGE}`);return parts.join("; ");}
function clearCookieHeader(){return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;}
export function adminAuthConfigured(){return Boolean(ADMIN_PASSWORD&&SESSION_SECRET);}
export function isAdminEmail(email){return normalizeEmail(email)===ADMIN_EMAIL;}
export function authenticateAdmin(email,password){if(!adminAuthConfigured())return {ok:false,error:"ADMIN_AUTH_NOT_CONFIGURED"};if(!isAdminEmail(email))return {ok:false,error:"ADMIN_ACCESS_DENIED"};if(!safeEqual(String(password||""),ADMIN_PASSWORD))return {ok:false,error:"INVALID_ADMIN_CREDENTIALS"};return {ok:true,email:ADMIN_EMAIL};}
export function issueAdminSession(response,{email=ADMIN_EMAIL,persistent=false}={}){const token=createToken(buildSession(email,persistent));response.setHeader("Set-Cookie",cookieHeader(token,persistent));return true;}
export function clearAdminSession(response){response.setHeader("Set-Cookie",clearCookieHeader());return true;}
export function getAdminSession(request){return verifyToken(parseCookies(request)[COOKIE_NAME]);}
export function requireAdminSession(request,response){const session=getAdminSession(request);if(!session){response.status(403).json({ok:false,error:"ADMIN_ACCESS_REQUIRED"});return null;}if(session.persistent)issueAdminSession(response,{email:session.email,persistent:true});return session;}
export {ADMIN_EMAIL,COOKIE_NAME};
