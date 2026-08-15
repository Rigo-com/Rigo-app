import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const COOKIE_NAME="rigo_session";

function databaseUrl(){return process.env.DATABASE_URL||process.env.DATABASE_POSTGRES_URL||process.env.POSTGRES_URL||process.env.DATABASE_NEON_URL||"";}
function sessionSecret(){return process.env.RIGO_SESSION_SECRET||process.env.RIGO_ADMIN_SESSION_SECRET||process.env.OPENROUTER_API_KEY||"";}
function safeEqual(a,b){const left=Buffer.from(String(a));const right=Buffer.from(String(b));return left.length===right.length&&crypto.timingSafeEqual(left,right);}
function parseCookies(request){const out={};for(const part of String(request.headers?.cookie||"").split(";")){const i=part.indexOf("=");if(i>0)out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim());}return out;}
function sign(value){return crypto.createHmac("sha256",sessionSecret()).update(value).digest("base64url");}

export function getSql(){const url=databaseUrl();if(!url){const error=new Error("DATABASE_NOT_CONFIGURED");error.status=503;throw error;}return neon(url);}

export async function ensureAccountDataSchema(){const sql=getSql();await sql`CREATE TABLE IF NOT EXISTS rigo_account_data (user_id TEXT NOT NULL, section TEXT NOT NULL, data JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (user_id, section))`;await sql`CREATE INDEX IF NOT EXISTS rigo_account_data_user_id_idx ON rigo_account_data(user_id)`;return true;}

export function getUserSession(request){try{const secret=sessionSecret();if(!secret)return null;const token=parseCookies(request)[COOKIE_NAME];if(!token)return null;const [payload,signature]=String(token).split(".");if(!payload||!signature||!safeEqual(signature,sign(payload)))return null;const data=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));if(!data?.id||!data?.email||!data?.exp||Date.now()>=data.exp)return null;return {user:{id:String(data.id),email:String(data.email).trim().toLowerCase(),role:data.role||"user"},session:data};}catch{return null;}}
