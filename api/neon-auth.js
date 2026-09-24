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
export default async function handler(req,res){return res.status(200).json({ok:true,probe:"helpers-a"})}
