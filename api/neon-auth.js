import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const COOKIE_NAME="rigo_session";
const SESSION_AGE=60*60*24*30;
const SESSION_AGE_PERSISTENT=60*60*24*400;
const OTP_TTL_MS=10*60*1000;
const OTP_RESEND_MS=60*1000;

function bodyOf(req){if(req.body&&typeof req.body==="object")return req.body;if(typeof req.body==="string"){try{return JSON.parse(req.body)}catch{return {}}}return {}}
function emailOf(v){return String(v||"").trim().toLowerCase()}
function databaseUrl(){return process.env.DATABASE_URL||process.env.DATABASE_POSTGRES_URL||process.env.POSTGRES_URL||process.env.DATABASE_NEON_URL||""}
function secret(){return process.env.RIGO_SESSION_SECRET||process.env.RIGO_ADMIN_SESSION_SECRET||process.env.OPENROUTER_API_KEY||""}
function sql(){const url=databaseUrl();if(!url)throw new Error("DATABASE_URL_NOT_CONFIGURED");return neon(url)}
function b64(v){return Buffer.from(v,"utf8").toString("base64url")}
function unb64(v){return Buffer.from(v,"base64url").toString("utf8")}
function sign(v){return crypto.createHmac("sha256",secret()).update(v).digest("base64url")}
function equal(a,b){const x=Buffer.from(String(a));const y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)}
function hashPassword(password,salt=crypto.randomBytes(16).toString("hex")){const hash=crypto.scryptSync(String(password),salt,64).toString("hex");return `${salt}:${hash}`}
function verifyPassword(password,stored){try{const [salt,expected]=String(stored).split(":");const actual=crypto.scryptSync(String(password),salt,64).toString("hex");return equal(actual,expected)}catch{return false}}
function cookies(req){const out={};for(const part of String(req.headers?.cookie||"").split(";")){const i=part.indexOf("=");if(i>0)out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim())}return out}
function tokenFor(user,persistent){if(!secret())throw new Error("RIGO_SESSION_SECRET_NOT_CONFIGURED");const payload=b64(JSON.stringify({id:user.id,email:user.email,role:user.role||"user",exp:Date.now()+1000*(persistent?SESSION_AGE_PERSISTENT:SESSION_AGE)}));return `${payload}.${sign(payload)}`}
function readToken(req){try{const token=cookies(req)[COOKIE_NAME];if(!token)return null;const [payload,sig]=token.split(".");if(!payload||!sig||!equal(sig,sign(payload)))return null;const data=JSON.parse(unb64(payload));return data.exp>Date.now()?data:null}catch{return null}}
function setSession(res,user,persistent){const max=persistent?SESSION_AGE_PERSISTENT:SESSION_AGE;res.setHeader("Set-Cookie",`${COOKIE_NAME}=${encodeURIComponent(tokenFor(user,persistent))}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${max}`)}
function clearSession(res){res.setHeader("Set-Cookie",`${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`)}
function publicUser(u){return {id:u.id,email:u.email,name:u.name||"",role:u.role||"user"}}
function otpCode(){return String(crypto.randomInt(100000,1000000))}
function otpHash(code){return crypto.createHash("sha256").update(`${secret()}:${String(code)}`).digest("hex")}
function validPassword(password){return String(password||"").length>=8}
function mailConfig(){return {key:process.env.RESEND_API_KEY||"",from:process.env.RIGO_FROM_EMAIL||""}}
async function sendOtpEmail({to,code,purpose}){const cfg=mailConfig();if(!cfg.key||!cfg.from)throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");const subject=purpose==="reset"?"RIGO AI password reset code":"RIGO AI verification code";const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${cfg.key}`,"Content-Type":"application/json"},body:JSON.stringify({from:cfg.from,to:[to],subject,html:`<div style="font-family:Arial,sans-serif"><h2>RIGO AI</h2><p>Your verification code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes.</p></div>`})});let payload={};try{payload=await response.json()}catch{}if(!response.ok)throw new Error(payload?.message||payload?.error||"EMAIL_DELIVERY_FAILED");return payload?.id||null}
async function issueOtp(db,userId,email,purpose){const now=Date.now();const recent=await db`SELECT otp_sent_at FROM rigo_users WHERE id=${userId} LIMIT 1`;const sentAt=recent[0]?.otp_sent_at?new Date(recent[0].otp_sent_at).getTime():0;const elapsed=now-sentAt;if(sentAt&&elapsed<OTP_RESEND_MS){const error=new Error("OTP_COOLDOWN");error.retryAfter=Math.ceil((OTP_RESEND_MS-elapsed)/1000);throw error}const code=otpCode();const emailId=await sendOtpEmail({to:email,code,purpose});await db`UPDATE rigo_users SET otp_hash=${otpHash(code)},otp_expires_at=${new Date(now+OTP_TTL_MS)},otp_purpose=${purpose},otp_sent_at=NOW(),updated_at=NOW() WHERE id=${userId}`;return {sent:true,emailId}
export default async function handler(req,res){return res.status(200).json({ok:true,probe:"helpers-c"})}
