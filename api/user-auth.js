import crypto from "node:crypto";
import {getSql,ensureSchema} from "./_db.js";
import {configured,hashPassword,verifyPassword,getUserSession,issueUserSession,clearUserSession} from "./_user-auth.js";

const ADMIN_EMAIL="azizo436618@gmail.com";

function bodyOf(request){
  if(request.body&&typeof request.body==="object")return request.body;
  if(typeof request.body==="string"){try{return JSON.parse(request.body)}catch{return {}}}
  return {};
}

function normalizeEmail(value){return String(value||"").trim().toLowerCase();}
function validEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);}
function validPassword(value){return typeof value==="string"&&value.length>=6&&value.length<=256;}

async function getUserByEmail(email){
  const sql=getSql();
  const rows=await sql`SELECT id,email,password_hash,role FROM rigo_users WHERE email=${email} LIMIT 1`;
  return rows[0]||null;
}

async function registerUser(email,password){
  if(email===ADMIN_EMAIL)throw Object.assign(new Error("ADMIN_ACCOUNT_CANNOT_BE_REGISTERED"),{status:403});
  const sql=getSql();
  const existing=await getUserByEmail(email);
  if(existing)throw Object.assign(new Error("EMAIL_ALREADY_REGISTERED"),{status:409});
  const id=crypto.randomUUID();
  const passwordHash=hashPassword(password);
  const rows=await sql`
    INSERT INTO rigo_users(id,email,password_hash,role)
    VALUES(${id},${email},${passwordHash},'user')
    RETURNING id,email,role
  `;
  return rows[0];
}

async function loginUser(email,password){
  if(email===ADMIN_EMAIL){
    const expected=String(process.env.RIGO_ADMIN_PASSWORD||"");
    if(!expected||password!==expected)throw Object.assign(new Error("INVALID_CREDENTIALS"),{status:403});
    const sql=getSql();
    const passwordHash=hashPassword(password);
    const rows=await sql`
      INSERT INTO rigo_users(id,email,password_hash,role)
      VALUES(${crypto.randomUUID()},${email},${passwordHash},'admin')
      ON CONFLICT(email) DO UPDATE SET role='admin',password_hash=${passwordHash},updated_at=NOW()
      RETURNING id,email,role
    `;
    return rows[0];
  }

  const user=await getUserByEmail(email);
  if(!user||!verifyPassword(password,user.password_hash))throw Object.assign(new Error("INVALID_CREDENTIALS"),{status:403});
  return {id:user.id,email:user.email,role:user.role};
}

export default async function handler(request,response){
  response.setHeader("Cache-Control","no-store");
  try{
    if(!configured())throw Object.assign(new Error("USER_AUTH_NOT_CONFIGURED"),{status:503});
    await ensureSchema();

    if(request.method==="GET"){
      const session=getUserSession(request);
      if(!session){response.status(200).json({ok:true,authenticated:false});return;}
      response.status(200).json({ok:true,authenticated:true,user:{id:session.userId,email:session.email,role:session.role||"user"},persistent:Boolean(session.persistent)});
      return;
    }

    if(request.method==="POST"){
      const body=bodyOf(request);
      const action=String(body.action||"login").toLowerCase();
      const email=normalizeEmail(body.email);
      const password=String(body.password||"");
      if(!validEmail(email))throw Object.assign(new Error("INVALID_EMAIL"),{status:400});
      if(!validPassword(password))throw Object.assign(new Error("INVALID_PASSWORD"),{status:400});
      const user=action==="register"?await registerUser(email,password):await loginUser(email,password);
      issueUserSession(response,user,{persistent:Boolean(body.staySignedIn)});
      response.status(200).json({ok:true,authenticated:true,user});
      return;
    }

    if(request.method==="DELETE"){
      clearUserSession(response);
      response.status(200).json({ok:true,authenticated:false});
      return;
    }

    response.status(405).json({ok:false,error:"METHOD_NOT_ALLOWED"});
  }catch(error){response.status(error?.status||500).json({ok:false,error:error?.message||String(error)});}
}
