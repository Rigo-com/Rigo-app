import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const COOKIE_NAME="rigo_session";
const SESSION_AGE=60*60*24*30;
const SESSION_AGE_PERSISTENT=60*60*24*400;

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

async function ensureSchema(db){
 await db`CREATE TABLE IF NOT EXISTS rigo_users (id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL DEFAULT '', password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
 await db`ALTER TABLE rigo_users ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT ''`;
 await db`CREATE TABLE IF NOT EXISTS rigo_conversations (id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES rigo_users(id) ON DELETE CASCADE, title TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
 await db`CREATE INDEX IF NOT EXISTS rigo_conversations_user_idx ON rigo_conversations(user_id,updated_at DESC)`;
 await db`CREATE TABLE IF NOT EXISTS rigo_messages (id UUID PRIMARY KEY, conversation_id UUID NOT NULL REFERENCES rigo_conversations(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES rigo_users(id) ON DELETE CASCADE, role TEXT NOT NULL, content TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
 await db`CREATE INDEX IF NOT EXISTS rigo_messages_user_idx ON rigo_messages(user_id,created_at)`;
 await db`CREATE TABLE IF NOT EXISTS rigo_memory (id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES rigo_users(id) ON DELETE CASCADE, memory_key TEXT NOT NULL, memory_value JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(user_id,memory_key))`;
 await db`CREATE INDEX IF NOT EXISTS rigo_memory_user_idx ON rigo_memory(user_id)`;
 await db`CREATE TABLE IF NOT EXISTS rigo_storage (id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES rigo_users(id) ON DELETE CASCADE, storage_key TEXT NOT NULL, storage_value JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(user_id,storage_key))`;
 await db`CREATE INDEX IF NOT EXISTS rigo_storage_user_idx ON rigo_storage(user_id)`;
}

export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store");
 const body=bodyOf(req);const action=String(req.query?.action||body.action||"");
 try{
  const db=sql();await ensureSchema(db);
  if(action==="register"){
   if(req.method!=="POST")return res.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});
   const email=emailOf(body.email),password=String(body.password||""),name=String(body.name||"").trim();
   if(!email||!email.includes("@"))return res.status(400).json({ok:false,error:"INVALID_EMAIL"});
   if(password.length<8)return res.status(400).json({ok:false,error:"PASSWORD_TOO_SHORT"});
   const exists=await db`SELECT id FROM rigo_users WHERE email=${email} LIMIT 1`;if(exists.length)return res.status(409).json({ok:false,error:"ACCOUNT_ALREADY_EXISTS"});
   const id=crypto.randomUUID(),passwordHash=hashPassword(password);
   const rows=await db`INSERT INTO rigo_users(id,email,name,password_hash) VALUES(${id},${email},${name},${passwordHash}) RETURNING id,email,name,role`;
   const user=rows[0];setSession(res,user,Boolean(body.staySignedIn));return res.status(201).json({ok:true,user:publicUser(user),role:user.role});
  }
  if(action==="login"){
   if(req.method!=="POST")return res.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});
   const email=emailOf(body.email),password=String(body.password||"");const rows=await db`SELECT id,email,name,password_hash,role FROM rigo_users WHERE email=${email} LIMIT 1`;const user=rows[0];
   if(!user||!verifyPassword(password,user.password_hash))return res.status(401).json({ok:false,error:"INVALID_CREDENTIALS"});
   setSession(res,user,Boolean(body.staySignedIn));return res.status(200).json({ok:true,user:publicUser(user),role:user.role});
  }
  if(action==="logout"){
   if(req.method!=="POST")return res.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});clearSession(res);return res.status(200).json({ok:true});
  }
  if(action==="session"){
   if(req.method!=="GET")return res.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});const session=readToken(req);if(!session)return res.status(401).json({ok:false,user:null});
   const rows=await db`SELECT id,email,name,role FROM rigo_users WHERE id=${session.id} LIMIT 1`;if(!rows.length){clearSession(res);return res.status(401).json({ok:false,user:null})}return res.status(200).json({ok:true,user:publicUser(rows[0]),role:rows[0].role});
  }
  return res.status(400).json({ok:false,error:"INVALID_AUTH_ACTION"});
 }catch(error){return res.status(500).json({ok:false,error:error?.message||"RIGO_AUTH_FAILED"})}
}
